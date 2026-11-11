import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  loadAppSettings,
  priceCartLines,
  summarizeCheckout,
  type CartLineInput,
} from "@/lib/checkout";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`checkout:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta más tarde." },
      {
        status: 429,
        headers: rl.retryAfterSec
          ? { "Retry-After": String(rl.retryAfterSec) }
          : undefined,
      }
    );
  }

  let body: { items?: CartLineInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Checkout no configurado (falta SUPABASE_SERVICE_ROLE_KEY en el servidor).",
      },
      { status: 503 }
    );
  }

  const priced = await priceCartLines(admin, body.items ?? []);
  if ("error" in priced) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const settings = await loadAppSettings(admin);
  const shipping = summarizeCheckout(priced.subtotal, settings);

  if (!shipping.canCheckout) {
    return NextResponse.json(
      {
        error: shipping.reason,
        subtotal: priced.subtotal,
        shipping_free_from: settings.freeThreshold,
      },
      { status: 400 }
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      {
        error:
          "Stripe no configurado. Totales calculados en servidor; falta STRIPE_SECRET_KEY.",
        subtotal: priced.subtotal,
        shipping_fee: shipping.shippingFee,
        total: shipping.total,
      },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://resortescolima.mx";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    priced.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "mxn",
        unit_amount: Math.round(line.unit_price * 100),
        product_data: { name: line.name },
      },
    }));

  if (shipping.shippingFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "mxn",
        unit_amount: Math.round(shipping.shippingFee * 100),
        product_data: { name: "Envío nacional" },
      },
    });
  }

  const metadata: Record<string, string> = {
    subtotal: String(priced.subtotal),
    shipping_fee: String(shipping.shippingFee),
    total: String(shipping.total),
    line_count: String(priced.lines.length),
  };
  priced.lines.forEach((line, i) => {
    metadata[`p${i}_id`] = line.product_id;
    metadata[`p${i}_qty`] = String(line.quantity);
    metadata[`p${i}_unit`] = String(line.unit_price);
    metadata[`p${i}_name`] = line.name.slice(0, 400);
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es-419",
    currency: "mxn",
    line_items: lineItems,
    success_url: `${siteUrl}/pedido/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pedido/cancelado`,
    shipping_address_collection: { allowed_countries: ["MX"] },
    metadata,
  });

  return NextResponse.json({ url: session.url });
}
