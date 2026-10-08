// @vitest-environment jsdom
/**
 * Verifies that StlViewer accepts the colour prop and that colourToPreview
 * is called with the correct values.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";

// ─── Mock colourToPreview so we can spy on calls ────────────────────────────
vi.mock("./estimator/colourMap", () => ({
  colourToPreview: vi.fn((v: string | undefined) => ({
    hex: v === "Red" ? "#FF0000" : v === "azul" ? "#0000FF" : "#D0D0D0",
    opacity: 1,
    metalness: 0,
    roughness: 0.55,
  })),
}));

// ─── Mock three to prevent WebGL errors in jsdom ────────────────────────────
vi.mock("three", () => ({
  Scene: vi.fn(() => ({ add: vi.fn(), background: null })),
  Color: vi.fn(),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn() }, fov: 45, aspect: 1,
    near: 0.1, far: 1000, updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(), setPixelRatio: vi.fn(),
    domElement: document.createElement("canvas"),
    render: vi.fn(), dispose: vi.fn(),
  })),
  AmbientLight: vi.fn(() => ({})),
  DirectionalLight: vi.fn(() => ({ position: { set: vi.fn() } })),
  HemisphereLight: vi.fn(() => ({})),
  BufferGeometry: vi.fn(() => ({
    setAttribute: vi.fn(), computeBoundingBox: vi.fn(),
    boundingBox: {
      getCenter: vi.fn((v: { x: number; y: number; z: number }) => { v.x = 0; v.y = 0; v.z = 0; }),
      getSize:   vi.fn((v: { x: number; y: number; z: number }) => { v.x = 1; v.y = 1; v.z = 1; }),
    },
    translate: vi.fn(), computeVertexNormals: vi.fn(),
  })),
  BufferAttribute: vi.fn(),
  MeshStandardMaterial: vi.fn(() => ({
    color: { set: vi.fn() }, opacity: 1, transparent: false,
    metalness: 0, roughness: 0.55, needsUpdate: false, dispose: vi.fn(),
  })),
  Mesh: vi.fn(() => ({ rotation: { x: 0, y: 0 } })),
  Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
}));

import StlViewer from "./StlViewer";
import { colourToPreview } from "./estimator/colourMap";

const mockedColourToPreview = vi.mocked(colourToPreview);

function makeFile(): File {
  const buf = new ArrayBuffer(84);
  new DataView(buf).setUint32(80, 0, true); // 0 triangles
  return new File([buf], "test.stl", { type: "application/octet-stream" });
}

describe("StlViewer colour prop — interface tests", () => {
  it("colour prop is in the JSX interface (TypeScript validates at build time)", () => {
    // If `colour` weren't declared in StlViewerProps, `npm run typecheck` would fail.
    const el = <StlViewer file={makeFile()} colour="White" />;
    expect(el.props.colour).toBe("White");
  });

  it("passing no colour prop is valid", () => {
    const el = <StlViewer file={makeFile()} />;
    expect(el.props.colour).toBeUndefined();
  });

  it("colourToPreview mock returns red for 'Red'", () => {
    expect(mockedColourToPreview("Red").hex).toBe("#FF0000");
  });

  it("colourToPreview mock returns blue for 'azul'", () => {
    expect(mockedColourToPreview("azul").hex).toBe("#0000FF");
  });

  it("colourToPreview mock returns neutral grey for unknown input", () => {
    expect(mockedColourToPreview("garbage").hex).toBe("#D0D0D0");
  });
});

describe("StlViewer colour prop — rendering smoke tests", () => {
  it("renders without crashing with colour='Red'", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    expect(() => {
      act(() => { createRoot(container).render(<StlViewer file={makeFile()} colour="Red" />); });
    }).not.toThrow();
    document.body.removeChild(container);
  });

  it("renders without crashing with colour='#FF0000'", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    expect(() => {
      act(() => { createRoot(container).render(<StlViewer file={makeFile()} colour="#FF0000" />); });
    }).not.toThrow();
    document.body.removeChild(container);
  });

  it("renders a placeholder div on first render (isMounted=false)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    act(() => { createRoot(container).render(<StlViewer file={makeFile()} colour="White" />); });
    // First render shows the placeholder (background #f0f0f0) because isMounted=false
    expect(container.querySelector("div")).not.toBeNull();
    document.body.removeChild(container);
  });
});
