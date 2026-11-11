-- RLS fail-closed — Resortes Colima Fase 1
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfdi_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- catalogs
CREATE POLICY catalogs_select_public ON public.catalogs
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY catalogs_staff_all ON public.catalogs
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- products
CREATE POLICY products_select_public ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (
    visible_web = true
    AND is_active = true
    AND line = 'multiusos'
    AND unit_price IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.catalogs c
      WHERE c.id = products.catalog_id
        AND c.is_public = true
        AND c.line = 'multiusos'
    )
  );

CREATE POLICY products_staff_all ON public.products
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- product_images
CREATE POLICY product_images_select_public ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (public.product_passes_web_filter(product_id));

CREATE POLICY product_images_staff_all ON public.product_images
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- promos: deny anon (no policies for anon)
CREATE POLICY promos_staff_all ON public.promos
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- customers: staff only
CREATE POLICY customers_staff_all ON public.customers
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- orders / order_items: staff only (web writes = service role)
CREATE POLICY orders_staff_all ON public.orders
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY order_items_staff_all ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- custom_requests
CREATE POLICY custom_requests_insert_anon ON public.custom_requests
  FOR INSERT
  TO anon
  WITH CHECK (status = 'received' AND order_id IS NULL);

CREATE POLICY custom_requests_staff_select ON public.custom_requests
  FOR SELECT
  TO authenticated
  USING (public.auth_is_staff());

CREATE POLICY custom_requests_staff_update ON public.custom_requests
  FOR UPDATE
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- income / expense / cfdi
CREATE POLICY income_staff_all ON public.income_entries
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY expense_staff_all ON public.expense_entries
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY cfdi_staff_all ON public.cfdi_links
  FOR ALL
  TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- profiles
CREATE POLICY profiles_staff_select ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.auth_is_staff());

CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.auth_is_owner())
  WITH CHECK (public.auth_is_owner());

CREATE POLICY profiles_owner_insert ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.auth_is_owner());

-- app_settings: staff read, owner update shipping_fee only (trigger blocks threshold)
CREATE POLICY app_settings_staff_select ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (public.auth_is_staff());

CREATE POLICY app_settings_owner_update ON public.app_settings
  FOR UPDATE
  TO authenticated
  USING (public.auth_is_owner())
  WITH CHECK (public.auth_is_owner());

-- Grants mínimos para roles Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.catalogs TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT INSERT ON public.custom_requests TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
