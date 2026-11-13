"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SizeChips } from "@/components/product/Variants";
import { useCatalog } from "@/context/CatalogContext";
import { activeFilterCount, type ShopFilters } from "@/lib/shopFilters";
import { formatPrice } from "@/lib/utils";

const priceRanges = [
  { label: "Under Rs. 2,500", min: null, max: 2500 },
  { label: "Rs. 2,500 – 5,000", min: 2500, max: 5000 },
  { label: "Rs. 5,000 – 10,000", min: 5000, max: 10000 },
  { label: "Over Rs. 10,000", min: 10000, max: null },
] as const;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-ink-100 py-5 first:pt-0 last:border-0">
      <legend className="mb-3 text-sm font-semibold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-sm text-ink-700 hover:text-ink-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-ink-400">{count}</span>}
    </label>
  );
}

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function FilterPanel({
  filters,
  update,
  clear,
}: {
  filters: ShopFilters;
  update: (patch: Partial<ShopFilters>) => void;
  clear: () => void;
}) {
  const { products, categories } = useCatalog();
  const count = activeFilterCount(filters);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    const order = ["XS", "S", "M", "L", "XL", "XXL"];
    return [...set].sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return [...map].map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Local price inputs applied on blur / Enter to avoid navigation on each keystroke.
  const [minInput, setMinInput] = useState(filters.minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(filters.maxPrice?.toString() ?? "");
  useEffect(() => {
    setMinInput(filters.minPrice?.toString() ?? "");
    setMaxInput(filters.maxPrice?.toString() ?? "");
  }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = () => {
    const min = minInput === "" ? null : Math.max(0, Number(minInput));
    let max = maxInput === "" ? null : Math.max(0, Number(maxInput));
    if (min !== null && max !== null && max < min) max = min;
    update({
      minPrice: min !== null && Number.isFinite(min) ? min : null,
      maxPrice: max !== null && Number.isFinite(max) ? max : null,
    });
  };

  const priceSelected = (r: (typeof priceRanges)[number]) => filters.minPrice === r.min && filters.maxPrice === r.max;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Filters</h2>
        {count > 0 && (
          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            <RotateCcw className="h-3.5 w-3.5" /> Clear all ({count})
          </button>
        )}
      </div>

      <Group title="Category">
        {categories.map((c) => (
          <Check
            key={c.id}
            label={c.name}
            count={products.filter((p) => p.category === c.slug).length}
            checked={filters.categories.includes(c.slug)}
            onChange={() => update({ categories: toggle(filters.categories, c.slug) })}
          />
        ))}
      </Group>

      <Group title="Price range (PKR)">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Minimum price"
            className="input-base !py-2"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Maximum price"
            className="input-base !py-2"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {priceRanges.map((r) => (
            <button
              key={r.label}
              type="button"
              aria-pressed={priceSelected(r)}
              onClick={() => update(priceSelected(r) ? { minPrice: null, maxPrice: null } : { minPrice: r.min, maxPrice: r.max })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                priceSelected(r)
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 text-ink-600 hover:border-ink-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {(filters.minPrice !== null || filters.maxPrice !== null) && (
          <p className="mt-2 text-xs text-ink-500">
            Showing {filters.minPrice !== null ? formatPrice(filters.minPrice) : "any"} –{" "}
            {filters.maxPrice !== null ? formatPrice(filters.maxPrice) : "any"}
          </p>
        )}
      </Group>

      <Group title="Availability">
        <Check label="In stock" checked={filters.inStock} onChange={(v) => update({ inStock: v })} />
        <Check label="Out of stock" checked={filters.outOfStock} onChange={(v) => update({ outOfStock: v })} />
        <Check label="On sale" checked={filters.onSale} onChange={(v) => update({ onSale: v })} />
      </Group>

      <Group title="Size">
        <SizeChips
          sizes={allSizes}
          selected={filters.sizes}
          onSelect={(s) => update({ sizes: toggle(filters.sizes, s) })}
          size="sm"
        />
        {filters.sizes.length > 0 && (
          <p className="mt-2 text-xs text-ink-500">Selected: {filters.sizes.join(", ")}</p>
        )}
      </Group>

      <Group title="Colour">
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => {
            const active = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={active}
                onClick={() => update({ colors: toggle(filters.colors, c.name) })}
                className={`h-7 w-7 rounded-full border transition ${active ? "ring-2 ring-brand-500 ring-offset-2" : "hover:scale-110"} ${
                  c.hex.toLowerCase() === "#ffffff" ? "border-ink-300" : "border-black/10"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
        {filters.colors.length > 0 && <p className="mt-2 text-xs text-ink-500">Selected: {filters.colors.join(", ")}</p>}
      </Group>
    </div>
  );
}
