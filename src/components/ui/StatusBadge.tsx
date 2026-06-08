import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "red" | "blue" | "slate" | "violet";

const toneClasses: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

// Maps every domain status string to a human label + tone.
const statusMap: Record<string, { label: string; tone: Tone }> = {
  // Processo
  em_andamento: { label: "Em andamento", tone: "blue" },
  aguardando_documento: { label: "Aguardando documento", tone: "amber" },
  em_transito: { label: "Em trânsito", tone: "blue" },
  atracado: { label: "Atracado", tone: "violet" },
  desembaracado: { label: "Desembaraçado", tone: "green" },
  concluido: { label: "Concluído", tone: "green" },
  atrasado: { label: "Atrasado", tone: "red" },
  // Empresa
  ativa: { label: "Ativa", tone: "green" },
  inativa: { label: "Inativa", tone: "slate" },
  pendente: { label: "Pendente", tone: "amber" },
  // Documento
  validado: { label: "Validado", tone: "green" },
  em_analise: { label: "Em análise", tone: "blue" },
  inconsistencia: { label: "Inconsistência", tone: "red" },
  // Boleto
  criado: { label: "Criado", tone: "slate" },
  enviado: { label: "Enviado", tone: "blue" },
  aguardando_pagamento: { label: "Aguardando", tone: "amber" },
  vencendo: { label: "Vencendo", tone: "amber" },
  vencido: { label: "Vencido", tone: "red" },
  pago: { label: "Pago", tone: "green" },
  cancelado: { label: "Cancelado", tone: "slate" },
  renegociado: { label: "Renegociado", tone: "violet" },
  // Conta a pagar
  em_aberto: { label: "Em aberto", tone: "amber" },
  paga: { label: "Paga", tone: "green" },
  vencida: { label: "Vencida", tone: "red" },
  agendada: { label: "Agendada", tone: "blue" },
  // Nota fiscal
  aguardando_emissao: { label: "Aguardando emissão", tone: "amber" },
  emitida: { label: "Emitida", tone: "green" },
  com_erro: { label: "Com erro", tone: "red" },
  // Certificado
  valido: { label: "Válido", tone: "green" },
  // IRPF
  em_dia: { label: "Em dia", tone: "green" },
  em_elaboracao: { label: "Em elaboração", tone: "blue" },
  // Integrações
  conectado: { label: "Conectado", tone: "green" },
  nao_configurado: { label: "Não configurado", tone: "slate" },
  // Radar
  habilitado: { label: "Habilitado", tone: "green" },
  em_habilitacao: { label: "Em habilitação", tone: "blue" },
  revisao: { label: "Em revisão", tone: "amber" },
  suspenso: { label: "Suspenso", tone: "red" },
  recebido: { label: "Recebido", tone: "blue" },
  // Severity / alerta
  critico: { label: "Crítico", tone: "red" },
  atencao: { label: "Atenção", tone: "amber" },
  informativo: { label: "Informativo", tone: "blue" },
  resolvido: { label: "Resolvido", tone: "green" },
  aberto: { label: "Aberto", tone: "amber" },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const config = statusMap[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[config.tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? config.label}
    </span>
  );
}
