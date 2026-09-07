// ALVEXZ IMPORTS — Edge Function `stripe-webhook`
// Único caminho que marca um pedido como pago. Verifica a assinatura da Stripe
// com STRIPE_WEBHOOK_SECRET; sem assinatura válida, nada acontece.
// verify_jwt precisa estar DESLIGADO nesta função: a Stripe não manda JWT.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Stripe só é instanciada dentro do handler: sem a chave configurada, o
// construtor lança erro e derrubaria a função inteira no boot.
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

async function marcar(orderId: string, status: 'pagamento_aprovado' | 'cancelado', extra: Record<string, unknown> = {}) {
  // Só muda quem ainda está pendente: evita regredir um pedido já enviado
  const { error } = await admin.from('orders')
    .update({ status, ...extra })
    .eq('id', orderId).eq('status', 'pagamento_pendente');
  if (error) console.error('update', orderId, error.message);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  if (!WEBHOOK_SECRET || !STRIPE_KEY) {
    console.error('STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET não configurados (supabase secrets set)');
    return new Response('gateway não configurado', { status: 503 });
  }
  const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-12-18.acacia' });

  const sig = req.headers.get('stripe-signature');
  const corpo = await req.text();
  let evento: Stripe.Event;
  try {
    evento = await stripe.webhooks.constructEventAsync(corpo, sig || '', WEBHOOK_SECRET, undefined, cryptoProvider);
  } catch (e) {
    console.error('assinatura inválida', (e as Error).message);
    return new Response('assinatura inválida', { status: 400 });
  }

  const s = evento.data.object as Stripe.Checkout.Session;
  const orderId = s?.metadata?.order_id || s?.client_reference_id;

  switch (evento.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (!orderId) break;
      if (s.payment_status === 'paid') {
        await marcar(orderId, 'pagamento_aprovado', {
          gateway_payment_id: typeof s.payment_intent === 'string' ? s.payment_intent : null,
        });
      } else if (typeof s.payment_intent === 'string') {
        // Boleto emitido: guarda o link para o cliente ver em "Meus pedidos"
        try {
          const pi = await stripe.paymentIntents.retrieve(s.payment_intent);
          const boleto: any = (pi as any).next_action?.boleto_display_details;
          await admin.from('orders').update({
            gateway_payment_id: pi.id,
            boleto_url: boleto?.hosted_voucher_url || null,
            boleto_linha: boleto?.number || null,
          }).eq('id', orderId);
        } catch (e) { console.error('boleto', (e as Error).message); }
      }
      break;
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      if (orderId) await marcar(orderId, 'cancelado');
      break;
    }
    case 'payment_intent.succeeded': {
      const pi = evento.data.object as Stripe.PaymentIntent;
      const oid = pi.metadata?.order_id;
      if (oid) await marcar(oid, 'pagamento_aprovado', { gateway_payment_id: pi.id });
      break;
    }
    default:
      break;
  }
  return new Response(JSON.stringify({ recebido: true }), { headers: { 'Content-Type': 'application/json' } });
});
