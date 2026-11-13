import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-brand-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-800" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  center,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${center ? "justify-center text-center" : ""}`}>
      <div className={center ? "mx-auto max-w-2xl" : ""}>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

