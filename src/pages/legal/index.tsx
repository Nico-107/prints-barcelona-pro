import LegalPage from "@/pages/LegalPage";
import { LEGAL_LINKS, type LegalLang, type LegalPageKey } from "@/config/legalLinks";
import AvisoLegalEsBody from "./avisoLegalEs";
import PrivacidadEsBody from "./privacidadEs";
import CookiesEsBody from "./cookiesEs";
import CondicionesEsBody from "./condicionesEs";

/** Bodies per (lang, pageKey). Spanish is complete; the other 7 languages
 *  reuse the Spanish body because the prompt declares Spanish as the binding
 *  version and every translated page must carry a visible "Spanish prevails"
 *  notice (rendered by LegalPage). Section headings and the notice above the
 *  body are already localised per language. */
const BODIES: Record<LegalLang, Record<LegalPageKey, React.ComponentType>> = {
  es: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  ca: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  en: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  de: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  fr: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  it: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  nl: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
  pt: { aviso: AvisoLegalEsBody, privacidad: PrivacidadEsBody, cookies: CookiesEsBody, condiciones: CondicionesEsBody },
};

/** Title shown as the <h1> and in <title>. */
const TITLES: Record<LegalLang, Record<LegalPageKey, string>> = {
  es: { aviso: "Aviso legal", privacidad: "Política de privacidad", cookies: "Política de cookies", condiciones: "Condiciones de venta" },
  ca: { aviso: "Avís legal", privacidad: "Política de privacitat", cookies: "Política de cookies", condiciones: "Condicions de venda" },
  en: { aviso: "Legal notice", privacidad: "Privacy policy", cookies: "Cookie policy", condiciones: "Terms of sale" },
  de: { aviso: "Impressum", privacidad: "Datenschutz", cookies: "Cookie-Richtlinie", condiciones: "Verkaufsbedingungen" },
  fr: { aviso: "Mentions légales", privacidad: "Politique de confidentialité", cookies: "Politique de cookies", condiciones: "Conditions de vente" },
  it: { aviso: "Note legali", privacidad: "Informativa privacy", cookies: "Informativa cookie", condiciones: "Condizioni di vendita" },
  nl: { aviso: "Juridische informatie", privacidad: "Privacybeleid", cookies: "Cookiebeleid", condiciones: "Verkoopvoorwaarden" },
  pt: { aviso: "Informações legais", privacidad: "Política de privacidade", cookies: "Política de cookies", condiciones: "Condições de venda" },
};

const DESCRIPTIONS: Record<LegalLang, Record<LegalPageKey, string>> = {
  es: {
    aviso:       "Aviso legal e identificación del titular de Dimension 3D Prints — autónomo en Barcelona.",
    privacidad:  "Política de privacidad: datos recogidos, finalidad, bases legales, destinatarios y derechos RGPD.",
    cookies:     "Política de cookies de Dimension 3D Prints: qué se almacena, duración y modo sin cookies para rechazos.",
    condiciones: "Condiciones de venta: precios en EUR con IVA, pedido mínimo 10 €, plazos, pago, desistimiento y garantía.",
  },
  ca: {
    aviso:       "Avís legal i identificació del titular de Dimension 3D Prints.",
    privacidad:  "Política de privacitat: dades, finalitat, bases legals, destinataris i drets RGPD.",
    cookies:     "Política de cookies: què s'emmagatzema i mode sense cookies per als rebutjos.",
    condiciones: "Condicions de venda: preus en EUR amb IVA, comanda mínima, terminis i garantia.",
  },
  en: {
    aviso:       "Legal notice and owner identification of Dimension 3D Prints — sole trader based in Barcelona.",
    privacidad:  "Privacy policy: data collected, purposes, legal bases, recipients and GDPR rights.",
    cookies:     "Cookie policy: what we store, duration and cookieless mode for visitors who reject.",
    condiciones: "Terms of sale: EUR prices incl. VAT, €10 minimum order, timelines, payment, withdrawal and warranty.",
  },
  de: {
    aviso:       "Impressum und Anbieterkennzeichnung von Dimension 3D Prints — Einzelunternehmer in Barcelona.",
    privacidad:  "Datenschutz: erhobene Daten, Zwecke, Rechtsgrundlagen, Empfänger und DSGVO-Rechte.",
    cookies:     "Cookie-Richtlinie: was gespeichert wird und cookieless-Modus für Ablehnungen.",
    condiciones: "Verkaufsbedingungen: EUR-Preise inkl. MwSt., Mindestbestellwert 10 €, Lieferzeiten und Garantie.",
  },
  fr: {
    aviso:       "Mentions légales et identification du titulaire de Dimension 3D Prints — auto-entrepreneur à Barcelone.",
    privacidad:  "Politique de confidentialité : données collectées, finalités, bases légales et droits RGPD.",
    cookies:     "Politique de cookies : ce qui est stocké et mode sans cookies pour les refus.",
    condiciones: "Conditions de vente : prix en EUR TTC, commande minimale 10 €, délais et garantie.",
  },
  it: {
    aviso:       "Note legali e identificazione del titolare di Dimension 3D Prints — libero professionista a Barcellona.",
    privacidad:  "Informativa privacy: dati raccolti, finalità, basi giuridiche e diritti GDPR.",
    cookies:     "Informativa cookie: cosa viene memorizzato e modalità senza cookie per chi rifiuta.",
    condiciones: "Condizioni di vendita: prezzi in EUR con IVA, ordine minimo 10 €, tempi e garanzia.",
  },
  nl: {
    aviso:       "Juridische informatie en identificatie van de eigenaar van Dimension 3D Prints.",
    privacidad:  "Privacybeleid: verzamelde gegevens, doeleinden, grondslagen en AVG-rechten.",
    cookies:     "Cookiebeleid: wat wordt opgeslagen en cookieloze modus voor bezoekers die weigeren.",
    condiciones: "Verkoopvoorwaarden: prijzen in EUR incl. btw, minimumbestelling 10 €, levertijden en garantie.",
  },
  pt: {
    aviso:       "Informações legais e identificação do titular da Dimension 3D Prints.",
    privacidad:  "Política de privacidade: dados recolhidos, finalidades, bases legais e direitos RGPD.",
    cookies:     "Política de cookies: o que é armazenado e modo sem cookies para quem recusa.",
    condiciones: "Condições de venda: preços em EUR com IVA, encomenda mínima 10 €, prazos e garantia.",
  },
};

/** Factory — one page per (lang, pageKey). Mounted directly in App.tsx. */
export function makeLegalPage(lang: LegalLang, pageKey: LegalPageKey) {
  const Body = BODIES[lang][pageKey];
  return function LegalPageInstance() {
    return (
      <LegalPage
        lang={lang}
        pageKey={pageKey}
        title={TITLES[lang][pageKey]}
        metaDescription={DESCRIPTIONS[lang][pageKey]}
        body={<Body />}
      />
    );
  };
}

/** Flat list used by the router + sitemap: { lang, pageKey, slug }. */
export const LEGAL_ROUTES = (Object.keys(LEGAL_LINKS) as LegalLang[]).flatMap((lang) =>
  (["aviso", "privacidad", "cookies", "condiciones"] as LegalPageKey[]).map((key) => ({
    lang,
    pageKey: key,
    slug: LEGAL_LINKS[lang][key].slug,
    Component: makeLegalPage(lang, key),
  })),
);
