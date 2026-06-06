import Link from "next/link";
import {
  Building2,
  Ship,
  FileWarning,
  Container,
  Receipt,
  Clock,
  ShieldAlert,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  PieChart,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { AICard } from "@/components/ui/AICard";
import { AlertCard } from "@/components/ui/AlertCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Timeline } from "@/components/ui/Timeline";
import { DonutChart } from "@/components/ui/DonutChart";
import { BarChart } from "@/components/ui/BarChart";
import { dashboardStats, inteligenciaOperacional } from "@/data/dashboard";
import { alertas, ultimasAtualizacoes } from "@/data/alertas";
import { processos } from "@/data/processos";
import { formatCurrency } from "@/lib/utils";

// Labels + cores para a distribuição de processos por status
const statusChart: Record<string, { label: string; color: string }> = {
  em_transito: { label: "Em trânsito", color: "#0ea5e9" },
  atracado: { label: "Atracado", color: "#8b5cf6" },
  desembaracado: { label: "Desembaraçado", color: "#14b8a6" },
  aguardando_documento: { label: "Aguardando doc.", color: "#f59e0b" },
  atrasado: { label: "Atrasado", color: "#f43f5e" },
  concluido: { label: "Concluído", color: "#10b981" },
  em_andamento: { label: "Em andamento", color: "#6366f1" },
};

export default function DashboardPage() {
  const s = dashboardStats;
  const criticos = alertas.filter((a) => a.prioridade === "critico");

  const processosPorStatus = Object.entries(
    processos.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, value]) => ({
    label: statusChart[status]?.label ?? status,
    value,
    color: statusChart[status]?.color ?? "#94a3b8",
  }));

  const fluxoFinanceiro = [
    { label: "Recebido no mês", value: s.recebidoMes, color: "#10b981" },
    { label: "Pago no mês", value: s.pagoMes, color: "#f43f5e" },
    { label: "Contas a pagar", value: s.contasAPagarMes, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão executiva da operação · 06 de junho de 2026"
        action={
          <Link
            href="/relatorios"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Ver relatórios
          </Link>
        }
      />

      <AICard action={<span className="text-xs text-slate-400">atualizado há 5 min</span>}>
        {inteligenciaOperacional}
      </AICard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Empresas cadastradas" value={s.totalEmpresas} icon={Building2} tone="brand" />
        <StatCard label="Processos ativos" value={s.processosAtivos} icon={Ship} tone="sky" />
        <StatCard label="Aguardando documento" value={s.aguardandoDocumento} icon={FileWarning} tone="amber" />
        <StatCard label="Atualizações de carga" value={s.atualizacaoCarga} icon={Container} tone="violet" hint="desde ontem" />
        <StatCard label="Boletos vencidos" value={s.boletosVencidos} icon={Receipt} tone="rose" />
        <StatCard label="Boletos a vencer" value={s.boletosAVencer} icon={Clock} tone="amber" />
        <StatCard label="Certificados vencendo" value={s.certificadosVencendo} icon={ShieldAlert} tone="rose" hint="próximos 15 dias" />
        <StatCard label="Alertas críticos" value={s.alertasCriticos} icon={AlertTriangle} tone="rose" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Contas a pagar no mês" value={formatCurrency(s.contasAPagarMes)} icon={Wallet} tone="slate" />
        <StatCard label="Total recebido no mês" value={formatCurrency(s.recebidoMes)} icon={TrendingUp} tone="emerald" trend={{ value: "+18%", positive: true }} />
        <StatCard label="Total pago no mês" value={formatCurrency(s.pagoMes)} icon={TrendingDown} tone="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Processos por status" subtitle={`${processos.length} processos`} icon={PieChart} />
          <div className="p-5">
            <DonutChart
              segments={processosPorStatus}
              centerValue={processos.length}
              centerLabel="processos"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Fluxo financeiro do mês" subtitle="Junho/2026" icon={BarChart3} />
          <div className="p-5">
            <BarChart data={fluxoFinanceiro} formatValue={formatCurrency} />
            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-sm">
              <span className="text-slate-500">Saldo do mês</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(s.recebidoMes - s.pagoMes)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Alertas críticos</h2>
            <Link href="/relatorios" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {criticos.map((a) => (
            <AlertCard key={a.id} alerta={a} />
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader title="Últimas atualizações de carga" icon={Container} />
          <div className="p-5">
            <Timeline events={ultimasAtualizacoes} />
          </div>
        </Card>
      </div>
    </div>
  );
}
