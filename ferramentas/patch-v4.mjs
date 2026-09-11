// v4: ilustrações de produto refeitas (estúdio escuro, silhuetas com curvas,
// brilho e sombra de chão), wordmark do rodapé sem a linha cruzando,
// og:image/preload do hero para compartilhamento e LCP.
// Uso: node ferramentas/patch-v4.mjs  (idempotente; backup em alvexz-store.v3.html)
import fs from 'node:fs';
const ARQ=new URL('../index.html',import.meta.url);
let src=fs.readFileSync(ARQ,'utf8');
if(src.includes('/* v4: ilustrações */')){console.log('já aplicado');process.exit(0)}
fs.writeFileSync(new URL('../alvexz-store.v3.html',import.meta.url),src);
const feitos=[];
function rep(nome,a,b){
  const n=src.split(a).length-1;
  if(n===0) throw new Error('âncora não encontrada ['+nome+']: '+a.slice(0,90));
  if(n>1) throw new Error('âncora ambígua ['+nome+'] ('+n+'x): '+a.slice(0,90));
  src=src.replace(a,()=>b); feitos.push(nome);
}

/* ---------- ilustrações ---------- */
const ini=src.indexOf("function garment(type,c1='#1C1C1F',c2='#0A0A0C',bg='#F6F6F7'){");
const fim=src.indexOf('function bannerImg(');
if(ini<0||fim<0||fim<ini) throw new Error('garment() não encontrada');
const novaGarment=`/* v4: ilustrações */
/* Peça desenhada em estúdio escuro: spot atrás, brilho diagonal, sombra no chão
   e grão leve. As silhuetas usam curvas (ombro, gola, capuz, cós) para não
   parecerem ícone. \`bg\` é ignorado (mantido só por compatibilidade). */
function garment(type,c1='#1C1C1F',c2='#0A0A0C',bg){
  const lum=(h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return 0;const n=parseInt(m[1],16);return (0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255))/255})(c1);
  const claro=lum>.55;
  const det=claro?'rgba(0,0,0,.22)':'rgba(255,255,255,.2)';   // costuras
  const borda=claro?'rgba(0,0,0,.18)':'rgba(255,255,255,.14)'; // contorno
  const S={
    camiseta:{d:'M55 40 C60 50 90 50 95 40 L118 50 C126 54 130 62 132 72 L136 88 C137 92 134 95 130 96 L112 100 L112 166 C112 170 109 172 105 172 L45 172 C41 172 38 170 38 166 L38 100 L20 96 C16 95 13 92 14 88 L18 72 C20 62 24 54 32 50 Z',
      d2:'M55 40 C58 52 92 52 95 40 M38 100 L38 94 M112 100 L112 94'},
    moletom:{d:'M50 46 C50 28 100 28 100 46 L114 54 C120 57 126 62 128 68 L136 88 C138 93 135 98 130 99 L112 104 L112 168 C112 172 109 175 105 175 L45 175 C41 175 38 172 38 168 L38 104 L20 99 C15 98 12 93 14 88 L22 68 C24 62 30 57 36 54 Z',
      d2:'M50 46 C54 56 66 60 75 60 C84 60 96 56 100 46 M69 62 L67 88 M81 62 L83 88 M48 134 L102 134 L106 160 L44 160 Z M38 104 L38 98 M112 104 L112 98'},
    jaqueta:{d:'M54 42 C54 34 62 30 75 30 C88 30 96 34 96 42 L114 52 C120 55 126 60 128 66 L136 88 C138 93 135 98 130 99 L112 104 L112 168 C112 172 109 175 105 175 L45 175 C41 175 38 172 38 168 L38 104 L20 99 C15 98 12 93 14 88 L22 66 C24 60 30 55 36 52 Z',
      d2:'M54 42 L75 56 L96 42 M75 56 L75 175 M44 120 L58 120 M92 120 L106 120 M38 104 L38 98 M112 104 L112 98 M44 166 L106 166',tracejado:'M75 60 L75 170'},
    calca:{d:'M40 24 L110 24 C113 24 115 26 115 29 L116 46 L118 100 L113 182 C113 185 111 187 108 187 L84 187 C81 187 79 185 79 182 L75 110 L71 182 C71 185 69 187 66 187 L42 187 C39 187 37 185 37 182 L32 100 L34 46 L35 29 C35 26 37 24 40 24 Z',
      d2:'M35 44 L115 44 M69 34 L66 60 M81 34 L84 60 M75 44 L75 104 M42 56 L52 78 M108 56 L98 78'},
    short:{t:'translate(0,26)',d:'M40 30 L110 30 C113 30 115 32 115 35 L116 50 L120 118 C120 122 117 125 113 125 L84 125 C81 125 79 123 79 120 L75 96 L71 120 C71 123 69 125 66 125 L37 125 C33 125 30 122 30 118 L34 50 L35 35 C35 32 37 30 40 30 Z',
      d2:'M35 48 L115 48 M69 38 L66 62 M81 38 L84 62 M42 60 L52 82 M108 60 L98 82 M75 48 L75 100'},
    conjunto:{d:'M58 22 C62 30 88 30 92 22 L110 30 C116 33 119 39 120 46 L123 58 C124 61 122 63 119 64 L106 67 L106 104 C106 107 104 108 102 108 L48 108 C46 108 44 107 44 104 L44 67 L31 64 C28 63 26 61 27 58 L30 46 C31 39 34 33 40 30 Z M46 118 L104 118 C106 118 108 120 108 122 L110 136 L113 182 C113 185 111 187 108 187 L86 187 C83 187 81 185 81 182 L75 152 L69 182 C69 185 67 187 64 187 L42 187 C39 187 37 185 37 182 L40 136 L42 122 C42 120 44 118 46 118 Z',
      d2:'M58 22 C61 32 89 32 92 22 M40 134 L110 134 M69 124 L67 142 M81 124 L83 142'},
    tenis:{t:'translate(0,-10)',d:'M12 150 L12 141 C12 131 18 123 30 119 L60 108 C68 105 74 101 79 95 C83 90 89 91 91 97 L96 110 C101 119 113 121 122 114 L132 106 C138 112 141 124 141 136 L141 150 Z',d2:'M12 139 L141 139 M58 110 L66 122 M72 104 L80 116 M91 99 L96 110'},
    bone:{t:'translate(-4,0)',d:'M26 122 C26 80 50 56 78 56 C106 56 126 78 126 116 L126 124 L26 124 Z',d2:'M126 114 L150 122 L150 133 L124 127 M78 56 L78 120 M50 64 L50 118 M104 64 L104 118'},
    acessorio:{d:'M38 64 L112 64 L120 162 L30 162 Z',d2:'M62 64 L62 46 C62 34 88 34 88 46 L88 64 M30 88 L120 88'},
    meia:{t:'translate(6,0)',d:'M46 30 L82 30 L82 112 C82 126 90 136 104 140 L124 146 C132 149 134 156 132 162 L128 172 C126 178 118 181 111 178 L62 158 C50 153 42 141 42 128 L42 34 Z',d2:'M46 44 L82 44 M42 128 C56 136 74 142 92 146'}
  };
  const sh=S[type]||S.camiseta;
  const s=\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 190" width="150" height="190">
<defs>
<radialGradient id="spot" cx=".5" cy=".36" r=".64"><stop offset="0" stop-color="#2C2C34"/><stop offset=".6" stop-color="#17171B"/><stop offset="1" stop-color="#0E0E11"/></radialGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="\${claro?'.28':'.2'}"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
<radialGradient id="floor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .09 0"/></filter>
<filter id="blur"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>
<rect width="150" height="190" fill="url(#spot)"/>
<rect width="150" height="190" filter="url(#grain)"/>
<ellipse cx="75" cy="181" rx="54" ry="6" fill="url(#floor)"/>
<g transform="\${sh.t||''}">
<path d="\${sh.d}" fill="#000" opacity=".45" filter="url(#blur)" transform="translate(3,5)"/>
<path d="\${sh.d}" fill="\${c1}" stroke="\${borda}" stroke-width="1.2" stroke-linejoin="round"/>
<path d="\${sh.d}" fill="url(#sheen)"/>
<path d="\${sh.d2}" fill="none" stroke="\${det}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
\${sh.tracejado?\`<path d="\${sh.tracejado}" fill="none" stroke="\${det}" stroke-width="1.2" stroke-dasharray="2 2.4"/>\`:''}
</g>
</svg>\`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
`;
src=src.slice(0,ini)+novaGarment+src.slice(fim); feitos.push('garment');

/* ---------- rodapé ---------- */
rep('foot-giant',
`  padding:30px 0 0;margin:20px 0 -10px;overflow:hidden;white-space:nowrap}`,
`  padding:30px 0 4px;margin:20px 0 0;overflow:hidden;white-space:nowrap;-webkit-text-stroke:1px rgba(255,255,255,.22)}`);

/* ---------- meta para compartilhamento + preload do hero ---------- */
rep('og-url',`<meta property="og:url" content="https://alvexz.com.br/">`,`<meta property="og:url" content="https://jpfamelli.github.io/alvexz-imports/">`);
rep('og-image',`<meta name="twitter:card" content="summary_large_image">`,
`<meta name="twitter:card" content="summary_large_image">
<meta property="og:image" content="https://jpfamelli.github.io/alvexz-imports/imagens/conjunto-nike-fundo-concreto.jpg">
<meta property="og:image:alt" content="Conjunto Nike original, conferido na mão">
<meta name="twitter:image" content="https://jpfamelli.github.io/alvexz-imports/imagens/conjunto-nike-fundo-concreto.jpg">`);

/* ---------- card: imagem sempre escura, sem borda clara ---------- */
rep('card-img-bg',`.card-img{position:relative;aspect-ratio:5/6;background:var(--nevoa);overflow:hidden;display:block}`,
`.card-img{position:relative;aspect-ratio:5/6;background:#141418;overflow:hidden;display:block}
.card-img::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.04)}`);

fs.writeFileSync(ARQ,src);
console.log('ok:',feitos.length,'trechos aplicados');
