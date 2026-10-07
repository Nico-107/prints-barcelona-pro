// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import React from "react";
import { PartSummaryList } from "./PartSummaryList";
import type { ParsedFile, PartDefaults } from "@/lib/pricing";

function t(key: string) { return key; }
const NOOP = () => {};

const DEFAULTS: PartDefaults = {
  material: "PLA",
  color: "",
  infill: 15,
  wallLoops: 2,
  multicolour: false,
};

function mkFile(id: string, qty = 1, settings?: ParsedFile["settings"]): ParsedFile {
  return { id, name: `${id}.stl`, sizeBytes: 100, volumeMm3: 1000, qty, settings };
}

function mount(element: React.ReactElement): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => { createRoot(container).render(element); });
  return container;
}

/** querySelector('[aria-label="... +"]') has a jsdom CSS-selector quirk with '+' — use this helper instead */
function findPlusBtn(container: HTMLElement): HTMLButtonElement {
  return Array.from(container.querySelectorAll("button")).find(
    b => b.getAttribute("aria-label")?.endsWith(" +")
  ) as HTMLButtonElement;
}
function findAllPlusBtns(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll("button")).filter(
    b => b.getAttribute("aria-label")?.endsWith(" +")
  ) as HTMLButtonElement[];
}

const COST_BY_FILE = { a: 1250, b: 890 };

describe("PartSummaryList", () => {
  it("renders one row per part with name, material line, and price", () => {
    const files = [mkFile("a"), mkFile("b")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={COST_BY_FILE}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    const html = container.innerHTML;
    expect(html).toContain("a.stl");
    expect(html).toContain("b.stl");
    // Material line
    expect(html).toContain("PLA");
    // Price
    expect(html).toContain("12.50");
    expect(html).toContain("8.90");
  });

  it("qty − calls onQtyChange(id, qty-1)", () => {
    const onQtyChange = vi.fn();
    const files = [mkFile("a", 3)];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={onQtyChange}
        onRemove={NOOP}
      />
    );
    const minusBtn = container.querySelector('[aria-label="calc.parts.qty −"]') as HTMLButtonElement;
    act(() => { minusBtn.click(); });
    expect(onQtyChange).toHaveBeenCalledWith("a", 2);
  });

  it("qty + calls onQtyChange(id, qty+1)", () => {
    const onQtyChange = vi.fn();
    const files = [mkFile("a", 5)];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={onQtyChange}
        onRemove={NOOP}
      />
    );
    const plusBtn = findPlusBtn(container);
    act(() => { plusBtn.click(); });
    expect(onQtyChange).toHaveBeenCalledWith("a", 6);
  });

  it("qty − is disabled when qty=1", () => {
    const files = [mkFile("a", 1)];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    const minusBtn = container.querySelector('[aria-label="calc.parts.qty −"]') as HTMLButtonElement;
    expect(minusBtn.disabled).toBe(true);
  });

  it("qty + is disabled when qty=999", () => {
    const files = [mkFile("a", 999)];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    const plusBtn = findPlusBtn(container);
    expect(plusBtn.disabled).toBe(true);
  });

  it("remove button calls onRemove(id)", () => {
    const onRemove = vi.fn();
    const files = [mkFile("x")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={onRemove}
      />
    );
    const removeBtn = container.querySelector('[aria-label="calc.parts.remove"]') as HTMLButtonElement;
    act(() => { removeBtn.click(); });
    expect(onRemove).toHaveBeenCalledWith("x");
  });

  it("clicking a row calls onSelect with (viewableIdx, fileId)", () => {
    const onSelect = vi.fn();
    const files = [mkFile("a"), mkFile("b")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={onSelect}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    // Click the second row (index 1) — rows have cursor:pointer style
    const rows = Array.from(container.querySelectorAll("[style]")).filter(
      el => (el as HTMLElement).style.cursor === "pointer"
    ) as HTMLElement[];
    act(() => { rows[1].click(); });
    expect(onSelect).toHaveBeenCalledWith(1, "b");
  });

  it(">4 parts adds the overflow-y-auto scroll class", () => {
    const files = [mkFile("a"), mkFile("b"), mkFile("c"), mkFile("d"), mkFile("e")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    expect(container.querySelector(".overflow-y-auto")).not.toBeNull();
  });

  it("4 or fewer parts does NOT add the overflow-y-auto class", () => {
    const files = [mkFile("a"), mkFile("b"), mkFile("c"), mkFile("d")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    expect(container.querySelector(".overflow-y-auto")).toBeNull();
  });

  // Dialog composition: 2 parts → 2 qty steppers and 2 remove buttons in the left slot
  it("dialog composition: 2 parts render 2 qty steppers and 2 remove buttons", () => {
    const files = [mkFile("p1"), mkFile("p2")];
    const container = mount(
      <PartSummaryList
        parsedFiles={files}
        viewableFiles={files}
        defaults={DEFAULTS}
        selectedFileIndex={0}
        costByFileId={{}}
        t={t}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
      />
    );
    const minusBtns = container.querySelectorAll('[aria-label="calc.parts.qty −"]');
    const plusBtns  = findAllPlusBtns(container);
    const removeBtns = container.querySelectorAll('[aria-label="calc.parts.remove"]');
    expect(minusBtns.length).toBe(2);
    expect(plusBtns.length).toBe(2);
    expect(removeBtns.length).toBe(2);
  });
});
