import { hashPassword } from "../auth";
import { seedCategories } from "../data/categories";
import { buildSeedOrders, demoAddresses, demoProfile, SEED_ORDER_START } from "../data/orders";
import { seedProducts } from "../data/products";
import { prisma } from "../db";

let seedPromise: Promise<void> | null = null;

/** Seeds the SQLite database once if it is empty. */
export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) return;

  // 1. Seed Admin & Demo Customer
  const adminEmail = "admin@alamfashion.example";
  await prisma.user.create({
    data: {
      id: "admin-1",
      fullName: "Alam Fashion Admin",
      email: adminEmail,
      mobile: "0321 9669289",
      passwordHash: hashPassword("admin123"),
      role: "admin",
    },
  });

  await prisma.user.create({
    data: {
      id: demoProfile.id,
      fullName: demoProfile.fullName,
      email: demoProfile.email,
      mobile: demoProfile.mobile,
      passwordHash: hashPassword("customer123"),
      role: "customer",
      gender: demoProfile.gender || null,
      birthday: demoProfile.birthday || null,
      addresses: {
        create: demoAddresses.map((a) => ({
          id: a.id,
          label: a.label,
          fullName: a.fullName,
          mobile: a.mobile,
          city: a.city,
          address: a.address,
          isDefault: a.isDefault,
        })),
      },
    },
  });

  // 2. Seed Categories
  for (const c of seedCategories) {
    await prisma.category.create({
      data: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
      },
    });
  }

  // 3. Seed Products
  for (const p of seedProducts) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        category: p.category,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        imagesJson: JSON.stringify(p.images),
        colorsJson: JSON.stringify(p.colors),
        sizesJson: JSON.stringify(p.sizes),
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        tagsJson: JSON.stringify(p.tags),
        specsJson: JSON.stringify(p.specifications),
        createdAt: new Date(p.createdAt),
      },
    });
  }

  // 4. Seed Initial Orders
  const orders = buildSeedOrders();
  for (const o of orders) {
    await prisma.order.create({
      data: {
        id: o.id,
        userId: o.customerId === demoProfile.id ? demoProfile.id : null,
        customerName: o.customer.fullName,
        customerMobile: o.customer.mobile,
        customerEmail: o.customer.email ?? null,
        city: o.delivery.city,
        address: o.delivery.address,
        notes: o.notes ?? null,
        subtotal: o.subtotal,
        shipping: o.shipping,
        discount: o.discount,
        couponCode: o.couponCode ?? null,
        total: o.total,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        manualMethodId: o.manualPayment?.methodId ?? null,
        manualMethodName: o.manualPayment?.methodName ?? null,
        transactionId: o.manualPayment?.transactionId ?? null,
        senderMobile: o.manualPayment?.senderMobile ?? null,
        screenshot: o.manualPayment?.screenshot ?? null,
        fulfillmentStatus: o.fulfillmentStatus,
        estimatedFrom: new Date(o.estimatedDelivery.from),
        estimatedTo: new Date(o.estimatedDelivery.to),
        createdAt: new Date(o.createdAt),
        items: {
          create: o.items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            image: i.image,
            price: i.price,
            originalPrice: i.originalPrice ?? null,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
        },
        timeline: {
          create: o.timeline.map((t) => ({
            id: t.id,
            kind: t.kind,
            status: t.status,
            title: t.title,
            note: t.note ?? null,
            simulated: Boolean(t.simulated),
            at: new Date(t.at),
          })),
        },
      },
    });
  }

  await prisma.appMeta.upsert({
    where: { key: "orderCounter" },
    update: { value: String(SEED_ORDER_START + orders.length - 1) },
    create: { key: "orderCounter", value: String(SEED_ORDER_START + orders.length - 1) },
  });
}

export async function resetCatalogAndOrders(): Promise<void> {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const c of seedCategories) {
    await prisma.category.create({ data: c });
  }
  for (const p of seedProducts) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        category: p.category,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        imagesJson: JSON.stringify(p.images),
        colorsJson: JSON.stringify(p.colors),
        sizesJson: JSON.stringify(p.sizes),
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        tagsJson: JSON.stringify(p.tags),
        specsJson: JSON.stringify(p.specifications),
        createdAt: new Date(p.createdAt),
      },
    });
  }
  const orders = buildSeedOrders();
  for (const o of orders) {
    await prisma.order.create({
      data: {
        id: o.id,
        userId: o.customerId === demoProfile.id ? demoProfile.id : null,
        customerName: o.customer.fullName,
        customerMobile: o.customer.mobile,
        customerEmail: o.customer.email ?? null,
        city: o.delivery.city,
        address: o.delivery.address,
        notes: o.notes ?? null,
        subtotal: o.subtotal,
        shipping: o.shipping,
        discount: o.discount,
        couponCode: o.couponCode ?? null,
        total: o.total,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        manualMethodId: o.manualPayment?.methodId ?? null,
        manualMethodName: o.manualPayment?.methodName ?? null,
        transactionId: o.manualPayment?.transactionId ?? null,
        senderMobile: o.manualPayment?.senderMobile ?? null,
        screenshot: o.manualPayment?.screenshot ?? null,
        fulfillmentStatus: o.fulfillmentStatus,
        estimatedFrom: new Date(o.estimatedDelivery.from),
        estimatedTo: new Date(o.estimatedDelivery.to),
        createdAt: new Date(o.createdAt),
        items: {
          create: o.items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            image: i.image,
            price: i.price,
            originalPrice: i.originalPrice ?? null,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
        },
        timeline: {
          create: o.timeline.map((t) => ({
            id: t.id,
            kind: t.kind,
            status: t.status,
            title: t.title,
            note: t.note ?? null,
            simulated: Boolean(t.simulated),
            at: new Date(t.at),
          })),
        },
      },
    });
  }
  await prisma.appMeta.upsert({
    where: { key: "orderCounter" },
    update: { value: String(SEED_ORDER_START + orders.length - 1) },
    create: { key: "orderCounter", value: String(SEED_ORDER_START + orders.length - 1) },
  });
}

