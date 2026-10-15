/* =========================================================
   WISHORA — IMPLEMENTED WISHES
   data/wishes.js

   ONLY wishes whose page really exists belong here. Each entry is
   rendered on the homepage as a working, linked card, and is
   listed in sitemap.xml.

   Fields
     id          unique, lowercase, URL-safe: "<category>-<nn>"
     slug        last URL segment (normally equal to the id)
     status      always "live" in this file
     category    must match an id in data/categories.js
     template    must match an id in data/templates.js
     path        file path from the SITE ROOT, no leading slash
     route       clean public URL path: "/wishes/<category>/<slug>"
     title / description   { bn, en }
     languages   languages the wish itself supports, e.g. ["bn","en"]
     tags        { bn: [], en: [] } extra search keywords
     thumbnail   { icon, theme }  theme → css .thumb-<theme>
     featured    true = curated "Featured" (a human choice, never popularity)
     order       curated sort order (lower first)
     related     ids of other LIVE wishes to cross-link

   There is intentionally NO popularity / views / rating field. Never
   invent one; add real analytics-derived ranking in a later phase.

   Before adding an entry: create the page, then run
   `node scripts/check-repo.mjs`.
   ========================================================= */
(function () {
  "use strict";

  var data = (window.WISHORA_DATA = window.WISHORA_DATA || {});

  data.wishes = [
    {
      id: "birthday-01",
      slug: "birthday-01",
      status: "live",
      category: "birthday",
      template: "birthday-surprise",
      /* File on disk, and the clean URL it is served at / canonical. */
      path: "wishes/birthday/birthday-01.html",
      route: "/wishes/birthday/birthday-01",
      title: { bn: "জন্মদিনের শুভেচ্ছা", en: "Birthday Wishes" },
      description: {
        bn: "উপহারের বাক্স খুলুন, মোমবাতি নিভিয়ে ইচ্ছে করুন, আর প্রিয় মানুষের জন্য রাখা কথাগুলো পড়ুন।",
        en: "Open the gift, blow out the candle and read the words kept for someone special."
      },
      /* Languages the wish itself is available in. */
      languages: ["bn", "en"],
      /* Extra search terms (title, description and category are searched too). */
      tags: {
        bn: ["শুভ জন্মদিন", "উপহার", "মোমবাতি", "কেক"],
        en: ["happy birthday", "gift", "candle", "cake", "surprise"]
      },
      /* Card visual: glyph + colour theme (css: .thumb-<theme>). */
      thumbnail: { icon: "🎂", theme: "birthday" },
      /* Curated flag set by a human. NOT a popularity signal. */
      featured: true,
      /* Curated order inside a group (lower first). See rankWishes() in
         scripts/lib/components.mjs for where analytics ranking could go. */
      order: 1,
      related: ["love-01", "anniversary-01"]
    },
    {
      id: "love-01",
      slug: "love-01",
      status: "live",
      category: "love",
      template: "love-letter",
      path: "wishes/love/love-01.html",
      route: "/wishes/love/love-01",
      title: { bn: "ভালোবাসার চিঠি", en: "A Love Letter" },
      description: {
        bn: "মোমের সিল ভাঙুন, তিনটি তারা জ্বালান আর প্রিয় মানুষের জন্য রাখা চিঠিটি পড়ুন।",
        en: "Break the wax seal, light three stars and read the letter kept for someone you love."
      },
      languages: ["bn", "en"],
      tags: {
        bn: ["রোমান্টিক", "চিঠি", "প্রেম", "ভালোবাসার কথা"],
        en: ["romantic", "love letter", "valentine", "i love you"]
      },
      thumbnail: { icon: "💌", theme: "love" },
      featured: false,
      order: 2,
      related: ["anniversary-01", "birthday-01"]
    },
    {
      id: "friendship-01",
      slug: "friendship-01",
      status: "live",
      category: "friendship",
      template: "friendship-moments",
      path: "wishes/friendship/friendship-01.html",
      route: "/wishes/friendship/friendship-01",
      title: { bn: "বন্ধুত্বের পোস্টকার্ড", en: "The Friendship Postcard" },
      description: {
        bn: "তিনটি বন্ধুত্বের মুহূর্ত খুলে দেখুন, তারপর বন্ধুর জন্য রাখা বার্তাটি পড়ুন।",
        en: "Reveal three little friendship moments, then read a note made for your friend."
      },
      languages: ["bn", "en"],
      tags: {
        bn: ["বন্ধু", "বন্ধুত্ব", "প্রিয় বন্ধু", "বন্ধুর জন্য শুভেচ্ছা"],
        en: ["friendship", "best friend", "friend", "bestie", "thank you friend"]
      },
      thumbnail: { icon: "🤝", theme: "friendship" },
      featured: false,
      order: 4,
      related: ["birthday-01", "love-01", "anniversary-01"]
    },
    {
      id: "anniversary-01",
      slug: "anniversary-01",
      status: "live",
      category: "anniversary",
      template: "anniversary-memories",
      path: "wishes/anniversary/anniversary-01.html",
      route: "/wishes/anniversary/anniversary-01",
      title: { bn: "স্মৃতির বয়াম", en: "The Memory Jar" },
      description: {
        bn: "স্মৃতির বয়াম থেকে তিনটি কার্ড তুলুন আর বার্ষিকীর শুভেচ্ছা পড়ুন।",
        en: "Draw three cards from a memory jar and read an anniversary wish."
      },
      languages: ["bn", "en"],
      tags: {
        bn: ["বিবাহবার্ষিকী", "স্মৃতি", "বার্ষিকী", "পরিবার"],
        en: ["wedding anniversary", "memories", "anniversary", "family", "years together"]
      },
      thumbnail: { icon: "🫙", theme: "anniversary" },
      featured: false,
      order: 3,
      related: ["love-01", "birthday-01"]
    }
  ];
})();
