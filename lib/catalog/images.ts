export function productImagePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base || !storagePath) return null;
  const encoded = storagePath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/product-images/${encoded}`;
}

export function pickPrimaryImage(
  images: { storage_path: string; alt_text: string | null; is_primary: boolean; sort_order: number }[]
) {
  if (!images.length) return null;
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return sorted[0];
}
