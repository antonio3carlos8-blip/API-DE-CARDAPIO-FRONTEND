# 🍔 Cardápio Digital — Frontend

Interface web do Cardápio Digital. Consome a [API de Cardápio](https://github.com/antonio3carlos8-blip/API-DE-CARDAPIO) e exibe os produtos organizados por categoria, com busca por nome.

Feito em HTML, CSS e JavaScript puros — sem framework e sem dependências para instalar.

## Funcionalidades

- [x] Listagem dos produtos agrupados por categoria
- [x] Busca de produtos por nome
- [x] Preço formatado em real (R$)
- [x] Destaque visual para produtos indisponíveis
- [x] Layout responsivo
- [x] Aviso quando a API está fora do ar
- [ ] Montagem de pedido
- [ ] Cálculo do valor total do pedido

## Tecnologias

| Ferramenta | Uso |
|---|---|
| HTML5 | Estrutura da página |
| CSS3 | Estilos e layout responsivo (Grid) |
| JavaScript | Consumo da API com `fetch` |

## Como rodar

Este projeto depende da API. **Suba a API primeiro:**

```bash
cd ../API-de-Card-pio
npm run dev
```

A API precisa estar respondendo em `http://localhost:3000`.

**Depois abra o frontend** com a extensão **Live Server** do VS Code — clique com o botão direito no `index.html` e escolha *Open with Live Server*.

Abrir o arquivo direto pelo Explorer também costuma funcionar, mas o Live Server é mais confiável: o navegador trata páginas abertas por `file://` de forma diferente e isso pode esbarrar em bloqueio de CORS.

## Estrutura

```
index.html    Estrutura da página
style.css     Estilos
script.js     Consumo da API e renderização
```

## Configuração da API

O endereço da API fica na primeira linha do `script.js`:

```js
const API = "http://localhost:3000/api";
```

Em produção, troque pela URL da API publicada:

```js
const API = "https://sua-api.vercel.app/api";
```

E libere a URL do frontend na variável `CORS_ORIGIN` da API — sem isso o navegador bloqueia as requisições.

## Endpoints consumidos

| Endpoint | Uso |
|---|---|
| `GET /api/produtos` | Carrega o cardápio completo |
| `GET /api/produtos?busca=termo` | Filtra pelo campo de busca |

Cada produto retornado já traz a categoria junto, e é por ela que o agrupamento na tela é feito.

A busca é enviada para a API — o filtro acontece no banco, não no navegador — com uma pausa de 400ms após a digitação, para não disparar uma requisição a cada tecla.

## Projeto relacionado

[**API-DE-CARDAPIO**](https://github.com/antonio3carlos8-blip/API-DE-CARDAPIO) — a API REST que serve os dados, feita com Node.js, Express, Prisma e PostgreSQL.
