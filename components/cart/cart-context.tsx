"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartStorageItem } from "@/lib/catalog/types";
import { CART_STORAGE_KEY } from "@/lib/cart/constants";
import { sanitizeCartItems } from "@/lib/cart/storage";

type CartContextValue = {
  items: CartStorageItem[];
  pieceCount: number;
  hydrated: boolean;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartStorageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return sanitizeCartItems(raw);
  } catch {
    return [];
  }
}

function writeStorage(items: CartStorageItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStorageItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
    const onStorage = () => setItems(readStorage());
    window.addEventListener("cart-updated", onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cart-updated", onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persist = useCallback((next: CartStorageItem[]) => {
    setItems(next);
    writeStorage(next);
  }, []);

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      const current = readStorage();
      const idx = current.findIndex((i) => i.product_id === productId);
      let next: CartStorageItem[];
      if (idx >= 0) {
        next = [...current];
        next[idx] = {
          product_id: productId,
          quantity: Math.min(99, next[idx].quantity + quantity),
        };
      } else {
        if (current.length >= 20) return;
        next = [...current, { product_id: productId, quantity }];
      }
      persist(next);
    },
    [persist]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1 || quantity > 99) return;
      const next = readStorage().map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );
      persist(next);
    },
    [persist]
  );

  const removeItem = useCallback(
    (productId: string) => {
      persist(readStorage().filter((i) => i.product_id !== productId));
    },
    [persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const pieceCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      pieceCount,
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, pieceCount, hydrated, addItem, setQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
