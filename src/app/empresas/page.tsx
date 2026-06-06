"use client";

import { useMemo, useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { empresas } from "@/data/empresas";
import { getProcessosByEmpresa } from "@/data/processos";
import type { Empresa } from "@/types";

const ufOptions = Array.from(new Set(empresas.map((e) => e.uf))).map((uf) => ({
  label: uf,
  value: uf,
}));

const columns: Column<Empresa>[] = [
  {
    key: "razao",
    header: "Empresa",
    render: (e) => (
      <div>
        <p className="font-medium text-slate-900">{e.nomeFantasia}</p>
        <p className="text-xs text-slate-400">{e.razaoSocial}</p>
      </div>
    ),
  },
  { key: "cnpj", header: "CNPJ", render: (e) => <span className="text-slate-600">{e.cnpj}</span> },
  {
    key: "tipo",
    header: "Tipo / UF",
    render: (e) => (
      <span className="text-slate-600">
        {e.tipo} · {e.uf}
      </span>
    ),
  },
  { key: "adm", header: "ADM", render: (e) => <span className="text-slate-600">{e.adm}</span> },
  {
    key: "processos",
    header: "Processos",
    align: "center",
    render: (e) => (
      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        {getProcessosByEmpresa(e.id).length}
      </span>
    ),
  },
  { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
];

export default function EmpresasPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    return empresas.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.nomeFantasia.toLowerCase().includes(q) ||
        e.razaoSocial.toLowerCase().includes(q) ||
        e.cnpj.includes(q) ||
        e.adm.toLowerCase().includes(q);
      const matchUf = !filters.uf || e.uf === filters.uf;
      const matchStatus = !filters.status || e.status === filters.status;
      const matchTipo = !filters.tipo || e.tipo === filters.tipo;
      return matchSearch && matchUf && matchStatus && matchTipo;
    });
  }, [search, filters]);

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Cadastro de importadoras, CNPJs e responsáveis"
        action={
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            Nova empresa
          </button>
        }
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar por empresa, CNPJ ou responsável…"
        values={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        filters={[
          { key: "uf", label: "UF", options: ufOptions },
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Ativa", value: "ativa" },
              { label: "Pendente", value: "pendente" },
              { label: "Inativa", value: "inativa" },
            ],
          },
          {
            key: "tipo",
            label: "Tipo",
            options: [
              { label: "Matriz", value: "Matriz" },
              { label: "Filial", value: "Filial" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={rows}
        onRowHref={(e) => `/empresas/${e.id}`}
        empty={
          <EmptyState
            icon={Building2}
            title="Nenhuma empresa encontrada"
            description="Ajuste os filtros ou cadastre uma nova empresa."
          />
        }
      />
    </div>
  );
}
