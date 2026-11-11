# Propuesta Security Engineer — matriz RLS para `SCHEMA.md`

Alineada a [`SEGURIDAD.md`](SEGURIDAD.md) §4, §9 y §13.  
Uso: **Sistema** sustituye la sección «RLS (principios…)» y actualiza «Storage» de `SCHEMA.md` con el texto de abajo. Este archivo no es el contrato: el contrato sigue siendo SEGURIDAD §4. No implementa SQL ni carga datos.

---

## Texto sugerido para `SCHEMA.md` — sustituir la sección Storage

## Storage (buckets; políticas alineadas a SEGURIDAD §9)

| Bucket | Lectura | Escritura |
|--------|---------|-----------|
| `product-images` | Pública **solo** objetos de productos que pasan el filtro web de `products` (`visible_web`, `is_active`, línea/catálogo público). Sin listing de objetos ajenos al catálogo publicado. | Solo staff |
| `custom-samples` | **Solo staff** (download firmado o proxy admin). Nunca público. | Staff + **upload firmado acotado** desde el form público (TTL corto, path opaco, MIME/size allowlist) |
| `cfdi-attachments` | **Solo staff** | Solo staff |

Público **solo** fotos de catálogo web. Samples y CFDI nunca públicos. Sin listing público de buckets sensibles.

---

## Texto sugerido para `SCHEMA.md` — sustituir la sección RLS

## RLS (contrato; alineado a SEGURIDAD §4)

`ENABLE ROW LEVEL SECURITY` en **todas** las tablas de negocio. Sin política explícita que permita → **denegar**.

Helpers de política (intent): `auth_is_staff()`, `auth_is_owner()`. Se evalúan solo contra `profiles` (sesión válida, `is_active = true`, rol `owner` o `manager`). **No** usar claims JWT sueltos.

Service role **bypasea RLS**: solo servidor (webhook Stripe; alta de `orders` / `order_items` / `income_entries` en checkout web). Nunca en el cliente.

### Matriz tabla × anon × staff

| Tabla | Anon / no staff | Staff (`auth_is_staff`) | Notas |
|-------|-----------------|-------------------------|-------|
| `catalogs` | `SELECT` si `is_public = true` | CRUD | Automotriz y no públicos: invisibles. Doble condición vía `is_public` (la línea automotriz no es pública). |
| `products` | `SELECT` si `visible_web = true` **AND** `is_active = true` **AND** línea/catálogo público (`line = 'multiusos'` **y** el catálogo padre con `is_public = true`) | CRUD | Defensa en profundidad: no confiar solo en un flag. Cero filas automotriz o no web. |
| `product_images` | `SELECT` si el producto padre **pasa el mismo filtro público** de `products` | CRUD | Condición con `EXISTS` al producto; no autorizar solo por `storage_path`. |
| `promos` | **Denegar** `SELECT` (y el resto) en Fase 1 | CRUD | Obligatorio en RLS. La app pública **no** consulta esta tabla. No es «mientras `visible_web = false`»: es deny total a anon. |
| `customers` | Denegar | CRUD | PII. |
| `orders` | Denegar (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) | CRUD | Altas del checkout web **solo** con service role en API/servidor, nunca con la clave `anon`. |
| `order_items` | Denegar | CRUD | Igual: writes públicos solo service role. Snapshot de precio lo calcula el servidor (SEGURIDAD §7). |
| `custom_requests` | **`INSERT` acotado** (ver intent abajo). `SELECT`/`UPDATE`/`DELETE` **denegar** | `SELECT` + `UPDATE`. `DELETE`: no hay política explícita en Fase 1 → **denegar** hasta que exista | Anon no elige `status` ni `order_id`. Anon no lee el inbox ni solicitudes ajenas. |
| `income_entries` | Denegar | CRUD | Stripe escribe con service role tras webhook firmado. |
| `expense_entries` | Denegar | CRUD | |
| `cfdi_links` | Denegar | CRUD | |
| `profiles` | Denegar | `SELECT` del equipo. `UPDATE` de `role` / `is_active` **solo** `auth_is_owner()`. `INSERT` no es self-serve: alta controlada (owner o proceso Auth / service role). Manager **no** se auto-promueve ni activa/desactiva cuentas. | Authz en RLS, no solo en la UI `/admin/equipo`. |

Owner y manager tienen el mismo CRUD operativo en Fase 1 (pedidos, clientes, catálogo, personalizados, ingresos, egresos, CFDI). La única diferencia enforcing en RLS es equipo: `role` / `is_active`.

### Intent `custom_requests` — `INSERT` anon

- **`WITH CHECK`:** `status = 'received'` **y** `order_id IS NULL`.
- Columnas permitidas: intake canónico (diámetros, vueltas, calibre, largo, tipo, unidad, espacio, cantidad) + contacto (`contact_name`, `contact_phone`, `contact_notes`) + paths de imagen **después** de upload firmado.
- En API (strip) **y** en RLS (`WITH CHECK`): rechazar o ignorar `status`, `order_id` y cualquier otro campo privilegiado del payload. Un `INSERT` anon con `status = 'converted'` o `order_id` no nulo → **rechazado**.

### Anon no ve (API, RLS ni Storage)

- Línea automotriz (`catalogs` no públicos, `products` automotriz o `visible_web = false`).
- `promos` (Fase 1: ninguna en público).
- `customers`.
- `orders` / `order_items`.
- `income_entries`, `expense_entries`.
- `cfdi_links` y bucket `cfdi-attachments`.
- `profiles`.
- Inbox de `custom_requests` (sin `SELECT` anon) y bucket `custom-samples`.

### Pruebas de aceptación (clave `anon`) — criterio para cuando exista SQL

1. `products` → cero filas automotriz / `visible_web = false` / inactivas / catálogo no público.
2. `promos`, `customers`, `orders`, `order_items`, `profiles`, `income_entries`, `expense_entries`, `cfdi_links` → vacío o denegado.
3. `INSERT` en `custom_requests` con `status = 'converted'` o `order_id` asignado → rechazado. `SELECT` anon sobre la tabla → denegado.
4. Lectura directa de Storage en `custom-samples` y `cfdi-attachments` → denegada.

Hasta que existan políticas SQL + esas pruebas + firma del Gerente Seguridad, **no** cargar datos productivos ni PII real.

---

## Huecos que esta propuesta cierra frente al SCHEMA actual

1. Matriz por tabla (no solo por área), con ops anon / staff explícitas.
2. `product_images` incluida; lectura anon atada al producto padre público.
3. `promos`: deny `SELECT` anon en Fase 1 (ya no «mientras `visible_web = false`»).
4. `products` / `catalogs`: doble (o triple) condición pública + no automotriz.
5. `custom_requests`: allowlist + `WITH CHECK`; deny lectura y mutación anon.
6. `orders` / `order_items`: writes públicos solo service role, documentado.
7. `profiles`: `role` / `is_active` solo owner, en RLS.
8. Lista explícita «anon no ve».
9. Storage por bucket, ya no «tentativo».

Pendiente de Sistema en `FLUJOS.md` (SEGURIDAD §13; fuera de este texto pero no olvidar): rate limit + allowlist y sin lectura pública del inbox en §3; anti-tampering de precios y actor DB (service role vs sesión) en §5; enlace a esta matriz owner/manager en §1/§2.

Re-revisión: Security Reviewer cuando Sistema aplique esto en `SCHEMA.md`. Después, Security Engineer traduce §4 a SQL + tests con clave `anon`.
