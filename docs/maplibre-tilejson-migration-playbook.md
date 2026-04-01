# MapLibre + PMTiles → TileJSON migration playbook

Use this document in **other Cursor projects** by pasting the relevant **phase** into chat, or by working through phases **in order**. Each phase is sized so you can complete and verify it before moving on.

**Prerequisites:** MapLibre GL JS, vector (and optional raster) sources, a style built from TypeScript/JSON, and tiles served via a Worker or CDN.

---

## Phase 0 — Inventory (read-only)

**Goal:** Know what must change before editing.

1. Search the repo for:
   - `pmtiles://`
   - `pmtiles/`
   - `.pmtiles`
   - `data.example.com` (or your old static host)
   - `glyphs`, `sprite`, `maplibre-gl-starfield`
2. List **every** TileJSON URL your style loads (basemap, labels, places, POI overlay, etc.).
3. Note whether **glyphs** and **sprites** are loaded from the same host as **tiles** (often they should not be — see Phase 4).

**Stop when:** You have a short list of files and URLs to touch.

---

## Phase 1 — TileJSON URL shape (data tiles)

**Rule** (Worker serves TileJSON; archives live in R2 or similar):

```text
# Before
url: 'pmtiles://https://data.example.com/pmtiles/some-file.pmtiles'

# After
url: 'https://data.example.com/some-file.json'
```

- Remove the `pmtiles://` prefix.
- Remove the `/pmtiles/` path segment.
- Replace `.pmtiles` with `.json`.
- Keep the **hostname** if it is unchanged.
- Do **not** change the source **`type`** (`vector`, `raster`, `raster-dem`, etc.) unless your Worker contract requires it.

**Apply in:** all `.ts`, `.js`, and generated `style.json` sources of truth (prefer editing TS and rebuilding the style).

**Verify:** `grep -r "pmtiles://" .` returns nothing (except comments/docs if you allow them).

---

## Phase 2 — Environment-aware style build

**Goal:** One build script can point **data TileJSON** and **static assets** (glyphs/sprites) at different bases.

1. Centralize URLs in a small `resolveStyleConfig()` (or equivalent) using env vars, for example:
   - `DATA_CDN` — TileJSON + tile requests (default `https://data.example.com`).
   - `ASSETS_BASE_URL` — glyphs + sprites + optional scripts (default `https://assets.example.com`).
   - `GLYPHS_CDN` / `SPRITE_CDN` — optional overrides for local dev.
2. Wire `npm run build:styles` to run that resolver and emit `style.json`.

**Verify:** `npm run build:styles` completes; open `style.json` and confirm `sources.*.url` use `DATA_CDN` (or your data host).

---

## Phase 3 — Static JSON and attributes on the assets host

**Goal:** Small JSON indexes (search, manifests, census attributes) move off the **data** host if you split traffic or fix CORS.

1. Update constants for:
   - place search index
   - ACS / attributes manifest
   - any `ATTRS_BASE` URLs
2. Prefer **`https://assets.example.com/...`** for these when they are static files with long cache.

**Verify:** App loads search and attributes without 404; no unnecessary CORS errors for `fetch` to assets.

---

## Phase 4 — Glyphs and sprites (labels + icons/shields)

**Why:** Browsers fetch glyph PBFs and sprite PNG/JSON; **CORS** must allow your app origin. Often **`assets`** is configured for CORS while **`data`** is not.

1. Set style **`glyphs`** to `https://assets.example.com/.../{fontstack}/{range}.pbf` (or local path).
2. Set style **`sprite`** to `https://assets.example.com/.../basemap` (no `@2x` in the URL — MapLibre adds the suffix).
3. **Production:** deploy sprite files to the CDN:
   - `basemap.png`, `basemap.json`
   - `basemap@2x.png`, `basemap@2x.json` (if you use retina)
4. **Local dev:** add a script that builds styles with sprites from the dev server, e.g.  
   `SPRITE_CDN=http://localhost:8080 npm run build:styles`  
   and ensure the dev server serves the sprite files at the path your style expects.

**Verify:** Network tab shows **200** for sprite JSON/PNG and glyph PBFs; no `Access-Control-Allow-Origin` errors.

---

## Phase 5 — TileJSON truth vs style `source-layer` names

**Goal:** Eliminate `Source layer "..." does not exist on source "..."` errors.

1. Add a small script (or one-off `curl`) that **GETs each TileJSON** from `DATA_CDN` and prints **`vector_layers`** (names + `fields`).
2. For **each** style layer, ensure `source-layer` matches a **vector layer** in that source's TileJSON.
3. Common fixes (apply only what matches your data):
   - **Places low-zoom:** if metadata says `places_points`, use that — not `places` or `points`.
   - **POI `poi` layer:** only on sources that actually include it (often `us_*` + dedicated `poi_*` extracts). Do **not** reference `poi` on `world_low` / `world_mid` if those TileJSONs omit it.
   - **POI `place` layer on `place` airports/stadiums:** only use sources that have a **`place`** layer (e.g. `us_high`, `world_mid`, `world_low`) — **not** a dedicated `poi_*` source if it has no `place` layer.
   - **`water_name` / `water_name_ocean`:** if your US TileJSON only has `water_name`, use `water_name` only; drop or merge layers that reference `water_name_ocean` if missing.
4. Set **`us_high`** (or your US vector source) **`minzoom`** to `0` in the style source definition when the archive is `us_z0-15.json` so low-zoom tiles can load (TileJSON may omit `minzoom`).

**Note:** Switching from `pmtiles://` to TileJSON makes MapLibre stricter about source-layer validation. Layers that were silently ignored before will now throw console errors. This is expected — the data was always missing, it just wasn't reported.

**Verify:** Load the map at z0–10; console should not show source-layer validation errors for your sources.

---

## Phase 6 — Optional: hillshade / raster-dem

If `raster-dem` TileJSON or tiles return **404** or **dem dimension mismatch**, either:

- **Deploy** the correct hillshade TileJSON + tiles, or  
- **Disable** hillshade in theme until the CDN is ready, then rebuild styles.

---

## Phase 7 — Starfield / third-party scripts

If you load a starfield script as a **classic** script and your app code is **ES modules**, the class may not be on `globalThis`.

**Options:**

1. Vendor the script and append:  
   `globalThis.MapLibreStarryBackground = MapLibreStarryBackground;`  
   (or equivalent) when the class exists.
2. In map init, guard: `typeof globalThis.MapLibreStarryBackground === "function"` before constructing.

---

## Phase 8 — Inline TileJSON at build time

**Goal:** Eliminate runtime TileJSON network requests so MapLibre starts loading tiles immediately on init.

**Why this matters:** By default MapLibre fetches each source's TileJSON URL at runtime before it can request any tiles. With 8+ sources this means 8 network round trips (~200ms each) on every page load before a single tile loads. Inlining removes this delay entirely.

**What changes:** In your build script (e.g. `scripts/build-styles.ts`), add a step after style creation that fetches each source URL, copies the TileJSON fields onto the source object, and deletes the `url` property:

```typescript
const TILEJSON_FIELDS = [
  "tiles", "vector_layers", "minzoom", "maxzoom",
  "attribution", "bounds", "center", "fillzoom", "scheme", "tilejson",
];

async function inlineTileJsonSources(style: Record<string, any>): Promise<void> {
  const sources = style.sources as Record<string, any>;
  for (const [name, source] of Object.entries(sources)) {
    if (typeof source.url !== "string") continue;
    const url = source.url;
    console.log(`  ↓ Inlining TileJSON for source "${name}": ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`TileJSON fetch failed for source "${name}" (${url}): HTTP ${res.status}`);
    }
    const tileJson = await res.json() as Record<string, unknown>;
    for (const field of TILEJSON_FIELDS) {
      if (field in tileJson) source[field] = tileJson[field];
    }
    delete source.url;
  }
}
```

Call immediately after `createStyle(config)` and before writing output. Ensure `buildStyle()` is declared `async`.

**Key notes:**
- `sprite` and `glyphs` are top-level style properties, not sources — they are unaffected
- Hard failure on non-200 prevents silently writing a broken style
- `style.json` will be ~50-80KB larger but is browser-cached after first load
- Re-run `build:styles` any time you update a PMTiles archive so inlined `vector_layers` stay accurate
- `build:styles:local` picks up the change automatically if it uses the same data URLs

**Verify:** `npm run build:styles` completes with one log line per source. Open `style.json` — no `url` properties should remain on any source. Load the map and confirm zero `*.json` TileJSON requests in the Network tab.

---

## Phase 9 — Low-zoom tile prefetch

**Goal:** Warm the Cloudflare edge cache for world-view tiles (z0–z3) immediately after map load so zoom-outs to world view feel instant on subsequent loads.

**Why this matters:** World-view tiles are a small fixed set (85 coordinates across z0–z3) but cover the entire planet. On a cold cache they all miss simultaneously when a user zooms out, causing visible one-by-one tile appearance. Prefetching them with `priority: 'low'` warms the cache using idle bandwidth without competing with visible tile requests.

**What changes:** Add a function to `map.js` that reads tile templates directly from the loaded style (works automatically with Phase 8 inlined TileJSON) and fires fire-and-forget fetch requests:

```js
function prefetchLowZoomTiles() {
  try {
    const style = map.getStyle();
    const templates = [
      style?.sources?.['world_low']?.tiles?.[0],
      style?.sources?.['world_labels']?.tiles?.[0],
    ].filter(Boolean);
    if (!templates.length) return;

    const coords = [];
    for (let z = 0; z <= 3; z++) {
      const max = 1 << z;
      for (let x = 0; x < max; x++) {
        for (let y = 0; y < max; y++) {
          coords.push([z, x, y]);
        }
      }
    }

    for (const tpl of templates) {
      for (const [z, x, y] of coords) {
        const url = tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y);
        fetch(url, { priority: 'low' }).catch(() => {});
      }
    }
  } catch {
    // never affect map functionality
  }
}

map.once('load', prefetchLowZoomTiles);
```

**Key notes:**
- `map.once` ensures it fires exactly once — not on subsequent style reloads
- 85 coords × 2 sources = 170 requests, all `priority: 'low'`
- Benefits the **next** load and **other users** — the current cold-cache session still warms tiles
- Source key names must match your actual style source IDs
- For guaranteed fast first loads for all users, pair with a warm cache script (see Phase 10)
- Remaining slow appearance on cold first load is MapLibre's rendering pipeline cost (decode → style → WebGL geometry → GPU upload), not a network issue

**Verify:** Network tab shows ~170 low-priority tile requests firing after the map `load` event. Reload the page and zoom to world view — should be noticeably faster than the first cold load.

---

## Phase 10 — Dev ergonomics, verification commands, and warm cache

Suggested `package.json` scripts:

| Script | Purpose |
|--------|---------|
| `build:styles` | Production-style URLs (data + assets defaults). Fetches and inlines TileJSON. |
| `build:styles:local` | Same as above but `SPRITE_CDN=http://localhost:PORT` for sprites/glyphs. |
| `verify:tilejson` | Fetch each TileJSON from `DATA_CDN` and print status + `vector_layers`. |
| `warm:cache` | Pre-request all low-zoom world tiles to warm the Cloudflare edge cache. |

**Typical dev flow:** `build:utils` (if any) → `build:styles:local` → `serve`.

**Data push workflow:**
1. Upload new `.pmtiles` files to R2
2. Run `npm run build:styles` to refresh inlined TileJSON
3. Purge Everything in Cloudflare (dashboard or API)
4. Run `npm run warm:cache` to pre-warm low-zoom tiles before users arrive

### warm:cache script outline (`scripts/warm-cache.mjs`)

```js
// Read style.json, extract tiles arrays from world sources
// Generate z0-z3 coordinates (85 total)
// Fetch all URLs with concurrency limit of 10
// Log progress [n/170] and summary (success/fail/time)
// Support --dry-run flag to print URLs without fetching
```

---

## Phase 11 — Final checklist before calling it done

- [ ] No `pmtiles://` URLs in source definitions.
- [ ] `style.json` glyphs/sprites point at a host with **CORS** for your origins.
- [ ] Sprites return **200** (local or CDN); icons and road shields render.
- [ ] No invalid `source-layer` names vs TileJSON `vector_layers`.
- [ ] `us_high` (or equivalent) `minzoom` matches the archive (often `0` for `us_z0-15`).
- [ ] POI layers: `poi` only on sources that have it; `place` only on sources that have it.
- [ ] `style.json` sources have no `url` properties — all replaced with inlined `tiles` arrays.
- [ ] Zero TileJSON `*.json` requests in Network tab on map load.
- [ ] ~170 low-priority prefetch requests visible in Network tab after map load event.
- [ ] Second zoom-out to world view noticeably faster than first cold load.
- [ ] `npm run build:styles` run after TS changes so `style.json` stays in sync.
- [ ] `npm run warm:cache` added to data push workflow after cache purge.

---

## Cursor prompt template (copy-paste)

Use this in **another** Cursor project when you want the assistant to execute the migration in order:

```text
Follow docs/maplibre-tilejson-migration-playbook.md in this repo (or paste the playbook content).
Work through Phase 0 through Phase 11 in order. After each phase, summarize files changed and how to verify.
Do not skip verification steps. Match existing code style and keep changes minimal per phase.
```

If the playbook file is not in that repo yet, paste the full markdown into the chat and add:  
`Treat the pasted markdown as the playbook and follow its phases in order.`

---

## Related docs in this repository

- [places-layer.md](./places-layer.md) — places layer and search notes.
- [pmtiles-cloudflare-fix.md](./pmtiles-cloudflare-fix.md) — Worker / TileJSON behavior.
- [building.md](./building.md) and [deploying.md](./deploying.md) — build env vars and CSP.
- [pmtiles-cloudflare-worker-guide.md](./pmtiles-cloudflare-worker-guide.md) — full step-by-step setup guide.
