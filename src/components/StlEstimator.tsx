import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { X, Loader2, RefreshCw, Calculator, Plus, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { capture, identifyUser, get_distinct_id, get_session_id } from "@/lib/analytics";
import { getStoredUTM } from "@/lib/utm";
import { customerRef } from "@/lib/customerRef";
import { parseStl } from "@/lib/stlAnalysis";
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import { useExperiment } from "@/lib/useExperiment";
import { wasExposureFired, markExposureFired } from "@/lib/experiments";
import type { ParsedFile, PartSettings, PartDefaults, MaterialOption } from "@/lib/pricing";
import { MATERIALS, INSTANT_MATERIALS, effectivePartSettings, computeBundleV2, wallFactor } from "@/lib/pricing";
import { OrderPanel } from "./estimator/OrderPanel";
import { DefaultSettings } from "./estimator/DefaultSettings";

const StlViewer = lazy(() => import("./StlViewer"));

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
const MAX_BYTES = 50 * 1024 * 1024;          // Supabase Free plan hard cap — upload limit
const MAX_ESTIMATE_BYTES = 250 * 1024 * 1024; // client-side parse limit only
const MAX_FILES = 20;

const RATE_PER_GRAM = 0.22; // kept for price_estimates analytics
const MIN_PRICE = 10;
const RANGE_LOW_FLOOR = 10;
const RANGE_HIGH_FLOOR = 20;

const SHIPPING_SURCHARGE = 6;
const FAST_PICKUP_MATERIALS = ["PLA", "PETG", "TPU"] as const;

// Material UI labels — density/multiplier come from @/lib/pricing MATERIALS
const MATERIAL_UI: Record<string, { label: string; descriptorKey: string }> = {
  PLA:        { label: "PLA",       descriptorKey: "calc.mat.pla.desc"      },
  PETG:       { label: "PETG",      descriptorKey: "calc.mat.petg.desc"     },
  HIPS:       { label: "HIPS",      descriptorKey: "calc.mat.hips.desc"     },
  ABS:        { label: "ABS",       descriptorKey: "calc.mat.abs.desc"      },
  ASA:        { label: "ASA",       descriptorKey: "calc.mat.asa.desc"      },
  TPU:        { label: "TPU",       descriptorKey: "calc.mat.tpu.desc"      },
  Nylon:      { label: "Nylon",     descriptorKey: "calc.mat.nylon.desc"    },
  PC:         { label: "PC",        descriptorKey: "calc.mat.pc.desc"       },
  PVA:        { label: "PVA",       descriptorKey: "calc.mat.pva.desc"      },
  "PLA-CF":   { label: "PLA-CF",   descriptorKey: "calc.mat.pla-cf.desc"   },
  "PETG-CF":  { label: "PETG-CF",  descriptorKey: "calc.mat.petg-cf.desc"  },
  "Nylon-CF": { label: "Nylon-CF", descriptorKey: "calc.mat.nylon-cf.desc" },
};

const materialOptions: MaterialOption[] = Object.entries(MATERIAL_UI).map(
  ([key, { label, descriptorKey }]) => ({ key, label, descriptorKey })
);

function stripUploadPrefix(name: string): string {
  return name.replace(/^\d+-/, "");
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
  /** When true, the city offers local pickup — banner copy switches from shipping to pickup+shipping */
  refPickupAvailable?: boolean;
}

export function StlEstimator({ adminMode = false, highlighted = false, refCity, refDays, refPickupAvailable }: Props) {
  const { t, language } = useLanguage();
  const pickupCity = refCity ?? ACTIVE_CITY.cityName;

  const { version: calcVersion, active: calcActive, forced: calcForced, langOk: calcLangOk } = useExperiment("calc_title_r1");

  // Text depends only on language — same on server and first client render.
  const xpCalcText = (key: string): string =>
    ["es", "en", "ca"].includes(language) ? t(key) : t("calc.title");

  const fireCalcExposure = useCallback((pageType: string) => {
    if (!calcActive || !calcLangOk) return;
    if (wasExposureFired("calc_title_r1")) return;
    const slots = document.querySelectorAll('[data-xp-slot="calc_title_r1"]');
    const visible = Array.from(slots).filter(
      (el) => (el as HTMLElement).offsetParent !== null
    );
    let visible_ok = false;
    if (visible.length === 1 && visible[0].getAttribute("data-xp-v") === String(calcVersion)) {
      visible_ok = true;
    } else if (visible.length !== 1) {
      capture("experiment_error", {
        experiment: "calc_title_r1",
        reason: visible.length === 0 ? "no_visible_block" : "visible_mismatch",
        assigned: calcVersion,
        visible: visible.length,
      });
    }
    capture("experiment_exposure", {
      experiment: "calc_title_r1",
      version: calcVersion,
      language,
      page_type: pageType,
      forced: calcForced,
      visible_ok,
    });
    markExposureFired("calc_title_r1");
  }, [calcActive, calcLangOk, calcVersion, calcForced, language]);

  // Fire calculator_seen + calc_title experiment exposure when section is ≥50% visible
  useEffect(() => {
    if (adminMode) return;
    const section = document.getElementById("calculator");
    if (!section) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (fired) return;
        const entry = entries[0];
        if (entry.intersectionRatio >= 0.5) {
          fired = true;
          observer.disconnect();
          const pageType = window.location.pathname === "/" || window.location.pathname === "/ca" ? "home" : "page";
          capture("calculator_seen", { page_type: pageType });
          fireCalcExposure(pageType);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [adminMode, fireCalcExposure]);

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

  // Simple / Advanced mode — persisted to localStorage, defaults to Simple.
  // Must start false on server to avoid hydration mismatch; synced from localStorage in useEffect.
  const [advancedMode, setAdvancedModeRaw] = useState<boolean>(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("dim3d-calc-mode") === "advanced") setAdvancedModeRaw(true);
    } catch { /* unavailable */ }
  }, []);
  const setAdvancedMode = (val: boolean) => {
    try { localStorage.setItem("dim3d-calc-mode", val ? "advanced" : "simple"); } catch { /* unavailable */ }
    if (!val) {
      // Reset global defaults + clear per-part infill/walls/multicolour overrides (keep material/color)
      setInfillPct(15);
      setWallLoops(2);
      setUrgency("standard");
      setMulticolour(false);
      setParsedFiles(prev => prev.map(f => {
        if (!f.settings) return f;
        const { infill: _i, wallLoops: _w, multicolour: _m, ...rest } = f.settings;
        return { ...f, settings: Object.keys(rest).length > 0 ? rest : undefined };
      }));
    }
    setAdvancedModeRaw(val);
  };

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
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [exitIntentSubmitting, setExitIntentSubmitting] = useState(false);
  const [exitIntentSubmitted, setExitIntentSubmitted] = useState(false);
  const [exitIntentError, setExitIntentError] = useState<string | null>(null);
  const exitIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitIntentCloseReasonRef = useRef<"recovered" | "dismissed" | null>(null);

  useEffect(() => {
    if (showExitIntent) {
      capture("exit_intent_shown");
      setExitIntentSubmitted(false);
      setExitIntentError(null);
    }
  }, [showExitIntent]);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const estimateShownRef = useRef(false);
  const uploadedRef = useRef<{ paths: string[]; names: string[]; byId: Record<string, string> } | null>(null);
  const modalShownRef = useRef(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaults: PartDefaults = { material: materialKey, color: colorPref, infill: infillPct, wallLoops, multicolour };
  const validFiles = parsedFiles.filter(f => !f.parseError);
  const oversizedFiles = parsedFiles.filter(f => !f.parseError && f.sizeBytes > MAX_BYTES);
  const bundle = computeBundleV2(parsedFiles, defaults, urgency);

  const anyMulticolour = validFiles.some(f => effectivePartSettings(f, defaults).multicolour);
  const instantEligibleMaterials = validFiles.length > 0 && validFiles.every(
    f => (INSTANT_MATERIALS as readonly string[]).includes(effectivePartSettings(f, defaults).material)
  );
  const instantBuyEligible =
    !adminMode &&
    !anyMulticolour &&
    instantEligibleMaterials &&
    bundle !== null &&
    bundle.orderResult.eligible;
  const chargedPrice = bundle ? bundle.orderResult.chargedPrintCents / 100 : 0;
  const instantTotalPrice = instantBuyEligible
    ? chargedPrice + (fulfillment === "shipping" ? SHIPPING_SURCHARGE : 0)
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
        const fileExt = f.name.split(".").pop()?.toLowerCase() ?? "unknown";
        capture("file_upload_error", { reason: "not_stl", file_type: fileExt });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.notStl") });
        continue;
      }
      if (f.size > MAX_ESTIMATE_BYTES) {
        capture("file_upload_error", { reason: "size_exceeded", file_type: "stl" });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.size") });
        continue;
      }

      try {
        const buf = await f.arrayBuffer();
        const { volumeMm3, hasHeavyOverhangs } = parseStl(buf);
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3, qty: 1, file: f, hasHeavyOverhangs });
      } catch {
        capture("file_upload_error", { reason: "parse_error", file_type: "stl" });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
      }
    }

    const nextFiles = [...parsedFiles, ...results];
    setParsedFiles(nextFiles);
    setParsing(false);
    setParsingHasLargeFile(false);

    if (!adminMode) {
      const nextDefaults: PartDefaults = { material: materialKey, color: colorPref, infill: infillPct, wallLoops, multicolour };
      const nextBundle = computeBundleV2(nextFiles, nextDefaults, urgency);
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
        const matObj = MATERIALS[materialKey]; // MATERIALS from @/lib/pricing — has density/multiplier
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
          const uploadedById: Record<string, string> = {};
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
                uploadedById[f.id] = path;
              }
            }
            uploadedRef.current = { paths: uploadedPaths, names: uploadedNames, byId: uploadedById };
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
              if (dbErr) {
                console.error("price_estimates insert error:", dbErr);
                capture("submit_error", { stage: "estimate", table: "price_estimates", code: dbErr.code ?? "unknown" });
              }
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
                exactPrice: unitPrice,
                filePaths: uploadedPaths,
                language: capturedLang,
                sourceCity: refCity ?? null,
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
      }
    }
    estimateShownRef.current = false;
    modalShownRef.current = false;
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
    setSelectedFileIndex(0);
    setExpandedPartId(null);
    setPreUploadDone(false);
    setIsCheckingOut(false);
    setCheckoutError(null);
    setCheckoutResult(null);
    setShowManualReview(false);
    setFulfillment(null);
    setFulfillmentAttempted(false);
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'calculator', location: 'calculator', path: window.location.pathname });
    const msg =
      language === "ca" ? "Hola, m'agradaria obtenir un pressupost exacte per als meus arxius 3D." :
      language === "es" ? "Hola, me gustaría obtener un presupuesto exacto para mis archivos 3D." :
      "Hi, I'd like to get an exact quote for my 3D prints.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Per-part settings handlers
  const handlePartSettingsChange = (id: string, settings: PartSettings) => {
    setParsedFiles(prev => prev.map(f => f.id === id ? { ...f, settings } : f));
  };
  const handleResetPartSettings = (id: string) => {
    setParsedFiles(prev => prev.map(f => f.id === id ? { ...f, settings: undefined } : f));
  };
  const handleApplyToAll = (id: string) => {
    const src = parsedFiles.find(f => f.id === id);
    if (!src) return;
    const eff = effectivePartSettings(src, defaults);
    setMaterialKey(eff.material);
    setColorPref(eff.color);
    setInfillPct(eff.infill);
    setWallLoops(eff.wallLoops);
    setMulticolour(eff.multicolour);
    setParsedFiles(prev => prev.map(f => f.id !== id ? { ...f, settings: undefined } : f));
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
      // B5: read stash set at checkout initiation (survives Stripe redirect in same tab)
      let stash: Record<string, unknown> = {};
      try {
        const raw = sessionStorage.getItem("dim3d-checkout-ctx");
        if (raw) { stash = JSON.parse(raw); sessionStorage.removeItem("dim3d-checkout-ctx"); }
      } catch {}
      setCheckoutResult("success");
      capture('instant_checkout_completed', stash as {
        value?: number; shipping_fee?: number; currency?: string;
        fulfillment?: "pickup" | "shipping"; product_type?: string;
        part_slug?: string; file_count?: number; total_units?: number; material?: string;
      });
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
    if (!uploadedRef.current || instantTotalPrice === null) {
      setCheckoutError("Files are still uploading. Please wait a moment and try again.");
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const instantPieces = validFiles.map(f => {
        const eff = effectivePartSettings(f, defaults);
        return {
          name: f.name,
          quantity: f.qty,
          path: uploadedRef.current!.byId[f.id] ?? null,
          material: eff.material,
          infill: eff.infill,
          wallLoops: eff.wallLoops,
          color: eff.color || null,
          volumeMm3: f.volumeMm3,
        };
      });
      const uniqueMats = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];
      const checkoutRef = contactEmail.trim() ? await customerRef(contactEmail.trim()) : undefined;
      const storedUtm = getStoredUTM();
      const phId = get_distinct_id();
      const phSid = get_session_id();
      const shippingFee = fulfillment === "shipping" ? SHIPPING_SURCHARGE : 0;
      const { data, error } = await supabase.functions.invoke("create-instant-checkout", {
        body: {
          pricingVersion: 2,
          material: uniqueMats.length === 1 ? uniqueMats[0] : "MIXED",
          color: colorPref.trim() || null,
          infill: infillPct,
          wallLoops,
          quantity: bundle!.totalUnits,
          filePaths: uploadedRef.current.paths,
          fileNames: uploadedRef.current.names,
          exactPrice: bundle!.orderResult.chargedPrintCents / 100,
          fulfillment,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          language,
          pieces: instantPieces,
          ph_distinct_id: phId ?? null,
          ph_session_id: phSid ?? null,
          utm_source: storedUtm?.utm_source ?? null,
          utm_medium: storedUtm?.utm_medium ?? null,
          utm_content: storedUtm?.utm_content ?? null,
          utm_campaign: storedUtm?.utm_campaign ?? null,
          product_type: "stl_estimator",
          customer_ref: checkoutRef ?? null,
        },
      });
      if (error || !data?.checkoutUrl) throw new Error(error?.message ?? "No checkout URL returned");
      try {
        sessionStorage.setItem("dim3d-checkout-ctx", JSON.stringify({
          value: chargedPrice,
          shipping_fee: shippingFee,
          currency: "EUR",
          fulfillment,
          product_type: "stl_estimator",
          file_count: validFiles.length,
          total_units: bundle!.totalUnits,
          material: uniqueMats.length === 1 ? uniqueMats[0] : "MIXED",
        }));
      } catch {}
      capture('instant_checkout_initiated', {
        material: uniqueMats.length === 1 ? uniqueMats[0] : "MIXED",
        exact_price: chargedPrice,
        quantity: bundle!.totalUnits,
        customer_ref: checkoutRef,
        value: chargedPrice,
        shipping_fee: shippingFee,
        currency: "EUR",
        fulfillment,
        product_type: "stl_estimator",
        file_count: validFiles.length,
        total_units: bundle!.totalUnits,
        is_mixed: uniqueMats.length > 1,
        materials_count: uniqueMats.length,
      });
      if (checkoutRef) identifyUser(checkoutRef);
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
      let uploadedById: Record<string, string>;

      if (uploadedRef.current) {
        // Fast path: files were already uploaded at estimate time
        uploadedPaths = uploadedRef.current.paths;
        uploadedNames = uploadedRef.current.names;
        uploadedById = uploadedRef.current.byId;
      } else {
        // Fallback: upload now (upload failed earlier or ref was reset) — show progress
        setUploadState("uploading");
        slowTimerRef.current = setTimeout(() => setUploadState("slow"), 5000);
        uploadedPaths = [];
        uploadedNames = [];
        uploadedById = {};
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
          uploadedById[f.id] = path;
        }
        if (slowTimerRef.current) { clearTimeout(slowTimerRef.current); slowTimerRef.current = null; }
        setUploadState("done");
      }

      const pieces = validFiles.map(f => {
        const eff = effectivePartSettings(f, defaults);
        return {
          name: f.name,
          quantity: f.qty,
          path: uploadedById[f.id] ?? null,
          material: eff.material,
          infill: eff.infill,
          wallLoops: eff.wallLoops,
          color: eff.color || null,
          volumeMm3: f.volumeMm3,
        };
      });
      const uniqueMatsQ = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];

      // Upload succeeded — show success immediately, nothing below can block the user
      setIsSubmittedQuote(true);
      setShowManualReview(false);
      setIsSubmittingQuote(false);
      // A4: pseudonymous customer_ref; B4: stable quote_id for DB row + event join
      const ref = contactEmail.trim() ? await customerRef(contactEmail.trim()) : undefined;
      const quote_id = crypto.randomUUID();
      capture('quote_submitted', {
        has_email: !!contactEmail.trim(),
        has_phone: !!contactPhone.trim(),
        material: uniqueMatsQ.length === 1 ? uniqueMatsQ[0] : "MIXED",
        urgency,
        file_count: validFiles.length,
        estimated_price_low: Math.round(bundle!.low),
        estimated_price_high: Math.round(bundle!.high),
        color: !!colorPref.trim(),
        multicolour: anyMulticolour,
        customer_ref: ref,
        quote_id,
        value_estimate_mid: Math.round((bundle!.low + bundle!.high) / 2),
        currency: "EUR",
        piece_count: validFiles.length,
        total_units: bundle!.totalUnits,
        is_mixed: uniqueMatsQ.length > 1,
        materials_count: uniqueMatsQ.length,
        source_page: window.location.pathname,
      });
      if (ref) identifyUser(ref);
      estimateShownRef.current = false;

      // DB write — fresh insert with all contact details. Fire-and-forget.
      // Use anon client so an admin session in localStorage doesn't trigger a 42501 error.
      (async () => {
        const storedUtm = getStoredUTM();
        const payload = {
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          color: colorPref.trim() || null,
          material: uniqueMatsQ.length === 1 ? uniqueMatsQ[0] : "MIXED",
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
          multicolour: anyMulticolour,
          utm_source: storedUtm?.utm_source ?? null,
          utm_medium: storedUtm?.utm_medium ?? null,
          utm_content: storedUtm?.utm_content ?? null,
          pieces,
          pricingVersion: 2,
        };

        try {
          const { error: insertErr } = await supabaseAnon
            .from("quote_requests")
            .insert({ id: quote_id, ...payload } as any);
          if (insertErr) {
            console.error("quote_requests insert failed:", insertErr);
            capture("submit_error", { stage: "quote", table: "quote_requests", code: insertErr.code ?? "unknown" });
          } else console.log("quote_requests insert OK");
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
          material: uniqueMatsQ.length === 1 ? uniqueMatsQ[0] : "MIXED",
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
          multicolour: anyMulticolour,
          sourceCity: refCity ?? null,
          pieces,
          quote_id,
          ph_distinct_id: get_distinct_id() ?? null,
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

  const submitExitIntent = async () => {
    if (!contactEmail.trim() && !contactPhone.trim()) {
      setExitIntentError(t("calc.contact.atLeastOne"));
      return;
    }
    setExitIntentError(null);
    setExitIntentSubmitting(true);
    try {
      const timestamp = Date.now();
      let uploadedPaths: string[];
      let uploadedNames: string[];
      let uploadedById: Record<string, string>;
      if (uploadedRef.current) {
        uploadedPaths = uploadedRef.current.paths;
        uploadedNames = uploadedRef.current.names;
        uploadedById = uploadedRef.current.byId;
      } else {
        uploadedPaths = [];
        uploadedNames = [];
        uploadedById = {};
        for (const f of parsedFiles) {
          if (f.parseError || !f.file || f.sizeBytes > MAX_BYTES) continue;
          const sanitized = f.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const path = `${timestamp}-${sanitized}`;
          const { error: uploadErr } = await supabaseAnon.storage.from("print-requests").upload(path, f.file);
          if (uploadErr) throw new Error(uploadErr.message);
          uploadedPaths.push(path);
          uploadedNames.push(f.name);
          uploadedById[f.id] = path;
        }
      }
      const exitPieces = validFiles.map(f => {
        const eff = effectivePartSettings(f, defaults);
        return {
          name: f.name,
          quantity: f.qty,
          path: uploadedById[f.id] ?? null,
          material: eff.material,
          infill: eff.infill,
          wallLoops: eff.wallLoops,
          color: eff.color || null,
          volumeMm3: f.volumeMm3,
        };
      });
      const exitUniqueMats = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];
      const exitUtm = getStoredUTM();
      const { error: insertErr } = await supabaseAnon
        .from("quote_requests")
        .insert({
          id: crypto.randomUUID(),
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          color: colorPref.trim() || null,
          material: exitUniqueMats.length === 1 ? exitUniqueMats[0] : "MIXED",
          infill: `${infillPct}%`,
          wall_loops: wallLoops,
          urgency,
          quantity: bundle?.totalUnits ?? 1,
          estimated_grams: bundle?.totalGrams ?? 0,
          estimated_hours: bundle?.totalHours ?? 0,
          estimated_price_low: bundle?.low ?? 0,
          estimated_price_high: bundle?.high ?? 0,
          file_paths: uploadedPaths,
          file_names: uploadedNames,
          status: "pending",
          multicolour: anyMulticolour,
          utm_source: exitUtm?.utm_source ?? null,
          utm_medium: exitUtm?.utm_medium ?? null,
          utm_content: exitUtm?.utm_content ?? null,
          pieces: exitPieces,
          pricingVersion: 2,
        } as any);
      if (insertErr) {
        capture("submit_error", { stage: "exit_intent", table: "quote_requests", code: insertErr.code ?? "unknown" });
        throw new Error(insertErr.message);
      }
      supabase.functions.invoke("send-quote-request", {
        body: {
          filePaths: uploadedPaths,
          fileNames: uploadedNames,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          material: exitUniqueMats.length === 1 ? exitUniqueMats[0] : "MIXED",
          color: colorPref.trim() || null,
          urgency,
          infillPct,
          wallLoops,
          totalGrams: bundle?.totalGrams ?? 0,
          totalHours: bundle?.totalHours ?? 0,
          totalUnits: bundle?.totalUnits ?? 1,
          priceLow: bundle?.low ?? 0,
          priceHigh: bundle?.high ?? 0,
          language,
          multicolour: anyMulticolour,
          sourceCity: refCity ?? null,
          pieces: exitPieces,
        },
      }).catch(e => console.error("send-quote-request failed:", e));
      exitIntentCloseReasonRef.current = "recovered";
      capture("exit_intent_recovered");
      setExitIntentSubmitting(false);
      setExitIntentSubmitted(true);
      setTimeout(() => setShowExitIntent(false), 2000);
    } catch (err: any) {
      setExitIntentSubmitting(false);
      setExitIntentError(t("calc.contact.uploadError"));
      console.error("exit-intent submit error:", err);
    }
  };

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
  };

  // Price display — multicolour shows "from €X", instant-buy shows exact, normal shows "~€X–Y"
  const priceDisplay = bundle
    ? anyMulticolour
      ? `${t("calc.multicolour.from")} €${bundle.low.toFixed(0)}+`
      : instantBuyEligible && instantTotalPrice !== null
        ? `€${instantTotalPrice.toFixed(2)}`
        : `~€${bundle.low.toFixed(0)}–${bundle.high.toFixed(0)}`
    : "";

  const viewableFiles = validFiles.filter(f => !!f.file);

  useEffect(() => {
    if (selectedFileIndex >= viewableFiles.length && viewableFiles.length > 0) {
      setSelectedFileIndex(viewableFiles.length - 1);
    }
  }, [viewableFiles.length, selectedFileIndex]);

  useEffect(() => {
    if (showManualReview) {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showManualReview]);

  useEffect(() => {
    setViewerStateInModal("loading");
  }, [viewableFiles[selectedFileIndex]?.id, shortViewport]);

  const specLine = bundle ? [
    materialKey,
    `${infillPct}% infill`,
    `${wallLoops} wall${wallLoops !== 1 ? "s" : ""}`,
    `${bundle.totalUnits} unit${bundle.totalUnits !== 1 ? "s" : ""}`,
    `${t(`calc.urgency.${urgency}.label`)} ${t(`calc.urgency.${urgency}.time`)}`,
    ...(anyMulticolour ? [t("calc.multicolour.label")] : []),
  ].join(" · ") : "";

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

        {/* Drop zone / add-more */}
        {parsedFiles.length === 0 ? (
          <>
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
            <p className="text-center text-sm text-muted-foreground mt-2">
              {t("calc.dropzone.noFile")}{" "}
              <Link
                to={language === "ca" ? "/dissenya-la-teva-peca-3d" : language === "es" ? "/disena-tu-pieza-3d" : "/design-your-3d-part"}
                className="underline text-foreground hover:text-accent transition-colors"
              >
                {t("calc.dropzone.noFile.cta")}
              </Link>
            </p>
          </>
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

        {/* Default settings */}
        <div className="mt-4">
          <DefaultSettings
            materialKey={materialKey}
            colorPref={colorPref}
            infillPct={infillPct}
            wallLoops={wallLoops}
            multicolour={multicolour}
            urgency={urgency}
            advancedMode={advancedMode}
            disabled={isCheckingOut || isSubmittingQuote}
            t={t}
            materialOptions={materialOptions}
            onMaterialChange={setMaterialKey}
            onColorChange={setColorPref}
            onInfillChange={setInfillPct}
            onWallLoopsChange={setWallLoops}
            onMulticolourChange={setMulticolour}
            onUrgencyChange={setUrgency}
            onAdvancedModeChange={setAdvancedMode}
          />
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

              {validFiles.length > 1 && (
                <p className="text-sm font-semibold text-accent mb-1">
                  {t("calc.totalOrder")} ({validFiles.length} {language === "en" ? "parts" : language === "ca" ? "peces" : "piezas"})
                </p>
              )}

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-foreground">
                  {priceDisplay}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                {validFiles.length} {validFiles.length !== 1 ? (language === "en" ? "files" : language === "ca" ? "arxius" : "archivos") : (language === "en" ? "file" : language === "ca" ? "arxiu" : "archivo")} · {bundle.totalUnits} {bundle.totalUnits !== 1 ? (language === "en" ? "units" : language === "ca" ? "unitats" : "unidades") : (language === "en" ? "unit" : language === "ca" ? "unitat" : "unidad")}
              </p>

              {!adminMode && (
                <>
                  <p className="text-xs text-muted-foreground/70 mt-3 italic">
                    {instantBuyEligible
                      ? t("calc.instantBuy.confirmation")
                      : t("calc.result.disclaimer")}
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
                        {validFiles.map((f, i) => {
                          const gpu = bundle.orderResult.parts[i]?.gramsPerUnit ?? 0;
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

            {/* OrderPanel — consumer only */}
            {!adminMode && (
              isSubmittedQuote ? (
                <div className="mt-4 rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-5 text-center">
                  <CheckCircle className="w-8 h-8 text-whatsapp mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <OrderPanel
                    parsedFiles={parsedFiles}
                    validFiles={validFiles}
                    bundle={bundle}
                    defaults={defaults}
                    selectedFileIndex={selectedFileIndex}
                    expandedPartId={expandedPartId}
                    onSelectPart={setSelectedFileIndex}
                    onExpandPart={setExpandedPartId}
                    onQtyChange={updateQty}
                    onRemove={removeFile}
                    onPartSettingsChange={handlePartSettingsChange}
                    onResetPartSettings={handleResetPartSettings}
                    onApplyToAll={handleApplyToAll}
                    fulfillment={fulfillment}
                    fulfillmentAttempted={fulfillmentAttempted}
                    onFulfillmentChange={(v) => { setFulfillment(v); setFulfillmentAttempted(false); }}
                    pickupCity={pickupCity}
                    contactEmail={contactEmail}
                    contactPhone={contactPhone}
                    quoteError={quoteError}
                    checkoutError={checkoutError}
                    oversizedFiles={oversizedFiles}
                    onContactEmailChange={setContactEmail}
                    onContactPhoneChange={setContactPhone}
                    advancedMode={advancedMode}
                    instantBuyEligible={instantBuyEligible}
                    isCheckingOut={isCheckingOut}
                    preUploadDone={preUploadDone}
                    isSubmittingQuote={isSubmittingQuote}
                    showManualReview={showManualReview}
                    hasSubmitted={hasSubmitted}
                    uploadState={uploadState}
                    onInstantBuy={handleInstantBuy}
                    onManualReview={() => setShowManualReview(true)}
                    onSubmitQuote={submitQuote}
                    onWhatsApp={handleWhatsApp}
                    language={language}
                    t={t}
                    materialOptions={materialOptions}
                    adminMode={adminMode}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal — opens immediately on estimate, all screen sizes, consumer only */}
      {!adminMode && bundle && (() => {
        const stepperFile = viewableFiles[selectedFileIndex] ?? viewableFiles[0];
        const stepperValue = stepperFile?.qty ?? 1;
        const viewerSize = shortViewport ? 180 : 240;

        return (
        <Dialog open={mobileModalOpen} onOpenChange={(open) => {
          if (!open && !isSubmittedQuote) capture('estimate_modal_dismissed');
          if (!open && instantBuyEligible && checkoutResult !== "success" && !showManualReview) {
            if (exitIntentTimerRef.current) clearTimeout(exitIntentTimerRef.current);
            exitIntentTimerRef.current = setTimeout(() => setShowExitIntent(true), 500);
          }
          setMobileModalOpen(open);
          if (open) setViewerStateInModal("loading");
        }}>
          <DialogContent
            className={`sm:max-w-md lg:max-w-3xl max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden
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

            {/* Scrollable body — single column on mobile, two columns at lg */}
            <div
              ref={modalBodyRef}
              className="flex-1 overflow-y-auto min-h-0"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
              onDrop={(e) => { setIsDragging(false); handleDrop(e); }}
            >
              <div className={`flex flex-col ${stepperFile?.file ? "lg:grid lg:grid-cols-[5fr_6fr]" : ""}`}>

                {/* LEFT column at lg: STL viewer + file info.
                    On mobile this renders AFTER the right column (order-2), so price stays at top. */}
                {stepperFile?.file && (
                  <div className="order-2 lg:order-1 flex flex-col items-center px-6 pb-4 lg:py-4 lg:border-r lg:border-border gap-1">
                    {/* STL viewer — centered, square, ~240px (180px on short viewports).
                        When the viewer errors, the whole viewer box is hidden so no empty frame appears. */}
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
                          <p className="text-xs text-center text-muted-foreground mt-1">
                            {t("calc.modal.dragHint")}
                          </p>
                        )}
                      </>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-full truncate">
                      {stripUploadPrefix(stepperFile.name)}
                    </p>
                    {viewableFiles.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {viewableFiles.map((f, i) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFileIndex(i)}
                            className={`px-2 py-0.5 rounded-full text-xs border transition-colors max-w-[100px] truncate ${
                              i === selectedFileIndex
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-accent/60 hover:bg-accent/5"
                            }`}
                            title={stripUploadPrefix(f.name)}
                          >
                            {language === "es" ? `Pieza ${i + 1}` : language === "ca" ? `Peça ${i + 1}` : `Part ${i + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* RIGHT column at lg: price + config + contact.
                    On mobile this is order-1, so it renders first (price at top). */}
                <div className="order-1 lg:order-2 px-6 py-4 space-y-4">
                  {/* Price — updates live from computeBundle */}
                  <div>
                    {validFiles.length > 1 && (
                      <p className="text-sm font-semibold text-accent mb-0.5">
                        {t("calc.totalOrder")} ({validFiles.length} {language === "en" ? "parts" : language === "ca" ? "peces" : "piezas"})
                      </p>
                    )}
                    <p className="text-3xl font-bold text-accent">{priceDisplay}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{specLine}</p>
                  </div>

              {/* Add more files — hidden input + dashed drop zone, inside the dialog */}
              <input
                ref={modalInputRef}
                type="file"
                accept=".stl"
                multiple
                className="hidden"
                onChange={handleChange}
              />
              {!isSubmittedQuote && (
                parsedFiles.length < MAX_FILES ? (
                  <div
                    onClick={() => {
                      capture("estimate_add_more_click", { location: "modal" });
                      modalInputRef.current?.click();
                    }}
                    className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all select-none ${
                      isDragging ? "border-accent bg-accent/8" : "border-border/60 hover:border-accent/50 hover:bg-accent/4"
                    }`}
                  >
                    <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      {t("calc.addMore")} ({parsedFiles.length}/{MAX_FILES})
                    </span>
                  </div>
                ) : (
                  <div className="border border-border/40 rounded-xl p-3 text-center">
                    <span className="text-sm text-muted-foreground">{t("calc.maxFiles")}</span>
                  </div>
                )
              )}

              <DefaultSettings
                materialKey={materialKey}
                colorPref={colorPref}
                infillPct={infillPct}
                wallLoops={wallLoops}
                multicolour={multicolour}
                urgency={urgency}
                advancedMode={advancedMode}
                disabled={isCheckingOut || isSubmittingQuote}
                t={t}
                materialOptions={materialOptions}
                onMaterialChange={setMaterialKey}
                onColorChange={setColorPref}
                onInfillChange={setInfillPct}
                onWallLoopsChange={setWallLoops}
                onMulticolourChange={setMulticolour}
                onUrgencyChange={setUrgency}
                onAdvancedModeChange={setAdvancedMode}
              />

              {isSubmittedQuote ? (
                <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-4 text-center">
                  <CheckCircle className="w-7 h-7 text-whatsapp mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
                </div>
              ) : (
                <OrderPanel
                  parsedFiles={parsedFiles}
                  validFiles={validFiles}
                  bundle={bundle}
                  defaults={defaults}
                  selectedFileIndex={selectedFileIndex}
                  expandedPartId={expandedPartId}
                  onSelectPart={setSelectedFileIndex}
                  onExpandPart={setExpandedPartId}
                  onQtyChange={updateQty}
                  onRemove={removeFile}
                  onPartSettingsChange={handlePartSettingsChange}
                  onResetPartSettings={handleResetPartSettings}
                  onApplyToAll={handleApplyToAll}
                  fulfillment={fulfillment}
                  fulfillmentAttempted={fulfillmentAttempted}
                  onFulfillmentChange={(v) => { setFulfillment(v); setFulfillmentAttempted(false); }}
                  pickupCity={pickupCity}
                  contactEmail={contactEmail}
                  contactPhone={contactPhone}
                  quoteError={quoteError}
                  checkoutError={checkoutError}
                  oversizedFiles={oversizedFiles}
                  onContactEmailChange={setContactEmail}
                  onContactPhoneChange={setContactPhone}
                  advancedMode={advancedMode}
                  instantBuyEligible={instantBuyEligible}
                  isCheckingOut={isCheckingOut}
                  preUploadDone={preUploadDone}
                  isSubmittingQuote={isSubmittingQuote}
                  showManualReview={showManualReview}
                  hasSubmitted={hasSubmitted}
                  uploadState={uploadState}
                  onInstantBuy={handleInstantBuy}
                  onManualReview={() => setShowManualReview(true)}
                  onSubmitQuote={submitQuote}
                  onWhatsApp={handleWhatsApp}
                  language={language}
                  t={t}
                  materialOptions={materialOptions}
                  adminMode={adminMode}
                />
              )}
                </div>{/* end right col */}
              </div>{/* end grid container */}
            </div>{/* end scrollable body */}

            {/* Sticky footer — close only; actions live in the scrollable OrderPanel */}
            <div className="shrink-0 border-t border-border bg-background px-6 py-4">
              <DialogClose className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                <X className="w-4 h-4" />
                {t("calc.modal.close")}
              </DialogClose>
            </div>
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
          <p data-xp-slot="calc_title_r1" data-xp-v="1" className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {t("calc.title")}
          </p>
          <p data-xp-slot="calc_title_r1" data-xp-v="2" className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {xpCalcText("xp.calc.v2")}
          </p>
          <p data-xp-slot="calc_title_r1" data-xp-v="3" className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {xpCalcText("xp.calc.v3")}
          </p>
          <p data-xp-slot="calc_title_r1" data-xp-v="4" className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {xpCalcText("xp.calc.v4")}
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
              {refPickupAvailable
                ? language === "es"
                  ? `Recogida local en ${refCity} disponible, o envío a domicilio`
                  : language === "ca"
                  ? `Recollida local a ${refCity} disponible, o enviament a domicili`
                  : `Local pickup available in ${refCity}, or shipped to your door`
                : language === "es"
                ? `Enviando a ${refCity}${refDays ? ` — envío con seguimiento en ${refDays}` : ""}`
                : language === "ca"
                ? `Enviant a ${refCity}${refDays ? ` — enviament seguit en ${refDays}` : ""}`
                : `Delivering to ${refCity}${refDays ? ` — tracked shipping in ${refDays}` : ""}`}
            </p>
          </div>
        )}
        {inner}

        {/* Exit-intent dialog — shown 500ms after modal closes without a purchase */}
        <Dialog
          open={showExitIntent}
          onOpenChange={(open) => {
            if (!open && exitIntentCloseReasonRef.current === null) {
              capture("exit_intent_dismissed");
            }
            exitIntentCloseReasonRef.current = null;
            setShowExitIntent(open);
          }}
        >
          <DialogContent className="sm:max-w-sm p-8 gap-0 [&>button]:!hidden">
            {exitIntentSubmitted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                <p className="font-semibold text-foreground">{t("calc.exitIntent.success")}</p>
              </div>
            ) : (
              <>
                <DialogHeader className="mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <DialogTitle className="text-base font-bold text-destructive leading-snug">
                      {t("calc.exitIntent.headline")}
                    </DialogTitle>
                  </div>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-4">{t("calc.exitIntent.body")}</p>
                <div className="space-y-2 mb-4">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder={t("calc.exitIntent.email")}
                    disabled={exitIntentSubmitting}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder={t("calc.exitIntent.phone")}
                    disabled={exitIntentSubmitting}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  {exitIntentError && (
                    <p className="text-xs text-destructive">{exitIntentError}</p>
                  )}
                </div>
                <Button
                  variant="cta"
                  className="w-full gap-2"
                  onClick={submitExitIntent}
                  disabled={exitIntentSubmitting}
                >
                  {exitIntentSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</>
                    : <><Send className="w-4 h-4" />{t("calc.exitIntent.cta")}</>
                  }
                </Button>
                <button
                  type="button"
                  className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "dismissed";
                    capture("exit_intent_dismissed");
                    setShowExitIntent(false);
                  }}
                >
                  {t("calc.exitIntent.dismiss")}
                </button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

export default StlEstimator;
