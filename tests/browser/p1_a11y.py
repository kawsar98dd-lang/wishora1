from playwright.sync_api import sync_playwright
B="http://127.0.0.1:8803"
fails=[]
def check(n,c,d=""):
    print(("PASS " if c else "FAIL ")+n+(f"  [{d}]" if d and not c else ""))
    if not c: fails.append(n)
CONTRAST="""()=>{const out=[];const parse=s=>{const m=s.match(/[\\d.]+/g);return m?m.map(Number):null};
const bgOf=el=>{while(el){const cs=getComputedStyle(el);if(cs.backgroundImage!=='none'){const g=(cs.backgroundImage.match(/rgb[a]?\\([^)]*\\)/g)||[]).map(parse).filter(c=>c.length<4||c[3]>=0.85);if(g.length)return g; if(cs.backgroundImage.includes('url('))return null; el=el.parentElement;continue}
 const c=parse(cs.backgroundColor);if(c&&(c.length<4||c[3]>0.85))return [c];el=el.parentElement}return [[255,255,255,1]]};
const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const ratio=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const el of document.querySelectorAll('body *')){const own=[...el.childNodes].filter(n=>n.nodeType==3&&n.textContent.trim()).length;if(!own)continue;
 const cs=getComputedStyle(el);if(el.offsetParent===null&&cs.position!=='fixed')continue;if(el.closest('[aria-hidden=true],[hidden],.skip-link:not(:focus)'))continue;
 if(cs.webkitTextFillColor==='rgba(0, 0, 0, 0)')continue;
 const fg=parse(cs.color);const a=fg[3]===undefined?1:fg[3];const bgs=bgOf(el);if(!bgs)continue;
 let worst=99;for(const b of bgs){const bb=b.slice(0,3);const mix=fg.slice(0,3).map((v,i)=>v*a+bb[i]*(1-a));worst=Math.min(worst,ratio(mix,bb))}
 const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700;const large=size>=24||(size>=18.66&&bold);
 if(worst<(large?3:4.5))out.push([ (el.className||el.tagName).toString().slice(0,28),el.textContent.trim().slice(0,24),worst.toFixed(2)])}
return out}"""
TARGETS="""()=>[...document.querySelectorAll('a[href],button,input:not([type=hidden]),[role=slider],summary')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);
 if(!r.width||!r.height||cs.visibility==='hidden'||e.closest('[hidden],[aria-hidden=true]')&&!e.closest('.wish-card,.cat-card'))return false;
 if(e.classList.contains('skip-link'))return false; if(e.tagName==='A'&&e.getAttribute('aria-hidden')==='true')return false;
 const inline=cs.display==='inline'&&e.closest('p,li')&&!e.closest('nav');
 return r.height<43.5&&!inline&&e.tabIndex>=0 }).map(e=>[e.tagName,(e.className||e.id).toString().slice(0,26),Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)])"""
FOCUS="""()=>{const e=document.activeElement;const c=[e,e.closest('.wish-card,.cat-card,.search-field,.lang-toggle')].filter(Boolean);
 return c.some(x=>{const cs=getComputedStyle(x);return (cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none'||(x.matches&&x.closest('.search-field:focus-within'))})}"""
PAGES=["/","/categories/birthday/","/about/","/privacy/","/terms/","/404x"]
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ("bn","en"):
        for vw in (390,1280):
            ctx=b.new_context(viewport={'width':vw,'height':900}); 
            for path in PAGES:
                pg=ctx.new_page(); pg.goto(B+path); pg.evaluate(f"localStorage.setItem('wishora_lang','{lang}')"); pg.reload(); pg.wait_for_timeout(250)
                v=pg.evaluate(CONTRAST); check(f"contrast AA [{lang} {vw}] {path}", not v, v[:5])
                t=pg.evaluate(TARGETS); check(f"targets ≥44px [{lang} {vw}] {path}", not t, t[:5])
                pg.close()
            ctx.close()
    # landmarks + names
    ctx=b.new_context(viewport={'width':390,'height':900})
    for path in PAGES[:-1]:
        pg=ctx.new_page(); pg.goto(B+path); pg.wait_for_timeout(200)
        r=pg.evaluate("""()=>({main:document.querySelectorAll('main').length,header:document.querySelectorAll('body>header').length,footer:document.querySelectorAll('body>footer').length,
          navs:[...document.querySelectorAll('nav')].filter(n=>!n.closest('[aria-hidden=true]')).every(n=>n.getAttribute('aria-label')),
          unnamed:[...document.querySelectorAll('a[href],button')].filter(e=>e.offsetParent!==null&&!e.closest('[aria-hidden=true]')&&!(e.getAttribute('aria-label')||e.innerText.trim())).length,
          imgNoAlt:document.querySelectorAll('img:not([alt])').length, dupIds:(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((x,i)=>ids.indexOf(x)!==i)})(),
          ariaHiddenFocusable:[...document.querySelectorAll('[aria-hidden=true] a[href],[aria-hidden=true] button')].filter(e=>e.tabIndex>=0&&!e.closest('.mobile-menu')&&!e.closest('[hidden]')).length})""")
        check(f"landmarks/names {path}", r['main']==1 and r['header']==1 and r['footer']==1 and r['navs'] and r['unnamed']==0 and r['imgNoAlt']==0 and not r['dupIds'] and r['ariaHiddenFocusable']==0, r)
        pg.close()
    # keyboard focus visibility: tab through every control on home + category
    for path in ("/","/categories/birthday/"):
        pg=ctx.new_page(); pg.goto(B+path); pg.wait_for_timeout(250); bad=[]
        for i in range(40):
            pg.keyboard.press("Tab")
            if pg.evaluate("document.activeElement===document.body"): break
            if not pg.evaluate(FOCUS): bad.append(pg.evaluate("(document.activeElement.className||document.activeElement.id||document.activeElement.tagName).toString()"))
        check(f"keyboard focus indicator visible on every tab stop {path}", not bad, bad[:5])
        pg.close()
    # mobile menu keyboard: opens, links reachable, Esc closes & returns focus
    pg=ctx.new_page(); pg.goto(B+"/"); pg.click("#menuToggle"); pg.wait_for_timeout(350)
    check("menu open: links visible & focusable", pg.locator("#mobileMenu a:visible").count()==6 and pg.get_attribute("#mobileMenu","aria-hidden")=="false")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
    check("Esc closes menu and restores focus", pg.get_attribute("#menuToggle","aria-expanded")=="false" and pg.evaluate("document.activeElement.id")=="menuToggle")
    check("closed menu links are not keyboard reachable", pg.evaluate("[...document.querySelectorAll('#mobileMenu a')].every(a=>getComputedStyle(a).visibility==='hidden'||a.offsetParent===null)"))
    b.close()
print("\nFAILED:",fails or "none")
