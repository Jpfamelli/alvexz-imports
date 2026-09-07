# Pagamento pela Stripe (Pix e boleto)

O gateway da loja é a **Stripe**, via Stripe Checkout hospedado. O site não
toca em dado bancário: o cliente fecha o pedido aqui, é levado para a página
da Stripe (QR do Pix ou boleto) e volta para `/checkout/sucesso`. O pedido só
vira **pago** quando a Stripe avisa a Edge Function `stripe-webhook` com
assinatura válida.

```
Navegador ──POST──> Edge Function `checkout` ──> criar_pedido() no banco
                          │                      (preço, cupom, Pix, estoque)
                          └──> Stripe Checkout Session ──> URL ──> cliente paga
Stripe ──webhook assinado──> Edge Function `stripe-webhook` ──> orders.status = pagamento_aprovado
```

Projeto Supabase: `nmzpdaqdpzlvfazahgsv` (São Paulo).
Funções já publicadas:

- `https://nmzpdaqdpzlvfazahgsv.supabase.co/functions/v1/checkout` (exige login)
- `https://nmzpdaqdpzlvfazahgsv.supabase.co/functions/v1/stripe-webhook` (só a Stripe chama)

Sem as chaves abaixo, o checkout **ainda funciona**: o pedido é gravado como
pendente e o cliente vê a tela "Pagamento pendente" com o WhatsApp da loja.

## 1. Conta Stripe

1. Crie a conta em https://dashboard.stripe.com (país: Brasil, com CNPJ).
2. Em **Configurações → Métodos de pagamento**, ative **Pix** e **Boleto**.
   Os dois precisam de conta brasileira ativada; até lá funcionam só no modo
   teste.
3. Em **Desenvolvedores → Chaves de API**, copie a **chave secreta**
   (`sk_test_...` para testar, `sk_live_...` para valer).

## 2. Webhook

1. **Desenvolvedores → Webhooks → Adicionar endpoint**.
2. URL: `https://nmzpdaqdpzlvfazahgsv.supabase.co/functions/v1/stripe-webhook`
3. Eventos:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
4. Copie o **segredo do webhook** (`whsec_...`).

## 3. Gravar os segredos no Supabase

Nunca no HTML. Só nas variáveis das Edge Functions. Pelo terminal, com a CLI
da Supabase logada (`npx supabase login`):

```bash
npx supabase secrets set --project-ref nmzpdaqdpzlvfazahgsv STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx SITE_URL=https://alvexz.com.br
```

Ou pelo painel: **Edge Functions → Secrets** e adicione as três chaves.

- `STRIPE_SECRET_KEY`: chave secreta da Stripe.
- `STRIPE_WEBHOOK_SECRET`: segredo do endpoint de webhook.
- `SITE_URL`: endereço público do site, sem barra no fim. É para onde a
  Stripe devolve o cliente (`/checkout/sucesso?pedido=...`). Enquanto testa
  local, pode deixar vazio: a função usa o `Origin` da requisição.

Depois de mudar segredo não precisa republicar: a função lê na próxima chamada.

## 4. Testar sem dinheiro

Use a chave `sk_test_`. No Checkout de teste da Stripe, Pix e boleto têm botões
"simular pagamento". O fluxo completo:

1. Entre na loja, adicione uma peça, feche o pedido no Pix.
2. Você é levado à página da Stripe. Clique em simular pagamento.
3. Volta para `/checkout/sucesso?pedido=ALV-...`. A tela consulta o banco a
   cada 4 s até o webhook marcar como pago.
4. Em **Meus pedidos** o status muda para "Pagamento aprovado".

Para conferir o webhook: **Desenvolvedores → Webhooks → endpoint → Tentativas**
mostra cada evento e a resposta da função. Erros de assinatura aparecem nos
logs da função no painel do Supabase.

## 5. Regras que não mudam

- O navegador manda só `{variant_id, quantidade}`, endereço, método, cupom e a
  *modalidade* de frete. Preço, cupom, desconto Pix (7%) e valor do frete são
  calculados no servidor.
- Só o webhook muda o status para pago. A tela de sucesso apenas lê.
- Pedido Pix expira em 30 min; boleto em 3 dias. Sessão expirada ou pagamento
  falho → webhook cancela o pedido e o estoque volta (trigger
  `devolver_estoque`).
- Cliente só cancela pedido pendente (`cancelar_pedido()`); pedido pago é
  cancelado pela loja no painel.
