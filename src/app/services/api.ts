import { Cardapio, Categoria, Produto } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || "Erro inesperado na API");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  getCardapios: () => 
    apiFetch<Cardapio[]>("/cardapios"),
  
  getCardapioById: (id: string) => 
    apiFetch<Cardapio>(`/cardapios/${id}`),
  
  criarCardapio: (data: { nome: string; descricao?: string; ativo?: boolean }) => 
    apiFetch<Cardapio>("/cardapios", { method: "POST", body: JSON.stringify(data) }),

  criarCategoria: (data: { nome: string; cardapioId: string }) => 
    apiFetch<Categoria>("/categorias", { method: "POST", body: JSON.stringify(data) }),
    
  deletarCategoria: (id: string) => 
    apiFetch<void>(`/categorias/${id}`, { method: "DELETE" }),

  getProdutos: (busca?: string) => {
    const url = busca ? `/produtos?busca=${encodeURIComponent(busca)}` : "/produtos";
    return apiFetch<Produto[]>(url);
  },
  
  criarProduto: (data: { nome: string; preco: number; categoriaId: string; disponivel: boolean; descricao?: string }) => 
    apiFetch<Produto>("/produtos", { method: "POST", body: JSON.stringify(data) }),
  
  atualizarProduto: (id: string, data: Partial<Produto>) => 
    apiFetch<Produto>(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  
  deletarProduto: (id: string) => 
    apiFetch<void>(`/produtos/${id}`, { method: "DELETE" }),
  
};