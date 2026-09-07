# ALVEXZ IMPORTS — contexto do projeto

Este arquivo é a memória do projeto. Ele resume meses de decisões tomadas em
conversa com o dono. Leia antes de mexer em qualquer coisa e **mantenha
atualizado**: quando uma decisão nova for tomada aqui no Code, registre nele.

## O que é

E-commerce de streetwear importado (Nike, Adidas, Puma, Tommy Hilfiger,
Lacoste). Dono: João, dev freelancer, opera a loja com o e-mail
`gimoreiramendes@gmail.com` (admin). Instagram: `@alvezx.imports7` — atenção à
grafia, é **Z antes do X** no handle, diferente do nome da loja. WhatsApp:
55 12 99213-0150. Tagline: "ALVEXZ IMPORTS, sempre realizando sonhos."

Público Brasil. **Tudo em português brasileiro**: código comentado, commits,
respostas ao dono, textos de interface. O dono prefere entregas completas e
prontas para usar, sem pedir confirmação a cada passo.

## Arquitetura — e por que ela é assim

**Um único arquivo**: `alvexz-store.html` (~260 KB). HTML + CSS + JS vanilla,
sem build, sem framework. Isso é decisão, não falta de recurso: o dono abre o
arquivo com dois cliques para testar, e a loja funciona offline. NÃO migrar
para React/Next sem ele pedir.

- **Roteador em dois modos** (seção 27 do JS): `http(s)` → History API com URLs
  limpas (`/p/slug`); `file://` → hash (`#/p/slug`). Os links no HTML são sempre
  `href="#/..."`; em modo History um MutationObserver os reescreve
  (`normalizeLinks`). Hospedar exige rewrite de tudo para o index — arquivos
  prontos em `hospedagem/`. Subpasta exige `window.ALVEXZ_BASE='/pasta'` ANTES
  do script principal. Para rodar local: `node servir.mjs` (porta 4700).
- **Dois modos de dados** (desde 2026-09-05): `ONLINE` (banco Supabase) e
  local (`SEED` + `Persist`/localStorage). O supabase-js entra por UMD do
  jsdelivr (liberado na CSP). `ONLINE` só vira true se `loadCatalog()`
  carregar do banco; qualquer falha cai no modo local com aviso no console.
  Todo código novo que grava algo precisa tratar os dois: `if(ONLINE){...}`.
- **Catálogo**: no banco são 20 peças (mesmas do `SEED`, cadastradas via
  `sql/seed-produtos.sql`), variantes por tamanho × cor. No front o produto
  tem `id` = slug (URL), `uuid`, `variantes[]`, `estoque{tam: soma}`, `fotos[]`.
  Sem foto no bucket, `imgsPadrao()` gera as ilustrações SVG.
  Categorias: camisetas, calças, moletons, conjuntos, jaquetas, shorts.
  **Não existem** tênis nem acessórios. Grade PP-GG.
- **Sem avaliações**: eram fictícias e foram removidas. Só religar com
  avaliações reais (tabela `reviews` existe, com regra "só avalia quem comprou").
- **Pagamento**: só Pix (7% off **sobre as peças**, frete não desconta) e
  boleto, pela **Stripe** (ver `docs/stripe.md`). Cartão removido de propósito.
- **Cupons**: BEMVINDOS5 (5%, sem mínimo — faixa do topo), ALVEXZ20 (20% acima
  de R$ 500), FRETEGRATIS. No banco, validação é `validar_cupom()`; a tabela
  não é legível pelo cliente.

## Visual — decisões que custaram iterações

Tema escuro com profundidade: fundo em 3 camadas (radial no topo + linear
#0C0C0F→#0A0A0C + grão de filme via `body::after`) e, desde a v2, uma **luz que
segue o mouse** (`body::before`, vars `--mx/--my`) e **cursor próprio** (ponto +
anel que cresce sobre clicáveis; só `pointer:fine`, some com reduced-motion).
Raios: `--r-sm:9 --r:13 --r-lg:19 --r-xl:26`. **Todos os botões são pílula
(999px)**. Hero editorial: grade texto + foto real
(`imagens/conjunto-nike-fundo-concreto.jpg`, caminho montado por `heroFoto()`),
título gigante com linha em serifa itálica ("sempre realizando sonhos.") e
lista de marcas em mono. Header em vidro (backdrop-filter).

Fontes: **Bricolage Grotesque** (display, `font-variation-settings:"opsz" 96`
nos títulos grandes), **Instrument Serif** itálico (acentos editoriais:
eyebrows, assinatura da história, título das marcas), Inter (texto), IBM Plex
Mono (dados). Archivo saiu.

O dono pediu explicitamente "sem cara de IA". Evitar: seta "→" em botão,
rótulos ALL-CAPS acima de título (os `.eyebrow` que restam são serifa itálica
minúscula, não mono caps), meta-strings com "·" (usar " / "), animação de
entrada em toda seção. Cards: aspect 5/6, fundo #101014, borda quase
invisível, hover sobe 4px. Home: hero → Destaques/Mais vendidos/Novidades/
Promoções → .story → .insta → marcas (simpleicons com fallback) → newsletter
(iframe Brevo) → rodapé.

## Segurança — invariantes que não se negocia

1. **Toda saída passa por `esc()`**, inclusive `href`/`src` de banner e URLs
   de pedido (pagarUrl, boletoUrl) — tudo isso é editável ou vem do banco.
2. **CSP no `<meta>`** (frame-src sibforms, script-src jsdelivr, connect-src
   viacep + *.supabase.co + wss). Recurso externo novo = liberar na CSP.
3. **Nenhuma chave secreta no HTML**. `CONFIG` tem só URL do Supabase, chave
   publishable e `CHECKOUT_ENDPOINT`. Stripe e service_role só em
   `supabase secrets set`.
4. **Preço nunca vem do navegador**. O checkout manda `{variant_id, quantidade}`,
   endereço, método, cupom e a *modalidade* de frete; a Edge Function calcula o
   frete e `criar_pedido()` recalcula peças, cupom e desconto Pix do banco.
5. Pedido só vira "pago" pelo **webhook assinado da Stripe**. A tela
   `/checkout/sucesso` só lê o status (poll de 4 s por até 3 min).
6. `ADMIN_EMAILS` no front é cosmético; a trava real é `is_admin()` (papel em
   `profiles.role`). `handle_new_user()` já nasce admin para
   `gimoreiramendes@gmail.com` e `jpfamellistos@gmail.com`.

## Banco (Supabase)

Projeto **`nmzpdaqdpzlvfazahgsv`** ("alvexz-imports", São Paulo), criado em
2026-09-05 na conta do dev (jpfamellistos). O ref antigo do dono
(`sbefosqxrsefbhwnjfsh`) não está nesta conta; se ele quiser usar o dele,
basta rodar `sql/supabase-schema.sql` + `sql/seed-produtos.sql` lá, publicar
as duas funções de `supabase/functions/` e trocar URL/chave no `CONFIG`.

URL: `https://nmzpdaqdpzlvfazahgsv.supabase.co`. Schema em
`sql/supabase-schema.sql` (v2): 16 tabelas, RLS em todas, buckets
`product-images`, `banners`, `brand-logos`. Funções: `criar_pedido`,
`cancelar_pedido`, `validar_cupom`, `buscar_produtos`, `cadastrar_peca`.
Edge Functions publicadas: `checkout` (verify_jwt on) e `stripe-webhook`
(verify_jwt off, valida assinatura). Código em `supabase/functions/`.

Armadilhas já resolvidas (não reintroduzir):
- `profiles` PRECISA vir antes de `is_admin()`.
- `protect_role()` permite mudança de role quando `auth.uid() is null`.
- NUNCA sugerir `disable trigger all`.
- Estoque fica na **variante** (`product_variants`), não no produto.
- `new Stripe('')` no topo do módulo derruba a função no boot: instanciar
  dentro do handler.
- Cadastro de e-mail no Supabase Auth exige confirmação por e-mail (padrão):
  o site avisa "confirme pelo link" quando `signUp` não devolve sessão.

Testado em 2026-09-05: `criar_pedido` com usuário sintético via SQL (Pix +
BEMVINDOS5 + frete: total 726,52 para 2× ALV-001-M; estoque baixou e voltou no
cancelamento). Checkout de ponta a ponta com Stripe **ainda não** (sem chave).

## Pendências, em ordem

1. **Chaves da Stripe** (`docs/stripe.md`): `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `SITE_URL` via `supabase secrets set`, e cadastrar
   o endpoint do webhook no painel da Stripe. Sem isso o pedido nasce pendente
   e a tela manda para o WhatsApp.
2. **Dono criar a conta** pelo site (Criar conta → confirmar e-mail): já entra
   como admin. Testar o painel: produtos, fotos, banners, logos, cupons, pedidos.
3. **Publicar**: renomear para `index.html`, subir com `imagens/` e o arquivo
   certo de `hospedagem/`, trocar CNPJ/endereço de exemplo pelos reais
   (Decreto 7.962/2013 — dono avisado; rodapé ainda tem placeholder).
   Colocar a URL pública em `SITE_URL`.
4. Menores: fotos reais das 20 peças (painel → Editar → Enviar fotos),
   formulário Brevo em HTML puro, frete real (hoje tabela por faixa de CEP em
   `supabase/functions/checkout/frete.ts` e `fretes()` no site — manter iguais).

## Avisos dados ao dono (não repetir sermão, só manter coerência)

- Política de trocas diz "não realizamos trocas por arrependimento" — avisado
  do CDC art. 49. Decisão dele manter.
- SigiloPay foi descartada em 2026-09-05 a pedido do dev: gateway é Stripe.
  `docs/gateway-pix-boleto.md` e `ferramentas/testar-gateway.mjs` ficaram como
  histórico do adaptador genérico.

## Como testar (padrão usado até aqui)

1. Extrair o JS e `node --check` (entre `<script>\n"use strict";` e `</script>`).
2. Abrir em 390/768/1440 e conferir `scrollWidth <= clientWidth+1`.
3. `pageerror` vazio nas rotas principais e no fluxo carrinho→checkout.
4. Roteamento nos DOIS modos: `file://` e http com rewrite (`node servir.mjs`,
   `127.0.0.1`).
5. XSS: injetar `"><img src=x onerror=window.__x=1>` em nome de
   produto/categoria/marca/cupom/banner e varrer rotas e abas do painel.
6. Cupom BEMVINDOS5 aplica 5%; caixa "18 anos" NÃO existe no checkout.
7. Modo banco: console deve dizer `loja carregada / banco Supabase / N produtos`.
   Se disser `modo local`, olhar a CSP ou a chave.
8. Versão anterior guardada em `alvexz-store.v1.html`; a v2 foi aplicada por
   `ferramentas/patch-v2.mjs` (idempotente).

Login de teste do painel (modo local, sem banco): `gimoreiramendes@gmail.com` +
qualquer senha de 8+ caracteres. No modo banco a senha é a do Supabase Auth.

## O que NÃO fazer

- Não recriar avaliações, tênis, acessórios, cartão de crédito, checkbox de
  18 anos, nem os eyebrows mono/caps removidos.
- Não colocar segredo em `CONFIG`.
- Não trocar o arquivo único por build/framework sem pedido explícito.
- Não usar dado fictício que pareça real (nota, contagem de clientes, CNPJ,
  código de rastreio inventado — o painel pergunta o código real).
