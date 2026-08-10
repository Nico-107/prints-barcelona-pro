import { SITE_URL } from "./registry";

// Shared brand identity referenced by both Article/HowTo `author` fields on
// landing pages and by the top-level Organization block on the homepage.
// Keeping these in one place ensures every JSON-LD block references the same
// entity URLs so search engines can consolidate the graph.

// TODO(brand): fill in the real Google Business Profile URL for Dimension3D
// Barcelona. Format is https://g.page/<slug> or https://www.google.com/maps/place/...
// Leave the placeholder in place until confirmed — an incorrect sameAs URL is
// worse for entity consolidation than a missing one.
const GOOGLE_BUSINESS_PROFILE_URL = "TODO_GOOGLE_BUSINESS_PROFILE_URL";
const INSTAGRAM_URL = "https://www.instagram.com/dimension3dprints/";

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Dimension3D",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [GOOGLE_BUSINESS_PROFILE_URL, INSTAGRAM_URL],
};

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/creator#person`,
  name: "Mikołaj Szczełkun",
  jobTitle: "Founder & 3D Printing Specialist",
  url: `${SITE_URL}/creator`,
  worksFor: { "@id": `${SITE_URL}/#organization` },
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
  "@id": `${SITE_URL}/#organization`,
  name: "Dimension3D",
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
};
