import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ACTIVE_CITY } from "./src/config/cities";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "city-html-tokens",
      transformIndexHtml(html: string): string {
        return html
          .replaceAll("__CITY_NAME__", ACTIVE_CITY.cityName)
          .replace("__GEO_REGION__", ACTIVE_CITY.geoRegion);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
