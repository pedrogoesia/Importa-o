"use client";

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { certificados } from "@/data/compliance";
import { formatDate, daysUntil } from "@/lib/utils";
import type { Certificado } from "@/types";

const columns: Column<Certificado>[] = [
  {
    key: "empresa",
    header: "Empresa",
    render: (c) => (
      <div>
        <p className="font-medium text-slate-900">{c.empresaNome}</p>
        <p className="text-xs text-slate-400">{c.tipo}</p>
      </div>
    ),
  },
  { key: "resp", header: "Responsável", render: (c) => <span className="text-slate-600">{c.responsavel}</span> },
  { key: "socio", header: "Sócio / Despachante", render: (c) => <span className="text-slate-600">{c.socioDespachante}</span> },
  { key: "validade", header: "Validade", render: (c) => <span className="text-slate-600">{formatDate(c.validade)}</span> },
  {
    key: "dias",
    header: "Dias até vencer",
    align: "center",
    render: (c) => {
      const d = daysUntil(c.validade);
      return (
        <span className={`text-sm font-medium ${d < 0 ? "text-rose-600" : d <= 15 ? "text-amber-600" : "text-slate-600"}`}>
          {d < 0 ? `${Math.abs(d)}d vencido` : `${d}d`}
        </span>
      );
    },
  },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
];

export default function CertificadosPage() {
  const validos = certificados.filter((c) => c.status === "valido").length;
  const vencendo = certificados.filter((c) => c.status === "vencendo").length;
  const vencidos = certificados.filter((c) => c.status === "vencido").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificados digitais"
        description="Validade dos certificados e-CNPJ / e-CPF por empresa e despachante"
      />

      <AICard title="Alerta de certificados">
        <strong>{vencendo} certificado(s)</strong> vencem nos próximos 15 dias e <strong>{vencidos} já estão vencidos</strong>. Prioridade:
        renovar o e-CNPJ da <strong>Nordix</strong> (vence em 3 dias) antes da próxima operação de desembaraço e regularizar o e-CPF da sócia
        Sandra Lima (M&amp;S).
      </AICard>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Válidos" value={validos} icon={ShieldCheck} tone="emerald" />
        <StatCard label="Vencendo" value={vencendo} icon={ShieldAlert} tone="amber" />
        <StatCard label="Vencidos" value={vencidos} icon={ShieldX} tone="rose" />
      </div>

      <DataTable columns={columns} rows={certificados} />
    </div>
  );
}
