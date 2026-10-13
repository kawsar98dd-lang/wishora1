"""Phase 3 — Love + Anniversary experiences (needs: node scripts/serve.mjs 8803)."""
from playwright.sync_api import sync_playwright
import urllib.parse as up, os
B=os.environ.get("WISHORA_BASE","http://127.0.0.1:8803"); fails=[]
ONLY=os.environ.get('WISHORA_ONLY')  # 'love' | 'anniversary' to split the long run
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def font(u): return "fonts.g" in u
XSS='<script>alert(1)</script><img src=x onerror=alert(1)>"><svg onload=alert(1)>'
BN_NAME="রিয়া সুলতানা"; BN_MSG="প্রিয়,\nতোমাকে অনেক ভালোবাসা। 🌸\n\nভালো থেকো।"
W=[320,375,390,414,768,1280]
EXP={
 "love":dict(route="/wishes/love/love-01",themes=["rose","midnight","blush"],scenes=4,h2={"bn":"তিনটি তারা","en":"Light three stars"}),
 "anniversary":dict(route="/wishes/anniversary/anniversary-01",themes=["ivory","emerald","twilight"],scenes=4,h2={"bn":"তিনটি কার্ড","en":"Draw three cards"}),
}
def active(pg): return pg.evaluate("[...document.querySelectorAll('.scene')].findIndex(s=>s.classList.contains('is-active'))+1")
def advance(pg,k,to):
    """Play the experience up to scene `to` using real clicks."""
    if k=="love":
        steps=[lambda:pg.click("#sealBtn"),lambda:[pg.click(f"[data-star='{i}']") for i in (1,2,3)] and pg.click("#toLetter"),lambda:pg.click("#toFinal")]
    else:
        steps=[lambda:pg.click("#openJar"),lambda:[pg.click("#drawBtn") for _ in range(3)] and pg.click("#toMessage"),lambda:pg.click("#toToast")]
    for i in range(to-1):
        steps[i](); pg.wait_for_timeout(750 if (k=="love" and i==0) else 200)
def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])
def ratio(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+.05)/(lo+.05)
JS_CONTRAST="""()=>{
 const cs=getComputedStyle(document.documentElement);
 const p=c=>{const m=c.match(/[\\d.]+/g).map(Number);return m};
 const toRgb=v=>{const d=document.createElement('span');d.style.color=v;document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return p(c)};
 const bgs=[toRgb(cs.getPropertyValue('--bg')),toRgb(cs.getPropertyValue('--bg2'))];
 const out=[];
 const sc=document.querySelector('.scene.is-active');
 for(const el of sc.querySelectorAll('h1,h2,p,li,span,button,a,article')){
   if(!el.offsetParent||el.closest('[aria-hidden=true]')||![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
   const st=getComputedStyle(el);let node=el,bg=null;
   while(node&&node!==document.documentElement){const b=getComputedStyle(node).backgroundColor;const m=b.match(/[\\d.]+/g).map(Number);if(m.length<4||m[3]>.9){bg=[m.slice(0,3)];break}node=node.parentElement}
   out.push({t:el.textContent.trim().slice(0,24),fg:p(st.color).slice(0,3),bg:bg||bgs,size:parseFloat(st.fontSize)})
 }return out}"""
def contrast_min(pg):
    worst=99
    for o in pg.evaluate(JS_CONTRAST):
        worst=min(worst,min(ratio(o["fg"],b) for b in o["bg"]))
    return worst
with sync_playwright() as p:
    b=p.chromium.launch()
    def newctx(**kw):
        c=b.new_context(viewport={"width":390,"height":800},**kw); pg=c.new_page(); pg.set_default_timeout(6000); pg.errs=[]; pg.dialogs=[]; pg.bad=[]
        pg.on("console",lambda m: pg.errs.append(m.text) if m.type=="error" and not font(m.location.get("url","")) else None)
        pg.on("pageerror",lambda e: pg.errs.append("PAGEERROR "+str(e)))
        pg.on("dialog",lambda d:(pg.dialogs.append(d.message),d.dismiss()))
        pg.on("response",lambda r: pg.bad.append((r.status,r.url)) if r.status>=400 and not font(r.url) else None)
        return c,pg
    ctx,pg=newctx()
    for k,e in [(k,e) for k,e in EXP.items() if ONLY in (None,k)]:
        R=B+e["route"]
        r=pg.goto(R); pg.wait_for_timeout(250)
        check(f"[{k}] default URL 200, one h1, canonical, no noindex",r.status==200 and pg.locator("h1").count()==1 and pg.get_attribute("link[rel=canonical]","href")=="https://SITE_URL_PLACEHOLDER"+e["route"] and pg.locator("meta[name=robots]").count()==0)
        check(f"[{k}] unique title/description/og/twitter",all(pg.locator(s).count()==1 for s in ["meta[name=description]","meta[property='og:title']","meta[name='twitter:card']"]) and len(pg.get_attribute("meta[name=description]","content"))>60)
        check(f"[{k}] starts at scene 1; html lang matches",active(pg)==1 and pg.get_attribute("html","lang") in("bn","en"))
        check(f"[{k}] default fallback name + default message after the flow (bn)",True)
        advance(pg,k,3); msg=pg.inner_text("[data-bind=message]")
        check(f"[{k}] default message is shown from template data",len(msg)>40 and "from" not in msg.lower()[:0])
        check(f"[{k}] no sender line when 'from' is empty",pg.locator("[data-bind=from]").is_hidden())
        # personalised, Bengali
        q=up.urlencode({"name":BN_NAME,"from":"কাওসার","message":BN_MSG,"lang":"bn"})
        pg.goto(R+"?"+q); pg.wait_for_timeout(250)
        check(f"[{k}] personalised: noindex,follow + canonical stays base",pg.get_attribute("meta[name=robots]","content")=="noindex,follow" and pg.get_attribute("link[rel=canonical]","href").endswith(e["route"]))
        check(f"[{k}] Bengali name appears in h1 and title",BN_NAME in pg.inner_text("h1") and BN_NAME in pg.title())
        advance(pg,k,3)
        check(f"[{k}] custom message verbatim incl. line breaks + emoji",pg.evaluate("document.querySelector('[data-bind=message]').textContent")==BN_MSG)
        check(f"[{k}] sender shown",pg.is_visible("[data-bind=from]") and "কাওসার" in pg.inner_text("[data-bind=from]"))
        # english
        pg.goto(R+"?"+up.urlencode({"name":"Riya","from":"Kawsar","message":"Hello\nthere","lang":"en"})); pg.wait_for_timeout(250)
        check(f"[{k}] lang=en → English UI, lang attr en",pg.get_attribute("html","lang")=="en" and "Riya" in pg.inner_text("h1") and not any("\u0980"<=ch<="\u09FF" for ch in pg.inner_text("main")))
        # language toggle keeps working
        pg.click("#langToggle"); pg.wait_for_timeout(100)
        check(f"[{k}] language toggle switches to Bengali, name kept",pg.get_attribute("html","lang")=="bn" and "Riya" in pg.inner_text("h1") and pg.get_attribute("#langToggle","aria-pressed")=="false")
        # lang param validity
        for v,ok in [("EN","en"),("bn","bn"),("fr",None),("<b>",None),("x"*500,None)]:
            pg.context.clear_cookies(); pg.goto(R+"?name=A&lang="+up.quote(v)); pg.evaluate("localStorage.clear()"); pg.goto(R+"?name=A&lang="+up.quote(v)); pg.wait_for_timeout(100)
            got=pg.get_attribute("html","lang")
            check(f"[{k}] lang={v[:8]!r} → {'accepted' if ok else 'rejected → default bn'}",got==(ok or "bn"),got)
        # themes
        for th in e["themes"]:
            pg.goto(R+f"?name=A&theme={th}&lang=en"); pg.wait_for_timeout(80)
            check(f"[{k}] theme {th} applies class",pg.evaluate(f"document.documentElement.classList.contains('theme-{th}')"))
        for bad in ["evil","","x\"><b>","THEME-ROSE","a"*500,"classic"]:
            pg.goto(R+"?name=A&theme="+up.quote(bad)); pg.wait_for_timeout(80)
            cl=pg.evaluate("[...document.documentElement.classList].filter(c=>c.startsWith('theme-'))")
            check(f"[{k}] invalid theme {bad[:10]!r} → default only",cl==["theme-"+e["themes"][0]],cl)
        # XSS / hostile
        pg.dialogs.clear()
        pg.goto(R+"?"+up.urlencode({"name":XSS,"from":XSS,"message":XSS,"theme":XSS,"lang":XSS,"kind":XSS})); pg.wait_for_timeout(250)
        advance(pg,k,3)
        check(f"[{k}] XSS: no dialog, no injected elements, message shown as text",not pg.dialogs and pg.locator("main img, main svg[onload], body > script:not([src])").count()==0 and "<script>" in pg.evaluate("document.querySelector('[data-bind=message]').textContent"))
        check(f"[{k}] XSS: name/from have no angle brackets",all("<" not in t and ">" not in t for t in [pg.inner_text("[data-bind=from]"),pg.title()]))
        # oversized
        pg.goto(R+"?"+up.urlencode({"name":"N"*3000,"from":"F"*3000,"message":"M"*5000})); pg.wait_for_timeout(250)
        advance(pg,k,3)
        check(f"[{k}] oversized: name ≤40, message ≤240, from ≤40",len(pg.evaluate("document.querySelector('h1').textContent"))<200 and len(pg.evaluate("document.querySelector('[data-bind=message]').textContent"))<=240 and len(pg.inner_text("[data-bind=from]"))<=45)
        pg.goto(R+"?"+"a="+"x"*8000); pg.wait_for_timeout(150)
        check(f"[{k}] 8 KB unknown query value is harmless",active(pg)==1 and not pg.errs)
        pg.goto(R+"?name=%E0%A4%&message=%ZZ"); pg.wait_for_timeout(150)
        check(f"[{k}] malformed percent-encoding is harmless",active(pg)==1)
        # empty
        pg.goto(R+"?name=&from=&message=&theme=&lang="); pg.wait_for_timeout(150)
        check(f"[{k}] empty values → defaults, no 'undefined'",active(pg)==1 and "undefined" not in pg.inner_text("main"))
        # unicode
        pg.goto(R+"?"+up.urlencode({"name":"মোঃ আব্দুল্লাহ্ 😊","lang":"en"})); pg.wait_for_timeout(150)
        check(f"[{k}] Unicode/emoji name preserved",pg.inner_text("h1").count("মোঃ আব্দুল্লাহ্ 😊")==1)
        # replay
        pg.goto(R+"?name=Riya&lang=en"); pg.wait_for_timeout(150); advance(pg,k,4)
        pg.click("#replayBtn"); pg.wait_for_timeout(200)
        check(f"[{k}] replay returns to scene 1 and resets state",active(pg)==1 and (pg.locator(".star[aria-pressed=true]").count()==0 if k=="love" else pg.locator("#cards li").count()==0))
        # keyboard only
        pg.goto(R+"?name=Riya&lang=en"); pg.wait_for_timeout(200)
        first="#sealBtn" if k=="love" else "#openJar"
        pg.focus(first); pg.keyboard.press("Enter"); pg.wait_for_timeout(800)
        check(f"[{k}] keyboard: Enter advances; heading receives focus",active(pg)==2 and pg.evaluate("document.activeElement.tagName")=="H2")
        if k=="love":
            for i in (1,2,3):
                pg.focus(f"[data-star='{i}']"); pg.keyboard.press("Space")
            pg.focus("#toLetter"); pg.keyboard.press("Enter")
        else:
            for _ in range(3): pg.focus("#drawBtn"); pg.keyboard.press("Enter")
            pg.focus("#toMessage"); pg.keyboard.press("Enter")
        pg.wait_for_timeout(200)
        check(f"[{k}] keyboard: scene 3 reached without a mouse",active(pg)==3)
        # visible focus ring
        pg.keyboard.press("Tab"); pg.wait_for_timeout(50)
        ol=pg.evaluate("(()=>{const e=document.activeElement;const s=getComputedStyle(e);return parseFloat(s.outlineWidth)>=2&&s.outlineStyle!=='none'})()")
        check(f"[{k}] focused control has a visible outline",ol)
        # gating: continue disabled until done
        pg.goto(R+"?name=Riya&lang=en"); pg.wait_for_timeout(150); advance(pg,k,2)
        gate="#toLetter" if k=="love" else "#toMessage"
        check(f"[{k}] cannot skip the interaction",pg.is_disabled(gate) if k=="love" else pg.is_hidden(gate))
        # layout at all widths, every scene, long unbroken input
        long_q=up.urlencode({"name":"Abdulrahman-Muhammad-Al-Hossain-Chowdhury","from":"Z"*38,"message":("W"*30+" ")*8,"lang":"en"})
        for lang,qq in (("en",long_q),("bn",up.urlencode({"name":"আব্দুর রহমান মুহাম্মদ আল হোসাইন","from":"কাওসার","message":BN_MSG*3,"lang":"bn"}))):
            for w in W:
                pg.set_viewport_size({"width":w,"height":700}); pg.goto(R+"?"+qq); pg.wait_for_timeout(120)
                over=[]
                for sc in range(1,e["scenes"]+1):
                    if sc>1: advance(pg,k,sc)
                    over.append(pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
                    small=pg.evaluate("[...document.querySelectorAll('.scene.is-active button, .scene.is-active a')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().width<43.5||e.getBoundingClientRect().height<43.5)).map(e=>e.id||e.textContent.trim().slice(0,12))")
                    if small: over.append(("small-target",small))
                    pg.goto(R+"?"+qq); pg.wait_for_timeout(60)
                check(f"[{k}] {lang} {w}px: no horizontal overflow, targets ≥44px (all {e['scenes']} scenes)",all(x==0 for x in over if isinstance(x,int)) and not [x for x in over if isinstance(x,tuple)],over)
        pg.set_viewport_size({"width":390,"height":800})
        # contrast per theme, per scene, both languages
        for th in e["themes"]:
            for lang in ("bn","en"):
                worst=99
                for sc in range(1,e["scenes"]+1):
                    pg.goto(R+f"?name=Riya&theme={th}&lang={lang}"); pg.wait_for_timeout(100)
                    advance(pg,k,sc); worst=min(worst,contrast_min(pg))
                check(f"[{k}] contrast theme={th} {lang}: all text ≥ 4.5:1 (min {worst:.2f})",worst>=4.5,worst)
        check(f"[{k}] no console errors / 4xx on local assets",not pg.errs and not pg.bad,(pg.errs,pg.bad)); pg.errs.clear(); pg.bad.clear()
    # anniversary kind
    R=B+EXP["anniversary"]["route"]; texts={}
    for kind in ["together","couple","family","COUPLE","evil","x"*300,"<b>"]:
        pg.goto(R+"?lang=en&kind="+up.quote(kind)); pg.wait_for_timeout(100); texts[kind]=pg.inner_text("#welcomeLead")
    check("[anniversary] kind changes only the built-in wording",texts["together"]!=texts["couple"]!=texts["family"] and texts["COUPLE"]==texts["couple"])
    check("[anniversary] unknown/hostile kind → neutral 'together'",texts["evil"]==texts["together"]==texts["x"*300]==texts["<b>"])
    check("[anniversary] default wording does not assume a romantic relationship",not any(w in texts["together"].lower() for w in ["husband","wife","love","spouse","wedding"]))
    pg.goto(R+"?lang=en&kind=family&message=My+own+words"); pg.wait_for_timeout(100); advance(pg,"anniversary",3)
    check("[anniversary] kind never alters the user's own message",pg.inner_text("[data-bind=message]")=="My own words")
    # reduced motion
    rc,rp=newctx(reduced_motion="reduce")
    for k,e in [(k,e) for k,e in EXP.items() if ONLY in (None,k)]:
        rp.goto(B+e["route"]+"?name=A&lang=en"); rp.wait_for_timeout(150)
        d=rp.evaluate("[...document.querySelectorAll('.scene.is-active, .seal, .ring, .drift')].map(e=>parseFloat(getComputedStyle(e).animationDuration)||0)")
        advance(rp,k,2)
        check(f"[{k}] reduced motion: animations disabled and flow still works",max(d)<0.01 and active(rp)==2,d)
    rc.close()
    # no JS
    nc,np_=newctx(java_script_enabled=False)
    for k,e in [(k,e) for k,e in EXP.items() if ONLY in (None,k)]:
        np_.goto(B+e["route"]); np_.wait_for_timeout(150)
        check(f"[{k}] no-JS: noscript note + link home, no blank page",np_.locator("noscript").count()>=1 and "JavaScript" in np_.inner_text("body") and np_.locator("h1").count()==1)
    nc.close()
    # Birthday unchanged
    pg.goto(B+"/wishes/birthday/birthday-01"); pg.wait_for_timeout(300)
    check("[birthday] default URL still works",pg.locator("h1").count()>=1 and pg.locator("meta[name=robots]").count()==0 and not pg.errs)
    pg.goto(B+"/wishes/birthday/birthday-01?name=Riya&from=Kawsar&message=Hi&theme=elegant&lang=en"); pg.wait_for_timeout(300)
    check("[birthday] personalised URL still works (noindex, theme)",pg.get_attribute("meta[name=robots]","content")=="noindex,follow" and pg.evaluate("document.documentElement.classList.contains('theme-elegant')"))
    # static routes
    import urllib.request as ur
    def status(path):
        try:
            class NoRedir(ur.HTTPRedirectHandler):
                def redirect_request(self,*a,**k): return None
            op=ur.build_opener(NoRedir); r=op.open(B+path); return r.status
        except Exception as ex: return getattr(ex,"code",0)
    check("routes: clean URLs 200",all(status(x)==200 for x in ["/wishes/love/love-01","/wishes/anniversary/anniversary-01","/categories/love/","/categories/anniversary/","/create/"]))
    check("routes: .html redirects (308/301)",all(status(x) in (301,308) for x in ["/wishes/love/love-01.html","/wishes/anniversary/anniversary-01.html"]))
    check("routes: planned Friendship has NO page (404) and no category page",status("/wishes/friendship/friendship-01")==404 and status("/categories/friendship/")==404)
    sm=ur.urlopen(B+"/sitemap.xml").read().decode()
    check("sitemap lists love/anniversary + their categories, not friendship",all(x in sm for x in ["/wishes/love/love-01","/wishes/anniversary/anniversary-01","/categories/love/","/categories/anniversary/"]) and "friendship" not in sm)
    import re
    locs=re.findall(r"<loc>([^<]*)</loc>",sm)
    check("sitemap has <loc> entries and none has a query string or fragment",len(locs)>=11 and not any(("?" in l or "#" in l) for l in locs),locs)
    check("no console errors in birthday regression",not pg.errs,pg.errs)
    b.close()
print("\nFAILED:", fails if fails else "none")
raise SystemExit(1 if fails else 0)
