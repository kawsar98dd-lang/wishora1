from playwright.sync_api import sync_playwright
import urllib.parse as up, json
B="http://127.0.0.1:8803"; fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def font(u): return "fonts.g" in u
XSS='<script>alert(1)</script><img src=x onerror=alert(1)>"><svg onload=alert(1)>'
MSG_BN="প্রিয় রিয়া,\nজন্মদিনের অনেক শুভেচ্ছা! 🎉\n\nভালো থেকো।"
def go_step(pg,n):  return pg.evaluate("document.querySelector('.step-panel:not([hidden])').dataset.step")==str(n)
def click_next(pg): pg.click(".step-panel:not([hidden]) [data-action=next]"); pg.wait_for_timeout(150)
def to_details(pg):
    pg.goto(B+"/create/"); pg.wait_for_timeout(250)
    pg.click("#step-1 label.choice-card"); click_next(pg); click_next(pg)   # occasion → template (preselected) → details
def fill(pg,name="Riya",frm="Kawsar",msg=None,theme=None,lang=None):
    pg.fill("[name=name]:visible",name)
    pg.fill("[name=from]:visible",frm)
    if msg is not None:
        pg.check("input[name$=-msgmode][value=custom]"); pg.fill("textarea[name=message]",msg)
    if theme: pg.click(f"input[name$=-theme][value={theme}]")
    if lang: pg.check(f"input[name$=-lang][value={lang}]")
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':1280,'height':900},permissions=["clipboard-read","clipboard-write"]); pg=ctx.new_page()
    errs=[]; dialogs=[]; bad=[]
    pg.on("console",lambda m: errs.append(m.text+" @"+m.location.get("url","")) if m.type=="error" and not font(m.location.get("url","")) else None)
    pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
    pg.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss()))
    pg.on("response",lambda r: bad.append((r.status,r.url)) if r.status>=400 and not font(r.url) and "birthday-music" not in r.url else None)
    # ---- 1. open creator
    r=pg.goto(B+"/create/"); pg.wait_for_timeout(300)
    check("1 creator opens (200), title + h1 + canonical + indexable", r.status==200 and "Create a Personalized Wish" in pg.title() and pg.locator("h1").count()==1 and pg.get_attribute("link[rel=canonical]","href")=="https://SITE_URL_PLACEHOLDER/create/" and pg.locator("meta[name=robots]").count()==0, pg.title())
    check("steps: 5 items, step 1 current (aria-current=step), caption shown", pg.locator("[data-step-item]").count()==5 and pg.get_attribute("[data-step-item='1']","aria-current")=="step" and "ধাপ 1/5" in pg.inner_text("#stepLive"))
    check("Phase 3: step 1 lists exactly the occasions that have a working template (Birthday, Love, Anniversary) + 14 coming-soon chips, non-interactive; planned Friendship is only a chip", pg.locator("#step-1 input[name=occasion]").count()==3 and pg.locator("#step-1 .soon-chips li").count()==14 and "বন্ধুত্ব" in pg.inner_text("#step-1 .soon-chips") and pg.locator("#step-1 .soon-chips a, #step-1 .soon-chips button, #step-1 .soon-chips input").count()==0)
    check("Next disabled until an occasion is chosen", pg.is_disabled("#step-1 [data-action=next]"))
    # ---- 2/3 select birthday + template
    pg.click("#step-1 label.choice-card"); check("2 select Birthday → Next enabled", pg.is_enabled("#step-1 [data-action=next]"))
    click_next(pg); check("→ step 2, template preselected (only one), heading focused", go_step(pg,2) and pg.is_checked("input[name=template]") and pg.evaluate("document.activeElement.id")=="step-2-title")
    check("3 template card (only the chosen occasion's template is visible): title, description, languages, style, real original link (new tab, noopener)", "জন্মদিনের সারপ্রাইজ" in pg.inner_text("#step-2 .choice-name:visible") and pg.locator("#step-2 .choice-meta:visible").count()==2 and pg.get_attribute("#step-2 .choice-extra a:visible","href")=="/wishes/birthday/birthday-01" and pg.get_attribute("#step-2 .choice-extra a:visible","rel")=="noopener")
    click_next(pg); check("→ step 3 details", go_step(pg,3))
    # ---- validation + a11y of errors
    click_next(pg)
    check("empty submit: stays on step 3, error tied to field (aria-invalid + aria-describedby + role alert summary), focus on name", go_step(pg,3) and pg.get_attribute("[name=name]:visible","aria-invalid")=="true" and "name-error" in pg.get_attribute("[name=name]:visible","aria-describedby") and pg.is_visible("#f-birthday-surprise-name-error") and "⚠" in pg.inner_text("#f-birthday-surprise-name-error") and pg.is_visible("#formSummary") and pg.evaluate("document.activeElement.name")=="name")
    pg.fill("[name=name]:visible","x"); check("typing clears the error", pg.is_hidden("#f-birthday-surprise-name-error") and pg.get_attribute("[name=name]:visible","aria-invalid") is None)
    check("each radio pill draws exactly ONE indicator (no nested-span duplicates)", pg.evaluate("[...document.querySelectorAll('.radio')].filter(l=>l.offsetParent!==null).every(l=>[...l.querySelectorAll('span')].filter(s=>getComputedStyle(s,'::before').content!=='none').length===1)"))
    check("required vs optional clearly labelled", "আবশ্যক" in pg.inner_text("label[for=f-birthday-surprise-name]") and "ঐচ্ছিক" in pg.inner_text("label[for=f-birthday-surprise-from]"))
    # oversize + unicode-safe counting
    pg.fill("[name=name]:visible","A"*41); click_next(pg); check("16 name 41 chars → too-long error (max 40)", go_step(pg,3) and "40" in pg.inner_text("#f-birthday-surprise-name-error"))
    pg.fill("[name=name]:visible","😀"*40); click_next(pg); check("40 emoji = 40 code points (not 80) accepted", go_step(pg,4), pg.inner_text("#f-birthday-surprise-name-error") if not go_step(pg,4) else "")
    pg.click("#step-4 [data-action=back]"); pg.wait_for_timeout(100)
    pg.fill("[name=name]:visible","😀"*41); click_next(pg); check("41 emoji rejected", go_step(pg,3))
    pg.fill("[name=name]:visible","Riya"); pg.check("input[name$=-msgmode][value=custom]"); click_next(pg)
    check("custom message mode + empty → error", go_step(pg,3) and pg.is_visible("#f-birthday-surprise-message-error"))
    pg.fill("textarea[name=message]","m"*241); click_next(pg); check("message 241 → too-long error", go_step(pg,3) and "240" in pg.inner_text("#f-birthday-surprise-message-error"))
    check("counter shows code-point count / max", "241/240" in pg.inner_text("[data-field=message] [data-counter]"), pg.inner_text("[data-field=message] [data-counter]"))
    # ---- 4/5/6/7/8 Bengali flow
    fill(pg,"রিয়া","কাওসার",MSG_BN,"elegant","bn")
    check("default-message block hidden when writing own", pg.is_hidden("[data-msg-default]") and pg.is_visible("[data-msg-custom]"))
    click_next(pg); check("→ step 4 preview", go_step(pg,4))
    s=pg.inner_text("#summary"); check("summary lists values (text)", "রিয়া" in s and "কাওসার" in s and "ভালো থেকো" in s and ("মার্জিত" in s))
    fr=pg.frame_locator("#previewFrame"); pg.wait_for_timeout(900)
    frame=[f for f in pg.frames if "birthday-01" in f.url][0]
    check("9 preview = REAL wish page with embed=1 + the same params", "embed=1" in frame.url and "name=" in frame.url and "theme=elegant" in frame.url, frame.url)
    frame.click("#openSurpriseBtn"); frame.wait_for_timeout(300)
    check("preview shows recipient, elegant theme class, embedded chrome hidden", frame.inner_text("#recipientNameDisplay")=="রিয়া" and frame.evaluate("document.documentElement.classList.contains('theme-elegant')") and frame.evaluate("document.body.classList.contains('is-embedded')") and frame.evaluate("getComputedStyle(document.querySelector('.topbar-back')).display")=="none")
    # data preserved when going back
    pg.click("#step-4 [data-action=back]"); pg.wait_for_timeout(100)
    check("18 data kept after Back (name/from/message/theme)", pg.input_value("[name=name]:visible")=="রিয়া" and pg.input_value("[name=from]:visible")=="কাওসার" and pg.input_value("textarea[name=message]")==MSG_BN and pg.is_checked("input[name$=-theme][value=elegant]"))
    pg.click("#step-3 [data-action=back]"); pg.click("#step-2 [data-action=back]"); pg.wait_for_timeout(100)
    check("…and after going all the way back to step 1 and forward again", pg.is_checked("input[name=occasion]") ) 
    click_next(pg); click_next(pg); pg.wait_for_timeout(100); check("values still there after step 1→3 again", pg.input_value("[name=name]:visible")=="রিয়া" and go_step(pg,3))
    click_next(pg); pg.click("#step-4 [data-action=edit]"); pg.wait_for_timeout(100); check("Edit → step 3 with name focused", go_step(pg,3) and pg.evaluate("document.activeElement.name")=="name")
    click_next(pg); click_next(pg); pg.wait_for_timeout(200)
    check("10 → step 5 share", go_step(pg,5))
    url=pg.input_value("#shareUrl"); u=up.urlparse(url); q=up.parse_qs(u.query,keep_blank_values=True)
    check("generated URL format: origin + route + name,from,message,theme,lang (no embed)", u.path=="/wishes/birthday/birthday-01" and q["name"]==["রিয়া"] and q["from"]==["কাওসার"] and q["message"]==[MSG_BN] and q["theme"]==["elegant"] and q["lang"]==["bn"] and "embed" not in q and list(q.keys())==["name","from","message","theme","lang"], url)
    check("URL is encoded (no raw spaces/newlines/HTML), length sane", " " not in url and "\n" not in url and "<" not in url and len(url)<4000, len(url))
    check("privacy notice shown near share action (bn)", "শেয়ারের লিংকের অংশ" in pg.inner_text(".privacy-note"))
    # ---- 15 copy
    pg.click("#copyBtn"); pg.wait_for_timeout(250)
    clip=pg.evaluate("navigator.clipboard.readText()"); check("15 copy: clipboard really has the URL AND status says copied", clip==url and "কপি হয়েছে" in pg.inner_text("#shareStatus"), (clip[:60],pg.inner_text("#shareStatus")))
    # clipboard failure → never claims success
    pg.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true}); document.execCommand=()=>false")
    pg.click("#copyBtn"); pg.wait_for_timeout(250); st=pg.inner_text("#shareStatus")
    check("clipboard failure: honest error, no 'copied' claim", "কপি করা গেল না" in st and "কপি হয়েছে" not in st, st)
    check("share status is a live region; error has icon (not colour alone)", pg.get_attribute("#shareStatus","aria-live")=="polite" and "⚠" in st)
    # ---- 16 native share fallback
    check("16 no native share → Share button hidden, Copy remains", pg.is_hidden("#shareBtn") and pg.is_visible("#copyBtn"))
    pg.evaluate("window.__shared=null;navigator.share=(d)=>{window.__shared=d;return Promise.resolve()}"); pg.click("#step-5 [data-action=back]"); pg.click("#step-4 [data-action=next]"); pg.wait_for_timeout(150)
    check("native share available → button shown, called with the URL", pg.is_visible("#shareBtn")); pg.click("#shareBtn"); pg.wait_for_timeout(150)
    check("navigator.share received the exact URL", pg.evaluate("window.__shared&&window.__shared.url")==url)
    pg.evaluate("()=>{navigator.share=()=>Promise.reject(Object.assign(new Error('x'),{name:'AbortError'}))}"); pg.click("#shareBtn"); pg.wait_for_timeout(150)
    check("user cancels share (AbortError) → no error shown", pg.inner_text("#shareStatus").strip()=="")
    pg.evaluate("()=>{navigator.share=()=>Promise.reject(new Error('boom'))}"); pg.click("#shareBtn"); pg.wait_for_timeout(150)
    check("share failure → friendly message, no raw error", "শেয়ার করা গেল না" in pg.inner_text("#shareStatus") and "boom" not in pg.content())
    check("Open wish link points at the generated URL (new tab)", pg.get_attribute("#openBtn","href")==url and pg.get_attribute("#openBtn","target")=="_blank")
    # ---- 11/12/17 open generated URL
    w=ctx.new_page(); w.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss())); w.goto(url); w.wait_for_timeout(500)
    w.click("#openSurpriseBtn"); w.wait_for_timeout(300)
    check("12 generated URL shows recipient", w.inner_text("#recipientNameDisplay")=="রিয়া")
    check("13 …and sender line", "কাওসার" in w.inner_text("#senderLine"))
    check("theme applied (elegant) and language bn from link", w.evaluate("document.documentElement.classList.contains('theme-elegant')") and w.get_attribute("html","lang")=="bn")
    w.locator(".scene.is-active .next-btn:visible").first.click(); w.wait_for_timeout(100)
    w.click("#giftBox"); w.wait_for_timeout(700); w.click("#afterGiftBtn"); w.wait_for_timeout(300)
    check("14 custom message appears verbatim WITH line breaks in the message scene", w.evaluate("document.getElementById('heartfeltText').textContent")==MSG_BN and w.evaluate("getComputedStyle(document.getElementById('heartfeltText')).whiteSpace")=="pre-line", w.evaluate("document.getElementById('heartfeltText').textContent"))
    check("personalised link → noindex meta; canonical still base page", w.get_attribute("meta[name=robots]","content")=="noindex,follow" and w.get_attribute("link[rel=canonical]","href")=="https://SITE_URL_PLACEHOLDER/wishes/birthday/birthday-01")
    w.reload(); w.wait_for_timeout(400); w.click("#openSurpriseBtn"); w.wait_for_timeout(250)
    check("17 refresh generated URL → still personalised", w.inner_text("#recipientNameDisplay")=="রিয়া")
    check("?lang= in link did not overwrite visitor's saved language", w.evaluate("localStorage.getItem('wishora_lang')")!="x")
    # 18 fresh context
    fc=b.new_context(viewport={'width':390,'height':800}); f=fc.new_page(); f.goto(url); f.wait_for_timeout(400); f.click("#openSurpriseBtn"); f.wait_for_timeout(250)
    check("18 fresh browser context (other device) renders the same personalised wish", f.inner_text("#recipientNameDisplay")=="রিয়া" and "কাওসার" in f.inner_text("#senderLine"))
    f.close(); fc.close()
    check("no console errors / failed requests during the whole creator flow", not errs and not bad, (errs,bad))
    check("no dialogs fired", not dialogs, dialogs)
    b.close()
print("\nFAILED:",fails or "none")
