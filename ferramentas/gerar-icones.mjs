// Gera os ícones PNG do app instalável (192, 512, 512 maskable, 180 Apple)
// sem nenhuma dependência: rasteriza um "A" condensado em branco sobre o
// preto da loja e codifica o PNG na mão (zlib do Node + CRC32).
// Uso: node ferramentas/gerar-icones.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';

const SAIDA=new URL('../imagens/',import.meta.url);
const FUNDO=[10,10,12];      // #0A0A0C
const TINTA=[255,255,255];

/* ---- "A" condensado, em coordenadas 0..1 (x,y) ---- */
const CONTORNO=[[0.5,0.10],[0.80,0.90],[0.20,0.90]];                 // triângulo cheio
const FURO=[[0.5,0.34],[0.585,0.58],[0.415,0.58]];                   // vão acima da barra
const VAO=[[0.335,0.90],[0.665,0.90],[0.57,0.68],[0.43,0.68]];        // vão entre as pernas

function dentro(poly,x,y){
  let ok=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) ok=!ok;
  }
  return ok;
}
function letra(x,y){ return dentro(CONTORNO,x,y)&&!dentro(FURO,x,y)&&!dentro(VAO,x,y) }

/* cobertura do pixel com supersampling 4×4 — bordas suaves */
function cobertura(px,py,n,escala){
  let c=0;
  for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
    const x=((px+(sx+.5)/4)/n-0.5)/escala+0.5;
    const y=((py+(sy+.5)/4)/n-0.5)/escala+0.5;
    if(letra(x,y)) c++;
  }
  return c/16;
}

/* ---- PNG ---- */
const TAB=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=TAB[(c^buf[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function chunk(tipo,dados){
  const len=Buffer.alloc(4);len.writeUInt32BE(dados.length);
  const td=Buffer.concat([Buffer.from(tipo,'ascii'),dados]);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len,td,crc]);
}
function png(n,escala){
  const raw=Buffer.alloc((n*4+1)*n);
  for(let y=0;y<n;y++){
    raw[y*(n*4+1)]=0;                       // filtro "none"
    for(let x=0;x<n;x++){
      const a=cobertura(x,y,n,escala);
      const o=y*(n*4+1)+1+x*4;
      for(let k=0;k<3;k++) raw[o+k]=Math.round(FUNDO[k]+(TINTA[k]-FUNDO[k])*a);
      raw[o+3]=255;
    }
  }
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(n,0);ihdr.writeUInt32BE(n,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(raw,{level:9})),
    chunk('IEND',Buffer.alloc(0))
  ]);
}

const ICONES=[
  ['icone-192.png',192,1],
  ['icone-512.png',512,1],
  ['icone-512-maskable.png',512,0.72],   // zona segura: 80% centrais
  ['icone-180.png',180,1]
];
for(const [nome,n,escala] of ICONES){
  const b=png(n,escala);
  fs.writeFileSync(new URL(nome,SAIDA),b);
  console.log(nome,(b.length/1024).toFixed(1)+' KB');
}
