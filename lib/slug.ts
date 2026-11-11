export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function catalogCodeToSlug(code: string): string {
  return code.replace(/_/g, "-");
}

export function catalogSlugToCode(slug: string): string {
  return slug.replace(/-/g, "_");
}

export function productSlugParts(product: { external_id: string; name: string }): string {
  const base = slugify(product.external_id) || "item";
  const namePart = slugify(product.name);
  return namePart ? `${base}-${namePart}` : base;
}
