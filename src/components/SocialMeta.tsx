import { Helmet } from "react-helmet-async";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/seo/registry";

interface SocialMetaProps {
  title: string;
  description: string;
  path: string;
  locale?: string;
  type?: string;
}

const SocialMeta = ({ title, description, path, locale = "es_ES", type = "website" }: SocialMetaProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image" content={SOCIAL_IMAGE_URL} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content="Dimension3D — Impresión 3D en Barcelona" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
    </Helmet>
  );
};

export default SocialMeta;
