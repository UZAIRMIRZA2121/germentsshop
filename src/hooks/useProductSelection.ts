"use client";

import { useCallback, useState } from "react";
import { validateSelection, type SelectionErrors } from "@/lib/cart";
import type { Product } from "@/lib/types";

/** Holds the customer's variation choices for a product and validates them. */
export function useProductSelection(product: Product, options: { preselectColor?: boolean } = {}) {
  const { preselectColor = true } = options;
  const [size, setSizeState] = useState<string | null>(null);
  const [color, setColorState] = useState<string | null>(
    preselectColor ? (product.colors[0]?.name ?? null) : null,
  );
  const [quantity, setQuantityState] = useState(1);
  const [errors, setErrors] = useState<SelectionErrors>({});
  const [shakeKey, setShakeKey] = useState(0);

  const setSize = useCallback((s: string) => {
    setSizeState(s);
    setErrors((e) => ({ ...e, size: undefined }));
  }, []);
  const setColor = useCallback((c: string) => {
    setColorState(c);
    setErrors((e) => ({ ...e, color: undefined }));
  }, []);
  const setQuantity = useCallback((q: number) => {
    setQuantityState(q);
    setErrors((e) => ({ ...e, quantity: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = validateSelection(product, { size, color, quantity });
    setErrors(result);
    const invalid = Object.values(result).some(Boolean);
    if (invalid) setShakeKey((k) => k + 1);
    return !invalid;
  }, [product, size, color, quantity]);

  const reset = useCallback(() => {
    setSizeState(null);
    setQuantityState(1);
    setErrors({});
  }, []);

  return { size, color, quantity, errors, shakeKey, setSize, setColor, setQuantity, validate, reset };
}

