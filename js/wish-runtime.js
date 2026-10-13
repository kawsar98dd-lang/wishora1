/* =========================================================
   WISHORA — SHARED WISH RUNTIME (Phase 3)
   js/wish-runtime.js — used by the Love and Anniversary experiences.
   (The Birthday page predates it and keeps its own script.)

   Handles everything that is not the experience itself:
     • template lookup from data/templates.js (the single source of truth)
     • URL parameters via WishoraParams (hostile input, allow-lists)
     • language (URL ?lang= > saved choice > site default), theme class,
       embed mode, noindex for personalised links
     • data-i18n / data-bind text rendering — ALWAYS with textContent
     • scene switching with focus management, toast, copy/share fallback
   Nothing here builds HTML from user input, fetches anything or stores
   anything except the shared language preference.
   ========================================================= */
(function () {
  "use strict";

  var Params = window.WishoraParams;
  var data = window.WISHORA_DATA || {};
  var config = window.WISHORA_CONFIG || {};

  function reduced() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: fine */ }
    return null;
  }

  function init(opts) {
    var TPL = (data.templates || []).filter(function (t) { return t.id === opts.templateId && t.status === "implemented"; })[0];
    if (!TPL || !Params) return null;

    var LANGS = (config.supportedLangs || ["bn", "en"]).filter(function (l) { return TPL.languages.indexOf(l) !== -1; });
    var DEFAULT = LANGS.indexOf(config.defaultLang) !== -1 ? config.defaultLang : LANGS[0];
    var KEY = config.langStorageKey || "wishora_lang";
    var parsed = Params.parse(window.location.search, TPL);
    var embedded = parsed.embed && window.self !== window.top;
    var personalised = parsed.personalised || parsed.embed;
    var body = document.body;
    var root = document.documentElement;
    var listeners = [];

    var api = {
      template: TPL,
      values: parsed,
      reduced: reduced,
      embedded: embedded,
      lang: DEFAULT,
      scene: 1
    };

    /* ---- translations: strings, or functions of one argument ---- */
    api.t = function (key, arg) {
      var dict = opts.translations[api.lang] || opts.translations[DEFAULT] || {};
      var v = dict[key];
      if (v === undefined) v = (opts.translations[DEFAULT] || {})[key];
      return typeof v === "function" ? v(arg) : (v === undefined ? "" : v);
    };

    /* ---- theme: only a class derived from the template's own list ---- */
    TPL.themes.forEach(function (th) { root.classList.remove(th.cssClass); });
    var theme = TPL.themes.filter(function (th) { return th.id === parsed.theme; })[0] || TPL.themes[0];
    root.classList.add(theme.cssClass);
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta && opts.themeColors && opts.themeColors[theme.id]) themeMeta.setAttribute("content", opts.themeColors[theme.id]);
    if (embedded) body.classList.add("is-embedded");

    if (personalised) {
      var robots = document.createElement("meta");
      robots.name = "robots"; robots.content = "noindex,follow";
      document.head.appendChild(robots);
    }

    /* ---- rendering ---- */
    function messageText() {
      if (parsed.message) return parsed.message;           /* verbatim, never translated */
      var d = TPL.defaults && TPL.defaults.message;
      return d ? (d[api.lang] || d[DEFAULT] || "") : "";
    }
    function name() { return parsed.name || api.t("fallbackName"); }

    function render() {
      body.setAttribute("data-lang", api.lang);
      root.setAttribute("lang", api.lang);
      var q = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
      q("[data-i18n]").forEach(function (el) { el.textContent = api.t(el.getAttribute("data-i18n"), name()); });
      q("[data-i18n-aria-label]").forEach(function (el) { el.setAttribute("aria-label", api.t(el.getAttribute("data-i18n-aria-label"), name())); });
      q("[data-bind=name]").forEach(function (el) { el.textContent = name(); });
      q("[data-bind=message]").forEach(function (el) { el.textContent = messageText(); });
      q("[data-bind=from]").forEach(function (el) {
        el.hidden = !parsed.from;
        el.textContent = parsed.from ? api.t("senderLine", parsed.from) : "";
      });
      var toggle = document.getElementById("langToggle");
      if (toggle) toggle.setAttribute("aria-pressed", api.lang === "en" ? "true" : "false");
      var title = parsed.name ? api.t("titleWithName", parsed.name) : api.t("titleFallback");
      document.title = title;
      [["ogTitle", title], ["twitterTitle", title]].forEach(function (p) {
        var m = document.getElementById(p[0]); if (m) m.setAttribute("content", title);
      });
      listeners.forEach(function (fn) { fn(api.lang); });
    }

    api.onRender = function (fn) { listeners.push(fn); };
    api.setLang = function (l, persist) {
      if (LANGS.indexOf(l) === -1) l = DEFAULT;
      api.lang = l;
      if (persist !== false) store(KEY, l);
      render();
    };

    var stored = store(KEY);
    api.lang = parsed.lang || (LANGS.indexOf(stored) !== -1 ? stored : DEFAULT);

    var toggle = document.getElementById("langToggle");
    if (toggle) toggle.addEventListener("click", function () {
      /* The URL language is the sender's choice; a manual switch is the visitor's. */
      api.setLang(api.lang === "bn" ? "en" : "bn");
    });

    /* ---- scenes ---- */
    var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".progress i"));
    api.show = function (n, focus) {
      n = Math.min(Math.max(n, 1), scenes.length);
      api.scene = n;
      scenes.forEach(function (s, i) { s.classList.toggle("is-active", i + 1 === n); });
      dots.forEach(function (d, i) { d.classList.toggle("is-current", i + 1 === n); d.classList.toggle("is-done", i + 1 < n); });
      if (focus !== false) {
        var h = scenes[n - 1].querySelector("h1,h2");
        if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
        window.scrollTo(0, 0);
      }
    };
    api.total = scenes.length;

    /* ---- toast, copy, share ---- */
    var toastEl = document.getElementById("toast"), timer = null;
    api.toast = function (msg) {
      if (!toastEl || !msg) return;
      toastEl.textContent = msg; toastEl.classList.add("is-visible");
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2800);
    };
    api.shareUrl = function () {
      if (!personalised) return window.location.origin + window.location.pathname;
      var vals = { name: parsed.name, from: parsed.from, message: parsed.message, theme: parsed.theme, lang: parsed.lang, choices: parsed.choices };
      return Params.build(window.location.origin, TPL, vals).url;
    };
    function copy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
      return new Promise(function (ok, fail) {
        try {
          var ta = document.createElement("textarea");
          ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta); ta.select();
          var done = document.execCommand && document.execCommand("copy");
          document.body.removeChild(ta);
          done ? ok() : fail(new Error("copy failed"));
        } catch (e) { fail(e); }
      });
    }
    var shareBtn = document.getElementById("shareBtn");
    if (shareBtn) shareBtn.addEventListener("click", function () {
      var url = api.shareUrl();
      if (typeof navigator.share === "function") {
        try {
          navigator.share({ title: api.t("shareTitle", name()), text: api.t("shareText", name()), url: url })
            .catch(function (err) { if (!err || err.name !== "AbortError") api.toast(api.t("shareFailed")); });
        } catch (e) { api.toast(api.t("shareFailed")); }
        return;
      }
      copy(url).then(function () { api.toast(api.t("linkCopied")); }, function () { api.toast(api.t("shareFailed")); });
    });

    render();
    var first = scenes[0];
    api.show(1, false);
    if (first) first.setAttribute("tabindex", "-1");
    return api;
  }

  window.WishoraWish = { init: init };
})();
