"use client";

import { Landmark, Receipt, FileText, Cable } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Empresa, IntegracaoStatus } from "@/types";

const actionLabel: Record<IntegracaoStatus, string> = {
  conectado: "Gerenciar",
  pendente: "Concluir",
  nao_configurado: "Conectar",
};

function Linha({
  icon: Icon,
  titulo,
  descricao,
  status,
  onAction,
}: {
  icon: typeof Landmark;
  titulo: string;
  descricao: string;
  status: IntegracaoStatus;
  onAction: () => void;
}) {
  const isPrimary = status !== "conectado";
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{titulo}</p>
        <p className="truncate text-xs text-slate-400">{descricao}</p>
      </div>
      <StatusBadge status={status} />
      <button
        onClick={onAction}
        className={cn(
          "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition",
          isPrimary
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        {actionLabel[status]}
      </button>
    </div>
  );
}

export function IntegracoesCard({ empresa }: { empresa: Empresa }) {
  const toast = useToast();
  const integ = empresa.integracoes;

  if (!integ) {
    return (
      <Card>
        <CardHeader title="Integrações" icon={Cable} />
        <p className="p-5 text-sm text-slate-400">
          Nenhuma integração configurada para esta empresa.
        </p>
      </Card>
    );
  }

  const fire = (nome: string, status: IntegracaoStatus) =>
    toast({
      title:
        status === "conectado"
          ? `${nome} — gerenciar conexão`
          : status === "pendente"
          ? `${nome} — concluir configuração`
          : `${nome} — iniciar conexão`,
      description: `${empresa.nomeFantasia} · ${empresa.cnpj}`,
      tone: status === "conectado" ? "info" : "warning",
    });

  return (
    <Card>
      <CardHeader
        title="Integrações"
        subtitle="Open Finance, boleto e NF-e por CNPJ"
        icon={Cable}
      />
      <div className="divide-y divide-slate-50">
        <Linha
          icon={Landmark}
          titulo="Open Finance"
          descricao={integ.banco ? `Banco ${integ.banco}` : "Conecte a conta bancária"}
          status={integ.openFinance}
          onAction={() => fire("Open Finance", integ.openFinance)}
        />
        <Linha
          icon={Receipt}
          titulo="Emissão de boleto"
          descricao={integ.convenioBoleto ?? "Configure o convênio bancário"}
          status={integ.boleto}
          onAction={() => fire("Emissão de boleto", integ.boleto)}
        />
        <Linha
          icon={FileText}
          titulo="Emissão de NF-e"
          descricao="Nota fiscal de entrada via API"
          status={integ.nfe}
          onAction={() => fire("Emissão de NF-e", integ.nfe)}
        />
      </div>
    </Card>
  );
}
