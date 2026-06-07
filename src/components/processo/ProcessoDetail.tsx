"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  FileText,
  Container,
  Wallet,
  Landmark,
  History,
  Sparkles,
  Ship,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Send,
} from "lucide-react";
import { getProcessoById } from "@/data/processos";
import { getDocumentosByProcesso } from "@/data/documentos";
import { boletos, transacoes, contasPagar } from "@/data/financeiro";
import { notasFiscais } from "@/data/fiscal";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DocumentCard } from "@/components/ui/DocumentCard";
import { Timeline } from "@/components/ui/Timeline";
import { AICard } from "@/components/ui/AICard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Processo, TimelineEvent, Boleto } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function buildTimeline(p: Processo): TimelineEvent[] {
  return [
    {
      id: "e1",
      data: formatDate(p.dataEmbarque),
      titulo: "Embarque realizado",
      descricao: `${p.fornecedor} · ${p.portoOrigem} → ${p.portoDestino}`,
      tipo: "info",
    },
    {
      id: "e2",
      data: "—",
      titulo: "Documentos recebidos",
      descricao: "Invoice e packing list anexados ao processo.",
      tipo: "sucesso",
    },
    {
      id: "e3",
      data: formatDate(p.dataChegada),
      titulo: `Carga em ${p.etapa.toLowerCase()}`,
      descricao: p.observacoes,
      tipo: p.status === "atrasado" ? "alerta" : "info",
    },
    {
      id: "e4",
      data: "06/06/2026",
      titulo: "IA analisou o processo",
      descricao: "Próximos passos e pendências atualizados.",
      tipo: "ia",
    },
  ];
}

const boletoCols: Column<Boleto>[] = [
  { key: "cliente", header: "Cliente", render: (b) => <span className="text-slate-700">{b.cliente}</span> },
  { key: "valor", header: "Valor", align: "right", render: (b) => <span className="font-medium text-slate-800">{formatCurrency(b.valor)}</span> },
  { key: "venc", header: "Vencimento", render: (b) => <span className="text-slate-600">{formatDate(b.vencimento)}</span> },
  { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
];

export function ProcessoDetail({ id }: { id: string }) {
  const toast = useToast();
  const p = getProcessoById(id);
  if (!p) return null;

  const docs = getDocumentosByProcesso(p.id);
  const procBoletos = boletos.filter((b) => b.processoId === p.id);
  const procTransacoes = transacoes.filter((t) => t.processoNumero === p.numeroInterno);
  const procContas = contasPagar.filter((c) => c.processoNumero === p.numeroInterno);
  const procNotas = notasFiscais.filter((n) => n.processoNumero === p.numeroInterno);

  const receita = procTransacoes.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
  const custos = procTransacoes.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);

  const visaoGeral = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader title="Dados do processo" icon={Ship} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
            <Field label="Empresa" value={p.empresaNome} />
            <Field label="CNPJ" value={p.cnpj} />
            <Field label="Cliente" value={p.cliente} />
            <Field label="Responsável interno" value={p.responsavelInterno} />
            <Field label="Despachante" value={p.despachante} />
            <Field label="Fornecedor" value={p.fornecedor} />
            <Field label="País de origem" value={p.paisOrigem} />
            <Field label="Porto de origem" value={p.portoOrigem} />
            <Field label="Porto de destino" value={p.portoDestino} />
            <Field label="Navio / transportadora" value={p.navio} />
            <Field label="BL / Conhecimento" value={p.bl} />
            <Field label="Container" value={p.container} />
            <Field label="Embarque (ETD)" value={formatDate(p.dataEmbarque)} />
            <Field label="Chegada (ETA)" value={formatDate(p.dataChegada)} />
            <Field label="Valor FOB" value={formatCurrency(p.valorFob)} />
          </div>
          {p.observacoes && (
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
              {p.observacoes}
            </div>
          )}
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader title="Status da operação" />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status da carga</span>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Etapa atual</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {p.etapa}
              </span>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" /> {p.portoOrigem} → {p.portoDestino}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" /> ETA {formatDate(p.dataChegada)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" /> {p.empresaNome}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Documentos pendentes" icon={AlertTriangle} />
          <div className="p-5">
            {p.documentosPendentes.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Nenhuma pendência.
              </p>
            ) : (
              <ul className="space-y-2">
                {p.documentosPendentes.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const documentosTab =
    docs.length === 0 ? (
      <p className="text-sm text-slate-400">Nenhum documento anexado a este processo.</p>
    ) : (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <DocumentCard key={d.id} documento={d} />
        ))}
      </div>
    );

  const cargaTab = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Rastreamento da carga" subtitle="Siscomex / Siscarga" icon={Container} />
        <div className="p-5">
          <Timeline events={buildTimeline(p)} />
        </div>
      </Card>
      <Card className="h-fit">
        <CardHeader title="Dados de transporte" icon={Ship} />
        <div className="space-y-4 p-5">
          <Field label="Navio" value={p.navio} />
          <Field label="BL" value={p.bl} />
          <Field label="Container" value={p.container} />
          <Field label="Rota" value={`${p.portoOrigem} → ${p.portoDestino}`} />
        </div>
      </Card>
    </div>
  );

  const financeiroTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs text-slate-400">Receita</p>
          <p className="mt-1 text-lg font-semibold text-emerald-600">{formatCurrency(receita)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs text-slate-400">Custos</p>
          <p className="mt-1 text-lg font-semibold text-rose-600">{formatCurrency(custos)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs text-slate-400">Margem</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(receita - custos)}</p>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Boletos vinculados</h3>
        {procBoletos.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum boleto vinculado.</p>
        ) : (
          <DataTable columns={boletoCols} rows={procBoletos} />
        )}
      </div>
      {procContas.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Contas a pagar</h3>
          <div className="space-y-2">
            {procContas.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{c.descricao}</p>
                  <p className="text-xs text-slate-400">{c.fornecedor} · vence {formatDate(c.vencimento)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{formatCurrency(c.valor)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const fiscalTab =
    procNotas.length === 0 ? (
      <p className="text-sm text-slate-400">Nenhuma nota fiscal vinculada a este processo.</p>
    ) : (
      <div className="space-y-2">
        {procNotas.map((n) => (
          <div key={n.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Landmark className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{n.numero} · {n.tipo}</p>
                <p className="text-xs text-slate-400">{n.observacao}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-800">{formatCurrency(n.valor)}</span>
              <StatusBadge status={n.status} />
            </div>
          </div>
        ))}
      </div>
    );

  const historicoTab = (
    <Card>
      <CardHeader title="Histórico do processo" icon={History} />
      <div className="p-5">
        <Timeline events={buildTimeline(p)} />
      </div>
    </Card>
  );

  const iaTab = (
    <div className="space-y-5">
      <AICard title="Resumo automático do processo">
        {`${p.numeroInterno} (${p.bl}) da ${p.empresaNome} está na etapa "${p.etapa}" com status ${p.status.replace("_", " ")}. ` +
          (p.documentosPendentes.length
            ? `Há ${p.documentosPendentes.length} documento(s) pendente(s): ${p.documentosPendentes.join(", ")}. `
            : "Documentação completa. ") +
          (p.status === "atrasado"
            ? "Risco de atraso identificado — recomenda-se ação imediata para evitar custos adicionais."
            : "Operação dentro do previsto.")}
      </AICard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Próximos passos recomendados" icon={CheckCircle2} />
          <ul className="space-y-2.5 p-5 text-sm text-slate-600">
            {p.documentosPendentes.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                Solicitar/anexar: {d}
              </li>
            ))}
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Confirmar ETA com o agente de carga
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              Programar emissão da NF de entrada
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="Inconsistências e riscos" icon={AlertTriangle} />
          <ul className="space-y-2.5 p-5 text-sm text-slate-600">
            {docs.flatMap((d) => d.aiInconsistencias).map((inc, i) => (
              <li key={i} className="flex items-start gap-2 text-rose-600">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {inc}
              </li>
            ))}
            {p.status === "atrasado" && (
              <li className="flex items-start gap-2 text-rose-600">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Risco de demurrage por atraso no desembaraço.
              </li>
            )}
            {docs.flatMap((d) => d.aiInconsistencias).length === 0 && p.status !== "atrasado" && (
              <li className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Nenhuma inconsistência detectada.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Mensagem sugerida para o cliente" icon={MessageSquare} />
        <div className="p-5">
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            {`Olá! Atualização do processo ${p.numeroInterno} (${p.bl}): a carga está em "${p.etapa}". ` +
              (p.documentosPendentes.length
                ? `Para seguirmos, precisamos de: ${p.documentosPendentes.join(", ")}. `
                : "Documentação completa. ") +
              `Previsão de chegada em ${formatDate(p.dataChegada)}. Qualquer dúvida, estamos à disposição.`}
          </div>
          <button
            onClick={() =>
              toast({
                title: "Mensagem enviada",
                description: `Atualização do ${p.numeroInterno} publicada no grupo interno.`,
              })
            }
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Send className="h-4 w-4" /> Enviar para o grupo
          </button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/processos" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Processos
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{p.numeroInterno}</h1>
            <StatusBadge status={p.status} />
          </div>
          <p className="text-sm text-slate-500">
            {p.empresaNome} · {p.cliente} · {p.bl} · {p.container}
          </p>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          Etapa: {p.etapa}
        </span>
      </div>

      <Tabs
        tabs={[
          { key: "geral", label: "Visão geral", icon: Eye, content: visaoGeral },
          { key: "docs", label: "Documentos", icon: FileText, content: documentosTab },
          { key: "carga", label: "Carga", icon: Container, content: cargaTab },
          { key: "fin", label: "Financeiro", icon: Wallet, content: financeiroTab },
          { key: "fiscal", label: "Fiscal", icon: Landmark, content: fiscalTab },
          { key: "hist", label: "Histórico", icon: History, content: historicoTab },
          { key: "ia", label: "IA", icon: Sparkles, content: iaTab },
        ]}
      />
    </div>
  );
}
