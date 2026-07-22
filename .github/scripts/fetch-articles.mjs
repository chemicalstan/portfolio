// Fetches the Medium RSS feed and writes articles.json at the repo root.
// Zero dependencies; requires Node 18+ (built-in fetch).
import { writeFileSync } from 'node:fs';

const FEED_URL = 'https://medium.com/feed/@chemicalstan15';
const OUT_FILE = 'articles.json';
const MAX_ARTICLES = 6;

function textBetween(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!res.ok) {
  console.error(`Feed fetch failed: HTTP ${res.status}`);
  process.exit(1);
}
const xml = await res.text();

const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
const articles = items.map((item) => {
  const excerptSource =
    textBetween(item, 'description') || textBetween(item, 'content:encoded');
  const excerpt = stripHtml(excerptSource).slice(0, 140);
  return {
    title: stripHtml(textBetween(item, 'title')),
    link: textBetween(item, 'link').split('?')[0],
    pubDate: new Date(textBetween(item, 'pubDate')).toISOString(),
    excerpt,
  };
})
  .filter((a) => a.title && a.link)
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ARTICLES);

if (!articles.length) {
  console.error('Parsed zero articles; leaving existing articles.json untouched.');
  process.exit(1);
}

writeFileSync(
  OUT_FILE,
  JSON.stringify({ updatedAt: new Date().toISOString(), articles }, null, 2) + '\n'
);
console.log(`Wrote ${articles.length} articles to ${OUT_FILE}`);
