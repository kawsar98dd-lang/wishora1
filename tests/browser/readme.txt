Wishora — browser test suites (Playwright for Python, headless Chromium)
=======================================================================
Scripts used during development. Phase 4 updated live-template assertions for Friendship (see CHANGELOG).

Run:  node scripts/serve.mjs 8803        (from the project root, keep it running)
      python3 tests/browser/<suite>.py   (needs: pip install playwright; playwright install chromium)

  t_bday.py      Phase 0  Birthday experience (flow, sanitising, ARIA, reduced motion)
  t_misc.py      Phase 0/1 music (needs a test mp3 served on port 8804), 404, no-JS, contrast, targets
  p1_main.py     Phase 1  console/network + horizontal overflow at 6 widths on every page
  p1_func.py     Phase 1  structure, honesty, search/filter, URL params, language, keyboard, config
  p1_a11y.py     Phase 1  contrast (bn/en), touch targets, landmarks, focus indicators, menu
  p2_creator.py  Phase 2  Creator end-to-end (Bengali flow, validation, preview, share, copy, fresh context)
  p2_more.py     Phase 2  English flow, hostile URL params, XSS, deep links, keyboard, layout x steps, no-JS, contrast per theme
  p3_wishes.py   Phase 3  Love + Anniversary pages: params, XSS, limits, Unicode, themes, lang, keyboard, reduced motion, no-JS, 6 widths, contrast, routes, sitemap
  p4_friendship.py Phase 4 Friendship postcard interactions, URL safety, responsive checks, Creator + sitemap.
  p3_creator.py  Phase 3/4 Creator with all live templates: flow, preview == share URL, copy/share fallbacks, back/forward, deep links, unknown-input safety

Known caveats of these scripts (not changed on purpose):
  - (Resolved in Phase 3) p2_more.py now reads p1_a11y.py from its own folder; screenshots use a temp dir
    (override with WISHORA_SHOTS).
  - t_misc.py's music section needs a second server on port 8804 serving a temp copy of the project with a test mp3.
    Without it that section prints "SKIP … NOT verified" (it is never counted as passed). Music remains untested here.
  - Set WISHORA_BASE to test another origin (p3_* only). p3_wishes.py takes about 6 minutes; run it in the background
    where a single command is time-limited.
  - Run suites one at a time; running several browser suites in parallel can cause timeouts.
The repository integrity checker is separate and needs only Node:  node scripts/check-repo.mjs
