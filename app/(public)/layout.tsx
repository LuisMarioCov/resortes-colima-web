import { PublicShell } from "@/components/public-shell";
import { CartProvider } from "@/components/cart/cart-context";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PublicShell>{children}</PublicShell>
    </CartProvider>
  );
}
