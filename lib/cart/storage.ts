import type { CartStorageItem } from "@/lib/catalog/types";
import { MAX_CART_LINES, MAX_QTY, MIN_QTY } from "@/lib/cart/constants";

export function sanitizeCartItems(raw: unknown): CartStorageItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartStorageItem[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const product_id = (row as CartStorageItem).product_id;
    const quantity = Number((row as CartStorageItem).quantity);
    if (typeof product_id !== "string" || !product_id) continue;
    if (!Number.isInteger(quantity) || quantity < MIN_QTY || quantity > MAX_QTY) continue;
    if (seen.has(product_id)) continue;
    seen.add(product_id);
    out.push({ product_id, quantity });
    if (out.length >= MAX_CART_LINES) break;
  }
  return out;
}
