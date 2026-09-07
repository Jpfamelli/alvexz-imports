// Gera sql/seed-produtos.sql a partir do catálogo de demonstração (mesma
// lógica de cores/estoque do SEED do site). Rode: node ferramentas/gerar-seed.mjs
import fs from 'node:fs';

const SIZES=['PP','P','M','G','GG'];
const CATS={camisetas:'camiseta',calcas:'calca',moletons:'moletom',conjuntos:'conjunto',jaquetas:'jaqueta',shorts:'short'};
const COLORWAYS=[
  {nome:'Preto',hex:'#1C1C1F',hex2:'#0A0A0C'},{nome:'Off-white',hex:'#F1F1F3',hex2:'#C9C9D1'},
  {nome:'Cinza mescla',hex:'#A1A1AA',hex2:'#71717A'},{nome:'Grafite',hex:'#3A3A40',hex2:'#232326'},
  {nome:'Bege',hex:'#D9C9B0',hex2:'#B8A68A'},{nome:'Areia',hex:'#C9C2B6',hex2:'#A29A8C'},
  {nome:'Branco',hex:'#FAFAFA',hex2:'#D8D8DE'},{nome:'Chumbo',hex:'#52525B',hex2:'#3F3F46'}];
function colorway(id){
  let h=0; for(let i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))>>>0;
  const a=h%COLORWAYS.length, b=(a+2+(h>>5)%3)%COLORWAYS.length;
  return [COLORWAYS[a],COLORWAYS[b===a?(a+1)%COLORWAYS.length:b]];
}
const SEED=[
  {id:'tech-fleece-hd',nome:'Moletom Tech Fleece com capuz',marca:'Nike',cat:'moletons',preco:399.90,precoDe:499.90,tags:['destaque','maisvendido','promo'],desc:'Moletom em tecido térmico de três camadas, com capuz forrado, bolsos com zíper e caimento reto. Peça leve que segura calor sem volume, a base do inverno urbano.',comp:'Algodão 66% / Poliéster 34%'},
  {id:'essentials-crew',nome:'Camiseta Essentials logo bordado',marca:'Adidas',cat:'camisetas',preco:149.90,precoDe:199.90,tags:['destaque','maisvendido'],desc:'Camiseta de malha pesada 190g com gola canelada reforçada e logo bordado no peito. Corte levemente oversized que não deforma na lavagem.',comp:'Algodão 100%'},
  {id:'cargo-utility',nome:'Calça cargo utility ripstop',marca:'Adidas',cat:'calcas',preco:329.90,precoDe:429.90,tags:['destaque','novidade','promo'],desc:'Cargo em ripstop encorpado, seis bolsos funcionais, ajuste no tornozelo e cós com elástico interno. Feita para durar mais que a temporada.',comp:'Algodão 65% / Poliéster 35%',modelo:'Straight fit'},
  {id:'flag-hoodie',nome:'Moletom Flag com capuz',marca:'Tommy Hilfiger',cat:'moletons',preco:589.90,precoDe:749.90,tags:['destaque','promo'],desc:'Moletom em felpa escovada com bandeira bordada e cordão em algodão encerado. Interior aveludado, punhos canelados que não cedem.'},
  {id:'polo-croco',nome:'Polo piquet clássica',marca:'Lacoste',cat:'camisetas',preco:519.90,tags:['destaque','novidade'],desc:'Polo em piquet de algodão petit piqué com gola trabalhada e abotoamento em madrepérola. O caimento é o mesmo desde 1933.',comp:'Algodão 100%'},
  {id:'windrunner',nome:'Jaqueta corta-vento Windrunner',marca:'Nike',cat:'jaquetas',preco:479.90,precoDe:629.90,tags:['novidade','promo','maisvendido'],desc:'Corta-vento leve com recortes em chevron, capuz ajustável e bolsos frontais com zíper. Dobra dentro do próprio bolso.',comp:'Poliéster 100%'},
  {id:'track-pant',nome:'Calça track pant three stripes',marca:'Adidas',cat:'calcas',preco:299.90,tags:['maisvendido','novidade'],desc:'Track pant em tricot leve com as três listras laterais, cós com cordão e barra com zíper. Vestir e sair.'},
  {id:'conjunto-tactel',nome:'Conjunto tactel jaqueta + calça',marca:'Puma',cat:'conjuntos',preco:389.90,precoDe:519.90,tags:['novidade','promo','destaque'],desc:'Conjunto completo em tactel acetinado com forro em mesh, punhos canelados e bordado discreto no peito. Vem com os dois itens.',comp:'Poliéster 100%'},
  {id:'short-moletom',nome:'Short de moletom peletizado',marca:'Puma',cat:'shorts',preco:189.90,precoDe:249.90,tags:['promo'],desc:'Short em moletom peletizado com cós de elástico e cordão, dois bolsos laterais e comprimento acima do joelho.'},
  {id:'camiseta-oversized',nome:'Camiseta oversized estampa costas',marca:'Nike',cat:'camisetas',preco:139.90,tags:['novidade','maisvendido'],desc:'Malha 100% algodão penteado 30.1 com estampa em silk de alta densidade nas costas. Ombro caído, barra reta.'},
  {id:'jeans-wide',nome:'Calça jeans wide leg lavagem escura',marca:'Tommy Hilfiger',cat:'calcas',preco:279.90,precoDe:359.90,tags:['promo','maisvendido'],desc:'Jeans rígido com pouca elasticidade, cinco bolsos e barra ampla que cai sobre o tênis. Lavagem escura uniforme.',comp:'Algodão 98% / Elastano 2%'},
  {id:'jaqueta-corta-vento',nome:'Jaqueta bomber acolchoada',marca:'Adidas',cat:'jaquetas',preco:559.90,tags:['novidade'],desc:'Bomber acolchoada com gola alta, zíper de dois cursores e bolsos internos. Enchimento térmico leve.'},
  {id:'polo-lisa',nome:'Camiseta gola polo listrada',marca:'Tommy Hilfiger',cat:'camisetas',preco:429.90,precoDe:549.90,tags:['promo'],desc:'Polo listrada em algodão pima com bandeira bordada no peito e fenda lateral na barra.'},
  {id:'moletom-careca',nome:'Moletom careca básico pesado',marca:'Puma',cat:'moletons',preco:219.90,tags:['maisvendido'],desc:'Moletom sem capuz em felpa 320g, gola canelada com fita de reforço e caimento reto. O básico que funciona.'},
  {id:'short-sarja',nome:'Short de sarja com cordão',marca:'Adidas',cat:'shorts',preco:159.90,tags:['novidade'],desc:'Short em sarja de algodão com cós de elástico parcial, cordão em fita e dois bolsos faca.'},
  {id:'conjunto-moletom',nome:'Conjunto moletom capuz + calça',marca:'Nike',cat:'conjuntos',preco:749.90,precoDe:929.90,tags:['promo','maisvendido'],desc:'Conjunto em felpa premium com capuz duplo e calça de cós ajustável. Vendidos juntos, na mesma cor.'},
  {id:'jaqueta-jeans',nome:'Jaqueta jeans lavagem média',marca:'Tommy Hilfiger',cat:'jaquetas',preco:349.90,tags:['novidade'],desc:'Jaqueta trucker em jeans rígido com bolsos frontais, ajuste lateral por botões e forro em algodão.',comp:'Algodão 100%'},
  {id:'polo-piquet-azul',nome:'Camiseta manga longa canelada',marca:'Lacoste',cat:'camisetas',preco:379.90,tags:['novidade'],desc:'Manga longa em malha canelada fina, gola careca e punhos ajustados. Corte alongado.'},
  {id:'calca-alfaiataria',nome:'Calça alfaiataria pence',marca:'Lacoste',cat:'calcas',preco:319.90,tags:['novidade','destaque'],desc:'Alfaiataria em tecido de toque seco com pence frontal, cós largo e caimento fluido. Streetwear que passa em qualquer porta.',modelo:'Loose fit'},
  {id:'moletom-zip',nome:'Moletom com zíper full-zip',marca:'Puma',cat:'moletons',preco:349.90,precoDe:449.90,tags:['promo'],lowStock:true,desc:'Full-zip em felpa escovada com bolsos laterais, capuz forrado e zíper metálico anti-travamento.'}
];
const q=s=>"'"+String(s).replace(/'/g,"''")+"'";
let out='-- Gerado por ferramentas/gerar-seed.mjs. Catálogo de demonstração (20 peças).\n'+
        '-- Rode DEPOIS do supabase-schema.sql. Idempotente pelo SKU.\n';
SEED.forEach((o,i)=>{
  const sku='ALV-'+String(i+1).padStart(3,'0');
  const est={}; SIZES.forEach((s,k)=>est[s]=o.lowStock?(k===0?2:(k%3===0?0:4)):(4+((k*7)%9)));
  const cores=colorway(o.id);
  const det={comp:o.comp||'Algodão 80% / Poliéster 20%',origem:'Importado',peso:'0,42 kg',modelo:o.modelo||'Regular fit',tipo:CATS[o.cat],cores};
  const t=x=>o.tags.includes(x);
  out+='\ninsert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)\n'+
    `select ${q(sku)},${q(o.nome)},${q(o.id)},${q(o.desc)},${q(JSON.stringify(det))}::jsonb,\n`+
    `  (select id from public.brands where nome=${q(o.marca)}),(select id from public.categories where slug=${q(o.cat)}),\n`+
    `  ${o.preco},${o.precoDe||'null'},${t('destaque')},${t('maisvendido')},${t('novidade')},${t('promo')},${i}\n`+
    `where not exists (select 1 from public.products where sku=${q(sku)});\n`;
  const rows=[];
  SIZES.forEach(s=>{
    rows.push(`((select id from public.products where sku=${q(sku)}),${q(s)},${q(cores[0].nome)},${q(cores[0].hex)},${est[s]},${q(sku+'-'+s+'-1')})`);
    rows.push(`((select id from public.products where sku=${q(sku)}),${q(s)},${q(cores[1].nome)},${q(cores[1].hex)},${Math.floor(est[s]/2)},${q(sku+'-'+s+'-2')})`);
  });
  out+='insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values\n  '+rows.join(',\n  ')+'\non conflict (sku_variante) do nothing;\n';
});
fs.writeFileSync(new URL('../sql/seed-produtos.sql',import.meta.url),out);
console.log('ok',out.length,'bytes');
