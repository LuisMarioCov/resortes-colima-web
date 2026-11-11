"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";

export function AddToCartButton({ productId }: { productId: string }) {
  const { addItem, items } = useCart();
  const [qty, setQty] = useState(1);
  const atMaxLines = items.length >= 20 && !items.some((i) => i.product_id === productId);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm text-stone-700">
        Cantidad
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
          className="ml-2 min-h-11 w-20 rounded-md border border-stone-300 px-2"
        />
      </label>
      <button
        type="button"
        disabled={atMaxLines}
        onClick={() => addItem(productId, qty)}
        className="min-h-11 rounded-md bg-amber-800 px-5 py-2 font-medium text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        Añadir al carrito
      </button>
      {atMaxLines && (
        <p className="text-sm text-red-800" role="status">
          Máximo 20 líneas por pedido.
        </p>
      )}
    </div>
  );
}
