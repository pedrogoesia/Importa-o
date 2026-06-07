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
import { Modal } from "@/components/ui/Modal";
import { Field, Input, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { boletos as boletosSeed } from "@/data/financeiro";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import type { Boleto } from "@/types";

const emptyForm = {
  cliente: "",
  empresaNome: "",
  valor: "",
  vencimento: "",
};

function buildColumns(
  onAction: (label: string, b: Boleto) => void
): Column<Boleto>[] {
  return [
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
            <button onClick={() => onAction("lembrete", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Enviar lembrete">
              <Bell className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => onAction("reenviar", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Reenviar">
            <Send className="h-4 w-4" />
          </button>
          <button onClick={() => onAction("segunda-via", b)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Segunda via">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}

export default function BoletosPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Boleto[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const boletos = useMemo(() => [...extras, ...boletosSeed], [extras]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

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
        description: `Nova via do boleto ${b.numero} disponível para download.`,
      },
    };
    const msg = messages[label];
    if (msg) toast({ ...msg, tone: label === "lembrete" ? "warning" : "info" });
  };

  const handleEmitir = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(form.valor.replace(/\./g, "").replace(",", ".")) || 0;
    const novo: Boleto = {
      id: `bol-${Date.now()}`,
      numero: `${Math.floor(Math.random() * 90000 + 10000)}`,
      empresaId: "",
      empresaNome: form.empresaNome || "—",
      cliente: form.cliente || "—",
      valor: valorNum,
      emissao: new Date().toISOString().slice(0, 10),
      vencimento: form.vencimento || new Date().toISOString().slice(0, 10),
      status: "criado",
      descricao: "Boleto emitido nesta sessão (demonstração).",
    };
    setExtras((prev) => [novo, ...prev]);
    setOpen(false);
    setForm(emptyForm);
    toast({
      title: "Boleto emitido",
      description: `${formatCurrency(valorNum)} para ${novo.cliente} · venc. ${formatDate(novo.vencimento)}.`,
    });
  };

  const columns = useMemo(() => buildColumns(handleAction), []); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [boletos, search, filters]);

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
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Emitir boleto"
        description="Gere uma cobrança e envie ao cliente"
        icon={Receipt}
        footer={
          <>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-emitir-boleto">
              <Plus className="h-4 w-4" /> Emitir boleto
            </PrimaryButton>
          </>
        }
      >
        <form id="form-emitir-boleto" onSubmit={handleEmitir} className="space-y-4">
          <Field label="Cliente">
            <Input
              required
              value={form.cliente}
              onChange={(e) => setField("cliente", e.target.value)}
              placeholder="Nome do cliente"
            />
          </Field>
          <Field label="Empresa">
            <Input
              value={form.empresaNome}
              onChange={(e) => setField("empresaNome", e.target.value)}
              placeholder="Ex.: Eleven"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor (R$)">
              <Input
                required
                inputMode="decimal"
                value={form.valor}
                onChange={(e) => setField("valor", e.target.value)}
                placeholder="12.500,00"
              />
            </Field>
            <Field label="Vencimento">
              <Input
                type="date"
                required
                value={form.vencimento}
                onChange={(e) => setField("vencimento", e.target.value)}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
