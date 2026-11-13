import { BenefitsStrip } from "@/components/home/BenefitsStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Newsletter } from "@/components/home/Newsletter";
import { OfferBanners } from "@/components/home/OfferBanners";
import { ProductSection } from "@/components/home/ProductSection";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <BenefitsStrip />
      <CategoryGrid />
      <ProductSection collection="bestseller" limit={4} />
      <OfferBanners />
      <ProductSection collection="new" limit={4} />
      <ProductSection collection="trending" limit={4} />
      <ProductSection collection="offers" limit={4} />
      <ProductSection collection="recommended" limit={4} />
      <Testimonials />
      <Newsletter />
    </>
  );
}

