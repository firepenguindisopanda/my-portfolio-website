import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AsrDemo from './AsrDemo';

const capture = vi.fn();
vi.mock('@posthog/react', () => ({ usePostHog: () => ({ capture }) }));

// A fake Space: `connect` replays `statuses` through status_callback, `predict` answers `reply`.
const gradio = vi.hoisted(() => {
  const g = { statuses: [], reply: null };
  g.predict = vi.fn(() => g.reply);
  g.connect = vi.fn(async (_space, { status_callback }) => {
    for (const status of g.statuses) {
      status_callback({ status });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return { predict: g.predict };
  });
  return g;
});
vi.mock('@gradio/client', () => ({
  Client: { connect: gradio.connect },
  handle_file: (file) => ({ wrapped: file }),
}));

const SPACE = 'ai-robotix-nick/caribbean-asr';
const ok = (details) => Promise.resolve({ data: [details.text, details] });

const upload = (name = 'clip.wav', size = 1000) => {
  const file = new File([new Uint8Array(size)], name, { type: 'audio/wav' });
  fireEvent.change(screen.getByTestId('asr-file'), { target: { files: [file] } });
};

beforeEach(() => {
  capture.mockClear();
  gradio.statuses = [];
  gradio.reply = ok({ text: '' });
  gradio.connect.mockClear();
  gradio.predict.mockClear();
});

describe('AsrDemo', () => {
  it('renders nothing without a Space to talk to', () => {
    const { container } = render(<AsrDemo space="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('contacts nothing until the reader acts', () => {
    render(<AsrDemo space={SPACE} />);
    expect(screen.getByRole('heading', { name: /read what it heard/i })).toBeInTheDocument();
    expect(gradio.connect).not.toHaveBeenCalled();
  });

  it('uploads a clip and shows the transcript with its timings', async () => {
    gradio.reply = ok({ text: 'BBC Caribbean report.', audio_seconds: 3.4, processing_seconds: 1.2, truncated: false });
    render(<AsrDemo space={SPACE} modelLabel="Whisper-medium fine-tuned with LoRA" />);

    upload();

    expect(await screen.findByText('BBC Caribbean report.')).toBeInTheDocument();
    expect(screen.getByText(/3\.4 s of audio, transcribed in 1\.2 s on a shared GPU by Whisper-medium/)).toBeInTheDocument();
    expect(gradio.connect).toHaveBeenCalledWith(SPACE, expect.any(Object));
    const [endpoint, [arg]] = gradio.predict.mock.calls[0];
    expect(endpoint).toBe('/transcribe');
    expect(arg.wrapped.name).toBe('clip.wav');
    expect(capture).toHaveBeenCalledWith('asr_demo_transcribed', expect.objectContaining({ source: 'upload' }));
  });

  it('says the Space is waking while it starts, then shows the result', async () => {
    let finish;
    gradio.statuses = ['sleeping', 'starting'];
    gradio.reply = new Promise((resolve) => { finish = resolve; });
    render(<AsrDemo space={SPACE} />);

    upload();

    expect(await screen.findByText(/Waking the model server/)).toBeInTheDocument();
    finish({ data: ['Good morning.', { text: 'Good morning.', audio_seconds: 1.5, processing_seconds: 0.9 }] });
    expect(await screen.findByText('Good morning.')).toBeInTheDocument();
    expect(screen.queryByText(/Waking the model server/)).toBeNull();
  });

  it('explains an unreadable file in plain words', async () => {
    gradio.reply = Promise.reject({ type: 'status', stage: 'error', message: 'That file could not be read as audio.' });
    render(<AsrDemo space={SPACE} />);

    upload('notes.txt');

    expect(await screen.findByText(/Try a WAV, MP3, M4A or WebM clip/)).toBeInTheDocument();
    expect(capture).toHaveBeenCalledWith('asr_demo_failed', expect.objectContaining({ source: 'upload' }));
  });

  it('explains the GPU allowance and links to the Space when it runs out', async () => {
    // The message ZeroGPU actually returns to an anonymous caller.
    gradio.reply = Promise.reject({
      message: 'You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota',
    });
    render(<AsrDemo space={SPACE} />);

    upload();

    expect(await screen.findByText(/free GPU allowance for visitors on your network is used up/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open it on Hugging Face/ })).toHaveAttribute(
      'href',
      'https://huggingface.co/spaces/ai-robotix-nick/caribbean-asr',
    );
  });

  it('does not blame the allowance for other errors', async () => {
    gradio.reply = Promise.reject({ message: 'Connection lost' });
    render(<AsrDemo space={SPACE} />);

    upload();

    expect(await screen.findByText('Connection lost')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hugging Face/ })).toBeNull();
  });

  it('refuses an oversized file without sending it', () => {
    render(<AsrDemo space={SPACE} />);

    upload('long.wav', 11 * 1024 * 1024);

    expect(screen.getByText(/over 10 MB/)).toBeInTheDocument();
    expect(gradio.connect).not.toHaveBeenCalled();
  });

  it('offers recording only where the browser can record', () => {
    render(<AsrDemo space={SPACE} />);
    // jsdom has no MediaRecorder
    expect(screen.queryByRole('button', { name: 'Record' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Upload a clip' })).toBeEnabled();
  });
});
