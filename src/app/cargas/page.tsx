"use client";

import { useMemo, useState } from "react";
import {
  RefreshCw,
  Send,
  Container,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  MessageSquare,
  Building2,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { AICard } from "@/components/ui/AICard";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { PrimaryButton, GhostButton } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { cargaSnapshots, relatorioCargaIa } from "@/data/cargas";
import { formatDate, cn } from "@/lib/utils";
import type { CargaSnapshot } from "@/types";

// ---------------------------------------------------------------------------

function buildMensagem(snaps: CargaSnapshot[], porEmpresa: boolean): { titulo: string; corpo: string }[] {
  const header = (nome?: string) =>
    `📦 Atualização de cargas — ${formatDate("2026-06-06")}${nome ? `\n🏢 ${nome}` : ""}`;

  const bloco = (s: CargaSnapshot) => {
    const linhas = [
      `• ${s.processoNumero} (${s.bl}): ${s.statusAnterior} → ${s.statusAtual}`,
      ...(s.mudancas ?? []).map(
        (m) => `   ${m.critico ? "⚠️ " : "– "}${m.campo}: ${m.de} → ${m.para}`
      ),
    ];
    return linhas.join("\n");
  };

  if (!porEmpresa) {
    return [
      {
        titulo: "Mensagem única (grupo interno)",
        corpo: [header(), "", ...snaps.map(bloco)].join("\n"),
      },
    ];
  }

  const map = new Map<string, CargaSnapshot[]>();
  for (const s of snaps) {
    if (!map.has(s.empresaNome)) map.set(s.empresaNome, []);
    map.get(s.empresaNome)!.push(s);
  }
  return Array.from(map.entries()).map(([empresa, list]) => ({
    titulo: `Grupo ${empresa}`,
    corpo: [header(empresa), "", ...list.map(bloco)].join("\n"),
  }));
}

// ---------------------------------------------------------------------------

export default function CargasPage() {
  const toast = useToast();
  const [consultando, setConsultando] = useState(false);
  const mudancas = cargaSnapshots.filter((s) => s.mudou);
  const datas = Array.from(new Set(cargaSnapshots.map((s) => s.data)));

  // Seleção de mudanças para envio (padrão: todas as que mudaram)
  const [selecionados, setSelecionados] = useState<string[]>(mudancas.map((s) => s.id));
  const [envioOpen, setEnvioOpen] = useState(false);
  const [porEmpresa, setPorEmpresa] = useState(true);

  const toggleSel = (id: string) =>
    setSelecionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const snapsSelecionados = useMemo(
    () => mudancas.filter((s) => selecionados.includes(s.id)),
    [selecionados, mudancas]
  );

  const mensagens = useMemo(
    () => buildMensagem(snapsSelecionados, porEmpresa),
    [snapsSelecionados, porEmpresa]
  );

  const copiar = (texto: string, titulo: string) => {
    navigator.clipboard?.writeText(texto).catch(() => {});
    toast({ title: "Copiado", description: `${titulo} copiado para a área de transferência.`, tone: "info" });
  };

  const handleConsultar = () => {
    if (consultando) return;
    setConsultando(true);
    toast({
      title: "Consultando Siscomex / Siscarga…",
      description: "Coletando atualizações dos CNPJs monitorados.",
      tone: "info",
    });
    setTimeout(() => {
      setConsultando(false);
      toast({
        title: "Consulta concluída",
        description: `${mudancas.length} mudança(s) detectada(s) desde a última consulta.`,
      });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atualizações de carga"
        description="Comparação ontem × hoje campo a campo · selecione o que enviar ao grupo"
        action={
          <button
            onClick={handleConsultar}
            disabled={consultando}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", consultando && "animate-spin")} />
            {consultando ? "Consultando…" : "Consultar agora"}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="CNPJs monitorados" value={4} icon={Container} tone="brand" />
        <StatCard label="Cargas acompanhadas" value={cargaSnapshots.length} icon={Container} tone="sky" />
        <StatCard label="Mudanças detectadas" value={mudancas.length} icon={ArrowRight} tone="violet" />
        <StatCard label="Última consulta" value="06/06" icon={Calendar} tone="slate" hint="06:00" />
      </div>

      <AICard
        title="Relatório automático de cargas"
        action={
          <button
            onClick={() => setEnvioOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
          >
            <Send className="h-3.5 w-3.5" /> Montar envio ao grupo
          </button>
        }
      >
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600">{relatorioCargaIa}</pre>
      </AICard>

      {/* Barra de seleção */}
      <div className="flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <ListChecks className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-brand-800">
              {selecionados.length} de {mudancas.length} mudança(s) selecionada(s) para envio
            </p>
            <p className="text-xs text-brand-600">
              Marque/desmarque nos cards abaixo · a mensagem é separada por empresa/cliente
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() =>
              setSelecionados(selecionados.length === mudancas.length ? [] : mudancas.map((s) => s.id))
            }
            className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
          >
            {selecionados.length === mudancas.length ? "Desmarcar todas" : "Selecionar todas"}
          </button>
          <button
            onClick={() => setEnvioOpen(true)}
            disabled={selecionados.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Enviar seleção ao grupo
          </button>
        </div>
      </div>

      {/* Snapshots com diff detalhado */}
      <div className="space-y-5">
        {datas.map((data) => (
          <div key={data}>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Snapshot {formatDate(data)}</h2>
            </div>
            <div className="space-y-3">
              {cargaSnapshots
                .filter((s) => s.data === data)
                .map((s) => {
                  const sel = selecionados.includes(s.id);
                  const criticas = s.mudancas?.filter((m) => m.critico).length ?? 0;
                  return (
                    <Card key={s.id} className={cn(s.mudou && (sel ? "border-brand-300 ring-1 ring-brand-100" : "border-brand-200"))}>
                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          {s.mudou && (
                            <input
                              type="checkbox"
                              checked={sel}
                              onChange={() => toggleSel(s.id)}
                              className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-200"
                              title="Incluir no envio ao grupo"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{s.processoNumero}</span>
                              <span className="text-xs text-slate-400">{s.empresaNome} · {s.bl}</span>
                              {s.mudou && (
                                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                                  {s.mudancas?.length ?? 0} campo(s) mudaram
                                </span>
                              )}
                              {criticas > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                                  <AlertTriangle className="h-3 w-3" /> {criticas} crítica(s)
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{s.detalhe}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-500">{s.statusAnterior}</span>
                          <ArrowRight className={cn("h-4 w-4", s.mudou ? "text-brand-500" : "text-slate-300")} />
                          <span className={cn("rounded-md px-2 py-1 font-medium", s.mudou ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500")}>
                            {s.statusAtual}
                          </span>
                        </div>
                      </div>

                      {/* Diff campo a campo */}
                      {s.mudou && s.mudancas && s.mudancas.length > 0 && (
                        <div className="border-t border-slate-100">
                          <div className="hidden grid-cols-12 gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
                            <span className="col-span-4">O que mudou</span>
                            <span className="col-span-4">Ontem</span>
                            <span className="col-span-4">Hoje</span>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {s.mudancas.map((m, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "grid grid-cols-1 gap-1 px-4 py-2 sm:grid-cols-12 sm:gap-2",
                                  m.critico && "bg-rose-50/50"
                                )}
                              >
                                <span className={cn("col-span-4 flex items-center gap-1.5 text-xs font-medium", m.critico ? "text-rose-700" : "text-slate-700")}>
                                  {m.critico && <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />}
                                  {m.campo}
                                </span>
                                <span className="col-span-4 text-xs text-slate-400 line-through decoration-slate-300">{m.de}</span>
                                <span className={cn("col-span-4 text-xs font-medium", m.critico ? "text-rose-700" : "text-emerald-700")}>
                                  {m.para}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: montar envio ao grupo */}
      <Modal
        open={envioOpen}
        onClose={() => setEnvioOpen(false)}
        title="Enviar mudanças ao grupo"
        description={`${snapsSelecionados.length} mudança(s) selecionada(s)`}
        icon={MessageSquare}
        footer={
          <>
            <GhostButton type="button" onClick={() => setEnvioOpen(false)}>
              Cancelar
            </GhostButton>
            <PrimaryButton
              type="button"
              disabled={snapsSelecionados.length === 0}
              onClick={() => {
                setEnvioOpen(false);
                toast({
                  title: porEmpresa ? `${mensagens.length} mensagem(ns) enviada(s)` : "Mensagem enviada",
                  description: porEmpresa
                    ? `Atualizações publicadas nos grupos: ${mensagens.map((m) => m.titulo.replace("Grupo ", "")).join(", ")}.`
                    : "Atualização publicada no grupo interno.",
                });
              }}
            >
              <Send className="h-4 w-4" />
              {porEmpresa ? `Enviar ${mensagens.length} mensagem(ns)` : "Enviar ao grupo"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          {/* Como separar */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Como separar as mensagens</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: true, label: "Por empresa/cliente", sub: "1 mensagem para cada grupo", icon: Building2 },
                  { id: false, label: "Mensagem única", sub: "tudo no grupo interno", icon: MessageSquare },
                ] as const
              ).map((m) => (
                <button
                  key={String(m.id)}
                  type="button"
                  onClick={() => setPorEmpresa(m.id)}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-left transition",
                    porEmpresa === m.id ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-100" : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <m.icon className={cn("mt-0.5 h-4 w-4", porEmpresa === m.id ? "text-brand-600" : "text-slate-400")} />
                  <span>
                    <span className={cn("block text-sm font-medium", porEmpresa === m.id ? "text-brand-700" : "text-slate-700")}>{m.label}</span>
                    <span className="block text-[11px] text-slate-400">{m.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prévia das mensagens */}
          {snapsSelecionados.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
              Nenhuma mudança selecionada. Marque os cards na tela de cargas.
            </p>
          ) : (
            mensagens.map((msg) => (
              <div key={msg.titulo} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> {msg.titulo}
                  </span>
                  <button
                    onClick={() => copiar(msg.corpo, msg.titulo)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-brand-600 transition hover:bg-brand-50"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </button>
                </div>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap px-4 py-3 font-sans text-xs leading-relaxed text-slate-600 scrollbar-thin">
                  {msg.corpo}
                </pre>
              </div>
            ))
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Na integração real, cada mensagem vai para o grupo de WhatsApp da empresa correspondente.
          </p>
        </div>
      </Modal>
    </div>
  );
}
