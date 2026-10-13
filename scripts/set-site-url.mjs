#!/usr/bin/env node
/* =========================================================
   scripts/set-site-url.mjs
   One-command replacement of the site-URL placeholder.

   Usage:
     node scripts/set-site-url.mjs https://your-domain.com     # apply
     node scripts/set-site-url.mjs https://your-domain.com --dry-run
     node scripts/set-site-url.mjs --check                     # fail if placeholder remains

   Touches every .html/.xml/.txt file and config/site.js (generated pages
   included — afterwards `node scripts/build.mjs --check` still passes
   because the build reads siteUrl from config/site.js). Optional developer tool: the site itself needs no Node,
   no build step and no npm packages.
   ========================================================= */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN = "https://SITE_URL_PLACEHOLDER";

function targets() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      if (e.name === ".git" || e.name === "node_modules" || e.name === "scripts") continue;
      const rel = dir ? path.posix.join(dir, e.name) : e.name;
      if (e.isDirectory()) walk(rel);
      else if (/\.(html|xml|txt)$/.test(rel) || rel === "config/site.js") out.push(rel);
    }
  })("");
  return out;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const dry = args.includes("--dry-run");
const url = args.find((a) => !a.startsWith("--"));

if (check) {
  const left = targets().filter((f) => fs.readFileSync(path.join(ROOT, f), "utf8").includes(TOKEN));
  if (left.length) {
    console.error("Placeholder still present in:\n  " + left.join("\n  "));
    process.exit(1);
  }
  console.log("OK — no site-URL placeholder left.");
  process.exit(0);
}

let parsed;
try {
  parsed = new URL(url || "");
} catch (e) {
  console.error("Usage: node scripts/set-site-url.mjs https://your-domain.com [--dry-run]");
  process.exit(2);
}
if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash) {
  console.error("Give an https origin only, with no path, e.g. https://wishora.example");
  process.exit(2);
}
const origin = parsed.origin;

let changed = 0;
for (const f of targets()) {
  const p = path.join(ROOT, f);
  const before = fs.readFileSync(p, "utf8");
  if (!before.includes(TOKEN)) continue;
  const n = before.split(TOKEN).length - 1;
  if (!dry) fs.writeFileSync(p, before.split(TOKEN).join(origin));
  console.log(`${dry ? "[dry-run] " : ""}${f}: ${n} replacement(s)`);
  changed++;
}
console.log(changed ? `Done (${origin}).` : "Nothing to replace (placeholder already set?).");
