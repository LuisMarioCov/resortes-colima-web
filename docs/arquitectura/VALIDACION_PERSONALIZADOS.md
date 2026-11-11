# Validación Personalizados — arquitectura Fase 1

**Veredicto: APROBADO CON CAMBIOS**  
Gerente Personalizados, 2026-11-11 (hora del centro de México). Solo documental. No se editaron `SCHEMA.md`, `FLUJOS.md` ni `WEB_IA.md`.

Fuentes leídas, en el orden pedido: BRIEF (intake canónico y anticipo 50%); ORG y `depts/personalizados.md`; STACK; SCHEMA (`custom_requests`, `orders`, `income_entries`, matriz RLS del INSERT anónimo); FLUJOS §3; WEB_IA §4.8–4.9; ADMIN_IA; SEGURIDAD §4 y §7 (también §6, §9 y R12, por rate limit, Storage y PII en el deep link); BACKLOG (W4). Complemento: FINANZAS_REGLAS (anticipo) y VALIDACION_PEDIDOS (el gate a `pendiente` ya lo señaló Pedidos).

---

## Veredicto por punto

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Form público sin precio fijo; INSERT acotado (`status = received`, `order_id IS NULL`); anon deny SELECT | **Cumple.** WEB_IA §4.8, FLUJOS §3, SCHEMA (allowlist + WITH CHECK) y SEGURIDAD §4/§7 coinciden: ningún precio ni lead time en la página; la API fuerza los valores privilegiados; el anónimo no hace SELECT/UPDATE/DELETE (ni de su propia fila). El inbox es solo `/admin/personalizados`, con sesión staff. |
| 2 | Intake de 10 campos del BRIEF, fotos (muestra y con medidor), handoff a WhatsApp sin PII en la URL (solo folio) | **Cumple**, con dos afinaciones abajo. Los 10 campos están en SCHEMA, FLUJOS y WEB_IA, más nombre y WhatsApp de contacto. Foto de muestra obligatoria; foto con medidor recomendada, no bloquea. Deep link: `wa.me/<numero>?text=...` solo con folio. **Copy de WhatsApp (cierre de Personalizados):** se aprueba el texto de FLUJOS §3 / WEB_IA §4.9: `Hola, envié una solicitud de resorte personalizado con folio {folio}. Quedo atento a la cotización y el tiempo de entrega.` |
| 3 | Pedido nace en `cotizado`; no pasar a `pendiente` sin `deposit_50` que cubra el 50% del total; anticipo es ingreso, no estado | **Cumple en SCHEMA y FLUJOS** (el pedido convertido nace en `cotizado`; el anticipo es `income_entries.kind = deposit_50` y se registra antes de `pendiente`). **Falta el gate operativo de cobertura** (suma ≥ 50% de `orders.total`) en ADMIN_IA, y FINANZAS_REGLAS todavía habla de estados viejos (`awaiting_deposit`, `confirmed`, `in_production`). Ver cambios 1 y 2. |
| 4 | Rate limit en el form; upload firmado y acotado; bucket no público | **Cumple.** 5 / IP / 15 min y 3 / teléfono normalizado / hora, antes de DB o Storage (`429`). Upload firmado a `custom-samples` (TTL corto, path opaco, MIME/size allowlist); lectura anónima denegada. Falta concretar MIME, techo de tamaño y el mismo rate limit en `POST /api/personalizados/upload` (cambio 5). |
| 5 | Huecos o contradicciones que afecten Personalizados | Ninguno bloquea el modelo. Lista concreta abajo. El número de WhatsApp del negocio sigue siendo input del dueño: no bloquea este documento (el form y el alta pueden existir sin el CTA real). |

No se reabre el stack ni las prioridades de negocio. W4 puede diseñarse sobre este modelo. Implementación de producto: solo con OK explícito del dueño.

---

## Cambios concretos (para el CEO)

No edité los tres documentos canónicos. Pido que se despachen así:

1. **`ADMIN_IA.md` (Sistema), §7 y detalle de pedido.** Explicitar: al convertir, el pedido nace en `cotizado` con `line_focus = custom`. **No pasar a `pendiente`** mientras la suma de ingresos vigentes del pedido sea menor al 50% de `orders.total` (redondeo hacia arriba al centavo; regla de FINANZAS_REGLAS). El anticipo no es un estado. Mostrar el **mismo folio** del handoff en inbox y detalle, para empatar el mensaje de WhatsApp. Canal de la conversión: **`whatsapp`**, nunca `web` (ese canal está reservado al catálogo Stripe, que entra ya pagado en `pendiente`).

2. **`FINANZAS_REGLAS.md` (Finanzas).** Sustituir `awaiting_deposit` → `confirmed` e `in_production` por la máquina D2: el pedido personalizado nace en `cotizado`; el 50% cubierto es la condición para entrar a `pendiente`, no un estado. El cálculo (50% de `total`, hacia arriba; abonos parciales; registrar lo que sí entró) está bien y debe quedar alineado. Sigue pendiente el OK del dueño a los casos borde (ámbito del 50%, pago por debajo, cancelación con anticipo cobrado); eso no impide aprobar este modelo. Pedidos ya pidió el mismo alineamiento de nombres.

3. **`WEB_IA.md` §4.8 (propuesta, no editado).** Alinear «espacio entre vueltas»: en SCHEMA `coil_spacing` es nullable; en el form no debe ser obligatorio. La foto con medidor ya está correcta (recomendada).

4. **Folio en `/personalizados/enviado` (Web + Sistema).** El anónimo no puede hacer SELECT de `custom_requests` (tampoco `INSERT … RETURNING` bajo RLS sin política de lectura). El alta pública debe ser Route Handler o Server Action que inserte en servidor y devuelva **solo el folio** a la página de confirmación (el folio puede ir en la ruta o el query; no es PII). Si se quiere un folio más legible que el prefijo del `id`, Sistema puede agregar `request_number`; no es bloqueante.

5. **Validación de fotos y rate limit del upload (Web + Seguridad, propuesta).** Allowlist concreta: JPEG, PNG, HEIC, WebP; máximo 8 MB por archivo; vista previa en el form y guía de luz / acercamiento / medidor sobre la pieza. El rate limit del form debe aplicarse también a `POST /api/personalizados/upload`, no solo al INSERT, para no dejar el signed upload sin tope (R1).

6. **`custom_requests.status` (Sistema, menor).** Documentar cuándo pasa de `received` a `sent_to_whatsapp` / `quoted` / `converted` / `abandoned`. El clic del cliente a WhatsApp **no** muta el estado (ya dicho en WEB_IA); si `sent_to_whatsapp` no lo mueve el staff, conviene decirlo para no dejar un valor huérfano.

---

## Copy y operación (cierre de Personalizados)

- **Mensaje del cliente (aprobado):** el de FLUJOS §3 / WEB_IA §4.9, solo folio, sin medidas, teléfono, fotos ni domicilio en la URL.
- **CTA del encargado** en `/admin/personalizados/[id]`: abrir WhatsApp al `contact_phone` de la solicitud, con el folio a la vista. La cotización (precio y tiempo) la escribe el encargado; no sale de la web.
- **Número de negocio:** lo entrega el dueño, en configuración, no hardcodeado de prueba. Hasta entonces, W4 puede existir sin el CTA real.
- El hueco de FLUJOS («Intake WA copy + validación fotos | Personalizados | Afinar §3») queda cerrado en copy; las reglas finas de fotos son el cambio 5. Cuando el CEO las acepte, se puede marcar ese hueco como hecho.

Políticas SQL RLS y tests con clave `anon` siguen siendo el gate de Seguridad, ya previsto, antes de datos reales o PII.
