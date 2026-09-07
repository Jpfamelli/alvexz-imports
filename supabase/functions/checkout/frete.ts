// Tabela de frete por faixa de CEP. Mesma regra da função fretes() do site,
// mas calculada AQUI: o navegador só escolhe a modalidade, nunca manda o valor.
// Quando entrar frete real (SuperFrete/Correios), troque só este arquivo.
export interface OpcaoFrete { id: string; nome: string; prazo: string; preco: number }

export function opcoesFrete(cep: string, subtotal: number, freteGratisAcima: number): OpcaoFrete[] {
  const n = parseInt(String(cep).replace(/\D/g, '').slice(0, 2) || '01', 10);
  const longe = (n >= 60 && n <= 79);
  const base = n < 20 ? 0 : (n < 40 ? 8 : (n < 60 ? 14 : (n < 70 ? 22 : 26)));
  const gratis = subtotal >= freteGratisAcima;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return [
    { id: 'pac',    nome: 'PAC',              prazo: longe ? '10 a 14 dias úteis' : '5 a 8 dias úteis', preco: gratis ? 0 : r2(19.90 + base) },
    { id: 'sedex',  nome: 'SEDEX',            prazo: longe ? '4 a 6 dias úteis'   : '2 a 3 dias úteis', preco: r2(39.90 + base * 1.6) },
    { id: 'jadlog', nome: 'Jadlog .Package',  prazo: longe ? '7 a 11 dias úteis'  : '4 a 6 dias úteis', preco: gratis ? 0 : r2(24.90 + base * 0.8) },
  ];
}
