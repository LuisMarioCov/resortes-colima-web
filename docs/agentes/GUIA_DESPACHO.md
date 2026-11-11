# Guía de despacho — Dueño → CEO → Departamento

El **CEO** no hace el trabajo de todos los deptos. Te dice **con quién hablar** y **qué pedir**.

## Cómo abrir un departamento (bot)

1. Chat nuevo en Cursor (Agent).
2. Primer mensaje (copiar/pegar y ajustar):

```text
Actúa como Gerente de [DEPARTAMENTO].
Lee docs/negocio/BRIEF.md, docs/agentes/ORG.md y docs/agentes/depts/[dept].md.
Usa el skill gerente-[nombre].
No cambies prioridades de negocio; escala al CEO si hace falta.
Pedido: [lo que el CEO te indicó].
```

3. El gerente usa su equipo (skills de rol). Vos pedís al gerente, no al QA/Dev directo salvo que el gerente lo derive.

## ¿Con quién hablo si quiero…?

| Quiero… | Departamento | Skill gerente |
|---------|--------------|--------------|
| Saber qué sigue / prioridades | **CEO** (este chat) | rule `ceo` |
| Schema, admin `/admin`, scaffold Next+Supabase, pedidos internos | **Sistema interno** | `gerente-sistema-interno` |
| Landing, SEO, catálogo web, checkout UX, form web | **Web** | `gerente-web` |
| Auth, RLS, secretos, rate limit, revisión segura | **Seguridad** | `gerente-seguridad` |
| Productos, promos (ocultas), fotos, Excel catálogo | **Catálogo** | `gerente-catalogo` |
| Estados express, canales WA/tel/mostrador/web | **Pedidos** | `gerente-pedidos` |
| Intake personalizados → WhatsApp | **Personalizados** | `gerente-personalizados` |
| Ingresos/egresos, Stripe dinero, vínculo Kubox | **Finanzas** | `gerente-finanzas` |

## Fase 1 — orden de conversaciones

| # | Con quién | Qué pedirle |
|---|-----------|-------------|
| 0 | CEO | Guía |
| 1 | Sistema interno | **Hecho** — STACK, SCHEMA, ADMIN_IA, borrador FLUJOS |
| **2 (AHORA)** | **Seguridad** | `SEGURIDAD.md` + aprobar RLS/auth/secretos/rate-limit sobre docs de Sistema |
| 3 | Web | `WEB_IA.md` + flujos públicos |
| 4 | Catálogo → Pedidos → Personalizados → Finanzas | Validar SCHEMA/FLUJOS |
| 5 | CEO | Gate docs → implementación |
| 6+ | Depto dueño de cada slice | Implementar |

Stack fijado (no negociar en deptos): Next.js, Supabase, Vercel, Stripe Checkout, Kubox vínculo manual.

## Texto listo — paso 2 (Seguridad) ← pegar ahora

```text
Actúa como Gerente de Seguridad.
Lee docs/negocio/BRIEF.md, docs/agentes/depts/seguridad.md,
docs/arquitectura/STACK.md, docs/arquitectura/SCHEMA.md,
docs/arquitectura/ADMIN_IA.md, docs/arquitectura/FLUJOS.md
y .cursor/rules/seguridad.mdc.
Usa el skill gerente-seguridad. Delegá revisión a security-engineer / security-reviewer si hace falta.
Pedido del CEO / dueño:
1) Crear docs/arquitectura/SEGURIDAD.md con controles obligatorios: HTTPS, Auth Supabase, hash/sesiones, RLS fail-closed, secretos fuera del repo, rate limit en APIs públicas (checkout, form personalizados), validación de inputs, Stripe webhook firmado, storage (público solo fotos catálogo web).
2) Revisar SCHEMA.md y FLUJOS.md: aprobar o listar hallazgos concretos (qué falta en RLS, roles owner/encargado, qué no debe ver el anónimo: automotriz, promos, clientes, finanzas).
3) No reabrir el stack. No implementes código aún.
4) Al final: veredicto explícito APROBADO / APROBADO CON CAMBIOS / BLOQUEADO, con lista de cambios que Sistema debe aplicar.
```

## Texto listo — paso 1 (Sistema interno) — ya usado

```text
Actúa como Gerente de Sistema interno.
… (completado: STACK.md, SCHEMA.md, ADMIN_IA.md, FLUJOS.md)
```
