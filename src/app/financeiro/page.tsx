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
  LineChart as LineChartIcon,
  ChevronDown,
  CalendarDays,
  List,
  Repeat,
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
import { LineChart } from "@/components/ui/LineChart";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { EmpresaMultiSelect } from "@/components/ui/EmpresaMultiSelect";
import { Calendar, type CalendarEvent } from "@/components/ui/Calendar";
import { useToast } from "@/components/ui/Toast";
import {
  transacoes as transacoesSeed,
  contasPagar as contasPagarSeed,
  boletos as boletosSeed,
  fechamentoMensal,
  rentabilidadeProcessos,
  custosProcesso,
} from "@/data/financeiro";
import { empresas } from "@/data/empresas";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import type { Transacao, ContaPagar, Boleto } from "@/types";

const TODAY = "2026-06-06";
function addDaysISO(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function addMonthsISO(iso: string, months: number) {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
/** Valor compacto para caber nas células do calendário (ex.: 12,5k). */
const kBRL = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1000) return `R$${(a / 1000).toFixed(a >= 10000 ? 0 : 1).replace(".", ",")}k`;
  return `R$${Math.round(a)}`;
};

function DetalheItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: "lista" | "calendario";
  onChange: (v: "lista" | "calendario") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
      {(
        [
          { id: "lista", label: "Lista", icon: List },
          { id: "calendario", label: "Calendário", icon: CalendarDays },
        ] as const
      ).map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
            value === v.id ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <v.icon className="h-3.5 w-3.5" /> {v.label}
        </button>
      ))}
    </div>
  );
}

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

  // Fluxo de caixa + Rentabilidade
  const [saldoInicial, setSaldoInicial] = useState("350.000,00");
  const [rentView, setRentView] = useState<"processo" | "cliente">("processo");
  const [custoOpen, setCustoOpen] = useState<string | null>(null);

  // Contas a pagar toolbar
  const [contaQuick, setContaQuick] = useState<"todas" | "atraso" | "hoje" | "semana">("todas");
  const [contaSearch, setContaSearch] = useState("");
  const [contaView, setContaView] = useState<"lista" | "calendario">("lista");
  const [receberTabView, setReceberTabView] = useState<"lista" | "calendario">("lista");
  const [detalheConta, setDetalheConta] = useState<ContaPagar | null>(null);
  const [detalheBoleto, setDetalheBoleto] = useState<Boleto | null>(null);
  const [novaContaOpen, setNovaContaOpen] = useState(false);
  const [contaForm, setContaForm] = useState({
    descricao: "",
    fornecedor: "",
    empresaNome: empresaNomes[0] ?? "",
    categoria: "",
    valor: "",
    vencimento: "",
    recorrente: false,
    meses: "12",
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

  const resetContaForm = () =>
    setContaForm({
      descricao: "",
      fornecedor: "",
      empresaNome: empresaNomes[0] ?? "",
      categoria: "",
      valor: "",
      vencimento: "",
      recorrente: false,
      meses: "12",
    });

  const criarConta = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseValor(contaForm.valor);
    const venc0 = contaForm.vencimento || TODAY;
    const grupo = `cpg-${Date.now()}`;
    const n = contaForm.recorrente ? Math.min(Math.max(parseInt(contaForm.meses) || 1, 1), 36) : 1;
    const novas: ContaPagar[] = Array.from({ length: n }).map((_, i) => ({
      id: `${grupo}-${i}`,
      descricao: contaForm.descricao,
      fornecedor: contaForm.fornecedor || "—",
      empresaNome: contaForm.empresaNome,
      categoria: contaForm.categoria || undefined,
      valor,
      vencimento: addMonthsISO(venc0, i),
      status: "em_aberto",
      recorrente: contaForm.recorrente || undefined,
    }));
    setContas((prev) => [...novas, ...prev]);
    setNovaContaOpen(false);
    resetContaForm();
    toast({
      title: contaForm.recorrente ? "Custo fixo cadastrado" : "Conta cadastrada",
      description: contaForm.recorrente
        ? `${contaForm.descricao} · ${formatCurrency(valor)}/mês por ${n} meses.`
        : `${contaForm.descricao} · ${formatCurrency(valor)}.`,
    });
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
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-slate-800">{c.descricao}</p>
            {c.recorrente && (
              <span className="inline-flex items-center gap-0.5 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                <Repeat className="h-2.5 w-2.5" /> Fixo
              </span>
            )}
          </div>
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
            onClick={(e) => {
              e.stopPropagation();
              pagarConta(c);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              receberBoleto(b);
            }}
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

  const contaEvents: CalendarEvent[] = contasView.map((c) => ({
    id: c.id,
    date: c.vencimento,
    label: c.descricao,
    value: kBRL(c.valor),
    tone: "pagar",
    done: c.status === "paga",
  }));

  const contasTab = (
    <Card>
      <CardHeader
        title="Contas a pagar"
        subtitle={`${contasFiltradas.filter((c) => c.status !== "paga").length} em aberto · ${formatCurrency(contasTotalFiltrado)}`}
        icon={Wallet}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle value={contaView} onChange={setContaView} />
            <button
              onClick={() => setNovaContaOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Nova conta
            </button>
          </div>
        }
      />
      {contaView === "lista" ? (
        <>
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
            <DataTable columns={contaCols} rows={contasFiltradas} onRowClick={(c) => setDetalheConta(c)} />
          </div>
        </>
      ) : (
        <div className="p-5">
          <Calendar
            events={contaEvents}
            today={TODAY}
            onEventClick={(id) => {
              const c = contasView.find((x) => x.id === id);
              if (c) setDetalheConta(c);
            }}
          />
        </div>
      )}
    </Card>
  );

  const receberEvents: CalendarEvent[] = receberView.map((b) => ({
    id: b.id,
    date: b.vencimento,
    label: b.cliente,
    value: kBRL(b.valor),
    tone: "receber",
    done: b.status === "pago",
  }));

  const receberTab = (
    <Card>
      <CardHeader
        title="Contas a receber"
        subtitle={`${receberAbertos.length} boleto(s) em aberto · ${formatCurrency(aReceberTotal)}`}
        icon={Receipt}
        action={<ViewToggle value={receberTabView} onChange={setReceberTabView} />}
      />
      {receberTabView === "lista" ? (
        <div className="p-1.5">
          <DataTable columns={receberCols} rows={receberView} onRowClick={(b) => setDetalheBoleto(b)} />
        </div>
      ) : (
        <div className="p-5">
          <Calendar
            events={receberEvents}
            today={TODAY}
            onEventClick={(id) => {
              const b = receberView.find((x) => x.id === id);
              if (b) setDetalheBoleto(b);
            }}
          />
        </div>
      )}
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

  // ====================== FLUXO DE CAIXA ======================
  const NUM_SEMANAS = 6;
  const saldoInicialNum = parseValor(saldoInicial);
  const fmtK = (v: number) => {
    const a = Math.abs(v);
    return a >= 1000 ? `${v < 0 ? "-" : ""}R$ ${Math.round(a / 1000)}k` : formatCurrency(v);
  };

  const fluxo = useMemo(() => {
    const pagar = contasView.filter((c) => c.status !== "paga");
    const receb = receberView.filter((b) => b.status !== "pago" && b.status !== "cancelado");
    const buckets = Array.from({ length: NUM_SEMANAS }).map((_, b) => ({
      idx: b,
      inicio: addDaysISO(TODAY, b * 7),
      fim: addDaysISO(TODAY, b * 7 + 6),
      entradas: 0,
      saidas: 0,
    }));
    const put = (venc: string, valor: number, tipo: "e" | "s") => {
      const d = daysUntil(venc);
      const idx = d < 0 ? 0 : Math.floor(d / 7);
      if (idx >= NUM_SEMANAS) return;
      if (tipo === "e") buckets[idx].entradas += valor;
      else buckets[idx].saidas += valor;
    };
    receb.forEach((b) => put(b.vencimento, b.valor, "e"));
    pagar.forEach((c) => put(c.vencimento, c.valor, "s"));
    let saldo = saldoInicialNum;
    return buckets.map((bk) => {
      const resultado = bk.entradas - bk.saidas;
      saldo += resultado;
      return { ...bk, resultado, saldo };
    });
  }, [contasView, receberView, saldoInicial]); // eslint-disable-line react-hooks/exhaustive-deps

  const cfEntradas = fluxo.reduce((s, w) => s + w.entradas, 0);
  const cfSaidas = fluxo.reduce((s, w) => s + w.saidas, 0);
  const cfSaldoFinal = fluxo.length ? fluxo[fluxo.length - 1].saldo : saldoInicialNum;
  const cfNegativo = fluxo.find((w) => w.saldo < 0);
  const cfMenorSaldo = fluxo.reduce((m, w) => Math.min(m, w.saldo), saldoInicialNum);

  const fluxoCaixaTab = (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Saldo em caixa hoje:</span>
        </div>
        <Input
          inputMode="decimal"
          value={saldoInicial}
          onChange={(e) => setSaldoInicial(e.target.value)}
          className="w-40"
        />
        <span className="text-xs text-slate-400 sm:ml-auto">
          Projeção das próximas {NUM_SEMANAS} semanas com base nos vencimentos a pagar e a receber
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Entradas previstas" value={formatCurrency(cfEntradas)} icon={ArrowDownLeft} tone="emerald" />
        <StatCard label="Saídas previstas" value={formatCurrency(cfSaidas)} icon={ArrowUpRight} tone="rose" />
        <StatCard
          label="Saldo projetado (fim)"
          value={formatCurrency(cfSaldoFinal)}
          icon={Scale}
          tone={cfSaldoFinal >= 0 ? "emerald" : "rose"}
        />
        <StatCard
          label="Menor saldo no período"
          value={formatCurrency(cfMenorSaldo)}
          icon={cfMenorSaldo < 0 ? AlertTriangle : CheckCircle2}
          tone={cfMenorSaldo < 0 ? "rose" : "sky"}
        />
      </div>

      {cfNegativo ? (
        <AICard title="Alerta de caixa">
          O caixa projetado fica <strong>negativo</strong> na semana de{" "}
          <strong>{formatDate(cfNegativo.inicio)}</strong> (saldo {formatCurrency(cfNegativo.saldo)}).
          Recomendação: antecipar recebimentos dos boletos a vencer, renegociar prazos de contas a pagar
          ou usar o limite de capital de giro antes dessa data.
        </AICard>
      ) : (
        <AICard title="Saúde do caixa">
          O caixa permanece <strong>positivo</strong> em todas as {NUM_SEMANAS} semanas projetadas, com saldo
          mínimo de <strong>{formatCurrency(cfMenorSaldo)}</strong>. Há folga para antecipar pagamentos com
          desconto ou aplicar o excedente.
        </AICard>
      )}

      <Card>
        <CardHeader title="Saldo projetado" subtitle="Evolução semana a semana" icon={LineChartIcon} />
        <div className="p-5">
          <LineChart
            points={[
              { label: "Hoje", value: saldoInicialNum },
              ...fluxo.map((w) => ({ label: formatDate(w.inicio).slice(0, 5), value: w.saldo })),
            ]}
            formatValue={fmtK}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Detalhamento semanal" icon={CalendarClock} />
        <div className="hidden grid-cols-5 gap-2 border-b border-slate-100 px-5 py-2.5 text-xs font-medium text-slate-400 sm:grid">
          <span>Semana</span>
          <span className="text-right">Entradas</span>
          <span className="text-right">Saídas</span>
          <span className="text-right">Resultado</span>
          <span className="text-right">Saldo projetado</span>
        </div>
        <div className="divide-y divide-slate-50">
          {fluxo.map((w) => (
            <div key={w.idx} className="grid grid-cols-2 gap-2 px-5 py-3 text-sm sm:grid-cols-5">
              <span className="text-slate-600">
                {formatDate(w.inicio).slice(0, 5)}–{formatDate(w.fim).slice(0, 5)}
              </span>
              <span className="text-right text-emerald-600">+ {formatCurrency(w.entradas)}</span>
              <span className="text-right text-rose-600">− {formatCurrency(w.saidas)}</span>
              <span className={cn("text-right font-medium", w.resultado >= 0 ? "text-slate-700" : "text-rose-600")}>
                {w.resultado >= 0 ? "+" : "−"} {formatCurrency(Math.abs(w.resultado))}
              </span>
              <span className={cn("text-right font-semibold", w.saldo >= 0 ? "text-slate-900" : "text-rose-600")}>
                {formatCurrency(w.saldo)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ====================== RENTABILIDADE (DRE) ======================
  const margemTone = (m: number) =>
    m >= 0.3 ? "text-emerald-600" : m >= 0.2 ? "text-amber-600" : "text-rose-600";
  const margemBar = (m: number) =>
    m >= 0.3 ? "bg-emerald-500" : m >= 0.2 ? "bg-amber-500" : "bg-rose-500";

  const rentabilidade = useMemo(() => {
    const custosView = custosProcesso.filter((c) => inScope(c.empresaNome));
    return rentabilidadeProcessos
      .filter((r) => inScope(r.empresaNome))
      .map((r) => {
        const custos = custosView.filter((c) => c.processoNumero === r.processo);
        const custoTotal = custos.reduce((s, c) => s + c.valor, 0);
        const repassavel = custos.filter((c) => c.repassavel).reduce((s, c) => s + c.valor, 0);
        const absorvido = custoTotal - repassavel;
        const resultado = r.receita - custoTotal;
        const margem = r.receita ? resultado / r.receita : 0;
        return { ...r, custos, custoTotal, repassavel, absorvido, resultado, margem };
      })
      .sort((a, b) => a.margem - b.margem);
  }, [empSel]); // eslint-disable-line react-hooks/exhaustive-deps

  const rentPorCliente = useMemo(() => {
    const map = new Map<string, { empresaNome: string; cliente: string; receita: number; custoTotal: number }>();
    for (const r of rentabilidade) {
      const cur = map.get(r.empresaNome) ?? {
        empresaNome: r.empresaNome,
        cliente: r.cliente,
        receita: 0,
        custoTotal: 0,
      };
      cur.receita += r.receita;
      cur.custoTotal += r.custoTotal;
      map.set(r.empresaNome, cur);
    }
    return Array.from(map.values())
      .map((c) => ({
        ...c,
        resultado: c.receita - c.custoTotal,
        margem: c.receita ? (c.receita - c.custoTotal) / c.receita : 0,
      }))
      .sort((a, b) => b.resultado - a.resultado);
  }, [rentabilidade]);

  const rentReceita = rentabilidade.reduce((s, r) => s + r.receita, 0);
  const rentCusto = rentabilidade.reduce((s, r) => s + r.custoTotal, 0);
  const rentResultado = rentReceita - rentCusto;
  const rentMargem = rentReceita ? rentResultado / rentReceita : 0;

  const rentabilidadeTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Receita (faturado)" value={formatCurrency(rentReceita)} icon={TrendingUp} tone="sky" />
        <StatCard label="Custo total" value={formatCurrency(rentCusto)} icon={TrendingDown} tone="rose" />
        <StatCard label="Resultado" value={formatCurrency(rentResultado)} icon={Scale} tone={rentResultado >= 0 ? "emerald" : "rose"} />
        <StatCard label="Margem média" value={`${Math.round(rentMargem * 100)}%`} icon={TrendingUp} tone="brand" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {rentView === "processo" ? "Resultado por processo de importação" : "Resultado consolidado por cliente"}
        </p>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {(
            [
              { id: "processo", label: "Por processo", icon: Ship },
              { id: "cliente", label: "Por cliente", icon: Building2 },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => setRentView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                rentView === v.id ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <v.icon className="h-3.5 w-3.5" /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {rentView === "processo" ? (
        <div className="space-y-3">
          {rentabilidade.map((r) => {
            const aberto = custoOpen === r.processo;
            return (
              <Card key={r.processo} className={cn(r.margem < 0.2 && "border-rose-200")}>
                <button
                  onClick={() => setCustoOpen(aberto ? null : r.processo)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.processo} <span className="font-normal text-slate-400">· {r.empresaNome} · {r.cliente}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Receita {formatCurrency(r.receita)} · Custo {formatCurrency(r.custoTotal)} ·{" "}
                      <span className={r.resultado >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        Resultado {formatCurrency(r.resultado)}
                      </span>
                      {r.absorvido > 0 && (
                        <span className="text-rose-500"> · {formatCurrency(r.absorvido)} absorvido</span>
                      )}
                    </p>
                  </div>
                  <div className="hidden w-28 sm:block">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", margemBar(r.margem))} style={{ width: `${Math.max(r.margem * 100, 3)}%` }} />
                    </div>
                  </div>
                  <span className={cn("w-12 text-right text-sm font-semibold", margemTone(r.margem))}>
                    {Math.round(r.margem * 100)}%
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", aberto && "rotate-180")} />
                </button>

                {aberto && (
                  <div className="border-t border-slate-100">
                    <div className="hidden grid-cols-12 gap-2 px-5 py-2 text-[11px] font-medium text-slate-400 sm:grid">
                      <span className="col-span-5">Categoria / descrição</span>
                      <span className="col-span-2">Repasse</span>
                      <span className="col-span-2">Situação</span>
                      <span className="col-span-3 text-right">Valor</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {r.custos.map((c) => (
                        <div key={c.id} className="grid grid-cols-2 gap-2 px-5 py-2.5 text-sm sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <p className="font-medium text-slate-700">{c.categoria}</p>
                            <p className="text-xs text-slate-400">{c.descricao}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                c.repassavel ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"
                              )}
                            >
                              {c.repassavel ? "Repassável" : "Absorvido"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                c.status === "realizado" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}
                            >
                              {c.status === "realizado" ? "Realizado" : "Previsto"}
                            </span>
                          </div>
                          <div className="text-right font-medium text-slate-700 sm:col-span-3">
                            {formatCurrency(c.valor)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs">
                      <span className="text-slate-500">Custo repassável: <strong className="text-slate-700">{formatCurrency(r.repassavel)}</strong></span>
                      <span className="text-slate-500">Absorvido: <strong className="text-rose-600">{formatCurrency(r.absorvido)}</strong></span>
                      <span className="text-slate-500">Resultado: <strong className={r.resultado >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatCurrency(r.resultado)}</strong></span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-slate-50">
            {rentPorCliente.map((c) => (
              <div key={c.empresaNome} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{c.empresaNome}</p>
                  <p className="text-xs text-slate-400">
                    {c.cliente} · Receita {formatCurrency(c.receita)} · Custo {formatCurrency(c.custoTotal)}
                  </p>
                </div>
                <div className="hidden w-32 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full", margemBar(c.margem))} style={{ width: `${Math.max(c.margem * 100, 3)}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", c.resultado >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {formatCurrency(c.resultado)}
                  </p>
                  <p className={cn("text-xs", margemTone(c.margem))}>{Math.round(c.margem * 100)}% margem</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
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
        description="Fluxo de caixa, contas a pagar e receber, rentabilidade por processo e conciliação — por empresa"
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
          { key: "geral", label: "Visão geral", icon: Scale, content: geral },
          { key: "fluxo", label: "Fluxo de caixa", icon: LineChartIcon, content: fluxoCaixaTab },
          { key: "pagar", label: "Contas a pagar", icon: Wallet, content: contasTab },
          { key: "receber", label: "Contas a receber", icon: Receipt, content: receberTab },
          { key: "rentabilidade", label: "Rentabilidade", icon: TrendingUp, content: rentabilidadeTab },
          { key: "empresa", label: "Por empresa", icon: Building2, content: porEmpresa },
          { key: "conciliacao", label: "Conciliação", icon: Banknote, content: conciliacaoTab },
          { key: "fechamento", label: "Fechamento", icon: CalendarClock, content: fechamento },
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
            <Field label={contaForm.recorrente ? "1º vencimento" : "Vencimento"}>
              <Input
                type="date"
                required
                value={contaForm.vencimento}
                onChange={(e) => setContaForm((f) => ({ ...f, vencimento: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Categoria" hint="Opcional">
            <Select
              value={contaForm.categoria}
              onChange={(e) => setContaForm((f) => ({ ...f, categoria: e.target.value }))}
            >
              <option value="">Sem categoria</option>
              {["Frete internacional", "II/IPI", "ICMS", "AFRMM", "Despachante", "Armazenagem", "Demurrage", "Seguro", "Taxas Siscomex", "Aluguel", "Folha / salários", "Software / sistemas", "Contabilidade", "Outras"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          {/* Custo fixo mensal (recorrente) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={contaForm.recorrente}
                onChange={(e) => setContaForm((f) => ({ ...f, recorrente: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Repeat className="h-3.5 w-3.5 text-violet-500" /> Repetir todo mês (custo fixo)
                </span>
                <span className="text-xs text-slate-400">
                  Gera um lançamento por mês com o mesmo valor (ex.: aluguel, salários, software).
                </span>
              </span>
            </label>
            {contaForm.recorrente && (
              <div className="mt-3 flex items-center gap-2 pl-7">
                <span className="text-xs text-slate-500">Repetir por</span>
                <Input
                  type="number"
                  min={1}
                  max={36}
                  value={contaForm.meses}
                  onChange={(e) => setContaForm((f) => ({ ...f, meses: e.target.value }))}
                  className="w-20"
                />
                <span className="text-xs text-slate-500">meses</span>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal: detalhe da conta a pagar */}
      <Modal
        open={!!detalheConta}
        onClose={() => setDetalheConta(null)}
        title="Detalhe da conta"
        description={detalheConta?.descricao}
        icon={Wallet}
        footer={
          detalheConta && detalheConta.status !== "paga" ? (
            <>
              <GhostButton type="button" onClick={() => setDetalheConta(null)}>
                Fechar
              </GhostButton>
              <PrimaryButton
                type="button"
                onClick={() => {
                  pagarConta(detalheConta);
                  setDetalheConta(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Dar baixa
              </PrimaryButton>
            </>
          ) : (
            <GhostButton type="button" onClick={() => setDetalheConta(null)}>
              Fechar
            </GhostButton>
          )
        }
      >
        {detalheConta && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Valor</span>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(detalheConta.valor)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetalheItem label="Status" value={<StatusBadge status={detalheConta.status} />} />
              <DetalheItem label="Vencimento" value={formatDate(detalheConta.vencimento)} />
              <DetalheItem label="Fornecedor" value={detalheConta.fornecedor} />
              <DetalheItem label="Empresa" value={detalheConta.empresaNome} />
              <DetalheItem label="Categoria" value={detalheConta.categoria ?? "—"} />
              <DetalheItem label="Processo" value={detalheConta.processoNumero ?? "—"} />
              <DetalheItem
                label="Recorrência"
                value={detalheConta.recorrente ? "Custo fixo mensal" : "Lançamento único"}
              />
              <DetalheItem
                label="Situação do prazo"
                value={
                  detalheConta.status === "paga"
                    ? "Quitada"
                    : (() => {
                        const d = daysUntil(detalheConta.vencimento);
                        return d < 0 ? `${Math.abs(d)} dias em atraso` : d === 0 ? "Vence hoje" : `Vence em ${d} dias`;
                      })()
                }
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: detalhe do boleto a receber */}
      <Modal
        open={!!detalheBoleto}
        onClose={() => setDetalheBoleto(null)}
        title="Detalhe do recebimento"
        description={detalheBoleto ? `Boleto ${detalheBoleto.cliente}` : undefined}
        icon={Receipt}
        footer={
          detalheBoleto && detalheBoleto.status !== "pago" && detalheBoleto.status !== "cancelado" ? (
            <>
              <GhostButton type="button" onClick={() => setDetalheBoleto(null)}>
                Fechar
              </GhostButton>
              <PrimaryButton
                type="button"
                onClick={() => {
                  receberBoleto(detalheBoleto);
                  setDetalheBoleto(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Marcar recebido
              </PrimaryButton>
            </>
          ) : (
            <GhostButton type="button" onClick={() => setDetalheBoleto(null)}>
              Fechar
            </GhostButton>
          )
        }
      >
        {detalheBoleto && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Valor</span>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(detalheBoleto.valor)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetalheItem label="Status" value={<StatusBadge status={detalheBoleto.status} />} />
              <DetalheItem label="Cliente" value={detalheBoleto.cliente} />
              <DetalheItem label="Empresa" value={detalheBoleto.empresaNome} />
              <DetalheItem label="Processo" value={detalheBoleto.processoNumero ?? "—"} />
              <DetalheItem label="Emissão" value={formatDate(detalheBoleto.emissao)} />
              <DetalheItem label="Vencimento" value={formatDate(detalheBoleto.vencimento)} />
              <DetalheItem
                label="Parcela"
                value={detalheBoleto.totalParcelas ? `${detalheBoleto.parcela}/${detalheBoleto.totalParcelas}` : "Única"}
              />
              <DetalheItem
                label={detalheBoleto.status === "pago" ? "Pago em" : "Situação do prazo"}
                value={
                  detalheBoleto.status === "pago"
                    ? detalheBoleto.pagoEm
                      ? formatDate(detalheBoleto.pagoEm)
                      : "—"
                    : (() => {
                        const d = daysUntil(detalheBoleto.vencimento);
                        return d < 0 ? `${Math.abs(d)} dias em atraso` : d === 0 ? "Vence hoje" : `Vence em ${d} dias`;
                      })()
                }
              />
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Linha digitável: <span className="font-mono text-slate-600">{detalheBoleto.numero}</span>
            </div>
          </div>
        )}
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
