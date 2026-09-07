# Ligar a loja ao banco — passo a passo

Ordem importa. Cada etapa tem uma verificação no fim: só siga em frente quando ela passar. Assim, se algo quebrar, você sabe exatamente onde.

Tempo estimado: 40 a 60 minutos até o primeiro pedido gravado de verdade.

---

## Antes de começar

- Conta no Supabase (o plano gratuito dá conta de começar)
- O arquivo `supabase-schema.sql` aberto
- O `alvexz-store.html` aberto num editor de texto
- Um gerenciador de senhas ou bloco de notas para guardar as chaves

Uma coisa para ter clara desde agora: hoje a loja guarda tudo no navegador. Se você limpar os dados do site, some tudo. Depois destas etapas, os dados passam a viver no servidor — e é aí que começa a valer para vender.

---

## Etapa 1 — Criar o projeto

No painel do Supabase, **New project**.

- **Name:** `alvexz-imports`
- **Database password:** gere uma senha forte e **guarde agora**. Ela não é mostrada de novo, e sem ela você não conecta por ferramenta externa depois.
- **Region:** escolha **South America (São Paulo)**.

A região não é detalhe. Se o banco ficar nos Estados Unidos, cada consulta atravessa o continente duas vezes. São uns 120 ms a mais por chamada, e uma página de produto faz várias. Do Brasil, com o banco em São Paulo, a diferença é sentida.

O projeto leva de 2 a 3 minutos para subir.

**Verificação:** o projeto aparece como *Active* e o menu lateral com Table Editor, SQL Editor e Authentication está acessível.

---

## Etapa 2 — Rodar o schema

Abra **SQL Editor** → **New query**. Cole o `supabase-schema.sql` inteiro, do começo ao fim, e clique em **Run**.

Deve levar alguns segundos e terminar sem erro.

Se aparecer erro, leia a primeira linha da mensagem — ela diz o objeto e a linha:

| Mensagem | O que fazer |
|---|---|
| `extension "unaccent" is not available` | **Database → Extensions**, habilite `unaccent` e `pgcrypto`, rode de novo |
| `relation "public.X" does not exist` | Rodou só um pedaço do arquivo. Cole o script inteiro, do começo ao fim |
| `type "X" already exists` | O script já rodou antes. Ou parta de um projeto novo, ou apague os objetos antigos |

Sobre o segundo caso: o script tem que rodar inteiro e na ordem em que está. Uma função declarada como `language sql` é validada no momento da criação, não na hora de usar — então se ela citar uma tabela que ainda não existe, o Postgres recusa ali mesmo. É por isso que `profiles` aparece antes de `is_admin()` no arquivo.

**Verificação.** Rode isto numa query nova:

```sql
select table_name from information_schema.tables
 where table_schema='public' order by table_name;
```

Você precisa ver 16 tabelas: `addresses`, `audit_log`, `banners`, `brands`, `categories`, `coupons`, `favorites`, `newsletter_subscribers`, `order_items`, `orders`, `product_images`, `product_variants`, `products`, `profiles`, `reviews`, `stock_movements`.

Confirme também que o seed entrou:

```sql
select count(*) from public.brands;      -- 6
select count(*) from public.categories;  -- 8
select count(*) from public.coupons;     -- 3
```

---

## Etapa 3 — Conferir a segurança antes de qualquer outra coisa

Faça isto **agora**, não depois. Menu **Advisors → Security**.

A lista precisa estar vazia. Se aparecer qualquer aviso do tipo *RLS disabled in public*, aquela tabela está aberta para qualquer pessoa que tenha a chave anônima — e a chave anônima é pública por definição, vai dentro do seu HTML e qualquer visitante lê.

Um teste que vale mais que o painel de avisos. Rode:

```sql
select tablename, rowsecurity from pg_tables
 where schemaname='public' order by tablename;
```

Toda linha tem que ter `rowsecurity = true`. Se alguma vier `false`, não siga em frente: rode `alter table public.NOME enable row level security;` e confira de novo.

---

## Etapa 4 — Criar sua conta e virar admin

Vá em **Authentication → Users → Add user → Create new user**.

- Email: `gimoreiramendes@gmail.com`
- Password: uma senha forte, diferente da senha do banco
- Marque **Auto Confirm User** (senão a conta fica pendente de e-mail)

Isso cria o usuário e, pelo gatilho `handle_new_user`, cria o perfil automaticamente. Agora promova, no **SQL Editor**:

```sql
update public.profiles set role='admin'
 where email='gimoreiramendes@gmail.com';
```

**Verificação:**

```sql
select id, email, role from public.profiles;
```

Tem que voltar uma linha com `role = admin`. Se voltar vazio, o gatilho não rodou — confira se a parte `handle_new_user` do schema executou sem erro e crie o perfil manualmente com um `insert`.

### Se der `Alteração de papel não permitida`

Você rodou uma versão anterior do schema, que tinha um defeito meu: o gatilho exigia ser admin para virar admin, o que torna impossível criar o primeiro. Rode isto uma vez para substituir a função pela versão corrigida, e depois repita o `update` acima:

```sql
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
```

**Não use `alter table public.profiles disable trigger all`.** Esse comando não distingue os seus gatilhos dos internos do Postgres, e os internos são justamente as chaves estrangeiras. Se ele passasse, você ficaria com a integridade referencial desligada e poderia gravar pedido apontando para produto que não existe — sem erro nenhum na hora, e com dado quebrado para sempre. O Supabase recusa esse comando com `permission denied: "RI_ConstraintTrigger_..." is a system trigger`, o que na prática é uma proteção a seu favor.

Se ainda assim preferir desativar em vez de corrigir a função, desative **pelo nome**, que exige só ser dono da tabela e não encosta nas chaves estrangeiras:

```sql
alter table public.profiles disable trigger t_protect_role;
update public.profiles set role='admin' where email='gimoreiramendes@gmail.com';
alter table public.profiles enable  trigger t_protect_role;   -- não esqueça
```

---

## Etapa 5 — Pegar as chaves

O Supabase renomeou essa tela. Guias antigos dizem *Settings → API*; hoje é **Settings → API Keys**. Se o que você vê na tela não bater com o que está escrito aqui, confie na tela.

### Project URL

Botão **Connect**, no topo do painel do projeto — ele mostra a URL e a chave juntas. Alternativa: **Settings → Data API**, seção *Project URL*.

O formato é `https://SEU-PROJECT-REF.supabase.co`. O project ref é aquele código de vinte letras do endereço do painel. Ele não é segredo: aparece na URL de toda requisição que o navegador faz.

### A chave

**Settings → API Keys**. O Supabase trocou o sistema: as chaves `anon` e `service_role` serão descontinuadas até o fim de 2026, substituídas por publishable (`sb_publishable_...`) e secret (`sb_secret_...`).

- Se o projeto já tem o formato novo, copie a **publishable**. Ela tem os mesmos privilégios baixos da `anon`, suas policies funcionam igual, e você não precisa migrar depois.
- Se aparecer o botão **Create new API keys**, o projeto ainda está no formato antigo. Criar as novas é seguro — elas convivem com as antigas, que continuam valendo. Ou pegue a `anon public` na aba **Legacy API Keys**.

| Chave | Onde vai | Pode aparecer no navegador? |
|---|---|---|
| Project URL | `CONFIG.SUPABASE_URL` | Sim |
| publishable (ou anon) | `CONFIG.SUPABASE_ANON_KEY` | Sim |
| secret (ou service_role) | só no backend, na etapa do gateway | **Nunca** |

A secret ignora todo o RLS. Se ela entrar no HTML, qualquer visitante abre o código-fonte, copia, e passa a ler pedido de todo mundo, mudar preço e apagar produto. Não é exagero — é o comportamento normal dela, e é exatamente por isso que ela existe para o servidor.

No `alvexz-store.html`, procure `const CONFIG` no topo do `<script>` e preencha:

```js
SUPABASE_URL:'https://seu-project-ref.supabase.co',
SUPABASE_ANON_KEY:'sb_publishable_...',
```

O campo continua se chamando `SUPABASE_ANON_KEY` no código. Pode receber a publishable sem problema: para a biblioteca do Supabase as duas são a mesma coisa.

---

## Etapa 6 — Cadastrar o catálogo (faça ANTES de conectar)

Correção de ordem: nas primeiras versões deste guia, conectar vinha antes de cadastrar. Está errado. Se você ligar a loja a um banco sem produto nenhum, a home abre vazia e parece que a conexão quebrou, quando na verdade não há o que mostrar. Cadastre primeiro, conecte depois — assim a primeira coisa que você vê já prova que funcionou.

As 26 peças que aparecem hoje no site são de demonstração, escritas no código. Elas não vão para o banco sozinhas, e nem devem: você cadastra as peças que realmente tem.

O ponto que mais confunde: **o estoque não fica no produto, fica na variante**. Cada combinação de tamanho e cor é uma linha em `product_variants` com o próprio estoque. É isso que permite "acabou o M mas ainda tem G" sem gambiarra.

Rode o arquivo `cadastrar-produtos.sql` uma vez. Ele cria um atalho que registra a peça e a grade inteira num comando só:

```sql
select public.cadastrar_peca(
  'ALV-001',
  'Moletom Tech Fleece com capuz',
  'Nike',
  'moletons',
  399.90,
  '{"PP":2,"P":5,"M":8,"G":5,"GG":3}',
  499.90,
  'Moletom em tecido tech fleece, capuz forrado.',
  'Preto',
  true
);
```

Sem esse atalho você teria que escrever dois inserts e caçar o UUID da marca e da categoria a cada peça. Com ele, é uma linha. Se errar o nome da marca ou da categoria, ele avisa qual está errado em vez de gravar torto.

**Verificação:** a consulta de conferência que está no fim do `cadastrar-produtos.sql` lista tudo com o estoque somado. Cadastre pelo menos três peças antes de seguir, sendo uma de tênis, para testar as duas grades de tamanho.

---

## Etapa 7 — Conectar o arquivo ao banco

Duas edições no `alvexz-store.html`.

### 6.1 — Liberar o cliente do Supabase na CSP

Procure a linha que começa com `<meta http-equiv="Content-Security-Policy"` e troque dois trechos:

- `script-src 'self' 'unsafe-inline'` → `script-src 'self' 'unsafe-inline' https://esm.sh`
- em `connect-src`, acrescente `https://esm.sh`

Sem isso a CSP bloqueia o carregamento e nada funciona — e o erro no console fala em *Refused to load*, que é a pista.

### 6.2 — Carregar o cliente

Logo antes de `</head>`, adicione:

```html
<script type="module">
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const u = window.__SB_URL, k = window.__SB_KEY;
  window.sb = (u && k) ? createClient(u, k) : null;
  window.dispatchEvent(new Event('sb-pronto'));
</script>
```

E no `CONFIG`, logo depois das duas chaves, adicione:

```js
// exporta para o módulo acima conseguir ler
```

Na prática, é mais simples inverter: coloque as duas constantes direto no `<script type="module">`, substituindo `window.__SB_URL` e `window.__SB_KEY` pelos valores entre aspas. Menos indireção, menos chance de errar.

**Verificação.** Abra o site, aperte F12, aba Console, e digite:

```js
await sb.from('categories').select('nome').limit(3)
```

Se voltar um objeto com `data` contendo três categorias, está conectado. Se voltar `error` com *JWT* ou *Invalid API key*, a chave está errada. Se voltar erro de rede, é a CSP.

---

## Etapa 8 — Os três testes que provam que está salvando certo

Não confie em "aparentou funcionar". Estes três testes pegam os erros que custam dinheiro.

### Teste 1 — O preço não pode vir do navegador

Este é o mais importante de todos. Chame a função de criar pedido passando um item e confira o total gravado:

```sql
-- rode como se fosse o cliente logado, pelo SQL Editor com o usuário setado
select total, subtotal from public.orders order by created_at desc limit 1;
```

O `total` tem que bater com o preço que está em `products.preco`, e não com nada enviado de fora. A função `criar_pedido` foi escrita justamente para recalcular tudo do banco: o navegador só manda `variant_id` e quantidade. Se algum dia você mudar isso e passar a aceitar o preço vindo do front, alguém abre o DevTools e compra um tênis de R$ 800 por R$ 1.

### Teste 2 — Estoque insuficiente tem que falhar

Tente comprar mais do que existe:

```sql
select public.criar_pedido(
  '[{"variant_id":"COLE-O-UUID-DE-UMA-VARIANTE","quantidade":9999}]'::jsonb,
  '{"cep":"12010000","rua":"Teste","numero":"1","cidade":"Taubaté","uf":"SP"}'::jsonb,
  'pix'
);
```

Tem que dar erro `Estoque insuficiente`. Se passar, o pedido entra sem lastro e você vende o que não tem.

### Teste 3 — Um cliente não pode ver o pedido do outro

Crie uma segunda conta em Authentication, faça um pedido com ela, e depois, logado com a primeira, tente listar pedidos. Só podem aparecer os seus. Se aparecerem os dois, alguma policy de `orders` não está valendo — volte para a Etapa 3.

---

## Erros comuns e o que significam

| O que aparece | O que é |
|---|---|
| `new row violates row-level security policy` | Está tentando escrever numa tabela onde o cliente não tem permissão. Correto para pedidos: eles só nascem pela função `criar_pedido`, nunca por `insert` direto. |
| `permission denied for table` | Faltou o `grant` ou a policy. Confira a Etapa 3. |
| `JWT expired` | A sessão venceu. O cliente do Supabase renova sozinho; se persistir, é relógio do sistema errado. |
| `Invalid API key` | Chave copiada pela metade ou trocada pela `service_role`. |
| Consulta volta `[]` sem erro | Quase sempre é RLS funcionando: a linha existe mas você não tem permissão de ver. Não é bug. |
| `function criar_pedido does not exist` | O schema não rodou até o fim. Rode de novo e leia a mensagem de erro da primeira vez. |

---

## Depois que isso estiver de pé

Só então parta para o gateway de pagamento, com o `README-INTEGRACAO.md`. A ordem importa: o gateway precisa de um pedido já gravado no banco para criar a cobrança em cima. Tentar as duas coisas ao mesmo tempo dobra a superfície de erro e triplica o tempo de achar onde quebrou.

E deixe a `service_role` guardada até lá. Ela só entra em cena no backend do checkout, nunca antes.
