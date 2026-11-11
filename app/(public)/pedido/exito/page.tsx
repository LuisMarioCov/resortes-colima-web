export const metadata = { title: "Compra en proceso" };

export default function PedidoExitoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gracias por tu compra</h1>
      <p>
        Estamos confirmando tu pago. Esta página no marca el pedido como pagado: eso ocurre solo en
        el webhook seguro de Stripe.
      </p>
    </div>
  );
}
