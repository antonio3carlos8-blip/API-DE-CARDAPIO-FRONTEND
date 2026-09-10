"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio, Produto } from "@/app/types";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGroup } from "@/components/CategoryGroup";
import { OrderCart, CartItem } from "@/components/OrderCart";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils";

export default function DetalhesCardapioPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();

  const [cardapio, setCardapio] = useState<Cardapio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Estado que guarda os itens do carrinho
  const [cartItens, setCartItens] = useState<CartItem[]>([]);
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [mensagemPedido, setMensagemPedido] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCardapio = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getCardapioById(id);
      setCardapio(data);
    } catch (error: unknown) {
      console.error("Erro ao carregar", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    api.getCardapioById(id)
      .then((data) => {
        if (!ignore) {
          setCardapio(data);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Erro ao carregar", error);
          setErrorMessage(getErrorMessage(error));
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  // Função para adicionar produto ao carrinho
  const handleAddToCart = (produto: Produto) => {
    if (produto.disponivel === false) return;
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

  const handleFinalizarPedido = async (clienteNome: string, observacao: string) => {
    if (cartItens.length === 0) return;
    setEnviandoPedido(true);
    setMensagemPedido(null);
    try {
      const pedido = await api.criarPedido({
        cardapioId: id,
        chaveIdempotencia: crypto.randomUUID(),
        clienteNome,
        observacao: observacao || undefined,
        itens: cartItens.map((item) => ({
          produtoId: item.produto.id,
          quantidade: item.quantidade,
        })),
      });
      setCartItens([]);
      setMensagemPedido({
        tipo: "sucesso",
        texto: `Pedido ${pedido.id.slice(0, 8)} recebido. Total confirmado: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pedido.total)}.`,
      });
    } catch (error) {
      setMensagemPedido({ tipo: "erro", texto: getErrorMessage(error) });
    } finally {
      setEnviandoPedido(false);
    }
  };

  const termo = debouncedSearch.trim().toLowerCase();
  const categoriasFiltradas =
    cardapio?.categorias
      ?.map((categoria) => ({
        ...categoria,
        produtos:
          categoria.produtos?.filter((p) => {
            if (!termo) return true;
            const nomeMatch = p.nome.toLowerCase().includes(termo);
            const descMatch = p.descricao ? p.descricao.toLowerCase().includes(termo) : false;
            return nomeMatch || descMatch;
          }) || [],
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
        ) : errorMessage ? (
          <div className="text-center py-20 bg-white rounded-xl border p-8 shadow-sm">
            <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
            <button
              onClick={fetchCardapio}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-50"
            >
              Tentar Novamente
            </button>
          </div>
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
          enviando={enviandoPedido}
          mensagem={mensagemPedido}
        />
      </div>
    </div>
  );
}
