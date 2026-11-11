export const metadata = { title: "Pago cancelado" };

export default function PedidoCanceladoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pago no completado</h1>
      <p>Puedes volver al carrito e intentar de nuevo. No se creó ningún pedido en el sistema.</p>
    </div>
  );
}
