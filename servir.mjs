// Servidor local com rewrite: qualquer caminho sem arquivo devolve index.html
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const RAIZ = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const MIME = {".html":"text/html; charset=utf-8",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp",".json":"application/json",".ico":"image/x-icon"};
http.createServer((req,res)=>{
  const url = decodeURIComponent(req.url.split("?")[0]);
  let alvo = path.join(RAIZ, url);
  if (!fs.existsSync(alvo) || fs.statSync(alvo).isDirectory()) alvo = path.join(RAIZ, "index.html");
  res.writeHead(200, {"Content-Type": MIME[path.extname(alvo).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(alvo).pipe(res);
}).listen(4700, "127.0.0.1", ()=>console.log("ALVEXZ em http://127.0.0.1:4700"));
