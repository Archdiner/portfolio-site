/* eslint-env node */
// Fetch a spread of public-domain naturalist line-art candidates from Wikimedia Commons.
import fs from 'node:fs';
const OUT = '/private/tmp/claude-501/-Users-asadr-Desktop-personalProjects/77e2b72e-2a24-4a8c-9558-98fddddc1007/scratchpad/refs/specimens';
fs.mkdirSync(OUT, { recursive: true });

const queries = [
  ['nautilus shell engraving antique', 'nautilus'],
  ['ammonite fossil engraving', 'ammonite'],
  ['fern frond botanical engraving black white', 'fern'],
  ['moth lepidoptera engraving antique', 'moth'],
  ['beetle insect engraving antique line', 'beetle'],
  ['Haeckel Medusae', 'medusa'],
  ['diatom engraving microscope', 'diatom'],
  ['starfish echinoderm engraving antique', 'starfish'],
  ['botanical leaf engraving line drawing', 'leaf'],
  ['seahorse engraving antique', 'seahorse'],
  ['dragonfly engraving antique', 'dragonfly'],
  ['Haeckel Discomedusae single', 'medusa2'],
];

async function commonsThumb(term) {
  const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', generator: 'search',
    gsrsearch: term, gsrnamespace: '6', gsrlimit: '6',
    prop: 'imageinfo', iiprop: 'url', iiurlwidth: '900',
  });
  const r = await fetch(api, { headers: { 'User-Agent': 'portfolio-art/1.0' } });
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    const u = ii?.thumburl || ii?.url;
    if (u && /\.(jpe?g|png)$/i.test(u.split('?')[0])) return u;
  }
  return null;
}

for (const [term, slug] of queries) {
  try {
    const url = await commonsThumb(term);
    if (!url) { console.log(`no image: ${slug}`); continue; }
    const img = await fetch(url, { headers: { 'User-Agent': 'portfolio-art/1.0' } });
    const buf = Buffer.from(await img.arrayBuffer());
    fs.writeFileSync(`${OUT}/${slug}.jpg`, buf);
    console.log(`saved ${slug} (${buf.length} bytes)`);
  } catch (e) { console.log(`ERR ${slug}: ${e.message}`); }
}
