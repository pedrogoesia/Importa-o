"use client";

import { Database, ExternalLink, Webhook, AlertTriangle, Braces, GitBranch } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { GhostButton } from "@/components/ui/Form";
import type { FonteDado } from "@/data/integracao";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-100 scrollbar-thin">
      {children}
    </pre>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Database; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {children}
    </div>
  );
}

export function FonteDadoModal({
  fonte,
  onClose,
}: {
  fonte: FonteDado | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!fonte}
      onClose={onClose}
      title={fonte ? `Onde buscar: ${fonte.label}` : ""}
      description="Mapa de integração para o desenvolvedor"
      icon={Database}
      footer={
        <>
          {fonte?.docsUrl && (
            <a
              href={fonte.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" /> Abrir documentação oficial
            </a>
          )}
          <GhostButton type="button" onClick={onClose}>
            Fechar
          </GhostButton>
        </>
      }
    >
      {fonte && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3">
            <Database className="h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs text-brand-500">Fonte</p>
              <p className="text-sm font-semibold text-brand-800">{fonte.fonte}</p>
            </div>
          </div>

          {fonte.endpoints && fonte.endpoints.length > 0 && (
            <Section icon={Braces} title="Endpoint(s)">
              <Code>{fonte.endpoints.join("\n")}</Code>
            </Section>
          )}

          {fonte.eventos && fonte.eventos.length > 0 && (
            <Section icon={Webhook} title="Eventos push (webhook)">
              <Code>{fonte.eventos.join("\n")}</Code>
            </Section>
          )}

          {fonte.camposJson && fonte.camposJson.length > 0 && (
            <Section icon={Braces} title="Campos no JSON">
              <Code>{fonte.camposJson.join("\n")}</Code>
            </Section>
          )}

          <Section icon={GitBranch} title="Regra">
            <Code>{fonte.regra}</Code>
          </Section>

          {fonte.observacao && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-800">{fonte.observacao}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
