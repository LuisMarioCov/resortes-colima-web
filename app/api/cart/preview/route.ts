import { NextResponse } from "next/server";
import {
  loadAppSettings,
  priceCartLines,
  summarizeCheckout,
  type CartLineInput,
} from "@/lib/checkout";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { productImagePublicUrl, pickPrimaryImage } from "@/lib/catalog/images";
import { fetchPublicProductById } from "@/lib/catalog/queries";

export async function POST(request: Request) {
  let body: { items?: CartLineInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const supabase: SupabaseClient | null =
    createServiceClient() ?? createPublicServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Catálogo no configurado (variables Supabase)." },
      { status: 503 }
    );
  }

  const items = body.items ?? [];
  const removedIds: string[] = [];
  const sellable: CartLineInput[] = [];
  for (const item of items) {
    const product = await fetchPublicProductById(supabase, item.product_id);
    if (!product) {
      removedIds.push(item.product_id);
      continue;
    }
    sellable.push(item);
  }

  if (!sellable.length) {
    return NextResponse.json({
      lines: [],
      subtotal: 0,
      shipping_fee: 0,
      total: 0,
      can_checkout: false,
      checkout_block_reason: null,
      shipping_free_threshold: 2999,
      shipping_fee_configured: false,
      removed_product_ids: removedIds,
    });
  }

  const priced = await priceCartLines(supabase, sellable);
  if ("error" in priced) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const linesWithMeta = await Promise.all(
    priced.lines.map(async (line) => {
      const product = await fetchPublicProductById(supabase, line.product_id);
      const img = product ? pickPrimaryImage(product.images) : null;
      const image_url = img ? productImagePublicUrl(img.storage_path) : null;
      return {
        ...line,
        external_id: product?.external_id ?? null,
        image_url,
        alt_text: img?.alt_text ?? product?.name ?? line.name,
      };
    })
  );

  let settings = {
    freeThreshold: 2999,
    shippingFeeMxn: null as number | null,
  };
  const adminSettings = createServiceClient();
  if (adminSettings) {
    try {
      settings = await loadAppSettings(adminSettings);
    } catch {
      /* anon: app_settings no legible; umbral fijo conocido */
    }
  }

  const shipping = summarizeCheckout(priced.subtotal, settings);

  return NextResponse.json({
    lines: linesWithMeta,
    subtotal: priced.subtotal,
    shipping_fee: shipping.shippingFee,
    total: shipping.total,
    can_checkout: shipping.canCheckout,
    checkout_block_reason: shipping.reason ?? null,
    shipping_free_threshold: settings.freeThreshold,
    shipping_fee_configured: settings.shippingFeeMxn != null,
    removed_product_ids: removedIds,
  });
}
