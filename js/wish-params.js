/* =========================================================
   WISHORA — SHARED WISH PARAMETERS
   js/wish-params.js

   The ONE implementation of how personalisation travels in a URL:
   sanitising, validating, parsing and building. Loaded by the Creator
   (/create/) and by every wish page, so the two can never drift apart.

   Everything here treats input as hostile:
   • values are only ever returned as plain strings (callers must write them
     with textContent — never innerHTML);
   • enums are checked against fixed allow-lists (theme, language);
   • lengths are counted in Unicode code points and capped;
   • nothing is evaluated, no URL is ever fetched from a value.

   Works in the browser (window.WishoraParams) and in Node (module.exports,
   used by scripts/check-repo.mjs).
   ========================================================= */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WishoraParams = api;
})(this, function () {
  "use strict";

  /* A personalised link must stay a sane size (the worst case is a
     message made only of 4-byte emoji, which percent-encodes to 12
     characters each). The Creator refuses to build anything larger. */
  var MAX_URL_LENGTH = 4000;

  /* Control chars (except \n handled separately), line/paragraph
     separators, BOM, U+FFFD (broken decoding) and bidi override/isolate
     controls (visual spoofing). Zero-width joiner/non-joiner are KEPT:
     Bengali conjuncts need them. */
  var STRIP = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029\uFEFF\uFFFD\u202A-\u202E\u2066-\u2069]/g;

  function length(str) {
    return Array.from(String(str == null ? "" : str)).length;
  }

  function cap(str, max) {
    var chars = Array.from(str);
    return chars.length > max ? chars.slice(0, max).join("") : str;
  }

  /* Single-line text (names). Tags are removed, whitespace collapsed. */
  function line(raw, max) {
    if (typeof raw !== "string") return "";
    var v = raw.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
    v = v.replace(STRIP, "").replace(/\s+/g, " ").trim();
    return cap(v, max || 40).trim();
  }

  /* Multi-line message. Kept EXACTLY as written apart from safe
     normalisation: CRLF → LF, control/bidi characters removed, tabs → spaces,
     more than one blank line collapsed, outer whitespace trimmed.
     HTML is NOT stripped — it is plain text and rendered with textContent. */
  function message(raw, max, opts) {
    if (typeof raw !== "string") return "";
    var v = raw.replace(/\r\n?/g, "\n").replace(/\t/g, " ").replace(STRIP, "");
    v = v.replace(/[ \u00A0]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!(opts && opts.noCap)) v = cap(v, max || 240).trim();
    return v;
  }

  /* Exact, case-insensitive match against an allow-list, else fallback. */
  function oneOf(raw, allowed, fallback) {
    if (typeof raw !== "string" || raw.length > 32) return fallback;
    var v = raw.toLowerCase();
    return allowed.indexOf(v) !== -1 ? v : fallback;
  }

  function field(template, id) {
    var list = (template && template.fields) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function maxOf(template, id, dflt) {
    var f = field(template, id);
    return f && f.max ? f.max : dflt;
  }

  function themeIds(template) {
    return ((template && template.themes) || []).map(function (t) { return t.id; });
  }

  /* Enum fields whose options are listed inline in the template
     ({ type: "enum", options: "choices", choices: [{id,…}], default }).
     Used for template-specific choices such as the anniversary "kind". */
  function choiceFields(template) {
    return ((template && template.fields) || []).filter(function (f) {
      return f.type === "enum" && f.options === "choices" && f.choices && f.choices.length;
    });
  }

  function choiceIds(f) {
    return f.choices.map(function (c) { return c.id; });
  }

  function choiceDefault(f) {
    return f["default"] || f.choices[0].id;
  }

  /* Read personalisation from a query string. Never throws. */
  function parse(search, template) {
    var out = { name: "", from: "", message: "", theme: template.defaultTheme, lang: null, choices: {}, embed: false, personalised: false };
    choiceFields(template).forEach(function (f) { out.choices[f.id] = choiceDefault(f); });
    var p;
    try { p = new URLSearchParams(search || ""); } catch (e) { return out; }

    out.name = line(p.get("name") || "", maxOf(template, "name", 40));
    out.from = line(p.get("from") || "", maxOf(template, "from", 40));
    out.message = message(p.get("message") || "", maxOf(template, "message", 240));
    out.theme = oneOf(p.get("theme"), themeIds(template), template.defaultTheme);
    out.lang = oneOf(p.get("lang") || p.get("language"), template.languages || [], null);
    var anyChoice = false;
    choiceFields(template).forEach(function (f) {
      var raw = p.get(f.param);
      out.choices[f.id] = oneOf(raw, choiceIds(f), choiceDefault(f));
      if (raw) anyChoice = true;
    });
    out.embed = p.get("embed") === "1";
    out.personalised = !!(out.name || out.from || out.message || p.get("theme") || out.lang || anyChoice);
    return out;
  }

  function enc(s) { return encodeURIComponent(s); }

  /* Build the shareable URL from already-validated values. */
  function build(origin, template, values) {
    var parts = [];
    var name = line(values.name || "", maxOf(template, "name", 40));
    var from = line(values.from || "", maxOf(template, "from", 40));
    var msg = message(values.message || "", maxOf(template, "message", 240));
    if (name) parts.push("name=" + enc(name));
    if (from) parts.push("from=" + enc(from));
    if (msg) parts.push("message=" + enc(msg));
    var theme = oneOf(values.theme, themeIds(template), template.defaultTheme);
    if (theme !== template.defaultTheme) parts.push("theme=" + enc(theme));
    var chosen = values.choices || {};
    choiceFields(template).forEach(function (f) {
      var v = oneOf(chosen[f.id], choiceIds(f), choiceDefault(f));
      if (v !== choiceDefault(f)) parts.push(f.param + "=" + enc(v));
    });
    var lang = oneOf(values.lang, template.languages || [], null);
    if (lang) parts.push("lang=" + enc(lang));
    var url = String(origin || "") + template.route + (parts.length ? "?" + parts.join("&") : "");
    return { url: url, length: url.length, tooLong: url.length > MAX_URL_LENGTH };
  }

  return {
    MAX_URL_LENGTH: MAX_URL_LENGTH,
    length: length,
    line: line,
    message: message,
    oneOf: oneOf,
    field: field,
    maxOf: maxOf,
    themeIds: themeIds,
    choiceFields: choiceFields,
    choiceIds: choiceIds,
    choiceDefault: choiceDefault,
    parse: parse,
    build: build
  };
});
