import { useState, useRef } from "react";
import { FileBox, X, MessageCircle, ArrowRight, Loader2, RefreshCw, Calculator, Plus, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
const MAX_BYTES = 50 * 1024 * 1024;          // Supabase Free plan hard cap — upload limit
const MAX_ESTIMATE_BYTES = 250 * 1024 * 1024; // client-side parse limit only
const MAX_FILES = 10;

const GENERAL_MARGIN = 1.08;      // +8% across all quotes
const SMALL_PART_MARGIN = 1.15;   // +15% extra on cheap parts
const SMALL_PART_THRESHOLD = 12;  // apply extra margin when pre-floor price is <= this
const MIN_PRICE = 10;             // absolute floor

// ─── Material table ───────────────────────────────────────────────────────────
const MATERIALS: Record<string, { label: string; density: number; multiplier: number }> = {
  PLA:        { label: "PLA",       density: 1.24, multiplier: 1.0 },
  PETG:       { label: "PETG",      density: 1.27, multiplier: 1.1 },
  HIPS:       { label: "HIPS",      density: 1.07, multiplier: 1.2 },
  ABS:        { label: "ABS",       density: 1.04, multiplier: 1.3 },
  ASA:        { label: "ASA",       density: 1.07, multiplier: 1.3 },
  TPU:        { label: "TPU",       density: 1.20, multiplier: 1.3 },
  Nylon:      { label: "Nylon",     density: 1.14, multiplier: 1.4 },
  PC:         { label: "PC",        density: 1.20, multiplier: 1.5 },
  PVA:        { label: "PVA",       density: 1.23, multiplier: 1.5 },
  "PLA-CF":   { label: "PLA-CF",   density: 1.30, multiplier: 1.6 },
  "PETG-CF":  { label: "PETG-CF",  density: 1.30, multiplier: 1.6 },
  "Nylon-CF": { label: "Nylon-CF", density: 1.20, multiplier: 1.6 },
};

const INFILL_OPTIONS = [
  { value: 5,  key: "calc.infill.5" },
  { value: 15, key: "calc.infill.15" },
  { value: 30, key: "calc.infill.30" },
  { value: 50, key: "calc.infill.50" },
];

// wall factor per loop count — drives material estimate
function wallFactor(loops: number): number {
  return loops === 2 ? 0.14 : loops === 3 ? 0.20 : 0.27;
}

// ─── STL parser ───────────────────────────────────────────────────────────────
function parseStlVolume(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);

  const isBinary = (() => {
    if (buffer.byteLength < 84) return false;
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true);
    return buffer.byteLength === 84 + n * 50;
  })();

  if (isBinary) {
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true);
    let vol = 0;
    for (let i = 0; i < n; i++) {
      const base = 84 + i * 50 + 12;
      const x1 = dv.getFloat32(base,      true), y1 = dv.getFloat32(base + 4,  true), z1 = dv.getFloat32(base + 8,  true);
      const x2 = dv.getFloat32(base + 12, true), y2 = dv.getFloat32(base + 16, true), z2 = dv.getFloat32(base + 20, true);
      const x3 = dv.getFloat32(base + 24, true), y3 = dv.getFloat32(base + 28, true), z3 = dv.getFloat32(base + 32, true);
      vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;
    }
    return Math.abs(vol);
  }

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

// ─── Bundle pricing ───────────────────────────────────────────────────────────

interface ParsedFile {
  id: string;
  name: string;
  sizeBytes: number;
  volumeMm3: number;
  qty: number;
  file?: File;        // original File object for upload; undefined on parse error
  parseError?: string;
}

interface BundleEstimate {
  totalGrams: number;
  totalHours: number;
  totalUnits: number;
  bundlePrice: number;
  total: number;
  low: number;
  high: number;
  qtyDiscount: number;
}

function applyMargin(rawPrice: number): number {
  let price = rawPrice * GENERAL_MARGIN;
  if (price <= SMALL_PART_THRESHOLD) {
    price = price * SMALL_PART_MARGIN;
  }
  return Math.max(price, MIN_PRICE);
}

function computeBundle(
  files: ParsedFile[],
  materialKey: string,
  infillPct: number,
  wallLoops: number,
): BundleEstimate | null {
  const mat = MATERIALS[materialKey];
  const wf = wallFactor(wallLoops);
  const effectiveFill = wf + (infillPct / 100) * (1 - wf);

  let totalGrams = 0;
  let totalUnits = 0;
  for (const f of files) {
    if (f.parseError) continue;
    const gramsPerUnit = (f.volumeMm3 / 1000) * mat.density * effectiveFill;
    totalGrams += gramsPerUnit * f.qty;
    totalUnits += f.qty;
  }
  if (totalUnits === 0) return null;

  const totalHours = totalGrams / 28;
  const bundleRaw = (totalGrams * 0.10 + totalHours * 0.50) * mat.multiplier;
  const bundlePrice = applyMargin(bundleRaw);

  const qtyDiscount =
    totalUnits >= 50 ? 0.15 :
    totalUnits >= 25 ? 0.10 :
    totalUnits >= 10 ? 0.05 : 0;
  const total = bundlePrice * (1 - qtyDiscount);

  return { totalGrams, totalHours, totalUnits, bundlePrice, total, low: total * 0.85, high: total * 1.15, qtyDiscount };
}

// ─── Section heading — action-oriented copy per language ──────────────────────
const UPLOAD_HEADING: Record<string, { action: string; benefit: string }> = {
  en: { action: "Upload your files",            benefit: "get an instant price"        },
  es: { action: "Sube tus archivos",            benefit: "precio al instante"          },
  ca: { action: "Puja els teus arxius",         benefit: "preu a l'instant"            },
  fr: { action: "Déposez vos fichiers",         benefit: "obtenez un prix instantané"  },
  de: { action: "Dateien hochladen",            benefit: "Sofortpreis erhalten"        },
  nl: { action: "Bestanden uploaden",           benefit: "direct een prijs ontvangen"  },
  it: { action: "Carica i tuoi file",           benefit: "ottieni un prezzo istantaneo"},
  pt: { action: "Carregue os seus ficheiros",   benefit: "obtenha um preço instantâneo"},
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  adminMode?: boolean;
  /** When true, pulses an amber ring on the card for 1.5 s to guide new arrivals */
  highlighted?: boolean;
  /** City name from a delivery page ref, e.g. "Paris" */
  refCity?: string;
  /** Delivery time string from a delivery page ref, e.g. "3–4 business days" */
  refDays?: string;
}

export function StlEstimator({ adminMode = false, highlighted = false, refCity, refDays }: Props) {
  const { t, language } = useLanguage();

  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsingHasLargeFile, setParsingHasLargeFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialKey, setMaterialKey] = useState("PLA");
  const [infillPct, setInfillPct] = useState(15);
  const [wallLoops, setWallLoops] = useState(2);

  // Quote submission state
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [colorPref, setColorPref] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittedQuote, setIsSubmittedQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const estimateShownRef = useRef(false);

  const mat = MATERIALS[materialKey];
  const wf = wallFactor(wallLoops);
  const effectiveFill = wf + (infillPct / 100) * (1 - wf);
  const validFiles = parsedFiles.filter(f => !f.parseError);
  const oversizedFiles = parsedFiles.filter(f => !f.parseError && f.sizeBytes > MAX_BYTES);
  const bundle = validFiles.length > 0 ? computeBundle(parsedFiles, materialKey, infillPct, wallLoops) : null;

  const processFiles = async (newFiles: File[]) => {
    const remaining = MAX_FILES - parsedFiles.length;
    if (remaining <= 0) {
      setError(t("calc.error.maxFiles"));
      return;
    }

    const toProcess = newFiles.slice(0, remaining);
    const skippedCount = newFiles.length - toProcess.length;
    setError(skippedCount > 0
      ? t("calc.error.filesSkipped").replace("{n}", String(skippedCount))
      : null
    );

    setParsingHasLargeFile(toProcess.some(f => f.size > 80 * 1024 * 1024));
    setParsing(true);
    const results: ParsedFile[] = [];

    for (const f of toProcess) {
      const id = Math.random().toString(36).slice(2, 10);

      if (!f.name.toLowerCase().endsWith(".stl")) {
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.notStl") });
        continue;
      }
      if (f.size > MAX_ESTIMATE_BYTES) {
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.size") });
        continue;
      }

      try {
        const buf = await f.arrayBuffer();
        const vol = parseStlVolume(buf);
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: vol, qty: 1, file: f });

        // DB logging — per file (fire-and-forget)
        const volumeCm3 = vol / 1000;
        const grams = volumeCm3 * mat.density * effectiveFill;
        const estHours = grams / 28;
        const unitPrice = applyMargin((grams * 0.10 + estHours * 0.50) * mat.multiplier);
        supabaseAnon.from("price_estimates").insert({
          volume_cm3: volumeCm3,
          material: materialKey,
          infill_pct: infillPct,
          quantity: 1,
          grams,
          est_hours: estHours,
          price_low: unitPrice * 0.85,
          price_high: unitPrice * 1.15,
          file_name: f.name,
          language,
        }).then(({ error: dbErr }) => {
          if (dbErr) console.error("price_estimates insert error:", dbErr);
        });

      } catch {
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
      }
    }

    const nextFiles = [...parsedFiles, ...results];
    setParsedFiles(nextFiles);
    setParsing(false);
    setParsingHasLargeFile(false);

    if (!adminMode) {
      const nextBundle = computeBundle(nextFiles, materialKey, infillPct, wallLoops);
      if (nextBundle) {
        estimateShownRef.current = true;
        capture('estimate_generated', {
          material: materialKey,
          infill: infillPct,
          quantity: nextBundle.totalUnits,
          estimated_grams: Math.round(nextBundle.totalGrams),
          price_low: Math.round(nextBundle.low),
          price_high: Math.round(nextBundle.high),
          file_count: nextFiles.filter(f => !f.parseError).length,
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) processFiles(files);
    e.target.value = "";
  };

  const updateQty = (id: string, val: number) => {
    const q = Math.max(1, Math.min(999, val));
    setParsedFiles(prev => prev.map(f => f.id === id ? { ...f, qty: q } : f));
  };

  const removeFile = (id: string) => {
    if (bundle && estimateShownRef.current && !isSubmittedQuote && !adminMode) {
      const afterRemoval = parsedFiles.filter(f => f.id !== id && !f.parseError);
      if (afterRemoval.length === 0) {
        capture('estimate_abandoned', {
          price_low: Math.round(bundle.low),
          price_high: Math.round(bundle.high),
          material: materialKey,
        });
        estimateShownRef.current = false;
      }
    }
    setParsedFiles(prev => prev.filter(f => f.id !== id));
  };

  const reset = () => {
    if (bundle && estimateShownRef.current && !isSubmittedQuote && !adminMode) {
      capture('estimate_abandoned', {
        price_low: Math.round(bundle.low),
        price_high: Math.round(bundle.high),
        material: materialKey,
      });
    }
    estimateShownRef.current = false;
    setParsedFiles([]);
    setError(null);
    setParsing(false);
    setContactEmail("");
    setContactPhone("");
    setColorPref("");
    setIsSubmittingQuote(false);
    setIsSubmittedQuote(false);
    setQuoteError(null);
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'calculator' });
    const msg =
      language === "ca" ? "Hola, m'agradaria obtenir un pressupost exacte per als meus arxius 3D." :
      language === "es" ? "Hola, me gustaría obtener un presupuesto exacto para mis archivos 3D." :
      "Hi, I'd like to get an exact quote for my 3D prints.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitQuote = async () => {
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setQuoteError(t("calc.contact.atLeastOne"));
      return;
    }
    setQuoteError(null);
    setIsSubmittingQuote(true);

    try {
      const timestamp = Date.now();
      const uploadedPaths: string[] = [];
      const uploadedNames: string[] = [];

      for (const f of parsedFiles) {
        if (f.parseError || !f.file) continue;
        if (f.sizeBytes > MAX_BYTES) continue; // too large for Supabase storage — price shown, skip upload
        const sanitized = f.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${timestamp}-${sanitized}`;
        const { error: uploadErr } = await supabaseAnon.storage
          .from("print-requests")
          .upload(path, f.file);
        if (uploadErr) throw new Error(uploadErr.message);
        uploadedPaths.push(path);
        uploadedNames.push(f.name);
      }

      // Upload succeeded — show success immediately, nothing below can block the user
      setIsSubmittedQuote(true);
      setIsSubmittingQuote(false);
      capture('quote_submitted', {
        has_email: !!contactEmail.trim(),
        has_phone: !!contactPhone.trim(),
        material: materialKey,
        file_count: validFiles.length,
        estimated_price_low: Math.round(bundle!.low),
        estimated_price_high: Math.round(bundle!.high),
        color: !!colorPref.trim(),
      });
      estimateShownRef.current = false;

      // DB insert — use anon client so an admin session in localStorage
      // doesn't override the anon RLS policy and cause a 42501 error.
      supabaseAnon.from("quote_requests").insert({
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        material: materialKey,
        color: colorPref.trim() || null,
        infill: `${infillPct}%`,
        wall_loops: wallLoops,
        quantity: bundle!.totalUnits,
        estimated_grams: bundle!.totalGrams,
        estimated_hours: bundle!.totalHours,
        estimated_price_low: bundle!.low,
        estimated_price_high: bundle!.high,
        file_paths: uploadedPaths,
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error("quote_requests insert error:", dbErr.message, dbErr);
      }).catch(e => console.error("quote_requests insert threw:", e));

      // Email — fire-and-forget
      supabase.functions.invoke("send-quote-request", {
        body: {
          filePaths: uploadedPaths,
          fileNames: uploadedNames,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          material: materialKey,
          color: colorPref.trim() || null,
          infillPct,
          wallLoops,
          totalGrams: bundle!.totalGrams,
          totalHours: bundle!.totalHours,
          totalUnits: bundle!.totalUnits,
          priceLow: bundle!.low,
          priceHigh: bundle!.high,
          language,
        },
      }).catch(e => console.error("send-quote-request failed:", e));
    } catch (err: any) {
      setIsSubmittingQuote(false);
      setQuoteError(t("calc.contact.uploadError"));
      console.error("Quote upload error:", err);
    }
  };

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
  };

  const inner = (
    <div className={adminMode ? "" : "max-w-xl mx-auto"}>
      <div className={`bg-card rounded-2xl border p-6 md:p-8 card-shadow transition-all duration-300 ${
        highlighted
          ? "border-amber-400 ring-2 ring-amber-400 animate-pulse"
          : "border-border"
      }`}>

        <input
          ref={inputRef}
          type="file"
          accept=".stl"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        {/* File list */}
        {parsedFiles.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {parsedFiles.length}/{MAX_FILES} files
                </span>
                {parsedFiles.length >= 2 && (
                  <button
                    onClick={reset}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    · {language === "ca" ? "Netejar tot" : language === "es" ? "Limpiar todo" : "Clear all"}
                  </button>
                )}
              </div>
              <button
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> {t("calc.reset")}
              </button>
            </div>
            <div className="space-y-2">
              {parsedFiles.map(f => {
                const gramsPerUnit = !f.parseError ? (f.volumeMm3 / 1000) * mat.density * effectiveFill : 0;
                return (
                  <div
                    key={f.id}
                    className={`rounded-xl px-4 py-3 ${
                      f.parseError
                        ? "bg-destructive/8 border border-destructive/20"
                        : "bg-accent/8 border border-accent/25"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileBox className={`w-4 h-4 flex-shrink-0 ${f.parseError ? "text-destructive" : "text-accent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        {f.parseError ? (
                          <p className="text-xs text-destructive">{f.parseError}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB
                            {adminMode && gramsPerUnit > 0 && ` · ${gramsPerUnit.toFixed(1)} g/unit`}
                          </p>
                        )}
                      </div>
                      {!f.parseError && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="text-xs text-muted-foreground">{t("calc.qty")}</label>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={f.qty}
                            onChange={e => updateQty(f.id, Number(e.target.value))}
                            className="w-14 h-7 rounded border border-input bg-background px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="p-1 rounded-full hover:bg-destructive/10 transition-colors shrink-0"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Drop zone */}
        {parsedFiles.length === 0 ? (
          <div
            {...dragHandlers}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none ${
              isDragging ? "border-accent bg-accent/8" : "border-border hover:border-accent/60 hover:bg-accent/4"
            }`}
          >
            <Calculator className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">{t("calc.drop")}</p>
            <p className="text-sm text-muted-foreground">{t("calc.dropSub")}</p>
          </div>
        ) : parsedFiles.length < MAX_FILES ? (
          <div
            {...dragHandlers}
            onClick={() => inputRef.current?.click()}
            className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all select-none mb-4 ${
              isDragging ? "border-accent bg-accent/8" : "border-border/60 hover:border-accent/50 hover:bg-accent/4"
            }`}
          >
            <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" />
              {t("calc.addMore")} ({parsedFiles.length}/{MAX_FILES})
            </span>
          </div>
        ) : (
          <div className="border border-border/40 rounded-xl p-3 text-center mb-4">
            <span className="text-sm text-muted-foreground">{t("calc.maxFiles")}</span>
          </div>
        )}

        {/* Controls: material + infill */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.material")}</label>
            <select
              value={materialKey}
              onChange={e => setMaterialKey(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(MATERIALS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.infill")}</label>
            <select
              value={infillPct}
              onChange={e => setInfillPct(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {INFILL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{t(o.key)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Color preference */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.color")}</label>
          <input
            type="text"
            value={colorPref}
            onChange={e => setColorPref(e.target.value)}
            placeholder={t("calc.color.placeholder")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Wall loops */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.walls")}</label>
          <select
            value={wallLoops}
            onChange={e => setWallLoops(Number(e.target.value))}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={2}>{t("calc.walls.2")}</option>
            <option value={3}>{t("calc.walls.3")}</option>
            <option value={4}>{t("calc.walls.4")}</option>
          </select>
        </div>

        {/* Top-level error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-3">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Parsing spinner */}
        {parsing && (
          <div className="mt-6 flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("calc.analysing")}
            </div>
            {parsingHasLargeFile && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                {t("calc.notice.largeFile")}
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {bundle && !parsing && (
          <div className="mt-6">
            <div className="rounded-2xl bg-accent/8 border border-accent/25 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
                {t("calc.result.heading")}
              </p>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-foreground">
                  ~€{bundle.low.toFixed(0)}–{bundle.high.toFixed(0)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                {validFiles.length} file{validFiles.length !== 1 ? "s" : ""} · {bundle.totalUnits} unit{bundle.totalUnits !== 1 ? "s" : ""}
                {bundle.qtyDiscount > 0 && (
                  <> · <span className="text-accent font-medium">
                    {t("calc.result.qty").replace("{discount}", String(Math.round(bundle.qtyDiscount * 100)))}
                  </span></>
                )}
              </p>

              {!adminMode && (
                <>
                  <p className="text-xs text-muted-foreground/70 mt-3 italic">
                    {t("calc.result.disclaimer")}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    ¿Eres estudiante? Menciona tu universidad al confirmar tu presupuesto y obtén un 20% de descuento.
                  </p>
                </>
              )}

              {adminMode && (() => {
                const filamentCost = bundle.totalGrams * 0.015;
                const profit = bundle.total - filamentCost;
                return (
                  <>
                    {validFiles.length > 1 && (
                      <div className="mt-3 mb-3 space-y-0.5 border-t border-border pt-3">
                        {validFiles.map(f => {
                          const gpu = (f.volumeMm3 / 1000) * mat.density * effectiveFill;
                          return (
                            <div key={f.id} className="flex justify-between text-xs text-muted-foreground">
                              <span className="truncate max-w-[60%]">{f.name}</span>
                              <span>{gpu.toFixed(1)} g/u × {f.qty} = {(gpu * f.qty).toFixed(1)} g</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-3 border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">{t("calc.admin.weight")}</span>
                      <span className="font-medium">{bundle.totalGrams.toFixed(1)} g</span>
                      <span className="text-muted-foreground">{t("calc.admin.hours")}</span>
                      <span className="font-medium">{bundle.totalHours.toFixed(1)} h</span>
                      <span className="text-muted-foreground">{t("calc.admin.filamentCost")}</span>
                      <span className="font-medium">€{filamentCost.toFixed(2)}</span>
                      <span className="text-muted-foreground">{t("calc.admin.profit")}</span>
                      <span className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Quote submission form — consumer only */}
            {!adminMode && (
              isSubmittedQuote ? (
                <div className="mt-4 rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-5 text-center">
                  <CheckCircle className="w-8 h-8 text-whatsapp mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">{t("calc.contact.heading")}</p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder={t("calc.contact.email")}
                      disabled={isSubmittingQuote}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder={t("calc.contact.phone")}
                      disabled={isSubmittingQuote}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    {quoteError && (
                      <p className="text-xs text-destructive">{quoteError}</p>
                    )}
                    {oversizedFiles.length > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                        {t("calc.notice.tooLargeToUpload")}
                      </p>
                    )}
                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full gap-2"
                      onClick={submitQuote}
                      disabled={isSubmittingQuote}
                    >
                      {isSubmittingQuote
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</>
                        : <><Send className="w-4 h-4" />{t("calc.contact.submit")}</>
                      }
                    </Button>
                    <Button
                      variant="whatsapp-outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={handleWhatsApp}
                      disabled={isSubmittingQuote}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("calc.result.whatsapp")}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );

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

  return (
    <section id="calculator" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {t("calc.title")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {(UPLOAD_HEADING[language] ?? UPLOAD_HEADING.en).action}
            {" "}<span className="text-accent">— {(UPLOAD_HEADING[language] ?? UPLOAD_HEADING.en).benefit}</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("calc.subtitle")}</p>
        </div>
        {refCity && (
          <div className="max-w-xl mx-auto mb-6">
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 text-center">
              {language === "es"
                ? `Enviando a ${refCity}${refDays ? ` — envío con seguimiento en ${refDays}` : ""}`
                : language === "ca"
                ? `Enviant a ${refCity}${refDays ? ` — enviament seguit en ${refDays}` : ""}`
                : `Delivering to ${refCity}${refDays ? ` — tracked shipping in ${refDays}` : ""}`}
            </p>
          </div>
        )}
        {inner}
      </div>
    </section>
  );
}

export default StlEstimator;
