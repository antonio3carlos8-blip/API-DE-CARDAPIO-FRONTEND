"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/services/api";
import { Cardapio, Categoria, Produto } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import { getErrorMessage, parsePrecoBrasileiro } from "@/lib/utils";

interface ProdutoPayload {
  nome: string;
  preco: number;
  disponivel: boolean;
  categoriaId: string;
  descricao?: string | null;
  imagemUrl?: string | null;
}

export default function GerenciarCardapioPage() {
  const params = useParams();
  const cardapioId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();

  const [dadosCardapio, setDadosCardapio] = useState<Cardapio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [novaCategoria, setNovaCategoria] = useState("");

  // Estados do Produto
  const [produtoEditandoId, setProdutoEditandoId] = useState<string | null>(null);
  const [novoProdutoNome, setNovoProdutoNome] = useState("");
  const [novoProdutoPreco, setNovoProdutoPreco] = useState("");
  const [novoProdutoDescricao, setNovoProdutoDescricao] = useState("");
  const [novoProdutoImagemUrl, setNovoProdutoImagemUrl] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [novoProdutoDisponivel, setNovoProdutoDisponivel] = useState(true);

  const carregarDadosCompleto = async () => {
    if (!cardapioId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await api.getCardapioAdminById(cardapioId);
      setDadosCardapio(data);
    } catch (error: unknown) {
      console.error("Erro ao carregar dados", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!cardapioId) return;
    let ignore = false;
    api.getCardapioAdminById(cardapioId)
      .then((data) => {
        if (!ignore) {
          setDadosCardapio(data);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Erro ao carregar dados", error);
          setErrorMessage(getErrorMessage(error));
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [cardapioId]);

  // ==========================================
  // FUNÇÕES DE CATEGORIA
  // ==========================================
  const handleCriarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;
    try {
      await api.criarCategoria({ nome: novaCategoria.trim(), cardapioId: cardapioId as string });
      setNovaCategoria("");
      await carregarDadosCompleto();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleEditarCategoria = async (cat: Categoria) => {
    const novoNome = prompt(`Renomear categoria "${cat.nome}" para:`, cat.nome);
    if (!novoNome || !novoNome.trim() || novoNome.trim() === cat.nome) return;
    try {
      await api.atualizarCategoria(cat.id, { nome: novoNome.trim() });
      await carregarDadosCompleto();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const handleDeletarCategoria = async (id: string, quantidadeProdutos: number) => {
    if (quantidadeProdutos > 0) {
      alert("Você precisa excluir todos os produtos desta categoria antes de apagá-la.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await api.deletarCategoria(id);
      await carregarDadosCompleto();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  // ==========================================
  // FUNÇÕES DE PRODUTO
  // ==========================================
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoriaSelecionada) {
      alert("Selecione uma categoria para o produto.");
      return;
    }

    const precoNum = parsePrecoBrasileiro(novoProdutoPreco);
    if (precoNum === null) {
      alert("Por favor, insira um preço válido maior que zero (ex: 19.90 ou 19,90).");
      return;
    }

    // 1. Monta o payload base com todos os campos necessários
    const payload: ProdutoPayload = {
      nome: novoProdutoNome.trim(),
      preco: precoNum,
      disponivel: novoProdutoDisponivel,
      categoriaId: categoriaSelecionada,
      descricao: novoProdutoDescricao.trim() !== "" ? novoProdutoDescricao.trim() : null,
      imagemUrl: novoProdutoImagemUrl.trim() !== "" ? novoProdutoImagemUrl.trim() : null,
    };

    try {
      if (produtoEditandoId) {
        // Modo Edição (PUT)
        await api.atualizarProduto(produtoEditandoId, payload);
        setProdutoEditandoId(null);
      } else {
        // Modo Criação (POST)
        await api.criarProduto({
          ...payload,
          descricao: payload.descricao || undefined,
          imagemUrl: payload.imagemUrl || undefined,
        });
      }

      // Limpa o formulário se deu tudo certo
      setNovoProdutoNome("");
      setNovoProdutoPreco("");
      setNovoProdutoDescricao("");
      setNovoProdutoImagemUrl("");
      setCategoriaSelecionada("");
      setNovoProdutoDisponivel(true);
      await carregarDadosCompleto();

    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const iniciarEdicaoProduto = (produto: Produto) => {
    setProdutoEditandoId(produto.id);
    setNovoProdutoNome(produto.nome);
    setNovoProdutoPreco(produto.preco != null ? String(produto.preco) : "");
    setNovoProdutoDescricao(produto.descricao || "");
    setNovoProdutoImagemUrl(produto.imagemUrl || "");
    setCategoriaSelecionada(produto.categoriaId);
    setNovoProdutoDisponivel(produto.disponivel !== false);
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
    try {
      await api.deletarProduto(id);
      if (produtoEditandoId === id) {
        cancelarEdicao();
      }
      await carregarDadosCompleto();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  if (isLoading) return <div role="status" className="p-8">Carregando...</div>;
  if (errorMessage) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p role="alert" className="mb-4 text-red-700">{errorMessage}</p>
        <Button onClick={carregarDadosCompleto}>Tentar novamente</Button>
      </div>
    );
  }
  if (!dadosCardapio) return <div className="p-8">Cardápio não encontrado.</div>;

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
              <label htmlFor="nova-categoria" className="sr-only">Nome da nova categoria</label>
              <Input id="nova-categoria" placeholder="Ex: Bebidas" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} required />
              <Button type="submit">Adicionar</Button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              {produtoEditandoId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label htmlFor="produto-categoria" className="text-sm font-medium">Categoria</label>
                <select
                  id="produto-categoria"
                  className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm"
                  value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)} required
                >
                  <option value="">Selecione...</option>
                  {dadosCardapio?.categorias?.map((cat: Categoria) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="produto-nome" className="text-sm font-medium">Nome</label>
                <Input id="produto-nome" value={novoProdutoNome} onChange={(e) => setNovoProdutoNome(e.target.value)} required />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="produto-preco" className="text-sm font-medium">Preço (R$)</label>
                  <Input id="produto-preco" type="text" inputMode="decimal" placeholder="0,00" value={novoProdutoPreco} onChange={(e) => setNovoProdutoPreco(e.target.value)} required />
                </div>

                {/* NOVO CAMPO DE DISPONIBILIDADE */}
                <div className="flex-1">
                  <label htmlFor="produto-status" className="text-sm font-medium">Status</label>
                  <select
                    id="produto-status"
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
                <label htmlFor="produto-imagem" className="text-sm font-medium">Link da Imagem</label>
                <Input id="produto-imagem" placeholder="https://unsplash.com/..." value={novoProdutoImagemUrl} onChange={(e) => setNovoProdutoImagemUrl(e.target.value)} />
              </div>

              <div>
                <label htmlFor="produto-descricao" className="text-sm font-medium">Descrição</label>
                <Input id="produto-descricao" value={novoProdutoDescricao} onChange={(e) => setNovoProdutoDescricao(e.target.value)} />
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
          {dadosCardapio?.categorias?.map((cat: Categoria) => (
            <div key={cat.id} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">

              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-blue-600">{cat.nome}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8"
                    onClick={() => handleEditarCategoria(cat)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Renomear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                    onClick={() => handleDeletarCategoria(cat.id, cat.produtos?.length || 0)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>

              <div className="divide-y">
                {cat.produtos?.length === 0 ? (
                   <p className="text-sm text-gray-400 italic py-2">Nenhum produto nesta categoria.</p>
                ) : (
                  cat.produtos?.map((prod: Produto) => (
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
