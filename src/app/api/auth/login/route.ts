import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  getBackendApiUrl,
  respostaApiIndisponivel,
} from "@/lib/server-api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const credenciais = body as { usuario?: unknown; senha?: unknown };
  if (typeof credenciais.usuario !== "string" || typeof credenciais.senha !== "string") {
    return Response.json({ erro: "Informe usuário e senha" }, { status: 400 });
  }

  try {
    const response = await fetch(`${getBackendApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        usuario: credenciais.usuario,
        senha: credenciais.senha,
      }),
      cache: "no-store",
    });
    const resultado = await response.json().catch(() => ({}));

    if (!response.ok) {
      return Response.json(resultado, { status: response.status });
    }

    if (typeof resultado.token !== "string" || typeof resultado.expiresIn !== "number") {
      return respostaApiIndisponivel();
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, resultado.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.min(resultado.expiresIn, 8 * 60 * 60),
    });

    return Response.json({ usuario: resultado.usuario, expiresIn: resultado.expiresIn });
  } catch {
    return respostaApiIndisponivel();
  }
}
