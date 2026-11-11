# Resortes Colima — Brief de negocio

Fuente canónica de identidad. Si hay duda de alcance o mensaje, gana este documento (y el dueño humano).

## Quiénes somos

- **Empresa:** Resortes Colima
- **Ubicación:** Colima, Colima, México
- **Actividad:** fabricación de resortes
- **Diferenciador:** Fabricado express (días u horas vs semanas de la competencia)
- **Cobertura:** envíos a toda la República Mexicana; clientes locales a veces en horas

## Líneas de negocio

| Línea | Estado | Notas |
|-------|--------|-------|
| Resortes multiusos (catálogo) | Activa y promocionable | Dos catálogos (~105 y ~56); precios públicos + promos; venta online objetivo |
| Resortes personalizados | Activa y promocionable | Cotización dinámica vía WhatsApp; 50% anticipo; muestra y/o medidas |
| Resortes automotrices | Solo clientes existentes | **No promocionar** en web/marketing; **sí** en sistema interno (visible, no línea principal); no captar clientes nuevos de esta línea |

## Qué somos / qué no somos

**Somos**

- Fabricantes con respuesta mucho más rápida que el mercado
- Catálogo multiusos + réplica a medida
- Operación hoy: WhatsApp, teléfono, mostrador; Excel + papel; CFDI en Kubox
- Digitalización: web con SEO fuerte + e-commerce de catálogo + sistema interno en **nube** (acceso remoto)

**No somos (en canales digitales)**

- Una marca enfocada en automotriz / captación nueva de automotriz
- Un sistema que muestre stock al público (stock existe; **no usar/mostrar** por ahora)
- Un proyecto local-only (preferencia explícita: nube + remoto)

## Fabricado express (definición operativa)

Depende de complejidad y cantidad. Mientras otros tardan semanas, Resortes Colima entrega en **días**; si el cliente es local y el trabajo es acotado, a veces en **horas**. Siempre con la promesa de entregar mucho antes que la competencia. Envíos nacionales.

## Productos públicos (web)

- Catálogo multiusos navegable y **vendible online** (ambos listados)
- Precios públicos (proveedores y clientes); promos en sistema, ocultas al público por ahora
- Fotos: en proceso (subir + editar fondo/colores)
- Identificación actual: ID / nombre (número); **sin SKU formal** aún
- Mensaje central: Fabricado express + cobertura nacional
- Personalizados: intake → WhatsApp para cotización y tiempo
- Sin listados ni CTAs de línea automotriz
- SEO agresivo: “llegar a todos los rincones” / ranking en búsquedas de resortes y similares

## Sistema interno (futuro)

Nube, multi-usuario remoto (dueños + encargado; viajan mucho):

- Pedidos (canales: web, WhatsApp, teléfono, mostrador)
- Clientes (incl. crédito / “facturas fiadas” a conocidos)
- Catálogo maestro + línea automotriz (visible, no principal)
- **Promos:** existen en datos; **no visibles** al público por ahora
- Facturas: CFDI se timbra en **Kubox**; el sistema registra todo y guarda vínculo/referencia (sin API Kubox pública)
- **Ingresos** y **egresos** en módulos separados; se registra **todo** (cobros, anticipos, efectivo/notas, egresos a proveedores)
- **Notas** = pagos físicos en efectivo en el local
- Sin stock/inventario en el MVP (decisión actual)

## Pagos web

- Pasarela: **Stripe** (Checkout / Payment Links según arquitectura Fase 1)

## Operación humana hoy

- Atienden pedidos: **dueños** y **empleado/encargado**
- Herramientas: Excel (listas/catálogos), papel (casi todo), Kubox (facturar)

## Decisiones fijadas

1. No promocionar automotriz ni captar clientes nuevos de esa línea en digital.
2. Automotriz sí vive en el sistema interno (visible, secundaria).
3. Fabricado express es el mensaje central; cobertura nacional.
4. Personalizados: cotización dinámica + 50% anticipo; no precio fijo en web.
5. Catálogos multiusos = producto público y vendible en web.
6. Precios de catálogo públicos; promos en sistema pero ocultas al público por ahora; stock no se usa/muestra.
7. Web = SEO + venta de catálogo + pedidos/cotizaciones; pagos online con Stripe; sistema = nube/remoto.
8. Ingresos ≠ egresos (separados); ambos registrables al 100%.
9. Kubox permanece como emisor CFDI; sistema interno no lo reemplaza en MVP.
10. Idioma: español (mercado MX).
11. Excel de catálogo los entrega el dueño después; no bloquea arquitectura.
12. Implementación de producto solo con OK explícito del dueño tras arquitectura.

## Cadena de mando digital

**Dueño (humano) → CEO (agente) → Gerente de departamento → roles del equipo**

Detalle en [`docs/agentes/ORG.md`](../agentes/ORG.md).
