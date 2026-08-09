# Caribbean Automatic Speech Recognition (ASR) - Wav2Vec-BERT + CTC + KenLM

## Overview

A practical and reproducible ASR pipeline (Wav2Vec-BERT-style SSL encoder + CTC fine-tuning + n-gram rescoring) and tuned for Caribbean English speech (pronunciation variants, prosody, and pitch patterns). The aim of this project is to get a performant model for Caribbean radio/podcasts using the available dataset and to show the pipeline and reproducible experiments for portfolio/demo purposes.

Key design choices:
- Use a large pre-trained SSL encoder (e.g., wav2vec2-large-xlsr-53 or w2v-bert-2.0) and fine-tune with a CTC objective.
- Train an n-gram KenLM model from cleaned transcripts and apply pyctcdecode beam search for LM fusion during inference.
- Use speed perturbation, specaugment, and background noise augmentation to improve robustness.
- Use semi-supervised pseudo-labeling and synthetic TTS where needed to expand the data.

Data in the workspace:
- `Train.csv` (~19,858 rows), `Test.csv` (~8,512 rows), and `Audio.zip` (audio files expected to be extracted to `audio_files/ID.wav`).

---

## Notebooks

There are two notebooks in this workspace designed to work together or independently. Each notebook is described below along with run instructions and pointers for where to start.

### 1) `StarterNotebook.ipynb` (Baseline / Preprocessing)
- Purpose: A Colab-friendly notebook intended to perform quick dataset sanity checks, mount cloud drives, extract the audio zip, and run a baseline pipeline (greedy decode with a simple model or basic preprocessing). This notebook is useful for fast iterations and reproducing initial baselines.
- Key cells & functionality:
   - Install & login helpers (Hugging Face token, Colab drive mount)
   - Path & file existence checks (Train/Test/Audio zip)
   - Unzip helper that safely extracts audio to `audio_files/`
   - Text normalization & basic EDA on a few audio clips
   - Baseline inference (greedy decode) & sample WER calculation
- How to run: Open `StarterNotebook.ipynb` in Jupyter or Colab, run cells sequentially (Cell 1: login, Cell 2: install libs, Cell 3: paths, Cell 4: unzip audio, etc.). Adjust `DRIVE_BASE` constants if using local paths instead of Colab.

### 2) `Caribbean_ASR_Pipeline.ipynb` (Full Pipeline)
- Purpose: A comprehensive pipeline : SSL encoder (wav2vec2 / w2v-bert) fine-tuning with CTC, KenLM training, pyctcdecode inference with LM fusion, and augmentation + pseudo-labeling recipes.
- Notebook sections:
   1. Install Dependencies (transformers, datasets, pyctcdecode, kenlm, audiomentations, etc.)
   2. Data Preprocessing & Text Normalization (produces `train_corpus.txt` for LM)
   3. Train N-gram LM (KenLM `lmplz` + `build_binary`)
   4. Audio Augmentation Pipeline (Speed perturb, pitch shift, MUSAN)
   5. Initialize SSL Model & Processor (AutoProcessor / AutoModelForCTC)
   6. Prepare Dataset for CTC Training (datasets map for audio->input, text->labels)
   7. Fine-tune Model with Trainer (discriminative LR, fp16, grad accum)
   8. Inference with pyctcdecode + KenLM (beam search, alpha/beta tuning) and build `submission.csv`
- How to run: Open `Caribbean_ASR_Pipeline.ipynb` in Jupyter (preferably GPU instance). Run cells in order. For KenLM steps on Windows, use WSL or run KenLM on a Linux/WSL environment.

Notes:
- The `StarterNotebook.ipynb` is lighter-weight and ideal for quick tests and baseline checks, while `Caribbean_ASR_Pipeline.ipynb` is the full experiment notebook for training and decoding.
- If you prefer a single end-to-end run, first run the starter notebook to set up files and ensure audio extraction completed; then switch to the pipeline notebook to run the heavier experiments.


---

## Tech Stack

### Core
- **Python 3.10+** - Project scripting
- **PyTorch** - Model training backend
- **Hugging Face Transformers** - Wav2Vec2 / Wav2Vec-BERT models & Processor
- **Hugging Face Datasets** - Dataset loading / streaming
- **torchaudio & librosa** - Audio I/O and preprocessing
- **KenLM** - n-gram language model training (`lmplz` + `build_binary`)
- **pyctcdecode** - CTC beam search decoder with LM fusion
- **audiomentations** - Audio augmentation pipeline
- **pandas** - CSV parsing and data wrangling
- **jiwer / evaluate** - WER calculation

### Optional / Advanced
- **NVIDIA NIM** - Low latency inference for large LLMs/Embeddings (optional)
- **TTS (Coqui/ESPnet)** - Synthetic audio generation for augmentation

---

## Key Features

### SSL-based Fine-tuning (Wav2Vec / Wav2Vec-BERT)
- Fine-tune a large pre-trained Speech SSL model on Caribbean audio transcripts using CTC loss for token/character output.
- Optionally use discriminative LR: a smaller LR for encoder and larger LR for the classification head.

### Robust Decoding with KenLM + pyctcdecode
- Train a 3-4 gram LM on the cleaned transcripts; build a binary using KenLM.
- During inference, use pyctcdecode's beam search to fuse acoustic scores with LM scores (alpha, beta tuning).

### Data & Text Preprocessing
- Normalize transcripts: case folding, bracket annotation removal (e.g., `[laughter]`), punctuation handling, whitespace cleanup.
- Build a training corpus file (one sentence per line) used for KenLM.

### Augmentation and Semi-supervised Learning
- Speed perturbation (0.9x/1.0x/1.1x), pitch shift, and background noise addition via `audiomentations`.
- Pseudo-labeling pipeline: score unlabeled audio, keep high-confidence predictions, add them into training.

### Evaluation & Ensembling
- Compute WER for validation; tune LM alpha/beta on dev set to reduce WER.
- Optional checkpoint-averaging/ensembling for final submission improvements.

---

## Data Model Summary

### Core files
- `Train.csv` - columns: `ID`, `Transcription`.
- `Test.csv` - column: `ID`.
- `audio_files/ID.wav` - audio files with the same IDs.

### Runtime schema (Pydantic-like / typed view)
- TrainEntry: `{ id: str, transcript: str, text_norm: str, audio_path: str }`
- Tokenizer Vocab: List of characters or BPE tokens used for CTC label mapping.
- LM Corpus: One normalized sentence per line (plain text file `train_corpus.txt`).

---

## Architecture Highlights

1. Data Preprocessing
   - Load CSV -> normalize transcripts -> build LM corpus.
2. Augmentation
   - Speed perturb, pitch shift, MUSAN background noise injection.
3. SSL Encoder Fine-tuning with CTC
   - Processor feature_extractor + tokenizer -> prepare input values and labels -> Trainer/Optimizer with discriminative LR.
4. LM Training (KenLM)
   - Build arpa and binary with `lmplz`/`build_binary`.
5. Inference / Decoding
   - Greedy decode (baseline) -> PyCTCDecode beam-search with KenLM to produce n-best and tune alpha/beta.
6. Diagnostics
   - WER by sample, confusion lists, hotword boosting for domain tokens.

---

## Setup & Installation

### Prerequisites
- GPU recommended (NVIDIA CUDA), 16+ GB RAM for larger models.
- Python 3.10+ and pip.
- (Optional) WSL / Linux for KenLM installation on Windows - KenLM builds easier on Linux.

### Install & Setup

Windows PowerShell or Linux bash:

```powershell
# Create a venv (recommended)
python -m venv .venv; .\.venv\Scripts\Activate.ps1

# Install Python packages
pip install -U pip
pip install transformers datasets torchaudio librosa soundfile pyctcdecode kenlm audiomentations accelerate evaluate jiwer pandas

# KenLM binaries (Linux recommended): If you're on Windows, use WSL or download prebuilt binaries.
# On Ubuntu/WSL: clone and build
git clone https://github.com/kpu/kenlm.git; cd kenlm; mkdir build; cd build; cmake ..; make -j4; sudo make install
```

### Running locally

```powershell
# Preprocess & prepare corpora
python scripts/normalize_and_export_corpus.py --input Train.csv --out train_corpus.txt

# Build LM (KenLM): if using WSL or Linux
lmplz -o 4 < train_corpus.txt > lm.arpa
build_binary lm.arpa lm.binary

# Train the model (finetuning harness)
python scripts/train_ctc_finetune.py --train_csv Train.csv --audio_root audio_files/ --output_dir ckpts/ --model_name facebook/wav2vec2-large-xlsr-53

# Decode test dataset to build final submission
python scripts/decode_with_pyctcdecode.py --model ckpts/final --lm lm.binary --test_csv Test.csv --audio_root audio_files/ --out submission.csv
```

---

## API / CLI Documentation

### CLI helper commands
- `python scripts/normalize_and_export_corpus.py` - Normalize transcripts and export `train_corpus.txt`.
- `python scripts/train_lm.py` - Train KenLM (calls lmplz and build_binary) or calls remote KenLM binding.
- `python scripts/train_ctc_finetune.py` - Run Hugging Face `Trainer` to finetune the encoder with CTC.
- `python scripts/decode_with_pyctcdecode.py` - Use trained model logits + pyctcdecode + LM binary to decode and write `submission.csv`.

### Example: Train a CTC Model
```
python scripts/train_ctc_finetune.py \
  --train_csv Train.csv \
  --val_split 0.1 \
  --audio_root audio_files/ \
  --model_name facebook/wav2vec2-large-xlsr-53 \
  --output_dir ckpts/ \
  --batch_size 8 \
  --epochs 6
```

### Example: Decode with LM
```
python scripts/decode_with_pyctcdecode.py \
  --ckpt ckpts/final \
  --lm lm.binary \
  --test_csv Test.csv \
  --audio_root audio_files/ \
  --out submission.csv --alpha 0.65 --beta 0.8
```

---

## Code Snippets (key pieces)

### Text normalization
```python
import re

def normalize_text(s: str) -> str:
    if not isinstance(s, str):
        return ""
    s = s.replace("’","'")
    s = s.lower().strip()
    s = re.sub(r"\[.*?\]", "", s)
    s = re.sub(r"[^a-z' ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s
```

### Train a KenLM (shell)
```
# prepare corpus: train_corpus.txt (one sentence per line)
lmplz -o 4 < train_corpus.txt > lm.arpa
build_binary lm.arpa lm.binary
```

### Minimal finetune snippet (Hugging Face Trainer)
```python
from transformers import Wav2Vec2ForCTC, AutoProcessor, TrainingArguments, Trainer

processor = AutoProcessor.from_pretrained("facebook/wav2vec2-large-xlsr-53")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-xlsr-53", vocab_size=len(vocab)+1)

# collator and dataset mapping code omitted for brevity
args = TrainingArguments(output_dir="ckpts/", per_device_train_batch_size=4, gradient_accumulation_steps=2, num_train_epochs=6)
trainer = Trainer(model=model, args=args, train_dataset=train_ds, eval_dataset=valid_ds)
trainer.train()
```

### pyctcdecode + KenLM decoding (inference)
```python
from pyctcdecode import build_ctcdecoder
import kenlm

ctc_vocab = [k for k, v in sorted(processor.tokenizer.get_vocab().items(), key=lambda x: x[1])]
lm_model = kenlm.Model("lm.binary")
decoder = build_ctcdecoder(ctc_vocab, kenlm_model=lm_model, alpha=0.65, beta=0.8)

# logits: array [T, V]
decoded_text = decoder.decode_logits(logits, beam_width=256)
```

### Semi-supervised pseudo-label pipeline
```python
for audio in unlabelled_audio_files:
    logits = model(processor(audio).input_values.to(device)).logits
    probs = softmax(logits, axis=-1)
    conf = compute_confidence(probs, decoded_text)
    if conf > 0.9:
        pseudo_labels.append({"ID": audio_id, "text": decoded_text})
# Save pseudos -> append to train CSV and re-train or re-run fine-tune
```

---

## Technical Challenges & Solutions

### Prosody & Accents
**Problem:** Caribbean speech has rich prosody, vowel variations, and local names that can confuse the acoustic model.
**Solution:** SSL encoders trained on multi-lingual data (XLSR variants) generalize well. Speed perturb/pitch augmentation + LM rescoring reduces errors due to prosodic variation.

### LM / Decoder Tuning
**Problem:** Choosing alpha/beta affects insertion/over-weighting.
**Solution:** Grid search on a held-out validation set and analyze WER vs alpha/beta heatmap.

### KenLM on Windows
**Problem:** KenLM building can be difficult on Windows.
**Solution:** Use WSL/Ubuntu or a prebuilt binary or a hosted `kenlm` wheel and build on Linux. For Windows-only runs, use `pyctcdecode` as the decoder and a compiled binary uploaded to the workspace.

### Limited compute for big models
**Problem:** `wav2vec2-large` and Wav2Vec-BERT variants require GPUs with large memory.
**Solution:** Use LoRA/Adapter tuning, gradient accumulation, or smaller model variants; use mixed precision and checkpointing to reduce memory footprint.

---

## Future Enhancements
- [ ] Wav2Vec-BERT-2.0 style encoder for improved low-resource performance.
- [ ] LoRA / Adapters for efficient per-dialect fine-tuning.
- [ ] TTS-based data augmentation and speaker resampling for semi-supervised growth.
- [ ] Lexicon integration and hotword boosting for frequent local names.
- [ ] Checkpoint averaging and ensembling for final submission.

---

## Contact & Links
**Author:** Nicholas Smith  
**Email:** nicosmith.smith3@gmail.com  
**GitHub:** https://github.com/firepenguindisopanda  
