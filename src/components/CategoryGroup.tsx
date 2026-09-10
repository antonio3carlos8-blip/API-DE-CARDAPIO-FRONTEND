import { Produto } from "@/app/types";
import { ProductCard } from "./ProductCard";

interface CategoryGroupProps {
  titulo: string;
  produtos: Produto[];
  onAddProduto: (produto: Produto) => void;
}

export function CategoryGroup({ titulo, produtos, onAddProduto }: CategoryGroupProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <ProductCard 
            key={produto.id} 
            produto={produto} 
            onAdd={() => onAddProduto(produto)} 
          />
        ))}
      </div>
    </section>
  );
}