import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getBackendApiUrl,
  respostaApiIndisponivel,
} from "@/lib/server-api";

type Contexto = { params: Promise<{ path: string[] }> };

const encaminhar = async (request: NextRequest, contexto: Contexto) => {
  const { path } = await contexto.params;
  if (!path?.length || path.some((segmento) => !/^[\w-]+$/.test(segmento))) {
    return Response.json({ erro: "Caminho de API inválido" }, { status: 400 });
  }

  const caminho = path.join("/");
  const ehPedidoPublico = request.method === "POST" && caminho === "pedidos";
  const precisaAdmin =
    request.headers.get("x-admin-request") === "1" ||
    (request.method !== "GET" && request.method !== "HEAD" && !ehPedidoPublico);
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (precisaAdmin && !token) {
    return Response.json({ erro: "Autenticação necessária" }, { status: 401 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const url = new URL(`${getBackendApiUrl()}/${caminho}`);
    url.search = request.nextUrl.search;
    const headers = new Headers({ Accept: "application/json" });
    if (request.headers.get("content-type")) {
      headers.set("Content-Type", request.headers.get("content-type")!);
    }
    if (precisaAdmin && token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(url, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
      cache: "no-store",
      signal: controller.signal,
    });
    const corpo = await response.text();

    if (response.status === 401 && token) {
      cookieStore.delete(ADMIN_SESSION_COOKIE);
    }

    return new Response(corpo, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return respostaApiIndisponivel();
  } finally {
    clearTimeout(timeout);
  }
};

export const GET = encaminhar;
export const POST = encaminhar;
export const PUT = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;
