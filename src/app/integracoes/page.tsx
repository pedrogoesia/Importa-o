"use client";

import { useState } from "react";
import {
  Database,
  ExternalLink,
  KeyRound,
  Layers,
  AlertTriangle,
  GitBranch,
  ChevronDown,
  Webhook,
  Braces,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { AICard } from "@/components/ui/AICard";
import {
  fontesDados,
  fontesOficiais,
  autenticacao,
  fasesImplementacao,
  naoPrometer,
  logicaStatus,
  situacoesDuimp,
} from "@/data/integracao";
import { cn } from "@/lib/utils";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-100 scrollbar-thin">
      {children}
    </pre>
  );
}

export default function IntegracoesPage() {
  const [aberto, setAberto] = useState<string | null>(null);
  const campos = Object.values(fontesDados);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa de integrações"
        description="Guia para o desenvolvedor: de onde vem cada dado do processo (APIs, endpoints, campos e regras)"
      />

      <AICard title="Como usar este mapa">
        Esta plataforma é a <strong>base visual</strong> do produto. Cada campo exibido no processo tem um ícone{" "}
        <Database className="inline h-3.5 w-3.5 text-brand-600" /> — ao clicar, abre o detalhe de{" "}
        <strong>qual API consultar, endpoint, campo do JSON e regra de negócio</strong>. Abaixo está o guia completo:
        fontes oficiais, autenticação, mapeamento campo a campo, lógica de status e ordem de implementação.
      </AICard>

      {/* Fontes oficiais */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Database className="h-4 w-4 text-slate-400" /> Fontes oficiais de dados
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {fontesOficiais.map((f) => (
            <Card key={f.nome} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{f.nome}</h3>
                {f.docs && (
                  <a
                    href={f.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Docs <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{f.uso}</p>
              <div className="mt-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  O dev deve procurar por
                </p>
                <Code>{f.procurarPor.join("\n")}</Code>
              </div>
              {"docsExtra" in f && f.docsExtra && (
                <a
                  href={f.docsExtra as string}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                >
                  Documentação de eventos DUIMP <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {"obs" in f && f.obs && <p className="mt-2 text-xs text-amber-600">{f.obs as string}</p>}
            </Card>
          ))}
        </div>
      </div>

      {/* Autenticação */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <KeyRound className="h-4 w-4 text-slate-400" /> Autenticação necessária
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">{autenticacao.serpro.titulo}</h3>
            <p className="mt-1 text-xs text-slate-500">{autenticacao.serpro.requisito}</p>
            <ol className="mt-3 space-y-1.5">
              {autenticacao.serpro.passos.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
            <p className="mb-1 mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">Headers esperados</p>
            <Code>{autenticacao.serpro.headers}</Code>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">{autenticacao.portalUnico.titulo}</h3>
            <ol className="mt-3 space-y-1.5">
              {autenticacao.portalUnico.passos.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
            <p className="mb-1 mt-3 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <Webhook className="h-3 w-3" /> Eventos mínimos para assinar
            </p>
            <Code>{autenticacao.portalUnico.eventos.join("\n")}</Code>
          </Card>
        </div>
      </div>

      {/* Campo a campo */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Braces className="h-4 w-4 text-slate-400" /> Mapeamento campo a campo ({campos.length} campos)
        </h2>
        <div className="space-y-2">
          {campos.map((c) => {
            const open = aberto === c.key;
            return (
              <Card key={c.key}>
                <button
                  onClick={() => setAberto(open ? null : c.key)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                >
                  <Database className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="flex-1 text-sm font-medium text-slate-800">{c.label}</span>
                  <span className="hidden max-w-[40%] truncate text-xs text-slate-400 sm:block">{c.fonte}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-700">Fonte:</strong> {c.fonte}
                    </p>
                    {c.endpoints && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Endpoint(s)</p>
                        <Code>{c.endpoints.join("\n")}</Code>
                      </div>
                    )}
                    {c.eventos && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Eventos push</p>
                        <Code>{c.eventos.join("\n")}</Code>
                      </div>
                    )}
                    {c.camposJson && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Campos no JSON</p>
                        <Code>{c.camposJson.join("\n")}</Code>
                      </div>
                    )}
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Regra</p>
                      <Code>{c.regra}</Code>
                    </div>
                    {c.observacao && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <p className="text-xs leading-relaxed text-amber-800">{c.observacao}</p>
                      </div>
                    )}
                    {c.docsUrl && (
                      <a
                        href={c.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Abrir documentação oficial <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lógica de status */}
      <Card>
        <CardHeader
          title="Lógica de status automático"
          subtitle="calcularStatusProcesso(processo) + gerarResumoAutomatico(processo)"
          icon={GitBranch}
        />
        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
          <span className="col-span-5">Condição</span>
          <span className="col-span-3">Status</span>
          <span className="col-span-4">Resumo gerado</span>
        </div>
        <div className="divide-y divide-slate-50">
          {logicaStatus.map((l, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-12">
              <code className="col-span-5 font-mono text-xs text-slate-600">{l.cond}</code>
              <span className="col-span-3">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700">
                  {l.status}
                </span>
              </span>
              <span className="col-span-4 text-xs italic text-slate-500">“{l.resumo}”</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            <MessageSquare className="h-3 w-3" /> Situações DUIMP relevantes
          </p>
          <Code>{situacoesDuimp.join("\n")}</Code>
        </div>
      </Card>

      {/* Fases */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Layers className="h-4 w-4 text-slate-400" /> Ordem de implementação
        </h2>
        <div className="space-y-3">
          {fasesImplementacao.map((fase, i) => (
            <Card key={i} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{fase.fase}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{fase.objetivo}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fase.itens.map((it) => (
                    <span key={it} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* O que não prometer */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> O que NÃO prometer 100% automático ainda
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {naoPrometer.map((n) => (
            <Card key={n.titulo} className="border-amber-200 p-5">
              <h3 className="text-sm font-semibold text-amber-800">{n.titulo}</h3>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Motivo:</strong> {n.motivo}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Fallback:</strong> {n.fallback}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Checklist final */}
      <Card>
        <CardHeader title="Pontos críticos para o dev não errar" icon={ListChecks} />
        <ul className="space-y-2.5 p-5">
          {[
            "A API de Carga consulta o conhecimento por GET /conhecimentos-embarque/{nr} e os itens por GET /conhecimentos-embarque/{nr-ce}/itens/ — a resposta já traz BL, CE, situação, bloqueios, mercadoria, documento de despacho e manifesto.",
            "Para DI, o endpoint é GET /declaracao-importacao/{numero}: lá ficam canalSelecaoParametrizada, dataHoraRegistro, dataHoraDesembaraco, dadosGerais.numeroDI e o bloco icms[]. Adições em GET /declaracao-importacao/{numeroDI}/adicoes/{numeroAdicao}.",
            "Para DUIMP, o canal NÃO vem do Serpro/DI — vem do Portal Único pelo evento dimp-situacao-import (identificacao.numero, versao, niImportador, situacaoDuimp, dataEvento, canal). ICMS pelo evento dimp-icms-import.",
            "A chave segura de consulta da Carga é o CE-Mercante, não o BL comercial. Não cravar busca automática por CNPJ sem validar contrato com o Serpro.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
