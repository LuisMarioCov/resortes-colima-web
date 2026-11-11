# QA Admin — criterios, casos y regresiones (Fase 1)

Departamento: **Sistema interno** (QA Sistema). Reporta a **Gerente Sistema**.  
Estado: **borrador de plan**. Fase actual = arquitectura; no hay implementación ni entorno que ejecutar.  
Idioma de evidencia y reportes: español MX.  
Este documento **no** es código de producto ni políticas SQL.

Fuentes canónicas: [`ADMIN_IA.md`](ADMIN_IA.md), [`SCHEMA.md`](SCHEMA.md), [`FLUJOS.md`](FLUJOS.md), [`SEGURIDAD.md`](SEGURIDAD.md), [`CATALOGO.md`](CATALOGO.md). El contrato de authz es `SEGURIDAD.md` §4 (la matriz de `SCHEMA.md` debe coincidir).

---

## 0. Cómo se declara «listo»

QA **bloquea** el listo si hay fallos conocidos, aunque la UI se vea completa.

**Gate de Seguridad (bloqueante, antes de cualquier PII o dato productivo):**

1. Políticas SQL de RLS en todas las tablas de negocio (fail-closed: sin política → denegar).
2. Suite **QA-RLS-*** ejecutada con la clave `anon` (nunca con service role) contra **datos de prueba / seed**.
3. Firma del Gerente Seguridad en el checklist de `SEGURIDAD.md` §10.

Hasta que esos tres puntos cierren, Tester no usa datos reales y QA no aprueba carga productiva.

Huecos que no bloquean este plan, pero sí pueden cambiar casos después:

| Hueco | Dueño | Efecto en QA |
|-------|-------|----------------|
| Estados finales de pedido (D2) | Pedidos | Los casos usan la máquina provisional; se actualizan al cierre de D2 |
| Reglas finas de fiado / anticipo / conciliación | Finanzas | Casos de borde de `credit_settlement` y saldos se ampliarán |
| Pedidos de Catálogo a Sistema (default `visible_web`, CHECK automotriz, `unit_price` nullable) | Sistema, tras despacho | Añadir casos de constraint cuando el schema los incorpore |
| Ítems §13 de Seguridad aún pendientes en `FLUJOS.md` (rate limit en intake, anti-tampering explícito en §5) | Sistema | Los casos de manipulación y rate limit ya están aquí; FLUJOS debe alinearlos |

---

## 1. Criterios de calidad

Un módulo del admin no se acepta si incumple alguno de estos criterios.

### C1. Auth fail-closed

- Entrar a `/admin` exige **sesión válida y** fila en `profiles` con `is_active = true` **y** `role ∈ {owner, manager}`.
- Sin sesión, sin perfil, rol desconocido o inactivo → login o 403; **cero datos** (igual que anónimo).
- Authz real vive en RLS, no solo en la UI. Manager no muta `role` / `is_active` ni se auto-promueve, aunque intente la API o el cliente Supabase.
- `/admin/equipo` (invitar, activar, desactivar) es solo `owner`.
- Cliente browser: solo URL + clave `anon`. Service role nunca en el bundle ni en `localStorage`. Cookies de sesión: HttpOnly, Secure, SameSite `Lax` (mínimo) en producción.
- Login con rate limit (5–10 fallos / IP / 15 min) y mensajes que no confirmen si el email existe.

### C2. Pedidos multicanal

- Un solo modelo `orders` para `web`, `whatsapp`, `phone` y `counter`.
- Alta en admin: canal, cliente (buscar o crear), líneas de producto o libres, flag automotriz en línea, express + `promised_by`, totales.
- Automotriz **solo** en admin; nunca origen web. En alta: solo si el cliente ya es automotriz existente o hay confirmación interna.
- No inventar precios. No hay stock ni descuento de inventario en ningún paso.
- Cambio de estado: solo staff autenticado; estados provisionales según `FLUJOS.md` (se congelan con D2).
- Pedido web entra ya creado por el servidor (service role); el admin lo opera, no lo inventa el anónimo.

### C3. Ingresos ≠ egresos

- Módulos, rutas y tablas **separados** (`/admin/ingresos` vs `/admin/egresos`; `income_entries` vs `expense_entries`).
- No se puede dar de alta un gasto desde ingresos, ni un cobro desde egresos.
- Ingresos: `kind ∈ {payment, deposit_50, note_cash, stripe, credit_settlement, other}`; monto `> 0`; se prefiere `order_id` no nulo.
- `note_cash` = efectivo local (`method = cash`).
- Anticipo de personalizado = `deposit_50` ligado al pedido.
- Egresos: categoría + proveedor + monto `> 0`; no exigen pedido en MVP.
- Registrar **todo**. Anónimo: denegar ambas tablas.

### C4. CFDI = vínculo manual

- El sistema **no** emite CFDI ni sustituye a Kubox. Prohibido scraper o API no oficial.
- Flujo: el usuario timbra en Kubox y pega `uuid_cfdi` / `serie_folio` / estado; PDF/XML opcional en `cfdi-attachments`.
- Estados: `pending` \| `stamped` \| `cancelled`. Siempre ligado a `order_id`.
- Bucket `cfdi-attachments`: solo staff (lectura y escritura).

### C5. RLS y superficie anónima

- `ENABLE ROW LEVEL SECURITY` en todas las tablas de negocio.
- Con clave `anon`, el anónimo **no ve**: automotriz, promos, clientes, pedidos e ítems, ingresos, egresos, CFDI, `profiles`, inbox de `custom_requests`, ni Storage de samples/CFDI.
- Productos públicos: solo si se cumplen **todas** las condiciones (`visible_web`, `is_active`, línea y catálogo `multiusos` / `is_public`). Un solo flag no basta.
- `promos`: deny total de SELECT anónimo en Fase 1 (no es «filtrar `visible_web = false`»).
- INSERT anónimo de `custom_requests`: allowlist + `WITH CHECK` (`status = 'received'`, `order_id IS NULL`); sin SELECT posterior.
- Altas web de `orders` / `order_items` / cobro Stripe: solo service role en servidor, nunca con `anon`.

### C6. Transversal de UI

- Sin stock/inventario en ninguna pantalla.
- Automotriz visible y secundaria (filtro/chip; nunca ítem de menú de marketing).
- Promos editables en admin; `visible_web` default `false`; encender `visible_web` en un producto automotriz debe ser imposible.
- Español MX. Fail-closed en toda ruta bajo `/admin`.

---

## 2. Casos por módulo y rol

Convención: **P** = paso / condición; **E** = esperado. Roles de prueba: `anon` (clave anónima, sin sesión), `manager`, `owner`, `inactivo` (sesión con `is_active = false`), `sin_perfil` (sesión Auth sin fila en `profiles`).

Datos: **solo seed**. Nunca PII real hasta el gate.

### 2.1 Auth fail-closed (`QA-AUTH`)

| ID | Rol | Caso | Esperado | Regresión |
|----|-----|------|----------|-----------|
| QA-AUTH-01 | anon | Abrir `/admin`, `/admin/pedidos` y cualquier ruta del shell | Redirect a login; ningún payload de pedidos, clientes o finanzas | sí |
| QA-AUTH-02 | sin_perfil | Sesión Auth válida, sin fila en `profiles` | Denegar igual que anónimo (login/403, cero datos) | sí |
| QA-AUTH-03 | — | Sesión con `role` desconocido (p. ej. valor no `owner`/`manager`) | Denegar | sí |
| QA-AUTH-04 | inactivo | `is_active = false`, rol `owner` o `manager` | Denegar; el usuario no opera ni lee | sí |
| QA-AUTH-05 | manager | Login correcto | Entra al shell; ve Pedidos, Personalizados, Ingresos, Egresos, Clientes, Catálogo, CFDI; **no** ve Equipo (o 403) | sí |
| QA-AUTH-06 | owner | Login correcto | Entra al shell **y** a `/admin/equipo` | |
| QA-AUTH-07 | manager | Pedir `/admin/equipo` por URL directa y por API | 403 / denegado; no lista ni muta `profiles` sensibles | sí |
| QA-AUTH-08 | anon | Inspeccionar bundle / red del admin | No hay `SERVICE_ROLE` ni secretos; solo URL + clave `anon` | sí |
| QA-AUTH-09 | — | Cookies de sesión en producción | HttpOnly, Secure, SameSite `Lax` (mínimo); access token **no** en `localStorage` | |
| QA-AUTH-10 | anon | 5–10 logins fallidos desde la misma IP en 15 min | `429` + Retry-After; mensaje genérico (no revelar si el email existe) | |
| QA-AUTH-11 | manager | Tras desactivación por un owner, refrescar o reabrir `/admin` | Sesión inutilizable; cero datos | sí |

### 2.2 RLS con clave `anon` — gate (`QA-RLS`)

Ejecutar **antes** de datos reales, con el cliente Supabase y la clave `anon` (sin Auth de staff). Sembrar primero, con service role en un entorno de prueba, filas de control: producto automotriz, producto `visible_web = false`, producto inactivo, producto multiusos publicado, promo, cliente, pedido + ítems, ingreso, egreso, CFDI, profile, `custom_request`, y objetos en los tres buckets.

| ID | Caso | Esperado | Regresión |
|----|------|----------|-----------|
| QA-RLS-01 | `SELECT` `products` | Solo filas que cumplen el AND público (multiusos, `is_active`, `visible_web`, catálogo `is_public`). **Cero** automotriz, `visible_web = false` o inactivas | sí (gate) |
| QA-RLS-02 | `SELECT` `catalogs` | Solo `is_public = true`. Cero automotriz / no públicos | sí (gate) |
| QA-RLS-03 | `SELECT` `product_images` | Solo imágenes cuyo producto padre pasa el mismo filtro. Una imagen de producto automotriz o no web → no aparece, aunque se conozca el `storage_path` | sí (gate) |
| QA-RLS-04 | `SELECT` / escritura en `promos` | Vacío o denegado (deny total Fase 1, aunque `visible_web` estuviera en `true`) | sí (gate) |
| QA-RLS-05 | `SELECT` `customers`, `orders`, `order_items`, `profiles`, `income_entries`, `expense_entries`, `cfdi_links` | Vacío o denegado | sí (gate) |
| QA-RLS-06 | `INSERT` `orders` u `order_items` con `anon` | Rechazado (las altas web son service role) | sí (gate) |
| QA-RLS-07 | `INSERT` `custom_requests` con `status = 'converted'` | Rechazado | sí (gate) |
| QA-RLS-08 | `INSERT` `custom_requests` con `order_id` no nulo | Rechazado | sí (gate) |
| QA-RLS-09 | `INSERT` válido (intake + contacto, sin campos privilegiados) | Aceptado con `status = 'received'` y `order_id` nulo | sí (gate) |
| QA-RLS-10 | `SELECT` / `UPDATE` / `DELETE` `custom_requests` (incluida la fila recién insertada) | Denegado; el inbox no es público | sí (gate) |
| QA-RLS-11 | Lectura directa Storage `custom-samples` y `cfdi-attachments` (URL o SDK, con path conocido) | Denegada | sí (gate) |
| QA-RLS-12 | Lectura Storage `product-images` de foto web publicada vs foto automotriz / no publicada | Solo la publicada | sí (gate) |
| QA-RLS-13 | Listing de buckets sensibles | No hay listing público | |
| QA-RLS-14 | `UPDATE` / `DELETE` en cualquier tabla de negocio con `anon` | Denegado | sí |
| QA-RLS-15 | Producto con un solo flag «abierto» (p. ej. `visible_web = true` pero línea automotriz, o activo pero `visible_web = false`) | No aparece en SELECT anon | sí |

**Staff (sesión manager u owner, misma seed), no son el gate pero sí aceptación:**

| ID | Rol | Caso | Esperado |
|----|-----|------|----------|
| QA-RLS-16 | manager | SELECT de clientes, pedidos, finanzas, CFDI, inbox, automotriz y promos | Ve las filas de seed (CRUD operativo Fase 1) |
| QA-RLS-17 | manager | `UPDATE` de `profiles.role` o `is_active` (propio o ajeno), vía cliente o API | Denegado por RLS, no solo por UI |
| QA-RLS-18 | owner | `UPDATE` de `is_active` de un manager | Permitido; el manager queda fuera (QA-AUTH-11) |
| QA-RLS-19 | inactivo | SELECT de `orders` / `customers` con su JWT | Denegado (no es staff) |

### 2.3 Pedidos multicanal (`QA-PED`)

| ID | Rol | Caso | Esperado | Regresión |
|----|-----|------|----------|-----------|
| QA-PED-01 | manager | Alta `/admin/pedidos/nuevo` canal `whatsapp`, cliente existente, líneas de catálogo | Se crea un `orders` unificado; `channel = whatsapp`; ítems con snapshot de nombre y precio | sí |
| QA-PED-02 | manager | Alta canal `phone` y alta canal `counter` | Mismo modelo; el canal queda registrado y es filtrable en la lista | sí |
| QA-PED-03 | manager | Alta con cliente nuevo (no está en maestro) | Crea `customers` y lo liga; snapshots de nombre/teléfono | |
| QA-PED-04 | manager | Línea libre / personalizada (`product_id` nulo, `is_custom`) | Permitido; descripción y precio capturados, sin inventar precio web | |
| QA-PED-05 | manager | Línea automotriz en cliente `is_automotive_existing = true` | `order_items.is_automotive` y/o `line_focus` coherentes; visible en admin | sí |
| QA-PED-06 | manager | Línea automotriz en cliente **nuevo** sin confirmación interna | Bloqueado o pide confirmación; no se cuela como origen web | sí |
| QA-PED-07 | manager | Express: flag + `promised_by` | Ambos quedan; filtro express en la lista | |
| QA-PED-08 | manager | Filtros de lista: estado, canal, línea (multiusos/custom/automotriz), express | Cada filtro acota bien; automotriz es chip/filtro, no menú de marketing | |
| QA-PED-09 | manager | Cambio de estado por la máquina provisional (`draft` → … → `closed`, o `cancelled` desde no final) | Solo staff; transiciones inválidas rechazadas; `updated_at` cambia | sí |
| QA-PED-10 | anon | Intentar cambiar estado o crear pedido por API / cliente `anon` | Denegado | sí |
| QA-PED-11 | manager | Pedido canal `web` (seed de checkout) | Visible en lista; IDs Stripe de solo lectura; no se «inventa» el pago desde success URL | |
| QA-PED-12 | manager / owner | En detalle: líneas, ingresos ligados, CFDI, notas internas | Bloques presentes; registrar cobro y pegar CFDI no mezclan módulos | |
| QA-PED-13 | — | Ninguna pantalla de pedido muestra stock ni descuenta inventario | Cumple | sí |
| QA-PED-14 | manager | Cancelar un pedido no final | Pasa a `cancelled`; no borra ingresos ya registrados | |

*Al cerrar D2, revisar QA-PED-09 y QA-PED-14 contra la máquina definitiva.*

### 2.4 Ingresos y egresos (`QA-ING`, `QA-EGR`)

| ID | Rol | Caso | Esperado | Regresión |
|----|-----|------|----------|-----------|
| QA-ING-01 | manager | Navegación: Ingresos y Egresos son rutas y menús distintos | No hay formulario único que escriba en ambas tablas | sí |
| QA-ING-02 | manager | Alta de `payment` ligado a `order_id`, monto `> 0` | Se guarda en `income_entries`; aparece en el pedido | sí |
| QA-ING-03 | manager | Alta `deposit_50` al convertir personalizado | `kind = deposit_50`, ligado al pedido; el pedido puede pasar `awaiting_deposit` → `confirmed` | sí |
| QA-ING-04 | manager | Alta `note_cash` | `kind = note_cash` y `method = cash` (efectivo local); no se etiqueta como Stripe | sí |
| QA-ING-05 | manager | Alta `credit_settlement` en cliente **sin** `allows_credit` | Rechazado o advertido según regla de Finanzas (hoy: exigir `allows_credit`) | |
| QA-ING-06 | manager | Monto `0` o negativo en ingreso | Rechazado | sí |
| QA-ING-07 | manager | Ingreso sin `order_id` | Permitido pero la UX prefiere / avisa ligarlo | |
| QA-ING-08 | — | Cobro Stripe de seed (webhook) | `kind = stripe`; no se duplica al reenviar el mismo evento (idempotencia) | sí |
| QA-EGR-01 | manager | Alta de egreso: categoría (`wire`/`stones`/`tools`/`other`), proveedor, monto `> 0` | Se guarda en `expense_entries`; **no** crea fila en `income_entries` | sí |
| QA-EGR-02 | manager | Egreso sin `order_id` | Permitido (MVP) | |
| QA-EGR-03 | manager | Monto `≤ 0` | Rechazado | sí |
| QA-EGR-04 | manager | Desde `/admin/ingresos` intentar escribir un egreso (UI o request) | Imposible / rechazado | sí |
| QA-ING-09 | anon | SELECT/INSERT en `income_entries` o `expense_entries` | Denegado | sí (gate) |
| QA-ING-10 | manager | Lista de ingresos no muestra egresos y viceversa | Totales no se mezclan | sí |

### 2.5 CFDI vínculo manual (`QA-CFDI`)

| ID | Rol | Caso | Esperado | Regresión |
|----|-----|------|----------|-----------|
| QA-CFDI-01 | manager | En pedido o cola `/admin/cfdi`: pegar UUID, serie-folio, `status = stamped` | Crea/actualiza `cfdi_links` ligado al `order_id`; no llama a Kubox | sí |
| QA-CFDI-02 | manager | Adjuntar PDF/XML opcional | Queda en `cfdi-attachments`; solo staff lo descarga | sí |
| QA-CFDI-03 | manager | Pasar a `cancelled` | Estado actualizado; no borra el pedido | |
| QA-CFDI-04 | — | No existe botón, job o integración que emita CFDI o scrapee Kubox | Cumple | sí |
| QA-CFDI-05 | anon | SELECT `cfdi_links` o lectura del bucket | Denegado | sí (gate) |
| QA-CFDI-06 | manager | Vínculo sin `order_id` | Rechazado (FK obligatoria) | |

### 2.6 Clientes, catálogo, personalizados, equipo

| ID | Rol | Caso | Esperado | Regresión |
|----|-----|------|----------|-----------|
| QA-CLI-01 | manager | Lista y ficha: nombre, teléfono, crédito, flag automotriz, historial, saldo **derivado** | No hay campo suelto de «saldo stock»; el saldo sale de pedidos + ingresos | |
| QA-CAT-01 | manager | CRUD catálogo, promos, fotos; import sin columnas de stock | Automotriz visible como filtro; `visible_web` default off en promos y productos | sí |
| QA-CAT-02 | manager | Encender `visible_web` en un producto automotriz | Imposible (UI + constraint + RLS). No sale en SELECT anon | sí |
| QA-CAT-03 | anon | API / SELECT de promos y de automotriz | Vacío (ya cubierto en QA-RLS-01/04) | sí |
| QA-PER-01 | manager | Inbox `/admin/personalizados`: ve solicitudes; el anónimo no | Staff SELECT; anon no lee | sí |
| QA-PER-02 | manager | CTA WhatsApp (deep link) | Abre WA; **sin** PII sensible en la URL | |
| QA-PER-03 | manager | Convertir a pedido + anticipo 50% | Crea `orders` custom, `income_entries.kind = deposit_50`, `custom_requests.order_id` y status `converted` | sí |
| QA-PER-04 | anon | INSERT con campos privilegiados (ya QA-RLS-07/08) y SELECT del inbox | Rechazado / denegado | sí (gate) |
| QA-EQU-01 | owner | Invitar / activar / desactivar manager | Permitido; no se exponen service keys en la pantalla | sí |
| QA-EQU-02 | manager | Cualquier mutación de rol o `is_active` (UI, API, cliente) | Denegado (QA-AUTH-07 + QA-RLS-17) | sí |
| QA-EQU-03 | manager | Auto-promoción a `owner` | Denegado | sí |

### 2.7 Manipulación de campos (`QA-MAN`)

| ID | Superficie | Ataque | Esperado | Regresión |
|----|------------|--------|----------|-----------|
| QA-MAN-01 | Form público personalizados | Payload con `status = converted` o `order_id` | API strip + RLS rechazan (QA-RLS-07/08) | sí |
| QA-MAN-02 | Checkout web | Cliente envía `unit_price`, `total` o `is_automotive` | El servidor **ignora** precios del cliente; toma precio de DB; rechaza automotriz / no web | sí |
| QA-MAN-03 | Checkout web | Success URL / querystring «pagado» sin webhook | El pedido **no** se marca pagado; no se crea `income_entries` | sí |
| QA-MAN-04 | Admin pedidos | Mass-assignment de `channel = web` + flag automotriz, o de IDs Stripe falsos | Whitelist; automotriz no puede originarse como web; Stripe IDs no se fabrican a mano de forma que simulen un cobro | |
| QA-MAN-05 | Admin / API | Manager envía `profiles.role = owner` | RLS deniega | sí |
| QA-MAN-06 | Admin finanzas | Monto negativo, `kind` inválido, mezclar ingreso en tabla de egresos | Validación + tablas distintas | sí |
| QA-MAN-07 | Webhook Stripe | Evento sin firma o firma inválida | Cero writes | sí |
| QA-MAN-08 | Webhook Stripe | Reenvío del mismo `event.id` / session | Idempotente: un solo ingreso | sí |

---

## 3. Suite de regresión (mínima)

Correr **entera** tras cualquier cambio de auth, RLS, pedidos, finanzas, CFDI, checkout o personalizados. Si alguno falla, el módulo **no** está listo.

1. QA-AUTH-01, 02, 04, 05, 07, 08, 11  
2. QA-RLS-01 a QA-RLS-12, QA-RLS-15, QA-RLS-17 (gate + staff negativo)  
3. QA-PED-01, 02, 05, 06, 09, 10, 13  
4. QA-ING-01, 02, 03, 04, 06, 08, 09, 10 y QA-EGR-01, 03, 04  
5. QA-CFDI-01, 02, 04, 05  
6. QA-CAT-02, QA-PER-03, QA-EQU-02  
7. QA-MAN-01, 02, 03, 05, 07, 08  

---

## 4. Plan para Tester

1. **No ejecutar** contra datos productivos ni PII real. Entorno de preview/dev con seed.
2. **Primero el gate:** suite `QA-RLS-*` con clave `anon` (script o cliente Supabase). Evidencia: resultado de cada query (vacío / error de política / fila publicada), no solo captura de UI. Sin esto, no se avanza a datos reales; se escala a QA y Gerente Sistema, y Seguridad no firma.
3. **Después la UI** con dos cuentas seed (`owner`, `manager`) y un usuario inactivo. Casos `QA-AUTH`, `QA-PED`, `QA-ING`/`QA-EGR`, `QA-CFDI` y el resto de la §2.
4. **Permisos negativos siempre:** usuario sin acceso no ve registros que no le tocan; manager no escala rol; anónimo no lee inbox ni finanzas. Evidencia de red (status 401/403) además de la pantalla.
5. **Pass/fail** por ID, con evidencia (query, HTTP, captura). Fallo del gate o de la suite de regresión = **bloqueante**. Reportar bloqueantes a QA Sistema y Gerente Sistema.
6. QA revisa evidencias y **bloquea el listo** si queda algún fallo conocido, aunque se etiquete como «menor».

Precondiciones de seed (cuando exista entorno): al menos un producto de cada clase (publicado, oculto, inactivo, automotriz), una promo, un cliente con crédito y uno automotriz, un pedido por canal, un personalizado `received`, un ingreso, un egreso, un CFDI de prueba, y objetos en los tres buckets.

---

## 5. Fuera de alcance de este plan (Fase 1)

- Gestión de stock (no existe).
- Sustituto de Kubox / PAC.
- Portal de cliente con login.
- SEO, blog, KPIs de marketing web (son de QA Web).
- MFA, least privilege fino post-Fase 1, conciliación bancaria.

Casos de checkout público y form de personalizados en el sitio se coordinan con QA Web; los de RLS, precios desde DB y `INSERT` acotado **sí** entran aquí porque son contrato de Sistema/Seguridad.

---

## 6. Próximo paso

Cuando Sistema tenga políticas SQL (o un entorno de preview con RLS), Tester ejecuta la suite `QA-RLS-*` con clave `anon` y devuelve evidencias a QA. QA no aprueba carga de datos reales sin esa evidencia y la firma de Seguridad.
