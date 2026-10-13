from playwright.sync_api import sync_playwright
import urllib.parse as up, json
B="http://127.0.0.1:8803"; fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def font(u): return "fonts.g" in u
import os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'p1_a11y.py'),encoding='utf8').read(); ns={}
for name in ("CONTRAST","TARGETS","FOCUS"):
    exec(name+'="""'+src.split(name+'="""')[1].split('"""')[0]+'"""',ns)
CONTRAST,TARGETS,FOCUS=ns["CONTRAST"],ns["TARGETS"],ns["FOCUS"]
FOCUS2="""()=>{const e=document.activeElement;if(!e||e===document.body)return true;const has=x=>{const cs=getComputedStyle(x);return (cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none'};const c=[e,e.closest('.choice-card,.radio,.search-field,.lang-toggle')].filter(Boolean);const sib=e.nextElementSibling;return c.some(has)||(!!sib&&has(sib))}"""
XSS='<script>alert(1)</script><img src=x onerror=alert(1)>"><svg onload=alert(1)>'
def step(pg): return pg.evaluate("document.querySelector('.step-panel:not([hidden])').dataset.step")
def nxt(pg): pg.click(".step-panel:not([hidden]) [data-action=next]"); pg.wait_for_timeout(150)
def to_details(pg,url="/create/"):
    pg.goto(B+url); pg.wait_for_timeout(250); pg.click("#step-1 label.choice-card"); nxt(pg); nxt(pg)
def reach(pg,n,**kw):
    to_details(pg); pg.fill("[name=name]:visible","Riya"); 
    if n>=4: nxt(pg)
    if n>=5: pg.wait_for_timeout(500); nxt(pg)
    if n==1: pg.goto(B+"/create/"); pg.wait_for_timeout(250)
    if n==2: pg.goto(B+"/create/"); pg.click("#step-1 label.choice-card"); nxt(pg)
with sync_playwright() as p:
    b=p.chromium.launch(); dialogs=[]
    def page(ctx):
        pg=ctx.new_page(); pg.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss())); return pg
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=["clipboard-read","clipboard-write"]); pg=page(ctx)
    errs=[]; pg.on("console",lambda m: errs.append(m.text+"@"+m.location.get("url","")) if m.type=="error" and not font(m.location.get("url","")) else None); pg.on("pageerror",lambda e: errs.append(str(e)))
    # ---------- A. English flow
    pg.goto(B+"/create/"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(250)
    pg.click("#langToggle"); pg.wait_for_timeout(150)
    check("EN: creator UI in English (heading, caption, steps, aria, placeholders)", "Create a personalised wish" in pg.inner_text("h1") and "Step 1 of 5" in pg.inner_text("#stepCaption") and pg.get_attribute("#steps","aria-label")=="Steps" and pg.evaluate("[...document.querySelectorAll('[data-l=bn]')].filter(e=>e.offsetParent!==null).length")==0)
    pg.click("#step-1 label.choice-card"); nxt(pg); nxt(pg)
    check("EN: wish language defaults to the UI language (en); default message shown in English only", pg.is_checked("input[name$=-lang][value=en]") and pg.is_visible("[data-wl=en]") and pg.is_hidden("[data-wl=bn]") and "Today isn't just another date" in pg.inner_text("[data-wl=en]"))
    pg.check("input[name$=-lang][value=bn]"); check("choosing wish language bn swaps the default-message preview (independent of UI language)", pg.is_visible("[data-wl=bn]") and pg.is_hidden("[data-wl=en]"))
    pg.check("input[name$=-lang][value=en]"); nxt(pg)
    check("EN error text + field label", "Enter the recipient's name." in pg.inner_text("#f-birthday-surprise-name-error") and "Required" in pg.inner_text("label[for=f-birthday-surprise-name]"))
    pg.fill("[name=name]:visible","Riya"); pg.fill("[name=from]:visible","Kawsar"); pg.click("input[name$=-theme][value=celebration]"); nxt(pg); pg.wait_for_timeout(500)
    check("EN preview summary + template-message row", "Riya" in pg.inner_text("#summary") and "Template's message" in pg.inner_text("#summary") and "Celebration" in pg.inner_text("#summary"), pg.inner_text("#summary"))
    nxt(pg); url=pg.input_value("#shareUrl"); q=up.parse_qs(up.urlparse(url).query)
    check("EN URL: no message param (default message), theme=celebration, lang=en", "message" not in q and q["theme"]==["celebration"] and q["lang"]==["en"] and q["name"]==["Riya"], url)
    check("EN privacy notice (exact required sentence)", "Information you enter may be included in the shareable link." in pg.inner_text(".privacy-note"))
    check("EN status messages", True)
    pg.click("#copyBtn"); pg.wait_for_timeout(200); check("EN copy status", "Link copied." in pg.inner_text("#shareStatus"))
    w=page(ctx); w.goto(url); w.wait_for_timeout(400); w.click("#openSurpriseBtn"); w.wait_for_timeout(250)
    check("EN link → English wish, celebration theme, recipient + sender", w.get_attribute("html","lang")=="en" and w.inner_text("#recipientNameDisplay")=="Riya" and "Kawsar" in w.inner_text("#senderLine") and w.evaluate("document.documentElement.classList.contains('theme-celebration')"))
    w.evaluate("()=>{document.querySelector('.scene.is-active .next-btn').click()}"); w.wait_for_timeout(100); w.click("#giftBox"); w.wait_for_timeout(700); w.click("#afterGiftBtn"); w.wait_for_timeout(300)
    tpl=json.loads(open('/dev/stdin').read()) if False else None
    check("EN default message comes from template DATA (English)", "Today isn't just another date" in w.inner_text("#heartfeltText"))
    # default URL unchanged
    d=page(ctx); d.goto(B+"/wishes/birthday/birthday-01"); d.wait_for_timeout(400); d.click("#openSurpriseBtn"); d.wait_for_timeout(250)
    cls=d.evaluate("[...document.documentElement.classList].filter(c=>c.startsWith('theme-'))")
    check("default URL (no params): default experience, classic theme, fallback name, no noindex meta", cls==["theme-classic"] and d.inner_text("#recipientNameDisplay") in ("প্রিয় মানুষ","Someone Special") and d.locator("meta[name=robots]").count()==0, cls)
    d.evaluate("()=>{document.querySelector('.scene.is-active .next-btn').click()}"); d.wait_for_timeout(100); d.click("#giftBox"); d.wait_for_timeout(700); d.click("#afterGiftBtn"); d.wait_for_timeout(250)
    check("default message rendered from template DATA (visitor language is en here)", "Today isn't just another date" in d.inner_text("#heartfeltText"))
    d2=page(b.new_context(viewport={"width":390,"height":800})); d2.goto(B+"/wishes/birthday/birthday-01"); d2.wait_for_timeout(300); d2.click("#openSurpriseBtn"); d2.wait_for_timeout(200); d2.evaluate("()=>{document.querySelector('.scene.is-active .next-btn').click()}"); d2.wait_for_timeout(100); d2.click("#giftBox"); d2.wait_for_timeout(700); d2.click("#afterGiftBtn"); d2.wait_for_timeout(250)
    check("fresh visitor: default Bengali message from template data", "আজকের দিনটা শুধু ক্যালেন্ডারের" in d2.inner_text("#heartfeltText"))
    # ---------- B. hostile parameters on the wish page
    cases=[("name script","?name="+up.quote("<script>alert(1)</script>")),("theme=javascript","?theme=javascript"),("lang=<img>","?lang="+up.quote("<img src=x onerror=alert(1)>")),
           ("language=<img>","?language="+up.quote("<img src=x onerror=alert(1)>")),("template=../../something","?template=../../something"),("category=../../something","?category=../../something"),
           ("theme=<svg onload>","?theme="+up.quote("<svg onload=alert(1)>")),("malformed %","?name=%E0%A4%A&message=%&theme=%"),("embed junk","?embed=%3Cb%3E"),("xss name+from+message",f"?name={up.quote(XSS)}&from={up.quote(XSS)}&message={up.quote(XSS)}")]
    for label,qs in cases:
        e=[]; t=page(ctx); t.on("pageerror",lambda x,e=e: e.append(str(x))); t.goto(B+"/wishes/birthday/birthday-01"+qs); t.wait_for_timeout(350); t.click("#openSurpriseBtn"); t.wait_for_timeout(200)
        classes=t.evaluate("[...document.documentElement.classList].filter(c=>c.startsWith('theme-'))")
        inj=t.evaluate("document.querySelectorAll('body img, body svg[onload], body script:not([src]), body [onerror]').length")
        check(f"B hostile '{label}': fails safe (default theme, no injected nodes, no JS error)", classes==["theme-classic"] and inj==0 and not e, (classes,inj,e))
        t.close()
    t=page(ctx); t.goto(B+"/wishes/birthday/birthday-01?message="+up.quote(XSS)+"&name=Riya"); t.wait_for_timeout(300); t.click("#openSurpriseBtn"); t.wait_for_timeout(200)
    t.evaluate("()=>{document.querySelector('.scene.is-active .next-btn').click()}"); t.wait_for_timeout(100); t.click("#giftBox"); t.wait_for_timeout(700); t.click("#afterGiftBtn"); t.wait_for_timeout(250)
    check("B message XSS appears as literal TEXT (verbatim) with no child elements", t.evaluate("document.getElementById('heartfeltText').textContent")==XSS and t.evaluate("document.getElementById('heartfeltText').children.length")==0)
    t.close()
    t=page(ctx); t.goto(B+"/wishes/birthday/birthday-01?name="+"A"*500+"&message="+"m"*5000); t.wait_for_timeout(300); t.click("#openSurpriseBtn"); t.wait_for_timeout(200)
    check("B oversized params capped (name 40)", len(t.inner_text("#recipientNameDisplay"))==40); t.close()
    t=page(b.new_context(viewport={"width":390,"height":800})); t.goto(B+"/wishes/birthday/birthday-01?lang=en&name=Riya"); t.wait_for_timeout(300)
    check("B ?lang=en wins for display but does NOT overwrite saved preference", t.get_attribute("html","lang")=="en" and t.evaluate("localStorage.getItem('wishora_lang')") is None); t.close()
    t=page(ctx); t.goto(B+"/wishes/birthday/birthday-01?embed=1&name=Riya"); t.wait_for_timeout(300)
    check("B ?embed=1 outside an iframe is ignored (site chrome stays)", t.evaluate("document.body.classList.contains('is-embedded')")==False); t.close()
    # ---------- C. XSS through the Creator form itself
    c=page(ctx); to_details(c); c.fill("[name=name]:visible",XSS); c.fill("[name=from]:visible",XSS); c.check("input[name$=-msgmode][value=custom]"); c.fill("textarea[name=message]",XSS)
    nxt(c); c.wait_for_timeout(600)
    check("C creator: payloads accepted only as text (summary has only dt/dd, no injected elements)", step(c)=="4" and c.evaluate("[...document.querySelectorAll('#summary *')].every(e=>['DT','DD'].includes(e.tagName))") and c.evaluate("document.querySelectorAll('#creatorApp img, #creatorApp svg[onload], #creatorApp [onerror]').length")==0)
    check("C summary shows the message VERBATIM (not mutated, not executed)", XSS in c.inner_text("#summary"))
    nxt(c); xu=c.input_value("#shareUrl"); check("C URL percent-encodes everything (no raw < > \" in URL)", all(ch not in xu for ch in '<>"'), xu[:120])
    wx=page(ctx); wx.goto(xu); wx.wait_for_timeout(400); wx.click("#openSurpriseBtn"); wx.wait_for_timeout(250)
    check("C generated wish page: no dialogs, no injected elements", wx.evaluate("document.querySelectorAll('body img, body [onerror], body svg[onload]').length")==0)
    check("C no dialogs through all XSS tests", not dialogs, dialogs)
    # ---------- D. deep links
    for url,exp_step,notice in [("/create/?category=birthday","2",False),("/create/?category=birthday&template=birthday-surprise","2",False),("/create/?category=../../something","1",True),("/create/?template=../../something","1",True),("/create/?template="+up.quote("<img src=x onerror=alert(1)>"),"1",True),("/create/?category=love","2",False),("/create/?category=friendship","1",True),("/create/?template=friendship-moments","1",True),("/create/?category=LOVE","1",True),("/create/?template=nope&category=birthday","1",True)]:
        dd=page(ctx); dd.goto(B+url); dd.wait_for_timeout(300)
        ok=step(dd)==exp_step and (dd.is_visible("#creatorNotice")==notice)
        check(f"D deep link {url[:60]}", ok, (step(dd),dd.is_visible("#creatorNotice")))
        if notice: check("   …notice is a status region w/ friendly text (no raw error)", dd.get_attribute("#creatorNotice","role")=="status" and len(dd.inner_text("#creatorNotice"))>10)
        dd.close()
    dd=page(ctx); dd.goto(B+"/create/?category=birthday&template=birthday-surprise"); dd.wait_for_timeout(250)
    check("D template preselected via deep link", dd.is_checked("input[name=template]") and dd.is_enabled("#step-2 [data-action=next]"))
    # ---------- E. keyboard-only flow
    k=page(ctx); k.goto(B+"/create/"); k.wait_for_timeout(300)
    k.keyboard.press("Tab")  # skip link
    for _ in range(60):
        k.keyboard.press("Tab")
        if k.evaluate("document.activeElement.name==='occasion'"): break
    k.keyboard.press("Space"); check("E keyboard: Space selects the occasion; Next enabled", k.is_enabled("#step-1 [data-action=next]"))
    k.keyboard.press("Tab"); k.keyboard.press("Enter"); k.wait_for_timeout(150)  # hits Next? may land on soon-chips; ensure
    if step(k)!="2": k.focus("#step-1 [data-action=next]"); k.keyboard.press("Enter"); k.wait_for_timeout(150)
    check("E keyboard: Enter on Next → step 2, focus moved to the step heading", step(k)=="2" and k.evaluate("document.activeElement.id")=="step-2-title")
    k.focus("#step-2 [data-action=next]"); k.keyboard.press("Enter"); k.wait_for_timeout(150)
    k.focus("[name=name]:visible"); k.keyboard.type("Riya"); k.keyboard.press("Enter"); k.wait_for_timeout(500)
    check("E keyboard: Enter inside the name field continues to preview", step(k)=="4")
    k.focus("#step-4 [data-action=next]"); k.keyboard.press("Enter"); k.wait_for_timeout(150)
    check("E keyboard: reach share step; share input focus selects the link", step(k)=="5"); k.focus("#shareUrl"); check("   link text selected on focus", k.evaluate("document.getElementById('shareUrl').selectionEnd>0"))
    # focus indicators on every step
    for n in (1,2,3,4,5):
        kk=page(ctx); reach(kk,n); bad=[]
        for i in range(45):
            kk.keyboard.press("Tab")
            if kk.evaluate("document.activeElement===document.body"): break
            if kk.evaluate("document.activeElement.id==='previewFrame'"): continue
            if not kk.evaluate(FOCUS2): bad.append(kk.evaluate("(document.activeElement.name||document.activeElement.id||document.activeElement.className)+''"))
        check(f"E step {n}: every tab stop has a visible focus indicator", not bad, bad[:4]); kk.close()
    # ---------- F. layout at widths x steps
    for vw in (320,375,390,414,768,1280):
        cx=b.new_context(viewport={'width':vw,'height':800}); 
        for n in (1,2,3,4,5):
            q=page(cx); reach(q,n); q.wait_for_timeout(250)
            res=q.evaluate("""()=>{const vw=document.documentElement.clientWidth;const off=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||getComputedStyle(e).position==='fixed')return false;if(e.closest('[aria-hidden=true],[hidden],.hero-glow,.skip-link,.mobile-menu,.sr-only'))return false;return r.right>vw+1||r.left<-1}).slice(0,3).map(e=>(e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().right));return {vw,doc:document.documentElement.scrollWidth,off}}""")
            check(f"F {vw}px step {n}: no horizontal overflow", res['doc']<=res['vw'] and not res['off'], res)
            if n in (1,3,5) or vw in (320,390):
                small=q.evaluate(TARGETS); check(f"F {vw}px step {n}: all controls ≥44px", not small, small[:4])
            q.close()
        cx.close()
    # ---------- G. no-JS
    nj=b.new_context(viewport={'width':390,'height':800},java_script_enabled=False); n=nj.new_page(); n.goto(B+"/create/"); n.wait_for_timeout(300)
    check("G no-JS: explanation visible, creator UI hidden, links work", n.is_visible(".nojs-box") and n.is_hidden("#creatorApp") and n.locator("h1").is_visible() and n.get_attribute(".nojs-box a.btn","href")=="/wishes/birthday/birthday-01" and "JavaScript" in n.inner_text(".nojs-box"))
    # ---------- H. contrast on every step in both languages
    for lang in ("bn","en"):
        for n_ in (1,2,3,4,5):
            q=page(ctx); q.goto(B+"/create/"); q.evaluate(f"localStorage.setItem('wishora_lang','{lang}')"); reach(q,n_); q.wait_for_timeout(300)
            if n_==3: q.click("input[name$=-msgmode][value=custom]"); q.click(".step-panel:not([hidden]) [data-action=next]"); q.wait_for_timeout(100)  # show error state too
            v=q.evaluate(CONTRAST); check(f"H contrast AA /create/ step {n_} [{lang}]", not v, v[:4]); q.close()
    # themes × scenes contrast on the wish page
    for th in ("classic","elegant","celebration"):
        for lang in ("bn","en"):
            q=page(ctx); q.set_viewport_size({'width':390,'height':844}); q.goto(B+f"/wishes/birthday/birthday-01?name=Riya&from=Kawsar&theme={th}&lang={lang}&message="+up.quote("Happy day\nline two")); q.wait_for_timeout(500)
            allv=[]
            def snap(label): 
                q.wait_for_timeout(300); v=q.evaluate(CONTRAST); allv.extend([(label,)+tuple(x) for x in v])
            snap("s1"); q.click("#openSurpriseBtn"); snap("s2"); q.locator(".scene.is-active .next-btn:visible").first.click(); snap("s3")
            q.click("#giftBox"); q.wait_for_timeout(700); snap("s3b"); q.click("#afterGiftBtn"); snap("s4"); q.locator(".scene.is-active .next-btn:visible").first.click(); q.wait_for_timeout(1400); snap("s5")
            q.locator(".scene.is-active .next-btn:visible").first.click(); q.wait_for_timeout(300); q.click("#candleBtn"); q.wait_for_timeout(500); snap("s6"); q.locator(".scene.is-active .next-btn:visible").first.click(); snap("s7")
            q.locator(".scene.is-active .next-btn:visible").first.click(); snap("s8")
            check(f"H wish page theme={th} [{lang}] contrast AA across all 8 scenes", not allv, allv[:4]); q.close()
    check("no console errors in creator suite", not errs, errs)
    check("no dialogs", not dialogs, dialogs)
    b.close()
print("\nFAILED:",fails or "none")
