import type { Review } from "../types";

const names = [
  "Ayesha K.", "Bilal A.", "Sana M.", "Hamza R.", "Maryam S.", "Usman T.",
  "Fatima N.", "Zainab A.", "Ali H.", "Hira B.", "Danish Q.", "Noor F.",
];

const templates: Array<{ rating: number; title: string; comment: string }> = [
  { rating: 5, title: "Exactly what I wanted", comment: "The quality is excellent and the fit is true to size. The fabric feels premium and it looks even better in person." },
  { rating: 5, title: "Great value for money", comment: "Arrived quickly and well packed. I've already washed it a few times and it still looks brand new." },
  { rating: 4, title: "Very good, slightly loose", comment: "Lovely material and finish. I'd suggest sizing down if you prefer a snug fit, otherwise perfect." },
  { rating: 5, title: "Love it!", comment: "Received so many compliments the first time I wore it. Will definitely order more colours." },
  { rating: 4, title: "Good quality", comment: "Stitching is neat and the colour matches the photos. Delivery took three days to Lahore." },
  { rating: 3, title: "Decent but colour a bit different", comment: "Fabric is nice but the shade is slightly lighter than shown on screen. Still happy with the purchase." },
  { rating: 5, title: "Perfect fit", comment: "Ordered my usual size and it fits perfectly. Comfortable enough to wear all day." },
  { rating: 4, title: "Would recommend", comment: "Nice and soft, good weight. Customer support also helped me with an exchange quickly." },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic demo reviews for a product (no randomness → no hydration drift). */
export function generateDemoReviews(slug: string, count = 5): Review[] {
  const base = hash(slug);
  return Array.from({ length: count }, (_, i) => {
    const t = templates[(base + i * 3) % templates.length];
    const day = 3 + ((base >> (i + 2)) % 60) + i * 9;
    const date = new Date(Date.UTC(2026, 10, 10) - day * 86_400_000);
    return {
      id: `${slug}-demo-${i}`,
      author: names[(base + i * 5) % names.length],
      rating: t.rating,
      title: t.title,
      comment: t.comment,
      date: date.toISOString(),
      verified: (base + i) % 4 !== 0,
    };
  });
}

/** Approximate star distribution for a given average rating & count. */
export function ratingDistribution(
  average: number,
  total: number,
): Array<{ stars: number; count: number; percent: number }> {
  const weights = [1, 2, 3, 4, 5].map((s) => Math.exp(-Math.pow((s - average) / 0.9, 2)));
  const sum = weights.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((stars) => {
    const percent = (weights[stars - 1] / sum) * 100;
    return { stars, percent, count: Math.round((percent / 100) * total) };
  });
}

