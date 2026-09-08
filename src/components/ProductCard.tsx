import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    produto: {
        id: string;
        nome: string;
        descricao?: string;
        preco: number;
        disponivel: boolean;
    };
}

export function ProductCard({ produto }: ProductCardProps) {
    const precoFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(produto.preco);

    return (
        <Card className={`overflow-hidden transition-all ${!produto.disponivel ? "opacity-60 grayscale-[0.5]" : "hover:border-primary"}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold">{produto.nome}</CardTitle>
                    {!produto.disponivel && (
                    <Badge variant="secondary" className="text-xs">
                        Esgotado
                    </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {produto.descricao && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {produto.descricao}
                    </p>
                )}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold text-gray-900">
                    {precoFormatado}
                    </span>
                    <Button disabled={!produto.disponivel} size="sm">
                        Adicionar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
