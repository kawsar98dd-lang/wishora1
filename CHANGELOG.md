# Changelog

## Phase 3 — Signature wish experiences

### Added
- **A Love Letter** (`/wishes/love/love-01`): break a wax seal, light three stars, read the letter, send a heartbeat.
  Themes rose / midnight / blush. Own design, own interaction.
- **The Memory Jar** (`/wishes/anniversary/anniversary-01`): open a jar, draw three memory cards, read the wish, raise a glass.
  Themes ivory / emerald / twilight. A new **`kind`** choice (`together` default, `couple`, `family`) changes only the wording
  of the built-in lines, so nothing assumes a romantic relationship unless the sender picks "couple".
- Both: recipient name, optional sender, optional own message (verbatim), Bengali + English, mobile-first, keyboard-operable,
  `prefers-reduced-motion` support, replay, native share with copy fallback, personalised links `noindex,follow`.
- **Reusable infrastructure**: `js/wish-runtime.js` + `css/wish-base.css` (shared behaviour/structure, not shared look).
- **Template model**: inline `choices` enum fields (generic in `js/wish-params.js`, Creator form generator, Creator runtime and
  checker), `seo` metadata, documented status rules. **Friendship** is a `planned` template (data only: no route, no page,
  not in Creator, sitemap or links).
- Category pages `/categories/love/` and `/categories/anniversary/`; both new wishes in the sitemap and the homepage.
- Tests: `tests/browser/p3_wishes.py` (both experiences: params, hostile input, limits, Unicode, themes, languages, keyboard,
  reduced motion, no-JS, 6 widths × all scenes × 2 languages, contrast per theme) and `p3_creator.py` (Creator flow, preview/share
  URL consistency, copy and share fallbacks, back/forward, deep links, planned template safety).
- Checker: planned-template rules, SEO title/description match, choice-field and hostile-input self-tests for every template,
  unsafe-DOM scan of `js/wish-runtime.js`.

### Changed
- Birthday remains the featured wish and gains related links to the two new wishes. Homepage/About/Creator copy no longer says
  that only Birthday exists. "Coming soon" no longer lists Love and Anniversary.
- Updated obsolete Phase 1/2 assertions that assumed Birthday was the only live wish (counts, search "love", related block,
  deep link `?category=love`), keeping the original intent; `?category=friendship` now exercises the "planned" path.
- Tests are portable: `p2_more.py` no longer reads `/tmp/p1_a11y.py`; screenshots go to a temp dir; `t_misc.py` reports the
  music section as **SKIP** (never PASS) when its extra server on :8804 is absent, and its obsolete no-JS selector was updated.

### Not done / known limits
- Friendship is not implemented. Bengali copy needs native review. No Cloudflare deployment was performed or verified.
- Birthday experience itself is unchanged (its own script; not migrated to the shared runtime).

## Phase 2 — Wish Creator engine

### Added
- **`/create/`**: a real five-step Creator (Occasion → Template → Details → Preview → Share), mobile-first, bilingual,
  keyboard- and screen-reader-friendly, with a no-JavaScript explanation. Entirely client-side; no backend, storage or tracking.
- **Template data as the single source of truth** (`data/templates.js`): fields with limits, themes, languages,
  default message, routes, capabilities, `creator.enabled`. The Creator page is generated from it
  (`scripts/lib/creator-page.mjs`); adding a template needs no Creator code changes.
- **`js/wish-params.js`**: one shared implementation of sanitising, validating, parsing and building personalised URLs,
  used by both the Creator and the wish page (no drift).
- **Personalisation in the Birthday experience**: `name`, `from`, `message` (verbatim, line breaks kept), `theme`, `lang`.
  The default URL still shows the default experience; the default message now lives in template data.
- **Themes** `classic`, `elegant`, `celebration` (data-defined, token-based CSS, AA contrast on all scenes).
- **Live preview** that is the real wish page in an iframe (`embed=1`), plus Copy link, native Share when supported,
  Open wish and Create another, with honest success/error feedback and a bilingual privacy notice.
- Create CTAs everywhere (hero, create band, category page, Birthday final scene, nav, footer); `/create/` in the sitemap.
- Checker: creator route/metadata, template/theme/language integrity, creator links, unsafe-DOM patterns, runtime-string
  coverage, and hostile-input self-tests of the URL logic.

### Changed
- "Create a Wish" is no longer "coming soon"; the About, Privacy and Terms copy now describes the Creator and
  that names/messages live in the link (not on a server).
- Personalised links add `noindex,follow` (canonical remains the base page); `?lang=` in a link no longer overwrites the visitor's saved language.

### Fixed
- Radio pills no longer draw duplicate indicators; every Creator control is a 44px+ target; the preview frame has a visible focus style.
- Input `maxlength` no longer silently truncates emoji (overflow is validated and reported instead).

### Not done (by design)
AI, accounts, database, payments, ads, analytics, saved drafts, photo/music/custom-colour fields, short links.

## Phase 1 — Discovery, categories and content foundation

### Added
- **Build step** (`scripts/build.mjs`, zero dependencies): generates the homepage, category pages, About/Privacy/Terms and
  `sitemap.xml` from `data/`. Output is committed; Cloudflare needs no build.
- **Homepage redesign**: honest hero with search, "Explore Wishes" and a clearly-marked "Create a Wish (Coming soon)";
  Featured/Explore with category chips; category cards with description, real wish count and live/coming-soon state;
  "What's coming" (creator teaser + planned wishes from `data/planned.js`); rewritten "Why Wishora?"; polished footer.
- **Category page** `/categories/birthday/` (breadcrumb, intro, wish list, personalise tip, related categories, CTA).
- **Search/filter**: instant, keyboard accessible, clear button, no-results state (mentions matching coming-soon
  categories), `?search=` / `?category=` support, works together.
- **Reusable components** (`scripts/lib/components.mjs`): wish card, category card, header, footer, breadcrumb, ad slots, ranking.
- **Data model**: wish `slug/route/languages/tags/thumbnail/order`; category `description/keywords/pageTitle/intro/meta/related`;
  `data/ui.js` with every shared string in Bengali and English.
- **SEO**: unique titles/descriptions/canonicals/OG/Twitter per page; JSON-LD WebSite, WebPage/CollectionPage, BreadcrumbList
  (also injected into the Birthday page); About, Privacy, Terms pages describing real behaviour.
- **Ad slot placeholders** (hidden, empty, load nothing).
- `scripts/serve.mjs` (Cloudflare-like local server); `check-repo.mjs` now also checks i18n completeness, JSON-LD, heading
  hierarchy, ad/analytics guards, hype/popularity claims, generated-file freshness.

### Changed
- Footer: About, Contact, Privacy, Terms; Contact and social come from `config/site.js` (nothing hard-coded).
- Internal links use clean URLs; Birthday final links point to the category page.
- `js/app.js` rewritten as a ~11 KB enhancement layer (no data downloads); `set-site-url.mjs` covers all generated pages.

### Fixed
- Removed the fabricated `badge: "popular"` from the Birthday wish (content-honesty regression from Phase 0).
- 404 page linked to a removed `#discover` anchor.
- 320px horizontal overflow in the hero; featured card stuck at one grid column on desktop.

### Not done (by design)
Wish Creator, AI, authentication, database, payments, advertisements, analytics tracking, new wishes.

## Phase 0 — Repository audit & foundation hardening

### Found
- 0 of 19 homepage wish links resolved. Birthday lived in `wishes/Birthday /` (capital B, trailing space) while links used `wishes/birthday/`; 18 other links pointed at pages that don't exist.
- Birthday music path (`../assets/…`) resolved to a non-existent folder, and the audio file was never in the repo.
- Homepage claimed "100+ wishes" / "20+ moments"; footer had 4 dead `#` links; canonical/OG used `example.com`; no 404, robots, sitemap, favicon or OG image.
- README described files that did not exist.
- Accessibility: white-on-gradient buttons 3.5–4.2:1, small pink text 3.4:1, ARIA tabs without panels, icon-only duplicate links, English-only ARIA labels, mouse-only seek bar, targets under 44px, one decorative animation ignoring reduced motion.
- Bug: `hidden` buttons were shown because `.btn { display: inline-flex }` overrode it (the "continue" button was visible before the gift/candle was used).

### Changed
- Renamed `wishes/Birthday /` → `wishes/birthday/`; Birthday asset path fixed to `/assets/audio/`.
- Added config layer (`config/site.js`) and data layer (`data/`): implemented wishes, planned wishes, templates, categories. Homepage renders only implemented wishes as links; the rest show as "coming soon".
- Honest, data-driven stats; dead footer links removed (social/contact render only when configured); featured block hidden when it would duplicate the only card.
- SEO: bilingual title, description, canonical, OG, Twitter, favicon, OG image; Birthday head tags made consistent; `404.html`, `robots.txt`, `sitemap.xml`.
- Single documented site-URL placeholder + `scripts/set-site-url.mjs`.
- Internal links: Birthday final scene links to home, category and all wishes; related-wishes block wired to data.
- Accessibility: AA contrast fixes, 44px targets, localized ARIA labels, keyboard seek slider, toggle-button semantics, banner landmark, live regions, reduced-motion gaps, `[hidden]` fix.
- Performance: Google Fonts non-blocking, `defer` scripts.
- Security: sanitizer strips leftover `<`/`>`, bidi controls, caps by code point; escaped template output on the homepage; whitelist for `?category=`.
- Language preference shared between homepage and wish pages (legacy key still read).
- Added `scripts/check-repo.mjs`; rewrote README.

### Not done (by design)
Accounts, database, payments, AI, ads, analytics, backend, new wishes.


## Phase 4 — Friendship Postcard

- Implemented the Friendship Moments template as **The Friendship Postcard**, a distinct four-scene interactive experience with three revealable friendship moments, a personalised note and a high-five interaction.
- Added three themes (Sunny, Ocean, Berry), Bengali/English strings, reduced-motion styling, keyboard-operable controls and shared safe URL/runtime handling.
- Enabled Friendship in the Creator and moved it from planned to live data. Added its category landing page, SEO metadata, internal links, JSON-LD and sitemap entry through the existing build pipeline.
- Added no backend, accounts, tracking, advertising or third-party runtime dependencies.
- Bengali copy is a draft and still needs native-speaker review. Production domain and real Cloudflare deployment remain unverified.


## Phase 5 — Category content and SEO polish

- Added three practical, category-specific FAQs to each live category page (Birthday, Love, Anniversary and Friendship), with Bengali and English content.
- Rendered FAQs as native `<details>/<summary>` controls for keyboard access and no-JavaScript operation.
- Added matching FAQPage structured data using the English question-and-answer text, keeping visible content and metadata aligned.
- Added responsive FAQ styling and a visible keyboard focus indicator.
- Added `scripts/test-phase5.mjs`, a dependency-free regression check for category FAQ rendering, bilingual content, structured-data validity and responsive/focus styling.
- No production domain, tracking, ads, backend, or external runtime dependencies were introduced.
- Still requires human review of Bengali copy and real Cloudflare/device verification.
