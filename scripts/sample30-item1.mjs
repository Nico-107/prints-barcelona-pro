import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { resolve, extname, join } from "path";
const DIST = resolve("dist");
const SAMPLE = ["/","/impresion-3d-multicolor","/blog","/blog/que-se-puede-imprimir-en-3d","/blog/recambios-piezas-rotas-impresion-3d-barcelona","/3d-printing-barcelona","/prototipos-3d-barcelona","/3d-printing-price-barcelona","/ca/recanvis-impressio-3d-barcelona","/impresion-petg-barcelona","/miniatures-barcelona","/ca/impressio-3d-empreses-barcelona","/3d-printing-delivery-london","/madrid","/como-elegir-servicio-impresion-3d-barcelona","/how-to-prepare-file-for-3d-printing","/catalogo/placa-nombre","/dissenya-la-teva-peca-3d","/piezas-funcionales-barcelona","/is-3d-printing-business-profitable","/kunden-fuer-3d-druck-finden","/comparativa-plazos-impresion-3d","/impresion-3d-sin-pedido-minimo","/short-run-3d-printing-barcelona","/it/stampa-3d-online","/it/stampa-3d-milano","/de/3d-druck-materialien","/fr/preparer-fichier-impression-3d","/pt/preco-impressao-3d","/de/gardena-schlauch-adapter","/nl/vesa-monitor-adapter","/track","/privacy","/creator","/catalogo","/sobre-nosotros","/politica-devoluciones","/design-your-3d-part","/3d-file-checker"];
function serveDist(port){const s=createServer((req,res)=>{let p=decodeURIComponent((req.url||"/").split("?")[0]);if(p.endsWith("/")&&p!=="/")p=p.slice(0,-1);const c=[join(DIST,p),join(DIST,p+".html"),join(DIST,p,"index.html")];const M={".html":"text/html",".js":"application/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".json":"application/json",".xml":"application/xml",".ico":"image/x-icon"};for(const q of c){if(existsSync(q)&&statSync(q).isFile()){res.writeHead(200,{"Content-Type":M[extname(q)]||"application/octet-stream"});res.end(readFileSync(q));return;}}res.writeHead(200,{"Content-Type":"text/html"});res.end(readFileSync(join(DIST,"index.html")));});return new Promise(r=>s.listen(port,()=>r(s)));}
const srv = await serveDist(4175);
const b = await chromium.launch();
const page = await (await b.newContext()).newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const errors = [];
for (const path of SAMPLE) {
  try {
    await page.goto(`http://localhost:4175${path}?xp=site_variant:A`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(250);
    const siteHeader = await page.locator('[data-testid="site-header"]').count();
    const pageHero = await page.locator('[data-testid="page-hero"]').count();
    if (siteHeader < 1) errors.push(`${path} A: missing site-header`);
    if (pageHero < 1) errors.push(`${path} A: missing page-hero`);
  } catch (e) { errors.push(`${path} A: ${e.message}`); }
}
console.log(`Checked ${SAMPLE.length} routes; ${errors.length} failures:`);
errors.slice(0, 30).forEach(e => console.log("  ✗ " + e));
await b.close(); srv.close();
