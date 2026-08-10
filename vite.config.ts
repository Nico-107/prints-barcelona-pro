import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ACTIVE_CITY } from "./src/config/cities";

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
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
  build: isSsrBuild ? {} : {
    rollupOptions: {
      output: {
        // Function-form so anything in node_modules gets a stable, cacheable
        // chunk instead of being folded into the entry. Ordering matters:
        // check the most-specific groups first.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/three/") || id.endsWith("/three")) return "three";
          if (id.includes("/topojson-client/")) return "topojson";
          if (id.includes("/@supabase/")) return "supabase";
          if (id.includes("/@radix-ui/")) return "vendor-ui";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }
          return "vendor";
        },
      },
    },
  },
}));
