import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "@/components/SearchBar";

describe("SearchBar component", () => {
  it("renders with placeholder and value", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="Hambúrguer" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Buscar produtos...") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(screen.getByRole("searchbox", { name: "Buscar produtos" })).toBeDefined();
    expect(input.value).toBe("Hambúrguer");
  });

  it("calls onChange when typing", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Buscar produtos...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Pizza" } });

    expect(handleChange).toHaveBeenCalledWith("Pizza");
  });
});
