import { useEffect, useRef, useState } from "react";
import { colourToPreview } from "./estimator/colourMap";
import {
  getUnitWarning,
  gridSizeForPart,
  COMPARE_NEXT,
  COMPARE_LABEL,
  type CompareMode,
} from "@/lib/stlViewerUtils";

interface StlViewerProps {
  file: File;
  size?: number;
  onError?: () => void;
  onReady?: () => void;
  /** Optional colour value — named key, hex string, or free-text colour word */
  colour?: string;
  /** CSS touch-action for the canvas. Use "pan-y" so scroll passes through when not expanded. */
  touchAction?: string;
}

const LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  fontSize: 10,
  fontWeight: 600,
  color: "#111",
  background: "rgba(255,255,255,0.88)",
  padding: "1px 4px",
  borderRadius: 3,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  transform: "translate(-50%,-50%)",
  display: "none",
  lineHeight: 1.4,
};

function overlayBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
    border: "1px solid rgba(0,0,0,0.18)",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 10,
    cursor: "pointer",
    color: "#333",
    lineHeight: "1.4",
    userSelect: "none",
  };
}

export default function StlViewer({ file, size = 240, onError, onReady, colour, touchAction }: StlViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dimsMm, setDimsMm] = useState<{ x: number; y: number; z: number } | null>(null);
  const [unitWarning, setUnitWarning] = useState<"unit-small" | "unit-large" | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [compareMode, setCompareMode] = useState<CompareMode>("off");

  const containerRef = useRef<HTMLDivElement>(null);
  const xLabelRef = useRef<HTMLSpanElement>(null);
  const yLabelRef = useRef<HTMLSpanElement>(null);
  const zLabelRef = useRef<HTMLSpanElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compareGroupRef = useRef<any>(null);
  const projDataRef = useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xPt: any; yPt: any; zPt: any; mesh: any; camera: any;
  } | null>(null);
  // Refs track current toggle state so closures inside init() see up-to-date values
  const showGridRef = useRef(true);
  const compareModeRef = useRef<CompareMode>("off");

  useEffect(() => { setIsMounted(true); }, []);

  // Reset dimension state when a new file is loaded
  useEffect(() => {
    setDimsMm(null);
    setUnitWarning(null);
  }, [file]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isMounted) return;

    let canceled = false;
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      try {
        const THREE = await import("three");
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
        canvas.style.cursor = "grab";
        canvas.style.borderRadius = "8px";
        if (touchAction) canvas.style.touchAction = touchAction;

        cleanupFn = () => {
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
        };

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(1, 2, 3);
        scene.add(dirLight);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.4));

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const boxSize = new THREE.Vector3();
        box.getSize(boxSize);
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const dist = (maxDim / 2) / Math.tan(fovRad / 2) * 1.8;
        camera.position.set(0, 0, dist);
        camera.near = dist / 1000;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({ color: 0xd0d0d0 });
        materialRef.current = material;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // ── 6.1  Wireframe bounding box + label projection points ──────────
        const dimsRounded = {
          x: Math.round(boxSize.x),
          y: Math.round(boxSize.y),
          z: Math.round(boxSize.z),
        };
        setDimsMm(dimsRounded);
        setUnitWarning(getUnitWarning(dimsRounded));

        const wireBoxGeo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const wireEdgesGeo = new THREE.EdgesGeometry(wireBoxGeo);
        wireBoxGeo.dispose();
        const wireMat = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.4 });
        const wire = new THREE.LineSegments(wireEdgesGeo, wireMat);
        mesh.add(wire);

        // Label anchor points in local space — 60% outside each face centre
        projDataRef.current = {
          xPt: new THREE.Vector3(boxSize.x / 2 * 1.6, 0, 0),
          yPt: new THREE.Vector3(0, boxSize.y / 2 * 1.6, 0),
          zPt: new THREE.Vector3(0, 0, boxSize.z / 2 * 1.6),
          mesh,
          camera,
        };

        // ── 6.2  Ground grid ───────────────────────────────────────────────
        const gridGroup = new THREE.Group();
        gridGroup.position.y = -boxSize.y / 2;

        const gSize = gridSizeForPart(maxDim);

        const minorGrid = new THREE.GridHelper(gSize, gSize / 10, 0xcccccc, 0xcccccc);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (minorGrid.material as any).opacity = 0.45;
        gridGroup.add(minorGrid);

        const majorGrid = new THREE.GridHelper(gSize, gSize / 50, 0x999999, 0x999999);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).transparent = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (majorGrid.material as any).opacity = 0.7;
        gridGroup.add(majorGrid);

        // Print-bed outline (256 × 256 mm) when part footprint exceeds 120 mm
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

        // ── 6.3  Size comparison objects ──────────────────────────────────
        const compGroup = new THREE.Group();
        const compOffset = maxDim / 2 + 30;
        const compBaseMat = new THREE.MeshStandardMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
        });

        const coinMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(12.5, 12.5, 2, 32),
          compBaseMat.clone(),
        );
        coinMesh.position.set(compOffset + 12.5, -boxSize.y / 2 + 1, 0);
        coinMesh.userData.compareKey = "coin";
        compGroup.add(coinMesh);

        const cardMesh = new THREE.Mesh(
          new THREE.BoxGeometry(85.6, 0.76, 54),
          compBaseMat.clone(),
        );
        cardMesh.position.set(compOffset + 42.8, -boxSize.y / 2 + 0.38, 0);
        cardMesh.userData.compareKey = "card";
        compGroup.add(cardMesh);

        const a4Mesh = new THREE.Mesh(
          new THREE.BoxGeometry(210, 0.1, 297),
          compBaseMat.clone(),
        );
        a4Mesh.position.set(compOffset + 105, -boxSize.y / 2, 0);
        a4Mesh.userData.compareKey = "a4";
        compGroup.add(a4Mesh);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        compGroup.children.forEach((child: any) => { child.visible = false; });
        compGroup.visible = false;
        scene.add(compGroup);
        compareGroupRef.current = compGroup;

        setIsLoading(false);
        onReady?.();

        // ResizeObserver — debounced with rAF + same-size guard to prevent the
        // "ResizeObserver loop completed with undelivered notifications" error.
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

        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        let touchPrevX = 0;
        let touchPrevY = 0;

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          prevMouseX = e.clientX;
          prevMouseY = e.clientY;
          canvas.style.cursor = "grabbing";
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const dx = e.clientX - prevMouseX;
          const dy = e.clientY - prevMouseY;
          mesh.rotation.y += dx * 0.005;
          mesh.rotation.x += dy * 0.004;
          prevMouseX = e.clientX;
          prevMouseY = e.clientY;
        };

        const onMouseUp = () => {
          isDragging = false;
          canvas.style.cursor = "grab";
        };

        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length !== 1) return;
          isDragging = true;
          touchPrevX = e.touches[0].clientX;
          touchPrevY = e.touches[0].clientY;
        };

        const onTouchMove = (e: TouchEvent) => {
          if (!isDragging || e.touches.length !== 1) return;
          e.preventDefault();
          const dx = e.touches[0].clientX - touchPrevX;
          const dy = e.touches[0].clientY - touchPrevY;
          mesh.rotation.y += dx * 0.005;
          mesh.rotation.x += dy * 0.004;
          touchPrevX = e.touches[0].clientX;
          touchPrevY = e.touches[0].clientY;
        };

        const onTouchEnd = () => { isDragging = false; };

        canvas.addEventListener("mousedown",  onMouseDown);
        window.addEventListener("mousemove",  onMouseMove);
        window.addEventListener("mouseup",    onMouseUp);
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
        canvas.addEventListener("touchend",   onTouchEnd,   { passive: true });

        // Reusable vector avoids per-frame allocation during label projection
        const _tmp = new THREE.Vector3();
        const projectLabel = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          srcPt: any, el: HTMLSpanElement | null,
        ) => {
          if (!el || !containerRef.current) return;
          const cW = containerRef.current.clientWidth;
          const cH = containerRef.current.clientHeight;
          _tmp.copy(srcPt).applyMatrix4(mesh.matrixWorld);
          _tmp.project(camera);
          if (_tmp.z >= 1) { el.style.display = "none"; return; }
          el.style.display = "block";
          el.style.left = `${(_tmp.x * 0.5 + 0.5) * cW}px`;
          el.style.top  = `${(-_tmp.y * 0.5 + 0.5) * cH}px`;
        };

        let frameId: number;
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (!isDragging) mesh.rotation.y += 0.005;
          renderer.render(scene, camera);
          // Update projected dimension labels every frame
          const pd = projDataRef.current;
          if (pd) {
            projectLabel(pd.xPt, xLabelRef.current);
            projectLabel(pd.yPt, yLabelRef.current);
            projectLabel(pd.zPt, zLabelRef.current);
          }
        };
        animate();

        cleanupFn = () => {
          cancelAnimationFrame(frameId);
          ro.disconnect();
          canvas.removeEventListener("mousedown",  onMouseDown);
          window.removeEventListener("mousemove",  onMouseMove);
          window.removeEventListener("mouseup",    onMouseUp);
          canvas.removeEventListener("touchstart", onTouchStart);
          canvas.removeEventListener("touchmove",  onTouchMove);
          canvas.removeEventListener("touchend",   onTouchEnd);
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
          compBaseMat.dispose();
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
          materialRef.current = null;
          rendererRef.current = null;
          sceneRef.current = null;
          cameraRef.current = null;
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

  // Update canvas touch-action when prop changes (without reloading the geometry)
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer?.domElement) return;
    renderer.domElement.style.touchAction = touchAction ?? "";
  }, [touchAction]);

  // Separate effect: update material colour whenever `colour` prop changes.
  // Does NOT reload the file — runs independently of the geometry effect.
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }} />

      {isLoading && (
        <div style={{ position: "absolute", inset: 0, background: "#f0f0f0", borderRadius: 8 }} />
      )}

      {/* Projected X / Y / Z dimension labels — positioned by animation loop */}
      {dimsMm && (
        <>
          <span ref={xLabelRef} style={LABEL_STYLE} aria-hidden="true">X {dimsMm.x}</span>
          <span ref={yLabelRef} style={LABEL_STYLE} aria-hidden="true">Y {dimsMm.y}</span>
          <span ref={zLabelRef} style={LABEL_STYLE} aria-hidden="true">Z {dimsMm.z}</span>
        </>
      )}

      {/* Toggle controls — bottom right */}
      {!isLoading && !hasError && (
        <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 3 }}>
          <button
            onClick={handleGridToggle}
            title={showGrid ? "Hide grid" : "Show grid"}
            style={overlayBtn(showGrid)}
          >
            ⊞
          </button>
          <button
            onClick={handleCompareToggle}
            title={compareMode === "off" ? "Show size comparison" : `Showing: ${compareMode}`}
            style={overlayBtn(compareMode !== "off")}
          >
            {COMPARE_LABEL[compareMode]}
          </button>
        </div>
      )}

      {/* Dimension text line — bottom centre; acts as screen-reader label */}
      {dimsMm && !isLoading && (
        <div
          role="text"
          aria-label={`Part dimensions: ${dimsMm.x} by ${dimsMm.y} by ${dimsMm.z} millimetres`}
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#444",
            background: "rgba(255,255,255,0.82)",
            borderRadius: 3,
            padding: "1px 7px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {dimsMm.x} × {dimsMm.y} × {dimsMm.z} mm
        </div>
      )}

      {/* 6.4 Unit sanity warning */}
      {unitWarning && !isLoading && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#856404",
            background: "rgba(255,243,205,0.96)",
            borderRadius: 4,
            padding: "3px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {unitWarning === "unit-small" ? "⚠ <3 mm — check units" : "⚠ >600 mm — check units"}
        </div>
      )}
    </div>
  );
}
