# Validación Pedidos — arquitectura Fase 1

**Veredicto: APROBADO CON CAMBIOS**  
Gerente Pedidos, 2026-11-11 (hora del centro de México). Solo documental. No se editaron `SCHEMA.md`, `FLUJOS.md` ni `WEB_IA.md`.

Fuentes leídas: BRIEF, ORG, `depts/pedidos.md`, STACK, SCHEMA (orders, order_items, customers, D2, envío, RLS), FLUJOS §2 y §5, WEB_IA (checkout y confirmación), ADMIN_IA (pedidos), SEGURIDAD, BACKLOG (C3, S1), FINANZAS_REGLAS, D2_ESTADOS.

---

## Veredicto por punto

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Un solo `orders` para web, WhatsApp, teléfono y mostrador | **Cumple.** SCHEMA y FLUJOS §2: un modelo, `channel` discrimina; el web entra ya pagado en `pendiente`. |
| 2 | Estados D2 (dueño 2026-11-11) | **Cumple** en SCHEMA, FLUJOS y WEB_IA: `cotizado` (opcional, no web) → `pendiente` → `hecho` → `enviado`, más `cancelado` (no desde `enviado`). Pedido web nace en `pendiente` tras el webhook. Anticipo = `income_entries.kind = deposit_50`, antes de `pendiente`. Sin `closed`. |
| 3 | Envío | **Cumple**, con un input abierto del dueño. Flete en el mismo total Stripe; gratis si `subtotal >= 2999`; debajo, `shipping_fee_mxn` (sin valor, **no inventado**); si falta el monto y el subtotal es menor, no se crea Session. Snapshot en `orders.shipping_fee`. `shipping_to` es texto. Lo calcula el servidor. |
| 4 | Altas web y anti-tampering | **Cumple.** Anónimo sin SELECT/INSERT/UPDATE/DELETE en `orders` / `order_items`. Alta solo service role en el webhook, después de verificar la firma. Session: el servidor ignora precios, flete e `is_automotive` del cliente; carga de DB solo productos públicos y activos. |
| 5 | Sin stock; automotriz solo interno | **Cumple.** Sin campos ni descuento de stock. Automotriz modelable en admin (`line_focus`, `is_automotive`, cliente existente); la web rechaza esa línea y fuerza `is_automotive = false` en el alta del webhook. |
| 6 | Huecos de cumplimiento | Ver abajo. Ninguno bloquea el modelo. |

---

## Cambios concretos (para el CEO)

No son cambios de stack ni de la decisión D2. Son alineaciones documentales y un par de reglas de operación que hoy no están escritas en el admin.

1. **`ADMIN_IA.md` (Sistema).** Explicitar la máquina D2 en alta y detalle: estados y transiciones; no cancelar desde `enviado`; el canal `web` no se da de alta a mano (solo webhook); en personalizados, no pasar a `pendiente` sin un `deposit_50` que cubra el 50% del total; mostrar `shipping_fee` y `shipping_to` (snapshot, no editable en pedidos web).

2. **`FINANZAS_REGLAS.md` (Finanzas).** Sustituir estados viejos (`awaiting_deposit`, `confirmed`, `in_production`, `shipped_or_delivered`, `closed`, «borradores») por la máquina cerrada. El anticipo es un ingreso **antes** de `pendiente`, no un estado. El fiado de «ya entregado» apunta a `enviado`. Quitar «cuando cierren D2».

3. **Docs desfasados.** Todavía describen `draft` → `confirmed` o D2 «pendiente fino»:
   - `docs/discovery/BACKLOG.md` (D2).
   - Pruebas web (`docs/web/pruebas/`, p. ej. matriz de checkout y `TRAZABILIDAD.md`) y `docs/qa/MATRIZ_FLUJOS_ADMIN.md`.
   - `FLUJOS.md` § huecos aún dice que WEB_IA habla de `draft`/`confirmed` y no tiene la regla 2999: **ya no es cierto**; WEB_IA está alineado. Conviene borrar ese hueco.
   - `docs/discovery/D2_ESTADOS.md` era una propuesta anterior de Pedidos; **ya se actualizó** a la decisión del dueño.

4. **`SEGURIDAD.md` §7.** La frase «snapshot en `order_items`» en el paso de checkout puede leerse como alta al crear la Session. Aclarar: no hay INSERT de pedido hasta el webhook; ignorar también `shipping_fee` (y flags de línea) que mande el cliente.

5. **`promised_by` / Fabricado express** (no es la máquina de estados; no hay que reabrir D2). Los campos existen y la web no inventa una fecha. Falta la regla operativa en admin. Propuesta de Pedidos, sin SLA numérico: si `is_express`, el encargado fija `promised_by` a más tardar al entrar a `pendiente`; significa **listo en taller** (recolección o entrega a paquetería); el tránsito nacional se comunica aparte; el mensaje público sigue siendo el del brief (días, a veces horas en local, no semanas). `is_express` no se enciende solo por ser canal web. Si el CEO formaliza esto, basta dejarlo en D2_ESTADOS y en ADMIN_IA.

---

## Huecos que no son cambio de arquitectura

- **Monto de `shipping_fee_mxn`:** lo debe dar el dueño. Hasta entonces, el checkout con subtotal menor a 2999 no puede cobrar: está bien, no se inventa la tarifa.
- Políticas SQL RLS y tests con clave `anon`: gate de Seguridad, ya previsto.
- `FINANZAS_REGLAS.md` sigue pendiente de OK del dueño (fiado, reembolsos al cancelar con anticipo). Eso no impide aprobar el modelo de pedidos; sí hay que alinear los nombres de estado (cambio 2).

C3 y S1 pueden diseñarse sobre este modelo. Implementación de producto: solo con OK explícito del dueño.
