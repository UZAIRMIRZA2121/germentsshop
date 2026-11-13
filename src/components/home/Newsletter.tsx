"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { newsletterService } from "@/lib/services/demoService";
import { isValidEmail } from "@/lib/validation";

export function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your email address.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const { alreadySubscribed } = await newsletterService.subscribe(email);
    setLoading(false);
    setDone(true);
    toast.success(alreadySubscribed ? "You're already subscribed" : "Thanks for subscribing!", {
      message: "Demo only — no email is actually sent.",
    });
  };

  return (
    <section className="container-page pt-16" aria-label="Newsletter">
      <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-12 text-center sm:px-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
            <Mail className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="font-display text-3xl font-semibold text-white">Join the Alam Fashion list</h2>
          <p className="mt-3 text-ink-300">
            Be first to hear about new arrivals, exclusive offers and style tips. No spam, unsubscribe anytime.
          </p>

          {done ? (
            <div className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-300" role="status">
              <CheckCircle2 className="h-5 w-5" />
              You&apos;re on the list! Thanks for subscribing.
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 text-left">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email address"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  className="h-12 w-full rounded-xl border border-ink-700 bg-ink-800 px-4 text-white placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                {error && (
                  <p id="newsletter-error" role="alert" className="mt-1.5 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" variant="secondary" size="lg" loading={loading} className="sm:w-auto">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

