"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { formatMxn } from "@/lib/format";
import { SHIPPING_FREE_THRESHOLD_MXN } from "@/lib/shipping";

type PreviewLine = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  external_id: string | null;
  image_url: string | null;
  alt_text: string | null;
};

type Preview = {
  lines: PreviewLine[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  can_checkout: boolean;
  checkout_block_reason: string | null;
  shipping_free_threshold: number;
  shipping_fee_configured: boolean;
  removed_product_ids: string[];
};

export function CartPageClient() {
  const { items, hydrated, setQuantity, removeItem, clear } = useCart();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!hydrated) return;
    if (!items.length) {
      setPreview(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar el carrito");
        setPreview(null);
        return;
      }
      setPreview(data as Preview);
      const removed = (data.removed_product_ids ?? []) as string[];
      if (removed.length) {
        removed.forEach((id) => removeItem(id));
      }
    } catch {
      setError("Error de red al cargar precios.");
    } finally {
      setLoading(false);
    }
  }, [hydrated, items, removeItem]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handlePay = async () => {
    if (!preview?.can_checkout) return;
    setPayLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar el pago");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("No se pudo conectar con el pago.");
    } finally {
      setPayLoading(false);
    }
  };

  if (!hydrated) {
    return <p className="text-stone-600">Cargando carrito…</p>;
  }

  if (!items.length) {
    return (
      <div className="space-y-4">
        <p>Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="inline-flex min-h-11 items-center rounded-md bg-amber-800 px-4 text-white hover:bg-amber-900"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {preview?.removed_product_ids?.length ? (
        <div
          role="alert"
          className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          Algunos productos ya no están disponibles en la web y se quitaron del carrito.
        </div>
      ) : null}

      {error && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
          {error}
        </div>
      )}

      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {(preview?.lines ?? []).map((line) => (
          <li key={line.product_id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            {line.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={line.image_url}
                alt={line.alt_text ?? line.name}
                className="h-20 w-20 shrink-0 rounded object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded bg-stone-100 text-xs text-stone-500">
                Sin foto
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{line.name}</p>
              {line.external_id && (
                <p className="text-xs text-stone-500">ID {line.external_id}</p>
              )}
              <p className="text-sm text-stone-700">{formatMxn(line.unit_price)} c/u</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm">
                Cant.
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="ml-1 min-h-11 w-16 rounded border border-stone-300 px-1"
                  value={line.quantity}
                  onChange={(e) => {
                    const q = Math.min(99, Math.max(1, Number(e.target.value) || 1));
                    setQuantity(line.product_id, q);
                  }}
                />
              </label>
              <p className="min-w-24 text-right font-medium">{formatMxn(line.line_total)}</p>
              <button
                type="button"
                className="min-h-11 min-w-11 rounded border border-stone-300 px-2 text-sm hover:bg-stone-50"
                onClick={() => removeItem(line.product_id)}
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {loading && <p className="text-sm text-stone-600">Actualizando precios…</p>}

      {preview && (
        <section aria-labelledby="totales" className="space-y-2 rounded-lg bg-stone-100 p-4">
          <h2 id="totales" className="text-lg font-semibold">
            Totales
          </h2>
          <p>
            Subtotal: <strong>{formatMxn(preview.subtotal)}</strong>
          </p>
          <p>
            Envío:{" "}
            <strong>
              {preview.shipping_fee === 0
                ? "Gratis"
                : preview.shipping_fee_configured
                  ? formatMxn(preview.shipping_fee)
                  : "Pendiente de configuración"}
            </strong>
          </p>
          <p className="text-sm text-stone-700">
            Envío gratis a partir de {formatMxn(preview.shipping_free_threshold ?? SHIPPING_FREE_THRESHOLD_MXN)}{" "}
            en productos (mismo cobro Stripe).
          </p>
          <p className="text-lg font-semibold text-amber-950">
            Total estimado: {formatMxn(preview.total)}
          </p>
          {!preview.can_checkout && preview.checkout_block_reason && (
            <p className="text-sm text-red-900" role="status">
              {preview.checkout_block_reason}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={!preview.can_checkout || payLoading}
              onClick={() => void handlePay()}
              className="min-h-11 rounded-md bg-amber-800 px-5 font-medium text-white hover:bg-amber-900 disabled:opacity-50"
            >
              {payLoading ? "Redirigiendo…" : "Pagar con Stripe"}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-md border border-stone-400 px-4 hover:bg-white"
              onClick={() => clear()}
            >
              Vaciar carrito
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
