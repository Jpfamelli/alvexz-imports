# ALVEXZ IMPORTS — Guia de integração

Como sair do arquivo único (`alvexz-store.html`) para a loja em produção com Supabase, Next.js e gateway de pagamento.

O HTML entregue é uma loja funcional de verdade: catálogo, carrinho, cupom, frete, checkout, pedidos e painel admin. O que ele não tem é servidor. Todo o estado vive no navegador. Este guia é o caminho para trocar essa camada por banco e backend reais, sem reescrever a interface.

---

## 1. Ordem de execução

Faça nesta sequência. Cada etapa deixa a loja funcionando, então dá para parar no meio e retomar depois.

1. Criar projeto no Supabase e rodar `supabase-schema.sql`
2. Subir o HTML como está, apontando o catálogo para o banco (loja já vende, checkout ainda simulado)
3. Migrar para Next.js
4. Plugar o gateway de pagamento
5. Ligar webhook, e-mails transacionais e rastreio

---

## 2. Supabase

### Criar e popular

No painel do Supabase: **SQL Editor** → cole `supabase-schema.sql` inteiro → **Run**. O script é idempotente nas partes de seed, então pode rodar de novo sem duplicar marcas e categorias.

Depois crie sua conta pela tela de cadastro da loja e promova a admin:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@dominio.com';
```

### Verificar a segurança

**Advisors → Security**. A lista precisa ficar zerada. Se aparecer "RLS disabled in public" em alguma tabela, essa tabela está aberta para qualquer pessoa com a chave anônima, que é pública por definição.

### O que o cliente pode e não pode fazer

| Ação | Permitido pelo RLS |
|---|---|
| Ler catálogo, categorias, marcas, banners ativos | Sim, sem login |
| Ler o próprio perfil, endereços, pedidos, favoritos | Sim, autenticado |
| Ler pedido de outra pessoa | Não |
| Ler a tabela de cupons | Não. Só via `validar_cupom()` |
| Inserir ou alterar pedido direto na tabela | Não. Só via `criar_pedido()` |
| Alterar o próprio `role` para admin | Não. Trigger `protect_role` bloqueia |
| Avaliar produto que não comprou | Não |

---

## 3. Trocar o catálogo local pelo banco

No HTML, o catálogo nasce de `SEED` e é guardado pelo adaptador `Persist`. Para ler do Supabase, substitua a função de boot:

```js
import { createClient } from '@supabase/supabase-js';
const sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

async function loadCatalog(){
  const { data, error } = await sb
    .from('products')
    .select(`
      id, sku, nome, slug, descricao, detalhes, preco, preco_de,
      destaque, mais_vendido, novidade, promocao, rating, reviews_count,
      brands(nome), categories(nome, slug),
      product_variants(id, tamanho, cor, cor_hex, estoque),
      product_images(url, alt, ordem)
    `)
    .eq('ativo', true)
    .order('ordem');
  if (error) throw error;
  return data.map(normalizeProduct);
}
```

`normalizeProduct` converte o formato do banco para o que os componentes já esperam: `estoque` vira um mapa `{P: 4, M: 0, ...}` a partir de `product_variants`, e `imgs` vira o array de URLs ordenado. Escreva essa função uma vez e o resto da interface não muda.

O mesmo vale para busca (`buscar_produtos()`), cupom (`validar_cupom()`) e banners.

**Importante:** as imagens hoje são SVG gerados em runtime pela função `garment()`. Isso foi de propósito, para a loja abrir sem depender de rede e sem risco de usar imagem de terceiros. Quando subir as fotos reais para o bucket `product-images`, `normalizeProduct` passa a devolver as URLs e `garment()` vira só o fallback de produto sem foto.

---

## 4. Estrutura Next.js

```
alvexz/
├─ app/
│  ├─ layout.tsx                    # fontes, metadata base, providers
│  ├─ page.tsx                      # home
│  ├─ produtos/page.tsx
│  ├─ c/[categoria]/page.tsx
│  ├─ marca/[slug]/page.tsx
│  ├─ p/[slug]/page.tsx             # PDP — generateMetadata + JSON-LD
│  ├─ busca/page.tsx
│  ├─ carrinho/page.tsx
│  ├─ checkout/page.tsx
│  ├─ pedidos/page.tsx
│  ├─ conta/page.tsx
│  ├─ admin/
│  │  ├─ layout.tsx                 # guarda de rota: exige role admin
│  │  ├─ page.tsx                   # dashboard
│  │  ├─ produtos/page.tsx
│  │  ├─ pedidos/page.tsx
│  │  ├─ cupons/page.tsx
│  │  └─ banners/page.tsx
│  ├─ api/
│  │  ├─ checkout/route.ts          # cria pedido + cobrança
│  │  ├─ webhook/pagamento/route.ts # confirma pagamento
│  │  ├─ frete/route.ts             # cotação de frete
│  │  └─ cep/[cep]/route.ts         # proxy do ViaCEP
│  ├─ sitemap.ts
│  └─ robots.ts
├─ components/
│  ├─ layout/                       # Header, Drawer, Footer, CookieBar
│  ├─ produto/                      # Card, Galeria, Tabs, Manifesto
│  ├─ carrinho/                     # Drawer, Item, Resumo
│  ├─ checkout/                     # Steps, Endereco, Pagamento, Pix
│  └─ ui/                           # Button, Input, Modal, Toast, Skeleton
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts                  # browser, anon key
│  │  ├─ server.ts                  # server component, cookies
│  │  └─ admin.ts                   # service role — SÓ em route handlers
│  ├─ gateway.ts                    # adaptador do gateway
│  ├─ frete.ts
│  └─ validators.ts                 # CPF, CEP, telefone, cartão (Luhn)
├─ hooks/                           # useCart, useFavorites, useAuth
├─ types/database.ts                # gerado pelo Supabase CLI
├─ styles/tokens.css                # as variáveis de cor e tipografia do HTML
└─ .env.local
```

Gerar os tipos do banco:

```bash
npx supabase gen types typescript --project-id SEU_ID > types/database.ts
```

---

## 5. Variáveis de ambiente

`.env.local` (nunca commitado — coloque no `.gitignore`):

```bash
# Público — vai para o navegador, tudo bem
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://alvexz.com.br
NEXT_PUBLIC_WHATSAPP=5512999990000

# Secreto — só no servidor, nunca com prefixo NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=
```

A regra do Next.js é literal: qualquer variável com `NEXT_PUBLIC_` é embutida no bundle do cliente e fica visível para qualquer visitante. `SUPABASE_SERVICE_ROLE_KEY` ignora todo o RLS — se ela vazar, a loja inteira vazou. Ela só pode aparecer em `app/api/*/route.ts` e Server Actions.

Em produção, cadastre as mesmas variáveis no painel da Vercel (ou onde hospedar), em **Environment Variables**.

---

## 6. Checkout e gateway

### O fluxo correto

```
Navegador                    Seu backend                  Gateway
    │                             │                          │
    ├── POST /api/checkout ──────>│                          │
    │   {items:[{variant_id,qtd}],│                          │
    │    addressId, shipping,     │  recalcula tudo do banco │
    │    coupon, method, token}   │  criar_pedido() ────────>│ (transação)
    │                             ├── cria cobrança ────────>│
    │                             │<── QR Pix / redirect ────┤
    │<── {orderId, pix, redirect}─┤                          │
    │                             │                          │
    │                             │<══ webhook assinado ═════┤
    │                             │  valida assinatura       │
    │                             │  marca pedido como pago  │
```

O ponto que não pode ser negociado: **o navegador nunca envia preço, desconto ou total**. Ele envia `variant_id` e quantidade. Todo o resto o backend busca do banco. Se você aceitar o preço vindo do front, alguém abre o DevTools e compra um tênis por R$ 1,00.

### `app/api/checkout/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { gateway } from '@/lib/gateway';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  const body = await req.json();

  // 1. Só isto vem do cliente. Preço, frete e total NÃO.
  const itens = body.itens?.map((i: any) => ({
    variant_id: String(i.variant_id),
    quantidade: Math.max(1, Math.min(10, parseInt(i.quantidade, 10) || 1)),
  }));
  if (!itens?.length) return NextResponse.json({ erro: 'Carrinho vazio' }, { status: 400 });

  // 2. Endereço vem do banco pelo id, não do corpo da requisição
  const { data: endereco } = await supabase
    .from('addresses').select('*').eq('id', body.addressId).single();
  if (!endereco) return NextResponse.json({ erro: 'Endereço inválido' }, { status: 400 });

  // 3. Frete recotado no servidor
  const frete = await cotarFrete(endereco.cep, itens);

  // 4. A função do banco recalcula preços, revalida o cupom,
  //    trava o estoque e cria o pedido — tudo numa transação
  const { data: pedido, error } = await supabase.rpc('criar_pedido', {
    p_itens: itens,
    p_endereco: endereco,
    p_metodo: body.metodo,          // 'pix' | 'boleto'
    p_cupom: body.cupom ?? null,
    p_frete_valor: frete.preco,
    p_frete_nome: frete.nome,
    p_frete_prazo: frete.prazo,
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 400 });

  // 5. Cobrança com o total que o BANCO calculou
  const cobranca = await gateway.criarCobranca({
    pedidoId: pedido.id,
    numero: pedido.numero,
    valor: pedido.total,
    metodo: body.metodo,
    cliente: {
      nome: pedido.cliente_nome,
      email: pedido.cliente_email,
      cpf: pedido.cliente_cpf,
    },
  });

  await supabase.from('orders')
    .update({ gateway_payment_id: cobranca.id })
    .eq('id', pedido.id);

  // 6. Devolve só o que o navegador precisa ver
  return NextResponse.json({
    orderId: pedido.id,
    numero: pedido.numero,
    total: pedido.total,
    pix: cobranca.pix ?? null,          // { qrcode, copiaecola, expiraEm }
    boleto: cobranca.boleto ?? null,    // { url, linhaDigitavel, vencimento }
  });
}
```

### `app/api/webhook/pagamento/route.ts`

O webhook é a **única** fonte de verdade sobre pagamento aprovado. Nunca marque um pedido como pago porque o navegador voltou para a página de sucesso.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gateway } from '@/lib/gateway';

export async function POST(req: NextRequest) {
  const raw = await req.text();                       // corpo cru, para a assinatura
  const assinatura = req.headers.get('x-signature') ?? '';

  if (!gateway.verificarAssinatura(raw, assinatura, process.env.PAYMENT_WEBHOOK_SECRET!)) {
    return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 });
  }

  const evt = JSON.parse(raw);
  const supabase = createAdminClient();

  const mapa: Record<string, string> = {
    'payment.approved': 'pagamento_aprovado',
    'payment.refused':  'cancelado',
    'payment.refunded': 'cancelado',
    'payment.expired':  'cancelado',
  };
  const status = mapa[evt.type];
  if (!status) return NextResponse.json({ ok: true });  // evento que não nos interessa

  // Idempotência: o gateway reenvia webhooks. Reprocessar não pode duplicar nada.
  const { data: pedido } = await supabase
    .from('orders').select('id, status').eq('gateway_payment_id', evt.data.id).single();
  if (!pedido || pedido.status === status) return NextResponse.json({ ok: true });

  await supabase.from('orders').update({ status }).eq('id', pedido.id);
  // O trigger devolver_estoque() repõe o estoque sozinho se virou cancelado.

  return NextResponse.json({ ok: true });
}
```

Cadastre a URL `https://seudominio.com.br/api/webhook/pagamento` no painel do gateway e guarde o secret de assinatura em `PAYMENT_WEBHOOK_SECRET`.

### `lib/gateway.ts`

Escreva o adaptador com esta interface. Assim, trocar de gateway depois mexe em um arquivo só:

```ts
export interface Gateway {
  criarCobranca(input: CobrancaInput): Promise<CobrancaOutput>;
  consultarCobranca(id: string): Promise<{ status: string }>;
  verificarAssinatura(raw: string, assinatura: string, secret: string): boolean;
  estornar(id: string, valor?: number): Promise<void>;
}
```

Quando você me disser qual gateway vai usar, eu leio a documentação oficial e escrevo a implementação seguindo o fluxo que eles recomendam — cada um trata tokenização, 3DS e formato de webhook de um jeito.

### Pix e boleto

A loja trabalha só com Pix e boleto, o que simplifica bastante: nenhum dado bancário do cliente passa pelo seu servidor, então você fica fora do escopo do PCI-DSS. Você só guarda o que o gateway devolve — o código copia-e-cola do Pix, a URL e a linha digitável do boleto.

Dois detalhes que costumam morder:

O Pix expira. Defina um prazo (30 minutos é o padrão do arquivo) e cancele o pedido no vencimento, senão o estoque fica preso em pedidos que ninguém vai pagar. Um cron diário resolve.

O boleto compensa em 1 a 2 dias úteis, e o cliente pode pagar no último minuto. Não cancele por tempo antes do vencimento e mantenha o estoque reservado até lá, ou você vende a mesma peça duas vezes.

---

## 7. Segurança

### O que já está feito no arquivo

- Toda saída de texto passa por `esc()` antes de virar HTML. Auditei rota por rota e aba por aba do painel injetando `"><img src=x onerror=...>` em nome de produto, marca, categoria, banner, cupom e nome de usuário: nenhuma superfície executa.
- CSP declarada em `<meta>`: bloqueia script externo, `eval`, `object` e envio de formulário para fora do domínio.
- `referrer` em `strict-origin-when-cross-origin`.
- Links externos com `rel="noopener"`.
- Link de logo colado no painel só aceita `https://` sem espaços, o que barra `javascript:` e `data:` disfarçado.
- Gravação no navegador devolve sucesso ou falha, então a tela não diz "salvo" quando não salvou.

### O que a CSP em `<meta>` não cobre

`frame-ancestors` e `X-Frame-Options` só funcionam como cabeçalho HTTP. Sem eles, alguém pode embutir sua loja num iframe invisível e capturar cliques. Configure no servidor — os cabeçalhos completos estão na seção 6.

O `'unsafe-inline'` na CSP existe porque o CSS e o JS moram dentro do HTML. Quando migrar para Next.js, mova-os para arquivos e remova a diretiva; aí a CSP passa a valer de verdade contra injeção.

### Checklist para quando ligar banco e gateway

Segurança de loja não mora no front. Um arquivo HTML roda na máquina do visitante, que pode ler, editar e reexecutar tudo. O que impede prejuízo é o servidor. Confira estes pontos:

**Banco**

- [ ] RLS ligado em todas as tabelas — rode Advisors → Security e zere a lista
- [ ] `SUPABASE_SERVICE_ROLE_KEY` não aparece em nenhum arquivo fora de `app/api/`
- [ ] Teste na prática: logue com duas contas e tente ler o pedido da outra
- [ ] Confirme que `update profiles set role='admin'` falha para conta comum (trigger `protect_role`)
- [ ] Cliente não consegue `select` na tabela `coupons`

**Checkout**

- [ ] Nenhum preço, desconto, frete ou total aceito vindo do corpo da requisição — só `variant_id` e quantidade
- [ ] Teste o ataque: altere o preço no DevTools e finalize. O pedido tem que sair com o valor do banco
- [ ] Estoque validado e reservado dentro da mesma transação
- [ ] Cupom revalidado no servidor, ignorando o que o navegador enviou

**Gateway**

- [ ] Webhook confere a assinatura antes de processar
- [ ] Webhook é idempotente: reenvio do mesmo evento não duplica nada
- [ ] Pedido só vira pago pelo webhook, nunca porque o navegador voltou para a tela de sucesso
- [ ] `PAYMENT_API_KEY` e `PAYMENT_WEBHOOK_SECRET` só no servidor
- [ ] Teste com pagamento real de valor baixo, incluindo Pix expirado e boleto vencido

**Servidor**

- [ ] HTTPS com redirect de HTTP e HSTS
- [ ] Cabeçalhos da seção 6 aplicados
- [ ] Rate limiting em `/api/checkout`, `/api/cep` e no login
- [ ] Confirmação de e-mail obrigatória no Supabase Auth
- [ ] Backups diários

**Painel**

- [ ] `CONFIG.ADMIN_EMAILS` substituído por leitura do `role` no perfil autenticado
- [ ] Teste: force `State.user` no console de uma conta comum. O painel pode até abrir, mas nenhuma escrita pode passar

O último item é o teste que vale mais que todos. Se você conseguir abrir o painel forçando o navegador e ainda assim não conseguir mudar um preço, a loja está protegida onde importa.

## 8. Frete e CEP

O HTML usa o ViaCEP direto do navegador. Funciona em domínio hospedado, mas falha em `file://` por CORS. Em produção, faça proxy pelo seu backend e adicione cache:

```ts
// app/api/cep/[cep]/route.ts
export async function GET(_: Request, { params }: { params: { cep: string } }) {
  const cep = params.cep.replace(/\D/g, '');
  if (cep.length !== 8) return Response.json({ erro: 'CEP inválido' }, { status: 400 });
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: { revalidate: 86400 },
  });
  return Response.json(await r.json());
}
```

O cálculo de frete atual (`fretes()`) é por faixa de CEP, o que serve para lançar. Quando tiver volume, troque por uma integração real — Correios, Melhor Envio ou Frenet. A interface já espera `{ id, nome, preco, prazo }`, então é só devolver esse formato.

---

## 9. SEO

O que já está no HTML e precisa ser mantido na migração:

- `<title>` e `<meta description>` dinâmicos por rota (`setSEO()` → `generateMetadata`)
- Open Graph e Twitter Card
- JSON-LD `Product` na PDP com preço, disponibilidade e avaliação
- `alt` em toda imagem
- Canonical por rota

O que ganha com o Next.js:

- Renderização no servidor das páginas de produto e categoria, que é o que o Google indexa de verdade
- `app/sitemap.ts` gerando as URLs a partir do banco
- `next/image` com WebP e AVIF automáticos

```ts
// app/sitemap.ts
export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const supabase = createServerClient();
  const { data: produtos } = await supabase
    .from('products').select('slug, updated_at').eq('ativo', true);
  const { data: cats } = await supabase
    .from('categories').select('slug').eq('ativo', true);

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/produtos`, changeFrequency: 'daily', priority: 0.9 },
    ...cats!.map(c => ({ url: `${base}/c/${c.slug}`, priority: 0.8 })),
    ...produtos!.map(p => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updated_at,
      priority: 0.7,
    })),
  ];
}
```

---

## 10. Deploy

**Vercel** é o caminho mais curto para Next.js: conecte o repositório, cadastre as variáveis de ambiente, aponte o domínio. HTTPS e CDN vêm prontos.

Antes de considerar no ar:

- [ ] Domínio com HTTPS e `www` redirecionando para a raiz
- [ ] Variáveis de ambiente cadastradas em produção
- [ ] URL do webhook cadastrada no gateway e testada com pagamento real de valor baixo
- [ ] Compra de ponta a ponta: Pix e cartão, incluindo pedido cancelado
- [ ] Estoque zerado bloqueando a compra
- [ ] E-mails transacionais funcionando (pedido criado, pagamento aprovado, pedido enviado)
- [ ] Google Search Console e sitemap enviado
- [ ] Analytics instalado respeitando o consentimento do banner de cookies
- [ ] Política de privacidade e termos revisados por quem entende de LGPD
- [ ] Página 404 e página de erro
- [ ] Lighthouse acima de 90 em Performance e Acessibilidade no mobile

---

## 11. Configuração da loja

No HTML, o objeto `CONFIG` no topo do `<script>` concentra o que você provavelmente vai querer mudar primeiro:

```js
const CONFIG = {
  storeName: 'ALVEXZ IMPORTS',
  whatsapp: '5512999990000',      // troque pelo número real
  freeShippingFrom: 399.90,
  pixDiscount: 0.07,              // 7% de desconto no Pix
  maxInstallments: 10,
  cnpj: '00.000.000/0001-00',
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  PAYMENT_PUBLIC_KEY: '',
};
```

O acesso ao painel no arquivo de demonstração é `gimoreiramendes@gmail.com`, definido em `CONFIG.ADMIN_EMAILS`, com qualquer senha de 8 ou mais caracteres.

**Essa verificação não é segurança.** Ela roda no navegador, então serve para organizar a interface — esconder o item do menu, bloquear a tela — e não para proteger dados. Qualquer pessoa lê o `CONFIG` no código-fonte e qualquer pessoa executa `State.user={email:'gimoreiramendes@gmail.com'}` no console e vê o painel.

O que impede alguém de fazer estrago é o servidor, e isso já está pronto no `supabase-schema.sql`: a função `is_admin()` consulta a coluna `role` da tabela `profiles`, e todas as policies de escrita exigem ela. Mesmo que a pessoa force o painel a aparecer, cada tentativa de alterar preço, estoque ou pedido é recusada pelo banco. O papel de admin fica em `profiles`, nunca no `user_metadata`, porque `user_metadata` o próprio cliente edita — e o trigger `protect_role` impede autopromoção.

Quando migrar para o Supabase, promova a conta uma vez:

```sql
update public.profiles set role = 'admin' where email = 'gimoreiramendes@gmail.com';
```

E troque a checagem do front por uma leitura do perfil autenticado, mantendo o `CONFIG.ADMIN_EMAILS` apenas como atalho de desenvolvimento.

---

## 12. Ordem sugerida de trabalho

Se for tocar sozinho, esta ordem gera valor mais rápido:

1. **Semana 1** — Supabase no ar, catálogo real cadastrado, HTML lendo do banco. A loja já pode receber visita e mostrar produto verdadeiro.
2. **Semana 2** — Auth real, pedidos no banco, painel admin operando sobre dados reais.
3. **Semana 3** — Gateway e webhook. A partir daqui a loja vende de verdade.
4. **Semana 4** — Migração para Next.js, SEO no servidor, performance.

Dá para inverter 3 e 4, mas vender antes de migrar costuma ser melhor: o dinheiro entrando paga a refatoração, e você descobre o que os clientes realmente usam antes de reescrever.
