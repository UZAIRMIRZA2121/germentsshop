import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { shippingConfig } from "@/lib/config/payment";
import { formatPrice } from "@/lib/utils";

const policies: Record<string, { title: string; updated: string; sections: Array<{ heading: string; body: string }> }> = {
  shipping: {
    title: "Shipping Policy",
    updated: "November 2026",
    sections: [
      {
        heading: "Delivery Timescales",
        body: `Major cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar) typically receive orders within ${shippingConfig.metroDays.min}–${shippingConfig.metroDays.max} working days. Other cities across Pakistan receive parcels within ${shippingConfig.otherDays.min}–${shippingConfig.otherDays.max} working days.`,
      },
      {
        heading: "Shipping Charges",
        body: `Standard shipping is a flat ${formatPrice(shippingConfig.flatRate)}. Orders over ${formatPrice(shippingConfig.freeShippingThreshold)} qualify for free shipping automatically.`,
      },
      {
        heading: "Demo Notice",
        body: "This storefront is a frontend-only demonstration; no real courier dispatches occur.",
      },
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    updated: "November 2026",
    sections: [
      {
        heading: "7-Day Easy Returns",
        body: "Items can be returned or exchanged within 7 days of delivery provided they are unworn, unwashed and have original tags intact.",
      },
      {
        heading: "Size Exchanges",
        body: "Need a different size? Contact support with your order number and we will arrange an exchange subject to stock availability.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "November 2026",
    sections: [
      {
        heading: "Frontend Demo Data",
        body: "This application runs entirely in your browser. Cart items, wishlist, profile details, orders and uploaded payment screenshots are stored only in your browser's localStorage and are never transmitted to an external server.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "November 2026",
    sections: [
      {
        heading: "General",
        body: "Alam Fashion is a premier garments store and e-commerce platform built with Next.js, TypeScript and Tailwind CSS.",
      },
    ],
  },
};

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: policy.title }]} />
      <PageHeader title={policy.title} description={`Last updated: ${policy.updated}`} />
      <div className="card max-w-3xl space-y-6 p-6 sm:p-8">
        {policy.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold text-ink-900">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-ink-600">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

