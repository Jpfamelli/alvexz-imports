-- ============================================================================
-- ALVEXZ IMPORTS — Cadastro de peças
-- Rode este arquivo UMA VEZ no SQL Editor. Ele cria um atalho que registra
-- produto e grade de tamanhos num comando só, em vez de escrever dois inserts
-- e caçar UUID de marca e categoria toda vez.
-- ============================================================================

create or replace function public.cadastrar_peca(
  p_sku        text,
  p_nome       text,
  p_marca      text,      -- 'Nike', 'Adidas', 'Puma', 'Tommy Hilfiger', 'Lacoste'
  p_categoria  text,      -- 'camisetas','calcas','moletons','conjuntos','shorts','tenis'
  p_preco      numeric,
  p_tamanhos   jsonb,     -- {"P":5,"M":8,"G":3}  -> tamanho: quantidade
  p_preco_de   numeric default null,
  p_descricao  text    default null,
  p_cor        text    default 'Preto',
  p_destaque   boolean default false,
  p_novidade   boolean default false,
  p_promocao   boolean default false
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_brand uuid; v_cat uuid; v_slug text; v_tam text; v_qtd int;
begin
  select id into v_brand from public.brands
   where lower(nome) = lower(trim(p_marca)) or slug = public.slugify(p_marca);
  if v_brand is null then
    raise exception 'Marca "%" não existe. Veja: select nome from brands;', p_marca;
  end if;

  select id into v_cat from public.categories
   where slug = lower(trim(p_categoria)) or lower(nome) = lower(trim(p_categoria));
  if v_cat is null then
    raise exception 'Categoria "%" não existe. Veja: select slug from categories;', p_categoria;
  end if;

  if p_preco_de is not null and p_preco_de <= p_preco then
    raise exception 'preco_de (%) tem que ser maior que preco (%)', p_preco_de, p_preco;
  end if;

  -- slug único: se já existe, gruda o sku no fim
  v_slug := public.slugify(p_nome);
  if exists (select 1 from public.products where slug = v_slug) then
    v_slug := v_slug || '-' || public.slugify(p_sku);
  end if;

  insert into public.products (sku, nome, slug, descricao, preco, preco_de,
                               brand_id, category_id, destaque, novidade, promocao, ativo)
  values (p_sku, p_nome, v_slug, p_descricao, p_preco, p_preco_de,
          v_brand, v_cat, p_destaque, p_novidade,
          coalesce(p_promocao, p_preco_de is not null), true)
  returning id into v_id;

  for v_tam, v_qtd in select key, value::int from jsonb_each_text(p_tamanhos) loop
    insert into public.product_variants (product_id, tamanho, cor, estoque, sku_variante)
    values (v_id, upper(v_tam), p_cor, v_qtd, p_sku || '-' || upper(v_tam));
  end loop;

  return v_id;
end $$;

revoke all on function public.cadastrar_peca(text,text,text,text,numeric,jsonb,numeric,text,text,boolean,boolean,boolean) from public;
grant execute on function public.cadastrar_peca(text,text,text,text,numeric,jsonb,numeric,text,text,boolean,boolean,boolean) to authenticated;

-- ============================================================================
-- COMO USAR — copie, troque os valores, rode
-- ============================================================================

-- Roupa (tamanhos PP a GG):
select public.cadastrar_peca(
  'ALV-001',                             -- SKU, precisa ser único
  'Moletom Tech Fleece com capuz',       -- nome que aparece no site
  'Nike',                                -- marca
  'moletons',                            -- categoria
  399.90,                                -- preço de venda
  '{"PP":2,"P":5,"M":8,"G":5,"GG":3}',   -- grade: tamanho e quantidade
  499.90,                                -- preço "de" (opcional, gera o selo de desconto)
  'Moletom em tecido tech fleece, capuz forrado, bolso canguru.',
  'Preto',                               -- cor
  true                                   -- entra em DESTAQUES
);

-- Tênis (numeração 36 a 42):
select public.cadastrar_peca(
  'ALV-002', 'Tênis Suede Classic', 'Puma', 'tenis',
  449.90, '{"38":2,"39":4,"40":5,"41":4,"42":2}', 599.90,
  'Cabedal em camurça, entressola de borracha.', 'Preto', false, true
);

-- ============================================================================
-- CONFERIR O QUE ENTROU
-- ============================================================================

-- catálogo com estoque somado
select p.sku, p.nome, b.nome as marca, c.nome as categoria,
       p.preco, sum(v.estoque) as estoque_total
  from public.products p
  join public.brands b     on b.id = p.brand_id
  join public.categories c on c.id = p.category_id
  left join public.product_variants v on v.product_id = p.id
 group by p.sku, p.nome, b.nome, c.nome, p.preco, p.ordem
 order by p.ordem, p.nome;

-- grade de uma peça
select p.nome, v.tamanho, v.cor, v.estoque
  from public.products p join public.product_variants v on v.product_id = p.id
 where p.sku = 'ALV-001' order by v.tamanho;

-- ============================================================================
-- CORRIGIR DEPOIS DE CADASTRAR
-- ============================================================================

-- repor estoque de um tamanho
-- update public.product_variants set estoque = 10
--  where sku_variante = 'ALV-001-M';

-- mudar preço
-- update public.products set preco = 379.90 where sku = 'ALV-001';

-- tirar do ar sem apagar (preserva o histórico de pedidos)
-- update public.products set ativo = false where sku = 'ALV-001';

-- apagar de vez (só se nunca foi vendida)
-- delete from public.products where sku = 'ALV-001';
