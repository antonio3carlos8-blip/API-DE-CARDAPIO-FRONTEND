import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button"; 

export function OrderCart() {
    return (
        <Sheet>
            <SheetHeader>
                <SheetTitle>Seu Pedido</SheetTitle>
                <SheetDescription>
                    Revise seus itens antes de finalizar a compra.
                </SheetDescription>
            </SheetHeader>
            <SheetTrigger 
                    className={buttonVariants({ 
                    size: "lg", 
                    className: "shadow-lg rounded-full px-8 cursor-pointer" 
                })} >
                Ver Pedido (R$ 0,00)
            </SheetTrigger>

            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Seu Pedido</SheetTitle>
                        <SheetDescription>
                            Revise seus itens antes de finalizar a compra.
                        </SheetDescription>
                </SheetHeader>
                    <div className="mt-8 flex flex-col items-center justify-center text-gray-500 h-1/2">
                        <p>O carrinho está vazio.</p>
                    </div>
            </SheetContent>
        </Sheet>
    );
}