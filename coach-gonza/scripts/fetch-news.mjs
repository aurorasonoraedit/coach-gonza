// Busca noticias de boxeo en castellano (Google Noticias) y las guarda en public/news.json.
// Corre en el servidor (GitHub Actions), así el teléfono no tiene problemas de permisos (CORS).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FEEDS = [
  { tag: 'argentina', q: 'boxeo argentino' },
  { tag: 'argentina', q: 'boxeo Argentina campeón OR pelea OR velada' },
  { tag: 'mundo', q: 'boxeo' },
  { tag: 'mundo', q: 'boxeo título mundial' },
];

const feedUrl = q =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:14d')}&hl=es-419&gl=AR&ceid=AR:es-419`;

const decode = s =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
   .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
   .trim();

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : '';
};

export function parseRss(xml, tag) {
  return xml.split(/<item>/).slice(1).map(block => {
    const source = pick(block, 'source');
    let title = pick(block, 'title');
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
    const date = new Date(pick(block, 'pubDate'));
    return {
      title,
      source,
      link: pick(block, 'link'),
      date: isNaN(date) ? null : date.toISOString(),
      tag
    };
  }).filter(i => i.title && i.link && i.date);
}

const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').slice(0, 70);

export function mergeItems(lists, max = 80) {
  const seen = new Map();
  for (const item of lists.flat()) {
    const key = norm(item.title);
    const prev = seen.get(key);
    if (!prev) seen.set(key, item);
    else if (item.tag === 'argentina') prev.tag = 'argentina';
  }
  return [...seen.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max);
}

async function main() {
  const lists = [];
  for (const f of FEEDS) {
    try {
      const res = await fetch(feedUrl(f.q), { headers: { 'User-Agent': 'Mozilla/5.0 BoxCoach' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      lists.push(parseRss(await res.text(), f.tag));
    } catch (e) {
      console.warn('No se pudo leer', f.q, e.message);
    }
  }
  const items = mergeItems(lists);
  if (!items.length) {
    console.warn('Sin noticias nuevas: se mantiene el archivo anterior (si existe).');
    process.exit(0);
  }
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'news.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify({ updatedAt: new Date().toISOString(), items }));
  console.log(`news.json: ${items.length} noticias`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
