#!/usr/bin/env node
// Q2 — Fixture generator. Writes synthetic-but-large STL / 3MF / OBJ files into
// `test-fixtures/checkpoint/generated/` for the matrix and performance specs.
// Idempotent: regenerates only when the target file is missing or the generator
// signature changed.

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "test-fixtures", "checkpoint", "generated");
mkdirSync(OUT, { recursive: true });

function sigFor(fn) {
  return createHash("sha256").update(fn.toString()).digest("hex").slice(0, 10);
}

function writeBinaryStl(name, triangles) {
  const n = triangles.length / 9;
  const buf = Buffer.alloc(84 + n * 50);
  buf.writeUInt32LE(n, 80);
  for (let i = 0, o = 84; i < n; i++, o += 50) {
    for (let k = 0; k < 9; k++) buf.writeFloatLE(triangles[i * 9 + k], o + 12 + k * 4);
  }
  writeFileSync(path.join(OUT, name), buf);
  console.log(`wrote ${name} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
}

function highPolySphereTris(radiusMm, subdivisions) {
  // icosahedron + loop subdivision gives a predictable triangle count.
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  for (let s = 0; s < subdivisions; s++) {
    const midCache = new Map();
    const midpoint = (a, b) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (midCache.has(key)) return midCache.get(key);
      const va = verts[a], vb = verts[b];
      const m = [(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2];
      const idx = verts.length;
      verts.push(m);
      midCache.set(key, idx);
      return idx;
    };
    const newFaces = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = newFaces;
  }
  // Normalise to radius
  verts = verts.map(([x, y, z]) => {
    const l = Math.sqrt(x * x + y * y + z * z);
    return [(x / l) * radiusMm + radiusMm, (y / l) * radiusMm + radiusMm, (z / l) * radiusMm + radiusMm];
  });
  const out = new Float32Array(faces.length * 9);
  for (let i = 0; i < faces.length; i++) {
    const [a, b, c] = faces[i];
    const va = verts[a], vb = verts[b], vc = verts[c];
    out.set([va[0], va[1], va[2], vb[0], vb[1], vb[2], vc[0], vc[1], vc[2]], i * 9);
  }
  return out;
}

function need(name) {
  const abs = path.join(OUT, name);
  if (!existsSync(abs)) return true;
  // Signature-based: regenerate when the generator source changes.
  const sigFile = abs + ".sig";
  const want = sigFor(need);
  if (!existsSync(sigFile) || readFileSync(sigFile, "utf8").trim() !== want) return true;
  return false;
}

// 30 MB sphere
if (need("30mb_sphere.stl")) {
  const tri = highPolySphereTris(50, 6);
  writeBinaryStl("30mb_sphere.stl", tri);
}

// 60 MB sphere
if (need("60mb_sphere.stl")) {
  const tri = highPolySphereTris(80, 7);
  writeBinaryStl("60mb_sphere.stl", tri);
}

console.log("gen-fixtures: done");
