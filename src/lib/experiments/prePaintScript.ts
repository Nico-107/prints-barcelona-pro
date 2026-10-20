/**
 * Generates the inline pre-paint script that sets data-xp-* attributes on
 * <html> before React mounts. Built from the experiment registry at Vite build
 * time so the experiment list, end-dates and variant arrays are always in sync.
 *
 * Also used by prePaintScript.test.ts to verify the generated script matches
 * the TypeScript assign.ts logic for every visitor id.
 */

export interface PrePaintExp {
  id: string;
  /** Full HTML attribute name, e.g. "data-xp-header-btn-r2" */
  attr: string;
  layer: string;
  variants: string[];
  /** null means all languages */
  langs: string[] | null;
  enabled: boolean;
  /** Unix ms timestamp; experiment is inactive when Date.now() >= endMs */
  endMs: number;
}

/**
 * Returns the minified IIFE that performs experiment assignment before React
 * mounts. Embed it as `<script>${buildPrePaintScript(exps)}</script>` in
 * `<head>` immediately after the experiment CSS `<style>`.
 */
export function buildPrePaintScript(experiments: PrePaintExp[]): string {
  const expJson = JSON.stringify(experiments);
  const fallback = JSON.stringify(
    experiments.filter(e => e.enabled).map(e => [e.attr, e.variants[0]])
  );

  return `(function(){try{` +
    `function h(s){var k=2166136261>>>0,i=0;for(;i<s.length;i++){k^=s.charCodeAt(i);k=Math.imul(k,16777619)>>>0;}return k/4294967295;}` +
    `var VK='dim3d-vid',vid;` +
    `try{vid=localStorage.getItem(VK);if(!vid){vid=(Math.random().toString(36)+Date.now().toString(36)+Math.random().toString(36)).slice(2,20);localStorage.setItem(VK,vid);}}catch(e){vid='bot';}` +
    `var forced={},isForced=false;` +
    `try{var xpParam=new URLSearchParams(location.search).get('xp');if(xpParam){var sep=xpParam.indexOf(':');if(sep>0){forced[xpParam.slice(0,sep)]=xpParam.slice(sep+1);isForced=true;}}}catch(e){}` +
    `if(!isForced&&h(vid+'::holdout')<0.1){document.documentElement.setAttribute('data-xp-holdout','true');return;}` +
    `var lang='es',p=location.pathname;` +
    `if(p.startsWith('/en'))lang='en';` +
    `else if(p.startsWith('/ca'))lang='ca';` +
    `else if(p.startsWith('/de'))lang='de';` +
    `else if(p.startsWith('/fr'))lang='fr';` +
    `else if(p.startsWith('/it'))lang='it';` +
    `else if(p.startsWith('/nl'))lang='nl';` +
    `else if(p.startsWith('/pt'))lang='pt';` +
    `var T=Date.now();` +
    `var EXP=${expJson};` +
    `var byLayer={};` +
    `EXP.forEach(function(exp){` +
    `if(!exp.enabled||T>=exp.endMs)return;` +
    `if(exp.langs&&exp.langs.indexOf(lang)===-1)return;` +
    `if(!byLayer[exp.layer])byLayer[exp.layer]=[];` +
    `byLayer[exp.layer].push(exp);` +
    `});` +
    `Object.keys(byLayer).forEach(function(layer){` +
    `var exps=byLayer[layer];` +
    `var eIdx=Math.floor(h(vid+'::layer::'+layer)*exps.length);` +
    `var exp=exps[Math.min(eIdx,exps.length-1)];` +
    `var variant;` +
    `if(forced[exp.id]){variant=forced[exp.id];document.documentElement.setAttribute('data-xp-forced','true');}` +
    `else{var vIdx=Math.floor(h(vid+'::'+exp.id)*exp.variants.length);variant=exp.variants[Math.min(vIdx,exp.variants.length-1)];}` +
    `document.documentElement.setAttribute(exp.attr,variant);` +
    `});` +
    `}catch(err){` +
    `var F=${fallback};` +
    `for(var k=0;k<F.length;k++){try{document.documentElement.setAttribute(F[k][0],F[k][1]);}catch(s){}}` +
    `}})()`;
}
