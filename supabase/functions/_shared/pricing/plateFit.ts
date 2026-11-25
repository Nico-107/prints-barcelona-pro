// P5 — Plate fit with rotation about Z. For each of the 6 orientations compute the XY
// convex hull and its minimum-area enclosing rectangle via rotating calipers. Fits if the
// rectangle fits 256×256 mm with 2 mm margin and height ≤ 261 mm.

import { EST } from "./engine.ts";

export interface FitResult {
  fits: boolean;
  bestOrientation: number;
  rotationDeg: number;
  width: number;
  depth: number;
  height: number;
  scaleToFit: number; // 1.0 if fits, else the proportional down-scale needed
}

const MARGIN_MM = 2;

function convexHull(points: ReadonlyArray<readonly [number, number]>): [number, number][] {
  const pts = [...points].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  if (pts.length <= 1) return pts.slice();
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push([p[0], p[1]]);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push([p[0], p[1]]);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function cross(o: readonly [number, number], a: readonly [number, number], b: readonly [number, number]) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function enclosingRectangle(hull: ReadonlyArray<readonly [number, number]>): { width: number; depth: number; angleDeg: number } {
  // For a square plate the best rotation minimises `max(w, h)` — not area. Minimum-area
  // would return the axis-aligned bounding box for a 300×60 part (300 wide) which does
  // not fit; `max(w, h)` tries edges + an explicit sweep so a 300×60 part placed at 45°
  // reports 254-ish and fits.
  if (hull.length === 0) return { width: 0, depth: 0, angleDeg: 0 };
  if (hull.length === 1) return { width: 0, depth: 0, angleDeg: 0 };
  const candidates: number[] = [];
  for (let i = 0; i < hull.length; i++) {
    const [x1, y1] = hull[i];
    const [x2, y2] = hull[(i + 1) % hull.length];
    candidates.push(Math.atan2(y2 - y1, x2 - x1));
  }
  for (let step = 0; step <= 90; step += 1) candidates.push((step * Math.PI) / 180);

  let best = { width: Infinity, depth: Infinity, angleDeg: 0, score: Infinity };
  for (const edgeAngle of candidates) {
    const cosA = Math.cos(-edgeAngle);
    const sinA = Math.sin(-edgeAngle);
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const [px, py] of hull) {
      const rx = px * cosA - py * sinA;
      const ry = px * sinA + py * cosA;
      if (rx < minX) minX = rx;
      if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
    }
    const w = maxX - minX;
    const h = maxY - minY;
    const score = Math.max(w, h);
    if (score < best.score) {
      best = { width: Math.max(w, h), depth: Math.min(w, h), angleDeg: (edgeAngle * 180) / Math.PI, score };
    }
  }
  return { width: best.width, depth: best.depth, angleDeg: best.angleDeg };
}

// Produce the XY point cloud for one orientation. We use the 6 axis-aligned orientations
// from engine.ts; the caller passes the already-rotated vertex projection here.
function pointsForOrientation(tri: Float32Array, ori: number): [number, number][] {
  // orientation 0: (x, y); 1: (x, y); 2: (x, z); 3: (x, z); 4: (z, y); 5: (z, y)
  // (matches ORIENTS in engine.ts — all are axis swaps/flips that preserve the XY plane)
  const out: [number, number][] = new Array(tri.length / 3);
  let o = 0;
  for (let i = 0; i < tri.length; i += 3) {
    const x = tri[i],
      y = tri[i + 1],
      z = tri[i + 2];
    switch (ori) {
      case 0:
      case 1:
        out[o++] = [x, y];
        break;
      case 2:
      case 3:
        out[o++] = [x, z];
        break;
      case 4:
      case 5:
        out[o++] = [z, y];
        break;
    }
  }
  return out;
}

export function plateFit(tri: Float32Array): FitResult {
  const p = EST.plate;
  const maxW = p.x - MARGIN_MM;
  const maxD = p.y - MARGIN_MM;
  const maxH = p.z;

  // Pick height per orientation from bbox (pre-rotation about Z).
  const extMin = [Infinity, Infinity, Infinity];
  const extMax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < tri.length; i += 3) {
    const x = tri[i],
      y = tri[i + 1],
      z = tri[i + 2];
    if (x < extMin[0]) extMin[0] = x;
    if (y < extMin[1]) extMin[1] = y;
    if (z < extMin[2]) extMin[2] = z;
    if (x > extMax[0]) extMax[0] = x;
    if (y > extMax[1]) extMax[1] = y;
    if (z > extMax[2]) extMax[2] = z;
  }
  const heights = [
    extMax[2] - extMin[2], // 0
    extMax[2] - extMin[2], // 1
    extMax[1] - extMin[1], // 2
    extMax[1] - extMin[1], // 3
    extMax[0] - extMin[0], // 4
    extMax[0] - extMin[0], // 5
  ];

  // Track the orientation with the largest scaleToFit (closest to 1 = least shrinking).
  let best: FitResult = {
    fits: false,
    bestOrientation: 0,
    rotationDeg: 0,
    width: Infinity,
    depth: Infinity,
    height: Infinity,
    scaleToFit: 0,
  };
  for (let ori = 0; ori < 6; ori++) {
    const pts = pointsForOrientation(tri, ori);
    const hull = convexHull(pts);
    const rect = enclosingRectangle(hull);
    const fitsHere = rect.width <= maxW && rect.depth <= maxD && heights[ori] <= maxH;
    const rawScale = Math.min(maxW / rect.width, maxD / rect.depth, maxH / heights[ori]);
    const scale = Math.min(rawScale, 1);
    if (fitsHere) {
      return {
        fits: true,
        bestOrientation: ori,
        rotationDeg: rect.angleDeg,
        width: rect.width,
        depth: rect.depth,
        height: heights[ori],
        scaleToFit: 1,
      };
    }
    if (scale > best.scaleToFit) {
      best = {
        fits: false,
        bestOrientation: ori,
        rotationDeg: rect.angleDeg,
        width: rect.width,
        depth: rect.depth,
        height: heights[ori],
        scaleToFit: scale,
      };
    }
  }
  return best;
}
