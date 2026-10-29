import { describe, it, expect } from "vitest";
import {
  isBinaryStl,
  trianglesToBinaryStl,
  countBinaryStlTriangles,
  prepareStl,
} from "./stlPrepare";
import { stlToTriangles, analyzeTriangles } from "./estimator/core";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a binary STL from a minimal list of triangles [[x0,y0,z0, x1,y1,z1, x2,y2,z2], ...] */
function makeBinaryStl(triangles: number[][]): ArrayBuffer {
  const n = triangles.length;
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  dv.setUint32(80, n, true);
  for (let i = 0; i < n; i++) {
    const base = 84 + i * 50;
    const t = triangles[i];
    // normal: 0 0 1 (simplified)
    dv.setFloat32(base,   0, true);
    dv.setFloat32(base+4, 0, true);
    dv.setFloat32(base+8, 1, true);
    for (let k = 0; k < 9; k++) dv.setFloat32(base + 12 + k*4, t[k], true);
  }
  return buf;
}

/** Build a simple closed tetrahedron as binary STL (~4 triangles) */
function makeTetrahedronStl(): ArrayBuffer {
  const triangles = [
    [0, 0, 0,   1, 0, 0,   0.5, 1, 0],  // bottom
    [0, 0, 0,   0.5, 0.5, 1,   1, 0, 0], // side 1
    [1, 0, 0,   0.5, 0.5, 1,   0.5, 1, 0], // side 2
    [0.5, 1, 0, 0.5, 0.5, 1,   0, 0, 0],  // side 3
  ];
  return makeBinaryStl(triangles);
}

/** Build an ASCII STL with the given triangles */
function makeAsciiStl(triangles: number[][]): ArrayBuffer {
  let text = "solid test\n";
  for (const t of triangles) {
    text += "  facet normal 0 0 1\n    outer loop\n";
    for (let v = 0; v < 3; v++) {
      text += `      vertex ${t[v*3]} ${t[v*3+1]} ${t[v*3+2]}\n`;
    }
    text += "    endloop\n  endfacet\n";
  }
  text += "endsolid test\n";
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

/** Simple 10mm cube made of 12 triangles */
function cubeTris(): number[][] {
  const s = 10;
  return [
    // bottom
    [0,0,0, s,0,0, s,s,0], [0,0,0, s,s,0, 0,s,0],
    // top
    [0,0,s, s,s,s, s,0,s], [0,0,s, 0,s,s, s,s,s],
    // front
    [0,0,0, s,0,0, s,0,s], [0,0,0, s,0,s, 0,0,s],
    // back
    [0,s,0, s,s,s, s,s,0], [0,s,0, 0,s,s, s,s,s],
    // left
    [0,0,0, 0,0,s, 0,s,s], [0,0,0, 0,s,s, 0,s,0],
    // right
    [s,0,0, s,s,0, s,s,s], [s,0,0, s,s,s, s,0,s],
  ];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("isBinaryStl", () => {
  it("returns true for a valid binary STL", () => {
    const buf = makeTetrahedronStl();
    expect(isBinaryStl(buf)).toBe(true);
  });

  it("returns false for an ASCII STL", () => {
    const buf = makeAsciiStl(cubeTris());
    expect(isBinaryStl(buf)).toBe(false);
  });

  it("returns false for a short buffer", () => {
    expect(isBinaryStl(new ArrayBuffer(10))).toBe(false);
  });
});

describe("trianglesToBinaryStl", () => {
  it("round-trips correctly: binary → triangles → binary → triangles", () => {
    const original = makeTetrahedronStl();
    const tri1 = stlToTriangles(original);
    const roundtripped = trianglesToBinaryStl(tri1);
    const tri2 = stlToTriangles(roundtripped);

    expect(isBinaryStl(roundtripped)).toBe(true);
    expect(countBinaryStlTriangles(roundtripped)).toBe(countBinaryStlTriangles(original));

    for (let i = 0; i < tri1.length; i++) {
      expect(tri2[i]).toBeCloseTo(tri1[i], 5);
    }
  });
});

describe("ASCII → binary gives identical analysis", () => {
  it("cube: analysis from ASCII matches analysis from binary", () => {
    const tris = cubeTris();
    const asciiBuf = makeAsciiStl(tris);
    const binaryBuf = makeBinaryStl(tris);

    const asciiAnalysis  = analyzeTriangles(stlToTriangles(asciiBuf));
    const binaryAnalysis = analyzeTriangles(stlToTriangles(binaryBuf));

    expect(asciiAnalysis.volumeMm3).toBeCloseTo(binaryAnalysis.volumeMm3, 1);
    expect(asciiAnalysis.boundsMm[0]).toBeCloseTo(binaryAnalysis.boundsMm[0], 2);
    expect(asciiAnalysis.boundsMm[1]).toBeCloseTo(binaryAnalysis.boundsMm[1], 2);
    expect(asciiAnalysis.boundsMm[2]).toBeCloseTo(binaryAnalysis.boundsMm[2], 2);
  });

  it("prepareStl: ASCII STL produces binary output with same analysis", async () => {
    const tris = cubeTris();
    const asciiBuf = makeAsciiStl(tris);
    const binaryBuf = makeBinaryStl(tris);

    const result = await prepareStl(asciiBuf);

    expect(result.ascii_converted).toBe(true);
    expect(result.simplified).toBe(false);
    expect(isBinaryStl(result.checkoutBuf)).toBe(true);

    const asciiAnalysis  = analyzeTriangles(stlToTriangles(asciiBuf));
    const preparedAnalysis = analyzeTriangles(stlToTriangles(result.checkoutBuf));
    const binaryAnalysis = analyzeTriangles(stlToTriangles(binaryBuf));

    expect(preparedAnalysis.volumeMm3).toBeCloseTo(asciiAnalysis.volumeMm3, 1);
    expect(preparedAnalysis.volumeMm3).toBeCloseTo(binaryAnalysis.volumeMm3, 1);
  });
});

describe("prepareStl: no-op for small binary STL", () => {
  it("returns the same buffer unchanged", async () => {
    const buf = makeTetrahedronStl();
    const result = await prepareStl(buf);
    expect(result.ascii_converted).toBe(false);
    expect(result.simplified).toBe(false);
    expect(result.final_bytes).toBe(buf.byteLength);
  });
});
