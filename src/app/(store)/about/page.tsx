import type { Metadata } from "next";
import { Award, HeartHandshake, Sparkles, Truck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { SafeImage } from "@/components/ui/SafeImage";
import { photo, unsplash } from "@/lib/data/images";

export const metadata: Metadata = { title: "About Us" };

const values = [
  { icon: Sparkles, title: "Thoughtful Fabrics", text: "Combed cottons, brushed fleece and breathable linens selected for daily wear." },
  { icon: Award, title: "Honest Tailoring", text: "Clean stitching, reinforced seams and consistent fits across every collection." },
  { icon: Truck, title: "Nationwide Delivery", text: "Fast dispatch across major cities and towns in Pakistan with COD & online options." },
  { icon: HeartHandshake, title: "Customer First", text: "7-day easy returns & exchanges with responsive support Monday to Saturday." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <PageHeader
        title="About Alam Fashion"
        description="Modern everyday & luxury garments crafted for comfort, durability and effortless style."
      />

      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-ink-100">
          <SafeImage src={unsplash(photo.boutique, 1000)} alt="Alam Fashion studio rack" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 text-ink-600 leading-relaxed">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Built for the modern wardrobe</h2>
          <p>
            Alam Fashion started with a dedicated mission: craft timeless wardrobe essentials and luxury statement pieces — from 220 GSM combed cotton
            tees to tailored blazers, outerwear and heavyweight fleece — accessible without compromising on fit, stitching or
            fabric quality.
          </p>
          <p>
            Every piece in our catalogue is designed to pair effortlessly with what you already own,
            making getting dressed the easiest part of your morning.
          </p>
          <div className="pt-2">
            <LinkButton href="/shop" size="lg">
              Explore the Collection
            </LinkButton>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-5">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

