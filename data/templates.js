/* =========================================================
   WISHORA — TEMPLATE DEFINITIONS (single source of truth)
   data/templates.js

   A "template" is the reusable experience behind a wish page. The Creator
   (/create/), the wish page itself and the build/check scripts ALL read
   this file, so field limits, themes, languages, routes and the default
   message exist in exactly one place.

   Template fields
     id            unique, lowercase
     slug          last URL segment of the wish page
     status        "implemented" (a real page exists) | "planned"
     category      id in data/categories.js
     title / description   { bn, en }
     languages     languages the experience supports
     route         clean public URL of the final experience
     previewRoute  URL used for the Creator preview. Same page as `route`
                   (the preview IS the real experience, embedded).
     creator       { enabled, style }  enabled → offered in /create/
     capabilities  what the experience can do (informational + checked)
     fields        personalisation inputs (see below)
     themes        visual variants (see below)
     defaultTheme  must be one of themes[].id
     defaults      default content, e.g. the default message { bn, en }

   Field types
     line   single-line text, sanitised, `max` counted in code points
     text   multi-line text (`multiline: true`), line breaks preserved
     enum   one of a fixed list: themes (options: "themes"), languages
            (options: "languages") or a template-specific list written
            inline (options: "choices", `choices: [{id,name,description}]`,
            `default`: id). Choices are validated against that list only.
   `param` is the URL query parameter that carries the value.

   Status
     implemented  the complete experience exists, works and is tested.
                  Needs route, previewRoute and a matching live wish.
     planned      data only. Never offered as a working option, never
                  linked, never in the sitemap. Needs no route.

   Themes carry data only: { id, name, description, cssClass, swatch }.
   The matching CSS (.theme-<id>) lives with the template's stylesheet.
   Users can never supply CSS: only a theme id from this list is accepted.

   FUTURE FIELDS (not implemented): photo, music, relationship, tone,
   custom colours. Add an entry to `fields` (+ rendering support in the
   experience); the Creator renders and validates fields from this list.
   ========================================================= */
(function () {
  "use strict";

  var data = (window.WISHORA_DATA = window.WISHORA_DATA || {});

  data.templates = [
    {
      id: "birthday-surprise",
      slug: "birthday-01",
      status: "implemented",
      category: "birthday",
      title: { bn: "জন্মদিনের সারপ্রাইজ", en: "Birthday Surprise" },
      description: {
        bn: "উপহারের বাক্স খুলুন, মোমবাতি নিভিয়ে ইচ্ছে করুন, আর মনের কথাগুলো পড়ুন।",
        en: "Open a gift, blow out the candle and read some heartfelt words."
      },
      kind: "scene-sequence",
      scenes: 8,
      languages: ["bn", "en"],
      route: "/wishes/birthday/birthday-01",
      previewRoute: "/wishes/birthday/birthday-01",
      creator: {
        enabled: true,
        style: { bn: "নরম রং, ধাপে ধাপে খোলার অভিজ্ঞতা", en: "Soft colours, opened step by step" }
      },
      capabilities: ["name", "sender", "message", "theme", "language", "share", "replay", "reduced-motion"],

      fields: [
        {
          id: "name", param: "name", type: "line", required: true, max: 40,
          label: { bn: "যাকে পাঠাচ্ছেন (প্রাপকের নাম)", en: "Recipient's name" },
          hint: { bn: "শুভেচ্ছায় এই নামটি দেখানো হবে।", en: "This name appears in the wish." },
          example: { bn: "যেমন: রিয়া", en: "e.g. Riya" }
        },
        {
          id: "from", param: "from", type: "line", required: false, max: 40,
          label: { bn: "আপনার নাম", en: "Your name" },
          hint: { bn: "না দিলে শুভেচ্ছায় কোনো প্রেরকের নাম থাকবে না।", en: "If left empty, no sender name is shown." },
          example: { bn: "যেমন: কাওসার", en: "e.g. Kawsar" }
        },
        {
          id: "message", param: "message", type: "text", multiline: true, required: false, max: 240,
          label: { bn: "নিজের বার্তা", en: "Your own message" },
          hint: { bn: "আপনি যা লিখবেন, ঠিক তা-ই দেখানো হবে। অনুবাদ করা হয় না।", en: "Shown exactly as you write it. It is never translated." },
          example: { bn: "মনের কথাগুলো এখানে লিখুন…", en: "Write what you'd like to say…" }
        },
        { id: "theme", param: "theme", type: "enum", options: "themes", required: false },
        { id: "lang", param: "lang", type: "enum", options: "languages", required: false }
      ],

      themes: [
        {
          id: "classic", cssClass: "theme-classic", swatch: ["#8B5CF6", "#EC4899"],
          name: { bn: "ক্লাসিক", en: "Classic" },
          description: { bn: "বেগুনি আর গোলাপি, মূল রূপ।", en: "Violet and pink, the original look." }
        },
        {
          id: "elegant", cssClass: "theme-elegant", swatch: ["#6B2D5C", "#B8862F"],
          name: { bn: "মার্জিত", en: "Elegant" },
          description: { bn: "গাঢ় বেগুনি আর সোনালি, সেরিফ লেখা।", en: "Deep plum and gold with serif headings." }
        },
        {
          id: "celebration", cssClass: "theme-celebration", swatch: ["#C2410C", "#0F766E"],
          name: { bn: "উৎসব", en: "Celebration" },
          description: { bn: "উজ্জ্বল কমলা আর সবুজাভ নীল।", en: "Bright orange and teal." }
        }
      ],
      defaultTheme: "classic",

      defaults: {
        message: {
          bn: "আজকের দিনটা শুধু ক্যালেন্ডারের একটা তারিখ নয়। আজ এমন একজন মানুষের দিন, যার উপস্থিতি অনেক মুহূর্তকে আরও সুন্দর, আরও সহজ আর আরও উষ্ণ করে তোলে।",
          en: "Today isn't just another date on the calendar. It's a day to celebrate someone whose presence makes ordinary moments feel a little warmer, a little easier, and a little more special."
        }
      }
    }
  ];

  /* ---------------------------------------------------------
     Shared field and theme builders (Phase 3).
     The Birthday entry above is written out in full on purpose (it is
     the reference); newer templates reuse these helpers so limits and
     wording of the common fields cannot drift apart.
  --------------------------------------------------------- */
  function commonFields(withKind) {
    var list = [
      {
        id: "name", param: "name", type: "line", required: true, max: 40,
        label: { bn: "যাকে পাঠাচ্ছেন (প্রাপকের নাম)", en: "Recipient's name" },
        hint: { bn: "শুভেচ্ছায় এই নামটি দেখানো হবে।", en: "This name appears in the wish." },
        example: { bn: "যেমন: রিয়া", en: "e.g. Riya" }
      },
      {
        id: "from", param: "from", type: "line", required: false, max: 40,
        label: { bn: "আপনার নাম", en: "Your name" },
        hint: { bn: "না দিলে শুভেচ্ছায় কোনো প্রেরকের নাম থাকবে না।", en: "If left empty, no sender name is shown." },
        example: { bn: "যেমন: কাওসার", en: "e.g. Kawsar" }
      },
      {
        id: "message", param: "message", type: "text", multiline: true, required: false, max: 240,
        label: { bn: "নিজের বার্তা", en: "Your own message" },
        hint: { bn: "আপনি যা লিখবেন, ঠিক তা-ই দেখানো হবে। অনুবাদ করা হয় না।", en: "Shown exactly as you write it. It is never translated." },
        example: { bn: "মনের কথাগুলো এখানে লিখুন…", en: "Write what you'd like to say…" }
      }
    ];
    if (withKind) list.push(withKind);
    list.push({ id: "theme", param: "theme", type: "enum", options: "themes", required: false });
    list.push({ id: "lang", param: "lang", type: "enum", options: "languages", required: false });
    return list;
  }

  function theme(id, bn, en, dbn, den, a, b) {
    return {
      id: id, cssClass: "theme-" + id, swatch: [a, b],
      name: { bn: bn, en: en }, description: { bn: dbn, en: den }
    };
  }

  /* ---------------------------------------------------------
     Love / Romantic Wish — "A Letter, Kept Safe"
  --------------------------------------------------------- */
  data.templates.push({
    id: "love-letter",
    slug: "love-01",
    status: "implemented",
    category: "love",
    title: { bn: "ভালোবাসার চিঠি", en: "A Love Letter" },
    description: {
      bn: "মোমের সিল ভাঙুন, তিনটি তারা জ্বালান আর চিঠির কথাগুলো পড়ুন।",
      en: "Break the wax seal, light three stars and read the letter kept for you."
    },
    kind: "scene-sequence",
    scenes: 4,
    languages: ["bn", "en"],
    route: "/wishes/love/love-01",
    previewRoute: "/wishes/love/love-01",
    creator: {
      enabled: true,
      style: { bn: "রাতের আকাশ, নরম আলো, ধীর গতির চিঠি", en: "A night sky, soft light and an unhurried letter" }
    },
    capabilities: ["name", "sender", "message", "theme", "language", "share", "replay", "reduced-motion"],
    seo: {
      title: { bn: "ভালোবাসার চিঠি — প্রিয়জনের জন্য রোমান্টিক শুভেচ্ছা | Wishora", en: "A Love Letter — a romantic wish for someone special | Wishora" },
      description: {
        bn: "মোমের সিল ভাঙুন, তিনটি তারা জ্বালান আর প্রিয় মানুষের জন্য রাখা চিঠিটি পড়ুন। বাংলা ও ইংরেজিতে।",
        en: "Break the wax seal, light three stars and read a letter kept for someone you love. Available in Bengali and English."
      }
    },
    fields: commonFields(null),
    themes: [
      theme("rose", "গোলাপ", "Rose", "গাঢ় গোলাপি আর ক্রিম, উষ্ণ রাত।", "Deep rose and cream, a warm evening.", "#9F1239", "#F9A8D4"),
      theme("midnight", "মধ্যরাত", "Midnight", "গাঢ় নীল আকাশ আর সোনালি তারা।", "A deep blue sky with golden stars.", "#1E1B4B", "#FBBF24"),
      theme("blush", "ব্লাশ", "Blush", "হালকা গোলাপি, নরম আর উজ্জ্বল।", "Light blush, soft and bright.", "#BE185D", "#FDE2E4")
    ],
    defaultTheme: "rose",
    defaults: {
      message: {
        bn: "কিছু অনুভূতি চুপচাপ থাকে, আবার কিছু লুকিয়ে রাখা যায় না। আজ শুধু জানাতে চাইলাম, তুমি আমার কাছে অনেক গুরুত্বপূর্ণ, আর তোমার কথা ভাবলেই আমার দিনটা একটু নরম হয়ে যায়।",
        en: "Some feelings are quiet, and some are impossible to hide. Today I just wanted you to know that you matter to me, and that thinking of you makes my day a little gentler."
      }
    }
  });

  /* ---------------------------------------------------------
     Anniversary Wish — "The Memory Jar"
     Not every anniversary is romantic: the `kind` choice changes the
     wording of the built-in lines (neutral by default).
  --------------------------------------------------------- */
  data.templates.push({
    id: "anniversary-memories",
    slug: "anniversary-01",
    status: "implemented",
    category: "anniversary",
    title: { bn: "স্মৃতির বয়াম", en: "The Memory Jar" },
    description: {
      bn: "স্মৃতির বয়াম থেকে একটি একটি করে কার্ড তুলুন, তারপর বার্ষিকীর শুভেচ্ছা পড়ুন।",
      en: "Draw memory cards from the jar one by one, then read the anniversary wish."
    },
    kind: "scene-sequence",
    scenes: 4,
    languages: ["bn", "en"],
    route: "/wishes/anniversary/anniversary-01",
    previewRoute: "/wishes/anniversary/anniversary-01",
    creator: {
      enabled: true,
      style: { bn: "সোনালি আলো, স্মৃতির কার্ড, শান্ত উদযাপন", en: "Golden light, memory cards and a quiet toast" }
    },
    capabilities: ["name", "sender", "message", "theme", "language", "kind", "share", "replay", "reduced-motion"],
    seo: {
      title: { bn: "স্মৃতির বয়াম — বার্ষিকীর শুভেচ্ছা | Wishora", en: "The Memory Jar — an anniversary wish | Wishora" },
      description: {
        bn: "স্মৃতির বয়াম থেকে তিনটি কার্ড তুলুন আর বার্ষিকীর শুভেচ্ছা পড়ুন। দম্পতি, পরিবার বা যেকোনো সম্পর্কের জন্য। বাংলা ও ইংরেজিতে।",
        en: "Draw three cards from a memory jar and read an anniversary wish. For couples, families or any shared journey. Available in Bengali and English."
      }
    },
    fields: commonFields({
      id: "kind", param: "kind", type: "enum", options: "choices", required: false, "default": "together",
      label: { bn: "কীসের বার্ষিকী?", en: "What kind of anniversary?" },
      hint: { bn: "এটি শুধু বাঁধা কথাগুলোর সুর বদলায়। আপনার নিজের বার্তা যেমন আছে তেমনই থাকে।", en: "This only changes the tone of the built-in lines. Your own message stays exactly as written." },
      choices: [
        { id: "together", name: { bn: "একসঙ্গে পথচলা", en: "A journey together" }, description: { bn: "বন্ধুত্ব, কাজ বা যেকোনো সম্পর্ক।", en: "Friendship, work or any shared path." } },
        { id: "couple", name: { bn: "জীবনসঙ্গী", en: "Partners" }, description: { bn: "বিবাহবার্ষিকী বা সম্পর্কের বার্ষিকী।", en: "A wedding or relationship anniversary." } },
        { id: "family", name: { bn: "পরিবার", en: "Family" }, description: { bn: "বাবা-মা বা পরিবারের বিশেষ দিন।", en: "A special day for parents or family." } }
      ]
    }),
    themes: [
      theme("ivory", "আইভরি", "Ivory", "ক্রিম আর সোনালি, উষ্ণ আর শান্ত।", "Cream and gold, warm and calm.", "#92400E", "#FDE68A"),
      theme("emerald", "পান্না", "Emerald", "গাঢ় সবুজ আর সোনালি।", "Deep green and gold.", "#065F46", "#D9A441"),
      theme("twilight", "গোধূলি", "Twilight", "গাঢ় বেগুনি আর রুপালি আলো।", "Deep violet with silver light.", "#312E81", "#C7D2FE")
    ],
    defaultTheme: "ivory",
    defaults: {
      message: {
        bn: "সময় ভাগ করে নেওয়া দিনগুলোকে ধীরে ধীরে গল্পে বদলে দেয়। এতদিনের স্মৃতি, সামনের দিনগুলো আর এই পথচলার সবটুকুর জন্য শুভেচ্ছা।",
        en: "Time has a way of turning shared days into stories. Here's to the memories you've built, the moments still ahead and everything that has made this journey yours."
      }
    }
  });

  /* ---------------------------------------------------------
     Friendship — PLANNED. Data only: no page, no route, not offered in
     the Creator, not linked, not in the sitemap. When the experience
     exists: add the page, a live entry in data/wishes.js, then change
     status to "implemented", add `route`/`previewRoute`, set
     creator.enabled and replace `fields`/`themes`/`defaults` below.
  --------------------------------------------------------- */
  data.templates.push({
    id: "friendship-moments",
    slug: "friendship-01",
    status: "planned",
    category: "friendship",
    title: { bn: "বন্ধুত্বের মুহূর্ত", en: "Friendship Moments" },
    description: {
      bn: "প্রিয় বন্ধুর জন্য আন্তরিক একটি শুভেচ্ছা। এখনো তৈরি হয়নি।",
      en: "A heartfelt wish for a friend. Not built yet."
    },
    languages: ["bn", "en"],
    creator: { enabled: false },
    capabilities: ["name", "sender", "message", "theme", "language"],
    fields: commonFields(null),
    themes: [
      theme("sunny", "রোদেলা", "Sunny", "উজ্জ্বল হলুদ আর নীল।", "Bright yellow and blue.", "#B45309", "#60A5FA")
    ],
    defaultTheme: "sunny",
    defaults: { message: { bn: "", en: "" } }
  });
})();
