/* =========================================================
   WISHORA — PLANNED WISHES
   data/planned.js

   Wishes that are on the roadmap but have NO page yet.
   RULES:
   • Nothing in this file is ever linked to or presented as a
     working experience. There is deliberately no `path` field.
   • The homepage only uses it to show a category as "coming soon".
   • homeHighlight: true → listed in the homepage "What's coming" block,
     in the order of the entries below.
   • When a wish is actually built, MOVE its entry to
     data/wishes.js and give it a real `path`.
   ========================================================= */
(function () {
  "use strict";

  var data = (window.WISHORA_DATA = window.WISHORA_DATA || {});

  data.plannedWishes = [
    {
      id: "birthday-02",
      status: "planned",
      category: "birthday",
      title: { bn: "জন্মদিনের ভালোবাসা", en: "Birthday Love" },
      description: {
        bn: "ভালোবাসার মানুষের জন্মদিনে জানান রোমান্টিক শুভেচ্ছা।",
        en: "A romantic birthday wish for someone you love."
      },
      icon: "🎁",
      thumbClass: "thumb-birthday"
    },
    {
      id: "congratulations-01",
      status: "planned",
      homeHighlight: true,
      category: "congratulations",
      title: { bn: "অভিনন্দন", en: "Congratulations" },
      description: {
        bn: "কারো সাফল্যে জানান আন্তরিক অভিনন্দন।",
        en: "Celebrate someone's success with heartfelt congratulations."
      },
      icon: "🎉",
      thumbClass: "thumb-congratulations"
    },
    {
      id: "thankyou-01",
      status: "planned",
      homeHighlight: true,
      category: "thankyou",
      title: { bn: "ধন্যবাদ জ্ঞাপন", en: "Thank You" },
      description: {
        bn: "কারো প্রতি কৃতজ্ঞতা প্রকাশ করুন সুন্দরভাবে।",
        en: "Show your gratitude in a beautiful way."
      },
      icon: "🙏",
      thumbClass: "thumb-thankyou"
    },
    {
      id: "sorry-01",
      status: "planned",
      category: "sorry",
      title: { bn: "দুঃখ প্রকাশ", en: "I'm Sorry" },
      description: {
        bn: "মনের কথা বলুন, ভুল বোঝাবুঝি মিটিয়ে নিন।",
        en: "Say what's in your heart and mend the misunderstanding."
      },
      icon: "🌧️",
      thumbClass: "thumb-sorry"
    },
    {
      id: "goodmorning-01",
      status: "planned",
      homeHighlight: true,
      category: "goodmorning",
      title: { bn: "শুভ সকাল", en: "Good Morning" },
      description: {
        bn: "প্রিয় মানুষের দিন শুরু হোক এক সুন্দর শুভেচ্ছায়।",
        en: "Start someone's day with a warm morning wish."
      },
      icon: "🌅",
      thumbClass: "thumb-goodmorning"
    },
    {
      id: "goodnight-01",
      status: "planned",
      homeHighlight: true,
      category: "goodnight",
      title: { bn: "শুভ রাত্রি", en: "Good Night" },
      description: {
        bn: "দিনের শেষে পাঠান একটি প্রশান্তিময় শুভেচ্ছা।",
        en: "End the day with a calming good night wish."
      },
      icon: "🌙",
      thumbClass: "thumb-goodnight"
    },
    {
      id: "mother-01",
      status: "planned",
      category: "mother",
      title: { bn: "মায়ের জন্য শুভেচ্ছা", en: "Wishes for Mother" },
      description: {
        bn: "মায়ের প্রতি ভালোবাসা প্রকাশ করুন এক সুন্দর বার্তায়।",
        en: "Express your love for your mother in a beautiful message."
      },
      icon: "🌸",
      thumbClass: "thumb-mother"
    },
    {
      id: "father-01",
      status: "planned",
      category: "father",
      title: { bn: "বাবার জন্য শুভেচ্ছা", en: "Wishes for Father" },
      description: {
        bn: "বাবার প্রতি সম্মান ও ভালোবাসা জানান আন্তরিকভাবে।",
        en: "Show your respect and love for your father."
      },
      icon: "🎩",
      thumbClass: "thumb-father"
    },
    {
      id: "sister-01",
      status: "planned",
      category: "sister",
      title: { bn: "বোনের জন্য শুভেচ্ছা", en: "Wishes for Sister" },
      description: {
        bn: "প্রিয় বোনের জন্য এক আন্তরিক ও মধুর শুভেচ্ছা।",
        en: "A sweet and heartfelt wish for your dear sister."
      },
      icon: "🎀",
      thumbClass: "thumb-sister"
    },
    {
      id: "brother-01",
      status: "planned",
      category: "brother",
      title: { bn: "ভাইয়ের জন্য শুভেচ্ছা", en: "Wishes for Brother" },
      description: {
        bn: "ভাইয়ের প্রতি ভালোবাসা প্রকাশ করুন এক বিশেষ বার্তায়।",
        en: "Show your love for your brother with a special message."
      },
      icon: "🏆",
      thumbClass: "thumb-brother"
    },
    {
      id: "missing-01",
      status: "planned",
      category: "missing",
      title: { bn: "তোমাকে মনে পড়ে", en: "Missing You" },
      description: {
        bn: "দূরে থাকা প্রিয় মানুষটিকে জানান আপনার অনুভূতি।",
        en: "Let someone far away know just how much you miss them."
      },
      icon: "🌙",
      thumbClass: "thumb-missing"
    },
    {
      id: "special-01",
      status: "planned",
      category: "special",
      title: { bn: "বিশেষ মানুষের জন্য", en: "For Someone Special" },
      description: {
        bn: "জীবনের বিশেষ মানুষটির জন্য এক অনন্য শুভেচ্ছা।",
        en: "A one-of-a-kind wish for the special person in your life."
      },
      icon: "⭐",
      thumbClass: "thumb-special"
    },
    {
      id: "eid-01",
      status: "planned",
      homeHighlight: true,
      category: "eid",
      title: { bn: "ঈদ মুবারক", en: "Eid Mubarak" },
      description: {
        bn: "ঈদের আনন্দ ছড়িয়ে দিন প্রিয়জনের সাথে।",
        en: "Spread the joy of Eid with your loved ones."
      },
      icon: "🌙",
      thumbClass: "thumb-eid"
    },
    {
      id: "newyear-01",
      status: "planned",
      homeHighlight: true,
      category: "newyear",
      title: { bn: "নববর্ষের শুভেচ্ছা", en: "New Year Wishes" },
      description: {
        bn: "নতুন বছরকে স্বাগত জানান নতুন আশা আর ভালোবাসায়।",
        en: "Welcome the new year with hope and love."
      },
      icon: "🎇",
      thumbClass: "thumb-newyear"
    },
    {
      id: "special-02",
      status: "planned",
      category: "special",
      title: { bn: "কাউকে আজ হাসান", en: "Make Someone Smile Today" },
      description: {
        bn: "একটি ছোট্ট বার্তাই হতে পারে কারো দিন সুন্দর করার কারণ।",
        en: "One small message could be the reason someone's whole day gets better."
      },
      icon: "🌟",
      thumbClass: "thumb-special"
    }
  ];
})();
