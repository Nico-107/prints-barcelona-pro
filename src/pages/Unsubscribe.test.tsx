// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

// vi.hoisted ensures the mock reference is initialized before vi.mock hoisting runs
const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mockRpc },
}));

vi.mock("@/components/Header", () => ({ default: () => <header /> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer /> }));

import Unsubscribe from "./Unsubscribe";

function render(search: string): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(
      <MemoryRouter initialEntries={[`/baja${search}`]}>
        <Unsubscribe />
      </MemoryRouter>
    );
  });
  return container;
}

describe("Unsubscribe page", () => {
  beforeEach(() => { mockRpc.mockReset(); });

  it("calls unsubscribe_saved_quote RPC with the token from the URL", async () => {
    const token = "11111111-2222-3333-4444-555555555555";
    mockRpc.mockResolvedValue({ data: true, error: null });
    const container = render(`?token=${token}`);
    await act(async () => {});
    expect(mockRpc).toHaveBeenCalledWith("unsubscribe_saved_quote", { p_token: token });
    document.body.removeChild(container);
  });

  it("shows Listo when RPC returns true", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const container = render("?token=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    await act(async () => {});
    expect(container.querySelector("h1")?.textContent).toBe("Listo");
    document.body.removeChild(container);
  });

  it("shows error state when RPC returns false", async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const container = render("?token=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    await act(async () => {});
    expect(container.querySelector("h1")?.textContent).toBe("Enlace no válido");
    expect(container.textContent).toContain("responde a este correo");
    document.body.removeChild(container);
  });

  it("shows error state when RPC returns an error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "rls" } });
    const container = render("?token=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    await act(async () => {});
    expect(container.querySelector("h1")?.textContent).toBe("Enlace no válido");
    expect(container.textContent).toContain("responde a este correo");
    document.body.removeChild(container);
  });

  it("shows error state immediately when no token is present", async () => {
    const container = render("");
    await act(async () => {});
    expect(container.querySelector("h1")?.textContent).toBe("Enlace no válido");
    expect(mockRpc).not.toHaveBeenCalled();
    document.body.removeChild(container);
  });
});
