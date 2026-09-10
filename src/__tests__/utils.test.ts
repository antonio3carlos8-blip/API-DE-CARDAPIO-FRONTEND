import { describe, it, expect } from "vitest";
import { cn, getErrorMessage, parsePrecoBrasileiro } from "@/lib/utils";

describe("lib/utils", () => {
  describe("cn", () => {
    it("should merge and clean class names correctly", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
    });

    it("should handle conditional and falsy values", () => {
      expect(cn("base", false && "hidden", null, undefined, "extra")).toBe("base extra");
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      expect(getErrorMessage(new Error("Erro de teste"))).toBe("Erro de teste");
    });

    it("should return string directly if error is a string", () => {
      expect(getErrorMessage("Falha de rede")).toBe("Falha de rede");
    });

    it("should extract message property from object", () => {
      expect(getErrorMessage({ message: "Objeto com erro" })).toBe("Objeto com erro");
    });

    it("should return fallback for null, undefined, or unexpected types", () => {
      expect(getErrorMessage(null)).toBe("Erro inesperado");
      expect(getErrorMessage(undefined)).toBe("Erro inesperado");
      expect(getErrorMessage(123)).toBe("Erro inesperado");
    });
  });

  describe("parsePrecoBrasileiro", () => {
    it("accepts comma or dot with at most two decimal places", () => {
      expect(parsePrecoBrasileiro("12,34")).toBe(12.34);
      expect(parsePrecoBrasileiro("12.3")).toBe(12.3);
      expect(parsePrecoBrasileiro("12")).toBe(12);
    });

    it("rejects partial, ambiguous and out-of-range values", () => {
      expect(parsePrecoBrasileiro("12,34abc")).toBeNull();
      expect(parsePrecoBrasileiro("12.345")).toBeNull();
      expect(parsePrecoBrasileiro("1.234,56")).toBeNull();
      expect(parsePrecoBrasileiro("0")).toBeNull();
      expect(parsePrecoBrasileiro("100000000")).toBeNull();
    });
  });
});
