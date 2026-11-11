import assert from "node:assert/strict";
import { computeShipping, SHIPPING_FREE_THRESHOLD_MXN } from "../lib/shipping.ts";

const free = computeShipping(3000, { freeThreshold: SHIPPING_FREE_THRESHOLD_MXN, shippingFeeMxn: null });
assert.equal(free.canCheckout, true);
assert.equal(free.shippingFee, 0);

const blocked = computeShipping(1000, { freeThreshold: 2999, shippingFeeMxn: null });
assert.equal(blocked.canCheckout, false);

const paidShip = computeShipping(1000, { freeThreshold: 2999, shippingFeeMxn: 150 });
assert.equal(paidShip.canCheckout, true);
assert.equal(paidShip.total, 1150);

console.log("OK: reglas de envío");
