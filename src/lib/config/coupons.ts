import type { Coupon } from "../types";

/** Predefined demo coupons (frontend only — not validated by any server). */
export const demoCoupons: Coupon[] = [
  {
    code: "WELCOME10",
    description: "10% off (up to Rs. 1,000)",
    type: "percent",
    value: 10,
    minSubtotal: 0,
    maxDiscount: 1000,
  },
  {
    code: "SAVE500",
    description: "Rs. 500 off orders over Rs. 3,000",
    type: "fixed",
    value: 500,
    minSubtotal: 3000,
  },
  {
    code: "STYLE20",
    description: "20% off orders over Rs. 8,000 (up to Rs. 3,000)",
    type: "percent",
    value: 20,
    minSubtotal: 8000,
    maxDiscount: 3000,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on any order",
    type: "free_shipping",
    value: 0,
    minSubtotal: 0,
  },
];

