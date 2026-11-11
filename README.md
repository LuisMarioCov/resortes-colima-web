# resortes-colima-web

Sitio **público** de **Resortes Colima** (Colima, México): Next.js App Router, catálogo (RSC + RLS), carrito, Stripe Checkout, webhook e intake de personalizados.

El **panel `/admin`** y el CRUD interno viven en el repositorio hermano **`resortes-colima-app`**, compartiendo el **mismo proyecto Supabase**.

## Documentación

Reglas de negocio y arquitectura en [`docs/`](docs/), en especial:

- [`docs/negocio/BRIEF.md`](docs/negocio/BRIEF.md)
- [`docs/arquitectura/WEB_IA.md`](docs/arquitectura/WEB_IA.md), [`SCHEMA.md`](docs/arquitectura/SCHEMA.md), [`SEGURIDAD.md`](docs/arquitectura/SEGURIDAD.md), [`FLUJOS.md`](docs/arquitectura/FLUJOS.md), [`CATALOGO.md`](docs/arquitectura/CATALOGO.md)

## Requisitos

- Node.js 20+
- npm
- Supabase CLI + Docker (opcional, para Postgres local y `npm run test:rls`)

## Configuración local

```bash
cp .env.example .env.local
# Completa URL/anon de Supabase, Stripe y opcional WhatsApp
npm install
npm run dev -- -p 43123
```

Con Supabase local:

```bash
npx supabase start
npx supabase db reset
```

Copia las claves del CLI a `.env.local` (nunca commitees secretos).

## Verificación

```bash
node --experimental-strip-types scripts/test-shipping.mjs
npm run build
```

Tests RLS (con DB local):

```bash
npm run test:rls
```

## Rutas principales

| Ruta | Uso |
|------|-----|
| `app/(public)/*` | Landing, catálogo, carrito, personalizados, legales |
| `app/api/cart/preview` | Precios en servidor |
| `app/api/checkout/session` | Crea Stripe Session; **no** inserta pedidos |
| `app/api/webhooks/stripe` | Persistencia con service role + idempotencia |
| `supabase/` | Copia local; ver [`supabase/README.md`](supabase/README.md) |

## Secretos

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` son **solo servidor** (sin `NEXT_PUBLIC_`).
