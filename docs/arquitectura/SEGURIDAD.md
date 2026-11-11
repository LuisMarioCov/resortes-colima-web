# SEGURIDAD — Fase 1

Estado: **diseño Gerente Seguridad** (basado en Security Engineer; revisión Security Reviewer de SCHEMA/FLUJOS).  
Stack fijado: Next.js App Router + Supabase (Postgres / Auth / Storage / RLS) + Vercel + Stripe Checkout. **No reabrir.**  
Superficies: app pública + `/admin`. Roles: `owner` | `manager`.  
Principio: **fail-closed** — sin política explícita que permita → denegar.  
Referencias: [`STACK.md`](STACK.md), [`SCHEMA.md`](SCHEMA.md), [`FLUJOS.md`](FLUJOS.md), [`ADMIN_IA.md`](ADMIN_IA.md), rule `seguridad.mdc`.

**Gate:** no cargar datos productivos / PII real hasta que Sistema traduzca §4 a políticas SQL + tests con clave `anon`, y Seguridad firme.

---

## 0. Alcance y superficies

| Superficie | Quién | Riesgo principal |
|------------|-------|------------------|
| Sitio público | Anónimo | Filtrar automotriz / promos / PII; manipular precios; abuso de forms |
| Route Handlers públicos | Anónimo | Flood; sesiones Stripe / `custom_requests` fraudulentas |
| `/admin` | owner / manager | Auth bypass; escalada de rol; perfil inactivo |
| Webhook Stripe | Internet | Forgery / replay; escritura privilegiada sin firma |
| Storage | Anónimo + admin | Lectura de samples / CFDI; upload malicioso |
| Browser | Cualquiera | Service role o secretos en bundle |

**Anónimo NO debe ver (API, RLS ni Storage):** automotriz, promos (Fase 1: ninguna en público), `customers`, `orders` / `order_items`, `income_entries`, `expense_entries`, `cfdi_links`, `profiles`, inbox de `custom_requests`.

---

## 1. HTTPS (obligatorio)

| Control | Acción |
|---------|--------|
| TLS | Deploy solo en **Vercel**; sin origen HTTP plano |
| Force HTTPS | Redirect 301 HTTP→HTTPS en producción (middleware y/o Vercel) |
| HSTS | `Strict-Transport-Security` en prod (`max-age` ≥ 15552000); `includeSubDomains` si el dominio lo permite |
| Cookies | Flag `Secure` en producción (§3) |
| Callbacks | Stripe success/cancel, webhook y Auth Supabase → solo `https://` |
| Preview | HTTPS OK; env/secrets separados de prod; no DB prod en preview |
| Mixed content | Imágenes / assets solo HTTPS |

---

## 2. Auth Supabase

- **Método:** email/password vía Supabase Auth (solo staff; sin portal cliente).
- **Perfil:** `profiles.id = auth.users.id`; `role ∈ {owner, manager}`; `is_active` (default true).
- **Entrada a `/admin`:** sesión válida **y** `profiles.is_active = true` **y** rol válido. Sin fila de perfil, rol desconocido o inactivo → **denegar** (igual que no autenticado).
- **Registro:** no self-serve público; alta controlada (owner / proceso Auth).
- **Helpers RLS (intent):** `auth_is_staff()`, `auth_is_owner()` — políticas solo contra `profiles`, no claims JWT sueltos.

| Capacidad | owner | manager |
|-----------|-------|---------|
| Operación admin (pedidos, clientes, catálogo, personalizados, ingresos, egresos, CFDI) | sí | sí |
| `/admin/equipo`: cambiar `role` / `is_active` | sí | no |
| Auto-promoción a owner | — | denegar |

Diferencias finas adicionales (promos web, borrado financiero, crédito) → sugerencia en §12; Fase 1 mínima = matriz de arriba **enforcing en RLS**, no solo UI.

---

## 3. Hash de passwords y cookies de sesión

| Tema | Control |
|------|---------|
| Passwords | Solo Supabase Auth (hash gestionado). **Prohibido** tabla propia / plaintext |
| Cookies | HttpOnly + Secure + SameSite=`Lax` (mínimo) en prod |
| Almacenamiento | Patrón `@supabase/ssr`; **no** access token en `localStorage` para admin |
| Cliente browser | Solo `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service role | Solo Route Handlers / server; nunca al cliente |

---

## 4. RLS fail-closed (contrato obligatorio)

`ENABLE ROW LEVEL SECURITY` en **todas** las tablas de negocio. Sin política → denegar.  
Service role **bypasea RLS** → solo servidor (§8).

### Matriz (anon vs staff)

| Tabla | Anon / no staff | Staff (`auth_is_staff`) | Notas |
|-------|-----------------|-------------------------|-------|
| `catalogs` | SELECT si `is_public = true` | CRUD | Automotriz / no públicos invisibles |
| `products` | SELECT si `visible_web = true` **AND** `is_active = true` **AND** línea/catálogo público (`line = multiusos` / catálogo `is_public`) | CRUD | Defensa en profundidad: no confiar solo en un flag |
| `product_images` | SELECT si el producto padre pasa filtro público | CRUD | EXISTS al producto; no solo por path |
| `promos` | **Denegar SELECT** Fase 1 | CRUD | RLS obligatorio; app no consulta la tabla en público |
| `customers` | Denegar | CRUD | PII |
| `orders` | Denegar (sin SELECT/INSERT/UPDATE) | CRUD | Altas web solo **service role** en API |
| `order_items` | Denegar | CRUD | Idem |
| `custom_requests` | **INSERT acotado** (§7); SELECT/UPDATE/DELETE denegar | SELECT + UPDATE; DELETE según política | Anon no elige `status` ni `order_id` |
| `income_entries` | Denegar | CRUD | Stripe escribe con service role |
| `expense_entries` | Denegar | CRUD | |
| `cfdi_links` | Denegar | CRUD | |
| `profiles` | Denegar | SELECT equipo; UPDATE `role`/`is_active` **solo owner** | Manager no escala rol |

### Intent `custom_requests` (INSERT anon)

- **WITH CHECK:** `status = 'received'`; `order_id IS NULL`.
- Columnas permitidas: intake canónico + contacto + paths de imagen post-upload firmado.
- Strip en API + CHECK en RLS: ignorar/rechazar `status`, `order_id` u otros campos privilegiados del payload.

### Pruebas de aceptación (clave `anon`)

1. `products` → cero filas automotriz / `visible_web = false`.
2. `promos`, `customers`, `orders`, `profiles`, finanzas, `cfdi_links` → vacío / denegado.
3. INSERT `custom_requests` con `status = converted` o `order_id` set → rechazado.
4. Lectura directa Storage `custom-samples` / `cfdi-attachments` → denegado.

---

## 5. Secretos fuera del repo

| Variable | ¿Público? | Uso |
|----------|-----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Cliente / RSC |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Bajo RLS |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Sí | Checkout client |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Solo servidor |
| `STRIPE_SECRET_KEY` | **No** | Solo servidor |
| `STRIPE_WEBHOOK_SECRET` | **No** | Verificación firma |

- `.env*` con secretos en `.gitignore`; `.env.example` solo nombres + placeholders.
- Vercel: Production / Preview / Development separados; rotar tras exposición.
- Prohibido: `NEXT_PUBLIC_` en service/secret keys; secretos en git, logs o chats.

---

## 6. Rate limit (APIs públicas y auth)

| Endpoint | Límite inicial | Clave | Respuesta |
|----------|----------------|-------|-----------|
| `POST` crear Checkout Session | 5–10 / IP / 15 min | IP | `429` + Retry-After |
| `POST` form personalizados | 5 / IP / 15 min; 3 / teléfono / hora | IP + teléfono normalizado | `429` |
| Login admin | 5–10 fallos / IP / 15 min | IP + email | `429` |

Aplicar **antes** de Stripe/DB. Logs de abuso sin PII completa.

---

## 7. Validación de inputs / anti-manipulación

### Checkout catálogo (crítico)

- **Ignorar** del cliente: `unit_price` / `total`, flete (`shipping_fee`) y flags de línea. Totales y envío se calculan en servidor (umbral 2999, tarifa de `app_settings`).
- Al crear la Checkout Session: el servidor carga productos por `id` desde DB (solo `visible_web && is_active` y catálogo/línea públicos) y calcula totales para la Session. **No hay INSERT** de `orders` ni de `order_items` en este paso.
- Rechazar automotriz / no web en carrito.
- Cantidades > 0 con tope; moneda forzada `MXN`.
- Success URL **no** marca pagado; solo webhook (§8).
- El snapshot de ítems (precios desde la DB) y el alta (`orders` + `order_items` + `income_entries`, status pendiente, ya pagado) ocurren **solo en el webhook firmado**, con service role e idempotencia (§8).

### Form personalizados

- Validar enums/rangos canónicos; contacto requerido; longitud máxima en notes.
- Forzar `status = received`, `order_id = null` en create público.
- Imágenes: solo tras signed upload (§9); MIME/size allowlist.

### Admin

- Whitelist de campos por acción; validar enums de estado y montos > 0.
- No mass-assignment de `profiles.role`, flags automotriz en origen web, etc.

### Datos sensibles

- Cifrado en reposo: plataforma (Supabase / Vercel / Stripe).
- No almacenar PAN; solo IDs Stripe.

---

## 8. Stripe webhook firmado

| Paso | Regla |
|------|-------|
| Body | Raw body para `constructEvent` |
| Firma | `STRIPE_WEBHOOK_SECRET`; sin firma válida → no writes |
| DB | Solo **service role** tras verificación |
| Idempotencia | Por `event.id` / `checkout_session_id` / payment intent; sin cobros duplicados |
| Allowlist eventos | Fase 1: p.ej. `checkout.session.completed` (+ mínimos de fallo si se manejan) |
| Cliente | No confiar en querystring de success |

---

## 9. Storage

| Bucket | Lectura | Escritura |
|--------|---------|-----------|
| `product-images` | **Pública** solo objetos de productos web publicados | Solo staff |
| `custom-samples` | Solo staff (signed download / proxy admin) | Staff + **upload firmado acotado** desde form (TTL corto, path opaco, MIME/size) |
| `cfdi-attachments` | Solo staff | Solo staff |

- Público **solo** fotos de catálogo web. Samples y CFDI nunca públicos.
- Sin listing público de buckets sensibles.

---

## 10. Checklist pre-datos reales

1. HTTPS + HSTS prod.  
2. `/admin` = sesión + perfil activo + rol válido.  
3. Cookies HttpOnly / Secure / SameSite.  
4. RLS ON + matriz §4; tests con `anon`.  
5. Secretos solo en Vercel; scan sin keys en repo.  
6. Rate limit: checkout, personalizados, login.  
7. Precios checkout solo desde DB.  
8. Webhook firmado + service role + idempotencia.  
9. Storage: público solo catálogo web.  
10. Anónimo no lee automotriz, promos, clientes, pedidos, finanzas, CFDI, profiles.

**Firma Seguridad:** __________________ fecha: __________

---

## 11. Amenazas residuales (aceptadas Fase 1)

| ID | Amenaza | Compensación / diferido |
|----|---------|-------------------------|
| R1 | Abuso signed upload samples | Rate limit + TTL + size; Turnstile/scan post-MVP |
| R2 | Enumeración email login | Rate limit; mensajes genéricos; MFA post-MVP |
| R3 | Manager comprometido ve PII/finanzas | CRUD amplio Fase 1; least privilege + audit + MFA después |
| R4 | Service role en endpoint nuevo | Code review Seguridad; allowlist de rutas |
| R5 | `visible_web` mal seteado | Default false; tests RLS |
| R6 | Query pública sin filtro (bug app) | RLS + review Web |
| R7 | Replay Stripe | Idempotencia + allowlist |
| R8 | PII en logs | Redacción; retención corta |
| R9 | Preview con secretos/datos reales | Env separados |
| R10 | Sin MFA | Priorizar MFA owner post-Fase 1 |
| R11 | Flood cuota | Rate limit; WAF si hace falta |
| R12 | Deep link WA con datos en query | No PII sensible en URL |

---

## 12. Hallazgos SCHEMA.md / FLUJOS.md (revisión)

### Qué está bien

- Principio fail-closed declarado; roles `owner`/`manager`; automotriz/`promos` con intención de no exponerse en web.
- FLUJOS §1 fail-closed; §5 menciona firma webhook, service role y rate limit en Checkout.
- Storage buckets lógicos correctos; sin stock en schema.

### Críticos (Sistema debe corregir en docs antes de implementar datos)

1. **Matriz RLS por tabla** en `SCHEMA.md`: hoy es resumen; alinear con §4 de este doc (ops anon / manager / owner).
2. **`product_images` + Storage** ausentes de la matriz RLS; lectura anon atada a producto público.
3. **`promos`:** política anon = deny SELECT Fase 1 (no solo “mientras visible_web=false” en prosa).
4. **`custom_requests`:** allowlist + WITH CHECK; deny SELECT/UPDATE/DELETE a anon; rate limit en FLUJOS §3.
5. **`orders` / `order_items`:** explícito que anon no escribe; altas web solo service role / server.
6. **Checkout FLUJOS §5:** precios/cantidades desde DB; rechazar `unit_price`/`total`/`is_automotive` del cliente.
7. **`profiles`:** UPDATE de `role`/`is_active` solo owner **en RLS** (no solo UI `/equipo`).
8. **Lista explícita “anon no ve”:** automotriz, promos, clientes, pedidos, finanzas, CFDI, profiles, requests ajenas.

### Sugerencias (no bloquean el diseño; priorizar en implementación)

- Matriz owner/manager más fina: quién activa `promos.visible_web`, importa Excel, borra montos, marca `allows_credit` / `is_automotive_existing`.
- Transiciones de estado de pedido documentadas (quién / desde→hasta).
- Rate limit nombrado en FLUJOS §1 (login) y §3 (intake), no solo Checkout.
- Auditoría más allá de `updated_at` / `created_by` en estados y montos.

### Nice-to-have

- Vista/RPC `public_products`; inmutabilidad de ingresos tras cierre; límites MIME ya cubiertos en §9.

---

## 13. Cambios que Sistema debe aplicar

**En `SCHEMA.md`**

1. Sustituir/ampliar § RLS con matriz tabla × anon × staff (alineada a §4).
2. Añadir `product_images` y nota Storage por bucket.
3. Anon: deny `promos`; products/catalogs con doble condición pública + no automotriz.
4. `custom_requests`: INSERT allowlist + WITH CHECK; deny lectura anon.
5. Pedidos/items: writes públicos solo vía service role (documentar).
6. `profiles`: mutaciones sensibles solo owner.
7. Bullets “anon no ve …” explícitos.

**En `FLUJOS.md`**

1. §3: rate limit + allowlist + sin lectura pública del inbox.
2. §5: anti-tampering de precios; actor DB (service role vs sesión) en cada mutación.
3. §1/§2: enlace a matriz owner/manager (equipo en RLS).
4. No dejar authz crítica solo como “ver SEGURIDAD.md” sin el contrato mínimo en SCHEMA.

**No hacer**

- Cambiar stack (Next / Supabase / Vercel / Stripe).
- Implementar código hasta OK del dueño tras arquitectura.

---

## 14. Veredicto Gerente Seguridad

### **APROBADO CON CAMBIOS**

Dirección de SCHEMA/FLUJOS y stack fijado son compatibles con fail-closed. Quedan **cambios documentales obligatorios** (§13) antes de políticas SQL y datos reales. La implementación de RLS/código sigue el gate de §0 y el checklist §10.

| Documento | Veredicto |
|-----------|-----------|
| `STACK.md` | No reabrir (fuera de alcance Seguridad para cambio) |
| `SEGURIDAD.md` | Este documento = contrato de controles Fase 1 |
| `SCHEMA.md` | APROBADO CON CAMBIOS (§13) |
| `FLUJOS.md` | APROBADO CON CAMBIOS (§13) |
| `ADMIN_IA.md` | Aceptable como UI; authz real = RLS §4 (equipo solo owner) |

Re-revisión Security Reviewer cuando Sistema aplique §13; luego Security Engineer traduce §4 a SQL + tests `anon`.
