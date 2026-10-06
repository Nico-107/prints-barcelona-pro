import { describe, it, expect } from "vitest";
import { buildCalibrationCsv } from "./calibrationCsv";
import type { CalibOrder } from "./calibrationCsv";

const BASE: CalibOrder = {
  order_number: 42,
  pieces: [
    {
      name: "bracket.stl",
      material: "PLA",
      infill: 15,
      wallLoops: 2,
      quality: "standard",
      supports: false,
      orientation: "auto",
      gramsPerUnit: 12.5,
      hoursPerUnit: 1.234,
      costCents: 1200,
      actualGrams: 13.1,
      actualHours: 1.18,
    },
  ],
};

describe("buildCalibrationCsv", () => {
  it("produces expected header", () => {
    const csv = buildCalibrationCsv([]);
    expect(csv).toBe(
      "order_number,piece_name,material,infill,walls,quality,supports,orientation,predicted_g,predicted_h,predicted_price_eur,actual_g,actual_h,price_charged_eur",
    );
  });

  it("skips pieces without actual values", () => {
    const order: CalibOrder = {
      order_number: 1,
      pieces: [
        { name: "clip.stl", material: "PLA", infill: 15, wallLoops: 2 },
        { name: "bracket.stl", material: "PETG", gramsPerUnit: 20, hoursPerUnit: 2 },
      ],
    };
    const lines = buildCalibrationCsv([order]).split("\n");
    expect(lines).toHaveLength(1);
  });

  it("includes piece with only actualGrams set", () => {
    const order: CalibOrder = {
      order_number: 5,
      pieces: [{ name: "x.stl", actualGrams: 10 }],
    };
    const lines = buildCalibrationCsv([order]).split("\n");
    expect(lines).toHaveLength(2);
  });

  it("includes piece with only actualHours set", () => {
    const order: CalibOrder = {
      order_number: 6,
      pieces: [{ name: "y.stl", actualHours: 0.5 }],
    };
    const lines = buildCalibrationCsv([order]).split("\n");
    expect(lines).toHaveLength(2);
  });

  it("produces correct data row for base order", () => {
    const lines = buildCalibrationCsv([BASE]).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("42");
    expect(lines[1]).toContain("bracket.stl");
    expect(lines[1]).toContain("PLA");
  });

  it("escapes double quotes in piece names", () => {
    const order: CalibOrder = {
      order_number: 7,
      pieces: [{ name: 'bracket "v2"', material: "PLA", actualGrams: 10, actualHours: 0.5 }],
    };
    const csv = buildCalibrationCsv([order]);
    expect(csv).toContain('"bracket ""v2"""');
  });

  it("escapes commas in piece names", () => {
    const order: CalibOrder = {
      order_number: 8,
      pieces: [{ name: "top,bottom", actualGrams: 5, actualHours: 0.2 }],
    };
    const csv = buildCalibrationCsv([order]);
    expect(csv).toContain('"top,bottom"');
  });

  it("% difference between predicted and actual is recoverable from CSV columns", () => {
    const lines = buildCalibrationCsv([BASE]).split("\n");
    const cols = lines[1].split(",");
    const predG = parseFloat(cols[8]);
    const actualG = parseFloat(cols[11]);
    expect(predG).toBeCloseTo(12.5, 1);
    expect(actualG).toBeCloseTo(13.1, 1);
    const pctDiff = ((actualG - predG) / predG) * 100;
    expect(pctDiff).toBeCloseTo(4.8, 0);
  });

  it("handles multiple orders and only emits rows with actual data", () => {
    const orders: CalibOrder[] = [
      { order_number: 1, pieces: [{ name: "a.stl" }] },
      {
        order_number: 2,
        pieces: [
          { name: "b.stl", actualGrams: 5, actualHours: 0.5 },
          { name: "c.stl" },
          { name: "d.stl", actualGrams: 10, actualHours: 1 },
        ],
      },
    ];
    const lines = buildCalibrationCsv(orders).split("\n");
    expect(lines).toHaveLength(3); // header + 2 data rows
  });
});
