# Matriz de pruebas — flujos de admin (`/admin`) — Fase 1

| Campo | Valor |
|-------|-------|
| **Propósito** | Plan de aceptación y evidencia documental para el panel `/admin`: acceso por pantalla y rol, casos por flujo operativo y casos RLS/Storage a ejecutar con la clave `anon`. |
| **Fase** | 1 — documental. No hay app, políticas SQL ni entorno que ejecutar. |
| **Fecha** | 11 nov 2026 (America/Mexico_City, UTC-6) |
| **Autor** | Tester Sistema |
| **Audiencia** | QA Sistema, Gerente Sistema, Seguridad (Gerente Seguridad / Security Engineer / Security Reviewer) |
| **Estado** | Plan documental. **Ejecución bloqueada** hasta que existan código de `/admin`, políticas SQL derivadas de SEGURIDAD §4 y un entorno no productivo (SEGURIDAD §0 gate, §1 «Preview»). Todos los casos están en `documental — no ejecutado`. |

**Fuentes leídas completas (rutas relativas a la raíz del repo):**

| Doc | Ruta | Uso en esta matriz |
|-----|------|--------------------|
| ADMIN_IA | `docs/arquitectura/ADMIN_IA.md` | Mapa de rutas, pantallas, «Permisos UI» (borrador) |
| SEGURIDAD | `docs/arquitectura/SEGURIDAD.md` | Contrato de controles: §2 roles, §3 cookies, §4 RLS + pruebas `anon`, §6 rate limit, §7 anti-manipulación, §8 webhook, §9 Storage, §10 checklist, §12–§14 |
| FLUJOS | `docs/arquitectura/FLUJOS.md` | Flujos §1–§6 |
| SCHEMA | `docs/arquitectura/SCHEMA.md` | Entidades, enums, matriz RLS de SCHEMA |
| STACK | `docs/arquitectura/STACK.md` | Contexto (no se reabre) |
| Skills | `.cursor/skills/sistema-tester/SKILL.md`, `.cursor/skills/sistema-qa/SKILL.md` | Negativos por rol, fail-closed, manipulación de campos, evidencia pass/fail |
| Complementarios (solo para huecos) | `docs/discovery/D2_ESTADOS.md`, `docs/arquitectura/CATALOGO.md`, `docs/arquitectura/PROPUESTA_RLS_SCHEMA.md` | Estados de pedido propuestos, reglas de publicación, propuesta RLS del Security Engineer |

No existía `docs/qa/` ni otra matriz de pruebas en el repo; este documento no duplica nada previo. Las «Pruebas de aceptación (clave `anon`)» de SEGURIDAD §4 / SCHEMA se **expanden** aquí (§4), no se sustituyen.

### Convenciones

- **Regla de precedencia:** la autorización real es la RLS de SEGURIDAD §4 (+ §2). La tabla «Permisos UI» de ADMIN_IA es borrador; si diverge, **gana SEGURIDAD** y la divergencia queda en §5.
- **Roles:** `sin sesión` = sin cookie/sesión válida; `manager` y `owner` = sesión válida + fila en `profiles` con `is_active = true` (SEGURIDAD §2). «No staff» = sesión válida pero sin perfil, inactivo o rol desconocido: se trata igual que sin sesión.
- **Tipo:** `positivo` · `negativo` (permiso / validación) · `fail-closed` · `anti-manipulación`.
- **Prioridad:** `bloqueante` (impide firmar SEGURIDAD §10 o liberar el módulo) · `importante` · `menor`.
- **Estado** de todos los casos: `documental — no ejecutado`.
- Los pasos son de alto nivel: describen la intención de la prueba, no scripts ni payloads.

---

## 1. Resumen

| Bloque | IDs | Casos |
|--------|-----|-------|
| §2 Pantallas × roles | `ADM-UI-01` … `ADM-UI-21` | 21 filas |
| §3 Flujos operativos | `ADM-AUTH`, `ADM-DASH`, `ADM-PED`, `ADM-CLI`, `ADM-CAT`, `ADM-PER`, `ADM-ING`, `ADM-EGR`, `ADM-CFDI`, `ADM-EQP`, `ADM-WEB` | 125 casos (AUTH 14, DASH 3, PED 24, CLI 5, CAT 13, PER 14, ING 12, EGR 7, CFDI 8, EQP 13, WEB 12) |
| §4 RLS / Storage con clave `anon` | `RLS-*`, `STO-*` | 42 casos (33 tablas, 9 Storage) |
| §5 Huecos y bloqueantes | `H-01` … `H-20`, `Q-01` … `Q-16` | 20 huecos + 16 preguntas |

---

## 2. Matriz pantallas × roles

Leyenda: **→ login** = redirige a login sin renderizar datos · **403** = denegado con sesión válida · **R/W** = ver y operar · **R** = solo lectura.
Para *todas* las filas aplica además: sesión «no staff» (sin perfil / inactivo / rol desconocido) → mismo resultado que `sin sesión` (SEGURIDAD §2; FLUJOS §1).

| ID | Ruta (ADMIN_IA) | Propósito breve | Sin sesión | manager | owner | Notas / fuente |
|----|-----------------|-----------------|------------|---------|-------|----------------|
| ADM-UI-01 | `/admin/login` (o `/login` → redirect) | Acceso staff vía Supabase Auth | Accesible | Si ya tiene sesión: definir si redirige al dashboard (Q-01) | Igual que manager | Rate limit login (SEGURIDAD §6); cookies HttpOnly/Secure/SameSite=Lax (§3); sin registro self-serve (§2). Ruta exacta abierta (ADMIN_IA §0). |
| ADM-UI-02 | `/admin` | Dashboard: pedidos abiertos, personalizados nuevos, CFDI pendientes, cobros del día | → login | R | R | Sin stock ni KPIs de marketing (ADMIN_IA §1). |
| ADM-UI-03 | `/admin/pedidos` | Lista con filtros estado/canal/línea/express | → login | R/W | R/W | Automotriz como chip/filtro, no default (ADMIN_IA «Navegación»). |
| ADM-UI-04 | `/admin/pedidos/nuevo` | Alta multicanal | → login | R/W | R/W | Validar inputs; no inventar precios (ADMIN_IA §3; SEGURIDAD §7). |
| ADM-UI-05 | `/admin/pedidos/[orderId]` | Detalle, estados, cobros, CFDI, Stripe IDs | → login | R/W | R/W | Stripe solo lectura (ADMIN_IA «Fuera de /admin»). Un `orderId` inexistente/ajeno no debe filtrar datos. |
| ADM-UI-06 | `/admin/clientes` | Lista de clientes | → login | R/W | R/W | PII; anon denegado en RLS (SEGURIDAD §4). |
| ADM-UI-07 | `/admin/clientes/[customerId]` | Ficha + crédito/fiados + historial | → login | R/W | R/W | Saldo derivado, no campo suelto (SCHEMA `customers`). |
| ADM-UI-08 | `/admin/catalogo` | Productos por catálogo (105 / 56 / automotriz) | → login | R/W | R/W | Sin stock (ADMIN_IA §6). |
| ADM-UI-09 | `/admin/catalogo/productos/[productId]` | Ficha, precios, fotos, promo asociada | → login | R/W | R/W | Fotos a `product-images`, escritura solo staff (SEGURIDAD §9). |
| ADM-UI-10 | `/admin/catalogo/promos` | CRUD promos, `visible_web` default off | → login | R/W | R/W | `visible_web = true` no expone nada al público en Fase 1 (SCHEMA `promos`). Quién activa `visible_web`: Q-05. |
| ADM-UI-11 | `/admin/catalogo/importar` | Import Excel → maestro | → login | R/W | R/W | Columnas pendientes de D1 (H-12). Granularidad owner/manager: Q-05. |
| ADM-UI-12 | `/admin/personalizados` | Inbox `custom_requests` | → login | R/W | R/W | Anon **nunca** lee el inbox (SEGURIDAD §4; FLUJOS §3). |
| ADM-UI-13 | `/admin/personalizados/[requestId]` | Detalle, imágenes, handoff WA, convertir a pedido | → login | R/W | R/W | Imágenes de `custom-samples` solo vía descarga firmada / proxy (SEGURIDAD §9). |
| ADM-UI-14 | `/admin/ingresos` | Lista / filtros de ingresos | → login | R/W | R/W | Separado de egresos (ADMIN_IA principios). R3: manager ve finanzas (riesgo aceptado, SEGURIDAD §11). |
| ADM-UI-15 | `/admin/ingresos/nuevo` | Alta cobro / anticipo / nota / Stripe manual | → login | R/W | R/W | Montos > 0; whitelist de campos (SEGURIDAD §7). |
| ADM-UI-16 | `/admin/egresos` | Lista de egresos | → login | R/W | R/W | Ruta y tabla distintas de ingresos (FLUJOS §4.2). |
| ADM-UI-17 | `/admin/egresos/nuevo` | Alta gasto proveedor | → login | R/W | R/W | Montos > 0. |
| ADM-UI-18 | `/admin/cfdi` | Cola pendientes + vínculo Kubox | → login | R/W | R/W | También puede vivir en detalle de pedido (ADMIN_IA §10). Sin scraper Kubox. |
| ADM-UI-19 | `/admin/equipo` (vista lista) | Ver equipo | → login | **403** en UI (ADMIN_IA §11 «solo owner»). Nota: RLS **sí** permite a staff `SELECT` de `profiles` (SEGURIDAD §4) → ver H-07 | R/W | Divergencia documentada: UI más restrictiva que RLS en lectura; aceptable (SEGURIDAD §14: «authz real = RLS»). |
| ADM-UI-20 | `/admin/equipo` (alta / activar / desactivar / cambiar rol) | Mutaciones sensibles de `profiles` | → login | **403** en UI **y** denegado en RLS | Permitido | Enforcing en RLS, no solo UI (SEGURIDAD §2, §4, §12.7). |
| ADM-UI-21 | Cualquier ruta `/admin/*` inexistente o deep link | Fail-closed del shell | → login | 404/403 sin datos | 404/403 sin datos | Middleware protege `/admin` (STACK «Next.js»). |

---

## 3. Matriz de flujos operativos

Columnas: ID · Módulo · Flujo (fuente) · Precondición · Pasos (alto nivel) · Resultado esperado · Rol(es) · Tipo · Prioridad · Estado.
Abreviatura de estado: todos `documental — no ejecutado`.

### 3.1 Auth → admin (FLUJOS §1; SEGURIDAD §1–§3, §5, §6)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-AUTH-01 | Auth | Login correcto | Usuario owner activo | Iniciar sesión con credenciales válidas | Entra al shell `/admin`; menú incluye Equipo | owner | positivo | bloqueante | documental — no ejecutado |
| ADM-AUTH-02 | Auth | Login correcto | Usuario manager activo | Iniciar sesión | Entra al shell; menú **sin** Equipo (ADMIN_IA «Navegación») | manager | positivo | bloqueante | documental — no ejecutado |
| ADM-AUTH-03 | Auth | Sin sesión | Sin cookie | Abrir `/admin` y cada ruta de §2 por deep link | Redirige a login; no se renderiza ni se descarga dato de negocio | sin sesión | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-04 | Auth | Sesión sin perfil | Usuario Auth sin fila en `profiles` | Iniciar sesión y abrir `/admin` | Denegado igual que no autenticado (SEGURIDAD §2) | no staff | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-05 | Auth | Perfil inactivo | `profiles.is_active = false` | Iniciar sesión y abrir `/admin` | Denegado | no staff | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-06 | Auth | Rol inválido | `role` fuera de `{owner, manager}` (si el tipo lo permite) | Iniciar sesión y abrir `/admin` | Denegado | no staff | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-07 | Auth | Desactivación en caliente | Manager con sesión abierta; owner lo desactiva | Manager navega / ejecuta una mutación tras la desactivación | Siguiente acceso o mutación denegada (helpers evalúan `profiles`, no claims, SEGURIDAD §2). Ventana tolerada: Q-02 | manager, owner | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-08 | Auth | Rate limit login | Umbral configurado (5–10 fallos / IP / 15 min) | Repetir intentos fallidos desde la misma IP + email | `429` + `Retry-After` al superar el umbral; se aplica antes de Auth (FLUJOS §1; SEGURIDAD §6) | sin sesión | negativo | bloqueante | documental — no ejecutado |
| ADM-AUTH-09 | Auth | Mensajes genéricos | — | Fallar login con email existente y con email inexistente | Mismo mensaje; no permite enumerar cuentas (SEGURIDAD §11 R2) | sin sesión | negativo | importante | documental — no ejecutado |
| ADM-AUTH-10 | Auth | Cookies de sesión | Entorno con HTTPS | Inspeccionar cookies tras login | HttpOnly + Secure + SameSite=Lax (mínimo); sin access token en `localStorage` (SEGURIDAD §3) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-AUTH-11 | Auth | Secretos fuera del cliente | Build desplegado | Revisar bundle y variables públicas | Solo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; ninguna service/secret key (SEGURIDAD §3, §5) | — | fail-closed | bloqueante | documental — no ejecutado |
| ADM-AUTH-12 | Auth | Sin registro público | — | Buscar ruta/flujo de alta self-serve de staff | No existe; alta solo controlada (SEGURIDAD §2) | sin sesión | negativo | bloqueante | documental — no ejecutado |
| ADM-AUTH-13 | Auth | HTTPS | Producción | Abrir `/admin` por HTTP | 301 a HTTPS; HSTS presente con `max-age` ≥ 15552000 (SEGURIDAD §1) | — | positivo | bloqueante | documental — no ejecutado |
| ADM-AUTH-14 | Auth | Preview aislado | Deploy preview | Revisar envs del preview | Secretos y DB separados de prod (SEGURIDAD §1, §11 R9) | — | negativo | importante | documental — no ejecutado |

### 3.2 Dashboard (ADMIN_IA §1)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-DASH-01 | Dashboard | Cola operativa | Datos de prueba (no PII real) | Abrir `/admin` | Muestra pedidos abiertos, personalizados nuevos, CFDI pendientes, cobros del día | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-DASH-02 | Dashboard | Exclusiones | — | Revisar widgets | Sin stock ni KPIs de marketing web | owner, manager | negativo | menor | documental — no ejecutado |
| ADM-DASH-03 | Dashboard | Paridad de rol | — | Comparar dashboard owner vs manager | Mismo contenido operativo (SEGURIDAD §2: operación igual) | owner, manager | positivo | menor | documental — no ejecutado |

### 3.3 Pedido multicanal (FLUJOS §2; ADMIN_IA §2–§4; D2 propuesta)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-PED-01 | Pedidos | Alta con cliente existente | Cliente en maestro | Crear pedido canal `whatsapp` con una línea de catálogo | `orders` + `order_items` creados; estado inicial `draft` (D2 §3); `created_by` = usuario de sesión | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PED-02 | Pedidos | Alta con cliente nuevo | Cliente no existe | Crear cliente desde el alta y el pedido | Se crea `customers` y el pedido ligado (FLUJOS §2) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PED-03 | Pedidos | Canales internos | — | Repetir alta con `phone` y `counter` | Mismo modelo `orders`; `channel` correcto (FLUJOS §2). Alta manual con canal `web`: Q-06 | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-04 | Pedidos | Snapshot de cliente | Pedido guest/mostrador sin `customer_id` | Crear pedido solo con snapshot de nombre/teléfono | Se guarda `customer_name_snapshot` (SCHEMA `orders`) | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-PED-05 | Pedidos | Precio desde maestro | Producto con `unit_price` | Agregar línea de catálogo | `order_items.unit_price` = snapshot del maestro; no se inventa precio (ADMIN_IA §3). Si cambia el maestro después, el snapshot no cambia | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PED-06 | Pedidos | Totales | Pedido con varias líneas | Guardar pedido | `line_total`, `subtotal`, `total` consistentes; moneda `MXN` (SCHEMA) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-07 | Pedidos | Línea libre | — | Agregar línea sin producto (personalizado) | `product_id` nulo, `is_custom = true`, descripción requerida (SCHEMA `order_items`) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-08 | Pedidos | Validación de inputs | — | Enviar cantidad ≤ 0, monto negativo o enum de canal/estado inválido | Rechazado en servidor con error de validación (SEGURIDAD §7 Admin) | owner, manager | negativo | bloqueante | documental — no ejecutado |
| ADM-PED-09 | Pedidos | Mass-assignment | — | Enviar en el alta campos fuera de whitelist (p. ej. `created_by` de otro usuario, IDs Stripe, `order_number` arbitrario) | Ignorados o rechazados; `created_by` siempre = sesión (SEGURIDAD §7 «whitelist de campos por acción») | owner, manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-PED-10 | Pedidos | Precio de línea de catálogo manipulado | — | Alterar desde el cliente el precio de una línea de catálogo | El servidor no acepta precio inventado para producto de maestro (ADMIN_IA §3). Si se permite ajuste manual interno: Q-03 | owner, manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-PED-11 | Pedidos | Automotriz permitido | Cliente con `is_automotive_existing = true` | Crear pedido con línea automotriz | `order_items.is_automotive = true`; `line_focus` coherente (FLUJOS §2) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-12 | Pedidos | Automotriz sin condición | Cliente sin flag automotriz y sin confirmación interna | Intentar línea automotriz | Bloquea o exige confirmación interna (ADMIN_IA §3). Mecanismo de «confirmación» no definido: Q-04 | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-PED-13 | Pedidos | Express | — | Crear pedido express con `promised_by` | `is_express = true` + `promised_by` guardados; visibles en lista (FLUJOS §2). D2 propone `is_express` encendido por defecto (pendiente OK dueño) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-14 | Pedidos | Sin stock | — | Crear, confirmar y cerrar pedido | Ningún paso descuenta ni reserva stock; no hay UI de stock (FLUJOS §2) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-PED-15 | Pedidos | Transición válida | Pedido en `draft` | Avanzar por la máquina de estados | Solo transiciones definidas (FLUJOS §2 provisional / D2 §2) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PED-16 | Pedidos | Transición inválida | Pedido en `draft` o `closed` | Intentar saltos no permitidos (p. ej. `draft → closed`, `closed → cancelled`) aun saltándose la UI | Rechazado en servidor, no solo oculto en UI. **Depende de cerrar D2** (H-05) | owner, manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-PED-17 | Pedidos | Datos mínimos a `confirmed` | Pedido express sin `promised_by` o sin cobro/fiado | Intentar confirmar | Rechazado (D2 §4, propuesta) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-PED-18 | Pedidos | Cancelación | Pedido no terminal | Cancelar con motivo | Estado `cancelled`; motivo en `notes_internal` (D2 §4); reembolsos → Finanzas | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-19 | Pedidos | Auditoría | — | Cambiar estado | `updated_at` actualizado; actor trazable (FLUJOS §2). Log ampliado: H-15 | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-PED-20 | Pedidos | Lista y filtros | Pedidos de varios canales/líneas | Filtrar por estado, canal, línea, express | Resultados correctos; automotriz no es filtro por defecto | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-PED-21 | Pedidos | Detalle completo | Pedido web con cobro y CFDI | Abrir detalle | Muestra líneas, ingresos ligados, CFDI, Stripe IDs (solo lectura) (ADMIN_IA §4) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PED-22 | Pedidos | Actor DB en admin | — | Observar mutaciones de pedido desde el navegador | Se hacen con sesión staff bajo RLS; nunca service role desde browser (FLUJOS §5 «Actor DB») | owner, manager | fail-closed | bloqueante | documental — no ejecutado |
| ADM-PED-23 | Pedidos | Paridad de rol | — | Manager ejecuta alta, cambio de estado y cancelación | Permitido igual que owner (FLUJOS §2; SEGURIDAD §2) | manager | positivo | importante | documental — no ejecutado |
| ADM-PED-24 | Pedidos | Recurso inexistente | — | Abrir `/admin/pedidos/[id]` con id inexistente | Error/404 sin filtrar datos | owner, manager | negativo | menor | documental — no ejecutado |

### 3.4 Clientes (ADMIN_IA §5; SCHEMA `customers`)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-CLI-01 | Clientes | Lista | Clientes de prueba | Abrir lista | Nombre, teléfono, crédito sí/no, flag automotriz existente | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CLI-02 | Clientes | Ficha | Cliente con pedidos y cobros | Abrir ficha | Historial de pedidos; saldo **derivado** de pedidos + ingresos (SCHEMA) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CLI-03 | Clientes | Alta/edición | — | Crear y editar cliente | Persistido con validación de inputs (SEGURIDAD §7) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CLI-04 | Clientes | Flags sensibles | — | Marcar `allows_credit` / `is_automotive_existing` | Fase 1: permitido a staff (SEGURIDAD §2). Granularidad fina: Q-05 | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-CLI-05 | Clientes | PII fuera de público | — | Ver casos `RLS-CUS-*` | Anon no accede a `customers` | sin sesión | fail-closed | bloqueante | documental — no ejecutado |

### 3.5 Catálogo maestro (FLUJOS §6; ADMIN_IA §6; CATALOGO)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-CAT-01 | Catálogo | Lista | Catálogos 105, 56 y automotriz | Abrir lista y filtrar por catálogo | Muestra precio, `visible_web`, activo; automotriz visible como filtro secundario | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CAT-02 | Catálogo | Ficha | Producto existente | Editar precio, ficha técnica | Guardado; dinero `numeric(12,2)` MXN | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CAT-03 | Catálogo | Fotos | — | Subir foto de producto | Se guarda en `product-images`; escritura solo staff (SEGURIDAD §9) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CAT-04 | Catálogo | Default `visible_web` | — | Crear producto sin tocar `visible_web` | Queda `false` (SCHEMA nota de `products`; CATALOGO §3.1 pide default explícito: H-09) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-CAT-05 | Catálogo | Automotriz no publicable | Producto automotriz | Intentar encender `visible_web` (UI y fuera de UI) | Imposible (CATALOGO §2: constraint + RLS + UI). Aun si se lograra, RLS anon no lo devuelve (`RLS-PRD-02`). Constraint aún no está en SCHEMA: H-09 | owner, manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-CAT-06 | Catálogo | Inactivo / no web | Producto `is_active = false` o `visible_web = false` | Ver casos `RLS-PRD-*` | No sale a lectura pública | — | fail-closed | bloqueante | documental — no ejecutado |
| ADM-CAT-07 | Catálogo | Promos CRUD | — | Crear, editar, desactivar promo | Persistido; `visible_web` default `false` (ADMIN_IA §6) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CAT-08 | Catálogo | Promo con `visible_web = true` | Promo activa | Encender `visible_web` | Sigue invisible al público en Fase 1 (SCHEMA `promos`; `RLS-PRM-02`) | owner, manager | negativo | bloqueante | documental — no ejecutado |
| ADM-CAT-09 | Catálogo | Promo con un solo padre | — | Crear promo con `product_id` y `catalog_id` a la vez, o con ninguno | Rechazado (SCHEMA «uno de los dos»; CATALOGO §3.6 pide constraint: H-09) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-CAT-10 | Catálogo | Importar Excel | Archivos del dueño (D1) | Importar | Carga al maestro, sin columnas de stock (ADMIN_IA §6). **Bloqueado**: columnas no definidas (H-12) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CAT-11 | Catálogo | Import sin precio | Fila sin precio | Importar | No se inventa precio; fila importada sin publicar (CATALOGO §3.4). SCHEMA aún no declara `unit_price` nullable: H-10 | owner, manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-CAT-12 | Catálogo | Duplicado `external_id` | Producto existente | Importar/crear mismo `external_id` en el mismo catálogo | Rechazado (SCHEMA «único por catálogo») | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-CAT-13 | Catálogo | Sin stock | — | Revisar ficha, lista e import | Ningún campo de stock (SCHEMA; STACK) | owner, manager | negativo | menor | documental — no ejecutado |

### 3.6 Personalizados → WhatsApp → pedido + anticipo 50% (FLUJOS §3; ADMIN_IA §7)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-PER-01 | Personalizados | Intake llega al inbox | Form público envía solicitud válida | Abrir `/admin/personalizados` | Solicitud con `status = received`, `order_id` nulo; muestra status, contacto, fecha | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PER-02 | Personalizados | Intake forzado | Payload público intenta `status = converted` u `order_id` | Enviar desde el form/API pública | Rechazado o forzado a `received` / nulo (FLUJOS §3; SEGURIDAD §7). Ver `RLS-CR-02/03` | sin sesión | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-PER-03 | Personalizados | Rate limit intake | Umbral 5 / IP / 15 min y 3 / teléfono / hora | Enviar solicitudes repetidas | `429` antes de escribir en DB o Storage (FLUJOS §3; SEGURIDAD §6) | sin sesión | negativo | bloqueante | documental — no ejecutado |
| ADM-PER-04 | Personalizados | Validación intake | — | Enviar enums inválidos (`spring_type`, `unit`), contacto vacío, notas excesivas | Rechazado (SEGURIDAD §7 «Form personalizados») | sin sesión | negativo | importante | documental — no ejecutado |
| ADM-PER-05 | Personalizados | Upload de imágenes | — | Subir muestra fuera de upload firmado, o con MIME/tamaño fuera de allowlist | Rechazado; solo upload firmado con TTL corto y path opaco (SEGURIDAD §9) | sin sesión | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-PER-06 | Personalizados | Sin lectura pública | Solicitud recién insertada | Intentar leer la fila propia desde lo público | Denegado (FLUJOS §3; `RLS-CR-04`) | sin sesión | fail-closed | bloqueante | documental — no ejecutado |
| ADM-PER-07 | Personalizados | Detalle e imágenes | Solicitud con fotos | Abrir detalle | Campos canónicos; imágenes vía descarga firmada / proxy admin (SEGURIDAD §9) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PER-08 | Personalizados | Handoff WhatsApp | — | Usar CTA «abrir WhatsApp» | Abre WA sin PII sensible en la URL (SEGURIDAD §11 R12). Copy: Personalizados (FLUJOS §3) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PER-09 | Personalizados | Cambio de status | Solicitud `received` | Avanzar a `sent_to_whatsapp` / `quoted` / `abandoned` | Staff puede UPDATE (SEGURIDAD §4). Transiciones válidas no definidas: Q-07 | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-PER-10 | Personalizados | Convertir a pedido | Solicitud cotizada | Convertir | Pedido custom creado (puede abrir en `quoted`, D2 §3); `custom_requests.order_id` ligado y `status = converted`; mismo pedido, no flujo paralelo (D2 §6) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PER-11 | Personalizados | Anticipo 50% | Pedido custom convertido | Registrar `income_entries.kind = deposit_50` ligado al pedido | Pedido puede pasar `awaiting_deposit → confirmed` (FLUJOS §3) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-PER-12 | Personalizados | Confirmar sin anticipo | Pedido custom sin `deposit_50` | Intentar `confirmed` | Rechazado (D2 §3 «No se confirma sin anticipo 50%», propuesta) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-PER-13 | Personalizados | Precio no fijo en web | — | Revisar form público | No muestra precio (FLUJOS §3) | sin sesión | negativo | menor | documental — no ejecutado |
| ADM-PER-14 | Personalizados | Borrado | Solicitud existente | Staff intenta eliminar | Comportamiento no definido («DELETE según política» vs «denegar hasta que exista»): Q-08 | owner, manager | negativo | menor | documental — no ejecutado |

### 3.7 Ingresos (FLUJOS §4.1; ADMIN_IA §8)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-ING-01 | Ingresos | Alta por tipo | Pedido existente | Registrar un ingreso de cada `kind` (`payment`, `deposit_50`, `note_cash`, `stripe`, `credit_settlement`, `other`) | Persistido con `method` válido (`cash`/`transfer`/`stripe`/`other`) | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-ING-02 | Ingresos | Monto inválido | — | Registrar monto 0 o negativo | Rechazado (SCHEMA `amount > 0`; SEGURIDAD §7) | owner, manager | negativo | bloqueante | documental — no ejecutado |
| ADM-ING-03 | Ingresos | Enum inválido | — | Enviar `kind` o `method` fuera de catálogo | Rechazado | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-ING-04 | Ingresos | Nota = efectivo | — | Registrar `note_cash` | `method = cash` (SCHEMA nota). Si se acepta otro método: Q-09 | owner, manager | negativo | menor | documental — no ejecutado |
| ADM-ING-05 | Ingresos | Ligar a pedido | — | Registrar ingreso con y sin `order_id` | Ambos permitidos (`order_id` nullable); la UX prioriza ligar (ADMIN_IA §8) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-ING-06 | Ingresos | Abono a fiado | Cliente con / sin `allows_credit` | Registrar `credit_settlement` | Aplica a cliente con `allows_credit` (FLUJOS §4.1). Qué pasa sin flag: reglas de Finanzas pendientes (H-13) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-ING-07 | Ingresos | `recorded_by` | — | Enviar `recorded_by` de otro usuario | Ignorado; siempre = sesión (SEGURIDAD §7 whitelist) | owner, manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-ING-08 | Ingresos | Moneda | — | Enviar moneda distinta de MXN | Forzada/rechazada; `MXN` (SCHEMA) | owner, manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-ING-09 | Ingresos | Separación | Ingresos y egresos cargados | Abrir lista de ingresos | Solo ingresos; egresos no aparecen (FLUJOS §4.2) | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-ING-10 | Ingresos | Stripe manual vs webhook | Pedido web ya cobrado por webhook | Registrar ingreso `stripe` manual del mismo pago | No debe duplicar el cobro. Regla no definida en fuentes: Q-10 | owner, manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-ING-11 | Ingresos | Edición / borrado | Ingreso existente | Editar monto o borrar | Fase 1: CRUD staff (SEGURIDAD §4). Restricción fina de borrado / inmutabilidad: sugerencia §12, Q-05 | owner, manager | negativo | menor | documental — no ejecutado |
| ADM-ING-12 | Ingresos | Paridad de rol | — | Manager registra y consulta ingresos | Permitido (SEGURIDAD §2; R3 aceptado) | manager | positivo | menor | documental — no ejecutado |

### 3.8 Egresos (FLUJOS §4.2; ADMIN_IA §9)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-EGR-01 | Egresos | Alta | — | Registrar gasto con categoría, proveedor, monto, método | Persistido en `expense_entries` | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-EGR-02 | Egresos | Monto inválido | — | Monto 0 o negativo | Rechazado (SCHEMA `amount > 0`) | owner, manager | negativo | bloqueante | documental — no ejecutado |
| ADM-EGR-03 | Egresos | Método no permitido | — | Enviar `method = stripe` | Rechazado (enum `cash`/`transfer`/`other`, SCHEMA) | owner, manager | negativo | menor | documental — no ejecutado |
| ADM-EGR-04 | Egresos | Categoría | — | Enviar categoría fuera de `wire`/`stones`/`tools`/`other` | FLUJOS §4.2 la muestra como lista cerrada; SCHEMA dice «text, ej.». Resultado esperado depende de Q-11 | owner, manager | negativo | menor | documental — no ejecutado |
| ADM-EGR-05 | Egresos | Sin pedido | — | Registrar gasto sin `order_id` | Permitido (FLUJOS §4.2) | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-EGR-06 | Egresos | `recorded_by` | — | Enviar `recorded_by` ajeno | Ignorado; = sesión | owner, manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-EGR-07 | Egresos | Separación | — | Navegar módulos | Ruta y tabla distintas de ingresos (ADMIN_IA principios) | owner, manager | positivo | importante | documental — no ejecutado |

### 3.9 CFDI / Kubox (FLUJOS §4.3; ADMIN_IA §10)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-CFDI-01 | CFDI | Vincular timbrado | Pedido; CFDI timbrado en Kubox (fuera del sistema) | Pegar `uuid_cfdi`, `serie_folio`, `status = stamped` | `cfdi_links` ligado a `order_id`; `recorded_by` = sesión | owner, manager | positivo | bloqueante | documental — no ejecutado |
| ADM-CFDI-02 | CFDI | Estados | — | Enviar status fuera de `pending`/`stamped`/`cancelled` | Rechazado | owner, manager | negativo | importante | documental — no ejecutado |
| ADM-CFDI-03 | CFDI | Adjuntos | — | Subir PDF/XML | Guardado en `cfdi-attachments`, solo staff (SEGURIDAD §9) | owner, manager | positivo | importante | documental — no ejecutado |
| ADM-CFDI-04 | CFDI | Adjunto fuera de público | Adjunto existente | Ver `STO-CFDI-*` | Anon no lee ni lista | sin sesión | fail-closed | bloqueante | documental — no ejecutado |
| ADM-CFDI-05 | CFDI | Cola | CFDI `pending` | Abrir `/admin/cfdi` y detalle de pedido | Aparece en la cola y en el pedido | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-CFDI-06 | CFDI | No bloquea cierre | Pedido sin CFDI | Cerrar pedido | Permitido (D2 §4) | owner, manager | positivo | menor | documental — no ejecutado |
| ADM-CFDI-07 | CFDI | Sin automatización Kubox | — | Revisar app | Sin scraper ni API no oficial (FLUJOS §4.3) | — | negativo | importante | documental — no ejecutado |
| ADM-CFDI-08 | CFDI | Validación de formato | — | Pegar UUID con formato inválido | Validación de formato no especificada en fuentes: Q-12 | owner, manager | negativo | menor | documental — no ejecutado |

### 3.10 Equipo / `profiles` (SEGURIDAD §2, §4; ADMIN_IA §11; FLUJOS §1)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-EQP-01 | Equipo | Ver equipo | — | Owner abre `/admin/equipo` | Lista del equipo | owner | positivo | importante | documental — no ejecutado |
| ADM-EQP-02 | Equipo | Alta de manager | — | Owner invita / da de alta | Alta controlada; ninguna service key en el cliente (ADMIN_IA §11; SEGURIDAD §2). Mecanismo: Q-13 | owner | positivo | bloqueante | documental — no ejecutado |
| ADM-EQP-03 | Equipo | Desactivar | Manager activo | Owner pone `is_active = false` | Manager pierde acceso (enlaza `ADM-AUTH-07`) | owner | positivo | bloqueante | documental — no ejecutado |
| ADM-EQP-04 | Equipo | Reactivar | Manager inactivo | Owner reactiva | Acceso restaurado | owner | positivo | importante | documental — no ejecutado |
| ADM-EQP-05 | Equipo | Cambiar rol | — | Owner cambia `role` | Permitido solo a owner (SEGURIDAD §2) | owner | positivo | importante | documental — no ejecutado |
| ADM-EQP-06 | Equipo | Pantalla para manager | — | Manager abre `/admin/equipo` por deep link | 403; menú no lo muestra (ADMIN_IA §11) | manager | negativo | bloqueante | documental — no ejecutado |
| ADM-EQP-07 | Equipo | Auto-promoción | Manager con sesión | Intentar cambiar su propio `role` a `owner` fuera de la UI | Denegado en RLS (SEGURIDAD §2 «Auto-promoción → denegar») | manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-EQP-08 | Equipo | Desactivar a otro | Manager con sesión | Intentar `is_active = false` sobre otro perfil fuera de la UI | Denegado en RLS | manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-EQP-09 | Equipo | Cambiar `is_active` propio | Manager con sesión | Intentar modificar su `is_active` | Denegado en RLS | manager | anti-manipulación | importante | documental — no ejecutado |
| ADM-EQP-10 | Equipo | Lectura de `profiles` por manager | Manager con sesión | Consultar `profiles` vía API (no UI) | **Permitido** por RLS (SEGURIDAD §4 «SELECT equipo»), aunque la UI devuelva 403. Divergencia aceptada (H-07) | manager | positivo | menor | documental — no ejecutado |
| ADM-EQP-11 | Equipo | Mass-assignment de rol | — | En cualquier otra acción (p. ej. editar nombre), incluir `role` / `is_active` en el payload | Campos ignorados/rechazados (SEGURIDAD §7 «No mass-assignment de `profiles.role`») | owner, manager | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-EQP-12 | Equipo | Último owner | Un solo owner activo | Owner intenta desactivarse o bajarse a manager | Comportamiento no definido; riesgo de quedar sin owner: Q-14 | owner | negativo | importante | documental — no ejecutado |
| ADM-EQP-13 | Equipo | Sin secretos en la pantalla | — | Revisar `/admin/equipo` y su red | No expone service keys (ADMIN_IA §11) | owner | fail-closed | bloqueante | documental — no ejecutado |

### 3.11 Stub web + Stripe — puntos que tocan al admin (FLUJOS §5; SEGURIDAD §7, §8)

| ID | Módulo | Flujo | Precondición | Pasos | Resultado esperado | Rol(es) | Tipo | Prioridad | Estado |
|----|--------|-------|--------------|-------|--------------------|---------|------|-----------|--------|
| ADM-WEB-01 | Web→Pedidos | Precio manipulado | Producto público | Crear Checkout enviando `unit_price` / `total` alterados | Servidor los ignora; snapshot en `order_items` = precio de DB; en admin el pedido refleja el precio del maestro | sin sesión → owner/manager (verificación) | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-WEB-02 | Web→Pedidos | Producto no público | Producto automotriz, inactivo o `visible_web = false` | Intentar incluirlo en el carrito | Rechazado; no se crea pedido | sin sesión | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-WEB-03 | Web→Pedidos | `is_automotive` en payload | — | Enviar `is_automotive = true` | Ignorado; `order_items.is_automotive` nunca de origen web (SCHEMA; FLUJOS §5) | sin sesión | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-WEB-04 | Web→Pedidos | Cantidad y moneda | — | Cantidad ≤ 0, sobre el tope, o moneda ≠ MXN | Rechazado / forzado a MXN. Valor del tope no definido: Q-15 | sin sesión | negativo | importante | documental — no ejecutado |
| ADM-WEB-05 | Web→Pedidos | Actor DB del alta | — | Crear Checkout válido | Pedido `draft` creado por Route Handler con service role; `created_by` nulo; visible en admin canal `web` | sin sesión → owner/manager | positivo | bloqueante | documental — no ejecutado |
| ADM-WEB-06 | Web→Pedidos | Success URL | Pago sin webhook | Abrir success URL | El pedido **no** pasa a pagado/`confirmed` (SEGURIDAD §7, §8) | sin sesión | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-WEB-07 | Web→Ingresos | Webhook firmado | Pago completado | Recibir `checkout.session.completed` con firma válida | Pedido `confirmed` + `income_entries.kind = stripe` vía service role | — | positivo | bloqueante | documental — no ejecutado |
| ADM-WEB-08 | Web→Ingresos | Webhook sin firma | — | Enviar evento sin firma o con firma inválida | Sin escrituras (SEGURIDAD §8) | — | fail-closed | bloqueante | documental — no ejecutado |
| ADM-WEB-09 | Web→Ingresos | Replay | Evento ya procesado | Reenviar el mismo evento | Sin cobro duplicado (idempotencia por `event.id` / session / payment intent) | — | anti-manipulación | bloqueante | documental — no ejecutado |
| ADM-WEB-10 | Web→Ingresos | Evento fuera de allowlist | — | Enviar tipo de evento no manejado | Ignorado sin escrituras (SEGURIDAD §8) | — | negativo | importante | documental — no ejecutado |
| ADM-WEB-11 | Web | Rate limit checkout | Umbral 5–10 / IP / 15 min | Crear sesiones repetidas | `429` + `Retry-After` antes de Stripe/DB | sin sesión | negativo | bloqueante | documental — no ejecutado |
| ADM-WEB-12 | Web | Promos no consultadas | Promo activa con `visible_web = true` | Hacer checkout del producto | Sin descuento de promo; la API pública no consulta `promos` (FLUJOS §5) | sin sesión | negativo | importante | documental — no ejecutado |

---

## 4. Matriz RLS y Storage — pruebas con clave `anon`

**Origen:** SEGURIDAD §4 (matriz y «Pruebas de aceptación (clave `anon`)»), §9 (Storage), §10.4 y §10.10; replicado en la matriz RLS de SCHEMA.
**Reglas de ejecución:** el caso negativo se corre **solo** con la clave pública `anon` (sin sesión) o con `anon` + JWT de un usuario «no staff». **Nunca** con `service_role` (bypasea RLS, SEGURIDAD §4). El esperado staff se corre con sesión real de owner / manager.
**Dependencias de todas las filas:** (a) re-revisión de Security Reviewer sobre SCHEMA/FLUJOS (SEGURIDAD §14; ver H-01); (b) Security Engineer traduce §4 a SQL; (c) entorno no productivo sin PII real (gate §0).
**Estado de todas las filas:** `documental — no ejecutado`.

### 4.1 Tablas

| ID | Recurso | Operación | Esperado clave `anon` (sin sesión) | Esperado staff | Criterio de evidencia | Fuente | Estado |
|----|---------|-----------|-------------------------------------|----------------|----------------------|--------|--------|
| RLS-CAT-01 | `catalogs` | SELECT | Solo filas `is_public = true`; catálogo automotriz ausente | CRUD (owner y manager) | Conteo anon = catálogos públicos; cero filas con `line = automotriz` | §4 | documental — no ejecutado |
| RLS-CAT-02 | `catalogs` | INSERT / UPDATE / DELETE | Denegado (no hay política que lo permita) | CRUD | Error de permisos o 0 filas afectadas | §4 fail-closed | documental — no ejecutado |
| RLS-PRD-01 | `products` | SELECT | Solo `visible_web AND is_active AND` línea/catálogo público | CRUD | Todas las filas devueltas cumplen las tres condiciones | §4 | documental — no ejecutado |
| RLS-PRD-02 | `products` | SELECT automotriz | Cero filas automotriz, aun con `visible_web = true` forzado en datos de prueba | Visibles | Conteo = 0 | §4 prueba 1; CATALOGO §2 | documental — no ejecutado |
| RLS-PRD-03 | `products` | SELECT no web / inactivo | Cero filas con `visible_web = false` o `is_active = false` | Visibles | Conteo = 0 | §4 prueba 1 | documental — no ejecutado |
| RLS-PRD-04 | `products` | SELECT catálogo no público | Cero filas de producto `multiusos` en catálogo con `is_public = false` | Visibles | Conteo = 0 (defensa en profundidad, «no confiar solo en un flag») | §4; H-08 | documental — no ejecutado |
| RLS-PRD-05 | `products` | INSERT / UPDATE / DELETE | Denegado | CRUD | Error / 0 filas | §4 fail-closed | documental — no ejecutado |
| RLS-IMG-01 | `product_images` | SELECT | Solo imágenes cuyo producto padre pasa el filtro público | CRUD | Ninguna fila de producto automotriz / no web, aun filtrando por `product_id` conocido | §4 (EXISTS al producto) | documental — no ejecutado |
| RLS-IMG-02 | `product_images` | INSERT / UPDATE / DELETE | Denegado | CRUD | Error / 0 filas | §4 fail-closed | documental — no ejecutado |
| RLS-PRM-01 | `promos` | SELECT | **Denegado / vacío** | CRUD | Error o 0 filas | §4 prueba 2 | documental — no ejecutado |
| RLS-PRM-02 | `promos` | SELECT con `visible_web = true` | Igual: denegado / vacío | CRUD | 0 filas aunque exista promo visible_web activa | §4; SCHEMA `promos` | documental — no ejecutado |
| RLS-PRM-03 | `promos` | INSERT / UPDATE / DELETE | Denegado | CRUD | Error / 0 filas | §4 | documental — no ejecutado |
| RLS-CUS-01 | `customers` | SELECT | Denegado / vacío | CRUD | 0 filas | §4 prueba 2 | documental — no ejecutado |
| RLS-CUS-02 | `customers` | INSERT / UPDATE / DELETE | Denegado | CRUD | Error / 0 filas | §4 | documental — no ejecutado |
| RLS-ORD-01 | `orders` | SELECT | Denegado / vacío | CRUD | 0 filas | §4 prueba 2 | documental — no ejecutado |
| RLS-ORD-02 | `orders` | INSERT | Denegado (altas web solo service role) | CRUD | Error de permisos; ninguna fila creada | §4; FLUJOS §5 | documental — no ejecutado |
| RLS-ORD-03 | `orders` | UPDATE / DELETE | Denegado | CRUD | 0 filas afectadas | §4 | documental — no ejecutado |
| RLS-OIT-01 | `order_items` | SELECT | Denegado / vacío | CRUD | 0 filas | §4 | documental — no ejecutado |
| RLS-OIT-02 | `order_items` | INSERT / UPDATE / DELETE | Denegado (writes públicos solo service role) | CRUD | Error / 0 filas | §4; §13 SCHEMA.5 | documental — no ejecutado |
| RLS-CR-01 | `custom_requests` | INSERT válido (solo columnas de allowlist) | Aceptado con `status = received`, `order_id` nulo | — | Fila creada (verificada por staff) con esos valores | §4 intent; SCHEMA allowlist | documental — no ejecutado |
| RLS-CR-02 | `custom_requests` | INSERT con `status = converted` (u otro ≠ `received`) | **Rechazado** (WITH CHECK) | — | Error; ninguna fila nueva | §4 prueba 3 | documental — no ejecutado |
| RLS-CR-03 | `custom_requests` | INSERT con `order_id` asignado | **Rechazado** (WITH CHECK) | — | Error; ninguna fila nueva | §4 prueba 3 | documental — no ejecutado |
| RLS-CR-04 | `custom_requests` | SELECT (inbox y fila propia recién insertada) | Denegado / vacío | SELECT | 0 filas para anon; staff ve el inbox | §4; FLUJOS §3 | documental — no ejecutado |
| RLS-CR-05 | `custom_requests` | UPDATE / DELETE | Denegado | UPDATE sí; DELETE: Q-08 | 0 filas afectadas para anon | §4 | documental — no ejecutado |
| RLS-CR-06 | `custom_requests` | INSERT con columnas fuera de allowlist | Rechazado o descartado (strip en API + CHECK en RLS) | — | El campo privilegiado no queda persistido | §4 intent; §7 | documental — no ejecutado |
| RLS-INC-01 | `income_entries` | SELECT / INSERT / UPDATE / DELETE | Denegado | CRUD (Stripe vía service role en servidor) | 0 filas / error | §4 prueba 2 | documental — no ejecutado |
| RLS-EXP-01 | `expense_entries` | SELECT / INSERT / UPDATE / DELETE | Denegado | CRUD | 0 filas / error | §4 prueba 2 | documental — no ejecutado |
| RLS-CFD-01 | `cfdi_links` | SELECT / INSERT / UPDATE / DELETE | Denegado | CRUD | 0 filas / error | §4 prueba 2 | documental — no ejecutado |
| RLS-PRF-01 | `profiles` | SELECT | Denegado / vacío | SELECT del equipo (owner y manager) | 0 filas anon | §4 prueba 2 | documental — no ejecutado |
| RLS-PRF-02 | `profiles` | UPDATE `role` / `is_active` | Denegado | **Solo owner**; manager denegado | Con sesión manager: 0 filas afectadas / error; con owner: éxito | §2, §4 | documental — no ejecutado |
| RLS-PRF-03 | `profiles` | INSERT | Denegado (sin self-serve) | Alta controlada (mecanismo: Q-13) | Error para anon y para manager | §2; PROPUESTA_RLS | documental — no ejecutado |
| RLS-NST-01 | Todas las tablas de negocio | Cualquier operación con JWT de usuario «no staff» (sin perfil / inactivo / rol inválido) | Mismo resultado que anon | — | Resultados idénticos a RLS-* anon | §2; SCHEMA «Staff =» | documental — no ejecutado |
| RLS-ALL-01 | Todas las tablas de negocio | Inventario de RLS | RLS habilitado en todas; ninguna tabla sin política queda abierta | — | Listado de tablas con RLS ON revisado por Seguridad | §4, §10.4 | documental — no ejecutado |

### 4.2 Storage (SEGURIDAD §9)

| ID | Recurso | Operación | Esperado clave `anon` | Esperado staff | Criterio de evidencia | Fuente | Estado |
|----|---------|-----------|------------------------|----------------|----------------------|--------|--------|
| STO-PIM-01 | `product-images` | Lectura de foto de producto web publicado | Permitida | Lectura y escritura | Objeto descargable | §9 | documental — no ejecutado |
| STO-PIM-02 | `product-images` | Lectura de foto de producto automotriz / no web | Denegada | Permitida | Error / 403 | §9; SCHEMA Storage. Mecanismo: Q-16 | documental — no ejecutado |
| STO-PIM-03 | `product-images` | Escritura / listing | Denegado | Escritura staff | Error / 403; sin listado de objetos no publicados | §9 | documental — no ejecutado |
| STO-CS-01 | `custom-samples` | Lectura directa | **Denegada** | Descarga firmada / proxy admin | Error / 403 | §4 prueba 4; §9 | documental — no ejecutado |
| STO-CS-02 | `custom-samples` | Upload firmado dentro de allowlist | Permitido (TTL corto, path opaco) | Permitido | Objeto creado en path opaco | §9 | documental — no ejecutado |
| STO-CS-03 | `custom-samples` | Upload sin firma, con firma vencida o MIME/tamaño fuera de allowlist | Denegado | — | Error; ningún objeto | §9 | documental — no ejecutado |
| STO-CS-04 | `custom-samples` | Listing | Denegado | Permitido | Sin listado | §9 | documental — no ejecutado |
| STO-CFDI-01 | `cfdi-attachments` | Lectura / listing | **Denegado** | Permitido | Error / 403 | §4 prueba 4; §9 | documental — no ejecutado |
| STO-CFDI-02 | `cfdi-attachments` | Escritura | Denegada | Permitida | Error / 403 | §9 | documental — no ejecutado |

---

## 5. Huecos y bloqueantes

### 5.1 Huecos / bloqueantes concretos

| ID | Hueco | Impacto en pruebas | Dueño |
|----|-------|--------------------|-------|
| H-01 | **Estado de §13.** El brief de Tester indica que los cambios de SEGURIDAD §13 no están aplicados. Al leer hoy, `SCHEMA.md` y `FLUJOS.md` declaran en su encabezado «aplicados los cambios obligatorios» y ya contienen la matriz tabla × anon × staff, `product_images`, deny de `promos`, allowlist + WITH CHECK, pedidos web solo service role, `profiles` solo owner, rate limit en §1/§3 y anti-tampering en §5. Pero SEGURIDAD §14 sigue en **APROBADO CON CAMBIOS** y exige re-revisión de Security Reviewer, que no consta. | Esta matriz toma SEGURIDAD §4 como contrato y no da §13 por cerrado hasta que Seguridad lo re-revise. | Seguridad (Reviewer) / Gerente Sistema |
| H-02 | **No hay SQL de RLS** ni tests `anon` (SEGURIDAD §14: Security Engineer traduce §4 después de la re-revisión). | Toda §4 está bloqueada. | Seguridad |
| H-03 | **Firma de Seguridad vacía** en el checklist §10. | No se pueden cargar datos reales; las pruebas deben usar datos ficticios. | Gerente Seguridad |
| H-04 | **No hay app ni entorno** (preview con DB separada). | §2 y §3 bloqueadas. | Sistema / DevOps |
| H-05 | **Estados de pedido sin cerrar.** FLUJOS/SCHEMA usan `shipped_or_delivered`; D2 propone `fulfilled`, transiciones y datos mínimos, **pendiente de OK del dueño**. | ADM-PED-15/16/17, ADM-PER-12 dependen de D2. | Pedidos / dueño |
| H-06 | **Divergencia ADMIN_IA «Permisos UI» vs SEGURIDAD:** el borrador es una matriz por área (R/W); SEGURIDAD solo distingue owner/manager en equipo y lo exige **en RLS**, no en UI. Gana SEGURIDAD. | ADM-UI-20, ADM-EQP-07/08/09, RLS-PRF-02. | — (documentado) |
| H-07 | **Divergencia de lectura de equipo:** ADMIN_IA pone Equipo «—» para manager (sin acceso); SEGURIDAD §4 da a staff `SELECT` de `profiles`. UI más restrictiva que RLS: aceptable, pero se documenta para que nadie trate el 403 de UI como control de datos. | ADM-UI-19, ADM-EQP-10. | Seguridad confirma |
| H-08 | **Ambigüedad AND/OR en `products`:** SEGURIDAD §4 y SCHEMA escriben «`line = multiusos` / catálogo `is_public`». PROPUESTA_RLS y CATALOGO §1 lo leen como **AND**. | RLS-PRD-04 asume AND; confirmar antes del SQL. | Seguridad / Catálogo |
| H-09 | **Pedidos de CATALOGO §3 no reflejados en SCHEMA:** `visible_web DEFAULT false` explícito, CHECK que impide `visible_web` en automotriz/catálogo no público, `UNIQUE (catalog_id, external_id)` formal, promos con un solo padre. | ADM-CAT-04/05/09/12 quedan sin respaldo de constraint. | Sistema |
| H-10 | **`unit_price` nullable:** CATALOGO §3.4 lo pide; SCHEMA no lo declara. Sin eso, importar filas sin precio obligaría a inventar montos (prohibido). | ADM-CAT-11. | Sistema / Catálogo |
| H-11 | **`custom_requests` DELETE staff:** SEGURIDAD §4 y SCHEMA dicen «según política»; PROPUESTA_RLS dice «denegar hasta que exista». | ADM-PER-14, RLS-CR-05. | Seguridad |
| H-12 | **Columnas del Excel** sin definir (D1, pendiente del dueño). | ADM-CAT-10/11. | Catálogo / dueño |
| H-13 | **Reglas de Finanzas** (fiado, anticipos borde, conciliación Stripe vs notas) pendientes (FLUJOS «Huecos»). | ADM-ING-06/10. | Finanzas |
| H-14 | **`WEB_IA.md` pendiente** (STACK, ADMIN_IA): form público, carrito y UX de checkout no definidos. | ADM-PER-02..06, ADM-WEB-*. | Web |
| H-15 | **Auditoría** limitada a `updated_at` / `created_by` (FLUJOS §2); log ampliado es sugerencia (SEGURIDAD §12). | ADM-PED-19 solo verifica lo mínimo. | Seguridad / Sistema |
| H-16 | **Umbrales de rate limit en rango** (5–10) en login y checkout. | ADM-AUTH-08, ADM-WEB-11 necesitan el valor fijo para pass/fail. | Seguridad / Sistema |
| H-17 | **Copy de handoff WA y validación de fotos** a cargo de Personalizados (FLUJOS §3). | ADM-PER-05/08. | Personalizados |
| H-18 | **Ruta de login** sin decidir (`/admin/login` vs `/login`) y «rutas exactas pueden ajustarse» (ADMIN_IA). | IDs de §2 son por agrupación funcional; las rutas se ajustan al implementar. | Sistema |
| H-19 | **Estado desfasado en STACK:** la tabla «Documentos relacionados» lista SCHEMA y FLUJOS como borrador, mientras sus encabezados dicen «cambios §13 aplicados». | Solo trazabilidad; no se modifica STACK (fuera de alcance). | Gerente Sistema |
| H-20 | **MFA diferido** (SEGURIDAD §11 R10) y R3 (manager ve PII/finanzas) aceptados en Fase 1. | No hay casos MFA; R3 se prueba como comportamiento esperado (ADM-ING-12). | — |

### 5.2 Preguntas abiertas (no están en las fuentes; no se afirman)

| ID | Pregunta | Casos afectados |
|----|----------|-----------------|
| Q-01 | Con sesión válida, ¿abrir la ruta de login redirige al dashboard? | ADM-UI-01 |
| Q-02 | Al desactivar un perfil, ¿la denegación debe ser inmediata en la siguiente petición o se tolera hasta que expire el token? (Los helpers leen `profiles`, lo que sugiere inmediata para datos.) | ADM-AUTH-07 |
| Q-03 | ¿El staff puede ajustar a mano el precio de una línea de catálogo en un pedido interno (descuento, negociación)? «No inventar precios web» no lo resuelve. | ADM-PED-10 |
| Q-04 | ¿Qué es la «confirmación interna» para vender automotriz a un cliente sin `is_automotive_existing`? | ADM-PED-12 |
| Q-05 | ¿Habrá matriz owner/manager más fina (activar `promos.visible_web`, importar Excel, borrar montos, marcar `allows_credit` / `is_automotive_existing`)? Hoy es sugerencia (SEGURIDAD §12). | ADM-UI-10/11, ADM-CLI-04, ADM-ING-11 |
| Q-06 | ¿El staff puede crear pedidos manuales con `channel = web` o ese canal es exclusivo del servidor? | ADM-PED-03 |
| Q-07 | ¿Cuáles son las transiciones válidas de `custom_requests.status`? | ADM-PER-09 |
| Q-08 | ¿Staff puede borrar `custom_requests` en Fase 1? | ADM-PER-14, RLS-CR-05 |
| Q-09 | ¿`note_cash` con método distinto de `cash` se rechaza o solo se desaconseja? | ADM-ING-04 |
| Q-10 | ¿Cómo se evita duplicar un cobro `stripe` registrado a mano en admin si el webhook ya lo registró? | ADM-ING-10 |
| Q-11 | ¿`expense_entries.category` es enum cerrado o texto libre? | ADM-EGR-04 |
| Q-12 | ¿Se valida el formato de `uuid_cfdi` / `serie_folio`? | ADM-CFDI-08 |
| Q-13 | ¿Cómo se da de alta a un manager (invitación de Supabase Auth desde servidor con service role, alta manual del owner)? | ADM-EQP-02, RLS-PRF-03 |
| Q-14 | ¿Se impide que el último owner activo se desactive o se baje de rol? | ADM-EQP-12 |
| Q-15 | ¿Cuál es el tope de cantidad por línea en checkout? | ADM-WEB-04 |
| Q-16 | ¿Cómo se aplica en Storage la regla «público solo si el producto padre pasa el filtro» (bucket público con paths no adivinables, política por objeto, proxy)? | STO-PIM-02 |

### 5.3 Casos no ejecutables hoy y por qué

| Bloque | Por qué no se ejecuta | Se desbloquea cuando |
|--------|------------------------|----------------------|
| §4 completo (RLS/Storage) | No existen políticas SQL ni buckets | H-01 + H-02 resueltos; entorno de prueba |
| §2 y §3 (UI y flujos) | No hay app `/admin` | Código + preview (H-04) |
| ADM-PED-15/16/17, ADM-PER-12 | Máquina de estados provisional | OK del dueño a D2 (H-05) |
| ADM-CAT-10/11 | Sin columnas de Excel; `unit_price` no nullable en SCHEMA | D1 + H-10 |
| ADM-CAT-04/05/09/12 (como constraint) | Constraints pedidos por Catálogo no están en SCHEMA | H-09 |
| ADM-WEB-* , ADM-PER-02..06 | Sin `WEB_IA.md` ni form/checkout | H-14 |
| Casos con Q-* | Falta la regla en las fuentes | Respuesta del dueño del tema |

---

## 6. Cómo se ejecutará después

1. **Orden:** primero §4 (RLS/Storage con `anon`), porque es gate de datos reales (SEGURIDAD §0, §10); después §3.1 Auth y §3.10 Equipo; luego el resto de §3 y §2.
2. **Entorno:** preview o proyecto Supabase de prueba, con datos **ficticios** (sin PII real) que incluyan a propósito filas automotriz, `visible_web = false`, inactivos, catálogo no público, promos con `visible_web = true`, y usuarios owner, manager, sin perfil e inactivo.
3. **Clave:** los casos negativos se corren con la clave pública `anon` (y `anon` + JWT de usuario no staff para RLS-NST-01). **Nunca** `service_role` para un caso negativo; `service_role` solo para preparar datos de prueba, y queda anotado en la evidencia.
4. **Evidencia por caso:** ID, fecha/hora (America/Mexico_City), entorno, rol/clave usada, resultado observado (conteo de filas, código de error/HTTP, captura), **pass/fail**. Sin secretos ni PII en la evidencia.
5. **Reporte:** cualquier fail `bloqueante` se reporta a QA Sistema y Gerente Sistema (skill sistema-tester), y los de §4 también a Seguridad; QA no da «listo» con fallos bloqueantes conocidos (skill sistema-qa).
6. **Mantenimiento:** cuando se respondan Q-* o se cierren H-*, se actualiza el caso afectado sin cambiar su ID.
