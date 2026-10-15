"""Phase 4 — Friendship Postcard smoke/security/responsive suite.
Run node scripts/serve.mjs 8803, then python tests/browser/p4_friendship.py.
"""
from playwright.sync_api import sync_playwright
import os, re, urllib.request
B=os.environ.get("WISHORA_BASE","http://127.0.0.1:8803"); fails=[]
def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ")+name+(f" [{detail}]" if detail and not ok else ""))
    if not ok: fails.append(name)
XSS='<img src=x onerror=alert(1)><svg onload=alert(1)>'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":390,"height":844}); pg=ctx.new_page(); pg.set_default_timeout(8000); errs=[]; dialogs=[]
    pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("dialog",lambda d:(dialogs.append(d.message),d.dismiss()))
    pg.goto(B+"/wishes/friendship/friendship-01"); pg.wait_for_timeout(300)
    check("page loads with one active scene",pg.locator(".scene.is-active").count()==1)
    check("template theme defaults to sunny",pg.evaluate("document.documentElement.classList.contains('theme-sunny')"))
    pg.click("#openCard"); check("open postcard advances to moments",pg.locator(".scene-moments.is-active").count()==1)
    check("continue is disabled until all 3 moments are opened",not pg.locator("#toNote").is_enabled())
    for n in (1,2,3): pg.click(f'[data-moment="{n}"]')
    check("all moments enable continuation",pg.locator("#toNote").is_enabled() and pg.locator('[data-moment="1"]').get_attribute("aria-pressed")=="true")
    pg.click("#toNote"); check("personalised note scene opens",pg.locator(".scene-note.is-active").count()==1 and bool(pg.locator("[data-bind=message]").inner_text()))
    pg.click("#toFinal"); pg.click("#highFiveBtn")
    check("high-five action gives a live response",pg.locator("#finalLine").inner_text()!="হাই-ফাইভ দিতে ট্যাপ করুন।")
    pg.click("#replayBtn"); check("replay resets moments and scene",pg.locator(".scene-welcome.is-active").count()==1 and not pg.locator("#toNote").is_enabled())
    pg.goto(B+"/wishes/friendship/friendship-01?name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&message="+__import__('urllib.parse').parse.quote(XSS)+"&theme=not-real&lang=xx"); pg.wait_for_timeout(250)
    check("hostile parameters render as text and do not inject elements",pg.locator("img,svg[onload]").count()==0 and not dialogs and pg.get_attribute("meta[name=robots]","content")=="noindex,follow")
    check("invalid theme/language safely fall back",pg.evaluate("document.documentElement.classList.contains('theme-sunny')") and pg.get_attribute("html","lang") in ("bn","en"))
    for w in (320,375,390,414,768,1280):
        pg.set_viewport_size({"width":w,"height":850}); pg.wait_for_timeout(80)
        check(f"no horizontal overflow at {w}px",pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    pg.goto(B+"/create/?category=friendship&template=friendship-moments"); pg.wait_for_timeout(250)
    check("Creator deep link selects live Friendship template",pg.locator("input[name=template][value=friendship-moments]").count()==1)
    sm=urllib.request.urlopen(B+"/sitemap.xml").read().decode()
    check("sitemap includes Friendship page and category",all(x in sm for x in ("/wishes/friendship/friendship-01","/categories/friendship/")))
    check("no uncaught page errors or dialogs",not errs and not dialogs,str(errs))
    b.close()
print("\nFAILED:",fails if fails else "none")
raise SystemExit(1 if fails else 0)
