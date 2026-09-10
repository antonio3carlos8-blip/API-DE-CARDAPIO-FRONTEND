export { cn } from "cn";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Erro inesperado";
}

export function parsePrecoBrasileiro(valor: string): number | null {
  const normalizado = valor.trim();
  if (!/^\d{1,8}(?:[.,]\d{1,2})?$/.test(normalizado)) return null;

  const preco = Number(normalizado.replace(",", "."));
  if (!Number.isFinite(preco) || preco <= 0 || preco > 99_999_999.99) {
    return null;
  }

  return preco;
}
