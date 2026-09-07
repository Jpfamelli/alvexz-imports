// Aplica a versão 2 no index.html: Supabase (catálogo, login, pedidos,
// painel), checkout pela Stripe e o visual novo. Cada trecho é substituído por
// âncora exata: se uma âncora não bater, o script para e avisa qual.
// Uso: node ferramentas/patch-v2.mjs   (faz backup em alvexz-store.v1.html)
import fs from 'node:fs';
const ARQ=new URL('../index.html',import.meta.url);
let src=fs.readFileSync(ARQ,'utf8');
if(src.includes('/* v2: supabase+stripe */')){console.log('já aplicado');process.exit(0)}
fs.writeFileSync(new URL('../alvexz-store.v1.html',import.meta.url),src);

const feitos=[];
function rep(nome,a,b,{all=false}={}){
  const n=src.split(a).length-1;
  if(n===0) throw new Error('âncora não encontrada ['+nome+']: '+a.slice(0,90));
  if(n>1&&!all) throw new Error('âncora ambígua ['+nome+'] ('+n+'x): '+a.slice(0,90));
  src=all?src.split(a).join(b):src.replace(a,()=>b);
  feitos.push(nome);
}
function entre(nome,ini,fim,novo){
  const i=src.indexOf(ini); if(i<0) throw new Error('início não encontrado ['+nome+']');
  const j=src.indexOf(fim,i); if(j<0) throw new Error('fim não encontrado ['+nome+']');
  src=src.slice(0,i)+novo+src.slice(j+fim.length);
  feitos.push(nome);
}

/* ===================== HEAD ===================== */
rep('csp',
`script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://viacep.com.br https://*.supabase.co;`,
`script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://viacep.com.br https://*.supabase.co wss://*.supabase.co;`);

rep('fontes',
`<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;800;900&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">`,
`<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<!-- supabase-js (UMD). Sem rede ele não carrega e a loja segue no modo local. -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js" crossorigin="anonymous"></script>`);

/* ===================== CSS ===================== */
rep('tokens-fonte',
`  --f-display:'Archivo','Archivo Black',system-ui,'Segoe UI',sans-serif;`,
`  --f-display:'Bricolage Grotesque','Archivo',system-ui,'Segoe UI',sans-serif;
  --f-serif:'Instrument Serif',Georgia,'Times New Roman',serif;`);

rep('btn-pilula',
`  height:48px;padding:0 22px;border-radius:var(--r);font-weight:700;font-size:14.5px;`,
`  height:48px;padding:0 24px;border-radius:999px;font-weight:700;font-size:14.5px;`);
rep('btn-sm-pilula',`.btn-sm{height:38px;padding:0 15px;font-size:13px;border-radius:8px}`,`.btn-sm{height:38px;padding:0 16px;font-size:13px;border-radius:999px}`);
rep('sgo-pilula',`.sgo{position:absolute;right:6px;top:6px;width:38px;height:38px;border-radius:12px;`,`.sgo{position:absolute;right:6px;top:6px;width:38px;height:38px;border-radius:999px;`);

entre('hero-css',
`/* ================= CARROSSEL BANNER ================= */`,
`@media(min-width:900px){.hero-arrow{display:grid}}`,
`/* ================= HERO EDITORIAL ================= */
.hero{position:relative;overflow:hidden;margin:10px 10px 0;border-radius:var(--r-xl);background:#0F0F13;
  border:1px solid rgba(255,255,255,.06);box-shadow:0 34px 80px -34px rgba(0,0,0,.95)}
@media(min-width:768px){.hero{margin:16px 22px 0}}
@media(min-width:1200px){.hero{margin:16px auto 0;max-width:calc(var(--max) - 44px)}}
.hero-track{display:flex;transition:transform .55s var(--ease);will-change:transform}
.hero-slide{min-width:100%;position:relative;display:grid;grid-template-columns:1fr;min-height:540px}
.hero-slide .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 28%;
  opacity:.5;filter:saturate(.6) contrast(1.06)}
.hero-slide .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,12,.05) 0%,rgba(10,10,12,.55) 45%,rgba(10,10,12,.92) 100%)}
.hero-txt{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:44px 20px 30px;color:#fff;min-height:540px}
.hero-txt .kicker{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.62);margin-bottom:20px;display:flex;align-items:center;gap:10px}
.hero-txt .kicker::before{content:"";width:26px;height:1px;background:rgba(255,255,255,.7)}
.hero-txt h1{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:clamp(50px,11.5vw,124px);
  letter-spacing:-.05em;line-height:.84;text-transform:uppercase;margin:0 0 16px;text-wrap:balance}
.hero-txt h1 em{display:block;font-family:var(--f-serif);font-style:italic;font-weight:400;text-transform:none;
  letter-spacing:-.01em;font-size:.46em;line-height:1.05;color:#D9D9E1;margin-top:10px}
.hero-txt p{font-size:15.5px;color:rgba(255,255,255,.72);margin:0 0 24px;max-width:430px;line-height:1.55}
.hero-cta{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.hero .btn-ghost{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.28);color:#fff;backdrop-filter:blur(6px)}
.hero .btn-ghost:hover{border-color:#fff;background:rgba(255,255,255,.1)}
.hero-meta{display:flex;gap:16px 22px;margin-top:30px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,255,255,.42);flex-wrap:wrap}
@media(min-width:900px){
  .hero-slide{grid-template-columns:1.08fr .92fr;min-height:580px}
  .hero-slide .bg{position:relative;inset:auto;grid-column:2;grid-row:1;opacity:1;filter:none;height:100%;max-height:660px;
    border-left:1px solid rgba(255,255,255,.06);object-position:center 22%}
  .hero-slide .ov{background:linear-gradient(90deg,rgba(15,15,19,0) 50%,rgba(15,15,19,.28) 100%)}
  .hero-txt{grid-column:1;grid-row:1;justify-content:center;padding:60px 40px 60px 62px;min-height:0}
}
.hero-dots{position:absolute;bottom:16px;right:18px;display:flex;gap:6px;z-index:3}
.hero-dots button{width:22px;height:3px;border-radius:99px;background:rgba(255,255,255,.3);transition:background .25s,width .25s}
.hero-dots button.on{background:#fff;width:38px}
.hero-arrow{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;
  background:rgba(10,10,12,.55);color:#fff;border:1px solid rgba(255,255,255,.22);display:none;place-items:center;z-index:3;backdrop-filter:blur(8px)}
.hero-arrow:hover{background:#fff;color:#0A0A0C}
.hero-arrow.prev{left:16px}.hero-arrow.next{right:16px}
@media(min-width:900px){.hero-arrow{display:grid}}`);

rep('header-vidro',
`.header{position:sticky;top:0;z-index:60;background:var(--papel);border-bottom:1px solid var(--linha)}`,
`.header{position:sticky;top:0;z-index:60;background:rgba(10,10,12,.74);border-bottom:1px solid var(--linha);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3)}`);

rep('section-h',
`.section-h .eyebrow{font-family:var(--f-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ultramar);font-weight:600;display:block;margin-bottom:5px}
.section-h h2{font-family:var(--f-display);font-weight:900;font-size:clamp(30px,8.4vw,38px);letter-spacing:-.035em;text-transform:uppercase;margin:0;line-height:.9}
.section-h .more{font-size:13px;font-weight:700;color:var(--ultramar);display:inline-flex;align-items:center;gap:4px;flex:none;padding-bottom:3px}
.section-h .more:hover{gap:8px}`,
`.section-h .eyebrow{font-family:var(--f-serif);font-style:italic;font-size:17px;letter-spacing:0;text-transform:none;color:var(--texto-2);font-weight:400;display:block;margin-bottom:4px}
.section-h h2{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:clamp(36px,8.4vw,56px);letter-spacing:-.05em;text-transform:uppercase;margin:0;line-height:.88}
.section-h .more{font-size:13px;font-weight:600;color:var(--texto);display:inline-flex;align-items:center;gap:6px;flex:none;
  border:1px solid var(--linha);border-radius:999px;padding:9px 14px;transition:border-color .2s,background .2s}
.section-h .more:hover{border-color:#fff;background:rgba(255,255,255,.05)}`);
rep('section-h-desk',`  .section-h h2{font-size:44px}`,`  .section-h h2{font-size:60px}`);

rep('card',
`.card{
  background:var(--papel);border:1px solid var(--linha);border-radius:var(--r-lg);
  overflow:hidden;display:flex;flex-direction:column;position:relative;
  transition:box-shadow .22s var(--ease),border-color .22s var(--ease),transform .22s var(--ease);
}
.card:hover{box-shadow:var(--sh-3);border-color:var(--ultramar-line);transform:translateY(-2px)}`,
`.card{
  background:#101014;border:1px solid rgba(255,255,255,.05);border-radius:var(--r-lg);
  overflow:hidden;display:flex;flex-direction:column;position:relative;
  transition:box-shadow .28s var(--ease),border-color .28s var(--ease),transform .28s var(--ease);
}
.card:hover{box-shadow:0 28px 54px -26px rgba(0,0,0,.95);border-color:rgba(255,255,255,.16);transform:translateY(-4px)}`);
rep('card-b',`.card-b{padding:8px 8px 10px;display:flex;flex-direction:column;flex:1;gap:1px}`,`.card-b{padding:11px 11px 12px;display:flex;flex-direction:column;flex:1;gap:1px}`);
rep('card-name',`.card-name{font-size:12px;font-weight:600;`,`.card-name{font-size:13px;font-weight:600;`);
rep('card-price',`.card-price{font-family:var(--f-display);font-weight:900;font-size:16px;letter-spacing:-.03em;`,`.card-price{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:19px;letter-spacing:-.04em;`);
rep('card-cta',`.card-cta{margin-top:7px;height:33px;font-size:12px}`,`.card-cta{margin-top:9px;height:36px;font-size:12.5px}`);

rep('pdp-h1',`.pdp h1{font-family:var(--f-display);font-weight:800;font-size:23px;letter-spacing:-.02em;line-height:1.08;margin:6px 0 8px;text-transform:none}`,
`.pdp h1{font-family:var(--f-display);font-weight:700;font-variation-settings:"opsz" 96;font-size:30px;letter-spacing:-.035em;line-height:1.02;margin:6px 0 8px;text-transform:none}`);
rep('price-now',`.price-now{font-family:var(--f-display);font-weight:900;font-size:32px;letter-spacing:-.035em;line-height:1}`,
`.price-now{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:38px;letter-spacing:-.045em;line-height:1}`);

rep('story',
`.story-t{font-family:var(--f-display);font-weight:800;letter-spacing:-.03em;line-height:1.04;
  font-size:clamp(27px,5.4vw,44px);margin:0;text-wrap:balance}`,
`.story-t{font-family:var(--f-display);font-weight:700;font-variation-settings:"opsz" 96;letter-spacing:-.04em;line-height:.98;
  font-size:clamp(30px,5.8vw,58px);margin:0;text-wrap:balance}
.story-t em{font-family:var(--f-serif);font-style:italic;font-weight:400;letter-spacing:-.01em;color:#C9C9D2}`);
rep('story-sign',`.story-sign{font-family:var(--f-display);font-weight:800;color:var(--texto);font-size:16px;letter-spacing:-.01em}`,
`.story-sign{font-family:var(--f-serif);font-style:italic;font-weight:400;color:#fff;font-size:26px;letter-spacing:-.01em}`);
rep('insta-k',`.insta-k{margin:0 0 8px;font-size:13.5px;color:var(--texto-3)}`,`.insta-k{margin:0 0 8px;font-family:var(--f-serif);font-style:italic;font-size:20px;color:var(--texto-2)}`);
rep('insta-h',`.insta-h{display:block;font-family:var(--f-display);font-weight:900;letter-spacing:-.035em;`,`.insta-h{display:block;font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;letter-spacing:-.05em;`);
rep('brands-t',`.brands-t{font-family:var(--f-display);font-weight:800;font-size:clamp(24px,6vw,38px);letter-spacing:-.03em;`,
`.brands-t{font-family:var(--f-serif);font-style:italic;font-weight:400;font-size:clamp(30px,6vw,48px);letter-spacing:-.01em;`);
rep('logo-u',`  font-family:var(--f-display);font-weight:900;font-size:19px;letter-spacing:-.04em;
  color:var(--tinta);text-transform:uppercase;line-height:1;white-space:nowrap`,
`  font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:20px;letter-spacing:-.05em;
  color:var(--tinta);text-transform:uppercase;line-height:1;white-space:nowrap`);
rep('news-h3',`.news h3{font-family:var(--f-display);font-weight:900;font-size:22px;`,`.news h3{font-family:var(--f-display);font-weight:800;font-variation-settings:"opsz" 96;font-size:30px;`);

rep('grao+luz',
`/* grão de filme por cima de tudo: tira a cara de cor chapada de tela */
body::after{`,
`/* luz que acompanha o mouse: o fundo reage a quem navega (só desktop) */
body::before{
  content:'';position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(640px 640px at var(--mx,50%) var(--my,-10%),rgba(255,255,255,.065),transparent 62%);
}
@media (pointer:coarse){body::before{display:none}}
/* cursor próprio: ponto + anel que cresce sobre o que é clicável */
@media (pointer:fine){
  body.cur, body.cur a, body.cur button, body.cur label, body.cur input, body.cur select, body.cur textarea, body.cur .card{cursor:none}
  .cur-dot{position:fixed;left:0;top:0;width:6px;height:6px;border-radius:50%;background:#fff;pointer-events:none;z-index:9999;
    transform:translate(-50%,-50%);mix-blend-mode:difference}
  .cur-ring{position:fixed;left:0;top:0;width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(255,255,255,.8);
    pointer-events:none;z-index:9998;transform:translate(-50%,-50%);mix-blend-mode:difference;
    transition:width .22s var(--ease),height .22s var(--ease),background .22s,opacity .3s}
  .cur-ring.hov{width:56px;height:56px;background:rgba(255,255,255,.14);border-color:transparent}
  .cur-ring.down{width:22px;height:22px}
  .cur-ring.txt{width:3px;height:30px;border-radius:2px;background:#fff;border-color:transparent}
  body.cur.cur-off .cur-dot, body.cur.cur-off .cur-ring{opacity:0}
}
/* grão de filme por cima de tudo: tira a cara de cor chapada de tela */
body::after{`);

/* ===================== CONFIG ===================== */
rep('config',
`  SUPABASE_URL:'',           // process.env.NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_ANON_KEY:'',      // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`  /* v2: supabase+stripe */
  // Projeto "alvexz-imports" (São Paulo). Chave publishable é pública por
  // definição: só permite o que as policies RLS deixam. Vazio = modo local.
  SUPABASE_URL:'https://nmzpdaqdpzlvfazahgsv.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_ygbeTzIXpmqIg7_ey0w7PA_PUtlSzw0',`);
rep('config-endpoint',
`  CHECKOUT_ENDPOINT:'',      // https://SEU-PROJETO.supabase.co/functions/v1/checkout`,
`  CHECKOUT_ENDPOINT:'https://nmzpdaqdpzlvfazahgsv.supabase.co/functions/v1/checkout',`);

/* ===================== SUPABASE CLIENT ===================== */
rep('sb-client',
`/* ---------- 2. UTILITÁRIOS ---------- */`,
`/* ---------- 1b. SUPABASE (modo banco) ----------
   Com URL + chave preenchidas e o supabase-js carregado, a loja lê catálogo,
   login e pedidos do banco. Sem rede (ou file:// offline) cai no modo local:
   SEED + localStorage, exatamente como antes. ONLINE só vira true depois que
   o catálogo do banco carrega de verdade (ver BOOT). */
const SB=(window.supabase&&CONFIG.SUPABASE_URL&&CONFIG.SUPABASE_ANON_KEY)
  ? window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY)
  : null;
let ONLINE=false;

/* ---------- 2. UTILITÁRIOS ---------- */`);

rep('cats-let',`const CATS=[
  {id:'camisetas',`,`let CATS=[
  {id:'camisetas',`);
rep('brands-let',`const BRANDS=['Nike','Adidas','Puma','Tommy Hilfiger','Lacoste'];`,`let BRANDS=['Nike','Adidas','Puma','Tommy Hilfiger','Lacoste'];
let DB_BRANDS=[];   // linhas cruas da tabela brands (modo banco)`);

/* ===================== CATÁLOGO DO BANCO ===================== */
rep('catalogo-banco',
`let CATALOG=[], BANNERS=[], COUPONS=[];`,
`let CATALOG=[], BANNERS=[], COUPONS=[];

/* Foto real da loja usada no hero. Em http o caminho tem que ser absoluto,
   senão em /p/slug o navegador procura /p/imagens/... */
function heroFoto(){
  const abs=(location.protocol==='http:'||location.protocol==='https:');
  return (abs?((typeof BASE==='string'?BASE:'')+'/'):'')+'imagens/conjunto-nike-fundo-concreto.jpg';
}

/* ---------- 4b. CATÁLOGO DO BANCO ----------
   Converte as linhas do Supabase para o formato que as telas já usam. */
const SIZE_ORDER=['PP','P','M','G','GG','XG','XGG','ÚNICO'];
const tamOrd=s=>{const i=SIZE_ORDER.indexOf(String(s).toUpperCase());return i<0?99:i};
function shade(hex){
  const m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m)return '#0A0A0C';
  const n=parseInt(m[1],16), f=x=>Math.max(0,Math.round(x*0.62)).toString(16).padStart(2,'0');
  return '#'+f(n>>16)+f((n>>8)&255)+f(n&255);
}
function imgsPadrao(tipo,cores){
  const c=cores[0],c2=cores[1]||cores[0];
  return [garment(tipo,c.hex,c.hex2,'#F6F6F7'),garment(tipo,c2.hex,c2.hex2,'#EFEFF1'),garment(tipo,c.hex2,c.hex,'#EBEBEE'),garment(tipo,'#8B8B93','#56565E','#F6F6F7')];
}
function normalizeProduct(r){
  const det=r.detalhes||{};
  const vars=(r.product_variants||[]).slice();
  const catSlug=r.categories?.slug||'', cat=CATS.find(c=>c.id===catSlug);
  const tipo=det.tipo||r.categories?.tipo||(cat?cat.tipo:'camiseta');
  let cores=Array.isArray(det.cores)&&det.cores.length?det.cores.filter(c=>c&&c.nome):[];
  if(!cores.length){
    const seen=new Map();
    vars.forEach(v=>{if(v.cor&&!seen.has(v.cor))seen.set(v.cor,{nome:v.cor,hex:v.cor_hex||'#1C1C1F',hex2:shade(v.cor_hex||'#1C1C1F')})});
    cores=[...seen.values()];
  }
  if(!cores.length)cores=colorway(r.slug||String(r.id));
  const sizes=[...new Set(vars.map(v=>v.tamanho))].sort((a,b)=>tamOrd(a)-tamOrd(b));
  const estoque={}; sizes.forEach(s=>estoque[s]=vars.filter(v=>v.tamanho===s).reduce((a,v)=>a+(v.estoque||0),0));
  const fotos=(r.product_images||[]).slice().sort((a,b)=>(a.ordem||0)-(b.ordem||0));
  const tags=[]; if(r.destaque)tags.push('destaque'); if(r.mais_vendido)tags.push('maisvendido'); if(r.novidade)tags.push('novidade'); if(r.promocao)tags.push('promo');
  return {
    id:r.slug, uuid:r.id, sku:r.sku, nome:r.nome, marca:r.brands?.nome||'', cat:catSlug, catNome:r.categories?.nome||'',
    preco:+r.preco, precoDe:r.preco_de!=null?+r.preco_de:null, tipo, cores, sizes:sizes.length?sizes:SZ.roupa, estoque, variantes:vars,
    tags, rating:+r.rating||0, reviews:r.reviews_count||0, desc:r.descricao||'', comp:det.comp||'Não informada',
    origem:det.origem||'Importado', peso:det.peso||'—', modelo:det.modelo||'Regular fit', ativo:!!r.ativo, ordem:r.ordem||0,
    fotos, imgs:fotos.length?fotos.map(f=>f.url):imgsPadrao(tipo,cores)
  };
}
/** Variante (tamanho + cor) que vai para o carrinho e para o checkout. */
function variantFor(p,size,cor){
  const vs=(p.variantes||[]).filter(v=>v.tamanho===size);
  return vs.find(v=>v.cor===cor)||vs.find(v=>v.estoque>0)||vs[0]||null;
}
async function loadCatalog(){
  const [cats,brands,prods,bans]=await Promise.all([
    SB.from('categories').select('*').order('ordem'),
    SB.from('brands').select('*').order('ordem'),
    SB.from('products').select('*, brands(nome,slug), categories(nome,slug,tipo), product_variants(id,tamanho,cor,cor_hex,estoque,sku_variante), product_images(id,url,alt,ordem)').order('ordem'),
    SB.from('banners').select('*').order('ordem')
  ]);
  const err=cats.error||brands.error||prods.error||bans.error;
  if(err) throw new Error(err.message);
  CATS=(cats.data||[]).map(c=>({id:c.slug,uuid:c.id,nome:c.nome,tipo:c.tipo||'camiseta',ativo:c.ativo!==false,c:['#1C1C1F','#0A0A0C']}));
  DB_BRANDS=brands.data||[];
  BRANDS=DB_BRANDS.filter(b=>b.ativo!==false).map(b=>b.nome);
  BRAND_LOGOS={...BRAND_LOGOS_PADRAO};
  DB_BRANDS.forEach(b=>{if(b.logo_url)BRAND_LOGOS[b.slug]=b.logo_url});
  CATALOG=(prods.data||[]).map(normalizeProduct);
  BANNERS=(bans.data||[]).map(b=>({id:b.id,kicker:b.kicker||'',titulo:b.titulo,sub:b.subtitulo||'',cta:b.cta_texto||'Ver peças',
    href:b.cta_href||'#/produtos',img:b.imagem_url||heroFoto(),ativo:!!b.ativo,ordem:b.ordem}));
}
async function admLoadCupons(){
  const {data,error}=await SB.from('coupons').select('*').order('created_at');
  if(error){console.warn('cupons',error.message);return}
  COUPONS=(data||[]).map(c=>({uuid:c.id,code:c.codigo,tipo:c.tipo==='percentual'?'percent':(c.tipo==='frete_gratis'?'frete':'fixo'),
    valor:+c.valor,min:+c.minimo_compra,ativo:c.ativo,desc:c.descricao||'',usos:c.usos_atuais,primeiraCompra:c.primeira_compra}));
}

/* ---------- 4c. PEDIDOS DO BANCO ---------- */
const ST_DB2FRONT={pagamento_pendente:'pend',pagamento_aprovado:'appr',em_preparacao:'prep',enviado:'sent',a_caminho:'road',entregue:'deliv',cancelado:'canc'};
const ST_FRONT2DB=Object.fromEntries(Object.entries(ST_DB2FRONT).map(([k,v])=>[v,k]));
function normalizeOrder(o){
  const e=o.endereco||{};
  return {
    id:o.id, numero:o.numero, data:o.created_at, status:ST_DB2FRONT[o.status]||'pend', statusDb:o.status,
    nome:o.cliente_nome, email:o.cliente_email, pay:o.metodo_pagamento, cupom:null,
    endereco:[e.rua,e.numero].filter(Boolean).join(', ')+(e.complemento?' ('+e.complemento+')':'')+' / '+[e.cidade,e.uf].filter(Boolean).join('-'),
    frete:(o.frete_transportadora||'A combinar')+(o.frete_prazo?' ('+o.frete_prazo+')':''),
    total:+o.total, subtotal:+o.subtotal, desconto:+o.desconto, descontoPix:+(o.desconto_pix||0), freteValor:+o.frete,
    rastreio:o.codigo_rastreio||null, pagarUrl:o.stripe_checkout_url||null, boletoUrl:o.boleto_url||null, boletoLinha:o.boleto_linha||null,
    expiraEm:o.expira_em,
    itens:(o.order_items||[]).map(it=>{const p=CATALOG.find(x=>x.uuid===it.product_id);
      return {id:p?p.id:it.product_id,nome:it.nome,size:it.tamanho,cor:it.cor,qtd:it.quantidade,preco:+it.preco_unitario,img:it.imagem_url||(p?p.imgs[0]:'')}})
  };
}
async function loadOrders(){
  if(!ONLINE||!State.user){State.orders=[];return}
  const {data,error}=await SB.from('orders').select('*, order_items(*)').order('created_at',{ascending:false}).limit(300);
  if(error){console.warn('pedidos',error.message);return}
  State.orders=(data||[]).map(normalizeOrder);
}`);

rep('seed-banners-foto',
`img:bannerImg('#0A0A0C','#2E2E35','LOTE 07 / BR'),ativo:true},`,`img:heroFoto(),ativo:true},`);
rep('seed-banners-foto2',`img:bannerImg('#18181B','#45454E','NOVIDADES'),ativo:true},`,`img:heroFoto(),ativo:true},`);
rep('seed-banners-foto3',`img:bannerImg('#3F3F46','#0A0A0C','OUTLET'),ativo:true}`,`img:heroFoto(),ativo:true}`);
rep('seed-cupons',`{code:'BEMVINDOS5',tipo:'percent',valor:5,min:0,ativo:true,desc:'5% de desconto'},`,`{code:'BEMVINDOS5',tipo:'percent',valor:5,min:0,ativo:true,desc:'5% de desconto'},
    /* Só demonstração local. No banco, cupons ficam na tabela coupons. */`);

rep('save-catalog',`function saveCatalog(){Persist.set('catalog',{CATALOG,BANNERS,COUPONS})}`,
`function saveCatalog(){if(ONLINE)return true;return Persist.set('catalog',{CATALOG,BANNERS,COUPONS})}`);

/* ===================== CARRINHO ===================== */
rep('cart-variant',
`  else State.cart.push({id:pid,size,cor:cor||p.cores[0].nome,qtd,addedAt:Date.now()});`,
`  else{const corF=cor||p.cores[0].nome, v=variantFor(p,size,corF);
    State.cart.push({id:pid,size,cor:corF,qtd,variantId:v?v.id:null,addedAt:Date.now()})}`);

rep('cart-disp-variante',
`  const disp=stockOf(p,size);`,
`  let disp=stockOf(p,size);
  if(ONLINE){ /* no banco o estoque é por tamanho E cor */
    const vv=(p.variantes||[]).find(v=>v.tamanho===size&&v.cor===(cor||p.cores[0].nome)); if(vv)disp=vv.estoque; }`);

/* ===================== HOME / HERO ===================== */
rep('hero-html',
`        <div class="hero-slide" role="group" aria-roledescription="slide" aria-label="\${i+1} de \${BANNERS.length}">
          <img class="bg" src="\${b.img}" alt="" \${i?'loading="lazy"':'fetchpriority="high"'} decoding="async">
          <div class="ov"></div>
          <div class="hero-txt">
            <span class="kicker">\${esc(b.kicker)}</span>
            <h1>\${esc(b.titulo)}</h1>
            <p>\${esc(b.sub)}</p>
            <div><a href="\${b.href}" class="btn btn-primary btn-lg">\${esc(b.cta)}</a></div>
          </div>
        </div>`,
`        <div class="hero-slide" role="group" aria-roledescription="slide" aria-label="\${i+1} de \${BANNERS.filter(x=>x.ativo).length}">
          <div class="hero-txt">
            <span class="kicker">\${esc(b.kicker)}</span>
            <h1>\${esc(b.titulo)}<em>sempre realizando sonhos.</em></h1>
            <p>\${esc(b.sub)}</p>
            <div class="hero-cta"><a href="\${esc(b.href)}" class="btn btn-primary btn-lg">\${esc(b.cta)}</a><a href="#/novidades" class="btn btn-ghost btn-lg">Novidades</a></div>
            <div class="hero-meta">\${BRANDS.map(x=>\`<span>\${esc(x)}</span>\`).join('')}</div>
          </div>
          <img class="bg" src="\${esc(b.img)}" alt="" \${i?'loading="lazy"':'fetchpriority="high"'} decoding="async">
          <div class="ov"></div>
        </div>`);

rep('story-em',
`      <h2 class="story-t">Peça original, importada, conferida na mão antes de chegar na sua.</h2>`,
`      <h2 class="story-t">Peça original, importada, <em>conferida na mão</em> antes de chegar na sua.</h2>`);

/* ===================== LISTAGEM: sem "·" ===================== */
rep('listagem-eyebrow',`main.innerHTML=viewListing('Todos os produtos','Catálogo completo · '+active.length+' peças',active)`,
  `main.innerHTML=viewListing('Todos os produtos',active.length+(active.length===1?' peça conferida':' peças conferidas'),active)`);
rep('cart-item-meta',"<div class=\"vr\">${esc(p.marca)} · Tam ${esc(it.size)} · ${esc(it.cor)}</div>","<div class=\"vr\">${esc(p.marca)} / ${esc(it.size)} / ${esc(it.cor)}</div>");
rep('cart-page-meta',"<div class=\"vr\">${esc(p.marca)} · Tam ${esc(it.size)} · ${esc(it.cor)} · ${stockOf(p,it.size)} em estoque</div>","<div class=\"vr\">${esc(p.marca)} / ${esc(it.size)} / ${esc(it.cor)} / ${stockOf(p,it.size)} em estoque</div>");
rep('ck-resumo-meta',"Tam ${esc(it.size)} · ${it.qtd}x</div>","${esc(it.size)} / ${it.qtd} un.</div>");
rep('pedido-meta',"${dateBR(o.data)} · ${o.itens.reduce((s,i)=>s+i.qtd,0)} ${o.itens.reduce((s,i)=>s+i.qtd,0)===1?'item':'itens'}","${dateBR(o.data)} / ${o.itens.reduce((s,i)=>s+i.qtd,0)} ${o.itens.reduce((s,i)=>s+i.qtd,0)===1?'item':'itens'}");
rep('pedido-item-meta',"Tam ${esc(it.size)} · ${it.qtd}x · ${BRL(it.preco)}","${esc(it.size)} / ${it.qtd} un. / ${BRL(it.preco)}");
rep('pedido-detalhe-meta',"${dateBR(o.data)} · <span class=\"pill","${dateBR(o.data)} <span class=\"pill");
rep('pdp-stock-meta',"<span style=\"color:var(--ok);font-weight:600\">● Em estoque</span> · envio em até 2 dias úteis","<span style=\"color:var(--ok);font-weight:600\">● Em estoque</span>, envio em até 2 dias úteis");
rep('toast-add',"toast(`${p.nome} · ${size}`,'ok',{img:p.imgs[0],action:'Ver carrinho',onAction:openCart});","toast(`${p.nome} (${size})`,'ok',{img:p.imgs[0],action:'Ver carrinho',onAction:openCart});");
rep('pagina-eyebrow',`<div class="section-h"><div><span class="eyebrow">Institucional</span><h2>\${esc(p.t)}</h2></div></div>`,`<div class="section-h"><div><h2>\${esc(p.t)}</h2></div></div>`);
rep('drawer-cart-sec',"Ambiente seguro · dados criptografados","Ambiente seguro, dados criptografados");

/* ===================== CARRINHO: desconto Pix só sobre as peças ===================== */
rep('cart-pix-total',"<b class=\"mono\" style=\"color:var(--ultramar);font-size:14px\">${BRL(grandTotal()*(1-CONFIG.pixDiscount))}</b> pagando no Pix (7% off)",
  "<b class=\"mono\" style=\"color:var(--ultramar);font-size:14px\">${BRL(Math.max(0,sub-desc)*(1-CONFIG.pixDiscount)+fr)}</b> pagando no Pix (7% off nas peças)");
rep('ck-pix-total',"const totalPix=total*(1-CONFIG.pixDiscount);","const totalPix=Math.max(0,sub-desc)*(1-CONFIG.pixDiscount)+fr;");
rep('ck-sim-pix',"if(CK.pay==='pix')total*=(1-CONFIG.pixDiscount);","if(CK.pay==='pix')total=Math.max(0,sub-desc)*(1-CONFIG.pixDiscount)+fr;");

/* ===================== CHECKOUT: identificação com login ===================== */
rep('ck-step1',
`  if(CK.step===1){
    const u=State.user;
    body=\`<div class="panel"><h3>Identificação</h3>`,
`  if(CK.step===1&&ONLINE&&!State.user){
    body=viewAuthGate('Para fechar o pedido você precisa de uma conta: é ela que guarda seus pedidos, o código Pix e o rastreio.',true);
  }
  else if(CK.step===1){
    const u=State.user;
    body=\`<div class="panel"><h3>Identificação</h3>`);
rep('ck-step1-prefill',
`<input class="inp" id="ckCpf" inputmode="numeric" value="\${esc(CK.ident.cpf||'')}" placeholder="000.000.000-00">`,
`<input class="inp" id="ckCpf" inputmode="numeric" value="\${esc(CK.ident.cpf||maskCPF(u?.cpf||''))}" placeholder="000.000.000-00">`);
rep('ck-step1-prefill-tel',
`<input class="inp" id="ckTel" inputmode="tel" value="\${esc(CK.ident.tel||'')}" placeholder="(12) 99999-0000">`,
`<input class="inp" id="ckTel" inputmode="tel" value="\${esc(CK.ident.tel||maskTel((u?.telefone||'').replace(/^55/,'')))}" placeholder="(12) 99999-0000">`);

rep('ck-bind-step1',
`  if(CK.step===1){
    const cpf=$('#ckCpf'),tel=$('#ckTel');`,
`  if(CK.step===1&&ONLINE&&!State.user){ bindAuthGate(); return; }
  if(CK.step===1){
    const cpf=$('#ckCpf'),tel=$('#ckTel');`);
rep('ck-bind-step1-save',
`      CK.ident={nome,email,cpf:cpf.value,tel:tel.value};CK.step=2;route();
    };`,
`      CK.ident={nome,email,cpf:cpf.value,tel:tel.value};
      if(ONLINE){
        /* CPF e telefone vão para o perfil: criar_pedido() lê de lá, não do formulário */
        const b=$('#ckNext1'); b.disabled=true; b.textContent='Salvando…';
        SB.from('profiles').update({nome,cpf:cpf.value.replace(/\\D/g,''),telefone:'55'+t}).eq('id',State.user.id)
          .then(({error})=>{
            if(error){ b.disabled=false; b.textContent='Continuar para o endereço';
              toast(/cpf/i.test(error.message)&&/unique|duplicate/i.test(error.message)?'Este CPF já está em outra conta.':'Não consegui salvar seus dados: '+error.message,'err',{ms:5000}); return; }
            Object.assign(State.user,{nome,cpf:cpf.value.replace(/\\D/g,''),telefone:'55'+t});
            CK.step=2;route();
          });
        return;
      }
      CK.step=2;route();
    };`);

rep('finish-servidor',
`/** Fecha o pedido pelo backend. Só manda variant/quantidade: preço vem do banco. */
async function finishOrderServidor(btn){
  const restaura=()=>{ route(); };   // re-renderiza a etapa e devolve o rótulo certo
  try{
    const r=await fetch(CONFIG.CHECKOUT_ENDPOINT,{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'},
        window.sbToken?{'Authorization':'Bearer '+window.sbToken}:{}),
      body:JSON.stringify({
        itens:State.cart.map(i=>({variant_id:i.variantId||i.id,quantidade:i.qtd})),
        addressId:CK.addr.id||null,
        metodo:CK.pay,
        cupom:State.coupon?State.coupon.code:null
      })
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.erro||'Não foi possível gerar a cobrança.');

    CK.retorno=d;                 // { orderId, numero, total, pix, boleto }
    CK.step=5; route();
    toast('Pedido criado. Conclua o pagamento.','ok');
  }catch(e){
    restaura();
    toast(e.message||'Falha ao finalizar. Tente de novo.','err');
  }
}`,
`/** Fecha o pedido pela Edge Function \`checkout\`. Só manda variante e quantidade:
    preço, cupom, desconto Pix e frete são calculados no servidor. A resposta
    traz a URL do Stripe Checkout (Pix ou boleto) e o navegador vai para lá. */
async function finishOrderServidor(btn){
  try{
    const {data:{session}}=await SB.auth.getSession();
    if(!session) throw new Error('Sua sessão expirou. Entre de novo para finalizar.');
    const itens=State.cart.map(i=>{
      const p=CATALOG.find(x=>x.id===i.id);
      const v=(i.variantId&&p&&(p.variantes||[]).find(x=>x.id===i.variantId))||(p?variantFor(p,i.size,i.cor):null);
      if(!v) throw new Error(\`\${p?p.nome:'Um item'} não está mais disponível no tamanho \${i.size}.\`);
      return {variant_id:v.id,quantidade:i.qtd};
    });
    const r=await fetch(CONFIG.CHECKOUT_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':CONFIG.SUPABASE_ANON_KEY},
      body:JSON.stringify({
        itens,
        endereco:{cep:CK.addr.cep,rua:CK.addr.rua,numero:CK.addr.num,complemento:CK.addr.comp,bairro:CK.addr.bairro,cidade:CK.addr.cidade,uf:CK.addr.uf},
        metodo:CK.pay,
        cupom:State.coupon?State.coupon.code:null,
        frete_id:CK.ship?CK.ship.id:'pac'
      })
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.erro||'Não foi possível gerar a cobrança.');
    State.cart=[];State.coupon=null;State.shipping=null;saveCart();
    CK.step=1;CK.ship=null;
    if(d.url){ toast('Pedido criado. Abrindo o pagamento…','ok'); location.href=d.url; return; }
    toast(d.aviso||'Pedido registrado.','ok',{ms:6000});
    go('/checkout/pendente?pedido='+encodeURIComponent(d.numero||''));
  }catch(e){
    route();
    toast(e.message||'Falha ao finalizar. Tente de novo.','err',{ms:5000});
  }
}

/* ---------- 30b. RESULTADO DO PEDIDO (volta do Stripe) ----------
   A tela só MOSTRA o status que está no banco. Quem muda o status é o
   webhook assinado da Stripe. Enquanto está pendente, consulta de novo a
   cada 4 s por até 3 minutos. */
function viewOrderResult(numero,tipo){
  const o=State.orders.find(x=>x.numero===numero);
  const pago=o&&o.status!=='pend'&&o.status!=='canc', canc=o&&o.status==='canc';
  const titulo=pago?'Pagamento confirmado':(canc?'Pedido cancelado':(tipo==='sucesso'?'Pedido recebido':'Pagamento pendente'));
  const sub=pago?'Já estamos separando a peça. Você acompanha o envio e o rastreio em Meus pedidos.'
    :(canc?'Este pedido foi cancelado e o estoque voltou para a loja. Se foi engano, é só comprar de novo.'
    :(o&&o.pay==='boleto'?'O boleto compensa em 1 a 2 dias úteis. Assim que o banco confirmar, o status muda sozinho.'
    :'Assim que o pagamento cair, esta tela e o pedido mudam sozinhos. Se fechou a página do Pix, use o botão abaixo.'));
  const icone=pago?svg('<path d="m20 6-11 11-5-5"/>',40):(canc?svg('<path d="M18 6 6 18M6 6l12 12"/>',36):svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',38));
  return \`<div class="order-ok">
    <div class="ring" style="\${pago?'':'background:var(--nevoa-2);color:var(--texto)'}">\${icone}</div>
    <h2 class="disp" style="font-size:30px;margin:0 0 8px">\${titulo}</h2>
    <p style="color:var(--texto-2);max-width:420px;margin:0 auto 6px;font-size:14.5px">\${esc(sub)}</p>
    <div class="mono" style="font-size:13px;color:var(--ultramar);font-weight:600;margin-bottom:22px">\${numero?'Pedido '+esc(numero):''}\${o?' / '+BRL(o.total):''}</div>
    \${o&&!pago&&!canc&&o.pagarUrl?\`<div style="margin-bottom:12px"><a class="btn btn-primary btn-lg" href="\${esc(o.pagarUrl)}">\${o.pay==='boleto'?'Ver boleto':'Pagar com Pix'}</a></div>\`:''}
    \${o&&o.boletoUrl?\`<div style="margin-bottom:12px"><a class="btn btn-ghost" href="\${esc(o.boletoUrl)}" target="_blank" rel="noopener">Abrir boleto em PDF</a></div>\`:''}
    <div class="mono" id="orderPoll" style="font-size:11.5px;color:var(--texto-3);margin-bottom:18px">\${!o?(State.user?'Carregando o pedido…':'Entre na sua conta para ver este pedido.'):(pago||canc?'':'Aguardando confirmação…')}</div>
    <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;max-width:420px;margin:0 auto">
      <a href="#/pedidos" class="btn btn-dark">Meus pedidos</a>
      <a href="#/" class="btn btn-ghost">Continuar comprando</a>
      <a href="https://wa.me/\${CONFIG.whatsapp}?text=\${encodeURIComponent('Olá! Sobre o pedido '+(numero||''))}" target="_blank" rel="noopener" class="btn btn-ghost">WhatsApp</a>
    </div></div>\`;
}
function bindOrderResult(numero){
  if(!ONLINE||!State.user)return;
  let tentativas=0;
  const tick=async()=>{
    if(!currentPath().startsWith('/checkout/'))return;
    await loadOrders();
    if(!currentPath().startsWith('/checkout/'))return;
    const o=State.orders.find(x=>x.numero===numero);
    const {parts}=parseHash();
    $('#main').innerHTML=viewOrderResult(numero,parts[1]);bindCommon();
    if(o&&o.status!=='pend')return;
    if(++tentativas<45)window.__pollPedido=setTimeout(tick,4000);
  };
  clearTimeout(window.__pollPedido);
  tick();
}

/* Tela de "entre para continuar" (pedidos, checkout). */
function viewAuthGate(msg,inline){
  const html=\`<div class="empty" style="padding:\${inline?'26px 14px 18px':'60px 22px'}">
    <div class="ic">\${svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',30)}</div>
    <h3>Entre na sua conta</h3><p>\${esc(msg)}</p>
    <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" data-gate="entrar">Entrar</button>
      <button class="btn btn-ghost" data-gate="criar-conta">Criar conta</button></div></div>\`;
  return inline?\`<div class="panel">\${html}</div>\`:html;
}
function bindAuthGate(){
  $$('[data-gate]').forEach(b=>b.onclick=()=>{CK.voltar=currentPath().startsWith('/checkout');go('/'+b.dataset.gate)});
}`);

rep('finish-online-gate',
`  if(CONFIG.CHECKOUT_ENDPOINT){ return finishOrderServidor(btn); }`,
`  if(ONLINE&&CONFIG.CHECKOUT_ENDPOINT){ return finishOrderServidor(btn); }`);

/* ===================== CUPOM ===================== */
rep('cupom-online',
`function applyCoupon(){
  const code=($('#cupomIn').value||'').trim().toUpperCase();
  if(!code){toast('Digite um cupom.','err');return}`,
`async function applyCoupon(){
  const code=($('#cupomIn').value||'').trim().toUpperCase();
  if(!code){toast('Digite um cupom.','err');return}
  if(ONLINE){
    /* Validado no banco (validar_cupom): a tabela de cupons não é legível pelo cliente */
    const {data,error}=await SB.rpc('validar_cupom',{p_codigo:code,p_subtotal:subtotal()});
    const r=data&&data[0];
    if(error||!r){toast('Não foi possível validar o cupom agora.','err');return}
    if(!r.valido){toast(r.mensagem||'Cupom inválido.','err');return}
    const tipo=r.tipo==='percentual'?'percent':(r.tipo==='frete_gratis'?'frete':'fixo');
    State.coupon={code,tipo,valor:+r.valor,min:0,ativo:true,desc:r.descricao||r.mensagem||'Cupom aplicado'};
    toast(\`Cupom aplicado: \${State.coupon.desc}\`,'ok');route();return;
  }`);

/* ===================== AUTH ===================== */
rep('auth-online',
`    /* PRODUÇÃO: supabase.auth.signUp / signInWithPassword.
       A senha nunca é guardada aqui — o Supabase faz o hash e devolve a sessão. */
    const ehAdmin=emailEhAdmin(email);`,
`    if(ONLINE){ authOnline(mode,{nome,email,senha}); return; }
    /* Modo local (sem banco): sessão de demonstração no navegador. */
    const ehAdmin=emailEhAdmin(email);`);

rep('auth-funcs',
`/* ---------- 32. EVENTOS GLOBAIS ---------- */`,
`/* ---------- 31b. AUTENTICAÇÃO (Supabase Auth) ----------
   A senha vai direto para o Supabase, que faz o hash. Aqui só fica a sessão,
   guardada pelo próprio supabase-js. O papel (admin) vem de profiles.role. */
async function authOnline(mode,{nome,email,senha}){
  const btn=$('#authGo'); if(btn){btn.disabled=true;btn.textContent='Aguarde…'}
  try{
    if(mode==='criar'){
      const {data,error}=await SB.auth.signUp({email,password:senha,options:{data:{nome}}});
      if(error)throw error;
      if(!data.session){
        toast('Conta criada. Confirme pelo link que enviamos ao seu e-mail e depois entre.','ok',{ms:7000});
        go('/entrar'); return;
      }
      await setUserFromSession(data.session);
      toast('Conta criada. Bem-vindo à ALVEXZ IMPORTS.','ok');
    }else{
      const {data,error}=await SB.auth.signInWithPassword({email,password:senha});
      if(error)throw error;
      await setUserFromSession(data.session);
      toast('Bem-vindo de volta.','ok');
    }
    const dest=CK.voltar?'/checkout':(isAdmin()?'/admin':'/');
    CK.voltar=false; go(dest);
  }catch(e){
    const m=String(e.message||'');
    toast(/invalid login|credentials/i.test(m)?'E-mail ou senha incorretos.'
      :(/already registered|already exists|already been registered/i.test(m)?'Este e-mail já tem conta. Use a opção de entrar.'
      :(/not confirmed/i.test(m)?'Confirme seu e-mail antes de entrar.'
      :(/rate limit/i.test(m)?'Muitas tentativas. Aguarde um minuto.'
      :(m||'Não foi possível entrar agora.')))),'err',{ms:5000});
  }finally{ if(btn){btn.disabled=false;btn.textContent=mode==='criar'?'Criar minha conta':'Entrar'} }
}
async function setUserFromSession(session){
  if(!session){State.user=null;return}
  const u=session.user;
  const {data:p}=await SB.from('profiles').select('*').eq('id',u.id).maybeSingle();
  State.user={id:u.id,nome:(p&&p.nome)||u.user_metadata?.nome||u.email.split('@')[0],email:u.email,
    admin:!!(p&&p.role==='admin'),cpf:(p&&p.cpf)||'',telefone:(p&&p.telefone)||''};
}

/* ---------- 31c. AMBIENTE: cursor e luz que seguem o mouse ---------- */
function initAmbiente(){
  const fine=window.matchMedia('(pointer:fine)').matches;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine)return;
  const root=document.documentElement;
  let tx=innerWidth/2,ty=180,cx=tx,cy=ty,dx=tx,dy=ty;
  let dot=null,ring=null;
  if(!reduce){
    dot=document.createElement('div');dot.className='cur-dot';
    ring=document.createElement('div');ring.className='cur-ring';
    document.body.append(dot,ring);document.body.classList.add('cur');
  }
  window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;dx=tx;dy=ty;
    if(dot)dot.style.transform=\`translate(\${dx-3}px,\${dy-3}px)\`;
    document.body.classList.remove('cur-off')},{passive:true});
  document.addEventListener('pointerleave',()=>document.body.classList.add('cur-off'));
  document.addEventListener('pointerdown',()=>ring&&ring.classList.add('down'));
  document.addEventListener('pointerup',()=>ring&&ring.classList.remove('down'));
  document.addEventListener('pointerover',e=>{
    if(!ring)return;
    const t=e.target;
    const texto=t.closest&&t.closest('input:not([type=checkbox]):not([type=range]),textarea');
    ring.classList.toggle('txt',!!texto);
    ring.classList.toggle('hov',!texto&&!!(t.closest&&t.closest('a,button,label,.card,select,[role=button],.size,.chip,.sw')));
  });
  (function loop(){
    cx+=(tx-cx)*.08; cy+=(ty-cy)*.08;
    root.style.setProperty('--mx',cx.toFixed(1)+'px'); root.style.setProperty('--my',cy.toFixed(1)+'px');
    if(ring){ const rx=ring.__x=(ring.__x??dx)+(dx-(ring.__x??dx))*.18, ry=ring.__y=(ring.__y??dy)+(dy-(ring.__y??dy))*.18;
      ring.style.transform=\`translate(\${rx}px,\${ry}px) translate(-50%,-50%)\`; }
    requestAnimationFrame(loop);
  })();
}

/* ---------- 32. EVENTOS GLOBAIS ---------- */`);

rep('cursor-dot-transform',`    if(dot)dot.style.transform=\`translate(\${dx-3}px,\${dy-3}px)\`;`,`    if(dot)dot.style.transform=\`translate(\${dx}px,\${dy}px) translate(-50%,-50%)\`;`);

rep('is-admin',`function isAdmin(){return !!(State.user&&emailEhAdmin(State.user.email))}`,
`function isAdmin(){
  if(ONLINE) return !!(State.user&&State.user.admin);     // papel vem de profiles.role
  return !!(State.user&&emailEhAdmin(State.user.email));
}`);

rep('sair',`  else if(A==='sair'){State.user=null;saveUser();toast('Você saiu da conta.','info');go('/');return}`,
`  else if(A==='sair'){if(ONLINE)SB.auth.signOut();State.user=null;State.orders=[];saveUser();toast('Você saiu da conta.','info');go('/');return}`);

/* ===================== ROTAS ===================== */
rep('rota-checkout',
`  else if(A==='checkout'){main.innerHTML=viewCheckout();bindCheckout()}
  else if(A==='pedidos'){main.innerHTML=viewOrders()}`,
`  else if(A==='checkout'&&(B==='sucesso'||B==='pendente')){
    const num=q.get('pedido')||'';
    main.innerHTML=viewOrderResult(num,B);bindOrderResult(num);
    setSEO('Pedido '+num+' — ALVEXZ IMPORTS','Situação do seu pedido.');
  }
  else if(A==='checkout'){main.innerHTML=viewCheckout();bindCheckout()}
  else if(A==='pedidos'){
    if(ONLINE&&!State.user){main.innerHTML=viewAuthGate('Seus pedidos, códigos Pix e rastreios ficam na sua conta.');bindAuthGate()}
    else if(ONLINE){main.innerHTML=skeletonGrid(4);loadOrders().then(()=>{if(currentPath().startsWith('/pedidos')){main.innerHTML=viewOrders();bindCommon()}})}
    else main.innerHTML=viewOrders();
  }`);

rep('rota-admin',
`  else if(A==='admin'){
    if(!isAdmin()){
      main.innerHTML=viewAdmin();                       // tela de acesso restrito
      if(State.user)toast('Conta sem permissão de administrador.','err');
    } else main.innerHTML=viewAdmin();
  }`,
`  else if(A==='admin'){
    if(!isAdmin()){
      main.innerHTML=viewAdmin();                       // tela de acesso restrito
      if(State.user)toast('Conta sem permissão de administrador.','err');
    } else if(ONLINE){
      main.innerHTML=viewAdmin();
      Promise.all([loadOrders(),admLoadCupons()]).then(()=>{
        if(currentPath().startsWith('/admin')&&$('#admMain')){$('#admMain').innerHTML=admBody();bindCommon()}
      });
    } else main.innerHTML=viewAdmin();
  }`);

/* ===================== PEDIDOS (cliente) ===================== */
rep('orders-img',
`          <img src="\${p?p.imgs[0]:''}" alt="" style="width:46px;height:56px;border-radius:6px;object-fit:cover;background:var(--nevoa)" loading="lazy">`,
`          <img src="\${esc(it.img||(p?p.imgs[0]:''))}" alt="" style="width:46px;height:56px;border-radius:6px;object-fit:cover;background:var(--nevoa)" loading="lazy">`);
rep('orders-actions',
`        <button class="btn btn-ghost btn-sm" style="margin-left:auto" data-order="\${esc(o.numero)}">Detalhes</button>`,
`        <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
          \${o.status==='pend'&&o.pagarUrl?\`<a class="btn btn-primary btn-sm" href="\${esc(o.pagarUrl)}">\${o.pay==='boleto'?'Ver boleto':'Pagar agora'}</a>\`:''}
          <button class="btn btn-ghost btn-sm" data-order="\${esc(o.numero)}">Detalhes</button></div>`);
rep('order-detail-extra',
`      \${o.cupom?\`<div><span>Cupom</span><b>\${esc(o.cupom)}</b></div>\`:''}
      <div><span>Total</span><b>\${BRL(o.total)}</b></div>
    </div>`,
`      \${o.cupom?\`<div><span>Cupom</span><b>\${esc(o.cupom)}</b></div>\`:''}
      \${o.desconto?\`<div><span>Desconto</span><b>− \${BRL(o.desconto)}</b></div>\`:''}
      \${o.descontoPix?\`<div><span>Desconto Pix</span><b>− \${BRL(o.descontoPix)}</b></div>\`:''}
      \${o.rastreio?\`<div><span>Rastreio</span><b class="mono">\${esc(o.rastreio)}</b></div>\`:''}
      \${o.boletoLinha?\`<div><span>Linha digitável</span><b class="mono" style="font-size:11px;word-break:break-all">\${esc(o.boletoLinha)}</b></div>\`:''}
      <div><span>Total</span><b>\${BRL(o.total)}</b></div>
    </div>
    \${o.status==='pend'&&o.pagarUrl?\`<a class="btn btn-primary btn-block" style="margin-top:14px" href="\${esc(o.pagarUrl)}">\${o.pay==='boleto'?'Ver boleto':'Pagar agora com Pix'}</a>\`:''}`);
rep('order-cancel-online',
`  $$('[data-cancel]').forEach(b=>b.onclick=()=>{
    const o=State.orders.find(x=>x.numero===b.dataset.cancel);
    o.status='canc';saveOrders();closeModal();toast('Pedido cancelado. O estorno é solicitado em até 3 dias úteis.','info');route();
  });`,
`  $$('[data-cancel]').forEach(b=>b.onclick=async()=>{
    const o=State.orders.find(x=>x.numero===b.dataset.cancel); if(!o)return;
    if(ONLINE){
      if(o.status!=='pend'){toast('Pedido já pago: cancelamento só pelo WhatsApp, para combinar o estorno.','info',{ms:5000});return}
      const {error}=await SB.rpc('cancelar_pedido',{p_order_id:o.id});
      if(error){toast(error.message.replace(/^.*?:\\s*/,''),'err',{ms:5000});return}
      await loadOrders();closeModal();toast('Pedido cancelado. O estoque voltou para a loja.','info');route();return;
    }
    o.status='canc';saveOrders();closeModal();toast('Pedido cancelado. O estorno é solicitado em até 3 dias úteis.','info');route();
  });`);
rep('order-detail-cancel-cond',
`\${['pend','appr','prep'].includes(o.status)?\`<button class="btn btn-sm" style="flex:1;background:var(--carimbo-soft);color:var(--carimbo)" data-cancel="\${esc(o.numero)}">Cancelar pedido</button>\`:''}`,
`\${(ONLINE?['pend']:['pend','appr','prep']).includes(o.status)?\`<button class="btn btn-sm" style="flex:1;background:var(--carimbo-soft);color:var(--carimbo)" data-cancel="\${esc(o.numero)}">Cancelar pedido</button>\`:''}`);

/* ===================== ADMIN: status de pedido ===================== */
rep('adm-status',
`  $$('[data-st]').forEach(s=>s.onchange=()=>{
    const o=State.orders.find(x=>x.numero===s.dataset.st); if(!o)return;
    o.status=s.value;
    if(['sent','road','deliv'].includes(o.status)&&!o.rastreio)o.rastreio='BR'+Math.random().toString().slice(2,11)+'SP';
    saveOrders();toast(\`\${o.numero} → \${statusT(o.status)}\`,'ok');
  });`,
`  $$('[data-st]').forEach(s=>s.onchange=async()=>{
    const o=State.orders.find(x=>x.numero===s.dataset.st); if(!o)return;
    const novo=s.value;
    let rastreio=o.rastreio;
    if(['sent','road','deliv'].includes(novo)&&!rastreio){
      const r=prompt('Código de rastreio (opcional). Deixe em branco se ainda não tiver.','');
      if(r===null){s.value=o.status;return}
      rastreio=r.trim()||null;
    }
    if(ONLINE){
      const {error}=await SB.from('orders').update({status:ST_FRONT2DB[novo],codigo_rastreio:rastreio}).eq('id',o.id);
      if(error){toast('Não salvou: '+error.message,'err');s.value=o.status;return}
      o.status=novo;o.rastreio=rastreio;toast(\`\${o.numero}: \${statusT(novo)}\`,'ok');return;
    }
    o.status=novo;o.rastreio=rastreio;saveOrders();toast(\`\${o.numero}: \${statusT(novo)}\`,'ok');
  });`);

/* ===================== ADMIN: cupons / banners / categorias ===================== */
rep('adm-cup-toggle',
`  $$('[data-cup-toggle]').forEach(b=>b.onclick=()=>{const i=+b.dataset.cupToggle;COUPONS[i].ativo=!COUPONS[i].ativo;saveCatalog();$('#admMain').innerHTML=admBody();bindCommon()});
  $$('[data-ban-toggle]').forEach(b=>b.onclick=()=>{const i=+b.dataset.banToggle;BANNERS[i].ativo=!BANNERS[i].ativo;saveCatalog();$('#admMain').innerHTML=admBody();bindCommon();toast('Banner atualizado.','ok')});`,
`  $$('[data-cup-toggle]').forEach(b=>b.onclick=async()=>{
    const i=+b.dataset.cupToggle,c=COUPONS[i];
    if(ONLINE){const {error}=await SB.from('coupons').update({ativo:!c.ativo}).eq('id',c.uuid);if(error){toast(error.message,'err');return}await admLoadCupons()}
    else{c.ativo=!c.ativo;saveCatalog()}
    $('#admMain').innerHTML=admBody();bindCommon()});
  const nc=$('[data-new-cup]'); if(nc)nc.onclick=()=>{
    openModal(\`<h3>Novo cupom</h3>
      <div class="field"><label>Código</label><input class="inp mono" id="cuCode" placeholder="EX: DROP10" style="text-transform:uppercase"></div>
      <div class="row2"><div class="field"><label>Tipo</label><select class="inp" id="cuTipo"><option value="percent">Percentual</option><option value="fixo">Valor fixo</option><option value="frete">Frete grátis</option></select></div>
      <div class="field"><label>Valor</label><input class="inp mono" id="cuVal" inputmode="decimal" placeholder="10"></div></div>
      <div class="field"><label>Compra mínima (R$)</label><input class="inp mono" id="cuMin" inputmode="decimal" placeholder="0"></div>
      <div class="field"><label>Descrição curta</label><input class="inp" id="cuDesc" placeholder="10% para quem veio do Instagram"></div>
      <button class="btn btn-primary btn-block" id="cuSave">Criar cupom</button>\`);
    $('#cuSave').onclick=async()=>{
      const code=$('#cuCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),tipo=$('#cuTipo').value;
      const valor=parseFloat(($('#cuVal').value||'0').replace(',','.'))||0,min=parseFloat(($('#cuMin').value||'0').replace(',','.'))||0,desc=$('#cuDesc').value.trim();
      if(code.length<3){toast('Código com pelo menos 3 letras ou números.','err');return}
      if(tipo!=='frete'&&!(valor>0)){toast('Informe o valor do desconto.','err');return}
      if(ONLINE){
        const {error}=await SB.from('coupons').insert({codigo:code,tipo:tipo==='percent'?'percentual':(tipo==='frete'?'frete_gratis':'fixo'),valor,minimo_compra:min,descricao:desc||null});
        if(error){toast(/unique|duplicate/i.test(error.message)?'Já existe um cupom com esse código.':error.message,'err');return}
        await admLoadCupons();
      }else{COUPONS.push({code,tipo,valor,min,ativo:true,desc:desc||code});saveCatalog()}
      closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast('Cupom criado.','ok');
    };
  };
  const ncat=$('[data-new-cat]'); if(ncat)ncat.onclick=()=>{
    openModal(\`<h3>Nova categoria</h3>
      <div class="field"><label>Nome</label><input class="inp" id="caNome" placeholder="Bonés"></div>
      <div class="field"><label>Silhueta da ilustração (enquanto não há foto)</label><select class="inp" id="caTipo">
        \${['camiseta','moletom','jaqueta','calca','short','conjunto'].map(t=>\`<option value="\${t}">\${t}</option>\`).join('')}</select></div>
      <button class="btn btn-primary btn-block" id="caSave">Criar categoria</button>\`);
    $('#caSave').onclick=async()=>{
      const nome=$('#caNome').value.trim(),tipo=$('#caTipo').value;
      if(nome.length<2){toast('Nome muito curto.','err');return}
      const sl=slug(nome);
      if(ONLINE){
        const {error}=await SB.from('categories').insert({nome,slug:sl,tipo,ordem:CATS.length+1});
        if(error){toast(/unique|duplicate/i.test(error.message)?'Já existe uma categoria com esse nome.':error.message,'err');return}
        await admReload();
      }else{CATS.push({id:sl,nome,tipo,c:['#1C1C1F','#0A0A0C']});$('#admMain').innerHTML=admBody();bindCommon()}
      closeModal();toast('Categoria criada.','ok');
    };
  };
  $$('[data-ban-toggle]').forEach(b=>b.onclick=async()=>{
    const i=+b.dataset.banToggle,bn=BANNERS[i];
    if(ONLINE){const {error}=await SB.from('banners').update({ativo:!bn.ativo}).eq('id',bn.id);if(error){toast(error.message,'err');return}bn.ativo=!bn.ativo}
    else{bn.ativo=!bn.ativo;saveCatalog()}
    $('#admMain').innerHTML=admBody();bindCommon();toast('Banner atualizado.','ok')});
  $$('[data-ban-foto]').forEach(inp=>inp.onchange=async()=>{
    const f=inp.files&&inp.files[0]; if(!f)return;
    const bn=BANNERS[+inp.dataset.banFoto]; if(!bn||!ONLINE)return;
    toast('Enviando imagem…','info');
    const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=\`\${bn.id}-\${Date.now()}.\${ext}\`;
    const {error}=await SB.storage.from('banners').upload(path,f,{contentType:f.type||'image/jpeg'});
    if(error){toast('Upload falhou: '+error.message,'err');return}
    const url=SB.storage.from('banners').getPublicUrl(path).data.publicUrl;
    const {error:e2}=await SB.from('banners').update({imagem_url:url}).eq('id',bn.id);
    if(e2){toast(e2.message,'err');return}
    await admReload();toast('Imagem do banner trocada.','ok');
  });`);

rep('adm-ban-save',
`    $('#bSave').onclick=()=>{Object.assign(bn,{kicker:$('#bKick').value,titulo:$('#bTit').value,sub:$('#bSub').value,cta:$('#bCta').value,href:$('#bHref').value});
      saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast('Banner salvo.','ok')};`,
`    $('#bSave').onclick=async()=>{
      const v={kicker:$('#bKick').value,titulo:$('#bTit').value.trim(),sub:$('#bSub').value,cta:$('#bCta').value,href:$('#bHref').value.trim()};
      if(!v.titulo){toast('O banner precisa de um título.','err');return}
      if(v.href&&!/^(#\\/|\\/|https:\\/\\/)/.test(v.href)){toast('Link inválido. Use #/produtos, /produtos ou https://…','err');return}
      if(ONLINE){
        const {error}=await SB.from('banners').update({kicker:v.kicker,titulo:v.titulo,subtitulo:v.sub,cta_texto:v.cta,cta_href:v.href}).eq('id',bn.id);
        if(error){toast(error.message,'err');return}
      }
      Object.assign(bn,v);saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast('Banner salvo.','ok')};`);

rep('adm-ban-list',
`        <img src="\${b.img}" alt="" style="width:110px;height:56px;object-fit:cover;border-radius:8px">`,
`        <img src="\${esc(b.img)}" alt="" style="width:110px;height:56px;object-fit:cover;border-radius:8px">`);
rep('adm-ban-list-btns',
`        <div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" data-ban-edit="\${i}">Editar</button>
        <button class="btn btn-ghost btn-sm" data-ban-toggle="\${i}">\${b.ativo?'Ocultar':'Exibir'}</button></div></div>\`).join('')}`,
`        <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-ban-edit="\${i}">Editar</button>
        \${ONLINE?\`<label class="btn btn-ghost btn-sm">Trocar imagem<input type="file" accept="image/*" data-ban-foto="\${i}" hidden></label>\`:''}
        <button class="btn btn-ghost btn-sm" data-ban-toggle="\${i}">\${b.ativo?'Ocultar':'Exibir'}</button></div></div>\`).join('')}`);
rep('adm-ban-cta-meta',"CTA: ${esc(b.cta)} → ${esc(b.href)}","Botão: ${esc(b.cta)} (${esc(b.href)})");

/* ===================== ADMIN: logos ===================== */
rep('adm-logo-aplicar',
`    const aplicar=(url,limpou)=>{
      const antes=BRAND_LOGOS[sl];
      BRAND_LOGOS[sl]=url;
      if(!saveBrandLogos()){`,
`    const aplicar=async(url,limpou)=>{
      if(ONLINE){ await admSalvarLogo(sl,url); $('#admMain').innerHTML=admBody(); bindCommon(); return; }
      const antes=BRAND_LOGOS[sl];
      BRAND_LOGOS[sl]=url;
      if(!saveBrandLogos()){`);
rep('adm-logo-url',
`    BRAND_LOGOS[sl]=v; saveBrandLogos();
    $('#admMain').innerHTML=admBody(); bindCommon();
    toast(v?'Logo atualizada.':'Logo removida.','ok');`,
`    if(ONLINE){ admSalvarLogo(sl,v).then(()=>{$('#admMain').innerHTML=admBody(); bindCommon();}); return; }
    BRAND_LOGOS[sl]=v; saveBrandLogos();
    $('#admMain').innerHTML=admBody(); bindCommon();
    toast(v?'Logo atualizada.':'Logo removida.','ok');`);
rep('adm-logo-del',
`  $$('[data-logo-del]').forEach(b=>b.onclick=()=>{
    BRAND_LOGOS[b.dataset.logoDel]=''; saveBrandLogos();`,
`  $$('[data-logo-del]').forEach(b=>b.onclick=()=>{
    if(ONLINE){ admSalvarLogo(b.dataset.logoDel,'').then(()=>{$('#admMain').innerHTML=admBody(); bindCommon();}); return; }
    BRAND_LOGOS[b.dataset.logoDel]=''; saveBrandLogos();`);

/* ===================== ADMIN: produtos ===================== */
rep('adm-del',
`    $('#delOk').onclick=()=>{CATALOG=CATALOG.filter(x=>x.id!==p.id);saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast('Produto excluído.','ok')};`,
`    $('#delOk').onclick=async()=>{
      if(ONLINE){
        const {error}=await SB.from('products').delete().eq('id',p.uuid);
        if(error){toast('Não excluiu: '+error.message,'err');return}
        closeModal();await admReload();toast('Produto excluído.','ok');return;
      }
      CATALOG=CATALOG.filter(x=>x.id!==p.id);saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast('Produto excluído.','ok')};`);

entre('adm-pf-save',
`  const pfSave=$('#pfSave');
  if(pfSave)pfSave.onclick=()=>{`,
`    saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast(id?'Produto atualizado.':'Produto criado.','ok');
  };`,
`  const pfSave=$('#pfSave');
  if(pfSave)pfSave.onclick=async()=>{
    const id=pfSave.dataset.id;
    const nome=$('#pfNome').value.trim(),preco=parseFloat(($('#pfPreco').value||'').replace(',','.'));
    if(nome.length<3||!(preco>0)){toast('Preencha nome e preço válidos.','err');return}
    const cat=$('#pfCat').value,c=CATS.find(x=>x.id===cat);
    const tags=$$('#modalC [data-tag]').filter(t=>t.checked).map(t=>t.dataset.tag);
    const de=parseFloat(($('#pfDe').value||'').replace(',','.'))||null;
    if(de&&de<=preco){toast('O preço "de" precisa ser maior que o preço de venda.','err');return}
    const form={nome,preco,precoDe:de,cat,marca:$('#pfMarca').value,desc:$('#pfDesc').value,tags,ativo:$('#pfAtivo').checked};
    if(ONLINE){
      const estoques={}; $$('#modalC [data-vest]').forEach(i=>estoques[i.dataset.vest]=Math.max(0,parseInt(i.value)||0));
      const estoque={}; $$('#modalC [data-est]').forEach(i=>estoque[i.dataset.est]=Math.max(0,parseInt(i.value)||0));
      const corSel=$('#pfCor'); const cor=corSel?COLORWAYS.find(x=>x.nome===corSel.value)||COLORWAYS[0]:COLORWAYS[0];
      pfSave.disabled=true; pfSave.textContent='Salvando…';
      const ok=await admSalvarProduto(id,{...form,estoques,estoque,cor});
      pfSave.disabled=false; pfSave.textContent=id?'Salvar alterações':'Criar produto';
      if(!ok)return;
      closeModal();await admReload();toast(id?'Produto atualizado.':'Produto criado. Abra "Editar" para enviar as fotos.','ok',{ms:5000});return;
    }
    const est={};$$('#modalC [data-est]').forEach(i=>est[i.dataset.est]=Math.max(0,parseInt(i.value)||0));
    if(id){
      const p=CATALOG.find(x=>x.id===id);
      Object.assign(p,{nome,preco,precoDe:de,cat,catNome:c.nome,marca:form.marca,desc:form.desc,tags,estoque:est,ativo:form.ativo});
    }else{
      const np=mkProduct({id:slug(nome).slice(0,20)+'-'+Math.random().toString(36).slice(2,5),nome,marca:form.marca,cat,preco,precoDe:de,desc:form.desc,tags});
      np.estoque=est;np.ativo=form.ativo;
      const cc=np.cores[0];
      np.imgs=[garment(np.tipo,cc.hex,cc.hex2,'#F6F6F7'),garment(np.tipo,np.cores[1].hex,np.cores[1].hex2,'#EFEFF1'),garment(np.tipo,cc.hex2,cc.hex,'#EBEBEE'),garment(np.tipo,'#8B8B93','#56565E','#F6F6F7')];
      CATALOG.unshift(np);
    }
    saveCatalog();closeModal();$('#admMain').innerHTML=admBody();bindCommon();toast(id?'Produto atualizado.':'Produto criado.','ok');
  };
  // fotos do produto (modo banco)
  const pfFotos=$('#pfFotos');
  if(pfFotos)pfFotos.onchange=async()=>{
    const p=CATALOG.find(x=>x.id===pfFotos.dataset.pid); if(!p||!pfFotos.files.length)return;
    toast('Enviando '+pfFotos.files.length+' foto(s)…','info');
    await admUploadFotos(p,[...pfFotos.files]);
    await admReload(); admProductForm(p.id);
  };
  $$('[data-foto-del]').forEach(b=>b.onclick=async()=>{
    const p=CATALOG.find(x=>x.id===b.dataset.pid); if(!p)return;
    await admRemoverFoto(b.dataset.fotoDel,b.dataset.url);
    await admReload(); admProductForm(p.id); toast('Foto removida.','info');
  });`);

/* formulário de produto: estoque por variante + fotos no modo banco */
rep('adm-pf-form-estoque',
`    <div class="field"><label>Estoque por tamanho</label>
      <div style="display:flex;gap:7px;flex-wrap:wrap">\${(p?p.sizes:SZ.roupa).map(s=>\`<div style="text-align:center">
        <div class="mono" style="font-size:11px;color:var(--texto-2);margin-bottom:3px">\${s}</div>
        <input class="inp mono" data-est="\${s}" inputmode="numeric" value="\${p?stockOf(p,s):0}" style="width:60px;height:40px;text-align:center;padding:0"></div>\`).join('')}</div></div>`,
`    \${ONLINE&&p?\`<div class="field"><label>Estoque por tamanho e cor</label>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Tam</th><th>Cor</th><th>Estoque</th></tr></thead><tbody>
      \${(p.variantes||[]).slice().sort((a,b)=>tamOrd(a.tamanho)-tamOrd(b.tamanho)||a.cor.localeCompare(b.cor)).map(v=>\`<tr><td class="mono">\${esc(v.tamanho)}</td><td>\${esc(v.cor)}</td>
        <td><input class="inp mono" data-vest="\${esc(v.id)}" inputmode="numeric" value="\${v.estoque}" style="width:80px;height:38px;text-align:center;padding:0"></td></tr>\`).join('')}
      </tbody></table></div></div>\`
    :\`<div class="field"><label>Estoque por tamanho\${ONLINE?' (cor abaixo)':''}</label>
      <div style="display:flex;gap:7px;flex-wrap:wrap">\${(p?p.sizes:SZ.roupa).map(s=>\`<div style="text-align:center">
        <div class="mono" style="font-size:11px;color:var(--texto-2);margin-bottom:3px">\${s}</div>
        <input class="inp mono" data-est="\${s}" inputmode="numeric" value="\${p?stockOf(p,s):0}" style="width:60px;height:40px;text-align:center;padding:0"></div>\`).join('')}</div></div>
    \${ONLINE?\`<div class="field"><label>Cor desta grade</label><select class="inp" id="pfCor">\${COLORWAYS.map(c=>\`<option>\${esc(c.nome)}</option>\`).join('')}</select></div>\`:''}\`}`);

rep('adm-pf-form-fotos',
`    <div class="field"><label>Fotos</label>
      <div style="display:flex;gap:7px">\${(p?.imgs||[garment('camiseta')]).map(im=>\`<img src="\${im}" alt="" style="width:52px;height:64px;border-radius:6px;object-fit:cover;border:1px solid var(--linha)">\`).join('')}
      <button class="btn btn-ghost btn-sm" style="height:64px">+ Enviar</button></div>
      <div class="hint">Em produção, o upload envia para o bucket <b class="mono">product-images</b> do Supabase Storage.</div></div>`,
`    <div class="field"><label>Fotos</label>
      \${ONLINE&&p?\`<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:flex-start">
        \${p.fotos.map(f=>\`<div style="position:relative"><img src="\${esc(f.url)}" alt="" style="width:64px;height:78px;border-radius:6px;object-fit:cover;border:1px solid var(--linha)">
          <button type="button" data-foto-del="\${esc(f.id)}" data-url="\${esc(f.url)}" data-pid="\${esc(p.id)}" aria-label="Remover foto" style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:var(--carimbo);color:#fff;font-size:12px;line-height:1">×</button></div>\`).join('')}
        <label class="btn btn-ghost btn-sm" style="height:78px">+ Enviar fotos<input type="file" id="pfFotos" data-pid="\${esc(p.id)}" accept="image/*" multiple hidden></label></div>
        <div class="hint">\${p.fotos.length?'A primeira foto é a capa. ':'Sem foto ainda: a loja mostra a ilustração. '}JPG, PNG ou WebP.</div>\`
      :(ONLINE?\`<div class="hint">Salve o produto primeiro. Depois, em "Editar", envie as fotos.</div>\`
      :\`<div style="display:flex;gap:7px">\${(p?.imgs||[garment('camiseta')]).map(im=>\`<img src="\${im}" alt="" style="width:52px;height:64px;border-radius:6px;object-fit:cover;border:1px solid var(--linha)">\`).join('')}</div>
      <div class="hint">No modo banco o upload vai para o bucket <b class="mono">product-images</b>.</div>\`)}</div>`);

/* funções de gravação do painel */
rep('adm-db-funcs',
`/* ---------- 22. RODAPÉ ---------- */`,
`/* ---------- 21b. PAINEL: gravação no banco ----------
   Tudo aqui passa pelas policies RLS (só admin escreve). Depois de gravar,
   recarrega o catálogo do banco para a tela refletir o que foi salvo. */
async function admReload(){
  try{await loadCatalog();}catch(e){toast('Erro ao recarregar catálogo: '+e.message,'err')}
  const m=$('#admMain'); if(m){m.innerHTML=admBody();bindCommon()}
}
async function admSalvarProduto(id,form){
  const brand=DB_BRANDS.find(b=>b.nome===form.marca), cat=CATS.find(c=>c.id===form.cat);
  if(!brand||!cat){toast('Marca ou categoria inválida.','err');return false}
  const p=id?CATALOG.find(x=>x.id===id):null;
  const det=Object.assign({},p?{comp:p.comp,origem:p.origem,peso:p.peso,modelo:p.modelo,cores:p.cores}:{cores:[form.cor||COLORWAYS[0]]},{tipo:cat.tipo});
  const row={nome:form.nome,descricao:form.desc,preco:form.preco,preco_de:form.precoDe,brand_id:brand.id,category_id:cat.uuid,
    destaque:form.tags.includes('destaque'),mais_vendido:form.tags.includes('maisvendido'),novidade:form.tags.includes('novidade'),
    promocao:form.tags.includes('promo'),ativo:form.ativo,detalhes:det};
  if(p){
    const {error}=await SB.from('products').update(row).eq('id',p.uuid); if(error){toast('Não salvou: '+error.message,'err');return false}
    for(const [vid,q] of Object.entries(form.estoques||{})){
      const v=(p.variantes||[]).find(x=>x.id===vid); if(!v||v.estoque===q)continue;
      const {error:e2}=await SB.from('product_variants').update({estoque:q}).eq('id',vid); if(e2){toast(e2.message,'err');return false}
    }
  }else{
    const sku='ALV-'+Date.now().toString(36).toUpperCase().slice(-6);
    let sl=slug(form.nome).slice(0,60); if(CATALOG.some(x=>x.id===sl)) sl+='-'+Math.random().toString(36).slice(2,5);
    const {data,error}=await SB.from('products').insert({...row,sku,slug:sl,ordem:CATALOG.length}).select('id').single();
    if(error){toast('Não criou: '+error.message,'err');return false}
    const cor=form.cor||COLORWAYS[0];
    const vars=Object.entries(form.estoque||{}).map(([t,q])=>({product_id:data.id,tamanho:t,cor:cor.nome,cor_hex:cor.hex,estoque:q,sku_variante:sku+'-'+t}));
    if(vars.length){const {error:e3}=await SB.from('product_variants').insert(vars); if(e3){toast(e3.message,'err');return false}}
  }
  return true;
}
async function admUploadFotos(p,files){
  for(const f of files){
    const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=\`\${p.uuid}/\${Date.now()}-\${Math.random().toString(36).slice(2,6)}.\${ext}\`;
    const {error}=await SB.storage.from('product-images').upload(path,f,{contentType:f.type||'image/jpeg'});
    if(error){toast('Upload falhou: '+error.message,'err');return}
    const url=SB.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    const {error:e2}=await SB.from('product_images').insert({product_id:p.uuid,url,alt:p.nome,ordem:(p.fotos||[]).length+1});
    if(e2){toast(e2.message,'err');return}
    p.fotos=(p.fotos||[]).concat([{url}]);
  }
  toast('Foto enviada.','ok');
}
async function admRemoverFoto(fotoId,url){
  await SB.from('product_images').delete().eq('id',fotoId);
  const m=(url||'').split('/product-images/')[1];
  if(m) await SB.storage.from('product-images').remove([decodeURIComponent(m.split('?')[0])]);
}
/** Logo de marca: data URL vira arquivo no bucket brand-logos; link fica como está; vazio remove. */
async function admSalvarLogo(sl,url){
  const b=DB_BRANDS.find(x=>x.slug===sl); if(!b){toast('Marca não encontrada no banco.','err');return}
  let final=url||null;
  if(url&&url.startsWith('data:')){
    const blob=await (await fetch(url)).blob();
    const ext=blob.type.includes('svg')?'svg':(blob.type.includes('webp')?'webp':'png');
    const path=\`\${sl}.\${ext}\`;
    const {error}=await SB.storage.from('brand-logos').upload(path,blob,{contentType:blob.type||'image/png',upsert:true});
    if(error){toast('Upload falhou: '+error.message,'err');return}
    final=SB.storage.from('brand-logos').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
  }
  const {error}=await SB.from('brands').update({logo_url:final}).eq('id',b.id);
  if(error){toast(error.message,'err');return}
  b.logo_url=final;
  BRAND_LOGOS={...BRAND_LOGOS_PADRAO}; DB_BRANDS.forEach(x=>{if(x.logo_url)BRAND_LOGOS[x.slug]=x.logo_url});
  toast(final?'Logo salva no banco.':'Logo removida. Voltou a padrão.','ok');
}

/* ---------- 22. RODAPÉ ---------- */`);

/* ===================== BOOT ===================== */
rep('boot',
`(async function init(){
  await Persist.init();
  loadBrandLogos();
  const saved=Persist.get('catalog',null);
  seedCatalog();
  if(saved&&saved.CATALOG&&saved.CATALOG.length){
    CATALOG=saved.CATALOG;BANNERS=saved.BANNERS||BANNERS;COUPONS=saved.COUPONS||COUPONS;
  }
  State.cart=Persist.get('cart',[]).filter(i=>CATALOG.some(p=>p.id===i.id));
  State.fav=Persist.get('fav',[]).filter(id=>CATALOG.some(p=>p.id===id));
  State.user=Persist.get('user',null);
  State.orders=Persist.get('orders',[]);`,
`(async function init(){
  await Persist.init();
  loadBrandLogos();
  /* Modo banco: só vira ONLINE se o catálogo do Supabase carregar de verdade.
     Qualquer falha (sem rede, chave errada, projeto pausado) cai no modo local
     e a loja continua abrindo, com aviso no console. */
  if(SB){
    try{ await loadCatalog(); ONLINE=true; }
    catch(e){ console.warn('Supabase indisponível, usando catálogo local:',e.message); }
  }
  if(!ONLINE){
    const saved=Persist.get('catalog',null);
    seedCatalog();
    if(saved&&saved.CATALOG&&saved.CATALOG.length){
      CATALOG=saved.CATALOG;BANNERS=saved.BANNERS||BANNERS;COUPONS=saved.COUPONS||COUPONS;
    }
  }
  State.cart=Persist.get('cart',[]).filter(i=>CATALOG.some(p=>p.id===i.id));
  State.fav=Persist.get('fav',[]).filter(id=>CATALOG.some(p=>p.id===id));
  if(ONLINE){
    try{
      const {data:{session}}=await SB.auth.getSession();
      await setUserFromSession(session);
    }catch(e){ console.warn('sessão',e.message); }
    SB.auth.onAuthStateChange((ev,s)=>{
      setTimeout(async()=>{
        if(ev==='SIGNED_OUT'){State.user=null;State.orders=[];renderDrawer();return}
        if(ev==='SIGNED_IN'&&s&&(!State.user||State.user.id!==s.user.id)){await setUserFromSession(s);renderDrawer()}
      },0);
    });
    State.orders=[];
  }else{
    State.user=Persist.get('user',null);
    State.orders=Persist.get('orders',[]);
  }`);
rep('boot-ambiente',`  initTopbar();renderFooter();initEvents();paintBadges();`,`  initTopbar();renderFooter();initEvents();paintBadges();initAmbiente();`);
rep('boot-log',"`loja carregada · persistência: ${Persist.mode} · ${CATALOG.length} produtos`","`loja carregada / ${ONLINE?'banco Supabase':'modo local ('+Persist.mode+')'} / ${CATALOG.length} produtos`");

fs.writeFileSync(ARQ,src);
console.log('ok:',feitos.length,'trechos aplicados');
