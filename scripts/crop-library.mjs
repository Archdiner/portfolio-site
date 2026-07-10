/* eslint-env node */
// Crop a varied set of minimal ink specimens from the two plates we already have.
import Jimp from 'jimp';
import fs from 'node:fs';

const SRC = '/private/tmp/claude-501/-Users-asadr-Desktop-personalProjects/77e2b72e-2a24-4a8c-9558-98fddddc1007/scratchpad/refs/art';
const OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/art/specimens';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const INK = { r: 0x1c, g: 0x18, b: 0x12 };
const PAPER = 0xf1ece1ff;

function inkify(img, invert) {
  img.grayscale();
  if (invert) img.invert();
  img.normalize();
  img.contrast(0.16);
  const { data, width, height } = img.bitmap;
  for (let i = 0; i < width * height; i++) {
    const g = data[i * 4];
    const a = Math.max(0, Math.min(255, 255 - g));
    data[i * 4] = INK.r; data[i * 4 + 1] = INK.g; data[i * 4 + 2] = INK.b; data[i * 4 + 3] = a;
  }
  return img;
}
const clampCrop = (img, x, y, w, h) =>
  img.clone().crop(x, y, Math.min(w, img.bitmap.width - x), Math.min(h, img.bitmap.height - y));

// radiolaria (dark bg -> invert), 1000w
const rad = await Jimp.read(`${SRC}/haeckel-radiolaria.jpg`);
if (rad.bitmap.width !== 1000) rad.resize(1000, Jimp.AUTO);
inkify(rad, true);
const radCrops = {
  'rad-sphere': [360, 585, 300, 330],
  'rad-star': [300, 20, 430, 430],
  'rad-burst': [280, 1060, 440, 340],
  'rad-tree': [20, 25, 300, 430],
  'rad-ring': [745, 545, 255, 300],
  'rad-cylinder': [5, 1180, 190, 235],
};
for (const [name, [x, y, w, h]] of Object.entries(radCrops)) {
  await clampCrop(rad, x, y, w, h).writeAsync(`${OUT}/${name}.png`);
}

// jellyfish (light bg -> no invert), 1000w
const jel = await Jimp.read(`${SRC}/haeckel-jellyfish.jpg`);
if (jel.bitmap.width !== 1000) jel.resize(1000, Jimp.AUTO);
inkify(jel, false);
const H = jel.bitmap.height;
const jelCrops = {
  'medusa-blue': [10, Math.round(H * 0.02), 360, Math.round(H * 0.42)],
  'medusa-orange': [560, Math.round(H * 0.5), 440, Math.round(H * 0.48)],
};
for (const [name, [x, y, w, h]] of Object.entries(jelCrops)) {
  await clampCrop(jel, x, y, w, h).writeAsync(`${OUT}/${name}.png`);
}

// montage
const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).sort();
const cols = 4, cell = 320, pad = 16;
const rows = Math.ceil(files.length / cols);
const sheet = new Jimp(cols * cell, rows * cell, PAPER);
for (let i = 0; i < files.length; i++) {
  const s = await Jimp.read(`${OUT}/${files[i]}`);
  s.scaleToFit(cell - pad * 2, cell - pad * 2);
  sheet.composite(s, (i % cols) * cell + (cell - s.bitmap.width) / 2, Math.floor(i / cols) * cell + (cell - s.bitmap.height) / 2);
  console.log(`${i}: ${files[i]}`);
}
await sheet.writeAsync('/tmp/library-contact.jpg');
console.log('wrote /tmp/library-contact.jpg');
