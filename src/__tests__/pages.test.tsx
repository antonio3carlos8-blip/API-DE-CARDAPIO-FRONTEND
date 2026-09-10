import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomeClientePage from "@/app/page";
import DetalhesCardapioPage from "@/app/cardapio/[id]/page";
import AdminCardapiosPage from "@/app/admin/page";
import GerenciarCardapioPage from "@/app/admin/cardapio/[id]/page";
import PedidosAdminPage from "@/app/admin/pedidos/page";
import LoginAdminPage from "@/app/admin/login/page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  getCardapios: vi.fn(),
  getCardapioById: vi.fn(),
  getCardapiosAdmin: vi.fn(),
  getCardapioAdminById: vi.fn(),
  criarCardapio: vi.fn(),
  atualizarCardapio: vi.fn(),
  deletarCardapio: vi.fn(),
  criarPedido: vi.fn(),
  getPedidos: vi.fn(),
  atualizarStatusPedido: vi.fn(),
  criarCategoria: vi.fn(),
  atualizarCategoria: vi.fn(),
  deletarCategoria: vi.fn(),
  criarProduto: vi.fn(),
  atualizarProduto: vi.fn(),
  deletarProduto: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
  useParams: () => ({ id: "10000000-0000-4000-8000-000000000010" }),
}));

vi.mock("@/app/services/api", () => ({
  api: {
    getCardapios: mocks.getCardapios,
    getCardapioById: mocks.getCardapioById,
    getCardapiosAdmin: mocks.getCardapiosAdmin,
    getCardapioAdminById: mocks.getCardapioAdminById,
    criarCardapio: mocks.criarCardapio,
    atualizarCardapio: mocks.atualizarCardapio,
    deletarCardapio: mocks.deletarCardapio,
    criarPedido: mocks.criarPedido,
    getPedidos: mocks.getPedidos,
    atualizarStatusPedido: mocks.atualizarStatusPedido,
    criarCategoria: mocks.criarCategoria,
    atualizarCategoria: mocks.atualizarCategoria,
    deletarCategoria: mocks.deletarCategoria,
    criarProduto: mocks.criarProduto,
    atualizarProduto: mocks.atualizarProduto,
    deletarProduto: mocks.deletarProduto,
  },
}));

const cardapioId = "10000000-0000-4000-8000-000000000010";
const produtoId = "10000000-0000-4000-8000-000000000020";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("complete application pages", () => {
  it("renders only active menus and supports keyboard-accessible navigation", async () => {
    mocks.getCardapios.mockResolvedValue([
      { id: cardapioId, nome: "Almoço", ativo: true },
      { id: "10000000-0000-4000-8000-000000000011", nome: "Rascunho", ativo: false },
    ]);

    render(<HomeClientePage />);

    const card = await screen.findByRole("button", { name: /almoço/i });
    expect(screen.queryByText("Rascunho")).toBeNull();
    fireEvent.click(card);
    expect(mocks.push).toHaveBeenCalledWith(`/cardapio/${cardapioId}`);
  });

  it("shows a recoverable catalog error", async () => {
    const erroConsole = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getCardapios
      .mockRejectedValueOnce(new Error("Falha de catálogo"))
      .mockResolvedValueOnce([{ id: cardapioId, nome: "Recuperado", ativo: true }]);

    render(<HomeClientePage />);
    expect(await screen.findByText("Falha de catálogo")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(await screen.findByText("Recuperado")).toBeDefined();
    erroConsole.mockRestore();
  });

  it("persists an order before clearing the cart and reports the server total", async () => {
    mocks.getCardapioById.mockResolvedValue({
      id: cardapioId,
      nome: "Almoço",
      ativo: true,
      categorias: [
        {
          id: "10000000-0000-4000-8000-000000000030",
          nome: "Pratos",
          cardapioId,
          produtos: [
            {
              id: produtoId,
              nome: "Executivo",
              preco: 25.5,
              disponivel: true,
              categoriaId: "10000000-0000-4000-8000-000000000030",
            },
          ],
        },
      ],
    });
    mocks.criarPedido.mockResolvedValue({
      id: "10000000-0000-4000-8000-000000000040",
      cardapioId,
      clienteNome: "Gui",
      status: "RECEBIDO",
      total: 25.5,
      itens: [],
      createdAt: "2026-09-10T12:00:00.000Z",
      updatedAt: "2026-09-10T12:00:00.000Z",
    });

    render(<DetalhesCardapioPage />);
    await screen.findByText("Executivo");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    fireEvent.click(screen.getByRole("button", { name: /abrir carrinho com 1 item/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /seu nome/i }), {
      target: { value: "Gui" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar pedido/i }));

    await waitFor(() => expect(mocks.criarPedido).toHaveBeenCalledTimes(1));
    expect(mocks.criarPedido.mock.calls[0][0]).toMatchObject({
      cardapioId,
      clienteNome: "Gui",
      itens: [{ produtoId, quantidade: 1 }],
    });
    expect((await screen.findByRole("status")).textContent).toMatch(/25,50/);
  });

  it("creates a menu from the authenticated administration page", async () => {
    mocks.getCardapiosAdmin.mockResolvedValue([]);
    mocks.criarCardapio.mockResolvedValue({ id: cardapioId, nome: "Jantar", ativo: true });

    render(<AdminCardapiosPage />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Jantar" } });
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: "Noite" } });
    fireEvent.click(screen.getByRole("button", { name: /criar cardápio/i }));

    await waitFor(() =>
      expect(mocks.criarCardapio).toHaveBeenCalledWith({
        nome: "Jantar",
        descricao: "Noite",
        imagemUrl: undefined,
        ativo: true,
      }),
    );
    expect(await screen.findByText(/criado com sucesso/i)).toBeDefined();
  });

  it("recovers from an administrative menu loading error", async () => {
    const erroConsole = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getCardapioAdminById
      .mockRejectedValueOnce(new Error("Falha administrativa"))
      .mockResolvedValueOnce({ id: cardapioId, nome: "Almoço", categorias: [] });

    render(<GerenciarCardapioPage />);
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Falha administrativa",
    );
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(await screen.findByText(/gerenciando: almoço/i)).toBeDefined();
    erroConsole.mockRestore();
  });

  it("rejects a partially parseable price before sending a product", async () => {
    const categoriaId = "10000000-0000-4000-8000-000000000030";
    mocks.getCardapioAdminById.mockResolvedValue({
      id: cardapioId,
      nome: "Almoço",
      categorias: [{ id: categoriaId, nome: "Pratos", cardapioId, produtos: [] }],
    });
    const alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);

    render(<GerenciarCardapioPage />);
    await screen.findByText(/gerenciando: almoço/i);
    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: { value: categoriaId },
    });
    fireEvent.change(screen.getByLabelText("Nome", { selector: "#produto-nome" }), {
      target: { value: "Executivo" },
    });
    fireEvent.change(screen.getByLabelText(/preço/i), {
      target: { value: "12,34abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/preço válido/i));
    expect(mocks.criarProduto).not.toHaveBeenCalled();
  });

  it("lists orders and advances their status", async () => {
    const pedido = {
      id: "10000000-0000-4000-8000-000000000040",
      cardapioId,
      clienteNome: "Gui",
      observacao: "Sem cebola",
      status: "RECEBIDO" as const,
      total: 25.5,
      itens: [
        {
          id: "10000000-0000-4000-8000-000000000050",
          produtoId,
          nomeProduto: "Executivo",
          precoUnitario: 25.5,
          quantidade: 1,
          subtotal: 25.5,
        },
      ],
      createdAt: "2026-09-10T12:00:00.000Z",
      updatedAt: "2026-09-10T12:00:00.000Z",
    };
    mocks.getPedidos.mockResolvedValue([pedido]);
    mocks.atualizarStatusPedido.mockResolvedValue({ ...pedido, status: "EM_PREPARO" });

    render(<PedidosAdminPage />);
    const seletor = await screen.findByRole("combobox", { name: /status do pedido de gui/i });
    fireEvent.change(seletor, { target: { value: "EM_PREPARO" } });
    await waitFor(() =>
      expect(mocks.atualizarStatusPedido).toHaveBeenCalledWith(pedido.id, "EM_PREPARO"),
    );
  });

  it("logs in without exposing the returned backend token to page code", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ usuario: "admin", expiresIn: 28_800 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginAdminPage />);
    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
