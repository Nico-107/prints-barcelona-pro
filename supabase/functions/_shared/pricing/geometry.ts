// P2 — Geometry pipeline. Parses STL (binary + ASCII), OBJ and 3MF into Float32Array of
// triangles (9 floats per triangle); welds coincident vertices; classifies the mesh into
// `clean | disjoint | overlapping | open | mixed` so `robust.ts` can decide whether to run
// the slow union-aware ray-cast pass.

export type MeshClass = "clean" | "disjoint" | "overlapping" | "open" | "mixed";

export interface ShellSummary {
  triangles: number;
  closed: boolean;
  signedVolume: number; // mm³, signed by winding
  bboxMin: [number, number, number];
  bboxMax: [number, number, number];
}

export interface GeometrySummary {
  triangleCount: number;
  shells: ShellSummary[];
  class: MeshClass;
}

const WELD_TOLERANCE_REL = 1e-4;

// ---- STL ------------------------------------------------------------------------------
export function parseSTL(buf: ArrayBuffer): Float32Array {
  const dv = new DataView(buf);
  if (buf.byteLength >= 84) {
    const count = dv.getUint32(80, true);
    if (84 + count * 50 === buf.byteLength) {
      const out = new Float32Array(count * 9);
      for (let i = 0, o = 84; i < count; i++, o += 50) {
        for (let k = 0; k < 9; k++) out[i * 9 + k] = dv.getFloat32(o + 12 + k * 4, true);
      }
      return out;
    }
  }
  // ASCII fallback
  const text = new TextDecoder().decode(new Uint8Array(buf));
  const nums: number[] = [];
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) nums.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return Float32Array.from(nums.slice(0, Math.floor(nums.length / 9) * 9));
}

// ---- OBJ ------------------------------------------------------------------------------
export function parseOBJ(text: string): Float32Array {
  const verts: number[][] = [];
  const faces: number[][] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (t[0] === "v" && t[1] === " ") {
      const p = t.split(/\s+/);
      verts.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
    } else if (t[0] === "f" && t[1] === " ") {
      const p = t.split(/\s+/).slice(1).map((s) => parseInt(s.split("/")[0], 10) - 1);
      // Triangulate fan
      for (let i = 1; i + 1 < p.length; i++) faces.push([p[0], p[i], p[i + 1]]);
    }
  }
  const out = new Float32Array(faces.length * 9);
  for (let i = 0; i < faces.length; i++) {
    const [a, b, c] = faces[i];
    const [v0, v1, v2] = [verts[a] ?? [0, 0, 0], verts[b] ?? [0, 0, 0], verts[c] ?? [0, 0, 0]];
    out.set([v0[0], v0[1], v0[2], v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]], i * 9);
  }
  return out;
}

// ---- 3MF (minimal: single-object mesh) ------------------------------------------------
export function parse3MFModelXml(xml: string): Float32Array {
  // Minimal XML walker without a full parser dependency. Matches the <vertices>/<triangles>
  // blocks and the x/y/z, v1/v2/v3 attributes. 3MF with multiple <object> elements is
  // flattened by appending their triangles. Components/transforms are not handled here —
  // that's P10; this is the skeleton for P2 tests.
  const verts: number[][] = [];
  const faces: number[][] = [];
  const vertRe = /<vertex\s[^>]*x="([-+0-9.eE]+)"[^>]*y="([-+0-9.eE]+)"[^>]*z="([-+0-9.eE]+)"[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(xml))) verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  const triRe = /<triangle\s[^>]*v1="(\d+)"[^>]*v2="(\d+)"[^>]*v3="(\d+)"[^>]*\/>/g;
  while ((m = triRe.exec(xml))) faces.push([parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)]);
  const out = new Float32Array(faces.length * 9);
  for (let i = 0; i < faces.length; i++) {
    const [a, b, c] = faces[i];
    const [v0, v1, v2] = [verts[a] ?? [0, 0, 0], verts[b] ?? [0, 0, 0], verts[c] ?? [0, 0, 0]];
    out.set([v0[0], v0[1], v0[2], v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]], i * 9);
  }
  return out;
}

// ---- Weld vertices ---------------------------------------------------------------------
function tolerance(tri: Float32Array): number {
  let lo = Infinity,
    hi = -Infinity;
  for (let i = 0; i < tri.length; i++) {
    if (tri[i] < lo) lo = tri[i];
    if (tri[i] > hi) hi = tri[i];
  }
  const span = Math.max(hi - lo, 1);
  return Math.max(span * WELD_TOLERANCE_REL, 1e-4);
}

export function weld(tri: Float32Array): { indices: Int32Array; vertices: Float32Array } {
  const tol = tolerance(tri);
  const bucket = (v: number) => Math.round(v / tol);
  const map = new Map<string, number>();
  const vertices: number[] = [];
  const indices = new Int32Array(tri.length / 3);
  for (let i = 0, j = 0; i < tri.length; i += 3, j++) {
    const k = `${bucket(tri[i])},${bucket(tri[i + 1])},${bucket(tri[i + 2])}`;
    let idx = map.get(k);
    if (idx === undefined) {
      idx = vertices.length / 3;
      vertices.push(tri[i], tri[i + 1], tri[i + 2]);
      map.set(k, idx);
    }
    indices[j] = idx;
  }
  return { indices, vertices: Float32Array.from(vertices) };
}

// ---- Shells + classification ----------------------------------------------------------
function buildShells(indices: Int32Array): number[][] {
  // Each triangle has 3 vertex indices. Group triangles by the connected component they
  // form when sharing any vertex (good enough for the classifier; full edge-shared is a
  // future refinement).
  const triCount = indices.length / 3;
  const parent = new Int32Array(triCount);
  for (let i = 0; i < triCount; i++) parent[i] = i;
  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(a: number, b: number) {
    const ra = find(a),
      rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  const bucketToTri = new Map<number, number[]>();
  for (let i = 0; i < triCount; i++) {
    for (let k = 0; k < 3; k++) {
      const v = indices[i * 3 + k];
      const arr = bucketToTri.get(v);
      if (!arr) bucketToTri.set(v, [i]);
      else arr.push(i);
    }
  }
  for (const arr of bucketToTri.values()) {
    for (let i = 1; i < arr.length; i++) union(arr[0], arr[i]);
  }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < triCount; i++) {
    const r = find(i);
    const arr = groups.get(r);
    if (!arr) groups.set(r, [i]);
    else arr.push(i);
  }
  return [...groups.values()];
}

function shellSummary(tri: Float32Array, indices: Int32Array, vertices: Float32Array, triIdxs: number[]): ShellSummary {
  const mn: [number, number, number] = [Infinity, Infinity, Infinity];
  const mx: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  let signedVol6 = 0;
  for (const t of triIdxs) {
    const b = t * 9;
    for (let k = 0; k < 3; k++) {
      const x = tri[b + k * 3],
        y = tri[b + k * 3 + 1],
        z = tri[b + k * 3 + 2];
      if (x < mn[0]) mn[0] = x;
      if (y < mn[1]) mn[1] = y;
      if (z < mn[2]) mn[2] = z;
      if (x > mx[0]) mx[0] = x;
      if (y > mx[1]) mx[1] = y;
      if (z > mx[2]) mx[2] = z;
    }
    const x0 = tri[b],
      y0 = tri[b + 1],
      z0 = tri[b + 2],
      x1 = tri[b + 3],
      y1 = tri[b + 4],
      z1 = tri[b + 5],
      x2 = tri[b + 6],
      y2 = tri[b + 7],
      z2 = tri[b + 8];
    signedVol6 += x0 * (y1 * z2 - y2 * z1) + y0 * (z1 * x2 - z2 * x1) + z0 * (x1 * y2 - x2 * y1);
  }
  // Boundary-edge test: for each edge, count times it appears across the shell's triangles.
  const edgeCount = new Map<string, number>();
  for (const t of triIdxs) {
    const a = indices[t * 3],
      b = indices[t * 3 + 1],
      c = indices[t * 3 + 2];
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as const) {
      const k = u < v ? `${u}-${v}` : `${v}-${u}`;
      edgeCount.set(k, (edgeCount.get(k) ?? 0) + 1);
    }
  }
  let closed = true;
  for (const c of edgeCount.values()) {
    if (c !== 2) {
      closed = false;
      break;
    }
  }
  return { triangles: triIdxs.length, closed, signedVolume: signedVol6 / 6, bboxMin: mn, bboxMax: mx };
}

export function summarise(tri: Float32Array): GeometrySummary {
  const { indices, vertices } = weld(tri);
  const groups = buildShells(indices);
  const shells = groups.map((g) => shellSummary(tri, indices, vertices, g));
  let cls: MeshClass = "clean";
  if (shells.length === 1) cls = shells[0].closed ? "clean" : "open";
  else {
    const allClosed = shells.every((s) => s.closed);
    const anyOverlap = shells.some((s1, i) =>
      shells.some((s2, j) => {
        if (i === j) return false;
        for (let k = 0; k < 3; k++) if (s1.bboxMax[k] < s2.bboxMin[k] || s2.bboxMax[k] < s1.bboxMin[k]) return false;
        return true;
      }),
    );
    if (allClosed) cls = anyOverlap ? "overlapping" : "disjoint";
    else cls = "mixed";
  }
  return { triangleCount: tri.length / 9, shells, class: cls };
}
