"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

import { getErrorMessage } from "@/lib/utils";

export default function HomeClientePage() {
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const carregarCardapios = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const dados = await api.getCardapios();
      setCardapios(dados.filter((c) => c.ativo !== false));
    } catch (error: unknown) {
      console.error("Erro ao carregar cardápios:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.getCardapios()
      .then((dados) => {
        if (!ignore) {
          setCardapios(dados.filter((c) => c.ativo !== false));
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Erro ao carregar cardápios:", error);
          setErrorMessage(getErrorMessage(error));
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b py-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Nossos Cardápios
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Escolha um cardápio abaixo para explorar as delícias disponíveis.
            </p>
          </div>
          {/* Botão de Acesso ao Admin */}
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Painel Admin
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : errorMessage ? (
          <div className="text-center py-20 bg-white rounded-2xl border p-8 shadow-sm">
            <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
            <Button onClick={carregarCardapios} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : cardapios.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Nenhum cardápio disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cardapios.map((cardapio) => (
              <button
                type="button"
                key={cardapio.id} 
                onClick={() => router.push(`/cardapio/${cardapio.id}`)}
                className="group text-left cursor-pointer bg-white rounded-2xl border shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 transition-all overflow-hidden flex flex-col"
              >
                <div className="overflow-hidden border-b aspect-video">
                  <img
                    src={cardapio.imagemUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"}
                    alt={cardapio.nome}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cardapio.nome}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {cardapio.descricao || "Explore nossos produtos exclusivos."}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
