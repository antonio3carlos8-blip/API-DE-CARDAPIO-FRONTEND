import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/server-api";

export function proxy(request: NextRequest) {
  const autenticado = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  const login = request.nextUrl.pathname === "/admin/login";

  if (!autenticado && !login) {
    const destino = new URL("/admin/login", request.url);
    destino.searchParams.set("retorno", request.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  if (autenticado && login) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
