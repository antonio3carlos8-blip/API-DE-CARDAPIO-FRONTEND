import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import {
  GET as encaminharGet,
  POST as encaminharPost,
} from "@/app/api/backend/[...path]/route";
import { proxy } from "@/proxy";

const contexto = (path: string[]) => ({ params: Promise.resolve({ path }) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("API_URL", "https://api.example.test/api");
  cookieStore.get.mockReturnValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("same-origin authentication and backend proxy", () => {
  it("rejects malformed login JSON before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores a successful backend token only in an HttpOnly cookie", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ token: "jwt-somente-servidor", usuario: "admin", expiresIn: 28_800 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const response = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: "admin", senha: "segredo-local" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ usuario: "admin", expiresIn: 28_800 });
    expect(JSON.stringify(body)).not.toContain("jwt-somente-servidor");
    expect(cookieStore.set).toHaveBeenCalledWith(
      "cardapio_admin_session",
      "jwt-somente-servidor",
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
  });

  it("blocks anonymous mutations inside the BFF", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await encaminharPost(
      new NextRequest("http://localhost/api/backend/cardapios", {
        method: "POST",
        body: JSON.stringify({ nome: "Tentativa" }),
        headers: { "Content-Type": "application/json" },
      }),
      contexto(["cardapios"]),
    );

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards authenticated admin reads with Bearer auth and no cache", async () => {
    cookieStore.get.mockReturnValue({ value: "jwt-admin" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: "menu-1" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await encaminharGet(
      new NextRequest("http://localhost/api/backend/cardapios?pagina=1", {
        headers: { "X-Admin-Request": "1" },
      }),
      contexto(["cardapios"]),
    );

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/cardapios?pagina=1");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer jwt-admin");
    expect(init.cache).toBe("no-store");
  });

  it("does not attach the admin token to public reads", async () => {
    cookieStore.get.mockReturnValue({ value: "jwt-admin" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await encaminharGet(
      new NextRequest("http://localhost/api/backend/cardapios"),
      contexto(["cardapios"]),
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).has("Authorization")).toBe(false);
  });

  it("fails safely for an invalid path and clears the local session on logout", async () => {
    const invalido = await encaminharGet(
      new NextRequest("http://localhost/api/backend/cardapios"),
      contexto([".."]),
    );
    const saida = await logout();

    expect(invalido.status).toBe(400);
    expect(saida.status).toBe(204);
    expect(cookieStore.delete).toHaveBeenCalledWith("cardapio_admin_session");
  });

  it("redirects unauthenticated admin navigation and accepts a session cookie", () => {
    const anonimo = proxy(new NextRequest("http://localhost/admin/pedidos"));
    expect(anonimo.status).toBe(307);
    expect(anonimo.headers.get("location")).toContain(
      "/admin/login?retorno=%2Fadmin%2Fpedidos",
    );

    const autenticado = proxy(
      new NextRequest("http://localhost/admin", {
        headers: { cookie: "cardapio_admin_session=jwt-admin" },
      }),
    );
    expect(autenticado.status).toBe(200);
  });
});
