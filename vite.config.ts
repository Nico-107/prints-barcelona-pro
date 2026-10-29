import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ACTIVE_CITY } from "./src/config/cities";
import { EXPERIMENTS } from "./src/lib/experimentsConfig";
import { REGISTRY } from "./src/lib/experiments/registry";
import { buildPrePaintScript, type PrePaintExp } from "./src/lib/experiments/prePaintScript";

// Convert camelCase dataset property name to kebab-case HTML attribute name.
// e.g. "xpHeroPkg" → "xp-hero-pkg"  (browser adds the "data-" prefix)
function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

function generateExperimentCSS(): string {
  const rules: string[] = [];
  for (const [id, exp] of Object.entries(EXPERIMENTS)) {
    const attr = camelToKebab(exp.attr);
    for (const v of exp.variants) {
      rules.push(
        `html[data-${attr}="${v}"] [data-xp-slot="${id}"]:not([data-xp-v="${v}"]){display:none!important}`
      );
    }
    rules.push(
      `html:not([data-${attr}]) [data-xp-slot="${id}"]:not([data-xp-v="${exp.variants[0]}"]){display:none!important}`
    );
  }
  return rules.join("");
}

function generatePrePaintScript(): string {
  const exps: PrePaintExp[] = REGISTRY.map(exp => ({
    id: exp.id,
    attr: "data-xp-" + exp.id.replace(/_/g, "-"),
    layer: exp.layer,
    variants: exp.variants,
    langs: exp.langs ?? null,
    enabled: exp.enabled,
    endMs: new Date(exp.startedOn + "T00:00:00Z").getTime() + exp.maxDays * 86400_000,
  }));
  return buildPrePaintScript(exps);
}

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
    {
      name: "experiment-head-snippet",
      transformIndexHtml(html: string): string {
        const css = generateExperimentCSS();
        const script = generatePrePaintScript();
        // Inject right after <head>: CSS first (needed by SSR), script right after.
        return html.replace("<head>", `<head>\n    <style>${css}</style>\n    <script>${script}</script>`);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: isSsrBuild ? {} : {},
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "scripts/**", "e2e/**"],
  },
}));
