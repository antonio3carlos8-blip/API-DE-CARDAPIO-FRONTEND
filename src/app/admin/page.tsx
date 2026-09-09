"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Interface espelhando o banco de dados
interface Produto {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
  categoriaId: string;
}

export default function AdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para o formulário de criação (POST)
  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaCategoriaId, setNovaCategoriaId] = useState("");
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");

  const API_URL = "http://localhost:3000/api/produtos";

  const fetchProdutos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const data = await res.json();
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const handleCriarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome,
          preco: parseFloat(novoPreco),
          disponivel: true,
          categoriaId: novaCategoriaId, // Precisa ser um UUID válido de categoria existente
        }),
      });

      if (res.ok) {
        alert("Produto criado com sucesso!");
        setNovoNome("");
        setNovoPreco("");
        setNovaCategoriaId("");
        fetchProdutos(); // Atualiza a tabela na hora
      } else {
        const error = await res.json();
        alert(`Erro: ${error.erro}`);
      }
    } catch (error) {
      console.error("Erro ao criar produto", error);
    }
  };

  const handleDeletarProduto = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove da tela sem precisar recarregar a página toda
        setProdutos(produtos.filter((p) => p.id !== id));
      } else {
        alert("Erro ao excluir o produto.");
      }
    } catch (error) {
      console.error("Erro ao deletar produto", error);
    }
  };

  const handleCriarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novaCategoriaNome,
          categoriaID: novaCategoriaId,
        }),
      });

      if (res.ok) {
        alert("Categoria criada com sucesso!");
        setNovaCategoriaNome("");
        setNovaCategoriaId("");
        fetchCategorias(); // Atualiza a tabela na hora
      } else {
        const error = await res.json();
        alert(`Erro: ${error.erro}`);
      }
    } catch (error) {
      console.error("Erro ao criar categoria", error);
    }
  };

  const handleDeletarCategoria = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const res = await fetch(`${API_URL}/categorias/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Atualiza a lista de categorias
        fetchCategorias();
      } else {
        alert("Erro ao excluir a categoria.");
      }
    } catch (error) {
      console.error("Erro ao deletar categoria", error);
    }
  };

  const handleToggleDisponibilidade = async (
    id: string,
    estadoAtual: boolean,
  ) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponivel: !estadoAtual }),
      });

      if (res.ok) {
        fetchProdutos(); // Atualiza a lista
      }
    } catch (error) {
      console.error("Erro ao atualizar", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Gestão do Cardápio
      </h1>

      {/* Formulário de Criação de Produtos (Focado em regras de negócio) */}
      <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Produto</h2>
        <form onSubmit={handleCriarProduto} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Nome do Produto</label>
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
          </div>
          <div className="w-32">
            <label className="text-sm font-medium">Preço (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">
              ID da Categoria (UUID)
            </label>
            <Input
              value={novaCategoriaId}
              onChange={(e) => setNovaCategoriaId(e.target.value)}
              required
              placeholder="Ex: b0000000-..."
            />
          </div>
          <Button type="submit">Salvar</Button>
        </form>
      </section>

      {/* Formulário de Criação de Categorias (Focado em regras de negócio) */}
      <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h2>
        <form onSubmit={handleCriarCategoria} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Nome da Categoria</label>
            <Input
              value={novaCategoriaNome}
              onChange={(e) => setNovaCategoriaNome(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Salvar</Button>
        </form>
      </section>

      {/* Listagem de Dados / Tabela de Produtos */}
      <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Produto</th>
              <th className="p-4 font-semibold text-gray-600">Preço</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Carregando dados...
                </td>
              </tr>
            ) : produtos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr
                  key={produto.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">{produto.nome}</td>
                  <td className="p-4">R$ {produto.preco}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${produto.disponivel ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {produto.disponivel ? "Ativo" : "Esgotado"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleDisponibilidade(
                          produto.id,
                          produto.disponivel,
                        )
                      }
                    >
                      {produto.disponivel ? "Pausar" : "Ativar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletarProduto(produto.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Listagem de Dados / Tabela de Categorias */}
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden mt-8">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Categoria</th>
                <th className="p-4 font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    Carregando dados...
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr
                    key={categoria.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">{categoria.nome}</td>
                    <td className="p-4 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletarCategoria(categoria.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </section>
    </div>
  );
}
