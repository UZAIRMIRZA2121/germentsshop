import { manualPaymentMethods } from "../config/payment";
import {
  estimateDelivery,
  fulfillmentEvent,
  paymentEvent,
} from "../orderUtils";
import type {
  CustomerProfile,
  FulfillmentStatus,
  Order,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
  SavedAddress,
  TimelineEvent,
} from "../types";
import { FULFILLMENT_STEPS } from "../utils";
import { seedProducts } from "./products";

export const DEMO_CUSTOMER_ID = "cust-demo";

export const demoProfile: CustomerProfile = {
  id: DEMO_CUSTOMER_ID,
  fullName: "Ayesha Khan",
  mobile: "0300 1234567",
  email: "ayesha.khan@example.com",
  gender: "female",
  birthday: "1996-04-18",
  joinedAt: "2025-09-12T10:00:00.000Z",
};

export const demoAddresses: SavedAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    fullName: "Ayesha Khan",
    mobile: "0300 1234567",
    city: "Lahore",
    address: "House 24, Street 7, Block C, Gulberg III",
    isDefault: true,
  },
  {
    id: "addr-office",
    label: "Office",
    fullName: "Ayesha Khan",
    mobile: "0300 1234567",
    city: "Lahore",
    address: "3rd Floor, Arfa Software Tower, Ferozepur Road",
    isDefault: false,
  },
];

interface Person {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  city: string;
  address: string;
}

const people: Record<string, Person> = {
  ayesha: {
    id: DEMO_CUSTOMER_ID,
    fullName: "Ayesha Khan",
    mobile: "0300 1234567",
    email: "ayesha.khan@example.com",
    city: "Lahore",
    address: "House 24, Street 7, Block C, Gulberg III",
  },
  bilal: {
    id: "cust-bilal",
    fullName: "Bilal Ahmed",
    mobile: "0321 5550198",
    email: "bilal.ahmed@example.com",
    city: "Karachi",
    address: "Flat 8-B, Sea View Apartments, Clifton Block 4",
  },
  sana: {
    id: "cust-sana",
    fullName: "Sana Malik",
    mobile: "0333 4412087",
    city: "Islamabad",
    address: "House 112, Street 15, Sector F-10/2",
  },
  hamza: {
    id: "cust-hamza",
    fullName: "Hamza Raza",
    mobile: "0345 2290761",
    email: "hamza.raza@example.com",
    city: "Faisalabad",
    address: "Plot 45, Canal Road, Peoples Colony No. 1",
  },
  maryam: {
    id: "cust-maryam",
    fullName: "Maryam Sheikh",
    mobile: "0301 7783340",
    email: "maryam.sheikh@example.com",
    city: "Lahore",
    address: "House 9, Lane 3, DHA Phase 5",
  },
  usman: {
    id: "cust-usman",
    fullName: "Usman Tariq",
    mobile: "0312 9087765",
    city: "Multan",
    address: "Street 4, Gulgasht Colony",
  },
  fatima: {
    id: "cust-fatima",
    fullName: "Fatima Noor",
    mobile: "0322 6043189",
    email: "fatima.noor@example.com",
    city: "Karachi",
    address: "B-27, Block 13-D, Gulshan-e-Iqbal",
  },
  zainab: {
    id: "cust-zainab",
    fullName: "Zainab Ali",
    mobile: "0346 1175024",
    city: "Peshawar",
    address: "House 56, Phase 3, Hayatabad",
  },
};

type Pick = [productId: string, qty: number, size: string | null, color: string | null];

interface OrderDef {
  daysAgo: number;
  hoursAgo?: number;
  who: keyof typeof people;
  items: Pick[];
  method: PaymentMethod;
  methodId?: string;
  txn?: string;
  status: FulfillmentStatus;
  payment: PaymentStatus;
  notes?: string;
}

const defs: OrderDef[] = [
  { daysAgo: 13, who: "ayesha", items: [["prod-015", 1, "M", "Heather Grey"], ["prod-001", 2, "S", "White"]], method: "cod", status: "delivered", payment: "cod_collected" },
  { daysAgo: 12, who: "bilal", items: [["prod-010", 1, "32", "Indigo"]], method: "manual", methodId: "bank", txn: "FT26301884520", status: "delivered", payment: "verified" },
  { daysAgo: 10, who: "sana", items: [["prod-029", 1, "M", "Cream"], ["prod-028", 1, "One Size", "Cream"]], method: "cod", status: "delivered", payment: "cod_collected" },
  { daysAgo: 9, who: "ayesha", items: [["prod-025", 1, "M", "Red"]], method: "manual", methodId: "easypaisa", txn: "EP88213094417", status: "out_for_delivery", payment: "verified", notes: "Please call before delivery." },
  { daysAgo: 8, who: "hamza", items: [["prod-020", 1, "L", "Olive"], ["prod-002", 1, "L", "Black"]], method: "cod", status: "shipped", payment: "cod_pending" },
  { daysAgo: 7, who: "ayesha", items: [["prod-024", 1, "S", "Indigo"]], method: "cod", status: "cancelled", payment: "cod_pending", notes: "Ordered wrong size." },
  { daysAgo: 6, who: "hamza", items: [["prod-012", 1, "34", "Light Wash"]], method: "manual", methodId: "jazzcash", txn: "JC5521098873", status: "cancelled", payment: "rejected" },
  { daysAgo: 5, who: "maryam", items: [["prod-019", 1, "S", "Black"]], method: "manual", methodId: "jazzcash", txn: "JC5530176620", status: "processing", payment: "verified" },
  { daysAgo: 4, who: "ayesha", items: [["prod-022", 1, "S", "Navy"], ["prod-004", 1, "S", "Black"]], method: "manual", methodId: "jazzcash", txn: "JC5541230098", status: "placed", payment: "verification_pending" },
  { daysAgo: 3, who: "usman", items: [["prod-008", 1, "42", "Navy"]], method: "cod", status: "confirmed", payment: "cod_pending" },
  { daysAgo: 2, who: "fatima", items: [["prod-027", 1, "M", "Teal"], ["prod-026", 1, "S", "Blue"]], method: "manual", methodId: "easypaisa", txn: "EP88231771204", status: "placed", payment: "verification_pending" },
  { daysAgo: 1, who: "bilal", items: [["prod-005", 1, "L", "Black"], ["prod-015", 1, "L", "Black"]], method: "cod", status: "placed", payment: "cod_pending" },
  { daysAgo: 0, hoursAgo: 3, who: "zainab", items: [["prod-017", 1, "M", "Red"]], method: "manual", methodId: "bank", txn: "FT26313990112", status: "placed", payment: "verification_pending" },
];

const FREE_SHIPPING_AT = 5000;
const FLAT = 250;

function buildOrder(def: OrderDef, counter: number, now: Date): Order {
  const person = people[def.who];
  const offsetMs =
    def.daysAgo * 86_400_000 +
    (def.daysAgo > 0 ? 4 : (def.hoursAgo ?? 1)) * 3_600_000;
  const created = new Date(now.getTime() - offsetMs);
  const createdAt = created.toISOString();

  const items: OrderItem[] = def.items.map(([pid, quantity, size, color]) => {
    const p = seedProducts.find((x) => x.id === pid)!;
    return {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      price: p.price,
      originalPrice: p.originalPrice,
      quantity,
      size,
      color,
    };
  });

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : FLAT;
  const total = subtotal + shipping;

  const at = (offsetHours: number) =>
    new Date(created.getTime() + offsetHours * 3_600_000).toISOString();

  const timeline: TimelineEvent[] = [fulfillmentEvent("placed", createdAt)];
  timeline.push(
    paymentEvent(
      def.method === "cod" ? "cod_pending" : "verification_pending",
      createdAt,
    ),
  );

  const idx = FULFILLMENT_STEPS.indexOf(def.status);
  const hoursPerStep = [0, 5, 20, 44, 68, 92];
  if (def.status === "cancelled") {
    timeline.push(
      fulfillmentEvent("cancelled", at(26), def.notes ? `Cancelled: ${def.notes}` : undefined),
    );
  } else {
    for (let i = 1; i <= idx; i++) {
      timeline.push(fulfillmentEvent(FULFILLMENT_STEPS[i], at(hoursPerStep[i])));
    }
  }
  if (def.payment === "verified" || def.payment === "rejected") {
    timeline.push(paymentEvent(def.payment, at(3)));
  }
  if (def.payment === "cod_collected") {
    timeline.push(paymentEvent("cod_collected", at(92)));
  }
  timeline.sort((a, b) => a.at.localeCompare(b.at));

  const method = manualPaymentMethods.find((m) => m.id === def.methodId);

  return {
    id: `ORD-${now.getFullYear()}-${counter}`,
    createdAt,
    customerId: person.id,
    customer: { fullName: person.fullName, mobile: person.mobile, email: person.email },
    delivery: { city: person.city, address: person.address },
    notes: def.notes && def.status !== "cancelled" ? def.notes : undefined,
    items,
    subtotal,
    shipping,
    discount: 0,
    total,
    paymentMethod: def.method,
    paymentStatus: def.payment,
    manualPayment:
      def.method === "manual" && method
        ? {
            methodId: method.id,
            methodName: method.name,
            transactionId: def.txn ?? "",
            senderMobile: person.mobile,
            amount: total,
          }
        : undefined,
    fulfillmentStatus: def.status,
    timeline,
    estimatedDelivery: estimateDelivery(person.city, createdAt),
  };
}

export const SEED_ORDER_START = 10001;

export function buildSeedOrders(now = new Date()): Order[] {
  return defs.map((d, i) => buildOrder(d, SEED_ORDER_START + i, now));
}
