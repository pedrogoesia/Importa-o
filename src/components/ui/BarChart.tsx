// Lightweight horizontal bar chart (pure CSS, no dependencies).
export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  hint?: string;
}

export function BarChart({
  data,
  formatValue,
}: {
  data: BarDatum[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-600">{d.label}</span>
            <span className="font-medium text-slate-800">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? "#6366f1",
              }}
            />
          </div>
          {d.hint && <p className="mt-0.5 text-[11px] text-slate-400">{d.hint}</p>}
        </div>
      ))}
    </div>
  );
}
