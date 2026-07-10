/* eslint-env node */
// Build a library of minimal ink specimens on transparent bg, + a contact sheet.
import Jimp from 'jimp';
import fs from 'node:fs';

const SCRATCH = '/private/tmp/claude-501/-Users-asadr-Desktop-personalProjects/77e2b72e-2a24-4a8c-9558-98fddddc1007/scratchpad/refs';
const OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/art/specimens';
fs.mkdirSync(OUT, { recursive: true });

const INK = { r: 0x1c, g: 0x18, b: 0x12 };
const PAPER = 0xf1ece1ff;

function inkifyBitmap(img, { invert }) {
  img.grayscale();
  if (invert) img.invert();
  img.normalize();
  img.contrast(0.15);
  const { data, width, height } = img.bitmap;
  for (let i = 0; i < width * height; i++) {
    const g = data[i * 4];
    const alpha = Math.max(0, Math.min(255, 255 - g));
    data[i * 4] = INK.r; data[i * 4 + 1] = INK.g; data[i * 4 + 2] = INK.b; data[i * 4 + 3] = alpha;
  }
  return img;
}

// 1) radiolaria specimens (dark-bg plate -> invert), cropped from full-res inked plate
const rad = await Jimp.read(`${SCRATCH}/art/haeckel-radiolaria.jpg`);
if (rad.bitmap.width !== 1000) rad.resize(1000, Jimp.AUTO);
inkifyBitmap(rad, { invert: true });
const radCrops = {
  sphere: [360, 585, 300, 330],
  star: [300, 20, 430, 430],
  burst: [280, 1070, 440, 350],
};
const specimens = [];
for (const [name, [x, y, w, h]] of Object.entries(radCrops)) {
  const cw = Math.min(w, rad.bitmap.width - x);
  const ch = Math.min(h, rad.bitmap.height - y);
  const c = rad.clone().crop(x, y, cw, ch);
  await c.writeAsync(`${OUT}/${name}.png`);
  specimens.push([name, c]);
}

// 2) line-engraving organics (light-bg -> no invert)
for (const name of ['nautilus', 'ammonite', 'leaf']) {
  try {
    const img = await Jimp.read(`${SCRATCH}/specimens/${name}.jpg`);
    if (img.bitmap.width > 700) img.resize(700, Jimp.AUTO);
    inkifyBitmap(img, { invert: false });
    await img.writeAsync(`${OUT}/${name}.png`);
    specimens.push([name, img]);
  } catch (e) { console.log(`skip ${name}: ${e.message}`); }
}

// 3) contact sheet: 3 cols
const cols = 3, cell = 360, pad = 20;
const rows = Math.ceil(specimens.length / cols);
const sheet = new Jimp(cols * cell, rows * cell, PAPER);
specimens.forEach(([name, img], i) => {
  const s = img.clone();
  s.scaleToFit(cell - pad * 2, cell - pad * 2);
  const cx = (i % cols) * cell + (cell - s.bitmap.width) / 2;
  const cy = Math.floor(i / cols) * cell + (cell - s.bitmap.height) / 2;
  sheet.composite(s, cx, cy);
  console.log(`${i}: ${name} (${img.bitmap.width}x${img.bitmap.height})`);
});
await sheet.writeAsync('/tmp/specimens-contact.jpg');
console.log('wrote /tmp/specimens-contact.jpg');
