"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  message?: string;
  action?: { label: string; href: string };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  type: ToastType;
  title: string;
}

interface ToastApi {
  success: (title: string, options?: ToastOptions) => void;
  error: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const styles: Record<ToastType, { icon: typeof Info; box: string; iconColor: string }> = {
  success: { icon: CheckCircle2, box: "border-emerald-200", iconColor: "text-emerald-600" },
  error: { icon: XCircle, box: "border-red-200", iconColor: "text-red-600" },
  warning: { icon: AlertTriangle, box: "border-amber-200", iconColor: "text-amber-600" },
  info: { icon: Info, box: "border-sky-200", iconColor: "text-sky-600" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, title: string, options: ToastOptions = {}) => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-3), { id, type, title, ...options }]);
      setTimeout(() => dismiss(id), options.duration ?? 4800);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, o) => push("success", t, o),
      error: (t, o) => push("error", t, o),
      warning: (t, o) => push("warning", t, o),
      info: (t, o) => push("info", t, o),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => {
          const { icon: Icon, box, iconColor } = styles[t.type];
          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border bg-white p-3.5 shadow-xl shadow-ink-900/10",
                box,
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                {t.message && <p className="mt-0.5 text-sm text-ink-500">{t.message}</p>}
                {t.action && (
                  <Link
                    href={t.action.href}
                    onClick={() => dismiss(t.id)}
                    className="mt-1.5 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {t.action.label} →
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

