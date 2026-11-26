# What a Kettle Knows: storyboard

The v0.4 rewrite. The post follows one recording from start to finish: a single electric
kettle. Each section asks the question the previous one left open. Terms like spectrogram,
embedding and the diary are introduced only once the reader needs them. Model names move to
footnotes and the appendix.

The idea it builds towards: hearing is mostly solved, and remembering is not. A useful
listener keeps a diary of what turned on and off, and when, instead of captioning clips.

| # | Section | The question it asks | What the reader does | Hands off to |
|---|---|---|---|---|
| 0 | Cold open | What is this? | Plays a blind 1:50 clip and picks one of four guesses (two of them are the model's later mistakes) | "How did you know?" |
| 1 | How did you know? | What did you actually hear? | Replays it; the click, the build-up, the boil and the click-off are marked as they pass | Naming a sound is one skill; tracking what happened is another |
| 2 | Why a machine should care | Who needs this? | (prose) Questions about state: is it on, since when, how long | "Start from what a microphone gives you" |
| 3 | 1.76 million numbers | What does a computer get? | Zooms from the whole clip down to single samples | "How many can we throw away?" |
| 4 | Throwing most of it away | How much matters? | Plays the clip at 16k, 8k and 4k; the spectrogram loses its top | "That picture is a spectrogram" |
| 5 | A picture of sound | What is a spectrogram? | Watches the kettle drawn both ways, with the moments labelled | Pictures have shapes you can use |
| 6 | Smooth and sharp | What can simple geometry do? | Splits a cup of tea into the steady part and the sharp part | "Pixels still can't say two sounds are alike" |
| 7 | Which sounds are alike? | What is an embedding? | Plays four taps, then compares four listeners' similarity grids | "Let's ask a trained model about the kettle" |
| 8 | Asking a trained ear | What does a real model hear? | Sees the Ear call the kettle a vacuum cleaner, with timing that's right (pays off the guess) | It names a few seconds at a time and keeps no memory |
| 9 | Noticing vs counting | Which basic skills do models already have? | Change and count scores; counts the bounces of a ball by ear | An embedding is a one-sentence summary; use the right tool for when and how many |
| 10 | Keep a diary | What if the listener writes things down? | Asks the kettle's diary questions; SINS week results against Audio Flamingo 3 | "Can you afford to leave it on?" |
| 11 | Leaving it on | What does always-on listening cost? | 24-hour compute bars | The same idea applies to voices |
| 12 | Voices, briefly | Does the idea carry over? | Whisper gate numbers | Be honest about what failed |
| 13 | What didn't work | What failed? | Plain-language list | Back to the kettle |
| 14 | Back to the kettle | So what does a kettle know? | Replays the clip while the diary writes itself | End |
| A | Appendix | Can I check this? | Every number, the sources, the method, model names | |

## Voice rules

- First person, conversational, short paragraphs. "You" for the reader.
- Introduce every term after its motivating example, never before.
- Every result answers a question the story has already asked. No free-floating metrics.
- Say plainly what was hand-marked and what came from a model.
- No em-dash chains, no "not X but Y" reflexes, no "delve / robust / crucially".

## Honesty notes carried into the text

- The kettle's states were marked by hand (from the loudness envelope). The kettle diary in
  §10 and §14 is the *target*, not model output; the text says so.
- The Ear's kettle labels are real model output.
- The four-tap grids are four clips. The text says it's not a benchmark.
- The SINS result is one home, 298 questions.
- Costs are one CPU core, fp32, not quantised and not a phone.
