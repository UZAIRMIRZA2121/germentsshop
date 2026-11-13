export const siteConfig = {
  name: "Alam Fashion",
  tagline: "Exclusive Everyday & Luxury Fashion",
  description:
    "Alam Fashion is a premier garments and menswear destination in Douglas Pura, Faisalabad. Offering exquisite traditional wear, formal suits, waistcoats, fabrics, and modern everyday apparel.",
  contact: {
    email: "alamfashionfsd@gmail.com",
    phone: "+92 321 9669289",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923219669289",
    address: "C38F+HR6, Douglas Pura, Faisalabad, Punjab, Pakistan",
    hours: "Open Daily: 11:00 AM – 11:00 PM",
  },
  social: [
    { name: "TikTok", href: "https://www.tiktok.com" },
    { name: "Facebook", href: "https://www.facebook.com" },
    { name: "Instagram", href: "https://www.instagram.com" },
    { name: "WhatsApp", href: "https://wa.me/923219669289" },
  ],
  announcements: [
    "Free nationwide delivery on orders over Rs. 5,000",
    "Direct WhatsApp order confirmation on +92 321 9669289",
    "Visit our retail store in Douglas Pura, Faisalabad (Open till 11 PM)",
  ],
  currency: "PKR",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories", hasMenu: true },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const DEMO_NOTICE =
  "Alam Fashion online store — orders are synchronized with the backend database and sent directly to WhatsApp (+92 321 9669289).";
