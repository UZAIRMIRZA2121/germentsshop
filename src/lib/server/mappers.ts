import type {
  Address,
  Category as PrismaCategory,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderTimeline as PrismaOrderTimeline,
  Product as PrismaProduct,
  Review as PrismaReview,
} from "@prisma/client";
import type {
  Category,
  FulfillmentStatus,
  Order,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductColor,
  ProductSpec,
  ProductTag,
  Review,
  SavedAddress,
} from "../types";

export function mapCategory(row: PrismaCategory): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
  };
}

export function mapProduct(row: PrismaProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category,
    shortDescription: row.shortDescription,
    description: row.description,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    images: JSON.parse(row.imagesJson) as string[],
    colors: JSON.parse(row.colorsJson) as ProductColor[],
    sizes: JSON.parse(row.sizesJson) as string[],
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.reviewCount,
    tags: JSON.parse(row.tagsJson) as ProductTag[],
    specifications: JSON.parse(row.specsJson) as ProductSpec[],
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapReview(row: PrismaReview): Review {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    date: row.createdAt.toISOString(),
    verified: row.verified,
  };
}

export function mapAddress(row: Address): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    fullName: row.fullName,
    mobile: row.mobile,
    city: row.city,
    address: row.address,
    isDefault: row.isDefault,
  };
}

type OrderWithRelations = PrismaOrder & {
  items: PrismaOrderItem[];
  timeline: PrismaOrderTimeline[];
};

export function mapOrder(row: OrderWithRelations): Order {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    customerId: row.userId ?? "guest",
    customer: {
      fullName: row.customerName,
      mobile: row.customerMobile,
      email: row.customerEmail ?? undefined,
    },
    delivery: {
      city: row.city,
      address: row.address,
    },
    notes: row.notes ?? undefined,
    items: row.items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      image: i.image,
      price: i.price,
      originalPrice: i.originalPrice ?? undefined,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    discount: row.discount,
    couponCode: row.couponCode ?? undefined,
    total: row.total,
    paymentMethod: row.paymentMethod as PaymentMethod,
    paymentStatus: row.paymentStatus as PaymentStatus,
    manualPayment:
      row.paymentMethod === "manual"
        ? {
            methodId: row.manualMethodId ?? "jazzcash",
            methodName: row.manualMethodName ?? "Manual Transfer",
            transactionId: row.transactionId ?? "",
            senderMobile: row.senderMobile ?? "",
            amount: row.total,
            screenshot: row.screenshot ?? undefined,
          }
        : undefined,
    fulfillmentStatus: row.fulfillmentStatus as FulfillmentStatus,
    timeline: row.timeline
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map((t) => ({
        id: t.id,
        kind: t.kind as "order" | "payment",
        status: t.status as FulfillmentStatus | PaymentStatus,
        title: t.title,
        note: t.note ?? undefined,
        at: t.at.toISOString(),
        simulated: t.simulated || undefined,
      })),
    estimatedDelivery: {
      from: row.estimatedFrom.toISOString(),
      to: row.estimatedTo.toISOString(),
    },
  };
}

