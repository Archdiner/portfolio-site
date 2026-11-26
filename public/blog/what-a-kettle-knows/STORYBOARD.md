# What a Kettle Knows: storyboard

The v0.4 rewrite. The post follows one recording from start to finish: a single electric
kettle. Each section asks the question the previous one left open. Terms like spectrogram,
embedding and the diary are introduced only once the reader needs them. Model names move to
footnotes and the appendix.

The idea it builds towards: hearing is mostly solved, and remembering is not. A useful
listener keeps a diary of what turned on and off, and when, instead of captioning clips.

## v0.9: kettle first, deep dive second (current)

**Post 1 (index.html): What a Kettle Knows.** Hearing a sound is not keeping track of it.
Models are introduced at a high level only.

| Section | Figure |
|---|---|
| Cold open, how did you know, the two skills, framing | Blind guess, moments, pipeline |
| 1.76 million numbers, a picture of sound, patches | Zoom, spectrogram, patches |
| Meet the listeners (one line per model, link to post 2) | Family tree, real-model maps of five sounds |
| Teaching it fifteen words | The Ear's training curve, the Ear's labels on the kettle |
| Finding repeats | Bouncing ball matching, skills chart, repeat re-creation (dips), every-moment map (window position) |
| What about a bigger model? | Audio-language model diagram, Audio Flamingo |
| Knowing when to listen | Whisper's sentence |
| Keeping a diary | Kettle diary questions, SINS memory chart |
| Back to the kettle | Final log; bitter lesson; points to post 2 |

**Post 2 (learning-to-hear/, draft): How Machines Learn to Hear.** The five-objective lab
(build/lab.py), the taps grid and the report card.

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
