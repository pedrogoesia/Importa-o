"use client";

import { useMemo, useState } from "react";
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
  Plus,
  CheckCircle2,
  CalendarClock,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Scale,
  Landmark,
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
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { EmpresaMultiSelect } from "@/components/ui/EmpresaMultiSelect";
import { useToast } from "@/components/ui/Toast";
import {
  transacoes as transacoesSeed,
  contasPagar as contasPagarSeed,
  boletos as boletosSeed,
  fechamentoMensal,
  margemPorProcesso,
} from "@/data/financeiro";
import { empresas } from "@/data/empresas";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import type { Transacao, ContaPagar, Boleto } from "@/types";

const empresaNomes = empresas.map((e) => e.nomeFantasia);
const empOptions = empresas.map((e) => ({ value: e.nomeFantasia, label: e.nomeFantasia }));

/** Visual urgency hint for an unpaid due date. */
function urgencia(vencimento: string) {
  const d = daysUntil(vencimento);
  if (d < 0) return { label: `${Math.abs(d)}d em atraso`, cls: "bg-rose-50 text-rose-600" };
  if (d === 0) return { label: "vence hoje", cls: "bg-amber-50 text-amber-700" };
  if (d <= 7) return { label: `em ${d}d`, cls: "bg-amber-50 text-amber-600" };
  return { label: `em ${d}d`, cls: "bg-slate-100 text-slate-500" };
}

export default function FinanceiroPage() {
  const toast = useToast();

  const [contas, setContas] = useState<ContaPagar[]>(contasPagarSeed);
  const [receber, setReceber] = useState<Boleto[]>(boletosSeed);
  const [txs, setTxs] = useState<Transacao[]>(transacoesSeed);

  // Seleção de empresas (vazio = todas) — aplica a toda a tela
  const [empSel, setEmpSel] = useState<string[]>([]);
  const inScope = (nome: string) => empSel.length === 0 || empSel.includes(nome);
  const empresasView = empresas.filter((e) => inScope(e.nomeFantasia));
  const ofConectadas = empresasView.filter(
    (e) => e.integracoes?.openFinance === "conectado"
  ).length;

  // Contas a pagar toolbar
  const [contaQuick, setContaQuick] = useState<"todas" | "atraso" | "hoje" | "semana">("todas");
  const [contaSearch, setContaSearch] = useState("");
  const [novaContaOpen, setNovaContaOpen] = useState(false);
  const [contaForm, setContaForm] = useState({
    descricao: "",
    fornecedor: "",
    empresaNome: empresaNomes[0] ?? "",
    valor: "",
    vencimento: "",
  });

  // Conciliação toolbar
  const [txFiltro, setTxFiltro] = useState<"todas" | "entrada" | "saida" | "pendente">("todas");
  const [novaTxOpen, setNovaTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    descricao: "",
    categoria: "",
    empresaNome: empresaNomes[0] ?? "",
    tipo: "saida" as Transacao["tipo"],
    valor: "",
  });

  const parseValor = (v: string) =>
    parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

  // ---- Arrays no escopo das empresas selecionadas ----
  const contasView = useMemo(() => contas.filter((c) => inScope(c.empresaNome)), [contas, empSel]); // eslint-disable-line react-hooks/exhaustive-deps
  const receberView = useMemo(() => receber.filter((b) => inScope(b.empresaNome)), [receber, empSel]); // eslint-disable-line react-hooks/exhaustive-deps
  const txsView = useMemo(() => txs.filter((t) => inScope(t.empresaNome)), [txs, empSel]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derived (live) figures ----
  const entradas = txsView.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const saidas = txsView.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);

  const contasAbertas = contasView.filter((c) => c.status !== "paga");
  const aPagarTotal = contasAbertas.reduce((s, c) => s + c.valor, 0);
  const aPagarAtraso = contasAbertas
    .filter((c) => daysUntil(c.vencimento) < 0)
    .reduce((s, c) => s + c.valor, 0);

  const receberAbertos = receberView.filter((b) => b.status !== "pago" && b.status !== "cancelado");
  const aReceberTotal = receberAbertos.reduce((s, b) => s + b.valor, 0);
  const aReceberAtraso = receberAbertos
    .filter((b) => daysUntil(b.vencimento) < 0)
    .reduce((s, b) => s + b.valor, 0);

  const despesasPorCategoria = useMemo(
    () =>
      Object.entries(
        txsView
          .filter((t) => t.tipo === "saida")
          .reduce<Record<string, number>>((acc, t) => {
            acc[t.categoria] = (acc[t.categoria] ?? 0) + t.valor;
            return acc;
          }, {})
      )
        .map(([label, value]) => ({ label, value, color: "#6366f1" }))
        .sort((a, b) => b.value - a.value),
    [txsView]
  );

  // Agenda: próximos 10 dias (a pagar + a receber)
  const agenda = useMemo(() => {
    const itens = [
      ...contasAbertas.map((c) => ({
        id: c.id,
        data: c.vencimento,
        titulo: c.descricao,
        sub: `${c.empresaNome}${c.processoNumero ? ` · ${c.processoNumero}` : ""}`,
        tipo: "pagar" as const,
        valor: c.valor,
      })),
      ...receberAbertos.map((b) => ({
        id: b.id,
        data: b.vencimento,
        titulo: `Boleto ${b.cliente}`,
        sub: `${b.empresaNome}${b.processoNumero ? ` · ${b.processoNumero}` : ""}`,
        tipo: "receber" as const,
        valor: b.valor,
      })),
    ];
    return itens
      .filter((i) => daysUntil(i.data) <= 12)
      .sort((a, b) => +new Date(a.data) - +new Date(b.data))
      .slice(0, 8);
  }, [contasAbertas, receberAbertos]);

  // ---- Actions ----
  const pagarConta = (c: ContaPagar) => {
    setContas((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "paga" } : x)));
    toast({
      title: "Baixa registrada",
      description: `${c.descricao} marcada como paga (${formatCurrency(c.valor)}).`,
    });
  };

  const receberBoleto = (b: Boleto) => {
    setReceber((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "pago" } : x)));
    toast({
      title: "Recebimento confirmado",
      description: `${formatCurrency(b.valor)} de ${b.cliente} baixado.`,
    });
  };

  const conciliarTx = (t: Transacao) => {
    setTxs((prev) => prev.map((x) => (x.id === t.id ? { ...x, conciliada: true } : x)));
    toast({ title: "Transação conciliada", description: t.descricao, tone: "info" });
  };

  const criarConta = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: ContaPagar = {
      id: `cp-${Date.now()}`,
      descricao: contaForm.descricao,
      fornecedor: contaForm.fornecedor || "—",
      empresaNome: contaForm.empresaNome,
      valor: parseValor(contaForm.valor),
      vencimento: contaForm.vencimento || new Date().toISOString().slice(0, 10),
      status: "em_aberto",
    };
    setContas((prev) => [nova, ...prev]);
    setNovaContaOpen(false);
    setContaForm({ descricao: "", fornecedor: "", empresaNome: empresaNomes[0] ?? "", valor: "", vencimento: "" });
    toast({ title: "Conta cadastrada", description: `${nova.descricao} · ${formatCurrency(nova.valor)}.` });
  };

  const criarTx = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Transacao = {
      id: `tx-${Date.now()}`,
      data: new Date().toISOString().slice(0, 10),
      descricao: txForm.descricao,
      categoria: txForm.categoria || (txForm.tipo === "entrada" ? "Recebimento de cliente" : "Despesa operacional"),
      empresaNome: txForm.empresaNome,
      tipo: txForm.tipo,
      valor: parseValor(txForm.valor),
      conciliada: false,
    };
    setTxs((prev) => [nova, ...prev]);
    setNovaTxOpen(false);
    setTxForm({ descricao: "", categoria: "", empresaNome: empresaNomes[0] ?? "", tipo: "saida", valor: "" });
    toast({ title: "Lançamento registrado", description: `${nova.descricao} · ${formatCurrency(nova.valor)}.` });
  };

  // ---- Filtered lists ----
  const contasFiltradas = useMemo(() => {
    const q = contaSearch.toLowerCase();
    return contasView
      .filter((c) => {
        const matchSearch =
          !q ||
          c.descricao.toLowerCase().includes(q) ||
          c.fornecedor.toLowerCase().includes(q) ||
          c.empresaNome.toLowerCase().includes(q);
        if (!matchSearch) return false;
        const d = daysUntil(c.vencimento);
        const aberta = c.status !== "paga";
        if (contaQuick === "atraso") return aberta && d < 0;
        if (contaQuick === "hoje") return aberta && d === 0;
        if (contaQuick === "semana") return aberta && d >= 0 && d <= 7;
        return true;
      })
      .sort((a, b) => +new Date(a.vencimento) - +new Date(b.vencimento));
  }, [contasView, contaSearch, contaQuick]);

  const contasTotalFiltrado = contasFiltradas
    .filter((c) => c.status !== "paga")
    .reduce((s, c) => s + c.valor, 0);

  const txFiltradas = useMemo(() => {
    return txsView.filter((t) => {
      if (txFiltro === "entrada") return t.tipo === "entrada";
      if (txFiltro === "saida") return t.tipo === "saida";
      if (txFiltro === "pendente") return !t.conciliada;
      return true;
    });
  }, [txsView, txFiltro]);

  // ---- Column defs ----
  const contaCols: Column<ContaPagar>[] = [
    {
      key: "desc",
      header: "Descrição",
      render: (c) => (
        <div>
          <p className="font-medium text-slate-800">{c.descricao}</p>
          <p className="text-xs text-slate-400">{c.fornecedor} · {c.empresaNome}</p>
        </div>
      ),
    },
    {
      key: "venc",
      header: "Vencimento",
      render: (c) => {
        const u = urgencia(c.vencimento);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-slate-600">{formatDate(c.vencimento)}</span>
            {c.status !== "paga" && (
              <span className={cn("w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium", u.cls)}>
                {u.label}
              </span>
            )}
          </div>
        );
      },
    },
    { key: "valor", header: "Valor", align: "right", render: (c) => <span className="font-medium text-slate-800">{formatCurrency(c.valor)}</span> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "acao",
      header: "",
      align: "right",
      render: (c) =>
        c.status === "paga" ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paga
          </span>
        ) : (
          <button
            onClick={() => pagarConta(c)}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Dar baixa
          </button>
        ),
    },
  ];

  const receberCols: Column<Boleto>[] = [
    {
      key: "cliente",
      header: "Cliente / Processo",
      render: (b) => (
        <div>
          <p className="font-medium text-slate-800">{b.cliente}</p>
          <p className="text-xs text-slate-400">{b.empresaNome} · {b.processoNumero}</p>
        </div>
      ),
    },
    {
      key: "venc",
      header: "Vencimento",
      render: (b) => {
        const u = urgencia(b.vencimento);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-slate-600">{formatDate(b.vencimento)}</span>
            {b.status !== "pago" && (
              <span className={cn("w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium", u.cls)}>
                {u.label}
              </span>
            )}
          </div>
        );
      },
    },
    { key: "valor", header: "Valor", align: "right", render: (b) => <span className="font-medium text-slate-800">{formatCurrency(b.valor)}</span> },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "acao",
      header: "",
      align: "right",
      render: (b) =>
        b.status === "pago" ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recebido
          </span>
        ) : (
          <button
            onClick={() => receberBoleto(b)}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Marcar recebido
          </button>
        ),
    },
  ];

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
      key: "valor",
      header: "Valor",
      align: "right",
      render: (t) => (
        <span className={cn("font-medium", t.tipo === "entrada" ? "text-emerald-600" : "text-rose-600")}>
          {t.tipo === "entrada" ? "+" : "−"} {formatCurrency(t.valor)}
        </span>
      ),
    },
    {
      key: "conc",
      header: "",
      align: "right",
      render: (t) =>
        t.conciliada ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <Link2 className="h-3 w-3" /> Conciliada
          </span>
        ) : (
          <button
            onClick={() => conciliarTx(t)}
            className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
          >
            Conciliar
          </button>
        ),
    },
  ];

  // ---- Quick-filter chip ----
  const QuickChip = ({
    id,
    label,
    count,
  }: {
    id: typeof contaQuick;
    label: string;
    count: number;
  }) => (
    <button
      onClick={() => setContaQuick(id)}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
        contaQuick === id
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px]",
          contaQuick === id ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );

  const quickCounts = {
    todas: contasView.length,
    atraso: contasAbertas.filter((c) => daysUntil(c.vencimento) < 0).length,
    hoje: contasAbertas.filter((c) => daysUntil(c.vencimento) === 0).length,
    semana: contasAbertas.filter((c) => {
      const d = daysUntil(c.vencimento);
      return d >= 0 && d <= 7;
    }).length,
  };

  // ============================ TAB CONTENT ============================

  const geral = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(entradas - saidas)}
          icon={Scale}
          tone={entradas - saidas >= 0 ? "emerald" : "rose"}
          hint={`${formatCurrency(entradas)} entradas`}
        />
        <StatCard
          label="A receber em aberto"
          value={formatCurrency(aReceberTotal)}
          icon={TrendingUp}
          tone="sky"
          hint={aReceberAtraso > 0 ? `${formatCurrency(aReceberAtraso)} atrasado` : "em dia"}
        />
        <StatCard
          label="A pagar em aberto"
          value={formatCurrency(aPagarTotal)}
          icon={Wallet}
          tone="amber"
          hint={`${contasAbertas.length} conta(s)`}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(aPagarAtraso + aReceberAtraso)}
          icon={AlertTriangle}
          tone="rose"
          hint="pagar + receber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agenda da semana */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Agenda financeira"
            subtitle="Próximos vencimentos e recebimentos"
            icon={CalendarClock}
          />
          {agenda.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              Nada a vencer nos próximos dias. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {agenda.map((i) => {
                const u = urgencia(i.data);
                const pagar = i.tipo === "pagar";
                return (
                  <li key={`${i.tipo}-${i.id}`} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        pagar ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                      )}
                    >
                      {pagar ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{i.titulo}</p>
                      <p className="truncate text-xs text-slate-400">{i.sub}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn("text-sm font-semibold", pagar ? "text-rose-600" : "text-emerald-600")}>
                        {pagar ? "−" : "+"} {formatCurrency(i.valor)}
                      </span>
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", u.cls)}>
                        {formatDate(i.data)} · {u.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

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
      </div>

      <Card>
        <CardHeader title="Despesas por categoria" icon={Wallet} />
        <div className="p-5">
          <BarChart data={despesasPorCategoria} formatValue={formatCurrency} />
        </div>
      </Card>
    </div>
  );

  const contasTab = (
    <Card>
      <CardHeader
        title="Contas a pagar"
        subtitle={`${contasFiltradas.filter((c) => c.status !== "paga").length} em aberto · ${formatCurrency(contasTotalFiltrado)}`}
        icon={Wallet}
        action={
          <button
            onClick={() => setNovaContaOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" /> Nova conta
          </button>
        }
      />
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <QuickChip id="todas" label="Todas" count={quickCounts.todas} />
          <QuickChip id="atraso" label="Vencidas" count={quickCounts.atraso} />
          <QuickChip id="hoje" label="Vence hoje" count={quickCounts.hoje} />
          <QuickChip id="semana" label="Próx. 7 dias" count={quickCounts.semana} />
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={contaSearch}
            onChange={(e) => setContaSearch(e.target.value)}
            placeholder="Buscar conta, fornecedor ou empresa…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="p-1.5">
        <DataTable columns={contaCols} rows={contasFiltradas} />
      </div>
    </Card>
  );

  const receberTab = (
    <Card>
      <CardHeader
        title="Contas a receber"
        subtitle={`${receberAbertos.length} boleto(s) em aberto · ${formatCurrency(aReceberTotal)}`}
        icon={Receipt}
      />
      <div className="p-1.5">
        <DataTable columns={receberCols} rows={receberView} />
      </div>
    </Card>
  );

  const conciliacaoTab = (
    <Card>
      <CardHeader
        title="Conciliação bancária"
        subtitle={`Open Finance · ${ofConectadas}/${empresasView.length} empresa(s) conectada(s) · concilie com o extrato`}
        icon={Banknote}
        action={
          <button
            onClick={() => setNovaTxOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" /> Lançamento
          </button>
        }
      />
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-4">
        {(
          [
            { id: "todas", label: "Todas" },
            { id: "entrada", label: "Entradas" },
            { id: "saida", label: "Saídas" },
            { id: "pendente", label: "Não conciliadas" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setTxFiltro(f.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              txFiltro === f.id
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="p-1.5">
        <DataTable columns={txCols} rows={txFiltradas} />
      </div>
    </Card>
  );

  const porEmpresa = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {empresasView.map((e) => {
        const txEmp = txs.filter((t) => t.empresaNome === e.nomeFantasia);
        const entrada = txEmp.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
        const saida = txEmp.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
        const abertoEmp = contas
          .filter((c) => c.empresaNome === e.nomeFantasia && c.status !== "paga")
          .reduce((s, c) => s + c.valor, 0);
        const of = e.integracoes?.openFinance;
        return (
          <Card key={e.id}>
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{e.nomeFantasia}</p>
                <p className="text-xs text-slate-400">{e.cnpj}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {of && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Landmark className="h-3 w-3" /> Open Finance
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        of === "conectado" ? "bg-emerald-500" : of === "pendente" ? "bg-amber-500" : "bg-slate-300"
                      )}
                    />
                  </span>
                )}
                {abertoEmp > 0 && (
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                    {formatCurrency(abertoEmp)} a pagar
                  </span>
                )}
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
        <StatCard label="Em aberto" value={formatCurrency(aPagarTotal)} icon={Wallet} tone="amber" />
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
        description="Operação financeira do dia a dia: contas a pagar e receber, conciliação e fechamento"
      />

      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium text-slate-600">Empresas:</span>
        <EmpresaMultiSelect
          options={empOptions}
          selected={empSel}
          onChange={setEmpSel}
          className="w-full sm:w-72"
        />
        <span className="text-xs text-slate-400 sm:ml-auto">
          {empSel.length === 0
            ? `Exibindo todas as ${empresas.length} empresas`
            : `Filtrando ${empSel.length} de ${empresas.length} empresas`}
        </span>
      </div>

      <Tabs
        tabs={[
          { key: "geral", label: "Visão geral", content: geral },
          { key: "pagar", label: "Contas a pagar", content: contasTab },
          { key: "receber", label: "Contas a receber", content: receberTab },
          { key: "conciliacao", label: "Conciliação", content: conciliacaoTab },
          { key: "empresa", label: "Por empresa", content: porEmpresa },
          { key: "processo", label: "Por processo", content: porProcesso },
          { key: "fechamento", label: "Fechamento", content: fechamento },
        ]}
      />

      {/* Modal: nova conta a pagar */}
      <Modal
        open={novaContaOpen}
        onClose={() => setNovaContaOpen(false)}
        title="Nova conta a pagar"
        description="Registre uma despesa ou obrigação"
        icon={Wallet}
        footer={
          <>
            <GhostButton type="button" onClick={() => setNovaContaOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-nova-conta">
              <Plus className="h-4 w-4" /> Cadastrar conta
            </PrimaryButton>
          </>
        }
      >
        <form id="form-nova-conta" onSubmit={criarConta} className="space-y-4">
          <Field label="Descrição">
            <Input
              required
              value={contaForm.descricao}
              onChange={(e) => setContaForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex.: DARF II/IPI processo IMP-007"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fornecedor">
              <Input
                value={contaForm.fornecedor}
                onChange={(e) => setContaForm((f) => ({ ...f, fornecedor: e.target.value }))}
                placeholder="Ex.: Receita Federal"
              />
            </Field>
            <Field label="Empresa">
              <Select
                value={contaForm.empresaNome}
                onChange={(e) => setContaForm((f) => ({ ...f, empresaNome: e.target.value }))}
              >
                {empresaNomes.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor (R$)">
              <Input
                required
                inputMode="decimal"
                value={contaForm.valor}
                onChange={(e) => setContaForm((f) => ({ ...f, valor: e.target.value }))}
                placeholder="12.500,00"
              />
            </Field>
            <Field label="Vencimento">
              <Input
                type="date"
                required
                value={contaForm.vencimento}
                onChange={(e) => setContaForm((f) => ({ ...f, vencimento: e.target.value }))}
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Modal: novo lançamento */}
      <Modal
        open={novaTxOpen}
        onClose={() => setNovaTxOpen(false)}
        title="Novo lançamento"
        description="Registre uma entrada ou saída manual"
        icon={Banknote}
        footer={
          <>
            <GhostButton type="button" onClick={() => setNovaTxOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-nova-tx">
              <Plus className="h-4 w-4" /> Registrar
            </PrimaryButton>
          </>
        }
      >
        <form id="form-nova-tx" onSubmit={criarTx} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Select
                value={txForm.tipo}
                onChange={(e) => setTxForm((f) => ({ ...f, tipo: e.target.value as Transacao["tipo"] }))}
              >
                <option value="saida">Saída</option>
                <option value="entrada">Entrada</option>
              </Select>
            </Field>
            <Field label="Empresa">
              <Select
                value={txForm.empresaNome}
                onChange={(e) => setTxForm((f) => ({ ...f, empresaNome: e.target.value }))}
              >
                {empresaNomes.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Descrição">
            <Input
              required
              value={txForm.descricao}
              onChange={(e) => setTxForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex.: Pagamento frete internacional"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria" hint="Opcional">
              <Input
                value={txForm.categoria}
                onChange={(e) => setTxForm((f) => ({ ...f, categoria: e.target.value }))}
                placeholder="Frete, Impostos…"
              />
            </Field>
            <Field label="Valor (R$)">
              <Input
                required
                inputMode="decimal"
                value={txForm.valor}
                onChange={(e) => setTxForm((f) => ({ ...f, valor: e.target.value }))}
                placeholder="42.500,00"
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
