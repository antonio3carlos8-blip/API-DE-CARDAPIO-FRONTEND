import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryGroup } from "@/components/CategoryGroup";
import { Produto } from "@/app/types";

describe("CategoryGroup component", () => {
  const produtos: Produto[] = [
    { id: "1", nome: "Coca-Cola", preco: 7.0, disponivel: true, categoriaId: "c1" },
    { id: "2", nome: "Guaraná", preco: 6.5, disponivel: true, categoriaId: "c1" },
  ];

  it("renders category title and its products", () => {
    const handleAdd = vi.fn();
    render(<CategoryGroup titulo="Bebidas Geladas" produtos={produtos} onAddProduto={handleAdd} />);

    expect(screen.getByText("Bebidas Geladas")).toBeDefined();
    expect(screen.getByText("Coca-Cola")).toBeDefined();
    expect(screen.getByText("Guaraná")).toBeDefined();
  });
});
