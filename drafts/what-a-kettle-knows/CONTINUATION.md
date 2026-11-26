# What a Kettle Knows — wireframe

Standalone static wireframe for a technical essay. The spine is one kettle and the sounds around making tea. Square brackets in the copy are intentional placeholders. The prose is not written yet.

Playback works. Assets and interactions are real.

## Preview

These are static files. From this directory:

```
python3 -m http.server 8900
```

Open http://127.0.0.1:8900/

Port 8899 may already be taken by another local server. Leave that one alone.

This folder is not a Vite entry, not under `public/`, and not linked from the homepage or nav. It does not become a live route on carneasado.com unless someone later wires it in and merges that change.

## Done

- `index.html`, `app.js`, `styles.css`
- `assets/audio/` clips the page plays
- `assets/data/` waveforms, spectrograms, results, and sources

Left out on purpose: `assets/source/` (raw clips the page does not fetch), `_build/` helpers, `__pycache__`, and `.DS_Store`.

## Known nits

- The hero footer clock in `index.html` is hardcoded `0:00 / 1:50`. `syncAll()` in `app.js` updates the dock clock and does not update the hero clock.
- `progressWaves()` paints an opaque `#f3a27f` rectangle over the played portion of the waveform instead of recoloring the peaks, so the hero looks like an orange block while playing.

## Continue

Stay on branch `wireframe/what-a-kettle-knows`. Edit this folder in place: `drafts/what-a-kettle-knows/`. Do not commit on `main`.
