import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";

function orderNumberFromSessionId(sessionId: string): string {
  return `WEB-${sessionId.replace(/^cs_/, "").slice(0, 12).toUpperCase()}`;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const admin = createServiceClient();

  if (!secret || !stripeKey || !admin) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const subtotal = Number(session.metadata?.subtotal ?? 0);
  const shippingFee = Number(session.metadata?.shipping_fee ?? 0);
  const totalFromMeta = session.metadata?.total
    ? Number(session.metadata.total)
  : null;
  const total =
    totalFromMeta ??
    (session.amount_total != null ? session.amount_total / 100 : subtotal + shippingFee);

  const customerDetails = session.customer_details;
  const collected = (
    session as Stripe.Checkout.Session & {
      collected_information?: {
        shipping_details?: {
          name?: string | null;
          address?: Stripe.Address | null;
        };
      };
    }
  ).collected_information?.shipping_details;
  const addr = collected?.address ?? customerDetails?.address;
  const shippingTo = addr
    ? [
        collected?.name ?? customerDetails?.name,
        addr.line1,
        addr.city,
        addr.state,
        addr.postal_code,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      order_number: orderNumberFromSessionId(session.id),
      channel: "web",
      status: "pendiente",
      customer_name_snapshot: customerDetails?.name ?? "Cliente web",
      customer_phone_snapshot: customerDetails?.phone ?? null,
      customer_email_snapshot: customerDetails?.email ?? null,
      line_focus: "multiusos",
      is_express: false,
      shipping_to: shippingTo,
      shipping_fee: shippingFee,
      subtotal,
      total: total || subtotal + shippingFee,
      currency: "MXN",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent ?? null,
      created_by: null,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "No se pudo crear pedido" }, { status: 500 });
  }

  const lineCount = Number(session.metadata?.line_count ?? 0);
  const items = [];
  for (let i = 0; i < lineCount; i++) {
    const id = session.metadata?.[`p${i}_id`];
    const qty = Number(session.metadata?.[`p${i}_qty`]);
    const unit = Number(session.metadata?.[`p${i}_unit`]);
    const name = session.metadata?.[`p${i}_name`] ?? "Producto";
    if (!id || !qty) continue;
    items.push({
      order_id: order.id,
      product_id: id,
      description: name,
      quantity: qty,
      unit_price: unit,
      line_total: Math.round(unit * qty * 100) / 100,
      is_custom: false,
      is_automotive: false,
    });
  }

  if (items.length) {
    await admin.from("order_items").insert(items);
  }

  if (paymentIntent) {
    const { data: dupIncome } = await admin
      .from("income_entries")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent)
      .maybeSingle();
    if (!dupIncome) {
      await admin.from("income_entries").insert({
        order_id: order.id,
        kind: "stripe",
        method: "stripe",
        amount: total || subtotal + shippingFee,
        currency: "MXN",
        stripe_payment_intent_id: paymentIntent,
        occurred_at: new Date().toISOString(),
        recorded_by: null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
