# Trazabilidad y bloqueantes — matrices Web pública (Fase 1)

Complementa el [índice](README.md). Cada caso apunta a la fuente documental que lo justifica. Si un caso y un doc divergieran, **gana la fuente**; el caso se actualiza, no se “arregla” inventando criterio.

Fecha de preparación: 2026-11-11 (zona America/Mexico_City).  
`WEB_IA.md`: **borrador Gerente Web** (mismo día), con plan de QA Web en §11. Estas matrices se alinearon a ese documento tras su aparición.

---

## Cómo leer la trazabilidad

- Las rutas son relativas a `docs/`.
- «§» remite a la sección del doc.
- Un caso puede tener varias fuentes; la primera suele ser la canónica del requisito.
- Los cruces (p. ej. MAR-002 → CAT-008) no cambian el ID canónico de ejecución detallada.

Abreviaturas de ruta:

| Clave | Documento |
|-------|-----------|
| BRIEF | [`negocio/BRIEF.md`](../../negocio/BRIEF.md) |
| FLUJOS | [`arquitectura/FLUJOS.md`](../../arquitectura/FLUJOS.md) |
| NEC | [`discovery/NECESIDADES.md`](../../discovery/NECESIDADES.md) |
| BACK | [`discovery/BACKLOG.md`](../../discovery/BACKLOG.md) |
| SCHEMA | [`arquitectura/SCHEMA.md`](../../arquitectura/SCHEMA.md) |
| CATA | [`arquitectura/CATALOGO.md`](../../arquitectura/CATALOGO.md) |
| SEGUR | [`arquitectura/SEGURIDAD.md`](../../arquitectura/SEGURIDAD.md) |
| STACK | [`arquitectura/STACK.md`](../../arquitectura/STACK.md) |
| WEB | [`agentes/depts/web.md`](../../agentes/depts/web.md) |
| PERS | [`agentes/depts/personalizados.md`](../../agentes/depts/personalizados.md) |
| PREG | [`discovery/PREGUNTAS_ABIERTAS.md`](../../discovery/PREGUNTAS_ABIERTAS.md) |
| WEBIA | [`arquitectura/WEB_IA.md`](../../arquitectura/WEB_IA.md) |
| D2 | [`discovery/D2_ESTADOS.md`](../../discovery/D2_ESTADOS.md) |

---


---

## Cruce con el plan de QA Web (`WEB_IA.md` §11)

Los IDs de QA (severidad bloqueante / mayor / menor) son el **gate**. Los IDs de esta carpeta son el desglose ejecutable. Un caso QA puede cubrirse con varios casos Tester.

| QA §11 | Sev. QA | Casos Tester (desglose) |
|--------|---------|-------------------------|
| CAT-01 | Bloqueante | CAT-002, CAT-006, CAT-007, CAT-009, CAT-010, CAT-016 |
| CAT-02 | Bloqueante | CAT-008, CAT-022, MAR-002, MAR-008 |
| CAT-03 | Bloqueante | CAT-021, SEO-008 |
| CAT-04 | Bloqueante | CAT-011, MAR-007, SEO-010 (sin `availability`) |
| CAT-05 | Bloqueante | CAT-012, CAT-013, CHK-015, MAR-006 |
| CAT-06 | Mayor | CAT-003, CAT-018, CHK-001 (precios servidos) |
| CAT-07 | Mayor | CAT-004, CAT-017, SEG-009 |
| CAT-08 | Bloqueante | CAT-002, CAT-013, CAT-017, SEG-007 |
| CAT-09 | Mayor | CAT-001, CAT-005, CAT-023 |
| CAT-10 | Mayor | SEG-007, CHK-017, PER-014 |
| CAT-11 | Menor | CAT-019, MAR-009 |
| CAT-12 | Mayor | CAT-014, CAT-015, CAT-020 |
| CHK-01 | Bloqueante | CHK-002, CHK-007, CHK-008, CHK-015 |
| CHK-02 | Bloqueante | CHK-009, CHK-010 |
| CHK-03 | Mayor | CHK-011, CHK-012, CHK-013 |
| CHK-04 | Bloqueante | CHK-006 |
| CHK-05 | Bloqueante | CHK-005, CHK-019 |
| CHK-06 | Bloqueante | CHK-020 |
| CHK-07 | Bloqueante | CHK-014, SEG-013 |
| CHK-08 | Bloqueante | CHK-003, CHK-017, CHK-018, CHK-025, SEG-006 |
| CHK-09 | Mayor | CHK-021, CHK-026 |
| CHK-10 | Mayor | CHK-022, CHK-023, SEO-009 (Disallow `/pedido/`, `/carrito`) |
| CHK-11 | Mayor | CHK-024 |
| FRM-01 | Bloqueante | PER-001, PER-005, PER-009, PER-018 |
| FRM-02 | Bloqueante | PER-003, PER-004, EXP (bloque 5 sin precio) |
| FRM-03 | Bloqueante | PER-013 |
| FRM-04 | Mayor | PER-006, PER-007, PER-008, PER-019, PER-020 |
| FRM-05 | Bloqueante | PER-010, PER-011, PER-015 |
| FRM-06 | Bloqueante | PER-012, SEG-013 |
| FRM-07 | Bloqueante | PER-014 |
| FRM-08 | Mayor | PER-002, PER-016, PER-021 |
| FRM-09 | Menor | PER-017 |
| LND-01 | Bloqueante | EXP-001, MAR-001 |
| LND-02 | Mayor | EXP-002, EXP-004, EXP-005, EXP-007, EXP-008, MAR-005, MAR-008 |
| SEO-01 | Mayor | SEO-001, SEO-005, SEO-006 |
| SEO-02 | Bloqueante | SEO-008, SEO-009, CAT-021 |
| SEO-03 | Mayor | SEO-010 |
| SEO-04 | Mayor | SEO-006 |
| HTTPS-01 | Bloqueante | SEG-001, SEG-003, SEG-004, CHK-004, CHK-022 |
| HTTPS-02 | Mayor | SEG-002 |
| HTTPS-03 | Bloqueante | SEG-005 |
| TRV-01 | Bloqueante | SEG-007, SEG-008, SEG-014 |
| TRV-02 | Bloqueante | SEG-006, CHK-018 |
| TRV-03 | Menor | SEG-011, SEG-015 |

Suite de **regresión mínima** (WEB_IA §11.5): ejecutar también MAR-001 a MAR-008 en cada release público.

## Catálogo público (CAT)

| ID | P | Fuentes |
|----|---|---------|
| CAT-001 | P0 | BRIEF líneas / productos públicos; SCHEMA `catalogs` (`multiusos_105`, `multiusos_56`); CATA §1 |
| CAT-002 | P0 | CATA §1 regla AND; SEGUR §4; SCHEMA RLS `products` |
| CAT-003 | P0 | BRIEF precios públicos; SCHEMA `unit_price` / `currency`; FLUJOS §5 sin promos UI |
| CAT-004 | P1 | CATA §1.6; SCHEMA Storage `product-images`; SEGUR §9 |
| CAT-005 | P0 | CATA §1 (listados separados; no fusionar sin OK del dueño) |
| CAT-006 | P0 | BRIEF decisión 6; FLUJOS §6; SCHEMA `visible_web`; SEGUR aceptación anónima 1 |
| CAT-007 | P0 | SEGUR §4 / SCHEMA RLS (`is_active = true` en el AND); CATA §2 |
| CAT-008 | P0 | BRIEF no promocionar; FLUJOS §6; CATA §1; WEB misión; MAR-002 |
| CAT-009 | P0 | SCHEMA `catalogs.is_public`; SEGUR §4 SELECT anónimo de `catalogs` |
| CAT-010 | P1 | CATA §1.5 y cambio 4 (`unit_price` no nulo para publicar; no inventar precios) |
| CAT-011 | P0 | BRIEF «no mostrar stock»; SCHEMA sin stock; FLUJOS §5; NEC fuera de alcance |
| CAT-012 | P0 | BRIEF decisión 6 / promos ocultas; FLUJOS §5–§6; SCHEMA `promos`; BACK F2 |
| CAT-013 | P0 | FLUJOS §5 API no consulta `promos`; SCHEMA / SEGUR §4 deny SELECT anónimo |
| CAT-014 | P2 | BRIEF identificación ID/nombre, sin SKU formal; SCHEMA `sku` nullable |
| CAT-015 | P2 | CATA §2 y §5: `tech_sheet` (C1c) no bloquea W2 |
| CAT-016 | P2 | CATA §1.6 foto editada como condición de publicación |
| CAT-017 | P0 | SCHEMA / SEGUR §4 `product_images` atado al padre público |
| CAT-018 | P1 | SCHEMA `currency` MXN; FLUJOS §5 moneda forzada |
| CAT-019 | P1 | BRIEF decisión 10; STACK idioma UI español MX |
| CAT-020 | P1 | WEBIA §4.3–4.4 CTA añadir; carrito `{ product_id, quantity }`; BRIEF vendible; BACK W2–W3 |
| CAT-021 | P0 | WEBIA §4.4 404 + noindex; QA CAT-03 |
| CAT-022 | P1 | WEBIA §4.3 búsqueda en el listado actual, sin facetas automotriz; QA CAT-02 |
| CAT-023 | P1 | WEBIA §4.2 vacío honesto, sin ítems inventados; QA CAT-09 |

---

## Carrito + checkout Stripe (CHK)

| ID | P | Fuentes |
|----|---|---------|
| CHK-001 | P0 | WEBIA §4.5 `/carrito`, precios servidos; FLUJOS §5 |
| CHK-002 | P0 | WEBIA §4.6 `POST /api/checkout/session` `{ items: [{ product_id, quantity }] }`; FLUJOS §5 |
| CHK-003 | P0 | WEBIA §4.6 `channel=web`, `draft`, `line_focus=multiusos`; FLUJOS §5; D2 `draft` → webhook `confirmed` |
| CHK-004 | P0 | FLUJOS §5 pago HTTPS; SEGUR §1; STACK Checkout Session |
| CHK-005 | P0 | WEBIA §4.6 webhook → `confirmed` + `income_entries.kind=stripe`; FLUJOS §5; SEGUR §8; D2 |
| CHK-006 | P0 | WEBIA §4.7 `/pedido/exito`; FLUJOS §5; SEGUR §7–§8; QA CHK-04 |
| CHK-007 | P0 | FLUJOS §5 anti-tampering; SEGUR §7 ignora `unit_price` / `total` |
| CHK-008 | P0 | FLUJOS §5 ignora `is_automotive` del cliente; SCHEMA `is_automotive` nunca origen web |
| CHK-009 | P0 | WEBIA §4.6: si algún id falla el AND → 400, sin Session; QA CHK-02 |
| CHK-010 | P0 | FLUJOS §5; BRIEF exclusión automotriz; MAR-003 |
| CHK-011 | P0 | FLUJOS §5 cantidades > 0 |
| CHK-012 | P1 | WEBIA §4.5 cantidad 1–99 y máx. 20 líneas; QA CHK-03 |
| CHK-013 | P0 | FLUJOS §5 moneda forzada MXN; SCHEMA `orders.currency` |
| CHK-014 | P0 | FLUJOS §5; SEGUR §6: 5–10 / IP / 15 min, `429` + Retry-After, antes de Stripe/DB |
| CHK-015 | P0 | FLUJOS §5 la API pública no consulta `promos` |
| CHK-016 | P0 | FLUJOS §2 y §5 sin descuento de stock; SCHEMA sin inventario |
| CHK-017 | P0 | SCHEMA: anónimo sin SELECT/INSERT en `orders` / `order_items`; FLUJOS §5 |
| CHK-018 | P0 | STACK; SEGUR §3 y §5; FLUJOS §5 service role nunca en el cliente |
| CHK-019 | P0 | SEGUR §8 sin firma válida → no writes |
| CHK-020 | P0 | FLUJOS §5; SEGUR §8 idempotencia por `event.id` / session / payment intent |
| CHK-021 | P1 | SCHEMA checkout guest, sin rol cliente web; STACK límites Fase 1 |
| CHK-022 | P0 | SEGUR §1 callbacks solo `https://` |
| CHK-023 | P1 | WEBIA §4.7 `/pedido/cancelado` conserva el carrito; FLUJOS §5; QA CHK-10 |
| CHK-024 | P1 | WEBIA §4.5 y §10: no inventar flete; QA CHK-11 |
| CHK-025 | P1 | WEBIA §4.6 `is_express` no auto; D2 (sin fecha automática en checkout); QA CHK-08 |
| CHK-026 | P1 | WEBIA §4.6 / QA CHK-09 snapshot inmutable |

---

## Intake personalizados (PER)

| ID | P | Fuentes |
|----|---|---------|
| PER-001 | P0 | FLUJOS §3 INSERT `status = received`; SCHEMA `custom_requests`; NEC intake canónico |
| PER-002 | P0 | WEBIA §4.9 `/personalizados/enviado` + `wa.me` + folio; número del dueño (§10); QA FRM-08 |
| PER-003 | P0 | BRIEF decisión 4; FLUJOS §3 precio no fijo; PERS |
| PER-004 | P0 | FLUJOS §3 anticipo al convertir a pedido (`deposit_50`); BRIEF 50% |
| PER-005 | P0 | NEC «Obligatorios / fuertes»; SEGUR §7 — **gap** `coil_spacing` nullable en SCHEMA |
| PER-006 | P0 | NEC tipo tensión  /  compresión  /  torsión; SCHEMA `spring_type` |
| PER-007 | P0 | NEC unidad obligatoria pulgadas  /  mm; SCHEMA `unit` `in`  /  `mm` |
| PER-008 | P0 | SCHEMA contacto; SEGUR §7 contacto requerido |
| PER-009 | P0 | NEC punto 9 foto de muestra (SCHEMA path nullable: posible divergencia) |
| PER-010 | P0 | FLUJOS §3; SEGUR §9; SCHEMA bucket `custom-samples` |
| PER-011 | P1 | SEGUR §7 y §9 MIME/size allowlist — **valores no documentados** (gap) |
| PER-012 | P0 | FLUJOS §3; SEGUR §6: 5/IP/15 min y 3/teléfono/hora, `429`, antes de DB/Storage |
| PER-013 | P0 | FLUJOS §3 allowlist + WITH CHECK; SCHEMA; SEGUR aceptación 3 |
| PER-014 | P0 | FLUJOS §3 sin lectura pública del inbox; SCHEMA RLS |
| PER-015 | P0 | SEGUR §9; SCHEMA Storage; aceptación 4 |
| PER-016 | P0 | WEBIA §4.9 solo folio en el query; SEGUR R12; QA FRM-08 |
| PER-017 | P1 | BRIEF decisión 10; STACK idioma UI |
| PER-018 | P1 | WEBIA §4.8 recomendada, no bloquea; NEC punto 10; QA FRM-01 |
| PER-019 | P2 | SEGUR §7 rangos canónicos — **rangos no numerados** (gap) |
| PER-020 | P1 | SEGUR §7 longitud máxima en notes — **cifra no documentada** (gap) |
| PER-021 | P1 | NEC salida: paquete de datos → WhatsApp; PERS |

---

## Landing Fabricado express (EXP)

| ID | P | Fuentes |
|----|---|---------|
| EXP-001 | P0 | WEBIA §4.1 hero `/`; BRIEF definición operativa; QA LND-01 |
| EXP-002 | P0 | BRIEF cobertura nacional; NEC §A; BACK W1 |
| EXP-003 | P1 | BRIEF «clientes locales a veces en horas» |
| EXP-004 | P1 | BRIEF ubicación Colima; WEB SEO local |
| EXP-005 | P0 | BRIEF sin listados ni CTAs automotriz; decisión 1 |
| EXP-006 | P1 | BRIEF decisión 10; STACK idioma UI |
| EXP-007 | P1 | WEBIA §4.1 CTAs «Ver catálogo» / «Resorte a la medida» → `/catalogo` y `/personalizados` |
| EXP-008 | P1 | WEBIA §3 y §4.1 (bloques, header/footer, CTAs); QA LND-01/LND-02 |
| EXP-009 | P1 | BRIEF express depende de complejidad y cantidad; PERS lead time |

---

## SEO

| ID | P | Fuentes |
|----|---|---------|
| SEO-001 | P0 | BRIEF quiénes somos / productos públicos; WEB misión |
| SEO-002 | P1 | BRIEF ubicación; WEB «SEO local Colima» — implementación no documentada |
| SEO-003 | P1 | WEBIA §5 W6: landing cubre resortes + express + envíos México; keywords extra fuera de Fase 1 |
| SEO-004 | P0 | CATA §1 nunca en SEO; BRIEF decisión 1; WEB misión |
| SEO-005 | P1 | WEBIA §5 `lang="es-MX"`; BRIEF decisión 10; QA SEO-01 |
| SEO-006 | P2 | WEBIA §5 render servidor, title/canonical/OG; QA SEO-01 y SEO-04 |
| SEO-007 | P1 | WEBIA §10 dominio del dueño (W0); PREG; el baseline técnico se prueba en preview |
| SEO-008 | P0 | WEBIA §4.4 404 + noindex; CATA §1; QA CAT-03 / SEO-02 |
| SEO-009 | P0 | WEBIA §5 sitemap y robots.txt; QA SEO-02 |
| SEO-010 | P1 | WEBIA §5 y §4.4 JSON-LD Organization/LocalBusiness y Product/Offer; QA SEO-03 |

---

## Seguridad pública (SEG)

| ID | P | Fuentes |
|----|---|---------|
| SEG-001 | P0 | SEGUR §1 force HTTPS, redirect 301; checklist §10.1 |
| SEG-002 | P0 | SEGUR §1 HSTS `max-age` ≥ 15552000 |
| SEG-003 | P0 | SEGUR §1 mixed content, assets solo HTTPS |
| SEG-004 | P0 | SEGUR §1 callbacks Stripe (y Auth) solo `https://`; CHK-022 |
| SEG-005 | P1 | SEGUR §1 preview; §5 envs separados; R9 |
| SEG-006 | P0 | SEGUR §3 y §5; STACK; CHK-018 |
| SEG-007 | P0 | SEGUR §0 y §4; SCHEMA «Anónimo no ve» y pruebas de aceptación |
| SEG-008 | P0 | SEGUR §4 / §9; SCHEMA Storage; aceptación 4; PER-015 |
| SEG-009 | P0 | SEGUR §9; SCHEMA `product-images`; CAT-004, CAT-017 |
| SEG-010 | P0 | SEGUR §7 no almacenar PAN |
| SEG-011 | P1 | SEGUR §1 y §3 flag `Secure` en producción |
| SEG-012 | P0 | SEGUR §7; FLUJOS §3 y §5 allowlist / anti-tampering |
| SEG-013 | P0 | SEGUR §6 y checklist §10.6; CHK-014; PER-012 |
| SEG-014 | P0 | SEGUR / SCHEMA principio fail-closed |
| SEG-015 | P1 | WEBIA §4.10 y §10 rutas legales; copy del dueño no inventado; QA TRV-03 |

---

## Exclusiones de marca (MAR)

| ID | P | Fuentes |
|----|---|---------|
| MAR-001 | P0 | BRIEF mensaje central; skill QA Web; EXP-001 |
| MAR-002 | P0 | BRIEF decisión 1; FLUJOS §6; CATA §1; CAT-008 |
| MAR-003 | P0 | SEGUR / SCHEMA aceptación anónima; CHK-010 |
| MAR-004 | P0 | CATA §1 nunca en SEO; SEO-004, SEO-008 |
| MAR-005 | P0 | BRIEF sin CTAs automotriz; EXP-005 |
| MAR-006 | P0 | BRIEF decisión 6; BACK F2; CAT-012, CAT-013, CHK-015 |
| MAR-007 | P0 | BRIEF no stock al público; CAT-011, CHK-016 |
| MAR-008 | P0 | BRIEF / CATA: automotriz solo interna, no mezclar con listados públicos |
| MAR-009 | P1 | BRIEF decisión 10; STACK idioma UI |

---

## Bloqueantes y gaps (para QA Web y Gerente Web)

Estos puntos los debe comunicar **Tester Web** a **QA Web** y, si bloquean el plan o la salida, a **Gerente Web**. No se resolvieron inventando un flujo o una cifra.

| ID | Bloqueante / gap | Impacto en pruebas | Dueño sugerido | ¿Bloquea las matrices? | ¿Bloquea ejecutar cuando haya app? |
|----|------------------|--------------------|----------------|------------------------|-------------------------------------|
| G1 | **`WEB_IA.md` es borrador** (Gerente Web, 2026-11-11), sin OK del dueño ni código. Ya no está ausente. | Las rutas y contratos de las §§2–4 ya se usan aquí. Un cambio del borrador obliga a actualizar matrices y el cruce con §11. | Gerente Web / CEO / dueño | No | No para preparar; **sí** para go-live hasta el OK de implementación (§10). |
| G2 | **Tarifas de envío nacional** no fijadas. WEB_IA §4.5 y §10 prohíben inventar flete. | CHK-024 verifica la ausencia de un cargo inventado. No hay casos de montos de paquetería. | Dueño / CEO (Web comunica) | No | No, mientras no se invente flete. El “cómo se muestra el flete en Stripe” queda bloqueado hasta la tarifa real. |
| G3 | **Número de WhatsApp de negocio** no entregado (WEB_IA §10). Copy final de handoff lo puede afinar Personalizados (§11.8). | El form y el INSERT (PER-001, etc.) sí se pueden probar. PER-002/016: el CTA real `wa.me` queda pendiente; se prueba el formato (solo folio) cuando haya número de prueba no productivo. | Dueño / Gerente Web + Personalizados | No | Parcial: alta sí, CTA real no. |
| G4 | **Estados de pedido:** WEB_IA y D2_ESTADOS documentan `draft` → (webhook) `confirmed`. FLUJOS aún los llama provisionales hasta cierre formal de D2. | CHK-003/005 usan `draft` / `confirmed`. Si D2 cerrara otro nombre, anotar el valor real, no fallar un rename acordado. | Gerente Pedidos | No | Parcial. |
| G5 | **Dominio y DNS** pendientes del dueño (W0, PREG, WEB_IA §10). | SEG-001/002 en producción real y SEO-007 (go-live de dominio) bloqueados. El baseline SEO técnico **sí** se prueba en preview (SEO-005, SEO-006, SEO-009, SEO-010). | Dueño / CEO; DevOps Web | No | **Sí** para prod real. Preview HTTPS con env separado (SEG-005). |
| G6 | **Excel de catálogos (~105 y ~56) no entregados** (D1). | Recuento exacto no es criterio de pass. **Prohibido inventar precios, nombres o medidas.** Usar fixtures sintéticos (WEB_IA §11 y QA). | Dueño → Catálogo | No | Parcial. |
| G7 | **Fotos en proceso** (C1b). Publicar exige ≥1 foto editada. | CAT-004, CAT-016, CAT-023; W2 de ítems reales. | Catálogo + Web | No | Parcial. |
| G8 | **Cerrado en WEB_IA:** tope de carrito = cantidad **1–99** y máx. **20 líneas**. | CHK-012 ya no está bloqueado por cifra. | — | — | Ejecutable cuando haya app. |
| G9 | **Rate limit de Checkout** sigue siendo el rango **5–10** / IP / 15 min. | CHK-014 verifica el rango y `429` + Retry-After. | Web + Seguridad (fijar el entero en implementación) | No | Parcial: hace falta un valor configurado **dentro del rango**. |
| G10 | **Allowlist MIME/tamaño** de samples no numerada. | PER-011 bloqueado. WEB_IA §11.8: reglas finas de fotos → Personalizados. | Personalizados + Seguridad + Web | No | **Sí** para PER-011. |
| G11 | **Rangos numéricos** del intake no numerados (SEGUR y WEB_IA §4.8 piden validarlos en servidor). | PER-019 bloqueado. | Personalizados + Web | No | **Sí** para PER-019. |
| G12 | **Longitud máxima de `contact_notes`** no numerada. | PER-020 bloqueado. | Web + Seguridad + Personalizados | No | **Sí** para PER-020. |
| G13 | **Keywords extra / landings adicionales** fuera de Fase 1 (WEB_IA §5). | SEO-003 cubre solo lo escrito (resortes + express + envíos México en `/`). No inventar un set de keywords. | PM Web, después de Fase 1 | No | No, si no se exige lo no documentado. |
| G14 | **Textos legales finales** (razón social, RFC, responsable) los entrega el dueño. | SEG-015: las rutas deben existir; no se inventa el copy fiscal. | Dueño / CEO (§10) | No | Parcial: rutas sí, texto final no. |
| G15 | **Divergencia posible en intake:** SCHEMA deja `coil_spacing` y `sample_image_path` nullable; NEC y WEB_IA §4.8 los tratan como obligatorios / fuertes (la foto con medidor no bloquea). | PER-005 y PER-009: probar la regla de WEB_IA/NEC y reportar si el backend acepta nulos. | Personalizados + Sistema | No | Parcial. |
| G16 | **Normalización del teléfono** (rate limit 3/hora) no especificada. | PER-012 subcaso teléfono: anotar el criterio usado. | Personalizados + Web + Seguridad | No | Parcial. |
| G17 | **Políticas SQL RLS + tests `anon` + firma de Seguridad** pendientes. Gate: no PII ni datos productivos (SEGUR / SCHEMA / WEB_IA §11). | SEG-007 a SEG-009, SEG-014, lecturas anónimas. | Sistema (SQL) + Seguridad (firma) | No | **Sí** contra datos reales. Fixtures sintéticos, coordinar el gate. |
| G18 | QA Web **entregó plan** en WEB_IA §11 (orden, evidencia, regresión mínima, gate §11.7). Este paquete es el desglose operativo. | Tester ejecuta §11 usando estas matrices. El «listo» lo cierra QA con el gate del §11.7, no un pass informal. | QA Web / Gerente Web | No | El Tester no declara «listo» por su cuenta. |
| G19 | **Evidencia interna.** Pedidos, `income_entries` y `custom_requests` no son legibles por el anónimo. | Protocolo con Sistema/admin, sin PII completa (WEB_IA §11.6). | QA Web + Gerente Sistema / Gerente Web | No | Parcial sin ese apoyo (CHK-003/005/017, PER-001/013/014, SEG-010). |

### Prioridad de comunicación (sugerida)

1. **G1 + OK del dueño** — el borrador WEB_IA y el plan §11 ya existen; falta autorización para implementar y, con ello, para ejecutar.
2. **G17 + G19** — gate de Seguridad y protocolo de evidencia interna.
3. **G5 + G3 + G6 + G7 + G14** — dominio, WhatsApp, Excel, fotos y textos legales (inputs del dueño).
4. **G9–G12, G15, G16** — cifras finas (rate limit entero, MIME, rangos, notas, normalización).
5. **G2, G4, G13** — flete, cierre formal D2, keywords extra (fuera de Fase 1).

---

## Inventario final de IDs

| Flujo | Archivo | Casos | P0 | P1 | P2 |
|-------|---------|------:|---:|---:|---:|
| CAT | [`matriz-01-catalogo-publico.md`](matriz-01-catalogo-publico.md) | 23 | 13 | 7 | 3 |
| CHK | [`matriz-02-carrito-checkout-stripe.md`](matriz-02-carrito-checkout-stripe.md) | 26 | 20 | 6 | 0 |
| PER | [`matriz-03-intake-personalizados.md`](matriz-03-intake-personalizados.md) | 21 | 15 | 5 | 1 |
| EXP | [`matriz-04-landing-express.md`](matriz-04-landing-express.md) | 9 | 3 | 6 | 0 |
| SEO | [`matriz-05-seo.md`](matriz-05-seo.md) | 10 | 4 | 5 | 1 |
| SEG | [`matriz-06-seguridad-publica.md`](matriz-06-seguridad-publica.md) | 15 | 12 | 3 | 0 |
| MAR | [`matriz-07-exclusiones-marca.md`](matriz-07-exclusiones-marca.md) | 9 | 8 | 1 | 0 |
| **Total** | | **113** | **75** | **33** | **5** |
