export type PublicCatalog = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
};

export type PublicProductImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type PublicProduct = {
  id: string;
  external_id: string;
  name: string;
  description: string | null;
  tech_sheet: unknown;
  unit_price: number;
  catalog_id: string;
  catalog_code: string;
  catalog_name: string;
  images: PublicProductImage[];
};

export type CartStorageItem = {
  product_id: string;
  quantity: number;
};
