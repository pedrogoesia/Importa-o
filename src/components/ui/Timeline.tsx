import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import { Info, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

const tipoStyle = {
  info: { icon: Info, color: "text-sky-500", ring: "ring-sky-100 bg-sky-50" },
  sucesso: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    ring: "ring-emerald-100 bg-emerald-50",
  },
  alerta: {
    icon: AlertTriangle,
    color: "text-amber-500",
    ring: "ring-amber-100 bg-amber-50",
  },
  ia: { icon: Sparkles, color: "text-brand-500", ring: "ring-brand-100 bg-brand-50" },
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-5">
      {events.map((event, i) => {
        const style = tipoStyle[event.tipo];
        const Icon = style.icon;
        return (
          <li key={event.id} className="relative flex gap-4">
            {i < events.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%+4px)] w-px bg-slate-100" />
            )}
            <div
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                style.ring
              )}
            >
              <Icon className={cn("h-4 w-4", style.color)} />
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-sm font-medium text-slate-900">
                {event.titulo}
              </p>
              <p className="text-sm text-slate-500">{event.descricao}</p>
              <p className="mt-0.5 text-xs text-slate-400">{event.data}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
