/**
 * Warm Cloudflare edge cache for low-zoom world tiles (z0-z3)
 *
 * Reads tile templates from style.json (world_low + world_labels),
 * generates 85 z0-z3 coordinates, and fetches all 170 URLs with
 * a concurrency limit of 10.
 *
 * Run:              npm run warm:cache
 * Dry run (no fetch): npm run warm:cache -- --dry-run
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

const style = JSON.parse(readFileSync(join(__dirname, "..", "style.json"), "utf8"));

const templates = [
  style.sources?.world_low?.tiles?.[0],
  style.sources?.world_labels?.tiles?.[0],
].filter(Boolean);

if (!templates.length) {
  console.error("No tile templates found in style.json for world_low or world_labels.");
  process.exit(1);
}

// Generate z0-z3 coordinates (85 total)
const coords = [];
for (let z = 0; z <= 3; z++) {
  const max = 1 << z;
  for (let x = 0; x < max; x++) {
    for (let y = 0; y < max; y++) {
      coords.push([z, x, y]);
    }
  }
}

const urls = [];
for (const tpl of templates) {
  for (const [z, x, y] of coords) {
    urls.push(tpl.replace("{z}", z).replace("{x}", x).replace("{y}", y));
  }
}

console.log(`Warming ${urls.length} tiles (${templates.length} sources × ${coords.length} coords)${dryRun ? " [DRY RUN]" : ""}...`);

if (dryRun) {
  for (const url of urls) console.log(url);
  console.log(`\nDry run complete — ${urls.length} URLs printed, no requests made.`);
  process.exit(0);
}

const CONCURRENCY = 10;
let done = 0;
let ok = 0;
let err = 0;
const start = Date.now();

async function fetchOne(url) {
  try {
    const res = await fetch(url);
    if (res.ok) ok++; else err++;
  } catch {
    err++;
  }
  done++;
  if (done % 10 === 0 || done === urls.length) {
    process.stdout.write(`\r  [${done}/${urls.length}] ok=${ok} fail=${err}`);
  }
}

// Process in batches of CONCURRENCY
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  await Promise.all(urls.slice(i, i + CONCURRENCY).map(fetchOne));
}

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\n\nDone in ${elapsed}s — ${ok} success, ${err} failed (${urls.length} total).`);
if (err > 0) process.exit(1);
