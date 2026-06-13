import type { CargaSnapshot } from "@/types";

export const cargaSnapshots: CargaSnapshot[] = [
  {
    id: "snap-001",
    data: "2026-06-06",
    processoId: "imp-002",
    processoNumero: "IMP-002",
    empresaNome: "IGCD",
    bl: "BL-123456",
    statusAnterior: "Em trânsito",
    statusAtual: "Atracado em Itajaí",
    mudou: true,
    detalhe:
      "Navio Hapag Brasilia atracou no Porto de Itajaí às 04:12. Início de descarga previsto para hoje.",
    mudancas: [
      { campo: "Situação da carga", de: "Em trânsito", para: "Atracada / armazenada no recinto" },
      { campo: "Dt. Atracação (escala)", de: "prevista 08/06", para: "confirmada 06/06 04:12" },
      { campo: "Nº DI", de: "—", para: "26/0884512-7" },
      { campo: "Dt. Registro DI", de: "—", para: "07/06/2026" },
      { campo: "Canal", de: "—", para: "Amarelo", critico: true },
      { campo: "Posição atual", de: "Em trânsito marítimo", para: "Atracado — DI registrada, em parametrização" },
    ],
  },
  {
    id: "snap-002",
    data: "2026-06-06",
    processoId: "imp-005",
    processoNumero: "IMP-005",
    empresaNome: "Nordix",
    bl: "BL-334455",
    statusAnterior: "Canal amarelo",
    statusAtual: "Exigência fiscal aberta",
    mudou: true,
    detalhe:
      "Siscomex registrou exigência fiscal. Documentos complementares solicitados pela Receita.",
    mudancas: [
      { campo: "Situação da carga", de: "Em conferência (canal amarelo)", para: "Carga bloqueada — exigência fiscal", critico: true },
      { campo: "Bloqueio (cadeado)", de: "Sem bloqueio", para: "Cadeado vermelho — BLOQUEIO TOTAL", critico: true },
      { campo: "Motivo do bloqueio", de: "—", para: "Exigência fiscal: laudo técnico e certificado de origem" },
      { campo: "Risco financeiro", de: "—", para: "Demurrage a partir de 10/06 (R$ 1.860/dia)" },
    ],
  },
  {
    id: "snap-003",
    data: "2026-06-06",
    processoId: "imp-001",
    processoNumero: "IMP-001",
    empresaNome: "Eleven",
    bl: "BL-987654",
    statusAnterior: "Em trânsito",
    statusAtual: "Em trânsito",
    mudou: false,
    detalhe: "Sem alterações. ETA mantida para 14/06/2026 em Santos.",
  },
  {
    id: "snap-004",
    data: "2026-06-05",
    processoId: "imp-003",
    processoNumero: "IMP-003",
    empresaNome: "M&S",
    bl: "BL-456789",
    statusAnterior: "Em desembaraço",
    statusAtual: "Desembaraçado",
    mudou: true,
    detalhe:
      "Declaração de importação desembaraçada (canal verde). Liberação para retirada autorizada.",
    mudancas: [
      { campo: "Situação da carga", de: "Em desembaraço", para: "Desembaraçada — aguardando entrega" },
      { campo: "Canal", de: "Aguardando parametrização", para: "Verde" },
      { campo: "Dt. Desembaraço", de: "—", para: "02/06/2026" },
      { campo: "ICMS", de: "Declarado/Pendente", para: "Pago (R$ 12.000)" },
      { campo: "Próximo passo", de: "Acompanhar conferência", para: "Emitir NF de entrada e liberar retirada" },
    ],
  },
  {
    id: "snap-005",
    data: "2026-06-05",
    processoId: "imp-004",
    processoNumero: "IMP-004",
    empresaNome: "Eleven",
    bl: "BL-778899",
    statusAnterior: "Pré-embarque",
    statusAtual: "Pré-embarque",
    mudou: false,
    detalhe: "Aguardando confirmação de booking do fornecedor.",
  },
];

export const relatorioCargaIa = `Bom dia! Resumo das cargas em 06/06/2026:

• IGCD (BL-123456): atracou em Itajaí — iniciar agendamento de desembaraço.
• Nordix (BL-334455): exigência fiscal aberta no Siscomex — ação urgente, risco de demurrage.
• M&S (BL-456789): desembaraçado ontem — liberar retirada e emitir NF de entrada.
• Eleven (BL-987654): em trânsito, ETA 14/06 mantida.

2 mudanças relevantes desde ontem. Prioridade: resolver a exigência fiscal da Nordix.`;
