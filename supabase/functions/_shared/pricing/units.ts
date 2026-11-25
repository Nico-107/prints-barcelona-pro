// P7 — Units detection. If the largest bbox dimension < 5 mm → likely metres / cm / inches
// exported without re-scaling. If > 1000 mm → likely cm / mm mis-exported or inches.

export type UnitsSuggestion =
  | { kind: "ok" }
  | { kind: "likely-too-small"; largestMm: number; options: { label: string; factor: number }[] }
  | { kind: "likely-too-large"; largestMm: number; options: { label: string; factor: number }[] };

const SMALL_MM = 5;
const LARGE_MM = 1000;

export function suggestUnits(largestMm: number): UnitsSuggestion {
  if (largestMm < SMALL_MM) {
    return {
      kind: "likely-too-small",
      largestMm,
      options: [
        { label: "×1000 (m → mm)", factor: 1000 },
        { label: "×10 (cm → mm)", factor: 10 },
        { label: "×25,4 (in → mm)", factor: 25.4 },
      ],
    };
  }
  if (largestMm > LARGE_MM) {
    return {
      kind: "likely-too-large",
      largestMm,
      options: [
        { label: "÷10 (mm → cm?)", factor: 1 / 10 },
        { label: "÷25,4 (mm → in?)", factor: 1 / 25.4 },
        { label: "÷1000 (mm → m?)", factor: 1 / 1000 },
      ],
    };
  }
  return { kind: "ok" };
}
