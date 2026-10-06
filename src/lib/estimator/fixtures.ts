// Test-fixture mesh generators (used only by tests). Each returns Float32Array, 9 floats per triangle, outward normals.
type V3 = [number, number, number];
function push(out: number[], a: V3, b: V3, c: V3) { out.push(...a, ...b, ...c); }
function quad(out: number[], a: V3, b: V3, c: V3, d: V3) { push(out, a, b, c); push(out, a, c, d); }

export function boxMesh(x: number, y: number, z: number): Float32Array {
  const v: V3[] = [[0,0,0],[x,0,0],[x,y,0],[0,y,0],[0,0,z],[x,0,z],[x,y,z],[0,y,z]];
  const o: number[] = [];
  const f = (a: number, b: number, c: number, d: number) => quad(o, v[a], v[b], v[c], v[d]);
  f(0,3,2,1); f(4,5,6,7); f(0,1,5,4); f(3,7,6,2); f(0,4,7,3); f(1,2,6,5);
  return Float32Array.from(o);
}

/** Cylinder (innerR = 0) or tube along +z, `seg` straight segments. */
export function prismMesh(outerR: number, h: number, seg: number, innerR = 0): Float32Array {
  const o: number[] = [];
  const P = (r: number, a: number, z: number): V3 => [r * Math.cos(a), r * Math.sin(a), z];
  for (let i = 0; i < seg; i++) {
    const a0 = (2 * Math.PI * i) / seg, a1 = (2 * Math.PI * (i + 1)) / seg;
    quad(o, P(outerR, a0, 0), P(outerR, a1, 0), P(outerR, a1, h), P(outerR, a0, h));
    if (innerR > 0) {
      quad(o, P(innerR, a1, 0), P(innerR, a0, 0), P(innerR, a0, h), P(innerR, a1, h));
      quad(o, P(innerR, a0, h), P(outerR, a0, h), P(outerR, a1, h), P(innerR, a1, h));
      quad(o, P(outerR, a0, 0), P(innerR, a0, 0), P(innerR, a1, 0), P(outerR, a1, 0));
    } else {
      push(o, [0, 0, h], P(outerR, a0, h), P(outerR, a1, h));
      push(o, [0, 0, 0], P(outerR, a1, 0), P(outerR, a0, 0));
    }
  }
  return Float32Array.from(o);
}

/** T-shaped beam: profile in the XZ plane extruded 60 mm along +y. Stem 10x30, flange 60x5 (underside overhangs 25 mm each side). */
export function tBeamMesh(lengthY = 60): Float32Array {
  const poly: [number, number][] = [[-5,0],[5,0],[5,30],[30,30],[30,35],[-30,35],[-30,30],[-5,30]];
  const o: number[] = [];
  const A = (i: number, y: number): V3 => [poly[i][0], y, poly[i][1]];
  for (let i = 0; i < poly.length; i++) { const j = (i + 1) % poly.length; quad(o, A(i, 0), A(i, lengthY), A(j, lengthY), A(j, 0)); } // outward walls
  const cap = (y: number, flip: boolean) => {                       // two rectangles: stem (0,1,2,7) and flange (6,3,4,5)
    for (const q of [[0,1,2,7],[6,3,4,5]]) {
      const [a, b, c, d] = q.map(k => A(k, y));
      if (!flip) { push(o, a, b, c); push(o, a, c, d); } else { push(o, a, c, b); push(o, a, d, c); }
    }
  };
  cap(0, false); cap(lengthY, true);
  return Float32Array.from(o);
}

export function toBinaryStl(tri: Float32Array): ArrayBuffer {
  const n = tri.length / 9, buf = new ArrayBuffer(84 + n * 50), dv = new DataView(buf);
  dv.setUint32(80, n, true);
  for (let i = 0; i < n; i++) { const o = 84 + i * 50; for (let k = 0; k < 9; k++) dv.setFloat32(o + 12 + k * 4, tri[i * 9 + k], true); }
  return buf;
}
