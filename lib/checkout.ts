import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeShipping,
  SHIPPING_FREE_THRESHOLD_MXN,
  type ShippingSettings,
} from "@/lib/shipping";

export type CartLineInput = { product_id: string; quantity: number };

export type PricedLine = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const MAX_LINES = 20;
const MAX_QTY = 99;

export async function loadAppSettings(
  admin: SupabaseClient
): Promise<ShippingSettings> {
  const { data, error } = await admin.from("app_settings").select("key, value_numeric");
  if (error) {
    throw new Error("No se pudo leer app_settings");
  }
  const map = new Map(data?.map((r) => [r.key, r.value_numeric]) ?? []);
  return {
    freeThreshold:
      Number(map.get("shipping_free_threshold_mxn")) || SHIPPING_FREE_THRESHOLD_MXN,
    shippingFeeMxn:
      map.get("shipping_fee_mxn") === null || map.get("shipping_fee_mxn") === undefined
        ? null
        : Number(map.get("shipping_fee_mxn")),
  };
}

export async function priceCartLines(
  admin: SupabaseClient,
  items: CartLineInput[]
): Promise<{ lines: PricedLine[]; subtotal: number } | { error: string }> {
  if (!items?.length) {
    return { error: "El carrito está vacío" };
  }
  if (items.length > MAX_LINES) {
    return { error: "Máximo 20 líneas por pedido" };
  }

  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty <= 0 || qty > MAX_QTY || !Number.isInteger(qty)) {
      return { error: "Cantidad inválida" };
    }
    const { data: product, error } = await admin
      .from("products")
      .select("id, name, unit_price, visible_web, is_active, line, catalog_id")
      .eq("id", item.product_id)
      .single();

    if (error || !product) {
      return { error: "Producto no disponible en la web" };
    }

    const { data: catalog, error: catErr } = await admin
      .from("catalogs")
      .select("is_public, line")
      .eq("id", product.catalog_id)
      .single();

    if (catErr || !catalog) {
      return { error: "Catálogo no disponible" };
    }
    if (
      !product.visible_web ||
      !product.is_active ||
      product.line !== "multiusos" ||
      catalog.line !== "multiusos" ||
      !catalog.is_public ||
      product.unit_price == null
    ) {
      return { error: "Producto no publicable en catálogo web" };
    }

    const unit = Number(product.unit_price);
    const lineTotal = Math.round(unit * qty * 100) / 100;
    lines.push({
      product_id: product.id,
      name: product.name,
      quantity: qty,
      unit_price: unit,
      line_total: lineTotal,
    });
    subtotal += lineTotal;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  return { lines, subtotal };
}

export function summarizeCheckout(
  subtotal: number,
  settings: ShippingSettings
) {
  return computeShipping(subtotal, settings);
}
