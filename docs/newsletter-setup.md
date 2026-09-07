# Newsletter da ALVEXZ IMPORTS — envio de e-mail de verdade

O `alvexz-store.html` é um arquivo que roda no navegador. Navegador não envia e-mail: para uma mensagem sair, alguém precisa se autenticar num servidor SMTP, e a credencial disso não pode estar no código que o visitante baixa. Se estivesse, qualquer pessoa abriria o DevTools, pegaria a chave e mandaria e-mail se passando pela sua loja.

Por isso o fluxo é: o site chama um endpoint seu, e o endpoint envia. Este documento tem tudo que falta para isso funcionar.

O que você vai montar:

1. Tabela de inscritos com token de descadastro
2. Função `newsletter-subscribe` — grava o e-mail e manda o agradecimento na hora
3. Função `newsletter-broadcast` — dispara o aviso de drop, peça nova ou promoção
4. Página de descadastro
5. Domínio verificado, que é o que decide se o e-mail cai na caixa de entrada ou no spam

---

## 1. Provedor de e-mail

Você precisa de um serviço de envio transacional. Não use Gmail comum: contas pessoais têm limite baixo, não autenticam o domínio da loja e derrubam a entrega.

| Provedor | Grátis por mês | Observação |
|---|---|---|
| Resend | 3.000 e-mails | API mais simples, é o usado nos exemplos abaixo |
| Brevo | 9.000 e-mails | Interface em português, bom para quem quer editor visual |
| Amazon SES | 3.000 no primeiro ano | Mais barato em escala, configuração mais chata |

Crie a conta, gere a API key e guarde. Ela nunca entra no HTML.

---

## 2. Tabela de inscritos

O schema já tem `newsletter_subscribers`. Rode esta migração para acrescentar o que falta:

```sql
alter table public.newsletter_subscribers
  add column if not exists nome            text,
  add column if not exists origem          text default 'rodape',
  add column if not exists confirmado      boolean not null default true,
  add column if not exists token           uuid not null default gen_random_uuid(),
  add column if not exists ultimo_envio_em timestamptz,
  add column if not exists descadastrado_em timestamptz;

create unique index if not exists idx_news_token on public.newsletter_subscribers(token);
create index if not exists idx_news_ativos on public.newsletter_subscribers(ativo) where ativo;
```

O `token` é o que vai no link de descadastro. Usar o e-mail na URL seria um vazamento: qualquer um trocaria o endereço e descadastraria outra pessoa.

---

## 3. Função de inscrição

`supabase/functions/newsletter-subscribe/index.ts`

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ok  = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return ok({ erro: 'Método não permitido' }, 405);

  const { email, origem } = await req.json().catch(() => ({}));
  const mail = String(email ?? '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(mail)) {
    return ok({ erro: 'E-mail inválido.' }, 400);
  }

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Já inscrito? Responde sucesso e não manda e-mail de novo.
  const { data: existente } = await db
    .from('newsletter_subscribers')
    .select('id, ativo')
    .eq('email', mail)
    .maybeSingle();

  if (existente?.ativo) return ok({ jaInscrito: true });

  const { data: inscrito, error } = await db
    .from('newsletter_subscribers')
    .upsert(
      { email: mail, origem: origem ?? 'rodape', ativo: true, descadastrado_em: null },
      { onConflict: 'email' },
    )
    .select('token')
    .single();

  if (error) return ok({ erro: 'Não foi possível cadastrar agora.' }, 500);

  const site = Deno.env.get('SITE_URL')!;
  const sair = `${site}/#/descadastrar?t=${inscrito.token}`;

  const envio = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ALVEXZ IMPORTS <drops@alvexz.com.br>',
      to: mail,
      subject: 'Você está na lista da ALVEXZ IMPORTS',
      html: emailBoasVindas(site, sair),
      headers: { 'List-Unsubscribe': `<${sair}>` },
    }),
  });

  // Se o e-mail falhar, o cadastro continua valendo. Só registra o problema.
  if (!envio.ok) console.error('resend falhou:', await envio.text());

  return ok({ ok: true });
});
```

### Template do agradecimento

Mesma função, arquivo `email.ts` ou no fim do `index.ts`:

```ts
function emailBoasVindas(site: string, sair: string) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0A0A0C;
    font-family:Helvetica,Arial,sans-serif;color:#F4F4F6">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:32px 16px">
   <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td style="padding-bottom:28px">
        <span style="font-size:24px;font-weight:800;letter-spacing:-1px;color:#fff">ALVEXZ</span>
        <span style="font-size:16px;color:#8B8B93;margin-left:5px">IMPORTS</span>
      </td></tr>
      <tr><td style="font-size:28px;font-weight:800;line-height:1.2;padding-bottom:14px;color:#fff">
        Obrigado por se cadastrar.
      </td></tr>
      <tr><td style="font-size:15px;line-height:1.65;color:#A6A6AE;padding-bottom:24px">
        Você entrou na lista da ALVEXZ IMPORTS. A partir de agora, todo drop novo,
        peça que entra no site e promoção chega no seu e-mail antes de ir pro Instagram.
        Sem spam: só mandamos quando tem coisa nova de verdade.
      </td></tr>
      <tr><td style="padding-bottom:30px">
        <a href="${site}" style="display:inline-block;background:#fff;color:#0A0A0C;
          text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:8px">
          Ver o que já está no site
        </a>
      </td></tr>
      <tr><td style="border-top:1px solid #2A2A32;padding-top:18px;font-size:12px;
        line-height:1.6;color:#75757E">
        Você recebeu este e-mail porque se cadastrou em ${site}.<br>
        <a href="${sair}" style="color:#75757E">Cancelar inscrição</a>
      </td></tr>
    </table>
   </td></tr>
  </table></body></html>`;
}
```

Três coisas nesse template não são enfeite. A tabela em vez de `div` com flexbox, porque o Outlook ignora CSS moderno. O estilo escrito direto na tag, porque o Gmail corta a tag `<style>`. E o link de cancelar inscrição, que é exigência legal e também o que impede os provedores de marcarem você como spam.

---

## 4. Função de aviso de drop

`supabase/functions/newsletter-broadcast/index.ts`

Esta é a que você chama quando lança coleção, sobe peça nova ou começa promoção.

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Só você dispara. O segredo fica no seu lado, nunca no site.
  if (req.headers.get('x-admin-secret') !== Deno.env.get('BROADCAST_SECRET')) {
    return new Response('não autorizado', { status: 401 });
  }

  const { assunto, titulo, texto, cta, href } = await req.json();

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: lista } = await db
    .from('newsletter_subscribers')
    .select('email, token')
    .eq('ativo', true);

  if (!lista?.length) return Response.json({ enviados: 0 });

  const site = Deno.env.get('SITE_URL')!;
  const chave = Deno.env.get('RESEND_API_KEY');
  let enviados = 0, falhas = 0;

  // Lotes de 50 com pausa: dispara tudo de uma vez e o provedor bloqueia.
  for (let i = 0; i < lista.length; i += 50) {
    const bloco = lista.slice(i, i + 50);
    await Promise.all(bloco.map(async (p) => {
      const sair = `${site}/#/descadastrar?t=${p.token}`;
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'ALVEXZ IMPORTS <drops@alvexz.com.br>',
          to: p.email,
          subject: assunto,
          html: emailDrop({ titulo, texto, cta, href: href ?? site, site, sair }),
          headers: { 'List-Unsubscribe': `<${sair}>` },
        }),
      });
      r.ok ? enviados++ : falhas++;
    }));
    await new Promise((r) => setTimeout(r, 1100));
  }

  await db.from('newsletter_subscribers')
    .update({ ultimo_envio_em: new Date().toISOString() })
    .eq('ativo', true);

  return Response.json({ enviados, falhas });
});
```

O template `emailDrop` é o mesmo esqueleto do anterior, trocando o miolo pelo título, texto e botão que você mandar no corpo da requisição.

### Como disparar

```bash
curl -X POST https://SEU-PROJETO.supabase.co/functions/v1/newsletter-broadcast \
  -H "x-admin-secret: SEU_SEGREDO" \
  -H "Content-Type: application/json" \
  -d '{
    "assunto": "Drop novo no ar",
    "titulo": "Chegou o drop de inverno",
    "texto": "Peças conferidas uma a uma, em quantidade pequena. Quando acaba, acaba.",
    "cta": "Ver o drop",
    "href": "https://alvexz.com.br/#/novidades"
  }'
```

---

## 5. Página de descadastro

Rota nova no HTML, dentro do roteador:

```js
else if(A==='descadastrar'){
  const t=q.get('t');
  main.innerHTML=`<div class="wrap" style="padding:60px 14px;text-align:center">
    <h2 style="margin-bottom:10px">Cancelar inscrição</h2>
    <p id="unsubMsg" style="color:var(--texto-2)">Processando...</p></div>`;
  fetch(CONFIG.NEWSLETTER_ENDPOINT.replace('subscribe','unsubscribe'),{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t})
  }).then(r=>r.json()).then(()=>{
    $('#unsubMsg').textContent='Pronto. Você não recebe mais nossos e-mails.';
  }).catch(()=>{
    $('#unsubMsg').textContent='Não conseguimos processar. Chame no WhatsApp que resolvemos.';
  });
}
```

A função `newsletter-unsubscribe` só faz `update set ativo=false, descadastrado_em=now() where token=$1`. Ela não pede login, porque quem quer sair da lista não deve precisar criar conta para isso.

---

## 6. Variáveis e deploy

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxx \
  SITE_URL=https://alvexz.com.br \
  SITE_ORIGIN=https://alvexz.com.br \
  BROADCAST_SECRET=uma-frase-longa-e-aleatoria

supabase functions deploy newsletter-subscribe
supabase functions deploy newsletter-broadcast
supabase functions deploy newsletter-unsubscribe
```

Depois, no `alvexz-store.html`, preencha:

```js
NEWSLETTER_ENDPOINT:'https://SEU-PROJETO.supabase.co/functions/v1/newsletter-subscribe'
```

Enquanto esse campo estiver vazio, o site avisa em texto que o envio automático não está ligado, em vez de mostrar "cadastrado com sucesso" para um e-mail que nunca vai chegar.

---

## 7. Verificação de domínio

Esta é a parte que as pessoas pulam e depois não entendem por que ninguém recebe.

No painel do provedor, adicione o domínio `alvexz.com.br` e copie os três registros que ele gerar para o seu DNS:

- **SPF** (TXT) — diz quais servidores podem enviar em nome do seu domínio
- **DKIM** (TXT ou CNAME) — assina cada mensagem, provando que saiu de você
- **DMARC** (TXT) — diz ao Gmail o que fazer quando algo não bate

Sem SPF e DKIM, o Gmail joga direto em spam ou recusa. Com os dois, entrega normal. A propagação leva de minutos a algumas horas.

Um detalhe que também derruba entrega: o campo `from` precisa ser do seu domínio (`drops@alvexz.com.br`). Enviar como `alvexz@gmail.com` por API de terceiro falha na checagem de DMARC do próprio Gmail.

---

## 8. Antes de considerar pronto

- [ ] SPF, DKIM e DMARC verificados no provedor
- [ ] E-mail de teste chegando na caixa de entrada, não no spam
- [ ] Link de cancelar inscrição funcionando de verdade
- [ ] `BROADCAST_SECRET` longo e fora de qualquer arquivo versionado
- [ ] Teste com Gmail, Outlook e um domínio próprio — cada um renderiza diferente
- [ ] Disparo de teste para você mesmo antes de mandar para a lista inteira
- [ ] Nome e endereço da empresa no rodapé do e-mail (exigência dos provedores)

Uma última recomendação prática: mande no máximo dois e-mails por semana. Lista de streetwear morre rápido quando vira spam, e recuperar reputação de domínio é muito mais difícil do que preservá-la.
