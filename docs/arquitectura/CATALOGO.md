# Catálogo — reglas de publicación y validación Fase 1

Departamento: **Catálogo**.  
Pedido del CEO: validación documental de arquitectura (2026-11-11, America/Mexico_City).  
Fuentes releídas: [BRIEF](../negocio/BRIEF.md), [ORG](../agentes/ORG.md), [catalogo.md](../agentes/depts/catalogo.md), [`STACK.md`](STACK.md), [`SCHEMA.md`](SCHEMA.md) (catálogos, products, product_images, promos, matriz RLS — versión actualizada 16:57), [`FLUJOS.md`](FLUJOS.md), [`WEB_IA.md`](WEB_IA.md) §4, [`SEGURIDAD.md`](SEGURIDAD.md) §4, [BACKLOG](../discovery/BACKLOG.md) C1 / C1b.

**Veredicto: APROBADO CON CAMBIOS.** Ninguno bloquea la arquitectura, no reabre el stack ni prioridades de negocio, y no exige código de producto. Los cambios se proponen al CEO para que Sistema los aplique en `SCHEMA.md`; Catálogo no edita SCHEMA, FLUJOS ni WEB_IA.

---

## 1. Regla canónica de publicación web

Un producto **sale a la web** solo si se cumplen **todas** estas condiciones:

1. Catálogo **multiusos** (`multiusos_105` o `multiusos_56`): `catalogs.line = multiusos` y `catalogs.is_public = true`.
2. `products.line = multiusos`.
3. `products.is_active = true`.
4. `products.visible_web = true` (**default `false`**; se enciende a mano cuando el ítem está listo).
5. `products.unit_price` no nulo, en MXN, tomado del Excel o de captura del dueño. **Prohibido inventar precios o specs.**
6. Al menos una foto en `product_images` con fondo/colores ya editados.

**Nunca** en canales digitales (API pública, UI, Storage público, SEO, sitemap, JSON-LD, checkout):

- Línea automotriz (aunque esté activa en el sistema).
- Promos: `promos.visible_web` default `false`; en Fase 1 RLS **deny SELECT** anónimo y la app pública **no consulta** esa tabla.
- Stock / inventario (no existe en schema ni en UI).
- Productos inactivos, incompletos o con `visible_web = false`.

La lectura anónima es un **AND** de esas condiciones (alineado con `SEGURIDAD.md` §4 y con la matriz RLS actual de `SCHEMA.md`), no un OR de flags sueltos. La query pública replica el AND; RLS es la red de seguridad, no el único filtro.

### Qué sí vive en el sistema (admin)

- Los dos catálogos multiusos **y** la línea automotriz (visible, secundaria, nunca default de marketing).
- Promos, fichas incompletas, fotos en proceso, productos aún no listos para web.
- Identificador actual: `external_id` = ID / nombre (número) del Excel; `sku` reservado, nullable.

Los dos listados (~105 y ~56) se mantienen **separados**. No se fusionan sin OK del dueño.

---

## 2. Semántica de flags

| Flag | Significado | Web |
|------|-------------|-----|
| `catalogs.is_public` | El listado es vendible en digital | Solo `true` en multiusos |
| `products.is_active` | Vive en el maestro; usable en pedidos internos | No basta para publicar |
| `products.visible_web` | Listo y autorizado para el sitio | Default `false` |
| `products.line` / `catalogs.line` | `multiusos` \| `automotriz` | Automotriz jamás público |
| `promos.visible_web` | Promo visible en sitio | Default `false`; Fase 1 = ninguna en público (deny SELECT) |
| `promos.is_active` | Promo vigente en datos internos | No implica UI pública |

Encender `visible_web` en un producto automotriz debe ser **imposible** (constraint + RLS + UI). No confiar solo en un checkbox.

Fichas técnicas (`tech_sheet`, C1c) **no bloquean** la publicación: W2 depende de C1 + C1b (fotos), no de C1c. Pueden completarse después, sin inventar atributos.

Nombre canónico del flag: **`visible_web`** (no `publica` del backlog C1a).

---

## 3. Respuesta a los cinco puntos del CEO

| # | Qué se pidió validar | Resultado |
|---|----------------------|-----------|
| 1 | Schema cubre dos catálogos Multiusos (~105 y ~56), fotos, precios públicos y promos existentes pero ocultas (`visible_web = false`; anon deny SELECT en Fase 1) | **Sí.** `catalogs` con `multiusos_105` / `multiusos_56`; `product_images` + bucket `product-images`; `unit_price` MXN de lista; `promos` en datos con default `false` y deny SELECT anónimo (SCHEMA + SEGURIDAD §4 + WEB_IA: la app pública no consulta la tabla). |
| 2 | Automotriz en datos/admin y nunca en la web (doble filtro público + no automotriz, alineado a WEB_IA y RLS) | **Sí en diseño.** Catálogo `automotriz` con `is_public = false`; productos con `line`; admin visible y secundario. Lectura anónima: `visible_web` AND `is_active` AND `line = multiusos` AND catálogo `is_public`. WEB_IA §4: 404, sin automotriz en UI/SEO. Falta el CHECK de integridad (cambio 2). |
| 3 | Sin tablas de inventario ni stock al público | **Sí.** SCHEMA declara sin `stock` / `qty_on_hand`; fuera de Fase 1; WEB_IA sin «agotado» ni `availability` InStock/OutOfStock; FLUJOS sin descuento de stock. |
| 4 | El import del Excel (lo entrega el dueño después) cabe en el modelo, sin bloquear este diseño | **Sí.** `external_id` + `catalog_id`, `tech_sheet` flexible, `sku` nullable, import admin sin columnas de stock. Las columnas exactas se definen cuando lleguen los dos archivos (D1 / C1). No bloquea arquitectura. El cambio 4 (`unit_price` nullable) es para poder importar filas sin precio **sin inventar un monto**. |
| 5 | Huecos o contradicciones BRIEF / SCHEMA / FLUJOS / WEB_IA que afecten Catálogo | **Sin contradicción de negocio.** WEB_IA §1.5 y §4 adoptan esta regla AND; FLUJOS §5.1 y §6 también. Lo que queda son los ajustes de integridad de la §4 (aún no escritos en la tabla `products` de SCHEMA). El Excel, las fotos (C1b) y las fichas son gaps de **datos**, no de diseño. |

---

## 4. Cambios que se proponen al CEO (para Sistema)

Ya aplicado desde la revisión anterior (no se vuelve a pedir): la matriz RLS de `SCHEMA.md` documenta el AND público, incluye `product_images`, y deniega todo SELECT anónimo sobre `promos`.

Pendientes — ninguno bloquea el diseño:

1. **`products.visible_web DEFAULT false`** explícito en la columna (hoy está solo en prosa; en `promos` ya está dicho). Defensa igual a R5 de Seguridad.
2. **CHECK (o equivalente):** si `line = automotriz` o el catálogo no es público, `visible_web` no puede ser `true`. El doble filtro RLS/app no basta si un flag se prende por error.
3. **Unique formal:** `UNIQUE (catalog_id, external_id)` (hoy dice «único por catálogo» en notas).
4. **`unit_price` nullable** en el maestro. Filas sin precio se importan al sistema, no a la web. Publicar (regla §1.5) exige precio no nulo. Si queda `NOT NULL`, no se pueden importar incompletos sin inventar un monto — prohibido por el BRIEF.
5. **Promos:** constraint de que hay exactamente un padre (`product_id` **o** `catalog_id`).
6. **Fotos listas (opcional, no bloqueante):** un flag tipo `is_web_ready` en `product_images` ayuda a no publicar fotos crudas. Si no se agrega, la regla §1.6 sigue siendo obligatoria en admin (no encender `visible_web` sin foto editada).

---

## 5. Alineación FLUJOS, WEB_IA y admin

- `WEB_IA.md` §4 (índice, listado, ficha, carrito): dos listados **separados**; solo productos que cumplen el AND; 404 si no es publicable; precio de lista `unit_price`; sin promos, sin stock, sin automotriz; fichas técnicas opcionales; no se rellenan ítems de ejemplo si el Excel o las fotos aún no están. **Aprobado** para Catálogo.
- `FLUJOS.md` §5 y §6: carrito con relectura de precios en servidor; Excel → maestro → admin completo / web filtrada; automotriz nunca a la web. **Aprobado.**
- `/admin/catalogo` (lista, ficha, promos, importar): agrupación correcta. Import **sin** columnas de stock. Automotriz como filtro/chip, no como ítem de menú de marketing.

---

## 6. Gaps de datos (no de diseño)

| Gap | Estado | Bloquea |
|-----|--------|---------|
| Dos Excel (~105 y ~56) | Pendiente del dueño (D1) | Import real y diffs; **no** el schema |
| Fotos (subir + editar fondo/colores) | En proceso (C1b) | Publicación web del ítem (W2) |
| Fichas técnicas | En proceso (C1c) | No bloquea W2 |
| SKU formal | Diferido | No Fase 1 |
| Stock | Fuera de MVP | — |
| Promos en UI pública | Solo si el dueño lo activa (F2) | — |

Hasta que lleguen los Excel: no hay lista de atributos SKU ni diffs entre catálogos. Data Catálogo trabaja bajo asignación del gerente, **sin inventar** filas, precios ni medidas.

---

## 7. Escala al CEO

- Reactivar inventario/stock en producto.
- Pedir publicar automotriz o promos en web.
- Cambiar la fuente Excel o el modelo de precios/promos.
- Fusionar los dos catálogos multiusos.

Catálogo no implementa código de producto sin OK explícito del dueño.
