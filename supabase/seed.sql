-- Fixtures de prueba (sin PII real). Solo para local / tests RLS.
INSERT INTO public.catalogs (id, code, name, line, is_public, sort_order)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'multiusos_105',
    'Multiusos 105',
    'multiusos',
    true,
    1
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'multiusos_56',
    'Multiusos 56',
    'multiusos',
    true,
    2
  ),
  (
    '11111111-1111-1111-1111-111111111199',
    'automotriz',
    'Automotriz (interno)',
    'automotriz',
    false,
    99
  )
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.products (
  id,
  catalog_id,
  external_id,
  name,
  unit_price,
  line,
  is_active,
  visible_web
)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'M-001',
    'Resorte multiusos demo',
    150.00,
    'multiusos',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222299',
    '11111111-1111-1111-1111-111111111199',
    'A-001',
    'Resorte automotriz interno',
    200.00,
    'automotriz',
    true,
    false
  )
ON CONFLICT (catalog_id, external_id) DO NOTHING;

INSERT INTO public.customers (id, name, phone, allows_credit)
VALUES (
  '33333333-3333-3333-3333-333333333301',
  'Cliente fixture',
  '+523331234567',
  false
)
ON CONFLICT DO NOTHING;
