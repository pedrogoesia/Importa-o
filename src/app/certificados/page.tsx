"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Plus,
  List,
  CalendarDays,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  FileKey,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Calendar, type CalendarEvent } from "@/components/ui/Calendar";
import { Field, Input, Select, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { certificados as certSeed } from "@/data/compliance";
import { empresas } from "@/data/empresas";
import { formatDate, daysUntil, cn } from "@/lib/utils";
import type { Certificado } from "@/types";

const TODAY = new Date().toISOString().slice(0, 10);
function addMonthsISO(iso: string, months: number) {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  empresaId: "",
  tipo: "e-CNPJ" as Certificado["tipo"],
  responsavel: "",
  socioDespachante: "",
  emissor: "Serasa Experian",
  validade: "",
  senha: "",
};

function DetalheItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export default function CertificadosPage() {
  const toast = useToast();
  const [certs, setCerts] = useState<Certificado[]>(certSeed);
  const [view, setView] = useState<"lista" | "calendario">("lista");
  const [detalhe, setDetalhe] = useState<Certificado | null>(null);
  const [showSenha, setShowSenha] = useState(false);
  const [novoOpen, setNovoOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const validos = certs.filter((c) => c.status === "valido").length;
  const vencendo = certs.filter((c) => c.status === "vencendo").length;
  const vencidos = certs.filter((c) => c.status === "vencido").length;

  const statusPorValidade = (validade: string): Certificado["status"] => {
    const d = daysUntil(validade);
    if (d < 0) return "vencido";
    if (d <= 15) return "vencendo";
    return "valido";
  };

  const renovar = (c: Certificado) => {
    const novaValidade = addMonthsISO(TODAY, 12);
    setCerts((prev) =>
      prev.map((x) =>
        x.id === c.id ? { ...x, validade: novaValidade, emitidoEm: TODAY, status: "valido" } : x
      )
    );
    setDetalhe((d) => (d && d.id === c.id ? { ...d, validade: novaValidade, emitidoEm: TODAY, status: "valido" } : d));
    toast({
      title: "Certificado renovado",
      description: `${c.tipo} de ${c.empresaNome} válido até ${formatDate(novaValidade)}.`,
    });
  };

  const criarCert = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = empresas.find((x) => x.id === form.empresaId);
    const validade = form.validade || addMonthsISO(TODAY, 12);
    const novo: Certificado = {
      id: `cert-${Date.now()}`,
      empresaNome: emp?.nomeFantasia ?? "—",
      responsavel: form.responsavel || emp?.adm || "—",
      tipo: form.tipo,
      validade,
      status: statusPorValidade(validade),
      socioDespachante: form.socioDespachante || "—",
      emissor: form.emissor,
      senha: form.senha || undefined,
      documentoNome: `${form.tipo}_${(emp?.nomeFantasia ?? "cert").replace(/\s+/g, "")}_A1.pfx`,
      emitidoEm: TODAY,
    };
    setCerts((prev) => [novo, ...prev]);
    setNovoOpen(false);
    setForm(emptyForm);
    toast({ title: "Certificado cadastrado", description: `${novo.tipo} de ${novo.empresaNome} guardado.` });
  };

  const columns: Column<Certificado>[] = [
    {
      key: "empresa",
      header: "Empresa",
      render: (c) => (
        <div>
          <p className="font-medium text-slate-900">{c.empresaNome}</p>
          <p className="text-xs text-slate-400">{c.tipo} · {c.emissor}</p>
        </div>
      ),
    },
    { key: "resp", header: "Responsável", render: (c) => <span className="text-slate-600">{c.responsavel}</span> },
    { key: "socio", header: "Sócio / Despachante", render: (c) => <span className="text-slate-600">{c.socioDespachante}</span> },
    { key: "validade", header: "Validade", render: (c) => <span className="text-slate-600">{formatDate(c.validade)}</span> },
    {
      key: "dias",
      header: "Dias até vencer",
      align: "center",
      render: (c) => {
        const d = daysUntil(c.validade);
        return (
          <span className={`text-sm font-medium ${d < 0 ? "text-rose-600" : d <= 15 ? "text-amber-600" : "text-slate-600"}`}>
            {d < 0 ? `${Math.abs(d)}d vencido` : `${d}d`}
          </span>
        );
      },
    },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  ];

  const eventos: CalendarEvent[] = certs.map((c) => ({
    id: c.id,
    date: c.validade,
    label: `${c.empresaNome} (${c.tipo})`,
    tone: c.status === "valido" ? "receber" : "pagar",
    done: false,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificados digitais"
        description="Guarde os certificados e-CNPJ / e-CPF e gerencie validade, senha e renovação"
        action={
          <button
            onClick={() => setNovoOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Novo certificado
          </button>
        }
      />

      <AICard title="Alerta de certificados">
        <strong>{vencendo} certificado(s)</strong> vencem nos próximos 15 dias e <strong>{vencidos} já estão vencidos</strong>. Prioridade:
        renovar o e-CNPJ da <strong>Nordix</strong> antes da próxima operação de desembaraço e regularizar o e-CPF da sócia Sandra Lima (M&amp;S).
      </AICard>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Válidos" value={validos} icon={ShieldCheck} tone="emerald" />
        <StatCard label="Vencendo" value={vencendo} icon={ShieldAlert} tone="amber" />
        <StatCard label="Vencidos" value={vencidos} icon={ShieldX} tone="rose" />
      </div>

      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {(
            [
              { id: "lista", label: "Lista", icon: List },
              { id: "calendario", label: "Calendário", icon: CalendarDays },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                view === v.id ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <v.icon className="h-3.5 w-3.5" /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "lista" ? (
        <DataTable columns={columns} rows={certs} onRowClick={(c) => { setShowSenha(false); setDetalhe(c); }} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <Calendar
            events={eventos}
            today={TODAY}
            onEventClick={(id) => {
              const c = certs.find((x) => x.id === id);
              if (c) {
                setShowSenha(false);
                setDetalhe(c);
              }
            }}
          />
        </div>
      )}

      {/* Modal: detalhe do certificado */}
      <Modal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.tipo} — ${detalhe.empresaNome}` : ""}
        description={detalhe?.emissor}
        icon={FileKey}
        footer={
          detalhe && (
            <>
              <GhostButton
                type="button"
                onClick={() =>
                  toast({ title: "Download iniciado", description: `${detalhe.documentoNome ?? "certificado"} baixado.`, tone: "info" })
                }
              >
                <Download className="h-4 w-4" /> Baixar
              </GhostButton>
              <PrimaryButton type="button" onClick={() => renovar(detalhe)}>
                <RefreshCw className="h-4 w-4" /> Renovar (+12 meses)
              </PrimaryButton>
            </>
          )
        }
      >
        {detalhe && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <StatusBadge status={detalhe.status} />
              <span
                className={cn(
                  "text-sm font-medium",
                  daysUntil(detalhe.validade) < 0
                    ? "text-rose-600"
                    : daysUntil(detalhe.validade) <= 15
                    ? "text-amber-600"
                    : "text-slate-600"
                )}
              >
                {(() => {
                  const d = daysUntil(detalhe.validade);
                  return d < 0 ? `${Math.abs(d)} dias vencido` : d === 0 ? "Vence hoje" : `Vence em ${d} dias`;
                })()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetalheItem label="Empresa" value={detalhe.empresaNome} />
              <DetalheItem label="Tipo" value={detalhe.tipo} />
              <DetalheItem label="Responsável" value={detalhe.responsavel} />
              <DetalheItem label="Sócio / Despachante" value={detalhe.socioDespachante} />
              <DetalheItem label="Autoridade certificadora" value={detalhe.emissor ?? "—"} />
              <DetalheItem label="Emitido em" value={detalhe.emitidoEm ? formatDate(detalhe.emitidoEm) : "—"} />
              <DetalheItem label="Validade" value={formatDate(detalhe.validade)} />
              <DetalheItem
                label="Senha"
                value={
                  detalhe.senha ? (
                    <button
                      onClick={() => setShowSenha((s) => !s)}
                      className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
                    >
                      <span className="font-mono">{showSenha ? detalhe.senha : "••••••••"}</span>
                      {showSenha ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
              <FileKey className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                {detalhe.documentoNome ?? "Nenhum arquivo guardado"}
              </span>
              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                Guardado
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: novo certificado */}
      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Novo certificado"
        description="Cadastre e guarde um certificado digital"
        icon={ShieldCheck}
        footer={
          <>
            <GhostButton type="button" onClick={() => setNovoOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" form="form-novo-cert">
              <Plus className="h-4 w-4" /> Guardar certificado
            </PrimaryButton>
          </>
        }
      >
        <form id="form-novo-cert" onSubmit={criarCert} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Empresa">
              <Select
                required
                value={form.empresaId}
                onChange={(e) => setForm((f) => ({ ...f, empresaId: e.target.value }))}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nomeFantasia}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo">
              <Select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as Certificado["tipo"] }))}>
                <option value="e-CNPJ">e-CNPJ</option>
                <option value="e-CPF">e-CPF</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Responsável">
              <Input
                value={form.responsavel}
                onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
                placeholder="Ex.: Ricardo Almeida"
              />
            </Field>
            <Field label="Sócio / Despachante">
              <Input
                value={form.socioDespachante}
                onChange={(e) => setForm((f) => ({ ...f, socioDespachante: e.target.value }))}
                placeholder="Ex.: João Ferreira"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Autoridade certificadora">
              <Select value={form.emissor} onChange={(e) => setForm((f) => ({ ...f, emissor: e.target.value }))}>
                {["Serasa Experian", "Certisign", "Valid", "Soluti", "AC Safeweb"].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Validade">
              <Input type="date" value={form.validade} onChange={(e) => setForm((f) => ({ ...f, validade: e.target.value }))} />
            </Field>
          </div>
          <Field label="Senha" hint="Fica guardada de forma segura no sistema">
            <Input
              value={form.senha}
              onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              placeholder="Senha do certificado"
            />
          </Field>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
            <FileKey className="h-4 w-4" /> Arraste o arquivo .pfx/.p12 ou clique para anexar (demonstração)
          </div>
        </form>
      </Modal>
    </div>
  );
}
