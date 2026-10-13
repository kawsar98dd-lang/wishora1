/* WISHORA — Love experience "A Love Letter" (wishes/love/love-01.js)
   Interaction: break the seal → light three stars → read the letter → send a heartbeat.
   Shared behaviour (params, language, theme, share) is js/wish-runtime.js.
   BENGALI COPY: needs native-speaker review. */
(function () {
  "use strict";

  var T = {
    bn: {
      skipLink: "মূল অভিজ্ঞতায় যান", backHome: "← Wishora", langToggleLabel: "ভাষা পরিবর্তন করুন",
      fallbackName: "প্রিয় মানুষ",
      welcomeEyebrow: "একটি চিঠি অপেক্ষা করছে…",
      welcomeHeading: function (n) { return n + ", তোমার জন্য একটি চিঠি আছে।"; },
      welcomeLead: "চিঠিটা যত্ন করে বন্ধ করে রাখা হয়েছে।",
      sealLabel: "মোমের সিল ভাঙুন", sealHint: "সিলটি ভাঙতে ট্যাপ করুন।",
      starsEyebrow: "চিঠি খোলার আগে…", starsHeading: "তিনটি তারা জ্বালাও।",
      starsHint: "প্রতিটি তারার ভেতরে একটি করে ছোট্ট কথা আছে।", starsGroup: "তারা",
      starLabel: function (n) { return n + " নম্বর তারাটি জ্বালান (৩টির মধ্যে)"; },
      starLitLabel: function (n) { return n + " নম্বর তারা জ্বলছে"; },
      line1: "সাধারণ দিনগুলোকেও তুমি যেভাবে একটু নরম করে দাও, তার জন্য।",
      line2: "ছোট ছোট যে মুহূর্তগুলো আমার মনে অনেকক্ষণ থেকে যায়, তার জন্য।",
      line3: "শুধু তুমি তুমি বলেই।",
      toLetter: "চিঠিটি খুলুন", toLetterDone: "তিনটি তারাই জ্বলেছে। এবার চিঠিটি খুলতে পারো।",
      letterEyebrow: "তোমার জন্য লেখা", letterHeading: "চিঠিটি",
      dear: function (n) { return "প্রিয় " + n + ","; },
      senderLine: function (f) { return "— " + f; },
      toFinal: "আর একটি কথা",
      finalEyebrow: "শেষ কথা", finalHeading: "তুমি ভালো থেকো, হাসিখুশি থেকো।",
      heartLabel: "হৃদস্পন্দন পাঠান", heartHint: "হৃদয়ে ট্যাপ করুন।",
      heartDone: "এই চিঠির প্রতিটি কথার পেছনে একটাই ভাবনা: তুমি আছো, তাই ভালো লাগে।",
      shareBtn: "এই শুভেচ্ছাটি শেয়ার করুন", replayBtn: "আবার দেখুন",
      moreNav: "Wishora-র আরও", linkHome: "Wishora হোম", linkCategory: "ভালোবাসার সংগ্রহ", linkCreate: "নিজের শুভেচ্ছা তৈরি করুন",
      linkCopied: "লিংক কপি হয়েছে।", shareFailed: "শেয়ার বা কপি করা যায়নি। ঠিকানাটি নিজে কপি করুন।",
      shareTitle: function (n) { return n + "-এর জন্য একটি ভালোবাসার চিঠি — Wishora"; },
      shareText: function (n) { return n + "-এর জন্য একটি চিঠি রাখা আছে।"; },
      titleWithName: function (n) { return n + "-এর জন্য একটি চিঠি — Wishora"; },
      titleFallback: "ভালোবাসার চিঠি — Wishora"
    },
    en: {
      skipLink: "Skip to the experience", backHome: "← Wishora", langToggleLabel: "Change language",
      fallbackName: "someone special",
      welcomeEyebrow: "A letter is waiting…",
      welcomeHeading: function (n) { return "There's a letter for " + n + "."; },
      welcomeLead: "It has been sealed with care.",
      sealLabel: "Break the wax seal", sealHint: "Tap the seal to break it.",
      starsEyebrow: "Before you open it…", starsHeading: "Light three stars.",
      starsHint: "Each star holds one small thought.", starsGroup: "Stars",
      starLabel: function (n) { return "Light star " + n + " of 3"; },
      starLitLabel: function (n) { return "Star " + n + " is lit"; },
      line1: "For the way you make ordinary days feel softer.",
      line2: "For the small moments that stay with me longer than you'd expect.",
      line3: "For simply being you.",
      toLetter: "Open the letter", toLetterDone: "All three stars are lit. You can open the letter now.",
      letterEyebrow: "Written for you", letterHeading: "The letter",
      dear: function (n) { return "Dear " + n + ","; },
      senderLine: function (f) { return "— " + f; },
      toFinal: "One last thing",
      finalEyebrow: "One more thing", finalHeading: "Be well, and keep smiling.",
      heartLabel: "Send a heartbeat", heartHint: "Tap the heart.",
      heartDone: "Behind every line in this letter there is one thought: you're here, and that's a good thing.",
      shareBtn: "Share this wish", replayBtn: "Watch again",
      moreNav: "More from Wishora", linkHome: "Wishora home", linkCategory: "Love wishes", linkCreate: "Create your own wish",
      linkCopied: "Link copied.", shareFailed: "Couldn't share or copy. Please copy the address yourself.",
      shareTitle: function (n) { return "A love letter for " + n + " — Wishora"; },
      shareText: function (n) { return "There's a letter kept for " + n + "."; },
      titleWithName: function (n) { return "A letter for " + n + " — Wishora"; },
      titleFallback: "A Love Letter — Wishora"
    }
  };

  function boot() {
    var api = window.WishoraWish && window.WishoraWish.init({
      templateId: "love-letter",
      translations: T,
      themeColors: { rose: "#2A0A18", midnight: "#0B0C2E", blush: "#FFF1F2" }
    });
    if (!api) return;

    var $ = function (s) { return document.querySelector(s); };
    var seal = $("#sealBtn"), toLetter = $("#toLetter"), toFinal = $("#toFinal");
    var heart = $("#heartBtn"), finalLine = $("#finalLine");
    var stars = Array.prototype.slice.call(document.querySelectorAll(".star"));
    var lit = {};

    function litCount() { return Object.keys(lit).length; }

    function refreshStars() {
      stars.forEach(function (b) {
        var n = b.getAttribute("data-star");
        b.setAttribute("aria-label", api.t(lit[n] ? "starLitLabel" : "starLabel", n));
        var li = document.querySelector('[data-line="' + n + '"]');
        if (li) { li.hidden = !lit[n]; li.textContent = lit[n] ? api.t("line" + n) : ""; }
      });
      var done = litCount() === 3;
      toLetter.disabled = !done;
      toLetter.setAttribute("aria-disabled", done ? "false" : "true");
      var hint = $("#starsHint");
      hint.textContent = done ? api.t("toLetterDone") : api.t("starsHint");
    }

    function refreshHeart() {
      var on = heart.getAttribute("aria-pressed") === "true";
      finalLine.textContent = api.t(on ? "heartDone" : "heartHint");
    }

    seal.addEventListener("click", function () {
      seal.classList.add("is-broken");
      seal.disabled = true;
      window.setTimeout(function () { api.show(2); }, api.reduced() ? 0 : 550);
    });

    stars.forEach(function (b) {
      b.addEventListener("click", function () {
        lit[b.getAttribute("data-star")] = true;
        b.setAttribute("aria-pressed", "true");
        refreshStars();
      });
    });

    toLetter.addEventListener("click", function () { if (litCount() === 3) api.show(3); });
    toFinal.addEventListener("click", function () { api.show(4); });

    heart.addEventListener("click", function () {
      heart.setAttribute("aria-pressed", "true");
      refreshHeart();
    });

    $("#replayBtn").addEventListener("click", function () {
      lit = {};
      stars.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      seal.classList.remove("is-broken"); seal.disabled = false;
      heart.setAttribute("aria-pressed", "false");
      refreshStars(); refreshHeart();
      api.show(1);
    });

    api.onRender(function () { refreshStars(); refreshHeart(); });
    refreshStars(); refreshHeart();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
