/** Contact check used by "Ask our team to check" and by Buy now. At least ONE valid way to reply is required. */
export type ContactCode = 'ok' | 'missing' | 'bad_email' | 'bad_phone';
export interface ContactCheck { ok: boolean; code: ContactCode; emailValid: boolean; phoneValid: boolean; emailTyped: boolean; phoneTyped: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(v: string): boolean { return EMAIL_RE.test(v.trim()); }
export function isValidPhone(v: string): boolean {
  const t = v.trim(); if (!/^[+]?[0-9 ()./-]+$/.test(t)) return false;
  const digits = t.replace(/\D/g, ''); return digits.length >= 7 && digits.length <= 15;
}
export function checkContact(email: string, phone: string): ContactCheck {
  const emailTyped = email.trim().length > 0, phoneTyped = phone.trim().length > 0;
  const emailValid = emailTyped && isValidEmail(email), phoneValid = phoneTyped && isValidPhone(phone);
  const ok = emailValid || phoneValid;
  let code: ContactCode = 'ok';
  if (!ok) code = !emailTyped && !phoneTyped ? 'missing' : emailTyped && !emailValid ? 'bad_email' : 'bad_phone';
  return { ok, code, emailValid, phoneValid, emailTyped, phoneTyped };
}
