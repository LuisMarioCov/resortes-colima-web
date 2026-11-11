import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Fabricado express en Colima
        </h1>
        <p className="max-w-2xl text-lg text-stone-700">
          Fabricamos resortes multiusos y piezas a la medida con tiempos de respuesta en días — y a
          veces horas para clientes locales — frente a las semanas habituales del mercado. Enviamos a
          toda la República Mexicana.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center rounded-md bg-amber-800 px-5 py-2 font-medium text-white hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            Ver catálogo multiusos
          </Link>
          <Link
            href="/personalizados"
            className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-5 py-2 font-medium text-stone-900 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-800"
          >
            Resorte a la medida
          </Link>
        </div>
      </div>
      <section aria-labelledby="como-trabajamos" className="grid gap-6 md:grid-cols-2">
        <h2 id="como-trabajamos" className="sr-only">
          Cómo trabajamos
        </h2>
        <article className="rounded-lg border border-stone-200 bg-white p-6">
          <h3 className="text-lg font-semibold">Catálogo multiusos</h3>
          <p className="mt-2 text-stone-700">
            Dos listados separados (~105 y ~56). Compra en línea con pago seguro por Stripe. Envío
            gratis en el mismo cobro a partir de $2,999 MXN en productos.
          </p>
        </article>
        <article className="rounded-lg border border-stone-200 bg-white p-6">
          <h3 className="text-lg font-semibold">Personalizados</h3>
          <p className="mt-2 text-stone-700">
            Envía medidas y foto de muestra. Cotizamos por WhatsApp; al confirmar se solicita
            anticipo del 50%.
          </p>
        </article>
      </section>
    </section>
  );
}
