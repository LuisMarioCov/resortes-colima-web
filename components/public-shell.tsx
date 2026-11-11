import Link from "next/link";
import type { ReactNode } from "react";
import { CartLink } from "@/components/cart/cart-link";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:ring-2 focus:ring-amber-700"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-amber-900">
            Resortes Colima
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link className="min-h-11 min-w-11 px-2 py-2 hover:underline" href="/catalogo">
              Catálogo
            </Link>
            <Link className="min-h-11 min-w-11 px-2 py-2 hover:underline" href="/personalizados">
              Personalizados
            </Link>
            <CartLink />
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-950">
              Fabricado express
            </span>
          </nav>
        </div>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-stone-600">
          <p>Colima, Colima, México · Envíos a toda la República</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/aviso-de-privacidad" className="underline">
              Aviso de privacidad
            </Link>
            <Link href="/terminos" className="underline">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
