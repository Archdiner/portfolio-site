/* eslint-env node */
// Render an image as a halftone dot-matrix (circles sized by local darkness) on
// transparent bg, in a given ink color. For the art×technology cobalt zine look.
import Jimp from 'jimp';

const [, , input, output, colorHex, cellArg, invertArg, widthArg] = process.argv;
const color = Jimp.cssColorToHex(colorHex || '#edefe9'); // dot color
const cell = Number(cellArg) || 8;
const invert = invertArg === 'invert'; // invert => light areas get big dots
const targetW = Number(widthArg) || 720;

const src = await Jimp.read(input);
src.cover(targetW, Math.round(targetW * (src.bitmap.height / src.bitmap.width)));
src.grayscale();
src.normalize();

const W = src.bitmap.width, H = src.bitmap.height;
const out = new Jimp(W, H, 0x00000000);
const cr = (color >>> 24) & 255, cg = (color >>> 16) & 255, cb = (color >>> 8) & 255;

for (let cy = 0; cy < H; cy += cell) {
  for (let cx = 0; cx < W; cx += cell) {
    // average luminance in this cell
    let sum = 0, n = 0;
    for (let y = cy; y < Math.min(cy + cell, H); y++) {
      for (let x = cx; x < Math.min(cx + cell, W); x++) { sum += src.bitmap.data[(y * W + x) * 4]; n++; }
    }
    const lum = sum / n / 255;               // 0 dark .. 1 light
    const darkness = invert ? lum : 1 - lum; // how big the dot is
    const r = darkness * (cell / 2) * 1.08;
    if (r < 0.4) continue;
    const ccx = cx + cell / 2, ccy = cy + cell / 2;
    const r2 = r * r;
    for (let y = Math.floor(ccy - r); y <= Math.ceil(ccy + r); y++) {
      for (let x = Math.floor(ccx - r); x <= Math.ceil(ccx + r); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const dx = x - ccx, dy = y - ccy;
        if (dx * dx + dy * dy <= r2) {
          const i = (y * W + x) * 4;
          out.bitmap.data[i] = cr; out.bitmap.data[i + 1] = cg; out.bitmap.data[i + 2] = cb; out.bitmap.data[i + 3] = 255;
        }
      }
    }
  }
}
await out.writeAsync(output);
console.log(`halftone ${input} -> ${output} (${W}x${H}, cell ${cell})`);
