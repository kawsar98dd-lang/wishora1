from playwright.sync_api import sync_playwright
import urllib.parse as up, json, re
B="http://127.0.0.1:8803"
fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
def font(u): return "fonts.g" in u
def vis_bn(pg): return pg.evaluate("[...document.querySelectorAll('[data-l=bn]')].filter(e=>e.offsetParent!==null).length")
def vis_en(pg): return pg.evaluate("[...document.querySelectorAll('[data-l=en]')].filter(e=>e.offsetParent!==null).length")
PAGES=["/","/categories/birthday/","/about/","/privacy/","/terms/","/wishes/birthday/birthday-01"]
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- A. console + network on every page, desktop & mobile
    for vw,name in [(1280,"desktop"),(390,"mobile")]:
        ctx=b.new_context(viewport={'width':vw,'height':850})
        for path in PAGES:
            pg=ctx.new_page(); errs=[]; bad=[]
            pg.on("console",lambda m,errs=errs: errs.append(m.text+" @"+m.location.get("url","")) if m.type=="error" and not font(m.location.get("url","")) else None)
            pg.on("pageerror",lambda e,errs=errs: errs.append("PAGEERROR "+str(e)))
            pg.on("response",lambda r,bad=bad: bad.append((r.status,r.url)) if r.status>=400 and not font(r.url) else None)
            r=pg.goto(B+path); pg.wait_for_timeout(350)
            check(f"{name} {path}: HTTP 200, no console errors, no 4xx assets", r.status==200 and not errs and not bad, (r.status,errs,bad))
            pg.close()
        ctx.close()
    # ---------- B. horizontal overflow at 6 widths
    for vw in (320,375,390,414,768,1280):
        ctx=b.new_context(viewport={'width':vw,'height':800}); 
        for path in PAGES+["/zz"]:
            pg=ctx.new_page(); pg.goto(B+path); pg.wait_for_timeout(300)
            if path.endswith("birthday-01"): pg.click("#openSurpriseBtn"); pg.wait_for_timeout(300)
            res=pg.evaluate("""()=>{const vw=document.documentElement.clientWidth;const doc=document.documentElement.scrollWidth;
              const off=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width)return false;const cs=getComputedStyle(e);if(cs.position==='fixed')return false;
                if(e.closest('[aria-hidden=true]')||e.closest('.hero-visual')||e.closest('.bg-layer')||e.closest('.skip-link')||e.closest('.mobile-menu')||e.closest('.hero-glow')||e.closest('.confetti-layer')||e.closest('.balloons')||e.closest('.bg-stars'))return false;
                return r.right>vw+1||r.left<-1}).slice(0,4).map(e=>(e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().right));return {vw,doc,off}}""")
            check(f"overflow {vw}px {path}", res['doc']<=res['vw'] and not res['off'], res)
            pg.close()
        ctx.close()
    b.close()
print("\nFAILED:",fails or "none")
