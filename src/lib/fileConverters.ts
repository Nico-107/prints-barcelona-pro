import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

const exporter = new STLExporter();

function mergeMeshes(root: THREE.Object3D, scaleFactor = 1): THREE.Mesh {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.updateWorldMatrix(true, false);
    const geo = child.geometry.clone();
    geo.applyMatrix4(child.matrixWorld);

    const pos = geo.getAttribute("position");
    const nor = geo.getAttribute("normal");
    if (!pos) return;

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i) * scaleFactor, pos.getY(i) * scaleFactor, pos.getZ(i) * scaleFactor);
      if (nor) normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
    }
  });

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length > 0) merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  if (normals.length === 0) merged.computeVertexNormals();

  return new THREE.Mesh(merged);
}

function meshToStlBuffer(mesh: THREE.Mesh): ArrayBuffer {
  // STLExporter returns DataView for binary:true, string for binary:false
  const result = exporter.parse(mesh, { binary: true }) as unknown as DataView | string;
  if (typeof result === "string") {
    return new TextEncoder().encode(result).buffer;
  }
  return result.buffer;
}

export async function objToStlBuffer(file: File): Promise<ArrayBuffer> {
  const text = await file.text();
  const loader = new OBJLoader();
  const root = loader.parse(text);
  const mesh = mergeMeshes(root);
  return meshToStlBuffer(mesh);
}

export async function threeMfToStlBuffer(file: File): Promise<ArrayBuffer> {
  const buf = await file.arrayBuffer();
  const loader = new ThreeMFLoader();
  const root = loader.parse(buf) as THREE.Group;
  const mesh = mergeMeshes(root);
  return meshToStlBuffer(mesh);
}

export async function glbToStlBuffer(file: File): Promise<ArrayBuffer> {
  const buf = await file.arrayBuffer();
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) => {
    loader.parse(buf, "", res as (g: unknown) => void, rej as (e: unknown) => void);
  });
  // GLB uses metres; multiply by 1000 to get mm
  const mesh = mergeMeshes(gltf.scene, 1000);
  return meshToStlBuffer(mesh);
}

/** Largest single-axis bounding box dimension of the parsed STL, in mm */
export function stlMaxDimMm(buf: ArrayBuffer): number {
  const view = new DataView(buf);
  let offset = 80 + 4; // skip header + triangle count
  const triCount = view.getUint32(80, true);
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
    offset += 2; // attr byte count
  }
  return Math.max(maxX - minX, maxY - minY, maxZ - minZ);
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
