"use client";

import { useState } from "react";
import {
  FileCheck2,
  Ship,
  FileText,
  Package,
  Coins,
  ShieldAlert,
  Stethoscope,
  BadgeCheck,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lock,
  Globe,
  Boxes,
  ArrowRight,
  Loader2,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { useDuimp } from "@/lib/duimp-store";
import { formatCurrency, cn } from "@/lib/utils";
import type {
  Duimp,
  DuimpStatus,
  BlocoStatus,
  ItemStatus,
  CatalogoStatus,
  DocStatus,
  LpcoStatus,
} from "@/data/duimp";

// ---- Mapas de rótulo/cor ---------------------------------------------------

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
  em_preparacao: { label: "Pré-DUIMP em preparação", t: "info" },
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
  com_divergencia: { label: "Com divergência", t: "bad" },
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
  com_divergencia: { label: "Com divergência", t: "bad" },
  aprovado_pre: { label: "Aprovado (Pré)", t: "info" },
  enviado_catalogo: { label: "Enviado ao Catálogo", t: "info" },
  pronto_duimp: { label: "Pronto p/ DUIMP", t: "ok" },
};

const catalogoMap: Record<CatalogoStatus, { label: string; t: keyof typeof tone }> = {
  nao_cadastrado: { label: "Não cadastrado", t: "neutral" },
  incompleto: { label: "Incompleto", t: "warn" },
  aguardando_atributos: { label: "Aguardando atributos", t: "warn" },
  aguardando_operador: { label: "Aguardando operador", t: "warn" },
  pronto_enviar: { label: "Pronto p/ enviar", t: "brand" },
  enviado: { label: "Enviado", t: "info" },
  erro: { label: "Erro no envio", t: "bad" },
  ativo: { label: "Ativo no Catálogo", t: "ok" },
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

function Pill({ t, children }: { t: keyof typeof tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tone[t])}>
      {children}
    </span>
  );
}

const canalLabel: Record<string, string> = { aguardando: "Aguardando", verde: "Verde", amarelo: "Amarelo", vermelho: "Vermelho", cinza: "Cinza" };

// ---- Componente principal --------------------------------------------------

const abas = [
  { id: "resumo", label: "Resumo", icon: FileCheck2 },
  { id: "checklist", label: "Pré-DUIMP", icon: ListChecks },
  { id: "itens", label: "Itens", icon: Package },
  { id: "carga", label: "Carga", icon: Ship },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "tributos", label: "Tributos", icon: Coins },
  { id: "tratamento", label: "Trat. Adm. / LPCO", icon: ShieldAlert },
  { id: "diagnostico", label: "Diagnóstico", icon: Stethoscope },
  { id: "registro", label: "Registro", icon: BadgeCheck },
] as const;

type AbaId = (typeof abas)[number]["id"];

export function DuimpTab({ processoId }: { processoId: string }) {
  const toast = useToast();
  const duimp = useDuimp();
  const d = duimp.getDuimp(processoId);
  const [aba, setAba] = useState<AbaId>("resumo");
  const [ce, setCe] = useState("");
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);

  if (!d) return <p className="text-sm text-slate-400">DUIMP indisponível para este processo.</p>;

  const blocoByKey = (k: string) => d.blocos.find((b) => b.key === k);
  const bloqueiam = d.pendencias.filter((p) => p.gravidade === "bloqueia");

  return (
    <div className="space-y-6">
      {/* Sub-navegação */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin border-b border-slate-200">
        {abas.map((a) => {
          const Icon = a.icon;
          const active = aba === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition",
                active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {a.label}
            </button>
          );
        })}
      </div>

      {aba === "resumo" && <Resumo d={d} onVer={(k) => setAba(k)} />}
      {aba === "checklist" && <Checklist d={d} onVer={(k) => setAba(k)} />}

      {aba === "itens" && (
        <ItensView
          d={d}
          onAprovar={(n) => { duimp.aprovarItem(processoId, n); toast({ title: "Item aprovado", description: `Item ${n} pronto para a DUIMP.` }); }}
          onOperador={(opId, nome) => { duimp.cadastrarOperador(processoId, opId); toast({ title: "Operador enviado ao Catálogo", description: `${nome} ativado.` }); }}
          onCatalogo={(pid, nome) => { duimp.enviarCatalogo(processoId, pid); toast({ title: "Produto enviado ao Catálogo", description: `${nome} ativo no Catálogo.` }); }}
        />
      )}

      {aba === "carga" && (
        <CargaView
          d={d}
          ce={ce}
          setCe={setCe}
          onInformarCe={() => {
            if (!ce.trim()) return;
            duimp.informarCarga(processoId, { ceMercante: ce.trim() });
            setCe("");
            toast({ title: "CE Mercante informado", description: "Carga vinculada à DUIMP." });
          }}
        />
      )}

      {aba === "documentos" && (
        <DocumentosView d={d} onAprovar={(tipo) => { duimp.aprovarDoc(processoId, tipo); toast({ title: "Documento aprovado", description: tipo }); }} />
      )}

      {aba === "tributos" && (
        <TributosView d={d} onAprovar={() => { duimp.aprovarTributos(processoId); toast({ title: "Tributos revisados", description: "Cálculo estimado aprovado pelo usuário." }); }} />
      )}

      {aba === "tratamento" && (
        <TratamentoView d={d} onDeferir={(n) => { duimp.deferirLpco(processoId, n); toast({ title: "LPCO deferido", description: `Item ${n} liberado.` }); }} />
      )}

      {aba === "diagnostico" && (
        <DiagnosticoView
          d={d}
          loading={loadingDiag}
          onRodar={async () => {
            setLoadingDiag(true);
            toast({ title: "Diagnóstico solicitado", description: "Checando dados antes do registro…", tone: "info" });
            await duimp.solicitarDiagnostico(processoId);
            setLoadingDiag(false);
            toast({ title: "Diagnóstico retornado", description: "Veja erros e alertas." });
          }}
        />
      )}

      {aba === "registro" && (
        <RegistroView
          d={d}
          loading={loadingReg}
          bloqueiam={bloqueiam.length}
          onRegistrar={async () => {
            setLoadingReg(true);
            toast({ title: "Registro solicitado", description: "Enviando a DUIMP…", tone: "info" });
            const r = await duimp.registrar(processoId);
            setLoadingReg(false);
            if (r) toast({ title: "DUIMP registrada", description: `Número ${r.numero}.` });
          }}
        />
      )}
    </div>
  );
}

// ---- RESUMO ----------------------------------------------------------------

function Resumo({ d, onVer }: { d: Duimp; onVer: (k: AbaId) => void }) {
  const st = duimpStatusMap[d.status];
  const cardsBloco = [
    { key: "identificacao", aba: "checklist" as AbaId, label: "Identificação" },
    { key: "carga", aba: "carga" as AbaId, label: "Carga" },
    { key: "documentos", aba: "documentos" as AbaId, label: "Documentos" },
    { key: "itens", aba: "itens" as AbaId, label: "Itens" },
    { key: "tributos", aba: "tributos" as AbaId, label: "Tributos" },
    { key: "tratamento", aba: "tratamento" as AbaId, label: "Tratamento adm." },
    { key: "diagnostico", aba: "diagnostico" as AbaId, label: "Diagnóstico" },
    { key: "registro", aba: "registro" as AbaId, label: "Registro" },
  ];
  const docsAprov = d.documentos.filter((x) => x.status === "aprovado").length;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">DUIMP — {d.processoNumero}</h3>
              <Pill t={st.t}>{st.label}</Pill>
              {d.numero && <span className="text-xs text-slate-400">Nº {d.numero} · v{d.versao}</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Importador {d.importadorNome} · {d.importadorCnpj} · Ref. {d.referenciaInterna}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight text-brand-700">{d.prontidao}%</p>
            <p className="text-xs text-slate-400">prontidão da Pré-DUIMP</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${d.prontidao}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info label="Carga (BL/AWB)" value={d.carga.numeroBlAwb} />
          <Info label="CE Mercante / RUC" value={d.carga.ceMercante ?? d.carga.ruc ?? "pendente"} alerta={!d.carga.ceMercante && !d.carga.ruc} />
          <Info label="Itens" value={String(d.itens.length)} />
          <Info label="Documentos" value={`${docsAprov} de ${d.documentos.length} aprovados`} />
          <Info label="Canal" value={canalLabel[d.canal]} />
          <Info label="Total estimado" value={formatCurrency(d.tributos.totalEstimado)} />
          <Info label="Pendências críticas" value={String(d.pendencias.filter((p) => p.gravidade === "bloqueia" || p.gravidade === "alta").length)} alerta={d.pendencias.length > 0} />
          <Info label="Modo" value={d.modo} />
        </div>
      </Card>

      {/* Cards principais por bloco */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cardsBloco.map((c) => {
          const b = d.blocos.find((x) => x.key === c.key);
          const m = b ? blocoMap[b.status] : blocoMap.nao_iniciado;
          return (
            <button key={c.key} onClick={() => onVer(c.aba)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:shadow-card-hover">
              <p className="text-sm font-medium text-slate-800">{c.label}</p>
              <div className="mt-2"><Pill t={m.t}>{m.label}</Pill></div>
              {b && <p className="mt-2 text-xs text-slate-400">{b.preenchimento}% preenchido</p>}
            </button>
          );
        })}
      </div>

      {/* Próximas ações */}
      <Card>
        <CardHeader title="Próximas ações" icon={Sparkles} />
        <ul className="space-y-2 p-5">
          {d.proximasAcoes.length === 0 ? (
            <li className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Tudo certo — sem ações pendentes.</li>
          ) : (
            d.proximasAcoes.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {a}</li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}

function Info({ label, value, alerta }: { label: string; value: string; alerta?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={cn("mt-0.5 font-medium", alerta ? "text-amber-600" : "text-slate-800")}>{value}</p>
    </div>
  );
}

// ---- CHECKLIST -------------------------------------------------------------

function Checklist({ d, onVer }: { d: Duimp; onVer: (k: AbaId) => void }) {
  const abaPorBloco: Record<string, AbaId> = {
    identificacao: "resumo", carga: "carga", documentos: "documentos", itens: "itens",
    tributos: "tributos", tratamento: "tratamento", resumo: "resumo", diagnostico: "diagnostico", registro: "registro",
  };
  return (
    <Card>
      <CardHeader title="Pré-DUIMP — Checklist" subtitle="Tudo que precisa estar pronto antes de registrar" icon={ListChecks} />
      <div className="divide-y divide-slate-50">
        {d.blocos.map((b) => {
          const m = blocoMap[b.status];
          return (
            <div key={b.key} className="px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">{b.letra}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{b.titulo}</p>
                    <Pill t={m.t}>{m.label}</Pill>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full", b.status === "aprovado" ? "bg-emerald-500" : b.status === "com_divergencia" || b.status === "bloqueado" ? "bg-rose-400" : "bg-brand-500")} style={{ width: `${b.preenchimento}%` }} />
                  </div>
                </div>
                <button onClick={() => onVer(abaPorBloco[b.key] ?? "resumo")} className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Revisar</button>
              </div>
              {(b.faltantes.length > 0 || b.divergencias.length > 0) && (
                <div className="mt-2 space-y-1 pl-10">
                  {b.faltantes.map((f, i) => (
                    <p key={`f${i}`} className="flex items-center gap-1.5 text-xs text-amber-600"><Circle className="h-3 w-3" /> Falta: {f}</p>
                  ))}
                  {b.divergencias.map((dv, i) => (
                    <p key={`d${i}`} className="flex items-start gap-1.5 text-xs text-rose-600"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {dv}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- ITENS + CATÁLOGO + OPERADORES ----------------------------------------

function ItensView({
  d, onAprovar, onOperador, onCatalogo,
}: {
  d: Duimp;
  onAprovar: (n: number) => void;
  onOperador: (opId: string, nome: string) => void;
  onCatalogo: (produtoId: string, nome: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`Itens da DUIMP (${d.itens.length})`} subtitle="Cada item precisa estar pronto para o Catálogo e a DUIMP" icon={Package} />
        <div className="divide-y divide-slate-50">
          {d.itens.map((it) => {
            const m = itemMap[it.status];
            const faltaAtributo = it.atributos.filter((a) => !a.valor || a.valor.trim() === "");
            return (
              <div key={it.numero} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">Item {it.numero} · {it.descricaoComercial}</span>
                      <Pill t={m.t}>{m.label}</Pill>
                      {it.codigoCatalogo ? <Pill t="ok">Catálogo {it.codigoCatalogo}</Pill> : <Pill t="warn">Fora do Catálogo</Pill>}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">NCM {it.ncm} · {it.descricaoTecnica}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-slate-800">{formatCurrency(it.valorTotal)}</p>
                    <p className="text-xs text-slate-400">{it.qtdComercial} {it.unidadeComercial} · {it.paisOrigem}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
                  <Mini label="Fabricante" value={it.fabricante} />
                  <Mini label="Exportador" value={it.exportador} />
                  <Mini label="Peso líquido" value={it.pesoLiquido ? `${it.pesoLiquido} kg` : undefined} />
                </div>

                {/* Atributos obrigatórios */}
                <div className="mt-3">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Atributos obrigatórios da NCM</p>
                  <div className="flex flex-wrap gap-1.5">
                    {it.atributos.map((a) => (
                      <span key={a.nome} className={cn("rounded-md px-2 py-0.5 text-[11px] ring-1 ring-inset", a.valor ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20")}>
                        {a.nome}{a.valor ? `: ${a.valor}` : " (faltando)"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linguagem clara + ações */}
                {it.status !== "pronto_duimp" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50/60 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="flex-1 text-xs text-amber-800">
                      {it.status === "aguardando_operador"
                        ? `O produto ${it.numero} precisa de um operador estrangeiro cadastrado no Catálogo.`
                        : faltaAtributo.length
                        ? `O produto ${it.numero} ainda não tem todos os atributos exigidos para ir para a DUIMP.`
                        : `O produto ${it.numero} precisa ser enviado ao Catálogo.`}
                    </span>
                    {it.status === "aguardando_operador" && it.operadorId ? (
                      <button onClick={() => onOperador(it.operadorId!, it.fabricante ?? "Operador")} className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Cadastrar operador</button>
                    ) : (
                      <button onClick={() => onCatalogo(it.produtoId ?? it.codigoInterno, it.descricaoComercial)} className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Enviar ao Catálogo</button>
                    )}
                    <button onClick={() => onAprovar(it.numero)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Aprovar item</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Catálogo */}
      <Card>
        <CardHeader title="Catálogo de Produtos" subtitle="Status de cada produto no Catálogo (Portal Único)" icon={Boxes} />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2.5 text-left">Produto</th>
                <th className="px-4 py-2.5 text-left">NCM</th>
                <th className="px-4 py-2.5 text-left">Catálogo</th>
                <th className="px-4 py-2.5 text-center">Atributos</th>
                <th className="px-4 py-2.5 text-center">Operador</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {d.catalogo.map((c) => {
                const m = catalogoMap[c.status];
                return (
                  <tr key={c.produtoId}>
                    <td className="px-4 py-2.5 text-slate-700">{c.nome}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.ncm}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.codigoCatalogo ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center">{c.atributosOk ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <Circle className="mx-auto h-4 w-4 text-amber-400" />}</td>
                    <td className="px-4 py-2.5 text-center">{c.operadorOk ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" /> : <Circle className="mx-auto h-4 w-4 text-amber-400" />}</td>
                    <td className="px-4 py-2.5"><Pill t={m.t}>{m.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Operadores estrangeiros */}
      <Card>
        <CardHeader title="Operadores Estrangeiros" subtitle="Fabricante / exportador / vendedor vinculados aos itens" icon={Globe} />
        <div className="divide-y divide-slate-50">
          {d.operadores.map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-5 py-3">
              <Globe className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{o.nome}</p>
                <p className="text-xs text-slate-400">{o.tipo} · {o.pais}{o.cidade ? ` · ${o.cidade}` : ""}{o.relacao ? ` · ${o.relacao}` : ""}</p>
              </div>
              {o.statusCatalogo === "ativo" ? <Pill t="ok">Ativo {o.identificadorPortal ? `· ${o.identificadorPortal}` : ""}</Pill>
                : o.statusCatalogo === "pendente" ? <Pill t="warn">Pendente</Pill>
                : o.statusCatalogo === "enviado" ? <Pill t="info">Enviado</Pill>
                : <Pill t="neutral">Não cadastrado</Pill>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

// ---- CARGA -----------------------------------------------------------------

function CargaView({ d, ce, setCe, onInformarCe }: { d: Duimp; ce: string; setCe: (v: string) => void; onInformarCe: () => void }) {
  const c = d.carga;
  const precisaCe = c.modal === "maritimo" && !c.ceMercante;
  return (
    <div className="space-y-4">
      {precisaCe && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="flex-1 text-sm text-amber-800">Falta informar o <strong>CE Mercante</strong> para vincular a carga à DUIMP. Sem ele, o diagnóstico e o registro ficam bloqueados.</p>
          <div className="flex gap-2">
            <Input value={ce} onChange={(e) => setCe(e.target.value)} placeholder="Nº CE Mercante" className="w-48" />
            <button onClick={onInformarCe} className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">Informar</button>
          </div>
        </div>
      )}
      <Card>
        <CardHeader title="Carga" subtitle="Dados de transporte vinculados à DUIMP" icon={Ship} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
          <Field label="Modal" value={c.modal} />
          <Field label="Tipo de conhecimento" value={c.tipoConhecimento} />
          <Field label="BL / AWB" value={c.numeroBlAwb} />
          <Field label="CE Mercante" value={c.ceMercante} alerta={precisaCe} />
          <Field label="RUC" value={c.ruc} />
          <Field label="Recinto alfandegado" value={c.recinto} />
          <Field label="Origem" value={c.origem} />
          <Field label="Destino" value={c.destino} />
          <Field label="País de procedência" value={c.paisProcedencia} />
          <Field label="Navio / voo" value={c.navioVoo} />
          <Field label="Container" value={c.container} />
          <Field label="ETA" value={c.eta} />
          <Field label="Peso bruto" value={c.pesoBruto ? `${c.pesoBruto} kg` : undefined} />
          <Field label="Peso líquido" value={c.pesoLiquido ? `${c.pesoLiquido} kg` : undefined} />
          <Field label="Volumes" value={c.volumes ? String(c.volumes) : undefined} />
          <Field label="Incoterm" value={c.incoterm} />
          <Field label="Frete" value={c.frete ? `${c.moedaFrete ?? ""} ${c.frete.toLocaleString("pt-BR")}` : undefined} />
          <Field label="Seguro" value={c.seguro ? `${c.moedaSeguro ?? ""} ${c.seguro.toLocaleString("pt-BR")}` : undefined} />
          <Field label="Status da carga" value={c.statusCarga} />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, alerta }: { label: string; value?: string; alerta?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={cn("mt-0.5 text-sm font-medium", alerta ? "text-amber-600" : "text-slate-800")}>{value || "—"}</p>
    </div>
  );
}

// ---- DOCUMENTOS ------------------------------------------------------------

function DocumentosView({ d, onAprovar }: { d: Duimp; onAprovar: (tipo: string) => void }) {
  return (
    <Card>
      <CardHeader title="Documentos instrutivos da DUIMP" subtitle="Cada documento gera dados; precisa ser aprovado por um humano" icon={FileText} />
      <div className="divide-y divide-slate-50">
        {d.documentos.map((doc) => {
          const m = docMap[doc.status];
          return (
            <div key={doc.tipo} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">{doc.tipo}</p>
                  <Pill t={m.t}>{m.label}</Pill>
                  {doc.usarNaDuimp && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">usar na DUIMP</span>}
                </div>
                <p className="text-xs text-slate-400">{[doc.numero, doc.emissor, doc.data].filter(Boolean).join(" · ") || "—"}</p>
                {doc.pendencias.map((p, i) => (
                  <p key={i} className="mt-0.5 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle className="h-3 w-3" /> {p}</p>
                ))}
              </div>
              {doc.status !== "aprovado" && doc.status !== "recusado" && (
                <button onClick={() => onAprovar(doc.tipo)} className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Aprovar</button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- TRIBUTOS --------------------------------------------------------------

function TributosView({ d, onAprovar }: { d: Duimp; onAprovar: () => void }) {
  const t = d.tributos;
  const linhas: [string, number][] = [
    ["Valor da mercadoria", t.valorMercadoria], ["Frete", t.frete], ["Seguro", t.seguro],
    ["Valor aduaneiro", t.valorAduaneiro], ["Imposto de Importação (II)", t.ii], ["IPI", t.ipi],
    ["PIS-Importação", t.pis], ["COFINS-Importação", t.cofins], ["ICMS estimado", t.icmsEstimado], ["Taxa Siscomex", t.taxaSiscomex],
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-800">
          O cálculo ainda é <strong>estimado pelo sistema</strong>. O cálculo oficial só vem na consulta ao Portal Único.
          {t.totalOficial == null && " Cálculo oficial ainda não consultado."}
          {!t.aprovadoUsuario && " Tributos pendentes de validação fiscal."}
        </p>
      </div>
      <Card>
        <CardHeader title="Tributos e valores" subtitle={`Moeda ${t.moeda} · câmbio ${t.taxaCambio}`} icon={Coins} action={
          t.aprovadoUsuario ? <Pill t="ok">Revisado</Pill> :
          <button onClick={onAprovar} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">Aprovar estimativa</button>
        } />
        <div className="divide-y divide-slate-50">
          {linhas.map(([label, valor]) => (
            <div key={label} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-medium text-slate-800">{formatCurrency(valor)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-slate-50/60 px-5 py-3">
            <span className="text-sm font-semibold text-slate-700">Total estimado</span>
            <span className="text-base font-semibold text-slate-900">{formatCurrency(t.totalEstimado)}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-2.5 text-sm">
            <span className="text-slate-500">Total oficial (Portal Único)</span>
            <span className="text-slate-400">{t.totalOficial != null ? formatCurrency(t.totalOficial) : "não consultado"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---- TRATAMENTO ADMINISTRATIVO / LPCO -------------------------------------

function TratamentoView({ d, onDeferir }: { d: Duimp; onDeferir: (n: number) => void }) {
  return (
    <Card>
      <CardHeader title="Tratamento Administrativo / LPCO" subtitle="Anuências por item — itens com LPCO pendente bloqueiam o registro" icon={ShieldAlert} />
      <div className="divide-y divide-slate-50">
        {d.lpco.map((l) => {
          const m = lpcoMap[l.status];
          return (
            <div key={l.itemNumero} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              {l.bloqueia ? <Lock className="h-4 w-4 shrink-0 text-rose-500" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">Item {l.itemNumero} · NCM {l.ncm}</p>
                  <Pill t={m.t}>{m.label}</Pill>
                  {l.orgaoAnuente !== "—" && <span className="text-xs text-slate-400">Órgão: {l.orgaoAnuente}</span>}
                </div>
                {l.observacoes && <p className="mt-0.5 text-xs text-slate-500">{l.observacoes}</p>}
                {l.numeroLpco && <p className="mt-0.5 text-xs text-emerald-600">LPCO {l.numeroLpco} deferido.</p>}
              </div>
              {l.exigeLpco && l.status !== "deferido" && (
                <button onClick={() => onDeferir(l.itemNumero)} className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Vincular LPCO deferido</button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- DIAGNÓSTICO -----------------------------------------------------------

function DiagnosticoView({ d, loading, onRodar }: { d: Duimp; loading: boolean; onRodar: () => void }) {
  const diag = d.diagnostico;
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Diagnóstico da DUIMP</h3>
            <p className="text-xs text-slate-500">Checagem dos dados antes do registro (simulada no modo mock).</p>
            {diag.data && <p className="mt-1 text-xs text-slate-400">Solicitado em {diag.data} por {diag.usuario}</p>}
          </div>
          <button onClick={onRodar} disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
            {loading ? "Processando…" : diag.status === "nao_solicitado" ? "Rodar diagnóstico" : "Rodar novamente"}
          </button>
        </div>
      </Card>

      {diag.status !== "nao_solicitado" && (
        <Card className="p-5">
          {diag.erros.length === 0 && diag.alertas.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Diagnóstico retornado sem erros nem alertas. Pronto para registrar.</p>
          ) : (
            <div className="space-y-4">
              {diag.erros.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600"><AlertTriangle className="h-3.5 w-3.5" /> Erros impeditivos</p>
                  <ul className="space-y-1">
                    {diag.erros.map((e, i) => <li key={i} className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {e}</li>)}
                  </ul>
                </div>
              )}
              {diag.alertas.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600"><AlertTriangle className="h-3.5 w-3.5" /> Alertas (não impeditivos)</p>
                  <ul className="space-y-1">
                    {diag.alertas.map((a, i) => <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ---- REGISTRO + ACOMPANHAMENTO --------------------------------------------

function RegistroView({ d, loading, bloqueiam, onRegistrar }: { d: Duimp; loading: boolean; bloqueiam: number; onRegistrar: () => void }) {
  const registrada = !!d.registro.numero;
  const gates = [
    { label: "Blocos A–F aprovados", ok: d.blocos.slice(0, 6).every((b) => b.status === "aprovado" || b.status === "aguardando_aprovacao") },
    { label: "Diagnóstico sem erro impeditivo", ok: d.diagnostico.status === "sem_erro" || d.diagnostico.status === "com_alerta" },
    { label: "LPCO obrigatório resolvido", ok: !d.lpco.some((l) => l.exigeLpco && l.status !== "deferido") },
    { label: "Tributos revisados", ok: d.tributos.aprovadoUsuario },
    { label: "Sem pendências que bloqueiam", ok: bloqueiam === 0 },
  ];
  const podeRegistrar = gates.every((g) => g.ok);

  if (registrada) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-semibold text-slate-900">DUIMP {d.registro.numero}</h3>
                <Pill t="ok">Registrada · v{d.registro.versao}</Pill>
              </div>
              <p className="mt-1 text-xs text-slate-400">Registrada em {d.registro.dataRegistro} por {d.registro.usuario}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs text-slate-400">Canal</p>
              <p className="font-medium text-slate-800">{canalLabel[d.canal]}</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Acompanhamento" subtitle="Timeline do processo até o encerramento" icon={ListChecks} />
          <ol className="relative space-y-3 p-5">
            {d.eventos.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                {e.feito ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                <span className={cn("text-sm", e.feito ? "text-slate-700" : "text-slate-400")}>{e.titulo}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Registro da DUIMP" subtitle="Só liberado quando todas as travas estiverem resolvidas" icon={BadgeCheck} />
        <ul className="space-y-2 p-5">
          {gates.map((g) => (
            <li key={g.label} className="flex items-center gap-2 text-sm">
              {g.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-rose-400" />}
              <span className={g.ok ? "text-slate-700" : "text-rose-600"}>{g.label}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 p-5">
          <button
            onClick={onRegistrar}
            disabled={!podeRegistrar || loading}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
            {loading ? "Registrando…" : "Registrar DUIMP"}
          </button>
          {!podeRegistrar && <p className="mt-2 text-xs text-slate-400">Resolva as travas acima para liberar o registro. (Modo {d.modo})</p>}
        </div>
      </Card>
    </div>
  );
}
