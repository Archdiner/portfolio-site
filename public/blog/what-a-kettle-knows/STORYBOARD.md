# What a Kettle Knows: storyboard

The v0.4 rewrite. The post follows one recording from start to finish: a single electric
kettle. Each section asks the question the previous one left open. Terms like spectrogram,
embedding and the diary are introduced only once the reader needs them. Model names move to
footnotes and the appendix.

The idea it builds towards: hearing is mostly solved, and remembering is not. A useful
listener keeps a diary of what turned on and off, and when, instead of captioning clips.

## v0.6: the five-way tour (current)

The post is an explainer about how a model can hold the same sound in different ways, not a
results paper. Each stop says what that way of listening keeps and what it throws away.
Exact numbers live in the appendix.

| # | Section | What it keeps / throws away | Widget |
|---|---|---|---|
| 0 | Cold open, then "How did you know?" | Naming vs keeping track: two skills | Blind guess, moments player |
| | Framing + the tour | First dive into audio research; five ways to listen | Five-step plan figure |
| 1 | A list of numbers | Keeps everything, means nothing yet | Zoom to samples, then the codec ladder |
| 2 | A picture | Which pitches, when | Spectrogram player, smooth/sharp split |
| 3 | A point in space | What it sounds like, not when or how many | Four taps + similarity grids, bouncing ball |
| 4 | A list of labels | Names a few seconds at a time, no story | The Ear's vacuum cleaner |
| | What about a bigger model? | Audio Flamingo mostly says "none" (qualitative) | none |
| 5 | A diary | What changed, and when; the arithmetic is the other half | Kettle diary questions |
| | Knowing when to listen | Whisper's repeated sentence, the gate | Quote |
| | Back to the kettle | What each listener "knows"; bitter lesson; SSL and diffusion next | Final log |

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
