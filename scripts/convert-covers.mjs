/* eslint-env node */
import Jimp from 'jimp';

const OUT = '/Users/asadr/Desktop/personalProjects/portfolio-site/public/books';
const T = '/var/folders/0w/qgkpxwmj6n73xlhhsrp1h0nm0000gn/T';

const jobs = [
  [`${T}/clipboard-2026-07-11-041701-2C43C89A.png`, 'kafka-shore'],
  [`${T}/clipboard-2026-07-11-041846-220576EF.png`, 'secret-history'],
  [`${T}/clipboard-2026-07-11-041946-6688E4B3.png`, 'kite-runner'],
  [`${T}/clipboard-2026-07-11-042052-D93FB311.png`, 'down-and-out'],
];

for (const [src, slug] of jobs) {
  const img = await Jimp.read(src);
  img.resize(800, Jimp.AUTO).quality(88);
  await img.writeAsync(`${OUT}/${slug}.jpg`);
  console.log(`${slug}: ${img.bitmap.width}x${img.bitmap.height}`);
}
