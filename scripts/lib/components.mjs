/* =========================================================
   Reusable page components (build time).
   Each function returns an HTML string. Nothing here is page-specific;
   pages are assembled from these in scripts/lib/pages.mjs.
   ========================================================= */
import { esc, norm, makeI18n, jsonLd } from "./html.mjs";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap";

/* ---------- site model (derived once from data) ---------- */
export function buildModel({ config, data, langs }) {
  const { categories, wishes, plannedWishes, ui } = data;
  const i18n = makeI18n(langs, ui);

  const live = rankWishes(wishes.filter((w) => w.status === "live"));
  const liveCatIds = new Set(live.map((w) => w.category));
  const plannedCatIds = new Set(plannedWishes.map((w) => w.category));
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const liveCategories = categories.filter((c) => liveCatIds.has(c.id));
  const soonCategories = categories.filter((c) => !liveCatIds.has(c.id) && plannedCatIds.has(c.id));
  const highlights = plannedWishes.filter((w) => w.homeHighlight);

  /* Templates the Creator may offer: implemented, creator-enabled, and the
     final page really exists as a live wish. Occasions are derived from them. */
  const creatorTemplates = (data.templates || []).filter(
    (t) => t.status === "implemented" && t.creator && t.creator.enabled && live.some((w) => w.route === t.route)
  );
  const creatorCatIds = new Set(creatorTemplates.map((t) => t.category));

  return { config, data, langs, i18n, live, catById, liveCategories, soonCategories, highlights, liveCatIds, creatorTemplates, creatorCatIds };
}

/* ---------------------------------------------------------
   RANKING — the single place that decides wish order.
   Today it is deterministic and curated: featured first, then the
   hand-set `order`, then id. It deliberately uses NO popularity data.
   FUTURE (analytics phase): add a real, measured signal here (e.g. a
   `rank` value produced by a build-time import of anonymous aggregate
   counts) as an extra sort key. Do not invent numbers before then.
   --------------------------------------------------------- */
export function rankWishes(list) {
  return [...list].sort(
    (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      (a.order ?? 999) - (b.order ?? 999) ||
      a.id.localeCompare(b.id)
  );
}

export const wishesOf = (m, catId) => m.live.filter((w) => w.category === catId);
export const categoryUrl = (id) => `/categories/${id}/`;

/* ---------- <head> ---------- */
export function head(m, p) {
  const { config, langs } = m;
  const site = config.siteUrl;
  const url = site + p.path;
  const ogImage = site + (config.social.defaultOgImage || "/assets/images/og-default.png");
  const title = p.title;
  const desc = p.description;
  const defaultLang = config.defaultLang;
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#8B5CF6">${p.noindex ? '\n<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">

<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="${esc(config.siteName)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Wishora — beautiful digital wishes">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImage)}">${config.social.twitterHandle ? `\n<meta name="twitter:site" content="${esc(config.social.twitterHandle)}">` : ""}

<!-- Sets the .js class and the saved language before first paint (no flash). -->
<script>document.documentElement.classList.add("js");try{var l=localStorage.getItem(${JSON.stringify(config.langStorageKey)});if(l==="${langs.join('"||l==="')}")document.documentElement.lang=l}catch(e){}</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<link rel="stylesheet" href="/css/style.css">
${p.jsonld ? jsonLd(p.jsonld) : ""}`;
}

/* ---------- header ---------- */
export function header(m, current) {
  const { i18n: { t, aria } } = m;
  const link = (href, key, id, cls = "nav-link") =>
    `<a href="${href}" class="${cls}"${current === id ? ' aria-current="page"' : ""}>${t(key)}</a>`;
  return `<header class="site-header" id="siteHeader">
  <div class="header-inner container">
    <a href="/" class="brand" ${aria("ariaBrand")}>
      <span class="brand-mark" aria-hidden="true"><span class="brand-spark"></span></span>
      <span class="brand-name">Wishora</span>
    </a>
    <nav class="main-nav" id="mainNav" ${aria("ariaNavMain")}>
      <ul>
        <li>${link("/", "navHome", "home")}</li>
        <li>${link("/#explore", "navExplore", "explore")}</li>
        <li>${link("/#categories", "navCategories", "categories")}</li>
        <li>${link("/create/", "navCreate", "create")}</li>
        <li>${link("/about/", "navAbout", "about")}</li>
      </ul>
    </nav>
    <div class="header-actions">
      <button type="button" class="lang-toggle" id="langToggle" ${aria("ariaLang")} aria-pressed="false">
        <span class="lang-option" data-lang="bn" lang="bn">বাং</span>
        <span class="lang-divider" aria-hidden="true">/</span>
        <span class="lang-option" data-lang="en" lang="en">EN</span>
      </button>
      <a href="/#explore" class="btn btn-primary btn-header">${t("exploreCta")}</a>
      <button type="button" class="menu-toggle" id="menuToggle" ${aria("ariaMenuOpen")} ${aria("ariaMenuClose", null, "data-aria-close")} aria-expanded="false" aria-controls="mobileMenu">
        <span class="menu-line"></span><span class="menu-line"></span><span class="menu-line"></span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <nav ${aria("ariaNavMobile")}>
      <ul>
        <li>${link("/", "navHome", "home", "mobile-nav-link")}</li>
        <li>${link("/#explore", "navExplore", "explore", "mobile-nav-link")}</li>
        <li>${link("/#categories", "navCategories", "categories", "mobile-nav-link")}</li>
        <li>${link("/create/", "navCreate", "create", "mobile-nav-link")}</li>
        <li>${link("/about/", "navAbout", "about", "mobile-nav-link")}</li>
      </ul>
    </nav>
    <a href="/#explore" class="btn btn-primary mobile-cta">${t("exploreCta")}</a>
  </div>
</header>`;
}

/* ---------- footer ---------- */
export function footer(m) {
  const { i18n: { t } } = m;
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="/" class="brand" ${m.i18n.aria("ariaBrand")}>
        <span class="brand-mark" aria-hidden="true"><span class="brand-spark"></span></span>
        <span class="brand-name">Wishora</span>
      </a>
      <p class="footer-desc">${t("footerDesc")}</p>
    </div>
    <nav class="footer-col" ${m.i18n.aria("footerNavTitle")}>
      <p class="footer-col-title">${t("footerNavTitle")}</p>
      <ul>
        <li><a href="/">${t("navHome")}</a></li>
        <li><a href="/#explore">${t("navExplore")}</a></li>
        <li><a href="/#categories">${t("navCategories")}</a></li>
        <li><a href="/create/">${t("navCreate")}</a></li>
        <li><a href="/about/">${t("navAbout")}</a></li>
      </ul>
    </nav>
    <nav class="footer-col" ${m.i18n.aria("footerInfoTitle")}>
      <p class="footer-col-title">${t("footerInfoTitle")}</p>
      <ul>
        <li><a href="/privacy/">${t("footerPrivacy")}</a></li>
        <li><a href="/terms/">${t("footerTerms")}</a></li>
        <li><a href="/about/#contact">${t("footerContact")}</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <p class="footer-col-title">${t("footerLangTitle")}</p>
      <ul>
        <li><button type="button" class="footer-lang-btn js-only" data-lang="bn" lang="bn">বাংলা</button></li>
        <li><button type="button" class="footer-lang-btn js-only" data-lang="en" lang="en">English</button></li>
      </ul>
    </div>
    <!-- Filled by js/app.js from config/site.js → social. Hidden until set. -->
    <div class="footer-col" id="footerSocialCol" hidden>
      <p class="footer-col-title">${t("footerSocial")}</p>
      <ul class="footer-social" id="footerSocialList"></ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; 2026 Wishora. ${t("footerRights")}</p>
  </div>
</footer>`;
}

/* ---------- breadcrumb ---------- */
export function breadcrumb(m, crumbs) {
  /* crumbs: [{ label:{bn,en}, href? }] — last item is the current page. */
  const { i18n: { bi, aria } } = m;
  const items = crumbs
    .map((c, i) =>
      i < crumbs.length - 1
        ? `<li><a href="${c.href}">${bi(c.label)}</a></li>`
        : `<li aria-current="page">${bi(c.label)}</li>`
    )
    .join("");
  return `<nav class="breadcrumb" ${aria("ariaBreadcrumb")}><ol>${items}</ol></nav>`;
}

export function breadcrumbLd(m, crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label.en,
      item: m.config.siteUrl + c.path
    }))
  };
}

/* ---------- ad slots: disabled, invisible, no network ----------
   Layout hooks only. They render as empty hidden elements. To enable
   later: set config.ads.enabled, remove `hidden`, and load the provider
   from a deliberate, reviewed change — nothing here loads any script. */
export function adSlot(name) {
  return `<div class="ad-slot" data-ad-slot="${name}" hidden aria-hidden="true"></div>`;
}

/* ---------- wish card ---------- */
export function wishCard(m, w, level = 4) {
  const { i18n: { bi, t, tx, aria }, catById, langs } = m;
  const cat = catById[w.category];
  const search = norm(
    [
      ...langs.map((l) => w.title[l]),
      ...langs.map((l) => w.description[l]),
      ...langs.map((l) => cat.label[l]),
      ...langs.flatMap((l) => (cat.keywords?.[l] || [])),
      ...langs.flatMap((l) => (w.tags?.[l] || []))
    ].join(" ")
  );
  const langNames = { bn: "বাংলা", en: "English" };
  const chips = (w.languages || [])
    .map((l) => `<li lang="${l}">${esc(langNames[l] || l)}</li>`)
    .join("");
  return `<li class="wish-item${w.featured ? " is-featured-item" : ""}" data-wish data-category="${esc(w.category)}" data-search="${esc(search)}">
  <article class="wish-card${w.featured ? " is-featured" : ""}">
    <div class="wish-thumb thumb-${esc(w.thumbnail.theme)}" aria-hidden="true"><span class="wish-thumb-icon">${esc(w.thumbnail.icon)}</span></div>
    <div class="wish-body">
      <p class="wish-meta"><a class="wish-cat" href="${categoryUrl(w.category)}">${bi(cat.label)}</a>${w.featured ? ` <span class="featured-tag">${t("featuredTag")}</span>` : ""}</p>
      <h${level} class="wish-title"><a class="wish-link" href="${w.route}">${bi(w.title)}</a></h${level}>
      <p class="wish-desc">${bi(w.description)}</p>
      <ul class="lang-chips" ${aria("languagesLabel")}>${chips}</ul>
      <span class="wish-open" aria-hidden="true">${t("openWish")} →</span>
    </div>
  </article>
</li>`;
}

/* ---------- category card (live = link, soon = plain card) ---------- */
export function categoryCard(m, c) {
  const { i18n: { bi, t }, liveCatIds } = m;
  const isLive = liveCatIds.has(c.id);
  const n = wishesOf(m, c.id).length;
  const count = n === 1 ? t("wishCountOne") : t("wishCountMany", { n });
  if (isLive) {
    return `<li><article class="cat-card is-live">
  <span class="cat-icon" aria-hidden="true">${esc(c.icon)}</span>
  <h3 class="cat-name"><a class="cat-link" href="${categoryUrl(c.id)}">${bi(c.label)}</a></h3>
  <p class="cat-desc">${bi(c.description)}</p>
  <p class="cat-meta"><span class="cat-count">${count}</span><span class="cat-go" aria-hidden="true">${t("viewCategory")} →</span></p>
</article></li>`;
  }
  const soonSearch = norm(
    [...m.langs.map((l) => c.label[l]), ...m.langs.flatMap((l) => c.keywords?.[l] || [])].join(" ")
  );
  return `<li data-soon data-search="${esc(soonSearch)}"><article class="cat-card is-soon">
  <span class="cat-icon" aria-hidden="true">${esc(c.icon)}</span>
  <h3 class="cat-name">${bi(c.label)}</h3>
  <p class="cat-desc">${bi(c.description)}</p>
  <p class="cat-meta"><span class="soon-tag">${t("soon")}</span></p>
</article></li>`;
}

/* ---------- shared JSON-LD nodes ---------- */
export function siteLd(m) {
  const site = m.config.siteUrl;
  return {
    "@type": "WebSite",
    "@id": `${site}/#website`,
    url: `${site}/`,
    name: m.config.siteName,
    inLanguage: m.langs
  };
}
