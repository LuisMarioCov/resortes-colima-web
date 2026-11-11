import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  fetchAllPublicProductsForStaticParams,
  fetchPublicProductBySlugs,
} from "@/lib/catalog/queries";
import { catalogCodeToSlug, productSlugParts } from "@/lib/slug";
import { formatMxn } from "@/lib/format";
import { productImagePublicUrl, pickPrimaryImage } from "@/lib/catalog/images";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

type Props = {
  params: Promise<{ catalogSlug: string; productSlug: string }>;
};

export async function generateStaticParams() {
  const supabase = createPublicServerClient();
  if (!supabase) return [];
  return fetchAllPublicProductsForStaticParams(supabase);
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { catalogSlug, productSlug } = await params;
  const supabase = createPublicServerClient();
  if (!supabase) {
    return { title: "Producto", robots: { index: false } };
  }
  const product = await fetchPublicProductBySlugs(supabase, catalogSlug, productSlug);
  if (!product) {
    return { title: "No encontrado", robots: { index: false, follow: false } };
  }
  const description =
    product.description?.slice(0, 160) ||
    `${product.name} — resorte multiusos, precio de lista ${formatMxn(product.unit_price)}. Resortes Colima.`;
  const primary = pickPrimaryImage(product.images);
  const image = primary ? productImagePublicUrl(primary.storage_path) : undefined;

  return {
    title: `${product.name} — Resortes Colima`,
    description,
    alternates: {
      canonical: `/catalogo/${catalogSlug}/${productSlug}`,
    },
    openGraph: {
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { catalogSlug, productSlug } = await params;
  const supabase = createPublicServerClient();
  if (!supabase) notFound();

  const product = await fetchPublicProductBySlugs(supabase, catalogSlug, productSlug);
  if (!product) notFound();

  const primary = pickPrimaryImage(product.images);
  const src = primary ? productImagePublicUrl(primary.storage_path) : null;
  const gallery = [...product.images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.external_id,
    brand: { "@type": "Brand", name: "Resortes Colima" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MXN",
      price: product.unit_price,
      url: `https://resortescolima.mx/catalogo/${catalogSlug}/${productSlug}`,
    },
  };

  return (
    <div className="space-y-8">
      <nav aria-label="Miga de pan" className="text-sm text-stone-600">
        <Link href="/catalogo" className="underline">
          Catálogo
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/catalogo/${catalogSlug}`} className="underline">
          {product.catalog_name}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{product.name}</span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={primary?.alt_text || product.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <p className="flex h-full items-center justify-center text-stone-500">Sin imagen</p>
            )}
          </div>
          {gallery.length > 1 && (
            <ul className="flex flex-wrap gap-2">
              {gallery.map((img) => {
                const thumb = productImagePublicUrl(img.storage_path);
                if (!thumb) return null;
                return (
                  <li key={img.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={img.alt_text || product.name}
                      className="h-16 w-16 rounded border border-stone-200 object-contain"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-stone-500">ID {product.external_id}</p>
          <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>
          <p className="text-2xl font-semibold text-amber-900">{formatMxn(product.unit_price)}</p>
          {product.description && (
            <p className="text-stone-700 whitespace-pre-wrap">{product.description}</p>
          )}
          <p className="text-sm text-stone-600">
            Fabricado express en Colima. El tiempo exacto lo confirma el taller al procesar tu
            pedido; la web no muestra una fecha automática.
          </p>
          <AddToCartButton productId={product.id} />
          <p className="text-sm">
            ¿Necesitas una réplica a medida?{" "}
            <Link href="/personalizados" className="underline text-amber-900">
              Solicita un personalizado
            </Link>{" "}
            (cotización por WhatsApp, sin precio fijo aquí).
          </p>
        </div>
      </div>
    </div>
  );
}
