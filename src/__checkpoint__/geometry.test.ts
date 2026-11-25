import { describe, it, expect } from "vitest";
import { parseSTL, parseOBJ, parse3MFModelXml, weld, summarise } from "../../supabase/functions/_shared/pricing/geometry";
import { cubeTriangles } from "./legacy/quoteLegacy";

// P2 — geometry pipeline: parse STL/OBJ/3MF, weld vertices, split shells, classify meshes.

describe("P2 STL parser", () => {
  it("parses a binary-sized ArrayBuffer round-trip (cube)", () => {
    // Build a minimal binary STL for the 12 cube triangles so this test exercises the
    // binary path (not just the ASCII fallback).
    const tris = cubeTriangles(20);
    const n = tris.length / 9;
    const buf = new ArrayBuffer(84 + n * 50);
    const dv = new DataView(buf);
    dv.setUint32(80, n, true);
    for (let i = 0, o = 84; i < n; i++, o += 50) {
      // normal (x,y,z) = 0 (ignored)
      for (let k = 0; k < 9; k++) dv.setFloat32(o + 12 + k * 4, tris[i * 9 + k], true);
      // attribute byte count (uint16) = 0
    }
    const out = parseSTL(buf);
    expect(out.length).toBe(tris.length);
    for (let i = 0; i < tris.length; i++) {
      expect(out[i]).toBeCloseTo(tris[i], 2);
    }
  });

  it("parses ASCII STL", () => {
    const ascii = `solid cube
facet normal 0 0 0
  outer loop
    vertex 0 0 0
    vertex 10 0 0
    vertex 10 10 0
  endloop
endfacet
endsolid`;
    const out = parseSTL(new TextEncoder().encode(ascii).buffer);
    expect(out.length).toBe(9);
  });
});

describe("P2 OBJ parser", () => {
  it("parses a simple tri", () => {
    const obj = "v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n";
    const out = parseOBJ(obj);
    expect(out.length).toBe(9);
  });
  it("triangulates quads with a fan", () => {
    const obj = "v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\n";
    const out = parseOBJ(obj);
    expect(out.length).toBe(18); // two triangles
  });
});

describe("P2 3MF parser (single object)", () => {
  it("parses a single-object 3MF model.xml with two triangles", () => {
    const xml = `<model><resources><object id="1"><mesh>
<vertices>
<vertex x="0" y="0" z="0"/>
<vertex x="1" y="0" z="0"/>
<vertex x="0" y="1" z="0"/>
<vertex x="1" y="1" z="0"/>
</vertices>
<triangles>
<triangle v1="0" v2="1" v3="2"/>
<triangle v1="1" v2="3" v3="2"/>
</triangles>
</mesh></object></resources></model>`;
    const out = parse3MFModelXml(xml);
    expect(out.length).toBe(18);
  });
});

describe("P2 weld + classifier", () => {
  it("welds coincident vertices (cube has 8 unique verts)", () => {
    const { vertices } = weld(cubeTriangles(10));
    // 12 triangles × 3 vertices = 36 before welding. With correct welding → 8 unique.
    // A tolerance-based weld on perfectly-coincident vertices must collapse to 8.
    expect(vertices.length / 3).toBe(8);
  });
  it("classifier: cube → clean", () => {
    const s = summarise(cubeTriangles(10));
    expect(s.class).toBe("clean");
    expect(s.shells.length).toBe(1);
    expect(s.shells[0].closed).toBe(true);
  });
  it("classifier: two separated cubes → disjoint (both closed)", () => {
    const a = cubeTriangles(10);
    // Duplicate shifted by 100mm in X. Offset the cube copy by (+200, 0, 0).
    const b = new Float32Array(a.length);
    for (let i = 0; i < a.length; i += 3) {
      b[i] = a[i] + 200;
      b[i + 1] = a[i + 1];
      b[i + 2] = a[i + 2];
    }
    const merged = new Float32Array(a.length + b.length);
    merged.set(a, 0);
    merged.set(b, a.length);
    const s = summarise(merged);
    expect(s.shells.length).toBe(2);
    expect(s.class).toBe("disjoint");
  });
});
