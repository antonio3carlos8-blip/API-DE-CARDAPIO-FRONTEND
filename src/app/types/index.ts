export interface Produto {
    id: string; 
    nome: string;
    preco: number;
    descricao?: string; 
    imagemUrl?: string; 
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
    descricao?: string; 
    categorias?: Categoria[]; 
    createdAt?: string;
    updatedAt?: string;
}