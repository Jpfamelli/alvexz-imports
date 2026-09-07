# ALVEXZ IMPORTS

Loja de streetwear importado em **um único arquivo** (`index.html`): HTML, CSS e
JavaScript puro, sem build. Catálogo, pedidos e login vêm do Supabase; pagamento
por Pix e boleto via Stripe (Edge Functions em `supabase/functions/`).

## Rodar localmente

```bash
node servir.mjs
```

Abre em `http://127.0.0.1:4700` (servidor com rewrite para o roteador de URLs limpas).
Abrir o `index.html` direto com dois cliques também funciona (modo `file://`, rotas com `#/`).

## Publicar

`404.html` é uma cópia do `index.html` (GitHub Pages devolve o 404 para qualquer
rota e o roteador assume). Antes de cada push:

```bash
node ferramentas/publicar.mjs
```

Outras hospedagens: arquivos de rewrite prontos em `hospedagem/`.

## Estrutura

- `index.html` — a loja inteira
- `sql/` — schema do banco (Supabase) e cadastro de peças
- `supabase/functions/` — `criar-checkout` e `stripe-webhook`
- `docs/` — passo a passo do banco, gateway, newsletter
- `ferramentas/` — scripts de manutenção
- `CLAUDE.md` — memória de decisões do projeto (leia antes de mexer)
