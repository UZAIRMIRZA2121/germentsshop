"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Banknote,
  Check,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { OrderTotals } from "@/components/order/OrderTotals";
import { Alert } from "@/components/ui/Alert";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { SafeImage } from "@/components/ui/SafeImage";
import { useAccount } from "@/context/AccountContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import { manualPaymentMethods, pakistanCities } from "@/lib/config/payment";
import { calculateTotals } from "@/lib/pricing";
import { customerService } from "@/lib/services/customerService";
import type { OrderItem, PaymentMethod } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import {
  hasErrors,
  validateAddress,
  validateCity,
  validateFullName,
  validateMobile,
  validateOptionalEmail,
  validateTransactionId,
  type FieldErrors,
} from "@/lib/validation";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { ManualPaymentBox, type ManualPaymentFormState } from "./ManualPaymentBox";

const STEPS = [
  { id: 1, label: "Delivery Info" },
  { id: 2, label: "Payment Method" },
  { id: 3, label: "Review & Place Order" },
] as const;

export function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";

  const cart = useCart();
  const { addresses, profile } = useAccount();
  const { placeOrder } = useOrders();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Customer + Delivery state
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Lahore");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [manual, setManual] = useState<ManualPaymentFormState>({
    methodId: manualPaymentMethods[0].id,
    transactionId: "",
    senderMobile: "",
  });

  const [errors, setErrors] = useState<
    FieldErrors<"fullName" | "mobile" | "email" | "city" | "address" | "transactionId" | "senderMobile">
  >({});

  // Pre-fill from saved checkout info or default customer address
  useEffect(() => {
    if (prefilled) return;
    let active = true;
    void customerService.getCheckoutInfo().then((saved) => {
      if (!active) return;
      if (saved) {
        setFullName(saved.fullName);
        setMobile(saved.mobile);
        setEmail(saved.email);
        setCity(saved.city);
        setAddress(saved.address);
      } else {
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (def) {
          setFullName(def.fullName);
          setMobile(def.mobile);
          setCity(def.city);
          setAddress(def.address);
          setEmail(profile.email);
        } else if (profile.fullName) {
          setFullName(profile.fullName);
          setMobile(profile.mobile);
          setEmail(profile.email);
        }
      }
      setPrefilled(true);
    });
    return () => {
      active = false;
    };
  }, [addresses, profile, prefilled]);

  // Lines & Totals (Buy Now vs Cart)
  const activeLines = useMemo(() => {
    if (isBuyNow) return cart.buyNowLine ? [cart.buyNowLine] : [];
    return cart.payableLines;
  }, [isBuyNow, cart.buyNowLine, cart.payableLines]);

  const totals = useMemo(() => {
    if (isBuyNow) return calculateTotals(activeLines, null);
    return cart.totals;
  }, [isBuyNow, activeLines, cart.totals]);

  if (!cart.ready) {
    return (
      <div className="container-page py-16">
        <PageLoader label="Preparing checkout…" />
      </div>
    );
  }

  if (activeLines.length === 0) {
    return (
      <div className="container-page py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <EmptyState
          icon={<ShoppingBag />}
          title="Nothing to check out"
          description={
            isBuyNow
              ? "Your Buy Now selection expired or is unavailable."
              : "Add some in-stock items to your cart before checking out."
          }
          action={
            <>
              <LinkButton href="/shop">Browse products</LinkButton>
              {!isBuyNow && (
                <LinkButton href="/cart" variant="outline">
                  Go to cart
                </LinkButton>
              )}
            </>
          }
        />
      </div>
    );
  }

  const validateStep1 = () => {
    const next: typeof errors = {
      fullName: validateFullName(fullName),
      mobile: validateMobile(mobile),
      email: validateOptionalEmail(email),
      city: validateCity(city),
      address: validateAddress(address),
    };
    setErrors((e) => ({ ...e, ...next }));
    if (hasErrors(next)) {
      toast.error("Please fix the highlighted delivery fields");
      return false;
    }
    void customerService.saveCheckoutInfo({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      city: city.trim(),
      address: address.trim(),
    });
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === "cod") {
      setErrors((e) => ({ ...e, transactionId: undefined, senderMobile: undefined }));
      return true;
    }
    const next: typeof errors = {
      transactionId: validateTransactionId(manual.transactionId),
      senderMobile: validateMobile(manual.senderMobile, "Sender's mobile number"),
    };
    setErrors((e) => ({ ...e, ...next }));
    if (hasErrors(next)) {
      toast.error("Missing or invalid payment details", {
        message: "Please enter a valid Transaction ID and sender mobile number.",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      if (!manual.senderMobile) setManual((m) => ({ ...m, senderMobile: mobile }));
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    const items: OrderItem[] = activeLines.map((l) => ({
      productId: l.product.id,
      slug: l.product.slug,
      name: l.product.name,
      image: l.product.images[0],
      price: l.unitPrice,
      originalPrice: l.product.originalPrice,
      quantity: l.quantity,
      size: l.size,
      color: l.color,
    }));

    const method = manualPaymentMethods.find((m) => m.id === manual.methodId);
    const result = await placeOrder({
      customer: {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
      },
      delivery: { city: city.trim(), address: address.trim() },
      notes: notes.trim() || undefined,
      items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.couponDiscount,
      couponCode: !isBuyNow && !cart.couponError ? (cart.couponCode ?? undefined) : undefined,
      total: totals.total,
      paymentMethod,
      manualPayment:
        paymentMethod === "manual" && method
          ? {
              methodId: method.id,
              methodName: method.name,
              transactionId: manual.transactionId.trim(),
              senderMobile: manual.senderMobile.trim(),
              amount: totals.total,
              screenshot: manual.screenshot,
            }
          : undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      toast.error("Could not place order", { message: result.error });
      return;
    }

    // Clear purchased items only AFTER successful order placement
    if (isBuyNow) {
      cart.clearBuyNow();
    } else {
      await cart.removeKeys(activeLines.map((l) => l.key));
      if (cart.couponCode) await cart.removeCoupon();
    }

    if (paymentMethod === "manual") {
      toast.warning("Order placed — Payment Verification Pending", {
        message: `Reference ${result.data.id} saved. Opening WhatsApp with your order details…`,
      });
    } else {
      toast.success("Order placed successfully!", {
        message: `Order ${result.data.id} confirmed. Opening WhatsApp with your order details…`,
      });
    }

    // Automatically open WhatsApp with full order, products, amount, and payment/transaction details
    const waUrl = getWhatsAppOrderUrl(result.data);
    window.open(waUrl, "_blank", "noopener,noreferrer");

    router.push(`/order-success/${result.data.id}`);
  };

  const selectedMethod = manualPaymentMethods.find((m) => m.id === manual.methodId);

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <PageHeader
        title="Checkout"
        description="Complete your delivery details and choose your payment method."
      />

      {/* Stepper */}
      <ol className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Checkout steps">
        {STEPS.map((s) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={s.id > step}
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition",
                  active
                    ? "border-ink-900 bg-ink-900 text-white"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400"
                      : "border-ink-200 bg-white text-ink-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    active
                      ? "bg-brand-500 text-white"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-ink-100 text-ink-500",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.id}
                </span>
                <span className="text-sm font-semibold">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="card space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-ink-900">1. Customer &amp; Delivery Details</h2>
                {addresses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {addresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setFullName(a.fullName);
                          setMobile(a.mobile);
                          setCity(a.city);
                          setAddress(a.address);
                          setErrors({});
                          toast.info(`Filled "${a.label}" address`);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-700 hover:border-brand-500 hover:text-brand-600"
                      >
                        <MapPin className="h-3 w-3" /> Use {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  required
                  placeholder="Ayesha Khan"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((er) => ({ ...er, fullName: undefined }));
                  }}
                  error={errors.fullName}
                />
                <Input
                  label="Mobile Number"
                  required
                  type="tel"
                  placeholder="0300 1234567"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setErrors((er) => ({ ...er, mobile: undefined }));
                  }}
                  error={errors.mobile}
                />
                <Input
                  label="Email Address"
                  optional
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((er) => ({ ...er, email: undefined }));
                  }}
                  error={errors.email}
                />
                <Select
                  label="City"
                  required
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setErrors((er) => ({ ...er, city: undefined }));
                  }}
                  error={errors.city}
                >
                  {pakistanCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other">Other City</option>
                </Select>
              </div>

              <Textarea
                label="Complete Delivery Address"
                required
                placeholder="House / Flat no., Street, Block / Sector, Area, Landmark…"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((er) => ({ ...er, address: undefined }));
                }}
                error={errors.address}
              />

              <Textarea
                label="Order Notes"
                optional
                placeholder="Any delivery instructions (e.g. call before arriving)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[72px]"
              />

              <div className="flex justify-end pt-2">
                <Button size="lg" onClick={handleNext}>
                  Continue to Payment →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="card space-y-5 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-ink-900">2. Select Payment Method</h2>

              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "cod"}
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "flex items-start gap-3.5 rounded-2xl border p-4 text-left transition",
                    paymentMethod === "cod"
                      ? "border-ink-900 bg-ink-50 ring-2 ring-ink-900/10"
                      : "border-ink-200 hover:border-ink-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      paymentMethod === "cod" ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600",
                    )}
                  >
                    <Banknote className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">Cash on Delivery (COD)</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Pay in cash when your parcel arrives at your doorstep.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === "manual"}
                  onClick={() => setPaymentMethod("manual")}
                  className={cn(
                    "flex items-start gap-3.5 rounded-2xl border p-4 text-left transition",
                    paymentMethod === "manual"
                      ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20"
                      : "border-ink-200 hover:border-ink-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      paymentMethod === "manual" ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-600",
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">Manual Online Payment</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      JazzCash, Easypaisa or Bank Transfer + Transaction ID.
                    </p>
                  </div>
                </button>
              </div>

              {paymentMethod === "cod" ? (
                <Alert tone="info" title="Cash on Delivery selected">
                  Please keep <b>{formatPrice(totals.total)}</b> ready at the time of delivery. Your
                  order will be confirmed immediately.
                </Alert>
              ) : (
                <ManualPaymentBox
                  amount={totals.total}
                  value={manual}
                  onChange={(next) => {
                    setManual(next);
                    setErrors((er) => ({
                      ...er,
                      transactionId: undefined,
                      senderMobile: undefined,
                    }));
                  }}
                  errors={{
                    transactionId: errors.transactionId,
                    senderMobile: errors.senderMobile,
                  }}
                />
              )}

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back to Delivery
                </Button>
                <Button size="lg" onClick={handleNext}>
                  Review Order →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card space-y-6 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-ink-900">3. Review &amp; Confirm Order</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-ink-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink-900">Shipping To</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-900">{fullName}</p>
                  <p className="text-sm text-ink-600">{mobile}</p>
                  {email && <p className="text-sm text-ink-600">{email}</p>}
                  <p className="mt-1 text-sm text-ink-600">
                    {address}, {city}
                  </p>
                  {notes && <p className="mt-2 text-xs italic text-ink-500">Note: {notes}</p>}
                </div>

                <div className="rounded-xl border border-ink-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink-900">Payment Method</h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  {paymentMethod === "cod" ? (
                    <div className="mt-2 text-sm text-ink-600">
                      <p className="font-medium text-ink-900">Cash on Delivery (COD)</p>
                      <p className="mt-1">Pay {formatPrice(totals.total)} to the courier on delivery.</p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-ink-600">
                      <p className="font-medium text-ink-900">
                        Manual Transfer — {selectedMethod?.name}
                      </p>
                      <p>
                        Transaction ID:{" "}
                        <span className="font-mono font-semibold text-ink-900">
                          {manual.transactionId}
                        </span>
                      </p>
                      <p>Sender Mobile: {manual.senderMobile}</p>
                      <p className="text-xs font-semibold text-amber-700">
                        Initial status: Payment Verification Pending
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink-900">
                  Items ({totals.itemCount})
                </h3>
                <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200">
                  {activeLines.map((l) => (
                    <li key={l.key} className="flex items-center gap-3 p-3">
                      <SafeImage
                        src={l.product.images[0]}
                        alt={l.product.name}
                        className="h-14 w-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {l.product.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          {[l.color, l.size, `Qty ${l.quantity}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">
                        {formatPrice(l.lineTotal)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  ← Back to Payment
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  loading={submitting}
                  onClick={handleSubmit}
                  leftIcon={<Lock className="h-4 w-4" />}
                >
                  Place Order · {formatPrice(totals.total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky order summary sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">Order Summary</h2>
              {!isBuyNow && (
                <Link href="/cart" className="text-xs font-semibold text-brand-600 hover:underline">
                  Edit cart
                </Link>
              )}
            </div>

            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {activeLines.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    <SafeImage
                      src={l.product.images[0]}
                      alt={l.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{l.product.name}</p>
                    <p className="text-xs text-ink-500">
                      {[l.color, l.size, `× ${l.quantity}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatPrice(l.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-100 pt-4">
              <OrderTotals
                totals={totals}
                couponCode={!isBuyNow && !cart.couponError ? cart.couponCode : null}
              />
            </div>

            <p className="flex items-center gap-2 text-xs text-ink-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              Demo checkout — orders are saved locally in this browser.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

