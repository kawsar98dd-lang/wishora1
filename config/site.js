/* =========================================================
   WISHORA — SITE CONFIGURATION
   config/site.js

   The single place for site-wide values that page scripts read.
   Loaded as a plain <script> (no build step) and exposes
   window.WISHORA_CONFIG.

   IMPORTANT — the site URL lives in TWO kinds of places:
   1. Here (siteUrl) — read by JavaScript.
   2. Static files that crawlers read WITHOUT running JavaScript:
      index.html, 404.html (none), every wish page under wishes/,
      sitemap.xml and robots.txt.
      Those contain the placeholder host  SITE_URL_PLACEHOLDER
      (written there as an https:// URL).

   To set the real domain once, run:
       node scripts/set-site-url.mjs https://your-real-domain.com
   which replaces the token in every file (including this one).
   Or find/replace  SITE_URL_PLACEHOLDER  by hand.

   Do NOT put production analytics or advertising IDs in this
   repository until those features are implemented (see README).
   ========================================================= */
(function () {
  "use strict";

  window.WISHORA_CONFIG = Object.freeze({
    siteName: "Wishora",
    tagline: {
      bn: "অনুভূতিকে করে তুলুন আরও বিশেষ।",
      en: "Make Every Feeling a Little More Special."
    },

    /* Absolute site origin, no trailing slash. See note above. */
    siteUrl: "https://SITE_URL_PLACEHOLDER",

    /* Languages */
    defaultLang: "bn",
    supportedLangs: ["bn", "en"],
    langStorageKey: "wishora_lang",

    /* Social / sharing metadata.
       Leave a value as "" until it exists — empty values are never
       rendered, so no dead links appear in the footer. */
    social: {
      defaultOgImage: "/assets/images/og-default.png", /* path from site root */
      twitterHandle: "",   /* e.g. "@wishora" */
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: ""
    },

    /* Shown in the footer as a mailto: link only when set. */
    contactEmail: "",

    /* PLACEHOLDERS ONLY — nothing reads these yet.
       Analytics and advertising are intentionally NOT implemented in
       Phase 0. Keep enabled:false and ids empty. */
    analytics: {
      enabled: false,
      provider: "",
      measurementId: ""
    },
    ads: {
      enabled: false,
      provider: "",
      publisherId: ""
    }
  });
})();
