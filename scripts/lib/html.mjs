/* Small HTML helpers shared by the build templates. */
export const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/* Search normalisation — MUST stay identical to norm() in js/app.js. */
export const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").toLowerCase();

export function makeI18n(langs, ui) {
  /* <span data-l="bn">…</span><span data-l="en">…</span> — CSS shows the
     active one, so the page is bilingual without JavaScript. */
  const bi = (obj, vars = {}) =>
    langs
      .map((l) => {
        let text = obj[l];
        for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
        return `<span data-l="${l}" lang="${l}">${esc(text)}</span>`;
      })
      .join("");
  const t = (key, vars) => {
    if (!ui[key]) throw new Error(`Missing UI string: ${key}`);
    return bi(ui[key], vars);
  };
  /* Plain text for one language (used for <title>, meta, attributes). */
  const tx = (key, lang, vars = {}) => {
    let text = ui[key][lang];
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  };
  /* aria-label that follows the language: default text + data-aria-<lang>. */
  const aria = (key, attr = "aria-label", prefix = "data-aria") =>
    (attr ? `${attr}="${esc(ui[key][langs[0]])}" ` : "") +
    langs.map((l) => `${prefix}-${l}="${esc(ui[key][l])}"`).join(" ");
  return { bi, t, tx, aria };
}

export function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
}
