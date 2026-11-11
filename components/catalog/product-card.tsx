import Link from "next/link";
import type { PublicProduct } from "@/lib/catalog/types";
import { catalogCodeToSlug, productSlugParts } from "@/lib/slug";
import { formatMxn } from "@/lib/format";
import { productImagePublicUrl, pickPrimaryImage } from "@/lib/catalog/images";

export function ProductCard({ product }: { product: PublicProduct }) {
  const slug = productSlugParts(product);
  const catalogSlug = catalogCodeToSlug(product.catalog_code);
  const href = `/catalogo/${catalogSlug}/${slug}`;
  const primary = pickPrimaryImage(product.images);
  const src = primary ? productImagePublicUrl(primary.storage_path) : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">
        <div className="aspect-square bg-stone-100">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={primary?.alt_text || product.name}
              className="h-full w-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-stone-500">
              Sin imagen
            </p>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-xs font-medium text-stone-500">ID {product.external_id}</p>
          <h2 className="text-base font-semibold text-stone-900">{product.name}</h2>
          <p className="text-lg font-semibold text-amber-900">{formatMxn(product.unit_price)}</p>
        </div>
      </Link>
    </article>
  );
}
