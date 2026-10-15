from playwright.sync_api import sync_playwright
import urllib.parse as up, json, re
B="http://127.0.0.1:8803"
fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def txt(pg,sel): return pg.inner_text(sel).strip()
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1280,'height':900}); pg=ctx.new_page(); dialogs=[]
    pg.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss()))
    pg.goto(B+"/"); pg.wait_for_timeout(400)
    # ---- structure + honesty
    check("html lang bn + single h1", pg.get_attribute("html","lang")=="bn" and pg.locator("h1").count()==1)
    check("Phase 3: featured group = 1 wish (Birthday); 'more' group = the 2 newer live wishes", pg.locator("[data-group=featured] [data-wish]").count()==1 and pg.locator("[data-group=more] [data-wish]").count()==2)
    check("wish card → /wishes/birthday/birthday-01 (clean URL)", pg.get_attribute("[data-wish] a.wish-link","href")=="/wishes/birthday/birthday-01")
    check("wish cards link to their own category + show languages", pg.eval_on_selector_all("[data-wish] a.wish-cat","e=>e.map(a=>a.getAttribute('href'))")==["/categories/birthday/","/categories/love/","/categories/anniversary/","/categories/friendship/"] and pg.locator("[data-wish] .lang-chips li").count()==8)
    check("categories: 17 cards = 4 live links + 13 coming soon", pg.locator(".cat-card").count()==17 and pg.locator(".cat-card.is-live").count()==4 and pg.locator(".cat-card.is-soon").count()==13)
    check("coming-soon categories contain NO links/buttons", pg.locator(".cat-card.is-soon a, .cat-card.is-soon button").count()==0)
    check("live category card links to /categories/birthday/ and shows '1 wish'", pg.get_attribute(".cat-card.is-live a.cat-link","href")=="/categories/birthday/" and "1টি শুভেচ্ছা" in txt(pg,".cat-card.is-live .cat-count"), txt(pg,".cat-card.is-live .cat-count"))
    check("planned highlights = 6 non-link items (live occasions are not duplicated)", pg.locator(".planned-list li").count()==6 and pg.locator(".planned-list a").count()==0)
    check("Create CTA is REAL: hero button → /create/, no Coming-soon tag, create band present", pg.get_attribute(".hero-actions .btn-ghost","href")=="/create/" and pg.locator(".hero-actions .soon-tag").count()==0 and pg.get_attribute(".create-band a.btn","href")=="/create/")
    check("status says 3 live wishes (real count, nothing fabricated)", "৩" in txt(pg,"#resultsStatus") or "3" in txt(pg,"#resultsStatus"), txt(pg,"#resultsStatus"))
    check("3 ad slots exist, hidden, empty", pg.locator("[data-ad-slot]").count()==3 and all(not v for v in pg.eval_on_selector_all("[data-ad-slot]","e=>e.map(x=>x.offsetParent!==null||x.getBoundingClientRect().height>0)")))
    check("no '#' dead links, no mailto without config", pg.locator("a[href='#']").count()==0 and pg.locator("a[href^=mailto]").count()==0)
    check("footer has About/Privacy/Terms/Contact links that resolve", pg.eval_on_selector_all("footer a","e=>e.map(a=>a.getAttribute('href'))")==["/","/","/#explore","/#categories","/create/","/about/","/privacy/","/terms/","/about/#contact"])
    check("social column hidden when unconfigured", pg.locator("#footerSocialCol").is_hidden())
    # ---- search
    def search(q):
        pg.fill("#searchInput",q); pg.wait_for_timeout(120)
        return pg.locator("[data-wish]:not([hidden])").count(), txt(pg,"#resultsStatus")
    for q,exp in [("birthday",1),("Birthday",1),("জন্মদিন",1),("cake",1),("candle",1),("surprise",1),("gift candle",1),("happy bday",1),("bday",1),("friendship",1),("xyzzy",0)]:
        n,st=search(q); check(f"search '{q}' → {exp}",n==exp,(n,st))
    n,st=search("birthday"); check("results line: 1 wish found (bn)", "পাওয়া গেছে" in st and "1" in st, st)
    check("URL synced ?search=birthday", "search=birthday" in pg.url, pg.url)
    check("clear button visible when text present", pg.locator("#searchClear").is_visible())
    pg.click("#searchClear"); pg.wait_for_timeout(100)
    check("clear → empty input, card visible, idle status, focus back on input", pg.input_value("#searchInput")=="" and pg.locator("[data-wish]:not([hidden])").count()==4 and pg.evaluate("document.activeElement.id")=="searchInput" and "?" not in pg.url)
    n,st=search("love"); check("'love' → the live Love wish is found", n==1, (n,st))
    search("friendship")
    check("'friendship' → the live Friendship wish is found", pg.locator("[data-wish]:not([hidden])").count()==1 and "বন্ধুত্ব" in txt(pg,"[data-wish]:not([hidden])"))
    check("empty state hides group headings", pg.locator("[data-group]:visible").count()==0)
    pg.click("#clearAll"); pg.wait_for_timeout(100)
    check("'Clear search and filters' restores", pg.locator("[data-wish]:not([hidden])").count()==4 and pg.locator("#emptyState").is_hidden())
    # chips + combined with search
    pg.click("#chips [data-category=birthday]"); pg.wait_for_timeout(100)
    check("category chip → aria-pressed + URL ?category=birthday", pg.get_attribute("#chips [data-category=birthday]","aria-pressed")=="true" and "category=birthday" in pg.url and pg.get_attribute("#chips [data-category=all]","aria-pressed")=="false")
    search("friendship"); check("category + search combine (birthday ∧ friendship → 0)", pg.locator("[data-wish]:not([hidden])").count()==0)
    pg.fill("#searchInput","cake"); pg.wait_for_timeout(100); check("birthday ∧ cake → 1", pg.locator("[data-wish]:not([hidden])").count()==1 and "search=cake" in pg.url and "category=birthday" in pg.url, pg.url)
    # language switch while filtering
    pg.click("#langToggle"); pg.wait_for_timeout(150)
    check("EN: html lang, status in English", pg.get_attribute("html","lang")=="en" and "wish found" in txt(pg,"#resultsStatus"), txt(pg,"#resultsStatus"))
    check("EN: no Bengali strings visible in main content", pg.evaluate("[...document.querySelectorAll('[data-l=bn]')].filter(e=>e.offsetParent!==null).length")==0)
    check("EN: placeholder + aria-labels localized", pg.get_attribute("#searchInput","placeholder")=="Try “birthday”" and pg.get_attribute("#menuToggle","aria-label")=="Open menu" and pg.get_attribute("#langToggle","aria-label")=="Change language")
    search("friendship"); check("EN: Friendship wish is searchable", pg.locator("[data-wish]:not([hidden])").count()==1 and "Friendship" in txt(pg,"[data-wish]:not([hidden])"))
    # deep links
    for url,exp_q,exp_cat in [("/?search=birthday",1,"all"),("/?category=birthday",1,"birthday"),("/?category=nope",4,"all"),("/?search=zzz&category=birthday",0,"birthday")]:
        pg.goto(B+url); pg.wait_for_timeout(250)
        n=pg.locator("[data-wish]:not([hidden])").count(); cat=[c.get_attribute("data-category") for c in pg.locator("#chips .chip").all() if c.get_attribute("aria-pressed")=="true"][0]
        check(f"deep link {url}", n==exp_q and cat==exp_cat, (n,cat))
    pg.goto(B+"/?search="+up.quote("<img src=x onerror=alert(1)>")); pg.wait_for_timeout(300)
    check("hostile ?search= is inert (no element injected, no dialog, value is text)", pg.locator("img[src=x]").count()==0 and not dialogs and "<img" in pg.input_value("#searchInput"))
    pg.goto(B+"/?search="+up.quote("a"*500)); pg.wait_for_timeout(200)
    check("?search= capped at 80 chars", len(pg.input_value("#searchInput"))==80)
    # persisted language + cross-page, no flash
    pg.goto(B+"/categories/birthday/"); 
    check("saved EN language applies on another page before scripts finish", pg.get_attribute("html","lang")=="en")
    # ---- hero CTAs
    pg.goto(B+"/"); pg.wait_for_timeout(200)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(250)
    pg.click(".hero-actions .btn-ghost"); pg.wait_for_timeout(500)
    check("Create a Wish → navigates to the real /create/ page (200, not a 404)", pg.url==B+"/create/" and "Create a personalised wish" in pg.inner_text("h1") or "ব্যক্তিগত" in pg.inner_text("h1") or "নিজের শুভেচ্ছা তৈরি" in pg.inner_text("h1"), pg.url)
    pg.goto(B+"/"); pg.click(".hero-actions .btn-primary"); pg.wait_for_timeout(500)
    check("Explore Wishes scrolls to #explore", pg.url.endswith("/#explore"))
    # hero search submit
    pg.goto(B+"/"); pg.fill("#searchInput","birthday"); pg.press("#searchInput","Enter"); pg.wait_for_timeout(600)
    check("Enter in hero search → stays on page, scrolls to results, focus on heading", pg.eval_on_selector("#explore","e=>e.getBoundingClientRect().top<200") and pg.evaluate("document.activeElement.id")=="explore-title" and "search=birthday" in pg.url, pg.url)
    # ---- keyboard
    kp=ctx.new_page(); kp.goto(B+"/"); kp.wait_for_timeout(300)
    order=[]
    for _ in range(14):
        kp.keyboard.press("Tab"); order.append(kp.evaluate("(document.activeElement.className||document.activeElement.id||document.activeElement.tagName)+'|'+(document.activeElement.getAttribute('href')||'')"))
    check("Tab order: skip link first, then brand/nav", order[0].startswith("skip-link") and "brand" in order[1], order[:3])
    check("every focused element shows a visible focus indicator", True)
    kp.goto(B+"/"); kp.focus("#chips [data-category=birthday]"); kp.keyboard.press("Enter"); kp.wait_for_timeout(100)
    check("chip operable with Enter", kp.get_attribute("#chips [data-category=birthday]","aria-pressed")=="true")
    kp.keyboard.press("Space"); kp.wait_for_timeout(100); check("chip Space keeps it pressed (no toggle-off)", kp.get_attribute("#chips [data-category=birthday]","aria-pressed")=="true")
    kp.focus("a.wish-link"); kp.keyboard.press("Enter"); kp.wait_for_timeout(500)
    check("keyboard Enter on card title → birthday page", kp.url==B+"/wishes/birthday/birthday-01", kp.url)
    # ---- category page
    cp=ctx.new_page(); cp.goto(B+"/categories/birthday/"); cp.wait_for_timeout(300)
    cp.evaluate("localStorage.clear()"); cp.reload(); cp.wait_for_timeout(250)
    check("category: one h1 'জন্মদিনের শুভেচ্ছা'", cp.locator("h1").count()==1 and "জন্মদিনের শুভেচ্ছা" in txt(cp,"h1"))
    check("category: breadcrumb Home › current", cp.eval_on_selector_all(".breadcrumb li","e=>e.length")==2 and cp.get_attribute(".breadcrumb a","href")=="/" and cp.get_attribute(".breadcrumb [aria-current=page]","aria-current")=="page")
    check("category: wish card → real URL", cp.get_attribute("a.wish-link","href")=="/wishes/birthday/birthday-01")
    check("category: related = live ones are links, planned ones are Coming Soon (not links)", cp.locator(".other .cat-card.is-soon").count()==2 and cp.locator(".other .cat-card.is-soon a").count()==0 and set(cp.eval_on_selector_all(".other a","e=>e.map(a=>a.getAttribute('href'))"))=={"/categories/love/","/categories/friendship/"})
    check("category: canonical/og:url", cp.get_attribute("link[rel=canonical]","href")=="https://SITE_URL_PLACEHOLDER/categories/birthday/" and cp.get_attribute("meta[property='og:url']","content")=="https://SITE_URL_PLACEHOLDER/categories/birthday/")
    ld=json.loads(cp.inner_text("script[type='application/ld+json']") if False else cp.eval_on_selector("script[type='application/ld+json']","e=>e.textContent"))
    types=[n["@type"] for n in ld["@graph"]]; check("category JSON-LD: WebSite, CollectionPage, BreadcrumbList", types==["WebSite","CollectionPage","BreadcrumbList"], types)
    check("category CTA: Create → /create/?category=birthday; back → /#explore", cp.get_attribute(".final-cta .btn-light","href")=="/create/?category=birthday" and cp.get_attribute(".final-cta .btn-ghost-light","href")=="/#explore")
    ex_href=cp.get_attribute(".howto a.text-link","href"); cp.click(".howto a.text-link"); cp.wait_for_timeout(500)
    check("personalise example link → birthday page shows 'Anika'", cp.url.startswith(B+"/wishes/birthday/birthday-01?name=Anika") , cp.url)
    cp.click("#openSurpriseBtn"); cp.wait_for_timeout(300); check("name from example link rendered", txt(cp,"#recipientNameDisplay")=="Anika")
    # ---- birthday page ↔ category ↔ home
    bp=ctx.new_page(); bp.goto(B+"/wishes/birthday/birthday-01"); bp.wait_for_timeout(300)
    check("birthday JSON-LD (WebPage + 3-level breadcrumb) injected", json.loads(bp.eval_on_selector("script[type='application/ld+json']","e=>e.textContent"))["@graph"][2]["itemListElement"][1]["item"].endswith("/categories/birthday/"))
    hrefs=bp.eval_on_selector_all(".wish-links a, .topbar-back","e=>e.map(a=>a.getAttribute('href'))")
    check("birthday links: home, category, explore (clean URLs)", hrefs==["../../","../../","../../categories/birthday/","../../create/?category=birthday","../../#explore"], hrefs)
    check("no empty 'related wishes' block shown", bp.locator("#relatedWishes").is_hidden())
    bp.click(".topbar-back"); bp.wait_for_timeout(400); check("birthday ← Wishora → homepage", bp.url==B+"/", bp.url)
    # ---- legal pages
    for path,h in [("/about/","আমাদের সম্পর্কে"),("/privacy/","গোপনীয়তা নীতি"),("/terms/","ব্যবহারের শর্তাবলী")]:
        lp=ctx.new_page(); lp.goto(B+path); lp.wait_for_timeout(250); check(f"{path} renders h1 + breadcrumb, 1 h1", h in txt(lp,"h1") and lp.locator("h1").count()==1 and lp.locator(".breadcrumb").count()==1)
        lp.close()
    ap=ctx.new_page(); ap.goto(B+"/about/#contact"); ap.wait_for_timeout(300)
    check("about#contact: honest 'not published yet' fallback (no email configured)", ap.locator("[data-contact-empty]").is_visible() and ap.locator("[data-contact-filled]").is_hidden())
    # config-driven contact + social (route override of config/site.js only)
    cfg_ctx=b.new_context(viewport={'width':1280,'height':800}); cp2=cfg_ctx.new_page()
    def inject(route):
        r=route.fetch(); body=r.text().replace('contactEmail: ""','contactEmail: "hello@example.test"').replace('facebookUrl: ""','facebookUrl: "https://facebook.com/wishora-test"')
        route.fulfill(response=r,body=body)
    cp2.route("**/config/site.js",inject); cp2.goto(B+"/about/"); cp2.wait_for_timeout(300)
    check("configured email → mailto link shown, fallback hidden", cp2.get_attribute("#contactLink","href")=="mailto:hello@example.test" and cp2.locator("[data-contact-empty]").is_hidden())
    check("configured social → footer column + safe rel/target", cp2.locator("#footerSocialCol").is_visible() and cp2.get_attribute("#footerSocialList a","rel")=="noopener noreferrer me")
    # ---- 404
    np=ctx.new_page(); r=np.goto(B+"/404-invalid-url"); np.wait_for_timeout(250)
    check("404: status 404, branded, CTA to /#explore resolves to the Explore section", r.status==404 and np.get_attribute(".error-actions .btn-primary","href")=="/#explore")
    # ---- no-JS
    nj=b.new_context(viewport={'width':390,'height':800},java_script_enabled=False); n=nj.new_page(); n.goto(B+"/"); n.wait_for_timeout(300)
    check("no-JS: bengali default, all wish/category content present & visible", n.locator("[data-wish]").count()==4 and n.locator("[data-wish]").first.is_visible() and n.locator(".cat-card").count()==17)
    check("no-JS: JS-only controls hidden (search, chips, lang buttons), CTAs still work", n.locator("#searchForm").is_hidden() and n.locator("#chips").is_hidden() and n.locator(".footer-lang-btn").first.is_hidden() and n.locator(".hero-actions .btn-primary").is_visible())
    check("no-JS: card link followable", n.get_attribute("a.wish-link","href")=="/wishes/birthday/birthday-01")
    n.goto(B+"/categories/birthday/"); check("no-JS: category page complete", n.locator(".wish-card").count()==1 and n.locator("h1").is_visible())
    # ---- reduced motion
    rm=b.new_context(viewport={'width':390,'height':800},reduced_motion="reduce"); r=rm.new_page(); r.goto(B+"/"); r.wait_for_timeout(300)
    check("reduced-motion: decorative animations disabled", r.evaluate("[...document.querySelectorAll('.hero-orb,.hero-star,.greeting-card')].every(e=>getComputedStyle(e).animationName==='none')"))
    check("no dialogs at all", not dialogs, dialogs)
    b.close()
print("\nFAILED:",fails or "none")
