import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { unzipSync } from "fflate";

const exporter = new STLExporter();

function mergeMeshes(root: THREE.Object3D, scaleFactor = 1): THREE.Mesh {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.updateWorldMatrix(true, false);
    let geo = child.geometry.clone();
    if (geo.index) geo = geo.toNonIndexed();
    geo.applyMatrix4(child.matrixWorld);

    const pos = geo.getAttribute("position");
    if (!pos) return;

    for (let i = 0; i < pos.count; i++) {
      positions.push(
        pos.getX(i) * scaleFactor,
        pos.getY(i) * scaleFactor,
        pos.getZ(i) * scaleFactor
      );
    }
  });

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.computeVertexNormals();
  return new THREE.Mesh(merged);
}

function meshToStlBuffer(mesh: THREE.Mesh): ArrayBuffer {
  // STLExporter returns DataView for binary:true, string for binary:false
  const result = exporter.parse(mesh, { binary: true }) as unknown as DataView | string;
  if (typeof result === "string") {
    const bytes = new TextEncoder().encode(result);
    const out = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(out).set(bytes);
    return out;
  }
  const out = new ArrayBuffer(result.byteLength);
  new Uint8Array(out).set(new Uint8Array(result.buffer, result.byteOffset, result.byteLength));
  return out;
}

/** Returns 1000 if the object appears to be in metres (max dim ≤ 10), else 1 (mm). */
function detectScaleFactor(root: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  return maxDim > 0 && maxDim <= 10 ? 1000 : 1;
}

// ── 3MF fallback ─────────────────────────────────────────────────────────────

function parse3x4Transform(s: string): THREE.Matrix4 {
  const m = new THREE.Matrix4();
  if (!s) return m;
  const v = s.trim().split(/\s+/).map(Number);
  if (v.length === 12) {
    // 3MF spec: column-major 3×4. Same convention as ThreeMFLoader.
    m.set(
      v[0], v[3], v[6], v[9],
      v[1], v[4], v[7], v[10],
      v[2], v[5], v[8], v[11],
      0,    0,    0,    1
    );
  }
  return m;
}

type ObjData = { verts: number[]; tris: number[] };

function parseObjectMap(xmlStr: string): Map<string, ObjData> {
  const doc = new DOMParser().parseFromString(xmlStr, "application/xml");
  const map = new Map<string, ObjData>();
  for (const obj of Array.from(doc.querySelectorAll("object"))) {
    const id = obj.getAttribute("id") ?? "";
    const verts: number[] = [];
    const tris: number[] = [];
    for (const v of Array.from(obj.querySelectorAll("vertices > vertex"))) {
      verts.push(
        parseFloat(v.getAttribute("x") ?? "0"),
        parseFloat(v.getAttribute("y") ?? "0"),
        parseFloat(v.getAttribute("z") ?? "0")
      );
    }
    for (const t of Array.from(obj.querySelectorAll("triangles > triangle"))) {
      tris.push(
        parseInt(t.getAttribute("v1") ?? "0"),
        parseInt(t.getAttribute("v2") ?? "0"),
        parseInt(t.getAttribute("v3") ?? "0")
      );
    }
    map.set(id, { verts, tris });
  }
  return map;
}

async function fallback3MFtoMesh(buf: ArrayBuffer): Promise<THREE.Mesh> {
  const files = unzipSync(new Uint8Array(buf));
  const td = new TextDecoder();

  // Collect all .model files, normalised to /path
  const modelContents: Record<string, string> = {};
  for (const [path, data] of Object.entries(files)) {
    if (path.endsWith(".model")) {
      const norm = "/" + path.replace(/^\/+/, "");
      modelContents[norm] = td.decode(data);
    }
  }
  if (Object.keys(modelContents).length === 0) throw new Error("No .model in 3MF");

  const mainPath =
    Object.keys(modelContents).find(p => p.toLowerCase() === "/3d/3dmodel.model") ??
    Object.keys(modelContents)[0];

  // Pre-parse all docs
  const docMaps: Record<string, Map<string, ObjData>> = {};
  for (const [path, content] of Object.entries(modelContents)) {
    docMaps[path] = parseObjectMap(content);
  }

  const allPositions: number[] = [];
  const v3 = new THREE.Vector3();

  function addData(data: ObjData, mat: THREE.Matrix4): void {
    for (let i = 0; i < data.tris.length; i += 3) {
      for (let j = 0; j < 3; j++) {
        const vi = data.tris[i + j] * 3;
        v3.set(data.verts[vi], data.verts[vi + 1], data.verts[vi + 2]).applyMatrix4(mat);
        allPositions.push(v3.x, v3.y, v3.z);
      }
    }
  }

  const mainDom = new DOMParser().parseFromString(modelContents[mainPath], "application/xml");

  function resolveObject(objEl: Element, mat: THREE.Matrix4, depth: number): void {
    if (depth > 8) return;
    const id = objEl.getAttribute("id") ?? "";
    const data = docMaps[mainPath]?.get(id);
    if (data && data.tris.length > 0) {
      addData(data, mat);
      return;
    }
    for (const comp of Array.from(objEl.querySelectorAll(":scope > components > component"))) {
      const compId = comp.getAttribute("objectid") ?? "";
      const pPath = comp.getAttribute("p:path") ?? "";
      const compMat = parse3x4Transform(comp.getAttribute("transform") ?? "");
      const combined = mat.clone().multiply(compMat);
      if (pPath) {
        const extPath = "/" + pPath.replace(/^\/+/, "");
        const extData = docMaps[extPath]?.get(compId);
        if (extData) addData(extData, combined);
      } else {
        const compEl = mainDom.querySelector(`object[id="${compId}"]`);
        if (compEl) resolveObject(compEl, combined, depth + 1);
      }
    }
  }

  const buildItems = Array.from(mainDom.querySelectorAll("build > item"));
  for (const item of buildItems) {
    const objId = item.getAttribute("objectid") ?? "";
    const mat = parse3x4Transform(item.getAttribute("transform") ?? "");
    const objEl = mainDom.querySelector(`object[id="${objId}"]`);
    if (objEl) resolveObject(objEl, mat, 0);
  }

  // If no build items yielded geometry, dump all objects from main doc
  if (allPositions.length === 0) {
    for (const data of docMaps[mainPath]?.values() ?? []) {
      addData(data, new THREE.Matrix4());
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo);
}

// ── Public converters ─────────────────────────────────────────────────────────

export async function objToStlBuffer(file: File): Promise<ArrayBuffer> {
  const text = await file.text();
  const loader = new OBJLoader();
  const root = loader.parse(text);
  const scaleFactor = detectScaleFactor(root);
  const mesh = mergeMeshes(root, scaleFactor);
  return meshToStlBuffer(mesh);
}

export async function threeMfToStlBuffer(file: File): Promise<ArrayBuffer> {
  const buf = await file.arrayBuffer();
  try {
    const loader = new ThreeMFLoader();
    const root = loader.parse(buf) as THREE.Group;
    const mesh = mergeMeshes(root);
    return meshToStlBuffer(mesh);
  } catch {
    const mesh = await fallback3MFtoMesh(buf);
    return meshToStlBuffer(mesh);
  }
}

export async function glbToStlBuffer(file: File): Promise<ArrayBuffer> {
  const buf = await file.arrayBuffer();
  const loader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meshoptMod = await import("three/examples/jsm/libs/meshopt_decoder.module.js") as any;
    await meshoptMod.MeshoptDecoder.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (loader as any).setMeshoptDecoder(meshoptMod.MeshoptDecoder);
  } catch { /* Meshopt not available — non-fatal */ }

  const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) => {
    loader.parse(buf, "", res as (g: unknown) => void, rej as (e: unknown) => void);
  });

  dracoLoader.dispose();

  const scaleFactor = detectScaleFactor(gltf.scene);
  const mesh = mergeMeshes(gltf.scene, scaleFactor);
  return meshToStlBuffer(mesh);
}

// ── STL geometry helpers ──────────────────────────────────────────────────────

/** Largest single-axis bounding box dimension of the parsed STL, in mm */
export function stlMaxDimMm(buf: ArrayBuffer): number {
  const { x, y, z } = stlBboxMm(buf);
  return Math.max(x, y, z);
}

/** Bounding box dimensions of a binary STL, in mm */
export function stlBboxMm(buf: ArrayBuffer): { x: number; y: number; z: number } {
  const view = new DataView(buf);
  const triCount = view.getUint32(80, true);
  let offset = 84;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip normal
    for (let v = 0; v < 3; v++) {
      const x = view.getFloat32(offset, true); offset += 4;
      const y = view.getFloat32(offset, true); offset += 4;
      const z = view.getFloat32(offset, true); offset += 4;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    offset += 2;
  }
  return {
    x: maxX - minX,
    y: maxY - minY,
    z: maxZ - minZ,
  };
}

export const IMAGE_EXTS = ["jpg", "jpeg", "png", "heic", "webp", "pdf"] as const;
export const MODEL_EXTS_CONVERT = ["obj", "3mf", "glb"] as const;

export function fileExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(name: string): boolean {
  return (IMAGE_EXTS as readonly string[]).includes(fileExt(name));
}

export function isConvertibleModel(name: string): boolean {
  return (MODEL_EXTS_CONVERT as readonly string[]).includes(fileExt(name));
}
