# Matriz PER — Intake personalizados → WhatsApp

Flujo público: formulario de resortes a medida. La web **recoge** el intake canónico, hace `INSERT` con `status = received` y entrega el paquete a **WhatsApp** para cotización y tiempo. **No hay precio fijo en la web.** El anticipo del 50% es operación posterior (no se cierra en este flujo).

**Rutas y APIs (WEB_IA §§4.8–4.9, 2):** `/personalizados`; `POST /api/personalizados`; `POST /api/personalizados/upload`; redirect a `/personalizados/enviado`.

**Handoff:** CTA `https://wa.me/<numero_negocio>?text=...` con texto propuesto de folio (Personalizados puede afinar). El número lo entrega el dueño (WEB_IA §10): el form y el alta pueden existir sin él; el CTA real queda pendiente. **No** va PII en la URL (solo folio). Cruce QA FRM-01 a FRM-09.

**Estado de todos los casos:** Pendiente — sin app.

Fuentes: WEB_IA §§4.8–4.9, 9, 10 y 11.3; FLUJOS §3; NECESIDADES.md intake canónico; ficha [`personalizados.md`](../../agentes/depts/personalizados.md); SCHEMA `custom_requests`; SEGURIDAD.md §6, §7, §9 y R12; BRIEF decisiones 4 y 10.

---

## Resumen

| ID | Caso | Prioridad | Tipo | Estado |
|----|------|-----------|------|--------|
| PER-001 | Envío feliz con campos canónicos + foto de muestra + contacto | P0 | feliz | Pendiente — sin app |
| PER-002 | Handoff a WhatsApp (deep link o mensaje) para cotizar | P0 | feliz | Pendiente — sin app |
| PER-003 | La web no muestra ni calcula un precio fijo de personalizados | P0 | marca | Pendiente — sin app |
| PER-004 | El anticipo 50% no se cobra ni se cierra en la web | P0 | marca | Pendiente — sin app |
| PER-005 | Campos canónicos vacíos o faltantes se rechazan | P0 | negativo | Pendiente — sin app |
| PER-006 | Tipo solo tensión, compresión o torsión | P0 | negativo | Pendiente — sin app |
| PER-007 | Unidad (pulgadas o mm) obligatoria y válida | P0 | negativo | Pendiente — sin app |
| PER-008 | Contacto requerido (nombre y teléfono) | P0 | negativo | Pendiente — sin app |
| PER-009 | Sin foto de muestra el envío se rechaza | P0 | negativo | Pendiente — sin app |
| PER-010 | Fotos solo por upload firmado (TTL corto, path opaco) | P0 | seguridad | Pendiente — sin app |
| PER-011 | Archivo fuera de allowlist MIME/tamaño se rechaza | P1 | límite | Pendiente — sin app |
| PER-012 | Rate limit del intake: `429` antes de DB y Storage | P0 | seguridad | Pendiente — sin app |
| PER-013 | `status` u `order_id` en el payload no se honran | P0 | seguridad | Pendiente — sin app |
| PER-014 | El anónimo no lee ni altera `custom_requests` | P0 | seguridad | Pendiente — sin app |
| PER-015 | El anónimo no lee el bucket `custom-samples` | P0 | seguridad | Pendiente — sin app |
| PER-016 | El deep link de WA no lleva PII sensible en la URL | P0 | seguridad | Pendiente — sin app |
| PER-017 | Formulario en español (MX) | P1 | marca | Pendiente — sin app |
| PER-018 | Se puede adjuntar la foto ideal con aparato de medición | P1 | feliz | Pendiente — sin app |
| PER-019 | Rangos numéricos de medidas (cuando se especifiquen) | P2 | límite | Pendiente — sin app |
| PER-020 | Longitud máxima de notas de contacto | P1 | límite | Pendiente — sin app |
| PER-021 | El paquete hacia WA incluye tipo, unidad y medidas de forma inequívoca | P1 | feliz | Pendiente — sin app |

---

## Campos canónicos (fuente: NECESIDADES + SCHEMA)

Obligatorios / fuertes según NECESIDADES:

1. Diámetro interior y exterior (`inner_diameter`, `outer_diameter`)
2. Número de vueltas (`turns`)
3. Calibre del alambre (`wire_gauge`)
4. Largo / longitud deseada (`length_desired`)
5. Tipo: tensión | compresión | torsión (`spring_type`: `tension` | `compression` | `torsion`)
6. Unidad: pulgadas | milímetros (`unit`: `in` | `mm`) — obligatorio especificar
7. Espacio entre vueltas (`coil_spacing`; en schema es nullable — ver gap en PER-005 / TRAZABILIDAD)
8. Cantidad (`quantity`)
9. Foto de muestra (`sample_image_path`)
10. Ideal: foto con aparato de medición sobre la pieza (`measurement_image_path`)

Contacto (SCHEMA + SEGURIDAD §7: *contacto requerido*, no listado en el bloque canónico de NECESIDADES): `contact_name`, `contact_phone`; `contact_notes` opcional con longitud máxima (valor exacto pendiente).

---

### PER-001 — Envío feliz con campos canónicos + foto de muestra + contacto

| Campo | Detalle |
|-------|---------|
| Caso | Un visitante completa el form con los campos canónicos, foto de muestra y contacto; se inserta una solicitud `status = received` y `order_id` nulo. |
| Precondiciones | Form público disponible (ruta pendiente de WEB_IA). Rate limit no agotado. Storage de samples configurado. |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Confirmación visible al usuario (copy pendiente de WEB_IA); evidencia **staff** de la fila: `status = received`, `order_id IS NULL`, campos canónicos persistidos, path de foto de muestra. El anónimo no debe poder leer la fila (PER-014). |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3; SCHEMA `custom_requests`; NECESIDADES intake. Valores numéricos de ejemplo: usar magnitudes genéricas de prueba, no fichas reales del dueño. |

**Pasos**

1. Abrir el form público de personalizados (URL pendiente de WEB_IA).
2. Completar diámetros int/ext, vueltas, calibre, largo, tipo (uno de los tres), unidad (in o mm), espacio entre vueltas, cantidad, nombre, teléfono, foto de muestra. Opcional: foto con medidor y notas.
3. Enviar.
4. Con apoyo staff, localizar el INSERT.

**Resultado esperado**

- Alta exitosa con `status = received` y `order_id` nulo.
- Los campos canónicos y el contacto coinciden con lo enviado.
- Sigue el handoff de PER-002.

---

### PER-002 — Handoff a WhatsApp (deep link o mensaje) para cotizar

| Campo | Detalle |
|-------|---------|
| Caso | Tras el intake, hay un handoff por deep link o mensaje a WhatsApp para cotización y tiempo. |
| Precondiciones | PER-001 exitoso. WEB_IA §4.9: tras el INSERT, redirect a `/personalizados/enviado` (confirmación, folio corto, CTA WhatsApp, aviso de que pueden contactarlo al teléfono dejado). |
| Prioridad / tipo | P0 / feliz |
| Evidencia requerida | Captura del handoff (sin pegar PII completa en el ticket; ver PER-016). |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3 *Handoff deep_link_o_mensaje*; BRIEF «Personalizados: intake → WhatsApp»; backlog W4 / X1 (API formal de WA queda fuera del MVP). Texto propuesto: `Hola, envié una solicitud de resorte personalizado con folio {folio}. Quedo atento a la cotización y el tiempo de entrega.` El número no se hardcodea de prueba en el repo. Si el dueño aún no lo entrega, el alta puede existir y el CTA real queda pendiente (§10). Cruce QA FRM-08. El click no muta `status` (sigue `received`). |

**Pasos**

1. Completar un envío válido y aterrizar en `/personalizados/enviado`.
2. Inspeccionar el CTA `wa.me` (si el número ya está configurado) y el texto (solo folio).

**Resultado esperado**

- Confirmación + folio + CTA a WhatsApp para cotizar tiempo y precio.
- Si falta el número del dueño: el form/alta pasan; el CTA real se marca bloqueado, no fail del INSERT.
- No se cierra un precio en la web (PER-003). El click no cambia `status`.

---

### PER-003 — La web no muestra ni calcula un precio fijo de personalizados

| Campo | Detalle |
|-------|---------|
| Caso | En el form, la confirmación o el handoff no aparece un precio de venta de personalizados. |
| Precondiciones | Form público visible. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Capturas del flujo completo de intake (antes, durante y después del envío) sin precio de cotización cerrado. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 4; FLUJOS §3 *Precio no fijo en web*; ficha Personalizados; escalar al CEO si se pidiera checkout con precio fijo. |

**Pasos**

1. Recorrer el form vacío, con datos y la pantalla post-envío / handoff.
2. Buscar montos, tarifas o “cotización en línea” de personalizados.

**Resultado esperado**

- Cero precio fijo de personalizados en la web.
- El mensaje, si existe, remite a cotización por WhatsApp.

---

### PER-004 — El anticipo 50% no se cobra ni se cierra en la web

| Campo | Detalle |
|-------|---------|
| Caso | El 50% de anticipo es una regla de negocio posterior (pedido + `income_entries.kind = deposit_50` en operación). Este flujo web no cobra ese anticipo ni abre Checkout de personalizados. |
| Precondiciones | Form público. |
| Prioridad / tipo | P0 / marca |
| Evidencia requerida | Recorrido del intake sin pasarela de anticipo; sin `income_entries` creados por el form (staff). |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3 (anticipo al convertir a pedido, en admin); BRIEF. Informar el 50% en copy, si WEB_IA lo incluye, no equivale a cobrarlo. El texto exacto está pendiente. |

**Pasos**

1. Completar un intake válido.
2. Verificar que no se inicia un pago Stripe ni otro cobro de anticipo en la web.
3. Staff: no hay ingreso ligado creado por este form.

**Resultado esperado**

- Sin cierre de anticipo en la superficie pública.
- El INSERT no trae `order_id`.

---

### PER-005 — Campos canónicos vacíos o faltantes se rechazan

| Campo | Detalle |
|-------|---------|
| Caso | Enviar el form con campos canónicos vacíos no crea una solicitud válida. |
| Precondiciones | Form público. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Mensajes de validación (copy pendiente de WEB_IA); staff: no hay fila `received` incompleta de esa prueba. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES lista «Obligatorios / fuertes»; SEGURIDAD §7 *Validar enums/rangos canónicos*. **Gap:** `coil_spacing` es nullable en SCHEMA pero está en la lista canónica. Hasta que Personalizados/WEB_IA lo cierren, probarlo como requerido en UI y anotar si el backend lo acepta nulo. |

**Pasos**

1. Intentar enviar el form vacío.
2. Intentar envíos con un solo campo canónico faltante (diámetros, vueltas, calibre, largo, tipo, unidad, espacio, cantidad), dejando el resto válido y con foto + contacto.
3. Verificar que no hay INSERT `received` de esas pruebas (staff).

**Resultado esperado**

- Rechazo en cliente y/o servidor.
- Sin filas incompletas “exitosas”.
- El veredicto de `coil_spacing` se documenta si diverge entre UI y schema.

---

### PER-006 — Tipo solo tensión, compresión o torsión

| Campo | Detalle |
|-------|---------|
| Caso | `spring_type` acepta únicamente los tres valores canónicos. Cualquier otro se rechaza. |
| Precondiciones | Form y API públicos. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | UI solo con las tres opciones; request con un valor no canónico rechazado; fila feliz de PER-001 con un enum válido. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES y SCHEMA enum `tension`  /  `compression`  /  `torsion`. Las etiquetas en español (tensión, etc.) las definirá WEB_IA; no inventar más tipos (p. ej. “extensión” como cuarto valor). |

**Pasos**

1. Revisar el control de tipo en la UI: solo tres opciones.
2. Enviar un alta válida con cada tipo (tres pases felices menores, o uno y muestreo).
3. Si la API acepta el campo, enviar un valor no canónico y comprobar rechazo.

**Resultado esperado**

- Solo los tres tipos persisten.
- Valores inválidos no se guardan.

---

### PER-007 — Unidad (pulgadas o mm) obligatoria y válida

| Campo | Detalle |
|-------|---------|
| Caso | Hay que especificar unidad: pulgadas o milímetros. Sin unidad o con valor inválido, se rechaza. |
| Precondiciones | Form público. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | UI con ambas unidades; envío sin unidad rechazado; API con valor no canónico rechazada. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES punto 6 «obligatorio especificar»; SCHEMA `in`  /  `mm`. |

**Pasos**

1. Completar un form válido salvo la unidad (vacía).
2. Completar uno con cada unidad válida.
3. Probar un valor de unidad no canónico en la API, si aplica.

**Resultado esperado**

- Unidad obligatoria y restringida a pulgadas/mm (o `in`/`mm` en datos).
- Las medidas se interpretan con esa unidad (PER-021).

---

### PER-008 — Contacto requerido (nombre y teléfono)

| Campo | Detalle |
|-------|---------|
| Caso | No se acepta un intake sin `contact_name` y `contact_phone` (WhatsApp). |
| Precondiciones | Form público. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Rechazo sin nombre; rechazo sin teléfono; alta feliz con ambos. |
| Estado | Pendiente — sin app |
| Notas / fuente | SCHEMA columnas de contacto; SEGURIDAD §7 *contacto requerido*; el teléfono es además clave del rate limit (PER-012). Formato exacto de normalización del teléfono: aún no está numerado (gap G16). WEB_IA §4.8 lo usa como clave del rate limit. |

**Pasos**

1. Envío válido salvo nombre vacío.
2. Envío válido salvo teléfono vacío.
3. Envío feliz de control con ambos.

**Resultado esperado**

- Sin contacto completo no hay INSERT `received`.

---

### PER-009 — Sin foto de muestra el envío se rechaza

| Campo | Detalle |
|-------|---------|
| Caso | La foto de muestra es obligatoria / fuerte. Sin ella no hay alta exitosa. |
| Precondiciones | Form con el resto de campos válidos. |
| Prioridad / tipo | P0 / negativo |
| Evidencia requerida | Rechazo sin `sample_image`; staff sin fila de esa prueba. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES punto 9. En SCHEMA `sample_image_path` aparece nullable: la obligatoriedad de negocio está en NECESIDADES. Si la implementación diverge, reportar gap a Personalizados / Web. La foto con medidor es “ideal” (PER-018), no el mismo criterio. |

**Pasos**

1. Completar un intake válido sin adjuntar foto de muestra.
2. Enviar y verificar rechazo.

**Resultado esperado**

- No se crea la solicitud sin foto de muestra.

---

### PER-010 — Fotos solo por upload firmado (TTL corto, path opaco)

| Campo | Detalle |
|-------|---------|
| Caso | Las imágenes entran al bucket `custom-samples` solo mediante upload firmado, con TTL corto y path opaco, tras allowlist MIME/tamaño. |
| Precondiciones | Form de personalizados; políticas de Storage documentadas. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | El flujo de alta usa URL/firma de upload (no un write anónimo libre al bucket); el path persistido no es un nombre predecible de usuario; el anónimo no lista el bucket. Valores exactos de TTL/MIME/size pendientes (PER-011). |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3; SEGURIDAD.md §9; SCHEMA Storage. Check defensivo. |

**Pasos**

1. Adjuntar una foto de muestra válida en un envío feliz.
2. Observar que el cliente no escribe con política pública abierta, sino con upload firmado.
3. Revisar (staff) que el path es opaco y que el objeto quedó en `custom-samples`.

**Resultado esperado**

- Upload firmado, path opaco, sin listing público.

---

### PER-011 — Archivo fuera de allowlist MIME/tamaño se rechaza

| Campo | Detalle |
|-------|---------|
| Caso | Un archivo que no cumple la allowlist de MIME o tamaño no se acepta. |
| Precondiciones | **Gap:** la allowlist (tipos y tamaño máximo) no está numerada en los docs. |
| Prioridad / tipo | P1 / límite |
| Evidencia requerida | Cuando WEB_IA / Seguridad / Personalizados fijen la lista: un archivo permitido pasa; uno fuera de lista se rechaza **antes** de quedar público o de escribir una solicitud sucia. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD §7 y §9 «MIME/size allowlist». No inventar “5 MB” ni tipos. Caso bloqueado hasta tener la lista. |

**Pasos**

1. Leer la allowlist cuando esté documentada.
2. Subir un archivo permitido y uno no permitido.

**Resultado esperado**

- Solo el permitido se asocia a una solicitud `received`.
- Mientras no haya lista: Bloqueado (gap).

---

### PER-012 — Rate limit del intake: `429` antes de DB y Storage

| Campo | Detalle |
|-------|---------|
| Caso | Límite de **5 / IP / 15 min** y **3 / teléfono normalizado / hora**. Al exceder, `429`, aplicado **antes** de escribir en DB o Storage. |
| Precondiciones | Entorno de prueba. Criterio de “teléfono normalizado” pendiente de especificar (anotar el usado al ejecutar). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | (a) Más de 5 envíos válidos desde la misma IP en 15 min: `429` a partir del exceso, sin nuevas filas/objetos de esas llamadas. (b) Más de 3 en una hora con el mismo teléfono normalizado (aunque cambie IP, si esa es la clave): `429` equivalente. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3; SEGURIDAD.md §6. Check defensivo, no una prueba de caída del servicio. |

**Pasos**

1. Realizar envíos de prueba hasta exceder 5 / IP / 15 min.
2. En una prueba aparte, exceder 3 / teléfono normalizado / hora.
3. Verificar status `429` y que no hubo INSERT ni upload atribuible a la solicitud limitada.

**Resultado esperado**

- `429` (Retry-After si la implementación lo añade; en §6 el Retry-After está explícito en checkout y login; en intake solo se documenta `429` — no exigir Retry-After si no está escrito, sí el `429` y el no-write).
- Límite aplicado antes de DB y Storage.

---

### PER-013 — `status` u `order_id` en el payload no se honran

| Campo | Detalle |
|-------|---------|
| Caso | El alta pública fuerza `status = received` y `order_id` nulo. Un payload que intente `converted` u otro estado, o un `order_id`, se rechaza o se descartan esos campos. |
| Precondiciones | Endpoint de intake. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Prueba de aceptación SCHEMA / SEGURIDAD: INSERT anónimo con `status = converted` o `order_id` asignado → rechazado (o, si la API recorta el payload, la fila queda `received` / `order_id` nulo, nunca `converted`). Documentar cuál de las dos defensas ocurre. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3 allowlist + WITH CHECK; SCHEMA columnas permitidas. Check defensivo. |

**Pasos**

1. Enviar un intake por la API pública incluyendo `status = converted` y/o un `order_id`.
2. Verificar (staff y/o error de API) que no queda una solicitud convertida ni ligada a pedido desde el anónimo.

**Resultado esperado**

- El anónimo no elige `status` ni `order_id`.
- Allowlist respetada (sin campos privilegiados).

---

### PER-014 — El anónimo no lee ni altera `custom_requests`

| Campo | Detalle |
|-------|---------|
| Caso | Sin SELECT, UPDATE ni DELETE anónimos, ni de la fila recién insertada. El inbox es solo `/admin/personalizados` (fuera del alcance de ejecución de Tester Web, salvo coordinar la verificación). |
| Precondiciones | Una fila `received` de prueba. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Operaciones `anon` sobre `custom_requests`: denegadas o vacías. |
| Estado | Pendiente — sin app |
| Notas / fuente | FLUJOS §3 *Sin lectura pública del inbox*; SCHEMA RLS. |

**Pasos**

1. Con cliente `anon`, intentar leer la tabla (y, si el cliente lo permite, update/delete).
2. Confirmar que no hay listado público de solicitudes.

**Resultado esperado**

- Inbox invisible en la superficie pública.
- El remitente no lee su fila por la API anónima.

---

### PER-015 — El anónimo no lee el bucket `custom-samples`

| Campo | Detalle |
|-------|---------|
| Caso | Lectura directa de `custom-samples` denegada al anónimo (incluso del objeto recién subido). |
| Precondiciones | Objeto de muestra de un PER-001 de prueba. |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Lectura anónima / URL directa del objeto: denegada. Prueba de aceptación SCHEMA / SEGURIDAD punto 4. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD §9; SCHEMA Storage. Staff puede ver vía descarga firmada o proxy admin (no se prueba el admin aquí, solo que el público no lee). |

**Pasos**

1. Conocer el path de un sample de prueba (staff).
2. Intentar leerlo como anónimo (sin credenciales staff).

**Resultado esperado**

- Lectura denegada. Sin listing público del bucket.

---

### PER-016 — El deep link de WA no lleva PII sensible en la URL

| Campo | Detalle |
|-------|---------|
| Caso | El handoff a WhatsApp no pone PII sensible en la query string de la URL. |
| Precondiciones | Handoff implementado (depende de PER-002 / WEB_IA). |
| Prioridad / tipo | P0 / seguridad |
| Evidencia requerida | Captura o copia de la URL de handoff, redactando el ticket si hiciera falta, que demuestre ausencia de PII sensible (teléfono completo, notas, fotos, medidas acompañadas de identidad, etc.). |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD.md §11 R12: *Deep link WA con datos en query — No PII sensible en URL.* El detalle de qué viaja en el mensaje prellenado vs la URL lo cerrarán Web/Personalizados; este caso aplica el contrato R12. |

**Pasos**

1. Completar un intake con datos de contacto de prueba.
2. Inspeccionar la URL del deep link / redirección (cuando exista).

**Resultado esperado**

- La URL no contiene PII sensible.
- WEB_IA §4.9: la URL solo lleva el folio (más el número en el path de wa.me). Prohibido teléfono, email, fotos o domicilio en el query.

---

### PER-017 — Formulario en español (MX)

| Campo | Detalle |
|-------|---------|
| Caso | Etiquetas, ayudas y errores del form están en español. |
| Precondiciones | Form visible. |
| Prioridad / tipo | P1 / marca |
| Evidencia requerida | Capturas del form y de validaciones. |
| Estado | Pendiente — sin app |
| Notas / fuente | BRIEF decisión 10; STACK idioma UI. Copy exacto pendiente de WEB_IA / Personalizados. |

**Pasos**

1. Revisar etiquetas de los diez campos canónicos, contacto y botones.
2. Provocar un error de validación y leer el mensaje.

**Resultado esperado**

- Interfaz en español. Tipos y unidades comprensibles en MX (tensión/compresión/torsión; pulgadas/mm).

---

### PER-018 — Se puede adjuntar la foto ideal con aparato de medición

| Campo | Detalle |
|-------|---------|
| Caso | El form permite (y sugiere, si el copy lo define) una segunda foto: muestra con aparato de medición sobre la pieza. |
| Precondiciones | Form público. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Envío feliz con ambas fotos; staff: `measurement_image_path` poblado. Un envío con solo foto de muestra sigue siendo válido (la segunda es “ideal” / recomendada con claridad y **no bloquea** el envío si falta: WEB_IA §4.8 y QA FRM-01). |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES punto 10; SCHEMA `measurement_image_path`; ficha Personalizados. |

**Pasos**

1. Enviar un intake con foto de muestra y foto con medidor.
2. Enviar otro solo con foto de muestra (control de obligatoriedad).

**Resultado esperado**

- La foto con medidor se puede adjuntar y queda persistida por upload firmado.
- La obligatoriedad permanece como “ideal” hasta que un doc la cambie.

---

### PER-019 — Rangos numéricos de medidas (cuando se especifiquen)

| Campo | Detalle |
|-------|---------|
| Caso | Diámetros, vueltas, largo, espacio y cantidad respetan los rangos que defina la especificación. |
| Precondiciones | **Gap:** SEGURIDAD §7 pide validar rangos canónicos, pero no hay mínimos/máximos numéricos en los docs. |
| Prioridad / tipo | P2 / límite |
| Evidencia requerida | Cuando Personalizados/WEB_IA publiquen rangos: un valor dentro se acepta; uno fuera se rechaza. |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD §7. **No inventar** milímetros máximos ni cantidades tope. Mientras tanto: Bloqueado (gap). Cantidad > 0 es un mínimo razonable ya alineado con checkout, pero el tope no está escrito para este form. |

**Pasos**

1. Esperar rangos documentados.
2. Probar un valor límite válido y uno fuera de rango por campo numérico.

**Resultado esperado**

- Fuera de rango: rechazo, sin fila `received`.
- Sin rangos en docs: no se falla el producto por un criterio inventado.

---

### PER-020 — Longitud máxima de notas de contacto

| Campo | Detalle |
|-------|---------|
| Caso | `contact_notes` tiene una longitud máxima; un texto más largo se rechaza o se recorta según lo que especifique Web. |
| Precondiciones | **Gap:** SEGURIDAD §7 exige *longitud máxima en notes*, sin cifra. |
| Prioridad / tipo | P1 / límite |
| Evidencia requerida | Cuando exista el máximo: nota en el límite aceptada; por encima, rechazada o tratada como diga WEB_IA (documentar el comportamiento; no asumir recorte silencioso). |
| Estado | Pendiente — sin app |
| Notas / fuente | SEGURIDAD §7. No inventar un máximo (p. ej. 500). Caso bloqueado hasta cifra o regla explícita. |

**Pasos**

1. Leer el máximo cuando esté documentado.
2. Enviar nota en el límite y por encima.

**Resultado esperado**

- Se respeta la longitud máxima documentada.

---

### PER-021 — El paquete hacia WA incluye tipo, unidad y medidas de forma inequívoca

| Campo | Detalle |
|-------|---------|
| Caso | Lo que se entrega a WhatsApp (mensaje, deep link permitido por R12, o paquete que ve el encargado) no pierde unidad ni tipo: se puede cotizar sin ambigüedad mm vs pulgadas. |
| Precondiciones | Handoff y/o inbox staff. El formato exacto está pendiente. |
| Prioridad / tipo | P1 / feliz |
| Evidencia requerida | Captura del paquete (mensaje WA o vista staff del intake) con tipo, unidad y medidas. Redactar PII en el ticket. |
| Estado | Pendiente — sin app |
| Notas / fuente | NECESIDADES «Salida del proceso web: paquete de datos → WhatsApp»; ficha Personalizados. El paquete para el encargado vive en `/admin/personalizados`; el mensaje de wa.me lleva el folio. Copy final lo puede afinar Personalizados (WEB_IA §11.8). |

**Pasos**

1. Enviar un intake en milímetros y otro en pulgadas, con tipos distintos.
2. Revisar el paquete resultante (handoff y/o inbox staff).

**Resultado esperado**

- Unidad y tipo viajan de forma inequívoca con las medidas.
