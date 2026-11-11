export const metadata = { title: "Resortes personalizados" };

export default function PersonalizadosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Solicitud de resorte a la medida</h1>
      <p className="text-stone-700">
        Sin precio en esta página. Envía medidas y foto de muestra; cotizamos por WhatsApp. Anticipo
        del 50% al confirmar el trabajo.
      </p>
      <form className="grid max-w-xl gap-4" action="/api/personalizados" method="post">
        <p className="text-sm text-stone-600">
          Formulario shell — el POST real va a <code className="text-xs">/api/personalizados</code> con
          validación en servidor (próximo slice).
        </p>
      </form>
    </div>
  );
}
