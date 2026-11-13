/* -------------------------------------------------------------------------- */
/*  Shared domain types. These mirror what a future REST/GraphQL backend would */
/*  return, so UI components never depend on localStorage details.             */
/* -------------------------------------------------------------------------- */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductTag =
  | "bestseller"
  | "new"
  | "trending"
  | "featured"
  | "recommended";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  /** Category slug */
  category: string;
  shortDescription: string;
  description: string;
  price: number;
  /** Original (compare-at) price. Present only when the product is discounted. */
  originalPrice?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: ProductTag[];
  specifications: ProductSpec[];
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

/* ------------------------------- Cart ------------------------------------ */

export interface CartItem {
  productId: string;
  size: string | null;
  color: string | null;
  quantity: number;
}

export interface CartLine {
  key: string;
  product: Product;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Highest quantity the customer may buy right now. */
  maxQty: number;
  outOfStock: boolean;
  /** Quantity in the cart exceeds the available stock. */
  exceedsStock: boolean;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
}

export interface Totals {
  itemCount: number;
  subtotal: number;
  /** Savings versus the products' original prices. */
  productSavings: number;
  couponDiscount: number;
  shipping: number;
  freeShippingApplied: boolean;
  total: number;
}

/* ------------------------------- Orders ---------------------------------- */

export type FulfillmentStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "manual";

export type PaymentStatus =
  | "cod_pending" // Cash on delivery: payable to the courier
  | "cod_collected" // Cash on delivery: cash received
  | "verification_pending" // Manual payment: awaiting admin verification
  | "verified" // Manual payment: verified by admin
  | "rejected"; // Manual payment: could not be verified

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface CustomerDetails {
  fullName: string;
  mobile: string;
  email?: string;
}

export interface DeliveryAddress {
  city: string;
  address: string;
}

export interface ManualPaymentDetails {
  methodId: string;
  methodName: string;
  transactionId: string;
  senderMobile: string;
  amount: number;
  /** Compressed data-URL of the uploaded screenshot (demo only, not secure). */
  screenshot?: string;
}

export interface TimelineEvent {
  id: string;
  kind: "order" | "payment";
  status: FulfillmentStatus | PaymentStatus;
  title: string;
  note?: string;
  at: string;
  /** True for events created by the demo "simulate courier update" action. */
  simulated?: boolean;
}

export interface Order {
  /** Unique order id. Also used as the public order reference. */
  id: string;
  createdAt: string;
  customerId: string;
  customer: CustomerDetails;
  delivery: DeliveryAddress;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  manualPayment?: ManualPaymentDetails;
  fulfillmentStatus: FulfillmentStatus;
  timeline: TimelineEvent[];
  estimatedDelivery: { from: string; to: string };
}

export interface OrderDraft {
  customer: CustomerDetails;
  delivery: DeliveryAddress;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  manualPayment?: ManualPaymentDetails;
}

/* ------------------------------ Customers -------------------------------- */

export interface CustomerProfile {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  gender?: "female" | "male" | "other" | "";
  birthday?: string;
  joinedAt: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  city: string;
  address: string;
  isDefault: boolean;
}

export interface AdminCustomer {
  key: string;
  fullName: string;
  mobile: string;
  email?: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

