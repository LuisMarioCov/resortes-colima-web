# Matriz CAT — Catálogo público multiusos

Flujo público: catálogo vendible de resortes **multiusos**. Sin automotriz, sin promos en UI, sin stock en UI.

**Estado de todos los casos:** Pendiente — sin app.  
**Rutas (WEB_IA §2 y §4):** `/catalogo` (índice de los dos listados); `/catalogo/multiusos-105` y `/catalogo/multiusos-56` (slugs derivados de `catalogs.code`); `/catalogo/[catalogSlug]/[productSlug]` (ficha).  
Cruce con el plan QA: WEB_IA §11.1 (CAT-01 a CAT-12).  
**Datos:** los Excel (~105 y ~56) aún no los entrega el dueño; **no inventar** precios, nombres ni medidas. Usar fixtures de flags cuando existan datos de prueba controlados.

Fuentes: [`WEB_IA.md`](../../arquitectura/WEB_IA.md) §§2, 4.2–4.4, 5, 9 y 11.1; [`BRIEF.md`](../../negocio/BRIEF.md), [`FLUJOS.md`](../../arquitectura/FLUJOS.md) §5–§6, [`CATALOGO.md`](../../arquitectura/CATALOGO.md) §1, [`SCHEMA.md`](../../arquitectura/SCHEMA.md), [`NECESIDADES.md`](../../discovery/NECESIDADES.md) §A, [`SEGURIDAD.md`](../../arquitectura/SEGURIDAD.md) §4.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| CAT-001 | Navegar los dos catálogos multiusos públicos | P0 | feliz | Pendiente — sin app |
| CAT-002 | Solo salen productos que cumplen la regla AND de publicación | P0 | feliz | Pendiente — sin app |
| CAT-003 | Se muestran precios de lista públicos en MXN | P0 | feliz | Pendiente — sin app |
| CAT-004 | Fotos públicas solo de productos publicados | P1 | feliz | Pendiente — sin app |
| CAT-005 | Los dos listados se mantienen separados (no fusionados) | P0 | feliz | Pendiente — sin app |
| CAT-006 | `visible_web = false` no aparece en UI ni API pública | P0 | negativo | Pendiente — sin app |
| CAT-007 | `is_active = false` no aparece en la web | P0 | negativo | Pendiente — sin app |
| CAT-008 | Línea o catálogo automotriz nunca aparece en la web | P0 | marca | Pendiente — sin app |
| CAT-009 | Catálogo con `is_public = false` no es listable en público | P0 | negativo | Pendiente — sin app |
| CAT-010 | Producto sin `unit_price` no se publica | P1 | negativo | Pendiente — sin app |
| CAT-011 | La UI pública no muestra stock ni inventario | P0 | marca | Pendiente — sin app |
| CAT-012 | La UI pública no muestra promos ni precio promocional | P0 | marca | Pendiente — sin app |
| CAT-013 | La API/app pública no consulta la tabla `promos` | P0 | seguridad | Pendiente — sin app |
| CAT-014 | Identificación por ID/nombre; no exigir SKU formal | P2 | feliz | Pendiente — sin app |
| CAT-015 | Ficha técnica ausente no bloquea un ítem ya publicable | P2 | límite | Pendiente — sin app |
| CAT-016 | Producto incompleto o no listo no aparece | P2 | negativo | Pendiente — sin app |
| CAT-017 | `product_images` de un producto no público no es legible en anónimo | P0 | seguridad | Pendiente — sin app |
| CAT-018 | Moneda de precios públicos es MXN | P1 | feliz | Pendiente — sin app |
| CAT-019 | Textos del catálogo en español (MX) | P1 | marca | Pendiente — sin app |
| CAT-020 | El catálogo es vendible: hay camino a carrito/checkout | P1 | feliz | Pendiente — sin app |
| CAT-021 | URL de no publicable o automotriz responde 404 + noindex | P0 | negativo | Pendiente — sin app |
| CAT-022 | Búsqueda/filtro solo sobre el listado actual, sin facetas automotriz | P1 | marca | Pendiente — sin app |
| CAT-023 | Estado vacío honesto si no hay ítems publicables; sin ejemplos inventados | P1 | límite | Pendiente — sin app |

---

## Datos de prueba reutilizables (fixtures de flags)

No usar montos ni nombres de producto inventados como si fueran del Excel del dueño. Cuando haya fixtures de no producción:

| Fixture | Condición |
|---------|-----------|
| M105-OK | Catálogo `multiusos_105`, `line = multiusos`, `is_public = true`; producto `line = multiusos`, `is_active = true`, `visible_web = true`, `unit_price` no nulo en MXN, ≥1 foto en `product_images` con fondo/colores editados |
| M56-OK | Igual, en catálogo `multiusos_56` |
| M-HID | Igual que M105-OK salvo `visible_web = false` |
| M-INA | Igual que M105-OK salvo `is_active = false` |
| M-NOPRICE | Multiusos activo con `unit_price` nulo (importable al maestro, no a la web) |
| M-NOPHOTO | Multiusos activo con `visible_web` que no debería encenderse: sin foto editada (`CATALOGO.md` §1.6) |
| M-PRIVCAT | Producto en un catálogo con `is_public = false` |
| AUTO-1 | Catálogo `automotriz`, `line = automotriz`, `is_public = false`; producto `line = automotriz` (esté o no activo) |

La lectura anónima es un **AND** de las condiciones de [`CATALOGO.md`](../../arquitectura/CATALOGO.md) §1, no un OR de flags sueltos.

---

### CAT-001 — Navegar los dos catálogos multiusos públicos

| Campo | Detalle |
|-------|---------|
| Caso | Un visitante anónimo puede ver y navegar los dos catálogos multiusos públicos (~105 y ~56). |
| Precondiciones | App pública desplegada. Fixtures M105-OK y M56-OK cargados en un entorno de prueba (no datos productivos si el gate de Seguridad no está firmado). |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Capturas de ambos listados; URL usada (cuando exista); recuento visible vs fixtures esperados. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Líneas de negocio» y «Productos públicos (web)»; SCHEMA `catalogs` (`multiusos_105`, `multiusos_56`); CATALOGO.md §1. WEB_IA §4.2–4.3: índice en `/catalogo`; slugs `multiusos-105` y `multiusos-56`; las grillas no se mezclan. Cruce QA CAT-09. Los tamaños ~105 y ~56 son aproximados del brief; no son criterio de pass exacto hasta que existan los Excel (D1). |

**Pasos**

1. Abrir `/catalogo` (índice de los dos listados).
2. Entrar a `/catalogo/multiusos-105` y a `/catalogo/multiusos-56`.
3. Abrir al menos una ficha de cada listado (`/catalogo/[catalogSlug]/[productSlug]`).

**Resultado esperado**

- Ambos listados son accesibles en la web pública.
- M105-OK y M56-OK aparecen en su catálogo.
- No se exige un recuento exacto 105/56 hasta tener los Excel reales.

---

### CAT-002 — Solo salen productos que cumplen la regla AND de publicación

| Campo | Detalle |
|-------|---------|
| Caso | En UI y en la lectura anónima solo aparecen productos que cumplen **todas** las condiciones de publicación. |
| Precondiciones | Fixtures M105-OK más al menos M-HID, M-INA, AUTO-1 y M-PRIVCAT en el maestro. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Captura del listado público; salida de la lectura anónima (API o cliente `anon`) con los `id` visibles; confirmación de que los fixtures no publicables no están. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1 (regla AND); SEGURIDAD.md §4 y SCHEMA matriz RLS de `products`: `visible_web = true` **AND** `is_active = true` **AND** línea/catálogo públicos (`multiusos` / `is_public`). |

**Pasos**

1. Cargar la UI de catálogo público.
2. Consultar la lectura anónima de `products` (cliente `anon` o API pública equivalente, cuando exista).
3. Contrastar el conjunto visible con los fixtures.

**Resultado esperado**

- Visible: solo M105-OK / M56-OK (y equivalentes que cumplan el AND).
- No visible: M-HID, M-INA, AUTO-1, M-PRIVCAT.
- Cero filas automotriz o con `visible_web = false` en la lectura anónima (prueba de aceptación SCHEMA / SEGURIDAD §4).

---

### CAT-003 — Se muestran precios de lista públicos en MXN

| Campo | Detalle |
|-------|---------|
| Caso | El precio público de lista (`products.unit_price`) es visible en el catálogo / ficha. |
| Precondiciones | M105-OK y M56-OK con `unit_price` real de fixture (no inventar un precio de negocio). |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Captura de listado y ficha con el precio; el monto coincide con `unit_price` de la DB, no con un `promo_price`. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Precios públicos»; SCHEMA `products.unit_price` / `currency`; FLUJOS §5 «Sin promos UI». WEB_IA §4.3–4.4: la tarjeta y la ficha muestran precio de lista `unit_price` MXN. Cruce QA CAT-06. |

**Pasos**

1. Abrir listado y ficha de M105-OK (y uno de M56-OK).
2. Comparar el monto mostrado con el `unit_price` del maestro.

**Resultado esperado**

- El precio de lista en MXN es visible y coincide con la DB.
- No se muestra un precio promocional distinto (ver CAT-012).

---

### CAT-004 — Fotos públicas solo de productos publicados

| Campo | Detalle |
|-------|---------|
| Caso | Las imágenes visibles en el catálogo público corresponden a productos que pasan el filtro web; el bucket `product-images` no expone fotos de no publicados. |
| Precondiciones | M105-OK con foto editada; un producto no público (AUTO-1 o M-HID) que tenga archivo en Storage. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Captura de la foto en la UI del producto publicado; intento de lectura anónima de la imagen del no publicado (resultado denegado o no servido). |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1.6; SCHEMA Storage `product-images`; SEGURIDAD.md §9. El pipeline de edición de fondo/colores (C1b) sigue en proceso; no publicar fotos crudas. |

**Pasos**

1. Ver la ficha pública de M105-OK y comprobar que la foto carga por HTTPS (ver SEG-003).
2. Confirmar que no se ofrecen fotos de AUTO-1 / M-HID en la UI pública.
3. Verificar que la lectura anónima del objeto de un producto no público no es pública.

**Resultado esperado**

- Foto del publicado visible.
- Foto del no publicado no aparece en UI ni es legible en anónimo.

---

### CAT-005 — Los dos listados se mantienen separados (no fusionados)

| Campo | Detalle |
|-------|---------|
| Caso | `multiusos_105` y `multiusos_56` no se presentan como un único catálogo mezclado. |
| Precondiciones | M105-OK y M56-OK presentes. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Capturas donde se distingan los dos listados; un producto de uno no aparece como ítem del otro. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1: *Los dos listados se mantienen separados. No se fusionan sin OK del dueño.* WEB_IA §4.2–4.3 y QA CAT-09: índice separado; no una sola grilla mezclada. |

**Pasos**

1. Recorrer ambos listados públicos.
2. Verificar pertenencia de M105-OK y M56-OK a su catálogo.

**Resultado esperado**

- Hay dos listados distinguibles.
- No hay un único grid fusionado que mezcle ambos sin distinción.

---

### CAT-006 — `visible_web = false` no aparece en UI ni API pública

| Campo | Detalle |
|-------|---------|
| Caso | Un producto multiusos válido pero con `visible_web = false` no sale al público. |
| Precondiciones | M-HID en el maestro (y, si aplica, una promo interna asociada). |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Listado público y lectura `anon` sin el `id` de M-HID; evidencia de que sí existe en el maestro (captura admin o query staff, sin PII). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 6; FLUJOS §6; SCHEMA `visible_web`; SEGURIDAD aceptación anónima punto 1. |

**Pasos**

1. Confirmar (vía admin/staff) que M-HID existe.
2. Buscar ese producto en UI pública (navegación y, si WEB_IA define búsqueda, también ahí).
3. Consultar lectura anónima de `products`.

**Resultado esperado**

- M-HID no está en UI ni en el resultado anónimo.
- Si se conoce una URL de ficha, esa URL responde **404** con `noindex` (no 200 con «no disponible») — detalle en CAT-021.
- Default de publicación: no basta con existir en el maestro.

---

### CAT-007 — `is_active = false` no aparece en la web

| Campo | Detalle |
|-------|---------|
| Caso | Defensa en profundidad: un producto inactivo no es público aunque otros flags se vean “abiertos”. |
| Precondiciones | Fixture M-INA. No hace falta forzar combinaciones ilegales de flags si hay constraint; si el maestro impide `visible_web = true` con `is_active = false`, documentarlo en notas y verificar que el inactivo no sale. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Lectura anónima y UI sin M-INA. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §4 / SCHEMA RLS: `visible_web = true` **AND** `is_active = true` **AND** catálogo/línea públicos. CATALOGO.md §2: `is_active` no basta para publicar. |

**Pasos**

1. Tener M-INA en el maestro.
2. Recorrer catálogo público y lectura anónima.

**Resultado esperado**

- M-INA no aparece en la web.

---

### CAT-008 — Línea o catálogo automotriz nunca aparece en la web

| Campo | Detalle |
|-------|---------|
| Caso | Ningún producto, catálogo, imagen, filtro o texto de línea automotriz aparece en la superficie pública. |
| Precondiciones | AUTO-1 (y, si existe, más de un ítem automotriz) en el sistema interno. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de navegación pública (home, catálogo, ficha, buscador si existe); lectura anónima de `catalogs`, `products` y `product_images` con cero filas automotriz. Suite complementaria: MAR-002, MAR-003, MAR-009. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «No promocionar»; FLUJOS §6 *Auto nunca WebPub*; CATALOGO.md §1; misión Web. Encender `visible_web` en automotriz debe ser imposible (CATALOGO.md §2); aun así la web debe filtrar. |

**Pasos**

1. Recorrer las páginas públicas documentadas cuando existan (landing, catálogo, fichas).
2. Revisar que no hay filtros, chips, breadcrumbs ni listados de línea automotriz.
3. Ejecutar la lectura anónima de catálogos, productos e imágenes.

**Resultado esperado**

- Cero presencia automotriz en UI y en lecturas anónimas.

---

### CAT-009 — Catálogo con `is_public = false` no es listable en público

| Campo | Detalle |
|-------|---------|
| Caso | Un catálogo no público (p. ej. automotriz u otro con `is_public = false`) no aparece como listado web. |
| Precondiciones | M-PRIVCAT y/o catálogo `automotriz` con `is_public = false`. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Lectura anónima de `catalogs` solo con `is_public = true`; UI sin ese listado. |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA `catalogs.is_public`; SEGURIDAD §4: SELECT anónimo de `catalogs` si `is_public = true`. |

**Pasos**

1. Listar catálogos en la UI pública.
2. Lectura anónima de `catalogs`.

**Resultado esperado**

- Solo catálogos públicos (multiusos vendibles).
- Automotriz y no públicos, ausentes.

---

### CAT-010 — Producto sin `unit_price` no se publica

| Campo | Detalle |
|-------|---------|
| Caso | Una fila sin precio puede vivir en el maestro, pero no en la web. |
| Precondiciones | M-NOPRICE en el maestro (CATALOGO.md pide `unit_price` nullable en maestro). Si el schema vigente aún lo impide, registrar el gap y no inventar un monto para “publicarlo”. |
| Prioridad / tipo | P1 / negativo |
| Evidencia requerida | Evidencia staff de la fila sin precio; UI y `anon` sin ese `id`. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1.5 y cambio 4: publicar exige precio no nulo; prohibido inventar precios. |

**Pasos**

1. Confirmar M-NOPRICE en el maestro.
2. Buscarlo en catálogo público y en lectura anónima.

**Resultado esperado**

- No aparece en la web.
- Nadie completa el precio “a ojo” para el test.

---

### CAT-011 — La UI pública no muestra stock ni inventario

| Campo | Detalle |
|-------|---------|
| Caso | No hay existencias, “piezas disponibles”, qty on hand ni equivalentes en la UI pública. |
| Precondiciones | Catálogo público con al menos un producto publicado. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de listado y ficha; revisión de textos e atributos visibles. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «No somos… un sistema que muestre stock al público»; SCHEMA: sin columnas de stock; FLUJOS §5 *Sin stock*; NECESIDADES fuera de alcance. |

**Pasos**

1. Recorrer listado y ficha públicos.
2. Revisar etiquetas, badges y datos técnicos visibles.

**Resultado esperado**

- Ningún indicador de stock/inventario.
- El schema no se usa para mostrar disponibilidad.

---

### CAT-012 — La UI pública no muestra promos ni precio promocional

| Campo | Detalle |
|-------|---------|
| Caso | Aunque existan promos en el maestro (`visible_web` default `false`, `is_active` interno posible), la UI pública no las muestra. |
| Precondiciones | Una promo interna ligada a M105-OK (nombre, `promo_price` o `percent_off`) con `promos.visible_web = false`. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Captura de ficha/listado con un solo precio (el de lista); evidencia staff de que la promo existe en datos. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 6; FLUJOS §5–§6; SCHEMA `promos`; épica F2 (promos visibles solo si el dueño lo activa). |

**Pasos**

1. Confirmar la promo en el maestro (staff).
2. Ver listado y ficha públicos de ese producto.

**Resultado esperado**

- Solo precio de lista.
- Sin etiquetas de descuento, porcentajes, “promo” o precio tachado provenientes de `promos`.

---

### CAT-013 — La API/app pública no consulta la tabla `promos`

| Campo | Detalle |
|-------|---------|
| Caso | En Fase 1 la app pública **no consulta** `promos`; el RLS deniega todo SELECT anónimo. |
| Precondiciones | Cliente anónimo configurado; tabla `promos` con al menos una fila interna. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Resultado de SELECT anónimo a `promos`: vacío o denegado; si hay red de la app pública, ausencia de consultas a esa tabla (o evidencia equivalente de código/config cuando exista la app). |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §5; SCHEMA: *RLS deniega todo SELECT anónimo sobre promos*; SEGURIDAD §4. Check defensivo, no un procedimiento de ataque. |

**Pasos**

1. Con la clave `anon`, intentar leer `promos`.
2. Observar las llamadas de la superficie pública al cargar un producto que tiene promo interna.

**Resultado esperado**

- SELECT anónimo: vacío o denegado.
- La UI no obtiene ni aplica datos de `promos`.

---

### CAT-014 — Identificación por ID/nombre; no exigir SKU formal

| Campo | Detalle |
|-------|---------|
| Caso | La identificación actual es ID / nombre (número). El SKU formal no es requerido en Fase 1. |
| Precondiciones | Producto publicado con `external_id` / `name` y `sku` nulo. |
| Prioridad / tipo | P2 / feliz |
| Evidencia requerida | Captura de ficha: se puede identificar el producto sin SKU. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Identificación actual: ID / nombre (número); sin SKU formal aún»; SCHEMA `sku` nullable. WEB_IA §4.4: la ficha muestra galería, nombre, ID (`external_id`), precio de lista MXN; `description` / `tech_sheet` solo si existen. Cruce QA CAT-12. |

**Pasos**

1. Abrir la ficha de un publicado con `sku` nulo.
2. Comprobar que el producto es identificable y vendible.

**Resultado esperado**

- No se bloquea la publicación ni la ficha por ausencia de SKU.

---

### CAT-015 — Ficha técnica ausente no bloquea un ítem ya publicable

| Campo | Detalle |
|-------|---------|
| Caso | `tech_sheet` (C1c) no es condición de publicación web. |
| Precondiciones | M105-OK con `tech_sheet` nulo y el resto del AND cumplido (incl. foto). |
| Prioridad / tipo | P2 / límite |
| Evidencia requerida | El producto aparece en el catálogo público. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §2 y §5: fichas no bloquean W2 (depende de C1 + C1b). |

**Pasos**

1. Publicar (o usar fixture) con `tech_sheet` vacío y flags de web cumplidos.
2. Abrir el catálogo público.

**Resultado esperado**

- El ítem es visible. No se exige ficha técnica para pass de visibilidad.

---

### CAT-016 — Producto incompleto o no listo no aparece

| Campo | Detalle |
|-------|---------|
| Caso | Productos incompletos (sin foto editada, no listos) no salen al público. |
| Precondiciones | M-NOPHOTO en el maestro. La regla de negocio es no encender `visible_web` sin foto editada. |
| Prioridad / tipo | P2 / negativo |
| Evidencia requerida | UI/`anon` sin ese producto; nota de si `visible_web` permaneció en `false`. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1.6. Un flag `is_web_ready` en imágenes es opcional y no bloqueante. Si WEB_IA define un estado visual de “sin foto”, no inventarlo antes. |

**Pasos**

1. Confirmar el ítem incompleto en el maestro.
2. Verificar ausencia en web pública.

**Resultado esperado**

- No aparece en UI ni en lectura anónima.

---

### CAT-017 — `product_images` de un producto no público no es legible en anónimo

| Campo | Detalle |
|-------|---------|
| Caso | SELECT anónimo de `product_images` solo si el producto padre pasa el filtro público. |
| Precondiciones | Imagen ligada a AUTO-1 o M-HID; imagen ligada a M105-OK. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Resultado `anon` sobre `product_images`: solo filas de publicados; denegado o vacío para no públicos. |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA / SEGURIDAD §4: EXISTS al producto padre; no solo por path. Check defensivo de comportamiento esperado. |

**Pasos**

1. Con cliente `anon`, leer `product_images`.
2. Contrastar con las imágenes de publicados vs no publicados.

**Resultado esperado**

- Solo imágenes cuyo padre cumple el filtro web.
- Cero imágenes automotriz o de `visible_web = false`.

---

### CAT-018 — Moneda de precios públicos es MXN

| Campo | Detalle |
|-------|---------|
| Caso | Los precios públicos se expresan en MXN. |
| Precondiciones | Producto publicado con `currency = MXN` (default del schema). |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Captura de UI donde se identifique MXN o el formato equivalente que defina WEB_IA (sin inventar el patrón visual). |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA `currency` default `MXN`; FLUJOS §5 moneda forzada `MXN` en checkout. WEB_IA §4.3–4.4 y §5 JSON-LD: precio de lista en MXN; sin `availability` de inventario. |

**Pasos**

1. Ver precio en listado y ficha.
2. Confirmar que no se ofrece otra moneda en la UI pública.

**Resultado esperado**

- Precio en MXN. Sin selector de moneda no documentado.

---

### CAT-019 — Textos del catálogo en español (MX)

| Campo | Detalle |
|-------|---------|
| Caso | La UI del catálogo está en español (mercado MX). |
| Precondiciones | Superficie pública disponible. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Capturas de listado y ficha (encabezados, botones, vacíos). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 10; STACK «Idioma UI: español (MX)». Microcopy exacto pendiente de WEB_IA. |

**Pasos**

1. Recorrer listado, ficha y estados vacíos si existen.

**Resultado esperado**

- Textos de interfaz en español. No se exige un tono no documentado.

---

### CAT-020 — El catálogo es vendible: hay camino a carrito/checkout

| Campo | Detalle |
|-------|---------|
| Caso | El catálogo público no es solo consulta: un producto publicado puede entrar al flujo de compra Stripe. |
| Precondiciones | M105-OK publicado. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Captura del CTA de añadir / pagar en tarjeta y ficha, y de `/carrito`; continuación en CHK-001. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «catálogo… vendible online»; backlog W2–W3; FLUJOS §5 (stub). El carrito solo guarda `{ product_id, quantity }` (WEB_IA §4.4). CTA en tarjeta y ficha. Continuar en la matriz CHK. Cruce QA CAT-12. |

**Pasos**

1. Desde `/catalogo/multiusos-105` (tarjeta) y desde la ficha de M105-OK, añadir al carrito.
2. Abrir `/carrito` y continuar con CHK-001.

**Resultado esperado**

- Hay camino a `/carrito` / Stripe solo para productos publicables.
- El botón no manda precios (CHK-007).


---

### CAT-021 — URL de no publicable o automotriz responde 404 + noindex

| Campo | Detalle |
|-------|---------|
| Caso | Una URL de ficha (o API) de producto automotriz, `visible_web = false`, inactivo, sin precio, sin foto o de catálogo no público responde **404**, con `noindex`. No es un 200 con «no disponible». Tampoco sale en el sitemap. |
| Precondiciones | Fixtures AUTO-1, M-HID, M-INA, M-NOPRICE o M-NOPHOTO. Patrón de slug según WEB_IA §2 (si el slug no es adivinable, construir la URL a partir del `external_id` / regla de slugify documentada). |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Status HTTP 404; meta `noindex`; ausencia en sitemap. Cruce QA CAT-03 y SEO-008 / SEO-009. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.4 *404* y §9 criterio 3; QA CAT-03. |

**Pasos**

1. Solicitar la URL de ficha de cada fixture no publicable (y de AUTO-1).
2. Revisar status, `noindex` y sitemap.

**Resultado esperado**

- 404 + `noindex` en todos esos casos.
- Cero aparición en sitemap ni en API anónima.

---

### CAT-022 — Búsqueda/filtro solo sobre el listado actual, sin facetas automotriz

| Campo | Detalle |
|-------|---------|
| Caso | Si hay búsqueda o filtros, operan sobre el listado actual (nombre, ID). No hay facetas ni resultados de línea automotriz. |
| Precondiciones | Listado `/catalogo/multiusos-105` (o 56) con al menos un publicable; AUTO-1 conocido en el maestro. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Capturas de la búsqueda/filtro; búsqueda del `external_id` o nombre de AUTO-1: 0 resultados públicos (QA CAT-02). |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.3: *Filtros / búsqueda sobre el listado actual (nombre, ID). Sin facetas de línea automotriz.* Paginar solo si hace falta, con `?pagina=` rastreable. |

**Pasos**

1. En un listado, buscar un publicable por nombre o `external_id`.
2. Buscar el identificador conocido de AUTO-1 en la superficie pública (listado y, si existe, buscador de `/catalogo`).

**Resultado esperado**

- El publicable se encuentra en su listado.
- Automotriz: 0 resultados. Sin faceta de línea automotriz.

---

### CAT-023 — Estado vacío honesto si no hay ítems publicables; sin ejemplos inventados

| Campo | Detalle |
|-------|---------|
| Caso | Si un listado aún no tiene productos publicables (Excel/fotos pendientes), se muestra vacío de forma honesta. No se rellenan ítems de ejemplo ni precios inventados. |
| Precondiciones | Un catálogo público sin ítems que pasen el AND (o un entorno donde se oculte el fixture). |
| Prioridad / tipo | P1 / límite |
| Evidencia requerida | Captura del vacío en `/catalogo` o en el slug correspondiente. Cruce QA CAT-09. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §4.2 *Vacío honesto*; §7 no inventar. W1/W6 pueden arrancar con catálogo parcial. |

**Pasos**

1. Abrir `/catalogo` y el listado sin publicables.
2. Confirmar que no hay productos dummy ni precios ficticios.

**Resultado esperado**

- Estado vacío honesto (copy en español, no inventado como criterio rígido).
- El índice sigue presentando los dos listados por separado, aunque uno esté vacío.
