import { ProductCard } from "./ProductCard";

interface CategoryGroupProps {
    titulo: string;
    produtos: any[]; 
}

export function CategoryGroup({ titulo, produtos }: CategoryGroupProps) {
    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
            {titulo}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
                ))}
            </div>
        </section>
    );
}