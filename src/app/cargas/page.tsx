"use client";

import { useState } from "react";
import {
  RefreshCw,
  Send,
  Container,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { AICard } from "@/components/ui/AICard";
import { StatCard } from "@/components/ui/StatCard";
import { cargaSnapshots, relatorioCargaIa } from "@/data/cargas";
import { formatDate, cn } from "@/lib/utils";

export default function CargasPage() {
  const [sent, setSent] = useState(false);
  const mudancas = cargaSnapshots.filter((s) => s.mudou);
  const datas = Array.from(new Set(cargaSnapshots.map((s) => s.data)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atualizações de carga"
        description="Acompanhamento automático via Siscomex / Siscarga · snapshots diários"
        action={
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
            Consultar agora
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="CNPJs monitorados" value={4} icon={Container} tone="brand" />
        <StatCard label="Cargas acompanhadas" value={cargaSnapshots.length} icon={Container} tone="sky" />
        <StatCard label="Mudanças hoje" value={mudancas.length} icon={ArrowRight} tone="violet" />
        <StatCard label="Última consulta" value="06/06" icon={Calendar} tone="slate" hint="06:00" />
      </div>

      {/* Fluxo de funcionamento */}
      <Card>
        <CardHeader title="Como funciona o monitoramento" subtitle="Fluxo automatizado" icon={RefreshCw} />
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Coleta dos CNPJs cadastrados",
            "Consulta Siscomex / Siscarga",
            "Snapshot diário salvo",
            "Comparação ontem × hoje",
            "Mudanças detectadas",
            "Relatório gerado pela IA",
            "Envio ao grupo interno",
            "Alertas e próximos passos",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="text-xs text-slate-600">{step}</span>
            </div>
          ))}
        </div>
      </Card>

      <AICard
        title="Relatório automático de cargas"
        action={
          <button
            onClick={() => setSent(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
              sent
                ? "bg-emerald-50 text-emerald-700"
                : "bg-brand-600 text-white hover:bg-brand-700"
            )}
          >
            {sent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            {sent ? "Enviado ao grupo" : "Enviar para grupo interno"}
          </button>
        }
      >
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600">{relatorioCargaIa}</pre>
      </AICard>

      {/* Comparação ontem vs hoje */}
      <div className="space-y-5">
        {datas.map((data) => (
          <div key={data}>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Snapshot {formatDate(data)}
              </h2>
            </div>
            <div className="space-y-3">
              {cargaSnapshots
                .filter((s) => s.data === data)
                .map((s) => (
                  <Card key={s.id} className={cn(s.mudou && "border-brand-200")}>
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{s.processoNumero}</span>
                          <span className="text-xs text-slate-400">{s.empresaNome} · {s.bl}</span>
                          {s.mudou && (
                            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                              mudança detectada
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{s.detalhe}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-500">{s.statusAnterior}</span>
                        <ArrowRight className={cn("h-4 w-4", s.mudou ? "text-brand-500" : "text-slate-300")} />
                        <span className={cn("rounded-md px-2 py-1 font-medium", s.mudou ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500")}>
                          {s.statusAtual}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
