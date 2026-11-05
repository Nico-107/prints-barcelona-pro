// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import React from "react";
import { ColourPicker, COLOUR_OPTIONS } from "./ColourPicker";

function t(key: string) { return key; }

function mount(element: React.ReactElement): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => { createRoot(container).render(element); });
  return container;
}

function openPanel(container: HTMLElement) {
  const trigger = container.querySelector('[data-testid="colour-picker-trigger"]') as HTMLButtonElement;
  act(() => { trigger.click(); });
}

describe("ColourPicker", () => {
  it("renders closed by default: trigger visible, panel absent, fewer than 8 swatches visible", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    expect(container.querySelector('[data-testid="colour-picker-trigger"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="colour-picker-panel"]')).toBeNull();
    // Trigger shows one SwatchDot, nothing else
    const spans = container.querySelectorAll('[data-testid="colour-picker"] span.rounded-full');
    expect(spans.length).toBeLessThan(8);
  });

  it("opening the panel shows every COLOUR_OPTIONS entry plus Any + Custom", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    for (const opt of COLOUR_OPTIONS) {
      // each option is a button whose text includes the translated key fallback
      const found = Array.from(panel.querySelectorAll("button")).some(
        b => b.textContent?.includes(`calc.color.name.${opt.key}`),
      );
      expect(found, `swatch ${opt.key} missing in open panel`).toBe(true);
    }
    const anyFound = Array.from(panel.querySelectorAll("button")).some(
      b => b.textContent?.includes("calc.color.name.any"),
    );
    expect(anyFound).toBe(true);
  });

  it("selecting a named swatch calls onChange with the English key and closes the panel", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="" onChange={onChange} t={t} />);
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    const blueBtn = Array.from(panel.querySelectorAll("button")).find(
      b => b.textContent?.includes("calc.color.name.Blue"),
    ) as HTMLButtonElement;
    expect(blueBtn).not.toBeUndefined();
    act(() => { blueBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("Blue");
    expect(container.querySelector('[data-testid="colour-picker-panel"]')).toBeNull();
  });

  it("selecting 'Any colour' calls onChange with empty string", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="Blue" onChange={onChange} t={t} />);
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    const anyBtn = Array.from(panel.querySelectorAll("button")).find(
      b => b.textContent?.includes("calc.color.name.any"),
    ) as HTMLButtonElement;
    act(() => { anyBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("named colour value does not render a free-text input while closed", () => {
    const container = mount(<ColourPicker value="Blue" onChange={() => {}} t={t} />);
    expect(container.querySelector("input[type=text]")).toBeNull();
  });

  it("custom (non-named) value shows the free-text input with that value", () => {
    const container = mount(<ColourPicker value="my custom colour" onChange={() => {}} t={t} />);
    const input = container.querySelector("input[type=text]") as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.value).toBe("my custom colour");
  });

  it("typing in the custom input emits the typed text via onChange", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="old" onChange={onChange} t={t} />);
    const input = container.querySelector("input[type=text]") as HTMLInputElement;
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      nativeSetter.call(input, "dark teal");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith("dark teal");
  });
});

describe("ColourPicker customMode", () => {
  it("clicking Custom in the open panel enters custom mode without calling onChange", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="" onChange={onChange} t={t} />);
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    const customBtn = Array.from(panel.querySelectorAll("button")).find(
      b => b.textContent?.includes("calc.color.name.Custom"),
    ) as HTMLButtonElement;
    act(() => { customBtn.click(); });
    expect(container.querySelector("input[type=text]")).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clicking a named colour from custom mode calls onChange with the key and hides the input", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="my custom" onChange={onChange} t={t} />);
    // Verify we start in custom mode
    expect(container.querySelector("input[type=text]")).not.toBeNull();
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    const greyBtn = Array.from(panel.querySelectorAll("button")).find(
      b => b.textContent?.includes("calc.color.name.Grey"),
    ) as HTMLButtonElement;
    act(() => { greyBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("Grey");
    expect(container.querySelector("input[type=text]")).toBeNull();
  });

  it("value='dark teal' renders Custom mode with text prefilled", () => {
    const container = mount(<ColourPicker value="dark teal" onChange={() => {}} t={t} />);
    const input = container.querySelector("input[type=text]") as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.value).toBe("dark teal");
  });

  it("clicking Any from custom mode turns off custom mode", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="my custom" onChange={onChange} t={t} />);
    openPanel(container);
    const panel = container.querySelector('[data-testid="colour-picker-panel"]')!;
    const anyBtn = Array.from(panel.querySelectorAll("button")).find(
      b => b.textContent?.includes("calc.color.name.any"),
    ) as HTMLButtonElement;
    act(() => { anyBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("");
    expect(container.querySelector("input[type=text]")).toBeNull();
  });
});
