-- Gerado por ferramentas/gerar-seed.mjs. Catálogo de demonstração (20 peças).
-- Rode DEPOIS do supabase-schema.sql. Idempotente pelo SKU.

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-001','Moletom Tech Fleece com capuz','tech-fleece-hd','Moletom em tecido térmico de três camadas, com capuz forrado, bolsos com zíper e caimento reto. Peça leve que segura calor sem volume, a base do inverno urbano.','{"comp":"Algodão 66% / Poliéster 34%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"moletom","cores":[{"nome":"Cinza mescla","hex":"#A1A1AA","hex2":"#71717A"},{"nome":"Areia","hex":"#C9C2B6","hex2":"#A29A8C"}]}'::jsonb,
  (select id from public.brands where nome='Nike'),(select id from public.categories where slug='moletons'),
  399.9,499.9,true,true,false,true,0
where not exists (select 1 from public.products where sku='ALV-001');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-001'),'PP','Cinza mescla','#A1A1AA',4,'ALV-001-PP-1'),
  ((select id from public.products where sku='ALV-001'),'PP','Areia','#C9C2B6',2,'ALV-001-PP-2'),
  ((select id from public.products where sku='ALV-001'),'P','Cinza mescla','#A1A1AA',11,'ALV-001-P-1'),
  ((select id from public.products where sku='ALV-001'),'P','Areia','#C9C2B6',5,'ALV-001-P-2'),
  ((select id from public.products where sku='ALV-001'),'M','Cinza mescla','#A1A1AA',9,'ALV-001-M-1'),
  ((select id from public.products where sku='ALV-001'),'M','Areia','#C9C2B6',4,'ALV-001-M-2'),
  ((select id from public.products where sku='ALV-001'),'G','Cinza mescla','#A1A1AA',7,'ALV-001-G-1'),
  ((select id from public.products where sku='ALV-001'),'G','Areia','#C9C2B6',3,'ALV-001-G-2'),
  ((select id from public.products where sku='ALV-001'),'GG','Cinza mescla','#A1A1AA',5,'ALV-001-GG-1'),
  ((select id from public.products where sku='ALV-001'),'GG','Areia','#C9C2B6',2,'ALV-001-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-002','Camiseta Essentials logo bordado','essentials-crew','Camiseta de malha pesada 190g com gola canelada reforçada e logo bordado no peito. Corte levemente oversized que não deforma na lavagem.','{"comp":"Algodão 100%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"camiseta","cores":[{"nome":"Off-white","hex":"#F1F1F3","hex2":"#C9C9D1"},{"nome":"Bege","hex":"#D9C9B0","hex2":"#B8A68A"}]}'::jsonb,
  (select id from public.brands where nome='Adidas'),(select id from public.categories where slug='camisetas'),
  149.9,199.9,true,true,false,false,1
where not exists (select 1 from public.products where sku='ALV-002');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-002'),'PP','Off-white','#F1F1F3',4,'ALV-002-PP-1'),
  ((select id from public.products where sku='ALV-002'),'PP','Bege','#D9C9B0',2,'ALV-002-PP-2'),
  ((select id from public.products where sku='ALV-002'),'P','Off-white','#F1F1F3',11,'ALV-002-P-1'),
  ((select id from public.products where sku='ALV-002'),'P','Bege','#D9C9B0',5,'ALV-002-P-2'),
  ((select id from public.products where sku='ALV-002'),'M','Off-white','#F1F1F3',9,'ALV-002-M-1'),
  ((select id from public.products where sku='ALV-002'),'M','Bege','#D9C9B0',4,'ALV-002-M-2'),
  ((select id from public.products where sku='ALV-002'),'G','Off-white','#F1F1F3',7,'ALV-002-G-1'),
  ((select id from public.products where sku='ALV-002'),'G','Bege','#D9C9B0',3,'ALV-002-G-2'),
  ((select id from public.products where sku='ALV-002'),'GG','Off-white','#F1F1F3',5,'ALV-002-GG-1'),
  ((select id from public.products where sku='ALV-002'),'GG','Bege','#D9C9B0',2,'ALV-002-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-003','Calça cargo utility ripstop','cargo-utility','Cargo em ripstop encorpado, seis bolsos funcionais, ajuste no tornozelo e cós com elástico interno. Feita para durar mais que a temporada.','{"comp":"Algodão 65% / Poliéster 35%","origem":"Importado","peso":"0,42 kg","modelo":"Straight fit","tipo":"calca","cores":[{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"},{"nome":"Areia","hex":"#C9C2B6","hex2":"#A29A8C"}]}'::jsonb,
  (select id from public.brands where nome='Adidas'),(select id from public.categories where slug='calcas'),
  329.9,429.9,true,false,true,true,2
where not exists (select 1 from public.products where sku='ALV-003');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-003'),'PP','Grafite','#3A3A40',4,'ALV-003-PP-1'),
  ((select id from public.products where sku='ALV-003'),'PP','Areia','#C9C2B6',2,'ALV-003-PP-2'),
  ((select id from public.products where sku='ALV-003'),'P','Grafite','#3A3A40',11,'ALV-003-P-1'),
  ((select id from public.products where sku='ALV-003'),'P','Areia','#C9C2B6',5,'ALV-003-P-2'),
  ((select id from public.products where sku='ALV-003'),'M','Grafite','#3A3A40',9,'ALV-003-M-1'),
  ((select id from public.products where sku='ALV-003'),'M','Areia','#C9C2B6',4,'ALV-003-M-2'),
  ((select id from public.products where sku='ALV-003'),'G','Grafite','#3A3A40',7,'ALV-003-G-1'),
  ((select id from public.products where sku='ALV-003'),'G','Areia','#C9C2B6',3,'ALV-003-G-2'),
  ((select id from public.products where sku='ALV-003'),'GG','Grafite','#3A3A40',5,'ALV-003-GG-1'),
  ((select id from public.products where sku='ALV-003'),'GG','Areia','#C9C2B6',2,'ALV-003-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-004','Moletom Flag com capuz','flag-hoodie','Moletom em felpa escovada com bandeira bordada e cordão em algodão encerado. Interior aveludado, punhos canelados que não cedem.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"moletom","cores":[{"nome":"Off-white","hex":"#F1F1F3","hex2":"#C9C9D1"},{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"}]}'::jsonb,
  (select id from public.brands where nome='Tommy Hilfiger'),(select id from public.categories where slug='moletons'),
  589.9,749.9,true,false,false,true,3
where not exists (select 1 from public.products where sku='ALV-004');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-004'),'PP','Off-white','#F1F1F3',4,'ALV-004-PP-1'),
  ((select id from public.products where sku='ALV-004'),'PP','Grafite','#3A3A40',2,'ALV-004-PP-2'),
  ((select id from public.products where sku='ALV-004'),'P','Off-white','#F1F1F3',11,'ALV-004-P-1'),
  ((select id from public.products where sku='ALV-004'),'P','Grafite','#3A3A40',5,'ALV-004-P-2'),
  ((select id from public.products where sku='ALV-004'),'M','Off-white','#F1F1F3',9,'ALV-004-M-1'),
  ((select id from public.products where sku='ALV-004'),'M','Grafite','#3A3A40',4,'ALV-004-M-2'),
  ((select id from public.products where sku='ALV-004'),'G','Off-white','#F1F1F3',7,'ALV-004-G-1'),
  ((select id from public.products where sku='ALV-004'),'G','Grafite','#3A3A40',3,'ALV-004-G-2'),
  ((select id from public.products where sku='ALV-004'),'GG','Off-white','#F1F1F3',5,'ALV-004-GG-1'),
  ((select id from public.products where sku='ALV-004'),'GG','Grafite','#3A3A40',2,'ALV-004-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-005','Polo piquet clássica','polo-croco','Polo em piquet de algodão petit piqué com gola trabalhada e abotoamento em madrepérola. O caimento é o mesmo desde 1933.','{"comp":"Algodão 100%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"camiseta","cores":[{"nome":"Off-white","hex":"#F1F1F3","hex2":"#C9C9D1"},{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"}]}'::jsonb,
  (select id from public.brands where nome='Lacoste'),(select id from public.categories where slug='camisetas'),
  519.9,null,true,false,true,false,4
where not exists (select 1 from public.products where sku='ALV-005');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-005'),'PP','Off-white','#F1F1F3',4,'ALV-005-PP-1'),
  ((select id from public.products where sku='ALV-005'),'PP','Grafite','#3A3A40',2,'ALV-005-PP-2'),
  ((select id from public.products where sku='ALV-005'),'P','Off-white','#F1F1F3',11,'ALV-005-P-1'),
  ((select id from public.products where sku='ALV-005'),'P','Grafite','#3A3A40',5,'ALV-005-P-2'),
  ((select id from public.products where sku='ALV-005'),'M','Off-white','#F1F1F3',9,'ALV-005-M-1'),
  ((select id from public.products where sku='ALV-005'),'M','Grafite','#3A3A40',4,'ALV-005-M-2'),
  ((select id from public.products where sku='ALV-005'),'G','Off-white','#F1F1F3',7,'ALV-005-G-1'),
  ((select id from public.products where sku='ALV-005'),'G','Grafite','#3A3A40',3,'ALV-005-G-2'),
  ((select id from public.products where sku='ALV-005'),'GG','Off-white','#F1F1F3',5,'ALV-005-GG-1'),
  ((select id from public.products where sku='ALV-005'),'GG','Grafite','#3A3A40',2,'ALV-005-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-006','Jaqueta corta-vento Windrunner','windrunner','Corta-vento leve com recortes em chevron, capuz ajustável e bolsos frontais com zíper. Dobra dentro do próprio bolso.','{"comp":"Poliéster 100%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"jaqueta","cores":[{"nome":"Preto","hex":"#1C1C1F","hex2":"#0A0A0C"},{"nome":"Bege","hex":"#D9C9B0","hex2":"#B8A68A"}]}'::jsonb,
  (select id from public.brands where nome='Nike'),(select id from public.categories where slug='jaquetas'),
  479.9,629.9,false,true,true,true,5
where not exists (select 1 from public.products where sku='ALV-006');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-006'),'PP','Preto','#1C1C1F',4,'ALV-006-PP-1'),
  ((select id from public.products where sku='ALV-006'),'PP','Bege','#D9C9B0',2,'ALV-006-PP-2'),
  ((select id from public.products where sku='ALV-006'),'P','Preto','#1C1C1F',11,'ALV-006-P-1'),
  ((select id from public.products where sku='ALV-006'),'P','Bege','#D9C9B0',5,'ALV-006-P-2'),
  ((select id from public.products where sku='ALV-006'),'M','Preto','#1C1C1F',9,'ALV-006-M-1'),
  ((select id from public.products where sku='ALV-006'),'M','Bege','#D9C9B0',4,'ALV-006-M-2'),
  ((select id from public.products where sku='ALV-006'),'G','Preto','#1C1C1F',7,'ALV-006-G-1'),
  ((select id from public.products where sku='ALV-006'),'G','Bege','#D9C9B0',3,'ALV-006-G-2'),
  ((select id from public.products where sku='ALV-006'),'GG','Preto','#1C1C1F',5,'ALV-006-GG-1'),
  ((select id from public.products where sku='ALV-006'),'GG','Bege','#D9C9B0',2,'ALV-006-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-007','Calça track pant three stripes','track-pant','Track pant em tricot leve com as três listras laterais, cós com cordão e barra com zíper. Vestir e sair.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"calca","cores":[{"nome":"Off-white","hex":"#F1F1F3","hex2":"#C9C9D1"},{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"}]}'::jsonb,
  (select id from public.brands where nome='Adidas'),(select id from public.categories where slug='calcas'),
  299.9,null,false,true,true,false,6
where not exists (select 1 from public.products where sku='ALV-007');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-007'),'PP','Off-white','#F1F1F3',4,'ALV-007-PP-1'),
  ((select id from public.products where sku='ALV-007'),'PP','Grafite','#3A3A40',2,'ALV-007-PP-2'),
  ((select id from public.products where sku='ALV-007'),'P','Off-white','#F1F1F3',11,'ALV-007-P-1'),
  ((select id from public.products where sku='ALV-007'),'P','Grafite','#3A3A40',5,'ALV-007-P-2'),
  ((select id from public.products where sku='ALV-007'),'M','Off-white','#F1F1F3',9,'ALV-007-M-1'),
  ((select id from public.products where sku='ALV-007'),'M','Grafite','#3A3A40',4,'ALV-007-M-2'),
  ((select id from public.products where sku='ALV-007'),'G','Off-white','#F1F1F3',7,'ALV-007-G-1'),
  ((select id from public.products where sku='ALV-007'),'G','Grafite','#3A3A40',3,'ALV-007-G-2'),
  ((select id from public.products where sku='ALV-007'),'GG','Off-white','#F1F1F3',5,'ALV-007-GG-1'),
  ((select id from public.products where sku='ALV-007'),'GG','Grafite','#3A3A40',2,'ALV-007-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-008','Conjunto tactel jaqueta + calça','conjunto-tactel','Conjunto completo em tactel acetinado com forro em mesh, punhos canelados e bordado discreto no peito. Vem com os dois itens.','{"comp":"Poliéster 100%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"conjunto","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Preto","hex":"#1C1C1F","hex2":"#0A0A0C"}]}'::jsonb,
  (select id from public.brands where nome='Puma'),(select id from public.categories where slug='conjuntos'),
  389.9,519.9,true,false,true,true,7
where not exists (select 1 from public.products where sku='ALV-008');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-008'),'PP','Branco','#FAFAFA',4,'ALV-008-PP-1'),
  ((select id from public.products where sku='ALV-008'),'PP','Preto','#1C1C1F',2,'ALV-008-PP-2'),
  ((select id from public.products where sku='ALV-008'),'P','Branco','#FAFAFA',11,'ALV-008-P-1'),
  ((select id from public.products where sku='ALV-008'),'P','Preto','#1C1C1F',5,'ALV-008-P-2'),
  ((select id from public.products where sku='ALV-008'),'M','Branco','#FAFAFA',9,'ALV-008-M-1'),
  ((select id from public.products where sku='ALV-008'),'M','Preto','#1C1C1F',4,'ALV-008-M-2'),
  ((select id from public.products where sku='ALV-008'),'G','Branco','#FAFAFA',7,'ALV-008-G-1'),
  ((select id from public.products where sku='ALV-008'),'G','Preto','#1C1C1F',3,'ALV-008-G-2'),
  ((select id from public.products where sku='ALV-008'),'GG','Branco','#FAFAFA',5,'ALV-008-GG-1'),
  ((select id from public.products where sku='ALV-008'),'GG','Preto','#1C1C1F',2,'ALV-008-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-009','Short de moletom peletizado','short-moletom','Short em moletom peletizado com cós de elástico e cordão, dois bolsos laterais e comprimento acima do joelho.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"short","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Preto","hex":"#1C1C1F","hex2":"#0A0A0C"}]}'::jsonb,
  (select id from public.brands where nome='Puma'),(select id from public.categories where slug='shorts'),
  189.9,249.9,false,false,false,true,8
where not exists (select 1 from public.products where sku='ALV-009');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-009'),'PP','Branco','#FAFAFA',4,'ALV-009-PP-1'),
  ((select id from public.products where sku='ALV-009'),'PP','Preto','#1C1C1F',2,'ALV-009-PP-2'),
  ((select id from public.products where sku='ALV-009'),'P','Branco','#FAFAFA',11,'ALV-009-P-1'),
  ((select id from public.products where sku='ALV-009'),'P','Preto','#1C1C1F',5,'ALV-009-P-2'),
  ((select id from public.products where sku='ALV-009'),'M','Branco','#FAFAFA',9,'ALV-009-M-1'),
  ((select id from public.products where sku='ALV-009'),'M','Preto','#1C1C1F',4,'ALV-009-M-2'),
  ((select id from public.products where sku='ALV-009'),'G','Branco','#FAFAFA',7,'ALV-009-G-1'),
  ((select id from public.products where sku='ALV-009'),'G','Preto','#1C1C1F',3,'ALV-009-G-2'),
  ((select id from public.products where sku='ALV-009'),'GG','Branco','#FAFAFA',5,'ALV-009-GG-1'),
  ((select id from public.products where sku='ALV-009'),'GG','Preto','#1C1C1F',2,'ALV-009-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-010','Camiseta oversized estampa costas','camiseta-oversized','Malha 100% algodão penteado 30.1 com estampa em silk de alta densidade nas costas. Ombro caído, barra reta.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"camiseta","cores":[{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"},{"nome":"Bege","hex":"#D9C9B0","hex2":"#B8A68A"}]}'::jsonb,
  (select id from public.brands where nome='Nike'),(select id from public.categories where slug='camisetas'),
  139.9,null,false,true,true,false,9
where not exists (select 1 from public.products where sku='ALV-010');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-010'),'PP','Grafite','#3A3A40',4,'ALV-010-PP-1'),
  ((select id from public.products where sku='ALV-010'),'PP','Bege','#D9C9B0',2,'ALV-010-PP-2'),
  ((select id from public.products where sku='ALV-010'),'P','Grafite','#3A3A40',11,'ALV-010-P-1'),
  ((select id from public.products where sku='ALV-010'),'P','Bege','#D9C9B0',5,'ALV-010-P-2'),
  ((select id from public.products where sku='ALV-010'),'M','Grafite','#3A3A40',9,'ALV-010-M-1'),
  ((select id from public.products where sku='ALV-010'),'M','Bege','#D9C9B0',4,'ALV-010-M-2'),
  ((select id from public.products where sku='ALV-010'),'G','Grafite','#3A3A40',7,'ALV-010-G-1'),
  ((select id from public.products where sku='ALV-010'),'G','Bege','#D9C9B0',3,'ALV-010-G-2'),
  ((select id from public.products where sku='ALV-010'),'GG','Grafite','#3A3A40',5,'ALV-010-GG-1'),
  ((select id from public.products where sku='ALV-010'),'GG','Bege','#D9C9B0',2,'ALV-010-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-011','Calça jeans wide leg lavagem escura','jeans-wide','Jeans rígido com pouca elasticidade, cinco bolsos e barra ampla que cai sobre o tênis. Lavagem escura uniforme.','{"comp":"Algodão 98% / Elastano 2%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"calca","cores":[{"nome":"Areia","hex":"#C9C2B6","hex2":"#A29A8C"},{"nome":"Chumbo","hex":"#52525B","hex2":"#3F3F46"}]}'::jsonb,
  (select id from public.brands where nome='Tommy Hilfiger'),(select id from public.categories where slug='calcas'),
  279.9,359.9,false,true,false,true,10
where not exists (select 1 from public.products where sku='ALV-011');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-011'),'PP','Areia','#C9C2B6',4,'ALV-011-PP-1'),
  ((select id from public.products where sku='ALV-011'),'PP','Chumbo','#52525B',2,'ALV-011-PP-2'),
  ((select id from public.products where sku='ALV-011'),'P','Areia','#C9C2B6',11,'ALV-011-P-1'),
  ((select id from public.products where sku='ALV-011'),'P','Chumbo','#52525B',5,'ALV-011-P-2'),
  ((select id from public.products where sku='ALV-011'),'M','Areia','#C9C2B6',9,'ALV-011-M-1'),
  ((select id from public.products where sku='ALV-011'),'M','Chumbo','#52525B',4,'ALV-011-M-2'),
  ((select id from public.products where sku='ALV-011'),'G','Areia','#C9C2B6',7,'ALV-011-G-1'),
  ((select id from public.products where sku='ALV-011'),'G','Chumbo','#52525B',3,'ALV-011-G-2'),
  ((select id from public.products where sku='ALV-011'),'GG','Areia','#C9C2B6',5,'ALV-011-GG-1'),
  ((select id from public.products where sku='ALV-011'),'GG','Chumbo','#52525B',2,'ALV-011-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-012','Jaqueta bomber acolchoada','jaqueta-corta-vento','Bomber acolchoada com gola alta, zíper de dois cursores e bolsos internos. Enchimento térmico leve.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"jaqueta","cores":[{"nome":"Cinza mescla","hex":"#A1A1AA","hex2":"#71717A"},{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"}]}'::jsonb,
  (select id from public.brands where nome='Adidas'),(select id from public.categories where slug='jaquetas'),
  559.9,null,false,false,true,false,11
where not exists (select 1 from public.products where sku='ALV-012');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-012'),'PP','Cinza mescla','#A1A1AA',4,'ALV-012-PP-1'),
  ((select id from public.products where sku='ALV-012'),'PP','Grafite','#3A3A40',2,'ALV-012-PP-2'),
  ((select id from public.products where sku='ALV-012'),'P','Cinza mescla','#A1A1AA',11,'ALV-012-P-1'),
  ((select id from public.products where sku='ALV-012'),'P','Grafite','#3A3A40',5,'ALV-012-P-2'),
  ((select id from public.products where sku='ALV-012'),'M','Cinza mescla','#A1A1AA',9,'ALV-012-M-1'),
  ((select id from public.products where sku='ALV-012'),'M','Grafite','#3A3A40',4,'ALV-012-M-2'),
  ((select id from public.products where sku='ALV-012'),'G','Cinza mescla','#A1A1AA',7,'ALV-012-G-1'),
  ((select id from public.products where sku='ALV-012'),'G','Grafite','#3A3A40',3,'ALV-012-G-2'),
  ((select id from public.products where sku='ALV-012'),'GG','Cinza mescla','#A1A1AA',5,'ALV-012-GG-1'),
  ((select id from public.products where sku='ALV-012'),'GG','Grafite','#3A3A40',2,'ALV-012-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-013','Camiseta gola polo listrada','polo-lisa','Polo listrada em algodão pima com bandeira bordada no peito e fenda lateral na barra.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"camiseta","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Chumbo","hex":"#52525B","hex2":"#3F3F46"}]}'::jsonb,
  (select id from public.brands where nome='Tommy Hilfiger'),(select id from public.categories where slug='camisetas'),
  429.9,549.9,false,false,false,true,12
where not exists (select 1 from public.products where sku='ALV-013');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-013'),'PP','Branco','#FAFAFA',4,'ALV-013-PP-1'),
  ((select id from public.products where sku='ALV-013'),'PP','Chumbo','#52525B',2,'ALV-013-PP-2'),
  ((select id from public.products where sku='ALV-013'),'P','Branco','#FAFAFA',11,'ALV-013-P-1'),
  ((select id from public.products where sku='ALV-013'),'P','Chumbo','#52525B',5,'ALV-013-P-2'),
  ((select id from public.products where sku='ALV-013'),'M','Branco','#FAFAFA',9,'ALV-013-M-1'),
  ((select id from public.products where sku='ALV-013'),'M','Chumbo','#52525B',4,'ALV-013-M-2'),
  ((select id from public.products where sku='ALV-013'),'G','Branco','#FAFAFA',7,'ALV-013-G-1'),
  ((select id from public.products where sku='ALV-013'),'G','Chumbo','#52525B',3,'ALV-013-G-2'),
  ((select id from public.products where sku='ALV-013'),'GG','Branco','#FAFAFA',5,'ALV-013-GG-1'),
  ((select id from public.products where sku='ALV-013'),'GG','Chumbo','#52525B',2,'ALV-013-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-014','Moletom careca básico pesado','moletom-careca','Moletom sem capuz em felpa 320g, gola canelada com fita de reforço e caimento reto. O básico que funciona.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"moletom","cores":[{"nome":"Areia","hex":"#C9C2B6","hex2":"#A29A8C"},{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"}]}'::jsonb,
  (select id from public.brands where nome='Puma'),(select id from public.categories where slug='moletons'),
  219.9,null,false,true,false,false,13
where not exists (select 1 from public.products where sku='ALV-014');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-014'),'PP','Areia','#C9C2B6',4,'ALV-014-PP-1'),
  ((select id from public.products where sku='ALV-014'),'PP','Branco','#FAFAFA',2,'ALV-014-PP-2'),
  ((select id from public.products where sku='ALV-014'),'P','Areia','#C9C2B6',11,'ALV-014-P-1'),
  ((select id from public.products where sku='ALV-014'),'P','Branco','#FAFAFA',5,'ALV-014-P-2'),
  ((select id from public.products where sku='ALV-014'),'M','Areia','#C9C2B6',9,'ALV-014-M-1'),
  ((select id from public.products where sku='ALV-014'),'M','Branco','#FAFAFA',4,'ALV-014-M-2'),
  ((select id from public.products where sku='ALV-014'),'G','Areia','#C9C2B6',7,'ALV-014-G-1'),
  ((select id from public.products where sku='ALV-014'),'G','Branco','#FAFAFA',3,'ALV-014-G-2'),
  ((select id from public.products where sku='ALV-014'),'GG','Areia','#C9C2B6',5,'ALV-014-GG-1'),
  ((select id from public.products where sku='ALV-014'),'GG','Branco','#FAFAFA',2,'ALV-014-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-015','Short de sarja com cordão','short-sarja','Short em sarja de algodão com cós de elástico parcial, cordão em fita e dois bolsos faca.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"short","cores":[{"nome":"Cinza mescla","hex":"#A1A1AA","hex2":"#71717A"},{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"}]}'::jsonb,
  (select id from public.brands where nome='Adidas'),(select id from public.categories where slug='shorts'),
  159.9,null,false,false,true,false,14
where not exists (select 1 from public.products where sku='ALV-015');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-015'),'PP','Cinza mescla','#A1A1AA',4,'ALV-015-PP-1'),
  ((select id from public.products where sku='ALV-015'),'PP','Grafite','#3A3A40',2,'ALV-015-PP-2'),
  ((select id from public.products where sku='ALV-015'),'P','Cinza mescla','#A1A1AA',11,'ALV-015-P-1'),
  ((select id from public.products where sku='ALV-015'),'P','Grafite','#3A3A40',5,'ALV-015-P-2'),
  ((select id from public.products where sku='ALV-015'),'M','Cinza mescla','#A1A1AA',9,'ALV-015-M-1'),
  ((select id from public.products where sku='ALV-015'),'M','Grafite','#3A3A40',4,'ALV-015-M-2'),
  ((select id from public.products where sku='ALV-015'),'G','Cinza mescla','#A1A1AA',7,'ALV-015-G-1'),
  ((select id from public.products where sku='ALV-015'),'G','Grafite','#3A3A40',3,'ALV-015-G-2'),
  ((select id from public.products where sku='ALV-015'),'GG','Cinza mescla','#A1A1AA',5,'ALV-015-GG-1'),
  ((select id from public.products where sku='ALV-015'),'GG','Grafite','#3A3A40',2,'ALV-015-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-016','Conjunto moletom capuz + calça','conjunto-moletom','Conjunto em felpa premium com capuz duplo e calça de cós ajustável. Vendidos juntos, na mesma cor.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"conjunto","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Off-white","hex":"#F1F1F3","hex2":"#C9C9D1"}]}'::jsonb,
  (select id from public.brands where nome='Nike'),(select id from public.categories where slug='conjuntos'),
  749.9,929.9,false,true,false,true,15
where not exists (select 1 from public.products where sku='ALV-016');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-016'),'PP','Branco','#FAFAFA',4,'ALV-016-PP-1'),
  ((select id from public.products where sku='ALV-016'),'PP','Off-white','#F1F1F3',2,'ALV-016-PP-2'),
  ((select id from public.products where sku='ALV-016'),'P','Branco','#FAFAFA',11,'ALV-016-P-1'),
  ((select id from public.products where sku='ALV-016'),'P','Off-white','#F1F1F3',5,'ALV-016-P-2'),
  ((select id from public.products where sku='ALV-016'),'M','Branco','#FAFAFA',9,'ALV-016-M-1'),
  ((select id from public.products where sku='ALV-016'),'M','Off-white','#F1F1F3',4,'ALV-016-M-2'),
  ((select id from public.products where sku='ALV-016'),'G','Branco','#FAFAFA',7,'ALV-016-G-1'),
  ((select id from public.products where sku='ALV-016'),'G','Off-white','#F1F1F3',3,'ALV-016-G-2'),
  ((select id from public.products where sku='ALV-016'),'GG','Branco','#FAFAFA',5,'ALV-016-GG-1'),
  ((select id from public.products where sku='ALV-016'),'GG','Off-white','#F1F1F3',2,'ALV-016-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-017','Jaqueta jeans lavagem média','jaqueta-jeans','Jaqueta trucker em jeans rígido com bolsos frontais, ajuste lateral por botões e forro em algodão.','{"comp":"Algodão 100%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"jaqueta","cores":[{"nome":"Areia","hex":"#C9C2B6","hex2":"#A29A8C"},{"nome":"Chumbo","hex":"#52525B","hex2":"#3F3F46"}]}'::jsonb,
  (select id from public.brands where nome='Tommy Hilfiger'),(select id from public.categories where slug='jaquetas'),
  349.9,null,false,false,true,false,16
where not exists (select 1 from public.products where sku='ALV-017');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-017'),'PP','Areia','#C9C2B6',4,'ALV-017-PP-1'),
  ((select id from public.products where sku='ALV-017'),'PP','Chumbo','#52525B',2,'ALV-017-PP-2'),
  ((select id from public.products where sku='ALV-017'),'P','Areia','#C9C2B6',11,'ALV-017-P-1'),
  ((select id from public.products where sku='ALV-017'),'P','Chumbo','#52525B',5,'ALV-017-P-2'),
  ((select id from public.products where sku='ALV-017'),'M','Areia','#C9C2B6',9,'ALV-017-M-1'),
  ((select id from public.products where sku='ALV-017'),'M','Chumbo','#52525B',4,'ALV-017-M-2'),
  ((select id from public.products where sku='ALV-017'),'G','Areia','#C9C2B6',7,'ALV-017-G-1'),
  ((select id from public.products where sku='ALV-017'),'G','Chumbo','#52525B',3,'ALV-017-G-2'),
  ((select id from public.products where sku='ALV-017'),'GG','Areia','#C9C2B6',5,'ALV-017-GG-1'),
  ((select id from public.products where sku='ALV-017'),'GG','Chumbo','#52525B',2,'ALV-017-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-018','Camiseta manga longa canelada','polo-piquet-azul','Manga longa em malha canelada fina, gola careca e punhos ajustados. Corte alongado.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"camiseta","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Chumbo","hex":"#52525B","hex2":"#3F3F46"}]}'::jsonb,
  (select id from public.brands where nome='Lacoste'),(select id from public.categories where slug='camisetas'),
  379.9,null,false,false,true,false,17
where not exists (select 1 from public.products where sku='ALV-018');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-018'),'PP','Branco','#FAFAFA',4,'ALV-018-PP-1'),
  ((select id from public.products where sku='ALV-018'),'PP','Chumbo','#52525B',2,'ALV-018-PP-2'),
  ((select id from public.products where sku='ALV-018'),'P','Branco','#FAFAFA',11,'ALV-018-P-1'),
  ((select id from public.products where sku='ALV-018'),'P','Chumbo','#52525B',5,'ALV-018-P-2'),
  ((select id from public.products where sku='ALV-018'),'M','Branco','#FAFAFA',9,'ALV-018-M-1'),
  ((select id from public.products where sku='ALV-018'),'M','Chumbo','#52525B',4,'ALV-018-M-2'),
  ((select id from public.products where sku='ALV-018'),'G','Branco','#FAFAFA',7,'ALV-018-G-1'),
  ((select id from public.products where sku='ALV-018'),'G','Chumbo','#52525B',3,'ALV-018-G-2'),
  ((select id from public.products where sku='ALV-018'),'GG','Branco','#FAFAFA',5,'ALV-018-GG-1'),
  ((select id from public.products where sku='ALV-018'),'GG','Chumbo','#52525B',2,'ALV-018-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-019','Calça alfaiataria pence','calca-alfaiataria','Alfaiataria em tecido de toque seco com pence frontal, cós largo e caimento fluido. Streetwear que passa em qualquer porta.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Loose fit","tipo":"calca","cores":[{"nome":"Branco","hex":"#FAFAFA","hex2":"#D8D8DE"},{"nome":"Chumbo","hex":"#52525B","hex2":"#3F3F46"}]}'::jsonb,
  (select id from public.brands where nome='Lacoste'),(select id from public.categories where slug='calcas'),
  319.9,null,true,false,true,false,18
where not exists (select 1 from public.products where sku='ALV-019');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-019'),'PP','Branco','#FAFAFA',4,'ALV-019-PP-1'),
  ((select id from public.products where sku='ALV-019'),'PP','Chumbo','#52525B',2,'ALV-019-PP-2'),
  ((select id from public.products where sku='ALV-019'),'P','Branco','#FAFAFA',11,'ALV-019-P-1'),
  ((select id from public.products where sku='ALV-019'),'P','Chumbo','#52525B',5,'ALV-019-P-2'),
  ((select id from public.products where sku='ALV-019'),'M','Branco','#FAFAFA',9,'ALV-019-M-1'),
  ((select id from public.products where sku='ALV-019'),'M','Chumbo','#52525B',4,'ALV-019-M-2'),
  ((select id from public.products where sku='ALV-019'),'G','Branco','#FAFAFA',7,'ALV-019-G-1'),
  ((select id from public.products where sku='ALV-019'),'G','Chumbo','#52525B',3,'ALV-019-G-2'),
  ((select id from public.products where sku='ALV-019'),'GG','Branco','#FAFAFA',5,'ALV-019-GG-1'),
  ((select id from public.products where sku='ALV-019'),'GG','Chumbo','#52525B',2,'ALV-019-GG-2')
on conflict (sku_variante) do nothing;

insert into public.products (sku,nome,slug,descricao,detalhes,brand_id,category_id,preco,preco_de,destaque,mais_vendido,novidade,promocao,ordem)
select 'ALV-020','Moletom com zíper full-zip','moletom-zip','Full-zip em felpa escovada com bolsos laterais, capuz forrado e zíper metálico anti-travamento.','{"comp":"Algodão 80% / Poliéster 20%","origem":"Importado","peso":"0,42 kg","modelo":"Regular fit","tipo":"moletom","cores":[{"nome":"Grafite","hex":"#3A3A40","hex2":"#232326"},{"nome":"Bege","hex":"#D9C9B0","hex2":"#B8A68A"}]}'::jsonb,
  (select id from public.brands where nome='Puma'),(select id from public.categories where slug='moletons'),
  349.9,449.9,false,false,false,true,19
where not exists (select 1 from public.products where sku='ALV-020');
insert into public.product_variants (product_id,tamanho,cor,cor_hex,estoque,sku_variante) values
  ((select id from public.products where sku='ALV-020'),'PP','Grafite','#3A3A40',2,'ALV-020-PP-1'),
  ((select id from public.products where sku='ALV-020'),'PP','Bege','#D9C9B0',1,'ALV-020-PP-2'),
  ((select id from public.products where sku='ALV-020'),'P','Grafite','#3A3A40',4,'ALV-020-P-1'),
  ((select id from public.products where sku='ALV-020'),'P','Bege','#D9C9B0',2,'ALV-020-P-2'),
  ((select id from public.products where sku='ALV-020'),'M','Grafite','#3A3A40',4,'ALV-020-M-1'),
  ((select id from public.products where sku='ALV-020'),'M','Bege','#D9C9B0',2,'ALV-020-M-2'),
  ((select id from public.products where sku='ALV-020'),'G','Grafite','#3A3A40',0,'ALV-020-G-1'),
  ((select id from public.products where sku='ALV-020'),'G','Bege','#D9C9B0',0,'ALV-020-G-2'),
  ((select id from public.products where sku='ALV-020'),'GG','Grafite','#3A3A40',4,'ALV-020-GG-1'),
  ((select id from public.products where sku='ALV-020'),'GG','Bege','#D9C9B0',2,'ALV-020-GG-2')
on conflict (sku_variante) do nothing;
