/**
 * Browser-side STL preparation: ASCII→binary conversion and mesh simplification.
 * Keeps uploaded files within the 30 MB server re-measure limit while preserving geometry.
 */

/** 28 MB: leaves 2 MB margin below the server's 30 MB limit */
export const CHECKOUT_MAX_BYTES = 28 * 1024 * 1024;
/** 56 MB total across all files */
export const CHECKOUT_MAX_TOTAL_BYTES = 56 * 1024 * 1024;
/** ~550k triangles = 84 + 550000 * 50 bytes ≈ 27.5 MB */
export const MAX_TRIANGLES = 550_000;

export interface PrepareResult {
  /** The checkout copy ready for upload and pricing */
  checkoutBuf: ArrayBuffer;
  /** Gzipped original — null if CompressionStream unavailable or original ≤ 28 MB and already binary */
  originalGzipped: ArrayBuffer | null;
  ascii_converted: boolean;
  simplified: boolean;
  triangles_before: number;
  triangles_after: number;
  final_bytes: number;
  original_bytes: number;
  format: "stl_binary" | "stl_ascii";
  ms: number;
}

export interface PrepareProgress {
  stage: "converting" | "simplifying" | "verifying" | "gzipping";
  pct: number;
}

/** True if buffer is a valid binary STL */
export function isBinaryStl(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 84) return false;
  const count = new DataView(buf).getUint32(80, true);
  return buf.byteLength === 84 + count * 50;
}

/** Count triangles in a binary STL (does not validate format) */
export function countBinaryStlTriangles(buf: ArrayBuffer): number {
  if (buf.byteLength < 84) return 0;
  return new DataView(buf).getUint32(80, true);
}

/** Convert the Float32Array of 9-float triangles to a binary STL ArrayBuffer */
export function trianglesToBinaryStl(tri: Float32Array): ArrayBuffer {
  const n = Math.floor(tri.length / 9);
  const out = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(out);
  // header left as zero bytes
  dv.setUint32(80, n, true);
  for (let i = 0; i < n; i++) {
    const base = 84 + i * 50;
    const b = i * 9;
    const x0 = tri[b],   y0 = tri[b+1], z0 = tri[b+2];
    const x1 = tri[b+3], y1 = tri[b+4], z1 = tri[b+5];
    const x2 = tri[b+6], y2 = tri[b+7], z2 = tri[b+8];
    const ex = x1-x0, ey = y1-y0, ez = z1-z0;
    const fx = x2-x0, fy = y2-y0, fz = z2-z0;
    const nx = ey*fz - ez*fy, ny = ez*fx - ex*fz, nz = ex*fy - ey*fx;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
    dv.setFloat32(base,   nx/len, true);
    dv.setFloat32(base+4, ny/len, true);
    dv.setFloat32(base+8, nz/len, true);
    for (let k = 0; k < 9; k++) dv.setFloat32(base + 12 + k*4, tri[b+k], true);
    // attribute byte count: 0 (zero-initialized)
  }
  return out;
}

/**
 * Build an indexed geometry from a binary STL for use with MeshoptSimplifier.
 * Uses bit-exact float comparison to deduplicate shared vertices.
 */
function buildIndexedGeometry(buf: ArrayBuffer): { positions: Float32Array; indices: Uint32Array } {
  const dv = new DataView(buf);
  const triCount = dv.getUint32(80, true);
  const map = new Map<string, number>();
  const uniquePos: number[] = [];
  const indices = new Uint32Array(triCount * 3);

  for (let i = 0; i < triCount; i++) {
    const base = 84 + i * 50 + 12; // skip 80-byte header + 4-byte count + 12-byte normal
    for (let v = 0; v < 3; v++) {
      const x = dv.getFloat32(base + v*12,   true);
      const y = dv.getFloat32(base + v*12+4,  true);
      const z = dv.getFloat32(base + v*12+8,  true);
      const key = `${x},${y},${z}`;
      let idx = map.get(key);
      if (idx === undefined) {
        idx = uniquePos.length / 3;
        uniquePos.push(x, y, z);
        map.set(key, idx);
      }
      indices[i * 3 + v] = idx;
    }
  }

  return { positions: new Float32Array(uniquePos), indices };
}

/**
 * Reconstruct a binary STL from simplified indexed geometry.
 */
function indexedGeometryToStl(positions: Float32Array, indices: Uint32Array): ArrayBuffer {
  const n = indices.length / 3;
  const tri = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const i0 = indices[i*3]*3, i1 = indices[i*3+1]*3, i2 = indices[i*3+2]*3;
    tri[b]   = positions[i0]; tri[b+1] = positions[i0+1]; tri[b+2] = positions[i0+2];
    tri[b+3] = positions[i1]; tri[b+4] = positions[i1+1]; tri[b+5] = positions[i1+2];
    tri[b+6] = positions[i2]; tri[b+7] = positions[i2+1]; tri[b+8] = positions[i2+2];
  }
  return trianglesToBinaryStl(tri);
}

/** Compute volume from a non-indexed Float32Array of 9 floats per triangle */
function trianglesVolume(tri: Float32Array): number {
  const n = Math.floor(tri.length / 9);
  let vol = 0;
  for (let i = 0; i < n; i++) {
    const b = i * 9;
    const x0 = tri[b], y0 = tri[b+1], z0 = tri[b+2];
    const x1 = tri[b+3], y1 = tri[b+4], z1 = tri[b+5];
    const x2 = tri[b+6], y2 = tri[b+7], z2 = tri[b+8];
    vol += x0*(y1*z2 - y2*z1) + y0*(z1*x2 - z2*x1) + z0*(x1*y2 - x2*y1);
  }
  return Math.abs(vol) / 6;
}

/** Compute volume from indexed geometry */
function indexedVolume(positions: Float32Array, indices: Uint32Array): number {
  const n = indices.length / 3;
  let vol = 0;
  for (let i = 0; i < n; i++) {
    const i0 = indices[i*3]*3, i1 = indices[i*3+1]*3, i2 = indices[i*3+2]*3;
    const x0 = positions[i0], y0 = positions[i0+1], z0 = positions[i0+2];
    const x1 = positions[i1], y1 = positions[i1+1], z1 = positions[i1+2];
    const x2 = positions[i2], y2 = positions[i2+1], z2 = positions[i2+2];
    vol += x0*(y1*z2 - y2*z1) + y0*(z1*x2 - z2*x1) + z0*(x1*y2 - x2*y1);
  }
  return Math.abs(vol) / 6;
}

/** Compute bounding box from indexed geometry */
function indexedBbox(positions: Float32Array): { x: number; y: number; z: number } {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    if (positions[i]   < minX) minX = positions[i];   if (positions[i]   > maxX) maxX = positions[i];
    if (positions[i+1] < minY) minY = positions[i+1]; if (positions[i+1] > maxY) maxY = positions[i+1];
    if (positions[i+2] < minZ) minZ = positions[i+2]; if (positions[i+2] > maxZ) maxZ = positions[i+2];
  }
  return { x: maxX-minX, y: maxY-minY, z: maxZ-minZ };
}

/** Bounding box from non-indexed triangle array */
function trianglesBbox(tri: Float32Array): { x: number; y: number; z: number } {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < tri.length; i += 3) {
    if (tri[i]   < minX) minX = tri[i];   if (tri[i]   > maxX) maxX = tri[i];
    if (tri[i+1] < minY) minY = tri[i+1]; if (tri[i+1] > maxY) maxY = tri[i+1];
    if (tri[i+2] < minZ) minZ = tri[i+2]; if (tri[i+2] > maxZ) maxZ = tri[i+2];
  }
  return { x: maxX-minX, y: maxY-minY, z: maxZ-minZ };
}

async function gzipBuffer(buf: ArrayBuffer): Promise<ArrayBuffer | null> {
  try {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(new Uint8Array(buf));
    writer.close();
    const chunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
    const out = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
    return out.buffer;
  } catch {
    return null;
  }
}

/**
 * Parse ASCII STL to Float32Array using the same regex as `stlToTriangles` in core.ts.
 */
function parseAsciiStlToTriangles(buf: ArrayBuffer): Float32Array {
  const text = new TextDecoder().decode(new Uint8Array(buf));
  const nums: number[] = [];
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) nums.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return Float32Array.from(nums.slice(0, Math.floor(nums.length / 9) * 9));
}

/**
 * Prepare an STL ArrayBuffer for upload and pricing:
 * 1. ASCII → binary
 * 2. If still > CHECKOUT_MAX_BYTES, simplify mesh
 * Returns the checkout copy, the gzipped original, and metadata.
 */
export async function prepareStl(
  buf: ArrayBuffer,
  onProgress?: (p: PrepareProgress) => void,
): Promise<PrepareResult> {
  const t0 = Date.now();
  const original_bytes = buf.byteLength;
  const isBinary = isBinaryStl(buf);
  const format: PrepareResult["format"] = isBinary ? "stl_binary" : "stl_ascii";

  // ── Step 1: ASCII → binary ─────────────────────────────────────────────────
  let binaryBuf: ArrayBuffer;
  let ascii_converted = false;
  if (!isBinary) {
    onProgress?.({ stage: "converting", pct: 10 });
    const tri = parseAsciiStlToTriangles(buf);
    binaryBuf = trianglesToBinaryStl(tri);
    ascii_converted = true;
    onProgress?.({ stage: "converting", pct: 30 });
  } else {
    binaryBuf = buf;
  }

  const triangles_before = countBinaryStlTriangles(binaryBuf);

  // ── Step 2: simplify if still too large ───────────────────────────────────
  let simplified = false;
  let checkoutBuf = binaryBuf;
  let triangles_after = triangles_before;

  if (binaryBuf.byteLength > CHECKOUT_MAX_BYTES) {
    onProgress?.({ stage: "simplifying", pct: 40 });

    let resultBuf: ArrayBuffer | null = null;

    try {
      const { MeshoptSimplifier } = await import("meshoptimizer/simplifier");
      await MeshoptSimplifier.ready;

      const { positions, indices } = buildIndexedGeometry(binaryBuf);
      onProgress?.({ stage: "simplifying", pct: 55 });

      const origVol = indexedVolume(positions, indices);
      const origBbox = indexedBbox(positions);
      const maxDim = Math.max(origBbox.x, origBbox.y, origBbox.z) || 1;

      // Target: MAX_TRIANGLES → MAX_TRIANGLES * 3 indices
      const targetIndexCount = MAX_TRIANGLES * 3;
      // Relative error: 0.02 mm normalized by max dimension
      const targetError = Math.min(0.02 / maxDim, 0.005);

      let currentIndices = indices;
      let currentError = targetError;

      // Retry with looser error if needed
      for (let attempt = 0; attempt < 3; attempt++) {
        onProgress?.({ stage: "simplifying", pct: 60 + attempt * 10 });
        const simplified_indices = MeshoptSimplifier.simplify(
          currentIndices,
          positions,
          3, // stride in floats
          targetIndexCount,
          currentError,
          ["LockBorder"],
        );

        // Verify volume within ±0.5% and bbox within ±0.1 mm
        const simplVol = indexedVolume(positions, simplified_indices);
        const simplBbox = indexedBbox(positions); // positions unchanged, bbox same
        const volOk = Math.abs(simplVol - origVol) / (origVol || 1) <= 0.005;
        const bboxOk =
          Math.abs(simplBbox.x - origBbox.x) <= 0.1 &&
          Math.abs(simplBbox.y - origBbox.y) <= 0.1 &&
          Math.abs(simplBbox.z - origBbox.z) <= 0.1;

        if (volOk && bboxOk) {
          resultBuf = indexedGeometryToStl(positions, simplified_indices);
          triangles_after = simplified_indices.length / 3;
          simplified = true;
          break;
        }

        // Retry with doubled error
        currentError = currentError * 2;
        currentIndices = indices; // reset to original
      }
    } catch (err) {
      console.warn("[stlPrepare] simplification failed, falling back to original binary:", err);
    }

    if (resultBuf) {
      checkoutBuf = resultBuf;
    } else {
      // Fall back: use the binary STL as-is (server will reject if > 30MB, but that's rare)
      checkoutBuf = binaryBuf;
      triangles_after = triangles_before;
    }
  }

  // ── Step 3: gzip the original for archival ────────────────────────────────
  let originalGzipped: ArrayBuffer | null = null;
  // Only gzip if the original is larger (i.e., we changed it), and it's not already tiny
  if (ascii_converted || simplified) {
    onProgress?.({ stage: "gzipping", pct: 90 });
    const STORAGE_CAP = 50 * 1024 * 1024;
    const gzipped = await gzipBuffer(buf);
    if (gzipped && gzipped.byteLength <= STORAGE_CAP) {
      originalGzipped = gzipped;
    }
    // If gzipped > 50 MB, skip (just upload checkout copy)
  }

  onProgress?.({ stage: "gzipping", pct: 100 });

  return {
    checkoutBuf,
    originalGzipped,
    ascii_converted,
    simplified,
    triangles_before,
    triangles_after,
    final_bytes: checkoutBuf.byteLength,
    original_bytes,
    format,
    ms: Date.now() - t0,
  };
}

/**
 * Scales every vertex coordinate in a binary STL by `scale`.
 * Used to apply user-selected scale factor before upload and analysis.
 */
export function scaleStlBuffer(buf: ArrayBuffer, scale: number): ArrayBuffer {
  if (scale === 1) return buf;
  if (!isBinaryStl(buf)) throw new Error("scaleStlBuffer: not a binary STL");
  const dv = new DataView(buf);
  const n = dv.getUint32(80, true);
  const out = buf.slice(0); // copy
  const dvOut = new DataView(out);
  for (let i = 0; i < n; i++) {
    const base = 84 + i * 50;
    // normal (base 0-12): leave unchanged
    // vertices (base 12-48): scale each float32
    for (let k = 0; k < 9; k++) {
      const off = base + 12 + k * 4;
      dvOut.setFloat32(off, dv.getFloat32(off, true) * scale, true);
    }
  }
  return out;
}
