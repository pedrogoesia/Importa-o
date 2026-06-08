"use client";

import { useState } from "react";
import {
  Radar as RadarIcon,
  FileText,
  Plus,
  ChevronDown,
  CheckCircle2,
  Circle,
  Upload,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { AICard } from "@/components/ui/AICard";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Field, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import {
  radarRegistros as radarSeed,
  irpfRegistros,
  radarEtapasTemplate,
  radarDocsTemplate,
} from "@/data/compliance";
import { empresas } from "@/data/empresas";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import type { RadarRegistro, IrpfRegistro, RadarModalidade } from "@/types";

const docStatusNext: Record<string, "pendente" | "recebido" | "enviado"> = {
  pendente: "recebido",
  recebido: "enviado",
  enviado: "pendente",
};

const limitePorModalidade: Record<RadarModalidade, string> = {
  Expressa: "Até USD 50 mil / semestre",
  Limitada: "Até USD 150 mil / semestre",
  Ilimitada: "Sem limite de valor",
};

const irpfCols: Column<IrpfRegistro>[] = [
  {
    key: "empresa",
    header: "Empresa",
    render: (r) => (
      <div>
        <p className="font-medium text-slate-900">{r.empresaNome}</p>
        <p className="text-xs text-slate-400">{r.cnpj} · {r.uf}</p>
      </div>
    ),
  },
  { key: "socios", header: "Sócios", render: (r) => <span className="text-slate-600">{r.socios}</span> },
  { key: "abertura", header: "Abertura", render: (r) => <span className="text-slate-600">{formatDate(r.dataAbertura)}</span> },
  { key: "contador", header: "Contador IRPF", render: (r) => <span className="text-slate-600">{r.contador}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
];

function progresso(r: RadarRegistro) {
  const t = r.etapas?.length ?? 0;
  const f = r.etapas?.filter((e) => e.feito).length ?? 0;
  return t ? Math.round((f / t) * 100) : 100;
}

export default function RadarPage() {
  const toast = useToast();
  const [registros, setRegistros] = useState<RadarRegistro[]>(radarSeed);
  const [openId, setOpenId] = useState<string | null>("rad-004");
  const [novaOpen, setNovaOpen] = useState(false);
  const [form, setForm] = useState({ empresaId: "", modalidade: "Limitada" as RadarModalidade });

  const habilitados = registros.filter((r) => r.situacao === "habilitado").length;
  const emHabilitacao = registros.filter((r) => r.situacao === "em_habilitacao").length;
  const emRevisao = registros.filter((r) => r.situacao === "revisao").length;
  const prazoCurto = registros.filter((r) => daysUntil(r.dataLimite) <= 7 && daysUntil(r.dataLimite) >= 0).length;

  const toggleEtapa = (rid: string, eid: string) => {
    setRegistros((prev) =>
      prev.map((r) =>
        r.id === rid
          ? { ...r, etapas: r.etapas?.map((e) => (e.id === eid ? { ...e, feito: !e.feito } : e)) }
          : r
      )
    );
  };

  const cycleDoc = (rid: string, did: string) => {
    setRegistros((prev) =>
      prev.map((r) =>
        r.id === rid
          ? { ...r, documentos: r.documentos?.map((d) => (d.id === did ? { ...d, status: docStatusNext[d.status] } : d)) }
          : r
      )
    );
  };

  const anexarDoc = (rid: string, did: string, nome: string) => {
    setRegistros((prev) =>
      prev.map((r) =>
        r.id === rid
          ? { ...r, documentos: r.documentos?.map((d) => (d.id === did ? { ...d, status: "enviado" } : d)) }
          : r
      )
    );
    toast({ title: "Documento anexado", description: `${nome} guardado no dossiê.`, tone: "info" });
  };

  const marcarHabilitado = (r: RadarRegistro) => {
    setRegistros((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? { ...x, situacao: "habilitado", ultimoRegistro: new Date().toISOString().slice(0, 10) }
          : x
      )
    );
    toast({ title: "RADAR habilitado", description: `${r.empresaNome} habilitada na modalidade ${r.modalidade}.` });
  };

  const criarHabilitacao = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empresas.find((x) => x.id === form.empresaId);
    if (!emp) return;
    const id = `rad-${Date.now()}`;
    const nova: RadarRegistro = {
      id,
      empresaNome: emp.nomeFantasia,
      adm: emp.adm,
      ultimoRegistro: "—",
      dataLimite: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      observacoes: "Habilitação iniciada nesta sessão (demonstração).",
      modalidade: form.modalidade,
      limite: limitePorModalidade[form.modalidade],
      situacao: "em_habilitacao",
      etapas: radarEtapasTemplate(),
      documentos: radarDocsTemplate(),
    };
    setRegistros((prev) => [nova, ...prev]);
    setNovaOpen(false);
    setOpenId(id);
    setForm({ empresaId: "", modalidade: "Limitada" });
    toast({
      title: "Habilitação iniciada",
      description: `Dossiê RADAR de ${emp.nomeFantasia} criado com ${radarEtapasTemplate().length} etapas.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radar & Obrigações"
        description="Habilitação RADAR no Siscomex: etapas, dossiê de documentos e prazos por empresa"
        action={
          <button
            onClick={() => setNovaOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Nova habilitação
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Habilitados" value={habilitados} icon={ShieldCheck} tone="emerald" />
        <StatCard label="Em habilitação" value={emHabilitacao} icon={RadarIcon} tone="sky" />
        <StatCard label="Em revisão" value={emRevisao} icon={AlertTriangle} tone="amber" />
        <StatCard label="Prazo ≤ 7 dias" value={prazoCurto} icon={Clock} tone="rose" />
      </div>

      <AICard title="Compliance — alerta da IA">
        A <strong>Nordix</strong> está em habilitação (modalidade Expressa) com 1 documento pendente (Balanço/DRE) e prazo em 09/06/2026.
        Conclua o dossiê e protocole na Receita antes do fechamento. No IRPF, <strong>M&S e Nordix</strong> seguem pendentes de entrega.
      </AICard>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <RadarIcon className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Habilitações RADAR</h2>
        </div>
        <div className="space-y-3">
          {registros.map((r) => {
            const aberto = openId === r.id;
            const pct = progresso(r);
            const d = daysUntil(r.dataLimite);
            const docsPend = r.documentos?.filter((x) => x.status !== "enviado").length ?? 0;
            return (
              <Card key={r.id} className={cn(r.situacao === "em_habilitacao" && "border-sky-200")}>
                <button
                  onClick={() => setOpenId(aberto ? null : r.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <RadarIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{r.empresaNome}</p>
                      {r.situacao && <StatusBadge status={r.situacao} />}
                      {r.modalidade && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {r.modalidade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {r.limite} · ADM {r.adm} · prazo {formatDate(r.dataLimite)}{" "}
                      <span className={d < 0 ? "text-rose-500" : d <= 7 ? "text-amber-600" : "text-slate-400"}>
                        ({d < 0 ? "vencido" : d === 0 ? "hoje" : `em ${d}d`})
                      </span>
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="w-24">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : "bg-sky-500")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-9 text-right text-xs font-semibold text-slate-700">{pct}%</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", aberto && "rotate-180")} />
                </button>

                {aberto && (
                  <div className="grid grid-cols-1 gap-5 border-t border-slate-100 p-5 lg:grid-cols-2">
                    {/* Etapas / obrigações */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Etapas da habilitação
                      </p>
                      <ul className="space-y-1.5">
                        {r.etapas?.map((e) => (
                          <li key={e.id}>
                            <button
                              onClick={() => toggleEtapa(r.id, e.id)}
                              className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-slate-50"
                            >
                              {e.feito ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                              )}
                              <span className={cn("text-sm", e.feito ? "text-slate-400 line-through" : "text-slate-700")}>
                                {e.titulo}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {pct === 100 && r.situacao !== "habilitado" && (
                        <button
                          onClick={() => marcarHabilitado(r)}
                          className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Marcar como habilitado
                        </button>
                      )}
                    </div>

                    {/* Documentos do dossiê */}
                    <div>
                      <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Dossiê de documentos
                        {docsPend > 0 && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                            {docsPend} pendente(s)
                          </span>
                        )}
                      </p>
                      <ul className="space-y-1.5">
                        {r.documentos?.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex items-center gap-2 rounded-md border border-slate-100 px-2.5 py-1.5"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{doc.nome}</span>
                            <button onClick={() => cycleDoc(r.id, doc.id)} title="Alterar situação">
                              <StatusBadge status={doc.status} />
                            </button>
                            {doc.status !== "enviado" && (
                              <button
                                onClick={() => anexarDoc(r.id, doc.id, doc.nome)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                                title="Anexar documento"
                              >
                                <Upload className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Obrigações IRPF</h2>
        </div>
        <DataTable columns={irpfCols} rows={irpfRegistros} />
      </div>

      {/* Modal: nova habilitação */}
      <Modal
        open={novaOpen}
        onClose={() => setNovaOpen(false)}
        title="Nova habilitação RADAR"
        description="Inicie o dossiê de habilitação no Siscomex"
        icon={RadarIcon}
        footer={
          <>
            <GhostButton type="button" onClick={() => setNovaOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-nova-radar">
              <Plus className="h-4 w-4" /> Iniciar habilitação
            </PrimaryButton>
          </>
        }
      >
        <form id="form-nova-radar" onSubmit={criarHabilitacao} className="space-y-4">
          <Field label="Empresa">
            <Select
              required
              value={form.empresaId}
              onChange={(e) => setForm((f) => ({ ...f, empresaId: e.target.value }))}
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
          <Field label="Modalidade" hint="Define o limite de operação no semestre">
            <Select
              value={form.modalidade}
              onChange={(e) => setForm((f) => ({ ...f, modalidade: e.target.value as RadarModalidade }))}
            >
              <option value="Expressa">Expressa — até USD 50 mil</option>
              <option value="Limitada">Limitada — até USD 150 mil</option>
              <option value="Ilimitada">Ilimitada — sem limite</option>
            </Select>
          </Field>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 flex items-center gap-1.5 font-medium text-slate-600">
              <Building2 className="h-3.5 w-3.5" /> O sistema vai criar:
            </p>
            {radarEtapasTemplate().length} etapas do processo + dossiê com {radarDocsTemplate().length} documentos para acompanhar.
          </div>
        </form>
      </Modal>
    </div>
  );
}
