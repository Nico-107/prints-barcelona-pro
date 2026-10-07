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

describe("ColourPicker", () => {
  it("renders every COLOUR_OPTIONS entry", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    for (const opt of COLOUR_OPTIONS) {
      const btn = container.querySelector(`[aria-label="calc.color.name.${opt.key}"]`);
      expect(btn, `swatch ${opt.key} missing`).not.toBeNull();
    }
  });

  it("renders 'Any colour' swatch", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    expect(container.querySelector('[aria-label="calc.color.name.any"]')).not.toBeNull();
  });

  it("renders 'Custom colour' swatch", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    expect(container.querySelector('[aria-label="calc.color.name.Custom"]')).not.toBeNull();
  });

  it("selecting a named swatch calls onChange with the English key", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="" onChange={onChange} t={t} />);
    const blueBtn = container.querySelector('[aria-label="calc.color.name.Blue"]') as HTMLButtonElement;
    expect(blueBtn).not.toBeNull();
    act(() => { blueBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("Blue");
  });

  it("selecting 'Any colour' calls onChange with empty string", () => {
    const onChange = vi.fn();
    const container = mount(<ColourPicker value="Blue" onChange={onChange} t={t} />);
    const anyBtn = container.querySelector('[aria-label="calc.color.name.any"]') as HTMLButtonElement;
    act(() => { anyBtn.click(); });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("named colour swatches do not show a free-text input", () => {
    const container = mount(<ColourPicker value="Blue" onChange={() => {}} t={t} />);
    expect(container.querySelector("input[type=text]")).toBeNull();
  });

  it("'Any colour' value does not show a free-text input", () => {
    const container = mount(<ColourPicker value="" onChange={() => {}} t={t} />);
    expect(container.querySelector("input[type=text]")).toBeNull();
  });

  it("custom (non-named) value shows a free-text input with that value", () => {
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
      // Use native setter so React detects the value change on the controlled input
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      nativeSetter.call(input, "dark teal");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith("dark teal");
  });
});
