# What a Kettle Knows — wireframe

A standalone, static wireframe for the first research post. The prose is deliberately
placeheld in bracketed notes; every chart, player, spectrogram and interaction is real.

**Live path:** `/blog/what-a-kettle-knows/`

**Public build:** <https://what-a-kettle-knows.vercel.app>

**Plan and debrief:** [PLAN.md](PLAN.md)

## What is real

- **Audio.** CC0/CC-BY Freesound recordings, transcoded to 16 kHz mono. Every player
  works. The kettle is the spine; cup, stir and pour are close-ups from the same activity.
- **Kettle annotations.** Four states (off / heating / boiling / off) derived from the
  recording's RMS envelope, cross-checked against the reference description.
- **Ear predictions.** Real `Ear v1` output on the kettle, cup and stir recordings
  (15 home classes). The model calls the kettle a vacuum cleaner and a coffee machine.
- **Similarity matrices.** Real cosine similarities from cached DSP, BEATs iter3,
  EAT-pretrain and USAD2-small checkpoints on four 0.75 s taps.
- **HPSS stems.** Real harmonic/percussive decomposition of the cup recording.
- **Codec ladder.** Real 16 kHz / 8 kHz / 4 kHz low-pass files.
- **Bouncing ball.** Synthesised, with known impact times.
- **Encoder ladder, G1, CREMA-D, EPIC, memory, cost.** From committed `tinker-proj`
  results (`results/*.json`), not retyped by hand.

## What is placeheld

- All body prose, captions and figure notes (the `[BRACKET]` blocks).
- The EPIC-SOUNDS video-reveal card (link only; no restricted video re-hosted).
- Per-question predictions for the 13-question SINS memory set.
- The “what we answered” arm in the kettle question cards.

## Files

```
index.html
styles.css
app.js
assets/audio/*.mp3
assets/data/*.json
```

`assets/data/results.json` is generated from `tinker-proj/results/*.json`.
`assets/data/kettle.json` etc. carry waveform peaks, a 64-band mel spectrogram,
annotated stages and Ear v1 events.

## Rebuilding the assets

Source scripts live outside this repo in the private `tinker-proj` checkout:

- `_build/build_tea_assets.py` — audio cuts, spectrograms, HPSS, codec ladder,
  bouncing ball, similarities, source ledger.
- `_build/cdp_test.mjs` — headless Chrome interaction test.

They assume the `tinker-proj` virtualenv and cached checkpoints.

## Recording provenance

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
