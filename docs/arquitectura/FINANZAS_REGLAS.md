# Finanzas — reglas finas (Fase 1)

**Estado:** alineado a la máquina D2 cerrada y a los cinco casos borde **cerrados por el dueño** (2026-11-11). Validación de arquitectura de Finanzas de la misma fecha. Sin inventar política extra.

Referencias: [`BRIEF.md`](../negocio/BRIEF.md), [`D2_ESTADOS.md`](../discovery/D2_ESTADOS.md), [`FLUJOS.md`](FLUJOS.md) §2–§5, [`SCHEMA.md`](SCHEMA.md), [`KUBOX.md`](../discovery/KUBOX.md), [`WEB_IA.md`](WEB_IA.md), [`finanzas.md`](../agentes/depts/finanzas.md), [`VALIDACION_FINANZAS.md`](VALIDACION_FINANZAS.md).

Este documento cubre fiado, anticipos (incluidos casos borde), conciliación Stripe vs notas, y reportes MVP.

---

## 0. Principios ya fijados (no se reabren aquí)

- Ingresos y egresos en módulos y tablas separados; se registra **todo**.
- Preferir cada cobro ligado a un pedido (`income_entries.order_id` no nulo).
- Anticipo **50%** en trabajos personalizados; es un ingreso (`kind = deposit_50`), **no** un estado de pedido. Precio no fijo en web.
- “Notas” = efectivo en el local (`kind = note_cash`, `method = cash`).
- Fiado = crédito a clientes conocidos (`customers.allows_credit`).
- Saldo de crédito **derivado** (pedidos + cobros); no un campo suelto.
- Pagos web: Stripe Checkout; webhook firmado e idempotente. El pedido web entra en `pendiente` **ya pagado**. El monto del ingreso Stripe es el `total` cobrado (`subtotal + shipping_fee`). Envío gratis si `subtotal >= 2999` MXN; si no, tarifa `shipping_fee_mxn` (aún sin monto: **no se inventa**; sin valor y subtotal menor, no se crea Session).
- Máquina de pedido (D2, cerrada): `cotizado` (opcional, no web) → `pendiente` → `hecho` → `enviado`, más `cancelado` (desde `cotizado`, `pendiente` o `hecho`; **no** desde `enviado`). No hay `draft` ni `closed`.
- CFDI se timbra en Kubox; el sistema solo guarda UUID, folio/serie, estado y PDF/XML opcional. Prohibido scrapear Kubox o inventar API.
- Conciliación bancaria multi-cuenta: **fuera** de Fase 1.
- Cancelación con dinero ya cobrado (anticipo o Stripe completo) desde `cotizado`, `pendiente` o `hecho`: **se retiene**. El ingreso original no se borra. No hay devolución automática. No hay `kind = refund`. No se cancela desde `enviado`.
- Solo el dueño (`owner`) marca `customers.allows_credit`; el encargado no.
- Fiado informal: sin plazo fijo y sin estado «vencido» por calendario. Sin tope numérico en pesos ni en número de pedidos; basta la bandera y ver el saldo en admin (caso a caso).
- Pasar a `enviado` y timbrar CFDI con saldo pendiente: **solo** si ese cliente tiene `allows_credit`. Si no, el saldo se cobra antes de enviar.
- Cambio de % de anticipo, de reglas de crédito o de Stripe → escalar al CEO.

---

## 1. Anticipos

### 1.1 Ya fijado

- Anticipo 50% en personalizados: `income_entries.kind = deposit_50`. No es un estado.
- Al convertir el intake, el pedido nace en `cotizado` (`line_focus = custom`, canal `whatsapp`, nunca `web`).
- **No se pasa a `pendiente`** mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total`, redondeado **hacia arriba** al centavo.
- El anticipo puede ser efectivo, transferencia o Stripe, según el caso (`method`).
- Catálogo web: pago **total** (productos + flete) vía Stripe; sin anticipo y sin fiado. Entra en `pendiente` ya pagado, solo por el webhook.

### 1.2 Operativa (cálculo y registro)

**Cálculo.** Anticipo requerido = 50% de `orders.total`, redondeado hacia arriba al centavo. Saldo = `total −` anticipo requerido. Así nunca se pide menos del 50%.

**Se registra lo que sí entró**, no lo “ideal” (principio de registrar todo). Un solo movimiento por dinero recibido (no dos `kind` para el mismo peso):

| Qué entró | `kind` | `method` | Efecto en el pedido |
|-----------|--------|----------|---------------------|
| Abono que suma hacia el 50% | `deposit_50` | el real (`cash`, `transfer`, `stripe`) | Sigue en `cotizado` si la suma de ingresos vigentes es < el anticipo requerido |
| Cubre el 50% y no el total | `deposit_50` | el real | Puede pasar a `pendiente` |
| Cubre el total de una vez | `payment` (o `stripe` si viene del webhook) | el real | Puede pasar a `pendiente` y saldo en 0 |
| Efectivo de mostrador que es anticipo | `deposit_50` | `cash` | Es una “nota” en el lenguaje local; **no** se duplica con un segundo movimiento `note_cash` |

`kind` = propósito del movimiento. `method` = cómo llegó el dinero. `note_cash` se reserva para efectivo en el local **sin** que sea anticipo ni abono a fiado (por ejemplo, un cobro suelto aún sin pedido). Pago de saldo en efectivo: `kind = payment`, `method = cash`.

**Varios abonos.** Se permiten parciales. El paso a `pendiente` en personalizados solo cuando la suma de ingresos vigentes ≥ el anticipo requerido.

**Después de `pendiente`.** Sigue `hecho` → `enviado`, o `cancelado` (no desde `enviado`). El saldo restante se puede cobrar antes (`kind = payment`). Pasar a `enviado` con saldo pendiente solo si el cliente tiene `allows_credit` (§2.1); si no, el saldo se cobra antes de enviar.

**Stripe en personalizados.** Un anticipo cobrado con Stripe (por ejemplo un Payment Link) se registra `kind = deposit_50`, `method = stripe`, con `stripe_payment_intent_id`. Sin duplicar el mismo intent. El checkout de catálogo no usa este camino.

### 1.3 Cancelación con dinero ya cobrado (fijado, dueño 2026-11-11)

Si se cancela un pedido desde `cotizado`, `pendiente` o `hecho` con anticipo o con pago Stripe completo ya cobrado: **se retiene**. El ingreso original **no se borra**. **No hay devolución automática.** **No se agrega** `kind = refund`. Igual para personalizados y para un pedido web. No se cancela desde `enviado` (máquina D2).

---

## 2. Fiado

### 2.1 Ya fijado (incluye decisiones del dueño, 2026-11-11)

- Solo clientes conocidos, con `allows_credit`.
- **Quién marca el flag:** solo el dueño (`owner`). El encargado no puede marcar `customers.allows_credit`. El encargado sí puede registrar abonos.
- **Sin plazo formal** y **sin** estado de cobranza «vencido» por calendario. El fiado es informal.
- **Sin tope numérico** en pesos ni en número de pedidos. Basta la bandera y ver el saldo en admin; se va viendo caso a caso.
- **Entrega y CFDI con saldo:** se puede pasar a `enviado` y timbrar CFDI con saldo pendiente **solo** si ese cliente tiene `allows_credit`. Si no tiene fiado autorizado, el saldo se cobra antes de enviar.
- Abono: `kind = credit_settlement`, con `customer_id`; preferible `order_id`.
- El saldo se calcula; no se guarda como stock.
- La web (Stripe) no usa fiado: el guest paga el total.

### 2.2 Operativa

**Qué es fiado y qué es solo saldo.**

- **Saldo de pedido** = `total −` ingresos vigentes ligados a ese pedido. Existe en cualquier canal (anticipo aún en `cotizado`, saldo de entrega en `pendiente` o `hecho`).
- **Fiado** = saldo de pedidos en **`enviado`** (ya entregados o enviados) de un cliente con `allows_credit`. `cotizado` y `cancelado` no entran al saldo de fiado. No hay `draft` ni `closed`.

El crédito **no** es un ingreso. No se inventa un `income_entry` al fiar: el dinero se registra solo cuando entra (`credit_settlement` u otro `kind` de cobro).

**CFDI.** El timbrado en Kubox es independiente del cobro: se puede facturar un fiado. El vínculo (`cfdi_links`) no implica que esté pagado. Estados del vínculo: `pending` | `stamped` | `cancelled` (no confundir con estados de pedido).

**Abonos.** Parciales permitidos. Un abono va a un pedido (`order_id`) cuando se sepa cuál. Si pagan un monto a cuenta del cliente, `customer_id` obligatorio, `order_id` nulo y nota; en reportes se aplica a los fiados más antiguos primero (FIFO). Siempre `customer_id` en `credit_settlement`.

**Automotriz.** Mismas reglas si el cliente tiene crédito. Sin política especial.

**Estados de cobranza** (derivados, no columnas):

| Estado | Significado |
|--------|-------------|
| `pendiente` | Cobrado = 0 y total > 0 |
| `parcial` | 0 < cobrado < total |
| `pagado` | Cobrado ≥ total |

El nombre `pendiente` de cobranza no es el estado de pedido `pendiente`. En UI, etiquetar “cobro pendiente” vs estado del pedido. **No hay** estado «vencido» por calendario (decisión del dueño).

---

## 3. Conciliación (Stripe vs notas)

No es conciliación bancaria multi-cuenta (fuera de Fase 1). Sí es: un peso, un registro; cruzar Stripe, efectivo y transferencias; detectar faltantes y dobles.

### 3.1 Un peso, una entrada

- Fuente de verdad de pagos web: el **webhook Stripe** firmado crea `kind = stripe`, `method = stripe`, `amount = orders.total` (incluye flete, que puede ser 0). Idempotencia por `stripe_payment_intent_id` / `checkout_session_id` / `event.id` (ya en SEGURIDAD y FLUJOS §5.3).
- Alta manual `kind = stripe` solo por excepción (pago fuera del checkout, recuperación), con el ID de Stripe y nota. No se duplica el mismo `stripe_payment_intent_id`.
- Efectivo y Stripe son canales distintos. Si el cliente pagó en web **y** deja efectivo, son dos movimientos reales: se registran ambos y el pedido queda en excepción (cobrado > total) para revisión. No se fusionan solos.

### 3.2 Cierre diario (operación)

Tres cortes, misma fecha (`occurred_at`, zona America/Mexico_City):

| Corte | Cómo se arma | Se cruza con |
|-------|----------------|--------------|
| Efectivo / “notas” | Ingresos vigentes con `method = cash` (cualquier `kind`) | Dinero en caja del día |
| Transferencias | `method = transfer` | Comprobante; referencia en `notes` |
| Stripe | `kind = stripe` (y `deposit_50`/`payment` con `method = stripe`) | Pagos *succeeded* del Dashboard Stripe |

Datos mínimos de cada movimiento: fecha, monto, moneda, referencia (ID Stripe, folio de transferencia o “nota”), cliente, pedido, `kind`, `method`, quién registró (en altas de webhook, sin perfil de staff; ver propuesta de schema en la validación).

### 3.3 Correcciones y cancelación

No se borran ingresos ni egresos. Si se cancela con dinero ya cobrado, **se retiene** (§1.3): no hay devolución automática y **no** se agrega `kind = refund` al schema.

### 3.4 CFDI no es cobro

`cfdi_links` no se concilia contra montos: el importe vive en Kubox. El control Fase 1 es: pedido con/sin vínculo, y estado `pending` | `stamped` | `cancelled`.

---

## 4. Reportes MVP (admin)

1. Ingresos del día o periodo, por `kind` y por `method`. El dinero retenido en una cancelación sigue contando: el ingreso original no se borra y no hay `kind = refund`.
2. Egresos del periodo, por categoría; neto del periodo = ingresos − egresos (base de caja).
3. Pedidos con saldo (total − cobros vigentes), en cualquier estado distinto de `cancelado`.
4. Clientes con fiado (saldo de pedidos en `enviado`, §2.2) y su estado de cobro `pendiente` / `parcial` / `pagado`.
5. CFDI pendientes de timbrar (`cfdi_links.status = pending`).
6. Excepciones: ingreso sin `order_id`; Stripe sin pedido; cobros vigentes > `orders.total`.

No hace falta un rol de roster extra para esto. Si más adelante se pide conciliación bancaria formal, escalar al CEO (podría exigir Analista adicional).

---

## 5. Ajustes de schema propuestos al CEO (no editados aquí)

Estos no se escribieron en `SCHEMA.md` ni en `FLUJOS.md`. Van en el veredicto de validación.

| Ajuste | Para qué |
|--------|----------|
| En SCHEMA y FLUJOS §3: fórmula explícita del gate a `pendiente` (suma de ingresos vigentes ≥ 50% de `total`, redondeo hacia arriba al centavo) | Hoy está en este doc y, sin el redondeo, en ADMIN_IA; conviene que quede en los canónicos |
| `income_entries.recorded_by` nullable | El webhook Stripe no tiene perfil de staff (`orders.created_by` ya es nulo en web) |
| Único parcial en `income_entries.stripe_payment_intent_id` (donde no sea nulo) | Formalizar la idempotencia que ya exige SEGURIDAD |
| `kind = refund` | **No se agrega.** El dueño decidió retener el dinero en cancelaciones; no hay devolución automática. |

Vistas (no columnas), cuando se implemente: saldo de pedido, saldo de fiado del cliente (solo `enviado`), estado de cobranza. RLS sigue en SEGURIDAD (fail-closed; service role solo en el webhook).

---

## 6. Fuera de Fase 1

- Conciliación bancaria multi-cuenta.
- API o scraper Kubox; monto del CFDI en nuestro schema.
- Portal de cliente. Tope numérico de crédito y plazo/«vencido» por calendario (el dueño los descartó para Fase 1).
- Inventario.
- Inventar el monto de `shipping_fee_mxn`.

---

## 7. Escalación

Al **CEO**: cambiar el 50%, las reglas de crédito ya fijadas (§1.3 y §2.1), Stripe, o proponer scrapear / cambiar de PAC; o si la conciliación bancaria exige más roster.

A **Pedidos** / **Sistema**: el gate a `enviado` con saldo (solo si `allows_credit`; si no, cobrar antes) lo formaliza Sistema en SCHEMA/ADMIN_IA. La máquina D2 ya está cerrada; no se reabre.

A **Seguridad** / **Sistema**: RLS para que solo `owner` marque `customers.allows_credit` (el encargado no).
