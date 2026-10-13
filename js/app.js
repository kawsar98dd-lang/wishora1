/* =========================================================
   WISHORA — RUNTIME (all pages)
   js/app.js

   Pages are pre-rendered by scripts/build.mjs in BOTH languages, so this
   file only enhances:
     • language switching (+ saved preference)
     • mobile menu, header scroll state
     • footer social/contact from config/site.js
     • homepage search + category filter (progressive enhancement)
   No frameworks, no network requests, no data files to download.
   ========================================================= */
(function () {
  "use strict";

  const config = window.WISHORA_CONFIG || {};
  const LANGS = Array.isArray(config.supportedLangs) && config.supportedLangs.length ? config.supportedLangs : ["bn", "en"];
  const DEFAULT_LANG = LANGS.indexOf(config.defaultLang) !== -1 ? config.defaultLang : "bn";
  const LANG_KEY = config.langStorageKey || "wishora_lang";
  const MAX_QUERY = 80;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const html = document.documentElement;

  const state = { lang: DEFAULT_LANG, category: "all", query: "" };

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) { return null; }
    return null;
  }
  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  /* Search normalisation — MUST stay identical to norm() in scripts/lib/html.mjs. */
  function norm(s) {
    return String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").toLowerCase();
  }

  /* ---------- language ---------- */
  const dom = {
    langToggle: $("#langToggle"),
    menuToggle: $("#menuToggle"),
    mobileMenu: $("#mobileMenu"),
    header: $("#siteHeader")
  };

  function menuOpen() {
    return !!dom.menuToggle && dom.menuToggle.getAttribute("aria-expanded") === "true";
  }

  function applyLang(lang, persist) {
    if (LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    state.lang = lang;
    html.setAttribute("lang", lang);
    if (persist) store(LANG_KEY, lang);

    if (dom.langToggle) dom.langToggle.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    $$(".footer-lang-btn").forEach((b) => b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"));

    $$("[data-aria-" + lang + "]").forEach((el) => el.setAttribute("aria-label", el.getAttribute("data-aria-" + lang)));
    $$("[data-ph-" + lang + "]").forEach((el) => el.setAttribute("placeholder", el.getAttribute("data-ph-" + lang)));
    updateMenuLabel();
    renderStatus();
    /* Lets page scripts (e.g. js/creator.js) refresh text that depends on language. */
    document.dispatchEvent(new CustomEvent("wishora:langchange", { detail: { lang: lang } }));
  }

  function setupLanguage() {
    const stored = store(LANG_KEY);
    applyLang(LANGS.indexOf(stored) !== -1 ? stored : html.getAttribute("lang") || DEFAULT_LANG, false);

    if (dom.langToggle) {
      dom.langToggle.addEventListener("click", () => applyLang(state.lang === "bn" ? "en" : "bn", true));
    }
    $$(".footer-lang-btn").forEach((btn) =>
      btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang"), true))
    );
  }

  /* ---------- mobile menu ---------- */
  function updateMenuLabel() {
    if (!dom.menuToggle) return;
    const key = menuOpen() ? "data-aria-close-" : "data-aria-";
    const label = dom.menuToggle.getAttribute(key + state.lang);
    if (label) dom.menuToggle.setAttribute("aria-label", label);
  }

  function setupMenu() {
    if (!dom.menuToggle || !dom.mobileMenu) return;
    function setOpen(open) {
      dom.menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      dom.mobileMenu.classList.toggle("is-open", open);
      dom.mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      updateMenuLabel();
    }
    dom.menuToggle.addEventListener("click", () => setOpen(!menuOpen()));
    dom.mobileMenu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOpen()) { setOpen(false); dom.menuToggle.focus(); }
    });
  }

  function setupHeaderScroll() {
    if (!dom.header) return;
    const update = () => dom.header.classList.toggle("is-scrolled", window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- footer + contact from config ---------- */
  function safeUrl(value) {
    try { const u = new URL(value); return u.protocol === "https:" || u.protocol === "http:"; } catch (e) { return false; }
  }

  function setupConfigContent() {
    const social = config.social || {};
    const entries = [["Facebook", social.facebookUrl], ["Instagram", social.instagramUrl], ["TikTok", social.tiktokUrl]]
      .filter((e) => e[1] && safeUrl(e[1]));
    const col = $("#footerSocialCol");
    const list = $("#footerSocialList");
    if (col && list) {
      entries.forEach((e) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = e[1]; a.textContent = e[0]; a.rel = "noopener noreferrer me"; a.target = "_blank";
        li.appendChild(a); list.appendChild(li);
      });
      col.hidden = entries.length === 0;
    }

    const box = $("#contactBox");
    if (box) {
      const email = typeof config.contactEmail === "string" ? config.contactEmail.trim() : "";
      if (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) {
        const link = $("#contactLink", box);
        link.href = "mailto:" + email;
        link.textContent = email;
        $("[data-contact-empty]", box).hidden = true;
        $("[data-contact-filled]", box).hidden = false;
      }
    }
  }

  /* =======================================================
     EXPLORE: search + category filter over pre-rendered cards
  ======================================================= */
  const ex = {
    input: $("#searchInput"),
    form: $("#searchForm"),
    clear: $("#searchClear"),
    chips: $$("#chips .chip"),
    items: $$("[data-wish]"),
    groups: $$("[data-group]"),
    status: $("#resultsStatus"),
    empty: $("#emptyState"),
    emptySoon: $("#emptySoon"),
    emptySoonNames: $("#emptySoonNames"),
    feedback: $("#searchFeedback"),
    feedbackText: $("#searchFeedbackText"),
    soon: $$("[data-soon]")
  };
  let idleStatusHtml = ex.status ? ex.status.innerHTML : "";
  let visibleCount = ex.items.length;

  const isFiltering = () => state.category !== "all" || norm(state.query).trim() !== "";

  function resultsText(n) {
    if (!ex.status) return "";
    const key = n === 0 ? "none" : n === 1 ? "one" : "many";
    const tpl = ex.status.getAttribute("data-" + key + "-" + state.lang) || "";
    return tpl.replace("{n}", String(n));
  }

  function renderStatus() {
    if (!ex.status) return;
    if (!isFiltering()) {
      ex.status.innerHTML = idleStatusHtml;
      if (ex.feedback) ex.feedback.hidden = true;
    } else {
      ex.status.textContent = resultsText(visibleCount);
      if (ex.feedback) {
        ex.feedbackText.textContent = resultsText(visibleCount);
        /* The hero feedback line only matters while a text query is active. */
        ex.feedback.hidden = norm(state.query).trim() === "";
      }
    }
    renderSoonNames();
  }

  function renderSoonNames() {
    if (!ex.emptySoon) return;
    const tokens = norm(state.query).split(/\s+/).filter(Boolean);
    let names = [];
    if (visibleCount === 0 && tokens.length) {
      names = ex.soon
        .filter((li) => tokens.every((t) => li.getAttribute("data-search").indexOf(t) !== -1))
        .map((li) => {
          const span = li.querySelector('.cat-name [data-l="' + state.lang + '"]');
          return span ? span.textContent : "";
        })
        .filter(Boolean);
    }
    ex.emptySoon.hidden = names.length === 0;
    ex.emptySoonNames.textContent = names.join(", ");
  }

  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    const params = new URLSearchParams();
    if (state.query.trim()) params.set("search", state.query.trim());
    if (state.category !== "all") params.set("category", state.category);
    const qs = params.toString();
    try {
      window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
    } catch (e) { /* ignore (e.g. file://) */ }
  }

  function applyFilter() {
    const tokens = norm(state.query).split(/\s+/).filter(Boolean);
    let count = 0;
    ex.items.forEach((li) => {
      const okCat = state.category === "all" || li.getAttribute("data-category") === state.category;
      const hay = li.getAttribute("data-search") || "";
      const ok = okCat && tokens.every((t) => hay.indexOf(t) !== -1);
      li.hidden = !ok;
      if (ok) count++;
    });
    visibleCount = count;
    ex.groups.forEach((g) => { g.hidden = !g.querySelector("[data-wish]:not([hidden])"); });

    ex.chips.forEach((c) => {
      const active = c.getAttribute("data-category") === state.category;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (ex.clear) ex.clear.hidden = state.query === "";
    if (ex.empty) ex.empty.hidden = count !== 0;
    renderStatus();
    syncUrl();
  }

  function setupExplore() {
    if (!ex.status) return;

    /* Initial state from the URL: ?search=…&category=… */
    try {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get("search") || "").replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, MAX_QUERY);
      const c = params.get("category") || "all";
      state.query = q;
      state.category = ex.chips.some((chip) => chip.getAttribute("data-category") === c) ? c : "all";
    } catch (e) { /* ignore */ }
    if (ex.input) ex.input.value = state.query;
    if (isFiltering()) applyFilter();

    if (ex.input) {
      ex.input.addEventListener("input", () => {
        state.query = ex.input.value.slice(0, MAX_QUERY);
        applyFilter();
      });
    }
    if (ex.form) {
      ex.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const target = $("#explore");
        if (target) {
          target.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
          const h = $("#explore-title");
          if (h) h.focus({ preventScroll: true });
        }
      });
    }
    if (ex.clear) {
      ex.clear.addEventListener("click", () => {
        state.query = "";
        ex.input.value = "";
        applyFilter();
        ex.input.focus();
      });
    }
    ex.chips.forEach((chip) =>
      chip.addEventListener("click", () => {
        state.category = chip.getAttribute("data-category");
        applyFilter();
      })
    );
    const clearAll = $("#clearAll");
    if (clearAll) {
      clearAll.addEventListener("click", () => {
        state.query = "";
        state.category = "all";
        if (ex.input) { ex.input.value = ""; ex.input.focus(); }
        applyFilter();
      });
    }
  }

  function init() {
    setupLanguage();
    setupMenu();
    setupHeaderScroll();
    setupConfigContent();
    setupExplore();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
