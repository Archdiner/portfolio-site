/* eslint-env node */
// Turn Haeckel's radiolaria plate (white specimens on black) into ink-line
// specimens on a transparent background, for notebook-style marginalia on ivory.
import Jimp from 'jimp';
import fs from 'node:fs';

const SRC = '/private/tmp/claude-501/-Users-asadr-Desktop-personalProjects/77e2b72e-2a24-4a8c-9558-98fddddc1007/scratchpad/refs/art';
const OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/art';
fs.mkdirSync(OUT, { recursive: true });

const INK = { r: 0x2b, g: 0x27, b: 0x20 };

async function inkify(inFile, outFile) {
  const img = await Jimp.read(`${SRC}/${inFile}`);
  if (img.bitmap.width > 1000) img.resize(1000, Jimp.AUTO);
  img.grayscale();
  img.invert(); // white-on-black -> black-on-white
  img.contrast(0.25);
  const { data, width, height } = img.bitmap;
  for (let i = 0; i < width * height; i++) {
    const g = data[i * 4];
    const alpha = Math.max(0, Math.min(255, 255 - g));
    data[i * 4] = INK.r;
    data[i * 4 + 1] = INK.g;
    data[i * 4 + 2] = INK.b;
    data[i * 4 + 3] = alpha;
  }
  await img.writeAsync(`${OUT}/${outFile}`);
  console.log(`inked ${inFile} -> ${outFile} (${width}x${height})`);
}

// color hero: just copy the jellyfish plate through
async function copyThrough(inFile, outFile) {
  const img = await Jimp.read(`${SRC}/${inFile}`);
  if (img.bitmap.width > 1000) img.resize(1000, Jimp.AUTO);
  img.quality(74);
  await img.writeAsync(`${OUT}/${outFile}`);
  console.log(`copied ${inFile} -> ${outFile}`);
}

await inkify('haeckel-radiolaria.jpg', 'radiolaria-ink.png');
await copyThrough('haeckel-jellyfish.jpg', 'jellyfish.jpg');

// crop the iconic central sphere specimen for use as a section mark (from full-res)
const plate = await Jimp.read(`${OUT}/radiolaria-ink.png`);
plate.crop(360, 585, 300, 330);
await plate.writeAsync(`${OUT}/specimen-sphere.png`);
console.log('cropped specimen-sphere.png');

// downsize the ambient plate (used faintly, decorative) to keep bytes small
const ambient = await Jimp.read(`${OUT}/radiolaria-ink.png`);
ambient.resize(640, Jimp.AUTO);
await ambient.writeAsync(`${OUT}/radiolaria-ink.png`);
console.log('downsized radiolaria-ink.png ambient');
