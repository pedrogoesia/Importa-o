"use client";

import { useMemo, useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { AICard } from "@/components/ui/AICard";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { documentos, tiposDocumento } from "@/data/documentos";

export default function DocumentosPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

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
  }, [search, filters]);

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
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
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
    </div>
  );
}
