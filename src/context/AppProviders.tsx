"use client";

import type { ReactNode } from "react";
import { AccountProvider } from "./AccountContext";
import { CartProvider } from "./CartContext";
import { CatalogProvider } from "./CatalogContext";
import { OrdersProvider } from "./OrdersContext";
import { ToastProvider } from "./ToastContext";
import { WishlistProvider } from "./WishlistContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CatalogProvider>
        <CartProvider>
          <WishlistProvider>
            <AccountProvider>
              <OrdersProvider>{children}</OrdersProvider>
            </AccountProvider>
          </WishlistProvider>
        </CartProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}

