"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";

export function CartLink() {
  const { pieceCount, hydrated } = useCart();
  return (
    <Link
      href="/carrito"
      className="inline-flex min-h-11 min-w-11 items-center gap-2 px-2 py-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800"
    >
      Carrito
      <span
        className="rounded-full bg-stone-800 px-2 py-0.5 text-xs font-semibold text-white"
        aria-live="polite"
        aria-label={hydrated ? `${pieceCount} piezas en el carrito` : "Carrito"}
      >
        {hydrated ? pieceCount : "—"}
      </span>
    </Link>
  );
}
