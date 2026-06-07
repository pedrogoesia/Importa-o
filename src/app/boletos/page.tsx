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
  FileBarChart,
  List,
  LayoutGrid,
  TrendingUp,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { EmpresaMultiSelect } from "@/components/ui/EmpresaMultiSelect";
import { useToast } from "@/components/ui/Toast";
import { boletos as boletosSeed } from "@/data/financeiro";
import { empresas } from "@/data/empresas";
import { processos } from "@/data/processos";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import type { Boleto } from "@/types";

const TODAY = new Date().toISOString().slice(0, 10);

const parseValor = (v: string) =>
  parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

function addDaysISO(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const isAberto = (b: Boleto) => b.status !== "pago" && b.status !== "cancelado";

const empOptions = empresas.map((e) => ({ value: e.nomeFantasia, label: e.nomeFantasia }));

const emptyForm = {
  empresaId: "",
  processoId: "",
  valorTotal: "",
  parcelas: "1",
  primeiroVenc: "",
  intervalo: "30",
};

export default function BoletosPage() {
  const toast = useToast();
  const [boletos, setBoletos] = useState<Boleto[]>(boletosSeed);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [empSel, setEmpSel] = useState<string[]>([]);
  const [view, setView] = useState<"lista" | "cobrancas">("cobrancas");
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ---- Live preview of the installments ----
  const preview = useMemo(() => {
    const n = Math.min(Math.max(parseInt(form.parcelas) || 1, 1), 36);
    const total = parseValor(form.valorTotal);
    const step = parseInt(form.intervalo) || 30;
    const base = Math.floor((total / n) * 100) / 100;
    const resto = Math.round((total - base * n) * 100) / 100;
    const inicio = form.primeiroVenc || TODAY;
    return {
      n,
      total,
      itens: Array.from({ length: n }).map((_, i) => ({
        parcela: i + 1,
        valor: i === n - 1 ? Math.round((base + resto) * 100) / 100 : base,
        vencimento: addDaysISO(inicio, i * step),
      })),
    };
  }, [form.parcelas, form.valorTotal, form.intervalo, form.primeiroVenc]);

  // ---- Actions ----
  const marcarPago = (b: Boleto) => {
    setBoletos((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, status: "pago", pagoEm: TODAY } : x))
    );
    toast({
      title: "Pagamento confirmado",
      description: `${formatCurrency(b.valor)} de ${b.cliente}${
        b.totalParcelas ? ` (parcela ${b.parcela}/${b.totalParcelas})` : ""
      } baixado.`,
    });
  };

  const handleAction = (label: string, b: Boleto) => {
    const messages: Record<string, { title: string; description: string }> = {
      lembrete: {
        title: "Lembrete enviado",
        description: `Cobrança reenviada para ${b.cliente} por e-mail e WhatsApp.`,
      },
      reenviar: {
        title: "Boleto reenviado",
        description: `Boleto de ${formatCurrency(b.valor)} reenviado para ${b.cliente}.`,
      },
      "segunda-via": {
        title: "Segunda via gerada",
        description: `Nova via disponível para download.`,
      },
    };
    const msg = messages[label];
    if (msg) toast({ ...msg, tone: label === "lembrete" ? "warning" : "info" });
  };

  // Seleções do formulário (empresa → cliente automático → processos da empresa)
  const empresaSel = empresas.find((e) => e.id === form.empresaId);
  const processosDaEmpresa = useMemo(
    () => (form.empresaId ? processos.filter((p) => p.empresaId === form.empresaId) : []),
    [form.empresaId]
  );
  const processoSel = processos.find((p) => p.id === form.processoId);
  const clienteAtual = processoSel?.cliente || empresaSel?.clienteVinculado || "";

  const handleEmitir = (e: React.FormEvent) => {
    e.preventDefault();
    const grupoId = `cob-${Date.now()}`;
    const novos: Boleto[] = preview.itens.map((it) => ({
      id: `${grupoId}-${it.parcela}`,
      numero: `${Math.floor(Math.random() * 90000 + 10000)}.${it.parcela}`,
      empresaId: empresaSel?.id ?? "",
      empresaNome: empresaSel?.nomeFantasia ?? "—",
      processoId: processoSel?.id,
      processoNumero: processoSel?.numeroInterno,
      cliente: clienteAtual || "—",
      valor: it.valor,
      emissao: TODAY,
      vencimento: it.vencimento,
      status: "criado",
      descricao:
        preview.n > 1
          ? `Parcela ${it.parcela}/${preview.n} — ${clienteAtual || "cobrança"}`
          : `Cobrança — ${clienteAtual || "cliente"}`,
      ...(preview.n > 1
        ? { parcela: it.parcela, totalParcelas: preview.n, grupoId }
        : {}),
    }));
    setBoletos((prev) => [...novos, ...prev]);
    setOpen(false);
    setForm(emptyForm);
    toast({
      title: preview.n > 1 ? "Cobrança parcelada emitida" : "Boleto emitido",
      description:
        preview.n > 1
          ? `${preview.n}x de ${formatCurrency(preview.itens[0].valor)} para ${
              clienteAtual || "cliente"
            } (total ${formatCurrency(preview.total)}).`
          : `${formatCurrency(preview.total)} para ${clienteAtual || "cliente"}.`,
    });
  };

  // ---- Filtering ----
  // Escopo por empresa selecionada (vazio = todas) — aplica a KPIs, listas e relatório
  const boletosScope = useMemo(
    () => boletos.filter((b) => empSel.length === 0 || empSel.includes(b.empresaNome)),
    [boletos, empSel]
  );

  const bySearch = useMemo(() => {
    const q = search.toLowerCase();
    return boletosScope.filter(
      (b) =>
        !q ||
        b.cliente.toLowerCase().includes(q) ||
        b.empresaNome.toLowerCase().includes(q) ||
        (b.processoNumero ?? "").toLowerCase().includes(q)
    );
  }, [boletosScope, search]);

  const rows = useMemo(
    () => bySearch.filter((b) => !filters.status || b.status === filters.status),
    [bySearch, filters]
  );

  // ---- Grouped cobranças (by grupoId; singles are their own group) ----
  const grupos = useMemo(() => {
    const map = new Map<string, Boleto[]>();
    for (const b of bySearch) {
      const key = b.grupoId ?? b.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries())
      .map(([key, parcelas]) => {
        parcelas.sort(
          (a, b) =>
            (a.parcela ?? 0) - (b.parcela ?? 0) ||
            +new Date(a.vencimento) - +new Date(b.vencimento)
        );
        const total = parcelas.reduce((s, b) => s + b.valor, 0);
        const pagas = parcelas.filter((b) => b.status === "pago");
        const recebido = pagas.reduce((s, b) => s + b.valor, 0);
        const vencidas = parcelas.filter((b) => b.status === "vencido").length;
        return {
          key,
          parcelas,
          first: parcelas[0],
          total,
          pagasCount: pagas.length,
          recebido,
          vencidas,
          isParcelado: parcelas.length > 1 || !!parcelas[0].totalParcelas,
        };
      })
      .sort((a, b) => b.vencidas - a.vencidas || b.total - a.total);
  }, [bySearch]);

  // ---- KPIs (live, no escopo das empresas) ----
  const totalEmitido = boletosScope.reduce((s, b) => s + b.valor, 0);
  const pagos = boletosScope.filter((b) => b.status === "pago");
  const recebido = pagos.reduce((s, b) => s + b.valor, 0);
  const abertos = boletosScope.filter(isAberto);
  const aReceber = abertos.reduce((s, b) => s + b.valor, 0);
  const vencidos = boletosScope.filter((b) => b.status === "vencido");
  const inadimplencia = vencidos.reduce((s, b) => s + b.valor, 0);
  const taxaRecebimento = totalEmitido ? Math.round((recebido / totalEmitido) * 100) : 0;

  // ---- Report by client (open balance) ----
  const porCliente = useMemo(
    () =>
      Object.entries(
        abertos.reduce<Record<string, number>>((acc, b) => {
          acc[b.cliente] = (acc[b.cliente] ?? 0) + b.valor;
          return acc;
        }, {})
      )
        .map(([cliente, valor]) => ({ cliente, valor }))
        .sort((a, b) => b.valor - a.valor),
    [abertos]
  );

  // ---- Columns (Lista view) ----
  const columns: Column<Boleto>[] = [
    {
      key: "cliente",
      header: "Cliente / Processo",
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900">{b.cliente}</p>
          <p className="text-xs text-slate-400">
            {b.empresaNome}
            {b.processoNumero ? ` · ${b.processoNumero}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      align: "right",
      render: (b) => (
        <div className="flex flex-col items-end">
          <span className="font-medium text-slate-800">{formatCurrency(b.valor)}</span>
          {b.totalParcelas && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              parcela {b.parcela}/{b.totalParcelas}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "venc",
      header: "Vencimento",
      render: (b) => {
        const d = daysUntil(b.vencimento);
        return (
          <div>
            <p className="text-slate-600">{formatDate(b.vencimento)}</p>
            {b.status === "pago" && b.pagoEm ? (
              <p className="text-xs text-emerald-600">pago em {formatDate(b.pagoEm)}</p>
            ) : (
              isAberto(b) && (
                <p className="text-xs text-slate-400">
                  {d < 0 ? `${Math.abs(d)}d em atraso` : d === 0 ? "vence hoje" : `em ${d}d`}
                </p>
              )
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
        <div className="flex items-center justify-end gap-1">
          {isAberto(b) && (
            <button
              onClick={() => marcarPago(b)}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              Marcar pago
            </button>
          )}
          {b.status === "vencido" && (
            <button onClick={() => handleAction("lembrete", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Enviar lembrete">
              <Bell className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => handleAction("reenviar", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Reenviar">
            <Send className="h-4 w-4" />
          </button>
          <button onClick={() => handleAction("segunda-via", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Segunda via">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boletos & Cobranças"
        description="Emita cobranças parceladas, acompanhe pagamentos e gere relatórios de inadimplência"
        action={
          <>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <FileBarChart className="h-4 w-4" />
              Relatório
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Emitir cobrança
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total emitido" value={formatCurrency(totalEmitido)} icon={Receipt} tone="brand" hint={`${boletosScope.length} boletos`} />
        <StatCard label="Recebido" value={formatCurrency(recebido)} icon={CheckCircle2} tone="emerald" hint={`${taxaRecebimento}% · ${pagos.length} pagos`} />
        <StatCard label="A receber em aberto" value={formatCurrency(aReceber)} icon={Clock} tone="amber" hint={`${abertos.length} boletos`} />
        <StatCard label="Inadimplência" value={formatCurrency(inadimplencia)} icon={AlertTriangle} tone="rose" hint={`${vencidos.length} vencidos`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <EmpresaMultiSelect
          options={empOptions}
          selected={empSel}
          onChange={setEmpSel}
          className="w-full sm:w-64"
        />
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Buscar por cliente, empresa ou processo…"
          values={filters}
          onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
          filters={
            view === "lista"
              ? [
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
                ]
              : []
          }
          className="mb-0 flex-1"
        />
      </div>

      <div className="-mt-2 flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setView("cobrancas")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              view === "cobrancas" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cobranças
          </button>
          <button
            onClick={() => setView("lista")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              view === "lista" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <List className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
      </div>

      {view === "lista" ? (
        <Card>
          <div className="p-1.5">
            <DataTable columns={columns} rows={rows} />
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {grupos.map((g) => (
            <CobrancaCard key={g.key} grupo={g} onPagar={marcarPago} />
          ))}
        </div>
      )}

      {/* ===== Modal: emitir cobrança parcelada ===== */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Emitir cobrança"
        description="Divida o valor em parcelas e gere todos os boletos de uma vez"
        icon={Receipt}
        footer={
          <>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-emitir-cobranca">
              <Plus className="h-4 w-4" />
              {preview.n > 1 ? `Gerar ${preview.n} boletos` : "Emitir boleto"}
            </PrimaryButton>
          </>
        }
      >
        <form id="form-emitir-cobranca" onSubmit={handleEmitir} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Empresa">
              <Select
                required
                value={form.empresaId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, empresaId: e.target.value, processoId: "" }))
                }
              >
                <option value="" disabled>
                  Selecione a empresa
                </option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nomeFantasia} · {emp.cnpj}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Processo"
              hint={form.empresaId ? "Opcional" : "Escolha a empresa primeiro"}
            >
              <Select
                value={form.processoId}
                onChange={(e) => setField("processoId", e.target.value)}
                disabled={!form.empresaId}
              >
                <option value="">
                  {form.empresaId ? "Sem processo específico" : "—"}
                </option>
                {processosDaEmpresa.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numeroInterno} · {p.bl}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Cliente" hint="Preenchido automaticamente pela empresa">
            <Input value={clienteAtual} readOnly placeholder="Selecione a empresa" className="bg-slate-50 text-slate-500" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Valor total (R$)">
              <Input
                required
                inputMode="decimal"
                value={form.valorTotal}
                onChange={(e) => setField("valorTotal", e.target.value)}
                placeholder="100.000,00"
              />
            </Field>
            <Field label="Parcelas">
              <Input
                type="number"
                min={1}
                max={36}
                value={form.parcelas}
                onChange={(e) => setField("parcelas", e.target.value)}
              />
            </Field>
            <Field label="Intervalo">
              <Select value={form.intervalo} onChange={(e) => setField("intervalo", e.target.value)}>
                <option value="30">Mensal</option>
                <option value="15">Quinzenal</option>
                <option value="7">Semanal</option>
              </Select>
            </Field>
          </div>
          <Field label="1º vencimento">
            <Input
              type="date"
              required
              value={form.primeiroVenc}
              onChange={(e) => setField("primeiroVenc", e.target.value)}
            />
          </Field>

          {/* Live preview */}
          {preview.total > 0 && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  <Layers className="h-4 w-4" />
                  {preview.n > 1
                    ? `${preview.n}x de ${formatCurrency(preview.itens[0].valor)}`
                    : formatCurrency(preview.total)}
                </span>
                <span className="text-xs text-slate-500">
                  Total {formatCurrency(preview.total)}
                </span>
              </div>
              <div className="max-h-40 space-y-1 overflow-y-auto scrollbar-thin">
                {preview.itens.map((it) => (
                  <div
                    key={it.parcela}
                    className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-xs ring-1 ring-slate-100"
                  >
                    <span className="text-slate-500">
                      {preview.n > 1 ? `Parcela ${it.parcela}/${preview.n}` : "Boleto único"}
                    </span>
                    <span className="text-slate-400">{formatDate(it.vencimento)}</span>
                    <span className="font-medium text-slate-700">{formatCurrency(it.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* ===== Modal: relatório ===== */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Relatório de cobranças"
        description={`Posição em ${formatDate(TODAY)}`}
        icon={FileBarChart}
        footer={
          <>
            <GhostButton
              type="button"
              onClick={() =>
                toast({
                  title: "Relatório exportado",
                  description: "PDF gerado e disponível para download.",
                  tone: "info",
                })
              }
            >
              Baixar PDF
            </GhostButton>
            <PrimaryButton
              type="button"
              onClick={() => {
                setReportOpen(false);
                toast({
                  title: "Relatório enviado",
                  description: "Resumo de cobranças publicado no grupo interno.",
                });
              }}
            >
              <Send className="h-4 w-4" /> Enviar ao grupo
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Total emitido</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">{formatCurrency(totalEmitido)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">Recebido ({taxaRecebimento}%)</p>
              <p className="mt-0.5 text-lg font-semibold text-emerald-700">{formatCurrency(recebido)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs text-amber-600">A receber em aberto</p>
              <p className="mt-0.5 text-lg font-semibold text-amber-700">{formatCurrency(aReceber)}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3">
              <p className="text-xs text-rose-600">Inadimplência</p>
              <p className="mt-0.5 text-lg font-semibold text-rose-700">{formatCurrency(inadimplencia)}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Em aberto por cliente</span>
            </div>
            {porCliente.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum valor em aberto. 🎉</p>
            ) : (
              <ul className="space-y-1.5">
                {porCliente.map((c) => {
                  const pct = aReceber ? Math.round((c.valor / aReceber) * 100) : 0;
                  return (
                    <li key={c.cliente} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{c.cliente}</span>
                        <span className="font-medium text-slate-800">{formatCurrency(c.valor)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------------

type Grupo = {
  key: string;
  parcelas: Boleto[];
  first: Boleto;
  total: number;
  pagasCount: number;
  recebido: number;
  vencidas: number;
  isParcelado: boolean;
};

function CobrancaCard({ grupo, onPagar }: { grupo: Grupo; onPagar: (b: Boleto) => void }) {
  const { first, parcelas, total, pagasCount, recebido, vencidas, isParcelado } = grupo;
  const pct = total ? Math.round((recebido / total) * 100) : 0;

  return (
    <Card className={cn(vencidas > 0 && "border-rose-200")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {isParcelado ? <Layers className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{first.cliente}</p>
              {isParcelado && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                  {parcelas.length}x
                </span>
              )}
              {vencidas > 0 && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                  {vencidas} vencida(s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {first.empresaNome}
              {first.processoNumero ? ` · ${first.processoNumero}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(total)}</p>
          <p className="text-xs text-slate-400">
            {pagasCount}/{parcelas.length} pagas · {formatCurrency(recebido)} recebido
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Parcelas */}
      <div className="divide-y divide-slate-50 p-2">
        {parcelas.map((b) => {
          const d = daysUntil(b.vencimento);
          return (
            <div key={b.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-12 shrink-0 text-xs font-medium text-slate-400">
                {b.totalParcelas ? `${b.parcela}/${b.totalParcelas}` : "única"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{formatCurrency(b.valor)}</p>
                <p className="text-xs text-slate-400">
                  Venc. {formatDate(b.vencimento)}
                  {b.status === "pago" && b.pagoEm
                    ? ` · pago em ${formatDate(b.pagoEm)}`
                    : isAberto(b)
                    ? d < 0
                      ? ` · ${Math.abs(d)}d em atraso`
                      : d === 0
                      ? " · vence hoje"
                      : ` · em ${d}d`
                    : ""}
                </p>
              </div>
              <StatusBadge status={b.status} />
              {isAberto(b) ? (
                <button
                  onClick={() => onPagar(b)}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  Marcar pago
                </button>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ok
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
