import { useRef, useEffect } from "react";
import { checkContact } from "@/lib/contactValidation";

interface ContactFieldsProps {
  email: string;
  phone: string;
  touched: boolean;
  disabled?: boolean;
  t: (key: string) => string;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

export function ContactFields({
  email, phone, touched, disabled, t, onEmailChange, onPhoneChange,
}: ContactFieldsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const check = checkContact(email, phone);
  const showError = touched && !check.ok;
  const emailInvalid = touched && !check.ok && (check.code === 'bad_email' || (!check.emailTyped && !check.phoneTyped));
  const phoneInvalid = touched && !check.ok && (check.code === 'bad_phone');

  // Scroll to container and focus first invalid/empty input when touched becomes true and contact is invalid.
  useEffect(() => {
    if (!touched || check.ok) return;
    containerRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // Focus the first empty or invalid input
    const shouldFocusEmail =
      !check.emailTyped ||
      (check.emailTyped && !check.emailValid && (!check.phoneTyped || !check.phoneValid));
    if (shouldFocusEmail && emailRef.current) {
      emailRef.current.focus();
    } else if (phoneRef.current) {
      phoneRef.current.focus();
    }
  // Only run when touched transitions to true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched]);

  const errorMsg =
    check.code === 'bad_email' ? t("calc.validate.email") :
    check.code === 'bad_phone' ? t("calc.validate.phone") :
    t("calc.validate.contact");

  return (
    <div ref={containerRef} className="space-y-2">
      <input
        ref={emailRef}
        id="contact-email"
        type="email"
        value={email}
        onChange={e => onEmailChange(e.target.value)}
        placeholder={t("calc.contact.email")}
        disabled={disabled}
        aria-invalid={emailInvalid}
        aria-describedby={showError ? "contact-error" : undefined}
        className={`w-full h-11 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 ${
          emailInvalid ? "border-destructive ring-1 ring-destructive/50" : "border-input"
        }`}
      />
      <input
        ref={phoneRef}
        id="contact-phone"
        type="tel"
        value={phone}
        onChange={e => onPhoneChange(e.target.value)}
        placeholder={t("calc.contact.phone")}
        disabled={disabled}
        aria-invalid={phoneInvalid}
        aria-describedby={showError ? "contact-error" : undefined}
        className={`w-full h-11 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 ${
          phoneInvalid ? "border-destructive ring-1 ring-destructive/50" : "border-input"
        }`}
      />
      {showError && (
        <p id="contact-error" role="alert" className="text-xs text-destructive font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

export default ContactFields;
