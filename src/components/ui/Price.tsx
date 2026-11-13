import { discountPercent, formatPrice, cn } from "@/lib/utils";

export function Price({
  price,
  originalPrice,
  size = "md",
  showBadge = false,
  className,
}: {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}) {
  const off = discountPercent(price, originalPrice);
  const priceSize = size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-base";
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-bold text-ink-900", priceSize)}>{formatPrice(price)}</span>
      {off > 0 && originalPrice && (
        <>
          <span className={cn("text-ink-400 line-through", size === "lg" ? "text-lg" : "text-sm")}>
            {formatPrice(originalPrice)}
          </span>
          {showBadge ? (
            <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">{off}% OFF</span>
          ) : (
            <span className="text-xs font-semibold text-red-600">-{off}%</span>
          )}
        </>
      )}
    </div>
  );
}

