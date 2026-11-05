import { useEffect, useRef, useState, useCallback } from "react";
import { colourToPreview } from "./estimator/colourMap";
import { capture } from "@/lib/analytics";
import {
  getUnitWarning,
  gridSizeForPart,
  COMPARE_NEXT,
  type CompareMode,
} from "@/lib/stlViewerUtils";

interface StlViewerProps {
  file: File;
  size?: number;
  onError?: () => void;
  onReady?: () => void;
  colour?: string;
  /** Material key (PLA | PETG | ABS | ASA | Nylon | TPU | ...). Drives the
   *  procedural MeshPhysicalMaterial profile. Falls back to PLA. */
  material?: string;
  touchAction?: string;
  language?: string;
  /** External scale factor for display (1 = original, 2 = 200%). */
  scaleFactor?: number;
  onScaleChange?: (scale: number) => void;
  /** Part mass in grams — shown in the summary line. */
  massGrams?: number;
  /** Show scale slider (Advanced mode). */
  showScaleControl?: boolean;
}

// ─── Localised viewer labels ───────────────────────────────────────────────────
const VIEWER_LABELS: Record<string, Record<string, string>> = {
  dims:    { es: 'Medidas',  en: 'Dimensions', ca: 'Mides',   it: 'Misure', de: 'Maße',     fr: 'Mesures',   nl: 'Maten',    pt: 'Medidas'  },
  compare: { es: 'Comparar', en: 'Compare',    ca: 'Comparar', it: 'Confronta', de: 'Vergleich', fr: 'Comparer', nl: 'Vergelijk', pt: 'Comparar' },
  reset:   { es: 'Vista inicial', en: 'Reset view', ca: 'Vista inicial', it: 'Vista iniziale', de: 'Ansicht zurücksetzen', fr: 'Vue initiale', nl: 'Beginweergave', pt: 'Vista inicial' },
  expand:  { es: 'Ampliar',  en: 'Expand',     ca: 'Ampliar',  it: 'Espandi', de: 'Vergrößern', fr: 'Agrandir',  nl: 'Uitvouwen', pt: 'Ampliar'  },
  exit:    { es: 'Salir',    en: 'Exit',       ca: 'Sortir',   it: 'Esci',    de: 'Schließen',  fr: 'Fermer',    nl: 'Sluiten',   pt: 'Sair'     },
  coinLabel: { es: 'Moneda 1 €', en: '€1 coin', ca: 'Moneda 1 €', it: 'Moneta 1 €', de: '1-€-Münze', fr: 'Pièce 1 €', nl: '€1 munt', pt: 'Moeda 1 €' },
  cardLabel: { es: 'Tarjeta bancaria', en: 'Bank card', ca: 'Targeta bancària', it: 'Carta bancaria', de: 'Bankkarte', fr: 'Carte bancaire', nl: 'Bankkaart', pt: 'Cartão bancário' },
  a4Label:   { es: 'Folio A4', en: 'A4 sheet', ca: 'Full A4', it: 'Foglio A4', de: 'A4-Blatt', fr: 'Feuille A4', nl: 'A4-vel', pt: 'Folha A4' },
  scaleLabel: { es: 'Tamaño', en: 'Scale', ca: 'Mida', it: 'Scala', de: 'Größe', fr: 'Taille', nl: 'Grootte', pt: 'Tamanho' },
  cmChip:  { es: 'Está en cm', en: 'In cm', ca: 'Està en cm', it: 'In cm', de: 'In cm', fr: 'En cm', nl: 'In cm', pt: 'Em cm' },
  inChip:  { es: 'Está en pulgadas', en: 'In inches', ca: 'Està en polzades', it: 'In pollici', de: 'In Zoll', fr: 'En pouces', nl: 'In inches', pt: 'Em polegadas' },
  origChip: { es: 'Original', en: 'Original', ca: 'Original', it: 'Originale', de: 'Original', fr: 'Original', nl: 'Origineel', pt: 'Original' },
};
const tv = (key: string, lang?: string) =>
  VIEWER_LABELS[key]?.[lang ?? 'es'] ?? VIEWER_LABELS[key]?.['es'] ?? key;

// ─── Styles ───────────────────────────────────────────────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  fontSize: 11,
  fontWeight: 700,
  background: "rgba(255,255,255,0.92)",
  padding: "2px 5px",
  borderRadius: 3,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  transform: "translate(-50%,-50%)",
  display: "none",
  lineHeight: 1.4,
  boxShadow: "0 1px 3px rgba(0,0,0,.12)",
};

function iconBtn(active: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    background: active ? "#ffffff" : "rgba(255,255,255,0.88)",
    border: `1px solid ${active ? "#0f172a" : "rgba(15,23,42,0.14)"}`,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: active ? "#0f172a" : "#475569",
    padding: 0,
    userSelect: "none",
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
    transition: "background 120ms, border-color 120ms, color 120ms",
  };
}

function fmtMm(mm: number): string {
  return mm < 10 ? `${mm.toFixed(1)} mm` : `${Math.round(mm)} mm`;
}

// ─── Procedural noise cache ────────────────────────────────────────────────────
type NoiseKey = 'fine' | 'dense';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NOISE_CACHE: Map<NoiseKey, any> = new Map();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOrMakeNoise(THREE: any, key: NoiseKey) {
  const cached = NOISE_CACHE.get(key);
  if (cached) return cached;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  // Normal maps: B=255 (up), R/G perturbed around 128.
  // 'fine' = per-pixel speckle; 'dense' = tighter speckle with higher variance.
  const amp = key === 'dense' ? 0.9 : 0.6;
  for (let i = 0; i < size * size; i++) {
    const r = (Math.random() - 0.5) * amp;
    const g = (Math.random() - 0.5) * amp;
    img.data[i * 4 + 0] = Math.max(0, Math.min(255, 128 + r * 255));
    img.data[i * 4 + 1] = Math.max(0, Math.min(255, 128 + g * 255));
    img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(key === 'dense' ? 8 : 4, key === 'dense' ? 8 : 4);
  tex.anisotropy = 4;
  NOISE_CACHE.set(key, tex);
  return tex;
}

// ─── Material profiles ─────────────────────────────────────────────────────────
interface MatPatch {
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenRoughness?: number;
  normalKey?: NoiseKey;
  normalScale?: number;
}

const MAT_PROFILES: Record<string, MatPatch> = {
  PLA:   { roughness: 0.55, metalness: 0 },
  PETG:  { roughness: 0.22, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.2 },
  ABS:   { roughness: 0.45, metalness: 0, normalKey: 'fine',  normalScale: 0.15 },
  ASA:   { roughness: 0.62, metalness: 0, normalKey: 'fine',  normalScale: 0.25 },
  Nylon: { roughness: 0.88, metalness: 0, normalKey: 'dense', normalScale: 0.3, sheen: 0.2, sheenRoughness: 0.5 },
  TPU:   { roughness: 0.75, metalness: 0, sheen: 0.5, sheenRoughness: 0.6 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMaterialProfile(THREE: any, material: any, matKey: string | undefined, colour: string | undefined) {
  const profile: MatPatch = MAT_PROFILES[matKey ?? 'PLA'] ?? MAT_PROFILES.PLA;

  // Base colour
  const preview = colourToPreview(colour);
  const isAny = !colour; // "Cualquier color" / no selection → neutral grey
  const baseHex = isAny ? "#9ca3af" : preview.hex;
  material.color.set(baseHex);

  material.roughness = profile.roughness;
  material.metalness = profile.metalness;
  material.clearcoat = profile.clearcoat ?? 0;
  material.clearcoatRoughness = profile.clearcoatRoughness ?? 0;
  material.sheen = profile.sheen ?? 0;
  material.sheenRoughness = profile.sheenRoughness ?? 0.5;

  // Procedural normal map
  if (profile.normalKey) {
    const nm = getOrMakeNoise(THREE, profile.normalKey);
    material.normalMap = nm;
    const s = profile.normalScale ?? 0.2;
    material.normalScale.set(s, s);
  } else {
    material.normalMap = null;
  }

  // Transparent colour overlays the material: transmission 0.6, thickness 2, roughness 0.15
  if (!isAny && preview.opacity < 1) {
    material.transparent = true;
    material.opacity = 1; // transmission handles the see-through
    material.transmission = 0.6;
    material.thickness = 2;
    material.roughness = 0.15;
    material.ior = 1.5;
  } else {
    material.transmission = 0;
    material.thickness = 0;
    material.transparent = false;
    material.opacity = 1;
  }

  material.needsUpdate = true;

  // Test hook: expose a snapshot of the live material state so Playwright can
  // assert that changing the material actually mutates these fields.
  try {
    (globalThis as unknown as { __stlViewerMaterial?: Record<string, unknown> }).__stlViewerMaterial = {
      key: matKey ?? null,
      colour: colour ?? null,
      roughness: material.roughness,
      metalness: material.metalness,
      clearcoat: material.clearcoat,
      clearcoatRoughness: material.clearcoatRoughness,
      sheen: material.sheen,
      sheenRoughness: material.sheenRoughness,
      transmission: material.transmission,
      normalMap: !!material.normalMap,
      normalScaleX: material.normalScale?.x ?? 0,
    };
  } catch { /* ignore */ }
}

export default function StlViewer({
  file, size = 240, onError, onReady, colour, material, touchAction,
  language, scaleFactor = 1, onScaleChange, massGrams, showScaleControl,
}: StlViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rawDimsMm, setRawDimsMm] = useState<{ x: number; y: number; z: number } | null>(null);
  const [unitWarning, setUnitWarning] = useState<"unit-small" | "unit-large" | null>(null);
  const [showDims, setShowDims] = useState(true);
  const [compareMode, setCompareMode] = useState<CompareMode>("off");
  const [localScale, setLocalScale] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // iOS fallback: no requestFullscreen; use absolute 100vw × 100vh overlay
  const [overlayFallback, setOverlayFallback] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const xLabelRef = useRef<HTMLSpanElement>(null);
  const yLabelRef = useRef<HTMLSpanElement>(null);
  const zLabelRef = useRef<HTMLSpanElement>(null);
  const compareLabelRef = useRef<HTMLSpanElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compareGroupRef = useRef<any>(null);
  const projDataRef = useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xPt: any; yPt: any; zPt: any; comparePt: any;
  } | null>(null);

  const showDimsRef = useRef(true);
  const compareModeRef = useRef<CompareMode>("off");

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    setRawDimsMm(null);
    setUnitWarning(null);
    setLocalScale(100);
  }, [file]);

  useEffect(() => {
    setLocalScale(Math.round(scaleFactor * 100));
  }, [scaleFactor]);

  const handleDimsToggle = () => {
    const next = !showDimsRef.current;
    showDimsRef.current = next;
    setShowDims(next);
    [xLabelRef, yLabelRef, zLabelRef].forEach(ref => {
      if (ref.current) ref.current.style.display = next ? "block" : "none";
    });
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (r && s && c) r.render(s, c);
  };

  const handleCompareToggle = () => {
    const next = COMPARE_NEXT[compareModeRef.current];
    compareModeRef.current = next;
    setCompareMode(next);
    const grp = compareGroupRef.current;
    if (grp) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      grp.children.forEach((child: any) => { child.visible = child.userData.compareKey === next; });
      grp.visible = next !== "off";
      const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
      if (r && s && c) r.render(s, c);
    }
  };

  const handleResetView = () => {
    const controls = controlsRef.current;
    if (controls) {
      controls.reset();
      const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
      if (r && s && c) r.render(s, c);
    }
  };

  const handleScaleSlider = (pct: number) => {
    const clamped = Math.max(25, Math.min(400, pct));
    setLocalScale(clamped);
    onScaleChange?.(clamped / 100);
  };

  // ── Fullscreen / overlay fallback ───────────────────────────────────────
  const handleExpand = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // If already fullscreen or overlay, exit
    if (document.fullscreenElement === el) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (overlayFallback) {
      setOverlayFallback(false);
      capture("viewer_expanded", { on: false });
      return;
    }
    // Try native Fullscreen API
    const req = (el as HTMLDivElement & { requestFullscreen?: () => Promise<void>; webkitRequestFullscreen?: () => void }).requestFullscreen
      ?? (el as HTMLDivElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
    if (req) {
      Promise.resolve(req.call(el)).then(() => {
        setIsFullscreen(true);
        capture("viewer_expanded", { on: true });
      }).catch(() => {
        // Denied (iOS Safari) → overlay fallback
        setOverlayFallback(true);
        capture("viewer_expanded", { on: true });
      });
    } else {
      setOverlayFallback(true);
      capture("viewer_expanded", { on: true });
    }
  }, [overlayFallback]);

  // Track native fullscreen state
  useEffect(() => {
    const onFs = () => {
      const active = document.fullscreenElement === wrapperRef.current;
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Esc key → exit overlay fallback (native fullscreen already handles Esc)
  useEffect(() => {
    if (!overlayFallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlayFallback(false);
        capture("viewer_expanded", { on: false });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [overlayFallback]);

  // Trigger renderer resize when fullscreen/overlay state flips
  useEffect(() => {
    const r = rendererRef.current;
    const c = cameraRef.current;
    const cont = containerRef.current;
    if (!r || !c || !cont) return;
    const w = cont.clientWidth, h = cont.clientHeight;
    if (w > 0 && h > 0) {
      r.setSize(w, h);
      c.aspect = w / h;
      c.updateProjectionMatrix();
    }
  }, [isFullscreen, overlayFallback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isMounted) return;

    let canceled = false;
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      try {
        const [THREE, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/controls/OrbitControls.js"),
          import("three/examples/jsm/environments/RoomEnvironment.js"),
        ]);
        if (canceled || !containerRef.current) return;

        const cont = containerRef.current;
        const W = cont.clientWidth || size;
        const H = cont.clientHeight || size;

        const buffer = await file.arrayBuffer();
        if (canceled) return;

        let positions: Float32Array;

        const isBinary = (() => {
          if (buffer.byteLength < 84) return false;
          const dv = new DataView(buffer);
          const n = dv.getUint32(80, true);
          return buffer.byteLength === 84 + n * 50;
        })();

        if (isBinary) {
          const dv = new DataView(buffer);
          const triCount = dv.getUint32(80, true);
          const raw = new Float32Array(triCount * 9);
          for (let i = 0; i < triCount; i++) {
            const base = 84 + i * 50 + 12;
            raw[i * 9 + 0] = dv.getFloat32(base,      true);
            raw[i * 9 + 1] = dv.getFloat32(base +  4, true);
            raw[i * 9 + 2] = dv.getFloat32(base +  8, true);
            raw[i * 9 + 3] = dv.getFloat32(base + 12, true);
            raw[i * 9 + 4] = dv.getFloat32(base + 16, true);
            raw[i * 9 + 5] = dv.getFloat32(base + 20, true);
            raw[i * 9 + 6] = dv.getFloat32(base + 24, true);
            raw[i * 9 + 7] = dv.getFloat32(base + 28, true);
            raw[i * 9 + 8] = dv.getFloat32(base + 32, true);
          }
          if (triCount > 500_000) {
            const keep = Math.ceil(triCount / 2);
            positions = new Float32Array(keep * 9);
            for (let i = 0, out = 0; i < triCount; i += 2, out++) {
              positions.set(raw.subarray(i * 9, i * 9 + 9), out * 9);
            }
          } else {
            positions = raw;
          }
        } else {
          const text = new TextDecoder().decode(new Uint8Array(buffer));
          const vertRe = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
          const verts: number[] = [];
          let m: RegExpExecArray | null;
          while ((m = vertRe.exec(text)) !== null) {
            verts.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
          }
          const triCount = verts.length / 9;
          if (triCount > 500_000) {
            const keep = Math.ceil(triCount / 2);
            positions = new Float32Array(keep * 9);
            for (let i = 0, out = 0; i < triCount; i += 2, out++) {
              for (let j = 0; j < 9; j++) positions[out * 9 + j] = verts[i * 9 + j];
            }
          } else {
            positions = new Float32Array(verts);
          }
        }

        if (canceled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf6f7f9);

        const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1_000_000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        cont.appendChild(renderer.domElement);
        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.borderRadius = "8px";
        canvas.style.cursor = "grab";
        if (touchAction) canvas.style.touchAction = touchAction;

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;

        // Lights — soft key + fill
        scene.add(new THREE.AmbientLight(0xffffff, 0.25));
        const key = new THREE.DirectionalLight(0xffffff, 0.75);
        key.position.set(3, 5, 4);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.3);
        fill.position.set(-4, 2, -3);
        scene.add(fill);

        // PMREM environment for gloss / clearcoat / transmission to actually read
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envMap;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -box.min.y - center.y + center.y, -center.z);
        box.getCenter(center);
        geometry.translate(-center.x, 0, -center.z);
        geometry.computeBoundingBox();

        const boxSize = new THREE.Vector3();
        geometry.boundingBox!.getSize(boxSize);
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        // Auto-fit: 1.4× padding → part fills ~71% of the frame
        const dist = (maxDim / 2) / Math.tan(fovRad / 2) * 1.4;

        const partCenter = new THREE.Vector3(0, boxSize.y / 2, 0);
        camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
        camera.lookAt(partCenter);
        camera.near = dist / 1000;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();

        geometry.computeVertexNormals();
        // Need UVs for the normal maps to tile.
        // Trivial planar projection using position.xy — good enough for noise.
        const uvArr = new Float32Array((positions.length / 3) * 2);
        for (let i = 0; i < positions.length / 3; i++) {
          uvArr[i * 2 + 0] = positions[i * 3 + 0] / maxDim;
          uvArr[i * 2 + 1] = positions[i * 3 + 2] / maxDim;
        }
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));

        // Procedural material — reuses the same instance; profile swaps in place.
        const material = new THREE.MeshPhysicalMaterial({
          color: 0xd0d0d0,
          roughness: 0.55,
          metalness: 0,
        });
        applyMaterialProfile(THREE, material, (globalThis as unknown as { __viewerMaterialKey?: string }).__viewerMaterialKey, undefined);
        materialRef.current = material;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Apply current props to material immediately
        applyMaterialProfile(THREE, material, (materialRef as unknown as { propKey?: string }).propKey ?? undefined, colour);

        // Wireframe bbox
        const dimsRounded = {
          x: parseFloat(boxSize.x.toFixed(1)),
          y: parseFloat(boxSize.y.toFixed(1)),
          z: parseFloat(boxSize.z.toFixed(1)),
        };
        setRawDimsMm(dimsRounded);
        setUnitWarning(getUnitWarning(dimsRounded));

        const wireBoxGeo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const wireEdgesGeo = new THREE.EdgesGeometry(wireBoxGeo);
        wireBoxGeo.dispose();
        const wireMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 });
        const wire = new THREE.LineSegments(wireEdgesGeo, wireMat);
        wire.position.y = boxSize.y / 2;
        mesh.add(wire);

        // Label anchors — pushed further out so they don't overlap the part
        const push = maxDim * 0.08;
        projDataRef.current = {
          xPt: new THREE.Vector3(boxSize.x / 2 + push, boxSize.y / 2, 0),
          yPt: new THREE.Vector3(0, boxSize.y + push, 0),
          zPt: new THREE.Vector3(0, boxSize.y / 2, boxSize.z / 2 + push),
          comparePt: new THREE.Vector3(maxDim / 2 + 60, 15, 0),
        };

        // Ground grid
        const gridGroup = new THREE.Group();
        const gSize = gridSizeForPart(maxDim);

        const minorGrid = new THREE.GridHelper(gSize, gSize / 10, 0xd1d5db, 0xd1d5db);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).opacity = 0.4;
        gridGroup.add(minorGrid);

        const majorGrid = new THREE.GridHelper(gSize, gSize / 50, 0x94a3b8, 0x94a3b8);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).opacity = 0.55;
        gridGroup.add(majorGrid);

        // Print-bed outline only when oversize
        if (boxSize.x > 256 || boxSize.z > 256) {
          const bedVerts = new Float32Array([
            -128, 0, -128,
             128, 0, -128,
             128, 0,  128,
            -128, 0,  128,
          ]);
          const bedGeo = new THREE.BufferGeometry();
          bedGeo.setAttribute("position", new THREE.BufferAttribute(bedVerts, 3));
          const bedLine = new THREE.LineLoop(
            bedGeo,
            new THREE.LineBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 }),
          );
          gridGroup.add(bedLine);
        }

        scene.add(gridGroup);
        gridGroupRef.current = gridGroup;
        gridGroup.visible = true;

        // Compare objects
        const compGroup = new THREE.Group();
        const compOffset = maxDim / 2 + 30;
        const solidMat = new THREE.MeshStandardMaterial({ color: 0xf5f0dc, roughness: 0.9, metalness: 0.0 });
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.7 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addCompare = (geo: any, keyName: string, x: number, y: number, z: number) => {
          const m = new THREE.Mesh(geo, solidMat.clone());
          m.position.set(x, y, z);
          m.userData.compareKey = keyName;
          compGroup.add(m);
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
          edges.position.set(x, y, z);
          edges.userData.compareKey = keyName;
          compGroup.add(edges);
        };
        addCompare(new THREE.CylinderGeometry(11.625, 11.625, 2.2, 32), "coin", compOffset + 11.625, 1.1, 0);
        addCompare(new THREE.BoxGeometry(85.6, 0.76, 54), "card", compOffset + 42.8, 0.38, 0);
        addCompare(new THREE.BoxGeometry(210, 0.1, 297), "a4", compOffset + 105, 0.05, 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compGroup.children.forEach((child: any) => { child.visible = false; });
        compGroup.visible = false;
        scene.add(compGroup);
        compareGroupRef.current = compGroup;

        setIsLoading(false);
        onReady?.();

        // Calmer OrbitControls (conv-27)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(partCenter);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.35;
        controls.zoomSpeed = 0.6;
        controls.minDistance = dist * 0.25;
        controls.maxDistance = dist * 4;
        // Clamp polar so part never flips under the plate
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.49;
        // Idle auto-rotate at a very slow rate — gives gloss/clearcoat a chance
        // to show on first view; stops the moment the user grabs the canvas.
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.addEventListener("start", () => {
          canvas.style.cursor = "grabbing";
          controls.autoRotate = false;
        });
        controls.addEventListener("end", () => {
          canvas.style.cursor = "grab";
        });
        controls.saveState();
        controls.update();
        controlsRef.current = controls;

        // Resize
        let roRafId: number | null = null;
        let roLastW = 0, roLastH = 0;
        const ro = new ResizeObserver(() => {
          if (roRafId !== null) return;
          roRafId = requestAnimationFrame(() => {
            roRafId = null;
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            if (w === roLastW && h === roLastH) return;
            if (w <= 0 || h <= 0) return;
            roLastW = w; roLastH = h;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          });
        });
        ro.observe(cont);

        const _tmp = new THREE.Vector3();
        const projectLabel = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          worldPt: any, el: HTMLSpanElement | null, visible: boolean,
        ) => {
          if (!el || !containerRef.current) return;
          if (!visible) { el.style.display = "none"; return; }
          const cW = containerRef.current.clientWidth;
          const cH = containerRef.current.clientHeight;
          _tmp.copy(worldPt);
          _tmp.project(camera);
          if (_tmp.z >= 1) { el.style.display = "none"; return; }
          el.style.display = "block";
          el.style.left = `${(_tmp.x * 0.5 + 0.5) * cW}px`;
          el.style.top  = `${(-_tmp.y * 0.5 + 0.5) * cH}px`;
        };

        let frameId: number;
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
          const pd = projDataRef.current;
          if (pd) {
            const showD = showDimsRef.current;
            projectLabel(pd.xPt, xLabelRef.current, showD);
            projectLabel(pd.yPt, yLabelRef.current, showD);
            projectLabel(pd.zPt, zLabelRef.current, showD);
            projectLabel(pd.comparePt, compareLabelRef.current, compareModeRef.current !== "off");
          }
        };
        animate();

        cleanupFn = () => {
          cancelAnimationFrame(frameId);
          ro.disconnect();
          controls.dispose();
          geometry.dispose();
          material.dispose();
          wire.geometry.dispose();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (wire.material as any).dispose();
          pmrem.dispose();
          // Note: envMap is derived from pmrem; disposing pmrem invalidates it.
          scene.environment = null;
          gridGroup.children.forEach((child: object) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const c = child as any;
            c.geometry?.dispose();
            if (Array.isArray(c.material)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (c.material as any[]).forEach((m: any) => m.dispose());
            } else {
              c.material?.dispose();
            }
          });
          compGroup.children.forEach((child: object) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const c = child as any;
            c.geometry?.dispose();
            c.material?.dispose();
          });
          solidMat.dispose();
          edgeMat.dispose();
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
          materialRef.current = null;
          rendererRef.current = null;
          sceneRef.current = null;
          cameraRef.current = null;
          controlsRef.current = null;
          gridGroupRef.current = null;
          compareGroupRef.current = null;
          projDataRef.current = null;
        };
      } catch {
        if (!canceled) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    init();

    return () => {
      canceled = true;
      cleanupFn?.();
    };
  }, [isMounted, file, size]);

  // Update touch-action without reloading geometry
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer?.domElement) return;
    renderer.domElement.style.touchAction = touchAction ?? "";
  }, [touchAction]);

  // Material + colour change → apply profile in place (no geometry reload)
  useEffect(() => {
    const mat = materialRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!mat || !renderer || !scene || !camera) return;
    import("three").then((THREE) => {
      applyMaterialProfile(THREE, mat, material, colour);
      renderer.render(scene, camera);
    }).catch(() => { /* ignore */ });
  }, [colour, material]);

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%", background: "#f0f0f0", borderRadius: 8 }} />;
  }

  if (hasError) return null;

  const s = scaleFactor;
  const dimsMm = rawDimsMm
    ? { x: rawDimsMm.x * s, y: rawDimsMm.y * s, z: rawDimsMm.z * s }
    : null;

  const compareCaptions: Record<CompareMode, string> = {
    off: "", coin: tv("coinLabel", language), card: tv("cardLabel", language), a4: tv("a4Label", language),
  };

  // Wrapper style flips to fullscreen-overlay when overlayFallback is active
  const wrapperStyle: React.CSSProperties = overlayFallback
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 60,
        background: "#f6f7f9",
      }
    : { position: "relative", width: "100%", height: "100%" };

  return (
    <div ref={wrapperRef} style={wrapperStyle} data-fullscreen={isFullscreen || overlayFallback ? "true" : "false"}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }} />

      {isLoading && (
        <div style={{ position: "absolute", inset: 0, background: "#f0f0f0", borderRadius: 8 }} />
      )}

      {dimsMm && (
        <span
          ref={xLabelRef}
          data-testid="viewer-x-label"
          style={{ ...LABEL_STYLE, color: "#cc3333", borderLeft: "3px solid #cc3333" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.x)}
        </span>
      )}
      {dimsMm && (
        <span
          ref={yLabelRef}
          data-testid="viewer-y-label"
          style={{ ...LABEL_STYLE, color: "#2a8a2a", borderLeft: "3px solid #2a8a2a" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.y)}
        </span>
      )}
      {dimsMm && (
        <span
          ref={zLabelRef}
          data-testid="viewer-z-label"
          style={{ ...LABEL_STYLE, color: "#2255cc", borderLeft: "3px solid #2255cc" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.z)}
        </span>
      )}

      {/* Compare caption — fixed bottom-left chip so it's always inside the viewport. */}
      {compareMode !== "off" && (
        <span
          ref={compareLabelRef}
          data-testid="viewer-compare-label"
          style={{
            position: "absolute",
            left: 10,
            bottom: 36,
            fontSize: 11,
            fontWeight: 600,
            color: "#334155",
            background: "rgba(255,255,255,0.92)",
            padding: "2px 8px",
            borderRadius: 999,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            display: "block",
            boxShadow: "0 1px 3px rgba(0,0,0,.12)",
          }}
          aria-hidden="true"
        >
          {compareCaptions[compareMode]}
        </span>
      )}

      {/* Top-right icon toolbar */}
      {!isLoading && !hasError && (
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
          <button
            onClick={handleDimsToggle}
            title={tv("dims", language)}
            aria-label={tv("dims", language)}
            data-testid="viewer-dims-toggle"
            style={iconBtn(showDims)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 8h20v8H2z" />
              <path d="M6 8v4M10 8v4M14 8v4M18 8v4" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            title={tv("reset", language)}
            aria-label={tv("reset", language)}
            data-testid="viewer-reset-btn"
            style={iconBtn(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            onClick={handleExpand}
            title={(isFullscreen || overlayFallback) ? tv("exit", language) : tv("expand", language)}
            aria-label={(isFullscreen || overlayFallback) ? tv("exit", language) : tv("expand", language)}
            data-testid="viewer-expand-btn"
            style={iconBtn(isFullscreen || overlayFallback)}
          >
            {(isFullscreen || overlayFallback) ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Scale control (advanced) */}
      {showScaleControl && !isLoading && !hasError && (
        <div style={{
          position: "absolute", bottom: 40, left: 8, right: 8,
          background: "rgba(255,255,255,0.92)", borderRadius: 8,
          padding: "8px 12px", boxShadow: "0 1px 6px rgba(0,0,0,.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#333" }}>{tv("scaleLabel", language)}</span>
            <input
              type="range"
              min={25} max={400} step={5}
              value={localScale}
              onChange={e => handleScaleSlider(Number(e.target.value))}
              style={{ flex: 1, height: 20 }}
            />
            <input
              type="number"
              min={25} max={400} step={5}
              value={localScale}
              onChange={e => handleScaleSlider(Number(e.target.value))}
              style={{ width: 52, fontSize: 11, padding: "2px 4px", border: "1px solid #ccc", borderRadius: 4, textAlign: "center" }}
            />
            <span style={{ fontSize: 11, color: "#666" }}>%</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { label: tv("cmChip", language), scale: 1000 },
              { label: tv("inChip", language), scale: 2540 },
              { label: tv("origChip", language), scale: 100 },
            ].map(({ label, scale }) => (
              <button
                key={scale}
                onClick={() => handleScaleSlider(scale)}
                style={{
                  fontSize: 10, padding: "2px 7px", borderRadius: 10,
                  border: `1px solid ${localScale === scale ? "#e05050" : "#ccc"}`,
                  background: localScale === scale ? "#fff0f0" : "#f8f8f8",
                  color: localScale === scale ? "#cc3333" : "#555",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dimension summary — one clean line at the bottom */}
      {dimsMm && !isLoading && (
        <div
          role="text"
          data-testid="viewer-dim-line"
          aria-label={`Part dimensions: ${fmtMm(dimsMm.x)} × ${fmtMm(dimsMm.y)} × ${fmtMm(dimsMm.z)}${massGrams ? `, about ${Math.round(massGrams)} grams` : ""}`}
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 11,
            color: "#334155",
            background: "rgba(255,255,255,0.9)",
            borderRadius: 999,
            padding: "2px 10px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtMm(dimsMm.x)} × {fmtMm(dimsMm.y)} × {fmtMm(dimsMm.z)}
          {massGrams ? ` · ~${Math.round(massGrams)} g` : ""}
        </div>
      )}

      {unitWarning && !isLoading && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            fontSize: 10,
            color: "#856404",
            background: "rgba(255,243,205,0.96)",
            borderRadius: 4,
            padding: "3px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {unitWarning === "unit-small" ? "⚠ Part < 3 mm" : "⚠ Part > 600 mm"}
          {showScaleControl && (
            <span style={{ marginLeft: 6 }}>
              {" · "}
              <button
                onClick={() => handleScaleSlider(1000)}
                style={{ background: "none", border: "none", color: "#856404", cursor: "pointer", fontSize: 10, textDecoration: "underline", padding: 0 }}
              >
                {tv("cmChip", language)}
              </button>
              {" · "}
              <button
                onClick={() => handleScaleSlider(2540)}
                style={{ background: "none", border: "none", color: "#856404", cursor: "pointer", fontSize: 10, textDecoration: "underline", padding: 0 }}
              >
                {tv("inChip", language)}
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
