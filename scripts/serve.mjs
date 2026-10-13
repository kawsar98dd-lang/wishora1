#!/usr/bin/env node
/* =========================================================
   scripts/serve.mjs — local static server that behaves like Cloudflare Pages.
   Optional dev tool (zero dependencies).

     node scripts/serve.mjs [port]        default 8000

   Emulates: clean URLs (/x → x.html, /dir/ → dir/index.html),
   308 redirects from /x.html and /dir/index.html to the clean form,
   case-sensitive paths, HTTP Range (audio seeking), and 404.html with a
   real 404 status for unknown URLs.
   ========================================================= */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2]) || 8000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".ico": "image/x-icon"
};

function send(res, code, body, type, extra = {}) {
  res.writeHead(code, { "Content-Type": type, "Content-Length": Buffer.byteLength(body), ...extra });
  res.end(body);
}
const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, "Bad request", "text/plain"); }
  const qs = url.search;

  if (p.endsWith("/index.html")) return send(res, 308, "", "text/plain", { Location: p.slice(0, -10) + qs });
  if (p.endsWith(".html")) return send(res, 308, "", "text/plain", { Location: p.slice(0, -5) + qs });

  const rel = p.replace(/^\/+/, "");
  /* /dir → 308 /dir/ when dir/index.html exists (Cloudflare behaviour). */
  if (rel && !p.endsWith("/") && !isFile(path.join(ROOT, rel)) && !isFile(path.join(ROOT, rel + ".html")) && isFile(path.join(ROOT, rel, "index.html"))) {
    return send(res, 308, "", "text/plain", { Location: p + "/" + qs });
  }
  const candidates = p.endsWith("/") || rel === "" ? [path.join(rel, "index.html")] : [rel, rel + ".html"];
  for (const c of candidates) {
    const file = path.normalize(path.join(ROOT, c));
    if (!file.startsWith(ROOT) || !isFile(file)) continue;
    const data = fs.readFileSync(file);
    const type = TYPES[path.extname(file)] || "application/octet-stream";
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range) {
      const a = range[1] ? Number(range[1]) : 0;
      const b = range[2] ? Number(range[2]) : data.length - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${a}-${b}/${data.length}`, "Accept-Ranges": "bytes", "Content-Length": b - a + 1 });
      return res.end(data.subarray(a, b + 1));
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": data.length, "Accept-Ranges": "bytes" });
    return res.end(data);
  }
  const nf = path.join(ROOT, "404.html");
  send(res, 404, isFile(nf) ? fs.readFileSync(nf, "utf8") : "Not found", "text/html; charset=utf-8");
}).listen(PORT, () => console.log(`Wishora (Cloudflare-like) on http://localhost:${PORT}`));
