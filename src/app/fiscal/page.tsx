"use client";

import { useMemo, useState } from "react";
import { Landmark, FileCheck2, Clock, XCircle, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatCard } from "@/components/ui/StatCard";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { notasFiscais } from "@/data/fiscal";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { NotaFiscal } from "@/types";

const columns: Column<NotaFiscal>[] = [
  {
    key: "num",
    header: "Nota fiscal",
    render: (n) => (
      <div>
        <p className="font-medium text-slate-900">{n.numero}</p>
        <p className="text-xs text-slate-400">{n.tipo} · {n.empresaNome}</p>
      </div>
    ),
  },
  {
    key: "proc",
    header: "Processo",
    render: (n) =>
      n.processoNumero ? (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Link2 className="h-3 w-3" /> {n.processoNumero}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  { key: "valor", header: "Valor", align: "right", render: (n) => <span className="font-medium text-slate-800">{formatCurrency(n.valor)}</span> },
  { key: "emissao", header: "Emissão", render: (n) => <span className="text-slate-600">{formatDate(n.emissao)}</span> },
  { key: "status", header: "Status", render: (n) => <StatusBadge status={n.status} /> },
];

export default function FiscalPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    return notasFiscais.filter((n) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        n.numero.toLowerCase().includes(q) ||
        n.empresaNome.toLowerCase().includes(q) ||
        (n.processoNumero ?? "").toLowerCase().includes(q);
      const matchStatus = !filters.status || n.status === filters.status;
      const matchTipo = !filters.tipo || n.tipo === filters.tipo;
      return matchSearch && matchStatus && matchTipo;
    });
  }, [search, filters]);

  const aguardando = notasFiscais.filter((n) => n.status === "aguardando_emissao").length;
  const emitidas = notasFiscais.filter((n) => n.status === "emitida").length;
  const comErro = notasFiscais.filter((n) => n.status === "com_erro").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal"
        description="Notas fiscais por processo, status e pendências · pronto para emissão via API"
      />

      <AICard title="Análise fiscal da IA">
        Há <strong>{aguardando} nota(s)</strong> aguardando emissão e <strong>{comErro} com erro</strong>. A IA identificou que a
        NF-e 001.241 (Nordix) foi rejeitada pela SEFAZ por <strong>NCM divergente da DI</strong> — recomenda-se corrigir a classificação
        antes de reenviar.
      </AICard>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Aguardando emissão" value={aguardando} icon={Clock} tone="amber" />
        <StatCard label="Emitidas" value={emitidas} icon={FileCheck2} tone="emerald" />
        <StatCard label="Com erro" value={comErro} icon={XCircle} tone="rose" />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por nota, empresa ou processo…"
        values={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        filters={[
          {
            key: "tipo",
            label: "Tipo",
            options: [
              { label: "Entrada", value: "Entrada" },
              { label: "Saída", value: "Saída" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Aguardando emissão", value: "aguardando_emissao" },
              { label: "Emitida", value: "emitida" },
              { label: "Com erro", value: "com_erro" },
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
