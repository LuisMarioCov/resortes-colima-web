# Departamento: Finanzas

## Misión

Registrar **todo** el dinero: módulo de **ingresos** y módulo de **egresos** (separados). CFDI en Kubox; pagos web con Stripe.

## Gerente

**Gerente Finanzas** — skill `gerente-finanzas`

## Roster

| Rol | Skill | Responsabilidad |
|-----|-------|-----------------|
| Analista Cobranza | `analista-cobranza` | Ingresos: anticipos, fiados, efectivo, Stripe, vínculo pedido |

## Módulos

| Módulo | Incluye |
|--------|---------|
| Ingresos | Cobros, anticipos 50%, notas (efectivo local), Stripe, crédito/fiados |
| Egresos | Pagos a proveedores (alambre, piedras) y demás salidas; registrar todo |
| Fiscal | Timbrar en Kubox; guardar referencia UUID/folio/PDF en el pedido ([`docs/discovery/KUBOX.md`](../../discovery/KUBOX.md)) |

## Glosario local

| Término | Significado |
|---------|-------------|
| Notas | Efectivo en el local |
| Facturas fiadas | Crédito a clientes conocidos |
| CFDI | Timbrado en Kubox (sin API; vínculo manual) |

Reglas finas (fiado, anticipos, conciliación): [`docs/arquitectura/FINANZAS_REGLAS.md`](../../arquitectura/FINANZAS_REGLAS.md) — propuesta, pendiente OK del dueño.

## Escala al CEO cuando

- Se proponga scrapear Kubox o cambiar de PAC
- Cambien reglas de anticipo, crédito o Stripe
- Conciliación bancaria exija más roster
