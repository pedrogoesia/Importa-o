import {
  Plug,
  Building2,
  Bell,
  Users,
  Database,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";

const integracoes = [
  { nome: "Siscomex / Siscarga", desc: "Consulta automática de cargas", status: "planejado" },
  { nome: "Open Finance", desc: "Conexão de contas bancárias e conciliação", status: "planejado" },
  { nome: "Emissão de boletos", desc: "Integração bancária para cobrança", status: "planejado" },
  { nome: "Emissão de NF-e de entrada", desc: "API fiscal para notas de importação", status: "planejado" },
  { nome: "WhatsApp / Grupo interno", desc: "Envio de relatórios e alertas", status: "planejado" },
  { nome: "Agentes de IA", desc: "Copiloto operacional e análise de documentos", status: "ativo" },
];

const sections = [
  { icon: Building2, title: "Dados da organização", desc: "Nome, CNPJ da assessoria e equipe" },
  { icon: Users, title: "Usuários e permissões", desc: "ADMs, despachantes e níveis de acesso" },
  { icon: Bell, title: "Alertas e notificações", desc: "Regras de prazo, vencimento e cargas" },
  { icon: Database, title: "Importar dados", desc: "Migração de planilhas (BOOK MODELO.xlsx)" },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Integrações, equipe e preferências do sistema"
      />

      <Card>
        <CardHeader title="Integrações" subtitle="Conexões com sistemas externos" icon={Plug} />
        <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
          {integracoes.map((i) => (
            <div key={i.nome} className="flex items-center justify-between bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                {i.nome.includes("IA") ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Plug className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{i.nome}</p>
                  <p className="text-xs text-slate-400">{i.desc}</p>
                </div>
              </div>
              {i.status === "ativo" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Circle className="h-3.5 w-3.5" /> Planejado
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="flex items-center gap-4 p-5 transition hover:shadow-card-hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
