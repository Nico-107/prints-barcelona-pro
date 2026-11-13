import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const PATHS = [
  "/blog/precio-impresion-3d-barcelona",
  "/blog/impresion-3d-urgente-barcelona",
  "/blog/recambios-piezas-rotas-impresion-3d-barcelona",
  "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
  "/guia-materiales-impresion-3d",
  "/como-preparar-archivo-impresion-3d",
  "/como-elegir-servicio-impresion-3d-barcelona",
  "/mejor-servicio-impresion-3d-barcelona",
  "/comparativa-materiales-impresion-3d",
  "/comparativa-plazos-impresion-3d",
  "/comparativa-tecnologias-impresion-3d",
  "/de/3d-druck-kosten", "/de/3d-druck-materialien",
  "/fr/prix-impression-3d", "/fr/materiaux-impression-3d",
  "/it/prezzi-stampa-3d", "/it/materiali-stampa-3d",
  "/nl/3d-printen-kosten",
  "/pt/preco-impressao-3d",
  "/como-ganar-dinero-con-impresora-3d",
  "/es-rentable-negocio-impresion-3d",
  "/como-conseguir-clientes-impresion-3d",
  "/how-to-make-money-with-a-3d-printer",
  "/is-3d-printing-business-profitable",
];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4181);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of PATHS) {
  try {
    await page.goto(`http://localhost:4181${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const at = await page.locator('[data-testid="article-template"]').count();
    const toc = await page.locator('[data-testid="article-toc"]').count();
    const ic = await page.locator('[data-testid="inline-cta"]').count();
    if (at < 1) errors.push(`${path}: missing article-template`);
    if (toc < 1) errors.push(`${path}: missing article-toc`);
    if (ic < 2) errors.push(`${path}: inline-cta count ${ic}`);
    const heroHasCta = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="page-hero"]');
      if (!hero) return false;
      return !!hero.querySelector('.bg-cta, .bg-primary');
    });
    if (heroHasCta) errors.push(`${path}: hero still has primary CTA`);
  } catch (e) { errors.push(`${path}: ${e.message}`); }
}
console.log(`Article paths: ${PATHS.length}; failures: ${errors.length}:`);
errors.forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
