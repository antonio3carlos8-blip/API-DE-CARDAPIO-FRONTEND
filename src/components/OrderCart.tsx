"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Produto } from "@/app/types";
import { useState } from "react";

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface OrderCartProps {
  itens: CartItem[];
  onRemover: (id: string) => void;
  onFinalizar: (clienteNome: string, observacao: string) => void | Promise<void>;
  enviando: boolean;
  mensagem?: { tipo: "sucesso" | "erro"; texto: string } | null;
}

const obterPreco = (produto: Produto) => {
  const preco = Number(produto.preco);
  return Number.isFinite(preco) && preco > 0 ? preco : null;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

export function OrderCart({ itens, onRemover, onFinalizar, enviando, mensagem }: OrderCartProps) {
  const [clienteNome, setClienteNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const precosValidos = itens.every((item) => obterPreco(item.produto) !== null);
  const total = itens.reduce(
    (acc, item) => acc + (obterPreco(item.produto) ?? 0) * item.quantidade,
    0,
  );
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <Sheet>
      <SheetTrigger
        aria-label={`Abrir carrinho com ${totalItens} ${totalItens === 1 ? "item" : "itens"}`}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-xl transition-colors hover:bg-blue-700"
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {totalItens > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
            {totalItens}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="h-[100dvh] !w-full max-w-full gap-0 overflow-hidden bg-white p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 px-4 pb-0 pt-4 sm:px-6">
          <SheetTitle className="border-b pb-4 pr-10 text-2xl font-bold">
            Seu Pedido
          </SheetTitle>
        </SheetHeader>

        <div
          data-testid="order-cart-scroll-area"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-6"
        >
          <div className="flex min-h-full flex-col">
            <div
              data-testid="order-cart-items"
              className="min-h-32 grow shrink-0 basis-auto space-y-4"
            >
              {itens.length === 0 ? (
                <p className="mt-10 text-center text-gray-500">
                  Seu carrinho está vazio.
                </p>
              ) : (
                itens.map((item) => (
                  <div
                    key={item.produto.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.quantidade}x {item.produto.nome}
                      </p>
                      <p className="text-sm text-gray-500">
                        {obterPreco(item.produto) === null
                          ? "Preço indisponível"
                          : formatarMoeda(
                              obterPreco(item.produto)! * item.quantidade,
                            )}
                      </p>
                    </div>
                    <Button
                      aria-label={`Remover ${item.produto.nome}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemover(item.produto.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 shrink-0 border-t pt-4">
              <div className="mb-4 space-y-3">
                <div>
                  <label htmlFor="cliente-nome" className="text-sm font-medium">
                    Seu nome
                  </label>
                  <Input
                    id="cliente-nome"
                    value={clienteNome}
                    onChange={(event) => setClienteNome(event.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="pedido-observacao"
                    className="text-sm font-medium"
                  >
                    Observação (opcional)
                  </label>
                  <textarea
                    id="pedido-observacao"
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                    maxLength={500}
                    className="mt-1 min-h-20 w-full rounded-lg border p-2 text-sm"
                  />
                </div>
              </div>
              <div className="mb-6 flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{formatarMoeda(total)}</span>
              </div>
              {mensagem && (
                <p
                  role={mensagem.tipo === "erro" ? "alert" : "status"}
                  className={`mb-3 text-sm ${mensagem.tipo === "erro" ? "text-red-700" : "text-green-700"}`}
                >
                  {mensagem.texto}
                </p>
              )}
              {!precosValidos && (
                <p role="alert" className="mb-3 text-sm text-red-700">
                  O pedido contém um item com preço inválido. Atualize a página antes de
                  continuar.
                </p>
              )}
              <Button
                className="h-12 w-full text-lg"
                onClick={() => onFinalizar(clienteNome.trim(), observacao.trim())}
                disabled={
                  itens.length === 0 ||
                  !precosValidos ||
                  clienteNome.trim().length < 2 ||
                  enviando
                }
              >
                {enviando ? "Enviando..." : "Enviar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
