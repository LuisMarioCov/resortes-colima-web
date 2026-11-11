# Stack — Fase 1 (fijado)

Estado: **fijado por CEO / dueño**. No reabrir en departamentos. Cualquier propuesta de cambio → **escalar al CEO**.

## Decisión

| Capa | Tecnología | Rol |
|------|------------|-----|
| App | **Next.js** (App Router) | App única: sitio público + panel `/admin` |
| Datos / auth | **Supabase** (Postgres + Auth + Storage + RLS) | Fuente de verdad; auth remoto; políticas fail-closed |
| Hosting | **Vercel** | Deploy HTTPS; bind a `PORT` vía plataforma |
| Pagos web | **Stripe** (Checkout Session en Fase 1) | Cierre online de catálogo; webhooks → ingresos |
| CFDI | **Kubox** (fuera de stack de código) | Timbrado manual; solo vínculo/referencia en DB ([`KUBOX.md`](../discovery/KUBOX.md)) |

## Forma de la aplicación

```text
resortes-colima (repo / app única)
├── app/                    # Next.js App Router
│   ├── (public)/           # SEO, landing, catálogo, checkout, form personalizados
│   ├── admin/              # Sistema interno (auth requerido)
│   ├── api/                # Route Handlers (Stripe webhook, rate-limited public APIs)
│   └── ...
├── lib/                    # clientes Supabase, Stripe, validación
└── ...
```

- **Una app, dos superficies:** rutas públicas + `/admin/*`.
- **Sin stock/inventario** en MVP (ni tablas ni UI).
- **Idioma UI:** español (MX).
- **Nube + acceso remoto** desde día 1 (dueños + encargado).

## Responsabilidades por pieza

### Next.js (App Router)

- Render público (SEO) y UI admin.
- Server Actions / Route Handlers para mutaciones con validación de inputs.
- Middleware: sesión, protección de `/admin`, redirects HTTPS en producción.
- No secretos en cliente: solo clave pública Supabase / Stripe publishable donde corresponda.

### Supabase

- **Postgres:** schema Fase 1 ([`SCHEMA.md`](SCHEMA.md)).
- **Auth:** email/password (o magic link según Seguridad); roles en `profiles`.
- **RLS:** fail-closed; solo `owner` / `manager` (encargado) en admin; lectura pública acotada a catálogo vendible.
- **Storage:** fotos de producto y adjuntos (muestra personalizados, PDF/XML CFDI); buckets con políticas.
- **Service role:** solo servidor (webhooks, jobs); nunca en repo ni en cliente.

### Vercel

- Deploy de la app Next.js.
- Variables de entorno (Stripe secret, Supabase service role, webhook secrets) fuera de git.
- HTTPS obligatorio; preview vs production.

### Stripe

- **Checkout Session** para pedidos de catálogo web.
- Webhook firmado → crea/actualiza `orders` + `income_entries` (fuente Stripe).
- No reemplaza notas de efectivo ni anticipos registrados a mano en admin.

### Kubox (fuera de código)

- Emisor CFDI actual.
- Sin API pública → flujo: timbrar en Kubox → pegar UUID/folio/estado (+ adjunto opcional) en `cfdi_links`.

## Clientes Supabase (patrón)

| Cliente | Dónde | Uso |
|---------|-------|-----|
| Anon + sesión usuario | Browser / RSC con cookie | Lectura pública; mutaciones admin bajo RLS |
| Service role | Solo Route Handlers / server | Webhooks Stripe, tareas privilegiadas; nunca expuesto |

Cookies de sesión: HttpOnly, Secure, SameSite (detalle en doc Seguridad).

## Límites Fase 1 (explícitos)

| Incluido | Excluido |
|----------|----------|
| App única pública + `/admin` | Apps separadas web vs admin |
| Catálogo maestro + e-commerce multiusos | Inventario / stock |
| Promos en datos (`visible_web = false`) | Promos en UI pública |
| Automotriz solo en admin | Automotriz en web |
| Stripe Checkout catálogo | Conciliación bancaria avanzada |
| Vínculo manual Kubox | Scraper / API no oficial Kubox |
| Roles dueño + encargado | Portal cliente self-service |

## Documentos relacionados

| Doc | Dueño depto | Estado |
|-----|-------------|--------|
| [`SCHEMA.md`](SCHEMA.md) | Sistema (+ validación Catálogo/Pedidos/Finanzas) | Borrador Sistema |
| [`ADMIN_IA.md`](ADMIN_IA.md) | Sistema | Borrador Sistema |
| [`FLUJOS.md`](FLUJOS.md) | Sistema (admin); Web (público, hecho); Finanzas (reglas finas en propuesta) | Público completo ([`WEB_IA.md`](WEB_IA.md) + §3/§5); admin borrador Sistema |
| [`SEGURIDAD.md`](SEGURIDAD.md) | Seguridad | Controles Fase 1 (Gerente Seguridad); gate RLS antes de datos reales |
| [`WEB_IA.md`](WEB_IA.md) | Web | Borrador Web Fase 1 (listo para OK del dueño) |

## Escalación

Cualquier pedido de cambiar Next.js, Supabase, Vercel, Stripe, o de partir en dos apps / local-only → **no negociar en depto**; escalar al **CEO**.
