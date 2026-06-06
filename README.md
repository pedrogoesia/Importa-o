# Importa.AI — Sistema Operacional de IA para Importadoras

Base visual e estrutural (front-end navegável) de um ERP moderno com IA para
importadoras. Foco em arquitetura limpa e escalável, pronto para conectar a
APIs, banco de dados, Siscomex/Siscarga, Open Finance, emissão de boletos,
emissão de NF-e e agentes de IA. **Todos os dados são mockados.**

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **lucide-react** (ícones)
- Componentização limpa e responsiva

## Como rodar

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## Estrutura

```
src/
├── app/                    # Rotas (App Router)
│   ├── page.tsx            # Dashboard geral
│   ├── empresas/           # Lista + detalhe [id]
│   ├── processos/          # Lista + detalhe [id] com abas
│   ├── documentos/         # Documentos + análise da IA
│   ├── cargas/             # Siscomex/Siscarga (snapshots)
│   ├── financeiro/         # Geral, por empresa, por processo, fechamento
│   ├── boletos/            # Gestão de boletos
│   ├── fiscal/             # Notas fiscais
│   ├── radar/              # RADAR + IRPF
│   ├── certificados/       # Certificados digitais
│   ├── relatorios/         # Relatórios + alertas
│   ├── ia/                 # Central de IA (copiloto)
│   └── configuracoes/      # Integrações e equipe
├── components/
│   ├── layout/             # AppLayout, Sidebar, Topbar, MobileNav
│   ├── ui/                 # StatCard, StatusBadge, DataTable, ProcessCard,
│   │                       # AlertCard, AICard, Timeline, DocumentCard,
│   │                       # FinancialSummary, EmptyState, FilterBar, Card, Tabs
│   └── processo/           # ProcessoDetail (view com abas)
├── data/                   # Mocks centralizados (empresas, processos, etc.)
├── types/                  # Tipos TypeScript do domínio
└── lib/                    # utils + configuração de navegação
```

## Lógica central

`Empresa/CNPJ → Processo de importação → Documentos → Atualizações de carga →
Financeiro → Fiscal → Relatórios e alertas.` Tudo nasce de um processo de
importação, identificado pelo número do BL/conhecimento de embarque.

## Camada de IA

A IA aparece como uma camada transversal: card "Inteligência Operacional" no
dashboard, análise automática de documentos, resumo/risco por processo (aba IA),
relatório diário de cargas e a "Central de IA" (copiloto operacional em chat).
As respostas são simuladas com mocks.

## Próximos passos (backend)

Integrações previstas e já sinalizadas na tela de Configurações: Siscomex/
Siscarga, Open Finance, emissão de boletos, emissão de NF-e de entrada,
WhatsApp/grupo interno e agentes de IA.
