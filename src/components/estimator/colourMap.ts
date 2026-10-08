// Pure utility — NO `three` import so this stays unit-testable and light.
import { COLOUR_OPTIONS } from "./ColourPicker";

export interface ColourPreview {
  hex: string;
  opacity: number;
  metalness: number;
  roughness: number;
}

const NEUTRAL: ColourPreview = { hex: "#D0D0D0", opacity: 1, roughness: 0.55, metalness: 0 };
const METAL_PROPS = { metalness: 0.6, roughness: 0.35 };

// Named key → hex from COLOUR_OPTIONS
const KEY_TO_HEX: Record<string, string> = Object.fromEntries(
  COLOUR_OPTIONS.filter(o => o.key !== "Transparent").map(o => [o.key, o.hex])
);

// Multilingual word → hex
const WORD_MAP: Record<string, { hex: string; metalness?: number; roughness?: number }> = {
  // red
  rojo: { hex: "#FF0000" }, vermell: { hex: "#FF0000" }, red: { hex: "#FF0000" },
  // blue
  azul: { hex: "#0000FF" }, blau: { hex: "#0000FF" }, blue: { hex: "#0000FF" },
  // green
  verde: { hex: "#00AA00" }, verd: { hex: "#00AA00" }, green: { hex: "#00AA00" },
  // black
  negro: { hex: "#111111" }, negre: { hex: "#111111" }, black: { hex: "#111111" },
  // white
  blanco: { hex: "#F0F0F0" }, blanc: { hex: "#F0F0F0" }, white: { hex: "#F0F0F0" },
  // grey/gray
  gris: { hex: "#808080" }, grey: { hex: "#808080" }, gray: { hex: "#808080" },
  // yellow
  amarillo: { hex: "#FFD700" }, groc: { hex: "#FFD700" }, yellow: { hex: "#FFD700" },
  // orange
  naranja: { hex: "#FF8C00" }, taronja: { hex: "#FF8C00" }, orange: { hex: "#FF8C00" },
  // purple
  morado: { hex: "#800080" }, lila: { hex: "#800080" }, purple: { hex: "#800080" },
  // pink
  rosa: { hex: "#FF69B4" }, pink: { hex: "#FF69B4" },
  // brown
  marron: { hex: "#8B4513" }, "marró": { hex: "#8B4513" }, brown: { hex: "#8B4513" },
  // gold (metallic)
  dorado: { hex: "#FFD700", ...METAL_PROPS },
  daurat: { hex: "#FFD700", ...METAL_PROPS },
  gold: { hex: "#FFD700", ...METAL_PROPS },
  // silver (metallic)
  plateado: { hex: "#C0C0C0", ...METAL_PROPS },
  platejat: { hex: "#C0C0C0", ...METAL_PROPS },
  silver: { hex: "#C0C0C0", ...METAL_PROPS },
};

function isHex(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

// Very small CSS colour-name table (only the names we claim to support)
const CSS_NAMES: Record<string, string> = {
  red: "#FF0000", blue: "#0000FF", green: "#00AA00", black: "#111111",
  white: "#F0F0F0", grey: "#808080", gray: "#808080", yellow: "#FFD700",
  orange: "#FF8C00", purple: "#800080", pink: "#FF69B4", brown: "#8B4513",
  silver: "#C0C0C0", gold: "#FFD700",
};

export function colourToPreview(value: string | undefined): ColourPreview {
  try {
    if (!value || value.trim() === "" || value === "Any") return NEUTRAL;

    const v = value.trim();

    // 1. Named COLOUR_OPTIONS keys
    if (v === "Transparent") {
      return { hex: "#B0C4DE", opacity: 0.45, metalness: 0, roughness: 0.55 };
    }
    if (v === "Silver" || KEY_TO_HEX[v] === KEY_TO_HEX["Silver"]) {
      if (v === "Silver") return { hex: KEY_TO_HEX["Silver"], opacity: 1, ...METAL_PROPS };
    }
    if (v === "Gold") {
      return { hex: KEY_TO_HEX["Gold"], opacity: 1, ...METAL_PROPS };
    }
    if (KEY_TO_HEX[v]) {
      return { hex: KEY_TO_HEX[v], opacity: 1, metalness: 0, roughness: 0.55 };
    }

    // 2. Hex colour
    if (isHex(v)) {
      return { hex: v, opacity: 1, metalness: 0, roughness: 0.55 };
    }

    // 3. Word lookup (trim, lowercase, remove accents normalised)
    const lower = v.toLowerCase().normalize("NFC");
    const word = WORD_MAP[lower];
    if (word) {
      return {
        hex: word.hex,
        opacity: 1,
        metalness: word.metalness ?? 0,
        roughness: word.roughness ?? 0.55,
      };
    }

    // 4. CSS colour name fallback
    const css = CSS_NAMES[lower];
    if (css) {
      const isMetal = lower === "silver" || lower === "gold";
      return {
        hex: css,
        opacity: 1,
        metalness: isMetal ? 0.6 : 0,
        roughness: isMetal ? 0.35 : 0.55,
      };
    }

    return NEUTRAL;
  } catch {
    return NEUTRAL;
  }
}
