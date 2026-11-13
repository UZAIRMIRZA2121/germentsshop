# Alam Fashion — E-Commerce Platform (Full-Stack & Storefront)

A complete, modern garments e-commerce platform built with **Next.js (App Router), TypeScript, Tailwind CSS, Prisma (SQLite), and Lucide Icons**.

Inspired by and configured for **Alam Fashion (عالم فیشن)** — retail garment store located at **Douglas Pura, Faisalabad, Pakistan**.

---

## 🌟 Key Features

1. **Brand Identity & Logo ("lofo")**:
   - Custom luxury vector monogram logo badge (`AF` architectural monogram + haute couture gold finial).
   - Brand name updated site-wide to **Alam Fashion**.
   - Custom SVG favicon in `src/app/icon.svg`.

2. **Real Store Details**:
   - **Store Location**: C38F+HR6, Douglas Pura, Faisalabad, Punjab, Pakistan.
   - **Phone & WhatsApp**: `+92 321 9669289` (`0321-9669289`).
   - **Store Hours**: Open Daily, 11:00 AM – 11:00 PM.
   - **Socials**: TikTok, Facebook, Instagram, WhatsApp.

3. **Automatic & Direct WhatsApp Order Dispatch**:
   - Upon placing an order (COD or Manual Online Payment), full order details are automatically opened in WhatsApp directed to **`+92 321 9669289`** (`https://wa.me/923219669289?text=...`).
   - Order message includes: Order ID, customer name, mobile, address, each product item with size/color/quantity, price breakdown, and payment details (including Transaction ID for JazzCash/Easypaisa/Bank).
   - Also includes a prominent 1-click **"Send Order on WhatsApp"** button on the Order Success and Order Details pages.

4. **Full-Stack SQLite + Prisma Backend**:
   - Database: SQLite via Prisma at `prisma/dev.db`.
   - Comprehensive REST API endpoints under `/api/*`:
     - Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/session`
     - Products & Categories: `/api/products`, `/api/categories`
     - Orders: `/api/orders`, `/api/orders/[id]`
     - Reviews, Newsletter, Contact Messages, Account Addresses.
   - Session authentication with secure `scrypt` password hashing and cookie sessions.

5. **Admin Dashboard**:
   - URL: `/admin`
   - **Email**: `admin@alamfashion.example`
   - **Password**: `admin123`
   - Manage products, orders, categories, verify manual payments (JazzCash / Easypaisa / Bank Transfer), and update delivery status.

6. **Customer Portal**:
   - **Email**: `ayesha.khan@example.com`
   - **Password**: `customer123`
   - View orders, track deliveries with live 6-step timeline, save addresses, manage wishlist and shopping cart.

---

## 🚀 Running Locally

```bash
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Admin portal: [http://localhost:3000/admin](http://localhost:3000/admin).
