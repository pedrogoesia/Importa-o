"use client";

import {
  FileText,
  Sparkles,
  AlertTriangle,
  Download,
} from "lucide-react";
import type { Documento } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { useToast } from "./Toast";
import { formatDate } from "@/lib/utils";

export function DocumentCard({ documento }: { documento: Documento }) {
  const toast = useToast();
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {documento.nome}
            </p>
            <StatusBadge status={documento.status} />
          </div>
          <p className="text-xs text-slate-400">
            {documento.tipo} · {documento.tamanho} ·{" "}
            {formatDate(documento.enviadoEm)}
          </p>
          {documento.processoNumero && (
            <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {documento.processoNumero}
            </span>
          )}
        </div>
      </div>

      {/* Simulated AI analysis layer */}
      <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/50 p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-[11px] font-semibold text-brand-700">
            Análise da IA
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {documento.aiResumo}
        </p>
        {documento.aiCampos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {documento.aiCampos.map((c) => (
              <span
                key={c.label}
                className="rounded-md bg-white px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200"
              >
                <span className="text-slate-400">{c.label}:</span> {c.valor}
              </span>
            ))}
          </div>
        )}
        {documento.aiInconsistencias.map((inc, i) => (
          <div
            key={i}
            className="mt-2 flex items-start gap-1.5 text-[11px] text-rose-600"
          >
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            {inc}
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          toast({
            title: "Download iniciado",
            description: `${documento.nome} está sendo baixado.`,
            tone: "info",
          })
        }
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
      >
        <Download className="h-3.5 w-3.5" />
        Baixar documento
      </button>
    </div>
  );
}
