# IA admin — mapa de pantallas `/admin`

Sistema interno (nube, remoto). Usuarios: **dueños** (`owner`) y **encargado** (`manager`). Español MX.

Complementa (no sustituye) la IA pública de Web ([`WEB_IA.md`](WEB_IA.md)). Estados y envío alineados a D2 cerrado y a la formalización de Fabricado express del CEO (2026-11-11).

## Principios de UI

- Una sola app; todo el sistema vive bajo `/admin`.
- Sin stock/inventario en ninguna pantalla.
- Automotriz **visible y secundaria** (filtro/etiqueta; nunca default de marketing).
- Promos editables aquí; no implica visibilidad web (`visible_web` default false).
- Ingresos y egresos = **módulos separados** (navegación distinta).
- Fail-closed: sin sesión o sin rol → login / 403.

## Estados de pedido (D2 cerrado)

Máquina canónica ([`SCHEMA.md`](SCHEMA.md), [`FLUJOS.md`](FLUJOS.md) §2, [`D2_ESTADOS.md`](../discovery/D2_ESTADOS.md)):

`cotizado` → `pendiente` → `hecho` → `enviado`, más `cancelado`.

- **`cotizado`:** opcional, **antes** de `pendiente`. WhatsApp, teléfono, mostrador y personalizados. El canal `web` **no** pasa por aquí.
- **`pendiente`:** cola de cumplimiento. El pedido web **entra aquí ya pagado**, solo por webhook de Stripe (no hay alta manual de canal `web` en `/admin/pedidos/nuevo`).
- **`hecho`:** fabricación terminada, aún no enviado.
- **`enviado`:** enviado o entregado. Terminal de éxito. No hay `closed`. **No pasar a `enviado`** si hay saldo pendiente, **salvo** que el cliente tenga `allows_credit = true`. Si no hay fiado, hay que cobrar el saldo antes de enviar. Timbrar o vincular CFDI con saldo sigue la misma regla.
- **`cancelado`:** desde `cotizado`, `pendiente` o `hecho`. **No** desde `enviado`. Si ya hay dinero cobrado (`deposit_50` o Stripe completo), **se retiene**: el `income_entries` original no se borra; no hay devolución automática ni `kind = refund`.
- **Anticipo** no es un estado: es `income_entries.kind = deposit_50`. En **personalizados** no se pasa a `pendiente` mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total` (redondeo hacia arriba al centavo; [`FINANZAS_REGLAS.md`](FINANZAS_REGLAS.md)).

### Fabricado express (formalizado por el CEO; no es un estado)

- Si `is_express`, el encargado fija `promised_by` **a más tardar** al entrar a `pendiente`.
- `promised_by` = momento en que el pedido está **listo en taller** (para recolección o para entrega a paquetería). El tránsito nacional se comunica aparte.
- Sin SLA numérico (no se inventa «24 h» ni «3 días»). La web **no** muestra una fecha automática.
- `is_express` **no** se enciende solo por ser canal web.

## Mapa de rutas

```text
/admin
├── /login                          # fuera del shell autenticado (o /login global)
├── /                               # Dashboard
├── /pedidos
│   ├── /                           # Lista
│   ├── /nuevo                      # Alta multicanal
│   └── /[orderId]                  # Detalle + estados + cobros/CFDI linked
├── /clientes
│   ├── /                           # Lista
│   └── /[customerId]               # Ficha + crédito/fiados
├── /catalogo
│   ├── /                           # Productos (filtros por catálogo/línea)
│   ├── /productos/[productId]      # Ficha + fotos + promo
│   ├── /promos                     # Lista promos (visible_web)
│   └── /importar                   # Import Excel (cuando dueño entregue)
├── /personalizados
│   ├── /                           # Inbox custom_requests
│   └── /[requestId]                # Detalle + handoff WA + convertir a pedido
├── /ingresos
│   ├── /                           # Lista / filtros
│   └── /nuevo                      # Alta cobro/anticipo/nota/Stripe manual
├── /egresos
│   ├── /                           # Lista
│   └── /nuevo                      # Alta gasto proveedor
├── /cfdi
│   └── /                           # Cola pendientes + vínculo Kubox (o embebido en pedido)
└── /equipo                         # Profiles (solo owner: alta/desactivar)
```

Rutas exactas pueden ajustarse en implementación; **agrupación funcional** es canónica.

---

## Pantallas

### 0. Login

| | |
|--|--|
| **Ruta** | `/admin/login` (o `/login` → redirect) |
| **Quién** | owner, manager |
| **Datos** | Supabase Auth |
| **Notas** | Rate limit; cookies protegidas; sin “recordar” inseguro |

### 1. Dashboard

| | |
|--|--|
| **Ruta** | `/admin` |
| **Propósito** | Cola operativa express: pedidos abiertos, personalizados nuevos, CFDI pendientes, cobros del día |
| **No incluye** | KPIs de marketing web, stock |

### 2. Pedidos — lista

| | |
|--|--|
| **Ruta** | `/admin/pedidos` |
| **Filtros** | estado (`cotizado` / `pendiente` / `hecho` / `enviado` / `cancelado`), canal (`web`/`whatsapp`/`phone`/`counter`), línea (multiusos/custom/automotriz), express |
| **Columnas** | nº, cliente, canal, estado, total, `promised_by`, creado |
| **Acciones** | Nuevo (canales no web); abrir detalle. Los de canal `web` aparecen tras el webhook, ya en `pendiente`. |

### 3. Pedido — alta

| | |
|--|--|
| **Ruta** | `/admin/pedidos/nuevo` |
| **Campos** | canal (`whatsapp` / `phone` / `counter`), cliente (buscar/crear), líneas (producto o libre), automotriz flag en línea, express + `promised_by`, totales, `shipping_to` / `shipping_fee` si aplica |
| **Reglas** | El canal **`web` no se da de alta aquí**: solo entra por webhook Stripe, en `pendiente`, ya pagado. Validar inputs; no inventar precios. Automotriz solo si cliente existente o confirmación interna. Si se marca `is_express`, `promised_by` queda fijado a más tardar al entrar a `pendiente` (listo en taller). Estado inicial: `cotizado` o `pendiente` según el caso (nunca un pedido web). |

### 4. Pedido — detalle

| | |
|--|--|
| **Ruta** | `/admin/pedidos/[orderId]` |
| **Bloques** | Cabecera/estado (máquina D2); líneas; `shipping_fee` y `shipping_to` (snapshot; **no editables** en pedidos `channel = web`); ingresos ligados; CFDI (vínculo Kubox); notas internas; `is_express` / `promised_by`; Stripe IDs si web |
| **Acciones** | Cambiar estado según D2 (`cotizado` → `pendiente` → `hecho` → `enviado`; `cancelado` no desde `enviado`); registrar cobro; pegar CFDI. En personalizados: **bloquear** el paso a `pendiente` mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total` (redondeo hacia arriba al centavo). **Bloquear** el paso a `enviado` (y el vínculo CFDI con saldo) si hay saldo pendiente, salvo que el cliente tenga `allows_credit = true`; si no hay fiado, cobrar el saldo antes de enviar. Cancelar (no desde `enviado`): si ya hay cobro, se retiene (no se borra el ingreso; no hay `kind = refund`). Si `is_express`, no entrar a `pendiente` sin `promised_by`. Pedido web: no reabrir alta ni mutar flete/destino de snapshot. |

### 5. Clientes

| | |
|--|--|
| **Rutas** | `/admin/clientes`, `/admin/clientes/[id]` |
| **Lista** | nombre, teléfono, crédito sí/no, flag automotriz existente |
| **Ficha** | datos; historial pedidos; **saldo derivado** (se muestra); notas; `allows_credit`. Fiado informal: sin plazo fijo, sin vencimiento, sin tope en pesos ni en número de pedidos. **Solo el owner** muta `allows_credit` (el manager no lo prende ni lo apaga); enforcing en RLS, no solo en la UI. |

### 6. Catálogo

| | |
|--|--|
| **Rutas** | `/admin/catalogo`, `/productos/[id]`, `/promos`, `/importar` |
| **Lista** | por catálogo (105 / 56 / automotriz); precio; `visible_web`; activo |
| **Ficha** | precios, ficha técnica, fotos (Storage), promo asociada |
| **Promos** | CRUD; checkbox `visible_web` (default off); sin UI pública aún |
| **Importar** | Excel → maestro (C1); sin columnas de stock |

### 7. Personalizados

| | |
|--|--|
| **Rutas** | `/admin/personalizados`, `/[requestId]` |
| **Inbox** | **mismo folio** del handoff WhatsApp, status, contacto, fecha |
| **Detalle** | el **mismo folio**; campos intake canónicos; imágenes; CTA «abrir WhatsApp» al `contact_phone` (folio a la vista). Al convertir: el pedido nace en `cotizado`, con `line_focus = custom` y `channel = whatsapp` (**nunca** `web`: ese canal está reservado al catálogo Stripe). Registrar anticipo (`income_entries.kind = deposit_50`). **No pasar a `pendiente`** mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total` (redondeo hacia arriba al centavo). |

**Estados de `custom_requests`** (sin estados nuevos; ver [`SCHEMA.md`](SCHEMA.md)):

- `received`: alta pública.
- `quoted`: el staff registró la cotización.
- `converted`: nació el pedido.
- `abandoned`: el staff cierra sin convertir.
- `sent_to_whatsapp`: solo si el staff lo marca; el clic del cliente a WhatsApp **no** muta el `status`.


### 8. Ingresos

| | |
|--|--|
| **Rutas** | `/admin/ingresos`, `/nuevo` |
| **Tipos** | payment, deposit_50, note_cash, stripe, credit_settlement, other |
| **UX** | Siempre preferir ligar a `order_id`; notas = efectivo local explícito |

### 9. Egresos

| | |
|--|--|
| **Rutas** | `/admin/egresos`, `/nuevo` |
| **UX** | Separado de ingresos; categoría + proveedor + monto; registrar todo |

### 10. CFDI (Kubox)

| | |
|--|--|
| **Ruta** | `/admin/cfdi` y/o sección en detalle de pedido |
| **Flujo** | Usuario timbra en Kubox → pega UUID / serie-folio / estado → adjunto PDF/XML opcional |
| **Reglas** | Timbrar o vincular CFDI con saldo pendiente **solo** si el cliente tiene `allows_credit = true`. Si no hay fiado, hay que cobrar el saldo antes. |
| **Prohibido** | Scraper o automatización no oficial |

### 11. Equipo

| | |
|--|--|
| **Ruta** | `/admin/equipo` |
| **Quién** | solo `owner` |
| **Acciones** | invitar/activar/desactivar `manager`; no exponer service keys |

---

## Navegación (shell)

Prioridad visual sugerida:

1. Pedidos  
2. Personalizados  
3. Ingresos  
4. Egresos  
5. Clientes  
6. Catálogo  
7. CFDI  
8. Equipo (owner)

Automotriz: chip/filtro en Pedidos y Catálogo, no ítem de menú principal de marketing.

---

## Permisos UI (borrador; Seguridad confirma)

| Área | owner | manager |
|------|-------|---------|
| Pedidos / clientes / personalizados | R/W | R/W |
| `customers.allows_credit` | sí | no (ni prenderlo ni apagarlo; RLS, no solo UI) |
| Ingresos / egresos / CFDI | R/W | R/W |
| Catálogo / promos / import | R/W | R/W |
| Equipo | R/W | — |
| Desactivar usuario | sí | no |

---

## Fuera de `/admin` Fase 1

- Gestión de stock.
- Editor SEO / blog (Web).
- Configuración Stripe avanzada (solo lectura de pagos ligados).
- Sustituto de Kubox.

## Dependencias

| Pantalla | Épica backlog |
|----------|---------------|
| Login + shell | C5, S6 |
| Catálogo / import / promos | C1, C1a, C1b, C1c |
| Pedidos | C3, S1, S5 |
| Personalizados | C4 |
| Ingresos / egresos / CFDI | S2, S3, S4 |
| Clientes | C2 |
