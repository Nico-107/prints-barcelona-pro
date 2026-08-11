import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { FileBox, X, MessageCircle, Loader2, RefreshCw, Calculator, Plus, Send, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { capture } from "@/lib/analytics";

const StlViewer = lazy(() => import("./StlViewer"));

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
const MAX_BYTES = 50 * 1024 * 1024;          // Supabase Free plan hard cap — upload limit
const MAX_ESTIMATE_BYTES = 250 * 1024 * 1024; // client-side parse limit only
const MAX_FILES = 10;

const SETUP_FEE = 8;        // once per job: file check, slicing, plate prep, packaging, comms
const RATE_PER_GRAM = 0.22; // material + machine time
const MIN_PRICE = 10;       // absolute floor
const RANGE_LOW_FLOOR = 10; // displayed range low never shown below this
const RANGE_HIGH_FLOOR = 20;// displayed range high never shown below this

const URGENCY_TIERS = [
  { key: "standard", multiplier: 1.0 },
  { key: "express",  multiplier: 1.25 },
  { key: "urgent",   multiplier: 1.6  },
] as const;

const INSTANT_BUY_SAFE = ["PLA", "PETG", "ABS", "TPU"] as const;
const INSTANT_BUY_MAX = 40;
const INSTANT_BUY_DISPLAY_CAP = 35;

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

function stripUploadPrefix(name: string): string {
  return name.replace(/^\d+-/, "");
}

// ─── STL parser ───────────────────────────────────────────────────────────────

interface StlParseResult {
  volumeMm3: number;
  hasHeavyOverhangs: boolean;
}

// Faces with downward normal angle > 45° from vertical need supports.
// nz < -cos(45°) ≈ -0.707 means the face points predominantly downward.
const OVERHANG_NZ_THRESHOLD = -Math.cos(Math.PI / 4);

function parseStl(buffer: ArrayBuffer): StlParseResult {
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
    let totalArea = 0;
    let overhangArea = 0;

    for (let i = 0; i < n; i++) {
      const base = 84 + i * 50;
      // Stored face normal
      const nz = dv.getFloat32(base + 8, true);

      const vb = base + 12;
      const x1 = dv.getFloat32(vb,      true), y1 = dv.getFloat32(vb + 4,  true), z1 = dv.getFloat32(vb + 8,  true);
      const x2 = dv.getFloat32(vb + 12, true), y2 = dv.getFloat32(vb + 16, true), z2 = dv.getFloat32(vb + 20, true);
      const x3 = dv.getFloat32(vb + 24, true), y3 = dv.getFloat32(vb + 28, true), z3 = dv.getFloat32(vb + 32, true);

      vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;

      // Triangle area via cross product of edge vectors
      const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
      const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
      const area = 0.5 * Math.sqrt(
        (ay * bz - az * by) ** 2 +
        (az * bx - ax * bz) ** 2 +
        (ax * by - ay * bx) ** 2,
      );
      totalArea += area;
      if (nz < OVERHANG_NZ_THRESHOLD) overhangArea += area;
    }

    return {
      volumeMm3: Math.abs(vol),
      hasHeavyOverhangs: totalArea > 0 && overhangArea / totalArea > 0.15,
    };
  }

  // ASCII STL
  const text = new TextDecoder().decode(new Uint8Array(buffer));
  const normalRe = /facet\s+normal\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const vertRe   = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;

  const normals: number[] = []; // nz values per triangle
  let fm: RegExpExecArray | null;
  while ((fm = normalRe.exec(text)) !== null) {
    normals.push(parseFloat(fm[3])); // nz is the third component
  }

  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(text)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  if (verts.length % 3 !== 0) throw new Error("Malformed ASCII STL");

  let vol = 0;
  let totalArea = 0;
  let overhangArea = 0;

  for (let i = 0; i < verts.length; i += 3) {
    const [x1, y1, z1] = verts[i], [x2, y2, z2] = verts[i + 1], [x3, y3, z3] = verts[i + 2];
    vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;

    const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
    const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
    const area = 0.5 * Math.sqrt(
      (ay * bz - az * by) ** 2 +
      (az * bx - ax * bz) ** 2 +
      (ax * by - ay * bx) ** 2,
    );
    totalArea += area;

    const triIdx = i / 3;
    if (triIdx < normals.length && normals[triIdx] < OVERHANG_NZ_THRESHOLD) {
      overhangArea += area;
    }
  }

  return {
    volumeMm3: Math.abs(vol),
    hasHeavyOverhangs: totalArea > 0 && overhangArea / totalArea > 0.15,
  };
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
  hasHeavyOverhangs?: boolean;
}

interface BundleEstimate {
  totalGrams: number;
  totalHours: number;
  totalUnits: number;
  bundlePrice: number;
  total: number;
  low: number;
  high: number;
  supportHeavy: boolean;
}

function applyMargin(rawPrice: number): number {
  return Math.max(rawPrice, MIN_PRICE);
}

function computeBundle(
  files: ParsedFile[],
  materialKey: string,
  infillPct: number,
  wallLoops: number,
  urgencyMultiplier: number = 1.0,
  multicolour: boolean = false,
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
  const bundleRaw = SETUP_FEE + totalGrams * RATE_PER_GRAM * mat.multiplier;
  const bundlePrice = applyMargin(bundleRaw) * urgencyMultiplier;
  const total = bundlePrice;

  const supportHeavy = files.some(f => !f.parseError && f.hasHeavyOverhangs);

  return {
    totalGrams, totalHours, totalUnits, bundlePrice, total,
    low:  Math.max(total * 0.85, RANGE_LOW_FLOOR),
    high: Math.max(total * 1.15, RANGE_HIGH_FLOOR),
    supportHeavy,
  };
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
  const [urgency, setUrgency] = useState<"standard" | "express" | "urgent">("standard");
  const [multicolour, setMulticolour] = useState(false);

  // Quote submission state
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [colorPref, setColorPref] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittedQuote, setIsSubmittedQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Mobile modal
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [viewerStateInModal, setViewerStateInModal] = useState<"loading" | "ready" | "failed">("loading");
  const [shortViewport, setShortViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-height: 700px)");
    const update = () => setShortViewport(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "slow" | "done" | "failed">("idle");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Instant checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [preUploadDone, setPreUploadDone] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<"success" | "cancelled" | null>(null);
  const [showManualReview, setShowManualReview] = useState(false);
  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping" | null>(null);
  const [fulfillmentAttempted, setFulfillmentAttempted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const estimateShownRef = useRef(false);
  const uploadedRef = useRef<{ paths: string[]; names: string[] } | null>(null);
  const modalShownRef = useRef(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mat = MATERIALS[materialKey];
  const wf = wallFactor(wallLoops);
  const effectiveFill = wf + (infillPct / 100) * (1 - wf);
  const urgencyMultiplier = URGENCY_TIERS.find(t => t.key === urgency)?.multiplier ?? 1.0;
  const validFiles = parsedFiles.filter(f => !f.parseError);
  const oversizedFiles = parsedFiles.filter(f => !f.parseError && f.sizeBytes > MAX_BYTES);
  const bundle = validFiles.length > 0 ? computeBundle(parsedFiles, materialKey, infillPct, wallLoops, urgencyMultiplier, multicolour) : null;

  const bundleExactPrice = bundle?.total ?? 0;
  const instantBuyEligible =
    !adminMode &&
    !multicolour &&
    (INSTANT_BUY_SAFE as readonly string[]).includes(materialKey) &&
    bundle !== null &&
    bundleExactPrice <= INSTANT_BUY_MAX;
  const instantDisplayPrice = instantBuyEligible
    ? (bundleExactPrice <= INSTANT_BUY_DISPLAY_CAP ? bundleExactPrice : INSTANT_BUY_DISPLAY_CAP)
    : null;

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

    // Reset per-estimate refs — new files mean a fresh estimate and upload
    uploadedRef.current = null;
    setPreUploadDone(false);

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
        const { volumeMm3, hasHeavyOverhangs } = parseStl(buf);
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3, qty: 1, file: f, hasHeavyOverhangs });
      } catch {
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
      }
    }

    const nextFiles = [...parsedFiles, ...results];
    setParsedFiles(nextFiles);
    setParsing(false);
    setParsingHasLargeFile(false);

    if (!adminMode) {
      const urgMult = URGENCY_TIERS.find(t => t.key === urgency)?.multiplier ?? 1.0;
      const nextBundle = computeBundle(nextFiles, materialKey, infillPct, wallLoops, urgMult, multicolour);
      if (nextBundle) {
        estimateShownRef.current = true;
        capture('estimate_generated', {
          material: materialKey,
          infill: infillPct,
          urgency,
          quantity: nextBundle.totalUnits,
          estimated_grams: Math.round(nextBundle.totalGrams),
          price_low: Math.round(nextBundle.low),
          price_high: Math.round(nextBundle.high),
          file_count: nextFiles.filter(f => !f.parseError).length,
          multicolour,
        });

        // Open confirmation modal once per estimate on all screen sizes
        if (!modalShownRef.current && !hasSubmitted) {
          modalShownRef.current = true;
          setMobileModalOpen(true);
          capture('estimate_modal_shown');
        }

        // Upload files early (fire-and-forget) so submission is near-instant
        const validForUpload = nextFiles.filter(f => !f.parseError && f.file && f.sizeBytes <= MAX_BYTES);
        const matObj = MATERIALS[materialKey];
        const wfVal = wallFactor(wallLoops);
        const effFill = wfVal + (infillPct / 100) * (1 - wfVal);
        const capturedInfill = infillPct;
        const capturedLang = language;
        const capturedWallLoops = wallLoops;
        const capturedUrgency = urgency;
        const capturedMulticolour = multicolour;

        (async () => {
          const uploadTimestamp = Date.now();
          const uploadedPaths: string[] = [];
          const uploadedNames: string[] = [];
          try {
            for (const f of validForUpload) {
              const sanitized = f.name.replace(/[^a-zA-Z0-9.-]/g, "_");
              const path = `${uploadTimestamp}-${sanitized}`;
              const { error: uploadErr } = await supabaseAnon.storage
                .from("print-requests")
                .upload(path, f.file!);
              if (!uploadErr) {
                uploadedPaths.push(path);
                uploadedNames.push(f.name);
              }
            }
            uploadedRef.current = { paths: uploadedPaths, names: uploadedNames };
            setPreUploadDone(true);
          } catch (e) {
            console.error("Pre-estimate upload failed:", e);
            setPreUploadDone(true);
            // uploadedRef stays null — submitQuote will run the fallback upload loop
          }

          // Insert price_estimates per valid file (with paths if upload succeeded)
          for (const f of nextFiles.filter(f2 => !f2.parseError)) {
            const volCm3 = f.volumeMm3 / 1000;
            const gr = volCm3 * matObj.density * effFill;
            const hrs = gr / 28;
            const unitPrice = Math.max(RATE_PER_GRAM * gr * matObj.multiplier, MIN_PRICE);
            supabaseAnon.from("price_estimates").insert({
              volume_cm3: volCm3,
              material: materialKey,
              infill_pct: capturedInfill,
              quantity: f.qty,
              grams: gr,
              est_hours: hrs,
              price_low: Math.max(unitPrice * 0.85, RANGE_LOW_FLOOR),
              price_high: Math.max(unitPrice * 1.15, RANGE_HIGH_FLOOR),
              file_name: f.name,
              file_paths: uploadedPaths,
              file_names: uploadedNames,
              language: capturedLang,
              multicolour: capturedMulticolour,
            }).then(({ error: dbErr }) => {
              if (dbErr) console.error("price_estimates insert error:", dbErr);
            });
            supabase.functions.invoke("send-price-estimate", {
              body: {
                fileName: f.name,
                material: materialKey,
                infillPct: capturedInfill,
                quantity: f.qty,
                volumeCm3: volCm3,
                grams: gr,
                estHours: hrs,
                priceLow: Math.max(unitPrice * 0.85, RANGE_LOW_FLOOR),
                priceHigh: Math.max(unitPrice * 1.15, RANGE_HIGH_FLOOR),
                filePaths: uploadedPaths,
                language: capturedLang,
              },
            }).catch(console.error);
          }
        })();
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
    uploadedRef.current = null;
    modalShownRef.current = false;
    if (slowTimerRef.current) { clearTimeout(slowTimerRef.current); slowTimerRef.current = null; }
    setUploadState("idle");
    setHasSubmitted(false);
    setParsedFiles([]);
    setError(null);
    setParsing(false);
    setContactEmail("");
    setContactPhone("");
    setColorPref("");
    setIsSubmittingQuote(false);
    setIsSubmittedQuote(false);
    setQuoteError(null);
    setMobileModalOpen(false);
    setPreUploadDone(false);
    setIsCheckingOut(false);
    setCheckoutError(null);
    setCheckoutResult(null);
    setShowManualReview(false);
    setFulfillment(null);
    setFulfillmentAttempted(false);
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'calculator' });
    const msg =
      language === "ca" ? "Hola, m'agradaria obtenir un pressupost exacte per als meus arxius 3D." :
      language === "es" ? "Hola, me gustaría obtener un presupuesto exacto para mis archivos 3D." :
      "Hi, I'd like to get an exact quote for my 3D prints.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Reset manual-review and fulfillment choices whenever eligibility drivers change
  useEffect(() => {
    setShowManualReview(false);
    setFulfillment(null);
    setFulfillmentAttempted(false);
  }, [materialKey, multicolour]);

  // Detect Stripe return URLs on page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const co = params.get("checkout");
    if (co === "success") {
      setCheckoutResult("success");
      capture('instant_checkout_completed');
    } else if (co === "cancelled") {
      setCheckoutResult("cancelled");
      capture('instant_checkout_cancelled');
    }
  }, []);

  const handleInstantBuy = async () => {
    if (fulfillment === null) {
      setFulfillmentAttempted(true);
      return;
    }
    if (!uploadedRef.current || instantDisplayPrice === null) {
      setCheckoutError("Files are still uploading. Please wait a moment and try again.");
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-instant-checkout", {
        body: {
          material: materialKey,
          color: colorPref.trim() || null,
          infill: infillPct,
          wallLoops,
          quantity: bundle!.totalUnits,
          filePaths: uploadedRef.current.paths,
          fileNames: uploadedRef.current.names,
          exactPrice: instantDisplayPrice,
          fulfillment,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          language,
        },
      });
      if (error || !data?.checkoutUrl) throw new Error(error?.message ?? "No checkout URL returned");
      capture('instant_checkout_initiated', { material: materialKey, exact_price: instantDisplayPrice, quantity: bundle!.totalUnits });
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setIsCheckingOut(false);
      setCheckoutError(err.message ?? "Checkout failed. Please request a review instead.");
    }
  };

  const submitQuote = async () => {
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setQuoteError(t("calc.contact.atLeastOne"));
      return;
    }
    setHasSubmitted(true);
    setQuoteError(null);
    setIsSubmittingQuote(true);

    try {
      const timestamp = Date.now();
      let uploadedPaths: string[];
      let uploadedNames: string[];

      if (uploadedRef.current) {
        // Fast path: files were already uploaded at estimate time
        uploadedPaths = uploadedRef.current.paths;
        uploadedNames = uploadedRef.current.names;
      } else {
        // Fallback: upload now (upload failed earlier or ref was reset) — show progress
        setUploadState("uploading");
        slowTimerRef.current = setTimeout(() => setUploadState("slow"), 5000);
        uploadedPaths = [];
        uploadedNames = [];
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
        if (slowTimerRef.current) { clearTimeout(slowTimerRef.current); slowTimerRef.current = null; }
        setUploadState("done");
      }

      // Upload succeeded — show success immediately, nothing below can block the user
      setIsSubmittedQuote(true);
      setIsSubmittingQuote(false);
      capture('quote_submitted', {
        has_email: !!contactEmail.trim(),
        has_phone: !!contactPhone.trim(),
        material: materialKey,
        urgency,
        file_count: validFiles.length,
        estimated_price_low: Math.round(bundle!.low),
        estimated_price_high: Math.round(bundle!.high),
        color: !!colorPref.trim(),
        multicolour,
      });
      estimateShownRef.current = false;

      // DB write — fresh insert with all contact details. Fire-and-forget.
      // Use anon client so an admin session in localStorage doesn't trigger a 42501 error.
      (async () => {
        const payload = {
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          color: colorPref.trim() || null,
          material: materialKey,
          infill: `${infillPct}%`,
          wall_loops: wallLoops,
          urgency,
          quantity: bundle!.totalUnits,
          estimated_grams: bundle!.totalGrams,
          estimated_hours: bundle!.totalHours,
          estimated_price_low: bundle!.low,
          estimated_price_high: bundle!.high,
          file_paths: uploadedPaths,
          file_names: uploadedNames,
          status: "pending",
          multicolour,
        };

        try {
          const { error: insertErr } = await supabaseAnon
            .from("quote_requests")
            .insert({ id: crypto.randomUUID(), ...payload } as any);
          if (insertErr) console.error("quote_requests insert failed:", insertErr);
          else console.log("quote_requests insert OK");
        } catch (e) {
          console.error("quote_requests insert threw:", e);
        }
      })();

      // Email — fire-and-forget
      supabase.functions.invoke("send-quote-request", {
        body: {
          filePaths: uploadedPaths,
          fileNames: uploadedNames,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          material: materialKey,
          color: colorPref.trim() || null,
          urgency,
          infillPct,
          wallLoops,
          totalGrams: bundle!.totalGrams,
          totalHours: bundle!.totalHours,
          totalUnits: bundle!.totalUnits,
          priceLow: bundle!.low,
          priceHigh: bundle!.high,
          language,
          multicolour,
        },
      }).catch(e => console.error("send-quote-request failed:", e));
    } catch (err: any) {
      if (slowTimerRef.current) { clearTimeout(slowTimerRef.current); slowTimerRef.current = null; }
      setUploadState("failed");
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

  // Price display — multicolour shows "from €X", instant-buy shows exact, normal shows "~€X–Y"
  const priceDisplay = bundle
    ? multicolour
      ? `${t("calc.multicolour.from")} €${bundle.low.toFixed(0)}+`
      : instantBuyEligible && instantDisplayPrice !== null
        ? `€${instantDisplayPrice.toFixed(2)}`
        : `~€${bundle.low.toFixed(0)}–${bundle.high.toFixed(0)}`
    : "";

  const firstViewableFile = validFiles.find(f => f.file);

  useEffect(() => {
    setViewerStateInModal("loading");
  }, [firstViewableFile?.id, shortViewport]);

  const specLine = bundle ? [
    materialKey,
    `${infillPct}% infill`,
    `${wallLoops} wall${wallLoops !== 1 ? "s" : ""}`,
    `${bundle.totalUnits} unit${bundle.totalUnits !== 1 ? "s" : ""}`,
    `${t(`calc.urgency.${urgency}.label`)} ${t(`calc.urgency.${urgency}.time`)}`,
    ...(multicolour ? [t("calc.multicolour.label")] : []),
  ].join(" · ") : "";

  // Shared contact form content — used in inline block
  const contactFormContent = (
    <div className="space-y-2">
      <input
        type="email"
        value={contactEmail}
        onChange={e => setContactEmail(e.target.value)}
        placeholder={t("calc.contact.email")}
        disabled={isSubmittingQuote || isCheckingOut}
        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
      />
      <input
        type="tel"
        value={contactPhone}
        onChange={e => setContactPhone(e.target.value)}
        placeholder={t("calc.contact.phone")}
        disabled={isSubmittingQuote || isCheckingOut}
        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
      />
      {quoteError && (
        <p className="text-xs text-destructive">{quoteError}</p>
      )}
      {checkoutError && instantBuyEligible && !showManualReview && (
        <p className="text-xs text-destructive">{checkoutError}</p>
      )}
      {oversizedFiles.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {t("calc.notice.tooLargeToUpload")}
        </p>
      )}
      {instantBuyEligible && !showManualReview ? (
        <>
          {/* Fulfillment choice — required before payment */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {t("calc.instantBuy.fulfillment.pickup")} / {t("calc.instantBuy.fulfillment.shipping")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["pickup", "shipping"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setFulfillment(opt); setFulfillmentAttempted(false); }}
                  disabled={isCheckingOut}
                  className={`h-10 rounded-md border text-sm font-medium transition-colors disabled:opacity-60 ${
                    fulfillment === opt
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-input bg-background text-foreground hover:border-accent/60 hover:bg-accent/5"
                  }`}
                >
                  {t(`calc.instantBuy.fulfillment.${opt}` as any)}
                </button>
              ))}
            </div>
            {fulfillmentAttempted && fulfillment === null && (
              <p className="text-xs text-destructive mt-1">{t("calc.instantBuy.fulfillment.required")}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="cta"
              size="lg"
              className="w-full gap-2"
              onClick={handleInstantBuy}
              disabled={isCheckingOut || !preUploadDone}
            >
              {isCheckingOut
                ? <><Loader2 className="w-4 h-4 animate-spin" />Paying…</>
                : <><CreditCard className="w-4 h-4" />Buy now — €{instantDisplayPrice?.toFixed(2)}</>
              }
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 text-xs"
              onClick={() => setShowManualReview(true)}
              disabled={isCheckingOut}
            >
              <Send className="w-4 h-4 shrink-0" />
              Get a review from our team instead
            </Button>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );

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
                        <p className="text-sm font-medium text-foreground truncate">{stripUploadPrefix(f.name)}</p>
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
                    {!f.parseError && f.file && (
                      <Suspense fallback={<div style={{ width: 240, height: 240, background: "#f0f0f0", borderRadius: 8, marginTop: 8 }} />}>
                        <StlViewer file={f.file} />
                      </Suspense>
                    )}
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
            className={`relative border-[3px] border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none ${
              isDragging ? "border-accent bg-accent/10" : "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/8"
            }`}
          >
            <Calculator className="w-12 h-12 text-accent mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground mb-1">{t("calc.drop")}</p>
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
            <label htmlFor="calc-material" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.material")}</label>
            <select
              id="calc-material"
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
            <label htmlFor="calc-infill" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.infill")}</label>
            <select
              id="calc-infill"
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
          <label htmlFor="calc-walls" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.walls")}</label>
          <select
            id="calc-walls"
            value={wallLoops}
            onChange={e => setWallLoops(Number(e.target.value))}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={2}>{t("calc.walls.2")}</option>
            <option value={3}>{t("calc.walls.3")}</option>
            <option value={4}>{t("calc.walls.4")}</option>
          </select>
        </div>

        {/* Urgency */}
        <div className="mt-2">
          <label htmlFor="calc-urgency" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.urgency.heading")}</label>
          <select
            id="calc-urgency"
            value={urgency}
            onChange={e => setUrgency(e.target.value as "standard" | "express" | "urgent")}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="standard">{t("calc.urgency.standard.label")} — {t("calc.urgency.standard.time")}</option>
            <option value="express">{t("calc.urgency.express.label")} +25% — {t("calc.urgency.express.time")}</option>
            <option value="urgent">{t("calc.urgency.urgent.label")} +60% — {t("calc.urgency.urgent.time")}</option>
          </select>
        </div>

        {/* Multicolour toggle */}
        <div className="mt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={multicolour}
              onChange={e => setMulticolour(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-accent"
            />
            <span className="text-xs font-medium text-muted-foreground">{t("calc.multicolour.label")}</span>
          </label>
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
                  {priceDisplay}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                {validFiles.length} file{validFiles.length !== 1 ? "s" : ""} · {bundle.totalUnits} unit{bundle.totalUnits !== 1 ? "s" : ""}
              </p>

              {!adminMode && (
                <>
                  <p className="text-xs text-muted-foreground/70 mt-3 italic">
                    {instantBuyEligible
                      ? "Instant confirmation — ready to print. No manual review needed for this price."
                      : t("calc.result.disclaimer")}
                  </p>
                  {bundle.supportHeavy && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                      {t("calc.overhang.note")}
                    </p>
                  )}
                  {multicolour && (
                    <p className="text-xs text-accent mt-2 bg-accent/8 border border-accent/25 rounded-lg px-3 py-2">
                      {t("calc.multicolour.note")}
                    </p>
                  )}
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
                <>
                  <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-5">
                    <p className="text-lg font-semibold text-foreground mb-1">{t("calc.contact.heading")}</p>
                    <p className="text-sm text-muted-foreground mb-3">{t("calc.contact.reassure")}</p>
                    {contactFormContent}
                    {hasSubmitted && uploadState !== "idle" && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs">
                        {(uploadState === "uploading" || uploadState === "slow") && (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">
                              {uploadState === "slow" ? t("calc.upload.status.slow") : t("calc.upload.status.uploading")}
                            </span>
                          </>
                        )}
                        {uploadState === "done" && (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-whatsapp shrink-0" />
                            <span className="text-muted-foreground">{t("calc.upload.status.done")}</span>
                          </>
                        )}
                        {uploadState === "failed" && (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-muted-foreground">{t("calc.upload.status.failed")}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal — opens immediately on estimate, all screen sizes, consumer only */}
      {!adminMode && bundle && (() => {
        const stepperFile = firstViewableFile;
        const stepperValue = stepperFile?.qty ?? 1;
        const extraFiles = validFiles.length - 1;
        const moreFilesLine = extraFiles > 0
          ? t("calc.modal.moreFiles").replace("{count}", String(extraFiles))
          : null;
        const viewerSize = shortViewport ? 180 : 240;

        return (
        <Dialog open={mobileModalOpen} onOpenChange={(open) => {
          if (!open && !isSubmittedQuote) capture('estimate_modal_dismissed');
          setMobileModalOpen(open);
          if (open) setViewerStateInModal("loading");
        }}>
          <DialogContent
            className={`sm:max-w-md max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden
              [&>button]:!h-11 [&>button]:!w-11 [&>button]:!top-2 [&>button]:!right-2
              [&>button]:!flex [&>button]:!items-center [&>button]:!justify-center
              [&>button]:!rounded-full [&>button>svg]:!h-5 [&>button>svg]:!w-5`}
          >
            {/* Header — subtitle stays here; title carries progress framing */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0 text-left">
              <DialogTitle className="text-lg font-bold text-foreground pr-12">
                {t("calc.modal.title")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{t("calc.modal.subtitle")}</p>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {/* Price at top — updates live from computeBundle */}
              <div>
                <p className="text-3xl font-bold text-accent">{priceDisplay}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{specLine}</p>
              </div>

              {/* STL viewer — centered, square, ~240px (180px on short viewports).
                  When the viewer errors, the whole viewer box is hidden so no empty frame appears. */}
              {stepperFile?.file && (
                <div className="flex flex-col items-center">
                  {viewerStateInModal !== "failed" && (
                    <>
                      <div
                        className="rounded-xl border border-border bg-muted/20 overflow-hidden"
                        style={{ width: viewerSize, height: viewerSize }}
                      >
                        <Suspense fallback={<div style={{ width: viewerSize, height: viewerSize }} className="bg-muted/20 animate-pulse" />}>
                          <StlViewer
                            key={`${stepperFile.id}-${viewerSize}`}
                            file={stepperFile.file}
                            size={viewerSize}
                            onReady={() => setViewerStateInModal("ready")}
                            onError={() => setViewerStateInModal("failed")}
                          />
                        </Suspense>
                      </div>
                      {viewerStateInModal === "ready" && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          {t("calc.modal.dragHint")}
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 text-center max-w-full truncate">
                    {stripUploadPrefix(stepperFile.name)}
                  </p>
                  {moreFilesLine && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 text-center">
                      {moreFilesLine}
                    </p>
                  )}
                </div>
              )}

              {bundle.supportHeavy && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  {t("calc.overhang.note")}
                </p>
              )}
              {multicolour && (
                <p className="text-xs text-accent bg-accent/8 border border-accent/25 rounded-lg px-3 py-2">
                  {t("calc.multicolour.note")}
                </p>
              )}

              {isSubmittedQuote ? (
                <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-4 text-center">
                  <CheckCircle className="w-7 h-7 text-whatsapp mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
                </div>
              ) : (
                <>
                  {/* Configuration controls — bound to the same state as inline form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-material" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.material")}</label>
                      <select
                        id="modal-material"
                        value={materialKey}
                        onChange={e => setMaterialKey(e.target.value)}
                        disabled={isSubmittingQuote}
                        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      >
                        {Object.entries(MATERIALS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-infill" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.infill")}</label>
                      <select
                        id="modal-infill"
                        value={infillPct}
                        onChange={e => setInfillPct(Number(e.target.value))}
                        disabled={isSubmittingQuote}
                        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      >
                        {INFILL_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{t(o.key)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-walls" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.walls")}</label>
                      <select
                        id="modal-walls"
                        value={wallLoops}
                        onChange={e => setWallLoops(Number(e.target.value))}
                        disabled={isSubmittingQuote}
                        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      >
                        <option value={2}>{t("calc.walls.2")}</option>
                        <option value={3}>{t("calc.walls.3")}</option>
                        <option value={4}>{t("calc.walls.4")}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-urgency" className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.urgency.heading")}</label>
                      <select
                        id="modal-urgency"
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as "standard" | "express" | "urgent")}
                        disabled={isSubmittingQuote}
                        className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      >
                        <option value="standard">{t("calc.urgency.standard.label")} — {t("calc.urgency.standard.time")}</option>
                        <option value="express">{t("calc.urgency.express.label")} +25% — {t("calc.urgency.express.time")}</option>
                        <option value="urgent">{t("calc.urgency.urgent.label")} +60% — {t("calc.urgency.urgent.time")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.qty")}</label>
                      <div className="flex items-center h-9 rounded-md border border-input bg-background overflow-hidden">
                        <button
                          type="button"
                          onClick={() => stepperFile && updateQty(stepperFile.id, stepperValue - 1)}
                          disabled={!stepperFile || stepperValue <= 1 || isSubmittingQuote}
                          className="w-9 h-full flex items-center justify-center text-lg text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-sm font-medium tabular-nums">{stepperValue}</span>
                        <button
                          type="button"
                          onClick={() => stepperFile && updateQty(stepperFile.id, stepperValue + 1)}
                          disabled={!stepperFile || isSubmittingQuote}
                          className="w-9 h-full flex items-center justify-center text-lg text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 h-9 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={multicolour}
                          onChange={e => setMulticolour(e.target.checked)}
                          disabled={isSubmittingQuote}
                          className="h-4 w-4 rounded border-input accent-accent"
                        />
                        <span className="text-xs font-medium text-muted-foreground">{t("calc.multicolour.label")}</span>
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("calc.color")}</label>
                      <input
                        type="text"
                        value={colorPref}
                        onChange={e => setColorPref(e.target.value)}
                        placeholder={t("calc.color.placeholder")}
                        disabled={isSubmittingQuote}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Contact inputs — buttons live in the sticky footer */}
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder={t("calc.contact.email")}
                      disabled={isSubmittingQuote}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder={t("calc.contact.phone")}
                      disabled={isSubmittingQuote}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    {quoteError && (
                      <p className="text-xs text-destructive">{quoteError}</p>
                    )}
                    {oversizedFiles.length > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                        {t("calc.notice.tooLargeToUpload")}
                      </p>
                    )}
                  </div>

                  {hasSubmitted && uploadState !== "idle" && (
                    <div className="flex items-center gap-1.5 text-xs">
                      {(uploadState === "uploading" || uploadState === "slow") && (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">
                            {uploadState === "slow" ? t("calc.upload.status.slow") : t("calc.upload.status.uploading")}
                          </span>
                        </>
                      )}
                      {uploadState === "done" && (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-whatsapp shrink-0" />
                          <span className="text-muted-foreground">{t("calc.upload.status.done")}</span>
                        </>
                      )}
                      {uploadState === "failed" && (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-muted-foreground">{t("calc.upload.status.failed")}</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sticky footer — primary CTA is always visible */}
            {!isSubmittedQuote && (
              <div className="shrink-0 border-t border-border bg-background px-6 py-4 space-y-2">
                {instantBuyEligible && !showManualReview ? (
                  <>
                    <p className="text-xs text-center text-muted-foreground italic">
                      Instant confirmation — ready to print. No manual review needed for this price.
                    </p>
                    {/* Fulfillment choice */}
                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["pickup", "shipping"] as const).map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setFulfillment(opt); setFulfillmentAttempted(false); }}
                            disabled={isCheckingOut}
                            className={`h-10 rounded-md border text-sm font-medium transition-colors disabled:opacity-60 ${
                              fulfillment === opt
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-input bg-background text-foreground hover:border-accent/60 hover:bg-accent/5"
                            }`}
                          >
                            {t(`calc.instantBuy.fulfillment.${opt}` as any)}
                          </button>
                        ))}
                      </div>
                      {fulfillmentAttempted && fulfillment === null && (
                        <p className="text-xs text-destructive mt-1 text-center">{t("calc.instantBuy.fulfillment.required")}</p>
                      )}
                    </div>
                    {checkoutError && (
                      <p className="text-xs text-center text-destructive">{checkoutError}</p>
                    )}
                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleInstantBuy}
                      disabled={isCheckingOut || !preUploadDone}
                    >
                      {isCheckingOut
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Paying…</>
                        : <><CreditCard className="w-4 h-4" />Buy now — €{instantDisplayPrice?.toFixed(2)}</>
                      }
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 text-xs"
                      onClick={() => setShowManualReview(true)}
                      disabled={isCheckingOut}
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      Get a review from our team instead
                    </Button>
                    <DialogClose className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                      <X className="w-4 h-4" />
                      {t("calc.modal.close")}
                    </DialogClose>
                  </>
                ) : (
                  <>
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
                    <p className="text-xs text-center text-muted-foreground">{t("calc.modal.trust")}</p>
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
                    <DialogClose className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                      <X className="w-4 h-4" />
                      {t("calc.modal.close")}
                    </DialogClose>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        );
      })()}
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
        {checkoutResult === "success" && (
          <div className="max-w-xl mx-auto mb-6 rounded-xl bg-whatsapp/10 border border-whatsapp/25 px-5 py-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-whatsapp shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Payment confirmed — your order is placed!</p>
              <p className="text-sm text-muted-foreground mt-0.5">We'll contact you with print updates. Thank you for your order.</p>
            </div>
          </div>
        )}
        {checkoutResult === "cancelled" && (
          <div className="max-w-xl mx-auto mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Checkout cancelled</p>
              <p className="text-sm text-muted-foreground mt-0.5">No charge was made. Upload your files again to retry or request a review.</p>
            </div>
          </div>
        )}
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
