import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderCart, CartItem } from "@/components/OrderCart";

describe("OrderCart component", () => {
  const itens: CartItem[] = [
    {
      produto: { id: "p1", nome: "Hambúrguer", preco: 25.0, disponivel: true, categoriaId: "c1" },
      quantidade: 2,
    },
    {
      produto: { id: "p2", nome: "Refrigerante", preco: 8.5, disponivel: true, categoriaId: "c1" },
      quantidade: 1,
    },
  ];

  it("renders cart trigger with total badge count", () => {
    const handleRemover = vi.fn();
    const handleFinalizar = vi.fn();

    render(<OrderCart itens={itens} onRemover={handleRemover} onFinalizar={handleFinalizar} enviando={false} />);

    // Total items: 2 + 1 = 3
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByRole("button", { name: /abrir carrinho com 3 itens/i })).toBeDefined();
  });

  it("opens sheet, calculates total price, and displays items", () => {
    const handleRemover = vi.fn();
    const handleFinalizar = vi.fn();

    render(<OrderCart itens={itens} onRemover={handleRemover} onFinalizar={handleFinalizar} enviando={false} />);

    // Click trigger to open sheet
    const trigger = screen.getByRole("button", { name: /abrir carrinho/i });
    fireEvent.click(trigger);

    // Total: (25.0 * 2) + (8.5 * 1) = 58.50
    expect(screen.getByText(/58,50/)).toBeDefined();
    expect(screen.getByText("2x Hambúrguer")).toBeDefined();
    expect(screen.getByText("1x Refrigerante")).toBeDefined();
  });

  it("uses a padded, scrollable viewport layout on narrow screens", () => {
    render(
      <OrderCart
        itens={[]}
        onRemover={vi.fn()}
        onFinalizar={vi.fn()}
        enviando={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir carrinho/i }));

    const painel = document.querySelector('[data-slot="sheet-content"]');
    const conteudo = screen.getByTestId("order-cart-scroll-area");
    const lista = screen.getByTestId("order-cart-items");

    expect(painel?.className).toContain("h-[100dvh]");
    expect(painel?.className).toContain("!w-full");
    expect(painel?.className).toContain("overflow-hidden");
    expect(conteudo.className).toContain("overflow-y-auto");
    expect(conteudo.className).toContain("px-4");
    expect(conteudo.className).toContain("safe-area-inset-bottom");
    expect(conteudo.className).not.toContain("h-[calc(100vh-8rem)]");
    expect(lista.className).toContain("shrink-0");
    expect(lista.className).toContain("basis-auto");
  });

  it("collects the customer name and calls onFinalizar", () => {
    const handleRemover = vi.fn();
    const handleFinalizar = vi.fn();

    render(<OrderCart itens={itens} onRemover={handleRemover} onFinalizar={handleFinalizar} enviando={false} />);

    // Click trigger to open sheet
    const trigger = screen.getByRole("button", { name: /abrir carrinho/i });
    fireEvent.click(trigger);

    fireEvent.change(screen.getByRole("textbox", { name: /seu nome/i }), {
      target: { value: "Gui" },
    });
    const button = screen.getByRole("button", { name: /enviar pedido/i });
    fireEvent.click(button);

    expect(handleFinalizar).toHaveBeenCalledWith("Gui", "");
    expect(screen.getByRole("button", { name: /remover hambúrguer/i })).toBeDefined();
  });

  it("keeps checkout disabled when an item has an invalid price", () => {
    const handleFinalizar = vi.fn();
    const itensInvalidos: CartItem[] = [
      {
        produto: { ...itens[0].produto, preco: Number.NaN },
        quantidade: 1,
      },
    ];

    render(
      <OrderCart
        itens={itensInvalidos}
        onRemover={vi.fn()}
        onFinalizar={handleFinalizar}
        enviando={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir carrinho/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /seu nome/i }), {
      target: { value: "Gui" },
    });

    expect(screen.getByRole("alert").textContent).toMatch(/preço inválido/i);
    const enviar = screen.getByRole("button", { name: /enviar pedido/i });
    expect((enviar as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(enviar);
    expect(handleFinalizar).not.toHaveBeenCalled();
  });
});
