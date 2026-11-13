import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Free Shipping", text: "On orders over Rs. 5,000" },
  { icon: ShieldCheck, title: "Secure Ordering", text: "COD or verified manual payment" },
  { icon: RotateCcw, title: "Easy Returns", text: "7-day return & exchange" },
  { icon: Headphones, title: "Customer Support", text: "Mon–Sat, 10 AM – 8 PM" },
];

export function BenefitsStrip() {
  return (
    <section aria-label="Store benefits" className="border-b border-ink-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3.5 px-1 lg:justify-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="text-xs text-ink-500 sm:text-sm">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

