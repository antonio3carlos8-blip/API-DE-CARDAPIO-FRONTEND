"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ClipboardList, Home, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default function AdminCardapiosPage() {
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaImagemUrl, setNovaImagemUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const router = useRouter();

  const carregarCardapios = async () => {
    try {
      const dados = await api.getCardapiosAdmin();
      setCardapios(dados);
    } catch (error: unknown) {
      console.error("Erro ao carregar cardápios", error);
      setMensagem({ tipo: "erro", texto: getErrorMessage(error) });
    }
  };

  useEffect(() => {
    let ignore = false;
    api.getCardapiosAdmin()
      .then((dados) => {
        if (!ignore) setCardapios(dados);
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Erro ao carregar cardápios", error);
          setMensagem({ tipo: "erro", texto: getErrorMessage(error) });
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleCriarCardapio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensagem(null);
    try {
      await api.criarCardapio({
        nome: novoNome.trim(),
        descricao: novaDescricao.trim() || undefined,
        imagemUrl: novaImagemUrl.trim() || undefined,
        ativo: true,
      });
      setNovoNome("");
      setNovaDescricao("");
      setNovaImagemUrl("");
      setMensagem({ tipo: "sucesso", texto: "Cardápio criado com sucesso!" });
      await carregarCardapios();
    } catch (error: unknown) {
      console.error("Erro ao criar cardápio", error);
      setMensagem({ tipo: "erro", texto: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAtivo = async (cardapio: Cardapio) => {
    try {
      const novoStatus = cardapio.ativo === false;
      await api.atualizarCardapio(cardapio.id, { ativo: novoStatus });
      setMensagem({
        tipo: "sucesso",
        texto: `Cardápio "${cardapio.nome}" ${novoStatus ? "ativado" : "desativado"} com sucesso!`,
      });
      await carregarCardapios();
    } catch (error: unknown) {
      setMensagem({ tipo: "erro", texto: getErrorMessage(error) });
    }
  };

  const handleExcluirCardapio = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cardápio "${nome}"?`)) return;
    try {
      await api.deletarCardapio(id);
      setMensagem({ tipo: "sucesso", texto: "Cardápio excluído com sucesso!" });
      await carregarCardapios();
    } catch (error: unknown) {
      setMensagem({ tipo: "erro", texto: getErrorMessage(error) });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Cardápios</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os cardápios disponíveis no sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/pedidos")} className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" aria-hidden="true" /> Pedidos
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
            <Home className="w-4 h-4" aria-hidden="true" /> Ver Site Público
          </Button>
          <AdminLogoutButton />
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${mensagem.tipo === "sucesso" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {mensagem.texto}
        </div>
      )}

      <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Novo Cardápio</h2>
        <form onSubmit={handleCriarCardapio} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="novo-cardapio-nome" className="text-sm font-medium">Nome</label>
              <Input
                id="novo-cardapio-nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Almoço Executivo"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="novo-cardapio-descricao" className="text-sm font-medium">Descrição</label>
              <Input
                id="novo-cardapio-descricao"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Ex: Pratos servidos das 11h às 15h"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="novo-cardapio-imagem" className="text-sm font-medium">URL da Imagem (Opcional)</label>
              <Input
                id="novo-cardapio-imagem"
                placeholder="https://images.unsplash.com/..."
                value={novaImagemUrl}
                onChange={(e) => setNovaImagemUrl(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-44">
              {isSubmitting ? "Criando..." : "Criar Cardápio"}
            </Button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardapios.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">Nenhum cardápio cadastrado ainda.</p>
        ) : (
          cardapios.map((cardapio) => (
            <div key={cardapio.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
              <AspectRatio ratio={16 / 9} className="border-b">
                <img
                  src={cardapio.imagemUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"}
                  alt={cardapio.nome}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold">{cardapio.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cardapio.ativo !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {cardapio.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cardapio.descricao || "Sem descrição."}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => router.push(`/admin/cardapio/${cardapio.id}`)}>
                      Gerenciar Itens
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Excluir Cardápio"
                      aria-label={`Excluir cardápio ${cardapio.nome}`}
                      onClick={() => handleExcluirCardapio(cardapio.id, cardapio.nome)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-600 hover:text-gray-900"
                    onClick={() => handleToggleAtivo(cardapio)}
                  >
                    {cardapio.ativo !== false ? "Desativar Cardápio" : "Ativar Cardápio"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
