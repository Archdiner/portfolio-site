/* eslint-env node */
// One-off: render a source image to a chunky 1-bit Floyd-Steinberg dither.
// Usage: node scripts/dither.mjs <input> <output> [targetWidth] [contrast]
// Not part of the build; run manually to regenerate a dithered asset, commit the PNG.

import Jimp from 'jimp';

const [, , input, output, widthArg, brightArg, contrastArg] = process.argv;
if (!input || !output) {
  console.error('usage: node scripts/dither.mjs <input> <output> [width] [brightness] [contrast]');
  process.exit(1);
}
const targetWidth = Number(widthArg) || 360;
const brightness = brightArg != null ? Number(brightArg) : 0.15;
const contrast = contrastArg != null ? Number(contrastArg) : 0.1;

const img = await Jimp.read(input);
img.cover(targetWidth, Math.round(targetWidth * (img.bitmap.height / img.bitmap.width)));
img.grayscale();
img.normalize(); // stretch histogram so the subject is not lost in shadow
if (brightness) img.brightness(brightness);
if (contrast) img.contrast(contrast);

const { data, width, height } = img.bitmap;
// grayscale buffer (use red channel; r=g=b after grayscale)
const g = new Float32Array(width * height);
for (let i = 0; i < width * height; i++) g[i] = data[i * 4];

// Floyd-Steinberg error diffusion to pure black/white
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const oldv = g[idx];
    const newv = oldv < 128 ? 0 : 255;
    const err = oldv - newv;
    g[idx] = newv;
    if (x + 1 < width) g[idx + 1] += (err * 7) / 16;
    if (y + 1 < height) {
      if (x > 0) g[idx + width - 1] += (err * 3) / 16;
      g[idx + width] += (err * 5) / 16;
      if (x + 1 < width) g[idx + width + 1] += (err * 1) / 16;
    }
  }
}

for (let i = 0; i < width * height; i++) {
  const v = g[i] > 127 ? 255 : 0;
  data[i * 4] = v;
  data[i * 4 + 1] = v;
  data[i * 4 + 2] = v;
  data[i * 4 + 3] = 255;
}

await img.writeAsync(output);
console.log(`dithered ${input} -> ${output} (${width}x${height})`);
