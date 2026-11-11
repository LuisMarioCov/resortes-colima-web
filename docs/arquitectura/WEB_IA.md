# IA pública — sitio web Resortes Colima (Fase 1)

Departamento: **Web**.  
Estado: **borrador Gerente Web actualizado** (2026-11-11, America/Mexico_City) con las decisiones del dueño sobre envío, estados del pedido web y marca. Plan de pruebas de **QA Web** en §11 (casos de envío y confirmación alineados a esas decisiones). Sin código de producto hasta OK explícito de implementación.  
Complementa (no sustituye) el mapa admin ([`ADMIN_IA.md`](ADMIN_IA.md)). Los flujos públicos viven en este documento, alineados a [`FLUJOS.md`](FLUJOS.md) §3 y §5 y a [`SCHEMA.md`](SCHEMA.md) (Sistema; D2 cerrado, 2026-11-11). Web no reescribe esos dos documentos.  
Stack fijado: Next.js App Router (app única, grupo `(public)` + `/admin`), Supabase, Vercel, Stripe Checkout Session + webhook firmado. Idioma: **español (MX)**.

Referencias: [`BRIEF.md`](../negocio/BRIEF.md), [`STACK.md`](STACK.md), [`SCHEMA.md`](SCHEMA.md), [`SEGURIDAD.md`](SEGURIDAD.md), [`CATALOGO.md`](CATALOGO.md), [`FINANZAS_REGLAS.md`](FINANZAS_REGLAS.md), [`NECESIDADES.md`](../discovery/NECESIDADES.md).

---

## 1. Principios

1. **Mensaje central:** Fabricado express (días, y a veces horas si el cliente es local y el trabajo es acotado, frente a semanas de la competencia) + envíos a toda la República Mexicana. Sede: Colima, Colima.
2. **Tres trabajos públicos:** landing de marca, catálogo multiusos vendible (SEO + e-commerce) y intake de personalizados hacia WhatsApp. Nada más en el nav principal.
3. **Nunca en UI, API, sitemap ni markup SEO:** línea automotriz, promos, stock/inventario, precios que no sean la lista `unit_price` de la DB.
4. **Precios de checkout solo desde el servidor.** El cliente envía únicamente `product_id` + cantidad. Se ignora cualquier `unit_price`, `total` o flag que venga del browser ([`SEGURIDAD.md`](SEGURIDAD.md) §7; [`FLUJOS.md`](FLUJOS.md) §5).
5. **Publicación = regla AND de Catálogo** ([`CATALOGO.md`](CATALOGO.md) §1): catálogo `multiusos_105` o `multiusos_56` con `line = multiusos` e `is_public = true`; producto `line = multiusos`, `is_active = true`, `visible_web = true`, `unit_price` no nulo en MXN; al menos una foto editada. Default de `visible_web` = `false`. Los dos listados se mantienen **separados**.
6. **Invitado:** no hay portal ni login de cliente. Checkout anónimo; el staff entra por `/admin/login`, fuera de la navegación pública.
7. **SEO first:** páginas de catálogo y producto renderizadas en servidor (RSC / SSG). Sin contenido automotriz en copy, titles, alts ni JSON-LD.
8. **Fail-closed en datos:** la query pública replica el AND; RLS es la red de seguridad, no el único filtro (R6). La app pública **no consulta** la tabla `promos`.
9. **Envío en el mismo cobro de Stripe** (dueño, 2026-11-11): el flete va incluido en el total de la Checkout Session. Si el subtotal de productos (servidor, MXN) es **≥ $2,999**, el envío es **gratis**. Si es menor, el cliente paga el envío en ese mismo cargo. El monto exacto de la tarifa es un **parámetro configurable de servidor**, aún **pendiente del dueño**; **no se inventa** un precio. El cliente no envía ni altera el flete.
10. **Pedido web ya pagado:** el pedido se **inserta** solo en el webhook firmado, con `status = pendiente` y el cobro ya registrado. No hay `draft` ni alta al crear la Session ([`FLUJOS.md`](FLUJOS.md) §5, [`SCHEMA.md`](SCHEMA.md)). El control interno es **`pendiente` → `hecho` → `enviado`**, más **`cancelado`**. `cotizado` es opcional y **antes** de `pendiente`, en WhatsApp, mostrador, teléfono y personalizados (el anticipo es `income_entries.kind = deposit_50`, no un estado). La web pública **no** muestra ese tablero: solo la confirmación de compra.
11. **Marca, no dominio registrado:** se diseña alrededor de **Resortes Colima**. Nombre de trabajo: `resortescolima.mx` (no está registrado; **no registrar** desde Web). Se anotan `.com` y `.com.mx` como alternativas, **sin decidirlas**.

---

## 2. Mapa de rutas

```text
(public)
├── /                                 # Landing Fabricado express + cobertura nacional
├── /catalogo                         # Índice de los dos listados multiusos
├── /catalogo/[catalogSlug]           # Listado de un catálogo (~105 o ~56)
├── /catalogo/[catalogSlug]/[productSlug]  # Ficha SEO + compra
├── /carrito                          # Revisión; precios refrescados desde el servidor
├── /pedido/exito                     # Post-Stripe; no marca pagado
├── /pedido/cancelado                 # Pago abandonado
├── /personalizados                   # Form intake canónico
├── /personalizados/enviado           # Confirmación + CTA WhatsApp
├── /aviso-de-privacidad
└── /terminos

api (Route Handlers, no indexables)
├── POST /api/checkout/session        # Session Stripe (precios y flete de servidor; no inserta pedido)
├── POST /api/webhooks/stripe         # Firma + INSERT pendiente ya pagado (service role, idempotente)
├── POST /api/personalizados          # INSERT acotado custom_requests
└── POST /api/personalizados/upload   # URL firmada a custom-samples
```

Rutas exactas pueden ajustarse en implementación; **la agrupación y los contratos** son canónicos.  
`/admin/*` no forma parte de esta IA (ver [`ADMIN_IA.md`](ADMIN_IA.md)).

**Slugs (Fase 1, sin pedir columna nueva):**  
- Catálogo: derivado de `catalogs.code` (`multiusos-105`, `multiusos-56`).  
- Producto: `slugify(external_id)` + slug del nombre, único dentro del catálogo. La URL canónica incluye ambos segmentos para no chocar entre listados.  
Si Sistema agrega `catalogs.slug` / `products.slug` más adelante, se usan esos campos; no bloquea este diseño.

---

## 3. Shell público

| | |
|--|--|
| **Header** | Logotipo; enlaces Catálogo y Personalizados; CTA breve «Fabricado express»; acceso a carrito (contador de piezas, no de importe cacheado del cliente). |
| **Footer** | Colima, Colima, México; envíos a toda la República; avisos legales; contacto (teléfono / WhatsApp cuando el dueño los entregue). Sin enlace destacado a `/admin`. |
| **No incluye** | Filtro o mención automotriz; badges de stock; banners de promo; precios tachados; login de cliente. |

Copy de apoyo (tono, no literatura final): fabricantes de resortes, respuesta en días (a veces horas en local), frente a semanas típicas del mercado. Sin promesas de fecha exacta en la web (el SLA express lo cierra Pedidos / D2).

---

## 4. Pantallas

### 4.1 Landing — Fabricado express (W1)

| | |
|--|--|
| **Ruta** | `/` |
| **Propósito** | Dejar claro quiénes somos y por qué pedir aquí: velocidad de fabricación + cobertura nacional. Convertir a catálogo o a personalizados. |
| **Bloques** | (1) Hero con la promesa express y CTAs «Ver catálogo» / «Resorte a la medida». (2) Cómo trabajamos (días u horas vs semanas). (3) Envíos a toda la República; clientes locales. (4) Entrada a los dos catálogos multiusos, sin fusionarlos. (5) Personalizados: se cotiza por WhatsApp, anticipo 50% al confirmar; **sin precio en esta página**. |
| **SEO** | Title y H1 centrados en resortes + Fabricado express + Colima / México. JSON-LD `Organization` + `LocalBusiness` (Colima). |
| **No incluye** | Promos, stock, automotriz, precios de personalizados, calculadora de tiempos. |

### 4.2 Índice de catálogo (W2)

| | |
|--|--|
| **Ruta** | `/catalogo` |
| **Propósito** | Presentar los **dos** listados por separado (`multiusos_105` y `multiusos_56`) y enlazar a cada uno. |
| **Datos** | `catalogs` con `is_public = true` y `line = multiusos`. Nombres humanos desde la DB, no inventados. |
| **Vacío** | Si un listado aún no tiene productos publicables, se muestra el catálogo con estado vacío honesto (fotos/Excel pendientes). No se rellenan ítems de ejemplo. |

### 4.3 Listado de un catálogo (W2, W6)

| | |
|--|--|
| **Ruta** | `/catalogo/[catalogSlug]` |
| **Qué lista** | Productos que cumplen el AND de [`CATALOGO.md`](CATALOGO.md) §1. Los dos catálogos no se mezclan en una sola grilla. |
| **Tarjeta** | Foto primaria, nombre, identificador (`external_id`), **precio de lista** `unit_price` MXN, CTA a la ficha / añadir. |
| **Filtros / búsqueda** | Sobre el listado actual (nombre, ID). Sin facetas de línea automotriz. ~161 ítems caben en listado servidor + búsqueda; paginar solo si la implementación lo necesita, con URLs rastreables (`?pagina=`). |
| **SEO** | Title único por catálogo; listado renderizado en servidor; cada tarjeta enlaza a URL canónica de producto. |
| **No incluye** | Promos, precio tachado, «agotado» / inventario, recomendaciones automotrices. |

### 4.4 Ficha de producto (W2, W6)

| | |
|--|--|
| **Ruta** | `/catalogo/[catalogSlug]/[productSlug]` |
| **Bloques** | Galería (`product_images` del producto público, orden `sort_order`); nombre; ID; precio de lista MXN; `description` y `tech_sheet` si existen (C1c no bloquea publicar); cantidad; añadir al carrito; compra. Enlace a personalizados si el cliente necesita una réplica a medida (sin precio). |
| **404** | Producto inexistente, no público, inactivo, automotriz o sin `visible_web` → 404 (no 200 con «no disponible»). `noindex` en esa respuesta. |
| **SEO** | `generateMetadata` con title `Nombre — Resortes Colima`; description a partir de ficha real (sin inventar specs). Canonical. Open Graph con foto primaria. JSON-LD `Product` + `Offer`: `price` = `unit_price`, `priceCurrency` = `MXN`. **Sin** `availability` InStock/OutOfStock (no hay inventario). |
| **Checkout** | El botón no manda precios. El carrito solo guarda `{ product_id, quantity }`. |

### 4.5 Carrito

| | |
|--|--|
| **Ruta** | `/carrito` |
| **Estado** | Cliente: ids y cantidades (localStorage o cookie no sensible). **Importes:** el servidor los vuelve a leer de la DB al pintar y al crear la Session. Si un ítem dejó de ser publicable, se quita y se avisa. |
| **Campos** | Líneas con foto, nombre, qty (1–99), precio unitario y subtotal **servidos**. Total MXN. CTA «Pagar con Stripe». |
| **Límites** | Máx. 20 líneas por pedido (tope de implementación; no es política comercial). Cantidad entera > 0. |
| **No incluye** | Códigos de promo, cálculo de descuento, selector de stock, login obligatorio. |

**Envío (dueño, 2026-11-11):** va **incluido en el total** de la misma Checkout Session (un solo cobro, no un cargo aparte). El servidor calcula:

- `subtotal` = suma de `unit_price * quantity` leída de la DB (MXN).
- Si `subtotal >= 2999` (`app_settings.shipping_free_threshold_mxn`, umbral **fijo**): `shipping_fee = 0` (gratis).
- Si `subtotal < 2999`: `shipping_fee` = `app_settings.shipping_fee_mxn`. El **monto exacto sigue pendiente del dueño** (la clave nace sin valor); **prohibido inventarlo**.
- `total` = `subtotal + shipping_fee`. Ese `total` es lo que cobra Stripe.

El servidor lee `app_settings` (el anónimo **no** hace SELECT directo a esa tabla; [`SCHEMA.md`](SCHEMA.md)). En `/carrito` se muestra la regla («Envío gratis a partir de $2,999 MXN; si el subtotal es menor, el envío se suma al mismo pago») y, **solo cuando `shipping_fee_mxn` tenga valor**, el monto. Si la tarifa aún no existe: se pinta el umbral, no un peso inventado; con subtotal ≥ $2,999 se puede cobrar (envío $0); con subtotal menor, **no se crea Session** (400). Dirección de entrega: se recolecta en Stripe Checkout y se guarda como `shipping_to` en el webhook.

### 4.6 Checkout Stripe (W3)

No es una página de pago propia: el Route Handler redirige a **Stripe Checkout Session** (HTTPS, `locale` compatible con es-MX, moneda `MXN`). Es **pago total** del catálogo: sin anticipo y sin fiado ([`FINANZAS_REGLAS.md`](FINANZAS_REGLAS.md)).

Contrato del `POST /api/checkout/session`:

1. Rate limit 5–10 / IP / 15 min **antes** de DB o Stripe; `429` + `Retry-After`.
2. Body admitido: `{ items: [{ product_id, quantity }] }` y, si aplica, una clave de idempotencia. **Se descartan** `unit_price`, `total`, `shipping_fee`, `is_automotive`, `is_custom` o cualquier otro campo de importe o línea.
3. Servidor carga cada producto por `id` con el AND público. Si alguno falla → 400, no se crea Session.
4. Totales **solo en servidor**, moneda forzada `MXN` (centavos para Stripe): `line_total = unit_price * quantity`; `subtotal` = suma de líneas; `shipping_fee` según la regla del §4.5 (0 si `subtotal >= 2999`; si no, `shipping_fee_mxn`, nunca un monto que mande el cliente); `total = subtotal + shipping_fee`. Si el subtotal es < $2,999 y `shipping_fee_mxn` **no** tiene valor: **400**, no se crea Session.
5. **No inserta** `orders` ni `order_items` en este paso (el pedido web entra ya pagado, solo en el webhook). Crea la Stripe Checkout Session con los `line_items` de producto **y** la línea de envío si `shipping_fee > 0` (monto del servidor). Metadata: ids de producto, cantidades y montos calculados (para reconstruir el snapshot en el webhook); **aún no hay** `order_id`. Success y cancel en `https://`. Se pide dirección de envío en Checkout.
6. Devuelve la URL de Stripe. El anónimo **no** hace SELECT/INSERT en `orders`. `app_settings` lo lee solo el servidor.

**Webhook** `POST /api/webhooks/stripe` ([`SEGURIDAD.md`](SEGURIDAD.md) §8, [`FLUJOS.md`](FLUJOS.md) §5.3): body crudo, firma `STRIPE_WEBHOOK_SECRET`, allowlist `checkout.session.completed` (y eventos de fallo mínimos si se manejan). **Aquí** el service role **inserta** el pedido ya pagado: `orders` (`channel = web`, `status = pendiente`, `line_focus = multiusos`, `created_by` nulo, `subtotal` / `shipping_fee` / `total` del cálculo que quedó en la Session, `shipping_to` y contacto desde la Session, `stripe_checkout_session_id` / `stripe_payment_intent_id`) + `order_items` (snapshot de nombre, `unit_price`, `line_total`; `is_automotive = false`; `is_custom = false`) + `income_entries` (`kind = stripe`, `method = stripe`, monto = `total` cobrado, `occurred_at`). **Idempotencia** por `event.id` / `checkout_session_id` / payment intent: un solo pedido y un solo ingreso. El tablero interno sigue `pendiente` → `hecho` → `enviado`, más `cancelado` (solo staff en admin).  
La URL de éxito **no** cambia el estado ni muestra ese tablero.

`is_express` **no** se enciende solo por ser pedido web; la promesa de marca vive en el copy. El compromiso `promised_by` lo pone operación (Pedidos).

Métodos de pago: los que el dueño active en el Dashboard de Stripe (no se añaden en código métodos que no estén contratados).

### 4.7 Éxito y cancelación

| Ruta | Qué dice | Qué no hace |
|------|----------|-------------|
| `/pedido/exito` | **Solo confirmación de compra:** gracias, el pago se está confirmando (o ya quedó confirmado si el webhook ya corrió), folio si el servidor ya ve el pedido en `pendiente` (Session resuelta **en servidor**, nunca un «pagado» del querystring), y que el equipo se pondrá en contacto. | No marca `orders` como pagado ni crea la fila. **No** muestra el tablero interno (`pendiente` / `hecho` / `enviado` / `cancelado`), ni un seguimiento de producción, ni otros pedidos, ni PII ajena. |
| `/pedido/cancelado` | El pago no se completó; el carrito se conserva; puede reintentar. | **No hay fila de pedido** que limpiar: el alta ocurre solo en el webhook, ya pagado. |

### 4.8 Formulario de personalizados (W4)

| | |
|--|--|
| **Ruta** | `/personalizados` |
| **Campos canónicos** | **Obligatorios:** diámetro interior y exterior; número de vueltas; calibre; largo deseado; tipo `tensión` \| `compresión` \| `torsión`; unidad `pulgadas` \| `milímetros`; cantidad; foto de muestra; nombre de contacto; teléfono WhatsApp. **Opcionales:** espacio entre vueltas (`coil_spacing`; en [`SCHEMA.md`](SCHEMA.md) es nullable; **no** se pide como obligatorio en el form); notas (largo máximo); foto con medidor (**recomendada**, no bloquea el envío si falta). Enums y rangos validados en servidor. |
| **Precio** | **Ninguno.** Copy: cotización y tiempo por WhatsApp; anticipo **50%** al confirmar el trabajo. |
| **Fotos** | Upload firmado a `custom-samples` (TTL corto, path opaco). Allowlist: **JPEG, PNG, HEIC, WebP**; máximo **8 MB** por archivo; vista previa en el form. El path entra al INSERT **después** del upload. El anónimo no lee el bucket. El mismo rate limit del form aplica a `POST /api/personalizados/upload` (ver Alta). |
| **Alta** | `POST /api/personalizados` (Route Handler o Server Action): **inserta en servidor** y **devuelve solo el folio** hacia `/personalizados/enviado` (el folio puede ir en la ruta o en el query; no es PII). El anónimo **no** hace SELECT de `custom_requests` (ni de su fila) y **no** se confía en `INSERT … RETURNING` bajo RLS sin política de lectura: el folio lo resuelve el servidor. Rate limit 5 / IP / 15 min y 3 / teléfono normalizado / hora, **antes** de DB o Storage; **el mismo límite** aplica a `POST /api/personalizados/upload`. Fuerza `status = received`, `order_id = null`. Allowlist de columnas; rechaza campos privilegiados. RLS WITH CHECK igual. |
| **Después** | Redirect a `/personalizados/enviado` con el folio (ruta o query). |

### 4.9 Enviado + handoff WhatsApp

| | |
|--|--|
| **Ruta** | `/personalizados/enviado` |
| **Qué ve el cliente** | Confirmación de que la solicitud se recibió; folio corto (p. ej. prefijo del `id` o un `request_number` si Sistema lo agrega); CTA «Continuar en WhatsApp»; aviso de que también pueden contactarlo al teléfono que dejó. |
| **Deep link** | `https://wa.me/<numero_negocio>?text=...` El número sale de configuración (entregado por el dueño; ver §10), no va hardcodeado de prueba en el repo. |
| **Texto propuesto** (Personalizados puede afinar) | `Hola, envié una solicitud de resorte personalizado con folio {folio}. Quedo atento a la cotización y el tiempo de entrega.` |
| **PII en la URL** | **No** poner teléfono, email, fotos ni domicilio en el query (`SEGURIDAD.md` R12). El folio basta: el detalle está en `/admin/personalizados`. |
| **Estado** | Permanece `received` hasta que el staff lo actualice (el anónimo no hace UPDATE). El click a WhatsApp es handoff de UX, no mutación privilegiada. |

Conversión a pedido + anticipo 50% es **solo admin** ([`FLUJOS.md`](FLUJOS.md) §3, [`ADMIN_IA.md`](ADMIN_IA.md) §7).

### 4.10 Legales

`/aviso-de-privacidad` y `/terminos` en Fase 1 (obligatorio en México para un form y un checkout que recogen datos). Textos con datos fiscales / responsable: los entrega el dueño; mientras tanto, rutas reservadas, no copy inventado.

---

## 5. SEO técnico (W0, W6)

| Pieza | Decisión Fase 1 |
|-------|-----------------|
| Render | App Router: landing, listados y fichas en servidor. `generateStaticParams` sobre productos **ya** publicables; revalidación al cambiar el maestro. |
| Metadata | `title` / `description` / canonical / Open Graph por ruta. Patrón de title: `{página} \| Resortes Colima`. |
| `sitemap.ts` | Solo URLs públicas: home, `/catalogo`, cada catálogo público, cada producto que pasa el AND. Nunca automotriz, admin, APIs, éxito/cancelación, ni personalizados/enviado. |
| `robots.txt` | Allow del sitio público; `Disallow` de `/admin`, `/api`, `/carrito`, `/pedido/`. |
| JSON-LD | Home: `Organization` + `LocalBusiness` (Colima, MX). Producto: `Product` + `Offer` (precio de lista, MXN, sin stock). |
| Imágenes | Solo HTTPS; `alt` descriptivo real (nombre / uso), nunca «resorte automotriz» de relleno. Bucket `product-images` según [`SEGURIDAD.md`](SEGURIDAD.md) §9. |
| Idioma | `lang="es-MX"`. Sin hreflang de otros idiomas. |
| Dominio / marca | Se diseña alrededor de la marca **Resortes Colima**. Nombre de trabajo (no registrado, **no registrar**): `resortescolima.mx`. Alternativas anotadas, no decididas: `resortescolima.com`, `resortescolima.com.mx`. Canonicals, Open Graph y ejemplos de URL usan el nombre de trabajo, sin presentarlo como dominio ya inscrito. HTTPS obligatorio en Vercel; callbacks Stripe y Auth solo `https://`. Preview con env separado, sin DB productiva. El DNS de producción queda para cuando el dueño registre (no lo decide Web). |
| Contenido nacional | W6: además de fichas, la landing cubre «resortes» + fabricación express + envíos México. No se inventan artículos de blog en Fase 1 (fuera de `/admin` y de este alcance). Keywords o landing pages extra se proponen después, sin automotriz. |

---

## 6. Contratos de datos públicos

| Recurso | Lectura pública | Escritura pública |
|---------|-----------------|-------------------|
| `catalogs` / `products` / `product_images` | SELECT con AND de publicación | No |
| `promos` | **Ninguna** (ni UI ni query) | No |
| `orders` / `order_items` / `income_entries` | No | Solo **service role** en Route Handlers (checkout y webhook) |
| `custom_requests` | No (ni la propia fila) | INSERT acotado (§4.8) |
| `customers`, `profiles`, finanzas, CFDI | No | No |
| Storage `product-images` | Objetos de productos publicables | No (staff) |
| Storage `custom-samples` | No | Upload firmado acotado |

Cliente browser: solo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Service role y secretos Stripe: solo servidor, Vercel env ([`SEGURIDAD.md`](SEGURIDAD.md) §5).

---

## 7. Fuera de alcance (Fase 1 pública)

- Automotriz, promos en UI, stock, portal de cliente, cupones.
- Precio o lead time fijo de personalizados; WhatsApp Business API formal (X1: basta deep link).
- Editor SEO / blog en admin (ya excluido en [`ADMIN_IA.md`](ADMIN_IA.md)).
- Inventar el **monto** de la tarifa de envío, registrar un dominio, o redactar textos legales con razón social no entregada. El umbral $2,999 y el nombre de trabajo `resortescolima.mx` ya están documentados aquí.
- Fusionar los dos catálogos.
- Código de producto hasta OK explícito del dueño.

---

## 8. Dependencias (épicas)

| Épica | Relación con esta IA |
|-------|----------------------|
| W0 | HTTPS + baseline SEO técnico en Vercel, alrededor de la marca Resortes Colima y el nombre de trabajo `resortescolima.mx` (sin registrar). DNS real cuando el dueño lo haga. |
| W1 | Landing (§4.1). Puede implementarse con catálogo aún parcial. |
| W2 | Listados y fichas; depende de C1 + C1b para ítems reales (Excel y fotos del dueño). La IA no espera esos archivos. |
| W3 | Checkout (§4.6); depende de W2, C3 y Stripe. |
| W4 | Form + handoff WA; C4 cerrado en discovery. Número de WhatsApp = input del dueño. |
| W5 | HTTPS, rate limit, deploy nube (con Seguridad). |
| W6 | Fichas + sitemap + metadata; contenido de producto puede arrancar incompleto (C1c no bloquea). |

---

## 9. Criterios de aceptación (Web)

1. Nav y páginas públicas solo en español MX, con mensaje express + cobertura nacional.
2. Cero automotriz, cero promos, cero stock en UI, API pública, sitemap y JSON-LD.
3. Solo productos que cumplen el AND de Catálogo; 404 para el resto; dos listados separados.
4. Checkout: el servidor ignora importes y flete del cliente, toma `unit_price` de la DB, aplica envío gratis si el subtotal es ≥ $2,999 MXN (si es menor, `shipping_fee_mxn`, nunca inventada), **no** da de alta el pedido al crear la Session, y solo el webhook firmado inserta `orders` en `pendiente` (ya pagado) con `income_entries`.
5. La web pública solo muestra confirmación de compra. Cero tablero pendiente / hecho / enviado.
6. Personalizados: sin precio; INSERT acotado; rate limit; deep link WA sin PII en la URL; inbox invisible al anónimo.
7. Precios pintados en carrito y ficha = `unit_price` vigente de la DB, no un cache no validado del cliente. El carrito muestra la regla de envío y, si hay tarifa configurada, el monto servido.
8. Chrome, titles y SEO usan la marca **Resortes Colima**; el nombre de trabajo `resortescolima.mx` no se presenta como dominio registrado.
9. QA/tester no declara «listo» sin evidencia cuando haya código. Casos, regresiones y gate: §11. Esta entrega es **solo arquitectura** (el plan también lo es: se ejecuta cuando exista código).

---

## 10. Escalación al CEO (inputs que siguen abiertos)

Estos puntos **no** se deciden en el departamento Web.

### 10.1 Ya decididos por el dueño (incorporados aquí)

- Envío en el total de Stripe; gratis si subtotal ≥ $2,999 MXN; debajo, el cliente paga el envío en el mismo cobro. Monto exacto = parámetro configurable, **aún pendiente**.
- Pedido web entra ya pagado (webhook). Control interno: pendiente → hecho → enviado, más cancelado. La web pública solo confirma la compra.
- Marca Resortes Colima; nombre de trabajo `resortescolima.mx` (no registrar). Alternativas `.com` / `.com.mx` anotadas, no decididas.

### 10.2 Siguen abiertos (bloquean el go-live de la pieza, no este documento)

| Tema | Bloquea | Nota |
|------|---------|------|
| **Monto exacto** de la tarifa de envío (`app_settings.shipping_fee_mxn`) | Cobrar envío cuando el subtotal es < $2,999 (no se inventa el peso; esos pedidos no salen a producción sin el monto) | El umbral `shipping_free_threshold_mxn = 2999` ya está fijado. Solo el `owner` carga el monto. |
| Registro y DNS reales (W0) | Callbacks y canonicals de producción en un host propio | Se diseña con el nombre de trabajo; **no registrar** desde Web. Hosting ya es Vercel. |
| Número de WhatsApp de negocio | CTA real de W4 (el form y el alta en DB sí pueden existir) | Variable de entorno, no secreto de aplicación. |
| Razón social, RFC y responsable del aviso de privacidad | Textos legales finales | Rutas sí van en el mapa. |
| OK explícito para implementar código | Cualquier implementación de producto | Tras revisar esta IA. |

Cambio de stack, partir la app, mostrar automotriz o promos, o usar API/scraper Kubox → también CEO, sin negociación en Web.

### 10.3 Alineación con Sistema (sin delta pendiente)

Sistema ya formalizó en [`FLUJOS.md`](FLUJOS.md) y [`SCHEMA.md`](SCHEMA.md) (D2 cerrado, 2026-11-11) lo que Web necesitaba para el flujo público: regla de envío, `shipping_fee` / `app_settings`, estados `cotizado` (no web) → `pendiente` → `hecho` → `enviado` + `cancelado`, y el alta del pedido web **solo** en el webhook (`pendiente`, ya pagado; sin `draft`). Esta IA quedó alineada a esos nombres y a ese momento de alta. Web no reescribe esos documentos y **no** deja un delta pendiente para Sistema en este punto.

---

## 11. Plan de pruebas (QA Web)

Casos ejecutables, suite de regresión, formato de evidencia y gate de «listo», sobre las rutas de la §2, las pantallas de la §4 y los criterios de la §9. **Tester Web** ejecuta y adjunta evidencias; **QA Web** las revisa y **bloquea «listo»** si hay un fallo bloqueante. Esto no es implementación de producto.

Entorno: preview o proyecto de prueba, con **datos sintéticos**. Sin PII real ni datos productivos hasta que Seguridad firme el gate de [`SEGURIDAD.md`](SEGURIDAD.md) §0 / §10.

Los criterios describen el **comportamiento esperado** del sitio y de las APIs. No son un procedimiento para manipular producción.

### 11.1 Catálogo (W2)

Rutas: `/catalogo`, `/catalogo/[catalogSlug]` (`multiusos-105`, `multiusos-56`), `/catalogo/[catalogSlug]/[productSlug]`.

**Precondición (sintéticos):** un producto publicable en cada listado; uno automotriz activo en admin; uno multiusos con `visible_web = false` o inactivo; uno sin precio o sin foto editada; una promo activa en maestro con `visible_web = false`.

| ID | Sev. | Criterio | Resultado esperado | Evidencia |
|----|------|----------|--------------------|-----------|
| CAT-01 | Bloqueante | Publicación AND | Listado y ficha muestran **solo** ítems que cumplen las seis condiciones de [`CATALOGO.md`](CATALOGO.md) §1. | Captura de ambos listados + IDs vs flags en DB de prueba |
| CAT-02 | Bloqueante | Automotriz invisible | Cero presencia en listado, ficha, búsqueda, carrito, API, sitemap, Open Graph, `alt` o JSON-LD. | Búsqueda por `external_id` / nombre conocido: 0 resultados públicos |
| CAT-03 | Bloqueante | URL o API de no publicable | Automotriz, `visible_web = false`, inactivo, sin precio, sin foto o de catálogo no público → **404** (no 200 con «no disponible») y `noindex`. No sale en sitemap ni en API anónima. | Status HTTP + meta + ausencia en sitemap |
| CAT-04 | Bloqueante | Sin stock | Ninguna superficie pública muestra inventario, «agotado», «disponible X piezas» ni `availability` InStock/OutOfStock. | Capturas de listado, ficha, carrito y JSON-LD |
| CAT-05 | Bloqueante | Sin promos | Sin precio promocional, badge, precio tachado, `promo_price` ni `percent_off`. La API pública no consulta ni devuelve `promos`. | JSON de listado/ficha + captura UI |
| CAT-06 | Mayor | Precio de lista MXN | El precio en listado, ficha y carrito (servido) coincide con `products.unit_price` vigente, en `MXN`. No se inventa. | Precio UI vs fila de prueba |
| CAT-07 | Mayor | Fotos | Solo `product-images` del producto publicable, en HTTPS; `alt` descriptivo (nombre/uso), nunca relleno automotriz. Samples y CFDI no se sirven en público. | URL https + lectura de objeto no público denegada |
| CAT-08 | Bloqueante | RLS anónimo | Con clave `anon`: cero filas automotriz o no publicables en `products`; `promos` vacío o denegado ([`SEGURIDAD.md`](SEGURIDAD.md) §4 y §6 de esta IA). Un bug de filtro en la app no debe filtrar datos. | Resultado de queries `anon` |
| CAT-09 | Mayor | Listados separados | Índice `/catalogo` presenta los dos listados por separado; las grillas no se mezclan. Vacío honesto si aún no hay ítems publicables; sin productos de ejemplo inventados. | Captura de `/catalogo` y ambos slugs |
| CAT-10 | Mayor | Payload mínimo | La API pública no expone clientes, pedidos, finanzas, inbox ni campos privilegiados. | Muestra de JSON |
| CAT-11 | Menor | Español MX | UI, vacíos, filtros y búsqueda en español de México. | Captura |
| CAT-12 | Mayor | Ficha | Muestra foto, nombre, `external_id`, precio de lista; `description` / `tech_sheet` solo si existen (C1c no bloquea). CTA a personalizados sin precio. | Captura de una ficha completa y una sin ficha técnica |

### 11.2 Carrito y checkout (W3)

Rutas y APIs: `/carrito`, `POST /api/checkout/session`, `POST /api/webhooks/stripe`, `/pedido/exito`, `/pedido/cancelado`. El cliente solo envía `{ items: [{ product_id, quantity }] }`.

| ID | Sev. | Criterio | Resultado esperado | Evidencia |
|----|------|----------|--------------------|-----------|
| CHK-01 | Bloqueante | Precio solo desde DB | Totales de la Checkout Session y snapshot en `order_items` = `unit_price` vigente × cantidad. Si el request trae `unit_price`, `total`, `is_automotive` u otro importe, el servidor **los descarta** y no los usa. El carrito **vuelve a leer** precios del servidor al pintar. | Session / snapshot / HTML del carrito vs precio de lista |
| CHK-02 | Bloqueante | Rechazo de no publicables | Si algún `product_id` no pasa el AND → `400`, no se crea Session ni pedido. En `/carrito`, un ítem que dejó de ser publicable se quita y se avisa. | Respuesta 400 + ausencia en DB; captura del aviso |
| CHK-03 | Mayor | Cantidad, líneas y moneda | Cantidad entera 1–99; máx. 20 líneas; moneda forzada `MXN`. 0, negativa, > 99 o más de 20 líneas → rechazo. | Respuestas de validación |
| CHK-04 | Bloqueante | Éxito no confirma | Visitar `/pedido/exito` (con o sin querystring) **no** marca el pedido pagado ni escribe `income_entries`. Solo el webhook firmado confirma. Folio, si se muestra, se resuelve **en servidor**; no se confía en un «pagado» del query. Sin PII ajena. | Estado del pedido tras visitar éxito **sin** evento válido |
| CHK-05 | Bloqueante | Webhook firmado | Sin firma válida (`STRIPE_WEBHOOK_SECRET`): cero writes. Con `checkout.session.completed` verificado: **INSERT** de `orders` (`channel = web`, `status = pendiente`, ya pagado) + `order_items` + snapshot de contacto / `shipping_to` + `subtotal` / `shipping_fee` / `total` + `income_entries.kind = stripe`, `method = stripe`, monto = `total`, vía service role. | Log de rechazo (sin secretos) + filas de pedido e ingreso en caso feliz |
| CHK-06 | Bloqueante | Idempotencia | El mismo `event.id` / `checkout_session_id` / payment intent no duplica cobros ni pedidos. | Dos entregas del mismo evento: un ingreso |
| CHK-07 | Bloqueante | Rate limit | `POST /api/checkout/session`: 5–10 / IP / 15 min, **antes** de Stripe y de la DB; `429` + `Retry-After`. | Encabezados de la ráfaga de prueba |
| CHK-08 | Bloqueante | Actor, momento de alta y secretos | `POST /api/checkout/session` **no** inserta `orders`. El alta es **solo** en el webhook, con service role. Anónimo sin SELECT/INSERT. Service role y secretos Stripe ausentes del bundle. `is_express` **no** se enciende solo por ser web. `app_settings` no es SELECT anónimo. | Tests `anon` + scan de bundle (nombres de var, no valores) + ausencia de fila tras crear Session + fila en `pendiente` tras webhook |
| CHK-09 | Mayor | Snapshot | Snapshot de nombre y precios **antes** de redirigir a Stripe. Un cambio posterior de lista no reescribe ese pedido. Guest, sin cuenta. | Pedido de prueba vs precio editado después |
| CHK-10 | Mayor | Cancelación, HTTPS y noindex | `/pedido/cancelado` informa que no se cobró y conserva el carrito. **No** queda fila de pedido (el alta es solo en el webhook). Success, cancel y webhook solo `https://` en producción. `/pedido/*`, `/carrito` y `/api` en `Disallow` / no indexables. | Flujo cancelado + ausencia de fila + `robots.txt` + URLs |
| CHK-11 | Bloqueante | Regla de envío $2,999 | Subtotal (servidor) ≥ $2,999 MXN (`shipping_free_threshold_mxn`) → `shipping_fee = 0` en carrito, Session y `total`. Subtotal < $2,999, con `shipping_fee_mxn` configurado → esa tarifa se suma al **mismo** cobro. El body no puede imponer `shipping_fee` ni `total`; si los manda, se **ignoran**. Sin códigos de promo. | Carrito + line items de Session en ambos lados del umbral |
| CHK-12 | Bloqueante | Sin flete inventado | Si `shipping_fee_mxn` **no** tiene valor: Checkout **no** añade un monto inventado. Subtotal ≥ $2,999 sí puede cobrar (envío $0). Subtotal menor → no se crea Session (400). | Session / 400 en prueba sin parámetro |
| CHK-13 | Bloqueante | Solo confirmación pública | `/pedido/exito` confirma la compra (folio resuelto en servidor). **No** muestra pendiente / hecho / enviado / cancelado, ni un tablero de producción. Visitar la URL no marca pagado. | Captura de éxito + estado del pedido sin webhook válido |

### 11.3 Personalizados (W4)

Rutas y APIs: `/personalizados`, `POST /api/personalizados`, `POST /api/personalizados/upload`, `/personalizados/enviado`.

| ID | Sev. | Criterio | Resultado esperado | Evidencia |
|----|------|----------|--------------------|-----------|
| FRM-01 | Bloqueante | Intake canónico | El form pide los campos de [`NECESIDADES.md`](../discovery/NECESIDADES.md), con **espacio entre vueltas (`coil_spacing`) opcional** (no se exige; en SCHEMA es nullable). No se envía sin contacto ni medidas obligatorias. La foto con medidor es recomendada, **no** bloquea si falta. | Captura + rechazo de incompleto + envío válido sin `coil_spacing` y sin foto de medidor |
| FRM-02 | Bloqueante | Sin precio fijo | No muestra, calcula ni promete precio o lead time. Copy: cotización por WhatsApp; anticipo 50% al confirmar. Landing (§4.1) tampoco pone precio de personalizados. | Captura de `/personalizados` y del bloque en `/` |
| FRM-03 | Bloqueante | Allowlist | El alta fuerza `status = received` y `order_id` nulo. Un payload con otro `status`, un `order_id` u otro campo privilegiado se **rechaza** (API + RLS WITH CHECK). | Respuesta de rechazo + ausencia de fila corrupta |
| FRM-04 | Mayor | Validación | Enums (`tensión` / `compresión` / `torsión`; `pulgadas` / `milímetros`) y rangos en servidor; nombre y teléfono requeridos; largo máximo en notas. `coil_spacing` puede ir vacío. | Casos válido / inválido / opcional vacío |
| FRM-05 | Bloqueante | Storage | Upload firmado a `custom-samples`, TTL corto, path opaco. Allowlist **JPEG, PNG, HEIC, WebP**; máximo **8 MB** por archivo; vista previa en el form. Otros tipos o mayor tamaño se rechazan. El path entra al INSERT **después** del upload. Lectura anónima del bucket **denegada**. | Status de lectura denegada + subida válida + rechazo de tipo/tamaño |
| FRM-06 | Bloqueante | Rate limit | 5 / IP / 15 min y 3 / teléfono normalizado / hora, en `POST /api/personalizados` **y** en `POST /api/personalizados/upload`; `429`; **antes** de DB y Storage. | Ráfaga de prueba en ambos endpoints |
| FRM-07 | Bloqueante | Sin inbox público | Anónimo sin SELECT/UPDATE/DELETE de `custom_requests` (ni la propia fila). El alta **no** se apoya en `INSERT … RETURNING` bajo RLS sin política de lectura: el servidor inserta y devuelve **solo el folio** (ruta o query de `/personalizados/enviado`; no es PII). Inbox solo en `/admin`. El click a WhatsApp no muta `status`. | Query `anon` denegada o vacía + folio servido sin SELECT anónimo |
| FRM-08 | Mayor | Handoff WA | `/personalizados/enviado` muestra confirmación, folio corto y CTA `wa.me`. El query del deep link **no** lleva teléfono, email, fotos ni domicilio (solo folio; R12). El número sale de configuración, no hardcodeado de prueba en el repo. Si el dueño aún no entrega número, el form y el alta pueden existir; el CTA real queda pendiente (§10). | URL de handoff redactada + captura |
| FRM-09 | Menor | Español MX | Etiquetas y errores en español de México, alineados al intake. | Captura |

### 11.4 Landing, SEO y controles (W0, W1, W5, W6)

Rutas: `/`, `/sitemap.xml` (o `sitemap.ts`), `/robots.txt`, `/aviso-de-privacidad`, `/terminos`.

| ID | Sev. | Criterio | Resultado esperado | Evidencia |
|----|------|----------|--------------------|-----------|
| LND-01 | Bloqueante | Express visible | Hero de `/`: Fabricado express (días; a veces horas si es local y acotado) frente a semanas de la competencia. | Captura above-the-fold |
| LND-02 | Mayor | Cobertura y CTAs | Envíos a toda la República; origen Colima, Colima. CTAs a catálogo y a `/personalizados`. Cero CTA, menú, filtro o copy automotriz, stock o promo. Header/footer según §3, sin enlace destacado a `/admin`. | Captura de landing, header y footer |
| SEO-01 | Mayor | Metadatos | `lang="es-MX"`; title/description únicos (patrón `{página} \| Resortes Colima`); canonical y Open Graph HTTPS. Ficha: title `Nombre — Resortes Colima`; description a partir de datos reales, sin inventar specs. | `<head>` de `/`, un listado y 2 fichas |
| SEO-02 | Bloqueante | Sitemap y robots | Sitemap **solo**: home, `/catalogo`, cada catálogo público, cada producto que pasa el AND. Nunca automotriz, `/admin`, `/api`, `/carrito`, `/pedido/*`, `/personalizados/enviado`. `robots.txt`: allow público; `Disallow` `/admin`, `/api`, `/carrito`, `/pedido/`. | Contenido de ambos |
| SEO-03 | Mayor | JSON-LD | Home: `Organization` + `LocalBusiness` (Colima, MX). Producto: `Product` + `Offer` con `price` = `unit_price`, `priceCurrency` = `MXN`, **sin** `availability` de inventario, **sin** automotriz ni promo. | Fragmento JSON-LD |
| SEO-04 | Mayor | Render SEO | Landing, listados y fichas publicables renderizados en servidor. Catálogo parcial aceptable (solo ítems que pasan el AND). | HTML servido (view-source) de una ficha |
| HTTPS-01 | Bloqueante | Solo HTTPS en prod | Vercel; redirect **301** HTTP→HTTPS; callbacks Stripe y Auth solo `https://`. Sin mixed content. | Status del redirect + URLs de callback (sin secretos) |
| HTTPS-02 | Mayor | HSTS | `Strict-Transport-Security` en prod, `max-age` ≥ 15552000; `includeSubDomains` si el dominio lo permite. | Encabezado de respuesta |
| HTTPS-03 | Bloqueante | Preview vs prod | Preview en HTTPS; env y secretos **separados**; preview no apunta a DB productiva. La marca es **Resortes Colima**. El nombre de trabajo `resortescolima.mx` **no** se presenta como dominio ya registrado. | Comprobación de env (sin revelar valores) + captura de chrome / metadata |
| TRV-01 | Bloqueante | Anónimo acotado | Además de CAT-08 y FRM-07: denegado `customers`, `orders`, `income_entries`, `expense_entries`, `cfdi_links`, `profiles`. | Tests clave `anon` |
| TRV-02 | Bloqueante | Secretos | En cliente solo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Repo y bundle sin service/secret keys. | Scan (nombres, no valores) |
| TRV-03 | Menor | Legales y cookies | Existen rutas `/aviso-de-privacidad` y `/terminos` (copy final lo entrega el dueño; no se inventa razón social). Si el público setea cookies, en prod: `Secure` ([`SEGURIDAD.md`](SEGURIDAD.md) §3). | Rutas responden; `Set-Cookie` si aplica |

### 11.5 Orden de ejecución y regresión

1. Humo de marca: LND-01, LND-02, HTTPS-01 (preview HTTPS).
2. Catálogo: CAT-01 a CAT-12.
3. Checkout (pago de prueba Stripe): CHK-01 a CHK-13.
4. Personalizados: FRM-01 a FRM-09.
5. SEO y controles: SEO-01 a SEO-04, HTTPS-02, HTTPS-03, TRV-01, TRV-02.

**Regresión mínima** en cada release público (aunque el cambio «no toque» el catálogo):

| Tema | Casos |
|------|-------|
| Fuga automotriz | CAT-02, CAT-03, CAT-08, SEO-02, LND-02 |
| Fuga promos / stock | CAT-04, CAT-05, SEO-03 |
| Precio manipulado, flete o éxito falso | CHK-01, CHK-02, CHK-04, CHK-05, CHK-11, CHK-12, CHK-13 |
| Inbox o samples públicos | FRM-03, FRM-05, FRM-07 |
| HTTP o secretos | HTTPS-01, TRV-02 |
| Express visible | LND-01 |

No marcar pass con un fallo conocido en esa área.

### 11.6 Evidencia

Cada caso: **pass / fail / bloqueado**, fecha y hora (America/Mexico_City), entorno (URL de preview o proyecto de prueba), y adjunto mínimo:

- Captura de UI cuando el criterio es visual.
- Status HTTP, encabezados (`Retry-After`, HSTS, `Set-Cookie`) y extracto de cuerpo **sin** PII, tokens ni secretos.
- RLS: enunciado de la prueba con clave `anon` y resultado (vacío / denegado / conteo), no dumps de tablas reales.
- IDs sintéticos de producto o pedido de prueba, nunca clientes reales.

Retención corta; no copiar `.env` ni claves a tickets o chats.

### 11.7 Gate de «listo»

QA **no aprueba** un release público si hay fallo abierto en un caso **bloqueante** de las §§11.1–11.4, o si falta evidencia de la regresión mínima. En particular, bloquean:

- Automotriz, promos o stock visibles en UI, API, Storage o SEO.
- Checkout que use importe del cliente, o que confirme el pago solo con `/pedido/exito`.
- Webhook que escriba sin firma válida, o cobros duplicados.
- Form que acepte `status` / `order_id` privilegiados, o lectura pública del inbox / samples.
- HTTP plano en producción, o secretos / service role en el cliente.
- Landing de W1 sin el mensaje Fabricado express.

Un **mayor** no bloquea por sí solo un hotfix ajeno, pero sí el «listo» de su épica. Un **menor** se registra y no se silencia. Fallos conocidos impiden declarar «listo».

### 11.8 Huecos que no cierra este plan

| Qué falta | Quién |
|-----------|-------|
| Políticas SQL RLS, tests `anon` automáticos y firma | Seguridad / Sistema (gate antes de datos reales) |
| Copy final de handoff WhatsApp y reglas finas de fotos | Personalizados |
| Catálogo real, fotos editadas, precios del dueño | Catálogo (C1, C1b); hasta entonces, solo sintéticos |
| Monto exacto del envío (umbral $2,999 ya fijado), registro/DNS real, número de WhatsApp, textos legales, OK para implementar | Dueño / CEO (§10); Gerente Web comunica el OK |

QA no amplia el alcance (promos públicas, stock, automotriz, flete inventado) sin un nuevo despacho del Gerente Web.
