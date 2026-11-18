import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PublicPromoCode } from "@/lib/usePricingVersion";
import { formatEUR } from "@/lib/formatPrice";
import type { Language } from "@/lib/pathLanguage";
import { isAcademicEmail } from "@/config/academicDomains";
import { whatsappUrl } from "@/config/cities";
import { ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";

export interface AppliedPromo {
  code: string;
  pct: number;
}

interface PromoLineProps {
  /** Active public promo code from the probe (null = no active public code). */
  publicCode: PublicPromoCode | null;
  /** Currently applied code (null = none applied). */
  appliedPromo: AppliedPromo | null;
  /** Print total in cents — used to show the discount amount. */
  printTotalCents: number;
  onApply: (promo: AppliedPromo) => void;
  onRemove: () => void;
  t: (key: string) => string;
  language: Language;
  disabled?: boolean;
}

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

export function PromoLine({
  publicCode,
  appliedPromo,
  printTotalCents,
  onApply,
  onRemove,
  t,
  language,
  disabled = false,
}: PromoLineProps) {
  const [inputCode, setInputCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Student sub-flow
  const [studentOpen, setStudentOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [studentDone, setStudentDone] = useState(false);
  const [studentNotRecognized, setStudentNotRecognized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const discountCents = appliedPromo ? Math.round(printTotalCents * appliedPromo.pct / 100) : 0;

  const handleApplyPublic = () => {
    if (!publicCode || disabled) return;
    onApply({ code: publicCode.code, pct: publicCode.pct });
    capture("promo_applied", { code: publicCode.code, pct: publicCode.pct, source: "public" });
  };

  const handleValidate = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code || validating || disabled) return;
    setValidating(true);
    setError(null);
    try {
      const { data, error: rpcErr } = await (supabase as any).rpc("validate_promo", { p_code: code }) as { data: any; error: any };
      if (rpcErr || !data?.valid) {
        setError(t("calc.promo.invalid"));
        capture("promo_invalid", { code });
      } else {
        onApply({ code, pct: data.pct });
        setInputCode("");
        capture("promo_applied", { code, pct: data.pct, source: "manual" });
      }
    } catch {
      setError(t("calc.promo.invalid"));
    } finally {
      setValidating(false);
    }
  };

  const handleStudentSubmit = async () => {
    const email = studentEmail.trim().toLowerCase();
    if (!email || studentSubmitting) return;
    if (!isAcademicEmail(email)) {
      setStudentNotRecognized(true);
      return;
    }
    setStudentSubmitting(true);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("issue-promo-code", {
        body: { kind: "student", email, language },
      });
      if (invokeErr || !data?.code) {
        setStudentNotRecognized(true);
      } else {
        onApply({ code: data.code, pct: 20 });
        capture("student_code_requested", { email_domain: email.split("@")[1] ?? "unknown" });
        setStudentDone(true);
        setStudentOpen(false);
      }
    } catch {
      setStudentNotRecognized(true);
    } finally {
      setStudentSubmitting(false);
    }
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
        <span>
          {t("calc.promo.applied")
            .replace("{code}", appliedPromo.code)
            .replace("{amount}", formatEUR(discountCents / 100, language))}
        </span>
        <button
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Quitar código"
        >
          {t("calc.promo.remove")}
        </button>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      {!studentOpen && (
        <>
          {/* Public code offer */}
          {publicCode && (
            <div className="flex items-center gap-1.5">
              <button
                className="text-green-600 dark:text-green-400 hover:underline shrink-0"
                onClick={handleApplyPublic}
                disabled={disabled}
              >
                {t("calc.promo.line")
                  .replace("{pct}", String(publicCode.pct))
                  .replace("{code}", publicCode.code)}
              </button>
            </div>
          )}
          {/* Inline code field — always visible */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={e => { setInputCode(e.target.value.toUpperCase()); setError(null); }}
              onKeyDown={e => { if (e.key === "Enter") handleValidate(); if (e.key === "Escape") { setInputCode(""); } }}
              placeholder={t("calc.promo.placeholder")}
              className="w-36 h-6 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={disabled || validating}
              maxLength={32}
            />
            <button
              className="h-6 px-2 rounded-md border border-border text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              onClick={handleValidate}
              disabled={disabled || validating || !inputCode.trim()}
            >
              {validating ? "…" : t("calc.promo.apply")}
            </button>
            {!studentDone && (
              <button
                className="text-muted-foreground hover:underline"
                onClick={() => setStudentOpen(true)}
                disabled={disabled}
              >
                {t("calc.promo.student")}
              </button>
            )}
          </div>
        </>
      )}

      {studentOpen && !studentDone && (
        <div className="space-y-1">
          {!studentNotRecognized ? (
            <div className="flex gap-1.5 items-center">
              <input
                type="email"
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleStudentSubmit(); if (e.key === "Escape") { setStudentOpen(false); setStudentEmail(""); } }}
                placeholder={t("calc.promo.student.email")}
                className="flex-1 h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={studentSubmitting}
                maxLength={100}
              />
              <button
                className="h-7 px-2 rounded-md border border-border text-xs hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                onClick={handleStudentSubmit}
                disabled={studentSubmitting || !studentEmail.trim()}
              >
                {studentSubmitting ? "…" : t("calc.promo.apply")}
              </button>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setStudentOpen(false); setStudentEmail(""); }}
                aria-label="Cerrar"
              >
                {t("calc.promo.remove")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hola, soy estudiante y me gustaría obtener el descuento.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {t("calc.promo.student.notRecognized")}
              </a>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setStudentOpen(false); setStudentEmail(""); setStudentNotRecognized(false); }}
              >
                {t("calc.promo.remove")}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-destructive">{error}</p>
      )}
    </div>
  );
}
