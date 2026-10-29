import { SITE_URL } from "./registry";
import { SHIP_COUNTRIES } from "@/lib/instantBuy";

// Shared brand identity referenced by both Article/HowTo `author` fields on
// landing pages and by the top-level LocalBusiness block on the homepage.
// Keeping these in one place ensures every JSON-LD block references the same
// entity URLs so search engines can consolidate the graph.

export const GOOGLE_BUSINESS_PROFILE_URL = "https://maps.app.goo.gl/ebXjjrXXA6bVwUkeA";
const INSTAGRAM_URL = "https://www.instagram.com/dimension3dprints/";
const TIKTOK_URL    = "https://www.tiktok.com/@dimension3dprints";
const YOUTUBE_URL   = "https://www.youtube.com/@dimension3dprints";

const sameAs = [GOOGLE_BUSINESS_PROFILE_URL, INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL].filter(Boolean);

// Site-wide LocalBusiness entity.
// @id is /#business — referenced by Service JSON-LD on city pages and
// by Article/HowTo publisher refs throughout the site.
// No AggregateRating or Review here — these are managed separately by Google.
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#business`,
  name: "Dimension3D",
  alternateName: ["Dimension 3D Prints", "Dimension3D BCN", "Dimension 3D Barcelona"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og/share-default.png`,
  telephone: "+34 672 051 147",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rambla del Brasil, 53",
    addressLocality: "Barcelona",
    postalCode: "08028",
    addressRegion: "Cataluña",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.3806,
    longitude: 2.1317,
  },
  priceRange: "€",
  areaServed: (SHIP_COUNTRIES as readonly string[]).map((code) => ({
    "@type": "Country",
    "iso6166code": code,
  })),
  ...(sameAs.length > 0 ? { sameAs } : {}),
};

// WebSite entity — enables sitelinks searchbox eligibility.
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Dimension3D",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#business` },
};

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/creator#person`,
  name: "Mikołaj Szczełkun",
  jobTitle: "Founder & 3D Printing Specialist",
  url: `${SITE_URL}/creator`,
  worksFor: { "@id": `${SITE_URL}/#business` },
};

// A slim inline reference for embedding inside Article/HowTo `author` /
// `publisher` fields without repeating the full object graph on every page.
export const AUTHOR_REF = {
  "@type": "Person",
  "@id": `${SITE_URL}/creator#person`,
  name: "Mikołaj Szczełkun",
  url: `${SITE_URL}/creator`,
};

export const PUBLISHER_REF = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#business`,
  name: "Dimension3D",
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
};
