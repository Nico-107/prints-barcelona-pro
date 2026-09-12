import { SITE_URL } from "./registry";

// Shared brand identity referenced by both Article/HowTo `author` fields on
// landing pages and by the top-level Organization block on the homepage.
// Keeping these in one place ensures every JSON-LD block references the same
// entity URLs so search engines can consolidate the graph.

export const GOOGLE_BUSINESS_PROFILE_URL = "https://maps.app.goo.gl/ebXjjrXXA6bVwUkeA";
const INSTAGRAM_URL = "https://www.instagram.com/dimension3dprints/";

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Dimension3D",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [GOOGLE_BUSINESS_PROFILE_URL, INSTAGRAM_URL],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "16",
    bestRating: "5",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Sara Dospassos" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "What an amazing place! Mikolaj helped me with an urgent order on a Friday afternoon, and it was ready the very next morning. He not only delivered my pieces with a professional finish, but he even came over to where I was to hand them to me. Absolutely fantastic.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Kirill Gromskiy" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Yasser Chyoukha" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "I had some parts printed for a project, and in addition to the excellent service and constant support, they helped me by doing resized tests so the printed nut would fit perfectly. The price was great, and it really saved me from a tight spot.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Filip Copaescu" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Amazing! They were able to accurately 3D print this car part in TPU, a flexible material. Great quality and service.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Daniel Cáceres Álvarez" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Spectacular! I bought two Stranger Things models for my Kinder Joy Funko Pops and they turned out great. Excellent service and quality.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Valentino Modestino Lombardi" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Excellent on-demand 3D printing service, very helpful and patient customer service. Recommended!",
    },
  ],
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
