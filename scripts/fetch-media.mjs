/* eslint-env node */
import fs from 'node:fs';

const BOOKS_OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/books';
const LOGOS_OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/logos';
fs.mkdirSync(BOOKS_OUT, { recursive: true });
fs.mkdirSync(LOGOS_OUT, { recursive: true });

const books = [
  ['six-of-crows', 'Six of Crows', 'Leigh Bardugo'],
  ['kafka-shore', 'Kafka on the Shore', 'Haruki Murakami'],
  ['metamorphosis', 'The Metamorphosis', 'Franz Kafka'],
  ['down-and-out', 'Down and Out in Paris and London', 'George Orwell'],
  ['dear-evan-hansen', 'Dear Evan Hansen', 'Val Emmich'],
  ['dorian-gray', 'The Picture of Dorian Gray', 'Oscar Wilde'],
  ['life-3', 'Life 3.0', 'Max Tegmark'],
  ['20000-leagues', 'Twenty Thousand Leagues Under the Sea', 'Jules Verne'],
];

async function bookCover(title, author) {
  const q = new URLSearchParams({ title, author, limit: '8' });
  const r = await fetch(`https://openlibrary.org/search.json?${q}`, { headers: { 'User-Agent': 'portfolio/1.0' } });
  const j = await r.json();
  const doc = (j.docs || []).find((d) => d.cover_i);
  if (!doc) return null;
  return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
}

for (const [slug, title, author] of books) {
  try {
    const url = await bookCover(title, author);
    if (!url) { console.log(`book NO COVER: ${slug}`); continue; }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(`${BOOKS_OUT}/${slug}.jpg`, buf);
    console.log(`book ${slug}: ${buf.length} bytes`);
  } catch (e) { console.log(`book ERR ${slug}: ${e.message}`); }
}

const orgs = [
  ['zybit', 'getzybit.com'],
  ['akash', 'akash.network'],
  ['genai', 'cornellgenai.dev'],
  ['cornellblockchain', 'cornellblockchain.org'],
  ['riig', 'riigtech.com'],
];

for (const [slug, domain] of orgs) {
  try {
    const r = await fetch(`https://icon.horse/icon/${domain}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = (r.headers.get('content-type') || '').includes('png') ? 'png' : 'img';
    fs.writeFileSync(`${LOGOS_OUT}/${slug}.${ext}`, buf);
    console.log(`logo ${slug}: ${buf.length} bytes (${ext})`);
  } catch (e) { console.log(`logo ERR ${slug}: ${e.message}`); }
}
