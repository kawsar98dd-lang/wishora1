/* =========================================================
   Static content pages (About, Privacy, Terms).
   Block types: h2 | p | ul | contact.  Every text is { bn, en }.
   These describe what the site REALLY does today. If behaviour changes
   (analytics, ads, accounts…), update the text in the same change.
   Legal wording has NOT been reviewed by a lawyer — see README.
   ========================================================= */
export const UPDATED = "2026-10-07";

export const pages = {
  about: {
    path: "/about/",
    file: "about/index.html",
    title: { bn: "আমাদের সম্পর্কে", en: "About us" },
    meta: {
      bn: "Wishora কী, এখন কী করা যায়, আর কী তৈরি হচ্ছে।",
      en: "What Wishora is, what you can do here today, and what is still being built."
    },
    blocks: [
      { h2: { bn: "Wishora কী", en: "What Wishora is" } },
      { p: {
        bn: "Wishora হলো সুন্দর ডিজিটাল শুভেচ্ছার একটি ছোট্ট সংগ্রহ। প্রতিটি শুভেচ্ছা একটি লিংক, যেটি খুলে দেখা যায় আর প্রিয় মানুষের কাছে পাঠানো যায়।",
        en: "Wishora is a small collection of beautiful digital wishes. Each wish is a link you can open and send to someone you care about." } },
      { h2: { bn: "এখন যা আছে", en: "What is here today" } },
      { p: {
        bn: "শুরুটা হয়েছে জন্মদিনের শুভেচ্ছা দিয়ে, এখন ভালোবাসা ও বার্ষিকীর শুভেচ্ছাও আছে। চালু শুভেচ্ছাগুলো হোম পেজ ও ক্যাটাগরি পেজে দেখা যায়। আপনি নিজেও নাম, নিজের বার্তা আর রূপ বেছে শুভেচ্ছা সাজিয়ে একটি লিংকে শেয়ার করতে পারেন। পুরো সাইট বাংলা ও ইংরেজি দুই ভাষায় পাওয়া যায়।",
        en: "We started with a birthday wish, and now there are love and anniversary wishes too. The wishes that are live appear on the home page and on category pages. You can also personalise a wish yourself, with a name, your own message and a look, and share it as one link. The whole site is available in Bengali and English." },
        link: { href: "/create/", label: { bn: "শুভেচ্ছা তৈরি করুন", en: "Create a wish" } } },
      { h2: { bn: "যা তৈরি হচ্ছে", en: "What is being built" } },
      { p: {
        bn: "আরও ক্যাটাগরি, আরও টেমপ্লেট আর আরও বিকল্প (যেমন ছবি বা গান) নিয়ে ভাবা হচ্ছে। এগুলো কবে আসবে, তা এখনো ঠিক হয়নি।",
        en: "We are thinking about more categories, more templates and more options (such as photos or music). We haven't set dates for these yet." } },
      { h2: { bn: "যোগাযোগ", en: "Contact" }, id: "contact" },
      { contact: {
        empty: { bn: "যোগাযোগের ঠিকানা এখনো প্রকাশ করা হয়নি।", en: "A contact address hasn't been published yet." },
        lead: { bn: "ইমেইলে লিখুন:", en: "Write to us by email:" } } }
    ]
  },

  privacy: {
    path: "/privacy/",
    file: "privacy/index.html",
    title: { bn: "গোপনীয়তা নীতি", en: "Privacy" },
    meta: {
      bn: "Wishora কোন তথ্য ব্যবহার করে আর কী করে না, সহজ ভাষায়।",
      en: "In plain language: what Wishora does and doesn't do with your information."
    },
    blocks: [
      { h2: { bn: "সংক্ষেপে", en: "In short" } },
      { ul: [
        { bn: "Wishora-তে অ্যাকাউন্ট বা সাইন-আপ ফর্ম নেই। আমরা নিজেরা আপনার ব্যক্তিগত তথ্য চাই না, জমাও রাখি না।",
          en: "Wishora has no accounts and no sign-up forms. We don't ask for or keep your personal details ourselves." },
        { bn: "এই সাইটে এখন কোনো বিজ্ঞাপন বা অ্যানালিটিক্স ট্র্যাকার নেই।",
          en: "There are no advertisements or analytics trackers on this site right now." }
      ] },
      { h2: { bn: "আপনার ব্রাউজারে যা জমা থাকে", en: "What is stored in your browser" } },
      { p: {
        bn: "আপনি যে ভাষা বেছে নেন (বাংলা বা English), সেটি ব্রাউজারের লোকাল স্টোরেজে রাখা হয়, যাতে পরের বার সাইটটি একই ভাষায় খোলে। এটি আপনার ডিভাইসেই থাকে।",
        en: "The language you choose (Bengali or English) is saved in your browser's local storage so the site opens in the same language next time. It stays on your device." } },
      { h2: { bn: "শুভেচ্ছার লিংকে নাম ও বার্তা", en: "Names and messages in a wish link" } },
      { p: {
        bn: "শুভেচ্ছা তৈরির পাতায় আপনি যে নাম আর বার্তা লেখেন, সেগুলো শেয়ারের লিংকের অংশ হয়ে যায় (?name=…, &from=… আর &message=…)। এগুলো আপনার ব্রাউজারেই তৈরি ও দেখানো হয়; Wishora আপনার শুভেচ্ছা কোনো সার্ভারে জমা রাখে না। তবে লিংকে থাকা তথ্য লিংক যার কাছে যাবে সে পড়তে পারবে, আর হোস্টিং সার্ভারের সাধারণ লগেও লিংকটি থাকতে পারে। যা প্রকাশ হলে আপনার অসুবিধা হবে, তা লিংকে দেবেন না।",
        en: "On the Create page, the names and message you type become part of the shareable link (?name=…, &from=… and &message=…). They are built and shown in your browser; Wishora doesn't save your wish on a server. But the details in a link can be read by anyone who has it, and the hosting server's normal logs may contain the link. Don't put anything in a link that you wouldn't want to be seen." } },
      { h2: { bn: "তৃতীয় পক্ষের সেবা", en: "Third-party services" } },
      { p: {
        bn: "সাইটের ফন্ট Google Fonts থেকে আসে। ফন্ট নামানোর সময় আপনার আইপি ঠিকানা আর ব্রাউজারের কিছু তথ্য Google-এর কাছে যেতে পারে। এর নিয়ম Google-এর নিজস্ব গোপনীয়তা নীতিতে আছে।",
        en: "The site's fonts come from Google Fonts. When they load, your IP address and some browser details can reach Google. Google's own privacy policy covers that." } },
      { h2: { bn: "পরিবর্তন", en: "Changes" } },
      { p: {
        bn: "ভবিষ্যতে অ্যানালিটিক্স, বিজ্ঞাপন বা অ্যাকাউন্টের সুবিধা যোগ হলে, তা চালুর আগে এই পাতা হালনাগাদ করা হবে।",
        en: "If we add analytics, advertising or accounts later, this page will be updated before they go live." } },
      { h2: { bn: "প্রশ্ন থাকলে", en: "Questions" } },
      { p: {
        bn: "যোগাযোগের তথ্য আছে আমাদের সম্পর্কে পাতায়।",
        en: "Contact details are on the About page." },
        link: { href: "/about/#contact", label: { bn: "যোগাযোগ", en: "Contact" } } }
    ]
  },

  terms: {
    path: "/terms/",
    file: "terms/index.html",
    title: { bn: "ব্যবহারের শর্তাবলী", en: "Terms of use" },
    meta: {
      bn: "Wishora ব্যবহারের সহজ শর্তগুলো।",
      en: "The simple terms for using Wishora."
    },
    blocks: [
      { h2: { bn: "ব্যবহারের নিয়ম", en: "Using Wishora" } },
      { ul: [
        { bn: "Wishora ব্যক্তিগত ও অ-বাণিজ্যিক ব্যবহারের জন্য: শুভেচ্ছা দেখা আর পরিচিত মানুষের সাথে শেয়ার করা।",
          en: "Wishora is for personal, non-commercial use: viewing wishes and sharing them with people you know." },
        { bn: "কাউকে হয়রানি বা অপমান করতে শুভেচ্ছার লিংক, লিংকে দেওয়া নাম বা নিজের লেখা বার্তা ব্যবহার করবেন না।",
          en: "Please don't use wish links, the names in them or the messages you write to harass or insult anyone." },
        { bn: "আপনার লেখা বার্তার দায় আপনার। বার্তা লিংকের ভেতরেই থাকে বলে Wishora তা আগে দেখে না বা যাচাই করে না।",
          en: "You are responsible for the message you write. It lives inside the link, so Wishora doesn't see or review it." }
      ] },
      { h2: { bn: "কোনো নিশ্চয়তা নেই", en: "No guarantees" } },
      { p: {
        bn: "সাইটটি যেমন আছে তেমনভাবেই দেওয়া হয়। কোনো শুভেচ্ছা সবসময় চালু থাকবে বা ত্রুটিহীন হবে, এমন নিশ্চয়তা আমরা দিই না।",
        en: "The site is provided as it is. We don't promise that any wish will always be available or free of errors." } },
      { h2: { bn: "পরিবর্তন", en: "Changes" } },
      { p: {
        bn: "আমরা শুভেচ্ছা বদলাতে, সরাতে বা নতুন যোগ করতে পারি। নতুন সুবিধা যোগ হলে এই শর্তাবলীও বদলাতে পারে।",
        en: "We may change, remove or add wishes. These terms may change when we add new features." } }
    ]
  }
};
