-- Resortes Colima Fase 1 — schema, integridad, helpers
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers auth (evalúan profiles, no JWT claims sueltos)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
      AND p.role IN ('owner', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
      AND p.role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.product_passes_web_filter(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products pr
    JOIN public.catalogs c ON c.id = pr.catalog_id
    WHERE pr.id = p_product_id
      AND pr.visible_web = true
      AND pr.is_active = true
      AND pr.line = 'multiusos'
      AND pr.unit_price IS NOT NULL
      AND c.is_public = true
      AND c.line = 'multiusos'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('owner', 'manager')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  line text NOT NULL CHECK (line IN ('multiusos', 'automotriz')),
  is_public boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.catalogs (id) ON DELETE RESTRICT,
  external_id text NOT NULL,
  name text NOT NULL,
  sku text,
  description text,
  tech_sheet jsonb,
  unit_price numeric(12, 2),
  currency text NOT NULL DEFAULT 'MXN',
  line text NOT NULL CHECK (line IN ('multiusos', 'automotriz')),
  is_active boolean NOT NULL DEFAULT true,
  visible_web boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (catalog_id, external_id),
  CHECK (
    (visible_web = false)
    OR (line = 'multiusos')
  ),
  CHECK (
    (visible_web = false)
    OR (unit_price IS NOT NULL)
  )
);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products (id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES public.catalogs (id) ON DELETE CASCADE,
  name text NOT NULL,
  promo_price numeric(12, 2),
  percent_off numeric(5, 2),
  starts_at timestamptz,
  ends_at timestamptz,
  visible_web boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (product_id IS NOT NULL AND catalog_id IS NULL)
    OR (product_id IS NULL AND catalog_id IS NOT NULL)
  )
);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  allows_credit boolean NOT NULL DEFAULT false,
  is_automotive_existing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  channel text NOT NULL CHECK (channel IN ('web', 'whatsapp', 'phone', 'counter')),
  status text NOT NULL CHECK (
    status IN (
      'cotizado',
      'pendiente',
      'hecho',
      'enviado',
      'cancelado'
    )
  ),
  customer_id uuid REFERENCES public.customers (id) ON DELETE SET NULL,
  customer_name_snapshot text NOT NULL,
  customer_phone_snapshot text,
  customer_email_snapshot text,
  line_focus text NOT NULL CHECK (line_focus IN ('multiusos', 'custom', 'automotive', 'mixed')),
  is_express boolean NOT NULL DEFAULT false,
  promised_by timestamptz,
  shipping_to text,
  shipping_fee numeric(12, 2) NOT NULL DEFAULT 0,
  subtotal numeric(12, 2) NOT NULL,
  total numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'MXN',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  notes_internal text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL,
  line_total numeric(12, 2) NOT NULL,
  is_custom boolean NOT NULL DEFAULT false,
  is_automotive boolean NOT NULL DEFAULT false
);

CREATE TABLE public.custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'received' CHECK (
    status IN (
      'received',
      'sent_to_whatsapp',
      'quoted',
      'converted',
      'abandoned'
    )
  ),
  inner_diameter numeric NOT NULL,
  outer_diameter numeric NOT NULL,
  turns numeric NOT NULL,
  wire_gauge text NOT NULL,
  length_desired numeric NOT NULL,
  spring_type text NOT NULL CHECK (spring_type IN ('tension', 'compression', 'torsion')),
  unit text NOT NULL CHECK (unit IN ('in', 'mm')),
  coil_spacing numeric,
  quantity numeric NOT NULL CHECK (quantity > 0),
  sample_image_path text,
  measurement_image_path text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_notes text,
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.income_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers (id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (
    kind IN (
      'payment',
      'deposit_50',
      'note_cash',
      'stripe',
      'credit_settlement',
      'other'
    )
  ),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'MXN',
  method text NOT NULL CHECK (method IN ('cash', 'transfer', 'stripe', 'other')),
  stripe_payment_intent_id text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  recorded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX income_entries_stripe_pi_unique
  ON public.income_entries (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TABLE public.expense_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  vendor_name text,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'MXN',
  method text NOT NULL CHECK (method IN ('cash', 'transfer', 'other')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  recorded_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cfdi_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'stamped', 'cancelled')),
  uuid_cfdi text,
  serie_folio text,
  kubox_note text,
  pdf_storage_path text,
  xml_storage_path text,
  recorded_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  stamped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value_numeric numeric(12, 2),
  value_text text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value_numeric)
VALUES ('shipping_free_threshold_mxn', 2999);

INSERT INTO public.app_settings (key, value_numeric)
VALUES ('shipping_fee_mxn', NULL);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER catalogs_updated_at
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER promos_updated_at
  BEFORE UPDATE ON public.promos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER custom_requests_updated_at
  BEFORE UPDATE ON public.custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER income_entries_updated_at
  BEFORE UPDATE ON public.income_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER expense_entries_updated_at
  BEFORE UPDATE ON public.expense_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER cfdi_links_updated_at
  BEFORE UPDATE ON public.cfdi_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- visible_web vs catálogo no público
CREATE OR REPLACE FUNCTION public.enforce_product_visible_web_catalog()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cat public.catalogs%ROWTYPE;
BEGIN
  IF NEW.visible_web = true THEN
    SELECT * INTO cat FROM public.catalogs WHERE id = NEW.catalog_id;
    IF NOT FOUND OR cat.is_public = false OR cat.line <> 'multiusos' THEN
      RAISE EXCEPTION 'visible_web no permitido: catálogo no público o no multiusos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_visible_web_catalog
  BEFORE INSERT OR UPDATE OF visible_web, catalog_id ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_product_visible_web_catalog();

CREATE OR REPLACE FUNCTION public.catalog_unpublic_hides_products()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_public = false AND (OLD.is_public IS DISTINCT FROM NEW.is_public) THEN
    UPDATE public.products
    SET visible_web = false
    WHERE catalog_id = NEW.id AND visible_web = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER catalogs_unpublic_products
  AFTER UPDATE OF is_public ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.catalog_unpublic_hides_products();

-- Owner-only: profiles.role / is_active, customers.allows_credit
CREATE OR REPLACE FUNCTION public.enforce_owner_only_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.is_active IS DISTINCT FROM NEW.is_active)
     AND NOT public.auth_is_owner() THEN
    RAISE EXCEPTION 'profiles.role/is_active sólo mutable por owner';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_owner_only_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_owner_only_profile_fields();

CREATE OR REPLACE FUNCTION public.enforce_owner_only_allows_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.allows_credit IS DISTINCT FROM NEW.allows_credit
     AND NOT public.auth_is_owner() THEN
    RAISE EXCEPTION 'customers.allows_credit sólo mutable por owner';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER customers_owner_only_credit
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_owner_only_allows_credit();

-- app_settings: umbral fijo; shipping_fee sólo owner
CREATE OR REPLACE FUNCTION public.enforce_app_settings_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.key = 'shipping_free_threshold_mxn' THEN
    RAISE EXCEPTION 'shipping_free_threshold_mxn no es mutable en operación';
  END IF;
  IF NEW.key = 'shipping_fee_mxn' AND NOT public.auth_is_owner() THEN
    RAISE EXCEPTION 'shipping_fee_mxn sólo mutable por owner';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER app_settings_enforce
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_app_settings_update();

-- custom_requests: INSERT anónimo forzar status/order_id
CREATE OR REPLACE FUNCTION public.enforce_custom_request_public_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
  IF NEW.status <> 'received' OR NEW.order_id IS NOT NULL THEN
    RAISE EXCEPTION 'INSERT anónimo: status=received y order_id null';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER custom_requests_public_insert
  BEFORE INSERT ON public.custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_custom_request_public_insert();
