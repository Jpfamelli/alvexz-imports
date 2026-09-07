// v3: refinamento visual (tipografia condensada, botões com varredura e efeito
// magnético, transições de rota, reveal dos cards, header que se esconde ao
// rolar, faixa de departamentos, marquee de marcas, foto na história, rodapé
// com wordmark gigante) + preparo para GitHub Pages (BASE automático).
// Uso: node ferramentas/patch-v3.mjs  (idempotente; backup em alvexz-store.v2.html)
import fs from 'node:fs';
const ARQ=new URL('../index.html',import.meta.url);
let src=fs.readFileSync(ARQ,'utf8');
if(src.includes('/* v3: refinamento */')){console.log('já aplicado');process.exit(0)}
fs.writeFileSync(new URL('../alvexz-store.v2.html',import.meta.url),src);
const feitos=[];
function rep(nome,a,b){
  const n=src.split(a).length-1;
  if(n===0) throw new Error('âncora não encontrada ['+nome+']: '+a.slice(0,90));
  if(n>1) throw new Error('âncora ambígua ['+nome+'] ('+n+'x): '+a.slice(0,90));
  src=src.replace(a,()=>b); feitos.push(nome);
}

/* ===================== FONTES ===================== */
rep('fontes',
`family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&`,
`family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&`);

/* ===================== CSS: base ===================== */
rep('css-base',
`*,*::before,*::after{box-sizing:border-box}`,
`/* v3: refinamento */
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:#0A0A0C}
::-webkit-scrollbar-thumb{background:#2A2A32;border-radius:99px;border:2px solid #0A0A0C}
::-webkit-scrollbar-thumb:hover{background:#3A3A44}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes kb{from{transform:scale(1.08)}to{transform:scale(1)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
#main.enter{animation:enter .42s var(--ease) both}
@media (prefers-reduced-motion:reduce){#main.enter{animation:none}}`);

/* logo: ALVEXZ condensado + "imports" em serifa itálica */
rep('logo-lockup',
`.logo-mark .u i{
  font-style:normal;color:var(--texto-3);font-weight:500;
  font-size:.68em;letter-spacing:.02em;margin-left:5px
}`,
`.logo-mark .u{font-stretch:85%}
.logo-mark .u i{
  font-family:var(--f-serif);font-style:italic;color:var(--texto-2);font-weight:400;
  font-size:.92em;letter-spacing:-.01em;margin-left:6px;text-transform:lowercase
}`);

/* header some ao rolar para baixo, volta ao subir */
rep('header-hide',
`.header.scrolled{box-shadow:var(--sh-2)}`,
`.header.scrolled{box-shadow:0 10px 30px -18px rgba(0,0,0,.9)}
.header{transition:transform .38s var(--ease)}
.header.hide{transform:translateY(-100%)}
.hnav a::after{content:"";position:absolute;left:14px;right:14px;bottom:6px;height:1.5px;background:currentColor;
  transform:scaleX(0);transform-origin:left;transition:transform .28s var(--ease)}
.hnav a:hover::after{transform:scaleX(1)}`);
rep('hnav-hover',`  .hnav a:hover{background:var(--nevoa);color:var(--ultramar)}`,`  .hnav a:hover{color:#fff}`);
rep('search-pill',`  width:100%;height:50px;border:1.5px solid var(--linha);background:var(--nevoa);
  border-radius:var(--r-lg);padding:0 48px 0 46px;font-size:15px;`,
`  width:100%;height:50px;border:1.5px solid var(--linha);background:var(--nevoa);
  border-radius:999px;padding:0 48px 0 46px;font-size:15px;`);
rep('search-pill-desk',`  .searchbox input{height:44px;border-radius:var(--r)}`,`  .searchbox input{height:44px;border-radius:999px}`);
rep('sgo-desk',`  .sgo{width:34px;height:34px;top:5px;border-radius:8px}`,`  .sgo{width:34px;height:34px;top:5px;border-radius:999px}`);

/* botões: varredura no hover, elevação, estado ativo */
rep('btn-v3',
`.btn:active{transform:scale(.975)}
.btn-primary{background:var(--ultramar);color:var(--inverso);box-shadow:var(--sh-blue)}
.btn-primary:hover{background:var(--ultramar-deep)}`,
`.btn{position:relative;overflow:hidden;isolation:isolate;transition:transform .2s var(--ease),background .2s var(--ease),box-shadow .25s var(--ease),border-color .2s,color .2s;will-change:transform}
.btn::after{content:"";position:absolute;inset:0;z-index:-1;background:rgba(255,255,255,.14);
  transform:translateX(-102%) skewX(-12deg);transition:transform .5s var(--ease)}
.btn:hover::after{transform:translateX(0) skewX(-12deg)}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:scale(.97)}
.btn-primary{background:var(--ultramar);color:var(--inverso);box-shadow:0 8px 24px -10px rgba(255,255,255,.35)}
.btn-primary::after{background:rgba(0,0,0,.08)}
.btn-primary:hover{background:#fff;box-shadow:0 14px 34px -12px rgba(255,255,255,.5)}`);

/* cabeçalho de seção com régua */
rep('section-h-rule',
`.section-h{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:16px;padding:0 14px;max-width:var(--max);margin-left:auto;margin-right:auto}`,
`.section-h{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:18px;padding:0 14px 14px;max-width:var(--max);margin-left:auto;margin-right:auto;position:relative}
.section-h::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:1px;background:var(--linha)}
@media(min-width:768px){.section-h::after{left:22px;right:22px}}`);
rep('section-h2-stretch',
`.section-h h2{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:clamp(36px,8.4vw,56px);letter-spacing:-.05em;text-transform:uppercase;margin:0;line-height:.88}`,
`.section-h h2{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-stretch:82%;font-size:clamp(38px,9vw,60px);letter-spacing:-.04em;text-transform:uppercase;margin:0;line-height:.86}`);

/* hero: entrada em cascata, foto com zoom lento e paralaxe */
rep('hero-h1-stretch',
`.hero-txt h1{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:clamp(50px,11.5vw,124px);
  letter-spacing:-.05em;line-height:.84;text-transform:uppercase;margin:0 0 16px;text-wrap:balance}`,
`.hero-txt h1{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-stretch:78%;font-size:clamp(58px,13vw,150px);
  letter-spacing:-.04em;line-height:.82;text-transform:uppercase;margin:0 0 16px;text-wrap:balance}
@media (prefers-reduced-motion:no-preference){
  .hero-txt > *{animation:rise .8s var(--ease) both}
  .hero-txt > :nth-child(1){animation-delay:.05s}.hero-txt > :nth-child(2){animation-delay:.15s}
  .hero-txt > :nth-child(3){animation-delay:.28s}.hero-txt > :nth-child(4){animation-delay:.38s}.hero-txt > :nth-child(5){animation-delay:.5s}
  .hero-slide .bg{animation:kb 2.2s var(--ease) both}
}
.hero-slide .bg{will-change:transform;transition:transform .6s var(--ease)}
.hero-slide .foto-wrap{position:absolute;inset:0;overflow:hidden}`);

/* faixa de departamentos (índice tipográfico) */
rep('deps-css',
`/* ================= CATEGORIAS ================= */`,
`/* ================= DEPARTAMENTOS (índice) ================= */
.deps{max-width:var(--max);margin:28px auto 6px;padding:0 14px;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--linha)}
.deps a{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:16px 4px;border-bottom:1px solid var(--linha);
  font-family:var(--f-display);font-weight:700;font-stretch:85%;font-size:22px;letter-spacing:-.03em;text-transform:uppercase;position:relative;overflow:hidden;transition:color .2s}
.deps a::before{content:"";position:absolute;left:0;bottom:0;height:1px;width:100%;background:#fff;transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.deps a:hover::before{transform:scaleX(1)}
.deps a:hover{color:#fff}
.deps .deps-c{font-size:11px;color:var(--texto-3);letter-spacing:.14em}
@media(min-width:768px){.deps{grid-template-columns:repeat(3,1fr);padding:0 22px;column-gap:26px}.deps a{font-size:26px;padding:20px 4px}}
@media(min-width:1024px){.deps{grid-template-columns:repeat(6,1fr);column-gap:22px}.deps a{font-size:24px}}

/* marquee de marcas (tipográfico) */
.marq{overflow:hidden;border-top:1px solid var(--linha);border-bottom:1px solid var(--linha);padding:22px 0;margin-top:40px;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.marq-track{display:flex;gap:0;white-space:nowrap;width:max-content;animation:marquee 34s linear infinite}
.marq:hover .marq-track{animation-play-state:paused}
.marq-track span{font-family:var(--f-display);font-weight:800;font-stretch:80%;font-size:clamp(34px,6vw,64px);letter-spacing:-.04em;text-transform:uppercase;color:var(--texto);padding:0 22px;line-height:1}
.marq-track span:nth-child(even){font-family:var(--f-serif);font-style:italic;font-weight:400;font-stretch:100%;text-transform:none;letter-spacing:-.01em;color:var(--texto-2)}
@media (prefers-reduced-motion:reduce){.marq-track{animation:none}}

/* ================= CATEGORIAS ================= */`);

/* cards: reveal ao rolar + hover mais vivo */
rep('card-v3',
`.card:hover{box-shadow:0 28px 54px -26px rgba(0,0,0,.95);border-color:rgba(255,255,255,.16);transform:translateY(-4px)}`,
`.card:hover{box-shadow:0 28px 54px -26px rgba(0,0,0,.95);border-color:rgba(255,255,255,.16);transform:translateY(-5px)}
body.rv-on .card{transition:opacity .6s var(--ease),transform .5s var(--ease),box-shadow .28s var(--ease),border-color .28s var(--ease)}
body.rv-on .card:not(.in){opacity:0;transform:translateY(18px)}
body.rv-on .rv{transition:opacity .7s var(--ease),transform .7s var(--ease)}
body.rv-on .rv:not(.in){opacity:0;transform:translateY(20px)}`);
rep('card-img-zoom',`.card:hover .card-img img{transform:scale(1.04)}`,`.card:hover .card-img img{transform:scale(1.07)}`);
rep('card-cta-hover',`.card-cta{margin-top:9px;height:36px;font-size:12.5px}`,`.card-cta{margin-top:9px;height:36px;font-size:12.5px}
.card .btn-primary{box-shadow:none}`);

/* PDP */
rep('pdp-h1-stretch',
`.pdp h1{font-family:var(--f-display);font-weight:700;font-variation-settings:"opsz" 96;font-size:30px;letter-spacing:-.035em;line-height:1.02;margin:6px 0 8px;text-transform:none}`,
`.pdp h1{font-family:var(--f-display);font-weight:700;font-variation-settings:"opsz" 96;font-stretch:88%;font-size:34px;letter-spacing:-.035em;line-height:1;margin:6px 0 8px;text-transform:none}`);
rep('gal-round',`.gal{position:relative;background:var(--nevoa)}`,`.gal{position:relative;background:var(--nevoa);border-radius:var(--r-lg);overflow:hidden}`);
rep('gal-thumbs-round',`.gal-thumbs button{flex:none;width:58px;height:70px;border-radius:8px;overflow:hidden;border:2px solid transparent;background:var(--papel)}`,
`.gal-thumbs button{flex:none;width:58px;height:70px;border-radius:10px;overflow:hidden;border:2px solid transparent;background:var(--papel);transition:transform .2s var(--ease),border-color .2s}
.gal-thumbs button:hover{transform:translateY(-2px)}`);
rep('price-block-glass',`.price-block{margin:14px 0;padding:14px;background:var(--nevoa);border-radius:var(--r-lg);border:1px solid var(--linha)}`,
`.price-block{margin:14px 0;padding:16px;background:linear-gradient(135deg,#141418,#0F0F13);border-radius:var(--r-lg);border:1px solid var(--linha)}`);
rep('size-hover',`.size:hover:not(:disabled){border-color:var(--tinta)}`,`.size:hover:not(:disabled){border-color:var(--tinta);transform:translateY(-2px)}`);

/* história com foto, insta em marquee, rodapé com wordmark gigante */
rep('story-foto-css',
`.story-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}`,
`.story-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.story-foto{max-width:var(--max);margin:44px auto 0;padding:0 14px}
.story-foto img{width:100%;aspect-ratio:16/7;object-fit:cover;object-position:center 35%;border-radius:var(--r-xl);
  filter:grayscale(.35) contrast(1.05);transition:filter .7s var(--ease),transform .9s var(--ease)}
.story-foto:hover img{filter:none;transform:scale(1.01)}
@media(min-width:768px){.story-foto{padding:0 22px}}
.insta-marq{overflow:hidden;margin:0 0 20px}
.insta-marq .t{display:flex;white-space:nowrap;width:max-content;animation:marquee 26s linear infinite}
.insta-marq span{font-family:var(--f-display);font-weight:800;font-stretch:78%;font-size:clamp(46px,10vw,120px);letter-spacing:-.05em;line-height:1;padding:0 26px;color:var(--texto);opacity:.92}
.insta-marq span:nth-child(even){-webkit-text-stroke:1.5px rgba(255,255,255,.55);color:transparent;opacity:1}
@media (prefers-reduced-motion:reduce){.insta-marq .t{animation:none}}
.foot-giant{font-family:var(--f-display);font-weight:800;font-stretch:76%;font-size:clamp(84px,22vw,330px);line-height:.78;letter-spacing:-.05em;
  text-transform:uppercase;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.14);text-align:center;user-select:none;
  padding:30px 0 0;margin:20px 0 -10px;overflow:hidden;white-space:nowrap}`);
rep('insta-h-hide',`.insta-h{display:block;font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;letter-spacing:-.05em;`,
`.insta-h{display:inline-block;font-family:var(--f-serif);font-style:italic;font-weight:400;letter-spacing:-.01em;`);
rep('insta-h-size',`  font-size:clamp(27px,7.2vw,58px);color:var(--texto);line-height:1;margin-bottom:22px;`,`  font-size:clamp(22px,4vw,34px);color:var(--texto);line-height:1;margin-bottom:22px;text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1px;`);

/* drawer e modal com mola */
rep('drawer-spring',`  z-index:100;transform:translateX(-100%);transition:transform .34s var(--ease);`,`  z-index:100;transform:translateX(-100%);transition:transform .5s cubic-bezier(.22,1,.36,1);`);
rep('cart-spring',`  transform:translateX(100%);transition:transform .34s var(--ease);display:flex;flex-direction:column;box-shadow:var(--sh-3)`,
`  transform:translateX(100%);transition:transform .5s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.5)`);
rep('modal-spring',`  animation:up .3s var(--ease);position:relative`,`  animation:up .45s cubic-bezier(.22,1,.36,1);position:relative`);

/* ===================== HTML / JS ===================== */
/* departamentos + marquee + foto na história + insta marquee */
rep('home-deps',
`  \${destaques.length?sectionHTML('','Destaques','#/produtos',destaques.map(cardHTML).join('')):''}`,
`  <nav class="deps" aria-label="Departamentos">\${CATS.filter(c=>c.ativo!==false).map(c=>{
    const n=CATALOG.filter(p=>p.ativo&&p.cat===c.id).length;
    return \`<a href="#/c/\${esc(c.id)}"><span class="deps-n">\${esc(c.nome)}</span><span class="deps-c mono">\${String(n).padStart(2,'0')}</span></a>\`}).join('')}</nav>

  \${destaques.length?sectionHTML('','Destaques','#/produtos',destaques.map(cardHTML).join('')):''}`);
rep('home-marq',
`  <!-- HISTÓRIA -->
  <section class="story">`,
`  <div class="marq" aria-hidden="true"><div class="marq-track">\${(()=>{const l=BRANDS.flatMap(b=>[b,'original']);return (l.concat(l)).map(x=>\`<span>\${esc(x)}</span>\`).join('')})()}</div></div>

  <!-- HISTÓRIA -->
  <section class="story">`);
rep('home-story-foto',
`          <a class="btn btn-ghost btn-lg" href="#/pagina/sobre">Como trabalhamos</a>
        </div>
      </div>
    </div>
  </section>`,
`          <a class="btn btn-ghost btn-lg" href="#/pagina/sobre">Como trabalhamos</a>
        </div>
      </div>
    </div>
    <div class="story-foto rv"><img src="\${esc(heroFoto().replace('conjunto-nike-fundo-concreto.jpg','conjunto-nike-fundo-concreto-sem-sombra.jpg'))}" alt="Conjunto Nike conferido na mão, sobre fundo de concreto" loading="lazy" decoding="async"></div>
  </section>`);
rep('home-insta',
`  <section class="insta">
    <p class="insta-k">Os drops aparecem primeiro lá</p>`,
`  <section class="insta">
    <div class="insta-marq" aria-hidden="true"><div class="t">\${Array(6).fill('@alvezx.imports7').map(x=>\`<span>\${x}</span>\`).join('')}</div></div>
    <p class="insta-k">Os drops aparecem primeiro lá</p>`);
rep('story-rv',`  <section class="story">
    <div class="wrap story-in">`,`  <section class="story">
    <div class="wrap story-in rv">`);
rep('foot-giant',
`    <div class="foot-legal">`,
`    <div class="foot-giant" aria-hidden="true">ALVEXZ</div>
    <div class="foot-legal">`);
rep('listagem-count-dup',`  else if(A==='produtos'){ctxGuard('produtos');main.innerHTML=viewListing('Todos os produtos',active.length+(active.length===1?' peça conferida':' peças conferidas'),active)}`,
`  else if(A==='produtos'){ctxGuard('produtos');main.innerHTML=viewListing('Todos os produtos','Cada peça conferida na mão',active)}`);

/* BASE automático no GitHub Pages (project pages ficam em /nome-do-repo/) */
rep('base-pages',
`const BASE = (typeof window.ALVEXZ_BASE === 'string')
  ? window.ALVEXZ_BASE.replace(/\\/+$/,'')
  : '';`,
`const BASE = (typeof window.ALVEXZ_BASE === 'string')
  ? window.ALVEXZ_BASE.replace(/\\/+$/,'')
  : (/\\.github\\.io$/i.test(location.hostname) ? '/'+(location.pathname.split('/')[1]||'') : '');`);

/* transição de rota + header que some + reveal + magnético + paralaxe */
rep('route-enter',
`function route(){
  clearInterval(heroTimer);
  setTimeout(bindBrandLogos,60);
  const {parts,q}=parseHash(), main=$('#main');`,
`let lastRouted='';
function route(){
  clearInterval(heroTimer);
  setTimeout(bindBrandLogos,60);
  const {parts,q}=parseHash(), main=$('#main');
  const pathNow=parts.join('/');
  if(pathNow!==lastRouted){lastRouted=pathNow;main.classList.remove('enter');void main.offsetWidth;main.classList.add('enter')}`);

rep('motion-funcs',
`/* ---------- 32. EVENTOS GLOBAIS ---------- */`,
`/* ---------- 31d. MOVIMENTO: header, reveal, botões magnéticos, paralaxe ---------- */
function initMotion(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=window.matchMedia('(pointer:fine)').matches;
  // header some descendo, volta subindo (nunca some perto do topo)
  let lastY=window.scrollY;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY, h=$('#header');
    if(document.body.classList.contains('no-scroll'))return;
    if(y>lastY+6&&y>260)h.classList.add('hide'); else if(y<lastY-6||y<=260)h.classList.remove('hide');
    lastY=y;
  },{passive:true});
  if(reduce||!('IntersectionObserver' in window))return;
  // reveal: cards e blocos .rv entram quando aparecem
  document.body.classList.add('rv-on');
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(!e.isIntersecting)return;
      const el=e.target, sibs=el.parentElement?[...el.parentElement.children]:[el];
      el.style.transitionDelay=((sibs.indexOf(el)%8)*45)+'ms';
      el.classList.add('in'); io.unobserve(el); });
  },{rootMargin:'0px 0px -6% 0px',threshold:.08});
  const observe=root=>(root||document).querySelectorAll('.card:not(.in),.rv:not(.in)').forEach(el=>io.observe(el));
  observe(document);
  new MutationObserver(()=>observe(document)).observe($('#main'),{childList:true,subtree:true});
  if(!fine)return;
  // botões magnéticos (hero e compra) + paralaxe da foto do hero
  document.addEventListener('pointermove',e=>{
    const hero=$('#hero');
    if(hero){const r=hero.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){const px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        $$('#hero .bg').forEach(img=>{img.style.transform=\`scale(1.04) translate(\${(-px*14).toFixed(1)}px,\${(-py*10).toFixed(1)}px)\`})}}
    $$('.hero-cta .btn,#addCart,#buyNow,.story-cta .btn,.insta-b').forEach(b=>{
      const r=b.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      const dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy);
      if(d<110){b.style.transform=\`translate(\${(dx*.22).toFixed(1)}px,\${(dy*.22).toFixed(1)}px)\`; b.style.transition='transform .12s'}
      else if(b.style.transform){b.style.transform='';b.style.transition='transform .5s cubic-bezier(.22,1,.36,1)'}
    });
  },{passive:true});
}

/* ---------- 32. EVENTOS GLOBAIS ---------- */`);
rep('boot-motion',`  initTopbar();renderFooter();initEvents();paintBadges();initAmbiente();`,`  initTopbar();renderFooter();initEvents();paintBadges();initAmbiente();initMotion();`);

fs.writeFileSync(ARQ,src);
console.log('ok:',feitos.length,'trechos aplicados');
