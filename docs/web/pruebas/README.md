# Matrices de prueba — Web pública (Fase 1, pre-app)

Estado: **preparación**. Aún no hay aplicación. QA Web ya publicó el plan oficial en `WEB_IA.md` §11; estas matrices son el desglose ejecutable de ese plan y quedan listas para correrse cuando exista el sitio.

Departamento: **Web**. Rol que ejecuta: **Tester Web**. Revisión: **QA Web**. Escalación: **Gerente Web**.

Idioma de UI y de esta documentación: **español (MX)**.

---

## Qué es (y qué no es) este paquete

| Es | No es |
|----|-------|
| Matrices de la **superficie pública** documentada | Ejecución contra un sitio (no hay app) |
| Casos felices, negativos, de límite, seguridad defensiva, SEO y marca | Evidencia de pass/fail (aún no aplica) |
| Una base para el plan de QA Web | Un plan de QA ya firmado |
| Alcance acotado a lo escrito en las fuentes de verdad | Flujos inventados o criterios no documentados |

No se implementó código de producto. No se cubren auth admin, pedidos internos, finanzas admin, CFDI, egresos ni la línea automotriz en el sistema interno (solo la **exclusión** de automotriz en la web).

---

## Fuente de verdad

Si un caso choca con un documento, **gana la fuente**; no el supuesto del tester. Orden práctico:

1. [`docs/negocio/BRIEF.md`](../../negocio/BRIEF.md) — identidad, líneas, Fabricado express, exclusiones de marca.
2. [`docs/arquitectura/FLUJOS.md`](../../arquitectura/FLUJOS.md) — §3 intake personalizados → WhatsApp; §5 stub catálogo + Stripe; §6 catálogo maestro → web pública. El resto del doc es admin/sistema: fuera de estas matrices.
3. [`docs/discovery/NECESIDADES.md`](../../discovery/NECESIDADES.md) — sección A (sitio público) e intake canónico.
4. [`docs/discovery/BACKLOG.md`](../../discovery/BACKLOG.md) — épicas W0–W6.
5. [`docs/arquitectura/SCHEMA.md`](../../arquitectura/SCHEMA.md) y [`docs/arquitectura/CATALOGO.md`](../../arquitectura/CATALOGO.md) — flags `visible_web`, línea automotriz, productos, `custom_requests`, regla AND de publicación.
6. [`docs/arquitectura/SEGURIDAD.md`](../../arquitectura/SEGURIDAD.md) — solo controles de la superficie pública (HTTPS, rate limit, formularios, RLS anónimo, webhook, Storage).
7. [`docs/arquitectura/STACK.md`](../../arquitectura/STACK.md) — Next.js App Router, Stripe Checkout Session, Vercel, Supabase.
8. Fichas [`docs/agentes/depts/web.md`](../../agentes/depts/web.md) y [`docs/agentes/depts/personalizados.md`](../../agentes/depts/personalizados.md).
9. [`docs/arquitectura/WEB_IA.md`](../../arquitectura/WEB_IA.md) — **borrador Gerente Web** (2026-11-11, America/Mexico_City): mapa de rutas, pantallas, contratos de API, SEO técnico y **plan de pruebas de QA Web (§11)**. Complementa, no sustituye, BRIEF / FLUJOS / SEGURIDAD / CATALOGO.

Relación con el plan de QA (§11 de `WEB_IA.md`): ese plan es el **gate y la suite oficial** (IDs CAT-01, CHK-01, FRM-01, LND-01, SEO-01, HTTPS-01, TRV-01; severidad bloqueante / mayor / menor). **Estas matrices lo desglosan** en casos ejecutables para Tester Web (IDs CAT-001, CHK-001, PER-001, etc.), con pasos, fixtures y negativos. El cruce de IDs está en [`TRAZABILIDAD.md`](TRAZABILIDAD.md). Si un caso de esta carpeta y el §11 divergieran, **ganan WEB_IA + las fuentes de negocio/arquitectura**; se actualiza la matriz.

Donde aún falta un valor (allowlist MIME, rangos numéricos, longitud de notas, keywords extra, número de WhatsApp, tarifas de envío, textos legales), el caso lo marca como **gap** y no inventa el detalle.

Lista de gaps y bloqueantes: [`TRAZABILIDAD.md`](TRAZABILIDAD.md).

---

## Cómo usar las matrices cuando exista la app

1. QA Web ya publicó el plan en `WEB_IA.md` §11 (entorno sintético, evidencia, orden de ejecución, regresión mínima y gate de «listo»). Tester Web ejecuta ese plan usando **estas matrices** como desglose de pasos y casos negativos/límite. La prioridad P0 de este paquete corresponde a los casos **bloqueantes** del §11; P1 ≈ mayor; P2 ≈ menor.
2. Tester Web ejecuta caso por caso y registra **pass** o **fail** con **evidencia** en la columna de estado (o en el registro que defina QA).
3. **No marcar pass si hay bugs conocidos** en ese caso (skill Tester Web y QA Web: bloquear “listo” con fallos conocidos).
4. Un caso **bloqueado** (falta dato, falta flujo en `WEB_IA.md`, entorno caído, dependencia de Catálogo) no es pass: se reporta como bloqueante.
5. Varios resultados (pedido confirmado, `income_entries`, fila de `custom_requests`) **no son visibles para el anónimo** por diseño. Se verifican con apoyo de Sistema / admin / logs de servidor, sin adjuntar PII completa en tickets.
6. Los casos de seguridad son **checks defensivos del comportamiento esperado** (HTTPS, 429, rechazo de payload inválido, RLS anónimo). No son procedimientos de ataque ni pruebas de explotación.
7. Al cerrar una corrida, Tester Web entrega evidencias a QA Web. QA Web revisa y, si hay bloqueantes o fallos P0, escala a **Gerente Web**.

### Convención de estado

| Estado | Cuándo |
|--------|--------|
| Pendiente — sin app | Estado actual de todos los casos |
| Bloqueado | Hay app o plan, pero falta un input (WEB_IA, datos, entorno) |
| Pass | Ejecutado; resultado esperado cumplido; evidencia adjuntada; sin bugs conocidos en el caso |
| Fail | Desviación documentada con evidencia |

### Prioridad

| Prioridad | Significado en este paquete |
|-----------|-----------------------------|
| **P0** | Bloquea salida pública: marca (express visible; sin automotriz; sin promos ni stock en UI), pago Stripe, reglas de visibilidad, seguridad contractual (HTTPS, firma de webhook, anti-tampering, RLS anónimo, rate limit de APIs públicas) |
| **P1** | Importante para aceptación, pero depende de detalle Web aún incompleto o no rompe solo la exclusión de marca |
| **P2** | Límite, regresión fina o criterio aún no cerrado en docs |

### Tipos

`feliz` · `negativo` · `límite` · `regresión` · `seguridad` · `SEO` · `marca`

Un caso puede llevar un tipo principal y una nota de cruce (por ejemplo, seguridad + marca).

### IDs

| Prefijo | Flujo | Archivo |
|---------|-------|---------|
| CAT | Catálogo público multiusos | [`matriz-01-catalogo-publico.md`](matriz-01-catalogo-publico.md) |
| CHK | Carrito + checkout Stripe (stub FLUJOS §5) | [`matriz-02-carrito-checkout-stripe.md`](matriz-02-carrito-checkout-stripe.md) |
| PER | Intake personalizados → WhatsApp | [`matriz-03-intake-personalizados.md`](matriz-03-intake-personalizados.md) |
| EXP | Landing Fabricado express + envíos nacionales | [`matriz-04-landing-express.md`](matriz-04-landing-express.md) |
| SEO | SEO local Colima y nacional de resortes | [`matriz-05-seo.md`](matriz-05-seo.md) |
| SEG | Seguridad de la superficie pública | [`matriz-06-seguridad-publica.md`](matriz-06-seguridad-publica.md) |
| MAR | Exclusiones de marca (suite P0) | [`matriz-07-exclusiones-marca.md`](matriz-07-exclusiones-marca.md) |

La trazabilidad caso ↔ fuente está en [`TRAZABILIDAD.md`](TRAZABILIDAD.md).

---

## Inventario de casos (preparados, no ejecutados)

| Flujo | Casos | P0 | P1 | P2 |
|-------|------:|---:|---:|---:|
| Catálogo público (CAT) | 23 | 13 | 7 | 3 |
| Carrito + checkout Stripe (CHK) | 26 | 20 | 6 | 0 |
| Intake personalizados (PER) | 21 | 15 | 5 | 1 |
| Landing Fabricado express (EXP) | 9 | 3 | 6 | 0 |
| SEO (SEO) | 10 | 4 | 5 | 1 |
| Seguridad pública (SEG) | 15 | 12 | 3 | 0 |
| Exclusiones de marca (MAR) | 9 | 8 | 1 | 0 |
| **Total de IDs** | **113** | **75** | **33** | **5** |

Algunos P0 de SEG/MAR se cruzan con CAT/CHK/PER (mismo requisito, otra suite de ejecución). No se duplicó el ID: la suite de seguridad o de marca apunta al caso canónico cuando el detalle vive en otra matriz.

---

## Gaps que Tester Web debe comunicar a QA Web y Gerente Web

Resumen (detalle y dueños en [`TRAZABILIDAD.md`](TRAZABILIDAD.md)):

1. **`WEB_IA.md` es borrador** (Gerente Web, 2026-11-11), aún sin OK del dueño ni código. Las rutas y contratos de las §§2–4 ya se usan en estas matrices. No está «ausente».
2. **Checkout y form ya tienen UX documentada** en WEB_IA §§4.5–4.9 (ya no son un stub ciego): `/carrito`, `POST /api/checkout/session`, `/pedido/exito`, `/pedido/cancelado`, `/personalizados`, `/personalizados/enviado`, deep link `wa.me` con folio. Siguen pendientes el **número de WhatsApp del dueño**, el copy final de Personalizados y las **tarifas de envío** (no inventar flete).
3. **Estados de pedido:** WEB_IA y [`D2_ESTADOS.md`](../../discovery/D2_ESTADOS.md) documentan `draft` → (webhook) `confirmed` para catálogo web. FLUJOS aún los menciona como provisionales hasta cierre formal de D2: anotar el valor real al ejecutar.
4. **Dominio y redes por crear** (W0, PREGUNTAS_ABIERTAS, WEB_IA §10). Baseline SEO en producción real bloqueado; el baseline técnico (sitemap, robots, titles, `lang="es-MX"`, JSON-LD) **sí** está escrito y se prueba en preview.
5. **Excel de los dos catálogos (~105 y ~56) aún no entregados** (D1). Pruebas con **fixtures sintéticos**. **Prohibido inventar precios, nombres o medidas** de negocio.
6. **Fotos en proceso** (C1b). Publicar exige ≥1 foto editada.
7. Valores aún no numerados: rate limit de checkout dentro de **5–10**, **allowlist MIME/tamaño**, **rangos** de medidas, **longitud máxima** de notas. El tope de carrito **ya está fijado** en WEB_IA §4.5: cantidad 1–99 y máx. 20 líneas.
8. **Keywords extra / landings adicionales:** WEB_IA §5 deja la landing con «resortes» + express + envíos México; no inventar un listado de keywords ni blog en Fase 1.
9. Políticas SQL RLS + tests `anon` + firma de Seguridad: **pendientes** (gate antes de datos reales).
10. QA Web **sí entregó plan** en WEB_IA §11. Este paquete lo expande; no lo sustituye. El gate de «listo» es el del §11.7.

---

## Fuera de alcance (no probar aquí)

- Login `/admin`, roles owner/manager, rate limit de login admin.
- Pedidos de WhatsApp, teléfono o mostrador creados en admin.
- Módulos de ingresos/egresos/CFDI en admin (salvo verificar, con apoyo interno, el efecto del webhook: `income_entries.kind = stripe`).
- Línea automotriz **dentro** del sistema interno (sí se prueba que **nunca** sale a la web).
- Inventario/stock (no existe en MVP; solo se prueba que **no aparece** en la UI pública).
- Promos visibles (épica F2, solo si el dueño las activa).
- Portal de cliente con login, WhatsApp Business API formal, redes sociales.
