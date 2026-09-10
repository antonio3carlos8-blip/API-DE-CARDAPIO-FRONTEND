import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/ProductCard";
import { Produto } from "@/app/types";

describe("ProductCard component", () => {
  const mockProdutoDisponivel: Produto = {
    id: "prod-1",
    nome: "X-Bacon Artesanal",
    preco: 32.5,
    descricao: "Pão brioche, hambúrguer 180g e muito bacon.",
    disponivel: true,
    categoriaId: "cat-1",
  };

  const mockProdutoEsgotado: Produto = {
    id: "prod-2",
    nome: "Suco Natural de Laranja",
    preco: 10.0,
    disponivel: false,
    categoriaId: "cat-2",
  };

  it("renders product name, description, and formatted price in BRL", () => {
    const handleAdd = vi.fn();
    render(<ProductCard produto={mockProdutoDisponivel} onAdd={handleAdd} />);

    expect(screen.getByText("X-Bacon Artesanal")).toBeDefined();
    expect(screen.getByText("Pão brioche, hambúrguer 180g e muito bacon.")).toBeDefined();
    // Currency format contains non-breaking space or standard space
    const precoText = screen.getByText(/32,50/);
    expect(precoText).toBeDefined();
  });

  it("keeps every product photo at the same card height", () => {
    render(<ProductCard produto={{ ...mockProdutoDisponivel, imagemUrl: "https://example.com/burger.jpg" }} onAdd={vi.fn()} />);

    const imagem = screen.getByRole("img", { name: mockProdutoDisponivel.nome });
    const areaDaFoto = imagem.parentElement;

    expect(areaDaFoto?.className).toContain("h-48");
    expect(imagem.className).toContain("object-cover");
    expect(imagem.className).toContain("h-full");
  });

  it("calls onAdd when available product button is clicked", () => {
    const handleAdd = vi.fn();
    render(<ProductCard produto={mockProdutoDisponivel} onAdd={handleAdd} />);

    const button = screen.getByRole("button", { name: /adicionar/i });
    expect(button).toBeDefined();
    expect((button as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(button);
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it("shows Esgotado badge and disables button when product is not available", () => {
    const handleAdd = vi.fn();
    render(<ProductCard produto={mockProdutoEsgotado} onAdd={handleAdd} />);

    expect(screen.getByText("Esgotado")).toBeDefined();
    const button = screen.getByRole("button", { name: /adicionar/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(button);
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it("blocks ordering when the API returns an invalid price", () => {
    const handleAdd = vi.fn();
    const invalido = { ...mockProdutoDisponivel, preco: Number.NaN };

    render(<ProductCard produto={invalido} onAdd={handleAdd} />);

    expect(screen.getByText("Preço indisponível")).toBeDefined();
    const button = screen.getByRole("button", { name: /adicionar/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(handleAdd).not.toHaveBeenCalled();
  });
});
