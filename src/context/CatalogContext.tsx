"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useStoredResource } from "@/hooks/useStoredResource";
import { categoryService } from "@/lib/services/categoryService";
import { productService } from "@/lib/services/productService";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Category, Product } from "@/lib/types";

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  ready: boolean;
  getProduct: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getCategory: (slug: string) => Category | undefined;
  categoryName: (slug: string) => string;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

const PRODUCT_KEYS = [STORAGE_KEYS.products];
const CATEGORY_KEYS = [STORAGE_KEYS.categories];

export function CatalogProvider({ children }: { children: ReactNode }) {
  const productsRes = useStoredResource<Product[]>(PRODUCT_KEYS, () => productService.list(), []);
  const categoriesRes = useStoredResource<Category[]>(
    CATEGORY_KEYS,
    () => categoryService.list(),
    [],
  );

  const products = productsRes.data;
  const categories = categoriesRes.data;

  const getProduct = useCallback((slug: string) => products.find((p) => p.slug === slug), [products]);
  const getProductById = useCallback((id: string) => products.find((p) => p.id === id), [products]);
  const getCategory = useCallback((slug: string) => categories.find((c) => c.slug === slug), [categories]);
  const categoryName = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "Uncategorised",
    [categories],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      ready: productsRes.ready && categoriesRes.ready,
      getProduct,
      getProductById,
      getCategory,
      categoryName,
    }),
    [products, categories, productsRes.ready, categoriesRes.ready, getProduct, getProductById, getCategory, categoryName],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

