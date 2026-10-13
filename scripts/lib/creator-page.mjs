/* =========================================================
   /create/ — the Wish Creator page (build time).
   All options (occasions, templates, fields, themes, languages) are
   rendered from data/templates.js + data/categories.js. js/creator.js only
   drives state and validation; it adds no content of its own.
   ========================================================= */
import { esc } from "./html.mjs";
import { head, header, footer, breadcrumb, breadcrumbLd, siteLd, adSlot } from "./components.mjs";
import { doc } from "./pages.mjs";

const LANG_NAMES = { bn: "বাংলা", en: "English" };
const HEX = /^#[0-9A-Fa-f]{6}$/;

export function creatorPage(m) {
  const { i18n: { t, bi, aria, tx }, config, langs, creatorTemplates, creatorCatIds, catById, data } = m;
  const site = config.siteUrl;
  const path = "/create/";

  const title = `${langs.map((l) => tx("crMetaTitle", l)).join(" | ")} — Wishora`;
  const description = [...langs].reverse().map((l) => tx("crMetaDesc", l)).join(" · ");
  const crumbs = [
    { label: { bn: tx("crumbHome", "bn"), en: tx("crumbHome", "en") }, href: "/", path: "/" },
    { label: { bn: tx("crMetaTitle", "bn"), en: tx("crMetaTitle", "en") }, path }
  ];

  const occasions = [...creatorCatIds].map((id) => catById[id]);
  const soonOccasions = data.categories.filter(
    (c) => !creatorCatIds.has(c.id) && (m.liveCatIds.has(c.id) || m.soonCategories.includes(c))
  );
  const stepNames = ["crStep1", "crStep2", "crStep3", "crStep4", "crStep5"];

  /* ----- Step 1: occasion ----- */
  const occCards = occasions
    .map((c) => {
      const n = creatorTemplates.filter((x) => x.category === c.id).length;
      const count = n === 1 ? t("crTplCountOne") : t("crTplCountMany", { n });
      return `<li><label class="choice-card">
          <input class="choice-input" type="radio" name="occasion" value="${esc(c.id)}">
          <span class="choice-body">
            <span class="choice-icon" aria-hidden="true">${esc(c.icon)}</span>
            <span class="choice-name">${bi(c.label)}</span>
            <span class="choice-desc">${bi(c.description)}</span>
            <span class="choice-meta">${count}</span>
          </span>
        </label></li>`;
    })
    .join("\n");

  /* ----- Step 2: templates ----- */
  const tplCards = creatorTemplates
    .map((tpl) => {
      const cat = catById[tpl.category];
      const dt = tpl.themes.find((th) => th.id === tpl.defaultTheme) || tpl.themes[0];
      const sw = dt.swatch.filter((c) => HEX.test(c));
      return `<li data-template-item="${esc(tpl.id)}" data-category="${esc(tpl.category)}">
        <label class="choice-card">
          <input class="choice-input" type="radio" name="template" value="${esc(tpl.id)}">
          <span class="choice-body">
            <span class="choice-thumb" aria-hidden="true" style="background:linear-gradient(135deg,${sw[0]},${sw[1]})"><span>${esc(cat.icon)}</span></span>
            <span class="choice-name">${bi(tpl.title)}</span>
            <span class="choice-desc">${bi(tpl.description)}</span>
            <span class="choice-meta"><span class="meta-label">${t("languagesLabel")}:</span> ${tpl.languages.map((l) => `<span lang="${l}">${esc(LANG_NAMES[l] || l)}</span>`).join(" · ")}</span>
            <span class="choice-meta"><span class="meta-label">${t("crTplStyle")}:</span> ${bi(tpl.creator.style)}</span>
          </span>
        </label>
        <p class="choice-extra"><a class="text-link" href="${esc(tpl.previewRoute)}" target="_blank" rel="noopener">${t("crTplSeeOriginal")}</a></p>
      </li>`;
    })
    .join("\n");

  /* ----- Step 3: one fieldset per template, generated from its fields ----- */
  const id = (tpl, f, suffix = "") => `f-${tpl.id}-${f}${suffix}`;
  const optBadge = (f) => `<span class="req-badge ${f.required ? "is-required" : ""}">${t(f.required ? "crRequired" : "crOptional")}</span>`;

  function lineField(tpl, f) {
    const fid = id(tpl, f.id);
    return `<div class="field" data-field="${f.id}" data-type="line" data-required="${!!f.required}" data-max="${f.max}">
          <label for="${fid}">${bi(f.label)} ${optBadge(f)}</label>
          <p class="field-hint" id="${fid}-hint">${bi(f.hint)} <span class="counter" data-counter></span></p>
          <input class="input" id="${fid}" name="${f.id}" type="text" autocomplete="off" autocapitalize="words" spellcheck="false" maxlength="${f.max * 3}"${f.required ? ' aria-required="true"' : ""} aria-describedby="${fid}-hint ${fid}-error" ${langs.map((l) => `data-ph-${l}="${esc(f.example[l])}"`).join(" ")} placeholder="${esc(f.example[langs[0]])}">
          <p class="field-error" id="${fid}-error" hidden></p>
        </div>`;
  }

  function messageField(tpl, f) {
    const fid = id(tpl, f.id);
    const dflt = tpl.defaults[f.id];
    return `<fieldset class="field fieldset" data-field="${f.id}" data-type="text" data-has-default="true" data-max="${f.max}">
          <legend>${t("crMsgLegend")} <span class="req-badge">${t("crOptional")}</span></legend>
          <div class="radio-row">
            <label class="radio"><input type="radio" name="${tpl.id}-msgmode" value="default" checked><span>${t("crMsgDefault")}</span></label>
            <label class="radio"><input type="radio" name="${tpl.id}-msgmode" value="custom"><span>${t("crMsgCustom")}</span></label>
          </div>
          <div class="msg-default" data-msg-default>
            <p class="field-hint">${t("crMsgWillRead")}</p>
            ${langs.map((l) => `<blockquote class="msg-quote" data-wl="${l}" lang="${l}">${esc(dflt[l])}</blockquote>`).join("\n            ")}
          </div>
          <div class="msg-custom" data-msg-custom hidden>
            <label for="${fid}">${bi(f.label)}</label>
            <p class="field-hint" id="${fid}-hint">${bi(f.hint)} <span class="counter" data-counter></span></p>
            <textarea class="input textarea" id="${fid}" name="${f.id}" rows="5" maxlength="${f.max * 3}" aria-describedby="${fid}-hint ${fid}-error"${langs.map((l) => ` data-ph-${l}="${esc(f.example[l])}"`).join("")} placeholder="${esc(f.example[langs[0]])}"></textarea>
            <p class="field-error" id="${fid}-error" hidden></p>
          </div>
        </fieldset>`;
  }

  function langField(tpl) {
    return `<fieldset class="field fieldset" data-field="lang" data-type="enum">
          <legend>${t("crLangLabel")} <span class="req-badge">${t("crOptional")}</span></legend>
          <p class="field-hint" id="${id(tpl, "lang", "-hint")}">${t("crLangHint")}</p>
          <div class="radio-row" aria-describedby="${id(tpl, "lang", "-hint")}">
            ${tpl.languages.map((l) => `<label class="radio"><input type="radio" name="${tpl.id}-lang" value="${l}"><span lang="${l}">${esc(LANG_NAMES[l] || l)}</span></label>`).join("\n            ")}
          </div>
        </fieldset>`;
  }

  function themeField(tpl) {
    return `<fieldset class="field fieldset" data-field="theme" data-type="enum">
          <legend>${t("crThemeLegend")} <span class="req-badge">${t("crOptional")}</span></legend>
          <p class="field-hint">${t("crThemeHint")}</p>
          <ul class="choice-grid choice-grid-sm">
            ${tpl.themes
              .map((th) => {
                const sw = th.swatch.filter((c) => HEX.test(c));
                return `<li><label class="choice-card">
              <input class="choice-input" type="radio" name="${tpl.id}-theme" value="${esc(th.id)}"${th.id === tpl.defaultTheme ? " checked" : ""}>
              <span class="choice-body">
                <span class="swatch" aria-hidden="true" style="background:linear-gradient(135deg,${sw[0]},${sw[1]})"></span>
                <span class="choice-name">${bi(th.name)}</span>
                <span class="choice-desc">${bi(th.description)}</span>
              </span></label></li>`;
              })
              .join("\n            ")}
          </ul>
        </fieldset>`;
  }

  /* Template-specific enum (options: "choices"), e.g. the anniversary kind. */
  function choiceField(tpl, f) {
    const dflt = f.default || f.choices[0].id;
    return `<fieldset class="field fieldset" data-field="${esc(f.id)}" data-type="enum" data-choice="true">
          <legend>${bi(f.label)} <span class="req-badge">${t("crOptional")}</span></legend>
          <p class="field-hint" id="${id(tpl, f.id, "-hint")}">${bi(f.hint)}</p>
          <ul class="choice-grid choice-grid-sm" aria-describedby="${id(tpl, f.id, "-hint")}">
            ${f.choices
              .map(
                (c) => `<li><label class="choice-card">
              <input class="choice-input" type="radio" name="${tpl.id}-${f.id}" value="${esc(c.id)}"${c.id === dflt ? " checked" : ""}>
              <span class="choice-body">
                <span class="choice-name">${bi(c.name)}</span>
                <span class="choice-desc">${bi(c.description)}</span>
              </span></label></li>`
              )
              .join("\n            ")}
          </ul>
        </fieldset>`;
  }

  function choicesField(tpl, f) {
    return `<fieldset class="field fieldset" data-field="${esc(f.id)}" data-type="enum">
          <legend>${bi(f.label)} ${optBadge(f)}</legend>
          <p class="field-hint">${bi(f.hint)}</p>
          <ul class="choice-grid choice-grid-sm">
            ${f.choices
              .map(
                (c) => `<li><label class="choice-card">
              <input class="choice-input" type="radio" name="${tpl.id}-${esc(f.id)}" value="${esc(c.id)}"${c.id === (f.default || f.choices[0].id) ? " checked" : ""}>
              <span class="choice-body">
                <span class="choice-name">${bi(c.name)}</span>
                <span class="choice-desc">${bi(c.description)}</span>
              </span></label></li>`
              )
              .join("\n            ")}
          </ul>
        </fieldset>`;
  }

  const forms = creatorTemplates
    .map((tpl) => {
      const parts = tpl.fields.map((f) => {
        if (f.type === "line") return lineField(tpl, f);
        if (f.type === "text") return tpl.defaults && tpl.defaults[f.id] ? messageField(tpl, f) : "";
        if (f.type === "enum" && f.options === "themes") return themeField(tpl);
        if (f.type === "enum" && f.options === "languages") return langField(tpl);
        if (f.type === "enum" && f.options === "choices") return choicesField(tpl, f);
        if (f.type === "enum" && f.options === "choices") return choiceField(tpl, f);
        throw new Error(`Unsupported field type in template ${tpl.id}: ${f.id}`);
      });
      return `<div class="template-fields" data-template-fields="${esc(tpl.id)}" hidden>
        ${parts.join("\n        ")}
      </div>`;
    })
    .join("\n      ");

  /* Runtime messages: only the crx* keys, straight from data/ui.js. */
  const runtime = Object.fromEntries(Object.entries(data.ui).filter(([k]) => k.startsWith("crx")));
  const runtimeJson = JSON.stringify({ ui: runtime, steps: stepNames.map((k) => data.ui[k]) }).replace(/</g, "\\u003c");

  const nav = (back, next, nextKey, nextAttrs = "") =>
    `<div class="step-actions">${back ? `<button type="button" class="btn btn-ghost" data-action="back">${t("crBack")}</button>` : "<span></span>"}${next ? `<button type="button" class="btn btn-primary" data-action="${next}"${nextAttrs}>${t(nextKey)}</button>` : ""}</div>`;

  const body = `<main id="main-content">
  <section class="page-hero page-hero-compact">
    <div class="hero-glow hero-glow-a" aria-hidden="true"></div>
    <div class="container">
      ${breadcrumb(m, crumbs)}
      <h1 class="page-title">${t("crTitle")}</h1>
      <p class="page-lead">${t("crLead")}</p>
    </div>
  </section>

  <section class="creator-section" aria-label="${esc(tx("crTitle", langs[0]))}" ${aria("crTitle")}>
    <div class="container">
      <noscript>
        <div class="nojs-box">
          <h2>${t("crNoJsTitle")}</h2>
          <p>${t("crNoJsText")}</p>
          <p><a class="btn btn-primary" href="${esc(creatorTemplates[0] ? creatorTemplates[0].route : "/")}">${t("crOpen")}</a> <a class="text-link" href="/">${t("navHome")}</a></p>
        </div>
      </noscript>

      <div class="creator js-only" id="creatorApp" data-creator>
        <ol class="steps" id="steps" ${aria("crStepsLabel")}>
${stepNames.map((k, i) => `          <li class="step" data-step-item="${i + 1}"><span class="step-num" aria-hidden="true">${i + 1}</span><span class="step-name">${t(k)}</span></li>`).join("\n")}
        </ol>
        <p class="step-caption" id="stepCaption" aria-hidden="true"></p>
        <p class="sr-only" id="stepLive" role="status" aria-live="polite"></p>
        <p class="notice" id="creatorNotice" role="status" hidden></p>

        <!-- ===== STEP 1: occasion ===== -->
        <section class="step-panel" id="step-1" data-step="1" aria-labelledby="step-1-title">
          <h2 id="step-1-title" tabindex="-1">${t("crOccTitle")}</h2>
          <p class="panel-hint">${t("crOccHint")}</p>
          <fieldset class="fieldset">
            <legend class="sr-only">${t("crOccTitle")}</legend>
            <ul class="choice-grid">
${occCards}
            </ul>
          </fieldset>
${soonOccasions.length ? `          <div class="soon-block">
            <p class="soon-block-title">${t("soon")}</p>
            <p class="panel-hint">${t("crOccSoonText")}</p>
            <ul class="soon-chips">${soonOccasions.map((c) => `<li><span aria-hidden="true">${esc(c.icon)}</span> ${bi(c.label)}</li>`).join("")}</ul>
          </div>` : ""}
          ${nav(false, "next", "crNext", " disabled")}
        </section>

        <!-- ===== STEP 2: template ===== -->
        <section class="step-panel" id="step-2" data-step="2" aria-labelledby="step-2-title" hidden>
          <h2 id="step-2-title" tabindex="-1">${t("crTplTitle")}</h2>
          <fieldset class="fieldset">
            <legend class="sr-only">${t("crTplTitle")}</legend>
            <ul class="choice-grid">
${tplCards}
            </ul>
          </fieldset>
          ${nav(true, "next", "crUseTemplate", " disabled")}
        </section>

        <!-- ===== STEP 3: details ===== -->
        <section class="step-panel" id="step-3" data-step="3" aria-labelledby="step-3-title" hidden>
          <h2 id="step-3-title" tabindex="-1">${t("crDetailsTitle")}</h2>
          <p class="notice notice-error" id="formSummary" role="alert" hidden></p>
          <form id="detailsForm" novalidate>
      ${forms}
          </form>
          ${nav(true, "next", "crToPreview")}
        </section>

        <!-- ===== STEP 4: preview ===== -->
        <section class="step-panel" id="step-4" data-step="4" aria-labelledby="step-4-title" hidden>
          <h2 id="step-4-title" tabindex="-1">${t("crPreviewTitle")}</h2>
          <p class="panel-hint">${t("crPreviewHint")}</p>
          <dl class="summary" id="summary" aria-label="${esc(tx("crSummaryTitle", langs[0]))}" ${aria("crSummaryTitle")}></dl>
          <iframe class="preview-frame" id="previewFrame" ${aria("crPreviewFrame", "title", "data-title")} referrerpolicy="no-referrer"></iframe>
          <div class="step-actions step-actions-3">
            <button type="button" class="btn btn-ghost" data-action="back">${t("crBack")}</button>
            <button type="button" class="btn btn-ghost" data-action="edit">${t("crEdit")}</button>
            <button type="button" class="btn btn-primary" data-action="next">${t("crToShare")}</button>
          </div>
        </section>

        <!-- ===== STEP 5: share ===== -->
        <section class="step-panel" id="step-5" data-step="5" aria-labelledby="step-5-title" hidden>
          <h2 id="step-5-title" tabindex="-1">${t("crShareTitle")}</h2>
          <div class="share-box">
            <label for="shareUrl" class="field-label">${t("crLinkLabel")}</label>
            <input class="input share-input" id="shareUrl" type="text" readonly spellcheck="false" autocomplete="off">
          </div>
          <div class="share-actions">
            <button type="button" class="btn btn-primary" id="copyBtn">${t("crCopy")}</button>
            <button type="button" class="btn btn-ghost" id="shareBtn" hidden>${t("crShare")}</button>
            <a class="btn btn-ghost" id="openBtn" href="${esc(creatorTemplates[0] ? creatorTemplates[0].route : "/")}" target="_blank" rel="noopener">${t("crOpen")}</a>
          </div>
          <p class="share-status" id="shareStatus" role="status" aria-live="polite"></p>
          <p class="privacy-note">${t("crPrivacy")}</p>
          <div class="step-actions">
            <button type="button" class="btn btn-ghost" data-action="back">${t("crBack")}</button>
            <button type="button" class="btn btn-ghost" id="againBtn">${t("crAgain")}</button>
          </div>
        </section>
      </div>
    </div>
  </section>
  ${adSlot("AD_SLOT_BOTTOM")}
  <script type="application/json" id="creatorRuntime">${runtimeJson}</script>
</main>`;

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      siteLd(m),
      {
        "@type": "WebPage", "@id": `${site}${path}#webpage`, url: `${site}${path}`,
        name: tx("crMetaTitle", "en"), description: tx("crMetaDesc", "en"),
        isPartOf: { "@id": `${site}/#website` }, inLanguage: langs,
        breadcrumb: { "@id": `${site}${path}#breadcrumb` }
      },
      { ...breadcrumbLd(m, crumbs), "@id": `${site}${path}#breadcrumb` }
    ]
  };

  return {
    file: "create/index.html",
    path,
    html: doc(m, { path, title, description, jsonld, current: "create",
      extraScripts: ["/data/templates.js", "/js/wish-params.js", "/js/creator.js"] }, body, "page-creator")
  };
}
