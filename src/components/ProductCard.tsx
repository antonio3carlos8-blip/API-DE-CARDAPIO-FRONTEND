import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Produto } from "@/app/types";

interface ProductCardProps {
  produto: Produto;
  onAdd: () => void;
}

export function ProductCard({ produto, onAdd }: ProductCardProps) {
  const precoFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(produto.preco);

  return (
    <Card className={`overflow-hidden transition-all flex flex-col ${!produto.disponivel ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md hover:border-gray-300"}`}>
      <div className="relative border-b aspect-video">
        <img 
          src={produto.imagemUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80"} 
          alt={produto.nome}
          className="object-cover w-full h-full"
        />
        {!produto.disponivel && (
          <div className="absolute top-3 right-3"><Badge variant="destructive" className="shadow-lg">Esgotado</Badge></div>
        )}
      </div>

      <CardHeader className="pb-2 flex-1">
        <CardTitle className="text-lg font-bold leading-tight">{produto.nome}</CardTitle>
        {produto.descricao && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{produto.descricao}</p>}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-gray-900">{precoFormatado}</span>
          <Button disabled={!produto.disponivel} size="sm" className="rounded-full px-6" onClick={onAdd}>
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}