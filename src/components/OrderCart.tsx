import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Produto } from "@/app/types";

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface OrderCartProps {
  itens: CartItem[];
  onRemover: (id: string) => void;
  onFinalizar: () => void;
}

export function OrderCart({ itens, onRemover, onFinalizar }: OrderCartProps) {
  const total = itens.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <Sheet>
      {/* 
        CORREÇÃO AQUI: Removemos o asChild e o componente <Button>. 
        Passamos as classes CSS diretamente para o SheetTrigger. 
      */}
      <SheetTrigger className="flex items-center justify-center h-14 w-14 rounded-full shadow-xl relative bg-blue-600 hover:bg-blue-700 transition-colors">
        <ShoppingCart className="h-6 w-6 text-white" />
        {totalItens > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white">
            {totalItens}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md bg-white">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold border-b pb-4">Seu Pedido</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {itens.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Seu carrinho está vazio.</p>
            ) : (
              itens.map(item => (
                <div key={item.produto.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.quantidade}x {item.produto.nome}</p>
                    <p className="text-sm text-gray-500">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemover(item.produto.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between font-bold text-xl mb-6">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <Button className="w-full h-12 text-lg" onClick={onFinalizar} disabled={itens.length === 0}>
              Enviar Pedido
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}