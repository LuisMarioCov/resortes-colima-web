# D2 — Estados de pedido y promesa Fabricado express

Estado: **cerrado** — decisión del dueño, 2026-11-11.  
Una propuesta anterior de Pedidos (borrador / cotizado / anticipo-como-estado / confirmado / producción / listo / fulfilled / closed) **queda retirada**. Fuente canónica de la máquina: [`SCHEMA.md`](../arquitectura/SCHEMA.md) y [`FLUJOS.md`](../arquitectura/FLUJOS.md) §2.

Cualquier cambio posterior de estos estados, o de la promesa al cliente, se escala al CEO.

---

## Máquina (decidida)

Un solo `orders` para **web, WhatsApp, teléfono y mostrador**.

`cotizado` → `pendiente` → `hecho` → `enviado`, más `cancelado`.

| Estado | Uso |
|--------|-----|
| `cotizado` | Opcional, **antes** de `pendiente`. WhatsApp, teléfono, mostrador y personalizados. El canal `web` (catálogo + Stripe) **no** pasa por aquí. |
| `pendiente` | Cola de cumplimiento. El pedido **web entra aquí ya pagado**, tras el webhook de Stripe. |
| `hecho` | Fabricación terminada, aún no enviado. |
| `enviado` | Enviado o entregado. Terminal de éxito. |
| `cancelado` | Desde `cotizado`, `pendiente` o `hecho`. **No** desde `enviado`. |

**Anticipo** no es un estado: es `income_entries.kind = deposit_50`. Se registra **antes** de pasar a `pendiente`. En personalizados, el brief exige el 50% al confirmar: no se entra a `pendiente` sin ese ingreso.

**No hay `closed`.** El control operativo termina en `enviado`. Cobros, saldo y CFDI viven en `income_entries` y `cfdi_links`.

**No hay `draft`.** El anónimo no escribe `orders`. El pedido web se inserta solo en el webhook, ya pagado.

Sin descuento de stock. Automotriz solo en pedidos internos, nunca nace de la web pública.

---

## Fabricado express (operativo, no es un estado)

El mensaje al cliente no cambia sin CEO y dueño: en **días**, no en semanas; si es local y el trabajo es acotado, a veces en **horas**. Cobertura nacional. Sin SLA numérico (no se inventa «24 h» ni «3 días»).

En el sistema, `is_express` y `promised_by` son flags de operación. **No** se encienden solos por ser canal web. La web pública no muestra una fecha automática.

**Formalizado por el CEO** (2026-11-11; no reabre la máquina de estados):

- Si `is_express`, el encargado fija `promised_by` a más tardar al entrar a `pendiente`.
- `promised_by` = momento en que el pedido está **listo en taller** (para recolección o para entrega a paquetería). El tránsito nacional se comunica aparte.
- Sin SLA numérico; la web no muestra una fecha automática; `is_express` no se enciende solo por ser canal web (ya dicho arriba).
- Incumplir la fecha no cambia el estado; es señal para la cola del admin.
