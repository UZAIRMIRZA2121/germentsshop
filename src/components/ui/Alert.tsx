import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "border-sky-200 bg-sky-50 text-sky-900", icon: Info, color: "text-sky-600" },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: AlertTriangle, color: "text-amber-600" },
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: CheckCircle2, color: "text-emerald-600" },
  error: { box: "border-red-200 bg-red-50 text-red-900", icon: XCircle, color: "text-red-600" },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon, color } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className={cn("flex gap-3 rounded-xl border p-4 text-sm", box, className)}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", color)} aria-hidden />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

