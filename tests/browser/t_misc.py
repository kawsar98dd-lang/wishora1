from playwright.sync_api import sync_playwright
import os, tempfile
SHOTS=os.environ.get("WISHORA_SHOTS") or os.path.join(tempfile.gettempdir(),"wishora-shots"); os.makedirs(SHOTS,exist_ok=True)
fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f" [{d}]" if d and not c else "")); 
    if not c: fails.append(n)
def lum(c):
    f=lambda v:v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    r,g,b=[f(x/255) for x in c[:3]]; return .2126*r+.7152*g+.0722*b
JS_CONTRAST="""()=>{const out=[];const parse=s=>{const m=s.match(/[\\d.]+/g);return m?m.map(Number):null};
const bg=el=>{while(el){if(getComputedStyle(el).backgroundImage!=='none')return null;const c=parse(getComputedStyle(el).backgroundColor);if(c&&(c.length<4||c[3]>0.85))return c;el=el.parentElement}return [255,255,255,1]};
const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
for(const el of document.querySelectorAll('body *')){if(!el.childNodes.length)continue;
 const t=[...el.childNodes].filter(n=>n.nodeType==3&&n.textContent.trim()).length;if(!t)continue;
 const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||el.offsetParent===null&&cs.position!=='fixed')continue;
 if(el.closest('[aria-hidden=true]'))continue;if(cs.webkitTextFillColor==='rgba(0, 0, 0, 0)'||cs.color==='rgba(0, 0, 0, 0)')continue; // gradient text (large)
 const fg=parse(cs.color);let b=bg(el);if(!b)continue;const a=fg[3]===undefined?1:fg[3];
 const mix=fg.slice(0,3).map((v,i)=>v*a+b[i]*(1-a));const l1=L(mix),l2=L(b);const r=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
 const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;const large=size>=24||(size>=18.66&&bold);
 if(r<(large?3:4.5))out.push([el.className||el.tagName,el.textContent.trim().slice(0,30),r.toFixed(2),cs.color,'on',b.join(',')])}
return out}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    # --- music with a real file (temp copy only)
    # Needs a SECOND server on :8804 serving a temp copy of the project that contains a test mp3
    # (the repository intentionally ships no audio). When it is not available the section is
    # reported as SKIP — never as PASS.
    import socket
    try: socket.create_connection(("127.0.0.1",8804),timeout=1).close(); music_ok=True
    except OSError: music_ok=False
    if not music_ok:
        print("SKIP music tests (no server on :8804 with a test mp3) — NOT verified in this run")
    else:
        ctx=b.new_context(viewport={'width':390,'height':800}); pg=ctx.new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)))
        pg.goto("http://127.0.0.1:8804/wishes/birthday/birthday-01"); pg.wait_for_timeout(300)
        pg.click("#openSurpriseBtn"); pg.wait_for_timeout(300)
        autoplay=pg.evaluate("!document.getElementById('birthdayAudio').paused")
        print("INFO autostart on 'open surprise' with real mp3:",autoplay)
        pg.locator(".scene.is-active .next-btn:visible").first.click(); pg.wait_for_timeout(100)
        pg.click("#giftBox"); pg.wait_for_timeout(300)
        for _ in range(3): pg.locator(".scene.is-active .next-btn:visible").first.click(); pg.wait_for_timeout(150)
        pg.click("#candleBtn"); pg.wait_for_timeout(200); pg.locator(".scene.is-active .next-btn:visible").first.click(); pg.wait_for_timeout(200)
        check("music scene reached", pg.eval_on_selector(".scene.is-active","e=>e.dataset.step")=="7")
        pg.click("#musicPlayBtn"); pg.wait_for_timeout(1500)
        check("real mp3: plays", pg.evaluate("!document.getElementById('birthdayAudio').paused"))
        check("real mp3: duration shown", pg.inner_text("#musicDuration")=="0:12", pg.inner_text("#musicDuration"))
        check("play label → pause (bn)", pg.get_attribute("#musicPlayBtn","aria-label")=="মিউজিক থামান", pg.get_attribute("#musicPlayBtn","aria-label"))
        pg.focus("#musicProgressTrack"); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(200)
        t=pg.evaluate("document.getElementById('birthdayAudio').currentTime"); check("seek slider ArrowRight jumps ~5s", t>=5, t)
        check("slider aria-valuenow updates", int(pg.get_attribute("#musicProgressTrack","aria-valuenow"))>=30, pg.get_attribute("#musicProgressTrack","aria-valuenow"))
        pg.click("#musicMuteBtn"); check("mute works + label", pg.evaluate("document.getElementById('birthdayAudio').muted") and pg.get_attribute("#musicMuteBtn","aria-label")=="আনমিউট করুন")
        pg.click("#musicPlayBtn"); check("pause works", pg.evaluate("document.getElementById('birthdayAudio').paused"))
        check("no page errors", not errs, errs)
    # --- 404
    c2=b.new_context(viewport={'width':390,'height':800}); p2=c2.new_page(); bad=[]
    p2.on("response",lambda r: bad.append((r.status,r.url)) if r.status>=400 and "fonts.g" not in r.url else None)
    r=p2.goto("http://127.0.0.1:8803/some/deep/missing/path"); p2.wait_for_timeout(400)
    check("404: HTTP status 404", r.status==404, r.status)
    check("404: stylesheet loaded at depth (root-absolute paths)", p2.evaluate("getComputedStyle(document.querySelector('.error-card')).borderTopLeftRadius")!="0px")
    check("404: only the 404 doc itself failed", [x for x in bad if x[1].split('8803')[1]!='/some/deep/missing/path']==[], bad)
    hrefs=p2.eval_on_selector_all("main a","e=>e.map(a=>a.getAttribute('href'))"); check("404: CTAs → /#discover, /, birthday", hrefs==["/#explore","/","/wishes/birthday/birthday-01.html"], hrefs)
    check("404: noindex", p2.get_attribute("meta[name=robots]","content")=="noindex")
    p2.screenshot(path=SHOTS+"/404_mobile.png")
    c3=b.new_context(viewport={'width':1280,'height':800},java_script_enabled=False); p3=c3.new_page(); p3.goto("http://127.0.0.1:8803/x/y"); p3.wait_for_timeout(300)
    check("404 without JS: renders & CTA visible", p3.locator(".error-actions a").first.is_visible())
    p3.screenshot(path=SHOTS+"/404_desktop_nojs.png")
    p3.goto("http://127.0.0.1:8803/"); p3.wait_for_timeout(300)
    check("homepage without JS: static links to all 3 implemented wishes", p3.eval_on_selector_all("a.wish-link","e=>e.map(a=>a.getAttribute('href'))")==["/wishes/birthday/birthday-01","/wishes/love/love-01","/wishes/anniversary/anniversary-01"])
    p3.goto("http://127.0.0.1:8803/wishes/birthday/birthday-01"); check("birthday no-JS: notice shown", "JavaScript" in p3.inner_text(".noscript-note"))
    # --- contrast + touch targets
    for label,url,vw in [("home","/",1280),("home-m","/",390),("birthday","/wishes/birthday/birthday-01",390),("404","/zz",390)]:
        cx=b.new_context(viewport={'width':vw,'height':900}); q=cx.new_page(); q.goto("http://127.0.0.1:8803"+url); q.wait_for_timeout(400)
        if label=="birthday":
            q.click("#openSurpriseBtn")
        v=q.evaluate(JS_CONTRAST); check(f"contrast AA ({label}, visible text)", not v, v[:6])
        small=q.evaluate("""()=>[...document.querySelectorAll('a[href],button,input:not([type=hidden]),[role=slider]')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&e.getAttribute('aria-hidden')!=='true'&&e.tabIndex>=0&&!e.classList.contains('skip-link')&&(r.height<44-0.5)&&!(e.tagName==='A'&&getComputedStyle(e).display==='inline'&&e.closest('p,li')&&false)}).map(e=>[e.tagName,(e.className||e.id||'').toString().slice(0,30),Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)])""")
        print("INFO targets <44px high ("+label+"):",small[:8])
    b.close()
print("\nFAILED:",fails or "none")
