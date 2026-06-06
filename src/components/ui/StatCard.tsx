import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "brand" | "emerald" | "amber" | "rose" | "sky" | "slate" | "violet";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-500",
  violet: "bg-violet-50 text-violet-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
