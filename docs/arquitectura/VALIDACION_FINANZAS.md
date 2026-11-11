# Validación Finanzas — arquitectura Fase 1

**Veredicto: APROBADO CON CAMBIOS**  
Gerente Finanzas, 2026-11-11 (hora del centro de México). Solo documental. No se editaron `SCHEMA.md`, `FLUJOS.md` ni `WEB_IA.md`. Sí se alineó [`FINANZAS_REGLAS.md`](FINANZAS_REGLAS.md) a la máquina D2 cerrada.

Fuentes leídas, en el orden pedido: BRIEF; ORG y `depts/finanzas.md`; STACK, SCHEMA (`income_entries`, `expense_entries`, `cfdi_links`, `orders`, `app_settings`, matriz RLS), FLUJOS (finanzas y §5 Stripe), ADMIN_IA (ingresos, egresos, CFDI), WEB_IA (checkout), SEGURIDAD; FINANZAS_REGLAS (este depto); KUBOX y BACKLOG; VALIDACION_PEDIDOS y VALIDACION_PERSONALIZADOS.

---

## Veredicto por punto

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Ingresos y egresos en módulos/tablas distintos; registrar todo; «notas» = efectivo local (`note_cash`) | **Cumple.** SCHEMA, FLUJOS §4 y ADMIN_IA: `income_entries` ≠ `expense_entries`, rutas `/admin/ingresos` y `/admin/egresos` separadas. Glosario: `kind = note_cash`, `method = cash`. |
| 2 | CFDI = vínculo manual a Kubox (UUID/folio/PDF), sin API ni scrapeo | **Cumple.** `cfdi_links` (`pending` \| `stamped` \| `cancelled`); flujo de pegar referencia + adjunto opcional; prohibición explícita en KUBOX, FLUJOS §4.3, ADMIN_IA y STACK. El sistema no emite CFDI. |
| 3 | Pedido web: webhook Stripe → `income_entries.kind = stripe`; pedido ya pagado en `pendiente`; envío en el total; gratis si `subtotal >= 2999`; tarifa configurable aún sin monto (no inventarla) | **Cumple.** FLUJOS §5.3, WEB_IA §4.6 y SCHEMA: el webhook, con firma e idempotencia, inserta `orders` (`status = pendiente`, `channel = web`) + ítems + ingreso `kind = stripe`, `method = stripe`, `amount = total` (`subtotal + shipping_fee`). Umbral fijo 2999 en `app_settings`; `shipping_fee_mxn` sin valor inicial; sin monto y subtotal menor, no se crea Session. |
| 4 | Personalizados: anticipo = `deposit_50`, no un estado; no pasar a `pendiente` sin que la suma de ingresos vigentes cubra el 50% de `orders.total` (redondeo hacia arriba al centavo) | **Cumple en lo sustancial**, con un afinado documental (cambio 2). Anticipo es ingreso, no estado, en D2_ESTADOS, SCHEMA, FLUJOS §3 y ADMIN_IA. El pedido convertido nace en `cotizado`. ADMIN_IA ya bloquea el paso a `pendiente` sin cobertura del 50%. La **fórmula** (suma de vigentes, redondeo hacia arriba al centavo) estaba en FINANZAS_REGLAS y ahora sigue ahí, alineada a D2; aún no está escrita igual en SCHEMA/FLUJOS. |
| 5 | FINANZAS_REGLAS alineado a D2 | **Hecho en este turno.** Se sustituyeron `awaiting_deposit`, `confirmed`, `in_production`, `shipped_or_delivered`, `closed` y «borradores». El fiado «ya entregado» apunta a `enviado`. Se quitó «cuando cierren D2». |
| 6 | Casos borde que siguen pidiendo OK del dueño | Listados abajo. **No se inventó política.** No bloquean el modelo de arquitectura. |

No se reabre el stack ni las prioridades de negocio. S2, S3 y S4 pueden diseñarse sobre este modelo. Implementación de producto: solo con OK explícito del dueño.

---

## Cambios concretos (para el CEO)

No edité los documentos canónicos de Sistema. Pido que se despachen así:

1. **`SCHEMA.md` — `income_entries.recorded_by` nullable.** Hoy es FK a `profiles` sin `null`. El webhook de Stripe inserta el ingreso sin un usuario de staff (`orders.created_by` ya es nulo en el canal web). Sin este ajuste, el alta del webhook no encaja en el schema. Propuesta: `recorded_by` nulo en altas de webhook; obligatorio en altas de admin.

2. **`SCHEMA.md` (anticipo) y `FLUJOS.md` §3 / §2.** Escribir la fórmula del gate, hoy solo explícita en FINANZAS_REGLAS: en personalizados no se pasa a `pendiente` mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total`, redondeado hacia arriba al centavo. En `ADMIN_IA.md` el gate ya está; conviene añadir el mismo redondeo (Sistema).

3. **`SCHEMA.md` — único parcial** en `income_entries.stripe_payment_intent_id` (donde no sea nulo). Formaliza la idempotencia que ya exigen SEGURIDAD §8 y FLUJOS §5.3. No es cambio de negocio.

4. **Tras el OK del dueño a devoluciones** (no antes, no se adelanta política): entonces sí un `kind = refund` y/o anulación sin borrar. Hoy no se toca el schema por esto.

Ninguno de estos cambios reabre Stripe, Kubox, el 50% ni D2.

---

## Para que el CEO suba al dueño (sin inventar política)

Estos casos no están cerrados en discovery. Las “propuestas” son opciones para que decida, no reglas firmes.

1. **Cancelación con dinero ya cobrado** (anticipo de personalizado, o pago Stripe completo de un pedido web) desde `cotizado`, `pendiente` o `hecho` (no se cancela un `enviado`): ¿se devuelve, se retiene o se decide caso a caso? El ingreso original no debe borrarse; la forma de registrar una devolución espera esta decisión.
2. **¿Quién marca `allows_credit`?** ¿Solo el dueño (`owner`) o también el encargado?
3. **¿Hay plazo de fiado** (15/30 días, con “vencido”) o se deja informal?
4. **¿Hay tope numérico de crédito** o basta la bandera y ver el saldo en admin?
5. **¿Se puede pasar a `enviado`** (y timbrar CFDI) **con saldo pendiente** solo si el cliente tiene `allows_credit`? Si no tiene crédito, ¿el saldo se cobra antes de enviar?

El monto de `shipping_fee_mxn` sigue siendo un input del dueño ya señalado por Pedidos y Web; Finanzas no lo inventa y no es un caso de política de cobranza nuevo.

---

## Huecos que no son cambio de arquitectura

- Política SQL RLS y tests con clave `anon`: gate de Seguridad, ya previsto.
- El OK del dueño a los cinco puntos de arriba: no impide aprobar el modelo; sí condiciona reglas finas de fiado y reembolsos, y el eventual ajuste de schema del cambio 4.
- Conciliación bancaria multi-cuenta: fuera de Fase 1.

S2 (ingresos), S3 (egresos) y S4 (vínculo Kubox) pueden diseñarse sobre este modelo.
