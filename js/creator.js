/* =========================================================
   WISHORA — WISH CREATOR (client-side only)
   js/creator.js — loaded on /create/

   Flow:  Occasion → Template → Details → Preview → Share

   • All options come from the page markup, which scripts/build.mjs renders
     from data/templates.js. This file holds NO template-specific content.
   • URL building / sanitising / validating is js/wish-params.js (shared with
     the wish page itself), so a link the Creator makes is always one the
     wish page reads the same way.
   • State lives in the form controls (they stay in the DOM between steps),
     so nothing the user typed is lost when moving back and forth.
   • User text is only ever handled as plain strings and written with
     textContent / .value / setAttribute. Nothing here builds HTML from input.
   • No network requests, no storage, no analytics. Nothing is saved
     anywhere: the link itself carries the wish.
   ========================================================= */
(function () {
  "use strict";

  const app = document.getElementById("creatorApp");
  const Params = window.WishoraParams;
  const data = window.WISHORA_DATA || {};
  if (!app || !Params) return;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* ---------- runtime strings (emitted from data/ui.js by the build) ---------- */
  let RT = { ui: {}, steps: [] };
  try { RT = JSON.parse(document.getElementById("creatorRuntime").textContent); } catch (e) { /* handled by fallbacks below */ }

  const uiLang = () => document.documentElement.getAttribute("lang") === "en" ? "en" : "bn";
  function rt(key, vars) {
    const entry = RT.ui[key];
    let text = entry ? entry[uiLang()] || entry.bn : "";
    Object.keys(vars || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(vars[k])); });
    return text;
  }

  /* ---------- templates (single source of truth: data/templates.js) ---------- */
  const TEMPLATES = (Array.isArray(data.templates) ? data.templates : []).filter(
    (t) => t && t.status === "implemented" && t.creator && t.creator.enabled
  );
  const tplById = (id) => TEMPLATES.filter((t) => t.id === id)[0] || null;

  const state = { step: 1, occasion: null, templateId: null, errors: {}, notice: null, shareUrl: "" };
  const TOTAL = 5;

  const els = {
    panels: $$(".step-panel", app),
    items: $$("[data-step-item]", app),
    live: $("#stepLive"),
    caption: $("#stepCaption"),
    notice: $("#creatorNotice"),
    formSummary: $("#formSummary"),
    form: $("#detailsForm"),
    summary: $("#summary"),
    frame: $("#previewFrame"),
    shareUrl: $("#shareUrl"),
    copyBtn: $("#copyBtn"),
    shareBtn: $("#shareBtn"),
    openBtn: $("#openBtn"),
    shareStatus: $("#shareStatus"),
    againBtn: $("#againBtn")
  };

  const reducedMotion = () => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  };

  /* =======================================================
     Step navigation
  ======================================================= */
  function stepName(n) {
    const entry = RT.steps[n - 1];
    return entry ? entry[uiLang()] || entry.bn : "";
  }

  function announceStep() {
    const text = rt("crxStepOf", { n: state.step, total: TOTAL, name: stepName(state.step) });
    if (els.live) els.live.textContent = text;
    if (els.caption) els.caption.textContent = text;
  }

  function showStep(n, opts) {
    state.step = n;
    els.panels.forEach((p) => { p.hidden = Number(p.getAttribute("data-step")) !== n; });
    els.items.forEach((li) => {
      const i = Number(li.getAttribute("data-step-item"));
      li.classList.toggle("is-current", i === n);
      li.classList.toggle("is-done", i < n);
      if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    announceStep();
    if (!opts || opts.focus !== false) {
      const heading = $("#step-" + n + "-title");
      if (heading) {
        heading.focus({ preventScroll: true });
        app.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }
    }
  }

  /* =======================================================
     Notices and field errors (re-rendered on language change)
  ======================================================= */
  function setNotice(key) {
    state.notice = key;
    renderNotice();
  }
  function renderNotice() {
    if (!els.notice) return;
    els.notice.hidden = !state.notice;
    els.notice.textContent = state.notice ? rt(state.notice) : "";
  }

  function fieldEl(name) { return $('[data-template-fields]:not([hidden]) [data-field="' + name + '"]', app); }

  function renderErrors() {
    $$('[data-template-fields]:not([hidden]) .field').forEach((f) => {
      const name = f.getAttribute("data-field");
      const err = state.errors[name];
      const msg = f.querySelector(".field-error");
      const control = f.querySelector("input.input, textarea.input");
      if (msg) {
        msg.hidden = !err;
        msg.textContent = err ? "\u26A0 " + rt(err.key, err.vars) : "";
      }
      if (control) {
        if (err) control.setAttribute("aria-invalid", "true"); else control.removeAttribute("aria-invalid");
      }
    });
    const any = Object.keys(state.errors).length > 0;
    if (els.formSummary) {
      els.formSummary.hidden = !any;
      els.formSummary.textContent = any ? rt("crxFormErrors") : "";
    }
  }

  /* =======================================================
     Reading and validating the form
  ======================================================= */
  const currentTemplate = () => tplById(state.templateId);
  const fieldsRoot = () => $('[data-template-fields="' + state.templateId + '"]', app);

  function checkedValue(root, nameSuffix) {
    const input = root.querySelector('input[name$="-' + nameSuffix + '"]:checked');
    return input ? input.value : "";
  }

  function readValues() {
    const tpl = currentTemplate();
    const root = fieldsRoot();
    if (!tpl || !root) return null;
    const get = (id) => { const el = root.querySelector('[name="' + id + '"]'); return el ? el.value : ""; };
    const mode = checkedValue(root, "msgmode") || "default";
    return {
      tpl: tpl,
      rawName: get("name"),
      rawFrom: get("from"),
      rawMessage: get("message"),
      mode: mode,
      theme: checkedValue(root, "theme"),
      lang: checkedValue(root, "lang"),
      choices: Params.choiceFields(tpl).reduce((acc, f) => { acc[f.id] = checkedValue(root, f.id); return acc; }, {})
    };
  }

  /* Cleaned values (what will really be shared). */
  function cleanValues(v) {
    const tpl = v.tpl;
    return {
      name: Params.line(v.rawName, Params.maxOf(tpl, "name", 40)),
      from: Params.line(v.rawFrom, Params.maxOf(tpl, "from", 40)),
      message: v.mode === "custom" ? Params.message(v.rawMessage, Params.maxOf(tpl, "message", 240)) : "",
      theme: Params.oneOf(v.theme, Params.themeIds(tpl), tpl.defaultTheme),
      lang: Params.oneOf(v.lang, tpl.languages, null),
      choices: Params.choiceFields(tpl).reduce((acc, f) => {
        acc[f.id] = Params.oneOf(v.choices[f.id], Params.choiceIds(f), Params.choiceDefault(f));
        return acc;
      }, {})
    };
  }

  function validate() {
    const v = readValues();
    state.errors = {};
    if (!v) return null;
    const tpl = v.tpl;

    const nameMax = Params.maxOf(tpl, "name", 40);
    const nameLen = Params.length(Params.line(v.rawName, 100000));
    if (nameLen === 0) state.errors.name = { key: "crxErrNameRequired" };
    else if (nameLen > nameMax) state.errors.name = { key: "crxErrTooLong", vars: { max: nameMax, n: nameLen } };

    const fromMax = Params.maxOf(tpl, "from", 40);
    const fromLen = Params.length(Params.line(v.rawFrom, 100000));
    if (fromLen > fromMax) state.errors.from = { key: "crxErrTooLong", vars: { max: fromMax, n: fromLen } };

    if (v.mode === "custom") {
      const msgMax = Params.maxOf(tpl, "message", 240);
      const msg = Params.message(v.rawMessage, msgMax, { noCap: true });
      const len = Params.length(msg);
      if (len === 0) state.errors.message = { key: "crxErrMsgRequired" };
      else if (len > msgMax) state.errors.message = { key: "crxErrTooLong", vars: { max: msgMax, n: len } };
    }

    if (!Params.oneOf(v.theme, Params.themeIds(tpl), null)) state.errors.theme = { key: "crxErrChoose" };
    if (!Params.oneOf(v.lang, tpl.languages, null)) state.errors.lang = { key: "crxErrChoose" };
    Params.choiceFields(tpl).forEach((f) => {
      if (!Params.oneOf(v.choices[f.id], Params.choiceIds(f), null)) state.errors[f.id] = { key: "crxErrChoose" };
    });

    if (Object.keys(state.errors).length === 0) {
      const built = Params.build(window.location.origin, tpl, cleanValues(v));
      if (built.tooLong) state.errors.message = { key: "crxErrUrlTooLong" };
    }

    renderErrors();
    const keys = Object.keys(state.errors);
    if (keys.length) {
      const first = fieldEl(keys[0]);
      const control = first && (first.querySelector("[aria-invalid=true]") || first.querySelector("input, textarea"));
      if (control) control.focus();
      return null;
    }
    return v;
  }

  function updateCounters() {
    const tpl = currentTemplate();
    const root = fieldsRoot();
    if (!tpl || !root) return;
    $$("[data-field]", root).forEach((f) => {
      const counter = f.querySelector("[data-counter]");
      const control = f.querySelector("input.input, textarea.input");
      if (!counter || !control) return;
      const max = Number(f.getAttribute("data-max")) || 0;
      const type = f.getAttribute("data-type");
      const text = type === "text" ? Params.message(control.value, max, { noCap: true }) : Params.line(control.value, 100000);
      counter.textContent = rt("crxCount", { n: Params.length(text), max: max });
    });
  }

  /* Show the default message in the language chosen for the WISH (not the UI). */
  function syncDefaultMessage() {
    const root = fieldsRoot();
    if (!root) return;
    const wishLang = checkedValue(root, "lang");
    $$("[data-wl]", root).forEach((q) => { q.hidden = q.getAttribute("data-wl") !== wishLang; });
  }

  function syncMessageMode() {
    const root = fieldsRoot();
    if (!root) return;
    const custom = checkedValue(root, "msgmode") === "custom";
    const d = $("[data-msg-default]", root);
    const c = $("[data-msg-custom]", root);
    if (d) d.hidden = custom;
    if (c) c.hidden = !custom;
    if (!custom) delete state.errors.message;
  }

  function openDetails() {
    const tpl = currentTemplate();
    $$("[data-template-fields]", app).forEach((r) => { r.hidden = r.getAttribute("data-template-fields") !== state.templateId; });
    const root = fieldsRoot();
    if (tpl && root && !checkedValue(root, "lang")) {
      /* First visit: default the wish language to the language of the UI. */
      const want = tpl.languages.indexOf(uiLang()) !== -1 ? uiLang() : tpl.languages[0];
      const radio = root.querySelector('input[name$="-lang"][value="' + want + '"]');
      if (radio) radio.checked = true;
    }
    syncMessageMode();
    syncDefaultMessage();
    updateCounters();
    state.errors = {};
    renderErrors();
    applyPlaceholders();
  }

  function applyPlaceholders() {
    const l = uiLang();
    $$("[data-ph-" + l + "]", app).forEach((el) => el.setAttribute("placeholder", el.getAttribute("data-ph-" + l)));
    if (els.frame && els.frame.getAttribute("data-title-" + l)) els.frame.setAttribute("title", els.frame.getAttribute("data-title-" + l));
  }

  /* =======================================================
     Preview + share
  ======================================================= */
  function addSummaryRow(label, value, multiline) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    if (multiline) dd.className = "summary-multiline";
    els.summary.appendChild(dt);
    els.summary.appendChild(dd);
  }

  function fieldLabel(tpl, id) {
    const f = Params.field(tpl, id);
    return f && f.label ? f.label[uiLang()] || f.label.bn : id;
  }

  function renderSummary() {
    const v = readValues();
    if (!v || !els.summary) return;
    const tpl = v.tpl;
    const c = cleanValues(v);
    els.summary.textContent = "";
    addSummaryRow(fieldLabel(tpl, "name"), c.name);
    addSummaryRow(fieldLabel(tpl, "from"), c.from || rt("crxNoSender"));
    const themeObj = tpl.themes.filter((t) => t.id === c.theme)[0];
    Params.choiceFields(tpl).forEach((f) => {
      const chosen = f.choices.filter((x) => x.id === c.choices[f.id])[0];
      addSummaryRow(f.label[uiLang()] || f.label.bn, chosen ? chosen.name[uiLang()] || chosen.name.bn : c.choices[f.id]);
    });
    addSummaryRow(rt("crxThemeLabel") || "", themeObj ? themeObj.name[uiLang()] || themeObj.name.bn : c.theme);
    addSummaryRow(
      fieldLabel(tpl, "message"),
      c.message ? c.message : rt("crxTemplateMsg"),
      !!c.message
    );
    addSummaryRow(rt("crxWishLang") || "", c.lang === "en" ? "English" : "বাংলা");
  }

  function openPreview() {
    const v = validate();
    if (!v) return;
    const c = cleanValues(v);
    const built = Params.build(window.location.origin, v.tpl, c);
    state.shareUrl = built.url;
    const previewUrl = (v.tpl.previewRoute || v.tpl.route) + built.url.slice(window.location.origin.length + v.tpl.route.length);
    renderSummary();
    /* The preview IS the real wish page, embedded, with the same parameters. */
    els.frame.setAttribute("src", previewUrl + (previewUrl.indexOf("?") === -1 ? "?" : "&") + "embed=1");
    applyPlaceholders();
    showStep(4);
  }

  function openShare() {
    if (!state.shareUrl) return;
    els.shareUrl.value = state.shareUrl;
    els.openBtn.setAttribute("href", state.shareUrl);
    els.shareStatus.textContent = "";
    els.shareStatus.classList.remove("is-error");
    if (els.shareBtn) els.shareBtn.hidden = typeof navigator.share !== "function";
    showStep(5);
  }

  function status(key, isError) {
    els.shareStatus.classList.toggle("is-error", !!isError);
    els.shareStatus.textContent = (isError ? "\u26A0 " : "\u2713 ") + rt(key);
  }

  /* Only reports success when the browser confirms it. */
  function copyLink() {
    const text = state.shareUrl;
    function fallback() {
      try {
        els.shareUrl.focus();
        els.shareUrl.select();
        els.shareUrl.setSelectionRange(0, text.length);
        if (document.execCommand && document.execCommand("copy")) return status("crxCopied", false);
      } catch (e) { /* fall through */ }
      status("crxCopyFail", true);
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(() => status("crxCopied", false), fallback);
    } else {
      fallback();
    }
  }

  function nativeShare() {
    const tpl = currentTemplate();
    const v = readValues();
    const lang = v ? cleanValues(v).lang : uiLang();
    const title = tpl ? tpl.title[lang] || tpl.title.bn : "Wishora";
    try {
      navigator.share({ title: title, url: state.shareUrl }).then(
        () => { els.shareStatus.textContent = ""; },
        (err) => { if (!err || err.name !== "AbortError") status("crxShareFail", true); }
      );
    } catch (e) {
      status("crxShareFail", true);
    }
  }

  function startOver() {
    if (els.form) els.form.reset();
    $$('input[name="occasion"], input[name="template"]', app).forEach((r) => { r.checked = false; });
    state.occasion = null; state.templateId = null; state.errors = {}; state.shareUrl = "";
    state.notice = null; renderNotice(); renderErrors();
    els.frame.removeAttribute("src");
    $$('[data-action="next"]', $("#step-1")).forEach((b) => { b.disabled = true; });
    $$('[data-action="next"]', $("#step-2")).forEach((b) => { b.disabled = true; });
    showStep(1);
  }

  /* =======================================================
     Steps 1 and 2
  ======================================================= */
  function chooseOccasion(id) {
    state.occasion = id;
    if (state.templateId && currentTemplate() && currentTemplate().category !== id) state.templateId = null;
    $("[data-action=next]", $("#step-1")).disabled = !id;
  }

  function openTemplates(focus) {
    $$("[data-template-item]", app).forEach((li) => {
      li.hidden = li.getAttribute("data-category") !== state.occasion;
    });
    const visible = $$("[data-template-item]:not([hidden]) input[name=template]", app);
    if (visible.length === 1) { visible[0].checked = true; state.templateId = visible[0].value; }
    $("[data-action=next]", $("#step-2")).disabled = !state.templateId;
    showStep(2, { focus: focus !== false });
  }

  function chooseTemplate(id) {
    state.templateId = tplById(id) ? id : null;
    $("[data-action=next]", $("#step-2")).disabled = !state.templateId;
  }

  /* Deep links: /create/?category=birthday&template=birthday-surprise
     Values are checked against the real options; anything else is ignored. */
  function applyDeepLink() {
    let category = "", template = "";
    try {
      const p = new URLSearchParams(window.location.search);
      category = (p.get("category") || "").slice(0, 40);
      template = (p.get("template") || "").slice(0, 60);
    } catch (e) { return; }
    if (!category && !template) return;

    const occRadio = category && /^[a-z0-9-]+$/.test(category)
      ? $('input[name="occasion"][value="' + category + '"]', app) : null;
    const tpl = template && /^[a-z0-9-]+$/.test(template) ? tplById(template) : null;

    if (category && !occRadio) { setNotice("crxErrCategory"); return; }
    if (template && !tpl) { setNotice("crxErrTemplate"); return; }
    const cat = occRadio ? occRadio.value : tpl && tpl.category;
    if (!cat) return;
    const radio = $('input[name="occasion"][value="' + cat + '"]', app);
    if (!radio) { setNotice("crxErrCategory"); return; }
    if (tpl && tpl.category !== cat) { setNotice("crxErrTemplate"); return; }
    radio.checked = true;
    chooseOccasion(cat);
    openTemplates(false);
    if (tpl) {
      const tr = $('input[name="template"][value="' + tpl.id + '"]', app);
      if (tr) { tr.checked = true; chooseTemplate(tpl.id); }
    }
  }

  /* =======================================================
     Wiring
  ======================================================= */
  function onAction(action, panelStep) {
    if (action === "back") return showStep(Math.max(1, panelStep - 1));
    if (action === "edit") { showStep(3); const n = $('[data-template-fields]:not([hidden]) input[name=name]', app); if (n) n.focus(); return; }
    if (action === "next") {
      if (panelStep === 1 && state.occasion) return openTemplates(true);
      if (panelStep === 2 && state.templateId) { openDetails(); return showStep(3); }
      if (panelStep === 3) return openPreview();
      if (panelStep === 4) return openShare();
    }
  }

  function init() {
    if (!TEMPLATES.length) { setNotice("crxGenericError"); return; }

    app.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn || btn.disabled) return;
      const panel = btn.closest(".step-panel");
      if (panel) onAction(btn.getAttribute("data-action"), Number(panel.getAttribute("data-step")));
    });

    app.addEventListener("change", (e) => {
      const t = e.target;
      if (!t || t.tagName !== "INPUT") return;
      if (t.name === "occasion") chooseOccasion(t.value);
      else if (t.name === "template") chooseTemplate(t.value);
      else if (/-msgmode$/.test(t.name)) { syncMessageMode(); renderErrors(); updateCounters(); }
      else if (/-lang$/.test(t.name)) syncDefaultMessage();
    });

    app.addEventListener("input", (e) => {
      const t = e.target;
      if (!t || !(t.matches && t.matches("input.input, textarea.input"))) return;
      const f = t.closest(".field");
      if (f) { delete state.errors[f.getAttribute("data-field")]; renderErrors(); }
      updateCounters();
    });

    /* Enter in a single-line field = continue (the form has no submit button). */
    app.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target && e.target.matches && e.target.matches('input[type="text"].input:not([readonly])')) {
        e.preventDefault();
        onAction("next", 3);
      }
    });
    if (els.form) els.form.addEventListener("submit", (e) => e.preventDefault());

    if (els.copyBtn) els.copyBtn.addEventListener("click", copyLink);
    if (els.shareBtn) els.shareBtn.addEventListener("click", nativeShare);
    if (els.againBtn) els.againBtn.addEventListener("click", startOver);
    if (els.shareUrl) els.shareUrl.addEventListener("focus", () => els.shareUrl.select());

    /* The language switcher lives in js/app.js and announces changes here. */
    document.addEventListener("wishora:langchange", () => {
      renderNotice(); renderErrors(); updateCounters(); announceStep(); applyPlaceholders();
      if (state.step === 4) renderSummary();
    });

    showStep(1, { focus: false });
    applyDeepLink();
    applyPlaceholders();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
