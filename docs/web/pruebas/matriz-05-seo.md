# Matriz SEO — SEO local Colima y nacional de resortes

El **baseline técnico** ya está en [`WEB_IA.md`](../../arquitectura/WEB_IA.md) §5 y en el plan QA §11.4. No se inventan keywords extra ni un blog (WEB_IA lo deja explícitamente fuera de Fase 1). El **dominio** sigue pendiente del dueño (W0 / §10); esos checks de producción real se hacen en preview mientras tanto.

**Estado de todos los casos:** Pendiente — sin app.

Fuentes: WEB_IA §§4.1, 4.4, 5, 9 y 11.4; BRIEF; NECESIDADES.md §A; misión Web; BACKLOG W0, W1, W6; STACK; CATALOGO / FLUJOS §6.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| SEO-001 | Contenido público alineado a la identidad (resortes, fabricación, Colima, express, cobertura nacional) | P0 | SEO | Pendiente — sin app |
| SEO-002 | Presencia de ubicación para SEO local Colima (detalle técnico pendiente) | P1 | SEO | Pendiente — sin app |
| SEO-003 | SEO nacional de «resortes y similares» según la lista que defina Web | P1 | SEO | Pendiente — sin app |
| SEO-004 | Cero automotriz promocional en titles, meta, headings y contenido indexable | P0 | marca | Pendiente — sin app |
| SEO-005 | Contenido público en español | P1 | SEO | Pendiente — sin app |
| SEO-006 | Render público apto para SEO (criterios finos pendientes de W0 / WEB_IA) | P2 | SEO | Pendiente — sin app |
| SEO-007 | Dominio + baseline SEO técnico (W0) | P1 | SEO | Pendiente — sin app |
| SEO-008 | SEO de producto no indexa no-publicables ni automotriz | P0 | SEO | Pendiente — sin app |
| SEO-009 | `sitemap` y `robots.txt` cumplen el allow/deny documentado | P0 | SEO | Pendiente — sin app |
| SEO-010 | JSON-LD de home y ficha (sin stock ni automotriz ni promo) | P1 | SEO | Pendiente — sin app |

---

### SEO-001 — Contenido público alineado a la identidad

| Campo | Detalle |
|-------|---------|
| Caso | Las páginas públicas comunican, de forma verificable, la actividad (fabricación de resortes), el origen (Colima), el diferenciador (Fabricado express) y la cobertura nacional. |
| Precondiciones | Al menos landing y, si ya existen, catálogo o contenidos W6. |
| Prioridad / tipo | P0 / SEO |
| Evidencia requerida | Capturas y, cuando exista el HTML, titles/H1 coherentes con esa identidad (plantillas exactas pendientes de WEB_IA). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Quiénes somos» y «Productos públicos (web)»; misión Web. No se exige un keyword stuffing ni una lista no documentada. |

**Pasos**

1. Recorrer home/landing y otras rutas públicas documentadas cuando existan.
2. Comprobar que el contenido visible y los títulos no contradicen el brief.

**Resultado esperado**

- Identidad presente y coherente.
- Mensaje central express + cobertura, sin giro automotriz (SEO-004).

---

### SEO-002 — Presencia de ubicación para SEO local Colima

| Campo | Detalle |
|-------|---------|
| Caso | El sitio deja claro que el negocio está en **Colima, Colima, México**, como base del SEO local declarado en la misión Web. |
| Precondiciones | Contenido público. Implementación (Google Business, markup, páginas de localidad, etc.) **no documentada**. |
| Prioridad / tipo | P1 / SEO |
| Evidencia requerida | Captura de la mención de Colima en contenido visible; si WEB_IA añade mecanismos técnicos, evidenciarlos entonces. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF ubicación; `docs/agentes/depts/web.md`. **No inventar** fichas de Business Profile, coordenadas ni un pack local no escrito. |

**Pasos**

1. Verificar la mención de Colima en la superficie pública.
2. Cuando WEB_IA/W0 definan checks técnicos de SEO local, ejecutarlos como extensión de este caso.

**Resultado esperado**

- Ubicación Colima verificable en el sitio.
- Checks extra: solo los que documente Web.

---

### SEO-003 — SEO nacional de «resortes y similares» según la lista que defina Web

| Campo | Detalle |
|-------|---------|
| Caso | La landing cubre «resortes» + fabricación express + envíos México (W6). No se inventa un listado extra de keywords ni artículos de blog en Fase 1. |
| Precondiciones | `/` publicada en el entorno de prueba. |
| Prioridad / tipo | P1 / SEO |
| Evidencia requerida | Title/H1/body de `/` alineados a resortes + express + cobertura / Colima (WEB_IA §4.1 y §5). |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §5 *Contenido nacional*: *Keywords o landing pages extra se proponen después, sin automotriz.* No exigir un keyword set no publicado. |

**Pasos**

1. Revisar title, H1 y cuerpo de `/` contra el mensaje documentado (resortes, express, envíos México, Colima).
2. Confirmar que no hay landings o términos automotriz promocionales, ni un blog no previsto.

**Resultado esperado**

- Contenido de `/` cubre el W6 documentado.
- No se falla el producto por keywords inventadas por el tester.

---

### SEO-004 — Cero automotriz promocional en titles, meta, headings y contenido indexable

| Campo | Detalle |
|-------|---------|
| Caso | El SEO público no promociona ni captura línea automotriz: ni en title, meta description, H1–H3, alt de imágenes públicas, ni en cuerpo indexable. |
| Precondiciones | Páginas públicas y, cuando existan, fichas de producto publicadas. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Recorrido de HTML de páginas públicas (view-source o export) y capturas. Suite MAR-004. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 1; CATALOGO.md §1 *Nunca en canales digitales (API, UI, Storage público, SEO, checkout)*; misión Web. |

**Pasos**

1. Revisar title, meta, headings y contenido visible de landing, catálogo, fichas y otras rutas públicas.
2. Confirmar que no hay landings ni parámetros de búsqueda pública de automotriz.

**Resultado esperado**

- Cero señal automotriz promocional en material indexable.
- Productos no publicables no tienen ficha pública indexable (SEO-008).

---

### SEO-005 — Contenido público en español

| Campo | Detalle |
|-------|---------|
| Caso | El contenido pensado para búsqueda y la UI están en español (mercado MX). |
| Precondiciones | Páginas públicas. WEB_IA §5: `lang="es-MX"`. Sin hreflang de otros idiomas. Cruce QA SEO-01. |
| Prioridad / tipo | P1 / SEO |
| Evidencia requerida | Capturas; HTML `lang` solo si queda especificado. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 10; STACK idioma UI. |

**Pasos**

1. Revisar el idioma del contenido público.
2. Verificar `lang="es-MX"` en el HTML y la ausencia de hreflang de otros idiomas.

**Resultado esperado**

- Contenido en español y `lang="es-MX"`.

---

### SEO-006 — Render público apto para SEO (criterios finos pendientes)

| Campo | Detalle |
|-------|---------|
| Caso | Landing, listados y fichas publicables se renderizan en servidor (RSC / SSG). Hay `title` / `description` / canonical / Open Graph por ruta, en HTTPS. |
| Precondiciones | Entorno de prueba con al menos `/`, un listado y una ficha publicable. |
| Prioridad / tipo | P2 / SEO |
| Evidencia requerida | View-source (HTML servido) de una ficha y de `/`; `<head>` con title, description, canonical, OG. Cruce QA SEO-01 y SEO-04. Detalle de sitemap/robots y JSON-LD: SEO-009 y SEO-010. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §5 y §4.4: patrón de title documentado en WEB_IA §5 (`{página}` + separador + `Resortes Colima`); ficha `Nombre — Resortes Colima`; description a partir de datos reales, sin inventar specs. |

**Pasos**

1. Abrir el HTML servido (view-source) de `/`, de un listado y de una ficha publicable.
2. Revisar title (patrones documentados), description, canonical y Open Graph en HTTPS.

**Resultado esperado**

- Contenido de catálogo/ficha presente en el HTML servido (no solo hidratado en cliente).
- Metadatos según WEB_IA §5, sin specs inventadas.

---

### SEO-007 — Dominio + baseline SEO técnico (W0)

| Campo | Detalle |
|-------|---------|
| Caso | Épica W0: dominio + baseline SEO técnico (Web + DevOps). |
| Precondiciones | Dominio y redes **por crear** (PREGUNTAS_ABIERTAS). |
| Prioridad / tipo | P1 / SEO |
| Evidencia requerida | Cuando existan: dominio en HTTPS (ver SEG-001), entorno de producción distinto de preview (SEG-005), y el baseline que defina W0. |
| Estado | Pendiente — sin app |
| Notas / fuente | BACKLOG W0; PREGUNTAS_ABIERTAS «Dominio/redes por crear»; STACK hosting Vercel. El baseline técnico (sitemap, robots, titles, lang, JSON-LD, HTTPS) ya está en WEB_IA §5 y se prueba en preview (SEO-005 a SEO-010, SEG-001). El dominio de producción y DNS siguen siendo input del dueño (WEB_IA §10): este caso cubre ese go-live, no el baseline. |

**Pasos**

1. Confirmar que el dominio está creado y apuntado al deploy de producción.
2. Ejecutar el baseline W0 cuando esté escrito.

**Resultado esperado**

- Dominio público en HTTPS, con el baseline que Web/DevOps documenten.
- Hoy: Bloqueado.

---

### SEO-008 — SEO de producto no indexa no-publicables ni automotriz

| Campo | Detalle |
|-------|---------|
| Caso | Las fichas o URLs de producto en la web solo corresponden a ítems que cumplen la regla AND de publicación. Automotriz, `visible_web = false`, inactivos y catálogos no públicos no tienen página pública indexable. |
| Precondiciones | Catálogo parcial o completo en web (W6 puede arrancar con catálogo parcial, BACKLOG). Fixtures M-HID, AUTO-1. |
| Prioridad / tipo | P0 / SEO |
| Evidencia requerida | Criterio de WEB_IA §4.4: **404** + `noindex`. Sitemap solo con publicables (SEO-009). Cruce CAT-021 y QA CAT-03 / SEO-02. |
| Estado | Pendiente — sin app |
| Notas / fuente | CATALOGO.md §1 (nunca en SEO); FLUJOS §6; W6. URL: `/catalogo/[catalogSlug]/[productSlug]` (WEB_IA §2). |

**Pasos**

1. Listar URLs públicas de producto (navegación y, si existe, sitemap documentado).
2. Comprobar que solo hay publicados (regla AND).
3. Resolver, si se conoce el id, una URL de AUTO-1 o M-HID y verificar que no se sirve como ficha pública.

**Resultado esperado**

- Cero fichas públicas de automotriz o no publicables.
- Un catálogo parcial no justifica “agujeros” automotriz en SEO.


---

### SEO-009 — `sitemap` y `robots.txt` cumplen el allow/deny documentado

| Campo | Detalle |
|-------|---------|
| Caso | El sitemap solo incluye home, `/catalogo`, cada catálogo público y cada producto que pasa el AND. `robots.txt` permite lo público y hace `Disallow` de `/admin`, `/api`, `/carrito`, `/pedido/`. |
| Precondiciones | Entorno de prueba con fixtures publicables y no publicables. |
| Prioridad / tipo | P0 / SEO |
| Evidencia requerida | Contenido de sitemap y de `robots.txt`. Cruce QA SEO-02. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §5. El sitemap **nunca** incluye automotriz, admin, APIs, `/pedido/exito`, `/pedido/cancelado` ni `/personalizados/enviado`. |

**Pasos**

1. Obtener el sitemap (ruta que exponga `sitemap.ts`) y `robots.txt`.
2. Contrastar include/exclude con WEB_IA §5.
3. Verificar que AUTO-1 y M-HID no están en el sitemap.

**Resultado esperado**

- Allow/deny exactos a lo documentado.
- Cero URLs automotriz o no publicables en el sitemap.

---

### SEO-010 — JSON-LD de home y ficha (sin stock ni automotriz ni promo)

| Campo | Detalle |
|-------|---------|
| Caso | Home: `Organization` + `LocalBusiness` (Colima, MX). Ficha: `Product` + `Offer` con `price` = `unit_price`, `priceCurrency` = `MXN`, **sin** `availability` InStock/OutOfStock, **sin** automotriz ni promo. |
| Precondiciones | `/` y una ficha publicable. |
| Prioridad / tipo | P1 / SEO |
| Evidencia requerida | Fragmentos JSON-LD. Cruce QA SEO-03 y CAT-04/CAT-05. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §5 y §4.4. |

**Pasos**

1. Extraer JSON-LD de `/` y de una ficha publicable.
2. Comparar el precio del Offer con `unit_price` de la DB de prueba.

**Resultado esperado**

- Tipos y campos según WEB_IA.
- Sin disponibilidad de inventario, sin promo y sin automotriz.
