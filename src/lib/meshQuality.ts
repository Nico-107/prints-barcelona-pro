/**
 * Mesh quality: shell count, watertight detection, raw area.
 *
 * Prompt 2 — messy meshes (overlapping shells / duplicate internal surfaces)
 * inflate the raw surface area which, in turn, inflates the estimator's shell
 * term and prices. We need to know BEFORE pricing whether a mesh is clean
 * (1 watertight shell) or needs repair.
 *
 * Algorithm — one pass to deduplicate vertices by rounded position, build a
 * triangle adjacency via union-find on shared edges, flag open edges. O(n).
 * Rounding to 1e-4 mm (0.1 µm) merges vertices that only differ in float
 * rounding; genuine distinct vertices stay distinct.
 */

const ROUND = 1e4; // quantise to 0.1 µm

/** Index each vertex by rounded position; returns per-triangle vertex indices. */
function indexVertices(tri: Float32Array): Uint32Array {
  const n = Math.floor(tri.length / 9);
  const map = new Map<string, number>();
  const triVerts = new Uint32Array(n * 3);
  let next = 0;
  for (let i = 0; i < n; i++) {
    for (let v = 0; v < 3; v++) {
      const b = i * 9 + v * 3;
      const x = Math.round(tri[b] * ROUND) | 0;
      const y = Math.round(tri[b + 1] * ROUND) | 0;
      const z = Math.round(tri[b + 2] * ROUND) | 0;
      const key = x + '|' + y + '|' + z;
      let hit = map.get(key);
      if (hit === undefined) {
        hit = next++;
        map.set(key, hit);
      }
      triVerts[i * 3 + v] = hit;
    }
  }
  return triVerts;
}

interface UnionFind {
  parent: Int32Array;
  rank: Uint8Array;
  find(x: number): number;
  union(a: number, b: number): void;
}

function makeUF(n: number): UnionFind {
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const rank = new Uint8Array(n);
  const uf: UnionFind = {
    parent,
    rank,
    find(x: number): number {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    },
    union(a: number, b: number): void {
      const ra = uf.find(a), rb = uf.find(b);
      if (ra === rb) return;
      if (rank[ra] < rank[rb]) parent[ra] = rb;
      else if (rank[ra] > rank[rb]) parent[rb] = ra;
      else { parent[rb] = ra; rank[ra]++; }
    },
  };
  return uf;
}

export interface MeshQuality {
  triangles: number;
  shells: number;
  openEdges: number;
  watertight: boolean;
  totalSurfaceCm2: number;
}

/** Compute shell count + open-edge count + total surface area. */
export function analyzeMeshQuality(tri: Float32Array): MeshQuality {
  const triCount = Math.floor(tri.length / 9);
  const triVerts = indexVertices(tri);
  const uf = makeUF(triCount);
  // Edge map: edge key -> first triangle seen on that edge (-1 if seen twice already).
  const edgeMap = new Map<string, number>();
  let openEdges = 0;
  // Edge ordering: direction-agnostic (min, max) so adjacent triangles match.
  function edgeKey(a: number, b: number): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }
  for (let t = 0; t < triCount; t++) {
    const a = triVerts[t * 3], b = triVerts[t * 3 + 1], c = triVerts[t * 3 + 2];
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      if (u === v) continue; // degenerate
      const k = edgeKey(u, v);
      const seen = edgeMap.get(k);
      if (seen === undefined) {
        edgeMap.set(k, t);
      } else if (seen === -1) {
        // already shared by 2 — a third sharing means non-manifold; count as open.
        openEdges++;
      } else {
        uf.union(t, seen);
        edgeMap.set(k, -1);
      }
    }
  }
  // Count open edges = edges still with a single owner.
  for (const v of edgeMap.values()) if (v !== -1) openEdges++;
  // Count shells = distinct UF roots.
  const roots = new Set<number>();
  for (let t = 0; t < triCount; t++) roots.add(uf.find(t));
  // Raw surface area (cm²).
  let areaMm2 = 0;
  for (let t = 0; t < triCount; t++) {
    const b = t * 9;
    const x0 = tri[b], y0 = tri[b + 1], z0 = tri[b + 2];
    const ex1 = tri[b + 3] - x0, ey1 = tri[b + 4] - y0, ez1 = tri[b + 5] - z0;
    const ex2 = tri[b + 6] - x0, ey2 = tri[b + 7] - y0, ez2 = tri[b + 8] - z0;
    const cx = ey1 * ez2 - ez1 * ey2, cy = ez1 * ex2 - ex1 * ez2, cz = ex1 * ey2 - ey1 * ex2;
    const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
    areaMm2 += len / 2;
  }
  return {
    triangles: triCount,
    shells: roots.size,
    openEdges,
    watertight: openEdges === 0 && roots.size === 1,
    totalSurfaceCm2: areaMm2 / 100,
  };
}

/**
 * Split triangles into per-shell arrays, returning only WATERTIGHT shells
 * (each edge appears exactly twice within the shell). Open shells are
 * discarded — they can't form a Manifold. Returns the count of discarded
 * open shells so the caller can log it.
 */
export function splitWatertightShells(tri: Float32Array): {
  shells: Float32Array[];
  openShellCount: number;
} {
  const triCount = Math.floor(tri.length / 9);
  const triVerts = indexVertices(tri);
  const uf = makeUF(triCount);
  // First pass: group triangles into connected components by shared edges.
  const edgeMap = new Map<string, number>();
  function edgeKey(a: number, b: number): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }
  for (let t = 0; t < triCount; t++) {
    const a = triVerts[t * 3], b = triVerts[t * 3 + 1], c = triVerts[t * 3 + 2];
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      if (u === v) continue;
      const k = edgeKey(u, v);
      const seen = edgeMap.get(k);
      if (seen === undefined) {
        edgeMap.set(k, t);
      } else if (seen !== -1) {
        uf.union(t, seen);
        edgeMap.set(k, -1);
      }
    }
  }
  // Group triangle indices by root.
  const byRoot = new Map<number, number[]>();
  for (let t = 0; t < triCount; t++) {
    const r = uf.find(t);
    let g = byRoot.get(r);
    if (!g) { g = []; byRoot.set(r, g); }
    g.push(t);
  }
  // For each component, test watertight-ness independently.
  const shells: Float32Array[] = [];
  let openShellCount = 0;
  for (const group of byRoot.values()) {
    const localEdges = new Map<string, number>();
    let openHere = 0;
    for (const t of group) {
      const a = triVerts[t * 3], b = triVerts[t * 3 + 1], c = triVerts[t * 3 + 2];
      for (const [u, v] of [[a, b], [b, c], [c, a]]) {
        if (u === v) continue;
        const k = edgeKey(u, v);
        const seen = localEdges.get(k);
        if (seen === undefined) localEdges.set(k, 1);
        else localEdges.set(k, seen + 1);
      }
    }
    for (const c of localEdges.values()) if (c !== 2) openHere++;
    if (openHere > 0) { openShellCount++; continue; }
    // Watertight — collect triangles for this component.
    const out = new Float32Array(group.length * 9);
    for (let i = 0; i < group.length; i++) {
      const srcBase = group[i] * 9;
      const dstBase = i * 9;
      for (let k = 0; k < 9; k++) out[dstBase + k] = tri[srcBase + k];
    }
    shells.push(out);
  }
  return { shells, openShellCount };
}
