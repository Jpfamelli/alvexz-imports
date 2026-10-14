/* ALVEXZ IMPORTS — service worker
   Só roda em http(s). Estratégia:
   - navegação (o index.html): rede primeiro; se cair, devolve a última cópia.
     Assim um deploy novo aparece na hora e a loja ainda abre sem rede.
   - imagens, ícones, fontes e supabase-js: cache primeiro, atualiza por trás.
   - Supabase, Stripe, ViaCEP e o resto: passa direto, nunca entra no cache.
   Trocar a versão abaixo descarta todo cache antigo na ativação. */
const VERSAO='alvexz-v1';
const INDEX='__index';

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

function estatico(u){
  if(u.origin===self.location.origin) return /\.(jpe?g|png|webp|avif|svg|ico|webmanifest|woff2?)$/i.test(u.pathname);
  return u.hostname==='fonts.gstatic.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='cdn.jsdelivr.net'||u.hostname==='cdn.simpleicons.org';
}

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);

  if(r.mode==='navigate'){
    e.respondWith(
      fetch(r).then(res=>{
        /* o GitHub Pages devolve 404 (com o mesmo HTML) nas rotas profundas */
        if(res.status===200||res.status===404){
          const c=res.clone(); caches.open(VERSAO).then(x=>x.put(INDEX,c));
        }
        return res;
      }).catch(()=>caches.match(INDEX).then(hit=>hit||Response.error()))
    );
    return;
  }

  if(!estatico(u)) return;
  e.respondWith(caches.open(VERSAO).then(async c=>{
    const hit=await c.match(r);
    const rede=fetch(r).then(res=>{
      if(res.ok||res.type==='opaque') c.put(r,res.clone());
      return res;
    }).catch(()=>hit);
    return hit||rede;
  }));
});
