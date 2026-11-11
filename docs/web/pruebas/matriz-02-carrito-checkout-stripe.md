# Matriz CHK — Carrito + checkout Stripe

Flujo público: compra de catálogo multiusos con **Stripe Checkout Session**.

Las reglas de servidor nacen de [`FLUJOS.md`](../../arquitectura/FLUJOS.md) §5 y están **cerradas en UX** por [`WEB_IA.md`](../../arquitectura/WEB_IA.md) §§4.5–4.7 y 11.2.

**Rutas y APIs:** `/carrito`; `POST /api/checkout/session` (body `{ items: [{ product_id, quantity }] }`); redirección a Stripe Checkout Session (HTTPS, moneda MXN); `POST /api/webhooks/stripe`; `/pedido/exito`; `/pedido/cancelado`.

**Estado de todos los casos:** Pendiente — sin app.  
**Pagos:** solo en entorno de prueba Stripe cuando exista la app; nunca con secretos de producción en preview.

Fuentes: WEB_IA §§4.5–4.7, 9, 10 y 11.2; FLUJOS §5; SEGURIDAD.md §1, §6, §7, §8; SCHEMA; STACK.md; BRIEF «Pagos web»; BACKLOG W3; [`D2_ESTADOS.md`](../../discovery/D2_ESTADOS.md) (`draft` → webhook → `confirmed`).

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| CHK-001 | Armar carrito solo con productos `visible_web` publicables | P0 | feliz | Pendiente — sin app |
| CHK-002 | Crear Checkout Session con ids + qty; precios desde la DB | P0 | feliz | Pendiente — sin app |
| CHK-003 | Alta de pedido `draft` + snapshot de ítems (service role) | P0 | feliz | Pendiente — sin app |
| CHK-004 | El pago de Stripe ocurre por HTTPS | P0 | feliz | Pendiente — sin app |
| CHK-005 | Webhook firmado confirma pedido + `income_entries.kind = stripe` | P0 | feliz | Pendiente — sin app |
| CHK-006 | La URL de success no marca el pedido como pagado | P0 | seguridad | Pendiente — sin app |
| CHK-007 | El servidor ignora `unit_price` y `total` enviados por el cliente | P0 | seguridad | Pendiente — sin app |
| CHK-008 | El servidor ignora o rechaza `is_automotive` del cliente | P0 | seguridad | Pendiente — sin app |
| CHK-009 | Se rechazan productos no visibles, inactivos o no web | P0 | negativo | Pendiente — sin app |
| CHK-010 | Se rechaza automotriz en el carrito | P0 | marca | Pendiente — sin app |
| CHK-011 | Cantidad 0 o negativa se rechaza | P0 | límite | Pendiente — sin app |
| CHK-012 | Cantidad por encima del tope se rechaza | P1 | límite | Pendiente — sin app |
| CHK-013 | Moneda forzada a MXN | P0 | seguridad | Pendiente — sin app |
| CHK-014 | Rate limit al crear sesión: `429` + Retry-After | P0 | seguridad | Pendiente — sin app |
| CHK-015 | El total público no consulta ni aplica `promos` | P0 | marca | Pendiente — sin app |
| CHK-016 | No hay descuento de stock en ningún paso | P0 | marca | Pendiente — sin app |
| CHK-017 | El anónimo no lee ni escribe `orders` / `order_items` | P0 | seguridad | Pendiente — sin app |
| CHK-018 | Service role y secretos no van al cliente | P0 | seguridad | Pendiente — sin app |
| CHK-019 | Evento de webhook sin firma válida no escribe en DB | P0 | seguridad | Pendiente — sin app |
| CHK-020 | Idempotencia del webhook: sin cobro duplicado | P0 | seguridad | Pendiente — sin app |
| CHK-021 | Checkout guest (sin login de cliente) | P1 | feliz | Pendiente — sin app |
| CHK-022 | Callbacks de success/cancel solo en `https://` | P0 | seguridad | Pendiente — sin app |
| CHK-023 | Cancelar en Stripe no confirma ni registra ingreso Stripe | P1 | negativo | Pendiente — sin app |
| CHK-024 | Checkout no añade un flete inventado | P1 | marca | Pendiente — sin app |
| CHK-025 | `is_express` no se enciende solo por ser pedido web | P1 | marca | Pendiente — sin app |
| CHK-026 | El snapshot de precios no se reescribe si cambia la lista después | P1 | límite | Pendiente — sin app |

---

## Contratos ya fijados en WEB_IA (no inventar por encima)

- El carrito en el cliente solo guarda ids y cantidades; **los importes se vuelven a leer de la DB** al pintar y al crear la Session. Si un ítem dejó de ser publicable, se quita y se avisa (CHK-009).
- Cantidad entera **1–99**; máx. **20 líneas** por pedido (tope de implementación, no política comercial).
- Si **algún** `product_id` no pasa el AND → **400**, no se crea Session ni pedido.
- Éxito: `/pedido/exito` agradece y avisa que se está confirmando el pago; el folio, si aparece, se resuelve **en servidor**. No marca pagado.
- Cancelación: `/pedido/cancelado` informa que no se completó y **conserva el carrito**.
- Envío: **no se inventa flete** hasta que el dueño fije tarifas (CHK-024, WEB_IA §10).
- Contacto de invitado: snapshots vacíos hasta el webhook (vienen de la Session de Stripe).
- `is_express` no se enciende solo por ser web (CHK-025).
- Estado post-webhook documentado: `confirmed` (WEB_IA §4.6 y D2_ESTADOS). FLUJOS aún habla de estados provisionales: anotar el valor real.

Los efectos en `orders` e `income_entries` se verifican con apoyo de Sistema/admin o logs de servidor (el anónimo no puede leer esas tablas).

---

### CHK-001 — Armar carrito solo con productos `visible_web` publicables

| Campo | Detalle |
|-------|---------|
| Caso | El visitante arma un carrito con productos que cumplen la regla de publicación web. |
| Precondiciones | Fixtures M105-OK y/o M56-OK (ver matriz CAT). Ruta `/carrito` (WEB_IA §4.5). |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Captura del carrito con ids y cantidades; ningún ítem no publicable. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: *Carrito productos visible_web*; *Sin promos UI; sin stock; sin automotriz*. |

**Pasos**

1. Desde una ficha o tarjeta, añadir uno o más productos publicables (el cliente solo guarda `{ product_id, quantity }`).
2. Abrir `/carrito` y revisar líneas (foto, nombre, qty 1–99, precio unitario y subtotal **servidos** por el servidor) y el total MXN.
3. Confirmar que el contador del header, si existe, cuenta **piezas**, no un importe cacheado del cliente (WEB_IA §3).

**Resultado esperado**

- El carrito solo contiene productos publicables.
- No muestra stock ni precio promocional.

---

### CHK-002 — Crear Checkout Session con ids + qty; precios desde la DB

| Campo | Detalle |
|-------|---------|
| Caso | El `POST` de creación de Checkout Session envía (o el servidor solo acepta) identificadores de producto y cantidades. Los importes los carga el servidor desde la DB. |
| Precondiciones | Carrito válido (CHK-001). Endpoint `POST /api/checkout/session` (WEB_IA §4.6). CTA en `/carrito`: «Pagar con Stripe». |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Request (ids + qty) y respuesta de creación de sesión; el monto de la sesión Stripe coincide con la suma de `unit_price` de la DB × qty, no con un total inventado por el cliente. Sin secretos en la evidencia. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: *Crear Checkout Session (solo ids + qty)*; *ignora unit_price/total del cliente; carga precios de DB*. |

**Pasos**

1. Iniciar checkout con productos publicables y cantidades > 0.
2. Observar el payload aceptado por la API y los importes de la sesión Stripe (entorno de prueba).

**Resultado esperado**

- La sesión se crea con precios calculados en servidor a partir de la DB.
- Moneda MXN (CHK-013).

---

### CHK-003 — Alta de pedido `draft` + snapshot de ítems (service role)

| Campo | Detalle |
|-------|---------|
| Caso | Al crear la sesión, el servidor (service role) abre un `orders` en `draft`, canal `web`, e `order_items` con snapshot de nombre y precio. |
| Precondiciones | CHK-002 exitoso en entorno de prueba. Estados de pedido **provisionales** hasta D2: se verifica `draft` según FLUJOS/SCHEMA actuales, con nota si Pedidos cambia el nombre. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Registro staff/admin o log de servidor del pedido (`channel = web`, estado `draft`, `stripe_checkout_session_id` presente) e ítems con `unit_price` / `line_total` de snapshot. Sin PII innecesaria. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5 actor DB; SCHEMA `orders.channel`, `stripe_checkout_session_id`; *el anónimo no inserta el pedido*. Estados provisionales: gap D2. |

**Pasos**

1. Crear una Checkout Session de prueba.
2. Con apoyo staff, localizar el pedido y sus ítems **antes** de pagar (o inmediatamente tras crear la sesión).

**Resultado esperado**

- Existe pedido `draft` canal `web` con snapshot de precios de DB.
- El cliente anónimo no hizo el INSERT (CHK-017).
- `is_automotive` de los ítems no queda en verdadero por origen web.

---

### CHK-004 — El pago de Stripe ocurre por HTTPS

| Campo | Detalle |
|-------|---------|
| Caso | El comprador completa (o inicia) el Checkout de Stripe en una URL HTTPS. |
| Precondiciones | Sesión de prueba creada. Stripe en modo test. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Captura o barra de dirección de la página de Checkout Stripe en `https://`. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5 *Pago HTTPS*; SEGURIDAD.md §1 *Callbacks… solo https://*; STACK Stripe Checkout Session. |

**Pasos**

1. Redirigir (o embebido, si WEB_IA lo define) a Stripe Checkout.
2. Verificar el esquema HTTPS de la página de pago.

**Resultado esperado**

- El flujo de pago no ocurre en HTTP plano.
- No se piden ni se almacenan PAN en el sitio (CHK / SEG-013).

---

### CHK-005 — Webhook firmado confirma pedido + `income_entries.kind = stripe`

| Campo | Detalle |
|-------|---------|
| Caso | Tras un pago de prueba exitoso, el webhook `checkout.session.completed` (firma válida) confirma el pedido y registra un ingreso `kind = stripe`. |
| Precondiciones | Sesión pagada en Stripe test. `STRIPE_WEBHOOK_SECRET` configurado en servidor, no en el cliente. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Evidencia staff: pedido ya no queda solo como no pagado (estado post-webhook según se documente; hoy los nombres son provisionales); `income_entries` con `kind = stripe`, `method = stripe`, monto acorde al total, ligado a `order_id` / payment intent. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5 y §4.1; SEGURIDAD.md §8; SCHEMA `income_entries.kind`. WEB_IA §4.6 y D2_ESTADOS: el webhook pasa el pedido de `draft` a `confirmed` (provisional si D2 no está cerrado formalmente; anotar el valor real). También snapshot de email/teléfono/dirección desde la Session. Cruce QA CHK-05. |

**Pasos**

1. Completar un pago test válido.
2. Esperar el procesamiento del webhook (no usar la URL de success como prueba de cobro).
3. Verificar pedido e `income_entries` con apoyo staff.

**Resultado esperado**

- Un solo ingreso `kind = stripe` ligado al pedido.
- Confirmación hecha por el webhook, no por la página de success.

---

### CHK-006 — La URL de success no marca el pedido como pagado

| Campo | Detalle |
|-------|---------|
| Caso | Visitar o recargar la URL de success **no** confirma el pedido ni crea `income_entries`. Solo el webhook firmado lo hace. |
| Precondiciones | Pedido `draft` con sesión creada, **sin** webhook de pago completado (pago no finalizado, o webhook aún no enviado). Ruta `/pedido/exito` (WEB_IA §4.7). El folio, si se muestra, se resuelve en servidor (p. ej. session id), nunca confiando en un «pagado» del querystring. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Log o captura de la visita a success; pedido sigue sin ingreso `stripe` y sin confirmación de pago. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: *La URL de success no marca el pedido como pagado; solo el webhook.* SEGURIDAD §7 y §8: *No confiar en querystring de success.* Check defensivo. |

**Pasos**

1. Tener un pedido `draft` asociado a una sesión no completada (o cuyo webhook no se ha aplicado).
2. Abrir la URL de success (cuando exista) como lo haría el comprador.
3. Verificar en staff que el pedido no pasó a pagado/confirmado y que no hay `income_entries.kind = stripe`.

**Resultado esperado**

- Success es informativa (o la UX que defina WEB_IA), no un trigger de cobro.

---

### CHK-007 — El servidor ignora `unit_price` y `total` enviados por el cliente

| Campo | Detalle |
|-------|---------|
| Caso | Si el cliente envía importes, el servidor no los usa para la sesión ni para el snapshot. |
| Precondiciones | Producto publicable con `unit_price` conocido en DB. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Payload de creación de sesión que incluya un `unit_price`/`total` distinto al de DB (si el contrato de API los acepta en el cuerpo) o constancia de que esos campos no forman parte del contrato; monto de la sesión y del snapshot igual al de DB. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5 anti-tampering; SEGURIDAD §7. Check de comportamiento esperado, no un procedimiento de explotación. No hace falta “inventar” un precio de negocio: basta un valor distinto al de la fila. |

**Pasos**

1. Solicitar la creación de sesión para un id publicable y qty válida, incluyendo (si el cuerpo lo permite) `unit_price` y `total` distintos a la DB.
2. Comparar importe de sesión Stripe y `order_items.unit_price` con la DB.

**Resultado esperado**

- Los importes usados son los de la DB.
- El valor enviado por el cliente no reduce ni altera el cobro.

---

### CHK-008 — El servidor ignora o rechaza `is_automotive` del cliente

| Campo | Detalle |
|-------|---------|
| Caso | El cliente no puede marcar un ítem web como automotriz ni colar el flag en el alta. |
| Precondiciones | Producto multiusos publicable. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Si el payload incluye `is_automotive = true`, la sesión se crea solo como catálogo web (ítem `is_automotive` falso o la petición se rechaza). Evidencia del snapshot. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: ignora `unit_price`, `total` e `is_automotive` enviados por el cliente. SCHEMA: `is_automotive` nunca origen web. |

**Pasos**

1. Crear sesión para un publicable enviando `is_automotive` (si el cuerpo lo permite).
2. Revisar el `order_item` resultante (staff).

**Resultado esperado**

- No queda una línea automotriz originada en la web.
- Automotriz real se rechaza en CHK-010.

---

### CHK-009 — Se rechazan productos no visibles, inactivos o no web

| Campo | Detalle |
|-------|---------|
| Caso | Ids de M-HID, M-INA o no existentes no entran en la sesión ni en el pedido. |
| Precondiciones | Fixtures no publicables conocidos; el cliente intenta incluirlos (p. ej. id manipulado en el request de sesión, no solo desde la UI). |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Respuesta de rechazo (sin crear sesión, o sesión sin esos ids); ningún `order_item` de esos productos. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: solo si `visible_web = true` **AND** `is_active = true` **AND** catálogo/línea públicos; *Rechaza automotriz o no web en el carrito.* Rechazo documentado: **400**. Cruce QA CHK-02. |

**Pasos**

1. Solicitar Checkout Session incluyendo al menos un id no publicable (solo, o mezclado con un publicable).
2. Verificar respuesta y, en staff, ausencia de ítems no publicables.

**Resultado esperado**

- No se vende un producto no web.
- Si el carrito es mixto o solo de no publicables: respuesta **400**, no se crea Session ni pedido (WEB_IA §4.6 punto 3; QA CHK-02). En `/carrito`, un ítem que dejó de ser publicable se quita y se avisa.

---

### CHK-010 — Se rechaza automotriz en el carrito

| Campo | Detalle |
|-------|---------|
| Caso | Un id de línea automotriz no puede formar parte de una Checkout Session. |
| Precondiciones | AUTO-1 en el maestro. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Rechazo de la API; ningún pedido web con ese ítem. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5; BRIEF exclusión automotriz; cruza con MAR-003. |

**Pasos**

1. Solicitar creación de sesión con el id de AUTO-1 (solo o mixto).
2. Verificar que no hay sesión cobrable ni `order_items` automotriz de origen web.

**Resultado esperado**

- Automotriz rechazado. Sin cobro de esa línea por la web.

---

### CHK-011 — Cantidad 0 o negativa se rechaza

| Campo | Detalle |
|-------|---------|
| Caso | Las cantidades deben ser > 0. |
| Precondiciones | Producto publicable. |
| Prioridad / tipo | P0 / límite |
| Evidencia requerida | Respuesta de rechazo para qty `0` y para un valor negativo; no hay sesión ni ítem con esas cantidades. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: *Cantidades > 0 con tope.* |

**Pasos**

1. Solicitar sesión con qty `0`.
2. Solicitar sesión con una qty negativa.
3. Confirmar que no se abre Checkout ni pedido cobrable.

**Resultado esperado**

- Ambas solicitudes se rechazan.

---

### CHK-012 — Cantidad por encima del tope se rechaza

| Campo | Detalle |
|-------|---------|
| Caso | Cantidad entera 1–99 y máximo 20 líneas por pedido; se rechaza exceder esos topes. |
| Precondiciones | Productos publicables suficientes para armar 21 líneas en un caso, y uno para probar qty 99 y 100. |
| Prioridad / tipo | P1 / límite |
| Evidencia requerida | qty 1 y 99 aceptadas (si el resto es válido); qty 0, negativa o 100 rechazadas; 20 líneas aceptadas; 21 líneas rechazadas, sin Session. Cruce QA CHK-03. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.5: *Máx. 20 líneas por pedido (tope de implementación; no es política comercial). Cantidad entera > 0* y, en la misma sección, qty (1–99). FLUJOS §5 «con tope». |

**Pasos**

1. Crear sesión (o validar en `/carrito`) con qty 1 y con qty 99 de un publicable.
2. Intentar qty 100 (y, si no se cubrió en CHK-011, qty 0 o negativa).
3. Armar un carrito de 20 líneas publicables y uno de 21.

**Resultado esperado**

- 1–99 y 20 líneas: se puede avanzar a Session (si el resto es válido).
- 100 unidades, 0, negativa o 21 líneas: rechazo, sin Session ni pedido cobrable.

---

### CHK-013 — Moneda forzada a MXN

| Campo | Detalle |
|-------|---------|
| Caso | La sesión y el pedido quedan en MXN aunque el cliente envíe otra moneda. |
| Precondiciones | Producto publicable. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Sesión Stripe test y pedido en MXN; si se envía otra moneda en el payload, se ignora o se rechaza. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5 *moneda forzada MXN*; SCHEMA `orders.currency`. |

**Pasos**

1. Crear sesión normal y verificar moneda MXN.
2. Si el contrato de API permite un campo de moneda, enviarlo distinto de MXN y verificar que no se cobra en esa moneda.

**Resultado esperado**

- Cobro y snapshot en MXN.

---

### CHK-014 — Rate limit al crear sesión: `429` + Retry-After

| Campo | Detalle |
|-------|---------|
| Caso | El `POST` de crear Checkout Session está limitado a **5–10** solicitudes / IP / 15 min. Al excederse, responde `429` con Retry-After, **antes** de hablar con Stripe o escribir en DB. |
| Precondiciones | Entorno de prueba. El número exacto dentro del rango 5–10 no está fijado. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Serie de POST desde la misma IP: las solicitudes dentro del límite se procesan según reglas de negocio; la que excede recibe `429` y encabezado Retry-After; no hay una sesión Stripe ni un pedido nuevo atribuible a esa solicitud excedida. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5; SEGURIDAD.md §6. **Gap:** valor exacto (5, 10 u otro del rango) pendiente de fijar. El caso verifica el rango documentado y el contrato de respuesta, no un número inventado. Check defensivo: no es una prueba de saturación de infraestructura. |

**Pasos**

1. Confirmar el umbral configurado (debe caer en 5–10 / IP / 15 min).
2. Emitir creaciones de sesión de prueba hasta superar ese umbral desde la misma IP.
3. Inspeccionar status, Retry-After y la ausencia de efectos en Stripe/DB para la llamada limitada.

**Resultado esperado**

- `429` + Retry-After al exceder.
- El límite se aplica **antes** de Stripe y de la DB.
- El umbral efectivo está en el rango documentado.

---

### CHK-015 — El total público no consulta ni aplica `promos`

| Campo | Detalle |
|-------|---------|
| Caso | Una promo interna sobre el producto no altera el total de la sesión. |
| Precondiciones | M105-OK con promo interna activa en datos y `promos.visible_web = false`. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Importe de sesión = `unit_price` de lista × qty; evidencia staff de que la promo existía. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5: la API pública **no consulta** `promos`. |

**Pasos**

1. Crear sesión del producto con promo interna.
2. Comparar total con el precio de lista.

**Resultado esperado**

- Sin descuento de promo en el checkout público.

---

### CHK-016 — No hay descuento de stock en ningún paso

| Campo | Detalle |
|-------|---------|
| Caso | Completar el flujo de carrito → sesión → pago **no** descuenta inventario (no hay stock en MVP). |
| Precondiciones | Pedido web de prueba, idealmente pagado (CHK-005). |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Confirmación de que no existen columnas ni movimientos de stock, y de que la UI pública no cambió “disponibilidad”. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §2 y §5; SCHEMA *Sin reserva de inventario*; BRIEF sin stock en MVP. |

**Pasos**

1. Ejecutar un checkout de prueba hasta el webhook (o hasta draft, si el pago no está disponible).
2. Verificar schema/UI: no hay qty reservada ni descontada.

**Resultado esperado**

- Ningún descuento de stock. El catálogo público no muestra disponibilidad alterada.

---

### CHK-017 — El anónimo no lee ni escribe `orders` / `order_items`

| Campo | Detalle |
|-------|---------|
| Caso | Con clave `anon` no hay SELECT, INSERT, UPDATE ni DELETE en `orders` ni `order_items`, incluida la fila recién creada por el servidor. |
| Precondiciones | Un pedido web de prueba ya creado por service role. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Resultados de las operaciones anónimas: denegado o vacío (prueba de aceptación SCHEMA / SEGURIDAD §4). |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA: *El anónimo no tiene políticas de lectura ni de escritura*; altas solo service role. Check defensivo. |

**Pasos**

1. Con cliente `anon`, intentar leer `orders` y `order_items`.
2. Confirmar que no hay política de escritura anónima (el alta ocurre solo en el Route Handler).

**Resultado esperado**

- Lectura anónima vacía o denegada.
- El comprador no lista pedidos por la API pública.

---

### CHK-018 — Service role y secretos no van al cliente

| Campo | Detalle |
|-------|---------|
| Caso | El bundle/navegador no contiene `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET`. |
| Precondiciones | Build de la app pública (prod o preview con env separado). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Revisión del bundle / variables `NEXT_PUBLIC_*` expuestas: solo las claves públicas documentadas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). |
| Estado | Pendiente — sin app |
| Notas / fuente | STACK.md; SEGURIDAD.md §3 y §5; FLUJOS §5 *Service role nunca en el cliente.* Check defensivo. Cruza con SEG-006. |

**Pasos**

1. Inspeccionar el cliente (fuentes públicas y env `NEXT_PUBLIC_`) cuando exista la app.
2. Confirmar ausencia de secretos de servidor.

**Resultado esperado**

- En el cliente solo claves públicas documentadas.

---

### CHK-019 — Evento de webhook sin firma válida no escribe en DB

| Campo | Detalle |
|-------|---------|
| Caso | Una petición al endpoint de webhook **sin** firma válida no confirma pedidos ni crea ingresos. |
| Precondiciones | Endpoint de webhook desplegado; un `order` draft de control que no deba alterarse. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Respuesta de rechazo (sin writes); el pedido de control y `income_entries` sin cambios. No se documentan aquí métodos para falsificar firmas. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §8: *sin firma válida → no writes*; body crudo para `constructEvent`. Check defensivo de comportamiento esperado. |

**Pasos**

1. Enviar al webhook una petición que no pase la verificación de firma (p. ej. sin encabezado de firma, en entorno de prueba).
2. Verificar que no hay writes de confirmación ni de `income_entries`.

**Resultado esperado**

- Sin firma válida: cero escrituras privilegiadas.

---

### CHK-020 — Idempotencia del webhook: sin cobro duplicado

| Campo | Detalle |
|-------|---------|
| Caso | Reentregar el mismo evento (`event.id` / `checkout_session_id` / payment intent) no crea un segundo `income_entries`. |
| Precondiciones | Un `checkout.session.completed` de prueba ya aplicado con ingreso `stripe`. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Staff: un solo ingreso `kind = stripe` para ese pago tras la reentrega. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5; SEGURIDAD.md §8 idempotencia. |

**Pasos**

1. Tener un pago test ya confirmado por webhook.
2. Reentregar el mismo evento de forma soportada por Stripe (reintento oficial o equivalente de test).
3. Contar `income_entries` ligados a ese pago/pedido.

**Resultado esperado**

- Un solo cobro `stripe`. El pedido no se “reconfirma” como un segundo ingreso.

---

### CHK-021 — Checkout guest (sin login de cliente)

| Campo | Detalle |
|-------|---------|
| Caso | El comprador de catálogo no necesita cuenta ni portal de cliente. |
| Precondiciones | Superficie pública; no existe portal cliente en Fase 1. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Recorrido de compra test sin registro/login de cliente. |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA: *No hay rol “cliente web” en MVP (checkout guest)*; STACK límites Fase 1. WEB_IA §4.6: snapshots de contacto vacíos hasta el webhook (llegan desde la Session de Stripe). Sin cuenta de cliente. Cruce QA CHK-08/CHK-09. |

**Pasos**

1. Recorrer el checkout de prueba sin autenticarse como cliente.
2. Confirmar que no se exige alta de usuario público.

**Resultado esperado**

- Compra posible como invitado.
- No hay self-service de cuenta de cliente.

---

### CHK-022 — Callbacks de success/cancel solo en `https://`

| Campo | Detalle |
|-------|---------|
| Caso | Las URLs de success y cancel configuradas hacia Stripe usan únicamente `https://`. |
| Precondiciones | Configuración de Checkout Session en un deploy con HTTPS (Vercel). Dominio de producción puede estar aún por crear (gap W0): aplicar en el entorno que exista. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | URLs de return en la sesión de prueba (o config) con esquema `https://`. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §1. Cruza con SEG-004. |

**Pasos**

1. Crear una sesión de prueba.
2. Revisar `success_url` y `cancel_url`.

**Resultado esperado**

- Ambas URLs son `https://`. Ninguna usa HTTP plano.

---

### CHK-023 — Cancelar en Stripe no confirma ni registra ingreso Stripe

| Campo | Detalle |
|-------|---------|
| Caso | Si el comprador cancela o no completa el pago, no se registra `income_entries.kind = stripe` y el pedido no queda como pagado. |
| Precondiciones | Sesión creada; el usuario cancela en Stripe o visita `/pedido/cancelado` (WEB_IA §4.7: informa que no se completó y conserva el carrito; no borra el draft a la fuerza). |
| Prioridad / tipo | P1 / negativo |
| Evidencia requerida | Staff: pedido sigue sin ingreso `stripe`; no aparece como pagado. |
| Estado | Pendiente — sin app |
| Notas / fuente | Consecuencia directa de «solo el webhook confirma» (FLUJOS §5). El manejo fino de eventos de fallo («mínimos de fallo si se manejan», SEGURIDAD §8) está parcialmente abierto: no inventar un estado final; verificar la ausencia de cobro. |

**Pasos**

1. Crear sesión de prueba y cancelar el Checkout de Stripe.
2. Verificar pedido e ingresos (staff).

**Resultado esperado**

- Sin ingreso `stripe`.
- El pedido no se marca pagado por la URL de cancel ni por la de success.


---

### CHK-024 — Checkout no añade un flete inventado

| Campo | Detalle |
|-------|---------|
| Caso | Hasta que el dueño fije tarifas de envío, la Checkout Session **no** incluye un costo de flete inventado. |
| Precondiciones | Sesión de prueba con productos publicables. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Line items de la Session de prueba: solo precios de lista de producto (× qty), sin un shipping_option o cargo de envío inventado. Cruce QA CHK-11. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.5 y §10: prohibido inventar un monto de flete; se puede recolectar dirección en Stripe (si el dueño lo autoriza) y acordar el envío en operación, o activar `shipping_options` cuando existan montos reales. |

**Pasos**

1. Crear una Checkout Session de prueba.
2. Revisar los line items (y shipping) de esa sesión.

**Resultado esperado**

- No hay un costo de envío inventado.
- Tampoco hay códigos de promo (CHK-015).

---

### CHK-025 — `is_express` no se enciende solo por ser pedido web

| Campo | Detalle |
|-------|---------|
| Caso | Un pedido de catálogo web no queda con `is_express = true` solo por el canal. La promesa express vive en el copy; `promised_by` lo pone operación. |
| Precondiciones | Pedido `draft` o confirmado de un checkout de prueba. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Fila de pedido (staff): canal `web`, `is_express` no autoencendido. Cruce QA CHK-08. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.6; D2_ESTADOS: la web pública no muestra una fecha automática en checkout. |

**Pasos**

1. Completar (o crear) un checkout de prueba.
2. Revisar `is_express` y `promised_by` en el pedido.

**Resultado esperado**

- `is_express` no pasa a verdadero solo por ser web.
- La UI de checkout no muestra un SLA de fecha inventado.

---

### CHK-026 — El snapshot de precios no se reescribe si cambia la lista después

| Campo | Detalle |
|-------|---------|
| Caso | El snapshot de nombre y precios se toma **antes** de redirigir a Stripe. Un cambio posterior de `unit_price` en el maestro no reescribe ese pedido. |
| Precondiciones | Pedido de prueba con snapshot tomado; luego se edita (en entorno de prueba) el `unit_price` del producto. |
| Prioridad / tipo | P1 / límite |
| Evidencia requerida | `order_items.unit_price` / `line_total` iguales al snapshot original. Cruce QA CHK-09. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.6 y QA CHK-09. Coordinar el cambio de precio solo en fixtures, nunca en datos reales. |

**Pasos**

1. Crear sesión y pedido `draft` de un publicable (anotar el `unit_price` snapshot).
2. Cambiar el precio de lista del producto en el maestro de prueba.
3. Verificar el pedido (y, si se paga, el ingreso) contra el snapshot, no contra el nuevo precio.

**Resultado esperado**

- El pedido conserva el snapshot original.
