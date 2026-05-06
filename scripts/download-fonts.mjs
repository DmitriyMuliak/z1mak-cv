import { createWriteStream, mkdirSync } from 'fs';
import { get } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, '../public/fonts');
mkdirSync(fontsDir, { recursive: true });

// Firefox 27 — Google returns standard WOFF covering all requested subsets in one file
const WOFF_UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'User-Agent': WOFF_UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        fetchText(res.headers.location).then(resolve, reject);
        return;
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u) =>
      get(u, { headers: { 'User-Agent': WOFF_UA } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', reject);
      }).on('error', reject);
    follow(url);
  });
}

function extractSrc(css) {
  const m = css.match(/src:\s*url\(([^)]+)\)/);
  return m ? m[1] : null;
}

const fonts = [
  {
    css: 'https://fonts.googleapis.com/css?family=Roboto:400&subset=cyrillic,latin',
    dest: 'Roboto-Regular.woff',
    label: 'Roboto Regular',
  },
  {
    css: 'https://fonts.googleapis.com/css?family=Roboto:700&subset=cyrillic,latin',
    dest: 'Roboto-Bold.woff',
    label: 'Roboto Bold',
  },
  {
    css: 'https://fonts.googleapis.com/css?family=PT+Serif:400&subset=cyrillic,latin',
    dest: 'PTSerif-Regular.woff',
    label: 'PT Serif Regular',
  },
  {
    css: 'https://fonts.googleapis.com/css?family=PT+Serif:700&subset=cyrillic,latin',
    dest: 'PTSerif-Bold.woff',
    label: 'PT Serif Bold',
  },
];

for (const { css, dest, label } of fonts) {
  process.stdout.write(`Downloading ${label}…`);
  const cssText = await fetchText(css);
  const src = extractSrc(cssText);
  if (!src) {
    console.error('\nNo src in:\n', cssText.slice(0, 300));
    process.exit(1);
  }
  await downloadFile(src, join(fontsDir, dest));
  console.log(' done');
}

console.log('All WOFF fonts saved to public/fonts/');
