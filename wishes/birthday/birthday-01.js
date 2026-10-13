/* =========================================================
   WISHORA — BIRTHDAY EXPERIENCE
   wishes/birthday/birthday-01.js
   Vanilla JavaScript only. No frameworks, no build step.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. TRANSLATIONS
  --------------------------------------------------------- */
  const translations = {
    bn: {
      skipLink: "মূল অভিজ্ঞতায় যান",
      backHome: "← Wishora",
      welcomeEyebrow: "তোমার জন্য ছোট্ট একটা বিশেষ সারপ্রাইজ আছে…",
      welcomeHeading: "যাওয়ার আগে… একটু সময় দাও।",
      openSurprise: "সারপ্রাইজটি খুলুন",
      revealLead: "আজকের দিনটা একজন দারুণ মানুষের জন্য।",
      happyBirthdayPrefix: "শুভ জন্মদিন,",
      continueBtn: "চলো এগিয়ে যাই",
      giftEyebrow: "অপেক্ষা করো…",
      giftHeading: "তোমার জন্য একটা উপহার আছে।",
      giftHint: "উপহারটি খুলতে আলতো করে ট্যাপ করো।",
      giftHintOpened: "উপহারটি খোলা হয়েছে। ✨",
      giftCardTitle: "শুভ জন্মদিন!",
      giftCardSub: "এই ছোট্ট মুহূর্তটা তোমার জন্য।",
      messageEyebrow: "একটা ছোট্ট কথা…",
      wishesEyebrow: "তোমার জন্য আমার কিছু ছোট্ট শুভকামনা…",
      wish1: "তোমার হাসিটা যেন আরও অনেক বছর এমনই সুন্দর থাকে।",
      wish2: "তোমার প্রতিটি সকাল শুরু হোক নতুন আশা নিয়ে।",
      wish3: "তোমার স্বপ্নগুলো একে একে সত্যি হয়ে উঠুক।",
      wish4: "জীবনের সুন্দর মুহূর্তগুলো তুমি মন ভরে উপভোগ করতে পারো, এটাই কামনা।",
      celebrationEyebrow: "এখন একটু উদযাপন করা যাক।",
      candlePrompt: "একটা ইচ্ছে করো…",
      candlePromptDone: "ইচ্ছেটা করা হয়ে গেছে। ✨",
      candleMessage: "তোমার সেই ছোট্ট ইচ্ছেটা যেন একদিন সত্যি হয়ে তোমার কাছে ফিরে আসে।",
      musicEyebrow: "শেষ একটা ছোট্ট জিনিস বাকি…",
      musicPlaying: "তোমার জন্য বাজছে ছোট্ট একটা বিশেষ সুর…",
      musicTapHint: "মিউজিক চালু করতে ট্যাপ করুন",
      musicUnavailable: "এই মুহূর্তে মিউজিক পাওয়া যাচ্ছে না, কিন্তু বাকি সারপ্রাইজটা ঠিকই আছে।",
      finalEyebrow: "আরেকবার বলি…",
      finalWish: "তোমার আগামী দিনগুলো হোক সুন্দর, শান্তি আর অসংখ্য হাসিতে ভরা।",
      finalClosing: "আজকের দিনটা তোমার। মন খুলে উপভোগ করো। ❤️",
      replayBtn: "আবার দেখুন",
      shareBtn: "এই শুভেচ্ছাটি শেয়ার করুন",
      fallbackName: "প্রিয় মানুষ",
      senderLineText: (from) => `এই ছোট্ট শুভেচ্ছাটি তোমার জন্য — ${from}`,
      shareTitle: (name) => `শুভ জন্মদিন ${name}! — Wishora`,
      shareText: (name) => `${name}-এর জন্য একটা ছোট্ট জন্মদিনের সারপ্রাইজ।`,
      linkCopied: "লিংক কপি হয়েছে।",
      titleWithName: (name) => `শুভ জন্মদিন ${name}! — Wishora`,
      titleFallback: "A Little Birthday Magic — Wishora",
      sceneWelcome: "স্বাগতম",
      sceneReveal: "নাম প্রকাশ",
      sceneGift: "জন্মদিনের সারপ্রাইজ",
      sceneMessage: "মনের কথা",
      sceneWishes: "শুভকামনা",
      sceneCelebration: "উদযাপন",
      sceneMusic: "মিউজিক",
      sceneFinal: "শেষ বার্তা",
      langToggleLabel: "ভাষা পরিবর্তন করুন",
      giftBoxLabel: "উপহারটি খুলুন",
      giftBoxLabelOpened: "উপহার খোলা হয়েছে",
      candleLabel: "ইচ্ছে করে মোমবাতি নেভান",
      candleLabelDone: "ইচ্ছে করা হয়েছে",
      musicPlayLabel: "মিউজিক চালান",
      musicPauseLabel: "মিউজিক থামান",
      musicMuteLabel: "মিউট করুন",
      musicUnmuteLabel: "আনমিউট করুন",
      musicVolumeLabel: "ভলিউম",
      musicSeekLabel: "গানের অবস্থান",
      moreNavLabel: "Wishora-র আরও কিছু",
      linkHome: "Wishora হোম",
      linkCategory: "জন্মদিনের সংগ্রহ",
      linkExplore: "আরও শুভেচ্ছা দেখুন",
      linkCreate: "নিজের শুভেচ্ছা তৈরি করুন",
      relatedTitle: "আরও শুভেচ্ছা"
    },
    en: {
      skipLink: "Skip to the main experience",
      backHome: "← Wishora",
      welcomeEyebrow: "Something special is waiting for you…",
      welcomeHeading: "Before you leave… stay for a little moment.",
      openSurprise: "Open Your Surprise",
      revealLead: "Today is about someone wonderful.",
      happyBirthdayPrefix: "Happy Birthday,",
      continueBtn: "Let's keep going",
      giftEyebrow: "Wait for it…",
      giftHeading: "There's a little gift for you.",
      giftHint: "Gently tap to open the gift.",
      giftHintOpened: "The gift is open. ✨",
      giftCardTitle: "Happy Birthday!",
      giftCardSub: "This little moment is for you.",
      messageEyebrow: "Just a little something…",
      wishesEyebrow: "A few little wishes, just for you…",
      wish1: "May your smile stay just as beautiful for many more years to come.",
      wish2: "May every morning greet you with fresh hope.",
      wish3: "May your dreams find their way to you, one by one.",
      wish4: "Whatever beautiful moments life brings, I hope you get to enjoy every bit of them.",
      celebrationEyebrow: "Now, let's celebrate a little.",
      candlePrompt: "Make a wish…",
      candlePromptDone: "Wish made. ✨",
      candleMessage: "May that little wish find its way to you.",
      musicEyebrow: "Just one more little surprise…",
      musicPlaying: "Playing something special for you…",
      musicTapHint: "Tap to play the music",
      musicUnavailable: "Music isn't available right now, but the rest of the surprise is still here.",
      finalEyebrow: "One more time…",
      finalWish: "May the days ahead bring you beautiful moments, peaceful days, and countless reasons to smile.",
      finalClosing: "Today is yours. Enjoy every little moment. ❤️",
      replayBtn: "Replay Experience",
      shareBtn: "Share This Wish",
      fallbackName: "Someone Special",
      senderLineText: (from) => `This little wish is for you — from ${from}`,
      shareTitle: (name) => `Happy Birthday ${name}! — Wishora`,
      shareText: (name) => `A little birthday surprise for ${name}.`,
      linkCopied: "Link copied.",
      titleWithName: (name) => `Happy Birthday ${name}! — Wishora`,
      titleFallback: "A Little Birthday Magic — Wishora",
      sceneWelcome: "Welcome",
      sceneReveal: "Name reveal",
      sceneGift: "Birthday surprise",
      sceneMessage: "Heartfelt message",
      sceneWishes: "Personal wishes",
      sceneCelebration: "Celebration",
      sceneMusic: "Music",
      sceneFinal: "Final message",
      langToggleLabel: "Change language",
      giftBoxLabel: "Open the gift",
      giftBoxLabelOpened: "Gift opened",
      candleLabel: "Make a wish and blow the candle",
      candleLabelDone: "Wish made",
      musicPlayLabel: "Play music",
      musicPauseLabel: "Pause music",
      musicMuteLabel: "Mute",
      musicUnmuteLabel: "Unmute",
      musicVolumeLabel: "Volume",
      musicSeekLabel: "Seek",
      moreNavLabel: "More from Wishora",
      linkHome: "Wishora home",
      linkCategory: "Birthday collection",
      linkExplore: "Explore more wishes",
      linkCreate: "Create your own wish",
      relatedTitle: "More wishes"
    }
  };

  /* ---------------------------------------------------------
     2. CONSTANTS
  --------------------------------------------------------- */
  const config = window.WISHORA_CONFIG || {};
  const data = window.WISHORA_DATA || {};

  const SUPPORTED_LANGS =
    Array.isArray(config.supportedLangs) && config.supportedLangs.length
      ? config.supportedLangs
      : ["bn", "en"];
  const DEFAULT_LANG = SUPPORTED_LANGS.indexOf(config.defaultLang) !== -1 ? config.defaultLang : "bn";
  /* Shared with the homepage so the language choice carries over. */
  const LANG_STORAGE_KEY = config.langStorageKey || "wishora_lang";
  /* Key used before the preference was shared; still read as a fallback. */
  const LEGACY_LANG_STORAGE_KEY = "wishora_birthday_lang";

  const CURRENT_WISH_ID = "birthday-01";
  /* The template definition (fields, limits, themes, default message) is the
     single source of truth in data/templates.js; URL handling is shared with
     the Creator via js/wish-params.js. */
  const TEMPLATE = (Array.isArray(data.templates) ? data.templates : []).find((x) => x.id === "birthday-surprise") || null;
  const Params = window.WishoraParams || null;
  /* Resolved relative to this page: /wishes/birthday/ → /assets/audio/ */
  const MUSIC_PATH = "../../assets/audio/birthday-music.mp3";
  const MAX_NAME_LENGTH = 40;
  const TOTAL_STEPS = 8;
  const DEFAULT_VOLUME = 0.35;

  /* ---------------------------------------------------------
     3. STATE
  --------------------------------------------------------- */
  const staticMessage = (document.getElementById("heartfeltText") || {}).textContent || "";
  const state = {
    lang: DEFAULT_LANG,
    customMessage: "",
    theme: TEMPLATE ? TEMPLATE.defaultTheme : "classic",
    paramLang: null,
    embedded: false,
    recipientName: "",
    senderName: "",
    currentStep: 1,
    giftOpened: false,
    candleBlown: false,
    musicReady: false,
    musicUserPaused: false
  };

  /* ---------------------------------------------------------
     4. DOM REFERENCES
  --------------------------------------------------------- */
  const dom = {
    body: document.body,
    heartfeltText: document.getElementById("heartfeltText"),
    scenes: Array.from(document.querySelectorAll(".scene")),
    dots: Array.from(document.querySelectorAll(".progress-dots .dot")),
    langToggle: document.getElementById("langToggle"),
    openSurpriseBtn: document.getElementById("openSurpriseBtn"),
    recipientNameDisplay: document.getElementById("recipientNameDisplay"),
    senderLine: document.getElementById("senderLine"),
    giftBox: document.getElementById("giftBox"),
    giftCard: document.getElementById("giftCard"),
    giftHint: document.getElementById("giftHint"),
    afterGiftBtn: document.getElementById("afterGiftBtn"),
    confettiLayerGift: document.getElementById("confettiLayerGift"),
    wishList: document.getElementById("wishList"),
    candleBtn: document.getElementById("candleBtn"),
    candlePrompt: document.getElementById("candlePrompt"),
    candleMessage: document.getElementById("candleMessage"),
    afterCandleBtn: document.getElementById("afterCandleBtn"),
    confettiLayerCandle: document.getElementById("confettiLayerCandle"),
    musicHeading: document.getElementById("musicHeading"),
    musicPlayBtn: document.getElementById("musicPlayBtn"),
    musicMuteBtn: document.getElementById("musicMuteBtn"),
    musicVolume: document.getElementById("musicVolume"),
    musicProgressTrack: document.getElementById("musicProgressTrack"),
    musicProgressFill: document.getElementById("musicProgressFill"),
    musicCurrentTime: document.getElementById("musicCurrentTime"),
    musicDuration: document.getElementById("musicDuration"),
    musicTapHint: document.getElementById("musicTapHint"),
    musicUnavailable: document.getElementById("musicUnavailable"),
    musicPlayer: document.getElementById("musicPlayer"),
    audio: document.getElementById("birthdayAudio"),
    finalRecipientName: document.getElementById("finalRecipientName"),
    replayBtn: document.getElementById("replayBtn"),
    shareBtn: document.getElementById("shareBtn"),
    toast: document.getElementById("toast"),
    pageTitle: document.getElementById("pageTitle"),
    metaDescription: document.getElementById("metaDescription"),
    ogTitle: document.getElementById("ogTitle"),
    ogDescription: document.getElementById("ogDescription"),
    twitterTitle: document.getElementById("twitterTitle"),
    twitterDescription: document.getElementById("twitterDescription")
  };

  let toastTimer = null;
  let wishObserver = null;

  /* ---------------------------------------------------------
     5. HELPERS
  --------------------------------------------------------- */
  function t(key) {
    const dict = translations[state.lang] || translations[DEFAULT_LANG] || translations.bn;
    return dict[key] !== undefined ? dict[key] : translations.bn[key];
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) {
      return false;
    }
  }

  function safeGetLocalStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeSetLocalStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* Storage unavailable — fail silently, experience still works */
    }
  }

  function showToast(message) {
    if (!dom.toast || !message) return;
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------------------------------------------------------
     6. SANITIZATION
     Never trust URL parameters. Strip tags/scripts and cap length.
     Values are only ever inserted using textContent, never innerHTML.
  --------------------------------------------------------- */
  function sanitizeText(raw) {
    return Params ? Params.line(raw, MAX_NAME_LENGTH) : "";
  }

  /* ---------------------------------------------------------
     7. URL PARAMS
  --------------------------------------------------------- */
  function readUrlParams() {
    try {
      if (!Params || !TEMPLATE) throw new Error("params unavailable");
      const parsed = Params.parse(window.location.search, TEMPLATE);
      state.recipientName = parsed.name;
      state.senderName = parsed.from;
      state.customMessage = parsed.message;
      state.theme = parsed.theme;
      state.paramLang = parsed.lang;
      state.embedded = parsed.embed && window.self !== window.top;
      state.personalised = parsed.personalised || parsed.embed;
    } catch (err) {
      state.recipientName = "";
      state.senderName = "";
      state.customMessage = "";
      state.paramLang = null;
    }
  }

  /* Visual theme: only an id from the template's own list is ever applied;
     the CSS class comes from data, never from the URL. */
  function applyTheme() {
    if (!TEMPLATE) return;
    const root = document.documentElement;
    TEMPLATE.themes.forEach((th) => root.classList.remove(th.cssClass));
    const theme = TEMPLATE.themes.find((th) => th.id === state.theme) || TEMPLATE.themes[0];
    root.classList.add(theme.cssClass);
    if (state.embedded) dom.body.classList.add("is-embedded");
  }

  /* Personalised links must not become separate search results. The
     canonical already points at the base page; this adds noindex. */
  function markPersonalisedNoindex() {
    if (!state.personalised) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,follow";
    document.head.appendChild(meta);
  }

  /* Heartfelt message: the visitor's own text (verbatim, via textContent)
     or the template's default message in the current language. */
  function renderMessage() {
    if (!dom.heartfeltText) return;
    const dflt = TEMPLATE && TEMPLATE.defaults && TEMPLATE.defaults.message;
    const text = state.customMessage || (dflt && (dflt[state.lang] || dflt[DEFAULT_LANG])) || staticMessage;
    dom.heartfeltText.textContent = text;
  }

  /* ---------------------------------------------------------
     8. RECIPIENT / SENDER RENDERING
  --------------------------------------------------------- */
  function updateRecipient() {
    const displayName = state.recipientName || t("fallbackName");

    /* Always use textContent — never innerHTML — for user-controlled values. */
    if (dom.recipientNameDisplay) {
      dom.recipientNameDisplay.textContent = displayName;
    }
    if (dom.finalRecipientName) {
      dom.finalRecipientName.textContent = displayName;
    }

    if (dom.senderLine) {
      if (state.senderName) {
        const senderFn = t("senderLineText");
        dom.senderLine.textContent =
          typeof senderFn === "function" ? senderFn(state.senderName) : "";
        dom.senderLine.hidden = false;
      } else {
        dom.senderLine.textContent = "";
        dom.senderLine.hidden = true;
      }
    }

    /* Dynamic document title + meta, built safely with textContent-equivalent
       string concatenation (no HTML parsing involved). */
    const titleFn = state.recipientName ? t("titleWithName") : null;
    const title =
      titleFn && typeof titleFn === "function"
        ? titleFn(displayName)
        : t("titleFallback");

    if (dom.pageTitle) dom.pageTitle.textContent = title;
    if (dom.ogTitle) dom.ogTitle.setAttribute("content", title);
    if (dom.twitterTitle) dom.twitterTitle.setAttribute("content", title);
  }

  /* ---------------------------------------------------------
     9. LANGUAGE
  --------------------------------------------------------- */
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (typeof value === "string") {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-aria-label"));
      if (typeof value === "string" && value) {
        el.setAttribute("aria-label", value);
      }
    });

    document.documentElement.setAttribute("lang", state.lang);

    /* Re-apply dynamic name-based text after static translations run. */
    updateRecipient();
    refreshDynamicLabels();

    if (dom.giftHint) {
      dom.giftHint.textContent = state.giftOpened ? t("giftHintOpened") : t("giftHint");
    }

    if (dom.candlePrompt) {
      dom.candlePrompt.textContent = state.candleBlown
        ? t("candlePromptDone")
        : t("candlePrompt");
    }
  }

  /* Labels whose wording depends on state (gift opened, playing, muted…).
     Always rebuilt from translations so they follow the current language. */
  function refreshDynamicLabels() {
    if (dom.giftBox) {
      dom.giftBox.setAttribute(
        "aria-label",
        t(state.giftOpened ? "giftBoxLabelOpened" : "giftBoxLabel")
      );
    }
    if (dom.candleBtn) {
      dom.candleBtn.setAttribute(
        "aria-label",
        t(state.candleBlown ? "candleLabelDone" : "candleLabel")
      );
    }
    if (dom.audio) {
      if (dom.musicPlayBtn) {
        dom.musicPlayBtn.setAttribute(
          "aria-label",
          t(dom.audio.paused ? "musicPlayLabel" : "musicPauseLabel")
        );
      }
      if (dom.musicMuteBtn) {
        dom.musicMuteBtn.setAttribute(
          "aria-label",
          t(dom.audio.muted ? "musicUnmuteLabel" : "musicMuteLabel")
        );
      }
    }
  }

  function setLanguage(lang, opts) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    state.lang = lang;
    dom.body.setAttribute("data-lang", lang);

    if (dom.langToggle) {
      dom.langToggle.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    }

    if (!(opts && opts.persist === false)) safeSetLocalStorage(LANG_STORAGE_KEY, lang);
    applyTranslations();
    renderMessage();
    renderRelatedWishes();
  }

  function setupLanguageToggle() {
    if (!dom.langToggle) return;
    dom.langToggle.addEventListener("click", () => {
      const next = state.lang === "bn" ? "en" : "bn";
      setLanguage(next);
    });
  }

  function getInitialLanguage() {
    const stored =
      safeGetLocalStorage(LANG_STORAGE_KEY) || safeGetLocalStorage(LEGACY_LANG_STORAGE_KEY);
    return SUPPORTED_LANGS.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
  }

  /* ---------------------------------------------------------
     10. SCENE NAVIGATION
  --------------------------------------------------------- */
  function showSection(step) {
    const target = Math.min(Math.max(step, 1), TOTAL_STEPS);
    state.currentStep = target;

    dom.scenes.forEach((scene) => {
      const sceneStep = parseInt(scene.getAttribute("data-step"), 10);
      scene.classList.toggle("is-active", sceneStep === target);
    });

    dom.dots.forEach((dot) => {
      const dotStep = parseInt(dot.getAttribute("data-step"), 10);
      dot.classList.toggle("is-current", dotStep === target);
    });

    /* Move focus to the newly active scene heading for accessibility. */
    const activeScene = dom.scenes.find(
      (scene) => parseInt(scene.getAttribute("data-step"), 10) === target
    );
    if (activeScene) {
      activeScene.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => {
        try {
          activeScene.focus({ preventScroll: true });
        } catch (err) {
          /* Older browsers without focus options — ignore */
        }
      });
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }

    if (target === 5) {
      revealWishesInOrder();
    }
  }

  function setupSceneNavigation() {
    document.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = parseInt(btn.getAttribute("data-next"), 10);
        if (!isNaN(next)) showSection(next);
      });
    });
  }

  /* ---------------------------------------------------------
     11. WELCOME (SCENE 01)
  --------------------------------------------------------- */
  function setupWelcome() {
    if (!dom.openSurpriseBtn) return;
    dom.openSurpriseBtn.addEventListener("click", () => {
      showSection(2);
      attemptMusicAutostart();
    });
  }

  /* ---------------------------------------------------------
     12. GIFT (SCENE 03)
  --------------------------------------------------------- */
  function createConfetti(container, count) {
    if (!container) return;
    if (prefersReducedMotion()) return;

    const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#FB7185"];
    const pieces = typeof count === "number" ? count : 18;

    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      const dx = (Math.random() - 0.5) * 220;
      const dy = 120 + Math.random() * 100;
      const rot = 120 + Math.random() * 240;
      const delay = Math.random() * 0.2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      piece.style.setProperty("--dx", dx + "px");
      piece.style.setProperty("--dy", dy + "px");
      piece.style.setProperty("--rot", rot + "deg");
      piece.style.animationDelay = delay + "s";
      piece.style.background = color;
      piece.style.left = 50 + (Math.random() - 0.5) * 30 + "%";
      piece.style.borderRadius = Math.random() > 0.5 ? "2px" : "50%";

      container.appendChild(piece);

      /* Clean up after the animation finishes so the DOM doesn't grow. */
      window.setTimeout(() => {
        if (piece.parentNode) piece.parentNode.removeChild(piece);
      }, 2000);
    }
  }

  function setupGift() {
    if (!dom.giftBox) return;

    dom.giftBox.addEventListener("click", () => {
      if (state.giftOpened) return;
      state.giftOpened = true;

      dom.giftBox.classList.add("is-opened");
      dom.giftBox.setAttribute("aria-disabled", "true");
      dom.giftBox.setAttribute("aria-label", t("giftBoxLabelOpened"));

      if (dom.giftCard) dom.giftCard.hidden = false;
      if (dom.giftHint) dom.giftHint.textContent = t("giftHintOpened");
      if (dom.afterGiftBtn) dom.afterGiftBtn.hidden = false;

      createConfetti(dom.confettiLayerGift, 20);
    });
  }

  /* ---------------------------------------------------------
     13. WISHES (SCENE 05) — reveal one by one
  --------------------------------------------------------- */
  function revealWishesInOrder() {
    if (!dom.wishList) return;
    const lines = Array.from(dom.wishList.querySelectorAll(".wish-line"));

    if (prefersReducedMotion()) {
      lines.forEach((line) => line.classList.add("is-visible"));
      return;
    }

    lines.forEach((line, index) => {
      if (line.classList.contains("is-visible")) return;
      window.setTimeout(() => {
        line.classList.add("is-visible");
      }, 220 * (index + 1));
    });
  }

  function setupScrollAnimations() {
    /* Wishes reveal is triggered directly when scene 5 becomes active
       (see showSection). IntersectionObserver is used as a safety net
       in case a browser exposes the list differently in future markup. */
    if (!("IntersectionObserver" in window) || !dom.wishList) return;

    wishObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealWishesInOrder();
          }
        });
      },
      { threshold: 0.3 }
    );

    wishObserver.observe(dom.wishList);
  }

  /* ---------------------------------------------------------
     14. CANDLE (SCENE 06)
  --------------------------------------------------------- */
  function setupCandle() {
    if (!dom.candleBtn) return;

    dom.candleBtn.addEventListener("click", () => {
      if (state.candleBlown) return;
      state.candleBlown = true;

      dom.candleBtn.classList.add("is-blown");
      dom.candleBtn.setAttribute("aria-disabled", "true");
      dom.candleBtn.setAttribute("aria-label", t("candleLabelDone"));

      if (dom.candlePrompt) dom.candlePrompt.textContent = t("candlePromptDone");
      if (dom.candleMessage) dom.candleMessage.hidden = false;
      if (dom.afterCandleBtn) dom.afterCandleBtn.hidden = false;

      createConfetti(dom.confettiLayerCandle, 22);
    });
  }

  /* ---------------------------------------------------------
     15. MUSIC (SCENE 07)
  --------------------------------------------------------- */
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" + secs : secs);
  }

  function setPlayIconState(isPlaying) {
    if (!dom.musicPlayBtn) return;
    const playIcon = dom.musicPlayBtn.querySelector(".icon-play");
    const pauseIcon = dom.musicPlayBtn.querySelector(".icon-pause");
    if (playIcon) playIcon.hidden = isPlaying;
    if (pauseIcon) pauseIcon.hidden = !isPlaying;
    dom.musicPlayBtn.setAttribute(
      "aria-label",
      t(isPlaying ? "musicPauseLabel" : "musicPlayLabel")
    );
  }

  function setMuteIconState(isMuted) {
    if (!dom.musicMuteBtn) return;
    const soundIcon = dom.musicMuteBtn.querySelector(".icon-sound");
    const mutedIcon = dom.musicMuteBtn.querySelector(".icon-muted");
    if (soundIcon) soundIcon.hidden = isMuted;
    if (mutedIcon) mutedIcon.hidden = !isMuted;
    dom.musicMuteBtn.setAttribute(
      "aria-label",
      t(isMuted ? "musicUnmuteLabel" : "musicMuteLabel")
    );
  }

  function disableMusicUI() {
    if (dom.musicPlayer) dom.musicPlayer.hidden = true;
    if (dom.musicTapHint) dom.musicTapHint.hidden = true;
    if (dom.musicUnavailable) dom.musicUnavailable.hidden = false;
    if (dom.musicHeading) dom.musicHeading.textContent = t("musicUnavailable");
  }

  function attemptMusicAutostart() {
    if (!dom.audio || !state.musicReady) return;
    if (state.musicUserPaused) return;

    const playPromise = dom.audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          setPlayIconState(true);
          if (dom.musicTapHint) dom.musicTapHint.hidden = true;
        })
        .catch(() => {
          /* Autoplay blocked by the browser — this is expected and fine. */
          setPlayIconState(false);
          if (dom.musicTapHint) dom.musicTapHint.hidden = false;
        });
    }
  }

  function setupMusic() {
    if (!dom.audio) return;

    dom.audio.loop = true;
    dom.audio.volume = DEFAULT_VOLUME;
    if (dom.musicVolume) dom.musicVolume.value = String(DEFAULT_VOLUME);

    let loadFailed = false;

    dom.audio.addEventListener("loadedmetadata", () => {
      state.musicReady = true;
      if (dom.musicDuration) {
        dom.musicDuration.textContent = formatTime(dom.audio.duration);
      }
    });

    dom.audio.addEventListener("timeupdate", () => {
      if (!dom.audio.duration) return;
      const pct = (dom.audio.currentTime / dom.audio.duration) * 100;
      if (dom.musicProgressFill) dom.musicProgressFill.style.width = pct + "%";
      if (dom.musicCurrentTime) {
        dom.musicCurrentTime.textContent = formatTime(dom.audio.currentTime);
      }
      if (dom.musicProgressTrack) {
        dom.musicProgressTrack.setAttribute("aria-valuenow", String(Math.round(pct)));
        dom.musicProgressTrack.setAttribute(
          "aria-valuetext",
          formatTime(dom.audio.currentTime) + " / " + formatTime(dom.audio.duration)
        );
      }
    });

    dom.audio.addEventListener("error", () => {
      if (loadFailed) return;
      loadFailed = true;
      state.musicReady = false;
      disableMusicUI();
    });

    /* Set the source last, after listeners are attached. */
    try {
      dom.audio.src = MUSIC_PATH;
    } catch (err) {
      disableMusicUI();
      return;
    }

    if (dom.musicPlayBtn) {
      dom.musicPlayBtn.addEventListener("click", () => {
        if (loadFailed) return;
        if (dom.audio.paused) {
          state.musicUserPaused = false;
          const p = dom.audio.play();
          if (p && typeof p.then === "function") {
            p.then(() => {
              setPlayIconState(true);
              if (dom.musicTapHint) dom.musicTapHint.hidden = true;
            }).catch(() => {
              setPlayIconState(false);
            });
          }
        } else {
          state.musicUserPaused = true;
          dom.audio.pause();
          setPlayIconState(false);
        }
      });
    }

    if (dom.musicMuteBtn) {
      dom.musicMuteBtn.addEventListener("click", () => {
        dom.audio.muted = !dom.audio.muted;
        setMuteIconState(dom.audio.muted);
      });
    }

    if (dom.musicVolume) {
      dom.musicVolume.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          dom.audio.volume = val;
          if (val === 0) {
            dom.audio.muted = true;
            setMuteIconState(true);
          } else if (dom.audio.muted) {
            dom.audio.muted = false;
            setMuteIconState(false);
          }
        }
      });
    }

    if (dom.musicProgressTrack) {
      dom.musicProgressTrack.addEventListener("click", (e) => {
        if (!dom.audio.duration) return;
        const rect = dom.musicProgressTrack.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const clamped = Math.min(Math.max(ratio, 0), 1);
        dom.audio.currentTime = clamped * dom.audio.duration;
      });

      /* Keyboard operation for the seek slider (role="slider"). */
      dom.musicProgressTrack.addEventListener("keydown", (e) => {
        if (!dom.audio.duration) return;
        const step = 5;
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") next = dom.audio.currentTime + step;
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = dom.audio.currentTime - step;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = dom.audio.duration - 0.1;
        if (next === null) return;
        e.preventDefault();
        dom.audio.currentTime = Math.min(Math.max(next, 0), dom.audio.duration);
      });
    }

    /* Pause when the tab is hidden; resume gracefully if it was playing. */
    let wasPlayingBeforeHide = false;
    document.addEventListener("visibilitychange", () => {
      if (!dom.audio) return;
      if (document.hidden) {
        wasPlayingBeforeHide = !dom.audio.paused;
        if (!dom.audio.paused) dom.audio.pause();
      } else if (wasPlayingBeforeHide && !state.musicUserPaused) {
        const p = dom.audio.play();
        if (p && typeof p.then === "function") {
          p.then(() => setPlayIconState(true)).catch(() => setPlayIconState(false));
        }
      }
    });
  }

  /* ---------------------------------------------------------
     16. SHARE (SCENE 08)
  --------------------------------------------------------- */
  function buildShareUrl() {
    if (!Params || !TEMPLATE) return window.location.href;
    if (!state.personalised) return window.location.origin + window.location.pathname;
    return Params.build(window.location.origin, TEMPLATE, {
      name: state.recipientName,
      from: state.senderName,
      message: state.customMessage,
      theme: state.theme,
      lang: state.paramLang
    }).url;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    /* Fallback for older browsers / restricted contexts. */
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successful) resolve();
        else reject(new Error("Copy command failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  function setupShare() {
    if (!dom.shareBtn) return;

    dom.shareBtn.addEventListener("click", () => {
      const displayName = state.recipientName || t("fallbackName");
      const url = buildShareUrl();
      const titleFn = t("shareTitle");
      const textFn = t("shareText");
      const title = typeof titleFn === "function" ? titleFn(displayName) : "Wishora";
      const text = typeof textFn === "function" ? textFn(displayName) : "";

      if (navigator.share) {
        navigator
          .share({ title: title, text: text, url: url })
          .catch(() => {
            /* User cancelled or share failed silently — no error shown. */
          });
        return;
      }

      copyToClipboard(url)
        .then(() => showToast(t("linkCopied")))
        .catch(() => {
          /* Clipboard unavailable — fail quietly, nothing broken for the user. */
        });
    });
  }

  /* ---------------------------------------------------------
     17. REPLAY
  --------------------------------------------------------- */
  function setupReplay() {
    if (!dom.replayBtn) return;

    dom.replayBtn.addEventListener("click", () => {
      /* Reset gift */
      state.giftOpened = false;
      if (dom.giftBox) {
        dom.giftBox.classList.remove("is-opened");
        dom.giftBox.removeAttribute("aria-disabled");
        dom.giftBox.setAttribute("aria-label", t("giftBoxLabel"));
      }
      if (dom.giftCard) dom.giftCard.hidden = true;
      if (dom.giftHint) dom.giftHint.textContent = t("giftHint");
      if (dom.afterGiftBtn) dom.afterGiftBtn.hidden = true;

      /* Reset candle */
      state.candleBlown = false;
      if (dom.candleBtn) {
        dom.candleBtn.classList.remove("is-blown");
        dom.candleBtn.removeAttribute("aria-disabled");
        dom.candleBtn.setAttribute("aria-label", t("candleLabel"));
      }
      if (dom.candlePrompt) dom.candlePrompt.textContent = t("candlePrompt");
      if (dom.candleMessage) dom.candleMessage.hidden = true;
      if (dom.afterCandleBtn) dom.afterCandleBtn.hidden = true;

      /* Reset wish list animation */
      if (dom.wishList) {
        dom.wishList.querySelectorAll(".wish-line").forEach((line) => {
          line.classList.remove("is-visible");
        });
      }

      /* Recipient name & language are intentionally preserved.
         Music preference (playing/paused) is preserved as-is. */
      showSection(1);
    });
  }

  /* ---------------------------------------------------------
     17b. RELATED WISHES
     Built from data/wishes.js → related[] of THIS wish. Only LIVE wishes
     are ever linked; the block stays hidden while the list is empty.
     Titles are written with textContent and hrefs are validated.
  --------------------------------------------------------- */
  function renderRelatedWishes() {
    const box = document.getElementById("relatedWishes");
    const list = document.getElementById("relatedList");
    if (!box || !list) return;

    const all = Array.isArray(data.wishes) ? data.wishes : [];
    const self = all.find((w) => w && w.id === CURRENT_WISH_ID);
    const ids = self && Array.isArray(self.related) ? self.related : [];

    const items = ids
      .map((id) => all.find((w) => w && w.id === id && w.status === "live"))
      .filter((w) => w && /^[a-z0-9_\-\/]+\.html$/i.test(w.path || ""));

    list.textContent = "";
    items.forEach((w) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      /* This page lives at /wishes/<category>/, so site-root paths are ../../ */
      a.href = "../.." + (w.route || "/" + w.path);
      a.textContent = (w.title && (w.title[state.lang] || w.title.bn)) || w.id;
      li.appendChild(a);
      list.appendChild(li);
    });
    box.hidden = items.length === 0;
  }

  /* ---------------------------------------------------------
     18. INIT
  --------------------------------------------------------- */
  function init() {
    try {
      readUrlParams();
      setupLanguageToggle();
      setupSceneNavigation();
      setupWelcome();
      setupGift();
      setupCandle();
      setupMusic();
      setupShare();
      setupReplay();
      setupScrollAnimations();

      applyTheme();
      markPersonalisedNoindex();
      /* A ?lang= in the link wins, but must not overwrite the visitor's saved choice. */
      setLanguage(state.paramLang || getInitialLanguage(), { persist: !state.paramLang });
      updateRecipient();
      renderRelatedWishes();
      showSection(1);
    } catch (err) {
      /* A single failure should never take down the whole experience. */
      // eslint-disable-next-line no-console
      console.error("Wishora birthday experience init error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
