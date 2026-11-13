"use client";

import { Heart, Trash2 } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { useCatalog } from "@/context/CatalogContext";
import { useWishlist } from "@/context/WishlistContext";

export function WishlistView() {
  const { products, ready: catalogReady } = useCatalog();
  const { ids, ready: wishReady, clear } = useWishlist();

  if (!catalogReady || !wishReady) {
    return (
      <div className="container-page py-16">
        <PageLoader label="Loading wishlist…" />
      </div>
    );
  }

  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <PageHeader
        title="My Wishlist"
        description={`${saved.length} saved item${saved.length === 1 ? "" : "s"}`}
        actions={
          saved.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:bg-red-50"
            >
              Clear wishlist
            </Button>
          ) : undefined
        }
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here for later."
          action={<LinkButton href="/shop">Explore products</LinkButton>}
        />
      ) : (
        <ProductGrid products={saved} />
      )}
    </div>
  );
}

