"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageX, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Breadcrumbs } from "@/components/ui/Headings";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Rating } from "@/components/ui/Rating";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useProductSelection } from "@/hooks/useProductSelection";
import { maxQuantityFor, stockLabel } from "@/lib/cart";
import { shippingConfig } from "@/lib/config/payment";
import type { Product } from "@/lib/types";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { ProductGrid } from "./ProductGrid";
import { ReviewsSection } from "./ReviewsSection";
import { ColorSwatches, SizeChips } from "./Variants";
import { WishlistButton } from "./WishlistButton";

const tabs = [
  { id: "description", label: "Description" },
  { id: "specs", label: "Specifications" },
  { id: "delivery", label: "Delivery" },
  { id: "returns", label: "Returns & Exchange" },
  { id: "reviews", label: "Reviews" },
] as const;
type TabId = (typeof tabs)[number]["id"];

export function ProductDetailView({ slug }: { slug: string }) {
  const { getProduct, ready } = useCatalog();
  if (!ready) return <div className="container-page py-16"><PageLoader label="Loading product…" /></div>;
  const product = getProduct(slug);
  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageX />}
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
          action={<LinkButton href="/shop">Browse all products</LinkButton>}
        />
      </div>
    );
  }
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, startBuyNow } = useCart();
  const { products, categoryName } = useCatalog();
  const sel = useProductSelection(product);
  const [tab, setTab] = useState<TabId>("description");

  const stock = stockLabel(product.stock);
  const soldOut = product.stock <= 0;
  const off = discountPercent(product.price, product.originalPrice);
  const max = Math.max(1, maxQuantityFor(product));

  const related = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category) || b.rating - a.rating)
    .slice(0, 4);

  const handleAdd = async () => {
    if (!sel.validate()) return;
    await addToCart(product, { size: sel.size, color: sel.color, quantity: sel.quantity });
  };

  const handleBuy = () => {
    if (!sel.validate()) return;
    const res = startBuyNow(product, { size: sel.size, color: sel.color, quantity: sel.quantity });
    if (res.ok) router.push("/checkout?mode=buynow");
  };

  const shake = sel.shakeKey > 0 && (sel.errors.size || sel.errors.color);

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: categoryName(product.category), href: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery
          images={product.images}
          name={product.name}
          badges={
            <>
              {off > 0 && !soldOut && <Badge className="bg-red-600 text-white ring-red-600">-{off}%</Badge>}
              {product.tags.includes("new") && <Badge tone="dark">New</Badge>}
              {soldOut && <Badge className="bg-white">Sold out</Badge>}
            </>
          }
        />

        <div>
          <Link href={`/shop?category=${product.category}`} className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 hover:text-brand-700">
            {categoryName(product.category)}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
            <button type="button" onClick={() => { setTab("reviews"); document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm font-medium text-ink-500 underline-offset-2 hover:text-brand-600 hover:underline">
              Read reviews
            </button>
            <span className="text-xs text-ink-400">SKU: {product.sku}</span>
          </div>

          <Price price={product.price} originalPrice={product.originalPrice} size="lg" showBadge className="mt-5" />
          {off > 0 && product.originalPrice && (
            <p className="mt-1 text-sm font-medium text-emerald-600">You save {formatPrice(product.originalPrice - product.price)}</p>
          )}
          <p className="mt-5 leading-relaxed text-ink-600">{product.shortDescription}</p>

          <p
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold",
              stock.tone === "in" && "bg-emerald-50 text-emerald-700",
              stock.tone === "low" && "bg-amber-50 text-amber-700",
              stock.tone === "out" && "bg-red-50 text-red-700",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", stock.tone === "in" && "bg-emerald-500", stock.tone === "low" && "bg-amber-500", stock.tone === "out" && "bg-red-500")} />
            {stock.label}
            {stock.tone === "in" && <span className="font-normal opacity-80">· {product.stock} available</span>}
          </p>

          <div key={sel.shakeKey} className={cn("mt-7 space-y-6", shake && "animate-shake")}>
            {product.colors.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold text-ink-900">
                  Colour: <span className="font-normal text-ink-600">{sel.color ?? "Select a colour"}</span>
                </p>
                <ColorSwatches colors={product.colors} selected={sel.color} onSelect={sel.setColor} />
                {sel.errors.color && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{sel.errors.color}</p>}
              </div>
            )}
            {product.sizes.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold text-ink-900">
                  Size: <span className="font-normal text-ink-600">{sel.size ?? "Select a size"}</span>
                </p>
                <SizeChips sizes={product.sizes} selected={sel.size} onSelect={sel.setSize} invalid={!!sel.errors.size} />
                {sel.errors.size && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{sel.errors.size}</p>}
              </div>
            )}
            <div>
              <p className="mb-2.5 text-sm font-semibold text-ink-900">Quantity</p>
              <div className="flex items-center gap-3">
                <QuantityStepper value={sel.quantity} max={max} onChange={sel.setQuantity} disabled={soldOut} />
                {!soldOut && <span className="text-xs text-ink-500">Max {max} per order</span>}
              </div>
              {sel.errors.quantity && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{sel.errors.quantity}</p>}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button size="lg" onClick={handleAdd} disabled={soldOut} leftIcon={<ShoppingBag className="h-5 w-5" />}>
              {soldOut ? "Out of stock" : "Add to Cart"}
            </Button>
            <Button size="lg" variant="secondary" onClick={handleBuy} disabled={soldOut} leftIcon={<Zap className="h-5 w-5" />}>
              Buy Now
            </Button>
          </div>
          <WishlistButton product={product} variant="full" className="mt-3 w-full" />

          <ul className="mt-8 grid gap-3 rounded-2xl bg-ink-50 p-5 text-sm sm:grid-cols-3">
            <li className="flex items-start gap-2.5">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span><b className="block text-ink-900">Fast delivery</b>{shippingConfig.metroDays.min}–{shippingConfig.otherDays.max} working days</span>
            </li>
            <li className="flex items-start gap-2.5">
              <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span><b className="block text-ink-900">7-day returns</b>Easy exchange</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span><b className="block text-ink-900">Pay your way</b>COD or manual transfer</span>
            </li>
          </ul>
        </div>
      </div>

      <section id="product-tabs" className="mt-16 scroll-mt-28" aria-label="Product information">
        <div role="tablist" aria-label="Product information" className="flex gap-1 overflow-x-auto border-b border-ink-200 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
                tab === t.id ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800",
              )}
            >
              {t.label}
              {t.id === "reviews" && <span className="ml-1.5 text-ink-400">({product.reviewCount})</span>}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="py-8">
          {tab === "description" && (
            <div className="max-w-3xl space-y-4 leading-relaxed text-ink-600">
              <p>{product.description}</p>
              <p>Available in {product.colors.length || 1} colour{product.colors.length === 1 ? "" : "s"} and sizes {product.sizes.join(", ") || "one size"}.</p>
            </div>
          )}
          {tab === "specs" && (
            <dl className="max-w-2xl divide-y divide-ink-100 rounded-2xl border border-ink-200">
              {[{ label: "SKU", value: product.sku }, { label: "Category", value: categoryName(product.category) }, ...product.specifications].map((s) => (
                <div key={s.label} className="grid grid-cols-3 gap-4 px-5 py-3.5 text-sm">
                  <dt className="font-semibold text-ink-900">{s.label}</dt>
                  <dd className="col-span-2 text-ink-600">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "delivery" && (
            <div className="max-w-3xl space-y-3 text-ink-600">
              <ul className="list-disc space-y-2 pl-5">
                <li>Delivery within <b>{shippingConfig.metroDays.min}–{shippingConfig.metroDays.max} working days</b> to Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan and Peshawar.</li>
                <li>Delivery within <b>{shippingConfig.otherDays.min}–{shippingConfig.otherDays.max} working days</b> to all other cities across Pakistan.</li>
                <li>Flat shipping of <b>{formatPrice(shippingConfig.flatRate)}</b>. <b>Free shipping</b> on orders above {formatPrice(shippingConfig.freeShippingThreshold)}.</li>
                <li>Cash on Delivery is available nationwide. Manual online payments are processed after verification.</li>
              </ul>
              <p className="text-sm text-ink-500">Delivery estimates are indicative. This demo store does not connect to real couriers.</p>
            </div>
          )}
          {tab === "returns" && (
            <div className="max-w-3xl space-y-3 text-ink-600">
              <ul className="list-disc space-y-2 pl-5">
                <li>7-day easy returns and exchanges from the date of delivery.</li>
                <li>Items must be unworn, unwashed and have original tags and packaging.</li>
                <li>Exchanges for a different size or colour are free, subject to availability.</li>
                <li>Refunds are issued to the original payment method (or store credit) once the item passes inspection.</li>
                <li>Sale items marked “final sale” are not eligible for return.</li>
              </ul>
              <Link href="/policies/returns" className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">Read the full policy →</Link>
            </div>
          )}
          {tab === "reviews" && <ReviewsSection product={product} />}
        </div>
      </section>

      <section className="mt-12" aria-label="Related products">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">You may also like</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}

