export const ADMIN_SESSION_COOKIE = "cardapio_admin_session";

export function getBackendApiUrl(): string {
  const configurada = process.env.API_URL?.trim();
  if (configurada) return configurada.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error("API_URL é obrigatória em produção");
  }

  return "http://127.0.0.1:3001/api";
}

export const respostaApiIndisponivel = () =>
  Response.json(
    { erro: "API temporariamente indisponível" },
    { status: 502 },
  );
