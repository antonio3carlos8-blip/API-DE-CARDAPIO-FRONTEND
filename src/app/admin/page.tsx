"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Home } from "lucide-react";

export default function AdminCardapiosPage() {
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaImagemUrl, setNovaImagemUrl] = useState("");
  const router = useRouter();

  const carregarCardapios = async () => {
    try {
      const dados = await api.getCardapios();
      setCardapios(dados);
    } catch (error) {
      console.error("Erro ao carregar cardápios", error);
    }
  };

  useEffect(() => {
    carregarCardapios();
  }, []);

  const handleCriarCardapio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.criarCardapio({
        nome: novoNome,
        descricao: novaDescricao,
        ativo: true,
      });
      setNovoNome("");
      setNovaDescricao("");
      setNovaImagemUrl("");
      carregarCardapios();
    } catch (error) {
      console.error("Erro ao criar cardápio", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Cardápios</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Ver Site Público
        </Button>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Novo Cardápio</h2>
        <form onSubmit={handleCriarCardapio} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Nome</label>
              <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Descrição</label>
              <Input value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">URL da Imagem (Opcional)</label>
              <Input 
                placeholder="https://images.unsplash.com/..." 
                value={novaImagemUrl} 
                onChange={(e) => setNovaImagemUrl(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-40">Criar Cardápio</Button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardapios.map((cardapio) => (
          <div key={cardapio.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <AspectRatio ratio={16 / 9} className="border-b">
              <img
                src={(cardapio as any).imagemUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"}
                alt={cardapio.nome}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{cardapio.nome}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cardapio.descricao}</p>
              </div>
              <Button onClick={() => router.push(`/admin/cardapio/${cardapio.id}`)}>
                Gerenciar Itens
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}