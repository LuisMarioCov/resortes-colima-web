import type { SupabaseClient } from "@supabase/supabase-js";
import { catalogCodeToSlug, productSlugParts } from "@/lib/slug";
import type { PublicCatalog, PublicProduct } from "@/lib/catalog/types";

type ProductRow = {
  id: string;
  external_id: string;
  name: string;
  description: string | null;
  tech_sheet: unknown;
  unit_price: number;
  catalog_id: string;
  visible_web: boolean;
  is_active: boolean;
  line: string;
  catalogs: { code: string; name: string; is_public: boolean; line: string } | null;
  product_images: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
};

function passesWebPublishRules(row: ProductRow): boolean {
  const cat = row.catalogs;
  if (!cat) return false;
  if (
    !row.visible_web ||
    !row.is_active ||
    row.line !== "multiusos" ||
    cat.line !== "multiusos" ||
    !cat.is_public ||
    row.unit_price == null
  ) {
    return false;
  }
  if (!row.product_images?.length) return false;
  return true;
}

function normalizeProductRow(raw: unknown): ProductRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const catalogsRaw = r.catalogs;
  const catalogs = Array.isArray(catalogsRaw)
    ? (catalogsRaw[0] as ProductRow["catalogs"])
    : (catalogsRaw as ProductRow["catalogs"]);
  const images = (r.product_images as ProductRow["product_images"]) ?? [];
  if (!catalogs) return null;
  return {
    ...(r as Omit<ProductRow, "catalogs" | "product_images">),
    catalogs,
    product_images: images,
  };
}

function mapProduct(row: ProductRow): PublicProduct | null {
  if (!passesWebPublishRules(row) || !row.catalogs) return null;
  return {
    id: row.id,
    external_id: row.external_id,
    name: row.name,
    description: row.description,
    tech_sheet: row.tech_sheet,
    unit_price: Number(row.unit_price),
    catalog_id: row.catalog_id,
    catalog_code: row.catalogs.code,
    catalog_name: row.catalogs.name,
    images: row.product_images,
  };
}

const PRODUCT_SELECT = `
  id,
  external_id,
  name,
  description,
  tech_sheet,
  unit_price,
  catalog_id,
  visible_web,
  is_active,
  line,
  catalogs!inner(code, name, is_public, line),
  product_images(id, storage_path, alt_text, sort_order, is_primary)
`;

export async function fetchPublicCatalogs(
  supabase: SupabaseClient
): Promise<PublicCatalog[]> {
  const { data, error } = await supabase
    .from("catalogs")
    .select("id, code, name, sort_order, line, is_public")
    .eq("is_public", true)
    .eq("line", "multiusos")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    sort_order: c.sort_order,
  }));
}

export async function fetchPublicProductsByCatalogCode(
  supabase: SupabaseClient,
  catalogCode: string
): Promise<PublicProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("visible_web", true)
    .eq("is_active", true)
    .eq("line", "multiusos")
    .not("unit_price", "is", null)
    .eq("catalogs.code", catalogCode)
    .eq("catalogs.is_public", true)
    .eq("catalogs.line", "multiusos")
    .order("external_id", { ascending: true });

  if (error || !data) return [];
  return data
    .map((row) => normalizeProductRow(row))
    .filter((row): row is ProductRow => row !== null)
    .map(mapProduct)
    .filter((p): p is PublicProduct => p !== null);
}

export async function fetchPublicProductBySlugs(
  supabase: SupabaseClient,
  catalogSlug: string,
  productSlug: string
): Promise<PublicProduct | null> {
  const catalogCode = catalogSlug.replace(/-/g, "_");
  const products = await fetchPublicProductsByCatalogCode(supabase, catalogCode);
  const match = products.find((p) => productSlugParts(p) === productSlug);
  return match ?? null;
}

export async function fetchAllPublicProductsForStaticParams(
  supabase: SupabaseClient
): Promise<{ catalogSlug: string; productSlug: string }[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("visible_web", true)
    .eq("is_active", true)
    .eq("line", "multiusos")
    .not("unit_price", "is", null)
    .eq("catalogs.is_public", true)
    .eq("catalogs.line", "multiusos");

  if (error || !data) return [];
  const out: { catalogSlug: string; productSlug: string }[] = [];
  for (const raw of data) {
    const row = normalizeProductRow(raw);
    if (!row) continue;
    const mapped = mapProduct(row);
    if (!mapped) continue;
    out.push({
      catalogSlug: catalogCodeToSlug(mapped.catalog_code),
      productSlug: productSlugParts(mapped),
    });
  }
  return out;
}

export async function fetchPublicProductById(
  supabase: SupabaseClient,
  productId: string
): Promise<PublicProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) return null;
  const row = normalizeProductRow(data);
  if (!row) return null;
  return mapProduct(row);
}
