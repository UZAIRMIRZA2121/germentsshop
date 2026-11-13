import type { Metadata } from "next";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { seedProducts } from "@/lib/data/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Seed data is used for the document title; products added in the demo admin resolve client-side.
  const product = seedProducts.find((p) => p.slug === slug);
  return product
    ? { title: product.name, description: product.shortDescription }
    : { title: "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}

