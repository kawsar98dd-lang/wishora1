#!/usr/bin/env node
/* Phase 5 content/SEO regression checks. No third-party dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categories = ['birthday', 'love', 'anniversary', 'friendship'];
let passed = 0;
let failed = 0;
function check(condition, message) {
  if (condition) { passed++; console.log(`PASS ${message}`); }
  else { failed++; console.error(`FAIL ${message}`); }
}

for (const category of categories) {
  const file = path.join(ROOT, 'categories', category, 'index.html');
  const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  check(!!html, `${category}: generated category page exists`);
  check(html.includes('class="category-faq"'), `${category}: visible FAQ section exists`);
  check((html.match(/class="faq-item"/g) || []).length === 3, `${category}: exactly three FAQ items are rendered`);
  check(html.includes('"@type":"FAQPage"'), `${category}: FAQ structured data exists`);
  check(html.includes('data-l="bn"') && html.includes('data-l="en"'), `${category}: FAQ content includes Bengali and English variants`);
  const script = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let graph = null;
  try { graph = script ? JSON.parse(script[1]) : null; } catch {}
  const faq = graph?.['@graph']?.find((node) => node['@type'] === 'FAQPage');
  check(Array.isArray(faq?.mainEntity) && faq.mainEntity.length === 3, `${category}: FAQ JSON-LD parses and has three questions`);
  check((faq?.mainEntity || []).every((q) => q.name && q.acceptedAnswer?.text), `${category}: every structured question has an answer`);
}

const css = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
check(css.includes('.faq-item summary:focus-visible'), 'FAQ summary has a visible keyboard focus style');
check(css.includes('@media (max-width: 480px)'), 'FAQ layout includes a narrow-mobile adjustment');
const ui = fs.readFileSync(path.join(ROOT, 'data/ui.js'), 'utf8');
check(ui.includes('catFaqTitle') && ui.includes('catFaqIntro'), 'FAQ headings and intro are data-driven bilingual strings');

console.log(`\nPhase 5 content checks: ${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
