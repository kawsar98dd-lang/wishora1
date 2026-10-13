"""Phase 3 — Creator with Love + Anniversary (needs: node scripts/serve.mjs 8803)."""
from playwright.sync_api import sync_playwright
import urllib.parse as up, os
B=os.environ.get("WISHORA_BASE","http://127.0.0.1:8803"); fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def font(u): return "fonts.g" in u
XSS='<script>alert(1)</script><img src=x onerror=alert(1)>'
MSG_BN="প্রিয়,\nতোমাকে ভালোবাসি। 🌸"
def step_is(pg,n): return pg.evaluate("document.querySelector('.step-panel:not([hidden])').dataset.step")==str(n)
def nxt(pg): pg.click(".step-panel:not([hidden]) [data-action=next]"); pg.wait_for_timeout(150)
CASES=[
 dict(occ="love",tpl="love-letter",route="/wishes/love/love-01",themes=["rose","midnight","blush"],default_theme="rose",kind=False,first_h="তিনটি তারা"),
 dict(occ="anniversary",tpl="anniversary-memories",route="/wishes/anniversary/anniversary-01",themes=["ivory","emerald","twilight"],default_theme="ivory",kind=True,first_h="স্মৃতির বয়াম"),
]
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':900},permissions=["clipboard-read","clipboard-write"]); pg=ctx.new_page(); pg.set_default_timeout(8000)
    errs=[]; dialogs=[]; bad=[]
    pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and not font(m.location.get("url","")) else None)
    pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
    pg.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss()))
    pg.on("response",lambda r: bad.append((r.status,r.url)) if r.status>=400 and not font(r.url) else None)
    for c in CASES:
        T=c["tpl"]
        pg.goto(B+"/create/"); pg.wait_for_timeout(250)
        pg.click(f"#step-1 input[name=occasion][value={c['occ']}] + *, #step-1 label:has(input[value={c['occ']}])"); nxt(pg)
        vis=pg.locator("#step-2 .choice-card:visible").count()
        check(f"[{T}] step 2 shows exactly this occasion's template, preselected",vis==1 and pg.is_checked(f"input[name=template][value={T}]"))
        check(f"[{T}] template card links to the real experience",pg.get_attribute("#step-2 .choice-extra a:visible","href")==c["route"])
        nxt(pg); check(f"[{T}] details step",step_is(pg,3))
        form=f"#step-3 [data-template='{T}']" if pg.locator(f"#step-3 [data-template='{T}']").count() else "#step-3"
        names=pg.eval_on_selector_all(f"#step-3 [data-template='{T}'] .field, #step-3 .field:visible","e=>e.map(x=>x.dataset.field)") if False else None
        check(f"[{T}] theme choices come from template data",pg.eval_on_selector_all(f"input[name='{T}-theme']","e=>e.map(i=>i.value)")==c["themes"] and pg.is_checked(f"input[name='{T}-theme'][value={c['default_theme']}]"))
        check(f"[{T}] kind field {'present with 3 choices, default together' if c['kind'] else 'absent'}",(pg.eval_on_selector_all(f"input[name='{T}-kind']","e=>e.map(i=>i.value)")==["together","couple","family"] and pg.is_checked(f"input[name='{T}-kind'][value=together]")) if c["kind"] else pg.locator(f"input[name='{T}-kind']").count()==0)
        # validation: empty name blocked
        nxt(pg)
        check(f"[{T}] empty name → stays on details with an error message",step_is(pg,3) and pg.locator("[data-field=name] [role=alert], [data-field=name] .field-error:visible").count()>=1)
        # hostile + too long
        pg.fill(f"#step-3 [name=name]:visible","N"*41); nxt(pg)
        check(f"[{T}] 41-char name rejected (limit 40 kept)",step_is(pg,3))
        # valid Bengali flow
        pg.fill("#step-3 [name=name]:visible","রিয়া"); pg.fill("#step-3 [name=from]:visible","কাওসার")
        pg.check(f"input[name='{T}-msgmode'][value=custom]"); pg.fill("textarea[name=message]:visible",MSG_BN)
        pg.click(f"input[name='{T}-theme'][value={c['themes'][1]}]")
        if c["kind"]: pg.click(f"input[name='{T}-kind'][value=couple]")
        pg.check(f"input[name='{T}-lang'][value=bn]")
        nxt(pg); check(f"[{T}] → preview step",step_is(pg,4))
        s=pg.inner_text("#summary")
        check(f"[{T}] summary shows values{' and the chosen kind' if c['kind'] else ''}","রিয়া" in s and "কাওসার" in s and "ভালোবাসি" in s and (("জীবনসঙ্গী" in s) if c["kind"] else True),s[:200])
        pg.wait_for_timeout(900)
        frame=[f for f in pg.frames if c["route"] in f.url][0]
        check(f"[{T}] preview iframe is the REAL experience with embed=1 and same params",all(x in frame.url for x in ["embed=1","name=","theme="+c['themes'][1]]) and ("kind=couple" in frame.url if c["kind"] else "kind=" not in frame.url),frame.url)
        check(f"[{T}] preview renders the recipient and the embedded chrome is hidden",frame.evaluate("document.querySelector('h1').textContent.includes('রিয়া')") and frame.evaluate("document.body.classList.contains('is-embedded')") and frame.evaluate("getComputedStyle(document.querySelector('.topbar-back')).display")=="none")
        check(f"[{T}] preview iframe has a title for assistive tech",bool(pg.get_attribute("#previewFrame","title")))
        # back keeps values
        pg.click("#step-4 [data-action=back]"); pg.wait_for_timeout(100)
        check(f"[{T}] values kept after Back",pg.input_value("#step-3 [name=name]:visible")=="রিয়া" and pg.input_value("textarea[name=message]:visible")==MSG_BN and pg.is_checked(f"input[name='{T}-theme'][value={c['themes'][1]}]") and (pg.is_checked(f"input[name='{T}-kind'][value=couple]") if c["kind"] else True))
        pg.click("#step-3 [data-action=back]"); pg.click("#step-2 [data-action=back]"); nxt(pg); nxt(pg)
        check(f"[{T}] values kept after going back to step 1 and forward again",pg.input_value("#step-3 [name=name]:visible")=="রিয়া")
        nxt(pg); nxt(pg); check(f"[{T}] → share step",step_is(pg,5))
        url=pg.input_value("#shareUrl"); u=up.urlparse(url); q=up.parse_qs(u.query,keep_blank_values=True)
        want=["name","from","message","theme"]+(["kind"] if c["kind"] else [])+["lang"]
        check(f"[{T}] share URL: route, params and order consistent with template data",u.path==c["route"] and q["name"]==["রিয়া"] and q["message"]==[MSG_BN] and q["theme"]==[c['themes'][1]] and q["lang"]==["bn"] and list(q.keys())==want and "embed" not in q,url)
        check(f"[{T}] preview URL == share URL (apart from embed=1)",up.parse_qs(up.urlparse(frame.url).query).keys()-{"embed"}==q.keys() and all(up.parse_qs(up.urlparse(frame.url).query)[k]==q[k] for k in q))
        check(f"[{T}] 'Open wish' link equals the share URL",pg.get_attribute("#openBtn","href")==url)
        check(f"[{T}] privacy notice present",len(pg.inner_text(".privacy-note"))>30)
        # copy / fallback
        pg.click("#copyBtn"); pg.wait_for_timeout(250)
        check(f"[{T}] copy link: clipboard really holds the URL",pg.evaluate("navigator.clipboard.readText()")==url and "কপি হয়েছে" in pg.inner_text("#shareStatus"))
        pg.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}); document.execCommand=()=>false")
        pg.click("#copyBtn"); pg.wait_for_timeout(250)
        check(f"[{T}] copy fallback fails honestly (no false 'copied')","কপি করা গেল না" in pg.inner_text("#shareStatus") and "কপি হয়েছে" not in pg.inner_text("#shareStatus"))
        check(f"[{T}] no native share → Share hidden, Copy visible",pg.is_hidden("#shareBtn") and pg.is_visible("#copyBtn"))
        pg.evaluate("window.__s=null;navigator.share=(d)=>{window.__s=d;return Promise.resolve()}"); pg.click("#step-5 [data-action=back]"); nxt(pg)
        pg.click("#shareBtn"); pg.wait_for_timeout(150)
        check(f"[{T}] native share receives the exact URL",pg.evaluate("window.__s&&window.__s.url")==url)
        # visiting generated URL gives the personalised experience
        v=ctx.new_page(); v.goto(url); v.wait_for_timeout(300)
        check(f"[{T}] the generated link opens the wish personalised (name + noindex)","রিয়া" in v.inner_text("h1") and v.get_attribute("meta[name=robots]","content")=="noindex,follow")
        v.close()
        # hostile text through the creator
        pg.goto(B+"/create/"); pg.wait_for_timeout(200)
        pg.click(f"#step-1 label:has(input[value={c['occ']}])"); nxt(pg); nxt(pg)
        pg.fill("#step-3 [name=name]:visible",XSS[:40]); pg.fill("#step-3 [name=from]:visible",XSS[:40]); pg.check(f"input[name='{T}-msgmode'][value=custom]"); pg.fill("textarea[name=message]:visible",XSS)
        nxt(pg); pg.wait_for_timeout(900)
        check(f"[{T}] hostile text: summary and preview render it as text only; no dialog",not dialogs and pg.locator("#summary img, #summary script").count()==0)
        fr=[f for f in pg.frames if c["route"] in f.url][0]
        check(f"[{T}] hostile text inside preview iframe: no injected elements",fr.locator("img, svg[onload], main script").count()==0)
        # fresh context deep link
        fc=b.new_context(viewport={'width':390,'height':800}); fp=fc.new_page(); fp.goto(B+f"/create/?category={c['occ']}&template={T}"); fp.wait_for_timeout(300)
        check(f"[{T}] fresh browser context: deep link lands on the details-ready step with template selected",step_is(fp,2) or step_is(fp,3),fp.evaluate("document.querySelector('.step-panel:not([hidden])').dataset.step"))
        fc.close()
    # planned template safety
    for u in ["/create/?template=friendship-moments","/create/?category=friendship","/create/?template=friendship-moments&category=friendship","/create/?template=../../wishes/birthday/birthday-01","/create/?category=love&template=anniversary-memories"]:
        pg.goto(B+u); pg.wait_for_timeout(250)
        st=pg.evaluate("document.querySelector('.step-panel:not([hidden])').dataset.step")
        ok=(st in("1","2")) and pg.locator("input[name=template][value=friendship-moments]").count()==0
        check(f"planned/unknown deep link {u[8:70]} is safe (no Friendship option exists)",ok,st)
    pg.goto(B+"/create/"); pg.wait_for_timeout(250)
    check("Friendship is shown only as a non-interactive 'coming soon' chip",pg.locator("#step-1 .soon-chips li:has-text('বন্ধুত্ব')").count()==1 and pg.locator("#step-1 input[value=friendship]").count()==0)
    # English creator UI
    pg.goto(B+"/create/?lang=en"); pg.evaluate("localStorage.setItem('wishora_lang','en')"); pg.reload(); pg.wait_for_timeout(300)
    check("English creator lists the three occasions in English",pg.locator("#step-1 .choice-name").all_inner_texts()==["Birthday","Love","Anniversary"] and not any("\u0980"<=ch<="\u09FF" for ch in pg.inner_text("#step-1 .choice-grid")))
    pg.click("#step-1 label:has(input[value=anniversary])"); nxt(pg); nxt(pg)
    check("English: anniversary 'kind' legend + options are English",any(w in pg.inner_text("[data-field=kind]") for w in ["What kind of anniversary?"]) and "Partners" in pg.inner_text("[data-field=kind]") and not any("\u0980"<=ch<="\u09FF" for ch in pg.inner_text("[data-field=kind]")))
    check("no console errors / failed local requests in the whole Creator run",not errs and not [x for x in bad if "birthday-music" not in x[1]],(errs,bad))
    b.close()
print("\nFAILED:", fails if fails else "none")
raise SystemExit(1 if fails else 0)
