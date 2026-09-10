import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/app/services/api";

describe("Frontend api service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("getCardapios fetches from /cardapios and returns list", async () => {
    const mockCardapios = [
      { id: "1", nome: "Almoço", ativo: true },
      { id: "2", nome: "Jantar", ativo: false },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCardapios,
    } as unknown as Response);

    const result = await api.getCardapios();
    expect(result).toEqual(mockCardapios);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/cardapios"),
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("criarProduto sends POST with correct payload", async () => {
    const novoProduto = {
      nome: "Pizza Margherita",
      preco: 45.0,
      categoriaId: "cat-1",
      disponivel: true,
      descricao: "Molho de tomate, mussarela de búfala e manjericão.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "prod-new", ...novoProduto }),
    } as unknown as Response);

    const result = await api.criarProduto(novoProduto);
    expect(result.id).toBe("prod-new");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/produtos"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(novoProduto),
      })
    );
  });

  it("deletarProduto sends DELETE and handles 204 No Content correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as unknown as Response);

    const result = await api.deletarProduto("prod-1");
    expect(result).toEqual({});
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/produtos/prod-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws error with backend message when response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ erro: "Preço deve ser maior que zero" }),
    } as unknown as Response);

    await expect(
      api.criarProduto({
        nome: "Invalido",
        preco: -5,
        categoriaId: "cat-1",
        disponivel: true,
      })
    ).rejects.toThrow("Preço deve ser maior que zero");
  });

  it("formats validation error detalhes from backend Zod responses", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        erro: "Dados inválidos",
        detalhes: [
          { campo: "nome", mensagem: "Nome é obrigatório" },
          { campo: "preco", mensagem: "Preço deve ser maior que zero" },
        ],
      }),
    } as unknown as Response);

    await expect(
      api.criarProduto({
        nome: "",
        preco: -10,
        categoriaId: "cat-1",
        disponivel: true,
      })
    ).rejects.toThrow("Nome é obrigatório, Preço deve ser maior que zero");
  });

  it("criarCardapio supports imagemUrl and calls /cardapios", async () => {
    const novoCardapio = {
      nome: "Cardápio Verão",
      descricao: "Pratos especiais de verão",
      imagemUrl: "https://example.com/cardapio.jpg",
      ativo: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "c-123", ...novoCardapio }),
    } as unknown as Response);

    const result = await api.criarCardapio(novoCardapio);
    expect(result.id).toBe("c-123");
    expect(result.imagemUrl).toBe("https://example.com/cardapio.jpg");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/cardapios"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(novoCardapio),
      })
    );
  });

  it("atualizarCardapio sends PUT to toggle ativo status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "c-1", nome: "Menu", ativo: false }),
    } as unknown as Response);

    const result = await api.atualizarCardapio("c-1", { ativo: false });
    expect(result.ativo).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/cardapios/c-1"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ ativo: false }),
      })
    );
  });

  it("atualizarCategoria sends PUT with renamed category", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "cat-1", nome: "Bebidas Artesanais", cardapioId: "c-1" }),
    } as unknown as Response);

    const result = await api.atualizarCategoria("cat-1", { nome: "Bebidas Artesanais" });
    expect(result.nome).toBe("Bebidas Artesanais");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/categorias/cat-1"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ nome: "Bebidas Artesanais" }),
      })
    );
  });

  it("atualizarProduto sends PUT with updated category and cleared fields", async () => {
    const updateData = {
      nome: "Burger Gourmet",
      preco: 35.0,
      categoriaId: "cat-nova",
      descricao: null,
      imagemUrl: null,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "prod-1", ...updateData }),
    } as unknown as Response);

    const result = await api.atualizarProduto("prod-1", updateData);
    expect(result.categoriaId).toBe("cat-nova");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/produtos/prod-1"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(updateData),
      })
    );
  });

  it("creates a persisted order without sending a client-calculated total", async () => {
    const payload = {
      cardapioId: "cardapio-1",
      chaveIdempotencia: "10000000-0000-4000-8000-000000000001",
      clienteNome: "Gui",
      observacao: "Sem cebola",
      itens: [{ produtoId: "produto-1", quantidade: 2 }],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "pedido-1", status: "RECEBIDO", total: 50, itens: [] }),
    } as unknown as Response);

    await api.criarPedido(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/pedidos"),
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) }),
    );
    expect(JSON.stringify((global.fetch as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('"total"');
  });
});
