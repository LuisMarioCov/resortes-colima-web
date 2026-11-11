# Matriz MAR — Exclusiones de marca (suite P0)

Suite de **regresión de marca** para correr en cada entrega pública. Recoge las exclusiones críticas del brief y de la misión Web. El detalle de pasos de catálogo, landing o SEO vive en las matrices de flujo; aquí queda el veredicto de marca y los cruces.

Críticas declaradas para Tester/QA Web: **Fabricado express visible**; **sin automotriz promocional**; **sin mezclar línea automotriz** en catálogo o SEO público. Se añaden las exclusiones explícitas de **promos** y **stock** en la UI pública.

**Estado de todos los casos:** Pendiente — sin app.

Fuentes: WEB_IA §§3, 5, 9 y 11.5 (regresión mínima); BRIEF líneas de negocio, «Qué no somos», decisiones 1, 3, 5, 6 y 10; misión [`web.md`](../../agentes/depts/web.md); skill QA Web; FLUJOS §5–§6; CATALOGO.md §1; NECESIDADES §A.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| MAR-001 | Fabricado express es visible en la superficie pública | P0 | marca | Pendiente — sin app |
| MAR-002 | Cero automotriz en el catálogo (UI) | P0 | marca | Pendiente — sin app |
| MAR-003 | Cero automotriz en API pública / lectura anónima | P0 | marca | Pendiente — sin app |
| MAR-004 | Cero automotriz promocional en SEO y contenido indexable | P0 | marca | Pendiente — sin app |
| MAR-005 | Cero CTAs de captación de línea automotriz | P0 | marca | Pendiente — sin app |
| MAR-006 | Cero promos en la UI pública | P0 | marca | Pendiente — sin app |
| MAR-007 | Cero stock / inventario en la UI pública | P0 | marca | Pendiente — sin app |
| MAR-008 | No se mezcla la línea automotriz en navegación, filtros ni listados | P0 | marca | Pendiente — sin app |
| MAR-009 | La superficie pública está en español (mercado MX) | P1 | marca | Pendiente — sin app |

La cobertura nacional (envíos a toda la República) se verifica en EXP-002 (P0) y se considera parte del mensaje central junto con MAR-001.

---

### MAR-001 — Fabricado express es visible en la superficie pública

| Campo | Detalle |
|-------|---------|
| Caso | El diferenciador Fabricado express (días u horas vs semanas de la competencia) es visible en la web pública, como mensaje central. |
| Precondiciones | Landing / home pública (ruta pendiente de WEB_IA). |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de landing (y de otras páginas públicas que deban reiterar el mensaje, si WEB_IA lo pide). Caso canónico de detalle: EXP-001. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF mensaje central y definición operativa; skill QA Web. Copy exacto pendiente de WEB_IA; no inventar un eslogan como criterio. |

**Pasos**

1. Ejecutar EXP-001 (y EXP-009 para no contradecir «depende de complejidad y cantidad»).
2. Confirmar visibilidad en la primera pantalla pública relevante, no solo en un documento interno.

**Resultado esperado**

- Express visible y fiel al brief.
- Fail si el sitio público no comunica el diferenciador.

---

### MAR-002 — Cero automotriz en el catálogo (UI)

| Campo | Detalle |
|-------|---------|
| Caso | El catálogo y las fichas públicas no muestran productos, etiquetas ni listados de línea automotriz. |
| Precondiciones | AUTO-1 (u otros automotriz) existen en el maestro interno. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de listados y fichas; búsqueda pública si WEB_IA la define. Detalle: CAT-008. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 1; FLUJOS §6 *Auto nunca WebPub*; CATALOGO.md §1. |

**Pasos**

1. Ejecutar CAT-008 sobre la UI (ambos catálogos multiusos y cualquier buscador público).

**Resultado esperado**

- Cero automotriz en la UI de catálogo.

---

### MAR-003 — Cero automotriz en API pública / lectura anónima

| Campo | Detalle |
|-------|---------|
| Caso | La lectura anónima de `catalogs`, `products` y `product_images` no devuelve filas automotriz. Un id automotriz no entra al checkout (CHK-010). |
| Precondiciones | Fixtures automotriz en el maestro; cliente `anon`. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Salida `anon` con cero filas automotriz; rechazo de Checkout Session con id AUTO-1. Cruza CAT-008, CAT-017, CHK-010, SEG-007. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD / SCHEMA aceptación: `products` → cero filas automotriz o `visible_web = false`. |

**Pasos**

1. Lectura anónima de catálogos, productos e imágenes.
2. Intento de crear sesión Stripe con un id automotriz.

**Resultado esperado**

- Cero exposición automotriz en API pública y cero cobro web de esa línea.

---

### MAR-004 — Cero automotriz promocional en SEO y contenido indexable

| Campo | Detalle |
|-------|---------|
| Caso | Titles, meta, headings, alts y cuerpo indexable no promocionan automotriz ni buscan captar esa línea. |
| Precondiciones | Páginas públicas. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Recorrido HTML y capturas. Caso canónico: SEO-004 y SEO-008. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1 (nunca en SEO); BRIEF «No somos una marca enfocada en automotriz». |

**Pasos**

1. Ejecutar SEO-004 y SEO-008.

**Resultado esperado**

- Cero automotriz promocional indexable.
- Sin fichas públicas de no publicables / automotriz.

---

### MAR-005 — Cero CTAs de captación de línea automotriz

| Campo | Detalle |
|-------|---------|
| Caso | No hay botones, menús, banners ni formularios públicos para atraer clientes nuevos de automotriz. |
| Precondiciones | Landing, nav, pie, catálogo y form de personalizados. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de nav, landing, pie y CTAs. Detalle de landing: EXP-005. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Sin listados ni CTAs de línea automotriz»; «no captar clientes nuevos de esta línea». El form de personalizados es de réplica a medida (multiusos / a medida), no un canal de automotriz. |

**Pasos**

1. Revisar CTAs de toda la superficie pública (EXP-005 + nav global + pie + catálogo + form).

**Resultado esperado**

- Ningún CTA de captación automotriz.

---

### MAR-006 — Cero promos en la UI pública

| Campo | Detalle |
|-------|---------|
| Caso | Aunque las promos existan en el maestro, la UI pública no las muestra (Fase 1). |
| Precondiciones | Al menos una promo interna sobre un producto publicado. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de listado, ficha y carrito/checkout con solo precio de lista. Detalle: CAT-012, CAT-013, CHK-015. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 6; épica F2 (solo si el dueño las activa). |

**Pasos**

1. Ejecutar CAT-012, CAT-013 y CHK-015.

**Resultado esperado**

- Sin UI de promo, sin consulta pública a `promos`, sin descuento de promo en Stripe.

---

### MAR-007 — Cero stock / inventario en la UI pública

| Campo | Detalle |
|-------|---------|
| Caso | La web no muestra ni usa existencias. El checkout no descuenta stock (no hay inventario en MVP). |
| Precondiciones | Catálogo público; un checkout de prueba si está disponible. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de listado y ficha; constancia de CHK-016. Detalle UI: CAT-011. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «No somos un sistema que muestre stock al público»; SCHEMA sin columnas de stock. |

**Pasos**

1. Ejecutar CAT-011 y CHK-016.

**Resultado esperado**

- Sin indicadores de stock en la UI.
- Sin descuento de inventario tras una compra de prueba.

---

### MAR-008 — No se mezcla la línea automotriz en navegación, filtros ni listados

| Campo | Detalle |
|-------|---------|
| Caso | La línea automotriz no aparece mezclada con los dos catálogos multiusos públicos (menú, filtros, chips, breadcrumbs, resultados de búsqueda, landings). |
| Precondiciones | Maestro con automotriz interno y ambos listados multiusos publicados. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de navegación global, filtros de catálogo y resultados de búsqueda (si existe). Cruza CAT-005, CAT-008, EXP-005, SEO-004. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF y CATALOGO.md: automotriz vive en el sistema, visible y secundaria, **nunca** en canales digitales. Los dos listados multiusos se mantienen separados entre sí (CAT-005) y **separados de automotriz**. |

**Pasos**

1. Recorrer menú, breadcrumbs, filtros y ambos catálogos públicos.
2. Si hay búsqueda pública, consultar términos genéricos y comprobar que no afloran ítems automotriz.

**Resultado esperado**

- Automotriz no se mezcla en ninguna navegación o listado público.
- No hay un “catálogo general” que una automotriz con multiusos.

---

### MAR-009 — La superficie pública está en español (mercado MX)

| Campo | Detalle |
|-------|---------|
| Caso | UI y contenido público en español. |
| Precondiciones | Páginas públicas. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Capturas de landing, catálogo y form (CAT-019, EXP-006, PER-017, SEO-005). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 10; STACK idioma UI. Microcopy exacto pendiente de WEB_IA. |

**Pasos**

1. Revisar landing, catálogo, checkout (cuando exista) y form de personalizados.

**Resultado esperado**

- Interfaz y contenidos en español.
