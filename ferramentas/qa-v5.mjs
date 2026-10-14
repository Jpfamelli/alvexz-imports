// Uso: node ferramentas/qa-v5.mjs [http://127.0.0.1:4700]  (precisa do Chrome instalado e do
// puppeteer-core de outro projeto desta máquina — caminho abaixo; capturas vão para a pasta do script)
// QA da v5 no Chrome headless: fluxos novos + estouro horizontal + capturas.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('C:/Users/USER/.claude/backups/indycar-landing/package.json');
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://127.0.0.1:4700';
const OUT = new URL('./', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = {};
const erros = [];

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => erros.push(e.message));
await page.setViewport({ width: 1280, height: 800 });
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
res.skeletonVisto = await page.evaluate(() => !!document.querySelector('.sk-hero'));
await page.waitForSelector('.card .fav.hb', { timeout: 30000 });
await page.evaluate(() => { document.querySelector('#ckAccept')?.click(); document.documentElement.style.scrollBehavior = 'auto'; });
res.online = await page.evaluate(() => ONLINE);
res.hearts = await page.evaluate(() => document.querySelectorAll('.fav.hb').length);

// 1. favoritar no card
res.fav = await page.evaluate(async () => { const h = document.querySelector('.fav.hb'); h.click(); await new Promise(r => setTimeout(r, 250)); return { on: h.classList.contains('on'), n: State.fav.length, toast: document.querySelector('.toast')?.textContent.trim() }; });

// 2. rolagem restaurada ao voltar
await page.evaluate(() => window.scrollTo({ top: 1700, behavior: 'instant' }));
await sleep(150);
const yAntes = await page.evaluate(() => scrollY);
await page.evaluate(() => document.querySelector('.card .card-img').click());
await sleep(500);
const rotaProduto = await page.evaluate(() => location.pathname);
await page.goBack({ waitUntil: 'networkidle0' }).catch(() => {});
await sleep(700);
res.scroll = { yAntes, rotaProduto, voltou: await page.evaluate(() => location.pathname), yDepois: await page.evaluate(() => scrollY) };

// 3. "Vistos recentemente" na home
res.recentHome = await page.evaluate(() => [...document.querySelectorAll('.section-h h2')].map(h => h.textContent).includes('Vistos recentemente'));

// 4. ficha: salvar, compartilhar, qual meu tamanho, aviso
await page.goto(BASE + '/p/tech-fleece-hd', { waitUntil: 'networkidle2' });
await page.waitForSelector('.pdp-acts', { timeout: 30000 });
await page.evaluate(() => { document.querySelector('#ckAccept')?.click(); document.documentElement.style.scrollBehavior = 'auto'; });
res.pdp = await page.evaluate(() => ({
  acts: document.querySelector('.pdp-acts')?.textContent.replace(/\s+/g, ' ').trim(),
  salvoJa: document.querySelector('.pdp-acts [data-fav]')?.classList.contains('on'),
  help: !!document.querySelector('#szHelp'),
  secoes: [...document.querySelectorAll('.section-h h2')].map(h => h.textContent)
}));
await page.evaluate(async () => { document.querySelector('#szHelp').click(); await new Promise(r => setTimeout(r, 300)); document.querySelector('#szhA').value = 180; document.querySelector('#szhP').value = 82; document.querySelector('#szhGo').click(); });
await sleep(250);
res.tamanho = await page.evaluate(() => document.querySelector('#szhR')?.textContent.replace(/\s+/g, ' ').trim());
await page.screenshot({ path: OUT + 'qa-tamanho.png' });
res.tamanhoUse = await page.evaluate(async () => { document.querySelector('#szhUse').click(); await new Promise(r => setTimeout(r, 300)); return { size: PDP.size, modal: getComputedStyle(document.querySelector('#modal')).display }; });
await page.evaluate(() => document.querySelector('.pdp-acts').scrollIntoView({ block: 'center' }));
await sleep(200);
await page.screenshot({ path: OUT + 'qa-pdp.png' });

// 5. busca recente
res.busca = await page.evaluate(async () => { const q = document.querySelector('#q'); q.value = 'moletom'; goSearch(); await new Promise(r => setTimeout(r, 400)); q.value = ''; q.dispatchEvent(new Event('focus')); await new Promise(r => setTimeout(r, 200)); return { rota: location.pathname + location.search, buscas: State.buscas, aberto: document.querySelector('#suggest').classList.contains('on'), txt: document.querySelector('#suggest').textContent.replace(/\s+/g, ' ').trim().slice(0, 60) }; });
await page.screenshot({ path: OUT + 'qa-busca.png' });

// 6. página de favoritos + menu
res.favPage = await page.evaluate(async () => { go('/favoritos'); await new Promise(r => setTimeout(r, 300)); renderDrawer(); return { h2: document.querySelector('.section-h h2')?.textContent, cards: document.querySelectorAll('.card').length, menu: document.querySelector('#drawerBody').textContent.includes('Favoritos') }; });

// 7. esqueleto existe e some
res.skeleton = await page.evaluate(() => typeof skeletonHome === 'function' && skeletonHome().includes('sk-hero'));

// 8. mobile: sem estouro nas rotas principais
const m = await browser.newPage();
m.on('pageerror', e => erros.push('mobile: ' + e.message));
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
res.mobile = {};
for (const r of ['/', '/produtos', '/p/tech-fleece-hd', '/favoritos', '/carrinho']) {
  await m.goto(BASE + r, { waitUntil: 'networkidle2' });
  await m.waitForFunction(() => !document.querySelector('.sk-hero'), { timeout: 30000 });
  await m.evaluate(() => document.querySelector('#ckAccept')?.click());
  res.mobile[r] = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
await m.goto(BASE + '/', { waitUntil: 'networkidle2' });
await m.waitForSelector('.card .fav.hb', { timeout: 30000 });
await m.evaluate(() => { document.querySelector('#ckAccept')?.click(); document.querySelector('.section').scrollIntoView(); });
await sleep(400);
await m.screenshot({ path: OUT + 'qa-mobile-cards.png' });

res.erros = erros;
console.log(JSON.stringify(res, null, 1));
await browser.close();
