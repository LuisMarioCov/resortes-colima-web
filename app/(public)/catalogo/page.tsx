import Link from "next/link";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { fetchPublicCatalogs } from "@/lib/catalog/queries";
import { catalogCodeToSlug } from "@/lib/slug";

export const metadata = { title: "Catálogo" };

export const revalidate = 60;

export default async function CatalogoIndexPage() {
  const supabase = createPublicServerClient();
  const catalogs = supabase ? await fetchPublicCatalogs(supabase) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Catálogo multiusos</h1>
      <p className="text-stone-700">
        Dos listados separados. Solo productos publicados con precio de lista desde la base de datos.
        Sin promociones ni línea automotriz en este sitio.
      </p>
      {catalogs.length === 0 ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-stone-600">
          {supabase
            ? "Aún no hay listados publicados. Los productos aparecerán cuando el equipo active visible_web, precio y fotos."
            : "Conecta Supabase en .env.local para ver el catálogo en vivo."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {catalogs.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/catalogo/${catalogCodeToSlug(cat.code)}`}
                className="block min-h-11 rounded-lg border border-stone-200 bg-white p-6 font-medium text-amber-900 hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
