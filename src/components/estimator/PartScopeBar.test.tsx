// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import React from "react";
import { PartScopeBar } from "./PartScopeBar";
import type { ParsedFile } from "@/lib/pricing";

function t(key: string) { return key; }

const NOOP = () => {};

function mkFile(id: string, settings?: ParsedFile["settings"]): ParsedFile {
  return { id, name: `${id}.stl`, sizeBytes: 100, volumeMm3: 1000, qty: 1, settings };
}

function mount(element: React.ReactElement): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => { createRoot(container).render(element); });
  return container;
}

describe("PartScopeBar", () => {
  it("renders nothing when validFiles has 1 file", () => {
    const container = mount(
      <PartScopeBar validFiles={[mkFile("a")]} scope="all" costByFileId={{}} onScopeChange={NOOP} t={t} />
    );
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders All parts tab + per-part tabs when >1 file", () => {
    const files = [mkFile("a"), mkFile("b")];
    const container = mount(
      <PartScopeBar validFiles={files} scope="all" costByFileId={{}} onScopeChange={NOOP} t={t} />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3); // All + Part 1 + Part 2
  });

  it("clicking a part tab calls onScopeChange with the file id", () => {
    const onChange = vi.fn();
    const files = [mkFile("x"), mkFile("y")];
    const container = mount(
      <PartScopeBar validFiles={files} scope="all" costByFileId={{}} onScopeChange={onChange} t={t} />
    );
    const buttons = container.querySelectorAll("button");
    act(() => { buttons[2].click(); }); // Part 2 = y
    expect(onChange).toHaveBeenCalledWith("y");
  });

  it("clicking All parts tab calls onScopeChange with 'all'", () => {
    const onChange = vi.fn();
    const files = [mkFile("a"), mkFile("b")];
    const container = mount(
      <PartScopeBar validFiles={files} scope="b" costByFileId={{}} onScopeChange={onChange} t={t} />
    );
    const buttons = container.querySelectorAll("button");
    act(() => { buttons[0].click(); }); // All parts
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("shows override dot on tabs whose part has settings", () => {
    const files = [mkFile("a", { material: "PETG" }), mkFile("b")];
    const container = mount(
      <PartScopeBar validFiles={files} scope="all" costByFileId={{}} onScopeChange={NOOP} t={t} />
    );
    // Part 1 (id=a) has settings — should have a dot span inside its button
    const part1Btn = container.querySelectorAll("button")[1];
    expect(part1Btn.querySelector("span.rounded-full")).not.toBeNull();
    // Part 2 (id=b) has no settings — no dot
    const part2Btn = container.querySelectorAll("button")[2];
    expect(part2Btn.querySelector("span.rounded-full")).toBeNull();
  });
});
