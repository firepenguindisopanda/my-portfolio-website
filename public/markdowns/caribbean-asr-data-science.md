# Caribbean Voices: Speech Recognition for Caribbean English

> Off-the-shelf speech recognition is known to struggle with Caribbean accents. I fine-tuned
> Whisper on BBC Caribbean broadcasts and brought the error rate down to about one word in
> twenty-three. Two later runs that I expected to improve it made it worse, and a one-hour pilot
> pointed to where the next gain is. You can try the model above.

**Caribbean Voices AI Hackathon** (UWI AI Innovation Centre, on Zindi), revisited in 2026 after
it closed in December 2025. The best model scores **0.0434 word error rate** on the private
leaderboard (0.0435 public), counting case and punctuation the way the competition does. The
submissions came after the deadline, so they are scored but appear in no ranking.

## The problem

The audio is clips from the BBC Caribbean Service archive, each transcribed by hand. The task is
to produce the transcript, scored by word error rate (WER): substitutions, deletions and
insertions per reference word. Case and punctuation count, so "the U.S." and "the US" differ.

| | |
|---|---|
| Labelled clips | 19,856 |
| Test clips | 8,510 |
| Clip length | median 5.3 s, 95% under 12.1 s, all under 30 s |
| References | cased and punctuated, numbers always spelled out |
| Repeated boilerplate | about 10% of clips; one station jingle appears over 700 times |
| Narrowband audio | 37% of clips (telephone or field reports) |

## Results

| Step | Raw WER | Measured on |
|---|---|---|
| First pipeline, partly normalised text | 0.1368 | private leaderboard |
| whisper-small + LoRA, 500 steps, lowercase labels | 0.0956 | private leaderboard |
| whisper-small + LoRA, 2,000 steps, raw labels, duplicate cap | 0.0731 | private leaderboard (validation said 0.0709) |
| whisper-medium + LoRA | 0.0478 | private leaderboard (validation said 0.0564) |
| **the same model, decoded with a loop guard** | **0.0434** | private leaderboard |
| Leaderboard winner, for scale | 0.0309 | private leaderboard |

The validation score here comes from 1,986 held-out clips (medium: 0.0564, 95% CI 0.052 to
0.061). It landed within 0.002 of the private leaderboard for the small model but was
pessimistic for medium by 0.009, so I use it only to compare runs with each other.

## What this found

### 1. The biggest early gain came from the labels

My first runs trained on lowercase, unpunctuated text and submitted it the same way. The
references are cased and punctuated, so every formatted word counted as an error: identical
predictions scored about 0.10 worse raw than normalised. Training on the raw text removed that
penalty, and it was also the easier target. The final evaluation loss was 0.137 against 0.161
for the lowercase run, even though the model now had to predict case and punctuation too.

In the same run, training went on four times longer (about one epoch instead of a fifth of one),
and clips sharing a transcript were capped at three in the training split. The cap dropped 1,796
rows of jingles and sign-offs that added nothing new. The validation split is never capped, so
the cap does not change what validation measures.

### 2. Validation had to be split by transcript

About 10% of the data is repeated boilerplate. A random split puts copies of the same jingle on
both sides, and the model then scores well on validation by remembering it. I assigned whole
transcript groups to one side or the other. For the small model, that validation score landed
within 0.002 of the private leaderboard, so I could iterate locally and submit rarely. For medium
it was pessimistic (0.0564 against 0.0478), but both scores put medium clearly ahead.

### 3. Where the remaining errors are

On the medium model's held-out predictions:

- **Formatting.** Normalised WER is 0.0338 against 0.0564 raw. About 40% of what is left is case
  and punctuation on words the model heard correctly.
- **Channel.** Narrowband clips have a normalised WER of 0.040 against 0.029 for wideband, and
  the gap's confidence interval excludes zero.
- **Speaking rate.** Clips whose rate is extreme have 3.2 times the error rate of the rest.
- **Proper nouns.** In the earlier small model's errors, the words it misheard outright were
  mostly Caribbean names and acronyms, such as PNCR heard as "VNCR". These looked like a
  capacity problem in the small model, and the data did not explain them.
- **Pitch.** Pitch level, range and variability do not predict errors once clip length is
  controlled for (every |ρ| ≤ 0.045). The "sing-song" intonation often blamed for poor
  recognition does not explain this model's errors.

### 4. Two runs that should have helped made it worse

The medium model's evaluation loss was still falling when it stopped, so more training looked
like the obvious next step. Both attempts came out worse:

| Run | Raw WER | Against the medium model, same clips |
|---|---|---|
| Medium, resumed for 2,000 more steps | 0.0635 | **worse** by 0.0071 (95% CI 0.004 to 0.010) |
| Small, trained afresh (best checkpoint at step 1,000) | 0.0786 | worse by 0.022 |

The resumed run had already fitted its training data; its training loss was 0.056 when it
started. Because I resumed from the saved adapter alone, the learning-rate warmup restarted and
pushed training loss back up to 0.093. After step 750, held-out loss rose while training loss
fell to 0.028, which is overfitting. The small run overfitted the same way and also had a
configuration error: on two GPUs the gradient accumulation rounded down, which doubled its
effective batch to 32.

Both results are reported with paired intervals on the same clips, and those intervals are what
showed the drop was real.

### 5. Two runaway loops cost 8% of the score

Beam search sometimes gets stuck repeating a phrase, and two of the medium model's 8,510 test
transcripts did, one repeating a single word dozens of times. Two guards now run on every
decode:

- **A repeated-phrase block** (`no_repeat_ngram_size=4`).
- **A length cap of ceil(seconds × 7.05) + 4 tokens.** 7.05 is the 99.9th percentile of tokens
  per second in the training transcripts. A 2.3-second clip cannot hold 64 words.

The cap cuts only those two test transcripts and changes none of the 1,986 validation ones. The
threshold comes from the training data, so no tuning on validation was involved.

On the private leaderboard, the same model's two loops were worth 0.0037:

| Same medium model | Private WER |
|---|---|
| Plain decode | 0.0478 |
| Length cap applied to the finished transcripts | 0.0441 |
| Decoded again with the repeated-phrase block | **0.0434** |

On validation the guards changed nothing, because no validation clip looped, so their effect
only showed on unseen data. They are cheap and cannot hurt a correct transcript, which is why
they run on every decode.

### 6. A one-hour pilot found the next step

Fine-tuning a larger Whisper takes about 20 GPU hours, which is more than a Kaggle session
allows. Before spending them, I ran a pilot that decoded 500 held-out clips with each model
*without* fine-tuning. I fixed the decision rule before it ran: go ahead only if a larger model
beat zero-shot medium by 15% or more, with a confidence interval that excludes zero.

| Model, 500 held-out clips | Raw WER | Whisper-normalised WER |
|---|---|---|
| medium, no fine-tuning | 0.0940 | 0.0413 |
| large-v3-turbo, no fine-tuning | 0.0793 | 0.0325 |
| large-v3, no fine-tuning | 0.0709 | **0.0262** |
| medium, fine-tuned (the model above) | **0.0563** | 0.0320 |

The normalised column maps numbers, spellings, case and punctuation on both sides to one form,
which leaves the recognition errors. On that measure, large-v3 **with no fine-tuning** already
beats the fine-tuned medium model (paired difference -0.0058, 95% CI -0.0111 to -0.0008). The
fine-tuned model is ahead on raw WER only because it learned the house style. That suggests
most of what fine-tuning taught was formatting, and that a fine-tuned large-v3 could get both.
Large-v3 cleared the bar, so it is the next run.

## Serving it

The first host was CPU only. I converted the model to CTranslate2 at int8, and on a 20-clip
check 80% of its outputs were identical to the GPU model's. Whisper always encodes a full
30-second window, however short the clip, so encoding alone took 11.8 s per clip on two CPU
threads, and a free CPU host would have meant about 13 seconds per clip.

The demo runs instead on a Hugging Face ZeroGPU Space, which attaches a GPU only while a request
is being transcribed. A warm request takes about 1.7 seconds, half a second of it on the GPU.
Anonymous visitors share a small daily GPU allowance per network, and the page shows a message
if it runs out. The audio is decoded and transcribed in memory and never stored.

The competition rules make the data the private property of the organisers, so the audio,
transcripts and fine-tuned weights stay private. The Space loads the weights with a read-only
token. Only the serving code and the demo are public.

## Method

- **Model.** Whisper with LoRA adapters (rank 32 on the attention query and value projections).
  The small model trained on a 6 GB laptop GPU with an 8-bit base; the medium model under mixed
  precision on Kaggle T4 GPUs.
- **Same preprocessing everywhere.** Training, evaluation and the live service share one set of
  values for silence trimming, 30-second truncation and beam-5 decoding.
- **Statistics.** Every WER is corpus-level (total errors over total reference words, not a mean
  of per-clip rates), with bootstrap confidence intervals. Comparisons are paired on the same
  clips.
- **Evaluation during training.** Evaluation runs on a fixed 400-clip subset, and the full split
  is scored once at the end. Earlier runs spent over an hour of each session evaluating.
- **Runs longer than one session.** The large-v3 notebook, ready but not yet run, splits training
  over two sessions. It saves the full trainer checkpoint (optimizer, schedule, step and random
  state), so the second session picks up where the first stopped and does not restart
  the warmup that hurt the resumed run.

## Limitations

- The October runs were scored on validation only. Validation was within 0.002 of the private
  leaderboard for the small model but 0.009 pessimistic for medium, so its numbers are for
  comparing runs.
- The split groups clips by transcript only. Presenters recur, so speaker overlap between the
  splits may flatter the scores slightly.
- The pilot chose among models on 500 clips of the same validation split that later runs will
  be scored on, which leaves a little optimism in those comparisons.
- The int8 conversion was checked on 20 clips, too few to quote a difference in accuracy.

## What I would do next

- Fine-tune large-v3 in two sessions with exact resume, and score it on the leaderboard.
- Target narrowband audio: band-limit augmentation on wideband training clips, and report WER
  for each channel on every run.
- Check the clips with extreme speaking rates for misaligned transcripts, and drop the ones that
  are.

## Acknowledgements

The data and the competition come from the UWI AI Innovation Centre and its partners (CIBC,
Infolytics, DataAxis and the Caribbean Telecommunications Union), hosted on Zindi. The audio is
from the BBC Caribbean Service archive.

## Stack

Python, PyTorch, Hugging Face Transformers, PEFT (LoRA), Whisper, CTranslate2 and
faster-whisper, Gradio, Hugging Face Spaces (ZeroGPU), FastAPI, Docker, librosa, jiwer, Kaggle.
