# Organigrama digital — Resortes Colima

Fuente de verdad de departamentos, gerentes y equipos de agentes.

## Cadena de mando

**Dueño (humano) → CEO → Gerente de departamento → roles del equipo**

- El CEO prioriza, fija alcance y delega a gerentes.
- Los gerentes coordinan su equipo; no cambian prioridades de negocio sin el CEO.
- El CEO no habla directo con roles de equipo salvo emergencia; pasa por el gerente.
- Staffing: **equipo = lo necesario, ni más**. Altas/bajas de roles las aprueba el CEO; el gerente propone.

## Vista rápida

| Departamento | Gerente | Equipo | Ficha |
|--------------|---------|--------|-------|
| Catálogo | Gerente Catálogo | Data Catálogo | [catalogo.md](depts/catalogo.md) |
| Pedidos | Gerente Pedidos | Ops Pedidos | [pedidos.md](depts/pedidos.md) |
| Personalizados | Gerente Personalizados | Intake Personalizados | [personalizados.md](depts/personalizados.md) |
| Finanzas | Gerente Finanzas | Analista Cobranza | [finanzas.md](depts/finanzas.md) |
| Web | Gerente Web | PM, Dev senior, DevOps, QA, Tester | [web.md](depts/web.md) |
| Sistema interno | Gerente Sistema | PM, Dev senior, DevOps, QA, Tester | [sistema-interno.md](depts/sistema-interno.md) |
| Seguridad | Gerente Seguridad | Security Engineer, Security Reviewer | [seguridad.md](depts/seguridad.md) |

## RACI corto (digitalización)

| Tema | Dueño | CEO | Gerente depto | Equipo |
|------|-------|-----|---------------|--------|
| Prioridad de negocio | A | R | C | I |
| Alcance de un depto | A | A | R | C |
| Entrega técnica (web/sistema) | I | A | R | R |
| Seguridad / authz | I | A | R (Seguridad) | C/R |
| Promoción automotriz | A (veto) | R (bloquear) | R | I |

A = Accountable, R = Responsible, C = Consulted, I = Informed.

## Materialización en Cursor

| Artefacto | Ubicación |
|-----------|-----------|
| Rule CEO (always) | [`.cursor/rules/ceo.mdc`](../../.cursor/rules/ceo.mdc) |
| Rule seguridad proyecto | [`.cursor/rules/seguridad.mdc`](../../.cursor/rules/seguridad.mdc) |
| Skills gerentes / roles | [`.cursor/skills/`](../../.cursor/skills/) |
| Brief de negocio | [`docs/negocio/BRIEF.md`](../negocio/BRIEF.md) |
| **Guía de despacho (dueño)** | [`GUIA_DESPACHO.md`](GUIA_DESPACHO.md) |

## Cómo delegar

1. Dueño pregunta al CEO “qué sigue / con quién hablo”.
2. CEO indica departamento + pedido (ver [`GUIA_DESPACHO.md`](GUIA_DESPACHO.md)).
3. Dueño abre **chat nuevo** con el gerente (`gerente-*`).
4. El gerente usa su roster; no cambia prioridades de negocio.
5. Dueño vuelve al CEO para el siguiente despacho.
