"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Ship, AlertCircle, LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { ProcessCard } from "@/components/ui/ProcessCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { processos as processosSeed } from "@/data/processos";
import { empresas } from "@/data/empresas";
import { formatDate, cn } from "@/lib/utils";
import type { Processo } from "@/types";

const emptyForm = {
  numeroInterno: "",
  empresaId: empresas[0]?.id ?? "",
  cliente: "",
  bl: "",
  container: "",
  fornecedor: "",
  dataChegada: "",
};

const empresaOptions = empresas.map((e) => ({
  label: e.nomeFantasia,
  value: e.id,
}));

const columns: Column<Processo>[] = [
  {
    key: "num",
    header: "Processo",
    render: (p) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-900">{p.numeroInterno}</span>
        {p.temPendencia && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
      </div>
    ),
  },
  {
    key: "empresa",
    header: "Empresa / Cliente",
    render: (p) => (
      <div>
        <p className="text-slate-700">{p.empresaNome}</p>
        <p className="text-xs text-slate-400">{p.cliente}</p>
      </div>
    ),
  },
  { key: "bl", header: "BL", render: (p) => <span className="text-slate-600">{p.bl}</span> },
  { key: "container", header: "Container", render: (p) => <span className="text-slate-600">{p.container}</span> },
  { key: "eta", header: "ETA", render: (p) => <span className="text-slate-600">{formatDate(p.dataChegada)}</span> },
  {
    key: "etapa",
    header: "Etapa",
    render: (p) => (
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        {p.etapa}
      </span>
    ),
  },
  { key: "resp", header: "Responsável", render: (p) => <span className="text-slate-600">{p.responsavelInterno}</span> },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
];

export default function ProcessosPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [view, setView] = useState<"grid" | "list">("grid");
  const [extras, setExtras] = useState<Processo[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const processos = useMemo(() => [...extras, ...processosSeed], [extras]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const empresa = empresas.find((emp) => emp.id === form.empresaId);
    const novo: Processo = {
      id: `proc-${Date.now()}`,
      numeroInterno: form.numeroInterno || `IMP-${Math.floor(Math.random() * 900 + 100)}`,
      empresaId: form.empresaId,
      empresaNome: empresa?.nomeFantasia ?? "—",
      cnpj: empresa?.cnpj ?? "—",
      cliente: form.cliente || empresa?.clienteVinculado || "—",
      responsavelInterno: empresa?.adm ?? "—",
      despachante: "A definir",
      fornecedor: form.fornecedor || "—",
      paisOrigem: "—",
      portoOrigem: "—",
      portoDestino: "—",
      navio: "—",
      bl: form.bl || "—",
      container: form.container || "—",
      dataEmbarque: new Date().toISOString().slice(0, 10),
      dataChegada: form.dataChegada || new Date().toISOString().slice(0, 10),
      status: "em_transito",
      etapa: "Pré-embarque",
      valorFob: 0,
      observacoes: "Processo criado nesta sessão (demonstração).",
      documentosPendentes: ["Invoice", "Packing list"],
      temPendencia: true,
    };
    setExtras((prev) => [novo, ...prev]);
    setOpen(false);
    setForm(emptyForm);
    toast({
      title: "Processo criado",
      description: `${novo.numeroInterno} aberto para ${novo.empresaNome}.`,
    });
  };

  const rows = useMemo(() => {
    return processos.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.numeroInterno.toLowerCase().includes(q) ||
        p.bl.toLowerCase().includes(q) ||
        p.container.toLowerCase().includes(q) ||
        p.empresaNome.toLowerCase().includes(q) ||
        p.cliente.toLowerCase().includes(q);
      const matchEmpresa = !filters.empresa || p.empresaId === filters.empresa;
      const matchStatus = !filters.status || p.status === filters.status;
      return matchSearch && matchEmpresa && matchStatus;
    });
  }, [processos, search, filters]);

  return (
    <div>
      <PageHeader
        title="Processos de importação"
        description="Cada processo representa uma carga/operação, identificada pelo BL"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Novo processo
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <FilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Buscar por processo, BL, container ou cliente…"
            values={filters}
            onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
            filters={[
              { key: "empresa", label: "Empresa", options: empresaOptions },
              {
                key: "status",
                label: "Status",
                options: [
                  { label: "Em trânsito", value: "em_transito" },
                  { label: "Atracado", value: "atracado" },
                  { label: "Aguardando documento", value: "aguardando_documento" },
                  { label: "Desembaraçado", value: "desembaracado" },
                  { label: "Atrasado", value: "atrasado" },
                  { label: "Concluído", value: "concluido" },
                ],
              },
            ]}
          />
        </div>
        <div className="mb-5 hidden shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 sm:flex">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              view === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              view === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Ship}
          title="Nenhum processo encontrado"
          description="Ajuste os filtros ou crie um novo processo de importação."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ProcessCard key={p.id} processo={p} />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} onRowHref={(p) => `/processos/${p.id}`} />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo processo de importação"
        description="Cada processo nasce de um BL / conhecimento de embarque"
        icon={Ship}
        footer={
          <>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-novo-processo">
              <Plus className="h-4 w-4" /> Criar processo
            </PrimaryButton>
          </>
        }
      >
        <form id="form-novo-processo" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Número interno" hint="Deixe em branco para gerar automático">
              <Input
                value={form.numeroInterno}
                onChange={(e) => setField("numeroInterno", e.target.value)}
                placeholder="IMP-001"
              />
            </Field>
            <Field label="Empresa">
              <Select
                value={form.empresaId}
                onChange={(e) => setField("empresaId", e.target.value)}
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nomeFantasia}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Cliente">
            <Input
              value={form.cliente}
              onChange={(e) => setField("cliente", e.target.value)}
              placeholder="Nome do cliente"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="BL / Conhecimento">
              <Input
                required
                value={form.bl}
                onChange={(e) => setField("bl", e.target.value)}
                placeholder="BL-123456"
              />
            </Field>
            <Field label="Container">
              <Input
                value={form.container}
                onChange={(e) => setField("container", e.target.value)}
                placeholder="MSKU1234567"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fornecedor internacional">
              <Input
                value={form.fornecedor}
                onChange={(e) => setField("fornecedor", e.target.value)}
                placeholder="Ex.: Shenzhen Tech Co."
              />
            </Field>
            <Field label="Previsão de chegada (ETA)">
              <Input
                type="date"
                value={form.dataChegada}
                onChange={(e) => setField("dataChegada", e.target.value)}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
