import { cn } from "@/lib/utils";

const canalConfig: Record<string, { label: string; cls: string }> = {
  verde: { label: "Verde", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  amarelo: { label: "Amarelo", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  vermelho: { label: "Vermelho", cls: "bg-rose-50 text-rose-700 ring-rose-600/20" },
  cinza: { label: "Cinza", cls: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

export function CanalBadge({
  canal,
  size = "md",
  showPrefix = true,
}: {
  canal?: string;
  size?: "sm" | "md";
  showPrefix?: boolean;
}) {
  if (!canal) return <span className="text-xs text-slate-300">—</span>;
  const c = canalConfig[canal] ?? canalConfig.cinza;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
        c.cls,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {showPrefix ? "Canal " : ""}
      {c.label}
    </span>
  );
}
