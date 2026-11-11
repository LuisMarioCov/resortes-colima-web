import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  fetchPublicCatalogs,
  fetchPublicProductsByCatalogCode,
} from "@/lib/catalog/queries";
import { catalogSlugToCode } from "@/lib/slug";
import { ProductCard } from "@/components/catalog/product-card";

type Props = { params: Promise<{ catalogSlug: string }> };

export async function generateStaticParams() {
  const supabase = createPublicServerClient();
  if (!supabase) return [];
  const catalogs = await fetchPublicCatalogs(supabase);
  return catalogs.map((c) => ({
    catalogSlug: c.code.replace(/_/g, "-"),
  }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { catalogSlug } = await params;
  const supabase = createPublicServerClient();
  if (!supabase) return { title: "Catálogo" };
  const code = catalogSlugToCode(catalogSlug);
  const catalogs = await fetchPublicCatalogs(supabase);
  const cat = catalogs.find((c) => c.code === code);
  return {
    title: cat ? cat.name : "Catálogo",
    description: cat
      ? `${cat.name} — resortes multiusos Resortes Colima, Fabricado express, envíos a toda México.`
      : undefined,
  };
}

export default async function CatalogListPage({ params }: Props) {
  const { catalogSlug } = await params;
  const supabase = createPublicServerClient();
  if (!supabase) notFound();

  const code = catalogSlugToCode(catalogSlug);
  const catalogs = await fetchPublicCatalogs(supabase);
  const catalog = catalogs.find((c) => c.code === code);
  if (!catalog) notFound();

  const products = await fetchPublicProductsByCatalogCode(supabase, code);

  return (
    <div className="space-y-6">
      <nav aria-label="Miga de pan" className="text-sm text-stone-600">
        <Link href="/catalogo" className="underline">
          Catálogo
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{catalog.name}</span>
      </nav>
      <h1 className="text-2xl font-bold">{catalog.name}</h1>
      <p className="text-stone-700">
        Precios de lista en MXN. Fabricado express — tiempos de entrega los confirma el equipo; sin
        fechas automáticas en la web.
      </p>
      {products.length === 0 ? (
        <p className="rounded-md border border-stone-200 bg-white p-6 text-stone-600">
          Este listado aún no tiene productos listos para la web (precio, visible_web y al menos una
          foto).
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
