/**
 * Localised legal page slugs + footer labels for the four pages the owner
 * is required to publish as a registered autónomo. Spanish slugs below are
 * the canonical ones; every other language follows that language's existing
 * URL pattern (city pages, hubs, guides already live under /de/, /fr/ etc.).
 *
 * The slugs here are the source of truth for the footer, sitemap, hreflang
 * and the route table in App.tsx.
 */

import { LEGAL_IDENTITY } from "./legalIdentity";

export type LegalLang = "es" | "ca" | "en" | "de" | "fr" | "it" | "nl" | "pt";

export type LegalPageKey = "aviso" | "privacidad" | "cookies" | "condiciones";

export interface LegalLink {
  key: LegalPageKey;
  slug: string;
  label: string;
}

/** Per-language slug + label for each of the four pages. */
export const LEGAL_LINKS: Record<LegalLang, Record<LegalPageKey, LegalLink>> = {
  es: {
    aviso:       { key: "aviso",       slug: "/aviso-legal",            label: "Aviso legal" },
    privacidad:  { key: "privacidad",  slug: "/politica-de-privacidad", label: "Política de privacidad" },
    cookies:     { key: "cookies",     slug: "/politica-de-cookies",    label: "Política de cookies" },
    condiciones: { key: "condiciones", slug: "/condiciones-de-venta",   label: "Condiciones de venta" },
  },
  ca: {
    aviso:       { key: "aviso",       slug: "/ca/avis-legal",              label: "Avís legal" },
    privacidad:  { key: "privacidad",  slug: "/ca/politica-de-privacitat",  label: "Política de privacitat" },
    cookies:     { key: "cookies",     slug: "/ca/politica-de-cookies",     label: "Política de cookies" },
    condiciones: { key: "condiciones", slug: "/ca/condicions-de-venda",     label: "Condicions de venda" },
  },
  en: {
    aviso:       { key: "aviso",       slug: "/legal-notice",       label: "Legal notice" },
    privacidad:  { key: "privacidad",  slug: "/privacy-policy",     label: "Privacy policy" },
    cookies:     { key: "cookies",     slug: "/cookie-policy",      label: "Cookie policy" },
    condiciones: { key: "condiciones", slug: "/terms-of-sale",      label: "Terms of sale" },
  },
  de: {
    aviso:       { key: "aviso",       slug: "/de/impressum",         label: "Impressum" },
    privacidad:  { key: "privacidad",  slug: "/de/datenschutz",       label: "Datenschutz" },
    cookies:     { key: "cookies",     slug: "/de/cookie-richtlinie", label: "Cookie-Richtlinie" },
    condiciones: { key: "condiciones", slug: "/de/verkaufsbedingungen", label: "Verkaufsbedingungen" },
  },
  fr: {
    aviso:       { key: "aviso",       slug: "/fr/mentions-legales",       label: "Mentions légales" },
    privacidad:  { key: "privacidad",  slug: "/fr/politique-de-confidentialite", label: "Politique de confidentialité" },
    cookies:     { key: "cookies",     slug: "/fr/politique-de-cookies",   label: "Politique de cookies" },
    condiciones: { key: "condiciones", slug: "/fr/conditions-de-vente",    label: "Conditions de vente" },
  },
  it: {
    aviso:       { key: "aviso",       slug: "/it/note-legali",           label: "Note legali" },
    privacidad:  { key: "privacidad",  slug: "/it/informativa-privacy",   label: "Informativa privacy" },
    cookies:     { key: "cookies",     slug: "/it/informativa-cookie",    label: "Informativa cookie" },
    condiciones: { key: "condiciones", slug: "/it/condizioni-di-vendita", label: "Condizioni di vendita" },
  },
  nl: {
    aviso:       { key: "aviso",       slug: "/nl/juridische-informatie", label: "Juridische informatie" },
    privacidad:  { key: "privacidad",  slug: "/nl/privacybeleid",         label: "Privacybeleid" },
    cookies:     { key: "cookies",     slug: "/nl/cookiebeleid",          label: "Cookiebeleid" },
    condiciones: { key: "condiciones", slug: "/nl/verkoopvoorwaarden",    label: "Verkoopvoorwaarden" },
  },
  pt: {
    aviso:       { key: "aviso",       slug: "/pt/informacoes-legais",    label: "Informações legais" },
    privacidad:  { key: "privacidad",  slug: "/pt/politica-de-privacidade", label: "Política de privacidade" },
    cookies:     { key: "cookies",     slug: "/pt/politica-de-cookies",   label: "Política de cookies" },
    condiciones: { key: "condiciones", slug: "/pt/condicoes-de-venda",    label: "Condições de venda" },
  },
};

/** Order the 4 links should render in the footer. */
export const LEGAL_PAGE_ORDER: LegalPageKey[] = [
  "aviso",
  "privacidad",
  "cookies",
  "condiciones",
];

export function legalLinksForLang(lang: string): LegalLink[] {
  const l = (lang as LegalLang) in LEGAL_LINKS ? (lang as LegalLang) : "es";
  return LEGAL_PAGE_ORDER.map((k) => LEGAL_LINKS[l][k]);
}

/** Single-line footer legal text, identical in every language. */
export function legalLineText(): string {
  return `${LEGAL_IDENTITY.tradingName} · ${LEGAL_IDENTITY.ownerFullName} · NIF ${LEGAL_IDENTITY.nif} · ${LEGAL_IDENTITY.address.city}`;
}
