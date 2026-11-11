# Backlog priorizado — post discovery dueño

Épicas. Sin estimación de código. Ejecutar solo con OK del dueño.

## P0 — Discovery (estado)

| ID | Épica | Estado |
|----|-------|--------|
| D0 | Preguntas abiertas esenciales | **Hecho** |
| D1 | Excel catálogo (entrega dueño) + gaps fotos/fichas | Diferido a datos |
| D2 | Estados de pedido express acordados | **Cerrado** (dueño 2026-11-11): `cotizado` → `pendiente` → `hecho` → `enviado`, más `cancelado` (no desde `enviado`). Pedido web entra en `pendiente` ya pagado. Fabricado express formalizado por el CEO ([`D2_ESTADOS.md`](D2_ESTADOS.md)). |
| D3 | Intake personalizados | **Hecho** |
| D4 | Finanzas + Kubox + Stripe | **Hecho** (ver KUBOX.md; Stripe fijado) |

## P1 — Cimientos (nube)

| ID | Épica | Depto | Depende de |
|----|-------|-------|------------|
| C1 | Catálogo maestro desde Excel (ID/nombre; sin stock) | Catálogo + Sistema | D1 |
| C1a | Promos en maestro (flag `publica=false` por defecto) | Catálogo | C1 |
| C1b | Pipeline fotos (subida + edición fondo/colores) | Catálogo + Web | C1 |
| C1c | Fichas técnicas por producto | Catálogo | C1 |
| C2 | Clientes (crédito/fiados + existentes automotriz) | Sistema | D0 |
| C3 | Pedido multicanal + estados express | Pedidos + Sistema | D2, C1 |
| C4 | Personalizados (campos + anticipo 50% + handoff WA) | Personalizados | D3 |
| C5 | Auth remoto + roles (dueños, encargado) | Seguridad + Sistema | — |

## P2 — Sistema interno MVP

| ID | Épica | Depto | Depende de |
|----|-------|-------|------------|
| S1 | Pedidos operables (WA/tel/mostrador/web) | Sistema + Pedidos | C3, C5 |
| S2 | Módulo **ingresos** (cobros, anticipos 50%, efectivo/notas, Stripe) | Finanzas | S1 |
| S3 | Módulo **egresos** (proveedores y gastos; registrar todo) | Finanzas | C5 |
| S4 | Vínculo Kubox CFDI (UUID/folio/PDF; sin API) | Finanzas | S1 |
| S5 | Línea automotriz en pedidos (no web) | Sistema | C2, S1 |
| S6 | RLS / authz fail-closed | Seguridad | C5 |

## P3 — Web pública (SEO + e-commerce)

| ID | Épica | Depto | Depende de |
|----|-------|-------|------------|
| W0 | Dominio + baseling SEO técnico | Web + DevOps | — |
| W1 | Landing Fabricado express + cobertura nacional | Web | Brief |
| W2 | Catálogo público con precios/promos (sin stock, sin auto) | Web + Catálogo | C1, C1b |
| W3 | Checkout catálogo con **Stripe** | Web + Pedidos + Finanzas | W2, C3 |
| W4 | Formulario personalizados → WhatsApp | Web + Personalizados | C4 |
| W5 | HTTPS, rate limit, deploy nube | Web + Seguridad | W1 |
| W6 | SEO de producto + contenido “resortes” nacional | Web | W2 |

## P4 — Posterior

| ID | Épica | Notas |
|----|-------|-------|
| F1 | API Kubox o migración PAC con API | Solo si Kubox ofrece contrato API o volumen lo exige |
| F2 | Promos visibles en web | Cuando el dueño lo active |
| F3 | Inventario/stock | Solo si el dueño lo reactiva |
| X1 | WhatsApp Business API formal | Hoy handoff manual/deep link basta para MVP |
| X2 | Redes sociales | Tras dominio/marca web |

## Prioridad relativa (CEO)

1. **C1 + C1b + C5** — catálogo/fotos y acceso nube (desbloquean web y sistema).
2. **C3 + S1** — pedido único multicanal.
3. **W1 + W2 + W6** en paralelo temprano para SEO (contenido puede arrancar con catálogo parcial).
4. **W3** (venta online) tan pronto haya precios, fotos mínimas y decisión de pago.
5. **W4** personalizados (form → WA) en cuanto C4 esté cerrado.
6. Automotriz solo en interno (S6); nunca en W*.

Recomendación: **nube desde el día 1** de arquitectura; no diseñar local-only.
