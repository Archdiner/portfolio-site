# What a Kettle Knows — plan and debrief

**Status:** wireframe v0.2 (tea cut). Prose is deliberately placeheld; all assets and
interactions are real. Branch: `blog/what-a-kettle-knows`. Public build:
<https://what-a-kettle-knows.vercel.app>.

## 1. The thesis

A general-purpose listener is not a captioner. The useful question is not “what is in
this clip?” but “what is on, since when, how long, how often, and what changed?” That is a
state-tracking problem over hours of audio. A compact, always-on ear should own that
state and hand language and decisions to an external model.

The kettle is the smallest complete example of the problem: one object, two transients, a
long sustained state, a clear end, a memory question (“how long did it boil?”), and a
prediction question (“will it switch off?”).

## 2. Why the tea cut replaced the kitchen timeline

The first cut used a stitched RealDESED home timeline. It was real, but generic: a list of
home events with no single cause. Tea is better on every axis that matters for an
educational post:

| Property | Why it matters | Tea example |
|---|---|---|
| Familiar script | Reader brings priors; no domain explanation needed | making a cup of tea |
| Sustained texture | Shows energy over time, not just transients | kettle ramp and boil |
| Turbulence | Shows broad-spectrum, pitchless sound | pouring water |
| Transients | Shows onset detection and material resonance | spoon, cup, switch |
| Repeated impacts | Shows counting and recurrence | stirring |
| State boundaries | Shows memory and prediction | switch on / auto-off |
| Material contrast | Shows representation learning | mug vs glass vs metal |
| Natural question | Shows why memory is the product | “how long did it boil?” |

Speech is kept to one comparative section (CREMA-D plus the VAD/Whisper hallucination
result). It is an axis, not the frame.

## 3. The throughline

```
kettle (spine, 1:50)
  ├─ cup + spoon (transients, 0:14)
  ├─ stir (recurrence, 0:30)
  ├─ pour (turbulence, 0:04)
  ├─ four taps: mug soft / mug hard / glass / metal  (representation)
  └─ bouncing ball (synthetic control for timing and prediction)
```

The kettle is the cleanest complete state cycle. The full 3:27 “making tea” recording is
linked in the sources table but not used as the spine: its first two minutes are room
tone. Cup, stir and pour are close-ups from the same activity.

## 4. Section wireframe

| # | Section | Question | Main asset | Status |
|---|---|---|---|---|
| — | Hero | What is this? | blind kettle player + reveal | real |
| 01 | The recording | What are the states? | waveform + spectrogram + state strip + Ear v1 lane | real |
| 02 | Recognition | Why do you know it? | human label vs Ear v1 labels + two-row timeline | real |
| 03 | Signal | What reached the mic? | three physics cards with audio + spectrograms | real |
| 04 | Resolution | What survives compression? | A/B original / 8 kHz / 4 kHz | real |
| 05 | Representation | Which sounds are the same? | four taps + four cosine matrices | real |
| 06 | Separation | Can you isolate spoon from water? | synchronized HPSS stems | real |
| 07 | Detection | When did it happen? | G1 F1 + predicted episodes | real |
| 08 | Recurrence | How many times? | bouncing ball + F2 bars | real |
| 09 | Memory | How long did it boil? | state timeline + seven exact questions + 0.869 vs 0.188 | real |
| 10 | Prediction | What happens next? | hidden last 20 s + reveal | real |
| 11 | Speech, once | Does it generalise to voice? | CREMA-D + VAD/Whisper stats | real |
| 12 | Cost | Can you leave it on? | RTF calculator + frontier + ladder | real |
| 13 | Failures | What didn’t work? | verdict ledger | real |
| 14 | Next | Compose or sweep? | hybrid diagram + roadmap | real |
| 15 | Reproduce | Can I disbelieve it? | source/licence table + datasets + commands | real |
| A | Appendix | All numbers | encoder × metric table | real |

Every prose block is a bracketed note. That is intentional: the next pass is writing, not
layout.

## 5. Asset inventory

### Audio (15 files, 16 kHz mono, ~3.5 MB deployed)

| File | Use |
|---|---|
| `kettle.mp3` | spine; 1:50, switch → heat → boil → auto-off |
| `cup_spoon.mp3` | transients; 0:14 |
| `stir.mp3` | recurrence; 0:30 |
| `pour.mp3` | turbulence; 0:04 |
| `tap_mug_soft/hard`, `tap_glass`, `tap_metal` | representation quartet; 0.75 s each |
| `hpss_mix/harmonic/percussive` | separation demo; synchronized stems |
| `codec_original/8khz/4khz` | resolution ladder; same 20 s |
| `bouncing_ball.mp3` | synthetic timing control; 11 impacts |

### Data (18 JSON files)

Each clip JSON carries 900-bucket waveform peaks, a 64-band log-mel spectrogram (base64),
a label, duration, annotated stages and Ear v1 events. `results.json` is generated from
`tinker-proj/results/*.json`. `similarity.json` carries four real cosine matrices;
`sources.json` carries the Freesound ledger.

### What is real

- Kettle annotations from the RMS envelope, cross-checked against the recording
  description.
- Ear v1 predictions: switch click → “light switch”, boil → “vacuum cleaner”,
  ramp → “running water”, plus “coffee machine”. This is the recognition gap, measured.
- HPSS decomposition, codec ladder, bouncing ball, waveform/spectrogram rendering.
- DSP / BEATs iter3 / EAT-pretrain / USAD2-small cosine matrices on the four taps, from
  cached checkpoints.
- Encoder ladder, G1, CREMA-D, EPIC, memory, cost: from committed result files.
- All licences and source URLs.

### What is placeheld

- Body prose, captions, figure notes.
- EPIC-SOUNDS video-reveal card (link only; no restricted video re-hosted).
- Per-question SINS memory predictions and the “what we answered” arm.
- More materials / more taps for a real representation benchmark.
- OG image, Twitter card copy, final citation block.

## 6. Results carried into the wireframe

| Claim | Number | Where |
|---|---|---|
| Long-horizon memory, ours | 0.869 | §09 |
| Audio Flamingo 3, same 298 items | 0.188 | §09 |
| Constant baseline | 0.262 | §09 |
| 1-core RTF, mn04 / mn10 / BEATs | 0.0031 / 0.0058 / 0.0394 | §12 |
| Full listener path, BEATs + vocab + Viterbi | 251.5 s/audio-h, 3.56 GB | §12 |
| CREMA-D best / mn10 | Dasheng 0.740 / 0.578 | §11 |
| EPIC dense 21 | mn20 0.287 ≈ BEATs 0.285; mn10 0.282 | §07 |
| EPIC disc512 | mn10 0.215 > BEATs 0.172 | §07 |
| G1 F1 | DSP 0.744, EAT 0.776, mn10 0.608 | §07 |
| G1 F2 | all encoders 0.00–0.14; waveform NCC 0.940 | §08 |
| G1 F4 | SSL 0.958–1.000; CNNs 0.875–0.933; DSP 0.900 | §07 |
| VAD-gated Whisper | 846 invented words/h → 0; WER 0.254 → 0.039 | §11 |
| Novelty | 40.9 false alarms/day; hit 0.51 at 10 dB | §13 |
| Vacuum alert | 8/8 vs AF3 2/8; 0/day vs 17.5/day | §13 |

## 7. Decisions and tradeoffs

1. **Kettle, not the full ritual.** The 3:27 recording has two minutes of room tone. The
   kettle is the clean state cycle; the full recording is linked for provenance.
2. **Four taps, not a benchmark.** The matrices illustrate invariance and contrast. They
   are four loudness-normalised 0.75 s clips, not a measured benchmark. The note says so.
3. **Within-matrix colour.** Cosine values are compressed (0.55–1.00), so colour is
   rank-normalised per matrix while the numbers stay raw. This makes the contrast visible
   without inventing a scale.
4. **HPSS, not BASS.** HPSS is cheap, deterministic and audible. BASS is linked as the
   learned version; re-hosting its material would be wrong.
5. **Speech demoted.** One section, two results. The essay is about non-speech events.
6. **Wireframe prose.** Bracketed notes keep the structure honest and make the writing
   pass a separate, reviewable step.
7. **The same ear’s wrong labels are the hook.** “Vacuum cleaner” for a kettle is more
   memorable than any accuracy number, and it is true.

## 8. Open items

- Write the prose, section by section, replacing the bracket notes.
- Decide whether §03 and §04 can merge; currently both are short.
- Source a pour recorded in the same room as the kettle, or label the mismatch.
- EPIC-SOUNDS: confirm the clip licence and embed policy; otherwise keep the link card.
- Export per-question predictions for the 13 SINS items and the “what we answered” arm.
- Add bootstrap CIs to the four-tap matrices, or state n=4 explicitly.
- Mobile pass: the four-across tap grid, matrix labels and dock need a real phone check.
- OG image and meta tags; final citation; Twitter thread copy.
- Merge `blog/what-a-kettle-knows` to the default branch and deploy production at
  `carneasado.com/blog/what-a-kettle-knows/`.
- Optional: a second note on the bouncing ball as a controlled physics example.

## 9. Where everything lives

- Standalone source: `~/Desktop/personalProjects/listening-from-the-ground-up`
- Site integration: `portfolio-site/public/blog/what-a-kettle-knows/`
- Branch: <https://github.com/Archdiner/portfolio-site/tree/blog/what-a-kettle-knows>
- Public build: <https://what-a-kettle-knows.vercel.app>
- Protected branch preview:
  <https://portfolio-site-l0o9xu37i-sar367-3278s-projects.vercel.app/blog/what-a-kettle-knows/>
- Asset build scripts (private checkout): `_build/build_tea_assets.py`,
  `_build/cdp_test.mjs`

## 10. Reproduce

```bash
# rebuild audio, spectrograms, HPSS, codecs, matrices, bounce
/Users/asadr/Downloads/tinker-proj/.venv/bin/python _build/build_tea_assets.py

# rebuild the site
cd ~/Desktop/personalProjects/portfolio-site
npm run build

# headless interaction test (Chrome on :9222, site on :8899)
node _build/cdp_test.mjs
```

## 11. Recording provenance

| Recording | Author | Licence | Freesound |
|---|---|---|---|
| Making tea | Squidocto | CC0 | 258225 |
| Boiling the kettle | richwise | CC0 | 457007 |
| Cup, spoon and hot water | Islabonita | CC0 | 220959 |
| Spoon stirring cup | bolkmar | CC0 | 424488 |
| Water poured into a mug | soroar42 | CC0 | 692042 |
| Small mug tapped with objects | itinerantmonk108 | CC0 | 553899 |
| Glass clink 03 | KVV_Audio | CC BY 4.0 | 859218 |
| Hitting a metal bowl | itinerantmonk108 | CC0 | 874240 |

The glass clink is the only CC BY asset and needs attribution wherever the post is
published. Everything else is CC0.
