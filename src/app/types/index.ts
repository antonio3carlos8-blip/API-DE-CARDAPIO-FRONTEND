export interface Produto {
    id: string;
    nome: string;
    preco: number;
    descricao?: string | null;
    imagemUrl?: string | null;
    disponivel: boolean;
    categoriaId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Categoria {
    id: string;
    nome: string;
    cardapioId: string;
    produtos?: Produto[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Cardapio {
    id: string;
    nome: string;
    descricao?: string | null;
    ativo?: boolean;
    imagemUrl?: string | null;
    categorias?: Categoria[];
    createdAt?: string;
    updatedAt?: string;
}

export type PedidoStatus = "RECEBIDO" | "EM_PREPARO" | "PRONTO" | "CANCELADO";

export interface PedidoItem {
    id: string;
    produtoId?: string | null;
    nomeProduto: string;
    precoUnitario: number;
    quantidade: number;
    subtotal: number;
}

export interface Pedido {
    id: string;
    cardapioId: string;
    clienteNome: string;
    observacao?: string | null;
    status: PedidoStatus;
    total: number;
    itens: PedidoItem[];
    createdAt: string;
    updatedAt: string;
}
