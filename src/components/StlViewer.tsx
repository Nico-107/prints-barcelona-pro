import { useEffect, useRef, useState } from "react";
import { colourToPreview } from "./estimator/colourMap";
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
  touchAction?: string;
  language?: string;
  /** External scale factor for display (1 = original, 2 = 200%). Parent controls it. */
  scaleFactor?: number;
  /** Called when the user adjusts the scale slider in the viewer. */
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

function pillBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.75)",
    border: `1px solid ${active ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.16)"}`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    color: active ? "#111" : "#555",
    lineHeight: "1.5",
    userSelect: "none",
    whiteSpace: "nowrap",
  };
}

function fmtMm(mm: number): string {
  return mm < 10 ? `${mm.toFixed(1)} mm` : `${Math.round(mm)} mm`;
}

export default function StlViewer({
  file, size = 240, onError, onReady, colour, touchAction,
  language, scaleFactor = 1, onScaleChange, massGrams, showScaleControl,
}: StlViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rawDimsMm, setRawDimsMm] = useState<{ x: number; y: number; z: number } | null>(null);
  const [unitWarning, setUnitWarning] = useState<"unit-small" | "unit-large" | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [compareMode, setCompareMode] = useState<CompareMode>("off");
  const [localScale, setLocalScale] = useState(100); // percent

  const containerRef = useRef<HTMLDivElement>(null);
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
  // Stores world-space anchor points for each axis label + compare caption
  const projDataRef = useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xPt: any; yPt: any; zPt: any; comparePt: any;
  } | null>(null);

  // Refs track current toggle state inside Three.js animation closures
  const showGridRef = useRef(true);
  const showDimsRef = useRef(true);
  const compareModeRef = useRef<CompareMode>("off");

  useEffect(() => { setIsMounted(true); }, []);

  // Reset state when a new file is loaded
  useEffect(() => {
    setRawDimsMm(null);
    setUnitWarning(null);
    setLocalScale(100);
  }, [file]);

  // Sync external scaleFactor → local slider
  useEffect(() => {
    setLocalScale(Math.round(scaleFactor * 100));
  }, [scaleFactor]);

  const handleGridToggle = () => {
    const next = !showGridRef.current;
    showGridRef.current = next;
    setShowGrid(next);
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = next;
      const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
      if (r && s && c) r.render(s, c);
    }
  };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isMounted) return;

    let canceled = false;
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      try {
        const [THREE, { OrbitControls }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/controls/OrbitControls.js"),
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
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1_000_000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cont.appendChild(renderer.domElement);
        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.borderRadius = "8px";
        if (touchAction) canvas.style.touchAction = touchAction;

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(1, 2, 3);
        scene.add(dirLight);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        // Shift geometry so bottom face is at y = 0
        geometry.translate(-center.x, -box.min.y - center.y + center.y, -center.z);
        // Re-centre: center on XZ, rest on y=0
        box.getCenter(center);
        geometry.translate(-center.x, 0, -center.z);
        geometry.computeBoundingBox();

        const boxSize = new THREE.Vector3();
        geometry.boundingBox!.getSize(boxSize);
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const dist = (maxDim / 2) / Math.tan(fovRad / 2) * 1.4; // 1.4 → part fills ~70% of frame

        // Camera looks at the middle of the part
        const partCenter = new THREE.Vector3(0, boxSize.y / 2, 0);
        camera.position.set(dist * 0.6, dist * 0.5, dist * 0.8);
        camera.lookAt(partCenter);
        camera.near = dist / 1000;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.7, metalness: 0.05 });
        materialRef.current = material;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Apply colour immediately if provided
        if (colour) {
          const preview = colourToPreview(colour);
          material.color.set(preview.hex);
          material.opacity = preview.opacity;
          material.transparent = preview.opacity < 1;
          material.metalness = preview.metalness;
          material.roughness = preview.roughness;
          material.needsUpdate = true;
        }

        // ── Bounding box wireframe ──────────────────────────────────────────
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
        const wireMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.35 });
        const wire = new THREE.LineSegments(wireEdgesGeo, wireMat);
        wire.position.y = boxSize.y / 2;
        mesh.add(wire);

        // Label anchor points — placed at edge midpoints, in WORLD space (mesh is at origin)
        // X label: right-face midpoint, Y label: top-face midpoint, Z label: front-face midpoint
        projDataRef.current = {
          xPt: new THREE.Vector3(boxSize.x / 2 * 1.55, boxSize.y / 2, 0),
          yPt: new THREE.Vector3(0, boxSize.y * 1.25, 0),
          zPt: new THREE.Vector3(0, boxSize.y / 2, boxSize.z / 2 * 1.55),
          comparePt: new THREE.Vector3(maxDim / 2 + 60, 15, 0),
        };

        // ── Ground grid ─────────────────────────────────────────────────────
        const gridGroup = new THREE.Group();
        // grid sits at y = 0 (part bottom)
        const gSize = gridSizeForPart(maxDim);

        const minorGrid = new THREE.GridHelper(gSize, gSize / 10, 0xcccccc, 0xcccccc);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).opacity = 0.5;
        gridGroup.add(minorGrid);

        const majorGrid = new THREE.GridHelper(gSize, gSize / 50, 0xaaaaaa, 0xaaaaaa);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).opacity = 0.75;
        gridGroup.add(majorGrid);

        // Print-bed outline (256 × 256 mm) when part exceeds 120 mm
        if (boxSize.x > 120 || boxSize.z > 120) {
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
        gridGroup.visible = showGridRef.current;

        // ── Size comparison objects ─────────────────────────────────────────
        const compGroup = new THREE.Group();
        const compOffset = maxDim / 2 + 30;

        const solidMat = new THREE.MeshStandardMaterial({ color: 0xf5f0dc, roughness: 0.9, metalness: 0.0 });
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.7 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addCompare = (geo: any, key: string, x: number, y: number, z: number) => {
          const m = new THREE.Mesh(geo, solidMat.clone());
          m.position.set(x, y, z);
          m.userData.compareKey = key;
          compGroup.add(m);
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
          edges.position.set(x, y, z);
          edges.userData.compareKey = key;
          compGroup.add(edges);
        };

        addCompare(
          new THREE.CylinderGeometry(11.625, 11.625, 2.2, 32),
          "coin",
          compOffset + 11.625, 1.1, 0,
        );
        addCompare(
          new THREE.BoxGeometry(85.6, 0.76, 54),
          "card",
          compOffset + 42.8, 0.38, 0,
        );
        addCompare(
          new THREE.BoxGeometry(210, 0.1, 297),
          "a4",
          compOffset + 105, 0.05, 0,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compGroup.children.forEach((child: any) => { child.visible = false; });
        compGroup.visible = false;
        scene.add(compGroup);
        compareGroupRef.current = compGroup;

        setIsLoading(false);
        onReady?.();

        // ── OrbitControls ──────────────────────────────────────────────────
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(partCenter);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = dist * 0.25;
        controls.maxDistance = dist * 4;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        controls.addEventListener("start", () => { controls.autoRotate = false; });
        controls.saveState();
        controls.update();
        controlsRef.current = controls;

        // ResizeObserver
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

        // Reusable vector for label projection
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

  // Update material colour without reloading geometry
  useEffect(() => {
    const mat = materialRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!mat || !renderer || !scene || !camera) return;
    import("three").then((THREE) => {
      const preview = colourToPreview(colour);
      mat.color.set(preview.hex);
      mat.opacity = preview.opacity;
      mat.transparent = preview.opacity < 1;
      mat.metalness = preview.metalness;
      mat.roughness = preview.roughness;
      mat.needsUpdate = true;
      renderer.render(scene, camera);
    }).catch(() => { /* ignore */ });
  }, [colour]);

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%", background: "#f0f0f0", borderRadius: 8 }} />;
  }

  if (hasError) return null;

  // Apply external scale factor for display
  const s = scaleFactor;
  const dimsMm = rawDimsMm
    ? { x: rawDimsMm.x * s, y: rawDimsMm.y * s, z: rawDimsMm.z * s }
    : null;

  const compareCaptions: Record<CompareMode, string> = {
    off: "", coin: tv("coinLabel", language), card: tv("cardLabel", language), a4: tv("a4Label", language),
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }} />

      {isLoading && (
        <div style={{ position: "absolute", inset: 0, background: "#f0f0f0", borderRadius: 8 }} />
      )}

      {/* X dimension label — red */}
      {dimsMm && (
        <span
          ref={xLabelRef}
          style={{ ...LABEL_STYLE, color: "#cc3333", borderLeft: "3px solid #cc3333" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.x)}
        </span>
      )}
      {/* Y dimension label — green */}
      {dimsMm && (
        <span
          ref={yLabelRef}
          style={{ ...LABEL_STYLE, color: "#2a8a2a", borderLeft: "3px solid #2a8a2a" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.y)}
        </span>
      )}
      {/* Z dimension label — blue */}
      {dimsMm && (
        <span
          ref={zLabelRef}
          style={{ ...LABEL_STYLE, color: "#2255cc", borderLeft: "3px solid #2255cc" }}
          aria-hidden="true"
        >
          {fmtMm(dimsMm.z)}
        </span>
      )}

      {/* Comparison object caption */}
      <span
        ref={compareLabelRef}
        style={{ ...LABEL_STYLE, display: "none", color: "#444", fontWeight: 600 }}
        aria-hidden="true"
      >
        {compareCaptions[compareMode]}
      </span>

      {/* Toggle controls — top right */}
      {!isLoading && !hasError && (
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={handleDimsToggle}
            title={tv("dims", language)}
            style={pillBtn(showDims)}
          >
            {tv("dims", language)}
          </button>
          <button
            onClick={handleCompareToggle}
            title={tv("compare", language)}
            style={pillBtn(compareMode !== "off")}
          >
            {tv("compare", language)}
          </button>
          <button
            onClick={handleResetView}
            title={tv("reset", language)}
            style={{ ...pillBtn(false), padding: "3px 7px" }}
          >
            ↺
          </button>
        </div>
      )}

      {/* Scale control — shown in advanced mode */}
      {showScaleControl && !isLoading && !hasError && (
        <div style={{
          position: "absolute", bottom: 48, left: 8, right: 8,
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

      {/* Dimension summary line + screen-reader label */}
      {dimsMm && !isLoading && (
        <div
          role="text"
          aria-label={`Part dimensions: ${fmtMm(dimsMm.x)} × ${fmtMm(dimsMm.y)} × ${fmtMm(dimsMm.z)}${massGrams ? `, about ${Math.round(massGrams)} grams` : ""}`}
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#444",
            background: "rgba(255,255,255,0.85)",
            borderRadius: 3,
            padding: "1px 7px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {fmtMm(dimsMm.x)} × {fmtMm(dimsMm.y)} × {fmtMm(dimsMm.z)}
          {massGrams ? ` · ~${Math.round(massGrams)} g` : ""}
        </div>
      )}

      {/* Unit sanity warning */}
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
          {unitWarning === "unit-small"
            ? "⚠ Part < 3 mm"
            : "⚠ Part > 600 mm"}
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
