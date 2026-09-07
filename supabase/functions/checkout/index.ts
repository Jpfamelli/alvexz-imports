// ALVEXZ IMPORTS — Edge Function `checkout`
// 1. Confere o JWT do cliente (verify_jwt ligado + sessão do supabase-js).
// 2. Calcula o frete AQUI (nunca confia no valor vindo do navegador).
// 3. Chama criar_pedido() no banco com a sessão do cliente: preço, cupom e
//    desconto Pix são recalculados lá, com trava de estoque.
// 4. Cria a Checkout Session na Stripe (Pix ou boleto) e devolve a URL.
// O pedido só vira "pago" pelo webhook assinado (stripe-webhook).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { opcoesFrete } from './frete.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SITE_URL = Deno.env.get('SITE_URL') || '';
const FRETE_GRATIS_ACIMA = 399.90;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ erro: 'Método não permitido' }, 405);

  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return json({ erro: 'Faça login para finalizar a compra.' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ erro: 'Corpo inválido' }, 400); }

  const itens = Array.isArray(body.itens) ? body.itens : [];
  const endereco = body.endereco || {};
  const metodo = body.metodo === 'boleto' ? 'boleto' : 'pix';
  const cupom = typeof body.cupom === 'string' && body.cupom.trim() ? body.cupom.trim().toUpperCase() : null;
  const freteId = String(body.frete_id || 'pac');

  if (!itens.length) return json({ erro: 'Carrinho vazio' }, 400);
  for (const it of itens) {
    if (typeof it.variant_id !== 'string' || !Number.isInteger(it.quantidade) || it.quantidade < 1 || it.quantidade > 20)
      return json({ erro: 'Item inválido no carrinho' }, 400);
  }
  const cep = String(endereco.cep || '').replace(/\D/g, '');
  if (cep.length !== 8 || !endereco.rua || !endereco.numero || !endereco.cidade || !endereco.uf)
    return json({ erro: 'Endereço incompleto' }, 400);

  // Cliente com a sessão do usuário: RLS e auth.uid() valem dentro do banco
  const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await sbUser.auth.getUser();
  if (userErr || !userData?.user) return json({ erro: 'Sessão expirada. Entre de novo.' }, 401);
  const user = userData.user;

  // Subtotal só para decidir frete grátis. O valor cobrado vem do banco.
  const ids = itens.map((i: any) => i.variant_id);
  const { data: vars, error: vErr } = await sbUser
    .from('product_variants').select('id, products(preco)').in('id', ids);
  if (vErr) return json({ erro: 'Não consegui ler o carrinho.' }, 500);
  let subtotal = 0;
  for (const it of itens) {
    const v: any = (vars || []).find((x: any) => x.id === it.variant_id);
    if (!v) return json({ erro: 'Produto indisponível' }, 400);
    subtotal += Number(v.products?.preco || 0) * it.quantidade;
  }
  const frete = opcoesFrete(cep, subtotal, FRETE_GRATIS_ACIMA).find(f => f.id === freteId);
  if (!frete) return json({ erro: 'Forma de entrega inválida' }, 400);

  // Pedido no banco (transação com trava de estoque)
  const enderecoLimpo = {
    cep, rua: String(endereco.rua).slice(0, 200), numero: String(endereco.numero).slice(0, 20),
    complemento: String(endereco.complemento || '').slice(0, 100), bairro: String(endereco.bairro || '').slice(0, 100),
    cidade: String(endereco.cidade).slice(0, 100), uf: String(endereco.uf).toUpperCase().slice(0, 2),
  };
  const { data: pedido, error: pErr } = await sbUser.rpc('criar_pedido', {
    p_itens: itens.map((i: any) => ({ variant_id: i.variant_id, quantidade: i.quantidade })),
    p_endereco: enderecoLimpo,
    p_metodo: metodo,
    p_cupom: cupom,
    p_frete_valor: frete.preco,
    p_frete_nome: frete.nome,
    p_frete_prazo: frete.prazo,
  });
  if (pErr || !pedido) {
    const msg = (pErr?.message || '').replace(/^.*?:\s*/, '');
    return json({ erro: msg || 'Não foi possível criar o pedido.' }, 400);
  }

  // Sem chave da Stripe ainda: pedido fica pendente e o cliente paga pelo WhatsApp
  if (!STRIPE_KEY) {
    return json({ orderId: pedido.id, numero: pedido.numero, total: pedido.total, url: null,
      aviso: 'Gateway ainda não configurado. Pedido registrado; pagamento combinado pela loja.' });
  }

  const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-12-18.acacia' });
  const origem = SITE_URL || req.headers.get('Origin') || 'https://alvexz.com.br';
  const base = origem.replace(/\/$/, '');
  const totalCentavos = Math.round(Number(pedido.total) * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: [metodo],
      currency: 'brl',
      customer_email: user.email || undefined,
      client_reference_id: pedido.id,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'brl',
          unit_amount: totalCentavos,
          product_data: {
            name: `Pedido ${pedido.numero} — ALVEXZ IMPORTS`,
            description: metodo === 'pix'
              ? 'Pix com 7% de desconto já aplicado. Válido por 30 minutos.'
              : 'Boleto bancário. Compensa em 1 a 2 dias úteis.',
          },
        },
      }],
      payment_method_options: metodo === 'pix'
        ? { pix: { expires_after_seconds: 1800 } }
        : { boleto: { expires_after_days: 3 } },
      metadata: { order_id: pedido.id, numero: pedido.numero, metodo },
      payment_intent_data: { metadata: { order_id: pedido.id, numero: pedido.numero } },
      success_url: `${base}/checkout/sucesso?pedido=${encodeURIComponent(pedido.numero)}`,
      cancel_url: `${base}/checkout/pendente?pedido=${encodeURIComponent(pedido.numero)}`,
      expires_at: Math.floor(Date.now() / 1000) + (metodo === 'pix' ? 30 * 60 : 24 * 60 * 60),
      locale: 'pt-BR',
    });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    await admin.from('orders').update({
      stripe_session_id: session.id,
      stripe_checkout_url: session.url,
      gateway_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    }).eq('id', pedido.id);

    return json({ orderId: pedido.id, numero: pedido.numero, total: pedido.total, url: session.url });
  } catch (e) {
    // Falhou na Stripe: cancela o pedido para devolver o estoque
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    await admin.from('orders').update({ status: 'cancelado' }).eq('id', pedido.id);
    console.error('stripe', e);
    return json({ erro: 'Não foi possível gerar a cobrança agora. Tente de novo em instantes.' }, 502);
  }
});
