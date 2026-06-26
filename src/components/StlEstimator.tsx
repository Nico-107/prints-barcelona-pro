import { useState, useCallback, useRef } from "react";
import { Upload, FileBox, X, MessageCircle, ArrowRight, Loader2, RefreshCw, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Material table ───────────────────────────────────────────────────────────
// density: g/cm³  |  multiplier: price factor relative to PLA baseline
const MATERIALS: Record<string, { label: string; density: number; multiplier: number }> = {
  PLA:       { label: "PLA",       density: 1.24, multiplier: 1.0 },
  PETG:      { label: "PETG",      density: 1.27, multiplier: 1.1 },
  HIPS:      { label: "HIPS",      density: 1.07, multiplier: 1.2 },
  ABS:       { label: "ABS",       density: 1.04, multiplier: 1.3 },
  ASA:       { label: "ASA",       density: 1.07, multiplier: 1.3 },
  TPU:       { label: "TPU",       density: 1.20, multiplier: 1.3 },
  Nylon:     { label: "Nylon",     density: 1.14, multiplier: 1.4 },
  PC:        { label: "PC",        density: 1.20, multiplier: 1.5 },
  PVA:       { label: "PVA",       density: 1.23, multiplier: 1.5 },
  "PLA-CF":  { label: "PLA-CF",   density: 1.30, multiplier: 1.6 },
  "PETG-CF": { label: "PETG-CF",  density: 1.30, multiplier: 1.6 },
  "Nylon-CF":{ label: "Nylon-CF", density: 1.20, multiplier: 1.6 },
};

const INFILL_OPTIONS = [
  { value: 15,  key: "calc.infill.15" },
  { value: 30,  key: "calc.infill.30" },
  { value: 50,  key: "calc.infill.50" },
  { value: 100, key: "calc.infill.100" },
];

// ─── STL parser ───────────────────────────────────────────────────────────────
// Reads a binary or ASCII STL from an ArrayBuffer and returns volume in mm³.
// Uses the signed-tetrahedron / divergence-theorem method: for each triangle
// with vertices V1,V2,V3, contribution = V1·(V2×V3)/6. Sum and take abs.
// This is correct for any closed, orientable mesh.
// Note: STL files produced by slicers/CAD tools conventionally use mm as the
// length unit, so the returned volume is in mm³. We convert to cm³ by /1000.

function parseStlVolume(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);

  // Detect ASCII vs binary:
  // Binary STL: at offset 80 stores triangle count N; total size = 84 + N*50.
  // If that matches, treat as binary. Otherwise fall back to ASCII.
  const isBinary = (() => {
    if (buffer.byteLength < 84) return false;
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true); // little-endian
    return buffer.byteLength === 84 + n * 50;
  })();

  if (isBinary) {
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true);
    let vol = 0;
    for (let i = 0; i < n; i++) {
      const base = 84 + i * 50 + 12; // skip 12-byte normal
      const x1 = dv.getFloat32(base,      true), y1 = dv.getFloat32(base + 4,  true), z1 = dv.getFloat32(base + 8,  true);
      const x2 = dv.getFloat32(base + 12, true), y2 = dv.getFloat32(base + 16, true), z2 = dv.getFloat32(base + 20, true);
      const x3 = dv.getFloat32(base + 24, true), y3 = dv.getFloat32(base + 28, true), z3 = dv.getFloat32(base + 32, true);
      // V1 · (V2 × V3) / 6
      vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;
    }
    return Math.abs(vol);
  }

  // ASCII STL
  const text = new TextDecoder().decode(bytes);
  const vertRe = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(text)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  if (verts.length % 3 !== 0) throw new Error("Malformed ASCII STL");
  let vol = 0;
  for (let i = 0; i < verts.length; i += 3) {
    const [x1, y1, z1] = verts[i], [x2, y2, z2] = verts[i + 1], [x3, y3, z3] = verts[i + 2];
    vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;
  }
  return Math.abs(vol);
}

// ─── Pricing engine ───────────────────────────────────────────────────────────
interface Estimate {
  grams: number;
  estHours: number;
  unitPrice: number;
  total: number;
  low: number;
  high: number;
  qtyDiscount: number;
}

function calcEstimate(volumeMm3: number, materialKey: string, infillPct: number, qty: number): Estimate {
  const mat = MATERIALS[materialKey];
  const volumeCm3 = volumeMm3 / 1000;

  // Effective fill fraction.
  // wall_factor = 0.20: ~3 perimeter lines + top/bottom floors as fraction of volume.
  // effective_fill = 0.20 + (infill_pct/100) × 0.80
  // → 15% infill: 0.32 | 30%: 0.44 | 50%: 0.60 | 100%: 1.00
  // (Old 0.30 wall factor overestimated grams by ~25% at low infill.)
  const effectiveFill = 0.20 + (infillPct / 100) * 0.80;
  const grams = volumeCm3 * mat.density * effectiveFill;

  // Print time: business data gives ~28 g/h average across job types
  const estHours = grams / 28;

  // Per-gram rate with mild power-law taper so large jobs aren't overpriced.
  // effective_rate = 0.08 × (100 / max(grams, 100))^0.20
  // At 100 g → €0.08/g | 500 g → €0.058/g | 1000 g → €0.050/g
  const effectiveRate = 0.08 * Math.pow(100 / Math.max(grams, 100), 0.20);
  const materialCost = grams * effectiveRate;
  const timeCost = estHours * 0.50;

  // Unit price: €10 is a FLOOR, not an additive base.
  // Compute cost from real material+time, apply material multiplier, then floor.
  const unitPrice = Math.max((materialCost + timeCost) * mat.multiplier, 10);

  // Quantity discount scaling with economies of scale
  const qtyDiscount =
    qty >= 100 ? 0.38 :
    qty >= 50  ? 0.30 :
    qty >= 25  ? 0.20 :
    qty >= 10  ? 0.10 : 0;
  const total = unitPrice * qty * (1 - qtyDiscount);

  // Range: −20% to +5% (wider low anchor for affordable feel)
  return { grams, estHours, unitPrice, total, low: total * 0.80, high: total * 1.05, qtyDiscount };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  /** When true, renders a compact card for the admin panel (no section wrapper, no hero text) */
  adminMode?: boolean;
}

export function StlEstimator({ adminMode = false }: Props) {
  const { t, language } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  const [materialKey, setMaterialKey] = useState("PLA");
  const [infillPct, setInfillPct] = useState(30);
  const [qty, setQty] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);

  // Re-run calculation whenever controls change (file already parsed)
  const volumeRef = useRef<number | null>(null);

  const runCalc = useCallback((vol: number, mat: string, infill: number, q: number) => {
    setEstimate(calcEstimate(vol, mat, infill, q));
  }, []);

  const processFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".stl")) {
      setError(t("calc.error.notStl"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(t("calc.error.size"));
      return;
    }
    setFile(f);
    setError(null);
    setEstimate(null);
    setParsing(true);
    try {
      const buf = await f.arrayBuffer();
      const vol = parseStlVolume(buf);
      volumeRef.current = vol;
      const est = calcEstimate(vol, materialKey, infillPct, qty);
      setEstimate(est);

      const volumeCm3 = vol / 1000;

      // Fire-and-forget DB logging
      supabase.from("price_estimates").insert({
        volume_cm3: volumeCm3,
        material: materialKey,
        infill_pct: infillPct,
        quantity: qty,
        grams: est.grams,
        est_hours: est.estHours,
        price_low: est.low,
        price_high: est.high,
        file_name: f.name,
        language,
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error("price_estimates insert error:", dbErr);
      });

      // Fire-and-forget email notification
      supabase.functions.invoke("send-price-estimate", {
        body: {
          fileName: f.name,
          material: materialKey,
          infillPct,
          quantity: qty,
          volumeCm3,
          grams: est.grams,
          estHours: est.estHours,
          priceLow: est.low,
          priceHigh: est.high,
          language,
        },
      }).catch((err) => console.error("send-price-estimate invoke error:", err));
    } catch {
      setError(t("calc.error.parse"));
    } finally {
      setParsing(false);
    }
  }, [materialKey, infillPct, qty, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const handleMaterial = (val: string) => {
    setMaterialKey(val);
    if (volumeRef.current !== null) runCalc(volumeRef.current, val, infillPct, qty);
  };
  const handleInfill = (val: number) => {
    setInfillPct(val);
    if (volumeRef.current !== null) runCalc(volumeRef.current, materialKey, val, qty);
  };
  const handleQty = (val: number) => {
    const q = Math.max(1, Math.min(999, val));
    setQty(q);
    if (volumeRef.current !== null) runCalc(volumeRef.current, materialKey, infillPct, q);
  };

  const reset = () => {
    setFile(null);
    setEstimate(null);
    setError(null);
    volumeRef.current = null;
    setParsing(false);
  };

  const handleWhatsApp = () => {
    const msg =
      language === "ca" ? "Hola, m'agradaria obtenir un pressupost exacte per a la meva peça 3D." :
      language === "es" ? "Hola, me gustaría obtener un presupuesto exacto para mi pieza 3D." :
      "Hi, I'd like to get an exact quote for my 3D print.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const controls = (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {/* Material */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.material")}</label>
        <select
          value={materialKey}
          onChange={(e) => handleMaterial(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(MATERIALS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Infill */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.infill")}</label>
        <select
          value={infillPct}
          onChange={(e) => handleInfill(Number(e.target.value))}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {INFILL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.key)}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.qty")}</label>
        <input
          type="number"
          min={1}
          max={999}
          value={qty}
          onChange={(e) => handleQty(Number(e.target.value))}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );

  const inner = (
    <div className={adminMode ? "" : "max-w-xl mx-auto"}>
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 card-shadow">

        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none ${
              isDragging
                ? "border-accent bg-accent/8"
                : "border-border hover:border-accent/60 hover:bg-accent/4"
            }`}
          >
            <Calculator className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">{t("calc.drop")}</p>
            <p className="text-sm text-muted-foreground">{t("calc.dropSub")}</p>
            <input
              ref={inputRef}
              type="file"
              accept=".stl"
              className="hidden"
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-accent/8 border border-accent/25 rounded-xl px-4 py-3">
            <FileBox className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={reset}
              className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Controls — always visible so user can set options before/after upload */}
        {controls}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-3">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Parsing spinner */}
        {parsing && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("calc.analysing")}
          </div>
        )}

        {/* Result */}
        {estimate && !parsing && (
          <div className="mt-6">
            <div className="rounded-2xl bg-accent/8 border border-accent/25 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">{t("calc.result.heading")}</p>

              {/* Price range — large and prominent */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-foreground">
                  ~€{estimate.low.toFixed(0)}–{estimate.high.toFixed(0)}
                </span>
                {qty > 1 && (
                  <span className="text-sm text-muted-foreground">
                    (€{estimate.unitPrice.toFixed(2)}/u)
                  </span>
                )}
              </div>

              {/* Detail line */}
              <p className="text-sm text-muted-foreground mb-1">
                {t("calc.result.detail")
                  .replace("{grams}", estimate.grams.toFixed(1))
                  .replace("{hours}", estimate.estHours.toFixed(1))}
              </p>
              {qty > 1 && (
                <p className="text-sm text-muted-foreground mb-1">
                  {t("calc.result.qty")
                    .replace("{qty}", String(qty))
                    .replace("{discount}", String(Math.round(estimate.qtyDiscount * 100)))}
                </p>
              )}

              {/* Disclaimer — consumer only */}
              {!adminMode && (
                <p className="text-xs text-muted-foreground/70 mt-3 italic">
                  {t("calc.result.disclaimer")}
                </p>
              )}

              {/* Admin internals — never shown to consumers */}
              {adminMode && (() => {
                const filamentCost = estimate.grams * qty * 0.015;
                const profit = estimate.total - filamentCost;
                return (
                  <div className="mt-4 border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">{t("calc.admin.weight")}</span>
                    <span className="font-medium">{estimate.grams.toFixed(1)} g</span>
                    <span className="text-muted-foreground">{t("calc.admin.hours")}</span>
                    <span className="font-medium">{estimate.estHours.toFixed(1)} h</span>
                    <span className="text-muted-foreground">{t("calc.admin.filamentCost")}</span>
                    <span className="font-medium">€{filamentCost.toFixed(2)}</span>
                    <span className="text-muted-foreground">{t("calc.admin.profit")}</span>
                    <span className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                      €{profit.toFixed(2)}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* CTAs */}
            {!adminMode && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button asChild variant="cta" size="lg" className="flex-1 gap-2">
                  <Link to="#quote" onClick={(e) => { e.preventDefault(); document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" }); }}>
                    {t("calc.result.cta")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="whatsapp-outline" size="lg" className="flex-1 gap-2" onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4" />
                  {t("calc.result.whatsapp")}
                </Button>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={reset}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              {t("calc.reset")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Admin mode: compact card, no section wrapper
  if (adminMode) {
    return (
      <div className="mb-6">
        <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent" />
          {t("calc.adminTitle")}
        </h2>
        {inner}
      </div>
    );
  }

  // Homepage mode: full section
  return (
    <section id="calculator" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t("calc.title")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("calc.subtitle")}</p>
        </div>
        {inner}
      </div>
    </section>
  );
}

export default StlEstimator;
