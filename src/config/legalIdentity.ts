/**
 * Single source of truth for the owner's legal identity.
 *
 * The owner registered as autónomo (sole trader) in Spain on 13 Nov 2026.
 * Every legal page, the footer legal line, JSON-LD and checkout trust line
 * reads from this file so the address — which may change in January 2027 —
 * can be updated in one place.
 *
 * Marketing copy keeps the first name "Nico"; legal text uses the full
 * registered name below. Never write "S.L.", "company", "empresa
 * registrada", "registered company" or any equivalent — the legal form
 * is "autónomo"; use "negocio registrado" / "registered business" when
 * a noun is unavoidable.
 */

export interface LegalIdentity {
  /** Full legal name as registered with the Agencia Tributaria. */
  ownerFullName: string;
  /** Trading name used on invoices, JSON-LD legalName, Stripe. */
  tradingName: string;
  /** Spanish NIF (ES tax number for sole traders). */
  nif: string;
  /** Registered business address — line + city + postcode. */
  address: {
    street: string;
    floor: string;
    postalCode: string;
    city: string;
    country: string;
    countryCode: "ES";
    /** Pre-formatted single-line for the footer / Stripe. */
    full: string;
  };
  /** Contact address used in legal pages and checkout emails. */
  email: string;
  /** One-line activity description (used on Aviso legal). */
  activity: string;
  /** Date of autónomo registration with the Agencia Tributaria. */
  registeredSince: string; // ISO 8601
  /** Legal form — never a company. */
  legalForm: "autonomo";
}

export const LEGAL_IDENTITY: LegalIdentity = {
  ownerFullName: "Mikolaj Szczelkun",
  tradingName: "Dimension 3D Prints",
  nif: "Y6681921K",
  address: {
    street: "Rambla del Brasil 53",
    floor: "2º 2ª",
    postalCode: "08028",
    city: "Barcelona",
    country: "España",
    countryCode: "ES",
    full: "Rambla del Brasil 53, 2º 2ª, 08028 Barcelona",
  },
  email: "dimension3dprintsbcn@gmail.com",
  activity: "servicio de impresión 3D, diseño 3D y venta de objetos impresos",
  registeredSince: "2026-11-13",
  legalForm: "autonomo",
};

/** The "Última actualización" date shown on every legal page. */
export const LEGAL_UPDATED_AT = "2026-11-13";
