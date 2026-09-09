"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export default function GerenciarCardapioPage() {
  const { id: cardapioId } = useParams();
  const router = useRouter();
  
  const [dadosCardapio, setDadosCardapio] = useState<any>(null);
  const [novaCategoria, setNovaCategoria] = useState("");
  
  // Estados do Produto
  const [produtoEditandoId, setProdutoEditandoId] = useState<string | null>(null);
  const [novoProdutoNome, setNovoProdutoNome] = useState("");
  const [novoProdutoPreco, setNovoProdutoPreco] = useState("");
  const [novoProdutoDescricao, setNovoProdutoDescricao] = useState("");
  const [novoProdutoImagemUrl, setNovoProdutoImagemUrl] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [novoProdutoDisponivel, setNovoProdutoDisponivel] = useState(true); // NOVO ESTADO

  const carregarDadosCompleto = async () => {
    try {
      const data = await api.getCardapioById(cardapioId as string);
      setDadosCardapio(data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  useEffect(() => {
    if (cardapioId) carregarDadosCompleto();
  }, [cardapioId]);

  // ==========================================
  // FUNÇÕES DE CATEGORIA
  // ==========================================
  const handleCriarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.criarCategoria({ nome: novaCategoria, cardapioId: cardapioId as string });
    setNovaCategoria("");
    carregarDadosCompleto();
  };

  const handleDeletarCategoria = async (id: string, quantidadeProdutos: number) => {
    if (quantidadeProdutos > 0) {
      alert("Você precisa excluir todos os produtos desta categoria antes de apagá-la.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await api.deletarCategoria(id);
      carregarDadosCompleto();
    } catch (error) {
      alert("Erro ao excluir a categoria.");
    }
  };

  // ==========================================
  // FUNÇÕES DE PRODUTO
  // ==========================================
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Monta o payload base apenas com os dados obrigatórios
    const payload: any = {
      nome: novoProdutoNome,
      preco: parseFloat(novoProdutoPreco),
      disponivel: novoProdutoDisponivel,
    };

    // 2. Só anexa a descrição e a imagem se elas não estiverem em branco
    if (novoProdutoDescricao.trim() !== "") {
      payload.descricao = novoProdutoDescricao;
    }
    
    if (novoProdutoImagemUrl.trim() !== "") {
      payload.imagemUrl = novoProdutoImagemUrl;
    }

    try {
      if (produtoEditandoId) {
        // Modo Edição (PUT)
        await api.atualizarProduto(produtoEditandoId, payload);
        setProdutoEditandoId(null);
      } else {
        // Modo Criação (POST)
        await api.criarProduto({
          ...payload,
          categoriaId: categoriaSelecionada,
        });
      }

      // Limpa o formulário se deu tudo certo
      setNovoProdutoNome("");
      setNovoProdutoPreco("");
      setNovoProdutoDescricao("");
      setNovoProdutoImagemUrl("");
      setCategoriaSelecionada("");
      setNovoProdutoDisponivel(true);
      carregarDadosCompleto();
      
    } catch (error: any) {
      // Se o back-end reclamar, mostra um aviso amigável na tela
      alert(error.message || "Erro ao salvar o produto. Verifique se o link da imagem é válido.");
    }
  };

  const iniciarEdicaoProduto = (produto: any) => {
    setProdutoEditandoId(produto.id);
    setNovoProdutoNome(produto.nome);
    setNovoProdutoPreco(produto.preco);
    setNovoProdutoDescricao(produto.descricao || "");
    setNovoProdutoImagemUrl(produto.imagemUrl || "");
    setCategoriaSelecionada(produto.categoriaId);
    setNovoProdutoDisponivel(produto.disponivel); // Puxa o status atual do banco
  };

  const cancelarEdicao = () => {
    setProdutoEditandoId(null);
    setNovoProdutoNome("");
    setNovoProdutoPreco("");
    setNovoProdutoDescricao("");
    setNovoProdutoImagemUrl("");
    setCategoriaSelecionada("");
    setNovoProdutoDisponivel(true);
  };

  const handleDeletarProduto = async (id: string) => {
    if (!confirm("Deseja excluir este produto?")) return;
    await api.deletarProduto(id);
    carregarDadosCompleto();
  };

  if (!dadosCardapio) return <div className="p-8">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 pb-24">
      <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
        &larr; Voltar para Cardápios
      </Button>
      
      <h1 className="text-3xl font-bold mb-1">Gerenciando: {dadosCardapio.nome}</h1>
      <p className="text-gray-500 mb-8">{dadosCardapio.descricao}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda (Formulários) */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Nova Categoria</h2>
            <form onSubmit={handleCriarCategoria} className="flex gap-2">
              <Input placeholder="Ex: Bebidas" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} required />
              <Button type="submit">Adicionar</Button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              {produtoEditandoId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select 
                  className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} required
                >
                  <option value="">Selecione...</option>
                  {dadosCardapio.categorias?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={novoProdutoNome} onChange={(e) => setNovoProdutoNome(e.target.value)} required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Preço (R$)</label>
                  <Input type="number" step="0.01" value={novoProdutoPreco} onChange={(e) => setNovoProdutoPreco(e.target.value)} required />
                </div>
                
                {/* NOVO CAMPO DE DISPONIBILIDADE */}
                <div className="flex-1">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                    value={novoProdutoDisponivel ? "true" : "false"} 
                    onChange={(e) => setNovoProdutoDisponivel(e.target.value === "true")}
                  >
                    <option value="true">Disponível</option>
                    <option value="false">Esgotado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Link da Imagem</label>
                <Input placeholder="https://unsplash.com/..." value={novoProdutoImagemUrl} onChange={(e) => setNovoProdutoImagemUrl(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input value={novoProdutoDescricao} onChange={(e) => setNovoProdutoDescricao(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {produtoEditandoId ? "Salvar" : "Cadastrar"}
                </Button>
                {produtoEditandoId && (
                  <Button type="button" variant="outline" onClick={cancelarEdicao}>Cancelar</Button>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* Coluna da Direita (Listagem) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Categorias e Produtos</h2>
          {dadosCardapio.categorias?.map((cat: any) => (
            <div key={cat.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-blue-600">{cat.nome}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                  onClick={() => handleDeletarCategoria(cat.id, cat.produtos?.length || 0)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>

              <div className="divide-y">
                {cat.produtos?.length === 0 ? (
                   <p className="text-sm text-gray-400 italic py-2">Nenhum produto nesta categoria.</p>
                ) : (
                  cat.produtos?.map((prod: any) => (
                    <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {prod.imagemUrl && (
                          <img src={prod.imagemUrl} alt={prod.nome} className="w-12 h-12 rounded-md object-cover" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{prod.nome}</p>
                            {/* SELO DE ESGOTADO NA LISTAGEM */}
                            {!prod.disponivel && (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                Esgotado
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-green-600 mt-1">R$ {Number(prod.preco).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => iniciarEdicaoProduto(prod)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletarProduto(prod.id)}>Excluir</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}