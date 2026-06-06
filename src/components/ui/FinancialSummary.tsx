import { cn, formatCurrency } from "@/lib/utils";

interface SummaryItem {
  label: string;
  value: number;
  tone?: "positive" | "negative" | "neutral";
}

const toneText = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-slate-900",
};

export function FinancialSummary({
  items,
  className,
}: {
  items: SummaryItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card sm:grid-cols-4 sm:divide-y-0",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="p-5">
          <p className="text-xs text-slate-400">{item.label}</p>
          <p
            className={cn(
              "mt-1 text-lg font-semibold tracking-tight",
              toneText[item.tone ?? "neutral"]
            )}
          >
            {formatCurrency(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
