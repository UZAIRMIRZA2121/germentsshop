import { MAX_QTY_PER_ITEM } from "./config/payment";
import type { CartItem, CartLine, Product } from "./types";

export function cartKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return `${item.productId}|${item.size ?? ""}|${item.color ?? ""}`;
}

export function maxQuantityFor(product: Product): number {
  return Math.max(0, Math.min(product.stock, MAX_QTY_PER_ITEM));
}

export function resolveLine(item: CartItem, products: Product[]): CartLine | null {
  const product = products.find((p) => p.id === item.productId);
  if (!product) return null;
  const maxQty = maxQuantityFor(product);
  return {
    key: cartKey(item),
    product,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: product.price,
    lineTotal: product.price * item.quantity,
    maxQty,
    outOfStock: product.stock <= 0,
    exceedsStock: product.stock > 0 && item.quantity > maxQty,
  };
}

export interface SelectionErrors {
  size?: string;
  color?: string;
  quantity?: string;
}

/** Validates the customer's variation choices before add-to-cart / buy-now. */
export function validateSelection(
  product: Product,
  selection: { size: string | null; color: string | null; quantity: number },
): SelectionErrors {
  const errors: SelectionErrors = {};
  if (product.sizes.length > 0 && !selection.size) errors.size = "Please select a size.";
  if (product.colors.length > 0 && !selection.color) errors.color = "Please select a colour.";
  if (!Number.isInteger(selection.quantity) || selection.quantity < 1) {
    errors.quantity = "Quantity must be at least 1.";
  } else if (product.stock > 0 && selection.quantity > maxQuantityFor(product)) {
    errors.quantity = `Only ${maxQuantityFor(product)} available per order.`;
  }
  return errors;
}

export function stockLabel(stock: number): {
  label: string;
  tone: "in" | "low" | "out";
} {
  if (stock <= 0) return { label: "Out of stock", tone: "out" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "low" };
  return { label: "In stock", tone: "in" };
}

