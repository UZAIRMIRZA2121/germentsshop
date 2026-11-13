import type { Category } from "../types";
import { photo, unsplash } from "./images";

export const seedCategories: Category[] = [
  {
    id: "cat-tshirts",
    slug: "t-shirts",
    name: "T-Shirts",
    description: "Soft cotton tees, graphic prints and everyday basics.",
    image: unsplash(photo.retroTee, 700, 800),
  },
  {
    id: "cat-shirts",
    slug: "shirts-formal",
    name: "Shirts & Formal",
    description: "Crisp shirts, blazers and tailoring for work and events.",
    image: unsplash(photo.dressShirt, 700, 800),
  },
  {
    id: "cat-jeans",
    slug: "jeans-trousers",
    name: "Jeans & Trousers",
    description: "Denim fits and trousers built for comfort all day long.",
    image: unsplash(photo.jeansLevis, 700, 800),
  },
  {
    id: "cat-hoodies",
    slug: "hoodies-sweatshirts",
    name: "Hoodies & Sweatshirts",
    description: "Heavyweight fleece layers for the cooler months.",
    image: unsplash(photo.greyHoodie, 700, 800),
  },
  {
    id: "cat-jackets",
    slug: "jackets-outerwear",
    name: "Jackets & Outerwear",
    description: "Leather, bomber, denim and wool statement outerwear.",
    image: unsplash(photo.bomberJacket, 700, 800),
  },
  {
    id: "cat-women",
    slug: "womens-wear",
    name: "Women's Wear",
    description: "Dresses, jumpsuits and knitwear with effortless style.",
    image: unsplash(photo.whiteHangers, 700, 800),
  },
];

