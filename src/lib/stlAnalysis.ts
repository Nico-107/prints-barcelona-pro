// Shared STL parsing logic — pure computation, no network calls.
// Used by StlEstimator.tsx and FileChecker.tsx.

export interface StlParseResult {
  volumeMm3: number;
  hasHeavyOverhangs: boolean;  // true when overhangPct > 0.15
  overhangPct: number;         // fraction of surface area needing support (0–1)
  boundingBoxMm: { x: number; y: number; z: number };
}

// Faces whose stored nz < -cos(45°) ≈ -0.707 point predominantly downward → need support.
const OVERHANG_NZ_THRESHOLD = -Math.cos(Math.PI / 4);

export function parseStl(buffer: ArrayBuffer): StlParseResult {
  const isBinary = (() => {
    if (buffer.byteLength < 84) return false;
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true);
    return buffer.byteLength === 84 + n * 50;
  })();

  if (isBinary) {
    const dv = new DataView(buffer);
    const n = dv.getUint32(80, true);
    let vol = 0;
    let totalArea = 0;
    let overhangArea = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < n; i++) {
      const base = 84 + i * 50;
      const nz = dv.getFloat32(base + 8, true);

      const vb = base + 12;
      const x1 = dv.getFloat32(vb,      true), y1 = dv.getFloat32(vb +  4, true), z1 = dv.getFloat32(vb +  8, true);
      const x2 = dv.getFloat32(vb + 12, true), y2 = dv.getFloat32(vb + 16, true), z2 = dv.getFloat32(vb + 20, true);
      const x3 = dv.getFloat32(vb + 24, true), y3 = dv.getFloat32(vb + 28, true), z3 = dv.getFloat32(vb + 32, true);

      vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;

      const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
      const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
      const area = 0.5 * Math.sqrt(
        (ay * bz - az * by) ** 2 +
        (az * bx - ax * bz) ** 2 +
        (ax * by - ay * bx) ** 2,
      );
      totalArea += area;
      if (nz < OVERHANG_NZ_THRESHOLD) overhangArea += area;

      if (x1 < minX) minX = x1; if (x1 > maxX) maxX = x1;
      if (x2 < minX) minX = x2; if (x2 > maxX) maxX = x2;
      if (x3 < minX) minX = x3; if (x3 > maxX) maxX = x3;
      if (y1 < minY) minY = y1; if (y1 > maxY) maxY = y1;
      if (y2 < minY) minY = y2; if (y2 > maxY) maxY = y2;
      if (y3 < minY) minY = y3; if (y3 > maxY) maxY = y3;
      if (z1 < minZ) minZ = z1; if (z1 > maxZ) maxZ = z1;
      if (z2 < minZ) minZ = z2; if (z2 > maxZ) maxZ = z2;
      if (z3 < minZ) minZ = z3; if (z3 > maxZ) maxZ = z3;
    }

    const overhangPct = totalArea > 0 ? overhangArea / totalArea : 0;
    return {
      volumeMm3: Math.abs(vol),
      hasHeavyOverhangs: overhangPct > 0.15,
      overhangPct,
      boundingBoxMm: {
        x: isFinite(maxX - minX) ? Math.abs(maxX - minX) : 0,
        y: isFinite(maxY - minY) ? Math.abs(maxY - minY) : 0,
        z: isFinite(maxZ - minZ) ? Math.abs(maxZ - minZ) : 0,
      },
    };
  }

  // ASCII STL
  const text = new TextDecoder().decode(new Uint8Array(buffer));
  const normalRe = /facet\s+normal\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const vertRe   = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;

  const normals: number[] = [];
  let fm: RegExpExecArray | null;
  while ((fm = normalRe.exec(text)) !== null) {
    normals.push(parseFloat(fm[3]));
  }

  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(text)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  if (verts.length % 3 !== 0) throw new Error("Malformed ASCII STL");

  let vol = 0;
  let totalArea = 0;
  let overhangArea = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < verts.length; i += 3) {
    const [x1, y1, z1] = verts[i], [x2, y2, z2] = verts[i + 1], [x3, y3, z3] = verts[i + 2];
    vol += (x1 * (y2 * z3 - y3 * z2) + y1 * (z2 * x3 - z3 * x2) + z1 * (x2 * y3 - x3 * y2)) / 6;

    const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
    const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
    const area = 0.5 * Math.sqrt(
      (ay * bz - az * by) ** 2 +
      (az * bx - ax * bz) ** 2 +
      (ax * by - ay * bx) ** 2,
    );
    totalArea += area;

    const triIdx = i / 3;
    if (triIdx < normals.length && normals[triIdx] < OVERHANG_NZ_THRESHOLD) {
      overhangArea += area;
    }

    for (const [vx, vy, vz] of [verts[i], verts[i + 1], verts[i + 2]]) {
      if (vx < minX) minX = vx; if (vx > maxX) maxX = vx;
      if (vy < minY) minY = vy; if (vy > maxY) maxY = vy;
      if (vz < minZ) minZ = vz; if (vz > maxZ) maxZ = vz;
    }
  }

  const overhangPct = totalArea > 0 ? overhangArea / totalArea : 0;
  return {
    volumeMm3: Math.abs(vol),
    hasHeavyOverhangs: overhangPct > 0.15,
    overhangPct,
    boundingBoxMm: {
      x: isFinite(maxX - minX) ? Math.abs(maxX - minX) : 0,
      y: isFinite(maxY - minY) ? Math.abs(maxY - minY) : 0,
      z: isFinite(maxZ - minZ) ? Math.abs(maxZ - minZ) : 0,
    },
  };
}
