# 🍔 Cardápio Digital — Frontend

Interface web do Cardápio Digital: exibe os cardápios de restaurantes e lanchonetes, com os produtos organizados por categoria, e consome a [API de Cardápio](https://github.com/antonio3carlos8-blip/API-DE-CARDAPIO).

A aplicação é composta por duas partes: este frontend, responsável pela interface do usuário, e a API REST, responsável pelos dados e pela comunicação com o banco. O projeto será publicado em produção na Vercel.

> **Status:** início do projeto. A base (Next.js + Tailwind) está configurada e as telas ainda serão construídas.

## Funcionalidades

- [x] Estrutura do projeto (Next.js 16, App Router, TypeScript)
- [x] Tailwind CSS configurado
- [ ] Integração com a API
- [ ] Listagem do cardápio com produtos por categoria
- [ ] Pesquisa e filtro de produtos
- [ ] Tela de detalhe do produto
- [ ] Montagem do pedido e valor total
- [ ] Layout responsivo
- [ ] Deploy na Vercel

## Tecnologias

| Ferramenta | Uso |
|---|---|
| Next.js 16 | Framework React (App Router) |
| React 19 | Biblioteca de interface |
| TypeScript 5 | Tipagem estática |
| Tailwind CSS 4 | Estilização |
| ESLint 9 | Padronização do código |

## Como rodar

**Pré-requisitos:** Node.js 20+ e a API rodando (veja o README do backend).

**1. Instale as dependências**

```bash
npm install
```

**2. Suba o servidor de desenvolvimento**

```bash
npm run dev
```

A aplicação abre em `http://localhost:3000`.

> A API também usa a porta `3000` por padrão. Rodando os dois na mesma máquina, mude a porta de um deles — por exemplo, `PORT=3001` no `.env` da API, ou `npm run dev -- -p 3001` aqui no frontend.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o build de produção |
| `npm start` | Sobe o build de produção |
| `npm run lint` | Roda o ESLint |

## Integração com a API

A API expõe os recursos em `http://localhost:3000/api`:

| Recurso | Rota |
|---|---|
| Cardápios | `/api/cardapios` |
| Categorias | `/api/categorias` |
| Produtos | `/api/produtos` |

`GET /api/cardapios/:id` já devolve o cardápio completo, com as categorias e os produtos de cada uma — é a chamada que monta a tela principal. A documentação completa dos endpoints está no README da API.

A URL base ficará em uma variável de ambiente, definida no arquivo `.env.local` (não versionado):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Estrutura do projeto

```
src/
  app/
    layout.tsx       Layout raiz da aplicação
    page.tsx         Página inicial
    globals.css      Estilos globais e import do Tailwind
next.config.ts       Configuração do Next.js
postcss.config.mjs   Plugin do Tailwind para o PostCSS
eslint.config.mjs    Regras do ESLint
tsconfig.json        Configuração do TypeScript (alias `@/*` para `src/`)
```

O alias `@/` aponta para `src/`, então os imports ficam como `import Header from "@/components/Header"`.

## Observação

Os arquivos `AGENTS.md` e `CLAUDE.md` contêm instruções para assistentes de IA. O bloco dentro do `AGENTS.md` é gerado automaticamente pelo `next dev` e não deve ser editado à mão.
