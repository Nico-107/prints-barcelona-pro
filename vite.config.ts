import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ACTIVE_CITY } from "./src/config/cities";
import { EXPERIMENTS } from "./src/lib/experimentsConfig";

// Convert camelCase dataset property name to kebab-case HTML attribute name.
// e.g. "xpHeroPkg" → "xp-hero-pkg"  (browser adds the "data-" prefix)
function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

function generateExperimentCSS(): string {
  const rules: string[] = [];
  for (const [id, exp] of Object.entries(EXPERIMENTS)) {
    const attr = camelToKebab(exp.attr);
    for (let v = 1; v <= exp.versions; v++) {
      rules.push(
        `html[data-${attr}="${v}"] [data-xp-slot="${id}"]:not([data-xp-v="${v}"]){display:none!important}`
      );
    }
    rules.push(
      `html:not([data-${attr}]) [data-xp-slot="${id}"]:not([data-xp-v="1"]){display:none!important}`
    );
  }
  return rules.join("");
}

function generateExperimentScript(): string {
  const expList = Object.entries(EXPERIMENTS).map(([id, exp]) => {
    const endMs = new Date(exp.endsOn + "T00:00:00Z").getTime();
    return `{i:${JSON.stringify(id)},a:${JSON.stringify(exp.attr)},q:${JSON.stringify(exp.qa)},v:${exp.versions},on:${exp.enabled},e:${endMs}}`;
  });

  return `(function(){
try{
var D=document.documentElement,T=Date.now(),C=0;
try{C=localStorage.getItem("cookie-consent")==="accepted"?1:0}catch(x){}
var P=new URLSearchParams(location.search);
var E=[${expList.join(",")}];
for(var j=0;j<E.length;j++){
var x=E[j];
if(!x.on||T>=x.e){D.dataset[x.a]="1";continue;}
var qa=P.get(x.q),qv=qa?+qa:0;
if(qv>=1&&qv<=x.v){
try{sessionStorage.setItem("dim3d-xp-"+x.i+"_forced",""+qv);}catch(s){}
D.dataset[x.a]=""+qv;continue;
}
var sf=0;try{sf=+(sessionStorage.getItem("dim3d-xp-"+x.i+"_forced")||0)||0;}catch(s){}
if(sf>=1&&sf<=x.v){D.dataset[x.a]=""+sf;continue;}
var st=C?localStorage:sessionStorage,sv=0;
try{sv=+(st.getItem("dim3d-xp-"+x.i)||0)||0;}catch(s){}
if(sv>=1&&sv<=x.v){D.dataset[x.a]=""+sv;continue;}
var r=1;
try{var arr=new Uint32Array(1);crypto.getRandomValues(arr);r=(arr[0]%x.v)+1;}catch(s){r=Math.floor(Math.random()*x.v)+1;}
try{st.setItem("dim3d-xp-"+x.i,""+r);}catch(s){}
D.dataset[x.a]=""+r;
}
}catch(err){
var F=[${Object.values(EXPERIMENTS).map(e => JSON.stringify(e.attr)).join(",")}];
for(var k=0;k<F.length;k++){try{document.documentElement.dataset[F[k]]="1";}catch(s){}}
}
})()`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "city-html-tokens",
      transformIndexHtml(html: string): string {
        return html
          .replaceAll("__CITY_NAME__", ACTIVE_CITY.cityName)
          .replace("__GEO_REGION__", ACTIVE_CITY.geoRegion);
      },
    },
    {
      name: "experiment-head-snippet",
      transformIndexHtml(html: string): string {
        const css = generateExperimentCSS();
        const script = generateExperimentScript();
        const snippet = `<style>${css}</style>\n    <script>${script}</script>`;
        // Inject as early as possible — right after <head>
        return html.replace("<head>", `<head>\n    ${snippet}`);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: isSsrBuild ? {} : {},
}));
