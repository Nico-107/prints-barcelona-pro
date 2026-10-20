#!/usr/bin/env node
/**
 * BUG 2a probe — POSTs two real V3 checkout bodies to create-instant-checkout.
 * Case 1: PLA, pickup, qty 1  (total ≈ €10, below autumn-discount threshold)
 * Case 2: PLA, pickup, qty 20 (total ≈ €25, above autumn-discount threshold)
 *
 * Uses the EXACT same estimator math as the edge function (ported from TS).
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env.
 * Does NOT pay. Prints HTTP status + full JSON for each case.
 *
 * Usage: node scripts/qa/live-checkout-probe.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const paths = [join(ROOT, ".env"), join(ROOT, ".env.local")];
  const env = {};
  for (const p of paths) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}
const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || SUPABASE_URL.includes("placeholder") || !ANON_KEY || ANON_KEY.includes("placeholder")) {
  console.error("ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set in .env");
  process.exit(1);
}

// ─── Binary STL: 20 mm cube ───────────────────────────────────────────────────
// 12 triangles (2 per face), outward normals, consistent CCW winding.
function make20mmCubeStl() {
  // 8 vertices
  const v = [
    [0,0,0],[20,0,0],[20,20,0],[0,20,0],  // bottom ring
    [0,0,20],[20,0,20],[20,20,20],[0,20,20], // top ring
  ];
  // 12 triangles [idx0, idx1, idx2, nx, ny, nz]
  const tris = [
    [0,3,2, 0,0,-1],[0,2,1, 0,0,-1],   // bottom
    [4,5,6, 0,0,1],[4,6,7, 0,0,1],     // top
    [0,1,5, 0,-1,0],[0,5,4, 0,-1,0],   // front
    [3,7,6, 0,1,0],[3,6,2, 0,1,0],     // back
    [0,4,7, -1,0,0],[0,7,3, -1,0,0],   // left
    [1,2,6, 1,0,0],[1,6,5, 1,0,0],     // right
  ];
  const buf = new ArrayBuffer(80 + 4 + 12 * 50);
  const dv = new DataView(buf);
  // header: zeros
  dv.setUint32(80, 12, true); // triangle count
  let off = 84;
  for (const [i0,i1,i2,nx,ny,nz] of tris) {
    dv.setFloat32(off,    nx, true); dv.setFloat32(off+4, ny,  true); dv.setFloat32(off+8, nz, true); off += 12;
    for (const vi of [i0,i1,i2]) {
      dv.setFloat32(off,    v[vi][0], true);
      dv.setFloat32(off+4,  v[vi][1], true);
      dv.setFloat32(off+8,  v[vi][2], true);
      off += 12;
    }
    dv.setUint16(off, 0, true); off += 2;
  }
  return buf;
}

// ─── Estimator (ported verbatim from ESTIMATOR block in edge function) ────────
const EST = {
  version: 3,
  wallWidthMm: 0.4425, infillFactor: 0.905, shellFactor: 0.9296,
  topSkinMm: 1.0, bottomSkinMm: 0.6,
  supportCm3PerCm2: 0.3256, supportSecPerCm3: 782.9045,
  overhangNz: 0.85, bedContactMm: 0.4,
  timeCoef: [790.4113, 71.3533, 284.6187, 699.0554, 2.5218],
  setupEur: 0, minimumEur: 10, plasticEurPerG: 0.055,
  timeTiers: [ { upToH: 3, eurPerH: 4.95 }, { upToH: 8, eurPerH: 3.85 }, { upToH: Infinity, eurPerH: 2.75 } ],
  instantMaxCents: 10000, shippingCents: 590,
  plate: { x: 256, y: 256, z: 261, packAreaMm2: 37000, gapMm: 4 },
  materials: {
    PLA:   { density: 1.24, priceMult: 1.0, timeMult: 1.00, instant: true },
    PETG:  { density: 1.27, priceMult: 1.1, timeMult: 1.00, instant: true },
    ABS:   { density: 1.04, priceMult: 1.3, timeMult: 1.08, instant: true },
    ASA:   { density: 1.07, priceMult: 1.3, timeMult: 1.00, instant: true },
    TPU:   { density: 1.20, priceMult: 1.3, timeMult: 1.29, instant: true },
    Nylon: { density: 1.14, priceMult: 1.4, timeMult: 1.00, instant: true },
  },
  quality: { fast: 0.91, standard: 1.0, fine: 1.22, high: 1.51, ultra: 2.19 },
  urgency: { standard: 1.0, express: 1.25, urgent: 1.6 },
};

const ORIENTS = [
  { name: 'as uploaded',         m: [[0, 1], [1, 1], [2, 1]] },
  { name: 'flipped upside down', m: [[0, 1], [1, -1], [2, -1]] },
  { name: 'on its side (+x)',    m: [[0, 1], [2, -1], [1, 1]] },
  { name: 'on its side (-x)',    m: [[0, 1], [2, 1], [1, -1]] },
  { name: 'on its side (+y)',    m: [[2, 1], [1, 1], [0, -1]] },
  { name: 'on its side (-y)',    m: [[2, -1], [1, 1], [0, 1]] },
];

const AUTUMN_DISCOUNT = {
  pct: 10, minCents: 2000, endsAt: "2026-11-30T22:59:59Z",
};

function stlToTriangles(buf) {
  const dv = new DataView(buf);
  if (buf.byteLength >= 84) {
    const count = dv.getUint32(80, true);
    if (84 + count * 50 === buf.byteLength) {
      const out = new Float32Array(count * 9);
      for (let i = 0, o = 84; i < count; i++, o += 50) {
        for (let k = 0; k < 9; k++) out[i * 9 + k] = dv.getFloat32(o + 12 + k * 4, true);
      }
      return out;
    }
  }
  const text = new TextDecoder().decode(new Uint8Array(buf));
  const nums = [];
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  let m;
  while ((m = re.exec(text))) nums.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return Float32Array.from(nums.slice(0, Math.floor(nums.length / 9) * 9));
}

function analyzeTriangles(tri) {
  const n = Math.floor(tri.length / 9);
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  let vol6 = 0;
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const x0=tri[b],y0=tri[b+1],z0=tri[b+2],x1=tri[b+3],y1=tri[b+4],z1=tri[b+5],x2=tri[b+6],y2=tri[b+7],z2=tri[b+8];
    if (x0<mn[0])mn[0]=x0; if(x1<mn[0])mn[0]=x1; if(x2<mn[0])mn[0]=x2;
    if (y0<mn[1])mn[1]=y0; if(y1<mn[1])mn[1]=y1; if(y2<mn[1])mn[1]=y2;
    if (z0<mn[2])mn[2]=z0; if(z1<mn[2])mn[2]=z1; if(z2<mn[2])mn[2]=z2;
    if (x0>mx[0])mx[0]=x0; if(x1>mx[0])mx[0]=x1; if(x2>mx[0])mx[0]=x2;
    if (y0>mx[1])mx[1]=y0; if(y1>mx[1])mx[1]=y1; if(y2>mx[1])mx[1]=y2;
    if (z0>mx[2])mx[2]=z0; if(z1>mx[2])mx[2]=z1; if(z2>mx[2])mx[2]=z2;
    vol6 += x0*(y1*z2-y2*z1)+y0*(z1*x2-z2*x1)+z0*(x1*y2-x2*y1);
  }
  const sgn = vol6 < 0 ? -1 : 1;
  const ext = [mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]];
  const acc = ORIENTS.map(() => ({ up: 0, dn: 0, side: 0, oa: 0 }));
  const zMinO = ORIENTS.map(o => { const [ax,s]=o.m[2]; return s>0?mn[ax]:-mx[ax]; });
  let skipped = 0;
  const n3 = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const x0=tri[b],y0=tri[b+1],z0=tri[b+2];
    const ex1=tri[b+3]-x0,ey1=tri[b+4]-y0,ez1=tri[b+5]-z0,ex2=tri[b+6]-x0,ey2=tri[b+7]-y0,ez2=tri[b+8]-z0;
    const cx=ey1*ez2-ez1*ey2,cy=ez1*ex2-ex1*ez2,cz=ex1*ey2-ey1*ex2;
    const len=Math.sqrt(cx*cx+cy*cy+cz*cz);
    if (len < 1e-9) { skipped++; continue; }
    const area = len / 2;
    n3[0]=(cx/len)*sgn; n3[1]=(cy/len)*sgn; n3[2]=(cz/len)*sgn;
    for (let o = 0; o < 6; o++) {
      const [ax,s] = ORIENTS[o].m[2];
      const nz = s * n3[ax];
      const a = acc[o];
      if (nz>0) a.up+=area*nz; else a.dn+=area*-nz;
      a.side+=area*Math.sqrt(Math.max(1-nz*nz,0));
      if (nz < -EST.overhangNz) {
        const zTop = Math.max(s*tri[b+ax], s*tri[b+3+ax], s*tri[b+6+ax]);
        if (zTop - zMinO[o] > EST.bedContactMm) a.oa += area * -nz;
      }
    }
  }
  const V = Math.abs(vol6) / 6;
  const orientations = ORIENTS.map((o,k) => ({
    index:k, name:o.name, aUp:acc[k].up, aDown:acc[k].dn, aSide:acc[k].side,
    heightMm:ext[o.m[2][0]], sizeXMm:ext[o.m[0][0]], sizeYMm:ext[o.m[1][0]], overhangCm2:acc[k].oa/100,
  }));
  return { triangles:n, skipped, volumeMm3:V, insideOut:sgn<0, boundsMm:[ext[0],ext[1],ext[2]], orientations };
}

function tierCostEur(hours) {
  let prev=0, cost=0;
  for (const t of EST.timeTiers) { if(hours>prev) cost+=(Math.min(hours,t.upToH)-prev)*t.eurPerH; prev=t.upToH; }
  return cost;
}

function fits(f) {
  const p=EST.plate; return f.sizeXMm<=p.x && f.sizeYMm<=p.y && f.heightMm<=p.z;
}

function estimateForOrientation(a, o, s) {
  const f=a.orientations[o], mat=EST.materials[s.material]??EST.materials.PLA;
  const infill=s.infillPct/100, walls=s.wallLoops, V=a.volumeMm3;
  const shell=Math.min(f.aSide*walls*EST.wallWidthMm+f.aUp*EST.topSkinMm+f.aDown*EST.bottomSkinMm,V);
  const plastic=(EST.shellFactor*shell+Math.max(V-shell,0)*infill*EST.infillFactor)/1000;
  const support=s.supports?EST.supportCm3PerCm2*f.overhangCm2:0;
  const inf=Math.max(V-shell,0)*infill/1000;
  const c=EST.timeCoef;
  const base=c[0]+c[1]*(f.aSide*walls/1000)+c[2]*inf+c[3]*inf*infill+c[4]*(f.heightMm/0.2);
  const q=EST.quality[s.quality]??1;
  const timeSec=c[0]+(base-c[0])*mat.timeMult*q+EST.supportSecPerCm3*support;
  return {
    orientation:o, orientationName:f.name, plasticCm3:plastic, supportCm3:support,
    grams:(plastic+support)*mat.density, timeSec, fixedSec:c[0],
    sizeXMm:f.sizeXMm, sizeYMm:f.sizeYMm, heightMm:f.heightMm, fitsPlate:fits(f),
  };
}

function rankCostEur(e, material) {
  const m=EST.materials[material]??EST.materials.PLA;
  return m.priceMult*(e.grams*EST.plasticEurPerG+tierCostEur(e.timeSec/3600));
}

function estimatePart(a, s) {
  if (s.orientation !== 'auto') return estimateForOrientation(a, Math.max(0,Math.min(5,s.orientation|0)), s);
  let best=null, bestCost=Infinity;
  for (let o=0;o<6;o++) {
    const e=estimateForOrientation(a,o,s);
    const cost=rankCostEur(e,s.material)+(e.fitsPlate?0:1e6);
    if (cost<bestCost-1e-9) { bestCost=cost; best=e; }
  }
  return best;
}

const rnd = x => Math.floor(x+0.5);

function priceOrder(parts, urgency) {
  const up=EST.urgency[urgency]??1;
  const p=EST.plate;
  let footprint=0, marg=0;
  const margs=parts.map(x=>Math.max(x.estimate.timeSec-x.estimate.fixedSec,0)*x.quantity);
  parts.forEach((x,i)=>{ footprint+=x.quantity*(x.estimate.sizeXMm+p.gapMm)*(x.estimate.sizeYMm+p.gapMm); marg+=margs[i]; });
  const plates=Math.max(1,Math.ceil(footprint/p.packAreaMm2));
  const fixed=parts.length?parts[0].estimate.fixedSec:0;
  const orderSec=plates*fixed+marg;
  const orderHours=orderSec/3600;
  const timeCost=tierCostEur(orderHours);
  const nTypes=Math.max(parts.length,1);
  const raw=parts.map((x,i)=>{
    const m=EST.materials[x.material]??EST.materials.PLA;
    const weight=orderSec>0?(margs[i]+(plates*fixed)/nTypes)/orderSec:1/nTypes;
    return m.priceMult*(x.quantity*x.estimate.grams*EST.plasticEurPerG+timeCost*weight);
  });
  const rawTotal=EST.setupEur+raw.reduce((a,b)=>a+b,0);
  const base=Math.max(rawTotal,EST.minimumEur);
  const total=base*up;
  const baseCents=rnd(base*100), totalCents=rnd(total*100);
  const setupCents=rnd(EST.setupEur*100);
  const partCents=raw.map(r=>rnd(r*100));
  const residual=baseCents-(setupCents+partCents.reduce((a,b)=>a+b,0));
  const minAdjCents=0;
  if (partCents.length) {
    const bi=partCents.reduce((b,c,i)=>c>partCents[b]?i:b,0);
    if (rawTotal<EST.minimumEur && residual>0) {
      const sum=partCents.reduce((a,b)=>a+b,0);
      let given=0;
      const share=partCents.map(c=>{ const g=sum>0?Math.floor(residual*c/sum):Math.floor(residual/partCents.length); given+=g; return g; });
      share.forEach((g,i)=>{ partCents[i]+=g; });
      partCents[bi]+=residual-given;
    } else partCents[bi]+=residual;
  }
  const expressCents=totalCents-baseCents;
  let instantEligible=totalCents<=EST.instantMaxCents;
  const reasons=[];
  if(!instantEligible) reasons.push('over-limit');
  for (const x of parts) {
    if(!(EST.materials[x.material]?.instant)){instantEligible=false;reasons.push('material:'+x.material);}
    if(!x.estimate.fitsPlate){instantEligible=false;reasons.push('oversize:'+x.name);}
  }
  return {
    parts:parts.map((x,i)=>({name:x.name,quantity:x.quantity,material:x.material,grams:x.estimate.grams,timeSec:x.estimate.timeSec,costCents:partCents[i]})),
    setupCents,minAdjCents,expressCents,totalCents,baseCents,plates,orderHours,instantEligible,reasons,
  };
}

function computeAutumnDiscount(printSubtotalCents) {
  const now = Date.now();
  const end = new Date(AUTUMN_DISCOUNT.endsAt).getTime();
  if (now > end) return 0;
  if (printSubtotalCents < AUTUMN_DISCOUNT.minCents) return 0;
  return Math.round(printSubtotalCents * AUTUMN_DISCOUNT.pct / 100);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function uploadStl(buf, path) {
  const url = `${SUPABASE_URL}/storage/v1/object/print-requests/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}`, "Content-Type": "application/octet-stream", "x-upsert": "true" },
    body: buf,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed ${res.status}: ${text}`);
  }
  return path;
}

async function runCase(label, path, quantity) {
  console.log(`\n════════ ${label} ════════`);
  const cubeBuf = make20mmCubeStl();
  const ts = Date.now();
  const storagePath = `qa-probe/${ts}-cube-q${quantity}.stl`;

  // 1. Upload STL
  console.log(`Uploading to ${storagePath}…`);
  await uploadStl(cubeBuf, storagePath);
  console.log("Upload OK.");

  // 2. Compute price using same estimator as edge function
  const tri = stlToTriangles(cubeBuf);
  const analysis = analyzeTriangles(tri);
  const settings = { material: "PLA", infillPct: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" };
  const estimate = estimatePart(analysis, settings);
  const order = priceOrder([{ name: "cube.stl", quantity, material: "PLA", estimate }], "standard");
  const exactPrice = order.totalCents / 100;
  const autumnDiscountCents = computeAutumnDiscount(order.totalCents);

  console.log(`Local estimate: totalCents=${order.totalCents} (€${exactPrice.toFixed(2)}), instantEligible=${order.instantEligible}, reasons=${order.reasons.join(",")}`);
  console.log(`Autumn discount (client): ${autumnDiscountCents} cents`);

  if (!order.instantEligible) {
    console.error("ERROR: order not eligible for instant checkout:", order.reasons);
    process.exit(1);
  }

  // 3. Build V3 body
  const body = {
    pricingVersion: 3,
    urgency: "standard",
    fulfillment: "pickup",
    exactPrice,
    pieces: [{
      name: "cube.stl",
      quantity,
      path: storagePath,
      material: "PLA",
      infill: 15,
      wallLoops: 2,
      quality: "standard",
      supports: true,
      orientation: estimate.orientation,
      color: null,
      multicolour: false,
    }],
    filePaths: [storagePath],
    fileNames: ["cube.stl"],
    contactEmail: "qa-probe@dimension3dprints.com",
    contactPhone: null,
    language: "es",
    product_type: "stl_estimator",
    customer_ref: null,
  };

  // 4. POST to edge function (raw fetch, not supabase.functions.invoke)
  const fnUrl = `${SUPABASE_URL}/functions/v1/create-instant-checkout`;
  console.log(`POSTing to ${fnUrl}…`);
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const statusText = `HTTP ${res.status} ${res.statusText}`;
  let responseBody;
  try { responseBody = await res.json(); } catch { responseBody = await res.text(); }

  console.log(`\nStatus: ${statusText}`);
  console.log("Response body:", JSON.stringify(responseBody, null, 2));

  if (res.ok && responseBody?.checkoutUrl) {
    console.log(`\n✅  ${label} — 200 OK, checkoutUrl received`);
    console.log("(URL NOT opened — probe stops here as required)");
  } else {
    console.error(`\n❌  ${label} — FAILED (${statusText})`);
  }

  return { status: res.status, body: responseBody, ok: res.ok };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("Dimension3D live-checkout-probe");
  console.log(`Supabase: ${SUPABASE_URL}`);

  const r1 = await runCase("Case 1: qty 1 (no discount)", "qa-probe", 1);
  const r2 = await runCase("Case 2: qty 20 (above €20 threshold)", "qa-probe", 20);

  console.log("\n════════ SUMMARY ════════");
  console.log(`Case 1 (qty 1):  ${r1.status} — ${r1.ok ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Case 2 (qty 20): ${r2.status} — ${r2.ok ? "✅ PASS" : "❌ FAIL"}`);

  if (!r1.ok || !r2.ok) process.exit(1);
})();
