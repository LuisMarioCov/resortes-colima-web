-- Storage buckets (políticas alineadas SEGURIDAD §9)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('custom-samples', 'custom-samples', false),
  ('cfdi-attachments', 'cfdi-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.storage_product_id_from_path(object_name text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  seg text;
BEGIN
  seg := split_part(object_name, '/', 1);
  BEGIN
    RETURN seg::uuid;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
END;
$$;

-- product-images: lectura pública solo si el path referencia producto web publicado
-- Convención path: {product_id}/{filename}
CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'product-images'
    AND public.product_passes_web_filter(
      public.storage_product_id_from_path(name)
    )
  );

CREATE POLICY product_images_staff_write ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'product-images' AND public.auth_is_staff()
  )
  WITH CHECK (
    bucket_id = 'product-images' AND public.auth_is_staff()
  );

-- custom-samples: solo staff lectura; upload anon vía signed URL (service role crea objeto)
CREATE POLICY custom_samples_staff ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'custom-samples' AND public.auth_is_staff())
  WITH CHECK (bucket_id = 'custom-samples' AND public.auth_is_staff());

-- cfdi-attachments: solo staff
CREATE POLICY cfdi_attachments_staff ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'cfdi-attachments' AND public.auth_is_staff())
  WITH CHECK (bucket_id = 'cfdi-attachments' AND public.auth_is_staff());
