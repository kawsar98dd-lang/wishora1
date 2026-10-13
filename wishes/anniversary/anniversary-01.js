/* WISHORA — Anniversary experience "The Memory Jar" (wishes/anniversary/anniversary-01.js)
   Interaction: open the jar → draw three memory cards → read the wish → raise a glass.
   `kind` (together | couple | family) only changes the wording of the BUILT-IN lines;
   it never assumes a romantic relationship unless the sender chose "couple".
   The visitor's own message is always shown verbatim.
   BENGALI COPY: needs native-speaker review. */
(function () {
  "use strict";

  var KINDS = {
    together: {
      bn: { lead: "এই পথচলার আরও একটি বছর।", toast: "এই পথচলার জন্য।",
        cards: [["যেখানে শুরু", "প্রতিটি দীর্ঘ গল্পের শুরু একটি সাধারণ দিনে। কোনো এক সময় সেটাই হয়ে উঠেছে উদযাপনের মতো কিছু।"],
                ["যা গড়ে উঠেছে", "একসঙ্গে করা চেষ্টা, একসঙ্গে হাসি, আর সময়ের সঙ্গে আসা নীরব বোঝাপড়া।"],
                ["সামনের পথ", "সামনের পথে এত ভালো দিন আসুক যে গুনে শেষ করা যাবে না।"]] },
      en: { lead: "Another year of a journey worth marking.", toast: "Here's to this journey.",
        cards: [["Where it began", "Every long story starts with one ordinary day. Somewhere along the way, it became something worth marking."],
                ["What's been built", "Shared effort, shared laughter and the quiet understanding that only comes with time."],
                ["What lies ahead", "May the road ahead bring more good days than you can count."]] }
    },
    couple: {
      bn: { lead: "একসঙ্গে আরও একটি বছর।", toast: "তোমাদের দুজনের জন্য।",
        cards: [["যেখানে শুরু", "দুজন মানুষ, একটি শুরু, আর একটি দিন যা পরের সবকিছু নীরবে বদলে দিয়েছিল।"],
                ["যা গড়ে উঠেছে", "সাধারণ দিন, ধৈর্য আর অনেক ছোট ছোট যত্ন দিয়ে গড়া একটি ঘর।"],
                ["সামনের পথ", "সামনের বছরগুলো যেন অতীতের সেরা দিনগুলোর মতোই উষ্ণ হয়।"]] },
      en: { lead: "Another year, together.", toast: "Here's to the two of you.",
        cards: [["Where it began", "Two people, one beginning and a day that quietly changed everything that came after."],
                ["What you've built", "A home made of ordinary days, patience and a lot of small kindnesses."],
                ["What lies ahead", "May the years ahead be as warm as the best of the ones behind."]] }
    },
    family: {
      bn: { lead: "পরিবার হিসেবে আরও একটি বছর।", toast: "পরিবারের জন্য।",
        cards: [["যেখানে শুরু", "একটি পরিবারের শুরু একটি সিদ্ধান্ত, একটি দিন আর একে অপরের পাশে থাকতে চাওয়া মানুষদের দিয়ে।"],
                ["যা গড়ে উঠেছে", "খাবার, স্মৃতি, রীতি আর এমন একটি জায়গা, যেখানে সবাই ফিরে আসতে ভালোবাসে।"],
                ["সামনের পথ", "টেবিলে যেন সবসময় জায়গা থাকে, আর একসঙ্গে হওয়ার কারণও।"]] },
      en: { lead: "Another year as a family.", toast: "Here's to the family.",
        cards: [["Where it began", "A family begins with a decision, a day and people willing to show up for each other."],
                ["What you've built", "Meals, memories, traditions and a place everyone is glad to come back to."],
                ["What lies ahead", "May there always be room at the table and reasons to gather."]] }
    }
  };

  var T = {
    bn: {
      skipLink: "মূল অভিজ্ঞতায় যান", backHome: "← Wishora", langToggleLabel: "ভাষা পরিবর্তন করুন",
      fallbackName: "প্রিয়জন",
      welcomeEyebrow: "একটি বিশেষ দিন",
      welcomeHeading: function (n) { return n + ", আজ উদযাপনের মতো একটি দিন।"; },
      openJar: "স্মৃতির বয়াম খুলুন",
      jarEyebrow: "বয়ামের ভেতরে", jarHeading: "তিনটি কার্ড তোলো।",
      draw: function (n) { return "একটি কার্ড তুলুন (" + n + "/৩)"; },
      drawDone: "তিনটি কার্ডই তোলা হয়েছে",
      toMessage: "শুভেচ্ছাটি পড়ুন",
      messageEyebrow: "কয়েকটি কথা", messageHeading: "শুভ বার্ষিকী",
      messageFor: function (n) { return "প্রিয় " + n + ","; },
      senderLine: function (f) { return "— " + f; },
      toToast: "এবার একটু উদযাপন",
      toastEyebrow: "শেষ একটি কাজ", toastHeading: "গ্লাস তোলার সময়।", toastBtn: "গ্লাস তুলুন",
      shareBtn: "এই শুভেচ্ছাটি শেয়ার করুন", replayBtn: "আবার দেখুন",
      moreNav: "Wishora-র আরও", linkHome: "Wishora হোম", linkCategory: "বার্ষিকীর সংগ্রহ", linkCreate: "নিজের শুভেচ্ছা তৈরি করুন",
      linkCopied: "লিংক কপি হয়েছে।", shareFailed: "শেয়ার বা কপি করা যায়নি। ঠিকানাটি নিজে কপি করুন।",
      shareTitle: function (n) { return n + "-এর জন্য বার্ষিকীর শুভেচ্ছা — Wishora"; },
      shareText: function (n) { return n + "-এর জন্য একটি স্মৃতির বয়াম রাখা আছে।"; },
      titleWithName: function (n) { return n + "-এর জন্য বার্ষিকীর শুভেচ্ছা — Wishora"; },
      titleFallback: "স্মৃতির বয়াম — Wishora"
    },
    en: {
      skipLink: "Skip to the experience", backHome: "← Wishora", langToggleLabel: "Change language",
      fallbackName: "you",
      welcomeEyebrow: "A special day",
      welcomeHeading: function (n) { return "A day worth celebrating, " + n + "."; },
      openJar: "Open the memory jar",
      jarEyebrow: "Inside the jar", jarHeading: "Draw three cards.",
      draw: function (n) { return "Draw a card (" + n + "/3)"; },
      drawDone: "All three cards drawn",
      toMessage: "Read the wish",
      messageEyebrow: "A few words", messageHeading: "Happy anniversary",
      messageFor: function (n) { return "Dear " + n + ","; },
      senderLine: function (f) { return "— " + f; },
      toToast: "Now, a little celebration",
      toastEyebrow: "One last thing", toastHeading: "Time to raise a glass.", toastBtn: "Raise a glass",
      shareBtn: "Share this wish", replayBtn: "Watch again",
      moreNav: "More from Wishora", linkHome: "Wishora home", linkCategory: "Anniversary wishes", linkCreate: "Create your own wish",
      linkCopied: "Link copied.", shareFailed: "Couldn't share or copy. Please copy the address yourself.",
      shareTitle: function (n) { return "An anniversary wish for " + n + " — Wishora"; },
      shareText: function (n) { return "A memory jar is waiting for " + n + "."; },
      titleWithName: function (n) { return "An anniversary wish for " + n + " — Wishora"; },
      titleFallback: "The Memory Jar — Wishora"
    }
  };

  function boot() {
    var api = window.WishoraWish && window.WishoraWish.init({
      templateId: "anniversary-memories",
      translations: T,
      themeColors: { ivory: "#FBF5E6", emerald: "#0B3B2E", twilight: "#1E1B4B" }
    });
    if (!api) return;

    var $ = function (s) { return document.querySelector(s); };
    var kind = KINDS[api.values.choices.kind] ? api.values.choices.kind : "together";
    var drawBtn = $("#drawBtn"), cards = $("#cards"), toMessage = $("#toMessage");
    var toastBtn = $("#toastBtn"), finalLine = $("#finalLine");
    var drawn = 0, toasted = false;

    function copy() { return KINDS[kind][api.lang] || KINDS[kind].bn; }

    function refresh() {
      $("#welcomeLead").textContent = copy().lead;
      drawBtn.textContent = drawn >= 3 ? api.t("drawDone") : api.t("draw", drawn);
      drawBtn.disabled = drawn >= 3;
      drawBtn.setAttribute("aria-disabled", drawn >= 3 ? "true" : "false");
      toMessage.hidden = drawn < 3;
      cards.textContent = "";
      for (var i = 0; i < drawn; i++) {
        var li = document.createElement("li");
        var t = document.createElement("span"); t.className = "card-title"; t.textContent = copy().cards[i][0];
        var p = document.createElement("span"); p.textContent = copy().cards[i][1];
        li.appendChild(t); li.appendChild(p); cards.appendChild(li);
      }
      $("#toastBtnText").textContent = api.t("toastBtn");
      toastBtn.setAttribute("aria-pressed", toasted ? "true" : "false");
      finalLine.textContent = toasted ? copy().toast : "";
    }

    $("#openJar").addEventListener("click", function () { api.show(2); });
    drawBtn.addEventListener("click", function () {
      if (drawn >= 3) return;
      drawn++;
      refresh();
      if (drawn >= 3) toMessage.focus();
    });
    toMessage.addEventListener("click", function () { api.show(3); });
    $("#toToast").addEventListener("click", function () { api.show(4); });
    toastBtn.addEventListener("click", function () {
      toasted = true;
      document.body.classList.add("is-toasted");
      refresh();
    });
    $("#replayBtn").addEventListener("click", function () {
      drawn = 0; toasted = false;
      document.body.classList.remove("is-toasted");
      refresh();
      api.show(1);
    });

    api.onRender(refresh);
    refresh();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
