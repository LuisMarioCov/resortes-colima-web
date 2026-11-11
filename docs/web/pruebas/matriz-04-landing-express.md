# Matriz EXP — Landing Fabricado express y envíos nacionales

Flujo público: landing (y mensaje central del sitio) de **Fabricado express** y cobertura de **envíos a toda la República Mexicana**.

**Ruta:** `/` (WEB_IA §4.1). Header/footer según WEB_IA §3 (logo; Catálogo y Personalizados; CTA «Fabricado express»; carrito por piezas; pie con Colima, envíos nacionales, legales; sin enlace destacado a `/admin`).

Bloques documentados: (1) hero express + CTAs «Ver catálogo» / «Resorte a la medida»; (2) días u horas vs semanas; (3) envíos a toda la República y clientes locales; (4) entrada a los dos catálogos, sin fusionarlos; (5) personalizados: cotiza por WhatsApp, anticipo 50% al confirmar, **sin precio**. Sin calculadora de tiempos ni SLA de fecha exacta. Cruce QA LND-01 y LND-02.

**Estado de todos los casos:** Pendiente — sin app.

Fuentes: WEB_IA §§3, 4.1, 5, 9 y 11.4; BRIEF; NECESIDADES.md §A; BACKLOG W1; ficha [`web.md`](../../agentes/depts/web.md); ficha Personalizados.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| EXP-001 | El mensaje Fabricado express es visible (días u horas vs semanas de la competencia) | P0 | marca | Pendiente — sin app |
| EXP-002 | Se comunica envío a toda la República Mexicana | P0 | marca | Pendiente — sin app |
| EXP-003 | Se puede mencionar entrega local en horas, sin inventar un plazo único | P1 | marca | Pendiente — sin app |
| EXP-004 | La ubicación Colima, Colima, México aparece de forma coherente | P1 | marca | Pendiente — sin app |
| EXP-005 | La landing no incluye CTAs ni listados automotriz | P0 | marca | Pendiente — sin app |
| EXP-006 | Textos de la landing en español (MX) | P1 | marca | Pendiente — sin app |
| EXP-007 | Hay navegación hacia catálogo y/o personalizados | P1 | feliz | Pendiente — sin app |
| EXP-008 | URL, layout y copy exactos (cuando exista WEB_IA) | P1 | feliz | Pendiente — sin app |
| EXP-009 | El mensaje no contradice «depende de complejidad y cantidad» | P1 | marca | Pendiente — sin app |

---

### EXP-001 — El mensaje Fabricado express es visible

| Campo | Detalle |
|-------|---------|
| Caso | En la landing (o home pública, cuando WEB_IA la nombre) el diferenciador **Fabricado express** es visible: mientras la competencia tarda **semanas**, Resortes Colima entrega en **días**; si el cliente es local y el trabajo es acotado, a veces en **horas**. |
| Precondiciones | Superficie pública desplegada. Ruta `/`. QA LND-01 pide evidencia above-the-fold del hero. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Captura de la landing donde se lea el mensaje express (palabras o equivalencia fiel al brief, no un eslogan inventado por el tester como criterio de pass). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF definición operativa y «Mensaje central: Fabricado express + cobertura nacional»; misión Web; QA Web: *checks de marca: express visible*. |

**Pasos**

1. Abrir la landing / home pública (URL pendiente de WEB_IA).
2. Localizar el mensaje de Fabricado express y la comparación con plazos de la competencia (semanas vs días/horas).

**Resultado esperado**

- Fabricado express es visible sin buscar en el pie de página únicamente (WEB_IA §4.1 lo coloca en el hero; QA LND-01 es bloqueante si falta).
- No se usa un plazo inventado que el brief no fija (ver EXP-009).

---

### EXP-002 — Se comunica envío a toda la República Mexicana

| Campo | Detalle |
|-------|---------|
| Caso | La cobertura nacional de envíos es visible en la landing / mensaje central. |
| Precondiciones | Superficie pública. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Captura con la promesa de envíos a toda la República (o redacción equivalente fiel al brief). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Cobertura: envíos a toda la República Mexicana»; NECESIDADES §A; W1. Costos, paquetería y días hábiles de envío **no** están documentados: no exigidos ni inventados. |

**Pasos**

1. Revisar la landing / home y, si WEB_IA define un bloque de envíos, también ese bloque.

**Resultado esperado**

- Cobertura nacional comunicada.
- Sin una tabla de tarifas o plazos de paquetería inventada por el tester.

---

### EXP-003 — Se puede mencionar entrega local en horas, sin inventar un plazo único

| Campo | Detalle |
|-------|---------|
| Caso | El brief permite comunicar que clientes locales, con trabajo acotado, a veces reciben en **horas**. Si WEB_IA incluye esa mención, debe ser fiel (condicional, no una garantía rígida no documentada). |
| Precondiciones | Copy de WEB_IA (cuando exista). |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Captura del pasaje sobre clientes locales / horas, o constancia de que WEB_IA decidió no usarlo (entonces no es fail). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «clientes locales a veces en horas»; definición operativa. |

**Pasos**

1. Leer el copy publicado contra el brief.
2. Comprobar que “horas” no se convierte en un SLA numérico no documentado (p. ej. “siempre en 2 horas”).

**Resultado esperado**

- Si aparece, es coherente con “a veces” / trabajo acotado / cliente local.
- Si WEB_IA aún no existe: caso bloqueado para revisión de copy, no fail.

---

### EXP-004 — La ubicación Colima, Colima, México aparece de forma coherente

| Campo | Detalle |
|-------|---------|
| Caso | La empresa se presenta como de Colima, Colima, México (apoyo a marca y a SEO local). |
| Precondiciones | Landing / pie / datos de contacto públicos (el layout está pendiente). |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Captura donde conste Colima (y el país, si el copy lo incluye). |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Ubicación»; misión Web «SEO local Colima». Teléfono, domicilio exacto, mapas y redes **por crear / no documentados**: no inventarlos como criterio. |

**Pasos**

1. Recorrer landing, pie y, si existe, página de contacto.

**Resultado esperado**

- La ubicación Colima está presente de forma coherente.
- No se exige un NAP (name-address-phone) que los docs no hayan fijado.

---

### EXP-005 — La landing no incluye CTAs ni listados automotriz

| Campo | Detalle |
|-------|---------|
| Caso | En la landing no hay listados, banners, menús ni llamadas a captar clientes nuevos de línea automotriz. |
| Precondiciones | Landing pública; el sistema interno puede tener automotriz, que no debe filtrarse aquí. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas de la landing completa (above y below the fold, nav, pie). Suite: MAR-004, MAR-005. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Sin listados ni CTAs de línea automotriz»; decisión 1. |

**Pasos**

1. Revisar textos, imágenes, menús, botones y enlaces de la landing.
2. Buscar términos o categorías automotrices promocionales.

**Resultado esperado**

- Cero captación automotriz en la landing.

---

### EXP-006 — Textos de la landing en español (MX)

| Campo | Detalle |
|-------|---------|
| Caso | La landing está en español. |
| Precondiciones | Superficie pública. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Capturas de titular, cuerpo y CTAs. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 10; STACK idioma UI. |

**Pasos**

1. Leer la landing (titulares, cuerpo, botones).

**Resultado esperado**

- Interfaz y mensaje en español.

---

### EXP-007 — Hay navegación hacia catálogo y/o personalizados

| Campo | Detalle |
|-------|---------|
| Caso | Desde la landing se puede llegar a los otros flujos públicos documentados: catálogo vendible y/o intake de personalizados. |
| Precondiciones | W1 + al menos un destino (W2 o W4) especificado en WEB_IA. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Captura de los CTAs/enlaces y de la llegada al destino. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES mapa del sitio público; BRIEF productos públicos. Rutas exactas pendientes. WEB_IA: CTAs «Ver catálogo» → `/catalogo` (o un listado) y «Resorte a la medida» → `/personalizados`. Header con los mismos destinos. |

**Pasos**

1. Identificar en la landing los enlaces a catálogo y a personalizados (cuando WEB_IA los defina).
2. Seguirlos y comprobar el destino.

**Resultado esperado**

- Hay camino a catálogo y/o form de personalizados, sin pasar por automotriz.

---

### EXP-008 — URL, layout y copy exactos (cuando exista WEB_IA)

| Campo | Detalle |
|-------|---------|
| Caso | Contenedor de aceptación de la landing según `WEB_IA.md` (URL, jerarquía, copy aprobado). |
| Precondiciones | Borrador WEB_IA §3 y §4.1 (existe; la app aún no). |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Capturas de los cinco bloques, header y footer, CTAs a `/catalogo` y `/personalizados`. Cruce QA LND-01 y LND-02. |
| Estado | Pendiente — sin app |
| Notas / fuente | WEB_IA §§3–4.1 y 11.4. El copy de apoyo es tono, no literatura final; no se exige una redacción palabra por palabra no publicada como «literatura final». Sí se exige el mensaje y los bloques. |

**Pasos**

1. Abrir `/` y contrastar los cinco bloques, header y footer con WEB_IA §3 y §4.1.
2. Seguir «Ver catálogo» y «Resorte a la medida».
3. Confirmar ausencia de promos, stock, automotriz, precio de personalizados y calculadora de tiempos.

**Resultado esperado**

- La landing cumple WEB_IA §4.1 y no contradice el brief.
- Header/footer sin automotriz, stock, promos ni enlace destacado a `/admin`.

---

### EXP-009 — El mensaje no contradice «depende de complejidad y cantidad»

| Campo | Detalle |
|-------|---------|
| Caso | El brief fija que el express **depende de complejidad y cantidad**. La landing no debe prometer un único plazo rígido para todo trabajo. |
| Precondiciones | Copy publicado o borrador de WEB_IA. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Lectura del copy frente a la definición operativa del brief. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF «Fabricado express (definición operativa)»; ficha Personalizados (horas local/pocos, días foráneo/complejo/volumen). Escalar al CEO si el lead time de marketing no coincidiera con capacidad (fuera de la ejecución de este caso, pero sí de su hallazgo). |

**Pasos**

1. Leer todos los plazos comunicados en la landing (y en bloques de express reutilizados en otras páginas públicas, si existen).
2. Marcar fail solo si el copy contradice el brief (p. ej. un único plazo garantizado para cualquier pedido, o semanas como plazo propio).

**Resultado esperado**

- El mensaje sigue siendo: más rápido que la competencia (días / a veces horas), no un SLA inventado.
