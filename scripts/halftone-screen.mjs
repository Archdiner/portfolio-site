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
//     bg     hex background (default #ffffff)

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

const img = await loadImage(input);
const OUTH = Math.round(OUTW * (img.height / img.width));

// Source at output resolution so cell sampling lines up with what's drawn.
const src = createCanvas(OUTW, OUTH);
const sctx = src.getContext('2d');
sctx.drawImage(img, 0, 0, OUTW, OUTH);
const data = sctx.getImageData(0, 0, OUTW, OUTH).data;

const out = createCanvas(OUTW, OUTH);
const ctx = out.getContext('2d');
ctx.fillStyle = BG;
ctx.fillRect(0, 0, OUTW, OUTH);

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
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const darkness = 1 - lum;
    if (darkness <= 0.02) continue;

    // Area, not radius, tracks darkness: a dot's ink coverage goes with r^2, so
    // scaling the radius linearly would make the midtones far too heavy.
    // sqrt keeps perceived tone honest. The 1.45 lets shadows overlap into
    // solid, which is what leaves those little unlinked gaps in the blacks.
    const radius = Math.sqrt(darkness) * (PITCH / 2) * 1.45;
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
