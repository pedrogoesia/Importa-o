"use client";

import { useState } from "react";
import { BarChart3, Download, FileText, Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { AlertCard } from "@/components/ui/AlertCard";
import { Tabs } from "@/components/ui/Tabs";
import { relatorios, alertas } from "@/data/alertas";
import { formatDate, cn } from "@/lib/utils";
import type { Severity } from "@/types";

const categoriaTone: Record<string, string> = {
  Cargas: "bg-violet-50 text-violet-600",
  Financeiro: "bg-emerald-50 text-emerald-600",
  Operação: "bg-sky-50 text-sky-600",
  Fiscal: "bg-amber-50 text-amber-600",
  Empresa: "bg-brand-50 text-brand-600",
};

const severityTabs: { key: Severity; label: string }[] = [
  { key: "critico", label: "Críticos" },
  { key: "atencao", label: "Atenção" },
  { key: "informativo", label: "Informativos" },
  { key: "resolvido", label: "Resolvidos" },
];

function AlertList({ severity }: { severity: Severity }) {
  const list = alertas.filter((a) => a.prioridade === severity);
  if (list.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum alerta nesta categoria.</p>;
  }
  return (
    <div className="space-y-3">
      {list.map((a) => (
        <AlertCard key={a.id} alerta={a} />
      ))}
    </div>
  );
}

export default function RelatoriosPage() {
  const [tab, setTab] = useState<"relatorios" | "alertas">("relatorios");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios & Alertas"
        description="Relatórios operacionais, financeiros e fiscais + central de alertas"
      />

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
        {[
          { key: "relatorios", label: "Relatórios" },
          { key: "alertas", label: "Alertas" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition",
              tab === t.key ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "relatorios" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatorios.map((r) => (
            <Card key={r.id} className="flex flex-col p-5 transition hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", categoriaTone[r.categoria] ?? "bg-slate-100 text-slate-500")}>
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  {r.categoria}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{r.titulo}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{r.descricao}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-xs text-slate-400">
                  {r.periodo} · {formatDate(r.geradoEm)}
                </span>
                <button className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <Download className="h-3.5 w-3.5" /> Gerar
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs
          tabs={severityTabs.map((s) => ({
            key: s.key,
            label: `${s.label} (${alertas.filter((a) => a.prioridade === s.key).length})`,
            content: <AlertList severity={s.key} />,
          }))}
        />
      )}
    </div>
  );
}
