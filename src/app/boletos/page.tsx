"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  Bell,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { boletos } from "@/data/financeiro";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import type { Boleto } from "@/types";

const columns: Column<Boleto>[] = [
  {
    key: "cliente",
    header: "Cliente / Empresa",
    render: (b) => (
      <div>
        <p className="font-medium text-slate-900">{b.cliente}</p>
        <p className="text-xs text-slate-400">{b.empresaNome} · {b.processoNumero}</p>
      </div>
    ),
  },
  { key: "valor", header: "Valor", align: "right", render: (b) => <span className="font-medium text-slate-800">{formatCurrency(b.valor)}</span> },
  { key: "emissao", header: "Emissão", render: (b) => <span className="text-slate-600">{formatDate(b.emissao)}</span> },
  {
    key: "venc",
    header: "Vencimento",
    render: (b) => {
      const d = daysUntil(b.vencimento);
      return (
        <div>
          <p className="text-slate-600">{formatDate(b.vencimento)}</p>
          {b.status !== "pago" && b.status !== "cancelado" && (
            <p className="text-xs text-slate-400">
              {d < 0 ? `${Math.abs(d)}d em atraso` : d === 0 ? "vence hoje" : `em ${d}d`}
            </p>
          )}
        </div>
      );
    },
  },
  { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
  {
    key: "acoes",
    header: "Ações",
    align: "right",
    render: (b) => (
      <div className="flex justify-end gap-1">
        {b.status === "vencido" && (
          <button className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Enviar lembrete">
            <Bell className="h-4 w-4" />
          </button>
        )}
        <button className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Reenviar">
          <Send className="h-4 w-4" />
        </button>
        <button className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Segunda via">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

export default function BoletosPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    return boletos.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.cliente.toLowerCase().includes(q) ||
        b.empresaNome.toLowerCase().includes(q) ||
        (b.processoNumero ?? "").toLowerCase().includes(q);
      const matchStatus = !filters.status || b.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [search, filters]);

  const pagos = boletos.filter((b) => b.status === "pago");
  const vencidos = boletos.filter((b) => b.status === "vencido");
  const aVencer = boletos.filter((b) => b.status === "vencendo" || b.status === "aguardando_pagamento");
  const total = boletos.reduce((s, b) => s + b.valor, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boletos"
        description="Emissão, envio, monitoramento de pagamento e inadimplência"
        action={
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            Emitir boleto
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Valor total emitido" value={formatCurrency(total)} icon={Receipt} tone="brand" />
        <StatCard label="Pagos" value={pagos.length} icon={CheckCircle2} tone="emerald" hint={formatCurrency(pagos.reduce((s, b) => s + b.valor, 0))} />
        <StatCard label="A vencer / aguardando" value={aVencer.length} icon={Clock} tone="amber" />
        <StatCard label="Vencidos" value={vencidos.length} icon={AlertTriangle} tone="rose" hint={formatCurrency(vencidos.reduce((s, b) => s + b.valor, 0))} />
      </div>

      {/* Fluxo visual de boletos */}
      <Card>
        <CardHeader title="Ciclo do boleto" subtitle="Da cobrança ao pagamento" icon={Receipt} />
        <div className="flex flex-wrap gap-2 p-5">
          {["Criar cobrança", "Emitir boleto", "Enviar ao cliente", "Monitorar pagamento", "Marcar como pago", "Alerta se vencido"].map(
            (step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">{step}</span>
                {i < 5 && <span className="text-slate-300">→</span>}
              </div>
            )
          )}
        </div>
      </Card>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por cliente, empresa ou processo…"
        values={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Criado", value: "criado" },
              { label: "Enviado", value: "enviado" },
              { label: "Aguardando", value: "aguardando_pagamento" },
              { label: "Vencendo", value: "vencendo" },
              { label: "Vencido", value: "vencido" },
              { label: "Pago", value: "pago" },
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
