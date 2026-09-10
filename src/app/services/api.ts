import { Cardapio, Categoria, Pedido, PedidoStatus, Produto } from "../types";

const BASE_URL = "/api/backend";

interface ApiOptions extends RequestInit {
  admin?: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  const { admin = false, ...requestOptions } = options || {};
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { "X-Admin-Request": "1" } : {}),
      ...requestOptions.headers,
    },
    credentials: "same-origin",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let mensagemErro = errorData.erro || "Erro inesperado na API";
    if (Array.isArray(errorData.detalhes) && errorData.detalhes.length > 0) {
      mensagemErro = errorData.detalhes
        .map((d: { campo?: string; mensagem?: string }) => d.mensagem || d.campo)
        .filter(Boolean)
        .join(", ");
    }
    throw new ApiError(mensagemErro, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  getCardapios: () =>
    apiFetch<Cardapio[]>("/cardapios"),

  getCardapiosAdmin: () =>
    apiFetch<Cardapio[]>("/cardapios?pagina=1&limite=100", { admin: true }),

  getCardapioById: (id: string) =>
    apiFetch<Cardapio>(`/cardapios/${id}`),

  getCardapioAdminById: (id: string) =>
    apiFetch<Cardapio>(`/cardapios/${id}`, { admin: true }),

  criarCardapio: (data: { nome: string; descricao?: string; imagemUrl?: string; ativo?: boolean }) =>
    apiFetch<Cardapio>("/cardapios", { method: "POST", body: JSON.stringify(data) }),

  atualizarCardapio: (id: string, data: Partial<Cardapio>) =>
    apiFetch<Cardapio>(`/cardapios/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletarCardapio: (id: string) =>
    apiFetch<void>(`/cardapios/${id}`, { method: "DELETE" }),

  atualizarCategoria: (id: string, data: { nome?: string; cardapioId?: string }) =>
    apiFetch<Categoria>(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  criarCategoria: (data: { nome: string; cardapioId: string }) =>
    apiFetch<Categoria>("/categorias", { method: "POST", body: JSON.stringify(data) }),

  deletarCategoria: (id: string) =>
    apiFetch<void>(`/categorias/${id}`, { method: "DELETE" }),

  getProdutos: (busca?: string) => {
    const url = busca ? `/produtos?busca=${encodeURIComponent(busca)}` : "/produtos";
    return apiFetch<Produto[]>(url);
  },

  criarProduto: (data: { nome: string; preco: number; categoriaId: string; disponivel: boolean; descricao?: string; imagemUrl?: string }) =>
    apiFetch<Produto>("/produtos", { method: "POST", body: JSON.stringify(data) }),

  atualizarProduto: (id: string, data: Partial<Produto>) =>
    apiFetch<Produto>(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletarProduto: (id: string) =>
    apiFetch<void>(`/produtos/${id}`, { method: "DELETE" }),

  criarPedido: (data: {
    cardapioId: string;
    chaveIdempotencia: string;
    clienteNome: string;
    observacao?: string;
    itens: Array<{ produtoId: string; quantidade: number }>;
  }) => apiFetch<Pedido>("/pedidos", { method: "POST", body: JSON.stringify(data) }),

  getPedidos: () => apiFetch<Pedido[]>("/pedidos", { admin: true }),

  atualizarStatusPedido: (id: string, status: PedidoStatus) =>
    apiFetch<Pedido>(`/pedidos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

};
