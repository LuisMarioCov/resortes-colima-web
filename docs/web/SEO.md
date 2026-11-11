# SEO — baseline Fase 1 (SEO Web)

**Para:** Gerente Web  
**Estado:** auditoría documental, 2026-11-11 (America/Mexico_City). Sin app y sin dominio registrado; no hay medición de indexación real.  
**Fuentes:** [`BRIEF.md`](../negocio/BRIEF.md), [`WEB_IA.md`](../arquitectura/WEB_IA.md) §§4–5, 8–11, [`SEGURIDAD.md`](../arquitectura/SEGURIDAD.md) §1, [`matriz-05-seo.md`](pruebas/matriz-05-seo.md).  
**Límite:** no se promete un lugar en Google. No se registra dominio. No hay código de producto hasta OK explícito del dueño. Cero automotriz, promos o stock en cualquier canal de búsqueda.

---

## Veredicto

El diseño de [`WEB_IA.md`](../arquitectura/WEB_IA.md) §5 es un baseline W0 sólido: render en servidor, metadatos, sitemap acotado, `robots.txt`, JSON-LD, `lang="es-MX"` e HTTPS en Vercel. Con eso el sitio no debería bloquearse a sí mismo cuando exista la app.

Quedan **huecos documentales** que conviene cerrar en la IA **antes** de implementar. Abajo van como propuesta: no se aplican a `WEB_IA.md` hasta OK del Gerente Web.

---

## Lo que ya está decidido (no reabrir)

| Pieza | Decisión |
|-------|----------|
| Mensaje | Resortes + Fabricado express + Colima + envíos a toda la República. |
| Render | Landing, listados y fichas en servidor (RSC / SSG). |
| Titles | Patrón `{página} \| Resortes Colima`. Ficha: `Nombre — Resortes Colima`. Description solo con datos reales. |
| Sitemap | Home, `/catalogo`, cada catálogo público, cada producto que pasa el AND. Nunca automotriz, `/admin`, `/api`, `/carrito`, `/pedido/*`, `/personalizados/enviado`. |
| `robots.txt` | Allow del público; `Disallow` de `/admin`, `/api`, `/carrito`, `/pedido/`. |
| JSON-LD | Home: `Organization` + `LocalBusiness` (Colima, MX). Producto: `Product` + `Offer` con `unit_price` y `MXN`, **sin** `availability`. |
| No publicable | 404 + `noindex`; fuera del sitemap. |
| Dominio | Nombre de trabajo `resortescolima.mx` (no inscrito, **no registrar** desde Web). Canonicals de ejemplo lo usan sin presentarlo como dominio ya registrado. DNS = dueño. |
| Fuera de Fase 1 | Blog, editor SEO en admin, landings extra de keywords, ficha de Google Business inventada. |

---

## Propuestas (OK del Gerente Web para incorporar a la IA)

### P1 — Incluir `/personalizados` en el sitemap (mayor)

Es una de las tres superficies públicas y responde a búsquedas de resorte a la medida. Hoy el sitemap no la lista. Propuesta: añadir `/personalizados`. Seguir **fuera**: `/personalizados/enviado`.

`/aviso-de-privacidad` y `/terminos`: entrar al sitemap **solo** cuando el dueño entregue el copy real. Mientras sean rutas reservadas vacías: `noindex` y fuera del sitemap.

### P2 — `noindex` explícito en páginas transaccionales (mayor)

`/carrito` y `/pedido/*` ya están en `Disallow`. `/personalizados/enviado` no está en `Disallow` ni tiene `noindex` escrito, solo se omite del sitemap. Esa URL puede llevar folio y no debe indexarse.

Propuesta: `robots` `noindex` en `/carrito`, `/pedido/*` y `/personalizados/enviado` (además del `Disallow` ya documentado en las dos primeras). No hace falta `Disallow` de `/personalizados/enviado` si el `noindex` está en la página.

### P3 — Directiva `Sitemap` en `robots.txt` (menor)

`robots.ts` de Next.js debe declarar la URL del sitemap. En preview, esa URL es la del propio entorno; en producción, la del host real cuando el dueño registre.

### P4 — Fila SEO en el índice `/catalogo` (menor)

§4.2 no tiene fila SEO. Propuesta: title `Catálogo de resortes \| Resortes Colima`; description breve (dos listados multiusos, sin fusionarlos, sin automotriz); canonical y Open Graph como el resto de rutas públicas.

### P5 — Core Web Vitals (mayor, no estaba en §5)

Objetivo medible en preview y prod, en móvil, sobre `/`, un listado y una ficha publicable (umbral «bueno» de CrUX / Lighthouse):

| Métrica | Objetivo |
|---------|----------|
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |

Fotos de producto solo HTTPS, con tamaño explícito para no desplazar el layout. Sin inventario de un tercer vendor de métricas hasta que haya un deploy. Si un preview no cumple, se reporta con evidencia (Lighthouse o CrUX), no se «arregla» inventando un CDN distinto al stack (Vercel).

### P6 — JSON-LD `LocalBusiness` con datos reales, no inventados

Campos Fase 1, solo si existen en fuente canónica:

- `name`: Resortes Colima  
- `address`: Colima, Colima, México (calle y CP **cuando el dueño los entregue**; no inventar)  
- `areaServed`: México  
- `telephone` y `url`: cuando existan (teléfono = mismo input que WhatsApp / footer)  
- Sin coordenadas, horarios ni ficha de Google Business Profile inventados. Esa ficha se propone **después** del dominio real, al dueño, nunca se crea desde Web por cuenta propia.

### P7 — Titles de rutas que aún no tienen copy exacto

Borrador para implementación (ajustable; la ficha ya está fijada):

| Ruta | Title propuesto |
|------|-----------------|
| `/` | `Resortes en Colima \| Fabricado express \| Resortes Colima` |
| `/catalogo` | `Catálogo de resortes \| Resortes Colima` |
| `/catalogo/[catalogSlug]` | `{nombre del catálogo en DB} \| Resortes Colima` |
| `/catalogo/.../[productSlug]` | `Nombre — Resortes Colima` (ya en la IA) |
| `/personalizados` | `Resortes a la medida \| Resortes Colima` |

H1 de `/` alineado al title: resortes + Fabricado express + Colima / México. Sin keywords automotrices.

### P8 — Host canónico y Search Console (W0, go-live)

Hasta que el dueño registre y apunte DNS: canonicals y Open Graph usan el host del entorno (preview o nombre de trabajo), **sin** copy que diga que `resortescolima.mx` ya está inscrito. Un solo host canónico (con o sin `www`, sin barra final inconsistente) se fija el día del DNS.

Google Search Console y el alta del sitemap en producción son pasos de go-live, a cargo de Web + DevOps **después** del DNS. No se pueden ejecutar hoy.

---

## Bloqueos que no resuelve este documento

| Qué | Quién |
|-----|-------|
| Registro y DNS reales | Dueño (Web no registra) |
| OK para implementar código | Dueño, vía Gerente Web / CEO |
| Teléfono, dirección exacta, razón social | Dueño |
| Excel, fotos y fichas reales (W2 / W6 parcial sí puede arrancar) | Dueño / Catálogo |
| Ejecutar la matriz SEO (SEO-001 a SEO-010) | QA / Tester, cuando haya app |

---

## Qué sigue

1. Gerente Web acepta, ajusta o descarta P1–P8. Si acepta, se incorporan a `WEB_IA.md` §5 / §4.2 y a la matriz de QA (SEO-02, SEO-09, y un caso de Core Web Vitals).  
2. Sin código hasta el OK del dueño.  
3. En el primer preview: auditoría de HTML servido (titles, canonical, sitemap, robots, JSON-LD, `noindex`, automotriz cero) y de Core Web Vitals.  
4. Landings extra de keywords: solo una propuesta posterior, sin automotriz y sin blog en Fase 1.
