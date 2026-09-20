/* eslint-env node */
// Amplitude-modulated halftone screen — the print process, not a dither.
//
// A dither keeps every cell the same size and varies WHICH cells are inked, so
// tone comes from the density of identical marks. A halftone keeps the grid
// fixed and varies the SIZE of the mark in each cell: tiny dots in the
// highlights, fat overlapping dots in the shadows. That is why a halftone reads
// as ink on paper and a dither reads as noise.
//
// The screen is rotated (traditionally 45 degrees) because an unrotated lattice
// makes the eye see rows and columns instead of continuous tone.
//
// Usage:
//   node scripts/halftone-screen.mjs <in> <out> [pitch] [angle] [shape] [width] [bg]
//     pitch  dot spacing in px of the OUTPUT (default 9)
//     angle  screen rotation in degrees (default 45)
//     shape  dot|diamond  (default diamond)
//     width  output width  (default 900)
//     bg     hex background (default #ffffff) — dots are sized by contrast against it
//     contrast  gain on that difference (default 2.6)

import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs';

const [, , input, output, pitchArg, angleArg, shapeArg, widthArg, bgArg] = process.argv;
if (!input || !output) {
  console.error('usage: node scripts/halftone-screen.mjs <in> <out> [pitch] [angle] [shape] [width] [bg]');
  process.exit(1);
}
const PITCH = Number(pitchArg) || 9;
const ANGLE = ((angleArg != null ? Number(angleArg) : 45) * Math.PI) / 180;
const SHAPE = shapeArg || 'diamond';
const OUTW = Number(widthArg) || 900;
const BG = bgArg || '#ffffff';
const CONTRAST = Number(process.argv[9]) || 2.6;

// The page colour can be a vertical gradient, given as "#top..#bottom".
//
// It has to be, in fact: the sea in the footage is not one colour but a ramp
// from bright cyan at the surface to deep teal below. Measured against a single
// flat colour, only one horizontal band of water ever cancels out and the rest
// fires dots. Against the same ramp the page is painted with, the whole water
// column disappears and only what isn't water is left.
function parseHex(h) {
  const x = h.replace('#', '');
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}
const REF = process.argv[10] || (BG === 'none' ? '#3a8b94..#005399' : BG);
const [BG_TOP, BG_BOT] = REF.includes('..')
  ? REF.split('..').map(parseHex)
  : [parseHex(REF), parseHex(REF)];

const img = await loadImage(input);
const OUTH = Math.round(OUTW * (img.height / img.width));

// Source at output resolution so cell sampling lines up with what's drawn.
const src = createCanvas(OUTW, OUTH);
const sctx = src.getContext('2d');
sctx.drawImage(img, 0, 0, OUTW, OUTH);
const data = sctx.getImageData(0, 0, OUTW, OUTH).data;

const out = createCanvas(OUTW, OUTH);
const ctx = out.getContext('2d');
// "none" leaves the canvas transparent. The gradient is still used below as the
// REFERENCE that decides which cells survive — it just doesn't get painted.
//
// This matters more than it sounds. Baking the background into the image means
// the image carries its own ramp over its own height, while the page carries a
// ramp over the viewport; the two are at different scales and offsets, so the
// tone inside the image never quite matches the page around it no matter how
// the colours are chosen. Rendering on transparency removes the problem by
// construction: there is only ever one gradient, the page's, and the dots sit
// directly on it at any size, position or viewport.
if (BG !== 'none') {
  const grad = ctx.createLinearGradient(0, 0, 0, OUTH);
  grad.addColorStop(0, `rgb(${BG_TOP.join(',')})`);
  grad.addColorStop(1, `rgb(${BG_BOT.join(',')})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, OUTW, OUTH);
}

const cos = Math.cos(ANGLE);
const sin = Math.sin(ANGLE);
// Walk the rotated lattice far enough past the edges that the corners fill.
const reach = Math.ceil((OUTW + OUTH) / PITCH);

function sample(x, y) {
  const px = Math.max(0, Math.min(OUTW - 1, Math.round(x)));
  const py = Math.max(0, Math.min(OUTH - 1, Math.round(y)));
  const i = (py * OUTW + px) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

for (let j = -reach; j <= reach; j++) {
  for (let i = -reach; i <= reach; i++) {
    // Cell centre in screen space, rotated back into image space.
    const u = i * PITCH;
    const v = j * PITCH;
    const x = u * cos - v * sin;
    const y = u * sin + v * cos;
    if (x < -PITCH || y < -PITCH || x > OUTW + PITCH || y > OUTH + PITCH) continue;

    const [r, g, b] = sample(x, y);

    // Coverage is contrast against the page, not absolute darkness.
    //
    // When the page colour is sampled from the footage's own water, anything
    // the same colour as the water produces no dot at all — the sea simply
    // *is* the page, and the animal and the seagrass are what emerge from it.
    // Keying by luminance can't do this: the water is mid-tone, so it would
    // fire medium dots everywhere and fill the frame with texture.
    const t = Math.max(0, Math.min(1, y / OUTH));
    const bgr = BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * t;
    const bgg = BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * t;
    const bgb = BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * t;
    const dr = (r - bgr) / 255;
    const dg = (g - bgg) / 255;
    const db = (b - bgb) / 255;
    // Weighted toward luminance, because the eye reads tonal difference more
    // strongly than hue difference at this dot size.
    const diff = Math.sqrt(0.5 * dr * dr + 0.8 * dg * dg + 0.3 * db * db);
    const coverage = Math.min(diff * CONTRAST, 1);
    if (coverage <= 0.02) continue;

    // Area, not radius, tracks coverage: a dot's ink goes with r^2, so scaling
    // the radius linearly would make every midtone far too heavy. sqrt keeps
    // perceived tone honest. The 1.45 lets the darkest cells overlap into
    // solid, which is what leaves those little unlinked gaps in the blacks.
    const radius = Math.sqrt(coverage) * (PITCH / 2) * 1.45;
    if (radius < 0.35) continue;

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    if (SHAPE === 'diamond') {
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y);
      ctx.lineTo(x, y + radius);
      ctx.lineTo(x - radius, y);
      ctx.closePath();
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

fs.writeFileSync(output, out.toBuffer('image/png'));
console.log(`halftone ${input} -> ${output} (${OUTW}x${OUTH}, pitch ${PITCH}, ${ANGLE * 180 / Math.PI}deg, ${SHAPE})`);
