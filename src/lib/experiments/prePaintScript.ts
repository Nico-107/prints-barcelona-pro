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

export interface PrePaintOptions {
  /**
   * Site design switch baked into the pre-paint. 'v1' serves variant A to all
   * visitors; 'v2' serves variant B. The ?xp_home_v2 URL param still
   * overrides this for preview sessions.
   */
  siteDesign: 'v1' | 'v2';
}

/**
 * Returns the minified IIFE that performs experiment assignment before React
 * mounts. Embed it as `<script>${buildPrePaintScript(exps, opts)}</script>` in
 * `<head>` immediately after the experiment CSS `<style>`.
 */
export function buildPrePaintScript(
  experiments: PrePaintExp[],
  opts: PrePaintOptions = { siteDesign: 'v1' },
): string {
  const expJson = JSON.stringify(experiments);
  const fallback = JSON.stringify(
    experiments.filter(e => e.enabled).map(e => [e.attr, e.variants[0]])
  );
  const defaultSiteVariant = opts.siteDesign === 'v2' ? 'B' : 'A';

  return `(function(){try{` +
    `function h(s){var k=2166136261>>>0,i=0;for(;i<s.length;i++){k^=s.charCodeAt(i);k=Math.imul(k,16777619)>>>0;}return k/4294967295;}` +
    `var VK='dim3d-vid',vid;` +
    `try{vid=localStorage.getItem(VK);` +
    // Internal visitors (owner on their own devices) stay on control and
    // don't receive a visitor id in the first place — they get no variant
    // tag at all, so they don't skew experiment math. Set by ?internal=1.
    `var isInternal=false;` +
    `try{if(localStorage.getItem('dim3d-internal')==='1')isInternal=true;}catch(e){}` +
    `if(!vid){` +
    // No storage (bots / cookie-less) → no variant tag at all. 'bot' sentinel
    // is only used to feed the hash for the SITE_DESIGN attribute below.
    `vid=(Math.random().toString(36)+Date.now().toString(36)+Math.random().toString(36)).slice(2,20);localStorage.setItem(VK,vid);` +
    `}}catch(e){vid=null;}` +
    `var isBot=!vid||/bot|crawl|spider|headless/i.test(navigator.userAgent||'');` +
    `var skipAssign=isInternal||!vid;` +
    `var forced={},isForced=false;` +
    `try{var xpParam=new URLSearchParams(location.search).get('xp');if(xpParam){var sep=xpParam.indexOf(':');if(sep>0){forced[xpParam.slice(0,sep)]=xpParam.slice(sep+1);isForced=true;}}}catch(e){}` +
    // Preview override for the retired site_variant: owner opens any URL with
    // ?xp_home_v2=v2 (or =control) to flip the design for the session.
    `var siteDesignOverride=null;` +
    `try{var v2a=new URLSearchParams(location.search).get('xp_home_v2');if(v2a==='v2')siteDesignOverride='B';else if(v2a==='control')siteDesignOverride='A';}catch(e){}` +
    `try{if(new URLSearchParams(location.search).get('xp')==='reset'){forced={};isForced=false;}}catch(e){}` +
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
    `var vidForPick=vid||'bot';` +
    `var eIdx=Math.floor(h(vidForPick+'::layer::'+layer)*exps.length);` +
    `var exp=exps[Math.min(eIdx,exps.length-1)];` +
    `var variant;` +
    `if(forced[exp.id]){variant=forced[exp.id];document.documentElement.setAttribute('data-xp-forced','true');}` +
    // Bots / no-storage / internal get no variant tag — skip the attribute
    // entirely so they're not counted in any arm.
    `else if(skipAssign||isBot){return;}` +
    `else{var vIdx=Math.floor(h(vid+'::'+exp.id)*exp.variants.length);variant=exp.variants[Math.min(vIdx,exp.variants.length-1)];}` +
    `document.documentElement.setAttribute(exp.attr,variant);` +
    `});` +
    `Object.keys(forced).forEach(function(id){` +
    `var attr='data-xp-'+id.replace(/_/g,'-');` +
    `if(!document.documentElement.getAttribute(attr)){` +
    `document.documentElement.setAttribute(attr,forced[id]);` +
    `document.documentElement.setAttribute('data-xp-forced','true');` +
    `}});` +
    // Site design attribute: baked-in SITE_DESIGN constant drives every
    // visitor; ?xp_home_v2 param overrides it for preview. Not tied to the
    // experiment registry — the retired site_variant test is no longer
    // tagged on events.
    `var siteVariant=siteDesignOverride||'${defaultSiteVariant}';` +
    `if(siteDesignOverride)document.documentElement.setAttribute('data-xp-forced','true');` +
    `document.documentElement.setAttribute('data-xp-site-variant',siteVariant);` +
    `}catch(err){` +
    `var F=${fallback};` +
    `for(var k=0;k<F.length;k++){try{document.documentElement.setAttribute(F[k][0],F[k][1]);}catch(s){}}` +
    `try{document.documentElement.setAttribute('data-xp-site-variant','${defaultSiteVariant}');}catch(s){}` +
    `}})()`;
}
