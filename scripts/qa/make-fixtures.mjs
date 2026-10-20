/**
 * Generates binary STL fixtures used by upload-matrix.mjs and other QA scripts.
 *
 * Outputs:
 *   tests/fixtures/cube-20mm.stl     — 20 mm³ cube, 12 triangles
 *
 * Usage: node scripts/qa/make-fixtures.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "../../tests/fixtures");
mkdirSync(FIXTURES_DIR, { recursive: true });

/** Write a 20 mm cube as binary STL (12 triangles, outward normals). */
function makeCube20mm() {
  const triangles = [
    // -Z face
    [[0,0,0],[20,0,0],[20,20,0]],  [[0,0,0],[20,20,0],[0,20,0]],
    // +Z face
    [[0,0,20],[20,20,20],[20,0,20]],  [[0,0,20],[0,20,20],[20,20,20]],
    // -Y face
    [[0,0,0],[0,0,20],[20,0,20]],  [[0,0,0],[20,0,20],[20,0,0]],
    // +Y face
    [[0,20,0],[20,20,0],[20,20,20]],  [[0,20,0],[20,20,20],[0,20,20]],
    // -X face
    [[0,0,0],[0,20,0],[0,20,20]],  [[0,0,0],[0,20,20],[0,0,20]],
    // +X face
    [[20,0,0],[20,0,20],[20,20,20]],  [[20,0,0],[20,20,20],[20,20,0]],
  ];

  const buf = Buffer.alloc(84 + triangles.length * 50);
  buf.write("cube-20mm fixture".padEnd(80, " "), 0, "ascii");
  buf.writeUInt32LE(triangles.length, 80);

  let off = 84;
  for (const [a, b, c] of triangles) {
    // normal (placeholder — STL readers recompute)
    buf.writeFloatLE(0, off); buf.writeFloatLE(0, off + 4); buf.writeFloatLE(0, off + 8);
    off += 12;
    for (const v of [a, b, c]) {
      buf.writeFloatLE(v[0], off); buf.writeFloatLE(v[1], off + 4); buf.writeFloatLE(v[2], off + 8);
      off += 12;
    }
    buf.writeUInt16LE(0, off); off += 2;
  }

  return buf;
}

const cubePath = join(FIXTURES_DIR, "cube-20mm.stl");
writeFileSync(cubePath, makeCube20mm());
console.log(`✓ ${cubePath}`);
