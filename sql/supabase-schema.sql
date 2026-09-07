-- ============================================================================
-- ALVEXZ IMPORTS — Schema PostgreSQL / Supabase  (v2, com Stripe)
-- Execute no SQL Editor do Supabase, de cima para baixo, em um projeto novo.
-- Princípio: o cliente NUNCA envia preço, estoque ou status. Tudo é calculado
-- no servidor. RLS está ligado em todas as tabelas, sem exceção.
-- Pagamento: Stripe Checkout (Pix e boleto). O pedido só vira "pago" pelo
-- webhook assinado da Stripe (Edge Function stripe-webhook).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================
create type order_status as enum
  ('pagamento_pendente','pagamento_aprovado','em_preparacao','enviado','a_caminho','entregue','cancelado');
create type payment_method as enum ('pix','boleto');
create type coupon_type    as enum ('percentual','fixo','frete_gratis');
create type user_role      as enum ('cliente','admin');

-- ============================================================================
-- 2. HELPERS SEM DEPENDÊNCIA
-- ============================================================================
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.slugify(txt text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(txt,''))), '[^a-z0-9]+', '-', 'g'));
$$;

-- ============================================================================
-- 3. PERFIS
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null check (length(nome) between 3 and 120),
  email       text not null,
  telefone    text check (telefone ~ '^\+?[0-9]{10,15}$'),
  cpf         text unique check (cpf ~ '^[0-9]{11}$'),
  role        user_role not null default 'cliente',
  aceita_news boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger t_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente no signup.
-- Os e-mails da lista abaixo nascem como admin: é assim que o primeiro
-- administrador aparece sem precisar de UPDATE manual no SQL Editor.
-- A lista aqui é a trava real; ADMIN_EMAILS no HTML é só cosmética.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_role user_role := 'cliente';
begin
  if lower(new.email) in ('gimoreiramendes@gmail.com','jpfamellistos@gmail.com') then
    v_role := 'admin';
  end if;
  insert into public.profiles (id, nome, email, role)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'nome'),''),'Cliente'), new.email, v_role);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================================
-- 4. CATÁLOGO
-- ============================================================================
create table public.brands (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null unique,
  slug   text not null unique,
  logo_url text,
  ativo  boolean not null default true,
  ordem  int not null default 0
);

create table public.categories (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null unique,
  slug      text not null unique,
  descricao text,
  imagem_url text,
  tipo      text not null default 'camiseta',   -- silhueta da ilustração SVG do site
  ativo     boolean not null default true,
  ordem     int not null default 0
);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  sku          text not null unique,
  nome         text not null check (length(nome) between 3 and 200),
  slug         text not null unique,
  descricao    text,
  detalhes     jsonb not null default '{}'::jsonb,   -- composição, modelagem, peso, cores…
  brand_id     uuid references public.brands(id) on delete restrict,
  category_id  uuid references public.categories(id) on delete restrict,
  preco        numeric(10,2) not null check (preco > 0),
  preco_de     numeric(10,2) check (preco_de is null or preco_de > preco),
  destaque     boolean not null default false,
  mais_vendido boolean not null default false,
  novidade     boolean not null default false,
  promocao     boolean not null default false,
  ativo        boolean not null default true,
  ordem        int not null default 0,
  rating       numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.products (category_id) where ativo;
create index on public.products (brand_id) where ativo;
create index on public.products using gin (to_tsvector('portuguese', nome || ' ' || coalesce(descricao,'')));
create trigger t_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- Estoque vive na variante (tamanho + cor), nunca no produto
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  tamanho     text not null,
  cor         text not null default 'Único',
  cor_hex     text,
  estoque     int not null default 0 check (estoque >= 0),
  sku_variante text unique,
  unique (product_id, tamanho, cor)
);
create index on public.product_variants (product_id);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text,
  ordem      int not null default 0
);
create index on public.product_images (product_id, ordem);

create table public.banners (
  id       uuid primary key default gen_random_uuid(),
  kicker   text,
  titulo   text not null,
  subtitulo text,
  cta_texto text,
  cta_href text,
  imagem_url text,
  ativo    boolean not null default true,
  ordem    int not null default 0,
  inicia_em timestamptz,
  termina_em timestamptz
);

-- ============================================================================
-- 5. ENDEREÇOS
-- ============================================================================
create table public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  cep        text not null check (cep ~ '^[0-9]{8}$'),
  rua        text not null,
  numero     text not null,
  complemento text,
  bairro     text,
  cidade     text not null,
  uf         char(2) not null,
  principal  boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.addresses (user_id);

-- ============================================================================
-- 6. CUPONS
-- ============================================================================
create table public.coupons (
  id             uuid primary key default gen_random_uuid(),
  codigo         text not null unique check (codigo = upper(codigo)),
  descricao      text,
  tipo           coupon_type not null,
  valor          numeric(10,2) not null default 0,
  minimo_compra  numeric(10,2) not null default 0,
  usos_maximos   int,
  usos_atuais    int not null default 0,
  primeira_compra boolean not null default false,
  ativo          boolean not null default true,
  inicia_em      timestamptz,
  expira_em      timestamptz,
  created_at     timestamptz not null default now()
);

-- ============================================================================
-- 7. PEDIDOS
-- ============================================================================
create sequence if not exists order_number_seq start 1000;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  numero         text not null unique default ('ALV-' || to_char(now(),'YYYY') || '-' || nextval('order_number_seq')),
  user_id        uuid references auth.users(id) on delete set null,
  status         order_status not null default 'pagamento_pendente',
  -- snapshot: preserva o pedido mesmo se o catálogo mudar depois
  cliente_nome   text not null,
  cliente_email  text not null,
  cliente_cpf    text not null,
  cliente_telefone text,
  endereco       jsonb not null,
  subtotal       numeric(10,2) not null check (subtotal >= 0),
  desconto       numeric(10,2) not null default 0 check (desconto >= 0),
  desconto_pix   numeric(10,2) not null default 0 check (desconto_pix >= 0),
  frete          numeric(10,2) not null default 0 check (frete >= 0),
  total          numeric(10,2) not null check (total >= 0),
  coupon_id      uuid references public.coupons(id) on delete set null,
  metodo_pagamento payment_method not null,
  -- Stripe. Nada de dado bancário aqui: a Stripe guarda tudo do lado dela.
  gateway_payment_id  text,          -- payment_intent da Stripe
  stripe_session_id   text,          -- Checkout Session
  stripe_checkout_url text,          -- link para o cliente voltar a pagar
  boleto_url         text,
  boleto_linha       text,
  pix_copiaecola     text,
  frete_transportadora text,
  frete_prazo    text,
  codigo_rastreio text,
  expira_em      timestamptz,
  pago_em        timestamptz,
  enviado_em     timestamptz,
  entregue_em    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);
create index on public.orders (status);
create index on public.orders (stripe_session_id);
create trigger t_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  variant_id  uuid references public.product_variants(id) on delete set null,
  -- snapshot do momento da compra
  nome        text not null,
  marca       text,
  tamanho     text not null,
  cor         text,
  imagem_url  text,
  preco_unitario numeric(10,2) not null check (preco_unitario > 0),
  quantidade  int not null check (quantidade > 0)
);
create index on public.order_items (order_id);

create table public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta      int not null,
  motivo     text not null,
  order_id   uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 8. FAVORITOS, AVALIAÇÕES, NEWSLETTER, LOGS
-- ============================================================================
create table public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  order_id   uuid references public.orders(id) on delete set null,
  nota       int not null check (nota between 1 and 5),
  comentario text check (length(comentario) <= 2000),
  aprovado   boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index on public.reviews (product_id) where aprovado;

create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique check (email ~* '^[^@]+@[^@]+\.[a-z]{2,}$'),
  nome       text,
  origem     text default 'rodape',
  ativo      boolean not null default true,
  token      uuid not null unique default gen_random_uuid(),
  ultimo_envio_em  timestamptz,
  descadastrado_em timestamptz,
  created_at timestamptz not null default now()
);
create index on public.newsletter_subscribers (ativo) where ativo;

-- Log de segurança: quem mexeu em preço, estoque, status e permissões
create table public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references auth.users(id) on delete set null,
  acao       text not null,
  tabela     text not null,
  registro_id text,
  antes      jsonb,
  depois     jsonb,
  ip         inet,
  created_at timestamptz not null default now()
);
create index on public.audit_log (created_at desc);

create or replace function public.audit_changes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, acao, tabela, registro_id, antes, depois)
  values (auth.uid(), tg_op, tg_table_name,
          coalesce(new.id::text, old.id::text),
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;
create trigger t_audit_products after insert or update or delete on public.products
  for each row execute function public.audit_changes();
create trigger t_audit_variants after update or delete on public.product_variants
  for each row execute function public.audit_changes();
create trigger t_audit_coupons after insert or update or delete on public.coupons
  for each row execute function public.audit_changes();
create trigger t_audit_orders after update on public.orders
  for each row execute function public.audit_changes();

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles              enable row level security;
alter table public.brands                enable row level security;
alter table public.categories            enable row level security;
alter table public.products              enable row level security;
alter table public.product_variants      enable row level security;
alter table public.product_images        enable row level security;
alter table public.banners               enable row level security;
alter table public.addresses             enable row level security;
alter table public.coupons               enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.stock_movements       enable row level security;
alter table public.favorites             enable row level security;
alter table public.reviews               enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.audit_log             enable row level security;

-- ---------- Catálogo: leitura pública, escrita só admin ----------
create policy "catalogo publico"       on public.brands           for select using (ativo or public.is_admin());
create policy "brands admin"           on public.brands           for all    using (public.is_admin()) with check (public.is_admin());
create policy "categorias publicas"    on public.categories       for select using (ativo or public.is_admin());
create policy "categorias admin"       on public.categories       for all    using (public.is_admin()) with check (public.is_admin());
create policy "produtos publicos"      on public.products         for select using (ativo or public.is_admin());
create policy "produtos admin"         on public.products         for all    using (public.is_admin()) with check (public.is_admin());
create policy "variantes publicas"     on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.ativo or public.is_admin())));
create policy "variantes admin"        on public.product_variants for all    using (public.is_admin()) with check (public.is_admin());
create policy "imagens publicas"       on public.product_images   for select using (true);
create policy "imagens admin"          on public.product_images   for all    using (public.is_admin()) with check (public.is_admin());
create policy "banners publicos"       on public.banners          for select using (
  (ativo and (inicia_em is null or inicia_em <= now()) and (termina_em is null or termina_em >= now())) or public.is_admin());
create policy "banners admin"          on public.banners          for all    using (public.is_admin()) with check (public.is_admin());

-- ---------- Perfis ----------
create policy "perfil proprio leitura" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "perfil proprio update"  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "perfis admin"           on public.profiles for all    using (public.is_admin()) with check (public.is_admin());

-- Impede que o CLIENTE promova a si mesmo a admin. auth.uid() nulo = SQL
-- Editor / service_role, contextos já confiáveis (é por eles que o primeiro
-- admin nasce quando o e-mail não está na lista do handle_new_user).
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Alteração de papel não permitida';
  end if;
  return new;
end $$;
create trigger t_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ---------- Endereços ----------
create policy "enderecos proprios" on public.addresses for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- Cupons: cliente NÃO lê a tabela ----------
create policy "cupons admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.validar_cupom(p_codigo text, p_subtotal numeric)
returns table (valido boolean, tipo coupon_type, valor numeric, desconto numeric, mensagem text, descricao text)
language plpgsql security definer set search_path = public as $$
declare c public.coupons%rowtype; ja_comprou boolean;
begin
  select * into c from public.coupons where codigo = upper(trim(p_codigo));
  if not found or not c.ativo then
    return query select false, null::coupon_type, 0::numeric, 0::numeric, 'Cupom inválido ou expirado.', null::text; return;
  end if;
  if (c.inicia_em is not null and c.inicia_em > now())
     or (c.expira_em is not null and c.expira_em < now()) then
    return query select false, null::coupon_type, 0::numeric, 0::numeric, 'Cupom fora do período de validade.', null::text; return;
  end if;
  if c.usos_maximos is not null and c.usos_atuais >= c.usos_maximos then
    return query select false, null::coupon_type, 0::numeric, 0::numeric, 'Este cupom atingiu o limite de usos.', null::text; return;
  end if;
  if p_subtotal < c.minimo_compra then
    return query select false, null::coupon_type, 0::numeric, 0::numeric,
      'Este cupom vale para compras acima de R$ ' || to_char(c.minimo_compra,'FM999G999D00') || '.', null::text; return;
  end if;
  if c.primeira_compra then
    select exists (select 1 from public.orders o
      where o.user_id = auth.uid() and o.status <> 'cancelado') into ja_comprou;
    if ja_comprou then
      return query select false, null::coupon_type, 0::numeric, 0::numeric, 'Cupom válido apenas na primeira compra.', null::text; return;
    end if;
  end if;
  return query select true, c.tipo, c.valor,
    case c.tipo when 'percentual' then round(p_subtotal * c.valor / 100, 2)
                when 'fixo'       then least(c.valor, p_subtotal)
                else 0 end,
    'Cupom aplicado.', c.descricao;
end $$;
revoke all on function public.validar_cupom(text,numeric) from public;
grant execute on function public.validar_cupom(text,numeric) to anon, authenticated;

-- ---------- Pedidos ----------
create policy "pedidos proprios"  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "pedidos admin"     on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

create policy "itens proprios" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "itens admin"    on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

create policy "movimentos admin" on public.stock_movements for all
  using (public.is_admin()) with check (public.is_admin());

create policy "favoritos proprios" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reviews publicas" on public.reviews for select
  using (aprovado or user_id = auth.uid() or public.is_admin());
create policy "reviews insert de quem comprou" on public.reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid() and oi.product_id = reviews.product_id
        and o.status in ('pagamento_aprovado','em_preparacao','enviado','a_caminho','entregue')));
create policy "reviews update proprio" on public.reviews for update
  using (user_id = auth.uid() and not aprovado) with check (user_id = auth.uid());
create policy "reviews admin" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

create policy "newsletter insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter admin"  on public.newsletter_subscribers for all
  using (public.is_admin()) with check (public.is_admin());

create policy "audit admin" on public.audit_log for select using (public.is_admin());

-- ============================================================================
-- 10. CRIAÇÃO DE PEDIDO (transacional, com trava de estoque)
-- Chamada pela Edge Function `checkout` com o JWT do cliente. O cliente envia
-- apenas variant_id + quantidade; preço, cupom, desconto Pix e total vêm daqui.
-- O frete chega calculado pela Edge Function (nunca pelo navegador).
-- ============================================================================
create or replace function public.criar_pedido(
  p_itens        jsonb,      -- [{"variant_id":"uuid","quantidade":2}, ...]
  p_endereco     jsonb,
  p_metodo       payment_method,
  p_cupom        text default null,
  p_frete_valor  numeric default 0,
  p_frete_nome   text default null,
  p_frete_prazo  text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders; v_item jsonb; v_var record; v_prof public.profiles%rowtype;
  v_sub numeric := 0; v_desc numeric := 0; v_pix numeric := 0; v_total numeric;
  v_coupon_id uuid; v_val record;
  c_pix_desconto constant numeric := 0.07;   -- 7% no Pix (mesmo valor de CONFIG.pixDiscount no site)
begin
  if auth.uid() is null then raise exception 'Autenticação obrigatória'; end if;
  select * into v_prof from public.profiles where id = auth.uid();
  if v_prof.cpf is null then raise exception 'Informe seu CPF antes de finalizar'; end if;
  if p_itens is null or jsonb_array_length(p_itens) = 0 then raise exception 'Carrinho vazio'; end if;

  -- 1) trava as variantes e valida estoque
  for v_item in select * from jsonb_array_elements(p_itens) loop
    select pv.*, p.nome as pnome, p.preco, p.ativo, b.nome as marca
      into v_var
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      left join public.brands b on b.id = p.brand_id
     where pv.id = (v_item->>'variant_id')::uuid
     for update of pv;
    if not found or not v_var.ativo then raise exception 'Produto indisponível'; end if;
    if (v_item->>'quantidade')::int <= 0 then raise exception 'Quantidade inválida'; end if;
    if v_var.estoque < (v_item->>'quantidade')::int then
      raise exception 'Estoque insuficiente para % (tam %)', v_var.pnome, v_var.tamanho;
    end if;
    v_sub := v_sub + v_var.preco * (v_item->>'quantidade')::int;
  end loop;

  -- 2) cupom (revalidado no servidor, ignorando o que o cliente disse)
  if p_cupom is not null and trim(p_cupom) <> '' then
    select * into v_val from public.validar_cupom(p_cupom, v_sub);
    if v_val.valido then
      v_desc := v_val.desconto;
      select id into v_coupon_id from public.coupons where codigo = upper(trim(p_cupom));
      if v_val.tipo = 'frete_gratis' then p_frete_valor := 0; end if;
    end if;
  end if;

  -- 3) desconto Pix sobre o valor das peças (frete não entra)
  if p_metodo = 'pix' then
    v_pix := round(greatest(0, v_sub - v_desc) * c_pix_desconto, 2);
  end if;

  v_total := greatest(0, v_sub - v_desc - v_pix) + coalesce(p_frete_valor, 0);

  insert into public.orders (
    user_id, cliente_nome, cliente_email, cliente_cpf, cliente_telefone, endereco,
    subtotal, desconto, desconto_pix, frete, total, coupon_id, metodo_pagamento,
    frete_transportadora, frete_prazo, expira_em)
  values (auth.uid(), v_prof.nome, v_prof.email, v_prof.cpf, v_prof.telefone, p_endereco,
    v_sub, v_desc, v_pix, coalesce(p_frete_valor,0), v_total, v_coupon_id, p_metodo,
    p_frete_nome, p_frete_prazo,
    case when p_metodo = 'pix' then now() + interval '30 minutes' else now() + interval '3 days' end)
  returning * into v_order;

  -- 4) itens + baixa de estoque
  for v_item in select * from jsonb_array_elements(p_itens) loop
    select pv.*, p.nome as pnome, p.preco, b.nome as marca,
           (select url from public.product_images pi where pi.product_id = p.id order by ordem limit 1) as img
      into v_var
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      left join public.brands b on b.id = p.brand_id
     where pv.id = (v_item->>'variant_id')::uuid;

    insert into public.order_items (order_id, product_id, variant_id, nome, marca, tamanho, cor,
                                    imagem_url, preco_unitario, quantidade)
    values (v_order.id, v_var.product_id, v_var.id, v_var.pnome, v_var.marca, v_var.tamanho,
            v_var.cor, v_var.img, v_var.preco, (v_item->>'quantidade')::int);

    update public.product_variants
       set estoque = estoque - (v_item->>'quantidade')::int
     where id = v_var.id;

    insert into public.stock_movements (variant_id, delta, motivo, order_id, created_by)
    values (v_var.id, -(v_item->>'quantidade')::int, 'venda', v_order.id, auth.uid());
  end loop;

  if v_coupon_id is not null then
    update public.coupons set usos_atuais = usos_atuais + 1 where id = v_coupon_id;
  end if;

  return v_order;
end $$;
revoke all on function public.criar_pedido(jsonb,jsonb,payment_method,text,numeric,text,text) from public;
grant execute on function public.criar_pedido(jsonb,jsonb,payment_method,text,numeric,text,text) to authenticated;

-- Cancelamento pelo próprio cliente (só enquanto o pagamento está pendente)
create or replace function public.cancelar_pedido(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Autenticação obrigatória'; end if;
  update public.orders set status = 'cancelado'
   where id = p_order_id and user_id = auth.uid() and status = 'pagamento_pendente';
  if not found then raise exception 'Este pedido não pode mais ser cancelado por aqui. Fale com a loja.'; end if;
end $$;
revoke all on function public.cancelar_pedido(uuid) from public;
grant execute on function public.cancelar_pedido(uuid) to authenticated;

-- Devolve estoque ao cancelar + carimba as datas
create or replace function public.devolver_estoque() returns trigger
language plpgsql security definer set search_path = public as $$
declare it record;
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    for it in select variant_id, quantidade from public.order_items where order_id = new.id loop
      update public.product_variants set estoque = estoque + it.quantidade where id = it.variant_id;
      insert into public.stock_movements (variant_id, delta, motivo, order_id, created_by)
      values (it.variant_id, it.quantidade, 'cancelamento', new.id, auth.uid());
    end loop;
  end if;
  if new.status = 'pagamento_aprovado' and old.status <> 'pagamento_aprovado' then new.pago_em := now(); end if;
  if new.status = 'enviado'            and old.status <> 'enviado'            then new.enviado_em := now(); end if;
  if new.status = 'entregue'           and old.status <> 'entregue'           then new.entregue_em := now(); end if;
  return new;
end $$;
create trigger t_devolver_estoque before update on public.orders
  for each row execute function public.devolver_estoque();

create or replace function public.recalc_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    rating = coalesce((select round(avg(nota)::numeric,1) from public.reviews where product_id = pid and aprovado),0),
    reviews_count = (select count(*) from public.reviews where product_id = pid and aprovado)
  where p.id = pid;
  return coalesce(new, old);
end $$;
create trigger t_recalc_rating after insert or update or delete on public.reviews
  for each row execute function public.recalc_rating();

-- ============================================================================
-- 11. BUSCA
-- ============================================================================
create or replace function public.buscar_produtos(termo text, limite int default 12)
returns table (id uuid, nome text, slug text, preco numeric, preco_de numeric,
               marca text, categoria text, imagem text, rank real)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.slug, p.preco, p.preco_de, b.nome, c.nome,
         (select url from public.product_images pi where pi.product_id = p.id order by ordem limit 1),
         ts_rank(to_tsvector('portuguese', p.nome || ' ' || coalesce(b.nome,'') || ' ' || coalesce(c.nome,'')),
                 plainto_tsquery('portuguese', unaccent(termo))) as rank
    from public.products p
    left join public.brands b     on b.id = p.brand_id
    left join public.categories c on c.id = p.category_id
   where p.ativo
     and (to_tsvector('portuguese', p.nome || ' ' || coalesce(b.nome,'') || ' ' || coalesce(c.nome,''))
          @@ plainto_tsquery('portuguese', unaccent(termo))
          or unaccent(lower(p.nome)) like '%' || unaccent(lower(termo)) || '%')
   order by rank desc nulls last, p.mais_vendido desc, p.ordem
   limit least(limite, 40);
$$;
grant execute on function public.buscar_produtos(text,int) to anon, authenticated;

-- ============================================================================
-- 12. CADASTRO RÁPIDO DE PEÇA (SQL Editor ou painel)
-- ============================================================================
create or replace function public.cadastrar_peca(
  p_sku        text,
  p_nome       text,
  p_marca      text,
  p_categoria  text,
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
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Só administradores cadastram peças';
  end if;
  select id into v_brand from public.brands
   where lower(nome) = lower(trim(p_marca)) or slug = public.slugify(p_marca);
  if v_brand is null then raise exception 'Marca "%" não existe.', p_marca; end if;
  select id into v_cat from public.categories
   where slug = lower(trim(p_categoria)) or lower(nome) = lower(trim(p_categoria));
  if v_cat is null then raise exception 'Categoria "%" não existe.', p_categoria; end if;
  if p_preco_de is not null and p_preco_de <= p_preco then
    raise exception 'preco_de (%) tem que ser maior que preco (%)', p_preco_de, p_preco;
  end if;
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
-- 13. STORAGE
-- ============================================================================
insert into storage.buckets (id, name, public) values ('product-images','product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('banners','banners', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('brand-logos','brand-logos', true)
  on conflict (id) do nothing;

create policy "imagens leitura publica" on storage.objects for select
  using (bucket_id in ('product-images','banners','brand-logos'));
create policy "imagens upload admin" on storage.objects for insert
  with check (bucket_id in ('product-images','banners','brand-logos') and public.is_admin());
create policy "imagens update admin" on storage.objects for update
  using (bucket_id in ('product-images','banners','brand-logos') and public.is_admin());
create policy "imagens delete admin" on storage.objects for delete
  using (bucket_id in ('product-images','banners','brand-logos') and public.is_admin());

-- ============================================================================
-- 14. SEED MÍNIMO (marcas, categorias, cupons, banners)
-- Sem tênis nem acessórios: a loja só trabalha com roupa, grade PP-GG.
-- ============================================================================
insert into public.brands (nome, slug, ordem) values
  ('Nike','nike',1),('Adidas','adidas',2),('Puma','puma',3),
  ('Tommy Hilfiger','tommy-hilfiger',4),('Lacoste','lacoste',5)
on conflict do nothing;

insert into public.categories (nome, slug, tipo, ordem) values
  ('Camisetas','camisetas','camiseta',1),('Calças','calcas','calca',2),('Moletons','moletons','moletom',3),
  ('Conjuntos','conjuntos','conjunto',4),('Jaquetas','jaquetas','jaqueta',5),('Shorts','shorts','short',6)
on conflict do nothing;

insert into public.coupons (codigo, descricao, tipo, valor, minimo_compra, primeira_compra) values
  ('BEMVINDOS5','5% de desconto','percentual',5,0,false),
  ('ALVEXZ20','20% acima de R$ 500','percentual',20,500,false),
  ('FRETEGRATIS','Frete grátis acima de R$ 199','frete_gratis',0,199,false)
on conflict do nothing;

insert into public.banners (kicker, titulo, subtitulo, cta_texto, cta_href, ordem) values
  ('Drop 07 no ar','Style original','Peças selecionadas para quem busca autenticidade. Curadoria feita à mão, não por algoritmo.','Comprar agora','#/produtos',1),
  ('Frete grátis acima de R$ 399','Chegou drop novo','Moletons, cargas e conjuntos recém-chegados. Estoque curto por tamanho.','Ver novidades','#/novidades',2),
  ('Até 30% off','Última chamada','Peças de coleções anteriores com preço fechado. Quando acaba, não volta.','Ver promoções','#/promocoes',3);
