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
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import { useExperiment } from "@/lib/useExperiment";
import { wasExposureFired, markExposureFired } from "@/lib/experiments";
import type { ParsedFile, PartSettings, PartDefaults, MaterialOption } from "@/lib/pricing";
import { effectivePartSettings } from "@/lib/pricing";
import type { Scope } from "./estimator/PartScopeBar";
import { computeBundleV3 } from "@/lib/estimate";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST, analyzeTriangles, stlToTriangles } from "@/lib/estimator/core";
import type { QualityKey } from "@/lib/estimator/core";
import { CHECKOUT_V3_READY, instantBuyAllowed } from "@/lib/instantBuy";
import { buildCheckoutBody } from "@/lib/checkoutBody";
import { summarizeParts } from "@/lib/summarizeParts";
import type { TablesInsert, Json } from "@/integrations/supabase/types";
import { checkContact, isValidEmail } from "@/lib/contactValidation";
import type { UseCase } from "@/lib/materialGuide";
import { OrderPanel } from "./estimator/OrderPanel";
import { DefaultSettings } from "./estimator/DefaultSettings";
import { CheckoutDialog } from "./estimator/CheckoutDialog";
import { CheckoutConfigurator } from "./estimator/CheckoutConfigurator";
import { PartSummaryList } from "./estimator/PartSummaryList";

const StlViewer = lazy(() => import("./StlViewer"));

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
const MAX_BYTES = 50 * 1024 * 1024;          // Supabase Free plan hard cap — upload limit
const MAX_ESTIMATE_BYTES = 250 * 1024 * 1024; // client-side parse limit only
const MAX_FILES = 20;

const V3_VERIFY_MAX_BYTES = 30 * 1024 * 1024;
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
  // Advanced-only global defaults
  const [quality, setQuality] = useState<QualityKey>("standard");
  const [supports, setSupports] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<'auto' | number>("auto");
  // Notes textarea (Simple + Advanced)
  const [notesText, setNotesText] = useState("");
  // "What is it for?" chips
  const [activeUseCase, setActiveUseCase] = useState<UseCase | null>(null);
  // Contact validation: touched flag triggers red-border display in ContactFields
  const [contactTouched, setContactTouched] = useState(false);

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
      // Reset global defaults + clear per-part advanced overrides (keep material/color)
      setInfillPct(15);
      setWallLoops(2);
      setUrgency("standard");
      setMulticolour(false);
      setQuality("standard");
      setSupports(true);
      setOrientation("auto");
      setParsedFiles(prev => prev.map(f => {
        if (!f.settings) return f;
        const { infill: _i, wallLoops: _w, multicolour: _m, quality: _q, supports: _s, orientation: _o, ...rest } = f.settings;
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
  const [scope, setScope] = useState<Scope>("all");
  const [replacedCount, setReplacedCount] = useState<number | null>(null);
  const replacedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const defaults: PartDefaults = { material: materialKey, color: colorPref, infill: infillPct, wallLoops, multicolour, quality, supports, orientation };
  const validFiles = parsedFiles.filter(f => !f.parseError);
  const costByFileId: Record<string, number> = {};
  const bundle: BundleEstimateV3 | null = computeBundleV3(parsedFiles, defaults, urgency);
  if (bundle) {
    validFiles.forEach((f, i) => { costByFileId[f.id] = bundle.orderResult.parts[i]?.costCents ?? 0; });
  }
  const oversizedFiles = parsedFiles.filter(f => !f.parseError && f.sizeBytes > MAX_BYTES);

  const anyMulticolour = validFiles.some(f => effectivePartSettings(f, defaults).multicolour);
  const filesWithinVerifyLimit = validFiles.every(f => f.sizeBytes <= V3_VERIFY_MAX_BYTES) &&
    validFiles.reduce((s, f) => s + f.sizeBytes, 0) <= 60 * 1024 * 1024;
  const instantBuyEligible = instantBuyAllowed({
    adminMode,
    anyMulticolour,
    eligible: bundle?.orderResult.eligible ?? false,
    filesWithinVerifyLimit,
    flagReady: CHECKOUT_V3_READY,
  });
  const chargedPrice = bundle ? bundle.orderResult.chargedPrintCents / 100 : 0;
  const instantTotalPrice = instantBuyEligible
    ? chargedPrice + (fulfillment === "shipping" ? EST.shippingCents / 100 : 0)
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
        const analysis = analyzeTriangles(stlToTriangles(buf));
        const volumeMm3 = analysis.volumeMm3;
        if (analysis.triangles === 0 || volumeMm3 === 0) {
          capture("file_upload_error", { reason: "parse_error", file_type: "stl" });
          results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
        } else {
          results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3, qty: 1, file: f, analysis });
        }
      } catch {
        capture("file_upload_error", { reason: "parse_error", file_type: "stl" });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
      }
      await new Promise(r => setTimeout(r, 0));
    }

    const nextFiles = [...parsedFiles, ...results];
    setParsedFiles(nextFiles);
    setParsing(false);
    setParsingHasLargeFile(false);

    if (!adminMode) {
      const nextDefaults: PartDefaults = { material: materialKey, color: colorPref, infill: infillPct, wallLoops, multicolour, quality: "standard", supports: true, orientation: "auto" };
      const nextBundle = computeBundleV3(nextFiles, nextDefaults, urgency);
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
          pricing_version: 3,
          estimated_hours: nextBundle.totalHours,
          support_cm3: nextBundle.estimates.reduce((s, e) => s + e.supportCm3, 0),
          orientation_saving_eur: nextBundle.savedByOrientationEur,
        });

        // Open confirmation modal once per estimate on all screen sizes
        if (!modalShownRef.current && !hasSubmitted) {
          modalShownRef.current = true;
          setMobileModalOpen(true);
          capture('estimate_modal_shown');
        }

        // Upload files early (fire-and-forget) so submission is near-instant
        const validForUpload = nextFiles.filter(f => !f.parseError && f.file && f.sizeBytes <= MAX_BYTES);
        const capturedLang = language;
        const capturedMulticolour = multicolour;
        const capturedDefaults: PartDefaults = { ...nextDefaults };

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
          for (const f of nextFiles.filter(f2 => !f2.parseError && f2.analysis)) {
            const eff = effectivePartSettings(f, capturedDefaults);
            const { estimatePart: ep, priceOrder: po } = await import("@/lib/estimator/core");
            const estimate = ep(f.analysis!, {
              material: eff.material, infillPct: eff.infill, wallLoops: eff.wallLoops,
              quality: eff.quality, supports: eff.supports, orientation: eff.orientation,
            });
            const singleOrder = po([{ name: f.name, quantity: f.qty, material: eff.material, estimate }], "standard");
            const exactPrice = singleOrder.totalCents / 100;
            const gr = estimate.grams;
            const hrs = estimate.timeSec / 3600;
            const estimateRow: TablesInsert<"price_estimates"> = {
              volume_cm3: f.volumeMm3 / 1000,
              material: eff.material,
              infill_pct: eff.infill,
              quantity: f.qty,
              grams: gr,
              est_hours: hrs,
              price_low: exactPrice,
              price_high: exactPrice,
              file_name: f.name,
              file_paths: uploadedPaths,
              file_names: uploadedNames,
              language: capturedLang,
              multicolour: capturedMulticolour,
            };
            supabaseAnon.from("price_estimates").insert(estimateRow).then(({ error: dbErr }) => {
              if (dbErr) {
                console.error("price_estimates insert error:", dbErr);
                capture("submit_error", { stage: "estimate", table: "price_estimates", code: dbErr.code ?? "unknown" });
              }
            });
            supabase.functions.invoke("send-price-estimate", {
              body: {
                fileName: f.name,
                material: eff.material,
                infillPct: eff.infill,
                quantity: f.qty,
                volumeCm3: f.volumeMm3 / 1000,
                grams: gr,
                estHours: hrs,
                priceLow: exactPrice,
                priceHigh: exactPrice,
                exactPrice,
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
          price_low: Math.round(bundle.total),
          price_high: Math.round(bundle.total),
          material: materialKey,
        });
      }
    }
    estimateShownRef.current = false;
    modalShownRef.current = false;
    setParsedFiles(prev => prev.filter(f => f.id !== id));
    if (scope === id) setScope("all");
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
    setNotesText("");
    setActiveUseCase(null);
    setContactTouched(false);
    setQuality("standard");
    setSupports(true);
    setOrientation("auto");
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
    setScope("all");
    setReplacedCount(null);
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
    setScope("all");
  };

  const clearFieldFromAllParts = (field: keyof PartSettings): number => {
    const count = parsedFiles.filter(f => f.settings != null && field in f.settings).length;
    setParsedFiles(prev => prev.map(f => {
      if (!f.settings || !(field in f.settings)) return f;
      const { [field]: _removed, ...rest } = f.settings as Record<string, unknown>;
      return { ...f, settings: Object.keys(rest).length > 0 ? rest as PartSettings : undefined };
    }));
    if (count > 0) {
      if (replacedTimerRef.current) clearTimeout(replacedTimerRef.current);
      setReplacedCount(count);
      replacedTimerRef.current = setTimeout(() => setReplacedCount(null), 3000);
    }
    return count;
  };

  const handleScopeChange = (newScope: Scope) => {
    setScope(newScope);
    if (newScope !== "all") {
      const idx = viewableFiles.findIndex(f => f.id === newScope);
      if (idx >= 0) setSelectedFileIndex(idx);
    }
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
    // If an email was typed but is invalid, show the error (phone is not required for Stripe)
    if (contactEmail.trim() && !isValidEmail(contactEmail)) {
      setContactTouched(true);
      return;
    }
    if (!uploadedRef.current || instantTotalPrice === null) {
      setCheckoutError("Files are still uploading. Please wait a moment and try again.");
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const uniqueMats = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];
      const checkoutRef = contactEmail.trim() ? await customerRef(contactEmail.trim()) : null;
      const storedUtm = getStoredUTM();
      const shippingFee = fulfillment === "shipping" ? EST.shippingCents / 100 : 0;
      const checkoutBodyPayload = buildCheckoutBody({
        validFiles,
        defaults,
        bundle: bundle!,
        urgency,
        fulfillment: fulfillment!,
        uploaded: uploadedRef.current!,
        contactEmail,
        contactPhone,
        colorPref,
        language,
        phId: get_distinct_id() ?? null,
        phSid: get_session_id() ?? null,
        utmSource: storedUtm?.utm_source ?? null,
        utmMedium: storedUtm?.utm_medium ?? null,
        utmContent: storedUtm?.utm_content ?? null,
        utmCampaign: storedUtm?.utm_campaign ?? null,
        checkoutRef,
      });
      const { data, error } = await supabase.functions.invoke("create-instant-checkout", {
        body: checkoutBodyPayload,
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
          material: checkoutBodyPayload.material,
        }));
      } catch {}
      const qualityVals = validFiles.map(f => effectivePartSettings(f, defaults).quality);
      const uniformQuality = qualityVals.every(q => q === qualityVals[0]) ? qualityVals[0] : "mixed";
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
        pricing_version: 3,
        quality: uniformQuality,
      });
      if (checkoutRef) identifyUser(checkoutRef);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setIsCheckingOut(false);
      setCheckoutError(err.message ?? "Checkout failed. Please request a review instead.");
    }
  };

  const handleManualReview = () => {
    const cc = checkContact(contactEmail, contactPhone);
    setContactTouched(true);
    if (!cc.ok) {
      capture('review_blocked_missing_contact', { code: cc.code });
      return;
    }
    setShowManualReview(true);
  };

  const submitQuote = async () => {
    const cc = checkContact(contactEmail, contactPhone);
    if (!cc.ok) {
      setContactTouched(true);
      capture('review_blocked_missing_contact', { code: cc.code });
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
      const quoteSummary = summarizeParts(validFiles.map(f => {
        const eff = effectivePartSettings(f, defaults);
        return { material: eff.material, infill: eff.infill, wallLoops: eff.wallLoops, multicolour: eff.multicolour };
      }));

      // Combine color preference + notes into existing color field (payload shape unchanged)
      const colorWithNotes = [colorPref.trim(), notesText.trim()].filter(Boolean).join(' | Notes: ') || null;

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
        estimated_price_low: Math.round(bundle!.total),
        estimated_price_high: Math.round(bundle!.total),
        color: !!colorPref.trim(),
        multicolour: anyMulticolour,
        customer_ref: ref,
        quote_id,
        value_estimate_mid: Math.round(bundle!.total),
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
        const insertPayload: TablesInsert<"quote_requests"> = {
          id: quote_id,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          color: colorWithNotes,
          material: quoteSummary.material,
          infill: quoteSummary.infill,
          wall_loops: quoteSummary.wallLoops,
          urgency,
          quantity: bundle!.totalUnits,
          estimated_grams: bundle!.totalGrams,
          estimated_hours: bundle!.totalHours,
          estimated_price_low: parseFloat(bundle!.total.toFixed(2)),
          estimated_price_high: parseFloat(bundle!.total.toFixed(2)),
          file_paths: uploadedPaths,
          file_names: uploadedNames,
          status: "pending",
          multicolour: quoteSummary.multicolour,
          utm_source: storedUtm?.utm_source ?? null,
          utm_medium: storedUtm?.utm_medium ?? null,
          utm_content: storedUtm?.utm_content ?? null,
          pieces: pieces as Json,
        };

        try {
          const { error: insertErr } = await supabaseAnon
            .from("quote_requests")
            .insert(insertPayload);
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
          material: quoteSummary.material,
          color: colorWithNotes,
          urgency,
          infillPct: quoteSummary.infillNum,
          wallLoops: quoteSummary.wallLoops,
          totalGrams: bundle!.totalGrams,
          totalHours: bundle!.totalHours,
          totalUnits: bundle!.totalUnits,
          priceLow: bundle!.total,
          priceHigh: bundle!.total,
          priceExact: bundle!.total,
          language,
          multicolour: quoteSummary.multicolour,
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
      const exitSummary = summarizeParts(validFiles.map(f => {
        const eff = effectivePartSettings(f, defaults);
        return { material: eff.material, infill: eff.infill, wallLoops: eff.wallLoops, multicolour: eff.multicolour };
      }));
      const exitUtm = getStoredUTM();
      const exitInsertPayload: TablesInsert<"quote_requests"> = {
        id: crypto.randomUUID(),
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        color: colorPref.trim() || null,
        material: exitSummary.material,
        infill: exitSummary.infill,
        wall_loops: exitSummary.wallLoops,
        urgency,
        quantity: bundle?.totalUnits ?? 1,
        estimated_grams: bundle?.totalGrams ?? 0,
        estimated_hours: bundle?.totalHours ?? 0,
        estimated_price_low: bundle ? parseFloat(bundle.total.toFixed(2)) : 0,
        estimated_price_high: bundle ? parseFloat(bundle.total.toFixed(2)) : 0,
        file_paths: uploadedPaths,
        file_names: uploadedNames,
        status: "pending",
        multicolour: exitSummary.multicolour,
        utm_source: exitUtm?.utm_source ?? null,
        utm_medium: exitUtm?.utm_medium ?? null,
        utm_content: exitUtm?.utm_content ?? null,
        pieces: exitPieces as Json,
      };
      const { error: insertErr } = await supabaseAnon
        .from("quote_requests")
        .insert(exitInsertPayload);
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
          material: exitSummary.material,
          color: colorPref.trim() || null,
          urgency,
          infillPct: exitSummary.infillNum,
          wallLoops: exitSummary.wallLoops,
          totalGrams: bundle?.totalGrams ?? 0,
          totalHours: bundle?.totalHours ?? 0,
          totalUnits: bundle?.totalUnits ?? 1,
          priceLow: bundle?.total ?? 0,
          priceHigh: bundle?.total ?? 0,
          priceExact: bundle?.total ?? 0,
          language,
          multicolour: exitSummary.multicolour,
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

  // Price display — multicolour shows "from €X", instant-buy shows exact, normal shows "€X" (exact v3 price)
  const priceDisplay = bundle
    ? anyMulticolour
      ? `${t("calc.multicolour.from")} €${bundle.total.toFixed(0)}+`
      : instantBuyEligible && instantTotalPrice !== null
        ? `€${instantTotalPrice.toFixed(2)}`
        : `€${bundle.total.toFixed(2)}`
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

            {/* Consumer: success message or "Continue to checkout" button */}
            {!adminMode && (
              isSubmittedQuote ? (
                <div className="mt-4 rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-5 text-center">
                  <CheckCircle className="w-8 h-8 text-whatsapp mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full"
                    onClick={() => { capture('checkout_reopened', {}); setMobileModalOpen(true); }}
                  >
                    {t("calc.checkout.reopen")}
                  </Button>
                </div>
              )
            )}
          </div>
        )}

        {/* Admin full-calculator view — same slots as customer (viewer + config + debug) */}
        {adminMode && bundle && !parsing && (() => {
          const stepperFile = viewableFiles[selectedFileIndex] ?? viewableFiles[0];
          const eff = stepperFile ? effectivePartSettings(stepperFile, defaults) : null;
          const isMulti = eff?.multicolour ?? false;
          const viewerColour = isMulti ? undefined : (eff?.color || undefined);
          const filamentCost = bundle.totalGrams * 0.015;
          const profit = bundle.total - filamentCost;
          const up = urgency === "express" ? (bundle.orderResult.expressCents / Math.max(bundle.orderResult.chargedPrintCents - bundle.orderResult.expressCents, 1)) : (urgency === "urgent" ? 1.5 : 1);
          const rawTotal = bundle.orderResult.chargedPrintCents / 100;
          const minWasApplied = bundle.orderResult.minAdjCents > 0 || rawTotal <= 10;
          const instantEligReason = bundle.order.reasons.join(", ");
          const notEligReasons: string[] = [];
          if (anyMulticolour) notEligReasons.push("multicolour");
          if (!bundle.order.instantEligible) notEligReasons.push(...bundle.order.reasons);
          if (!filesWithinVerifyLimit) notEligReasons.push("file-size-limit");
          if (!CHECKOUT_V3_READY) notEligReasons.push("feature-flag-off");

          const copyQuote = () => {
            const parts = validFiles.map((f, i) => {
              const e = effectivePartSettings(f, defaults);
              const cost = (bundle.orderResult.parts[i]?.costCents ?? 0) / 100;
              return `• ${f.name} — ${e.material}${e.color ? `, ${e.color}` : ""} × ${f.qty} → €${cost.toFixed(2)}`;
            }).join("\n");
            const deliveryDays = urgency === "urgent" ? "24–48h" : urgency === "express" ? "48–72h" : "2–5 días laborables";
            const text = [
              "📋 Presupuesto Dimension3D",
              "",
              parts,
              "",
              `Total: €${bundle.total.toFixed(2)} (+ €5,90 envío si aplica)`,
              `Entrega estimada: ${deliveryDays}`,
              "",
              "Este precio se confirma antes de cualquier cobro.",
            ].join("\n");
            navigator.clipboard.writeText(text).catch(() => {});
          };

          return (
            <div className="mt-6 space-y-4">
              {/* Viewer */}
              {stepperFile?.file && (
                <div className="rounded-xl border border-border bg-muted/20 overflow-hidden" style={{ height: 280 }}>
                  <Suspense fallback={<div className="w-full h-full bg-muted/20 animate-pulse" />}>
                    <StlViewer
                      key={`${stepperFile.id}-admin`}
                      file={stepperFile.file}
                      colour={viewerColour}
                    />
                  </Suspense>
                </div>
              )}

              {/* Parts list */}
              <PartSummaryList
                parsedFiles={parsedFiles}
                viewableFiles={viewableFiles}
                defaults={defaults}
                selectedFileIndex={selectedFileIndex}
                costByFileId={costByFileId}
                disabled={false}
                t={t}
                onSelect={(idx) => setSelectedFileIndex(idx)}
                onQtyChange={updateQty}
                onRemove={removeFile}
              />

              {/* Full configurator */}
              <CheckoutConfigurator
                parsedFiles={parsedFiles}
                validFiles={validFiles}
                bundle={bundle}
                defaults={defaults}
                advancedMode={advancedMode}
                onAdvancedModeChange={setAdvancedMode}
                materialKey={materialKey}
                onMaterialChange={setMaterialKey}
                activeUseCase={activeUseCase}
                onUseCaseChange={setActiveUseCase}
                colorPref={colorPref}
                onColorChange={setColorPref}
                notesText={notesText}
                onNotesChange={setNotesText}
                quality={quality}
                onQualityChange={setQuality}
                infillPct={infillPct}
                wallLoops={wallLoops}
                onInfillChange={setInfillPct}
                onWallLoopsChange={setWallLoops}
                supports={supports}
                onSupportsChange={setSupports}
                orientation={orientation}
                onOrientationChange={setOrientation}
                urgency={urgency}
                onUrgencyChange={setUrgency}
                materialOptions={materialOptions}
                disabled={false}
                t={t}
                language={language}
                scope={scope}
                onScopeChange={handleScopeChange}
                costByFileId={costByFileId}
                onPartSettingsChange={handlePartSettingsChange}
                onResetPartSettings={handleResetPartSettings}
                onApplyToAll={handleApplyToAll}
                onClearFieldFromAllParts={clearFieldFromAllParts}
                replacedCount={replacedCount}
              />

              {/* Admin debug box */}
              <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 p-4 text-xs space-y-2">
                <p className="font-semibold text-foreground text-sm mb-2">Admin pricing detail</p>
                {validFiles.length > 1 && (
                  <div className="space-y-0.5 border-b border-border pb-2 mb-2">
                    {validFiles.map((f, i) => {
                      const gpu = bundle.orderResult.parts[i]?.gramsPerUnit ?? 0;
                      const cost = (bundle.orderResult.parts[i]?.costCents ?? 0) / 100;
                      return (
                        <div key={f.id} className="flex justify-between text-muted-foreground">
                          <span className="truncate max-w-[55%]">{f.name}</span>
                          <span>{gpu.toFixed(1)} g/u × {f.qty} = {(gpu * f.qty).toFixed(1)} g · €{cost.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">{t("calc.admin.weight")}</span>
                  <span className="font-medium">{bundle.totalGrams.toFixed(1)} g</span>
                  <span className="text-muted-foreground">{t("calc.admin.hours")}</span>
                  <span className="font-medium">{bundle.totalHours.toFixed(1)} h</span>
                  <span className="text-muted-foreground">{t("calc.admin.filamentCost")}</span>
                  <span className="font-medium">€{filamentCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Price before min. fold</span>
                  <span className="font-medium">€{(bundle.orderResult.chargedPrintCents / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">Min. applied (€10)</span>
                  <span className={`font-medium ${minWasApplied ? "text-amber-600" : "text-muted-foreground"}`}>
                    {minWasApplied ? "Yes" : "No"}
                  </span>
                  <span className="text-muted-foreground">Urgency mult.</span>
                  <span className="font-medium">{urgency === "standard" ? "1×" : urgency === "express" ? "1.25×" : "1.5×"} ({urgency})</span>
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-muted-foreground">not included (€5.90 if shipped)</span>
                  <span className="text-muted-foreground">{t("calc.admin.profit")}</span>
                  <span className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                    €{profit.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">Instant-buy eligible</span>
                  <span className={`font-medium ${instantBuyEligible ? "text-green-600" : "text-amber-600"}`}>
                    {instantBuyEligible
                      ? "Yes"
                      : `No — ${notEligReasons.length > 0 ? notEligReasons.join(", ") : (instantEligReason || "see reasons")}` }
                  </span>
                </div>
              </div>

              {/* Copy quote button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={copyQuote}
              >
                Copy quote for customer (ES)
              </Button>
            </div>
          );
        })()}
      </div>

      {/* Confirmation modal — opens immediately on estimate, all screen sizes, consumer only */}
      {!adminMode && bundle && (() => {
        const stepperFile = viewableFiles[selectedFileIndex] ?? viewableFiles[0];

        const sharedOrderPanelProps = {
          parsedFiles,
          validFiles,
          bundle,
          defaults,
          selectedFileIndex,
          expandedPartId,
          onSelectPart: setSelectedFileIndex,
          onExpandPart: setExpandedPartId,
          onQtyChange: updateQty,
          onRemove: removeFile,
          onPartSettingsChange: handlePartSettingsChange,
          onResetPartSettings: handleResetPartSettings,
          onApplyToAll: handleApplyToAll,
          fulfillment,
          fulfillmentAttempted,
          onFulfillmentChange: (v: "pickup" | "shipping") => { setFulfillment(v); setFulfillmentAttempted(false); },
          pickupCity,
          contactEmail,
          contactPhone,
          contactTouched,
          quoteError,
          checkoutError,
          oversizedFiles,
          onContactEmailChange: setContactEmail,
          onContactPhoneChange: setContactPhone,
          advancedMode,
          instantBuyEligible,
          isCheckingOut,
          preUploadDone,
          isSubmittingQuote,
          showManualReview,
          hasSubmitted,
          uploadState,
          onInstantBuy: handleInstantBuy,
          onManualReview: handleManualReview,
          onSubmitQuote: submitQuote,
          onWhatsApp: handleWhatsApp,
          language,
          t,
          materialOptions,
          adminMode,
          anyMulticolour,
          instantTotalPrice,
        } as const;

        const leftSlot = (
          <div
            className="flex flex-col flex-1 min-h-0 p-4 gap-3"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={(e) => { setIsDragging(false); handleDrop(e); }}
          >
            {/* Viewer — absorbs spare height, capped at 340px */}
            {stepperFile?.file && viewerStateInModal !== "failed" && (() => {
              const eff = effectivePartSettings(stepperFile, defaults);
              const isMulti = eff.multicolour;
              // When multicolour is active, show neutral grey in the viewer
              const viewerColour = isMulti ? undefined : (eff.color || undefined);
              return (
                <div className="relative flex-1 min-h-[200px] max-h-[340px] rounded-xl border border-border bg-muted/20 overflow-hidden">
                  <Suspense fallback={<div className="w-full h-full bg-muted/20 animate-pulse" />}>
                    <StlViewer
                      key={`${stepperFile.id}-dialog`}
                      file={stepperFile.file}
                      colour={viewerColour}
                      onReady={() => setViewerStateInModal("ready")}
                      onError={() => setViewerStateInModal("failed")}
                    />
                  </Suspense>
                  {viewerStateInModal === "ready" && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-[11px] text-muted-foreground bg-background/75 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                        {isMulti ? t("calc.viewer.multicolourCaption") : t("calc.modal.dragHint")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Parts list — qty steppers + remove + price + select */}
            <PartSummaryList
              parsedFiles={parsedFiles}
              viewableFiles={viewableFiles}
              defaults={defaults}
              selectedFileIndex={selectedFileIndex}
              costByFileId={costByFileId}
              disabled={isCheckingOut || isSubmittingQuote}
              t={t}
              onSelect={(idx, id) => {
                setSelectedFileIndex(idx);
                if (advancedMode) handleScopeChange(id);
              }}
              onQtyChange={updateQty}
              onRemove={removeFile}
            />

            {/* Add files button */}
            <input
              ref={modalInputRef}
              type="file"
              accept=".stl"
              multiple
              className="hidden"
              onChange={handleChange}
            />
            {!isSubmittedQuote && parsedFiles.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => { capture("estimate_add_more_click", { location: "dialog" }); modalInputRef.current?.click(); }}
                className={`shrink-0 flex items-center justify-center gap-1.5 h-10 w-full rounded-xl border border-dashed text-sm text-muted-foreground transition-all ${
                  isDragging ? "border-accent bg-accent/8" : "border-border/60 hover:border-accent/50 hover:bg-accent/4"
                }`}
              >
                <Plus className="w-4 h-4" />
                {t("calc.addMore")} ({parsedFiles.length}/{MAX_FILES})
              </button>
            )}
          </div>
        );

        const rightSlot = isSubmittedQuote ? (
          <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/25 p-5 text-center">
            <CheckCircle className="w-8 h-8 text-whatsapp mx-auto mb-2" />
            <p className="font-semibold text-foreground">{t("calc.contact.success.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("calc.contact.success.desc")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <CheckoutConfigurator
              parsedFiles={parsedFiles}
              validFiles={validFiles}
              bundle={bundle}
              defaults={defaults}
              advancedMode={advancedMode}
              onAdvancedModeChange={setAdvancedMode}
              materialKey={materialKey}
              onMaterialChange={setMaterialKey}
              activeUseCase={activeUseCase}
              onUseCaseChange={setActiveUseCase}
              colorPref={colorPref}
              onColorChange={setColorPref}
              notesText={notesText}
              onNotesChange={setNotesText}
              quality={quality}
              onQualityChange={setQuality}
              infillPct={infillPct}
              wallLoops={wallLoops}
              onInfillChange={setInfillPct}
              onWallLoopsChange={setWallLoops}
              supports={supports}
              onSupportsChange={setSupports}
              orientation={orientation}
              onOrientationChange={setOrientation}
              urgency={urgency}
              onUrgencyChange={setUrgency}
              materialOptions={materialOptions}
              disabled={isCheckingOut || isSubmittingQuote}
              t={t}
              language={language}
              scope={scope}
              onScopeChange={handleScopeChange}
              costByFileId={costByFileId}
              onPartSettingsChange={handlePartSettingsChange}
              onResetPartSettings={handleResetPartSettings}
              onApplyToAll={handleApplyToAll}
              onClearFieldFromAllParts={clearFieldFromAllParts}
              replacedCount={replacedCount}
            />
            <OrderPanel
              {...sharedOrderPanelProps}
              hideParts={true}
              section="form"
            />
          </div>
        );

        const actionSlot = isSubmittedQuote ? null : (
          <OrderPanel
            {...sharedOrderPanelProps}
            hideParts={true}
            section="actions"
          />
        );

        return (
          <CheckoutDialog
            open={mobileModalOpen}
            onOpenChange={(open) => {
              if (!open && !isSubmittedQuote) capture('estimate_modal_dismissed');
              if (!open && instantBuyEligible && checkoutResult !== "success" && !showManualReview) {
                if (exitIntentTimerRef.current) clearTimeout(exitIntentTimerRef.current);
                exitIntentTimerRef.current = setTimeout(() => setShowExitIntent(true), 500);
              }
              setMobileModalOpen(open);
              if (open) setViewerStateInModal("loading");
            }}
            title={t("calc.checkout.title")}
            closeLabel={t("calc.checkout.close")}
            leftSlot={leftSlot}
            rightSlot={rightSlot}
            actionSlot={actionSlot}
          />
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
