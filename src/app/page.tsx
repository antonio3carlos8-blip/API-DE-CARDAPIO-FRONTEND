"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGroup } from "@/components/CategoryGroup";
import { OrderCart } from "@/components/OrderCart";
import { Skeleton } from "@/components/ui/skeleton";

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagemUrl?: string;
  disponivel: boolean;
  categoria: Categoria;
}

const MOCK_PRODUTOS: Produto[] = [
  {
    id: "1",
    nome: "X-Bacon",
    descricao: "Pão, hambúrguer 150g, queijo cheddar, bacon e cebola caramelizada.",
    preco: 29.9,
    disponivel: true,
    categoria: { id: "c1", nome: "Hambúrgueres" }
  },
  {
    id: "2",
    nome: "Smash Burger",
    descricao: "Pão brioche, 2 smash burgers de 90g, duplo queijo prato e molho especial.",
    preco: 25.0,
    disponivel: true,
    categoria: { id: "c1", nome: "Hambúrgueres" }
  },
  {
    id: "3",
    nome: "Coca-Cola Lata",
    descricao: "Refrigerante 350ml gelado.",
    preco: 6.0,
    disponivel: false,
    categoria: { id: "c2", nome: "Bebidas" }
  },
  {
    id: "4",
    nome: "Suco de Laranja",
    descricao: "Suco natural 400ml.",
    preco: 9.0,
    disponivel: true,
    categoria: { id: "c2", nome: "Bebidas" }
  },
  {
    id: "5",
    nome: "Batata Frita Rústica",
    descricao: "Porção individual com maionese da casa.",
    preco: 14.9,
    disponivel: true,
    categoria: { id: "c3", nome: "Porções" }
  }
];

export default function CardapioPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch) {
      const filtrados = MOCK_PRODUTOS.filter(p => 
        p.nome.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setProdutos(filtrados);
    } else {
      setProdutos(MOCK_PRODUTOS);
    }
    setIsLoading(false);
  }, [debouncedSearch]);

  const produtosAgrupados = produtos.reduce((acc, produto) => {
    const nomeCategoria = produto.categoria?.nome || "Outros";
    if (!acc[nomeCategoria]) {
      acc[nomeCategoria] = [];
    }
    acc[nomeCategoria].push(produto);
    return acc;
  }, {} as Record<string, Produto[]>);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Cardápio Digital
            </h1>
            <p className="text-sm text-gray-500">
              Faça seu pedido com praticidade.
            </p>
          </div>
          
          <div className="w-full md:w-80">
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-12">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-40 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        ) : Object.keys(produtosAgrupados).length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Nenhum produto encontrado para "{searchTerm}".
          </div>
        ) : (
          Object.entries(produtosAgrupados).map(([categoria, itens]) => (
            <CategoryGroup 
              key={categoria} 
              titulo={categoria} 
              produtos={itens} 
            />
          ))
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <OrderCart />
      </div>
    </div>
  );
}