import {
  countryToCode,
  createPrintifyOrder,
  printifyConfigured,
  splitName,
} from "@/lib/printify/client";
import {
  getOrderById,
  parseOrder,
  updateOrder,
  type OrderLineRecord,
  type ShippingRecord,
} from "@/lib/shop/orders.server";

/**
 * After Stripe marks an order paid, push line items into Printify.
 * Variants without printify IDs are skipped (logged) so partial catalogues still pay.
 */
export async function fulfillOrderWithPrintify(orderId: string) {
  const row = await getOrderById(orderId);
  if (!row) throw new Error(`Order ${orderId} not found`);
  if (row.printify_order_id) return parseOrder(row);
  if (!printifyConfigured()) {
    await updateOrder(orderId, {
      status: "paid",
      error_message: "Printify not configured — order paid, fulfilment pending connection",
    });
    return parseOrder((await getOrderById(orderId))!);
  }

  const order = parseOrder(row);
  const lines = order.lines.filter(
    (l) => l.printifyProductId && l.printifyVariantId,
  ) as Array<OrderLineRecord & { printifyProductId: string; printifyVariantId: number }>;

  if (lines.length === 0) {
    await updateOrder(orderId, {
      status: "paid",
      error_message:
        "Paid — map Printify product/variant IDs on catalogue SKUs to auto-fulfil",
    });
    return parseOrder((await getOrderById(orderId))!);
  }

  const shipping = order.shipping as ShippingRecord;
  const { first, last } = splitName(shipping.fullName);

  try {
    const printifyOrder = await createPrintifyOrder({
      externalId: orderId,
      label: `mypahlavi ${orderId}`,
      lineItems: lines.map((l) => ({
        product_id: l.printifyProductId,
        variant_id: Number(l.printifyVariantId),
        quantity: l.quantity,
      })),
      addressTo: {
        first_name: first,
        last_name: last,
        email: shipping.email || order.email,
        phone: shipping.phone || "0000000000",
        country: countryToCode(shipping.country),
        address1: shipping.line1,
        address2: shipping.line2 || "",
        city: shipping.city,
        zip: shipping.postcode,
      },
      sendToProduction: true,
    });

    await updateOrder(orderId, {
      status: "printify_submitted",
      printify_order_id: printifyOrder.id,
      error_message: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Printify error";
    await updateOrder(orderId, {
      status: "paid",
      error_message: message.slice(0, 500),
    });
    console.error("[printify] fulfill failed", orderId, message);
  }

  return parseOrder((await getOrderById(orderId))!);
}
