"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useProductSelection } from "@/hooks/useProductSelection";
import { stockLabel } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { cn, discountPercent } from "@/lib/utils";
import { ColorSwatches, SizeChips } from "./Variants";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const router = useRouter();
  const { addToCart, startBuyNow } = useCart();
  const { categoryName } = useCatalog();
  const sel = useProductSelection(product);
  const stock = stockLabel(product.stock);
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock <= 0;
  const href = `/product/${product.slug}`;

  const handleAdd = async () => {
    if (!sel.validate()) return;
    const res = await addToCart(product, { size: sel.size, color: sel.color, quantity: 1 });
    if (res.ok) sel.reset();
  };

  const handleBuy = () => {
    if (!sel.validate()) return;
    const res = startBuyNow(product, { size: sel.size, color: sel.color, quantity: 1 });
    if (res.ok) router.push("/checkout?mode=buynow");
  };

  return (
    <article className="group flex flex-col" aria-label={product.name}>
      <div className="relative overflow-hidden rounded-2xl bg-ink-100">
        <Link href={href} className="block aspect-[4/5]" aria-label={`View ${product.name}`} tabIndex={-1}>
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition duration-500",
              product.images[1] ? "group-hover:opacity-0" : "group-hover:scale-105",
              soldOut && "opacity-70 grayscale-[40%]",
            )}
            {...(priority ? { loading: "eager" as const } : {})}
          />
          {product.images[1] && (
            <SafeImage
              src={product.images[1]}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && !soldOut && <Badge tone="danger" className="bg-red-600 text-white ring-red-600">-{off}%</Badge>}
          {product.tags.includes("new") && !soldOut && <Badge tone="dark">New</Badge>}
          {soldOut && <Badge tone="neutral" className="bg-white">Sold out</Badge>}
        </div>
        <WishlistButton product={product} className="absolute right-3 top-3" />
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{categoryName(product.category)}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900">
          <Link href={href} className="transition hover:text-brand-600">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} className="mt-1.5" />
        <Price price={product.price} originalPrice={product.originalPrice} className="mt-2" />

        <p
          className={cn(
            "mt-1 text-xs font-medium",
            stock.tone === "in" && "text-emerald-600",
            stock.tone === "low" && "text-amber-600",
            stock.tone === "out" && "text-red-600",
          )}
        >
          {stock.label}
        </p>

        {!soldOut && (
          <div key={sel.shakeKey} className={cn("mt-3 space-y-2.5", sel.shakeKey > 0 && (sel.errors.size || sel.errors.color) && "animate-shake")}>
            {product.colors.length > 0 && (
              <ColorSwatches colors={product.colors} selected={sel.color} onSelect={sel.setColor} size="sm" />
            )}
            {product.sizes.length > 0 && (
              <div>
                <SizeChips sizes={product.sizes} selected={sel.size} onSelect={sel.setSize} size="sm" invalid={!!sel.errors.size} />
                {sel.errors.size && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{sel.errors.size}</p>}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Button
            size="sm"
            variant="primary"
            onClick={handleAdd}
            disabled={soldOut}
            leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
            aria-label={`Add ${product.name} to cart`}
          >
            {soldOut ? "Sold out" : "Add to Cart"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBuy}
            disabled={soldOut}
            leftIcon={<Zap className="h-3.5 w-3.5" />}
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </article>
  );
}

