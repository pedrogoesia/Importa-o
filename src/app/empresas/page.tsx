"use client";

import { useMemo, useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { empresas as empresasSeed } from "@/data/empresas";
import { getProcessosByEmpresa } from "@/data/processos";
import type { Empresa } from "@/types";

const ufList = ["SP", "SC", "PR", "RJ", "RS", "ES", "MG", "BA", "PE", "CE"];

const emptyForm = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  tipo: "Matriz" as Empresa["tipo"],
  uf: "SP",
  adm: "",
  emailFinanceiro: "",
};

const ufOptions = Array.from(new Set(empresasSeed.map((e) => e.uf))).map((uf) => ({
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
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Empresa[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const empresas = useMemo(() => [...extras, ...empresasSeed], [extras]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: Empresa = {
      id: `emp-${Date.now()}`,
      razaoSocial: form.razaoSocial || form.nomeFantasia,
      nomeFantasia: form.nomeFantasia,
      cnpj: form.cnpj || "00.000.000/0001-00",
      tipo: form.tipo,
      uf: form.uf,
      endereco: "—",
      cep: "—",
      municipio: "—",
      inscricaoEstadual: "—",
      inscricaoMunicipal: "—",
      socios: [],
      adm: form.adm || "—",
      emailFinanceiro: form.emailFinanceiro || "—",
      emailOperacional: "—",
      telefone: "—",
      contabilidade: "—",
      regimeTributario: "Lucro Real",
      beneficioFiscal: "—",
      clienteVinculado: form.nomeFantasia,
      status: "pendente",
      certificadoVinculado: "—",
      dataAbertura: new Date().toISOString().slice(0, 10),
      observacoes: "Cadastro criado nesta sessão (demonstração).",
    };
    setExtras((prev) => [nova, ...prev]);
    setOpen(false);
    setForm(emptyForm);
    toast({
      title: "Empresa cadastrada",
      description: `${nova.nomeFantasia} foi adicionada com status pendente.`,
    });
  };

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
  }, [empresas, search, filters]);

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Cadastro de importadoras, CNPJs e responsáveis"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova empresa"
        description="Cadastre uma importadora no sistema"
        icon={Building2}
        footer={
          <>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-nova-empresa">
              <Plus className="h-4 w-4" /> Cadastrar empresa
            </PrimaryButton>
          </>
        }
      >
        <form id="form-nova-empresa" onSubmit={handleCreate} className="space-y-4">
          <Field label="Nome fantasia">
            <Input
              required
              value={form.nomeFantasia}
              onChange={(e) => setField("nomeFantasia", e.target.value)}
              placeholder="Ex.: Eleven"
            />
          </Field>
          <Field label="Razão social">
            <Input
              value={form.razaoSocial}
              onChange={(e) => setField("razaoSocial", e.target.value)}
              placeholder="Ex.: Eleven Importação e Comércio Ltda"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CNPJ">
              <Input
                value={form.cnpj}
                onChange={(e) => setField("cnpj", e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </Field>
            <Field label="Tipo">
              <Select
                value={form.tipo}
                onChange={(e) => setField("tipo", e.target.value)}
              >
                <option value="Matriz">Matriz</option>
                <option value="Filial">Filial</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="UF">
              <Select value={form.uf} onChange={(e) => setField("uf", e.target.value)}>
                {ufList.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="ADM responsável">
              <Input
                value={form.adm}
                onChange={(e) => setField("adm", e.target.value)}
                placeholder="Ex.: Marina Costa"
              />
            </Field>
          </div>
          <Field label="E-mail financeiro">
            <Input
              type="email"
              value={form.emailFinanceiro}
              onChange={(e) => setField("emailFinanceiro", e.target.value)}
              placeholder="financeiro@empresa.com.br"
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
