// B2BPage renders the EN (/3d-printing-for-business-barcelona) and
// CA (/ca/impressio-3d-empreses-barcelona) versions of the business page.
// The page prop is kept for compatibility with the existing route registrations
// in App.tsx and entry-server.tsx, but the lang is derived from it.
import type { LandingContent } from "@/seo/landingPages";
import B2BLanding from "@/components/b2b/B2BLanding";
import type { B2BLang } from "@/components/b2b/B2BLanding";

interface Props {
  page: LandingContent;
}

const B2BPage = ({ page }: Props) => {
  const lang: B2BLang = (page?.lang === "ca" ? "ca" : "en") as B2BLang;
  return <B2BLanding lang={lang} />;
};

export default B2BPage;
