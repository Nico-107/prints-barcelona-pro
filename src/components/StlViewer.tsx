import { useEffect, useRef, useState } from "react";

interface StlViewerProps {
  file: File;
}

export default function StlViewer({ file }: StlViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark hydration complete — separate from scene init, mirrors GlobeMap.tsx
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Build Three.js scene once after hydration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isMounted) return;

    let canceled = false;
    // Holds teardown; set early so an unmount during async init still cleans up
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      try {
        // ── Dynamic import — NEVER at module top level ────────────────
        const THREE = await import("three");
        if (canceled || !containerRef.current) return;

        const cont = containerRef.current;
        const W = 240;
        const H = 240;

        // ── Read file ─────────────────────────────────────────────────
        const buffer = await file.arrayBuffer();
        if (canceled) return;

        // ── Parse STL vertices — same binary logic as StlEstimator.tsx ─
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
            const base = 84 + i * 50 + 12; // skip 80-byte header + 4-byte count + 12-byte normal
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

        // ── Scene ─────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // ── Camera ────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1_000_000);

        // ── Renderer ──────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cont.appendChild(renderer.domElement);
        const canvas = renderer.domElement;
        canvas.style.cursor = "grab";
        canvas.style.borderRadius = "8px";

        // Minimal early cleanup — extended after full init
        cleanupFn = () => {
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
        };

        // ── Lights ────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(1, 2, 3);
        scene.add(dirLight);

        // ── Geometry — same BufferAttribute pattern as GlobeMap's landGeo ─
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        // Auto-center and position camera to frame the model
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = (camera.fov * Math.PI) / 180;
        const dist = (maxDim / 2) / Math.tan(fovRad / 2) * 1.8;
        camera.position.set(0, 0, dist);
        camera.near = dist / 1000;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();

        geometry.computeVertexNormals();

        // ── Mesh — neutral light-gray ─────────────────────────────────
        const material = new THREE.MeshStandardMaterial({ color: 0xd0d0d0 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        setIsLoading(false);

        // ── Interaction state ─────────────────────────────────────────
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        let touchPrevX = 0;
        let touchPrevY = 0;

        // ── Mouse handlers — mirrors GlobeMap.tsx's pattern ───────────
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

        // ── Touch handlers — mirrors GlobeMap.tsx's pattern ──────────
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

        const onTouchEnd = () => {
          isDragging = false;
        };

        // Attach events — mousemove/mouseup on window so dragging off-canvas works
        canvas.addEventListener("mousedown",  onMouseDown);
        window.addEventListener("mousemove",  onMouseMove);
        window.addEventListener("mouseup",    onMouseUp);
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
        canvas.addEventListener("touchend",   onTouchEnd,   { passive: true });

        // ── Animation loop ─────────────────────────────────────────────
        let frameId: number;
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (!isDragging) {
            mesh.rotation.y += 0.005;
          }
          renderer.render(scene, camera);
        };
        animate();

        // ── Full cleanup — mirrors GlobeMap.tsx's cleanup block ───────
        cleanupFn = () => {
          cancelAnimationFrame(frameId);
          canvas.removeEventListener("mousedown",  onMouseDown);
          window.removeEventListener("mousemove",  onMouseMove);
          window.removeEventListener("mouseup",    onMouseUp);
          canvas.removeEventListener("touchstart", onTouchStart);
          canvas.removeEventListener("touchmove",  onTouchMove);
          canvas.removeEventListener("touchend",   onTouchEnd);
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
        };
      } catch {
        if (!canceled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      canceled = true;
      cleanupFn?.();
    };
  }, [isMounted, file]);

  // Placeholder while not yet mounted (SSR / pre-hydration)
  if (!isMounted) {
    return <div style={{ width: 240, height: 240, background: "#f0f0f0", borderRadius: 8 }} />;
  }

  // On error, render nothing — never crash the parent component
  if (hasError) return null;

  return (
    <div style={{ position: "relative", width: 240, height: 240, marginTop: 8 }}>
      {/* Canvas is appended here by the Three.js renderer */}
      <div ref={containerRef} style={{ width: 240, height: 240, borderRadius: 8, overflow: "hidden" }} />
      {/* Loading placeholder overlays container until canvas is ready */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f0f0f0",
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
}
