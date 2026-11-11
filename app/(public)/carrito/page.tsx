import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata = { title: "Carrito" };

export default function CarritoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <p className="text-stone-700">
        Solo guardamos identificador de producto y cantidad en tu navegador. Los precios los
        recalcula el servidor al mostrar esta página y al pagar.
      </p>
      <CartPageClient />
    </div>
  );
}
