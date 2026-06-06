import Link from "next/link";
import { Ship, Container, MapPin, Calendar, AlertCircle } from "lucide-react";
import type { Processo } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";

export function ProcessCard({ processo }: { processo: Processo }) {
  return (
    <Link
      href={`/processos/${processo.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-200 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {processo.numeroInterno}
            </span>
            {processo.temPendencia && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-slate-400">
            {processo.empresaNome} · {processo.cliente}
          </p>
        </div>
        <StatusBadge status={processo.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Ship className="h-3.5 w-3.5 text-slate-400" />
          {processo.bl}
        </div>
        <div className="flex items-center gap-1.5">
          <Container className="h-3.5 w-3.5 text-slate-400" />
          {processo.container}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {processo.portoDestino}
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          ETA {formatDate(processo.dataChegada)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {processo.etapa}
        </span>
        <span className="text-[11px] text-slate-400">
          {processo.responsavelInterno}
        </span>
      </div>
    </Link>
  );
}
