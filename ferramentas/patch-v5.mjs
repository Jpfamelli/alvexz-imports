// v5: rodada funcional.
//  - favoritos de verdade (coração nos cards e na ficha, link no menu)
//  - "Vistos recentemente" na home e na ficha
//  - esqueleto na tela enquanto o catálogo vem do banco
//  - voltar/avançar restaura a posição da rolagem
//  - compartilhar produto (Web Share, cai em copiar link)
//  - "Qual meu tamanho?" (altura + peso → sugestão) e aviso de tamanho esgotado
//  - buscas recentes ao focar a busca
//  - app instalável: manifesto, ícones, service worker (só em http/https)
// Uso: node ferramentas/patch-v5.mjs  (idempotente; backup em alvexz-store.v4.html)
import fs from 'node:fs';
const ARQ=new URL('../index.html',import.meta.url);
let src=fs.readFileSync(ARQ,'utf8');
if(src.includes('/* v5: funcional */')){console.log('já aplicado');process.exit(0)}
fs.writeFileSync(new URL('../alvexz-store.v4.html',import.meta.url),src);
const feitos=[];
function rep(nome,a,b){
  const n=src.split(a).length-1;
  if(n===0) throw new Error('âncora não encontrada ['+nome+']: '+a.slice(0,90));
  if(n>1) throw new Error('âncora ambígua ['+nome+'] ('+n+'x): '+a.slice(0,90));
  src=src.replace(a,()=>b); feitos.push(nome);
}

/* ===================== HEAD: favicon, manifesto, CSP ===================== */
rep('csp',`form-action 'self'">`,`form-action 'self'; manifest-src 'self'; worker-src 'self'">`);
rep('head-icones',`<meta name="theme-color" content="#0A0A0C">`,
`<meta name="theme-color" content="#0A0A0C">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230A0A0C'/%3E%3Cpath d='M32 10 50 56H40.5L37 46H27L23.5 56H14Zm0 15-3.6 13h7.2Z' fill='%23fff'/%3E%3C/svg%3E">
<script>
/* Manifesto e ícone da tela inicial precisam de caminho absoluto, e ele muda
   conforme a hospedagem (raiz ou subpasta). Montado aqui, antes de tudo. */
(function(){
  if(location.protocol!=='http:'&&location.protocol!=='https:')return;
  var b=(typeof window.ALVEXZ_BASE==='string')?window.ALVEXZ_BASE.replace(/\\/+$/,'')
       :(/\\.github\\.io$/i.test(location.hostname)?'/'+(location.pathname.split('/')[1]||''):'');
  var add=function(rel,href){var l=document.createElement('link');l.rel=rel;l.href=b+href;document.head.appendChild(l)};
  add('manifest','/manifest.webmanifest');
  add('apple-touch-icon','/imagens/icone-180.png');
})();
</script>`);

/* ===================== CSS ===================== */
rep('css',`@keyframes beat{0%,100%{transform:scale(1)}35%{transform:scale(1.35)}}`,
`@keyframes beat{0%,100%{transform:scale(1)}35%{transform:scale(1.35)}}
/* v5: funcional */
.fav.hb{top:42px;background:rgba(16,16,20,.82);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.12);box-shadow:none}
.fav.hb:hover{background:#fff;color:var(--tinta)}
.fav.hb.on{color:var(--carimbo);background:#fff}
.fav.hb.on svg{fill:currentColor}
.pdp-acts{display:flex;gap:8px;margin-top:10px}
.pdp-acts .btn{flex:1}
.pdp-acts .btn.on{color:var(--carimbo);border-color:rgba(255,255,255,.3)}
.pdp-acts .btn.on svg{fill:currentColor}
.sz-aviso{margin:10px 0 0;font-size:12.5px;color:var(--texto-2)}
.sz-aviso a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.szh{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 8px}
.szh label{font-size:12px;color:var(--texto-2);display:grid;gap:6px}
.szh-r{margin:8px 0 14px;font-size:14px;min-height:22px;line-height:1.5}
.sk-hero{margin:10px 10px 0;min-height:540px;border-radius:var(--r-xl)}
@media(min-width:768px){.sk-hero{margin:16px 22px 0;min-height:560px}}
@media(min-width:1200px){.sk-hero{margin:16px auto 0;max-width:calc(var(--max) - 44px)}}
.sk-sec{padding:34px 14px 0;max-width:var(--max);margin:0 auto}
.sg-row{display:flex;align-items:center;justify-content:space-between;padding-right:12px}
.sg-x{font-size:11.5px;color:var(--texto-3);text-decoration:underline;text-underline-offset:3px}
.sg-x:hover{color:#fff}`);

/* ===================== ESTADO / PERSISTÊNCIA ===================== */
rep('persist-keys',`KEYS=['cart','fav','user','orders','catalog','cookies','recent','brandlogos']`,
`KEYS=['cart','fav','user','orders','catalog','cookies','recent','brandlogos','buscas']`);
rep('state-buscas',`cart:[], fav:[], user:null, orders:[], cookies:null, recent:[],`,
`cart:[], fav:[], user:null, orders:[], cookies:null, recent:[], buscas:[],`);
rep('boot-buscas',`  State.recent=Persist.get('recent',[]);`,
`  State.recent=Persist.get('recent',[]);
  State.buscas=Persist.get('buscas',[]).slice(0,6);`);

/* ===================== FAVORITOS ===================== */
rep('fav-toast',`  else{State.fav.push(pid);toast('Salvo nos favoritos.','ok')}`,
`  else{State.fav.push(pid);toast('Salvo nos favoritos.','ok',{action:'Ver favoritos',onAction:()=>go('/favoritos')})}`);
rep('fav-sync',`  $$('.fav[data-fav="'+pid+'"]').forEach(b=>b.classList.toggle('on',State.fav.includes(pid)));`,
`  $$('[data-fav="'+pid+'"]').forEach(b=>{b.classList.toggle('on',State.fav.includes(pid));
    const l=b.querySelector('.fl'); if(l)l.textContent=State.fav.includes(pid)?'Salvo':'Salvar';
    b.setAttribute('aria-pressed',State.fav.includes(pid)?'true':'false')});`);
rep('card-heart',`    </button>
    <div class="card-b">`,
`    </button>
    <button class="fav hb\${fav?' on':''}" data-fav="\${esc(p.id)}" aria-label="\${fav?'Remover dos favoritos':'Salvar nos favoritos'}" aria-pressed="\${fav?'true':'false'}">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>
    </button>
    <div class="card-b">`);
rep('drawer-fav',`    \${item('#/pedidos','Meus pedidos',IC.box)}`,
`    \${item('#/pedidos','Meus pedidos',IC.box)}
    \${item('#/favoritos','Favoritos',IC.heart,'',State.fav.length?'<span class="flag">'+State.fav.length+'</span>':'')}`);

/* ===================== VISTOS RECENTEMENTE + ESQUELETO ===================== */
rep('recent-fn',`function sectionHTML(eyebrow,title,href,inner,rail=false){`,
`function recentHTML(excluir){
  const l=State.recent.filter(id=>id!==excluir).map(id=>CATALOG.find(p=>p.id===id&&p.ativo)).filter(Boolean).slice(0,8);
  return l.length?sectionHTML('','Vistos recentemente','',l.map(cardHTML).join(''),true):'';
}
function skeletonHome(){
  return \`<div class="sk sk-hero" aria-hidden="true"></div>
  <div class="sk-sec" aria-busy="true" aria-label="Carregando a loja"><div class="sk" style="height:46px;width:min(240px,60%);margin-bottom:18px"></div></div>
  \${skeletonGrid(8)}\`;
}
function sectionHTML(eyebrow,title,href,inner,rail=false){`);
rep('home-recent',`  \${promos.length?sectionHTML('','Promoções','#/promocoes',promos.map(cardHTML).join('')):''}`,
`  \${promos.length?sectionHTML('','Promoções','#/promocoes',promos.map(cardHTML).join('')):''}
  \${recentHTML()}`);
rep('pdp-recent',`  \${rel.length?sectionHTML('Quem viu este, viu também','Você também pode gostar','#/c/'+p.cat,rel.map(cardHTML).join(''),true):''}`,
`  \${rel.length?sectionHTML('Quem viu este, viu também','Você também pode gostar','#/c/'+p.cat,rel.map(cardHTML).join(''),true):''}
  \${recentHTML(p.id)}`);
rep('boot-skeleton',`  await Persist.init();
  loadBrandLogos();`,
`  await Persist.init();
  loadBrandLogos();
  /* Enquanto o catálogo vem do banco a tela mostra o esqueleto da home,
     em vez de ficar preta. */
  if(SB){ $('#main').innerHTML=skeletonHome(); }`);

/* ===================== PDP: compartilhar, salvar, tamanho, aviso ===================== */
rep('pdp-acts',`        <button class="btn btn-dark btn-lg btn-block" id="buyNow" \${st===0?'disabled':''}>Comprar agora</button>
      </div>`,
`        <button class="btn btn-dark btn-lg btn-block" id="buyNow" \${st===0?'disabled':''}>Comprar agora</button>
      </div>
      <div class="pdp-acts">
        <button class="btn btn-ghost btn-sm\${State.fav.includes(p.id)?' on':''}" data-fav="\${esc(p.id)}" aria-pressed="\${State.fav.includes(p.id)?'true':'false'}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/></svg>
          <span class="fl">\${State.fav.includes(p.id)?'Salvo':'Salvar'}</span></button>
        <button class="btn btn-ghost btn-sm" id="pdpShare">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
          Compartilhar</button>
      </div>`);
rep('pdp-size-help',`<a href="#" data-tab="tam">Tabela de medidas</a></div>`,
`<span style="display:flex;gap:14px"><a href="#" id="szHelp">Qual meu tamanho?</a><a href="#" data-tab="tam">Tabela de medidas</a></span></div>`);
rep('pdp-aviso',`      <div id="szErr" class="err">\${svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',13)} Escolha um tamanho antes de continuar.</div>`,
`      <div id="szErr" class="err">\${svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',13)} Escolha um tamanho antes de continuar.</div>
      \${p.sizes.some(s=>stockOf(p,s)<=0)?\`<p class="sz-aviso">Seu tamanho esgotou? <a href="\${esc('https://wa.me/'+CONFIG.whatsapp+'?text='+encodeURIComponent('Oi! Quero ser avisado quando a peça '+p.marca+' '+p.nome+' (SKU '+p.sku+') voltar no meu tamanho.'))}" target="_blank" rel="noopener">Me avise quando voltar</a></p>\`:''}`);
rep('pdp-bind',`  $('#addCart').onclick=add;
  const a2=$('#addCart2'); if(a2)a2.onclick=add;`,
`  $('#addCart').onclick=add;
  const a2=$('#addCart2'); if(a2)a2.onclick=add;
  // compartilhar: Web Share onde existe (celular), senão copia o link
  const sh=$('#pdpShare'); if(sh)sh.onclick=async()=>{
    const url=location.href, dados={title:p.marca+' '+p.nome,text:p.nome+' por '+BRL(p.preco)+' na ALVEXZ IMPORTS',url};
    if(navigator.share){ try{await navigator.share(dados);return}catch(e){ if(e&&e.name==='AbortError')return } }
    try{await navigator.clipboard.writeText(url);toast('Link copiado.','ok')}
    catch(e){openModal('<h3>Copie o link</h3><input class="inp" readonly value="'+esc(url)+'" onfocus="this.select()" style="margin-top:12px">')}
  };
  // qual meu tamanho: altura + peso dão uma sugestão aproximada
  const szh=$('#szHelp'); if(szh)szh.onclick=e=>{e.preventDefault();
    openModal(\`<h3>Qual meu tamanho?</h3>
      <p style="color:var(--texto-2);font-size:13px;margin:6px 0 0">Sugestão aproximada para a modelagem <b>\${esc(p.modelo)}</b>. Em dúvida entre dois, escolha o maior: a numeração importada costuma ser menor que a brasileira.</p>
      <div class="szh">
        <label>Altura (cm)<input class="inp" id="szhA" type="number" inputmode="numeric" min="140" max="220" placeholder="175"></label>
        <label>Peso (kg)<input class="inp" id="szhP" type="number" inputmode="numeric" min="35" max="160" placeholder="72"></label>
      </div>
      <div id="szhR" class="szh-r"></div>
      <button class="btn btn-primary btn-block" id="szhGo">Calcular</button>\`);
    const calc=()=>{
      const a=+$('#szhA').value, pe=+$('#szhP').value, r=$('#szhR');
      if(!(a>=140&&a<=220&&pe>=35&&pe<=160)){r.innerHTML='<span style="color:var(--carimbo)">Confira a altura (140–220 cm) e o peso (35–160 kg).</span>';return}
      const base=pe+(a-175)*0.35;
      const t=base<56?'PP':base<66?'P':base<78?'M':base<91?'G':'GG';
      const tem=stockOf(p,t)>0;
      r.innerHTML=\`Para \${a} cm e \${pe} kg, sugerimos <b class="disp" style="font-size:30px;margin-left:4px">\${t}</b><br>
        <span style="color:var(--texto-2);font-size:13px">\${tem?'Tem no estoque desta peça.':'Esse tamanho está esgotado nesta peça.'}</span>
        <div style="margin-top:12px"><button class="btn btn-dark btn-sm" id="szhUse" \${tem?'':'disabled'}>Usar \${t}</button></div>\`;
      $('#szhUse').onclick=()=>{closeModal();const b=$('.size[data-size="'+t+'"]');if(b){b.click();b.scrollIntoView({behavior:'smooth',block:'center'})}};
    };
    $('#szhGo').onclick=calc;
    $$('#szhA,#szhP').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')calc()});
    $('#szhA').focus();
  };`);

/* ===================== BUSCAS RECENTES ===================== */
rep('busca-salva',`function goSearch(){
  const t=$('#q').value.trim(); if(!t)return;`,
`function lembrarBusca(t){
  const v=t.trim().slice(0,40); if(!v)return;
  State.buscas=[v,...State.buscas.filter(x=>x.toLowerCase()!==v.toLowerCase())].slice(0,6);
  Persist.set('buscas',State.buscas);
}
function goSearch(){
  const t=$('#q').value.trim(); if(!t)return;
  lembrarBusca(t);`);
rep('busca-recentes',`  if(!t){box.classList.remove('on');$('#q').setAttribute('aria-expanded','false');return}`,
`  if(!t){
    if(!State.buscas.length){box.classList.remove('on');$('#q').setAttribute('aria-expanded','false');return}
    box.innerHTML=\`<div class="sg-row"><div class="sg-h">Buscas recentes</div><button class="sg-x" id="sgClear" type="button">limpar</button></div>
      <div style="padding:0 6px 10px">\${State.buscas.map(b=>\`<a href="#/busca?q=\${encodeURIComponent(b)}" class="sg-chip">\${esc(b)}</a>\`).join('')}</div>\`;
    $('#sgClear').onclick=()=>{State.buscas=[];Persist.set('buscas',[]);closeSuggest()};
    box.classList.add('on');$('#q').setAttribute('aria-expanded','true');sugIndex=-1;return;
  }`);
rep('busca-focus',`  q.addEventListener('focus',()=>{if(q.value.trim())renderSuggest(q.value)});`,
`  q.addEventListener('focus',()=>renderSuggest(q.value));`);
rep('busca-rota',`  else if(A==='busca'){ctxGuard('busca/'+(q.get('q')||''));const t=q.get('q')||'';$('#q').value=t;const res=search(t);`,
`  else if(A==='busca'){ctxGuard('busca/'+(q.get('q')||''));const t=q.get('q')||'';$('#q').value=t;lembrarBusca(t);const res=search(t);`);

/* ===================== ROLAGEM: voltar restaura a posição ===================== */
rep('scroll-vars',`let lastRouted='';
function route(){`,
`/* Posição da rolagem por caminho. Voltar/avançar restaura; link novo vai ao topo. */
const SCROLLS={}; let POP=false, PUSHING=false;
if('scrollRestoration' in history) history.scrollRestoration='manual';
let lastRouted='';
function route(){`);
rep('go-history',`    if(url===location.pathname+location.search){route();return}
    history[repl?'replaceState':'pushState']({},'',url);`,
`    if(url===location.pathname+location.search){route();return}
    SCROLLS[currentPath()]=window.scrollY;
    history[repl?'replaceState':'pushState']({},'',url);`);
rep('go-hash',`    if(location.hash===alvo){route();return}
    if(repl) location.replace(alvo); else location.hash=alvo;`,
`    if(location.hash===alvo){route();return}
    SCROLLS[currentPath()]=window.scrollY; PUSHING=true;
    if(repl) location.replace(alvo); else location.hash=alvo;`);
rep('route-top',`  window.scrollTo({top:0,behavior:'instant'});`,
`  const restaurar=POP?(SCROLLS[currentPath()]||0):0; POP=false;
  window.scrollTo({top:0,behavior:'instant'});`);
rep('route-fim',`  bindCommon();
  closeMenu();closeSuggest();
  $('#waBtn').classList.toggle('up',A==='p'&&window.innerWidth<1024);
}`,
`  bindCommon();
  closeMenu();closeSuggest();
  $('#waBtn').classList.toggle('up',A==='p'&&window.innerWidth<1024);
  if(restaurar) requestAnimationFrame(()=>window.scrollTo({top:restaurar,behavior:'instant'}));
}`);
rep('eventos-nav',`  window.addEventListener('hashchange',route);
  window.addEventListener('popstate',route);`,
`  window.addEventListener('hashchange',()=>{POP=!PUSHING;PUSHING=false;route()});
  window.addEventListener('popstate',()=>{POP=true;route()});`);

/* ===================== SERVICE WORKER ===================== */
rep('sw',`  initTopbar();renderFooter();initEvents();paintBadges();initAmbiente();initMotion();`,
`  initTopbar();renderFooter();initEvents();paintBadges();initAmbiente();initMotion();
  /* App instalável: só em http(s) e fora do servidor de desenvolvimento,
     para o cache não esconder uma edição local. */
  if(HISTORY_MODE&&'serviceWorker' in navigator&&!/^(127\\.0\\.0\\.1|localhost)$/.test(location.hostname)){
    /* O boot é assíncrono: quando chega aqui, o evento load já pode ter passado. */
    const regSW=()=>navigator.serviceWorker.register(BASE+'/sw.js',{scope:BASE+'/'}).catch(e=>console.warn('sw',e.message));
    if(document.readyState==='complete') regSW(); else window.addEventListener('load',regSW);
  }`);

/* marca de versão */
rep('marca',`/* ---------- 34. BOOT ---------- */`,`/* v5: funcional */
/* ---------- 34. BOOT ---------- */`);

fs.writeFileSync(ARQ,src);
console.log('ok:',feitos.length,'trechos aplicados');
