/**
 * Mesh repair with manifold-3d.
 *
 * Prompt 2 — messy STLs (overlapping shells, duplicate internal surfaces)
 * inflate the raw surface area that the estimator uses for shell/time. We
 * extract every watertight shell, build a Manifold from each, batch-union
 * them, and return the triangles of the clean outer envelope. The caller
 * then re-runs `analyzeTriangles` on the repaired triangles so the pricing
 * math is unchanged — only the input area/volume are now sane.
 *
 * Manifold-3d is a WASM module (async init). We load it on first use,
 * then cache the module instance.
 */

import ManifoldModule from 'manifold-3d';
import { splitWatertightShells, type MeshQuality } from './meshQuality';

type ManifoldNS = Awaited<ReturnType<typeof ManifoldModule>>;

let modulePromise: Promise<ManifoldNS> | null = null;

async function getManifold(): Promise<ManifoldNS> {
  if (modulePromise) return modulePromise;
  modulePromise = (async () => {
    const mod = await ManifoldModule();
    mod.setup();
    return mod;
  })();
  return modulePromise;
}

export interface RepairResult {
  repaired: Float32Array;
  usedShells: number;
  skippedOpenShells: number;
  volumeMm3: number;
  surfaceAreaCm2: number;
  repairMs: number;
}

/** Convert a flat 9-float/triangle array to a Manifold-friendly indexed mesh. */
function toIndexedMesh(tri: Float32Array): { vertProperties: Float32Array; triVerts: Uint32Array } {
  const n = Math.floor(tri.length / 9);
  const map = new Map<string, number>();
  const verts: number[] = [];
  const triVerts = new Uint32Array(n * 3);
  for (let i = 0; i < n; i++) {
    for (let v = 0; v < 3; v++) {
      const b = i * 9 + v * 3;
      const x = tri[b], y = tri[b + 1], z = tri[b + 2];
      // quantise to 1e-5 mm — same tolerance Manifold uses internally.
      const key = `${Math.round(x * 1e5)}_${Math.round(y * 1e5)}_${Math.round(z * 1e5)}`;
      let idx = map.get(key);
      if (idx === undefined) {
        idx = verts.length / 3;
        verts.push(x, y, z);
        map.set(key, idx);
      }
      triVerts[i * 3 + v] = idx;
    }
  }
  return { vertProperties: Float32Array.from(verts), triVerts };
}

/** Extract triangles back out of a manifold result as the flat 9-floats format. */
function fromManifoldMesh(mesh: { vertProperties: Float32Array; triVerts: Uint32Array; numProp: number }): Float32Array {
  const stride = mesh.numProp;
  const nTri = Math.floor(mesh.triVerts.length / 3);
  const out = new Float32Array(nTri * 9);
  for (let t = 0; t < nTri; t++) {
    for (let v = 0; v < 3; v++) {
      const vi = mesh.triVerts[t * 3 + v];
      out[t * 9 + v * 3] = mesh.vertProperties[vi * stride];
      out[t * 9 + v * 3 + 1] = mesh.vertProperties[vi * stride + 1];
      out[t * 9 + v * 3 + 2] = mesh.vertProperties[vi * stride + 2];
    }
  }
  return out;
}

/**
 * Repair a messy mesh by batch-unioning its watertight shells. Open shells
 * are discarded (reported in `skippedOpenShells`). Returns the repaired
 * triangles and summary stats.
 *
 * Caller must have already decided repair is needed (quality.watertight === false).
 */
export async function repairMesh(tri: Float32Array, quality?: MeshQuality): Promise<RepairResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const mod = await getManifold();
  const { shells, openShellCount } = splitWatertightShells(tri);
  if (shells.length === 0) {
    throw new Error('mesh has no watertight shells to repair from');
  }
  // Build a Manifold per shell.
  const manifolds: InstanceType<ManifoldNS['Manifold']>[] = [];
  for (const s of shells) {
    const { vertProperties, triVerts } = toIndexedMesh(s);
    const m = new mod.Mesh({ numProp: 3, vertProperties, triVerts });
    const man = mod.Manifold.ofMesh(m);
    manifolds.push(man);
  }
  // Batch-union everything into a single manifold. This is the key step
  // that merges overlapping/duplicate shells into a single outer envelope.
  let unioned: InstanceType<ManifoldNS['Manifold']>;
  try {
    unioned = mod.Manifold.union(manifolds);
  } finally {
    for (const m of manifolds) m.delete();
  }
  try {
    const out = unioned.getMesh();
    const repairedTri = fromManifoldMesh(out);
    const volumeMm3 = unioned.volume();
    const surfaceAreaMm2 = unioned.surfaceArea();
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    void quality; // unused — accepted for future extension (e.g. logging).
    return {
      repaired: repairedTri,
      usedShells: shells.length,
      skippedOpenShells: openShellCount,
      volumeMm3,
      surfaceAreaCm2: surfaceAreaMm2 / 100,
      repairMs: t1 - t0,
    };
  } finally {
    unioned.delete();
  }
}

/** Race repair against a hard timeout. Resolves to null if it hits the deadline. */
export async function repairMeshWithBudget(
  tri: Float32Array,
  quality: MeshQuality,
  budgetMs: number,
): Promise<RepairResult | null> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), budgetMs);
  });
  try {
    const result = await Promise.race([repairMesh(tri, quality), timeout]);
    return result;
  } catch (err) {
    if (typeof process !== 'undefined' && process.env?.DEBUG_MESH_REPAIR) {
      console.error('[meshRepair] failed:', err);
    }
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
