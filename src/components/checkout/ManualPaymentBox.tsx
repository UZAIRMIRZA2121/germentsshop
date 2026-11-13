"use client";

import { useRef, useState } from "react";
import { Building2, ImagePlus, QrCode, Smartphone, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input } from "@/components/ui/Field";
import { manualPaymentMethods, type ManualPaymentMethod } from "@/lib/config/payment";
import { cn, formatPrice } from "@/lib/utils";
import type { FieldErrors } from "@/lib/validation";

export interface ManualPaymentFormState {
  methodId: string;
  transactionId: string;
  senderMobile: string;
  screenshot?: string;
}

/** Compresses an uploaded image to a small JPEG data-URL so localStorage doesn't overflow. */
async function compressScreenshot(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Invalid image"));
    el.src = dataUrl;
  });

  const maxDim = 900;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function ManualPaymentBox({
  amount,
  value,
  onChange,
  errors,
}: {
  amount: number;
  value: ManualPaymentFormState;
  onChange: (next: ManualPaymentFormState) => void;
  errors: FieldErrors<"transactionId" | "senderMobile">;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const active: ManualPaymentMethod =
    manualPaymentMethods.find((m) => m.id === value.methodId) ?? manualPaymentMethods[0];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image is too large (max 8 MB).");
      return;
    }
    try {
      const compressed = await compressScreenshot(file);
      onChange({ ...value, screenshot: compressed });
    } catch {
      setUploadError("Could not process this image. Please try another file.");
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-ink-200 bg-ink-50/70 p-4 sm:p-5">
      {/* Method tabs */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-ink-900">1. Choose transfer method</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {manualPaymentMethods.map((m) => {
            const selected = m.id === active.id;
            const Icon = m.id === "bank" ? Building2 : Smartphone;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange({ ...value, methodId: m.id })}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left transition",
                  selected
                    ? "border-brand-500 bg-white ring-2 ring-brand-500/20"
                    : "border-ink-200 bg-white/60 hover:border-ink-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    selected ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-600",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">{m.name}</span>
                  <span className="block truncate text-[11px] text-ink-500">{m.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account details + QR placeholder */}
      <div className="grid gap-4 rounded-xl border border-ink-200 bg-white p-4 sm:grid-cols-[1fr_132px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-2.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Exact amount to transfer
              </p>
              <p className="text-xl font-bold text-brand-600">{formatPrice(amount)}</p>
            </div>
            <CopyButton value={String(Math.round(amount))} label="Amount" />
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">Account holder</dt>
              <dd className="flex items-center gap-2 font-semibold text-ink-900">
                <span>{active.accountTitle}</span>
                <CopyButton value={active.accountTitle} label="Account title" compact />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">
                {active.id === "bank" ? "Account number" : "Mobile / Account"}
              </dt>
              <dd className="flex items-center gap-2 font-mono font-semibold text-ink-900">
                <span>{active.accountNumber}</span>
                <CopyButton value={active.accountNumber} label="Account number" compact />
              </dd>
            </div>
            {active.extraDetails.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-2">
                <dt className="text-ink-500">{d.label}</dt>
                <dd className="flex items-center gap-2 font-medium text-ink-900">
                  <span className="text-right">{d.value}</span>
                  <CopyButton value={d.value} label={d.label} compact />
                </dd>
              </div>
            ))}
          </dl>

          <ol className="list-decimal space-y-1 border-t border-ink-100 pt-2.5 pl-4 text-xs text-ink-600">
            {active.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 bg-ink-50 p-3 text-center">
          <QrCode className="h-16 w-16 text-ink-400" aria-hidden />
          <p className="mt-2 text-[11px] font-medium text-ink-500">QR Code Placeholder</p>
          <p className="text-[10px] text-ink-400">{active.name} Demo</p>
        </div>
      </div>

      {/* Customer's payment proof */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-ink-900">2. Enter your transfer details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Transaction ID / Reference Number"
            required
            placeholder="e.g. TID123456789"
            value={value.transactionId}
            onChange={(e) => onChange({ ...value, transactionId: e.target.value })}
            error={errors.transactionId}
            hint="6–30 characters from your transfer receipt"
          />
          <Input
            label="Sender's Mobile Number"
            required
            type="tel"
            placeholder="0300 1234567"
            value={value.senderMobile}
            onChange={(e) => onChange({ ...value, senderMobile: e.target.value })}
            error={errors.senderMobile}
            hint="Mobile number used to send the payment"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-800">
            Payment Screenshot <span className="text-xs font-normal text-ink-400">(optional)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
            id="payment-screenshot"
          />
          {value.screenshot ? (
            <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.screenshot}
                alt="Uploaded payment screenshot"
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-ink-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Screenshot attached</p>
                <p className="text-xs text-ink-500">Stored locally in this browser for demo review.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...value, screenshot: undefined });
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove screenshot"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="payment-screenshot"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 bg-white px-4 py-4 text-sm font-medium text-ink-600 transition hover:border-brand-500 hover:text-brand-600"
            >
              <ImagePlus className="h-5 w-5" />
              Upload transfer receipt screenshot
            </label>
          )}
          {uploadError && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      <Alert tone="warning" title="Verification required">
        Your order will be saved with status <b>Payment Verification Pending</b> and will only be
        processed after the store verifies your transfer. Do not submit fake references.
      </Alert>
    </div>
  );
}

