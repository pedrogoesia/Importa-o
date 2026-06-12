"use client";

import { useState } from "react";
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Lock,
  Printer,
  Loader2,
  Stethoscope,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useDuimp } from "@/lib/duimp-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { Duimp, DuimpStatus, BlocoStatus, ItemStatus, LpcoStatus, DocStatus } from "@/data/duimp";

// ---- rótulos / cores -------------------------------------------------------

const tone = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warn: "bg-amber-50 text-amber-700 ring-amber-600/20",
  bad: "bg-rose-50 text-rose-700 ring-rose-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
  brand: "bg-brand-50 text-brand-700 ring-brand-600/20",
};

const duimpStatusMap: Record<DuimpStatus, { label: string; t: keyof typeof tone }> = {
  nao_iniciada: { label: "Não iniciada", t: "neutral" },
  em_preparacao: { label: "Em preparação", t: "info" },
  pre_duimp_pronta: { label: "Pré-DUIMP pronta", t: "brand" },
  diagnostico_solicitado: { label: "Diagnóstico solicitado", t: "info" },
  diagnostico_erro: { label: "Diagnóstico com erro", t: "bad" },
  pronta_para_registro: { label: "Pronta para registro", t: "ok" },
  registrada: { label: "Registrada", t: "ok" },
  em_conferencia: { label: "Em conferência", t: "warn" },
  desembaracada: { label: "Desembaraçada", t: "ok" },
  cancelada: { label: "Cancelada", t: "bad" },
  retificada: { label: "Retificada", t: "info" },
};

const blocoMap: Record<BlocoStatus, { label: string; t: keyof typeof tone }> = {
  nao_iniciado: { label: "Não iniciado", t: "neutral" },
  incompleto: { label: "Incompleto", t: "warn" },
  com_divergencia: { label: "Divergência", t: "bad" },
  aguardando_aprovacao: { label: "Aguardando aprovação", t: "info" },
  aprovado: { label: "Aprovado", t: "ok" },
  bloqueado: { label: "Bloqueado", t: "neutral" },
  pronto_diagnostico: { label: "Pronto p/ diagnóstico", t: "brand" },
  pronto_registro: { label: "Pronto p/ registro", t: "ok" },
};

const itemMap: Record<ItemStatus, { label: string; t: keyof typeof tone }> = {
  incompleto: { label: "Incompleto", t: "warn" },
  aguardando_ncm: { label: "Aguardando NCM", t: "warn" },
  aguardando_atributo: { label: "Aguardando atributo", t: "warn" },
  aguardando_operador: { label: "Aguardando operador", t: "warn" },
  aguardando_validacao_fiscal: { label: "Aguardando validação", t: "warn" },
  com_divergencia: { label: "Divergência", t: "bad" },
  aprovado_pre: { label: "Aprovado (Pré)", t: "info" },
  enviado_catalogo: { label: "Enviado ao Catálogo", t: "info" },
  pronto_duimp: { label: "Pronto", t: "ok" },
};

const docMap: Record<DocStatus, { label: string; t: keyof typeof tone }> = {
  recebido: { label: "Recebido", t: "neutral" },
  extraido: { label: "Extraído (IA)", t: "info" },
  revisado: { label: "Revisado", t: "warn" },
  aprovado: { label: "Aprovado", t: "ok" },
  recusado: { label: "Recusado", t: "bad" },
  pendente: { label: "Pendente", t: "warn" },
};

const lpcoMap: Record<LpcoStatus, { label: string; t: keyof typeof tone }> = {
  nao_consultado: { label: "Não consultado", t: "neutral" },
  dispensado: { label: "Dispensado", t: "ok" },
  requer: { label: "Requer LPCO", t: "bad" },
  rascunho: { label: "Rascunho", t: "warn" },
  enviado: { label: "Enviado", t: "info" },
  em_analise: { label: "Em análise", t: "info" },
  exigencia: { label: "Com exigência", t: "warn" },
  deferido: { label: "Deferido", t: "ok" },
  indeferido: { label: "Indeferido", t: "bad" },
  impede_registro: { label: "Impede registro", t: "bad" },
};

const canalLabel: Record<string, string> = { aguardando: "Aguardando", verde: "Verde", amarelo: "Amarelo", vermelho: "Vermelho", cinza: "Cinza" };

function Pill({ t, children }: { t: keyof typeof tone; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tone[t])}>{children}</span>;
}

/** Campo do modelo: mostra o valor ou destaca "a preencher". */
function Campo({ label, value, span }: { label: string; value?: string | number | null; span?: boolean }) {
  const filled = value !== undefined && value !== null && value !== "" && value !== "—";
  return (
    <div className={cn("border-b border-dashed border-slate-200 pb-1.5", span && "sm:col-span-2")}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {filled ? (
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
      ) : (
        <span className="mt-0.5 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
          <AlertTriangle className="h-3 w-3" /> a preencher
        </span>
      )}
    </div>
  );
}

function SecaoTitulo({ num, titulo, status }: { num: string; titulo: string; status?: { label: string; t: keyof typeof tone } }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-slate-300 pb-1.5">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white">{num}</span>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{titulo}</h4>
      {status && <span className="ml-auto"><Pill t={status.t}>{status.label}</Pill></span>}
    </div>
  );
}

// ---- Componente principal --------------------------------------------------

export function DuimpTab({ processoId }: { processoId: string }) {
  const toast = useToast();
  const duimp = useDuimp();
  const d = duimp.getDuimp(processoId);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);

  if (!d) return <p className="text-sm text-slate-400">DUIMP indisponível para este processo.</p>;

  const c = d.carga;
  const t = d.tributos;
  const st = duimpStatusMap[d.status];
  const bloqueiam = d.pendencias.filter((p) => p.gravidade === "bloqueia").length;
  const registrada = !!d.registro.numero;

  const printPdf = () => window.print();

  const gates = [
    { label: "Blocos A–F aprovados", ok: d.blocos.slice(0, 6).every((b) => b.status === "aprovado" || b.status === "aguardando_aprovacao") },
    { label: "Diagnóstico sem erro impeditivo", ok: d.diagnostico.status === "sem_erro" || d.diagnostico.status === "com_alerta" },
    { label: "LPCO obrigatório resolvido", ok: !d.lpco.some((l) => l.exigeLpco && l.status !== "deferido") },
    { label: "Tributos revisados", ok: t.aprovadoUsuario },
    { label: "Sem pendências que bloqueiam", ok: bloqueiam === 0 },
  ];
  const podeRegistrar = gates.every((g) => g.ok);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ====================== MODELO DA DUIMP ====================== */}
      <div id="duimp-modelo" className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-card">
        {/* Cabeçalho do documento */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-brand-600" />
              <h3 className="text-base font-semibold text-slate-900">DUIMP — Declaração Única de Importação</h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Pré-visualização do modelo · Processo {d.processoNumero}
              {d.numero ? ` · Nº ${d.numero} v${d.versao}` : " · rascunho interno"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill t={st.t}>{st.label}</Pill>
            <button onClick={printPdf} className="no-print flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              <Printer className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
        </div>

        {/* Faixa de prontidão */}
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Prontidão da Pré-DUIMP</span>
            <span className="font-semibold text-brand-700">{d.prontidao}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${d.prontidao}%` }} />
          </div>
        </div>

        <div className="space-y-7 p-6">
          {/* 1. Identificação */}
          <section>
            <SecaoTitulo num="1" titulo="Identificação do importador" status={statusBloco(d, "identificacao")} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Campo label="Importador" value={d.importadorNome} />
              <Campo label="CNPJ" value={d.importadorCnpj} />
              <Campo label="Tipo de importador" value={d.tipoImportador} />
              <Campo label="Responsável interno" value={d.responsavelInterno} />
              <Campo label="Despachante" value={d.despachante} />
              <Campo label="Unidade de despacho" value={d.unidadeDespacho} />
              <Campo label="Referência interna" value={d.referenciaInterna} />
            </div>
          </section>

          {/* 2. Carga (puxada do BL) */}
          <section>
            <SecaoTitulo num="2" titulo="Carga / transporte" status={statusBloco(d, "carga")} />
            <p className="mb-3 flex items-center gap-1.5 text-[11px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> Dados puxados automaticamente a partir do BL {c.numeroBlAwb}.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <Campo label="Modal" value={c.modal} />
              <Campo label="Tipo de conhecimento" value={c.tipoConhecimento} />
              <Campo label="BL / AWB" value={c.numeroBlAwb} />
              <Campo label="CE-Mercante" value={c.ceMercante} />
              <Campo label="Recinto alfandegado" value={c.recinto} />
              <Campo label="Origem → Destino" value={c.origem && c.destino ? `${c.origem} → ${c.destino}` : undefined} />
              <Campo label="Navio / voo" value={c.navioVoo} />
              <Campo label="Container" value={c.container} />
              <Campo label="ETA" value={c.eta} />
              <Campo label="Incoterm" value={c.incoterm} />
              <Campo label="Peso bruto" value={c.pesoBruto ? `${c.pesoBruto} kg` : undefined} />
              <Campo label="Volumes" value={c.volumes} />
            </div>
          </section>

          {/* 3. Itens / adições */}
          <section>
            <SecaoTitulo num="3" titulo={`Itens / adições (${d.itens.length})`} status={statusBloco(d, "itens")} />
            <div className="space-y-3">
              {d.itens.map((it) => {
                const m = itemMap[it.status];
                const faltaAttr = it.atributos.filter((a) => !a.valor || a.valor.trim() === "");
                return (
                  <div key={it.numero} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">Item {it.numero}</span>
                          <span className="text-sm text-slate-600">{it.descricaoComercial}</span>
                          <Pill t={m.t}>{m.label}</Pill>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">NCM {it.ncm} · {it.descricaoTecnica}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-slate-800">{formatCurrency(it.valorTotal)}</p>
                        <p className="text-xs text-slate-400">{it.qtdComercial} {it.unidadeComercial} · {it.paisOrigem}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {it.atributos.map((a) => (
                        <span key={a.nome} className={cn("rounded px-1.5 py-0.5 text-[11px] ring-1 ring-inset", a.valor ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20")}>
                          {a.nome}{a.valor ? `: ${a.valor}` : " (faltando)"}
                        </span>
                      ))}
                    </div>
                    {it.status !== "pronto_duimp" && (
                      <div className="no-print mt-2 flex flex-wrap items-center gap-2 rounded-md bg-amber-50/70 px-2.5 py-1.5">
                        <span className="flex-1 text-[11px] text-amber-800">
                          {it.status === "aguardando_operador"
                            ? `O produto ${it.numero} precisa de um operador estrangeiro no Catálogo.`
                            : faltaAttr.length
                            ? `O produto ${it.numero} ainda não tem todos os atributos exigidos para a DUIMP.`
                            : `O produto ${it.numero} precisa ser enviado ao Catálogo.`}
                        </span>
                        {it.status === "aguardando_operador" && it.operadorId ? (
                          <button onClick={() => { duimp.cadastrarOperador(processoId, it.operadorId!); toast({ title: "Operador enviado ao Catálogo" }); }} className="rounded bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700">Cadastrar operador</button>
                        ) : (
                          <button onClick={() => { duimp.enviarCatalogo(processoId, it.produtoId ?? it.codigoInterno); toast({ title: "Produto enviado ao Catálogo" }); }} className="rounded bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700">Enviar ao Catálogo</button>
                        )}
                        <button onClick={() => { duimp.aprovarItem(processoId, it.numero); toast({ title: `Item ${it.numero} aprovado` }); }} className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">Aprovar</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Operadores estrangeiros */}
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400"><Globe className="h-3 w-3" /> Operadores estrangeiros</p>
              <div className="space-y-1">
                {d.operadores.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{o.nome} · {o.tipo} · {o.pais}</span>
                    {o.statusCatalogo === "ativo" ? <Pill t="ok">Ativo</Pill> : o.statusCatalogo === "pendente" ? <Pill t="warn">Pendente</Pill> : <Pill t="neutral">Não cadastrado</Pill>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Tributos */}
          <section>
            <SecaoTitulo num="4" titulo="Tributos e valores (estimado)" status={statusBloco(d, "tributos")} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {([
                ["Valor aduaneiro", t.valorAduaneiro],
                ["II", t.ii], ["IPI", t.ipi], ["PIS", t.pis], ["COFINS", t.cofins], ["ICMS estimado", t.icmsEstimado],
              ] as [string, number][]).map(([l, v]) => (
                <div key={l} className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                  <span className="text-xs text-slate-500">{l}</span>
                  <span className="font-medium text-slate-800">{formatCurrency(v)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">Total estimado: {formatCurrency(t.totalEstimado)}</span>
              {t.aprovadoUsuario ? <Pill t="ok">Revisado</Pill> : (
                <button onClick={() => { duimp.aprovarTributos(processoId); toast({ title: "Tributos revisados" }); }} className="no-print rounded bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Aprovar estimativa</button>
              )}
            </div>
          </section>

          {/* 5. Tratamento administrativo / LPCO */}
          <section>
            <SecaoTitulo num="5" titulo="Tratamento administrativo / LPCO" status={statusBloco(d, "tratamento")} />
            <div className="space-y-1.5">
              {d.lpco.map((l) => {
                const m = lpcoMap[l.status];
                return (
                  <div key={l.itemNumero} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                    {l.bloqueia ? <Lock className="h-4 w-4 shrink-0 text-rose-500" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    <span className="text-slate-700">Item {l.itemNumero} · NCM {l.ncm}</span>
                    {l.orgaoAnuente !== "—" && <span className="text-xs text-slate-400">{l.orgaoAnuente}</span>}
                    <Pill t={m.t}>{m.label}</Pill>
                    {l.exigeLpco && l.status !== "deferido" && (
                      <button onClick={() => { duimp.deferirLpco(processoId, l.itemNumero); toast({ title: "LPCO deferido" }); }} className="no-print ml-auto rounded bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700">Vincular LPCO</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Documentos instrutivos */}
          <section>
            <SecaoTitulo num="6" titulo="Documentos instrutivos" status={statusBloco(d, "documentos")} />
            <div className="space-y-1.5">
              {d.documentos.map((doc) => {
                const m = docMap[doc.status];
                return (
                  <div key={doc.tipo} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <span className="text-slate-700">{doc.tipo}</span>
                    <span className="text-xs text-slate-400">{[doc.numero, doc.emissor].filter(Boolean).join(" · ")}</span>
                    <Pill t={m.t}>{m.label}</Pill>
                    {doc.pendencias[0] && <span className="text-[11px] text-rose-600">{doc.pendencias[0]}</span>}
                    {doc.status !== "aprovado" && doc.status !== "recusado" && (
                      <button onClick={() => { duimp.aprovarDoc(processoId, doc.tipo); toast({ title: "Documento aprovado", description: doc.tipo }); }} className="no-print ml-auto rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">Aprovar</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* ====================== PAINEL LATERAL ====================== */}
      <div className="no-print space-y-6">
        {/* Status / prontidão */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <Pill t={st.t}>{st.label}</Pill>
            <span className="text-2xl font-semibold text-brand-700">{d.prontidao}%</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Mini label="Itens" value={String(d.itens.length)} />
            <Mini label="Docs aprovados" value={`${d.documentos.filter((x) => x.status === "aprovado").length}/${d.documentos.length}`} />
            <Mini label="Canal" value={canalLabel[d.canal]} />
            <Mini label="Total estimado" value={formatCurrency(t.totalEstimado)} />
          </div>
        </Card>

        {/* Checklist resumido */}
        <Card>
          <CardHeader title="Checklist Pré-DUIMP" icon={FileCheck2} />
          <ul className="divide-y divide-slate-50">
            {d.blocos.map((b) => {
              const m = blocoMap[b.status];
              return (
                <li key={b.key} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-500">{b.letra}</span>
                  <span className="flex-1 text-slate-700">{b.titulo}</span>
                  <Pill t={m.t}>{m.label}</Pill>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Próximas ações */}
        <Card>
          <CardHeader title="Próximas ações" icon={Sparkles} />
          <ul className="space-y-2 p-4">
            {d.proximasAcoes.length === 0 ? (
              <li className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Sem ações pendentes.</li>
            ) : d.proximasAcoes.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {a}</li>
            ))}
          </ul>
        </Card>

        {/* Diagnóstico */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Diagnóstico</h4>
            <button
              onClick={async () => { setLoadingDiag(true); toast({ title: "Diagnóstico solicitado", tone: "info" }); await duimp.solicitarDiagnostico(processoId); setLoadingDiag(false); toast({ title: "Diagnóstico retornado" }); }}
              disabled={loadingDiag}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loadingDiag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Stethoscope className="h-3.5 w-3.5" />}
              {d.diagnostico.status === "nao_solicitado" ? "Rodar" : "Rodar de novo"}
            </button>
          </div>
          {d.diagnostico.status !== "nao_solicitado" && (
            <div className="mt-3 space-y-1.5">
              {d.diagnostico.erros.length === 0 && d.diagnostico.alertas.length === 0 && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Sem erros nem alertas.</p>
              )}
              {d.diagnostico.erros.map((e, i) => <p key={i} className="flex items-start gap-1.5 rounded bg-rose-50 px-2 py-1 text-[11px] text-rose-700"><Lock className="mt-0.5 h-3 w-3 shrink-0" /> {e}</p>)}
              {d.diagnostico.alertas.map((a, i) => <p key={i} className="flex items-start gap-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-800"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {a}</p>)}
            </div>
          )}
        </Card>

        {/* Registro / acompanhamento */}
        {registrada ? (
          <Card>
            <CardHeader title={`DUIMP ${d.registro.numero}`} subtitle={`Registrada · v${d.registro.versao}`} icon={BadgeCheck} />
            <ol className="space-y-2 p-4">
              {d.eventos.map((e, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {e.feito ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                  <span className={e.feito ? "text-slate-700" : "text-slate-400"}>{e.titulo}</span>
                </li>
              ))}
            </ol>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Registro" icon={BadgeCheck} />
            <ul className="space-y-1.5 px-4 py-3">
              {gates.map((g) => (
                <li key={g.label} className="flex items-center gap-2 text-xs">
                  {g.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Lock className="h-3.5 w-3.5 text-rose-400" />}
                  <span className={g.ok ? "text-slate-600" : "text-rose-600"}>{g.label}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-4">
              <button
                onClick={async () => { setLoadingReg(true); const r = await duimp.registrar(processoId); setLoadingReg(false); if (r) toast({ title: "DUIMP registrada", description: `Nº ${r.numero}` }); }}
                disabled={!podeRegistrar || loadingReg}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingReg ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                {loadingReg ? "Registrando…" : "Registrar DUIMP"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function statusBloco(d: Duimp, key: string) {
  const b = d.blocos.find((x) => x.key === key);
  return b ? blocoMap[b.status] : undefined;
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-800">{value}</p>
    </div>
  );
}
