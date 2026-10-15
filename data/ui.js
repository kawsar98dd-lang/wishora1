/* =========================================================
   WISHORA — SHARED UI STRINGS
   data/ui.js

   Every user-facing string used by generated pages (homepage, category
   pages, header, footer) lives here as { bn, en }. `scripts/build.mjs`
   renders both languages into the HTML; the active one is shown with CSS
   (html[lang]) so pages work without JavaScript.

   Rules
   • Every key MUST have both bn and en (scripts/check-repo.mjs enforces it).
   • {n} is replaced with a number where noted.
   • Adding a language later = add a code to config.supportedLangs and a
     value to each key here.
   • Keep Bengali simple and conversational.
   ========================================================= */
(function () {
  "use strict";

  var data = (window.WISHORA_DATA = window.WISHORA_DATA || {});

  data.ui = {
    /* --- global / header / nav --- */
    skip:            { bn: "মূল বিষয়বস্তুতে যান", en: "Skip to main content" },
    navHome:         { bn: "হোম", en: "Home" },
    navExplore:      { bn: "শুভেচ্ছা", en: "Wishes" },
    navCategories:   { bn: "ক্যাটাগরি", en: "Categories" },
    navAbout:        { bn: "আমাদের সম্পর্কে", en: "About" },
    exploreCta:      { bn: "শুভেচ্ছা দেখুন", en: "Explore Wishes" },
    createCta:       { bn: "শুভেচ্ছা তৈরি করুন", en: "Create a Wish" },
    soon:            { bn: "শীঘ্রই আসছে", en: "Coming soon" },
    ariaBrand:       { bn: "Wishora হোম", en: "Wishora home" },
    ariaLang:        { bn: "ভাষা পরিবর্তন করুন", en: "Change language" },
    ariaMenuOpen:    { bn: "মেনু খুলুন", en: "Open menu" },
    ariaMenuClose:   { bn: "মেনু বন্ধ করুন", en: "Close menu" },
    ariaNavMain:     { bn: "প্রধান মেনু", en: "Main menu" },
    ariaNavMobile:   { bn: "মোবাইল মেনু", en: "Mobile menu" },
    ariaBreadcrumb:  { bn: "পথ", en: "Breadcrumb" },

    /* --- hero --- */
    heroBadge:       { bn: "বিশেষ মুহূর্তের জন্য সুন্দর শুভেচ্ছা", en: "Beautiful wishes for special moments" },
    heroTitle:       { bn: "মনের কথাটা বলুন, সুন্দরভাবে।", en: "Say what your heart feels, beautifully." },
    heroText:        {
      bn: "সুন্দর ডিজিটাল শুভেচ্ছা খুঁজে নিন আর একটি লিংকে প্রিয় মানুষের কাছে পাঠিয়ে দিন। এখন জন্মদিন, ভালোবাসা আর বার্ষিকীর শুভেচ্ছা আছে, আরও আসছে।",
      en: "Find a beautiful digital wish and send it to someone special with a single link. Birthday, love and anniversary wishes are ready, with more on the way."
    },

    /* --- search --- */
    searchLabel:     { bn: "শুভেচ্ছা খুঁজুন", en: "Search wishes" },
    searchPlaceholder: { bn: "যেমন: জন্মদিন", en: "Try “birthday”" },
    searchBtn:       { bn: "খুঁজুন", en: "Search" },
    searchClear:     { bn: "খোঁজ মুছুন", en: "Clear search" },
    searchHint:      { bn: "শিরোনাম, ক্যাটাগরি বা কয়েকটি শব্দ লিখে খুঁজুন।", en: "Search by title, category or a few words." },
    searchSeeResults:{ bn: "ফলাফল দেখুন", en: "See results" },

    /* --- explore / results --- */
    exploreTitle:    { bn: "শুভেচ্ছা খুঁজে নিন", en: "Find a wish" },
    exploreText:     { bn: "একটি ক্যাটাগরি বেছে নিন, কিংবা সরাসরি খুঁজুন।", en: "Pick a category, or just search." },
    filterLabel:     { bn: "ক্যাটাগরি অনুযায়ী দেখুন", en: "Filter by category" },
    chipAll:         { bn: "সব", en: "All" },
    groupFeatured:   { bn: "বিশেষ শুভেচ্ছা", en: "Featured wishes" },
    groupMore:       { bn: "আরও শুভেচ্ছা", en: "More wishes" },
    groupAll:        { bn: "সব শুভেচ্ছা", en: "All wishes" },
    featuredTag:     { bn: "বিশেষ", en: "Featured" },
    openWish:        { bn: "শুভেচ্ছাটি খুলুন", en: "Open wish" },
    languagesLabel:  { bn: "ভাষা", en: "Languages" },
    /* {n} = number */
    liveOne:         { bn: "এখন 1টি শুভেচ্ছা চালু আছে। আরও আসছে।", en: "1 wish is live right now. More are on the way." },
    liveMany:        { bn: "এখন {n}টি শুভেচ্ছা চালু আছে।", en: "{n} wishes are live right now." },
    resultsOne:      { bn: "1টি শুভেচ্ছা পাওয়া গেছে", en: "1 wish found" },
    resultsMany:     { bn: "{n}টি শুভেচ্ছা পাওয়া গেছে", en: "{n} wishes found" },
    resultsNone:     { bn: "কোনো শুভেচ্ছা পাওয়া যায়নি", en: "No wishes found" },
    noResultsTitle:  { bn: "এই খোঁজে কোনো শুভেচ্ছা মেলেনি।", en: "No wish matches that search." },
    noResultsText:   { bn: "অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন, অথবা সব শুভেচ্ছা আবার দেখুন।", en: "Try different words, or show all wishes again." },
    noResultsSoon:   { bn: "এগুলো শীঘ্রই আসছে:", en: "These are coming soon:" },
    clearAll:        { bn: "সব ফিল্টার মুছুন", en: "Clear search and filters" },

    /* --- categories --- */
    categoriesTitle: { bn: "উপলক্ষ অনুযায়ী ক্যাটাগরি", en: "Browse by occasion" },
    categoriesText:  { bn: "যে উপলক্ষের জন্য খুঁজছেন, সেটি বেছে নিন। “শীঘ্রই আসছে” লেখাগুলো এখনো চালু হয়নি।", en: "Choose an occasion. The ones marked “Coming soon” aren't available yet." },
    wishCountOne:    { bn: "1টি শুভেচ্ছা", en: "1 wish" },
    wishCountMany:   { bn: "{n}টি শুভেচ্ছা", en: "{n} wishes" },
    viewCategory:    { bn: "দেখুন", en: "View" },

    /* --- coming soon --- */
    comingTitle:     { bn: "যা আসছে", en: "What's coming" },
    comingText:      { bn: "এগুলো আমাদের পরিকল্পনা। এখনো তৈরি হয়নি, কোনো তারিখও ঠিক হয়নি।", en: "These are plans, not launches. None of them is ready yet, and there are no release dates." },
    creatorTitle:    { bn: "নিজের শুভেচ্ছা তৈরি করুন", en: "Create your own wish" },
    creatorGo:       { bn: "তৈরি শুরু করুন", en: "Start creating" },
    creatorText: { bn: "নাম, বার্তা আর রূপ বেছে নিজের মতো করে শুভেচ্ছা সাজান, তারপর লিংকটি শেয়ার করুন।", en: "Choose a name, a message and a look, then share the link." },
    plannedTitle:    { bn: "যে শুভেচ্ছাগুলো ভাবা হচ্ছে", en: "Wishes we're planning" },

    /* --- why --- */
    whyTitle:        { bn: "কেন Wishora?", en: "Why Wishora?" },
    why1Title:       { bn: "যত্ন করে সাজানো", en: "Made with care" },
    why1Text:        { bn: "প্রতিটি শুভেচ্ছা একটি ছোট্ট অভিজ্ঞতা: রং, নড়াচড়া আর কথা একসাথে।", en: "Each wish is a small experience: colour, motion and words together." },
    why2Title:       { bn: "সহজে শেয়ার", en: "Easy to share" },
    why2Text:        { bn: "একটি লিংকেই পৌঁছে দিন প্রিয় মানুষের কাছে।", en: "Send it to someone you care about with a single link." },
    why3Title:       { bn: "বাংলা ও ইংরেজি", en: "Bengali and English" },
    why3Text:        { bn: "দুই ভাষাতেই পড়তে ও ব্যবহার করতে পারবেন, ফোনের ছোট স্ক্রিনেও।", en: "Use it in either language, including on a small phone screen." },
    why4Title: { bn: "নিজের মতো করে", en: "Made personal" },
    why4Text: { bn: "প্রাপকের নাম, আপনার নাম আর নিজের বার্তা যোগ করে শুভেচ্ছাটি নিজের করে নিন।", en: "Add the recipient's name, your name and your own message to make a wish yours." },

    /* --- bottom cta --- */
    ctaTitle:        { bn: "কাউকে কিছু বলতে চান?", en: "Have something to tell someone?" },
    ctaText:         { bn: "একটি শুভেচ্ছা খুলে দেখুন, তারপর লিংকটি পাঠিয়ে দিন।", en: "Open a wish, then send the link." },

    /* --- footer --- */
    footerDesc:      { bn: "সুন্দর ডিজিটাল শুভেচ্ছা, একটি লিংকে পাঠানোর জন্য।", en: "Beautiful digital wishes, ready to send with one link." },
    footerNavTitle:  { bn: "নেভিগেশন", en: "Navigate" },
    footerInfoTitle: { bn: "তথ্য", en: "Information" },
    footerPrivacy:   { bn: "গোপনীয়তা", en: "Privacy" },
    footerTerms:     { bn: "শর্তাবলী", en: "Terms" },
    footerContact:   { bn: "যোগাযোগ", en: "Contact" },
    footerLangTitle: { bn: "ভাষা", en: "Language" },
    footerSocial:    { bn: "সামাজিক মাধ্যম", en: "Social" },
    footerRights:    { bn: "সর্বস্বত্ব সংরক্ষিত।", en: "All rights reserved." },

    /* --- category pages --- */
    crumbHome:       { bn: "হোম", en: "Home" },
    catWishesTitle:  { bn: "এই ক্যাটাগরির শুভেচ্ছা", en: "Wishes in this category" },
    catFaqTitle:     { bn: "সাধারণ প্রশ্ন", en: "Frequently asked questions" },
    catFaqIntro:     { bn: "শুভেচ্ছা বেছে নেওয়া, ব্যক্তিগত বার্তা যোগ করা এবং নিরাপদে শেয়ার করার কিছু উত্তর।", en: "A few practical answers about choosing a wish, adding a message and sharing it thoughtfully." },
    catHowTitle:     { bn: "নিজের মতো করে পাঠান", en: "Make it personal" },
    catHowText:      { bn: "লিংকের শেষে প্রাপকের নাম আর আপনার নাম জুড়ে দিন, যেমন:", en: "Add the recipient's name and your own name to the end of the link, like this:" },
    catHowExample:   { bn: "উদাহরণটি দেখুন", en: "See this example" },
    catOtherTitle:   { bn: "অন্যান্য উপলক্ষ", en: "Other occasions" },
    catOtherText:    { bn: "এগুলো এখনো চালু হয়নি।", en: "These aren't available yet." },
    catBackAll:      { bn: "সব শুভেচ্ছা দেখুন", en: "See all wishes" },
    catCreateTitle:  { bn: "নিজের শুভেচ্ছা বানাতে চান?", en: "Want to make your own?" },


    /* --- Creator: static (rendered at build time) --- */
    navCreate:       { bn: "শুভেচ্ছা তৈরি", en: "Create" },
    crMetaTitle:     { bn: "ব্যক্তিগত শুভেচ্ছা তৈরি করুন", en: "Create a Personalized Wish" },
    crMetaDesc:      { bn: "ব্রাউজারেই নিজের শুভেচ্ছা সাজান (জন্মদিন, ভালোবাসা বা বার্ষিকী): নাম, চাইলে নিজের বার্তা আর রূপ বেছে প্রিভিউ দেখুন, তারপর একটি লিংক শেয়ার করুন। কিছুই সার্ভারে জমা হয় না।", en: "Create a personalised birthday, love or anniversary wish in your browser: add a name, an optional message and a theme, preview it, then share one link. Nothing is saved on a server." },
    crTitle:         { bn: "নিজের শুভেচ্ছা তৈরি করুন", en: "Create a personalised wish" },
    crLead:          { bn: "কয়েকটি ধাপে শুভেচ্ছা সাজিয়ে একটি লিংক শেয়ার করুন। আপনার দেওয়া তথ্য লিংকের ভেতরেই থাকে; Wishora সেগুলো কোনো সার্ভারে জমা রাখে না।", en: "Set up a wish in a few steps, then share one link. Your details travel inside the link; Wishora doesn't save them on a server." },
    crNoJsTitle:     { bn: "এই সুবিধা চালাতে JavaScript লাগবে", en: "The Creator needs JavaScript" },
    crNoJsText:      { bn: "শুভেচ্ছা তৈরির এই সুবিধা আপনার ব্রাউজারেই চলে, তাই JavaScript চালু থাকতে হবে। চালু করে পাতাটি আবার খুলুন, অথবা এখনই তৈরি একটি শুভেচ্ছা দেখুন।", en: "The Creator runs in your browser, so JavaScript has to be on. Turn it on and reload, or open a ready-made wish now." },
    crStepsLabel:    { bn: "ধাপসমূহ", en: "Steps" },
    crStep1:         { bn: "উপলক্ষ", en: "Occasion" },
    crStep2:         { bn: "টেমপ্লেট", en: "Template" },
    crStep3:         { bn: "তথ্য", en: "Details" },
    crStep4:         { bn: "প্রিভিউ", en: "Preview" },
    crStep5:         { bn: "শেয়ার", en: "Share" },
    crOccTitle:      { bn: "কোন উপলক্ষের জন্য?", en: "Which occasion?" },
    crOccHint:       { bn: "যেগুলোর জন্য এখন শুভেচ্ছা তৈরি করা যায়, শুধু সেগুলোই বেছে নেওয়া যাবে।", en: "You can only choose occasions that have a template today." },
    crOccSoonText:   { bn: "এগুলোর জন্য এখনো শুভেচ্ছা তৈরি করা যায় না।", en: "You can't create wishes for these yet." },
    crTplCountOne:   { bn: "1টি টেমপ্লেট", en: "1 template" },
    crTplCountMany:  { bn: "{n}টি টেমপ্লেট", en: "{n} templates" },
    crTplTitle:      { bn: "একটি টেমপ্লেট বেছে নিন", en: "Choose a template" },
    crTplStyle:      { bn: "ধরন", en: "Style" },
    crTplSeeOriginal:{ bn: "মূল শুভেচ্ছাটি দেখুন (নতুন ট্যাবে)", en: "See the original wish (new tab)" },
    crDetailsTitle:  { bn: "শুভেচ্ছাটি সাজান", en: "Personalise your wish" },
    crRequired:      { bn: "আবশ্যক", en: "Required" },
    crOptional:      { bn: "ঐচ্ছিক", en: "Optional" },
    crLangLabel:     { bn: "শুভেচ্ছার ভাষা", en: "Wish language" },
    crLangHint:      { bn: "প্রাপক যে ভাষায় শুভেচ্ছাটি দেখবেন।", en: "The language the recipient will see the wish in." },
    crMsgLegend:     { bn: "বার্তা", en: "Message" },
    crMsgDefault:    { bn: "টেমপ্লেটের বার্তাটি ব্যবহার করুন", en: "Use the template's message" },
    crMsgCustom:     { bn: "নিজে লিখব", en: "Write my own" },
    crMsgWillRead:   { bn: "বার্তাটি এমন হবে:", en: "The message will read:" },
    crThemeLegend:   { bn: "রূপ (থিম)", en: "Look (theme)" },
    crThemeHint:     { bn: "শুধু রং আর লেখার ধরন বদলায়।", en: "Only colours and type style change." },
    crBack:          { bn: "পিছনে", en: "Back" },
    crNext:          { bn: "পরবর্তী", en: "Next" },
    crUseTemplate:   { bn: "এই টেমপ্লেট ব্যবহার করুন", en: "Use this template" },
    crToPreview:     { bn: "প্রিভিউ দেখুন", en: "Preview" },
    crToShare:       { bn: "লিংক তৈরি করুন", en: "Create share link" },
    crEdit:          { bn: "তথ্য বদলান", en: "Edit details" },
    crPreviewTitle:  { bn: "প্রিভিউ", en: "Preview" },
    crPreviewHint:   { bn: "এটি আসল শুভেচ্ছাটিই, আপনার দেওয়া তথ্য সহ।", en: "This is the real wish, with your details." },
    crPreviewFrame:  { bn: "শুভেচ্ছার প্রিভিউ", en: "Wish preview" },
    crSummaryTitle:  { bn: "আপনার বাছাই", en: "Your choices" },
    crShareTitle:    { bn: "আপনার লিংক তৈরি", en: "Your link is ready" },
    crLinkLabel:     { bn: "শেয়ারের লিংক", en: "Shareable link" },
    crCopy:          { bn: "লিংক কপি করুন", en: "Copy link" },
    crShare:         { bn: "শেয়ার করুন", en: "Share" },
    crOpen:          { bn: "শুভেচ্ছাটি খুলুন", en: "Open wish" },
    crAgain:         { bn: "আরেকটি তৈরি করুন", en: "Create another" },
    crPrivacy:       { bn: "আপনার দেওয়া তথ্য শেয়ারের লিংকের অংশ হতে পারে। Wishora আপনার শুভেচ্ছা কোনো সার্ভারে জমা রাখে না; তথ্য লিংকের ভেতরেই থাকে, আর লিংক যার কাছে যাবে সে তা পড়তে পারবে।", en: "Information you enter may be included in the shareable link. Wishora doesn't save your wish on a server; the details live inside the link, and anyone who has the link can read them." },
    linkCreateHome:  { bn: "নিজের শুভেচ্ছা তৈরি করুন", en: "Create your own wish" },

    /* --- Creator: runtime messages (emitted as JSON for js/creator.js) --- */
    crxStepOf:       { bn: "ধাপ {n}/{total}: {name}", en: "Step {n} of {total}: {name}" },
    crxCount:        { bn: "{n}/{max}", en: "{n}/{max}" },
    crxErrNameRequired: { bn: "প্রাপকের নাম লিখুন।", en: "Enter the recipient's name." },
    crxErrTooLong:   { bn: "সর্বোচ্চ {max}টি অক্ষর লেখা যাবে (আপনি লিখেছেন {n}টি)।", en: "Please use at most {max} characters (you have {n})." },
    crxErrMsgRequired: { bn: "নিজের বার্তা লিখুন, অথবা টেমপ্লেটের বার্তা বেছে নিন।", en: "Write your message, or choose the template's message." },
    crxErrChoose:    { bn: "একটি বিকল্প বেছে নিন।", en: "Please choose an option." },
    crxErrUrlTooLong:{ bn: "লিংকটি অতিরিক্ত বড় হয়ে যাচ্ছে। নাম বা বার্তা ছোট করুন।", en: "The link would be too long. Please shorten the names or the message." },
    crxFormErrors:   { bn: "অনুগ্রহ করে চিহ্নিত ঘরগুলো ঠিক করুন।", en: "Please fix the highlighted fields." },
    crxErrTemplate:  { bn: "এই টেমপ্লেটটি পাওয়া যায়নি, তাই প্রথম ধাপ থেকে শুরু করা হলো।", en: "That template isn't available, so we've started from the beginning." },
    crxErrCategory:  { bn: "এই উপলক্ষের জন্য এখনো টেমপ্লেট নেই, তাই প্রথম ধাপ থেকে শুরু করা হলো।", en: "There's no template for that occasion yet, so we've started from the beginning." },
    crxCopied:       { bn: "লিংক কপি হয়েছে।", en: "Link copied." },
    crxCopyFail:     { bn: "নিজে থেকে কপি করা গেল না। লিংকটি বেছে নিয়ে নিজে কপি করুন।", en: "Couldn't copy automatically. Select the link and copy it yourself." },
    crxShareFail:    { bn: "শেয়ার করা গেল না। লিংক কপি করে পাঠিয়ে দিন।", en: "Sharing didn't work. Copy the link and send it instead." },
    crxGenericError: { bn: "কিছু একটা ঠিকমতো হয়নি। পাতাটি আবার খুলে চেষ্টা করুন।", en: "Something went wrong. Please reload the page and try again." },
    crxThemeLabel:   { bn: "রূপ (থিম)", en: "Theme" },
    crxWishLang:     { bn: "শুভেচ্ছার ভাষা", en: "Wish language" },
    crxNoSender:     { bn: "(কোনো প্রেরকের নাম নেই)", en: "(no sender name)" },
    crxTemplateMsg:  { bn: "টেমপ্লেটের বার্তা", en: "Template's message" },
    crxOwnMsg:       { bn: "আপনার নিজের বার্তা", en: "Your own message" },

    /* --- legal / about shared --- */
    pageUpdated:     { bn: "সর্বশেষ হালনাগাদ", en: "Last updated" }
  };
})();
