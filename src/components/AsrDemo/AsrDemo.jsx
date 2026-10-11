import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { usePostHog } from '@posthog/react';
import './AsrDemo.css';

/**
 * The Caribbean ASR model, live: record or upload a clip and read back what the
 * fine-tuned Whisper heard. The model runs on a Hugging Face ZeroGPU Space that
 * sleeps when idle, so nothing is contacted (or even downloaded: the Gradio
 * client is imported on first use) until the reader acts, and the first request
 * waits for the Space to wake instead of failing.
 */

const MAX_SECONDS = 30; // the Space transcribes the first 30 s, as in training
const MAX_UPLOAD_MB = 10;
const QUOTA_MESSAGE =
  "Today's free GPU allowance for visitors on your network is used up. It resets within a day, or you can try the model on Hugging Face, where signing in gives you your own allowance.";
const WAKING = new Set(['sleeping', 'building', 'starting', 'stopped']);

/** "user/space" -> its page on huggingface.co; a full URL is used as is. */
const spaceUrl = (space) => (/^https?:/.test(space) ? space : `https://huggingface.co/spaces/${space}`);

const recordingSupported = () =>
  typeof window !== 'undefined' &&
  typeof window.MediaRecorder !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia;

/** Gradio rejects with a status object rather than an Error; pull out what it says. */
const reasonOf = (e) => {
  const message = e?.message || e?.original_msg || (typeof e === 'string' ? e : '');
  if (/could not be read as audio/i.test(message)) return 'That file could not be read as audio. Try a WAV, MP3, M4A or WebM clip.';
  // ZeroGPU gives callers it can't identify (every visitor to this page) a small daily
  // GPU allowance per network; on huggingface.co, signed-in visitors spend their own.
  if (/ZeroGPU|GPU quota|runs limit/i.test(message)) return QUOTA_MESSAGE;
  return message || 'Something went wrong. Try again in a minute.';
};

const fmtSeconds = (s) => `${s < 10 ? s.toFixed(1) : Math.round(s)} s`;

export default function AsrDemo({ space, modelLabel }) {
  const posthog = usePostHog();
  const [phase, setPhase] = useState('idle'); // idle | recording | waking | transcribing | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [recordLeft, setRecordLeft] = useState(MAX_SECONDS);
  const recorderRef = useRef(null);
  const fileRef = useRef(null);
  const canRecord = recordingSupported();
  const busy = phase === 'waking' || phase === 'transcribing';

  // A ticking clock while the server works, so a 10 s wait reads as progress.
  // It restarts per phase (the handlers zero it), so the transcription time
  // shown excludes the wake-up.
  useEffect(() => {
    if (!busy) return undefined;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 200);
    return () => clearInterval(id);
  }, [busy, phase]);

  useEffect(() => () => recorderRef.current?.stop?.(), []);

  if (!space) return null;

  const transcribe = async (blob, filename, source) => {
    setError('');
    setResult(null);
    setElapsed(0);
    try {
      setPhase('transcribing');
      const { Client, handle_file } = await import('@gradio/client');
      const client = await Client.connect(space, {
        status_callback: ({ status }) => {
          if (WAKING.has(status)) {
            setElapsed(0);
            setPhase('waking');
          } else if (status === 'running') {
            setPhase('transcribing');
          }
        },
      });
      setElapsed(0);
      setPhase('transcribing');
      const { data: [, data] } = await client.predict('/transcribe', [
        handle_file(new File([blob], filename, { type: blob.type })),
      ]);
      setResult(data);
      setPhase('done');
      posthog?.capture('asr_demo_transcribed', {
        source,
        audio_seconds: data.audio_seconds,
        processing_seconds: data.processing_seconds,
      });
    } catch (e) {
      const reason = reasonOf(e);
      setError(reason);
      setPhase('error');
      posthog?.capture('asr_demo_failed', { source, reason: reason.slice(0, 80) });
    }
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`That file is over ${MAX_UPLOAD_MB} MB. A clip of 30 seconds or less is plenty.`);
      setPhase('error');
      return;
    }
    transcribe(file, file.name, 'upload');
  };

  const startRecording = async () => {
    setError('');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_e) {
      setError('The microphone is blocked. Allow it in the browser, or upload a clip instead.');
      setPhase('error');
      return;
    }
    const chunks = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    const started = Date.now();
    const countdown = setInterval(() => {
      const left = MAX_SECONDS - (Date.now() - started) / 1000;
      setRecordLeft(Math.max(0, Math.ceil(left)));
      if (left <= 0) recorder.stop();
    }, 250);
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      clearInterval(countdown);
      stream.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
      setRecordLeft(MAX_SECONDS);
      const type = recorder.mimeType || 'audio/webm';
      const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm';
      transcribe(new Blob(chunks, { type }), `recording.${ext}`, 'record');
    };
    recorder.start();
    setPhase('recording');
  };

  const stopRecording = () => recorderRef.current?.stop();

  return (
    <section className="asr-demo" aria-labelledby="asr-demo-title">
      <div className="asr-head">
        <p className="asr-kicker">Exhibit: the model, live</p>
        <h2 id="asr-demo-title" className="asr-title">
          Say something, and read what it heard
        </h2>
        <p className="asr-sub">
          Record up to {MAX_SECONDS} seconds or upload a clip. It was trained on Caribbean broadcast
          speech, so a laptop microphone in a quiet room is a fair test, and a noisy one is a hard one.
        </p>
      </div>

      <div className="asr-controls">
        {canRecord &&
          (phase === 'recording' ? (
            <button type="button" className="btn btn-primary" onClick={stopRecording}>
              <span className="asr-rec-dot" aria-hidden="true" />
              Stop and transcribe ({recordLeft} s left)
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={startRecording} disabled={busy}>
              Record
            </button>
          ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fileRef.current?.click()}
          disabled={busy || phase === 'recording'}
        >
          Upload a clip
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
          onChange={onFile}
          hidden
          data-testid="asr-file"
        />
      </div>

      <div className="asr-out" role="status" aria-live="polite">
        {phase === 'waking' && (
          <p className="asr-state">
            Waking the model server ({fmtSeconds(elapsed)}). Free hosting sleeps when nobody is using
            it, so the first clip can take a few minutes.
          </p>
        )}
        {phase === 'transcribing' && (
          <p className="asr-state">Transcribing ({fmtSeconds(elapsed)})&hellip;</p>
        )}
        {phase === 'error' && (
          <p className="asr-state asr-error">
            {error}
            {error === QUOTA_MESSAGE && (
              <>
                {' '}
                <a href={spaceUrl(space)} target="_blank" rel="noopener noreferrer">
                  Open it on Hugging Face<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </>
            )}
          </p>
        )}
        {phase === 'done' && result && (
          <figure className="asr-result">
            <blockquote>{result.text || <em>No speech found in that clip.</em>}</blockquote>
            <figcaption>
              {fmtSeconds(result.audio_seconds)} of audio, transcribed in{' '}
              {fmtSeconds(result.processing_seconds)} on a shared GPU
              {modelLabel ? ` by ${modelLabel}` : ''}.
              {result.truncated && ` Only the first ${MAX_SECONDS} seconds were transcribed.`}
            </figcaption>
          </figure>
        )}
      </div>

      <p className="asr-privacy">
        Your audio is sent to the model server to be transcribed and is not stored.
      </p>
    </section>
  );
}

AsrDemo.propTypes = {
  space: PropTypes.string,
  modelLabel: PropTypes.string,
};
