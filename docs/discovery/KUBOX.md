# Decisión: Kubox (CFDI)

Investigación CEO — 2026-11-11.

## Qué es

- Producto: [kubox.mx](https://kubox.mx/) — facturación electrónica CFDI + panel admin (opcional ERP Premium).
- Operador: GARO TECNOLOGICS S.A. DE C.V. (Villa de Álvarez, Colima).
- Modelo: app web; ~$1.00 MXN por CFDI timbrado; sin cuota mensual publicada en landing.
- Uso actual de Resortes Colima: **sí** facturan con Kubox.

## API / integración

| Hallazgo | Evidencia |
|----------|-----------|
| No hay documentación pública de API REST / SDK | Sitio, términos y ERP no exponen endpoints ni portal de desarrolladores |
| El producto se usa como **panel web** (timbrado on-demand) | Términos: panel administrativo + timbrado |
| Descarga masiva SAT vía extensión Chrome (histórico) | Marketing Kubox; no es API de emisión propia |

**Conclusión:** no existe integración programática pública confiable con Kubox hoy.

## Decisión fijada (CEO)

1. **Seguir timbrando en Kubox** (no migrar PAC en Fase 1).
2. En el **sistema interno**: registrar la factura/pedido completo y guardar vínculo fiscal:
   - UUID CFDI (si se copia del XML/PDF)
   - Folio/serie Kubox
   - URL o nota “timbrado en Kubox”
   - Estado: pendiente de timbrar | timbrado | cancelado
3. Flujo operativo MVP: usuario abre Kubox, timbra, **pega referencia** en el pedido (o adjunto PDF/XML).
4. **No** construir scraper ni automatización no oficial contra Kubox.
5. Revisitar solo si: Kubox entrega API por contrato, o el volumen justifica migrar a un PAC con API (Facturapi, SenHub, etc.) — decisión aparte del dueño.

## Implicación en backlog

- Épica S4 = “vínculo Kubox” (referencia + adjuntos), no “API Kubox”.
- Ingresos del sistema ≠ reemplazo de Kubox; Kubox sigue siendo el emisor fiscal.
