/**
 * Development server
 * 
 * Serves the map files with proper CORS headers and Range request support.
 * 
 * Usage: npm run serve
 */

import { createServer } from "http";
import { readFileSync, statSync, createReadStream, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 8080;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pbf": "application/x-protobuf",
  ".pmtiles": "application/x-pmtiles",
};

const server = createServer((req, res) => {
  let filePath = join(__dirname, req.url === "/" ? "/preview.html" : req.url.split("?")[0]);

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const stat = statSync(filePath);
  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.setHeader("Content-Type", mimeType);

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle Range requests (for PMTiles)
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
    });

    createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Length": stat.size });
    createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n🌍 Development server running at http://localhost:${PORT}`);
  console.log(`\n   Preview: http://localhost:${PORT}/preview.html\n`);
});
