-- Tests RLS con rol anon (fixtures en seed.sql)
-- Ejecutar: psql $DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/rls_anon_test.sql
-- O: npx supabase db test (si pgTAP está habilitado en local)

BEGIN;

CREATE TEMP TABLE IF NOT EXISTS rls_test_results (
  test_name text PRIMARY KEY,
  passed boolean NOT NULL,
  detail text
);

CREATE OR REPLACE FUNCTION rls_assert(name text, cond boolean, detail text DEFAULT '')
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO rls_test_results (test_name, passed, detail)
  VALUES (name, cond, detail)
  ON CONFLICT (test_name) DO UPDATE
  SET passed = EXCLUDED.passed, detail = EXCLUDED.detail;
  IF NOT cond THEN
    RAISE EXCEPTION 'RLS test falló: % — %', name, detail;
  END IF;
END;
$$;

SET LOCAL role anon;

-- 1. products: solo multiusos visible_web
DO $$
DECLARE
  n_auto int;
  n_hidden int;
BEGIN
  SELECT count(*) INTO n_auto FROM public.products WHERE line = 'automotriz';
  SELECT count(*) INTO n_hidden FROM public.products WHERE visible_web = false;
  PERFORM rls_assert(
    'products_sin_automotriz_anon',
    n_auto = 0,
  'anon vio ' || n_auto::text || ' filas automotriz'
  );
  PERFORM rls_assert(
    'products_visible_web_anon',
    n_hidden = 0,
    'anon vio ' || n_hidden::text || ' filas no visibles'
  );
END;
$$;

-- 2. promos, customers, orders vacíos / denegados
DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM public.promos;
  PERFORM rls_assert('promos_anon_deny', n = 0, 'count=' || n::text);
  SELECT count(*) INTO n FROM public.customers;
  PERFORM rls_assert('customers_anon_deny', n = 0, 'count=' || n::text);
  SELECT count(*) INTO n FROM public.orders;
  PERFORM rls_assert('orders_anon_deny', n = 0, 'count=' || n::text);
  SELECT count(*) INTO n FROM public.profiles;
  PERFORM rls_assert('profiles_anon_deny', n = 0, 'count=' || n::text);
  SELECT count(*) INTO n FROM public.income_entries;
  PERFORM rls_assert('income_anon_deny', n = 0, 'count=' || n::text);
END;
$$;

-- 3. custom_requests INSERT inválido
DO $$
BEGIN
  BEGIN
    INSERT INTO public.custom_requests (
      status,
      inner_diameter,
      outer_diameter,
      turns,
      wire_gauge,
      length_desired,
      spring_type,
      unit,
      quantity,
      contact_name,
      contact_phone,
      order_id
    ) VALUES (
      'converted',
      1,
      2,
      5,
      '12',
      10,
      'tension',
      'mm',
      1,
      'Test',
      '+523330000001',
      NULL
    );
    PERFORM rls_assert('custom_requests_bad_status', false, 'INSERT debió fallar');
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM rls_assert('custom_requests_bad_status', true, SQLERRM);
  END;
END;
$$;

-- 4. custom_requests INSERT válido + sin SELECT
DO $$
DECLARE
  new_id uuid;
  n int;
BEGIN
  INSERT INTO public.custom_requests (
    inner_diameter,
    outer_diameter,
    turns,
    wire_gauge,
    length_desired,
    spring_type,
    unit,
    quantity,
    contact_name,
    contact_phone
  ) VALUES (
    1,
    2,
    5,
    '12',
    10,
    'tension',
    'mm',
    1,
    'Fixture',
    '+523330000099'
  )
  RETURNING id INTO new_id;
  PERFORM rls_assert('custom_requests_insert_ok', new_id IS NOT NULL, '');
  SELECT count(*) INTO n FROM public.custom_requests;
  PERFORM rls_assert('custom_requests_no_select_anon', n = 0, 'count=' || n::text);
END;
$$;

SELECT test_name, passed, detail FROM rls_test_results ORDER BY test_name;

ROLLBACK;
