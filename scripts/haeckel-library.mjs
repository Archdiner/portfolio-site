/* eslint-env node */
// Fetch varied Haeckel Kunstformen plates, center-crop the hero specimen, ink to
// transparent, and montage everything in specimens/ for review.
import Jimp from 'jimp';
import fs from 'node:fs';

const OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/art/specimens';
fs.mkdirSync(OUT, { recursive: true });
const INK = { r: 0x1c, g: 0x18, b: 0x12 };
const PAPER = 0xf1ece1ff;

const plates = [
  ['Haeckel Chiroptera Kunstformen', 'bat'],
  ['Haeckel Orchidae Kunstformen', 'orchid'],
  ['Haeckel Nepenthaceae Kunstformen', 'pitcher'],
  ['Haeckel Asteridea Kunstformen', 'starfish'],
  ['Haeckel Trochilidae Kunstformen', 'hummingbird'],
  ['Haeckel Aranea Kunstformen', 'spider'],
  ['Haeckel Prosobranchia Kunstformen', 'snail'],
  ['Haeckel Muscinae Kunstformen', 'moss'],
];

async function commonsThumb(term) {
  const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: term,
    gsrnamespace: '6', gsrlimit: '6', prop: 'imageinfo', iiprop: 'url', iiurlwidth: '1000',
  });
  const r = await fetch(api, { headers: { 'User-Agent': 'portfolio-art/1.0' } });
  const j = await r.json();
  for (const p of Object.values(j?.query?.pages || {})) {
    const u = p.imageinfo?.[0]?.thumburl;
    if (u && /\.(jpe?g|png)$/i.test(u.split('?')[0])) return u;
  }
  return null;
}

function meanGray(img) {
  const { data, width, height } = img.bitmap;
  let s = 0;
  for (let i = 0; i < width * height; i++) s += (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
  return s / (width * height);
}

function inkify(img, invert) {
  img.grayscale();
  if (invert) img.invert();
  img.normalize();
  img.contrast(0.18);
  const { data, width, height } = img.bitmap;
  for (let i = 0; i < width * height; i++) {
    const g = data[i * 4];
    const a = Math.max(0, Math.min(255, 255 - g));
    data[i * 4] = INK.r; data[i * 4 + 1] = INK.g; data[i * 4 + 2] = INK.b; data[i * 4 + 3] = a;
  }
  return img;
}

for (const [term, slug] of plates) {
  try {
    const url = await commonsThumb(term);
    if (!url) { console.log(`no image: ${slug}`); continue; }
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': 'portfolio-art/1.0' } })).arrayBuffer());
    if (buf.length < 8000) { console.log(`placeholder: ${slug}`); continue; }
    const img = await Jimp.read(buf);
    // center-crop 62% to isolate the hero specimen, drop margins/labels
    const cw = Math.round(img.bitmap.width * 0.62);
    const ch = Math.round(img.bitmap.height * 0.62);
    img.crop(Math.round((img.bitmap.width - cw) / 2), Math.round((img.bitmap.height - ch) / 2), cw, ch);
    const invert = meanGray(img) < 110;
    inkify(img, invert);
    await img.writeAsync(`${OUT}/${slug}.png`);
    console.log(`saved ${slug} (invert=${invert})`);
  } catch (e) { console.log(`ERR ${slug}: ${e.message}`); }
}

// montage everything in specimens/
const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).sort();
const cols = 3, cell = 340, pad = 18;
const rows = Math.ceil(files.length / cols);
const sheet = new Jimp(cols * cell, rows * cell, PAPER);
for (let i = 0; i < files.length; i++) {
  const s = await Jimp.read(`${OUT}/${files[i]}`);
  s.scaleToFit(cell - pad * 2, cell - pad * 2);
  sheet.composite(s, (i % cols) * cell + (cell - s.bitmap.width) / 2, Math.floor(i / cols) * cell + (cell - s.bitmap.height) / 2);
  console.log(`${i}: ${files[i]}`);
}
await sheet.writeAsync('/tmp/haeckel-contact.jpg');
console.log('wrote /tmp/haeckel-contact.jpg');
