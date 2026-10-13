# R.O.A.D. Barbados: Archive Handwriting Recognition

> Colonial Barbados kept its deeds, wills and estate inventories by hand. My best
> entry transcribed them with 44 recognisers voting on every line, and I only
> counted a gain once it cleared a noise floor I measured for this leaderboard. I
> chose to be ranked on a single model I could rebuild from raw data, which cost
> 0.0136 on the private leaderboard.

**Zindi competition, July to October 2026.** Ranked **238th** of 661 active
participants on a private score of **0.892733**, the reproducible single model. The
44-system ensemble scored **0.906303** privately, which would have placed about
170th, but it was not one of my two selected submissions (see *The final choice*).
Scores and ranks can still change until 25 October 2026, while the winning
solutions are reviewed.

## The problem

The data is 5,472 cropped line images (4,098 labelled for training, 1,374 to
transcribe) from scanned records in the Barbados archive, digitised through the
Reclaiming Our Atlantic Destiny (R.O.A.D.) Programme and GovTech Barbados. The
years written inside the labels run mostly from the 1630s to the 1710s: secretary
hand, faded ink, damaged paper, and crops where the lines above and below bleed
into the one being read.

| | |
|---|---|
| Training lines | 4,098 |
| Test lines | 1,374 (about 30% public leaderboard, 70% private) |
| Distinct characters | 81 |
| Average line | 62.3 characters, 11.3 words |
| Median image | 1115 x 65 pixels |

Many of these records document enslaved people as property. I have left all
images off this page, because the competition's terms say nothing about
republishing them and a line from such a record, shown without its context, would
be the wrong way to present it.

## The metric

The competition describes the score as an equal blend of a weighted word error
rate and a weighted character error rate. I recovered its exact form and checked
it against more than 20 leaderboard results:

```text
score = 1 - 0.5 * (WER_w / 12 + CER_w / 55)
```

`WER_w` and `CER_w` are absolute edit distances per line, averaged over lines, so
longer lines weigh more and the score can go below zero. One wrong word costs as
much as 4.58 wrong characters, and word errors carry about three quarters of the
penalty. This shaped the whole project. A line that is right except for a
single letter is charged a full word error, so most of the available points were
in getting the characters right on words that were nearly right.

## Results

Every step below is a public leaderboard score. MBR is minimum Bayes risk
consensus: for each line, pick the candidate transcription that is closest, by
edit distance, to all the others.

| Step | Public score | What changed |
|---|---|---|
| Kraken, zero shot | -0.356 | a print model, with segmentation it did not expect |
| TrOCR base, fine-tuned, beam 4 | 0.841275 | the first real baseline |
| MBR of 6 systems | 0.845518 | includes an underfit model (finding 1) |
| MBR of 22 systems | 0.855475 | a beam width sweep, then a control run at five widths |
| TrOCR large, single | 0.857716 | the larger recogniser |
| MBR of 27 systems | 0.860704 | large model added at five beam widths |
| Family-weighted MBR of 29 | 0.868227 | weighting predicted +0.0050 and delivered +0.0052 |
| Qwen2.5-VL-7B joins the pool (32) | 0.892027 | the largest single jump |
| A longer 7B run (33) | 0.900924 | |
| A self-trained 7B run (34) | 0.903041 | trained on its own confident test transcriptions |
| Test-time augmentation decodes (43) | 0.909261 | padded, warped and noisy copies of each line |
| A fourth 7B run (44) | **0.909772** | the best entry |

The best single system from each family:

| Family | Public score |
|---|---|
| Kraken (zero shot) | -0.356 |
| Qwen2-VL-2B, QLoRA | 0.804865 |
| TrOCR base | 0.841275 |
| TrOCR large | 0.857716 |
| Qwen2.5-VL-7B, QLoRA | 0.908416 |

## The final choice: a model I could rebuild

Zindi asks the top ten for code that reproduces their leaderboard score, and moves
a solution down to whatever its code does reproduce. The ensemble could not pass
that test. It had been built over three months from 44 systems, and the first TrOCR
base weights, which carry 23.9% of its vote weight, had not been kept, so those
members could be replayed from their saved predictions but never retrained.

I picked my final two submissions to be rebuildable from raw data. One notebook
trains a fresh Qwen2.5-VL-7B QLoRA adapter on the training rows only. It picks the
checkpoint on held-out rows and then transcribes the test set, with no pseudo-labels
and no earlier adapters, and every input checked by SHA-256. A second notebook refits
the same recipe on all labelled rows. A third reloads the saved weights and
reproduces the submitted file exactly: 0 of 1,374 lines differ.

| Submission | Public | Private |
|---|---|---|
| 44-system ensemble, not selected | 0.909772 | 0.906303 |
| Strongest single 7B from the ensemble's pool, not selected | 0.908416 | 0.904704 |
| Clean single model, training rows only | 0.891274 | 0.886765 |
| **Clean single model, refit on all labelled rows** | 0.894714 | **0.892733** |
| Winner, for scale | 0.936088 | 0.933057 |

Rebuilding from scratch cost 0.0136, about 68 places. I made the choice before
the private scores were known, so that any code requested would reproduce the
score being ranked. In the end neither entry came near the top ten, so no code
was requested.

## What this found

### 1. A weaker model can make the ensemble stronger

Twice, adding a system that was worse on its own raised the ensemble:

| Added | That system alone | Ensemble |
|---|---|---|
| a beam 1 decode, the worst in the pool | val 0.8337 | 0.841779 to 0.842524 |
| an over-regularised model at two beam widths | public 0.816470 | 0.842524 to 0.845518 |

The second model lost by 0.026 on its own and gained 0.0030 in the pool. It was
trained with a different optimiser, augmentation and batch size, so it failed on
different lines. After that I kept every run whatever its own score, and when I
later tested pruning, selecting a smaller subset out of sample lost 2.8 to 3.4
thousandths.

### 2. Validation overstated a preprocessing gain elevenfold

Error analysis showed failures concentrated in tall crops:

| | Share of lines | CER | Share of character errors |
|---|---|---|---|
| Aspect under 16 (tall crops) | 46% | 0.1108 | 54% |
| Aspect 16 and over (wide crops) | 54% | 0.0665 | 46% |

TrOCR resizes every crop to a square, so a tall crop spends its resolution on
the neighbouring lines. Trimming tall crops to a minimum aspect of 16 gained
+0.0042 on validation and +0.00038 on the leaderboard. I kept the trim, and from
then on used validation to compare decodes of one checkpoint and stopped relying
on it across checkpoints. On the roughly 412 public rows an ensemble delta
carries a standard error of about 1.5 thousandths, and a single model's gap
between validation and leaderboard runs 10 to 14, so I treated any public change
under 3 thousandths as unresolved.

### 3. A third of the remaining error is case and punctuation, and most of it cannot be won

Lowercasing both sides would add 14.5 thousandths, and stripping punctuation
another 18.6. That looks like the biggest remaining gain, but most of it is out
of reach. Among
near-duplicate lines in the training labels, transcribers disagree on case
**8.5%** of the time (give or take 1.4 points), and the images behind those disagreements show
identical letterforms: secretary hand capitals and minuscules are often
indistinguishable. A case prior built from the training majority cost 11.3
thousandths on validation (17 tokens fixed, 115 broken).

### 4. The misread words are mostly names

Of 890 word substitutions on validation, 261 (29%) have a reference word that never
appears in training. Classified strictly:

| Unseen word | Share |
|---|---|
| Capitalised, name-like | 40.6% |
| Within two edits of a training word, no spelling-variant relation | 34.9% |
| Archaic spelling of a word seen in training | 18.8% |
| Genuinely novel | 3.8% |
| Numeral | 1.9% |

A first, loose test counted anything within two edits of a training word as a
spelling variant, and called 86.6% of these words reachable. A control showed the
problem: the same test matches 37.5% of random letter scrambles of training
words, so it was mostly measuring how dense the vocabulary is. The strict test requires a real variant
relation (i and y, u and v, doubled letters, a silent e). The model also regresses
towards the corpus: where two forms of a word are possible it writes the more
frequent training form 234 times against 139 (p = 1e-6). Outside name lists would
help, but the rules allow only the competition's data.

### 5. Ideas that were measured and closed

I wrote down a pass bar for each of these before running it.

| Idea | Result |
|---|---|
| ROVER confusion network fusion | validation 0.8972 against 0.8996 for the incumbent |
| A second model correcting the ensemble's line, given the image | -2.87 thousandths, confidence interval entirely below zero |
| Case correction by a training-majority prior | -11.3 thousandths |
| Snapping unseen words to the nearest training word | -13.43 thousandths |
| Reranking candidates by the model's own likelihood | -0.33 thousandths, fails the bar |
| Reinforcement learning (GRPO) with the metric as the reward | +3.8 on validation, flat on the leaderboard |
| Self-training beyond run 5 | run 6 reproduced its teacher on all 1,374 test lines, so it could add no new vote |

## Method

- **Split.** 3,482 training and 616 validation lines, grouped so near-duplicate
  lines never straddle the split, and stratified by scan resolution and line
  length. I never cleaned the validation labels. I checked doubtful training
  rows against their images; most were labelled correctly after all, and the
  exclusion list went from 21 rows to 6.
- **Recognisers.** TrOCR base and large (handwritten checkpoints) fine-tuned
  end to end, then Qwen2-VL-2B and Qwen2.5-VL-7B fine-tuned with QLoRA (4-bit
  base, rank 16 adapters). Every model in the final ensemble is under an open
  licence that allows commercial use, as the rules require.
- **Combiner.** Family-weighted MBR, with the family weights tuned by nested
  cross-validation on the validation predictions. Where the tuning surface was
  flat, I took the weights from the centre of the plateau rather than its peak.
- **Decoding.** Beam widths 1 to 8 for TrOCR, and test-time augmentation for the
  7B model: each line decoded again after padding, a small grid warp, and added
  noise, each decode joining the pool as its own voter.

## Engineering

- **Compute.** Two T4 GPUs on Kaggle, about 30 GPU hours a week in 12 hour
  sessions, plus a 6 GB laptop GPU for the first TrOCR runs (20 epochs in 2 hours
  46 minutes). On the T4, fp16 measured 4.48 times faster than the emulated bf16
  used at first.
- **Kernel generators.** Each training notebook is generated from one that
  already ran, with every edit asserted to match exactly once and a version stamp
  written in. Notebooks look up their input datasets by content.
- **Local training.** A GPU check before starting, a fallback ladder when memory
  runs out, GPU use logged through the run, and the final score recomputed in a
  fresh process.
- **Reproducibility.** The ensemble rebuilds byte for byte on a CPU in about 10
  seconds from 91 saved inputs, each checked by SHA-256; when I tampered with an
  input on purpose, the check caught it and named the file. The selected single
  model is trained from raw data in one notebook, and reloading its weights
  reproduces the submitted file exactly.

## Limitations

- The public leaderboard is about 412 lines. Every conclusion above that rests on
  it is stated with that noise floor in mind; the private 70% decided the ranking.
- The rank and private scores are provisional until the winners' review ends on
  25 October 2026.
- The first TrOCR base weights were not kept. Their predictions were, so the
  ensemble still rebuilds exactly, but those members, which carry 23.9% of the
  vote weight, cannot be decoded again.
- Case in these labels is partly a transcriber's choice, which puts a ceiling on
  any recogniser scored against them.

## What I would do next

- Names are the largest reachable class of error, and they need data this
  competition does not allow. With an archive's own index of names, the first
  thing I would try is a decode constrained to that index.
- The metric charges a full word for a one letter slip, and 43.5% of word errors
  are within two characters. Next I would train a recogniser with a loss closer
  to the metric; the short GRPO run moved validation by +3.8 thousandths in 0.17
  of an epoch.

## Stack

Python, PyTorch, Hugging Face Transformers, PEFT with bitsandbytes (QLoRA), TrOCR,
Qwen2-VL, Qwen2.5-VL, Kraken, rapidfuzz, Kaggle.
