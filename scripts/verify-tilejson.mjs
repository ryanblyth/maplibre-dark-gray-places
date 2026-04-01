/**
 * Verify TileJSON endpoints
 *
 * Fetches each source URL from style.json and prints HTTP status + vector_layers.
 * Run: npm run verify:tilejson
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stylePath = join(__dirname, "..", "style.json");

const style = JSON.parse(readFileSync(stylePath, "utf8"));
const sources = style.sources;

const DATA_CDN = process.env.DATA_CDN ?? "https://data.storypath.studio";

// Reconstruct TileJSON URLs from inlined tile templates (strip /{z}/{x}/{y}.ext)
const sourceUrls = Object.entries(sources).map(([name, source]) => {
  if (typeof source.url === "string") {
    return [name, source.url];
  }
  const tile = source.tiles?.[0];
  if (tile) {
    const url = tile.replace(/\/\{z\}\/\{x\}\/\{y\}\.[a-z]+$/, ".json");
    return [name, url];
  }
  return [name, null];
});

let passed = 0;
let failed = 0;

for (const [name, url] of sourceUrls) {
  if (!url) {
    console.log(`[${name}] SKIP — no url or tiles`);
    continue;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[${name}] HTTP ${res.status} FAIL  ${url}`);
      failed++;
      continue;
    }
    const tj = await res.json();
    const layers = tj.vector_layers?.map((l) => l.id).join(", ") ?? "(raster-dem or none)";
    console.log(`[${name}] HTTP ${res.status} OK  minzoom=${tj.minzoom} maxzoom=${tj.maxzoom}`);
    console.log(`  vector_layers: ${layers}`);
    passed++;
  } catch (e) {
    console.error(`[${name}] ERROR ${e.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
