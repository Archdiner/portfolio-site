# What a Kettle Knows: storyboard

The v0.4 rewrite. The post follows one recording from start to finish: a single electric
kettle. Each section asks the question the previous one left open. Terms like spectrogram,
embedding and the diary are introduced only once the reader needs them. Model names move to
footnotes and the appendix.

The idea it builds towards: hearing is mostly solved, and remembering is not. A useful
listener keeps a diary of what turned on and off, and when, instead of captioning clips.

## v0.7: how models learn to hear (current)

**Audience:** technical readers who have never looked inside an audio model (CS/ML students,
engineers), plus researchers and recruiters skimming for understanding.
**Message:** a model hears what its training taught it to care about. The results are evidence
for that, not the point.

| Part | Sections | Widgets |
|---|---|---|
| Opening | Cold open, how did you know, the thesis, the pipeline | Blind guess, moments, five-step pipeline |
| Sound to tokens | 1.76 million numbers, how much can we throw away, a picture of sound, smooth and sharp, cutting into patches | Zoom, codec ladder, spectrogram, HPSS, patches (cut, hide, redraw/code/teacher) |
| Six ways to train | Recipe, AudioSet taggers, Dasheng, BEATs, EAT, USAD | Six cards |
| Training shapes hearing | Watching training happen (tiny model, labels vs masked redraw), taps, rank flip | Live-trained tiny model, similarity grids, kitchen vs emotion slope chart |
| From hearing to doing | Fine-tuning the Ear, finding repeats, audio-language models, Whisper | Real training curve, Ear rows, live waveform matching, skills chart, ALM diagram |
| Remembering | Keeping a diary | Kettle diary, SINS memory chart |
| Close | What each listener knows, bitter lesson, SSL and diffusion next | Final log |

## Voice rules

- First person, conversational, short paragraphs. "You" for the reader.
- Introduce every term after its motivating example, never before.
- Every result answers a question the story has already asked. No free-floating metrics.
- Say plainly which system produced each result. Don't call anything "marked by hand".
- No em-dash chains, no "not X but Y" reflexes, no "delve / robust / crucially".

## Honesty notes carried into the text

- The kettle's states come from a simple loudness-envelope system, checked against the recording description. The kettle diary in
  §10 and §14 is the *target*, not model output; the text says so.
- The Ear's kettle labels are real model output.
- The four-tap grids are four clips. The text says it's not a benchmark.
- The SINS result is one home, 298 questions.
- Costs are one CPU core, fp32, not quantised and not a phone.

## v0.5: taking structure from the Kyutai codec explainer

- Open with a stance on where the field is (good at naming, bad at remembering), the way Kyutai opens with "speech LLMs suck".
- Show the plan as a figure up front (Kyutai's encoder/LM/decoder sandwich).
- Try the obvious approach first and let it fail (Kyutai's sample-by-sample model; here, asking Audio Flamingo 3).
- Be plain about which system produced what (no "confession" framing).
- Put numbers on a human scale (a week is about 600,000 seconds).
- End on an open question about the field, then annotated further reading.
- Credit prior work where the idea comes up (Kyutai does this with RVQ): Socratic Models, the 2024 activity-assistance study, VideoAgent, LA-RAG.
- Close on the bitter lesson: the diary format is designed by a person, so treat it as the bar for end-to-end models to beat, not the destination.
- Frame it as a first exploratory dive into audio research: the labeling/diary idea felt intuitive, building it showed its limits, and the post closes by pointing to self-supervised training and diffusion as what comes next.
