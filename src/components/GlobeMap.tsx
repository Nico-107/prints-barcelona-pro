import { useEffect, useRef, useState } from "react";
import { EuropeMapSVG } from "./EuropeMapSVG";

export interface GlobeCity {
  name: string;
  lat: number;
  lon: number;
  live: boolean;
}

interface GlobeMapProps {
  cities: GlobeCity[];
  onCityClick: (cityName: string) => void;
  liveLabel: string;
  expandingLabel: string;
}

export function GlobeMap({ cities, onCityClick, liveLabel, expandingLabel }: GlobeMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    live: boolean;
    x: number;
    y: number;
  } | null>(null);

  // Always-fresh ref so the Three.js event handler never captures a stale closure
  const onCityClickRef = useRef(onCityClick);
  useEffect(() => {
    onCityClickRef.current = onCityClick;
  });

  // Mark hydration complete — this is the only thing that must run first
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Build the Three.js scene once after hydration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window === "undefined" || window.innerWidth < 768) {
      setHasError(true);
      return;
    }

    let canceled = false;
    // Holds the teardown function; set early so an unmount during async init
    // still cleans up any resources that were already created.
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      try {
        // ── Dynamic import — NEVER at module top level ────────────────
        const THREE = await import("three");
        if (canceled || !containerRef.current) return;

        const cont = containerRef.current;
        const W = cont.clientWidth || 520;
        const H = cont.clientHeight || 430;

        // ── Scene ─────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000814);

        // ── Camera ────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
        camera.position.z = 2.6;

        // ── Renderer ──────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cont.appendChild(renderer.domElement);
        const canvas = renderer.domElement;
        canvas.style.cursor = "grab";
        canvas.style.borderRadius = "inherit";

        // Set a minimal cleanup immediately — extended after full init
        cleanupFn = () => {
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
        };

        // ── Stars ─────────────────────────────────────────────────────
        const starCount = 1500;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          const th = Math.random() * 2 * Math.PI;
          const ph = Math.acos(2 * Math.random() - 1);
          const r = 80;
          starPos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
          starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
          starPos[i * 3 + 2] = r * Math.cos(ph);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        scene.add(
          new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18 }))
        );

        // ── Globe group — everything rotates together ─────────────────
        const globeGroup = new THREE.Group();
        // ~100° initial Y rotation centers Europe (lon ≈ 10°E) toward the camera.
        // Derivation: Europe center is at (0.633, 0.766, −0.112) in local space;
        // rotating +100° around Y maps z → 0.633·sin(100°) + (−0.112)·cos(100°) ≈ +0.64.
        globeGroup.rotation.y = 1.745;
        scene.add(globeGroup);

        const R = 1;

        // ── Globe sphere ──────────────────────────────────────────────
        globeGroup.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(R, 64, 64),
            new THREE.MeshPhongMaterial({
              color: 0x0f172a,
              shininess: 12,
              emissive: new THREE.Color(0x0a1628),
              emissiveIntensity: 0.25,
            })
          )
        );

        // ── Atmosphere glow (additive-blended rim halo) ───────────────
        globeGroup.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(R + 0.032, 64, 64),
            new THREE.MeshBasicMaterial({
              color: 0x2255cc,
              transparent: true,
              opacity: 0.10,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          )
        );

        // ── Lights ────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x304070, 1.0));
        const ptLight = new THREE.PointLight(0x4060c0, 1.5, 20);
        ptLight.position.set(4, 3, 4);
        scene.add(ptLight);

        // ── Lat/lon → 3D ──────────────────────────────────────────────
        // Convention: 90°W faces +Z (camera default at rest).
        // globeGroup.rotation.y = 1.745 brings Europe to face the camera.
        const ll2v = (lat: number, lon: number, r: number): THREE.Vector3 => {
          const phi   = (90 - lat) * Math.PI / 180;
          const theta = (lon + 180) * Math.PI / 180;
          return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
             r * Math.cos(phi),
             r * Math.sin(phi) * Math.sin(theta),
          );
        };

        // ── Country borders (optional — gracefully skipped) ───────────
        try {
          const [topoRes, topojson] = await Promise.all([
            fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
            import("topojson-client"),
          ]);
          if (!canceled) {
            const topology = await topoRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meshFeature = (topojson as any).mesh(topology, topology.objects.countries);
            if (meshFeature.type === "MultiLineString") {
              const coords: number[] = [];
              for (const line of meshFeature.coordinates) {
                for (let i = 0; i < line.length - 1; i++) {
                  const v1 = ll2v(line[i][1],     line[i][0],     R + 0.002);
                  const v2 = ll2v(line[i + 1][1], line[i + 1][0], R + 0.002);
                  coords.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                }
              }
              const geo = new THREE.BufferGeometry();
              geo.setAttribute(
                "position",
                new THREE.BufferAttribute(new Float32Array(coords), 3)
              );
              globeGroup.add(
                new THREE.LineSegments(
                  geo,
                  new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.65 })
                )
              );
            }
          }
        } catch {
          // Country borders are decorative; silently continue without them.
        }

        // ── City markers ──────────────────────────────────────────────
        const markerMeshes: THREE.Mesh[] = [];
        const defaultMats: THREE.MeshBasicMaterial[] = [];
        const hoverMats: THREE.MeshBasicMaterial[] = [];

        for (const city of cities) {
          const pos  = ll2v(city.lat, city.lon, R + 0.022);
          const size = city.live ? 0.030 : 0.019;
          const defMat = new THREE.MeshBasicMaterial({ color: city.live ? 0x22c55e : 0xf59e0b });
          const hovMat = new THREE.MeshBasicMaterial({ color: city.live ? 0x4ade80 : 0xfbbf24 });
          const marker = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 10), defMat);
          marker.position.copy(pos);
          marker.userData.city = city;
          globeGroup.add(marker);
          markerMeshes.push(marker);
          defaultMats.push(defMat);
          hoverMats.push(hovMat);
        }

        // ── Barcelona pulse ring ──────────────────────────────────────
        const bcn = cities.find((c) => c.name === "Barcelona");
        let pulseRing: THREE.Mesh | null = null;
        let pulseRingMat: THREE.MeshBasicMaterial | null = null;
        if (bcn) {
          pulseRingMat = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.55,
          });
          pulseRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.048, 0.007, 8, 40),
            pulseRingMat
          );
          pulseRing.position.copy(ll2v(bcn.lat, bcn.lon, R + 0.022));
          // lookAt(origin) orients the ring's plane to face outward from the globe center
          pulseRing.lookAt(new THREE.Vector3(0, 0, 0));
          globeGroup.add(pulseRing);
        }

        // ── Interaction state ─────────────────────────────────────────
        let isDragging   = false;
        let autoRotate   = true;
        let prevMouseX   = 0;
        let prevMouseY   = 0;
        let velX         = 0;
        let velY         = 0;
        let hoveredIdx   = -1;
        let dragDist     = 0;

        const raycaster = new THREE.Raycaster();

        const ndcFrom = (clientX: number, clientY: number): THREE.Vector2 => {
          const rect = canvas.getBoundingClientRect();
          return new THREE.Vector2(
            ((clientX - rect.left) / rect.width)  * 2 - 1,
            -((clientY - rect.top)  / rect.height) * 2 + 1,
          );
        };

        const hitTest = (clientX: number, clientY: number) => {
          raycaster.setFromCamera(ndcFrom(clientX, clientY), camera);
          return raycaster.intersectObjects(markerMeshes);
        };

        const resetHover = () => {
          if (hoveredIdx >= 0) {
            markerMeshes[hoveredIdx].material = defaultMats[hoveredIdx];
            hoveredIdx = -1;
          }
        };

        // ── Mouse handlers ────────────────────────────────────────────
        const onMouseDown = (e: MouseEvent) => {
          isDragging  = true;
          autoRotate  = false;
          prevMouseX  = e.clientX;
          prevMouseY  = e.clientY;
          velX = velY = dragDist = 0;
          canvas.style.cursor = "grabbing";
        };

        const onMouseMove = (e: MouseEvent) => {
          if (isDragging) {
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            dragDist      += Math.sqrt(dx * dx + dy * dy);
            velX           = dx * 0.005;
            velY           = dy * 0.004;
            globeGroup.rotation.y += velX;
            globeGroup.rotation.x  = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x + velY));
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            setTooltip(null);
            return;
          }
          // Hover raycasting
          const hits = hitTest(e.clientX, e.clientY);
          if (hits.length > 0) {
            const idx = markerMeshes.indexOf(hits[0].object as THREE.Mesh);
            if (idx !== hoveredIdx) {
              resetHover();
              hoveredIdx = idx;
              markerMeshes[idx].material = hoverMats[idx];
            }
            const city = hits[0].object.userData.city as GlobeCity;
            const rect  = canvas.getBoundingClientRect();
            setTooltip({ name: city.name, live: city.live, x: e.clientX - rect.left, y: e.clientY - rect.top });
            canvas.style.cursor = "pointer";
          } else {
            resetHover();
            setTooltip(null);
            canvas.style.cursor = "grab";
          }
        };

        const onMouseUp = () => {
          isDragging = false;
          canvas.style.cursor = "grab";
        };

        const onClick = (e: MouseEvent) => {
          if (dragDist > 5) return; // was a drag, not a click
          const hits = hitTest(e.clientX, e.clientY);
          if (hits.length > 0) {
            onCityClickRef.current((hits[0].object.userData.city as GlobeCity).name);
          }
        };

        // ── Touch handlers ────────────────────────────────────────────
        let touchPrevX = 0, touchPrevY = 0, touchDragDist = 0;

        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length !== 1) return;
          isDragging    = true;
          autoRotate    = false;
          touchPrevX    = e.touches[0].clientX;
          touchPrevY    = e.touches[0].clientY;
          velX = velY = touchDragDist = 0;
        };

        const onTouchMove = (e: TouchEvent) => {
          if (!isDragging || e.touches.length !== 1) return;
          e.preventDefault();
          const dx = e.touches[0].clientX - touchPrevX;
          const dy = e.touches[0].clientY - touchPrevY;
          touchDragDist += Math.abs(dx) + Math.abs(dy);
          velX           = dx * 0.005;
          velY           = dy * 0.004;
          globeGroup.rotation.y += velX;
          globeGroup.rotation.x  = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x + velY));
          touchPrevX = e.touches[0].clientX;
          touchPrevY = e.touches[0].clientY;
        };

        const onTouchEnd = (e: TouchEvent) => {
          if (touchDragDist < 10 && e.changedTouches.length > 0) {
            const t    = e.changedTouches[0];
            const hits = hitTest(t.clientX, t.clientY);
            if (hits.length > 0) {
              onCityClickRef.current((hits[0].object.userData.city as GlobeCity).name);
            }
          }
          isDragging = false;
        };

        // Attach events — mousemove/mouseup on window so dragging off-canvas works
        canvas.addEventListener("mousedown",  onMouseDown);
        window.addEventListener("mousemove",  onMouseMove);
        window.addEventListener("mouseup",    onMouseUp);
        canvas.addEventListener("click",      onClick);
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
        canvas.addEventListener("touchend",   onTouchEnd,   { passive: true });

        // ── Resize ────────────────────────────────────────────────────
        const ro = new ResizeObserver(() => {
          if (!containerRef.current) return;
          const nW = containerRef.current.clientWidth;
          const nH = containerRef.current.clientHeight;
          if (nW === 0 || nH === 0) return;
          camera.aspect = nW / nH;
          camera.updateProjectionMatrix();
          renderer.setSize(nW, nH);
        });
        ro.observe(cont);

        // ── Animation loop ─────────────────────────────────────────────
        let frameId: number;
        let t = 0;

        const animate = () => {
          frameId = requestAnimationFrame(animate);
          t += 0.016;

          if (autoRotate) {
            globeGroup.rotation.y += 0.0015;
          } else if (!isDragging) {
            globeGroup.rotation.y += velX;
            globeGroup.rotation.x  = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x + velY));
            velX *= 0.92;
            velY *= 0.92;
          }

          if (pulseRing && pulseRingMat) {
            const s = 1 + 0.35 * Math.abs(Math.sin(t * 1.8));
            pulseRing.scale.setScalar(s);
            pulseRingMat.opacity = 0.55 - 0.3 * Math.abs(Math.sin(t * 1.8));
          }

          renderer.render(scene, camera);
        };

        animate();

        // ── Full cleanup (replaces the early stub above) ──────────────
        cleanupFn = () => {
          cancelAnimationFrame(frameId);
          ro.disconnect();
          canvas.removeEventListener("mousedown",  onMouseDown);
          window.removeEventListener("mousemove",  onMouseMove);
          window.removeEventListener("mouseup",    onMouseUp);
          canvas.removeEventListener("click",      onClick);
          canvas.removeEventListener("touchstart", onTouchStart);
          canvas.removeEventListener("touchmove",  onTouchMove);
          canvas.removeEventListener("touchend",   onTouchEnd);
          renderer.dispose();
          if (cont.contains(canvas)) cont.removeChild(canvas);
        };
      } catch {
        if (!canceled) setHasError(true);
      }
    };

    init();

    return () => {
      canceled = true;
      cleanupFn?.();
    };
  }, [isMounted, cities]);

  // ── Render ───────────────────────────────────────────────────────────

  // Renders null on server (isMounted is always false during renderToString)
  if (!isMounted) return null;

  // Fallback: existing flat SVG map (mobile or Three.js failure)
  if (hasError) {
    return (
      <div
        style={{
          opacity: 0.68,
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 80% at 50% 52%, black 50%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 85% 80% at 50% 52%, black 50%, transparent 100%)",
        }}
      >
        <EuropeMapSVG variant="dark" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Canvas is appended here by the Three.js renderer */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-900/90 border border-slate-700/80 text-white rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 62, whiteSpace: "nowrap" }}
        >
          <div className="font-semibold text-sm leading-tight">{tooltip.name}</div>
          <div className={`text-xs mt-0.5 ${tooltip.live ? "text-green-400" : "text-amber-400"}`}>
            {tooltip.live ? liveLabel : expandingLabel}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 bg-slate-900/75 border border-slate-700/50 rounded-lg px-3 py-2.5 text-xs space-y-1.5 backdrop-blur-sm select-none">
        <div className="flex items-center gap-2 text-green-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          {liveLabel}
        </div>
        <div className="flex items-center gap-2 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          {expandingLabel}
        </div>
      </div>
    </div>
  );
}
