// Builds a playlist of free Philippine streams from iptv-org's public list and checks each manifest.
// Usage: node build.mjs [outDir]
import fs from 'node:fs';
import path from 'node:path';

const outDir = process.argv[2] || 'dist';
const SRC = 'https://iptv-org.github.io/iptv/countries/ph.m3u';
const EPG = process.env.EPG_URL || 'https://tr3nching.github.io/ph-epg/epg.xml.gz';
const txt = await (await fetch(SRC, { signal: AbortSignal.timeout(60000) })).text();
const lines = txt.split('\n').map(l => l.trim());

const out = [`#EXTM3U x-tvg-url="${EPG}"`], rep = [];
let ok = 0;
for (let i = 0; i < lines.length; i++) {
  if (!lines[i].startsWith('#EXTINF')) continue;
  const name = lines[i].split(',').pop();
  let j = i + 1; const extra = [];
  while (j < lines.length && lines[j].startsWith('#')) extra.push(lines[j++]);
  const url = lines[j];
  let status;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const t = r.ok ? (await r.text()).slice(0, 200) : '';
    status = r.ok && t.includes('#EXTM3U') ? 'OK' : `HTTP ${r.status}`;
  } catch (e) { status = 'ERR ' + (e.cause?.code || e.message); }
  rep.push(`${status.padEnd(14)} ${name}`);
  if (status === 'OK') { out.push(lines[i], ...extra, url); ok++; }
}
if (ok < 5) { console.error(`only ${ok} streams alive; refusing to publish`); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'free.m3u'), out.join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'report.txt'), `generated ${new Date().toISOString()}\n${ok}/${rep.length} alive\n\n${rep.join('\n')}\n`);
fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html><meta charset="utf-8"><title>PH Free TV</title><h1>PH Free TV</h1><ul><li><a href="free.m3u">free.m3u</a></li><li><a href="report.txt">report.txt</a></li></ul>`);
console.log(`${ok}/${rep.length} alive -> ${outDir}`);
