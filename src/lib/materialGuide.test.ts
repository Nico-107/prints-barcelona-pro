import { describe, it, expect } from "vitest";
import { recommendMaterial, strengthFor, STRENGTH_PRESETS, QUALITY_OPTIONS, canPromiseSameDay, USE_CASES } from "./materialGuide";
import { checkContact, isValidEmail, isValidPhone } from "./contactValidation";
import { EST } from "./estimator/core";
import { V3_INSTANT } from "./checkoutV3";

describe("material guide", () => {
  it("recommendations", () => {
    expect(recommendMaterial('decor')).toBe('PLA'); expect(recommendMaterial('car')).toBe('ASA'); expect(recommendMaterial('outdoor')).toBe('ASA');
    expect(recommendMaterial('flexible')).toBe('TPU'); expect(recommendMaterial('everyday')).toBe('PETG'); expect(recommendMaterial('unsure')).toBeNull();
  });
  it("every recommended material is instant-buy", () => { for (const u of USE_CASES) if (u.material) expect(EST.materials[u.material].instant).toBe(true); });
  it("strength presets stay inside the range the server accepts", () => {
    for (const p of STRENGTH_PRESETS) { expect(V3_INSTANT.infill).toContain(p.infill); expect(V3_INSTANT.wallLoops).toContain(p.walls); }
    expect(strengthFor(15, 2)).toBe('standard'); expect(strengthFor(30, 3)).toBe('strong'); expect(strengthFor(15, 3)).toBe('custom');
  });
  it("quality options are known to the engine", () => { for (const q of QUALITY_OPTIONS) { expect(V3_INSTANT.quality).toContain(q.key); expect(EST.quality[q.key]).toBeGreaterThan(0); } });
  it("same-day is never promised for ABS, ASA or Nylon", () => {
    for (const m of ['ABS', 'ASA', 'Nylon']) expect(canPromiseSameDay(m)).toBe(false); for (const m of ['PLA', 'PETG', 'TPU']) expect(canPromiseSameDay(m)).toBe(true);
  });
});

describe("contact validation (the 'Ask our team to check' red-field rule)", () => {
  it("nothing typed -> missing", () => { const c = checkContact('', ''); expect(c.ok).toBe(false); expect(c.code).toBe('missing'); });
  it("whitespace only -> missing", () => expect(checkContact('  ', ' ').code).toBe('missing'));
  it("a valid email alone is enough", () => expect(checkContact('a@b.co', '').ok).toBe(true));
  it("a valid phone alone is enough", () => { expect(checkContact('', '+34 672 051 147').ok).toBe(true); expect(checkContact('', '672051147').ok).toBe(true); });
  it("a bad email with no valid phone is refused with a specific code", () => { expect(checkContact('not-an-email', '').code).toBe('bad_email'); expect(checkContact('', '123').code).toBe('bad_phone'); });
  it("a bad email is fine when the phone is valid", () => expect(checkContact('oops', '672051147').ok).toBe(true));
  it("validators", () => { expect(isValidEmail('x@y.es')).toBe(true); expect(isValidEmail('x@y')).toBe(false); expect(isValidPhone('abc')).toBe(false); expect(isValidPhone('+34 (672) 051-147')).toBe(true); });
});
