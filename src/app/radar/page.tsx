"use client";

import { Radar as RadarIcon, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { radarRegistros, irpfRegistros } from "@/data/compliance";
import { formatDate, daysUntil } from "@/lib/utils";
import type { RadarRegistro, IrpfRegistro } from "@/types";

const radarCols: Column<RadarRegistro>[] = [
  { key: "empresa", header: "Empresa", render: (r) => <span className="font-medium text-slate-900">{r.empresaNome}</span> },
  { key: "adm", header: "ADM", render: (r) => <span className="text-slate-600">{r.adm}</span> },
  { key: "ultimo", header: "Último registro", render: (r) => <span className="text-slate-600">{formatDate(r.ultimoRegistro)}</span> },
  {
    key: "limite",
    header: "Data limite",
    render: (r) => {
      const d = daysUntil(r.dataLimite);
      return (
        <div>
          <p className="text-slate-700">{formatDate(r.dataLimite)}</p>
          <p className={`text-xs ${d <= 5 ? "text-rose-500" : "text-slate-400"}`}>
            {d < 0 ? "vencido" : `em ${d}d`}
          </p>
        </div>
      );
    },
  },
  { key: "obs", header: "Observações", render: (r) => <span className="text-slate-500">{r.observacoes}</span> },
];

const irpfCols: Column<IrpfRegistro>[] = [
  {
    key: "empresa",
    header: "Empresa",
    render: (r) => (
      <div>
        <p className="font-medium text-slate-900">{r.empresaNome}</p>
        <p className="text-xs text-slate-400">{r.cnpj} · {r.uf}</p>
      </div>
    ),
  },
  { key: "socios", header: "Sócios", render: (r) => <span className="text-slate-600">{r.socios}</span> },
  { key: "abertura", header: "Abertura", render: (r) => <span className="text-slate-600">{formatDate(r.dataAbertura)}</span> },
  { key: "contador", header: "Contador IRPF", render: (r) => <span className="text-slate-600">{r.contador}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

export default function RadarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Radar & Obrigações"
        description="Habilitação RADAR e obrigações fiscais (IRPF) por empresa"
      />

      <AICard title="Compliance — alerta da IA">
        A <strong>Nordix</strong> está com a data limite de registro do RADAR em 09/06/2026 (3 dias) e habilitação em revisão. Recomenda-se
        atualizar antes do fechamento mensal. No IRPF, <strong>M&S e Nordix</strong> seguem pendentes de entrega.
      </AICard>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <RadarIcon className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Habilitação RADAR</h2>
        </div>
        <DataTable columns={radarCols} rows={radarRegistros} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Obrigações IRPF</h2>
        </div>
        <DataTable columns={irpfCols} rows={irpfRegistros} />
      </div>
    </div>
  );
}
