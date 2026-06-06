"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Building2,
  Ship,
  Banknote,
  AlertTriangle,
  Link2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DonutChart } from "@/components/ui/DonutChart";
import { BarChart } from "@/components/ui/BarChart";
import {
  transacoes,
  contasPagar,
  fechamentoMensal,
  margemPorProcesso,
} from "@/data/financeiro";
import { empresas } from "@/data/empresas";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Transacao, ContaPagar } from "@/types";

const txCols: Column<Transacao>[] = [
  { key: "data", header: "Data", render: (t) => <span className="text-slate-600">{formatDate(t.data)}</span> },
  {
    key: "desc",
    header: "Descrição",
    render: (t) => (
      <div>
        <p className="text-slate-800">{t.descricao}</p>
        <p className="text-xs text-slate-400">{t.categoria} · {t.empresaNome}</p>
      </div>
    ),
  },
  {
    key: "conc",
    header: "Conciliação",
    render: (t) =>
      t.conciliada ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <Link2 className="h-3 w-3" /> Conciliada
        </span>
      ) : (
        <span className="text-xs text-amber-600">Pendente</span>
      ),
  },
  {
    key: "valor",
    header: "Valor",
    align: "right",
    render: (t) => (
      <span className={cn("font-medium", t.tipo === "entrada" ? "text-emerald-600" : "text-rose-600")}>
        {t.tipo === "entrada" ? "+" : "−"} {formatCurrency(t.valor)}
      </span>
    ),
  },
];

const contaCols: Column<ContaPagar>[] = [
  {
    key: "desc",
    header: "Descrição",
    render: (c) => (
      <div>
        <p className="text-slate-800">{c.descricao}</p>
        <p className="text-xs text-slate-400">{c.fornecedor} · {c.empresaNome}</p>
      </div>
    ),
  },
  { key: "venc", header: "Vencimento", render: (c) => <span className="text-slate-600">{formatDate(c.vencimento)}</span> },
  { key: "valor", header: "Valor", align: "right", render: (c) => <span className="font-medium text-slate-800">{formatCurrency(c.valor)}</span> },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
];

export default function FinanceiroPage() {
  const entradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((s, t) => s + t.valor, 0);
  const saidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((s, t) => s + t.valor, 0);

  // Despesas agrupadas por categoria (somente saídas)
  const despesasPorCategoria = Object.entries(
    transacoes
      .filter((t) => t.tipo === "saida")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] ?? 0) + t.valor;
        return acc;
      }, {})
  )
    .map(([label, value]) => ({ label, value, color: "#6366f1" }))
    .sort((a, b) => b.value - a.value);

  const geral = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Recebido no mês" value={formatCurrency(fechamentoMensal.totalRecebido)} icon={TrendingUp} tone="emerald" />
        <StatCard label="Pago no mês" value={formatCurrency(fechamentoMensal.totalPago)} icon={TrendingDown} tone="rose" />
        <StatCard label="Contas em aberto" value={formatCurrency(fechamentoMensal.contasEmAberto)} icon={Wallet} tone="amber" />
        <StatCard label="Boletos vencidos" value={formatCurrency(fechamentoMensal.boletosVencidos)} icon={Receipt} tone="rose" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Entradas × Saídas" subtitle="Movimentação do mês" icon={TrendingUp} />
          <div className="p-5">
            <DonutChart
              segments={[
                { label: "Entradas", value: entradas, color: "#10b981" },
                { label: "Saídas", value: saidas, color: "#f43f5e" },
              ]}
              centerValue={`${Math.round((entradas / (entradas + saidas || 1)) * 100)}%`}
              centerLabel="entradas"
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Despesas por categoria" icon={Wallet} />
          <div className="p-5">
            <BarChart data={despesasPorCategoria} formatValue={formatCurrency} />
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Transações recentes" subtitle="Preparado para Open Finance" icon={Banknote} />
        <div className="p-1.5">
          <DataTable columns={txCols} rows={transacoes} />
        </div>
      </Card>
    </div>
  );

  const porEmpresa = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {empresas.map((e) => {
        const txs = transacoes.filter((t) => t.empresaNome === e.nomeFantasia);
        const entrada = txs.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
        const saida = txs.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
        return (
          <Card key={e.id}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{e.nomeFantasia}</p>
                <p className="text-xs text-slate-400">{e.cnpj}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="p-4">
                <p className="text-xs text-slate-400">Entradas</p>
                <p className="mt-1 text-sm font-semibold text-emerald-600">{formatCurrency(entrada)}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400">Saídas</p>
                <p className="mt-1 text-sm font-semibold text-rose-600">{formatCurrency(saida)}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400">Saldo</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(entrada - saida)}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const porProcesso = (
    <Card>
      <CardHeader title="Margem por processo" icon={Ship} />
      <div className="divide-y divide-slate-50">
        {margemPorProcesso.map((m) => (
          <div key={m.processo} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{m.processo}</p>
              <p className="text-xs text-slate-400">
                Receita {formatCurrency(m.receita)} · Custo {formatCurrency(m.custo)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden w-32 sm:block">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${m.margem * 100}%` }} />
                </div>
              </div>
              <span className="w-12 text-right text-sm font-semibold text-slate-900">
                {Math.round(m.margem * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const contas = (
    <Card>
      <CardHeader title="Contas a pagar" icon={Wallet} />
      <div className="p-1.5">
        <DataTable columns={contaCols} rows={contasPagar} />
      </div>
    </Card>
  );

  const fechamento = (
    <div className="space-y-6">
      <AICard title={`Fechamento — ${fechamentoMensal.periodo}`}>
        O mês está positivo, com <strong>{formatCurrency(fechamentoMensal.totalRecebido)}</strong> recebidos contra{" "}
        <strong>{formatCurrency(fechamentoMensal.totalPago)}</strong> pagos e margem média de{" "}
        <strong>{Math.round(fechamentoMensal.margemMedia * 100)}%</strong> por processo. Atenção a{" "}
        {fechamentoMensal.inconsistencias.length} inconsistência(s) antes de fechar o período.
      </AICard>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total recebido" value={formatCurrency(fechamentoMensal.totalRecebido)} icon={TrendingUp} tone="emerald" />
        <StatCard label="Total pago" value={formatCurrency(fechamentoMensal.totalPago)} icon={TrendingDown} tone="rose" />
        <StatCard label="Boletos pagos" value={formatCurrency(fechamentoMensal.boletosPagos)} icon={Receipt} tone="sky" />
        <StatCard label="Em aberto" value={formatCurrency(fechamentoMensal.contasEmAberto)} icon={Wallet} tone="amber" />
      </div>
      <Card>
        <CardHeader title="Alertas de inconsistência" icon={AlertTriangle} />
        <ul className="space-y-2 p-5">
          {fechamentoMensal.inconsistencias.map((inc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {inc}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Visão geral, por empresa, por processo e fechamento mensal · pronto para Open Finance"
      />
      <Tabs
        tabs={[
          { key: "geral", label: "Visão geral", content: geral },
          { key: "empresa", label: "Por empresa", content: porEmpresa },
          { key: "processo", label: "Por processo", content: porProcesso },
          { key: "contas", label: "Contas a pagar", content: contas },
          { key: "fechamento", label: "Fechamento mensal", content: fechamento },
        ]}
      />
    </div>
  );
}
