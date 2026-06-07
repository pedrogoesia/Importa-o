"use client";

import { useMemo, useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { AICard } from "@/components/ui/AICard";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { documentos as documentosSeed, tiposDocumento } from "@/data/documentos";
import type { Documento } from "@/types";

const emptyForm = {
  nome: "",
  tipo: tiposDocumento[0] ?? "Invoice",
  processoNumero: "",
};

export default function DocumentosPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Documento[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const documentos = useMemo(() => [...extras, ...documentosSeed], [extras]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Documento = {
      id: `doc-${Date.now()}`,
      nome: form.nome || `${form.tipo}.pdf`,
      tipo: form.tipo,
      processoNumero: form.processoNumero || undefined,
      status: "em_analise",
      tamanho: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
      enviadoEm: new Date().toISOString().slice(0, 10),
      aiResumo:
        "Documento recebido. A IA está extraindo CNPJ, valores, datas e número do documento para vincular ao processo correto.",
      aiCampos: [{ label: "Status", valor: "Processando" }],
      aiInconsistencias: [],
    };
    setExtras((prev) => [novo, ...prev]);
    setOpen(false);
    setForm(emptyForm);
    toast({
      title: "Documento enviado",
      description: `${novo.nome} entrou na fila de análise da IA.`,
    });
  };

  const rows = useMemo(() => {
    return documentos.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.nome.toLowerCase().includes(q) ||
        (d.empresaNome ?? "").toLowerCase().includes(q) ||
        (d.processoNumero ?? "").toLowerCase().includes(q);
      const matchTipo = !filters.tipo || d.tipo === filters.tipo;
      const matchStatus = !filters.status || d.status === filters.status;
      return matchSearch && matchTipo && matchStatus;
    });
  }, [documentos, search, filters]);

  const validados = documentos.filter((d) => d.status === "validado").length;
  const emAnalise = documentos.filter((d) => d.status === "em_analise").length;
  const inconsistentes = documentos.filter((d) => d.status === "inconsistencia").length;
  const pendentes = documentos.filter((d) => d.status === "pendente").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Organização por empresa e processo, com análise automática da IA"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Upload className="h-4 w-4" />
            Enviar documento
          </button>
        }
      />

      <AICard title="Camada de análise da IA">
        A IA lê cada documento enviado e extrai automaticamente CNPJ, razão social, valores, datas e números, sugere a qual processo o
        arquivo pertence, gera um resumo e aponta inconsistências. No momento há{" "}
        <strong>{inconsistentes} inconsistência(s)</strong> e <strong>{pendentes} documento(s) pendente(s)</strong> de envio.
      </AICard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Validados" value={validados} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Em análise" value={emAnalise} icon={Sparkles} tone="sky" />
        <StatCard label="Com inconsistência" value={inconsistentes} icon={AlertTriangle} tone="rose" />
        <StatCard label="Pendentes" value={pendentes} icon={Clock} tone="amber" />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Buscar documento, empresa ou processo…"
        values={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        filters={[
          {
            key: "tipo",
            label: "Tipo",
            options: tiposDocumento.map((t) => ({ label: t, value: t })),
          },
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Validado", value: "validado" },
              { label: "Em análise", value: "em_analise" },
              { label: "Inconsistência", value: "inconsistencia" },
              { label: "Pendente", value: "pendente" },
            ],
          },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum documento encontrado" description="Ajuste os filtros ou envie um novo documento." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <DocumentCard key={d.id} documento={d} />
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Enviar documento"
        description="A IA analisa e vincula automaticamente ao processo"
        icon={Upload}
        footer={
          <>
            <GhostButton type="button" onClick={() => setOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-enviar-doc">
              <Upload className="h-4 w-4" /> Enviar para análise
            </PrimaryButton>
          </>
        }
      >
        <form id="form-enviar-doc" onSubmit={handleUpload} className="space-y-4">
          <Field
            label="Arquivo"
            hint="Demonstração — nenhum arquivo é enviado de verdade"
          >
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-xs text-slate-500">
                Arraste um arquivo ou clique para selecionar
              </p>
            </div>
          </Field>
          <Field label="Nome do documento">
            <Input
              required
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              placeholder="Ex.: Invoice-2026-001.pdf"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Select
                value={form.tipo}
                onChange={(e) => setField("tipo", e.target.value)}
              >
                {tiposDocumento.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Processo vinculado" hint="Opcional">
              <Input
                value={form.processoNumero}
                onChange={(e) => setField("processoNumero", e.target.value)}
                placeholder="IMP-001"
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
