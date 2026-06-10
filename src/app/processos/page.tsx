"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Ship, AlertCircle, LayoutGrid, List, Building2, ArrowRight, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { ProcessCard } from "@/components/ui/ProcessCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CanalBadge } from "@/components/ui/CanalBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProcessoForm } from "@/components/processo/ProcessoForm";
import { useToast } from "@/components/ui/Toast";
import { useProcessos } from "@/lib/processos-store";
import { empresas } from "@/data/empresas";
import { formatDate, cn } from "@/lib/utils";
import type { Processo } from "@/types";

const empresaOptions = empresas.map((e) => ({ label: e.nomeFantasia, value: e.id }));

export default function ProcessosPage() {
  const toast = useToast();
  const { processos, addProcesso, updateProcesso } = useProcessos();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [view, setView] = useState<"cliente" | "grid" | "list">("cliente");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Processo | undefined>(undefined);

  const openNovo = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEditar = (p: Processo) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSubmit = (p: Processo) => {
    if (editing) {
      updateProcesso(p);
      toast({ title: "Processo atualizado", description: `${p.numeroInterno} salvo.` });
    } else {
      addProcesso(p);
      toast({ title: "Processo criado", description: `${p.numeroInterno} aberto para ${p.empresaNome}.` });
    }
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

  const grupos = useMemo(() => {
    const map = new Map<string, Processo[]>();
    for (const p of rows) {
      if (!map.has(p.empresaId)) map.set(p.empresaId, []);
      map.get(p.empresaId)!.push(p);
    }
    return Array.from(map.entries())
      .map(([empresaId, ps]) => ({
        empresaId,
        empresa: empresas.find((e) => e.id === empresaId),
        first: ps[0],
        processos: ps,
        pendencias: ps.filter((p) => p.temPendencia).length,
      }))
      .sort((a, b) => b.pendencias - a.pendencias || b.processos.length - a.processos.length);
  }, [rows]);

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
    { key: "eta", header: "ETA", render: (p) => <span className="text-slate-600">{formatDate(p.dataChegada)}</span> },
    { key: "canal", header: "Canal", render: (p) => <CanalBadge canal={p.canal} size="sm" /> },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEditar(p);
          }}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title="Editar processo"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Processos de importação"
        description="Cada cliente tem sua própria empresa/CNPJ · canal de parametrização visível na lista"
        action={
          <button
            onClick={openNovo}
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
          <button onClick={() => setView("cliente")} title="Por cliente" className={cn("flex h-8 w-8 items-center justify-center rounded-md", view === "cliente" ? "bg-slate-100 text-slate-700" : "text-slate-400")}>
            <Building2 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("grid")} title="Cards" className={cn("flex h-8 w-8 items-center justify-center rounded-md", view === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} title="Lista" className={cn("flex h-8 w-8 items-center justify-center rounded-md", view === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400")}>
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
      ) : view === "cliente" ? (
        <div className="space-y-5">
          {grupos.map((g) => (
            <div key={g.empresaId} className="rounded-xl border border-slate-200 bg-white shadow-card">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm">
                    {g.first.empresaNome.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{g.first.empresaNome}</p>
                      {g.empresa && <StatusBadge status={g.empresa.status} />}
                      {g.pendencias > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                          <AlertCircle className="h-3 w-3" /> {g.pendencias} pendência(s)
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      Cliente {g.first.cliente} · {g.first.cnpj}
                      {g.empresa ? ` · ${g.empresa.uf} · ADM ${g.empresa.adm}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {g.processos.length} processo(s)
                  </span>
                  <Link href={`/empresas/${g.empresaId}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                    Ver empresa <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {g.processos.map((p) => (
                  <ProcessCard key={p.id} processo={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <ProcessCard key={p.id} processo={p} />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} onRowHref={(p) => `/processos/${p.id}`} />
      )}

      <ProcessoForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSubmit={handleSubmit} />
    </div>
  );
}
