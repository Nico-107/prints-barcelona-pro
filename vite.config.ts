import { defineConfig } from "vitest/config";
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
    for (const v of exp.variants) {
      rules.push(
        `html[data-${attr}="${v}"] [data-xp-slot="${id}"]:not([data-xp-v="${v}"]){display:none!important}`
      );
    }
    rules.push(
      `html:not([data-${attr}]) [data-xp-slot="${id}"]:not([data-xp-v="${exp.variants[0]}"]){display:none!important}`
    );
  }
  return rules.join("");
}

function generateExperimentScript(): string {
  const expList = Object.entries(EXPERIMENTS).map(([id, exp]) => {
    const startMs = new Date(exp.startedOn + "T00:00:00Z").getTime();
    const endMs = startMs + exp.maxDays * 86400000;
    return `{i:${JSON.stringify(id)},a:${JSON.stringify(exp.attr)},vs:${JSON.stringify(exp.variants)},on:${exp.enabled},e:${endMs}}`;
  });

  const fallbackList = Object.entries(EXPERIMENTS)
    .map(([, e]) => `[${JSON.stringify(e.attr)},${JSON.stringify(e.variants[0])}]`)
    .join(",");

  return `(function(){
try{
var D=document.documentElement,T=Date.now(),C=0;
try{C=localStorage.getItem("cookie-consent")==="accepted"?1:0}catch(x){}
var P=new URLSearchParams(location.search);
var XP=P.get("xp"),XPS=XP?XP.split(":"):[null,null];
var E=[${expList.join(",")}];
for(var j=0;j<E.length;j++){
var x=E[j];
if(!x.on||T>=x.e){D.dataset[x.a]=x.vs[0];continue;}
if(XPS[0]===x.i&&x.vs.indexOf(XPS[1])>=0){
try{sessionStorage.setItem("dim3d-xp-"+x.i+"_forced",XPS[1]);}catch(s){}
D.dataset[x.a]=XPS[1];continue;
}
var sf=null;try{sf=sessionStorage.getItem("dim3d-xp-"+x.i+"_forced");}catch(s){}
if(sf&&x.vs.indexOf(sf)>=0){D.dataset[x.a]=sf;continue;}
var st=C?localStorage:sessionStorage,sv=null;
try{sv=st.getItem("dim3d-xp-"+x.i);}catch(s){}
if(sv&&x.vs.indexOf(sv)>=0){D.dataset[x.a]=sv;continue;}
var r;
try{var arr=new Uint32Array(1);crypto.getRandomValues(arr);r=x.vs[arr[0]%x.vs.length];}catch(s){r=x.vs[Math.floor(Math.random()*x.vs.length)];}
try{st.setItem("dim3d-xp-"+x.i,r);}catch(s){}
D.dataset[x.a]=r;
}
}catch(err){
var F=[${fallbackList}];
for(var k=0;k<F.length;k++){try{document.documentElement.dataset[F[k][0]]=F[k][1];}catch(s){}}
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
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "scripts/**"],
  },
}));
