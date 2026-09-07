# Pix e boleto automáticos — backend completo

Este documento tem o servidor que falta para a loja cobrar de verdade. O código está escrito contra uma **interface de gateway**, não contra um gateway específico: trocar de provedor mexe em um arquivo só.

## Por que precisa de servidor

O navegador não pode falar direto com o gateway. Se a chave de API estivesse no HTML, qualquer visitante abriria o código-fonte, copiaria e passaria a criar e cancelar cobranças em nome da sua loja.

Além disso, existe um ataque simples que só o servidor evita: o cliente altera o preço no DevTools antes de finalizar. Por isso o navegador manda apenas `variant_id` e quantidade, e o servidor busca o preço no banco.

```
Navegador                Edge Function              Gateway
    │                         │                        │
    ├─ POST /checkout ───────>│                        │
    │  {itens, endereco, pix} │  criar_pedido() ──> banco (recalcula tudo)
    │                         ├─ cria cobrança ───────>│
    │                         │<── QR / linha ─────────┤
    │<─ {orderId, qr, linha} ─┤                        │
    │                         │<═══ webhook assinado ══┤
    │                         │  marca como pago       │
```

O pedido só vira pago pelo webhook. Nunca porque o navegador voltou para a tela de sucesso — essa tela qualquer um abre digitando a URL.

---

## 1. O que pegar na documentação do seu gateway

Antes de escrever qualquer linha, você precisa destas cinco informações. Se o gateway não documentar todas, é sinal de alerta.

| # | O que | Por quê |
|---|---|---|
| 1 | URL base da API e como autenticar | `Bearer`, `Basic`, header próprio |
| 2 | Endpoint de criar cobrança Pix e o formato da resposta | de onde sai o copia-e-cola e o QR |
| 3 | Endpoint de criar boleto e o formato da resposta | URL do PDF e linha digitável |
| 4 | Formato do webhook e **como validar a assinatura** | sem isso qualquer um marca pedido como pago |
| 5 | Lista de status e como mapear | `paid`, `approved`, `expired`… |

Peça também o **ambiente de teste (sandbox)**. Testar cobrança com dinheiro real é caro e lento.

---

## 2. O adaptador

`supabase/functions/_shared/gateway.ts`

```ts
export interface CobrancaInput {
  pedidoId: string;
  numero: string;
  valor: number;              // em reais, com centavos
  metodo: 'pix' | 'boleto';
  cliente: { nome: string; email: string; cpf: string; telefone?: string };
  endereco?: Record<string, unknown>;
  expiraEmMin?: number;       // Pix
  vencimentoDias?: number;    // boleto
}

export interface CobrancaOutput {
  id: string;                 // id da cobrança no gateway
  pix?:    { copiaecola: string; qrcodeBase64?: string; expiraEm: string };
  boleto?: { url: string; linhaDigitavel: string; vencimento: string };
}

export interface Gateway {
  criarCobranca(i: CobrancaInput): Promise<CobrancaOutput>;
  consultar(id: string): Promise<{ status: string }>;
  verificarAssinatura(corpoCru: string, assinatura: string): boolean;
  mapearStatus(eventoOuStatus: string): OrderStatus | null;
}

export type OrderStatus =
  | 'pagamento_aprovado' | 'cancelado' | 'pagamento_pendente';
```

### Implementação

`supabase/functions/_shared/gateway-impl.ts`

Os quatro pontos marcados com `AJUSTAR` são os únicos que mudam de um gateway para outro.

```ts
import { Gateway, CobrancaInput, CobrancaOutput, OrderStatus } from './gateway.ts';

const BASE   = Deno.env.get('PAYMENT_API_BASE')!;   // AJUSTAR (1) URL base
const CHAVE  = Deno.env.get('PAYMENT_API_KEY')!;
const SEGREDO= Deno.env.get('PAYMENT_WEBHOOK_SECRET')!;

async function chamar(rota: string, corpo?: unknown, metodo = 'POST') {
  const r = await fetch(`${BASE}${rota}`, {
    method: metodo,
    headers: {
      // AJUSTAR (2): alguns usam Basic, outros um header próprio
      'Authorization': `Bearer ${CHAVE}`,
      'Content-Type': 'application/json',
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`gateway ${r.status}: ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : {};
}

export const gateway: Gateway = {
  async criarCobranca(i: CobrancaInput): Promise<CobrancaOutput> {
    // AJUSTAR (3): nomes dos campos e se o valor vai em reais ou centavos.
    // Mandar reais onde o gateway espera centavos cobra 100x a mais — confira.
    const payload = {
      external_id: i.pedidoId,
      reference:   i.numero,
      amount:      Math.round(i.valor * 100),
      method:      i.metodo,
      customer: {
        name:     i.cliente.nome,
        email:    i.cliente.email,
        document: i.cliente.cpf.replace(/\D/g, ''),
        phone:    i.cliente.telefone?.replace(/\D/g, ''),
      },
      ...(i.metodo === 'pix'
        ? { expires_in: (i.expiraEmMin ?? 30) * 60 }
        : { due_days: i.vencimentoDias ?? 3, address: i.endereco }),
    };

    const r = await chamar('/transactions', payload);

    // AJUSTAR (4): caminho dos campos na resposta
    return {
      id: r.id ?? r.transaction_id,
      pix: i.metodo === 'pix' ? {
        copiaecola:   r.pix?.qr_code ?? r.qr_code,
        qrcodeBase64: r.pix?.qr_code_base64,
        expiraEm:     r.pix?.expires_at ?? r.expires_at,
      } : undefined,
      boleto: i.metodo === 'boleto' ? {
        url:            r.boleto?.url ?? r.billet_url,
        linhaDigitavel: r.boleto?.line ?? r.digitable_line,
        vencimento:     r.boleto?.due_date ?? r.due_date,
      } : undefined,
    };
  },

  async consultar(id: string) {
    const r = await chamar(`/transactions/${id}`, undefined, 'GET');
    return { status: r.status };
  },

  verificarAssinatura(corpoCru: string, assinatura: string): boolean {
    // Placeholder: a maioria usa HMAC-SHA256 do corpo cru com o segredo.
    // Se o seu gateway não oferecer assinatura de webhook, veja a seção 5.
    return hmacSha256Hex(corpoCru, SEGREDO) === assinatura;
  },

  mapearStatus(evt: string): OrderStatus | null {
    const m: Record<string, OrderStatus> = {
      'paid': 'pagamento_aprovado',   'approved': 'pagamento_aprovado',
      'refused': 'cancelado',         'expired': 'cancelado',
      'refunded': 'cancelado',        'chargeback': 'cancelado',
      'pending': 'pagamento_pendente','waiting_payment': 'pagamento_pendente',
    };
    return m[String(evt).toLowerCase()] ?? null;
  },
};

async function hmacSha256Hex(msg: string, chave: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(chave),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
  return [...new Uint8Array(s)].map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 3. Checkout

`supabase/functions/checkout/index.ts`

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { gateway } from '../_shared/gateway-impl.ts';

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // Sessão do cliente, para o RLS valer dentro da função
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
  );
  const { data: { user } } = await db.auth.getUser();
  if (!user) return json({ erro: 'Faça login para finalizar.' }, 401);

  const body = await req.json();

  // Só isto vem do navegador. Preço, frete e total NÃO.
  const itens = (body.itens ?? []).map((i: any) => ({
    variant_id: String(i.variant_id),
    quantidade: Math.max(1, Math.min(10, parseInt(i.quantidade, 10) || 1)),
  }));
  if (!itens.length) return json({ erro: 'Carrinho vazio.' }, 400);

  const metodo = body.metodo === 'boleto' ? 'boleto' : 'pix';

  // Endereço vem do banco pelo id, não do corpo da requisição
  const { data: endereco } = await db
    .from('addresses').select('*').eq('id', body.addressId).single();
  if (!endereco) return json({ erro: 'Endereço inválido.' }, 400);

  const frete = await cotarFrete(endereco.cep, itens);

  // A função do banco recalcula preços, revalida o cupom, trava o estoque
  // e cria o pedido — tudo numa transação só.
  const { data: pedido, error } = await db.rpc('criar_pedido', {
    p_itens: itens,
    p_endereco: endereco,
    p_metodo: metodo,
    p_cupom: body.cupom ?? null,
    p_frete_valor: frete.preco,
    p_frete_nome: frete.nome,
    p_frete_prazo: frete.prazo,
  });
  if (error) return json({ erro: error.message }, 400);

  try {
    const cob = await gateway.criarCobranca({
      pedidoId: pedido.id,
      numero:   pedido.numero,
      valor:    Number(pedido.total),     // veio do BANCO
      metodo,
      cliente: {
        nome:  pedido.cliente_nome,
        email: pedido.cliente_email,
        cpf:   pedido.cliente_cpf,
        telefone: pedido.cliente_telefone,
      },
      endereco,
      expiraEmMin: 30,
      vencimentoDias: 3,
    });

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('orders').update({
      gateway_payment_id: cob.id,
      pix_copiaecola: cob.pix?.copiaecola ?? null,
      boleto_url:     cob.boleto?.url ?? null,
      boleto_linha:   cob.boleto?.linhaDigitavel ?? null,
    }).eq('id', pedido.id);

    return json({
      orderId: pedido.id, numero: pedido.numero, total: pedido.total,
      pix: cob.pix ?? null, boleto: cob.boleto ?? null,
    });
  } catch (e) {
    // Cobrança falhou: cancela o pedido para o estoque voltar
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('orders').update({ status: 'cancelado' }).eq('id', pedido.id);
    return json({ erro: 'Não foi possível gerar a cobrança. Tente novamente.' }, 502);
  }
});
```

Esse `catch` no fim não é detalhe. Sem ele, uma falha do gateway deixa o pedido criado e o estoque travado em algo que ninguém vai pagar.

---

## 4. Webhook

`supabase/functions/webhook-pagamento/index.ts`

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { gateway } from '../_shared/gateway-impl.ts';

Deno.serve(async (req) => {
  const cru = await req.text();                       // corpo CRU, para a assinatura
  const assin = req.headers.get('x-signature')
             ?? req.headers.get('x-webhook-signature') ?? '';

  if (!gateway.verificarAssinatura(cru, assin)) {
    return new Response('assinatura inválida', { status: 401 });
  }

  const evt = JSON.parse(cru);
  const novo = gateway.mapearStatus(evt.status ?? evt.type ?? evt.event);
  if (!novo || novo === 'pagamento_pendente') return Response.json({ ok: true });

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const idGw = evt.id ?? evt.transaction_id ?? evt.data?.id;
  const { data: pedido } = await db.from('orders')
    .select('id, status, total').eq('gateway_payment_id', idGw).single();
  if (!pedido) return Response.json({ ok: true });

  // Idempotência: o gateway reenvia. Reprocessar não pode duplicar nada.
  if (pedido.status === novo) return Response.json({ ok: true });

  // Confere o valor pago contra o pedido, quando o evento trouxer
  const pago = evt.amount ? Number(evt.amount) / 100 : null;
  if (novo === 'pagamento_aprovado' && pago !== null
      && Math.abs(pago - Number(pedido.total)) > 0.02) {
    console.error('valor divergente', { pedido: pedido.total, pago });
    return Response.json({ ok: true });     // não aprova pagamento parcial
  }

  await db.from('orders').update({ status: novo }).eq('id', pedido.id);
  // O gatilho devolver_estoque() repõe o estoque sozinho se virou cancelado.

  return Response.json({ ok: true });
});
```

---

## 5. Se o gateway não assinar o webhook

Alguns gateways menores mandam webhook sem assinatura. Nesse caso **não confie no corpo recebido**. Trate o webhook apenas como um aviso e consulte a API para saber o status de verdade:

```ts
const real = await gateway.consultar(idGw);
const novo = gateway.mapearStatus(real.status);
```

É uma chamada a mais por evento, e fecha a porta para alguém descobrir a URL do seu webhook e mandar um POST dizendo que pagou.

---

## 6. Expiração

Duas rotinas que precisam existir, senão o estoque fica preso.

**Pix expira em 30 minutos.** Se ninguém pagar, o pedido tem que ser cancelado para a peça voltar ao estoque.

**Boleto compensa em 1 a 2 dias úteis** e o cliente costuma pagar no último dia. Não cancele por tempo antes do vencimento.

```sql
-- Agende em Database → Cron (pg_cron), de hora em hora
update public.orders
   set status = 'cancelado'
 where status = 'pagamento_pendente'
   and (
     (metodo_pagamento = 'pix'    and created_at < now() - interval '45 minutes') or
     (metodo_pagamento = 'boleto' and created_at < now() - interval '5 days')
   );
```

---

## 7. Variáveis

```bash
supabase secrets set \
  PAYMENT_API_BASE=https://api.seugateway.com \
  PAYMENT_API_KEY=xxxxx \
  PAYMENT_WEBHOOK_SECRET=xxxxx \
  SITE_ORIGIN=https://alvexz.com.br

supabase functions deploy checkout
supabase functions deploy webhook-pagamento
```

No painel do gateway, cadastre a URL do webhook:
`https://SEU-PROJETO.supabase.co/functions/v1/webhook-pagamento`

---

## 8. Antes de considerar pronto

- [ ] Compra real de valor baixo no Pix, do QR ao pedido marcado como pago
- [ ] Compra real no boleto, incluindo o pagamento compensando depois
- [ ] Pix deixado expirar: pedido cancelado e estoque de volta
- [ ] Webhook reenviado duas vezes: nada duplicado
- [ ] POST forjado no webhook sem assinatura: recusado com 401
- [ ] Preço alterado no DevTools: pedido sai com o valor do banco
- [ ] Gateway fora do ar: pedido cancelado, estoque liberado, erro amigável
