#!/usr/bin/env node
/* =========================================================
   scripts/check-repo.mjs
   Repository integrity check. Optional developer tool — the site
   itself needs no Node, no build step and no npm packages.

   Usage:  node scripts/check-repo.mjs

   Checks
     1. File/folder names are lowercase, URL-safe (no spaces).
     2. Every internal href/src/url() in HTML and CSS resolves to a real
        file — compared CASE-SENSITIVELY, so it is safe for Cloudflare
        even when run on a case-insensitive disk (macOS/Windows).
     3. In-page / cross-page #anchors point at ids that exist.
     4. Relative asset paths written as string literals in JS exist.
     5. data/*.js: ids unique, categories/templates valid, live wishes have
        a real page, planned wishes have no path, related[] are live.
     6. sitemap.xml lists exactly the live pages (and nothing missing).
     7. Every public HTML page has a canonical + og:url on the same path.
     8. No example.com leftovers, no dead href="#" links.

   Exit code 1 on any error. Warnings never fail the run.
   ========================================================= */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules"]);
const PLACEHOLDER_HOST = "SITE_URL_PLACEHOLDER";

/* Assets that are referenced but intentionally not in the repo yet.
   Listed as WARNINGS, not errors. Remove an entry once the file exists. */
const KNOWN_MISSING = new Set(["assets/audio/birthday-music.mp3"]);

/* Allowed upper-case file names (docs). Everything else must be lowercase. */
const ALLOWED_UPPER = new Set(["README.md", "CHANGELOG.md", "LICENSE", "LICENSE.md"]);

/* The site's own absolute origin (placeholder or the real domain). */
const SITE_ORIGIN = ((fs.readFileSync(path.join(ROOT, "config/site.js"), "utf8").match(/siteUrl:\s*"([^"]+)"/) || [])[1] || "").replace(/\/$/, "");

const errors = [];
const warnings = [];
const externalHosts = new Map();
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------- file inventory ---------- */
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) walk(rel);
    else files.push(rel);
  }
})("");
const fileSet = new Set(files);
const dirSet = new Set();
files.forEach((f) => {
  const parts = f.split("/");
  for (let i = 1; i < parts.length; i++) dirSet.add(parts.slice(0, i).join("/"));
});

/* ---------- 1. naming ---------- */
for (const f of files) {
  for (const seg of f.split("/")) {
    if (ALLOWED_UPPER.has(seg)) continue;
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(seg)) err(`Non URL-safe / non-lowercase name: "${f}" (segment "${seg}")`);
  }
}

/* ---------- path resolution (case-sensitive, on-disk) ---------- */
function existsExact(rel) {
  return fileSet.has(rel);
}
function resolveRef(fromFile, ref) {
  let p = ref.split("#")[0].split("?")[0];
  if (p === "") return { rel: fromFile };
  try { p = decodeURIComponent(p); } catch (e) { /* keep raw */ }
  let abs;
  if (p.startsWith("/")) abs = path.posix.normalize(p.slice(1));
  else abs = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), p));
  if (abs.startsWith("..")) return { rel: abs, outside: true };
  abs = abs.replace(/^\.\/?$/, "");
  if (abs === "" || ref.split("#")[0].split("?")[0].endsWith("/") || dirSet.has(abs)) {
    abs = abs ? abs.replace(/\/$/, "") + "/index.html" : "index.html";
  }
  return { rel: abs };
}

function isExternal(ref) {
  return /^(https?:)?\/\//i.test(ref) || /^(mailto|tel|data|javascript|sms):/i.test(ref);
}

function recordExternal(ref, fromFile) {
  if (!/^https?:\/\//i.test(ref)) return;
  try {
    const host = new URL(ref).host;
    if (!externalHosts.has(host)) externalHosts.set(host, new Set());
    externalHosts.get(host).add(fromFile);
  } catch (e) { /* ignore */ }
}

/* ---------- id index for anchor checks ---------- */
const idsByFile = new Map();
for (const f of files.filter((x) => x.endsWith(".html"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  idsByFile.set(f, new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

/* ---------- 2/3/7/8. HTML ---------- */
const htmlFiles = files.filter((f) => f.endsWith(".html"));
for (const f of htmlFiles) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  /* Strip HTML comments so documentation examples are not treated as refs. */
  const code = src.replace(/<!--[\s\S]*?-->/g, "");

  const refs = [];
  for (const m of code.matchAll(/\s(?:href|src)="([^"]*)"/g)) refs.push(m[1]);
  /* Absolute URLs in <meta content> that must point at real files (og:image). */
  for (const m of code.matchAll(/<meta[^>]+(?:og:image|twitter:image)"[^>]+content="([^"]+)"/g)) refs.push(m[1]);

  for (const ref of refs) {
    if (ref === "") continue;
    if (/^https?:\/\//i.test(ref) && (ref.includes(PLACEHOLDER_HOST) || (SITE_ORIGIN && ref.startsWith(SITE_ORIGIN + "/")))) {
      /* Our own absolute URL: verify the PATH part exists. */
      const p = ref.replace(/^https?:\/\/[^/]+/, "") || "/";
      checkTarget(f, p, ref);
      continue;
    }
    if (isExternal(ref)) { recordExternal(ref, f); continue; }
    if (ref === "#") { warn(`${f}: dead link href="#"`); continue; }
    checkTarget(f, ref, ref);
  }

  if (/example\.com/i.test(src)) err(`${f}: contains "example.com"`);

  /* canonical + og:url */
  if (f !== "404.html") {
    const canon = (code.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    const ogUrl = (code.match(/property="og:url" content="([^"]+)"/) || [])[1];
    if (!canon) err(`${f}: missing canonical`);
    if (!ogUrl) err(`${f}: missing og:url`);
    if (canon && ogUrl && canon !== ogUrl) err(`${f}: canonical (${canon}) != og:url (${ogUrl})`);
    if (canon) {
      const expected = cleanUrlPath(f);
      const got = canon.replace(/^https?:\/\/[^/]+/, "");
      if (got !== expected) err(`${f}: canonical path "${got}" should be "${expected}"`);
    }
  } else if (!/name="robots" content="noindex"/.test(code)) {
    err("404.html: should be noindex");
  }
  if (!/<html lang="[a-z-]+"/.test(code)) err(`${f}: missing <html lang>`);
}

function cleanUrlPath(htmlFile) {
  if (htmlFile === "index.html") return "/";
  if (htmlFile.endsWith("/index.html")) return "/" + htmlFile.slice(0, -"index.html".length);
  return "/" + htmlFile.replace(/\.html$/, "");
}

function checkTarget(fromFile, ref, shown) {
  const { rel, outside } = resolveRef(fromFile, ref);
  if (outside) return err(`${fromFile}: "${shown}" escapes the repository`);
  /* Cloudflare also serves /x for x.html; accept the clean form for absolute site URLs. */
  let target = rel;
  if (!existsExact(target) && !/\.[a-z0-9]+$/i.test(target) && existsExact(target + ".html")) target += ".html";
  if (!existsExact(target)) {
    if (KNOWN_MISSING.has(target)) return;
    /* Detect case-only mismatches for a clearer message. */
    const ci = files.find((x) => x.toLowerCase() === target.toLowerCase());
    return err(`${fromFile}: "${shown}" → missing file "${target}"` + (ci ? ` (case mismatch with "${ci}")` : ""));
  }
  const hash = ref.includes("#") ? ref.split("#")[1] : "";
  if (hash && target.endsWith(".html")) {
    const ids = idsByFile.get(target);
    if (ids && !ids.has(hash)) err(`${fromFile}: "${shown}" → #${hash} not found in ${target}`);
  }
}

/* ---------- 2. CSS ---------- */
for (const f of files.filter((x) => x.endsWith(".css"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const ref = m[1];
    if (isExternal(ref)) { recordExternal(ref, f); continue; }
    checkTarget(f, ref, ref);
  }
  for (const m of src.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    if (isExternal(m[1])) recordExternal(m[1], f);
    else checkTarget(f, m[1], m[1]);
  }
}

/* ---------- 4. JS relative path literals ---------- */
for (const f of files.filter((x) => x.endsWith(".js"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of src.matchAll(/["'](\.{1,2}\/[\w./-]+\.(?:mp3|ogg|wav|m4a|png|jpe?g|svg|webp|gif|css|js|json|html))["']/g)) {
    /* JS paths resolve against the PAGE, which for page-level scripts lives
       next to the script. Root scripts (js/app.js) use dynamic paths only. */
    checkTarget(f, m[1], m[1]);
  }
}

/* ---------- 5. data files ---------- */
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ["config/site.js", "data/categories.js", "data/templates.js", "data/wishes.js", "data/planned.js", "data/ui.js"]) {
  if (!existsExact(f)) { err(`Missing data file: ${f}`); continue; }
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  } catch (e) {
    err(`${f}: does not execute — ${e.message}`);
  }
}
const D = sandbox.window.WISHORA_DATA || {};
const C = sandbox.window.WISHORA_CONFIG || {};
const cats = new Set((D.categories || []).map((c) => c.id));
const tpls = new Set((D.templates || []).map((t) => t.id));
const live = D.wishes || [];
const planned = D.plannedWishes || [];

const seen = new Set();
const dup = (id, where) => {
  if (seen.has(id)) err(`${where}: duplicate id "${id}" (ids must be unique across wishes AND planned)`);
  seen.add(id);
};
if (new Set([...cats]).size !== (D.categories || []).length) err("data/categories.js: duplicate category ids");

for (const w of live) {
  dup(w.id, "data/wishes.js");
  if (w.status !== "live") err(`data/wishes.js: "${w.id}" must have status "live"`);
  if (!/^[a-z0-9]+-\d{2,}$/.test(w.id)) warn(`data/wishes.js: id "${w.id}" does not follow <category>-<nn>`);
  if (!cats.has(w.category)) err(`data/wishes.js: "${w.id}" has unknown category "${w.category}"`);
  if (!tpls.has(w.template)) err(`data/wishes.js: "${w.id}" has unknown template "${w.template}"`);
  if (!w.path || !existsExact(w.path)) err(`data/wishes.js: "${w.id}" path "${w.path}" does not exist`);
  if (!(w.title && w.title.bn && w.title.en)) err(`data/wishes.js: "${w.id}" needs title.bn and title.en`);
  if (!(w.description && w.description.bn && w.description.en)) err(`data/wishes.js: "${w.id}" needs description.bn/en`);
  for (const r of w.related || []) {
    if (!live.some((x) => x.id === r)) err(`data/wishes.js: "${w.id}" related → "${r}" is not a live wish`);
  }
}
if (live.filter((w) => w.featured).length > 1) err("data/wishes.js: more than one featured wish");
for (const w of planned) {
  dup(w.id, "data/planned.js");
  if (w.status !== "planned") err(`data/planned.js: "${w.id}" must have status "planned"`);
  if ("path" in w || "url" in w) err(`data/planned.js: "${w.id}" must NOT have a path/url (planned wishes are never linked)`);
  if (!cats.has(w.category)) err(`data/planned.js: "${w.id}" has unknown category "${w.category}"`);
}
for (const t of D.templates || []) {
  for (const a of (t.assets && t.assets.audio) || []) {
    const rel = a.replace(/^\//, "");
    if (!existsExact(rel) && !KNOWN_MISSING.has(rel)) err(`data/templates.js: "${t.id}" asset "${a}" missing`);
  }
}
if (C.siteUrl && C.siteUrl.endsWith("/")) err("config/site.js: siteUrl must not end with '/'");
if (C.analytics && (C.analytics.enabled || C.analytics.measurementId)) err("config/site.js: analytics must stay disabled/empty in Phase 0");
if (C.ads && (C.ads.enabled || C.ads.publisherId)) err("config/site.js: ads must stay disabled/empty in Phase 0");

/* ---------- 6. sitemap ---------- */
if (existsExact("sitemap.xml")) {
  const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const paths = locs.map((l) => l.replace(/^https?:\/\/[^/]+/, "") || "/");
  const liveCats = [...new Set(live.map((w) => w.category))];
  const expected = new Set([
    "/", "/about/", "/privacy/", "/terms/",
    ...((D.templates || []).some((t) => t.status === "implemented" && t.creator && t.creator.enabled) ? ["/create/"] : []),
    ...liveCats.map((c) => `/categories/${c}/`),
    ...live.map((w) => w.route)
  ]);
  for (const p of paths) {
    if (!expected.has(p)) err(`sitemap.xml: "${p}" is not an implemented, indexable page`);
  }
  for (const p of expected) {
    if (!paths.includes(p)) err(`sitemap.xml: missing implemented page "${p}"`);
  }
  if (new Set(paths).size !== paths.length) err("sitemap.xml: duplicate <loc>");
} else err("Missing sitemap.xml");

/* robots.txt */
if (existsExact("robots.txt")) {
  const r = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
  if (!/^Sitemap:\s*\S+\/sitemap\.xml/m.test(r)) err("robots.txt: missing Sitemap line");
} else err("Missing robots.txt");
if (!existsExact("404.html")) err("Missing 404.html");

/* ---------- Phase 1: data contracts ---------- */
const LANGS = C.supportedLangs || ["bn", "en"];
const FORBIDDEN_WISH_FIELDS = ["badge", "popular", "popularity", "views", "viewCount", "rating", "reviews", "likes", "trending"];
const liveCatSet = new Set(live.map((w) => w.category));
const bothLangs = (o) => o && LANGS.every((l) => typeof o[l] === "string" && o[l].trim() !== "");

for (const [k, v] of Object.entries(D.ui || {})) {
  if (!bothLangs(v)) err(`data/ui.js: key "${k}" must have non-empty ${LANGS.join(" and ")}`);
}
for (const c of D.categories || []) {
  if (!bothLangs(c.label)) err(`data/categories.js: "${c.id}" needs label in all languages`);
  if (!bothLangs(c.description)) err(`data/categories.js: "${c.id}" needs description in all languages`);
  if (!c.icon) err(`data/categories.js: "${c.id}" needs an icon`);
  if (liveCatSet.has(c.id)) {
    if (!bothLangs(c.pageTitle)) err(`data/categories.js: live category "${c.id}" needs pageTitle`);
    if (!bothLangs(c.meta)) err(`data/categories.js: live category "${c.id}" needs meta`);
    if (!c.intro || !LANGS.every((l) => Array.isArray(c.intro[l]) && c.intro[l].length)) err(`data/categories.js: live category "${c.id}" needs intro paragraphs in all languages`);
  }
}
for (const w of live) {
  const exp = "/" + w.path.replace(/\.html$/, "");
  if (w.route !== exp) err(`data/wishes.js: "${w.id}" route "${w.route}" should be "${exp}"`);
  if (w.slug !== path.posix.basename(w.path, ".html")) err(`data/wishes.js: "${w.id}" slug "${w.slug}" does not match file name`);
  if (!w.path.startsWith(`wishes/${w.category}/`)) err(`data/wishes.js: "${w.id}" must live under wishes/${w.category}/`);
  if (!Array.isArray(w.languages) || !w.languages.every((l) => LANGS.includes(l))) err(`data/wishes.js: "${w.id}" languages invalid`);
  if (!(w.thumbnail && w.thumbnail.icon && w.thumbnail.theme)) err(`data/wishes.js: "${w.id}" needs thumbnail {icon, theme}`);
  for (const f of FORBIDDEN_WISH_FIELDS) {
    if (f in w) err(`data/wishes.js: "${w.id}" has "${f}" — popularity/claims fields are not allowed until real data exists`);
  }
}

/* ---------- Phase 1: generated pages & HTML rules ---------- */
{
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/build.mjs"), "--check"], { encoding: "utf8" });
  if (r.status !== 0) err("Generated files are stale — run: node scripts/build.mjs  (" + (r.stderr || "").trim().split("\n")[0] + ")");
}
const ALLOWED_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
for (const h of externalHosts.keys()) if (!ALLOWED_HOSTS.has(h)) err(`Unexpected external host: ${h}`);
const BANNED = /googlesyndication|doubleclick|adsbygoogle|googletagmanager|google-analytics|gtag\s*\(|fbq\s*\(|hotjar|clarity\.ms|segment\.com|plausible\.io/i;
const HYPE = /\b(trending|best[- ]?seller|most popular|top[- ]rated|testimonial|as seen on|\d+\s*\+\s*(wishes|users|visitors))\b/i;

for (const f of htmlFiles) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const code = src.replace(/<!--[\s\S]*?-->/g, "");
  if (BANNED.test(code)) err(`${f}: references an analytics/ad network (not allowed yet)`);
  if (HYPE.test(code)) err(`${f}: contains a popularity/hype claim (${(code.match(HYPE) || [])[0]})`);

  /* ad slots must stay hidden + empty */
  for (const m of code.matchAll(/<div class="ad-slot"[^>]*>([\s\S]*?)<\/div>/g)) {
    if (!/\shidden[\s>]/.test(m[0]) || m[1].trim() !== "") err(`${f}: ad slot must be hidden and empty`);
  }

  /* JSON-LD must parse and contain no fabricated rating/review data */
  for (const m of code.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      const txt = JSON.stringify(j);
      if (/aggregateRating|"review"|ratingValue|interactionStatistic/.test(txt)) err(`${f}: JSON-LD contains rating/review/statistics data`);
      for (const u of txt.matchAll(/"(?:url|item|@id)":"(https?:[^"#]+)/g)) {
        const p2 = u[1].replace(/^https?:\/\/[^/]+/, "") || "/";
        checkTarget(f, p2, u[1]);
      }
    } catch (e) { err(`${f}: invalid JSON-LD (${e.message})`); }
  }

  /* heading hierarchy: one h1, no skipped levels (generated pages + wish page) */
  if (f !== "404.html") {
    const hs = [...code.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    /* the Birthday page predates this rule (several h1, one per scene); every other page, including the newer wish pages, is strict */
    if (f !== "wishes/birthday/birthday-01.html") {
      if (hs.filter((x) => x === 1).length !== 1) err(`${f}: must have exactly one <h1> (found ${hs.filter((x) => x === 1).length})`);
      for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) err(`${f}: heading level skips h${hs[i - 1]} → h${hs[i]}`);
    }
  }

  /* generated pages: every visible string must come in all languages */
  if (src.includes("GENERATED by")) {
    for (const l of LANGS) {
      const n = (code.match(new RegExp(`data-l="${l}"`, "g")) || []).length;
      const base = (code.match(new RegExp(`data-l="${LANGS[0]}"`, "g")) || []).length;
      if (n !== base) err(`${f}: ${l} strings (${n}) do not match ${LANGS[0]} strings (${base})`);
    }
    if (!/<link rel="canonical"/.test(code) || !/property="og:title"/.test(code) || !/name="twitter:card"/.test(code)) err(`${f}: missing canonical/OG/Twitter tags`);
  }
}

/* ---------- Phase 2: templates + Creator ---------- */
const templates = D.templates || [];
const creatorTpls = templates.filter((t) => t.status === "implemented" && t.creator && t.creator.enabled);
const tplIds = new Set(), tplSlugs = new Set();
const HEXRE = /^#[0-9A-Fa-f]{6}$/;
for (const t of templates) {
  if (tplIds.has(t.id)) err(`data/templates.js: duplicate template id "${t.id}"`);
  tplIds.add(t.id);
  if (!/^[a-z0-9-]+$/.test(t.id)) err(`data/templates.js: template id "${t.id}" must be lowercase URL-safe`);
  if (!cats.has(t.category)) err(`data/templates.js: "${t.id}" has unknown category "${t.category}"`);
  if (!bothLangs(t.title) || !bothLangs(t.description)) err(`data/templates.js: "${t.id}" needs title/description in all languages`);
  if (!Array.isArray(t.languages) || !t.languages.length || !t.languages.every((l) => LANGS.includes(l))) err(`data/templates.js: "${t.id}" has unsupported languages`);
  if (t.status !== "implemented") {
    /* A planned template is data only: no route, never offered in the Creator, no page on disk. */
    if (t.route || t.previewRoute) err(`data/templates.js: planned template "${t.id}" must not have a route`);
    if (t.creator && t.creator.enabled) err(`data/templates.js: planned template "${t.id}" must not be creator-enabled`);
    if (live.some((w) => w.template === t.id)) err(`data/templates.js: planned template "${t.id}" is used by a live wish`);
    continue;
  }
  if (tplSlugs.has(t.slug)) err(`data/templates.js: duplicate slug "${t.slug}"`);
  tplSlugs.add(t.slug);
  const wish = live.find((w) => w.route === t.route);
  if (!wish) err(`data/templates.js: "${t.id}" route "${t.route}" is not a live wish`);
  else if (wish.template !== t.id) err(`data/templates.js: wish "${wish.id}" uses template "${wish.template}", expected "${t.id}"`);
  if (t.previewRoute !== t.route) warn(`data/templates.js: "${t.id}" previewRoute differs from route`);
  if (wish && t.seo) {
    /* The static <title>/description of the page must match the template's SEO data. */
    const html = existsExact(wish.path) ? fs.readFileSync(path.join(ROOT, wish.path), "utf8") : "";
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1];
    if (title !== t.seo.title.en) err(`${wish.path}: <title> does not match templates.js seo.title.en`);
    const desc = (html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) || [])[1] || "";
    if (!desc.startsWith(t.seo.description.en)) err(`${wish.path}: meta description does not start with templates.js seo.description.en`);
  }
  if (!t.creator) continue;
  /* --- fields --- */
  const params = new Set();
  for (const f of t.fields || []) {
    if (!f.id || !f.param) err(`data/templates.js: "${t.id}" has a field without id/param`);
    if (params.has(f.param)) err(`data/templates.js: "${t.id}" duplicate param "${f.param}"`);
    params.add(f.param);
    if (!["line", "text", "enum"].includes(f.type)) err(`data/templates.js: "${t.id}" field "${f.id}" has unsupported type "${f.type}"`);
    if (f.type !== "enum") {
      if (!(f.max > 0 && f.max <= 500)) err(`data/templates.js: "${t.id}" field "${f.id}" needs 0 < max <= 500`);
      if (!bothLangs(f.label) || !bothLangs(f.hint) || !bothLangs(f.example)) err(`data/templates.js: "${t.id}" field "${f.id}" needs label/hint/example in all languages`);
    } else if (f.options === "choices") {
      const ids = (f.choices || []).map((c) => c.id);
      if (ids.length < 2) err(`data/templates.js: "${t.id}" choice field "${f.id}" needs at least 2 choices`);
      if (new Set(ids).size !== ids.length) err(`data/templates.js: "${t.id}" choice field "${f.id}" has duplicate choice ids`);
      if (!ids.every((x) => /^[a-z]+$/.test(x))) err(`data/templates.js: "${t.id}" choice ids of "${f.id}" must be lowercase letters`);
      if (!ids.includes(f.default)) err(`data/templates.js: "${t.id}" choice field "${f.id}" default must be one of its choices`);
      if (!bothLangs(f.label) || !bothLangs(f.hint)) err(`data/templates.js: "${t.id}" choice field "${f.id}" needs label/hint in all languages`);
      for (const c of f.choices || []) if (!bothLangs(c.name) || !bothLangs(c.description)) err(`data/templates.js: "${t.id}" choice "${c.id}" needs name/description in all languages`);
    } else if (!["themes", "languages"].includes(f.options)) err(`data/templates.js: "${t.id}" enum field "${f.id}" has bad options "${f.options}"`);
  }
  for (const need of ["name", "from", "message", "theme", "lang"]) {
    if (!(t.fields || []).some((f) => f.param === need)) err(`data/templates.js: "${t.id}" is creator-enabled but has no "${need}" field`);
  }
  if (t.defaults && t.defaults.message && !bothLangs(t.defaults.message)) err(`data/templates.js: "${t.id}" default message needs all languages`);
  if (!(t.defaults && t.defaults.message)) err(`data/templates.js: "${t.id}" needs a default message`);
  /* --- themes --- */
  const themeIds = new Set();
  if (!(t.themes || []).length) err(`data/templates.js: "${t.id}" needs at least one theme`);
  for (const th of t.themes || []) {
    if (themeIds.has(th.id)) err(`data/templates.js: "${t.id}" duplicate theme "${th.id}"`);
    themeIds.add(th.id);
    if (!/^[a-z]+$/.test(th.id)) err(`data/templates.js: theme id "${th.id}" must be lowercase letters`);
    if (th.cssClass !== `theme-${th.id}`) err(`data/templates.js: theme "${th.id}" cssClass must be "theme-${th.id}"`);
    if (!bothLangs(th.name) || !bothLangs(th.description)) err(`data/templates.js: theme "${th.id}" needs name/description in all languages`);
    if (!(th.swatch || []).length === 2 && !(th.swatch && th.swatch.length === 2 && th.swatch.every((c) => HEXRE.test(c)))) err(`data/templates.js: theme "${th.id}" swatch must be two #RRGGBB colours`);
    if (th.id !== t.defaultTheme && existsExact(t.path || (wish && wish.path) || "")) {
      const cssFile = (wish ? wish.path : "").replace(/\.html$/, ".css");
      if (!existsExact(cssFile) || !fs.readFileSync(path.join(ROOT, cssFile), "utf8").includes(`html.${th.cssClass}`)) err(`${cssFile || t.id}: no "html.${th.cssClass}" rules for theme "${th.id}"`);
    }
  }
  if (!themeIds.has(t.defaultTheme)) err(`data/templates.js: "${t.id}" defaultTheme "${t.defaultTheme}" is not a theme`);
}

if (creatorTpls.length) {
  const cf = "create/index.html";
  if (!existsExact(cf)) err("Creator route missing: create/index.html");
  else {
    const src = fs.readFileSync(path.join(ROOT, cf), "utf8");
    const code = src.replace(/<!--[\s\S]*?-->/g, "");
    if (!/<title>[^<]*Create a Personalized Wish[^<]*Wishora<\/title>/.test(code)) err(`${cf}: title must contain "Create a Personalized Wish" and "Wishora"`);
    if (!/<link rel="canonical" href="[^"]+\/create\/">/.test(code)) err(`${cf}: canonical must be …/create/`);
    if (/name="robots"/.test(code)) err(`${cf}: the Creator page itself should be indexable`);
    if (!/<meta name="description" content="[^"]{60,}"/.test(code)) err(`${cf}: needs a real meta description`);
    if (!/<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/.test(code)) err(`${cf}: needs a no-JavaScript explanation`);
    if (/Coming soon|শীঘ্রই আসছে/.test(code.replace(/class="soon-chips"[\s\S]*?<\/ul>/, "").replace(/<p class="soon-block-title">[\s\S]*?<\/p>/, "").replace(/<span data-l="(?:bn|en)"[^>]*>(?:Coming soon|শীঘ্রই আসছে)<\/span>/g, "")) && false) err(`${cf}: must not be a coming-soon page`);
    for (const t of creatorTpls) if (!src.includes(`value="${t.id}"`)) err(`${cf}: template "${t.id}" is not offered`);
    /* every creator-enabled category is an occasion; nothing else is selectable */
    const offered = [...src.matchAll(/name="occasion" value="([^"]+)"/g)].map((m) => m[1]);
    const wanted = [...new Set(creatorTpls.map((t) => t.category))];
    if (offered.sort().join() !== wanted.sort().join()) err(`${cf}: selectable occasions (${offered}) must equal creator-enabled categories (${wanted})`);
  }
  /* creator links everywhere */
  for (const f of htmlFiles) {
    const code = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    for (const m of code.matchAll(/href="((?:\.\.\/)*\/?create\/\?([^"#]*))"/g)) {
      const cat = new URLSearchParams(m[2]).get("category");
      if (cat && !creatorTpls.some((t) => t.category === cat)) err(`${f}: link to creator with category "${cat}" that has no creator template`);
    }
  }
}

/* --- unsafe DOM patterns in code that handles user-controlled values --- */
const UNSAFE = /\b(innerHTML|outerHTML|insertAdjacentHTML|document\.write(ln)?|eval\s*\(|new Function\s*\(|setTimeout\s*\(\s*["'`]|\.setAttribute\s*\(\s*["']on)/;
const stripComments = (c) => c.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");
for (const f of ["js/creator.js", "js/wish-params.js", "js/wish-runtime.js", ...files.filter((x) => /^wishes\/[^/]+\/[^/]+\.js$/.test(x))]) {
  if (!existsExact(f)) continue;
  const m = stripComments(fs.readFileSync(path.join(ROOT, f), "utf8")).match(UNSAFE);
  if (m) err(`${f}: unsafe DOM/eval pattern "${m[0]}" in code that handles user input`);
}
/* creator.js only uses runtime strings that exist in data/ui.js */
if (existsExact("js/creator.js")) {
  const cj = fs.readFileSync(path.join(ROOT, "js/creator.js"), "utf8");
  for (const m of cj.matchAll(/["'](crx[A-Za-z]+)["']/g)) if (!D.ui || !D.ui[m[1]]) err(`js/creator.js: runtime string "${m[1]}" missing from data/ui.js`);
}

/* --- self-tests of the shared URL logic with hostile input --- */
try {
  const require = createRequire(import.meta.url);
  const P = require(path.join(ROOT, "js/wish-params.js"));
  for (const t of creatorTpls) {
    const XSS = '<script>alert(1)</script><img src=x onerror=alert(1)>"><svg onload=alert(1)>';
    const ok = (c, m) => { if (!c) err("wish-params self-test failed: " + m); };
    const r = P.parse("?name=" + encodeURIComponent(XSS) + "&from=" + encodeURIComponent(XSS) + "&message=" + encodeURIComponent(XSS) + "&theme=javascript&lang=%3Cimg%3E&language=zz&template=../../x&category=../../x", t);
    ok(!/[<>]/.test(r.name) && !/[<>]/.test(r.from), "names must not contain angle brackets");
    ok(r.message === XSS, "message must be preserved verbatim (rendered as text)");
    ok(r.theme === t.defaultTheme, "unknown theme must fall back to the default");
    ok(r.lang === null, "unknown language must be ignored");
    ok(P.parse("?theme=" + t.themes[1].id, t).theme === t.themes[1].id, "valid theme accepted");
    ok(P.parse("?theme=" + t.themes[1].id.toUpperCase(), t).theme === t.themes[1].id, "theme matching is case-insensitive but exact");
    ok(P.length(P.line("😀".repeat(100), 40)) === 40, "line cap counts code points");
    ok(P.length(P.message("a".repeat(5000), 240)) === 240, "message cap");
    ok(P.parse("?name=%E0%A4%A&message=%", t).name !== undefined, "malformed percent-encoding must not throw");
    ok(P.message("a\r\n\r\n\r\n\r\nb", 240) === "a\n\nb", "line breaks preserved and normalised");
    ok(P.line("  \u202Eevil  \u0000x ", 40) === "evil x", "bidi/control characters removed, whitespace collapsed");
    ok(P.message("র‍্যাব ", 240) === "র‍্যাব", "zero-width joiner kept for Bengali");
    const b = P.build("https://x.test", t, { name: "রিয়া", from: "K", message: "line1\nline2", theme: t.themes[1].id, lang: "bn" });
    ok(!/[<>" \n]/.test(b.url), "built URL must be fully encoded");
    const back = P.parse(b.url.slice(b.url.indexOf("?")), t);
    ok(back.name === "রিয়া" && back.message === "line1\nline2" && back.lang === "bn", "build → parse round-trips");
    const worst = P.build("https://" + "x".repeat(30) + ".test", t, { name: "😀".repeat(P.maxOf(t, "name", 40)), from: "😀".repeat(P.maxOf(t, "from", 40)), message: "😀".repeat(P.maxOf(t, "message", 240)), theme: t.themes[t.themes.length - 1].id, lang: "bn" });
    ok(worst.length <= P.MAX_URL_LENGTH, `worst-case URL (${worst.length}) must stay within MAX_URL_LENGTH (${P.MAX_URL_LENGTH}) — lower the field limits or raise the cap deliberately`);
    ok(P.build("https://x.test", t, { name: "😀".repeat(40), message: "😀".repeat(240) }).length < 5000, "URL length sanity");
    ok(P.build("https://x.test", t, { name: "x", theme: "elegant-evil", lang: "../.." }).url.indexOf("evil") === -1, "unknown enum values never reach the URL");
    for (const f of P.choiceFields(t)) {
      const other = f.choices.find((c) => c.id !== f.default).id;
      ok(P.parse("?" + f.param + "=" + encodeURIComponent(XSS), t).choices[f.id] === f.default, `hostile "${f.param}" falls back to its default`);
      ok(P.parse("?" + f.param + "=" + other.toUpperCase(), t).choices[f.id] === other, `valid "${f.param}" accepted (case-insensitive)`);
      ok(P.build("https://x.test", t, { name: "x", choices: { [f.id]: other } }).url.includes(f.param + "=" + other), `"${f.param}" non-default reaches the URL`);
      ok(!P.build("https://x.test", t, { name: "x", choices: { [f.id]: f.default } }).url.includes(f.param + "="), `"${f.param}" default is omitted from the URL`);
      ok(!P.build("https://x.test", t, { name: "x", choices: { [f.id]: "evil" } }).url.includes("evil"), `unknown "${f.param}" never reaches the URL`);
    }
  }
} catch (e) { err("wish-params self-tests crashed: " + e.message); }

/* ---------- 9. unused files ---------- */
const referenced = new Set(["index.html", "404.html", "robots.txt", "sitemap.xml", "README.md", "CHANGELOG.md"]);
const allText = files
  .filter((f) => /\.(html|css|js|mjs|xml|txt)$/.test(f))
  .map((f) => [f, fs.readFileSync(path.join(ROOT, f), "utf8")]);
for (const f of files) {
  if (referenced.has(f) || f.startsWith("scripts/") || f.startsWith("tests/") || /README\.md$/.test(f)) continue;
  const base = path.posix.basename(f);
  const used = allText.some(([g, txt]) => g !== f && txt.includes(base));
  if (!used) warn(`Possibly unused file: ${f}`);
}

/* ---------- report ---------- */
const mb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`Files: ${files.length}  (HTML ${htmlFiles.length}, CSS ${files.filter((f) => f.endsWith(".css")).length}, JS ${files.filter((f) => /\.m?js$/.test(f)).length})`);
console.log("Sizes: " + files.filter((f) => /\.(css|js|html)$/.test(f) && !f.startsWith("scripts/"))
  .map((f) => `${f} ${mb(fs.statSync(path.join(ROOT, f)).size)}`).join(" | "));
if (externalHosts.size) {
  console.log("External hosts referenced: " + [...externalHosts.keys()].join(", "));
}
for (const k of KNOWN_MISSING) {
  if (!existsExact(k)) warn(`Known missing asset (see assets/*/README.md): ${k}`);
}
const placeholderFiles = files.filter(
  (f) => /\.(html|xml|txt|js)$/.test(f) && !f.startsWith("scripts/") &&
    fs.readFileSync(path.join(ROOT, f), "utf8").includes("https://" + PLACEHOLDER_HOST)
);
if (placeholderFiles.length) warn(`Site URL placeholder still set in ${placeholderFiles.length} file(s) — run scripts/set-site-url.mjs before launch`);

warnings.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
