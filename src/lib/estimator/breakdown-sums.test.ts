import { describe, it, expect } from "vitest";
import { analyzeTriangles, estimatePart, priceOrder, EST } from "./core";
import { boxMesh } from "./fixtures";

// Phase fix-polish §1.1 — assert the visible price-window rows always sum to
// Total. The rendered lines are, in order:
//   Piezas                 = baseCents − minAdjCents
//   Ajuste a pedido mínimo = minAdjCents (when > 0)
//   Preparación del pedido = setupCents (when > 0, currently 0)
//   Suplemento express     = expressCents (when > 0)
//   Envío                  = shippingCents (when fulfilment = shipping)
//   Total                  = chargedPrintCents + shippingCents
//
// The arithmetic invariant is:
//   (baseCents − minAdjCents) + minAdjCents + setupCents + expressCents + shippingCents
//   === chargedPrintCents + shippingCents
//
// 20 cases cover below/above the minimum, 1..5 units, pickup/shipping,
// standard/express, and a mixed-material multi-part order.

function estimate(mesh: Float32Array, material = "PLA") {
  return estimatePart(analyzeTriangles(mesh), {
    material, infillPct: 15, wallLoops: 2, quality: "standard", supports: true, orientation: 0,
  });
}

interface Case {
  label: string;
  parts: { mesh: Float32Array; material: string; qty: number }[];
  urgency: "standard" | "express" | "urgent";
  shipping: boolean;
}

const tiny = () => boxMesh(30, 20, 20);     // below the minimum when qty=1
const medium = () => boxMesh(40, 40, 40);   // right at ~10 € in PLA
const big = () => boxMesh(60, 60, 60);      // above the minimum

const CASES: Case[] = [
  // Below the minimum (minAdj > 0)
  { label: "tiny PLA x1 pickup",       parts: [{ mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "standard", shipping: false },
  { label: "tiny PLA x1 shipping",     parts: [{ mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "standard", shipping: true  },
  { label: "tiny PLA x2 pickup",       parts: [{ mesh: tiny(),   material: "PLA",  qty: 2 }], urgency: "standard", shipping: false },
  { label: "tiny PLA x1 express",      parts: [{ mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "express",  shipping: false },
  { label: "tiny PLA x1 urgent ship",  parts: [{ mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "urgent",   shipping: true  },
  // At or right around the minimum
  { label: "medium PLA x1 pickup",     parts: [{ mesh: medium(), material: "PLA",  qty: 1 }], urgency: "standard", shipping: false },
  { label: "medium PLA x1 shipping",   parts: [{ mesh: medium(), material: "PLA",  qty: 1 }], urgency: "standard", shipping: true  },
  { label: "medium PETG x1 shipping",  parts: [{ mesh: medium(), material: "PETG", qty: 1 }], urgency: "standard", shipping: true  },
  { label: "medium PLA x1 express",    parts: [{ mesh: medium(), material: "PLA",  qty: 1 }], urgency: "express",  shipping: false },
  // Clearly above the minimum (minAdj = 0)
  { label: "big PLA x1 pickup",        parts: [{ mesh: big(),    material: "PLA",  qty: 1 }], urgency: "standard", shipping: false },
  { label: "big PLA x1 shipping",      parts: [{ mesh: big(),    material: "PLA",  qty: 1 }], urgency: "standard", shipping: true  },
  { label: "big PLA x3 pickup",        parts: [{ mesh: big(),    material: "PLA",  qty: 3 }], urgency: "standard", shipping: false },
  { label: "big PLA x5 shipping",      parts: [{ mesh: big(),    material: "PLA",  qty: 5 }], urgency: "standard", shipping: true  },
  { label: "big PETG x2 express",      parts: [{ mesh: big(),    material: "PETG", qty: 2 }], urgency: "express",  shipping: true  },
  { label: "big ABS x1 urgent",        parts: [{ mesh: big(),    material: "ABS",  qty: 1 }], urgency: "urgent",   shipping: true  },
  { label: "big TPU x4 pickup",        parts: [{ mesh: big(),    material: "TPU",  qty: 4 }], urgency: "standard", shipping: false },
  // Mixed-material multi-part orders
  { label: "mixed PLA+PETG x1+x1",     parts: [{ mesh: medium(), material: "PLA", qty: 1 }, { mesh: medium(), material: "PETG", qty: 1 }], urgency: "standard", shipping: false },
  { label: "mixed big+tiny shipping",  parts: [{ mesh: big(),    material: "PLA", qty: 1 }, { mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "standard", shipping: true  },
  { label: "mixed 3-part express",     parts: [{ mesh: big(),    material: "PLA", qty: 2 }, { mesh: medium(), material: "ABS",  qty: 1 }, { mesh: tiny(), material: "PLA", qty: 1 }], urgency: "express", shipping: true },
  { label: "mixed 2x tiny shipping",   parts: [{ mesh: tiny(),   material: "PLA", qty: 1 }, { mesh: tiny(),   material: "PLA",  qty: 1 }], urgency: "standard", shipping: true  },
];

describe("price breakdown — visible rows sum to total", () => {
  for (const c of CASES) {
    it(c.label, () => {
      const inputs = c.parts.map(p => ({
        name: p.material, quantity: p.qty, material: p.material, estimate: estimate(p.mesh, p.material),
      }));
      const order = priceOrder(inputs, c.urgency);
      const shipping = c.shipping ? EST.shippingCents : 0;

      // Rows exactly as PriceBreakdown.tsx renders them
      const rows = {
        pieces: order.baseCents - order.minAdjCents,
        minAdj: order.minAdjCents,
        setup: order.setupCents,
        express: order.expressCents,
        shipping,
      };
      const rowsSum = rows.pieces + rows.minAdj + rows.setup + rows.express + rows.shipping;
      const total = order.totalCents + shipping;

      expect(rowsSum).toBe(total);
      // Row-level sanity: nothing negative, pieces strictly reflect raw cost
      expect(rows.pieces).toBeGreaterThanOrEqual(0);
      expect(rows.minAdj).toBeGreaterThanOrEqual(0);
      // When the minimum applies, pieces < 10 € and minAdj > 0
      if (rows.minAdj > 0) {
        expect(rows.pieces).toBeLessThan(EST.minimumEur * 100);
      }
      // When the minimum does not apply, minAdj must be 0
      if (rows.minAdj === 0) {
        expect(rows.pieces).toBeGreaterThanOrEqual(EST.minimumEur * 100);
      }
    });
  }
});
