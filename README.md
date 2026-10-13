# Wishora

A premium, bilingual (বাংলা / English) digital-wishes site. Plain HTML, CSS and
JavaScript. **No framework, and nothing to build or install to deploy it.**

Status: **Phase 3 (Signature wish experiences).** Three experiences are live — **Birthday Surprise**,
**A Love Letter** and **The Memory Jar** (anniversary) — and each can be personalised at `/create/` and shared as a
single link. **Friendship is planned only** (data model prepared, no page, never offered or linked). Everything else
on the roadmap is marked "coming soon". There is **no backend**: the link carries the wish.

| Experience | Route | Interaction | Themes | Extra field |
|---|---|---|---|---|
| Birthday Surprise | `/wishes/birthday/birthday-01` | 8-scene surprise (Phase 0–2) | classic, elegant, celebration | — |
| A Love Letter | `/wishes/love/love-01` | break the wax seal → light 3 stars → read the letter → send a heartbeat | rose, midnight, blush | — |
| The Memory Jar | `/wishes/anniversary/anniversary-01` | open the jar → draw 3 memory cards → read the wish → raise a glass | ivory, emerald, twilight | `kind` = `together` (default, neutral) / `couple` / `family` |
| Friendship Moments | — | **planned, not built** | — | — |

## Architecture

```
data/*.js + config/site.js  ──►  node scripts/build.mjs  ──►  committed static HTML
                                      (build time only)        (what Cloudflare serves)
```

- **Content lives in data files** (`data/`). Pages are **generated** from them by
  `scripts/build.mjs` and the generated HTML is committed. Cloudflare Pages runs no build.
- Generated pages are **pre-rendered in both languages** (`<span data-l="bn">…</span><span data-l="en">…</span>`);
  CSS shows the active one (`html[lang]`). They are crawlable and fully usable
  **without JavaScript**.
- `js/app.js` is a small enhancement layer: language switch, mobile menu, search + category
  filter, footer social/contact from config. No data download, no libraries.
- Implemented / planned / template data are kept apart on purpose:

  | File | Meaning | Linked? | In sitemap? |
  |---|---|---|---|
  | `data/wishes.js` | wishes whose page exists | yes | yes |
  | `data/planned.js` | roadmap wishes, no page | **never** (no `path`) | no |
  | `data/templates.js` | **template definitions: fields, limits, themes, languages, default message, routes — the single source of truth for the Creator and the wish page** | – | – |
  | `data/categories.js` | every category, descriptions, keywords | live ones only | live ones |
  | `data/ui.js` | all shared UI strings, `{bn, en}` | – | – |

## Folder structure

```
/
├── index.html                 GENERATED  homepage
├── categories/birthday/       GENERATED  one folder per LIVE category
├── about/ privacy/ terms/     GENERATED  content pages
├── create/                    GENERATED  the Wish Creator page
├── 404.html                   hand-written, root-absolute paths, no JS needed
├── sitemap.xml                GENERATED  from data
├── robots.txt
├── config/site.js             site name, URL, languages, social, contact, analytics/ads placeholders
├── data/                      categories, wishes, planned, templates, ui
├── css/style.css, 404.css
├── js/app.js                  site runtime (language, menu, search)
├── js/wish-params.js          SHARED url sanitising/validating/parsing/building (Creator + wish pages)
├── js/wish-runtime.js         SHARED runtime for Love/Anniversary pages (language, theme, noindex, scenes, share)
├── js/creator.js              the Creator (state machine, validation, preview, share)
├── css/wish-base.css          SHARED structure for Love/Anniversary pages (look comes from each page's own CSS)
├── wishes/birthday/           the Birthday experience (hand-built; only its JSON-LD block is generated)
├── wishes/love/               "A Love Letter"   (love-01.html/.css/.js — own design and interaction)
├── wishes/anniversary/        "The Memory Jar"  (anniversary-01.html/.css/.js — own design and interaction)
├── tests/browser/             Playwright suites + readme.txt (see "Tests")
├── assets/{images,icons,audio}
└── scripts/
    ├── build.mjs              data → pages + sitemap
    ├── lib/                   components, page templates (incl. creator-page.mjs), content pages, loaders
    ├── check-repo.mjs         integrity / honesty / a11y-structure checker
    ├── serve.mjs              Cloudflare-like local server
    └── set-site-url.mjs       replaces the site-URL placeholder
```

**Do not hand-edit generated files** (they start with a `GENERATED` comment). Edit data or
`scripts/lib/*`, then run `node scripts/build.mjs`. `check-repo.mjs` fails if they are stale.

Naming: lowercase, `a–z 0–9 . - _`, no spaces (Cloudflare is case-sensitive). Internal links
use root-absolute clean URLs (`/categories/birthday/`, `/wishes/birthday/birthday-01`).

## Local development

Node 18+ is needed only for the optional scripts (never for deploying):

```bash
node scripts/serve.mjs          # http://localhost:8000 — behaves like Cloudflare Pages
node scripts/build.mjs          # regenerate pages after editing data/ or scripts/lib/
node scripts/check-repo.mjs     # run before every commit; must report 0 errors
```

Use `serve.mjs`, not `python -m http.server`: pages link to clean URLs
(`/wishes/birthday/birthday-01`, no `.html`) which a plain static server cannot resolve.
Absolute paths also mean opening files via `file://` is not supported.

## Deployment (Cloudflare Pages)

1. Push to GitHub/GitLab.
2. Workers & Pages → Create → Pages → Connect to Git.
3. **Framework preset: None · Build command: *(empty)* · Output directory: `/`.**
4. Deploy, add your custom domain.
5. Set the site URL (below), run `node scripts/build.mjs`, commit, redeploy.

Cloudflare serves `404.html` for unknown URLs, serves `x.html` as `/x`, redirects the `.html` form,
and `/dir` → `/dir/`. Canonicals and the sitemap use those clean forms. *(Behaviour assumed from
Cloudflare's documentation and emulated locally; confirm on first deploy.)*

## Configuration

### Site URL (required before launch)
Crawlers don't run JS, so the absolute URL is written into static files as the single placeholder
`https://SITE_URL_PLACEHOLDER` (canonical, `og:url`, `og:image`, JSON-LD, sitemap, robots, `config/site.js`).

```bash
node scripts/set-site-url.mjs https://your-domain.com      # --dry-run to preview
node scripts/set-site-url.mjs --check                      # exits 1 if the placeholder remains
node scripts/build.mjs --check                             # still passes afterwards
```

### `config/site.js`
`siteName`, `siteUrl`, `defaultLang`, `supportedLangs`, `langStorageKey`,
`social.{facebookUrl,instagramUrl,tiktokUrl,twitterHandle,defaultOgImage}`, `contactEmail`,
`analytics`, `ads`.
- Empty `contactEmail` → About page says no address is published yet and no mailto appears.
- Empty social URLs → no social column in the footer.
- `analytics` and `ads` are **placeholders only**. Nothing reads them and `check-repo` fails if they
  are enabled. No ad IDs or tracking IDs belong in this repository yet.

## Content model

### Add a wish
1. Build the page at `wishes/<category>/<category>-<nn>.html` (copy `birthday-01.*`; keep the
   `<!-- build:jsonld -->` markers and the site-URL placeholder in the head).
2. Add it to `data/wishes.js` (`slug`, `route`, `path`, `category`, `template`, `title`/`description`
   `{bn,en}`, `languages`, `tags`, `thumbnail`, `featured`, `order`, `related`). Remove it from
   `data/planned.js` if it was there. **No popularity/ratings fields are allowed.**
3. If its category has no page yet: ensure the category has `pageTitle`, `meta`, `intro` in `data/categories.js`.
4. `node scripts/build.mjs && node scripts/check-repo.mjs`.
Homepage cards, the category page, JSON-LD and the sitemap update automatically.

### Add a category
Append `{ id, icon, label, description, keywords }` to `data/categories.js`. With only planned wishes it shows as
"Coming soon". When its first wish goes live it also needs `pageTitle`, `meta`, `intro` (bn+en) and a
category page is generated at `/categories/<id>/`.

### Add or change UI text
Edit `data/ui.js`. Every key needs both `bn` and `en` (the checker enforces this).
Adding a language: add its code to `supportedLangs` and a value to every key.

### Ordering and future ranking
`rankWishes()` in `scripts/lib/components.mjs` decides order: featured first, then curated `order`,
then id. **No popularity data exists, and none is shown.** A future analytics-based rank is meant to be
added there as another sort key.

## Wish Creator

### Flow
`/create/` → **1 Occasion → 2 Template → 3 Details → 4 Preview → 5 Share**. Everything runs in the browser.
Nothing is saved: going back and forth keeps what you typed (the form stays in the page), but a page reload
starts over (the finished link is the only thing that persists).

- Occasions are the categories that have at least one creator-enabled template; others appear only as a
  non-interactive "Coming soon" list.
- The preview is the **real wish page** embedded in an `<iframe>` with the same parameters plus `embed=1`
  (which only hides site navigation). There is no separate preview implementation.
- Deep links: `/create/?category=birthday` (and optionally `&template=birthday-surprise`) start at step 2.
  Unknown values are ignored with a friendly notice.
- Without JavaScript the page explains that it is required and links to the ready-made wish.

### Architecture (single source of truth)
```
data/templates.js ──► scripts/build.mjs ──► create/index.html (options, fields, themes rendered in both languages)
        │                                         │
        └────────────► js/creator.js ◄─────────────┘  (reads the same template data at runtime)
        └────────────► wishes/<cat>/<slug>.js      (the wish page reads the same data)
js/wish-params.js is shared by the Creator and the wish page.
```
A template defines `fields`, `themes`, `languages`, `defaults.message`, `route`/`previewRoute` and `creator.enabled`.
Nothing about Birthday is hard-coded in the Creator: add a template to the data and it appears.
The Birthday experience is **not duplicated**: the Creator only feeds parameters to the existing page.

### Supported fields (Birthday Surprise)
| Field | Param | Rules |
|---|---|---|
| Recipient name | `name` | required, max 40 characters (Unicode code points), tags/control/bidi characters removed, whitespace collapsed |
| Sender name | `from` | optional, max 40 |
| Message | `message` | optional (otherwise the template's default message is used), max 240; shown **verbatim** with line breaks (CRLF → LF, control/bidi characters removed, more than one blank line collapsed, trimmed); never translated |
| Theme | `theme` | one of the template's theme ids (default `classic`) |
| Language | `lang` | one of the template's languages (`language` is accepted as an alias) |

### Themes
`classic` (default look), `elegant` (plum + gold, serif headings), `celebration` (orange + teal). Defined in
`data/templates.js`; their CSS is `html.theme-<id>` token overrides in the template's stylesheet. Users can only
choose an id from the list; they can never supply CSS. All themes pass AA contrast on all 8 scenes.

### Generated URL
`https://<site>/wishes/birthday/birthday-01?name=Riya&from=Kawsar&message=Hello%0AThere&theme=elegant&lang=en`

Parameters appear in this order and only when set (`theme` only when it differs from the default; `lang` is always
included so the recipient sees the language you chose). Everything is percent-encoded. Max URL length is
`MAX_URL_LENGTH = 4000` in `js/wish-params.js`; with the current limits even an all-emoji worst case is below it,
and the Creator refuses to build anything longer. The origin is `location.origin`, so links work on any domain.
The default URL `/wishes/birthday/birthday-01` still shows the default experience.

### Security model
All URL parameters are hostile input. They are parsed only by `WishoraParams`, validated (length in code points,
enum allow-lists, case-insensitive exact match, unknown values → safe default) and written with `textContent` only.
`innerHTML`/`eval`-style patterns are forbidden in the Creator, the shared module and wish pages
(`check-repo.mjs` fails on them). `?template=`/`?category=` are checked against fixed lists. `embed=1` is honoured
only inside an iframe. Hostile inputs are covered by `check-repo.mjs` self-tests and the browser tests.

### Privacy and SEO of personalised links
- The UI states next to the share action that the entered information may be included in the link and that Wishora
  does not save it on a server. Anyone with the link can read it, and hosting logs may record requested URLs.
- Personalised URLs are **not** separate pages for search engines: the canonical stays the base experience,
  and the wish page adds `<meta name="robots" content="noindex,follow">` (via JavaScript) whenever personalisation
  parameters are present. `/create/` itself is indexable and in the sitemap. `robots.txt` does not block
  parameterised URLs on purpose, so link previews and the canonical hint keep working.

### Limits (by design in this phase)
Long messages make long URLs; the link can be edited by anyone (so never treat parameters as trusted);
there are no saved drafts, no account history, no short links and no permanent cloud storage.

### Adding a template (e.g. Friendship)
1. **Page.** Create `wishes/<category>/<slug>.html/.css/.js`. Copy `wishes/love/love-01.*` as a starting point:
   include `css/wish-base.css`, set your own colour tokens per theme (`html.theme-<id>`), and call
   `WishoraWish.init({ templateId, translations })` from `js/wish-runtime.js`. The runtime handles URL parameters,
   language, theme class, `noindex`, scenes, toast and copy/share. **You write the design and the interaction.**
   Render user text only with `textContent` (the checker forbids `innerHTML` & co.).
2. **Template data** (`data/templates.js`): `status: "implemented"`, `creator.enabled: true`, `route`/`previewRoute`,
   `fields` (use `commonFields()`; add an inline-choice field with `options: "choices"` if needed), `themes`,
   `defaultTheme`, `defaults.message`, `seo`. A planned template stays `status: "planned"` with no `route`.
3. **Wish entry** (`data/wishes.js`, `status: "live"`, `template: "<id>"`) and **category** text in
   `data/categories.js` (`intro`, `meta`, `related`); remove the matching entry from `data/planned.js`.
4. Static `<title>`/description of the page must match `seo.title.en` / start with `seo.description.en`.
5. `node scripts/build.mjs && node scripts/check-repo.mjs` — occasion/template cards, form, category page, JSON-LD and
   sitemap are generated; the checker verifies routes, limits, languages, themes, planned-template rules and URL safety.
6. Add the template to the case lists in `tests/browser/p3_wishes.py` and `p3_creator.py`.

Choice fields (`options: "choices"`) are validated against the template's own list; anything else falls back to the
default and never reaches the URL. Future fields (photo, music, custom colours) are meant to be new `fields` entries.


## Tests

Required development dependencies (none are needed to deploy): **Node.js 18+** (build/checker/server) and, for the
browser suites, **Python 3 + Playwright** (`pip install playwright && playwright install chromium`).

```
node scripts/build.mjs --check     # generated files up to date?
node scripts/check-repo.mjs        # integrity, honesty, templates, URL-safety self-tests
node scripts/serve.mjs 8803        # keep running in one terminal, then in another:
python3 tests/browser/p3_wishes.py   # Love + Anniversary experiences (long: ~6 min)
python3 tests/browser/p3_creator.py  # Creator with the new templates
python3 tests/browser/<p1_main|p1_func|p1_a11y|t_bday|t_misc|p2_creator|p2_more>.py
```
Run suites one at a time. See `tests/browser/readme.txt` for what each covers and the remaining environment limits
(the music test needs a second server on :8804 and is reported as **SKIP** when absent).
Automated tests do not prove the site is secure or accessible; real-device, screen-reader and native-speaker checks are manual.
A real Cloudflare Pages deployment has **not** been verified; `scripts/serve.mjs` only emulates it.

## Search and filtering
- Searches title, description, category label, category keywords and wish `tags` in both languages.
- Words are matched with AND; case and Latin diacritics ignored; no libraries.
- `?search=…` and `?category=…` are read on load and kept in sync (`replaceState`). Unknown categories are ignored,
  search text is capped at 80 characters and only ever used as text.
- A query that matches only a planned category shows it as "coming soon" in the empty state.

## SEO
- Every generated page: unique `<title>`, description, canonical, Open Graph, Twitter Card, `lang`.
- JSON-LD (only true facts): `WebSite` + `WebPage` (home); `WebSite` + `CollectionPage` + `BreadcrumbList` (category);
  `WebPage` + `BreadcrumbList` (about/privacy/terms and each wish page). No ratings, reviews or counts.
- `sitemap.xml` is generated from data: home, live categories, live wishes, About/Privacy/Terms.
- `robots.txt` allows all and points to the sitemap; `404.html` is `noindex`.

## Ad slots
Hidden, empty `data-ad-slot="AD_SLOT_TOP|AD_SLOT_CONTENT|AD_SLOT_BOTTOM"` placeholders mark where ads could go.
They load nothing. `check-repo` fails if a slot is unhidden or an ad/analytics network is referenced.

## Security notes
Wish personalisation uses `?name=` and `?from=`: tags/angle brackets, control and bidi characters are stripped,
length is capped at 40 code points, and values are written with `textContent` only. Generated pages escape all
data they render.

## Known limitations
- **The Creator supports three templates** (Birthday, Love, Anniversary), each with three themes. Customisable: names, message, theme, language, and (Anniversary only) the anniversary kind. **Friendship is planned only.**
- **Bengali copy for the new experiences is machine-drafted and not native-reviewed** (marked "BENGALI COPY" in `wishes/love/love-01.js` and `wishes/anniversary/anniversary-01.js`).
- **Category pages for Love and Anniversary each list one wish** (generated automatically from live wishes); they will grow as wishes are added.
- **No years/dates field** in the Anniversary experience yet; a milestone counter would be a new `fields` entry.
- **No drafts or history**: reloading `/create/` starts over; the finished link is the only artifact.
- **Personalisation lives in the URL**: long messages mean long links, links can be edited by anyone, and messaging apps may truncate very long URLs.
- **`noindex` for personalised links is applied by JavaScript** (the canonical covers crawlers that don't run it).
- **Birthday music file is missing** (`assets/audio/birthday-music.mp3`, see `assets/audio/README.md`); the player degrades gracefully.
  Music autostart never fires because of `preload="none"`; users press play.
- **Site URL is a placeholder** until you run the script above.
- Only three wishes exist, so "Featured" shows Birthday and the other two are listed under "More"; related wishes are just those three.
- **Privacy and Terms are plain-language drafts reflecting what the site does today. They have not had legal review.**
- Fonts load from Google Fonts (non-blocking). Self-hosting is a later option.
- Each page contains both languages (larger HTML, ~8 KB gzipped for the homepage); hidden-language text is `display:none`.
- Language is client-side on one URL (no per-language URLs/`hreflang`).
- Homepage Bengali strings added in Phase 0/1 should be reviewed by a native speaker.
- Cloudflare clean-URL behaviour is emulated locally, not verified on a live deployment.

## Future roadmap
Not started: more templates, categories and creator fields (photo, music, relationship, tone, custom colours), short links,
accounts, storage, payments, AI-assisted text,
analytics and ads (with consent handling), self-hosted fonts, per-language URLs.
