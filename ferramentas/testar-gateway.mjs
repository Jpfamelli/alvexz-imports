#!/usr/bin/env node
/**
 * Descobridor de API de gateway — ALVEXZ IMPORTS
 *
 * Roda no seu computador, nunca no site. Serve para três coisas:
 *   1. confirmar que a chave autentica
 *   2. descobrir o formato exato da resposta de cobrança
 *   3. imprimir o trecho pronto para colar no adaptador
 *
 * Uso:
 *   node testar-gateway.mjs
 *
 * Preencha CONFIG abaixo com o que o suporte do gateway te passar.
 * Requer Node 18 ou superior (fetch nativo). Confira com: node -v
 */

const CONFIG = {
  BASE: 'https://api.sigilopay.com',   // AJUSTE: URL base que o suporte informar
  CHAVE: '',                            // AJUSTE: sua chave de API (sandbox, se houver)

  // Como a chave viaja. Descomente a forma que o gateway usar.
  AUTH: (chave) => ({ 'Authorization': `Bearer ${chave}` }),
  // AUTH: (chave) => ({ 'Authorization': `Basic ${Buffer.from(chave + ':x').toString('base64')}` }),
  // AUTH: (chave) => ({ 'x-api-key': chave }),

  // Caminhos candidatos. O script testa todos e diz qual respondeu.
  ROTAS_COBRANCA: ['/transactions', '/v1/transactions', '/charges', '/v1/charges', '/payments', '/api/v1/transactions'],
  ROTAS_SALDO:    ['/balance', '/v1/balance', '/account', '/me'],

  VALOR_TESTE: 1.00,                    // um real, para não doer se for produção
};

// CPF de teste válido no dígito verificador. Em produção, use o seu.
const CPF_TESTE = '52998224725';

const cor = { ok:'\x1b[32m', erro:'\x1b[31m', aviso:'\x1b[33m', dim:'\x1b[2m', off:'\x1b[0m', b:'\x1b[1m' };
const log = (c, ...m) => console.log(cor[c] + m.join(' ') + cor.off);

async function tentar(rota, metodo = 'GET', corpo = null) {
  const url = CONFIG.BASE.replace(/\/$/, '') + rota;
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      method: metodo,
      headers: { ...CONFIG.AUTH(CONFIG.CHAVE), 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const texto = await r.text();
    let json = null;
    try { json = JSON.parse(texto); } catch {}
    return { ok: r.ok, status: r.status, json, texto, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, status: 0, erro: e.message, ms: Date.now() - t0 };
  }
}

/** Mostra o caminho de cada campo, para você achar onde está o copia-e-cola. */
function achatar(obj, prefixo = '', saida = {}) {
  if (obj === null || typeof obj !== 'object') { saida[prefixo] = obj; return saida; }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefixo ? `${prefixo}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) achatar(v, p, saida);
    else saida[p] = Array.isArray(v) ? `[${v.length} itens]` : v;
  }
  return saida;
}

function apontar(campos, palavras) {
  return Object.keys(campos).filter(k => palavras.some(p => k.toLowerCase().includes(p)));
}

(async () => {
  console.log('\n' + cor.b + 'DESCOBRIDOR DE API — ALVEXZ IMPORTS' + cor.off);
  console.log(cor.dim + '─'.repeat(58) + cor.off);

  if (!CONFIG.CHAVE) {
    log('erro', '\n✗ Preencha CONFIG.CHAVE antes de rodar.\n');
    process.exit(1);
  }

  // ── 1. autenticação ───────────────────────────────────────────
  console.log(cor.b + '\n1. A chave autentica?' + cor.off);
  let autenticou = false;
  for (const rota of CONFIG.ROTAS_SALDO) {
    const r = await tentar(rota);
    if (r.status === 0) { log('dim', `   ${rota} → sem resposta (${r.erro})`); continue; }
    const marca = r.ok ? 'ok' : (r.status === 401 || r.status === 403) ? 'erro' : 'dim';
    log(marca, `   ${rota} → ${r.status} (${r.ms}ms)`);
    if (r.ok) {
      autenticou = true;
      console.log(cor.dim + '     ' + JSON.stringify(r.json).slice(0, 200) + cor.off);
      break;
    }
    if (r.status === 401 || r.status === 403) {
      log('erro', '     Chave recusada. Confira a chave e o formato do Authorization.');
      console.log(cor.dim + '     ' + (r.texto || '').slice(0, 200) + cor.off);
      process.exit(1);
    }
  }
  if (!autenticou) log('aviso', '   Nenhuma rota de saldo respondeu. Não impede seguir.');

  // ── 2. cobrança Pix ───────────────────────────────────────────
  console.log(cor.b + '\n2. Criar cobrança Pix de R$ ' + CONFIG.VALOR_TESTE.toFixed(2) + cor.off);
  const payload = {
    amount: Math.round(CONFIG.VALOR_TESTE * 100),   // centavos: o mais comum
    value:  CONFIG.VALOR_TESTE,                     // reais: alguns usam assim
    payment_method: 'pix', method: 'pix', type: 'pix',
    external_id: 'TESTE-' + Date.now(),
    customer: { name: 'Teste ALVEXZ', email: 'teste@alvexz.com.br', document: CPF_TESTE, phone: '12999999999' },
  };

  let achou = null;
  for (const rota of CONFIG.ROTAS_COBRANCA) {
    const r = await tentar(rota, 'POST', payload);
    if (r.status === 0) { log('dim', `   ${rota} → sem resposta`); continue; }
    const marca = r.ok ? 'ok' : r.status === 404 ? 'dim' : 'aviso';
    log(marca, `   POST ${rota} → ${r.status} (${r.ms}ms)`);
    if (!r.ok && r.status !== 404) console.log(cor.dim + '     ' + (r.texto || '').slice(0, 260) + cor.off);
    if (r.ok) { achou = { rota, r }; break; }
  }

  if (!achou) {
    log('erro', '\n✗ Nenhuma rota de cobrança respondeu com sucesso.');
    log('aviso', '  Peça ao suporte o caminho exato e o corpo esperado.');
    log('aviso', '  Se algum retornou 400 ou 422, o caminho está certo e faltam campos:');
    log('aviso', '  a mensagem de erro costuma dizer quais.\n');
    process.exit(1);
  }

  // ── 3. onde estão os campos ───────────────────────────────────
  console.log(cor.b + '\n3. Resposta recebida' + cor.off);
  const campos = achatar(achou.r.json);
  for (const [k, v] of Object.entries(campos)) {
    const s = String(v);
    console.log(`   ${k} = ${cor.dim}${s.length > 70 ? s.slice(0, 70) + '…' : s}${cor.off}`);
  }

  const idc  = apontar(campos, ['id']);
  const pix  = apontar(campos, ['qr', 'copia', 'emv', 'brcode', 'payload']);
  const exp  = apontar(campos, ['expir', 'due', 'venc']);
  const stat = apontar(campos, ['status', 'state']);

  console.log(cor.b + '\n4. Para preencher o adaptador' + cor.off);
  console.log('   id da cobrança  →', idc.join(', ')  || cor.aviso + 'não identificado' + cor.off);
  console.log('   copia-e-cola    →', pix.join(', ')  || cor.aviso + 'não identificado' + cor.off);
  console.log('   expiração       →', exp.join(', ')  || cor.dim + '—' + cor.off);
  console.log('   status          →', stat.join(', ') || cor.dim + '—' + cor.off);

  console.log(cor.b + '\n   Trecho para gateway-impl.ts:' + cor.off);
  console.log(cor.dim + `   const r = await chamar('${achou.rota}', payload);
   return {
     id: r.${idc[0] ?? 'id'},
     pix: { copiaecola: r.${pix[0] ?? 'AJUSTE'}, expiraEm: r.${exp[0] ?? 'AJUSTE'} },
   };` + cor.off);

  console.log(cor.b + '\n5. Confira no painel do gateway' + cor.off);
  console.log('   - a cobrança de R$ ' + CONFIG.VALOR_TESTE.toFixed(2) + ' apareceu?');
  console.log('   - o CNPJ que aparece no Pix é o da SUA empresa?');
  console.log('   - existe aba de Webhook com campo de segredo ou assinatura?');
  console.log('');
})();
