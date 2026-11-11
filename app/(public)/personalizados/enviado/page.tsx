
type Props = { searchParams: Promise<{ folio?: string }> };

export default async function PersonalizadosEnviadoPage({ searchParams }: Props) {
  const { folio } = await searchParams;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Solicitud recibida</h1>
      {folio ? (
        <p>
          Tu folio es <strong>{folio}</strong>. Puedes continuar la conversación en WhatsApp.
        </p>
      ) : (
        <p>Tu solicitud fue registrada. El folio te lo confirma el servidor al enviar el formulario.</p>
      )}
    </div>
  );
}
