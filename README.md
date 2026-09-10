# Cardápio Digital — Frontend

Frontend Next.js 16/React 19 do Cardápio Digital. A aplicação oferece catálogo público, busca, carrinho com pedido real e painel autenticado para catálogo e fila da cozinha.

## Funcionalidades

- Lista somente cardápios ativos e bloqueia acesso direto a rascunhos.
- Produtos agrupados por categoria, busca com debounce e indicação de indisponibilidade.
- Carrinho responsivo com rolagem e área segura em telas curtas, nome/observação do cliente e confirmação somente depois da persistência do pedido.
- Login administrativo em cookie `HttpOnly`.
- CRUD de cardápios, categorias e produtos.
- Fila de pedidos com atualização controlada de status.
- Estados de carregamento, erro e tentativa novamente.
- Labels, nomes acessíveis e navegação de cards por teclado.
- BFF same-origin: o navegador nunca precisa conhecer a URL privada nem o token do backend.

## Rodar localmente

Requer Node.js 24+ e o backend em `http://127.0.0.1:3001`.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Com o backend em modo local, a tela `/admin/login` mostra as credenciais exclusivamente demonstrativas. Elas não existem no modo de produção.

## Scripts

| Comando | Resultado |
|---|---|
| `npm run dev` | Next com hot reload na porta 3000 |
| `npm test` | Suíte Vitest/Testing Library |
| `npm run test:coverage` | Suíte com cobertura do código inteiro e limiar de regressão |
| `npm run lint` | ESLint com regras do React 19/Next 16 |
| `npm run build` | Build de produção e typecheck |
| `npm start` | Serve um build concluído |

## Integração segura

O cliente chama apenas `/api/backend/...`. Route Handlers do Next encaminham essas chamadas para a variável privada `API_URL`, que deve terminar em `/api`:

```env
API_URL="https://seu-backend.vercel.app/api"
```

Não renomeie essa variável para `NEXT_PUBLIC_API_URL`: qualquer valor com prefixo `NEXT_PUBLIC_` é incorporado ao bundle do navegador.

O login chama `/api/auth/login`; o Route Handler recebe o JWT do backend e o grava em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção. A camada `proxy.ts` faz apenas o redirecionamento otimista; a autorização efetiva permanece no backend.

## Deploy

Siga o checklist único em [DEPLOY_VERCEL.md](https://github.com/antonio3carlos8-blip/API-DE-CARDAPIO/blob/dev/DEPLOY_VERCEL.md). O frontend precisa somente de `API_URL`; nenhum segredo administrativo deve ser cadastrado neste projeto.
