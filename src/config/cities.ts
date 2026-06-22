export interface LaunchOffer {
  enabled: boolean;
  text: string;
}

export interface City {
  id: string;
  cityName: string;
  countryCode: string;     // ISO 3166-1 alpha-2, e.g. "ES"
  countryName: string;     // Country name for schema.org, e.g. "España"
  addressRegion: string;   // Region/state name for schema.org, e.g. "Cataluña"
  languages: string[];     // BCP-47 tags supported for this city, e.g. ["en", "es", "ca"]
  whatsappNumber: string;  // Digits only, no +, e.g. "34672051147"
  geoRegion: string;       // ISO 3166-2 code for geo meta tag, e.g. "ES-CT"
  geoPlacename: string;    // City name for geo.placename meta tag, e.g. "Barcelona"
  addressLocality: string; // City name for schema.org PostalAddress
  areaServed: string;      // City name for schema.org areaServed
  streetAddress: string;   // Street portion of the address, e.g. "Rambla de Brasil 53"
  launchOffer: LaunchOffer;
}

export const CITIES: Record<string, City> = {
  barcelona: {
    id: "barcelona",
    cityName: "Barcelona",
    countryCode: "ES",
    countryName: "España",
    addressRegion: "Cataluña",
    languages: ["en", "es", "ca"],
    whatsappNumber: "34672051147",
    geoRegion: "ES-CT",
    geoPlacename: "Barcelona",
    addressLocality: "Barcelona",
    areaServed: "Barcelona",
    streetAddress: "Rambla de Brasil 53",
    launchOffer: { enabled: false, text: "" },
  },
};

export const ACTIVE_CITY: City = CITIES.barcelona;

export function whatsappUrl(city: City = ACTIVE_CITY): string {
  return `https://wa.me/${city.whatsappNumber}`;
}

/** Derives a country flag emoji from an ISO 3166-1 alpha-2 code, e.g. "ES" → "🇪🇸". */
export function countryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join("");
}
