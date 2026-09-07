# Hospedagem — arquivos de configuração

O site usa rotas limpas (`/p/moletom-tech-fleece`) quando servido por http ou
https. Isso exige uma coisa do servidor: **devolver o `index.html` em qualquer
caminho**, em vez de procurar um arquivo naquele endereço.

Sem essa regra, a home funciona, a navegação por cliques funciona, mas
recarregar a página num produto ou abrir um link compartilhado dá **404**. É o
erro mais comum ao publicar site de página única, e a causa não é o código.

## Como usar

1. Renomeie `alvexz-store.html` para **`index.html`**.
2. Suba junto o arquivo de configuração da sua hospedagem:

| Hospedagem | Arquivo | Onde |
|---|---|---|
| Vercel | `vercel.json` | raiz do projeto |
| Netlify | `netlify.toml` ou `_redirects` | raiz (o `_redirects` vai na pasta publicada) |
| Cloudflare Pages | `_redirects` | raiz |
| Apache, cPanel, Hostinger, Locaweb | `.htaccess` | mesma pasta do `index.html` |

Os três trazem também os cabeçalhos de segurança que a CSP declarada no HTML
não consegue aplicar sozinha — `X-Frame-Options` e `Strict-Transport-Security`
só funcionam como cabeçalho HTTP, nunca por `<meta>`.

## Hospedando dentro de uma subpasta

Se o site não ficar na raiz do domínio, e sim em algo como
`seudominio.com.br/loja/`, declare a pasta **antes** do script principal, dentro
do `<head>` do `index.html`:

```html
<script>window.ALVEXZ_BASE='/loja';</script>
```

Sem isso o roteador monta os links a partir da raiz e a navegação quebra. Não dá
para deduzir isso sozinho: num endereço como `/c/moletons`, o código não tem como
saber se `c` é uma subpasta ou o começo de uma rota.

## Testando antes de publicar

Abrir o arquivo com dois cliques (`file://`) continua funcionando — nesse caso o
site cai automaticamente no modo com `#` na URL, porque `pushState` não existe em
arquivo local. É esperado e não indica problema.

Para ver como vai ficar hospedado, rode um servidor local na pasta do arquivo:

```bash
python3 -m http.server 8000
```

E abra `http://localhost:8000`. Aí as URLs aparecem limpas. Só lembre que esse
servidor simples não faz a regra de rewrite, então recarregar dentro de um
produto vai dar 404 — o que some assim que a configuração acima estiver no ar.
