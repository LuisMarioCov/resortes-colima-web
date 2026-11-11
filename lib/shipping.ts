export const SHIPPING_FREE_THRESHOLD_MXN = 2999;

export type ShippingSettings = {
  freeThreshold: number;
  shippingFeeMxn: number | null;
};

export function computeShipping(
  subtotal: number,
  settings: ShippingSettings
): { shippingFee: number; total: number; canCheckout: boolean; reason?: string } {
  if (subtotal >= settings.freeThreshold) {
    return {
      shippingFee: 0,
      total: subtotal,
      canCheckout: true,
    };
  }
  if (settings.shippingFeeMxn == null) {
    return {
      shippingFee: 0,
      total: subtotal,
      canCheckout: false,
      reason:
        "El envío para pedidos menores a $2,999 MXN aún no está configurado. Agrega más productos para envío gratis o espera la tarifa del dueño.",
    };
  }
  const shippingFee = settings.shippingFeeMxn;
  return {
    shippingFee,
    total: subtotal + shippingFee,
    canCheckout: true,
  };
}
