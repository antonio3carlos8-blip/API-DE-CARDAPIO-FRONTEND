"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio, Produto } from "@/app/types";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGroup } from "@/components/CategoryGroup";
import { OrderCart, CartItem } from "@/components/OrderCart";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetalhesCardapioPage() {
  const { id } = useParams();
  const router = useRouter();

  const [cardapio, setCardapio] = useState<Cardapio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Estado que guarda os itens do carrinho
  const [cartItens, setCartItens] = useState<CartItem[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchCardapio() {
      try {
        const data = await api.getCardapioById(id as string);
        setCardapio(data);
      } catch (error) {
        console.error("Erro ao carregar", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchCardapio();
  }, [id]);

  // Função para adicionar produto ao carrinho
  const handleAddToCart = (produto: Produto) => {
    setCartItens((prev) => {
      const existe = prev.find((item) => item.produto.id === produto.id);
      if (existe) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  // Função para remover do carrinho
  const handleRemoveFromCart = (produtoId: string) => {
    setCartItens((prev) =>
      prev.filter((item) => item.produto.id !== produtoId),
    );
  };

  // Simulação de envio do pedido
  const handleFinalizarPedido = () => {
    alert("Pedido enviado com sucesso para a cozinha!");
    setCartItens([]); // Limpa o carrinho
  };

  const categoriasFiltradas =
    cardapio?.categorias
      ?.map((categoria) => ({
        ...categoria,
        produtos:
          categoria.produtos?.filter((p) =>
            p.nome.toLowerCase().includes(debouncedSearch.toLowerCase()),
          ) || [],
      }))
      .filter((categoria) => categoria.produtos.length > 0) || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-blue-600 hover:underline mb-2 font-medium"
            >
              &larr; Voltar
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-48" /> : cardapio?.nome}
            </h1>
          </div>
          <div className="w-full md:w-80">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-12">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : categoriasFiltradas.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          categoriasFiltradas.map((categoria) => (
            <CategoryGroup
              key={categoria.id}
              titulo={categoria.nome}
              produtos={categoria.produtos || []}
              onAddProduto={handleAddToCart} // Passando a função para os cards
            />
          ))
        )}
      </main>

      {/* Renderiza o carrinho passando os estados e funções */}
      <div className="fixed bottom-6 right-6 z-50">
        <OrderCart
          itens={cartItens}
          onRemover={handleRemoveFromCart}
          onFinalizar={handleFinalizarPedido}
        />
      </div>
    </div>
  );
}
