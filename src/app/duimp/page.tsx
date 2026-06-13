"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileCheck2, AlertTriangle, Lock, ArrowRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { AICard } from "@/components/ui/AICard";
import { useDuimp } from "@/lib/duimp-store";
import { useProcessos } from "@/lib/processos-store";
import { cn } from "@/lib/utils";
import type { Gravidade } from "@/data/duimp";

const gravidadeMap: Record<Gravidade, { label: string; cls: string; ordem: number }> = {
  bloqueia: { label: "Bloqueia registro", cls: "bg-rose-50 text-rose-700 ring-rose-600/20", ordem: 0 },
  alta: { label: "Alta", cls: "bg-amber-50 text-amber-700 ring-amber-600/20", ordem: 1 },
  media: { label: "Média", cls: "bg-sky-50 text-sky-700 ring-sky-600/20", ordem: 2 },
  baixa: { label: "Baixa", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", ordem: 3 },
};

export default function DuimpPainelPage() {
  const { processos } = useProcessos();
  const { getDuimp, todasPendencias } = useDuimp();
  const [filtro, setFiltro] = useState<"todas" | Gravidade>("todas");

  const pendencias = useMemo(
    () => todasPendencias().sort((a, b) => gravidadeMap[a.gravidade].ordem - gravidadeMap[b.gravidade].ordem),
    [todasPendencias]
  );

  const visiveis = filtro === "todas" ? pendencias : pendencias.filter((p) => p.gravidade === filtro);

  const totalProcessos = processos.length;
  const prontas = processos.filter((p) => {
    const d = getDuimp(p.id);
    return d && (d.status === "pronta_para_registro" || d.status === "registrada");
  }).length;
  const bloqueadas = new Set(pendencias.filter((p) => p.gravidade === "bloqueia").map((p) => p.processoId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="DUIMP — Painel de pendências"
        description="Tudo que falta resolver antes de registrar as DUIMPs, por processo"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Processos" value={totalProcessos} icon={FileCheck2} tone="brand" />
        <StatCard label="Prontas / registradas" value={prontas} icon={FileCheck2} tone="emerald" />
        <StatCard label="Processos bloqueados" value={bloqueadas} icon={Lock} tone="rose" />
        <StatCard label="Pendências totais" value={pendencias.length} icon={AlertTriangle} tone="amber" />
      </div>

      <AICard title="Resumo da operação DUIMP">
        Há <strong>{pendencias.length} pendência(s)</strong> distribuídas em {totalProcessos} processo(s), sendo{" "}
        <strong>{pendencias.filter((p) => p.gravidade === "bloqueia").length}</strong> que bloqueiam o registro.
        Prioridade: resolver os itens marcados como “Bloqueia registro”.
      </AICard>

      {/* Filtros por gravidade */}
      <div className="flex flex-wrap gap-2">
        {(["todas", "bloqueia", "alta", "media", "baixa"] as const).map((g) => {
          const count = g === "todas" ? pendencias.length : pendencias.filter((p) => p.gravidade === g).length;
          return (
            <button
              key={g}
              onClick={() => setFiltro(g)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                filtro === g ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {g === "todas" ? "Todas" : gravidadeMap[g].label}
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{count}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Pendências críticas" icon={AlertTriangle} />
        {visiveis.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Nenhuma pendência nesta categoria. 🎉</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {visiveis.map((p, i) => {
              const g = gravidadeMap[p.gravidade];
              return (
                <div key={i} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  {p.gravidade === "bloqueia" ? <Lock className="h-4 w-4 shrink-0 text-rose-500" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{p.processoNumero}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Building2 className="h-3 w-3" /> {p.empresaNome}</span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{p.bloco}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset", g.cls)}>{g.label}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{p.descricao}</p>
                  </div>
                  <Link
                    href={`/processos/${p.processoId}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-slate-50"
                  >
                    Abrir DUIMP <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
