import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { X, Loader2, RefreshCw, Calculator, Plus, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { supabase, supabaseAnon } from "@/integrations/supabase/client";
import { capture, identifyUser, get_distinct_id, get_session_id } from "@/lib/analytics";
import { ExitReasonCard, hasExitSurveyBeenShown, markLeadSubmitted, hasLeadBeenSubmitted } from "@/components/ExitReasonCard";
import { useXpExposure } from "@/lib/experiments";
import { getStoredUTM } from "@/lib/utm";
import { customerRef } from "@/lib/customerRef";
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import type { ParsedFile, PartSettings, PartDefaults, MaterialOption } from "@/lib/pricing";
import { effectivePartSettings } from "@/lib/pricing";
import type { Scope } from "./estimator/PartScopeBar";
import { computeBundleV3 } from "@/lib/estimate";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST, analyzeTriangles, stlToTriangles } from "@/lib/estimator/core";
import type { QualityKey } from "@/lib/estimator/core";
import { CHECKOUT_V3_READY, getInstantBuyStatus } from "@/lib/instantBuy";
import { buildCheckoutBody } from "@/lib/checkoutBody";
import { formatEUR } from "@/lib/formatPrice";
import { AUTUMN_DISCOUNT } from "@/config/policies";
import { isImageFile, isConvertibleModel, fileExt, stlBboxMm } from "@/lib/fileConverters";
import { CHECKOUT_MAX_BYTES, isBinaryStl, scaleStlBuffer } from "@/lib/stlPrepare";
import { ContactFields } from "./estimator/ContactFields";
import type { Language } from "@/lib/pathLanguage";
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
  /** When true, disables instant checkout (e.g. for countries outside SHIP_COUNTRIES) */
  forceQuoteOnly?: boolean;
}

export function StlEstimator({ adminMode = false, highlighted = false, refCity, refDays, refPickupAvailable, forceQuoteOnly = false }: Props) {
  const { t, language } = useLanguage();
  const pickupCity = refCity ?? ACTIVE_CITY.cityName;

  // Fire calculator_seen and upload_area_view when section is ≥50% visible
  useEffect(() => {
    if (adminMode) return;
    const section = document.getElementById("calculator");
    if (!section) return;
    let calcFired = false;
    let uploadFired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.intersectionRatio >= 0.5) {
          const pageType = window.location.pathname === "/" || window.location.pathname === "/ca" ? "home" : "page";
          if (!calcFired) {
            calcFired = true;
            capture("calculator_seen", { page_type: pageType });
          }
          if (!uploadFired) {
            uploadFired = true;
            capture("upload_area_view", { page_type: pageType });
          }
          if (calcFired && uploadFired) observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [adminMode]);

  // Experiment: upload_area_r1 — exposure fires when the drop zone is visible
  const uploadAreaExposureRef = useRef<HTMLDivElement>(null);
  useXpExposure(uploadAreaExposureRef, "upload_area_r1");

  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [scaleByFileId, setScaleByFileId] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsingHasLargeFile, setParsingHasLargeFile] = useState(false);
  const [prepareProgress, setPrepareProgress] = useState<{ name: string; pct: number; stage: string } | null>(null);
  const gzippedOriginalsRef = useRef<Array<{ id: string; gzName: string; buf: ArrayBuffer }>>([]);
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
  // Must start false on server to avoid hydration mismatch; synced from sessionStorage in useEffect.
  // Advanced mode persists for the session only — never auto-restored for first-time visitors (STEP 2.5).
  const [advancedMode, setAdvancedModeRaw] = useState<boolean>(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("dim3d-calc-mode") === "advanced") setAdvancedModeRaw(true);
    } catch { /* unavailable */ }
  }, []);
  const setAdvancedMode = (val: boolean) => {
    try { sessionStorage.setItem("dim3d-calc-mode", val ? "advanced" : "simple"); } catch { /* unavailable */ }
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
  const [contactName, setContactName] = useState("");
  const [colorPref, setColorPref] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittedQuote, setIsSubmittedQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);

  // Mobile modal
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileViewerExpanded, setMobileViewerExpanded] = useState(false);
  // Image design request per-file state (fileId → description)
  const [imageDescriptions, setImageDescriptions] = useState<Record<string, string>>({});
  const [imageSubmitting, setImageSubmitting] = useState<Record<string, boolean>>({});
  const [imageSubmitted, setImageSubmitted] = useState<Record<string, boolean>>({});
  const [imageSubmitError, setImageSubmitError] = useState<Record<string, string>>({});
  // Link upload per-file state (fileId → link value)
  const [linkValues, setLinkValues] = useState<Record<string, string>>({});
  const [linkSubmitting, setLinkSubmitting] = useState<Record<string, boolean>>({});
  const [linkSubmitted, setLinkSubmitted] = useState<Record<string, boolean>>({});
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

  // Set data-estimator-open on body so CookieConsentBanner can hide itself
  useEffect(() => {
    if (mobileModalOpen) {
      document.body.setAttribute("data-estimator-open", "1");
    } else {
      document.body.removeAttribute("data-estimator-open");
    }
    return () => { document.body.removeAttribute("data-estimator-open"); };
  }, [mobileModalOpen]);

  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "slow" | "done" | "failed">("idle");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Instant checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutErrorCode, setCheckoutErrorCode] = useState<string | null>(null);
  const [preUploadDone, setPreUploadDone] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<"success" | "cancelled" | null>(null);
  const [showManualReview, setShowManualReview] = useState(false);
  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping" | null>(null);
  const [fulfillmentAttempted, setFulfillmentAttempted] = useState(false);
  const fulfillmentPickerRef = useRef<HTMLDivElement>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitPopupVariant, setExitPopupVariant] = useState<'priced' | 'quote' | 'failed'>('priced');
  const [exitPopupReviewExpanded, setExitPopupReviewExpanded] = useState(false);
  const [exitPopupLinkValue, setExitPopupLinkValue] = useState("");
  const [exitPopupLinkSubmitting, setExitPopupLinkSubmitting] = useState(false);
  const [exitPopupLinkSubmitted, setExitPopupLinkSubmitted] = useState(false);
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
  const modalOpenTimeRef = useRef<number | null>(null);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const exitSurveyPriceBucket = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (showExitIntent) {
      capture("exit_intent_shown");
      capture("exit_popup_shown", { variant: exitPopupVariant, page_type: window.location.pathname, lang: language });
      setExitIntentSubmitted(false);
      setExitIntentError(null);
      setExitPopupReviewExpanded(false);
      setExitPopupLinkValue("");
      setExitPopupLinkSubmitted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExitIntent]);


  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const estimateShownRef = useRef(false);
  const uploadedRef = useRef<{ paths: string[]; names: string[]; byId: Record<string, string> } | null>(null);
  const modalShownRef = useRef(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkoutFailureNoteRef = useRef<string | null>(null);
  // Guard: don't send a second estimate email for the same session+files within 10 min
  const sentEstimateRef = useRef<{ key: string; sentAt: number } | null>(null);

  const defaults: PartDefaults = { material: materialKey, color: colorPref, infill: infillPct, wallLoops, multicolour, quality, supports, orientation };
  const validFiles = parsedFiles.filter(f => !f.parseError && !f.imageFile && !f.linkFile);
  const costByFileId: Record<string, number> = {};
  // Apply per-file scale to volume+bounds before pricing (scale doesn't touch pricing logic)
  const scaledParsedFiles: ParsedFile[] = parsedFiles.map(f => {
    const s = scaleByFileId[f.id] ?? 1;
    if (s === 1) return f;
    const s3 = s * s * s;
    const analysis = f.analysis ? {
      ...f.analysis,
      volumeMm3: f.analysis.volumeMm3 * s3,
      boundsMm: f.analysis.boundsMm.map(v => v * s) as [number, number, number],
      orientations: f.analysis.orientations.map(o => ({
        ...o,
        sizeXMm: o.sizeXMm * s,
        sizeYMm: o.sizeYMm * s,
        heightMm: o.heightMm * s,
        overhangCm2: o.overhangCm2 * s * s,
        fitsPlate: o.sizeXMm * s <= 256 && o.sizeYMm * s <= 256,
      })),
    } : f.analysis;
    return { ...f, volumeMm3: f.volumeMm3 * s3, analysis };
  });
  const bundle: BundleEstimateV3 | null = computeBundleV3(scaledParsedFiles, defaults, urgency);
  if (bundle) {
    validFiles.forEach((f, i) => { costByFileId[f.id] = bundle.orderResult.parts[i]?.costCents ?? 0; });
  }
  const oversizedFiles = parsedFiles.filter(f => !f.parseError && f.sizeBytes > MAX_BYTES);

  const anyMulticolour = validFiles.some(f => effectivePartSettings(f, defaults).multicolour);
  const filesWithinVerifyLimit = validFiles.every(f => f.sizeBytes <= V3_VERIFY_MAX_BYTES) &&
    validFiles.reduce((s, f) => s + f.sizeBytes, 0) <= 60 * 1024 * 1024;
  const instantBuyStatus = getInstantBuyStatus({
    adminMode,
    anyMulticolour,
    orderReasons: bundle?.order.reasons ?? [],
    filesWithinVerifyLimit,
    flagReady: CHECKOUT_V3_READY,
    forceQuoteOnly,
    showManualReview,
  });
  const instantBuyEligible = instantBuyStatus.eligible;
  const ineligibleReasons = instantBuyStatus.reasons;
  const chargedPrice = bundle ? bundle.orderResult.chargedPrintCents / 100 : 0;

  // Autumn discount (client display only — server re-computes at checkout)
  const autumnOfferActive = Date.now() < new Date(AUTUMN_DISCOUNT.endsAt).getTime();
  const autumnDiscountCents = (autumnOfferActive && bundle && bundle.orderResult.chargedPrintCents >= AUTUMN_DISCOUNT.minCents)
    ? Math.round(bundle.orderResult.chargedPrintCents * AUTUMN_DISCOUNT.pct / 100)
    : 0;

  const instantTotalPrice = instantBuyEligible
    ? chargedPrice - autumnDiscountCents / 100 + (fulfillment === "shipping" ? EST.shippingCents / 100 : 0)
    : null;

  const processFiles = async (newFiles: File[], method: "drop" | "click" = "click") => {
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

    capture("upload_started", { method, file_count: toProcess.length });
    const uploadStartMs = Date.now();

    // Reset per-estimate refs — new files mean a fresh estimate and upload
    uploadedRef.current = null;
    setPreUploadDone(false);

    setParsingHasLargeFile(toProcess.some(f => f.size > 80 * 1024 * 1024));
    setParsing(true);
    const results: ParsedFile[] = [];

    for (const f of toProcess) {
      const id = Math.random().toString(36).slice(2, 10);
      const ext = fileExt(f.name);

      // Image files → design-request card (no pricing)
      if (isImageFile(f.name)) {
        capture("file_parsed", { status: "image", size_kb: Math.round(f.size / 1024), ext });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, file: f, imageFile: true });
        continue;
      }

      // OBJ / 3MF / GLB → convert to STL first
      let fileToAnalyze = f;
      let convertedStlBuf: ArrayBuffer | null = null;
      if (isConvertibleModel(f.name)) {
        try {
          const { objToStlBuffer, threeMfToStlBuffer, glbToStlBuffer } = await import("@/lib/fileConverters");
          if (ext === "obj") convertedStlBuf = await objToStlBuffer(f);
          else if (ext === "3mf") convertedStlBuf = await threeMfToStlBuffer(f);
          else if (ext === "glb") convertedStlBuf = await glbToStlBuffer(f);
          if (convertedStlBuf) {
            fileToAnalyze = new File([convertedStlBuf], f.name.replace(/\.[^.]+$/, ".stl"), { type: "model/stl" });
          }
        } catch (convErr) {
          capture("file_upload_error", { reason: "convert_error", file_type: ext });
          capture("file_parsed", { status: "error", size_kb: Math.round(f.size / 1024), ext, reason: "convert_error" });
          results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
          continue;
        }
      } else if (ext !== "stl") {
        capture("file_upload_error", { reason: "not_stl", file_type: ext });
        capture("file_parsed", { status: "error", size_kb: Math.round(f.size / 1024), ext, reason: "not_stl" });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.notStl") });
        continue;
      }

      // Parse limit (client-side only — independent of upload limit)
      if (fileToAnalyze.size > MAX_ESTIMATE_BYTES && !convertedStlBuf) {
        capture("file_upload_error", { reason: "size_exceeded", file_type: ext });
        capture("file_parsed", { status: "error", size_kb: Math.round(f.size / 1024), ext, reason: "size_exceeded" });
        results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.size") });
        continue;
      }

      try {
        const rawBuf = convertedStlBuf ?? await fileToAnalyze.arrayBuffer();

        // STL preparation: ASCII→binary and/or simplify if > 28 MB so the server's
        // 30 MB per-file re-measure always passes (HARD RULE 7).
        let checkoutBuf = rawBuf;
        const needsConvert = !isBinaryStl(rawBuf);
        const needsSimplify = rawBuf.byteLength > CHECKOUT_MAX_BYTES;
        if (needsConvert || needsSimplify) {
          setPrepareProgress({ name: f.name, pct: 0, stage: "converting" });
          try {
            const { prepareStl } = await import("@/lib/stlPrepare");
            const prep = await prepareStl(rawBuf, (p) => {
              setPrepareProgress({ name: f.name, pct: p.pct, stage: p.stage });
            });
            checkoutBuf = prep.checkoutBuf;
            if (prep.originalGzipped) {
              gzippedOriginalsRef.current.push({
                id,
                gzName: f.name.replace(/\.[^.]+$/, `.original.stl.gz`),
                buf: prep.originalGzipped,
              });
            }
            capture("file_prepared", {
              original_bytes: prep.original_bytes,
              format: prep.format,
              ascii_converted: prep.ascii_converted,
              simplified: prep.simplified,
              triangles_before: prep.triangles_before,
              triangles_after: prep.triangles_after,
              final_bytes: prep.final_bytes,
              ms: prep.ms,
            });
          } catch (prepErr) {
            console.warn("[StlEstimator] STL preparation failed:", prepErr);
            // checkoutBuf stays as rawBuf
          }
          setPrepareProgress(null);
        }

        // If prepared checkout copy is still > 50 MB (very rare): show link card
        if (checkoutBuf.byteLength > MAX_BYTES) {
          capture("file_parsed", { status: "link", size_kb: Math.round(f.size / 1024), ext: "stl" });
          results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, file: f, linkFile: true });
          continue;
        }

        const analysis = analyzeTriangles(stlToTriangles(checkoutBuf));
        const volumeMm3 = analysis.volumeMm3;
        if (analysis.triangles === 0 || volumeMm3 === 0) {
          capture("file_upload_error", { reason: "parse_error", file_type: ext });
          capture("file_parsed", { status: "error", size_kb: Math.round(f.size / 1024), ext, reason: "parse_error" });
          results.push({ id, name: f.name, sizeBytes: f.size, volumeMm3: 0, qty: 1, parseError: t("calc.error.parse") });
        } else {
          capture("file_parsed", { status: "ok", size_kb: Math.round(f.size / 1024), ext });
          // Upload the checkout copy (prepared binary STL); sizeBytes reflects its size
          const checkoutFile = new File([checkoutBuf], f.name.replace(/\.[^.]+$/, ".stl"), { type: "model/stl" });
          const bboxMm = stlBboxMm(checkoutBuf);
          results.push({ id, name: f.name, sizeBytes: checkoutBuf.byteLength, volumeMm3, qty: 1, file: checkoutFile, analysis, bboxMm });
        }
      } catch {
        capture("file_upload_error", { reason: "parse_error", file_type: ext });
        capture("file_parsed", { status: "error", size_kb: Math.round(f.size / 1024), ext, reason: "exception" });
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
        const priceMid = (nextBundle.low + nextBundle.high) / 2;
        const priceBucket = priceMid < 15 ? "<15" : priceMid < 30 ? "15-30" : priceMid < 60 ? "30-60" : priceMid < 100 ? "60-100" : ">100";
        const nextAnyMulticolour = nextFiles.filter(f => !f.parseError && !f.imageFile && !f.linkFile).some(f => effectivePartSettings(f, nextDefaults).multicolour);
        const nextFilesWithinVerifyLimit = nextFiles.filter(f => !f.parseError && !f.imageFile && !f.linkFile).every(f => f.sizeBytes <= V3_VERIFY_MAX_BYTES);
        const nextStatus = getInstantBuyStatus({
          adminMode: false,
          anyMulticolour: nextAnyMulticolour,
          orderReasons: nextBundle.order.reasons,
          filesWithinVerifyLimit: nextFilesWithinVerifyLimit,
          flagReady: CHECKOUT_V3_READY,
          forceQuoteOnly,
          showManualReview: false,
        });
        capture("estimate_shown", {
          price_eur_bucket: priceBucket as "<15" | "15-30" | "30-60" | "60-100" | ">100",
          time_to_price_ms: Date.now() - uploadStartMs,
          file_count: nextFiles.filter(f => !f.parseError).length,
          instant_eligible: nextStatus.eligible,
          ineligible_reasons: nextStatus.reasons.join(","),
        });
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
          instant_eligible: nextStatus.eligible,
          ineligible_reasons: nextStatus.reasons.join(","),
          support_cm3: nextBundle.estimates.reduce((s, e) => s + e.supportCm3, 0),
          orientation_saving_eur: nextBundle.savedByOrientationEur,
        });

        // Upload files early (fire-and-forget) so submission is near-instant
        const validForUpload = nextFiles.filter(f => !f.parseError && f.file && f.sizeBytes <= MAX_BYTES);
        const capturedLang = language;
        const capturedMulticolour = multicolour;
        const capturedDefaults: PartDefaults = { ...nextDefaults };
        const capturedScale = { ...scaleByFileId };

        const capturedGzOriginals = [...gzippedOriginalsRef.current];
        gzippedOriginalsRef.current = [];

        (async () => {
          const uploadTimestamp = Date.now();
          const uploadedPaths: string[] = [];
          const uploadedNames: string[] = [];
          const uploadedById: Record<string, string> = {};
          try {
            for (const f of validForUpload) {
              const sanitized = f.name.replace(/[^a-zA-Z0-9.-]/g, "_");
              const path = `${uploadTimestamp}-${sanitized}`;
              const fileScale = capturedScale[f.id] ?? 1;
              let uploadBlob: Blob | File;
              if (fileScale !== 1) {
                const rawBuf = await f.file!.arrayBuffer();
                const scaledBuf = scaleStlBuffer(rawBuf, fileScale);
                uploadBlob = new Blob([scaledBuf], { type: "model/stl" });
              } else {
                uploadBlob = f.file!;
              }
              const { error: uploadErr } = await supabaseAnon.storage
                .from("print-requests")
                .upload(path, uploadBlob);
              if (!uploadErr) {
                uploadedPaths.push(path);
                uploadedNames.push(f.name);
                uploadedById[f.id] = path;
              }
            }
            // Upload gzipped originals (fire-and-forget; errors are non-fatal)
            for (const gz of capturedGzOriginals) {
              const sanitized = gz.gzName.replace(/[^a-zA-Z0-9.-]/g, "_");
              await supabaseAnon.storage
                .from("print-requests")
                .upload(`${uploadTimestamp}-${sanitized}`, new Blob([gz.buf], { type: "application/gzip" }))
                .catch(() => { /* non-fatal */ });
            }
            uploadedRef.current = { paths: uploadedPaths, names: uploadedNames, byId: uploadedById };
            setPreUploadDone(true);
          } catch (e) {
            console.error("Pre-estimate upload failed:", e);
            setPreUploadDone(true);
            // uploadedRef stays null — submitQuote will run the fallback upload loop
          }

          // Insert price_estimates per valid file (free — feeds the admin Price Log)
          const batchFiles: Array<{
            fileName: string; material: string; infillPct: number; quantity: number;
            volumeCm3: number; grams: number; estHours: number; exactPrice: number;
          }> = [];
          let batchTotalCents = 0;
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
            batchFiles.push({ fileName: f.name, material: eff.material, infillPct: eff.infill, quantity: f.qty, volumeCm3: f.volumeMm3 / 1000, grams: gr, estHours: hrs, exactPrice });
            batchTotalCents += singleOrder.totalCents;
          }

          // One email per upload batch — client-side guard against re-estimates within 10 min
          if (batchFiles.length > 0) {
            const phSid = get_session_id() ?? null;
            const batchKey = (phSid ?? "no-sid") + "|" + batchFiles.map(f => f.fileName).sort().join(",");
            const now = Date.now();
            const TEN_MIN = 10 * 60 * 1000;
            const alreadySent = sentEstimateRef.current?.key === batchKey && (now - sentEstimateRef.current.sentAt) < TEN_MIN;
            if (!alreadySent) {
              sentEstimateRef.current = { key: batchKey, sentAt: now };
              supabase.functions.invoke("send-price-estimate", {
                body: {
                  files: batchFiles,
                  totalPrice: batchTotalCents / 100,
                  fileCount: batchFiles.length,
                  filePaths: uploadedPaths,
                  fileNames: uploadedNames,
                  language: capturedLang,
                  sourceCity: refCity ?? null,
                  sourcePath: window.location.pathname,
                  phDistinctId: get_distinct_id() ?? null,
                  phSessionId: phSid,
                },
              }).catch(console.error);
            }
          }
        })();
      }
      // Open confirmation modal for any file addition — includes image, link, and parse-error files
      if (!modalShownRef.current && !hasSubmitted && results.length > 0) {
        modalShownRef.current = true;
        setMobileModalOpen(true);
        capture('estimate_modal_shown', { has_bundle: !!nextBundle });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files, "drop");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) processFiles(files, "click");
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
    setContactName("");
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
    setQuoteRef(null);
    setMobileModalOpen(false);
    setMobileViewerExpanded(false);
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
    capture('whatsapp_from_modal', { source: 'calculator' });
    capture('whatsapp_click', { source: 'calculator', location: 'calculator', path: window.location.pathname });
    const msg =
      language === "ca" ? "Hola, m'agradaria obtenir un pressupost exacte per als meus arxius 3D." :
      language === "es" ? "Hola, me gustaría obtener un presupuesto exacto para mis archivos 3D." :
      "Hi, I'd like to get an exact quote for my 3D prints.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleImageSubmit = async (fileId: string, imageFile: File) => {
    const desc = imageDescriptions[fileId] ?? "";
    setImageSubmitting(prev => ({ ...prev, [fileId]: true }));
    setImageSubmitError(prev => ({ ...prev, [fileId]: "" }));
    try {
      const timestamp = Date.now();
      const sanitized = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${timestamp}-${sanitized}`;
      const { error: uploadErr } = await supabaseAnon.storage.from("print-requests").upload(path, imageFile);
      if (uploadErr) throw uploadErr;
      const { error: invokeErr } = await supabase.functions.invoke("send-quote-request", {
        body: {
          filePaths: [path],
          fileNames: [imageFile.name],
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          color: `FOTO / DISEÑO | ${desc}`,
          material: "PLA",
          urgency: "standard",
          infillPct: 15,
          wallLoops: 2,
          totalGrams: 0,
          totalHours: 0,
          totalUnits: 1,
          priceLow: 0,
          priceHigh: 0,
          priceExact: 0,
          language,
          multicolour: false,
          sourceCity: refCity ?? null,
          pieces: [],
          sourcePath: window.location.pathname,
          sourceUrl: `${window.location.origin}${window.location.pathname}`,
          pageLanguage: language,
          browserLanguage: typeof navigator !== "undefined" ? navigator.language : null,
          referrer: null,
          utm: null,
          fulfillment: null,
        },
      });
      if (invokeErr) throw invokeErr;
      capture("image_design_request_submitted", { lang: language });
      setImageSubmitted(prev => ({ ...prev, [fileId]: true }));
    } catch (e) {
      console.error("image submit error:", e);
      setImageSubmitError(prev => ({ ...prev, [fileId]: t("calc.image.submit.error") }));
    }
    setImageSubmitting(prev => ({ ...prev, [fileId]: false }));
  };

  const handleLinkSubmit = async (fileId: string, fileName: string) => {
    const link = linkValues[fileId] ?? "";
    if (!link.trim()) return;
    setLinkSubmitting(prev => ({ ...prev, [fileId]: true }));
    try {
      await supabase.functions.invoke("send-quote-request", {
        body: {
          filePaths: [],
          fileNames: [fileName],
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          color: `LARGE FILE LINK: ${link.trim()}`,
          material: materialKey,
          urgency,
          infillPct,
          wallLoops,
          totalGrams: 0,
          totalHours: 0,
          totalUnits: 1,
          priceLow: 0,
          priceHigh: 0,
          priceExact: 0,
          language,
          multicolour: false,
          sourceCity: refCity ?? null,
          pieces: [],
          sourcePath: window.location.pathname,
          sourceUrl: `${window.location.origin}${window.location.pathname}`,
          pageLanguage: language,
          browserLanguage: typeof navigator !== "undefined" ? navigator.language : null,
          referrer: null,
          utm: null,
          fulfillment: null,
        },
      });
      capture("link_file_submitted", { lang: language });
      setLinkSubmitted(prev => ({ ...prev, [fileId]: true }));
    } catch (e) {
      console.error("link submit error:", e);
    }
    setLinkSubmitting(prev => ({ ...prev, [fileId]: false }));
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

  const handleMaterialChange = (v: string) => { setMaterialKey(v); capture('config_changed', { field: 'material', value: v }); };
  const handleUrgencyChange = (v: "standard" | "express" | "urgent") => { setUrgency(v); capture('config_changed', { field: 'urgency', value: v }); };
  const handleColorChange = (v: string) => { setColorPref(v); capture('config_changed', { field: 'colour', value: v }); };
  const handleQualityChange = (v: typeof quality) => { setQuality(v); capture('config_changed', { field: 'quality', value: v }); };

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

  // Reset manual-review whenever any eligibility driver changes (files, quantities, settings).
  // This ensures a new upload always shows the Buy button fresh.
  useEffect(() => {
    setShowManualReview(false);
    setFulfillmentAttempted(false);
  }, [parsedFiles, materialKey, colorPref, multicolour, quality, supports, orientation, urgency, infillPct, wallLoops]);

  // Pre-select fulfillment: shipping everywhere, pickup on pages that offer it (STEP 2.1).
  useEffect(() => {
    setFulfillment(refPickupAvailable ? "pickup" : "shipping");
  }, [language, refCity, refPickupAvailable]);

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
      capture('checkout_returned', { result: 'success' });
      // Dedup: only fire instant_checkout_completed once per browser session
      const completedKey = "dim3d-checkout-completed";
      const alreadyFired = (() => { try { return !!sessionStorage.getItem(completedKey); } catch { return false; } })();
      if (!alreadyFired) {
        try { sessionStorage.setItem(completedKey, "1"); } catch { /* ignore */ }
        capture('instant_checkout_completed', stash as {
          value?: number; shipping_fee?: number; currency?: string;
          fulfillment?: "pickup" | "shipping"; product_type?: string;
          part_slug?: string; file_count?: number; total_units?: number; material?: string;
        });
      }
    } else if (co === "cancelled") {
      setCheckoutResult("cancelled");
      capture('checkout_returned', { result: 'cancelled' });
      capture('instant_checkout_cancelled');
    }
  }, []);

  const handleInstantBuy = async () => {
    const priceMidForBucket = bundle ? (bundle.low + bundle.high) / 2 : 0;
    const bucket = priceMidForBucket < 15 ? "<15" : priceMidForBucket < 30 ? "15-30" : priceMidForBucket < 60 ? "30-60" : priceMidForBucket < 100 ? "60-100" : ">100";
    capture('buy_clicked', { price_eur_bucket: bucket });
    if (fulfillment === null) {
      capture('buy_blocked', { reason: 'no_fulfillment' });
      setFulfillmentAttempted(true);
      const el = fulfillmentPickerRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        el.focus();
      }
      return;
    }
    // If an email was typed but is invalid, show the error (phone is not required for Stripe)
    if (contactEmail.trim() && !isValidEmail(contactEmail)) {
      capture('buy_blocked', { reason: 'invalid_email' });
      setContactTouched(true);
      return;
    }
    if (!uploadedRef.current || instantTotalPrice === null) {
      capture('buy_blocked', { reason: 'uploading' });
      setCheckoutErrorCode("UPLOADING");
      setCheckoutError(t("calc.checkout.error.fileNotFound"));
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError(null);
    setCheckoutErrorCode(null);
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
        returnPath: window.location.pathname,
        sourcePath: window.location.pathname,
        pageLanguage: language,
      });
      const { data, error } = await supabase.functions.invoke("create-instant-checkout", {
        body: checkoutBodyPayload,
      });
      if (error) {
        // Read the actual JSON error code from the edge function response
        let code = "UNKNOWN";
        let httpStatus = 0;
        try {
          const ctx = (error as any)?.context;
          if (ctx) {
            httpStatus = (ctx as Response).status ?? 0;
            const json = await (ctx as Response).json();
            code = json?.error ?? "UNKNOWN";
            console.error("create-instant-checkout error:", code, json);
          }
        } catch { console.error("checkout error (raw):", (error as any)?.message); }
        capture('checkout_failed', { code, http_status: httpStatus, price_eur: chargedPrice, file_count: validFiles.length });
        setIsCheckingOut(false);
        setCheckoutErrorCode(code);
        if (code === "FILE_NOT_FOUND") setCheckoutError(t("calc.checkout.error.fileNotFound"));
        else if (code === "PRICE_MISMATCH") setCheckoutError(t("calc.checkout.error.priceMismatch"));
        else setCheckoutError(t("calc.checkout.error.default"));
        return;
      }
      if (!data?.checkoutUrl) {
        capture('checkout_failed', { code: 'NO_URL', http_status: 200, price_eur: chargedPrice, file_count: validFiles.length });
        setIsCheckingOut(false);
        setCheckoutErrorCode("NO_URL");
        setCheckoutError(t("calc.checkout.error.default"));
        return;
      }
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
      capture('stripe_redirect', { price_eur: chargedPrice, fulfillment: fulfillment ?? undefined });
      if (checkoutRef) identifyUser(checkoutRef);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      capture('checkout_failed', { code: 'EXCEPTION', http_status: 0, price_eur: chargedPrice, file_count: validFiles.length });
      setIsCheckingOut(false);
      setCheckoutErrorCode("EXCEPTION");
      setCheckoutError(t("calc.checkout.error.default"));
    }
  };

  const handleManualReview = () => {
    capture('review_clicked', { source: 'modal' });
    const cc = checkContact(contactEmail, contactPhone);
    setContactTouched(true);
    if (!cc.ok) {
      setQuoteError(t("calc.contact.atLeastOne"));
      capture('review_blocked', { reason: 'missing_contact' });
      capture('review_blocked_missing_contact', { code: cc.code });
      return;
    }
    setQuoteError(null);
    setShowManualReview(true);
    submitQuote();
  };

  const handleSendOrderAfterCheckoutFail = () => {
    const code = checkoutErrorCode ?? "UNKNOWN";
    capture('checkout_failed_send_order', { code });
    const cc = checkContact(contactEmail, contactPhone);
    setContactTouched(true);
    if (!cc.ok) {
      setQuoteError(t("calc.contact.atLeastOne"));
      return;
    }
    checkoutFailureNoteRef.current = `INSTANT CHECKOUT FAILED: ${code} — send Stripe payment link`;
    setQuoteError(null);
    setShowManualReview(true);
    submitQuote();
  };

  const handleSendForFreeReview = (fileId: string) => {
    const file = parsedFiles.find(f => f.id === fileId);
    capture('parse_error_free_review_click', { name: file?.name });
    const cc = checkContact(contactEmail, contactPhone);
    setContactTouched(true);
    if (!cc.ok) {
      setQuoteError(t("calc.contact.atLeastOne"));
      return;
    }
    checkoutFailureNoteRef.current = `PARSE ERROR: ${file?.name ?? fileId}`;
    setQuoteError(null);
    submitQuote();
  };

  const submitQuote = async () => {
    const cc = checkContact(contactEmail, contactPhone);
    if (!cc.ok) {
      setContactTouched(true);
      setQuoteError(t("calc.contact.atLeastOne"));
      capture('review_blocked', { reason: 'missing_contact' });
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
      const failureNote = checkoutFailureNoteRef.current;
      checkoutFailureNoteRef.current = null;
      const colorWithNotes = [colorPref.trim(), notesText.trim(), contactName.trim() ? `Name: ${contactName.trim()}` : "", failureNote ?? ""].filter(Boolean).join(' | ') || null;

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

      // DB write — await so success is only shown when the request is stored.
      // Use anon client so an admin session in localStorage doesn't trigger a 42501 error.
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

      const { error: insertErr } = await supabaseAnon
        .from("quote_requests")
        .insert(insertPayload);
      if (insertErr) {
        console.error("quote_requests insert failed:", insertErr);
        capture("submit_error", { stage: "quote", table: "quote_requests", code: insertErr.code ?? "unknown" });
        setQuoteError(t("calc.contact.uploadError"));
        setIsSubmittingQuote(false);
        return;
      }

      // Email — await with 8 s timeout; failure captured but does not block success
      const emailBody = {
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
        // Source tracking (Item 6)
        sourcePath: window.location.pathname,
        sourceUrl: `${window.location.origin}${window.location.pathname}`,
        pageLanguage: language,
        browserLanguage: typeof navigator !== "undefined" ? navigator.language : null,
        referrer: typeof document !== "undefined" && document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return null; } })() : null,
        utm: storedUtm ?? null,
        fulfillment,
      };
      try {
        await Promise.race([
          supabase.functions.invoke("send-quote-request", { body: emailBody }),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error("email_timeout")), 8000)),
        ]);
      } catch (emailErr: any) {
        console.error("send-quote-request failed:", emailErr);
        capture("submit_error", { stage: "quote", table: "send_quote_request", code: emailErr?.message ?? "email_failed" });
      }

      // Request stored — show success with reference
      setQuoteRef(quote_id.slice(0, 8).toUpperCase());
      setIsSubmittedQuote(true);
      setShowManualReview(false);
      setIsSubmittingQuote(false);
      markLeadSubmitted();
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
      capture('review_blocked', { reason: 'exit_intent_missing_contact' });
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
      const { error: sendErr } = await supabase.functions.invoke("send-quote-request", {
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
          sourcePath: window.location.pathname,
          sourceUrl: `${window.location.origin}${window.location.pathname}`,
          pageLanguage: language,
          browserLanguage: typeof navigator !== "undefined" ? navigator.language : null,
          referrer: typeof document !== "undefined" && document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return null; } })() : null,
          utm: exitUtm ?? null,
          fulfillment,
        },
      });
      if (sendErr) throw sendErr;
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

  const submitExitIntentFailed = async () => {
    if (!exitPopupLinkValue.trim() && !contactEmail.trim()) return;
    setExitPopupLinkSubmitting(true);
    try {
      const exitUtm = getStoredUTM();
      const { error: insertErr } = await supabaseAnon
        .from("quote_requests")
        .insert({
          id: crypto.randomUUID(),
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          material: materialKey,
          infill: String(infillPct),
          wall_loops: wallLoops,
          quantity: 1,
          estimated_grams: 0,
          estimated_hours: 0,
          estimated_price_low: 0,
          estimated_price_high: 0,
          file_paths: [],
          status: "pending",
          customization: { fileLink: exitPopupLinkValue.trim() } as unknown as import("@/integrations/supabase/types").Json,
          utm_source: exitUtm?.utm_source ?? null,
          utm_medium: exitUtm?.utm_medium ?? null,
          utm_content: exitUtm?.utm_content ?? null,
          source_path: window.location.pathname,
          page_language: language,
        });
      if (insertErr) throw new Error(insertErr.message);
      capture("exit_popup_action", { action: "failed_link_sent" });
      setExitPopupLinkSubmitting(false);
      setExitPopupLinkSubmitted(true);
      setTimeout(() => setShowExitIntent(false), 2000);
    } catch (err: any) {
      setExitPopupLinkSubmitting(false);
      console.error("exit-intent failed submit error:", err);
    }
  };

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
  };

  // Price display — multicolour shows "from €X", instant-buy shows exact, normal shows "€X" (exact v3 price)
  const lang = language as Language;
  const priceDisplay = bundle
    ? anyMulticolour
      ? `${t("calc.multicolour.from")} ${formatEUR(Math.floor(bundle.total), lang)}+`
      : instantBuyEligible && instantTotalPrice !== null
        ? formatEUR(instantTotalPrice, lang)
        : formatEUR(bundle.total - autumnDiscountCents / 100, lang)
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
          accept=".stl,.obj,.3mf,.glb,.jpg,.jpeg,.png,.heic,.webp,.pdf"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        {/* Drop zone / add-more */}
        {parsedFiles.length === 0 ? (
          <div ref={uploadAreaExposureRef}>
            {/* Variant A (control): current copy */}
            <div data-xp-slot="upload_area_r1" data-xp-v="A">
              <div
                {...dragHandlers}
                data-ph-name="upload"
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
            </div>

            {/* Variant B: bigger drop zone with file types + WhatsApp link */}
            <div data-xp-slot="upload_area_r1" data-xp-v="B">
              <div
                {...dragHandlers}
                data-ph-name="upload"
                onClick={() => inputRef.current?.click()}
                className={`relative border-[3px] border-dashed rounded-xl p-12 text-center cursor-pointer transition-all select-none ${
                  isDragging ? "border-accent bg-accent/10" : "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/8"
                }`}
              >
                <Calculator className="w-14 h-14 text-accent mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground mb-1">{t("calc.drop")}</p>
                <p className="text-sm text-muted-foreground mb-2">{t("calc.dropSub")}</p>
                <p className="text-xs font-mono text-accent/80 tracking-wider">STL · 3MF · OBJ · STEP</p>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                {t("xp.uploadArea.b.noFile")}{" "}
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(t("xp.uploadArea.b.whatsappMsg"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-whatsapp hover:underline"
                  onClick={() => capture("whatsapp_from_modal", { source: "upload_area_b" })}
                >
                  {t("xp.uploadArea.b.whatsappLink")}
                </a>
              </p>
            </div>

            {/* Variant C: control drop zone + 3-step mini guide */}
            <div data-xp-slot="upload_area_r1" data-xp-v="C">
              <div
                {...dragHandlers}
                onClick={() => inputRef.current?.click()}
                className={`relative border-[3px] border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none ${
                  isDragging ? "border-accent bg-accent/10" : "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/8"
                }`}
              >
                <Calculator className="w-12 h-12 text-accent mx-auto mb-3" />
                <p className="text-base font-semibold text-foreground mb-1">{t("calc.drop")}</p>
                <p className="text-sm text-muted-foreground mb-3">{t("calc.dropSub")}</p>
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <span>1 {t("xp.uploadArea.c.step1")}</span>
                  <span>·</span>
                  <span>2 {t("xp.uploadArea.c.step2")}</span>
                  <span>·</span>
                  <span>3 {t("xp.uploadArea.c.step3")}</span>
                </div>
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
            </div>
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
            onMaterialChange={handleMaterialChange}
            onColorChange={handleColorChange}
            onInfillChange={setInfillPct}
            onWallLoopsChange={setWallLoops}
            onMulticolourChange={setMulticolour}
            onUrgencyChange={handleUrgencyChange}
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

        {/* Parsing / preparation spinner */}
        {(parsing || prepareProgress) && (
          <div className="mt-6 flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {prepareProgress
                ? t(prepareProgress.stage === "simplifying"
                    ? "calc.prepare.simplifying"
                    : "calc.prepare.converting"
                  ).replace("{pct}", String(prepareProgress.pct))
                : t("calc.analysing")}
            </div>
            {!prepareProgress && parsingHasLargeFile && (
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
                    {t("calc.student.discount")}
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
                  {quoteRef && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono">{t("calc.contact.success.ref").replace("{ref}", quoteRef)}</p>
                  )}
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
                      language={language}
                      scaleFactor={scaleByFileId[stepperFile.id] ?? 1}
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
                language={lang}
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
                onMaterialChange={handleMaterialChange}
                activeUseCase={activeUseCase}
                onUseCaseChange={setActiveUseCase}
                colorPref={colorPref}
                onColorChange={handleColorChange}
                notesText={notesText}
                onNotesChange={setNotesText}
                quality={quality}
                onQualityChange={handleQualityChange}
                infillPct={infillPct}
                wallLoops={wallLoops}
                onInfillChange={setInfillPct}
                onWallLoopsChange={setWallLoops}
                supports={supports}
                onSupportsChange={setSupports}
                orientation={orientation}
                onOrientationChange={setOrientation}
                urgency={urgency}
                onUrgencyChange={handleUrgencyChange}
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
      {!adminMode && (bundle || parsedFiles.some(f => f.imageFile || f.linkFile || !!f.parseError)) && (() => {
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
          onFulfillmentChange: (v: "pickup" | "shipping") => { setFulfillment(v); setFulfillmentAttempted(false); capture('fulfillment_chosen', { type: v }); },
          pickupCity,
          contactEmail,
          contactPhone,
          contactTouched,
          quoteError,
          checkoutError,
          checkoutErrorCode,
          oversizedFiles,
          onContactEmailChange: (v: string) => { setContactEmail(v); if (v.length === 1) capture('contact_entered', { field: 'email' }); },
          onContactPhoneChange: (v: string) => { setContactPhone(v); if (v.length === 1) capture('contact_entered', { field: 'phone' }); },
          contactName,
          onContactNameChange: setContactName,
          onBuyButtonVisible: () => {
            const device = window.innerWidth < 1024 ? "mobile" : "desktop";
            capture("buy_button_visible", {
              device,
              files: validFiles.length,
              lang: language,
              instant_eligible: instantBuyEligible,
              ineligible_reasons: ineligibleReasons.join(","),
              actions_branch: instantBuyEligible ? "buy" : "quote",
            });
          },
          autumnDiscountCents,
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
          onSendOrderAfterCheckoutFail: handleSendOrderAfterCheckoutFail,
          onWhatsApp: handleWhatsApp,
          language,
          t,
          materialOptions,
          adminMode,
          anyMulticolour,
          instantTotalPrice,
          fulfillmentPickerRef,
          ineligibleReasons,
          supportHeavy: bundle?.supportHeavy ?? false,
          urgency,
        } as const;

        const leftSlot = (
          <div
            className="flex flex-col flex-1 min-h-0 p-4 gap-3"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={(e) => { setIsDragging(false); handleDrop(e); }}
          >
            {/* Viewer — 140px thumbnail on mobile, expand button; full height on desktop */}
            {stepperFile?.file && !stepperFile.imageFile && viewerStateInModal !== "failed" && (() => {
              const eff = effectivePartSettings(stepperFile, defaults);
              const isMulti = eff.multicolour;
              const viewerColour = isMulti ? undefined : (eff.color || undefined);
              return (
                <div className={`relative rounded-xl border border-border bg-muted/20 overflow-hidden transition-all ${
                  mobileViewerExpanded
                    ? "flex-1 min-h-[200px] max-h-[340px]"
                    : "lg:flex-1 lg:min-h-[200px] lg:max-h-[340px] max-lg:h-[140px] shrink-0"
                }`}>
                  <Suspense fallback={<div className="w-full h-full bg-muted/20 animate-pulse" />}>
                    <StlViewer
                      key={`${stepperFile.id}-dialog`}
                      file={stepperFile.file}
                      colour={viewerColour}
                      touchAction={mobileViewerExpanded ? undefined : "pan-y"}
                      onReady={() => setViewerStateInModal("ready")}
                      onError={() => setViewerStateInModal("failed")}
                      language={language}
                      scaleFactor={scaleByFileId[stepperFile.id] ?? 1}
                      onScaleChange={(s) => setScaleByFileId(prev => ({ ...prev, [stepperFile.id]: s }))}
                      massGrams={bundle?.orderResult.parts[validFiles.indexOf(stepperFile)]?.gramsPerUnit}
                      showScaleControl={advancedMode}
                    />
                  </Suspense>
                  {viewerStateInModal === "ready" && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground bg-background/75 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                        {isMulti ? t("calc.viewer.multicolourCaption") : t("calc.modal.dragHint")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileViewerExpanded(v => !v)}
                        className="lg:hidden text-[11px] text-accent bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap"
                      >
                        {mobileViewerExpanded ? "↑" : t("calc.viewer.expand")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Image design-request cards */}
            {parsedFiles.filter(f => f.imageFile).map(f => (
              <div key={f.id} className="shrink-0 rounded-xl border border-border bg-accent/5 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold">{t("calc.image.card.title")}</p>
                    <p className="text-xs text-muted-foreground">{t("calc.image.card.body")}</p>
                  </div>
                  <button type="button" onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {imageSubmitted[f.id] ? (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {t("calc.image.submit.success")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-mono truncate">{f.name}</p>
                    <textarea
                      rows={2}
                      value={imageDescriptions[f.id] ?? ""}
                      onChange={e => setImageDescriptions(prev => ({ ...prev, [f.id]: e.target.value }))}
                      placeholder={t("calc.image.card.desc.placeholder")}
                      disabled={imageSubmitting[f.id]}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <ContactFields
                      email={contactEmail}
                      phone={contactPhone}
                      touched={contactTouched}
                      disabled={imageSubmitting[f.id]}
                      t={t}
                      onEmailChange={v => { setContactEmail(v); if (v.length === 1) capture('contact_entered', { field: 'email' }); }}
                      onPhoneChange={v => { setContactPhone(v); if (v.length === 1) capture('contact_entered', { field: 'phone' }); }}
                    />
                    {imageSubmitError[f.id] && (
                      <p className="text-xs text-destructive">{imageSubmitError[f.id]}</p>
                    )}
                    <Button
                      variant="cta"
                      size="sm"
                      className="w-full"
                      disabled={imageSubmitting[f.id] || (!contactEmail.trim() && !contactPhone.trim())}
                      onClick={() => f.file && handleImageSubmit(f.id, f.file)}
                    >
                      {imageSubmitting[f.id]
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />{t("calc.image.card.submitting")}</>
                        : t("calc.image.card.submit")}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Large-file link cards */}
            {parsedFiles.filter(f => f.linkFile).map(f => (
              <div key={f.id} className="shrink-0 rounded-xl border border-border bg-amber-50 dark:bg-amber-950/20 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold">{t("calc.upload.link.title")}</p>
                    <p className="text-xs text-muted-foreground">{t("calc.upload.link.body")}</p>
                  </div>
                  <button type="button" onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {linkSubmitted[f.id] ? (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {t("calc.exitIntent.success")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-mono truncate">{f.name}</p>
                    <input
                      type="url"
                      value={linkValues[f.id] ?? ""}
                      onChange={e => setLinkValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                      placeholder={t("calc.upload.link.placeholder")}
                      disabled={linkSubmitting[f.id]}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder={t("calc.exitIntent.email")}
                      disabled={linkSubmitting[f.id]}
                      data-ph-mask
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={linkSubmitting[f.id] || !(linkValues[f.id] ?? "").trim()}
                      onClick={() => handleLinkSubmit(f.id, f.name)}
                    >
                      {linkSubmitting[f.id]
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />{t("calc.contact.submitting")}</>
                        : t("calc.upload.link.submit")}
                    </Button>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-whatsapp text-whatsapp text-xs font-medium hover:bg-whatsapp/10 transition-colors"
                    >
                      {t("calc.result.whatsapp.short")}
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* Parts list — qty steppers + remove + price + select */}
            <PartSummaryList
              parsedFiles={parsedFiles.filter(f => !f.imageFile && !f.linkFile)}
              viewableFiles={viewableFiles}
              defaults={defaults}
              selectedFileIndex={selectedFileIndex}
              costByFileId={costByFileId}
              disabled={isCheckingOut || isSubmittingQuote}
              t={t}
              language={lang}
              onSelect={(idx, id) => {
                setSelectedFileIndex(idx);
                if (advancedMode) handleScopeChange(id);
              }}
              onQtyChange={updateQty}
              onRemove={removeFile}
              onFreeReview={handleSendForFreeReview}
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
                data-ph-name="add-more-files"
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
            {quoteRef && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">{t("calc.contact.success.ref").replace("{ref}", quoteRef)}</p>
            )}
          </div>
        ) : !bundle ? (
          // Image/link/parse-error only: show 3-step flow + contact form
          <div className="space-y-4">
            <div className="space-y-2">
              {([1, 2, 3] as const).map(n => (
                <div key={n} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-semibold flex items-center justify-center mt-0.5">{n}</span>
                  <p className="text-sm text-muted-foreground">{t(`calc.image.steps.${n}`)}</p>
                </div>
              ))}
            </div>
            <OrderPanel
              {...sharedOrderPanelProps}
              hideParts={true}
              section="form"
            />
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
              onMaterialChange={handleMaterialChange}
              activeUseCase={activeUseCase}
              onUseCaseChange={setActiveUseCase}
              colorPref={colorPref}
              onColorChange={handleColorChange}
              notesText={notesText}
              onNotesChange={setNotesText}
              quality={quality}
              onQualityChange={handleQualityChange}
              infillPct={infillPct}
              wallLoops={wallLoops}
              onInfillChange={setInfillPct}
              onWallLoopsChange={setWallLoops}
              supports={supports}
              onSupportsChange={setSupports}
              orientation={orientation}
              onOrientationChange={setOrientation}
              urgency={urgency}
              onUrgencyChange={handleUrgencyChange}
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
              if (open) {
                modalOpenTimeRef.current = Date.now();
              } else if (modalOpenTimeRef.current) {
                const openMs = Date.now() - modalOpenTimeRef.current;
                capture('modal_time_open', { duration_ms: openMs });
                const wasLongEnough = openMs >= 5000;
                modalOpenTimeRef.current = null;
                // Exit survey replaces exit-intent when modal was open ≥5s and no lead yet
                if (!open && !isSubmittedQuote && !showManualReview && !isCheckingOut && checkoutResult !== "success"
                    && wasLongEnough && !hasExitSurveyBeenShown() && !hasLeadBeenSubmitted()) {
                  setShowExitSurvey(true);
                  // Store the price bucket for the survey
                  if (bundle) {
                    const mid = (bundle.low + bundle.high) / 2;
                    exitSurveyPriceBucket.current = mid < 15 ? "<15" : mid < 30 ? "15-30" : mid < 60 ? "30-60" : mid < 100 ? "60-100" : ">100";
                  }
                  return; // skip exit-intent when showing exit survey
                }
              }
              if (!open && parsedFiles.length > 0 && checkoutResult !== "success" && !showManualReview && !isSubmittedQuote && !isCheckingOut) {
                const alreadyShown = (() => { try { return !!sessionStorage.getItem("dim3d-exit-intent-shown"); } catch { return false; } })();
                if (!alreadyShown) {
                  if (exitIntentTimerRef.current) clearTimeout(exitIntentTimerRef.current);
                  const variant = (instantBuyEligible && instantTotalPrice !== null) ? 'priced'
                    : validFiles.length > 0 ? 'quote' : 'failed';
                  exitIntentTimerRef.current = setTimeout(() => {
                    setExitPopupVariant(variant);
                    setShowExitIntent(true);
                    try { sessionStorage.setItem("dim3d-exit-intent-shown", "1"); } catch {}
                  }, 500);
                }
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
              <p className="font-semibold text-foreground">{t("calc.checkout.success.banner.title")}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{t("calc.checkout.success.banner.body")}</p>
            </div>
          </div>
        )}
        {checkoutResult === "cancelled" && (
          <div className="max-w-xl mx-auto mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{t("calc.checkout.cancelled.title")}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{t("calc.checkout.cancelled.body")}</p>
            </div>
          </div>
        )}
        {refCity && (
          <div className="max-w-xl mx-auto mb-6">
            <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 text-center">
              {refPickupAvailable
                ? t("calc.ref.pickup.banner").replace("{city}", refCity)
                : t("calc.ref.shipping.banner").replace("{city}", refCity) +
                  (refDays ? t("calc.ref.shipping.days").replace("{days}", refDays) : "")}
            </p>
          </div>
        )}
        {inner}

        {/* Exit-intent dialog — 3 variants: priced, quote, failed */}
        <Dialog
          open={showExitIntent}
          onOpenChange={(open) => {
            if (!open && exitIntentCloseReasonRef.current === null) {
              capture("exit_intent_dismissed");
              capture("exit_popup_action", { action: "dismissed" });
            }
            exitIntentCloseReasonRef.current = null;
            setShowExitIntent(open);
          }}
        >
          <DialogContent data-testid="exit-popup" className="sm:max-w-sm p-8 gap-0 [&>button.absolute]:hidden">
            {exitIntentSubmitted || exitPopupLinkSubmitted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-whatsapp mx-auto mb-3" />
                <p className="font-semibold text-foreground">{t("calc.exitIntent.success")}</p>
              </div>
            ) : exitPopupVariant === 'priced' ? (
              /* ── Priced variant ── */
              <div className="space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-foreground leading-snug">
                    {t("calc.abandon.headline").replace("{price}", formatEUR(instantTotalPrice ?? chargedPrice, lang))}
                  </DialogTitle>
                </DialogHeader>
                <Button
                  variant="cta"
                  className="w-full gap-2"
                  data-ph-name="abandon-recover"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "recovered";
                    capture("exit_intent_recovered");
                    capture("exit_popup_action", { action: "back_to_order" });
                    setShowExitIntent(false);
                    setMobileModalOpen(true);
                  }}
                >
                  {t("calc.abandon.cta")}
                </Button>
                {!exitPopupReviewExpanded ? (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors px-3"
                    onClick={() => {
                      setExitPopupReviewExpanded(true);
                      capture("exit_popup_action", { action: "review_expand" });
                    }}
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    {t("calc.exitPopup.priced.reviewCta")}
                  </button>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); submitExitIntent(); }} className="space-y-2">
                    <p className="text-xs font-medium text-foreground">{t("calc.exitPopup.priced.reviewCta")}</p>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder={t("calc.exitIntent.email")}
                      disabled={exitIntentSubmitting}
                      data-ph-mask
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder={t("calc.exitIntent.phone")}
                      disabled={exitIntentSubmitting}
                      data-ph-mask
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    {exitIntentError && <p className="text-xs text-destructive">{exitIntentError}</p>}
                    <Button type="submit" variant="outline" size="sm" className="w-full gap-1.5" disabled={exitIntentSubmitting}>
                      {exitIntentSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t("calc.contact.submitting")}</> : <><Send className="w-3.5 h-3.5" />{t("calc.exitIntent.cta")}</>}
                    </Button>
                  </form>
                )}
                <button
                  type="button"
                  data-testid="exit-popup-dismiss"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center pt-1"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "dismissed";
                    capture("exit_intent_dismissed");
                    capture("exit_popup_action", { action: "dismissed" });
                    setShowExitIntent(false);
                  }}
                >
                  {t("calc.abandon.dismiss")}
                </button>
              </div>
            ) : exitPopupVariant === 'quote' ? (
              /* ── Quote-only variant ── */
              <div className="space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-foreground leading-snug">
                    {t("calc.exitPopup.quote.headline")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={e => { e.preventDefault(); submitExitIntent(); }} className="space-y-2">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder={t("calc.exitIntent.email")}
                    disabled={exitIntentSubmitting}
                    data-ph-mask
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder={t("calc.exitIntent.phone")}
                    disabled={exitIntentSubmitting}
                    data-ph-mask
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  {exitIntentError && <p className="text-xs text-destructive">{exitIntentError}</p>}
                  <Button type="submit" variant="cta" className="w-full gap-2" disabled={exitIntentSubmitting}>
                    {exitIntentSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</> : <><Send className="w-4 h-4" />{t("calc.exitPopup.quote.sendCta")}</>}
                  </Button>
                </form>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border border-input text-foreground text-sm hover:bg-muted/50 transition-colors px-3"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "recovered";
                    capture("exit_popup_action", { action: "back_to_order" });
                    setShowExitIntent(false);
                    setMobileModalOpen(true);
                  }}
                >
                  {t("calc.abandon.cta")}
                </button>
                <button
                  type="button"
                  data-testid="exit-popup-dismiss"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "dismissed";
                    capture("exit_intent_dismissed");
                    capture("exit_popup_action", { action: "dismissed" });
                    setShowExitIntent(false);
                  }}
                >
                  {t("calc.abandon.dismiss")}
                </button>
              </div>
            ) : (
              /* ── Upload-failed variant ── */
              <div className="space-y-3">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-foreground leading-snug">
                    {t("calc.exitPopup.failed.headline")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={e => { e.preventDefault(); submitExitIntentFailed(); }} className="space-y-2">
                  <input
                    type="url"
                    value={exitPopupLinkValue}
                    onChange={e => setExitPopupLinkValue(e.target.value)}
                    placeholder={t("calc.exitPopup.failed.linkPlaceholder")}
                    disabled={exitPopupLinkSubmitting}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder={t("calc.exitIntent.email")}
                    disabled={exitPopupLinkSubmitting}
                    data-ph-mask
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <Button type="submit" variant="cta" className="w-full gap-2" disabled={exitPopupLinkSubmitting}>
                    {exitPopupLinkSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</> : <><Send className="w-4 h-4" />{t("calc.exitPopup.failed.linkCta")}</>}
                  </Button>
                </form>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl border border-whatsapp text-whatsapp text-sm font-medium hover:bg-whatsapp/10 transition-colors px-3"
                  onClick={() => capture("exit_popup_action", { action: "whatsapp" })}
                >
                  {t("calc.result.whatsapp.short")}
                </a>
                <button
                  type="button"
                  data-testid="exit-popup-dismiss"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  onClick={() => {
                    exitIntentCloseReasonRef.current = "dismissed";
                    capture("exit_intent_dismissed");
                    capture("exit_popup_action", { action: "dismissed" });
                    setShowExitIntent(false);
                  }}
                >
                  {t("calc.abandon.dismiss")}
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {showExitSurvey && (
          <ExitReasonCard
            priceBucket={exitSurveyPriceBucket.current}
            onClose={() => setShowExitSurvey(false)}
          />
        )}
      </div>
    </section>
  );
}

export default StlEstimator;
