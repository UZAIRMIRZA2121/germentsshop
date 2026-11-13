"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Rating, RatingInput } from "@/components/ui/Rating";
import { useToast } from "@/context/ToastContext";
import { generateDemoReviews, ratingDistribution } from "@/lib/data/reviews";
import { reviewService } from "@/lib/services/reviewService";
import { STORAGE_KEYS, subscribeToStorage } from "@/lib/storage";
import type { Product, Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReviewsSection({ product }: { product: Product }) {
  const toast = useToast();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author: "", rating: 0, title: "", comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => void reviewService.listForProduct(product.slug).then(setUserReviews);
    load();
    return subscribeToStorage([STORAGE_KEYS.reviews], load);
  }, [product.slug]);

  const demoReviews = useMemo(() => generateDemoReviews(product.slug, 5), [product.slug]);
  const all = [...userReviews, ...demoReviews];
  const dist = useMemo(() => ratingDistribution(product.rating, product.reviewCount), [product.rating, product.reviewCount]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.author.trim().length < 2) next.author = "Please enter your name.";
    if (form.rating < 1) next.rating = "Please select a star rating.";
    if (form.comment.trim().length < 10) next.comment = "Please write at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.warning("Please complete your review");
      return;
    }
    await reviewService.add(product.slug, {
      author: form.author.trim(),
      rating: form.rating,
      title: form.title.trim() || "Customer review",
      comment: form.comment.trim(),
    });
    toast.success("Thanks for your review!", { message: "Saved in this browser (demo)." });
    setForm({ author: "", rating: 0, title: "", comment: "" });
    setShowForm(false);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-semibold text-ink-900">{product.rating.toFixed(1)}</span>
          <div className="pb-1.5">
            <Rating value={product.rating} size="md" />
            <p className="mt-1 text-sm text-ink-500">Based on {product.reviewCount} reviews</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2">
          {dist.map((d) => (
            <li key={d.stars} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-ink-600">{d.stars} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${d.percent}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-ink-500">{d.count}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-6 w-full" onClick={() => setShowForm((s) => !s)} leftIcon={<MessageSquarePlus className="h-4 w-4" />}>
          {showForm ? "Cancel review" : "Write a review"}
        </Button>
      </div>

      <div>
        {showForm && (
          <form onSubmit={submit} noValidate className="mb-8 space-y-4 rounded-2xl border border-ink-200 bg-ink-50 p-5">
            <h3 className="font-semibold text-ink-900">Share your experience</h3>
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-800">Your rating *</p>
              <RatingInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
              {errors.rating && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{errors.rating}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" required value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} error={errors.author} />
              <Input label="Review title" optional value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <Textarea label="Your review" required value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} error={errors.comment} />
            <Button type="submit">Submit review</Button>
          </form>
        )}

        <ul className="divide-y divide-ink-100">
          {all.map((r) => (
            <li key={r.id} className="py-5 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Rating value={r.rating} />
                <span className="text-sm font-semibold text-ink-900">{r.title}</span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{r.comment}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-ink-400">
                <span className="font-medium text-ink-600">{r.author}</span>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                  </span>
                )}
                <span>· {formatDate(r.date)}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

