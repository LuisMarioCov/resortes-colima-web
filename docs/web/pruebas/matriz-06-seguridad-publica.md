# Matriz SEG — Seguridad de la superficie pública

Checks **defensivos** del comportamiento esperado en el sitio público y en sus APIs. No son procedimientos de ataque, ni pruebas de explotación, ni recetas para falsificar firmas o evadir controles.

Alcance: lo documentado en [`SEGURIDAD.md`](../../arquitectura/SEGURIDAD.md) para el anónimo / Route Handlers públicos / webhook / Storage público. **Fuera de esta matriz:** login admin, rate limit de login, `/admin`, mutaciones owner/manager, portal de cliente (no existe).

Varios controles de checkout e intake tienen el detalle de pasos en CHK y PER. Esta suite los apunta para que QA pueda correr un paquete de seguridad en una sola pasada.

**Estado de todos los casos:** Pendiente — sin app.  
Varios dependen de un deploy en Vercel con HTTPS y de las políticas SQL RLS (aún pendientes de firma de Seguridad; gate antes de datos reales).

Fuentes: WEB_IA §§2, 5, 6, 11.4 (HTTPS-01–03, TRV-01–03); SEGURIDAD.md §0, §1, §3, §4, §5, §6, §7, §8, §9, §10; SCHEMA; FLUJOS §3 y §5; STACK.md.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| SEG-001 | Producción solo HTTPS; HTTP redirige 301 a HTTPS | P0 | seguridad | Pendiente — sin app |
| SEG-002 | HSTS en producción (`max-age` ≥ 15552000) | P0 | seguridad | Pendiente — sin app |
| SEG-003 | Sin mixed content: assets solo HTTPS | P0 | seguridad | Pendiente — sin app |
| SEG-004 | Callbacks de Stripe (y cualquier retorno público) solo `https://` | P0 | seguridad | Pendiente — sin app |
| SEG-005 | Preview con env/secrets separados; no DB de prod en preview | P1 | seguridad | Pendiente — sin app |
| SEG-006 | El cliente no expone service role ni secretos | P0 | seguridad | Pendiente — sin app |
| SEG-007 | El anónimo no lee recursos sensibles (aceptación RLS) | P0 | seguridad | Pendiente — sin app |
| SEG-008 | Lectura directa de `custom-samples` y `cfdi-attachments` denegada al anónimo | P0 | seguridad | Pendiente — sin app |
| SEG-009 | `product-images` público solo de publicados; sin listing de buckets sensibles | P0 | seguridad | Pendiente — sin app |
| SEG-010 | No se almacenan PAN; solo IDs de Stripe | P0 | seguridad | Pendiente — sin app |
| SEG-011 | Cookies de producción, si existen en la superficie, llevan flag `Secure` | P1 | seguridad | Pendiente — sin app |
| SEG-012 | Formularios/APIs públicas respetan allowlist (sin campos privilegiados) | P0 | seguridad | Pendiente — sin app |
| SEG-013 | Rate limits públicos se aplican antes de Stripe, DB o Storage | P0 | seguridad | Pendiente — sin app |
| SEG-014 | Fail-closed: lo no permitido al anónimo se deniega | P0 | seguridad | Pendiente — sin app |
| SEG-015 | Existen rutas `/aviso-de-privacidad` y `/terminos` (copy del dueño, no inventado) | P1 | seguridad | Pendiente — sin app |

### Cruce con otras matrices (ejecutar en la suite, sin ID nuevo)

| Control | Caso canónico |
|---------|----------------|
| Success no marca pagado | CHK-006 |
| Anti-tampering de precios / `is_automotive` | CHK-007, CHK-008 |
| Webhook sin firma y idempotencia | CHK-019, CHK-020 |
| Rate limit Checkout Session | CHK-014 |
| Rate limit form personalizados | PER-012 |
| INSERT `custom_requests` privilegiado | PER-013 |
| Inbox `custom_requests` no legible | PER-014 |
| Deep link WA sin PII sensible en la URL | PER-016 |

---

### SEG-001 — Producción solo HTTPS; HTTP redirige 301 a HTTPS

| Campo | Detalle |
|-------|---------|
| Caso | El deploy de producción no se sirve en HTTP plano. Una petición HTTP recibe redirección **301** a la URL HTTPS equivalente. |
| Precondiciones | Deploy de producción en Vercel (dominio puede estar por crear: aplicar al dominio/entorno de prod cuando exista). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Respuesta HTTP: status 301 y `Location` con `https://`. Carga posterior de la home pública en HTTPS. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1: *Deploy solo en Vercel; sin origen HTTP plano; Force HTTPS redirect 301 (middleware y/o Vercel).* Checklist §10.1. |

**Pasos**

1. Solicitar la URL de producción con esquema `http://`.
2. Observar código y `Location`.
3. Confirmar que la página pública queda en HTTPS.

**Resultado esperado**

- 301 a HTTPS. No hay contenido de producción servido en HTTP plano.

---

### SEG-002 — HSTS en producción (`max-age` ≥ 15552000)

| Campo | Detalle |
|-------|---------|
| Caso | La respuesta de producción incluye `Strict-Transport-Security` con `max-age` ≥ 15552000. `includeSubDomains` solo si el dominio lo permite (no fallar si, por configuración de dominio aún no cerrada, no va ese flag). |
| Precondiciones | Respuesta HTTPS de producción. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Encabezados de respuesta de una página pública, con el valor de HSTS. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1. |

**Pasos**

1. Obtener encabezados HTTPS de la home (u otra ruta pública) en producción.
2. Leer `Strict-Transport-Security`.

**Resultado esperado**

- Header presente, `max-age` ≥ 15552000.
- `includeSubDomains` acorde a lo que permita el dominio (pendiente de decisión de dominio; no inventar subdominios).

---

### SEG-003 — Sin mixed content: assets solo HTTPS

| Campo | Detalle |
|-------|---------|
| Caso | Imágenes, scripts, estilos y demás assets de las páginas públicas se cargan solo por HTTPS. |
| Precondiciones | Landing y catálogo con al menos una imagen de producto publicado (cuando existan). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Inspección de red de una página pública: cero recursos `http://` activos. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1 *Mixed content: Imágenes / assets solo HTTPS.* |

**Pasos**

1. Abrir landing y una ficha de catálogo público.
2. Revisar las URLs de los recursos cargados.

**Resultado esperado**

- Todos los assets en HTTPS. Sin avisos de mixed content.

---

### SEG-004 — Callbacks de Stripe (y cualquier retorno público) solo `https://`

| Campo | Detalle |
|-------|---------|
| Caso | `success_url`, `cancel_url` y la URL del webhook de Stripe usan solo `https://`. |
| Precondiciones | Sesión de Checkout de prueba; config de webhook. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Las tres URLs (o las que estén configuradas) con esquema HTTPS. Detalle de success/cancel: CHK-022. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1 *Callbacks: Stripe success/cancel, webhook y Auth Supabase → solo https://*. Auth es superficie admin: no se prueba el login aquí; sí se anota si un callback visible en el flujo público violara HTTPS. |

**Pasos**

1. Crear una Checkout Session de prueba y leer success/cancel.
2. Revisar la URL configurada del webhook (staff / DevOps).

**Resultado esperado**

- Todas esas URLs son `https://`.

---

### SEG-005 — Preview con env/secrets separados; no DB de prod en preview

| Campo | Detalle |
|-------|---------|
| Caso | Los entornos Preview y Production no comparten secretos ni la base productiva. |
| Precondiciones | Proyecto en Vercel con preview (cuando exista). |
| Prioridad / tipo | P1 / seguridad |
| Evidencia requerida | Constancia de DevOps/Web (configuración de env) de que Production / Preview / Development están separados; el preview no apunta a la DB de prod ni a claves de prod. Sin volcar secretos en el ticket. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1 *Preview: HTTPS OK; env/secrets separados de prod; no DB prod en preview*; §5; amenaza R9. Coordinar con DevOps Web; Tester no extrae secretos. |

**Pasos**

1. Con DevOps Web, revisar la separación de env en Vercel.
2. Confirmar que un preview no usa la DB ni las claves de producción.

**Resultado esperado**

- Entornos separados. Preview no opera sobre datos productivos.

---

### SEG-006 — El cliente no expone service role ni secretos

| Campo | Detalle |
|-------|---------|
| Caso | En el navegador / bundle público solo aparecen las variables `NEXT_PUBLIC_*` documentadas. |
| Precondiciones | Build de la app pública. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Inspección del cliente: presentes como mucho `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Ausentes: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Cruza CHK-018. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §3 y §5; STACK.md. Check defensivo. |

**Pasos**

1. Cargar una página pública e inspeccionar el cliente / bundle.
2. Revisar que no hay service role ni secretos de Stripe/Supabase de servidor.

**Resultado esperado**

- Solo claves públicas documentadas en el cliente.

---

### SEG-007 — El anónimo no lee recursos sensibles (aceptación RLS)

| Campo | Detalle |
|-------|---------|
| Caso | Con clave `anon`, no se obtienen: automotriz; `promos`; `customers`; `orders` / `order_items`; `income_entries` / `expense_entries`; `cfdi_links`; `profiles`; inbox de `custom_requests`. En `products`, cero filas automotriz o con `visible_web = false`. |
| Precondiciones | Políticas SQL aplicadas (hoy pendientes de firma de Seguridad). **No cargar PII ni datos productivos** hasta ese gate. Usar fixtures de no producción. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Resultados de las lecturas anónimas (vacío o denegado), alineados a las pruebas de aceptación de SCHEMA / SEGURIDAD §4. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §0 y §4; SCHEMA «Anónimo no ve» y pruebas de aceptación. Check defensivo. Cruza CAT-006, CAT-008, CAT-013, CHK-017, PER-014. |

**Pasos**

1. Con cliente `anon` (sin sesión staff), intentar SELECT de las tablas listadas.
2. Registrar el resultado de cada una (denegado o conjunto vacío, y en `products`/`catalogs`/`product_images` solo lo publicable).

**Resultado esperado**

- Se cumplen los cuatro puntos de aceptación anónima documentados, más la lista «anónimo no ve».

---

### SEG-008 — Lectura directa de `custom-samples` y `cfdi-attachments` denegada al anónimo

| Campo | Detalle |
|-------|---------|
| Caso | Los buckets sensibles no son legibles de forma anónima. |
| Precondiciones | Al menos un objeto de prueba en `custom-samples` (y, si existe en el entorno, uno en `cfdi-attachments`). Sin PII real si el gate no está firmado. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Lectura anónima denegada. Prueba de aceptación punto 4. Cruza PER-015. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §4 y §9. El CFDI es módulo admin; aquí solo se verifica que **no** es público. |

**Pasos**

1. Con identidad anónima, intentar leer un objeto de cada bucket sensible (paths conocidos por staff de prueba).
2. Confirmar que no hay listing público.

**Resultado esperado**

- Lectura denegada en ambos buckets.

---

### SEG-009 — `product-images` público solo de publicados; sin listing de buckets sensibles

| Campo | Detalle |
|-------|---------|
| Caso | Solo son públicas las fotos cuyo producto padre pasa el filtro web. No hay listing público de buckets sensibles. |
| Precondiciones | Foto de M105-OK y foto de un no publicable (AUTO-1 o M-HID). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Lectura anónima de la foto publicada: permitida (HTTPS). Foto del no publicable: no pública. Listing de `custom-samples` / `cfdi-attachments`: denegado. Cruza CAT-004, CAT-017. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §9; SCHEMA Storage. |

**Pasos**

1. Cargar en anónimo la imagen de un producto publicado.
2. Intentar la de un no publicable.
3. Intentar listar buckets sensibles.

**Resultado esperado**

- Público solo el objeto de catálogo web publicado.
- Sin listing de buckets sensibles.

---

### SEG-010 — No se almacenan PAN; solo IDs de Stripe

| Campo | Detalle |
|-------|---------|
| Caso | Tras un pago test, en la base y en logs visibles no quedan números de tarjeta; solo IDs de Stripe (session, payment intent, etc.). |
| Precondiciones | Checkout test completado (CHK-005). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Staff: campos del pedido / `income_entries` con IDs Stripe; ausencia de PAN. Revisar que los logs de la app no imprimen PAN (sin volcar logs sensibles al ticket). |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §7 *No almacenar PAN; solo IDs Stripe.* El pago ocurre en Stripe Checkout (CHK-004). |

**Pasos**

1. Completar un pago en modo test.
2. Revisar con staff las filas de pedido e ingreso y la práctica de logs.

**Resultado esperado**

- Solo IDs de Stripe persistidos.
- El sitio no pide PAN en formularios propios.

---

### SEG-011 — Cookies de producción, si existen en la superficie, llevan flag `Secure`

| Campo | Detalle |
|-------|---------|
| Caso | En producción, las cookies que aclare el sitio (p. ej. de sesión de plataforma) llevan el flag `Secure`. El detalle HttpOnly + SameSite=`Lax` está escrito sobre todo para admin; en público el checkout es guest. Si la superficie pública setea cookies, se verifica `Secure` en prod. |
| Precondiciones | Página pública en producción. |
| Prioridad / tipo | P1 / seguridad |
| Evidencia requerida | Encabezados `Set-Cookie` (si los hay) con `Secure`. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1 y §3. No se prueba aquí el login admin. Si no hay cookies en el flujo público, documentarlo como N/A con evidencia de que no se setean. |

**Pasos**

1. Cargar la home y el inicio de checkout en producción.
2. Listar cookies y sus flags.

**Resultado esperado**

- Si hay cookies: `Secure` en producción.
- Si no hay: N/A justificado, no pass vacío.

---

### SEG-012 — Formularios/APIs públicas respetan allowlist (sin campos privilegiados)

| Campo | Detalle |
|-------|---------|
| Caso | Las APIs públicas de intake y de Checkout Session no aceptan mass-assignment de campos privilegiados (`status`, `order_id`, precios, `is_automotive`, totales). |
| Precondiciones | Endpoints públicos. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Reutilizar evidencia de CHK-007, CHK-008, CHK-013 y PER-013 en una sola nota de suite: el servidor ignora o rechaza esos campos. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §7; FLUJOS §3 y §5. Check defensivo. |

**Pasos**

1. Ejecutar (o adjuntar) CHK-007, CHK-008, CHK-013 y PER-013.

**Resultado esperado**

- Ningún campo privilegiado del cliente altera estado, precios, línea automotriz u `order_id`.

---

### SEG-013 — Rate limits públicos se aplican antes de Stripe, DB o Storage

| Campo | Detalle |
|-------|---------|
| Caso | Los dos límites públicos documentados existen y cortan el efecto secundario. |
| Precondiciones | Entornos de prueba. Umbral de checkout aún en el rango 5–10 (gap de cifra exacta). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Resultados de CHK-014 y PER-012: `429` (y Retry-After en checkout); sin sesión/pedido/fila/upload de la solicitud limitada. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §6 y checklist §10.6. El rate limit de login admin **no** se incluye. |

**Pasos**

1. Ejecutar CHK-014 (Checkout Session, 5–10 / IP / 15 min, `429` + Retry-After).
2. Ejecutar PER-012 (5 / IP / 15 min y 3 / teléfono / hora, `429`, antes de DB/Storage).

**Resultado esperado**

- Ambos límites se comportan como está documentado.
- Se aplican antes de Stripe, DB o Storage.

---

### SEG-014 — Fail-closed: lo no permitido al anónimo se deniega

| Campo | Detalle |
|-------|---------|
| Caso | En la superficie pública, si no hay política o contrato que permita una lectura o escritura, el resultado es denegar (no un error “abierto” que devuelva datos). |
| Precondiciones | RLS ON en tablas de negocio (gate de Seguridad). Fixtures de no producción. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Las mismas lecturas de SEG-007–SEG-009, más escrituras anónimas no previstas (p. ej. INSERT en `orders` o UPDATE de `products`): denegadas. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md principio *fail-closed — sin política explícita que permita → denegar*; SCHEMA. Check defensivo: se verifica el rechazo, no se busca una vía de evasión. |

**Pasos**

1. Completar SEG-007 a SEG-009.
2. Confirmar que un INSERT/UPDATE anónimo no contemplado en el contrato (pedidos, productos, promos, ingresos) se deniega.

**Resultado esperado**

- Sin política de permiso: denegado.
- La única mutación anónima prevista es el INSERT acotado de `custom_requests` (PER-013) y el upload firmado de samples; el resto de altas web de pedidos es service role en servidor.


---

### SEG-015 — Existen rutas `/aviso-de-privacidad` y `/terminos` (copy del dueño, no inventado)

| Campo | Detalle |
|-------|---------|
| Caso | Las rutas legales del mapa público responden. El copy final (razón social, RFC, responsable) lo entrega el dueño; **no se inventa**. |
| Precondiciones | App pública con las rutas reservadas (WEB_IA §4.10). |
| Prioridad / tipo | P1 / seguridad |
| Evidencia requerida | Status de `/aviso-de-privacidad` y `/terminos`. Si el copy aún es un placeholder honesto, no es fail por falta de razón social (WEB_IA §10 y §11.8). Cruce QA TRV-03. Cookies: ver SEG-011. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §2, §4.10, §10 y QA TRV-03. Obligatorio en México para form y checkout que recogen datos, pero los textos fiscales no se improvisan. |

**Pasos**

1. Abrir `/aviso-de-privacidad` y `/terminos`.
2. Comprobar que no se inventó una razón social / RFC no entregados.
3. Si hay cookies públicas, reejecutar SEG-011.

**Resultado esperado**

- Las rutas existen.
- Sin datos fiscales inventados. El go-live del texto final está en manos del dueño.
