import { Quote } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { SectionHeading } from "@/components/ui/Headings";
import { initials } from "@/lib/utils";

const testimonials = [
  {
    name: "Ayesha Khan",
    city: "Lahore",
    rating: 5,
    text: "The hoodie quality is unreal for the price. Delivery to Lahore took just two days and the packaging was beautiful. Already planning my next order!",
  },
  {
    name: "Bilal Ahmed",
    city: "Karachi",
    rating: 5,
    text: "I paid via bank transfer and the team verified it the same day. The jeans fit perfectly and the denim feels premium. Highly recommended.",
  },
  {
    name: "Sana Malik",
    city: "Islamabad",
    rating: 4.5,
    text: "Loved the easy exchange process — swapped my size without any hassle. The knit cardigan is so soft and the colours are true to the photos.",
  },
];

export function Testimonials() {
  return (
    <section className="mt-20 bg-ink-50 py-16" aria-label="Customer testimonials">
      <div className="container-page">
        <SectionHeading
          center
          eyebrow="Loved by customers"
          title="What our customers say"
          description="Real feedback from shoppers across Pakistan (demo testimonials)."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="relative rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand-100" aria-hidden />
              <Rating value={t.rating} size="md" />
              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-700">“{t.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{t.name}</span>
                  <span className="text-xs text-ink-500">{t.city} · Verified buyer</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

