"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "@/app/services/api";
import { Pedido, PedidoStatus } from "@/app/types";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

const statusDisponiveis: Array<{ valor: PedidoStatus; rotulo: string }> = [
  { valor: "RECEBIDO", rotulo: "Recebido" },
  { valor: "EM_PREPARO", rotulo: "Em preparo" },
  { valor: "PRONTO", rotulo: "Pronto" },
  { valor: "CANCELADO", rotulo: "Cancelado" },
];

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const router = useRouter();

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPedidos(await api.getPedidos());
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    api.getPedidos()
      .then((dados) => {
        if (!ignore) {
          setPedidos(dados);
          setCarregando(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setErro(getErrorMessage(error));
          setCarregando(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const alterarStatus = async (pedido: Pedido, status: PedidoStatus) => {
    setAtualizando(pedido.id);
    setErro(null);
    try {
      const atualizado = await api.atualizarStatusPedido(pedido.id, status);
      setPedidos((atuais) =>
        atuais.map((item) => (item.id === atualizado.id ? atualizado : item)),
      );
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setAtualizando(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe e atualize os pedidos recebidos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")} className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Cardápios
          </Button>
          <Button variant="outline" onClick={carregar} disabled={carregando} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Atualizar
          </Button>
          <AdminLogoutButton />
        </div>
      </header>

      {erro && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{erro}</p>}
      {carregando ? (
        <p role="status">Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="rounded-xl border bg-white p-10 text-center text-gray-500">Nenhum pedido recebido.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <article key={pedido.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-bold">{pedido.clienteNome}</h2>
                  <p className="text-xs text-gray-500">#{pedido.id.slice(0, 8)} · {new Date(pedido.createdAt).toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <label htmlFor={`status-${pedido.id}`} className="sr-only">Status do pedido de {pedido.clienteNome}</label>
                  <select
                    id={`status-${pedido.id}`}
                    value={pedido.status}
                    disabled={atualizando === pedido.id}
                    onChange={(event) => void alterarStatus(pedido, event.target.value as PedidoStatus)}
                    className="h-10 rounded-md border bg-white px-3 text-sm"
                  >
                    {statusDisponiveis.map((status) => <option key={status.valor} value={status.valor}>{status.rotulo}</option>)}
                  </select>
                </div>
              </div>
              <ul className="my-4 space-y-1 border-y py-3 text-sm">
                {pedido.itens.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>{item.quantidade}× {item.nomeProduto}</span>
                    <span>{moeda.format(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              {pedido.observacao && <p className="text-sm text-gray-600"><strong>Observação:</strong> {pedido.observacao}</p>}
              <p className="mt-3 text-right text-lg font-bold">Total: {moeda.format(pedido.total)}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
