// Gera 404.html como cópia do index.html (GitHub Pages devolve 404.html para
// qualquer rota, e o roteador do site cuida do resto). Rode antes de cada push.
import fs from 'node:fs';
const raiz=new URL('../',import.meta.url);
fs.copyFileSync(new URL('index.html',raiz),new URL('404.html',raiz));
console.log('404.html atualizado a partir do index.html');
