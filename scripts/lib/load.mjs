/* Loads config/ and data/ (browser-style IIFE files) into Node via vm. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function loadSite() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const f of ["config/site.js", "data/categories.js", "data/templates.js", "data/wishes.js", "data/planned.js", "data/ui.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  }
  const config = sandbox.window.WISHORA_CONFIG;
  const data = sandbox.window.WISHORA_DATA;
  return { config, data, langs: config.supportedLangs, defaultLang: config.defaultLang };
}
