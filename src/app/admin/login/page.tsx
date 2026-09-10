"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginAdminPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const entrar = async (event: FormEvent) => {
    event.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.erro || "Não foi possível entrar");

      const retorno = new URLSearchParams(window.location.search).get("retorno");
      router.replace(retorno?.startsWith("/admin") ? retorno : "/admin");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível entrar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Acesso administrativo</h1>
        <p className="mt-2 text-sm text-gray-500">Entre para gerenciar cardápios e pedidos.</p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            Ambiente local: usuário <strong>admin</strong> e senha <strong>admin</strong>.
          </p>
        )}
        {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="usuario" className="text-sm font-medium">Usuário</label>
            <Input id="usuario" autoComplete="username" value={usuario} onChange={(event) => setUsuario(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="senha" className="text-sm font-medium">Senha</label>
            <Input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </main>
  );
}
