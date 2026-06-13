import { AlertTriangle, Info, CheckCircle2, Sparkles } from "lucide-react";
import type { Alerta, Severity } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

const styles: Record<
  Severity,
  { border: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }
> = {
  critico: { border: "border-l-rose-500", icon: AlertTriangle, iconColor: "text-rose-500" },
  atencao: { border: "border-l-amber-500", icon: AlertTriangle, iconColor: "text-amber-500" },
  informativo: { border: "border-l-sky-500", icon: Info, iconColor: "text-sky-500" },
  resolvido: { border: "border-l-emerald-500", icon: CheckCircle2, iconColor: "text-emerald-500" },
};

export function AlertCard({ alerta }: { alerta: Alerta }) {
  const s = styles[alerta.prioridade];
  const Icon = s.icon;
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 border-l-4 bg-white p-4 shadow-card",
        s.border
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.iconColor)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {alerta.tipo}
            </span>
            <StatusBadge status={alerta.prioridade} />
            <span className="text-xs text-slate-400">
              {alerta.empresaNome}
              {alerta.processoNumero ? ` · ${alerta.processoNumero}` : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{alerta.descricao}</p>
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-brand-50/60 px-3 py-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
            <p className="text-xs text-brand-800">{alerta.recomendacaoIa}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
