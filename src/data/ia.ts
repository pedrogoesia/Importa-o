export interface SugestaoIa {
  pergunta: string;
  resposta: string;
}

export const perguntasRapidas: string[] = [
  "Quais processos precisam de atenção hoje?",
  "Quais boletos estão vencidos?",
  "Quais empresas estão com certificado vencendo?",
  "Gere um resumo do fechamento mensal.",
  "Quais documentos faltam no processo BL-987654?",
  "O que mudou nas cargas desde ontem?",
];

export const respostasIa: SugestaoIa[] = [
  {
    pergunta: "Quais processos precisam de atenção hoje?",
    resposta:
      "Identifiquei 2 processos críticos:\n\n• IMP-005 (Nordix) — exigência fiscal aberta no Siscomex, container parado há 7 dias. Risco de demurrage.\n• IMP-003 (M&S) — desembaraçado, mas com NF de entrada e boleto vencido pendentes.\n\nOutros 2 processos em atenção: IMP-001 (divergência de peso no BL) e IMP-004 (invoice e packing list não recebidos).",
  },
  {
    pergunta: "Quais boletos estão vencidos?",
    resposta:
      "1 boleto vencido:\n\n• M&S Comercial — R$ 31.200, vencido em 30/05/2026 (7 dias de atraso), referente ao IMP-003.\n\nRecomendo enviar lembrete automático e oferecer segunda via. Há também 1 boleto vencendo: IGCD Holding — R$ 124.000, vence em 08/06/2026.",
  },
  {
    pergunta: "Quais empresas estão com certificado vencendo?",
    resposta:
      "3 certificados vencendo em até 15 dias:\n\n• Nordix (e-CNPJ) — vence em 09/06/2026 (3 dias).\n• M&S (e-CNPJ) — vence em 18/06/2026.\n• IGCD (e-CNPJ) — vence em 20/06/2026.\n\nAlém disso, o e-CPF da sócia Sandra Lima (M&S) já está vencido desde 30/05/2026.",
  },
  {
    pergunta: "Gere um resumo do fechamento mensal.",
    resposta:
      "Fechamento — Junho/2026:\n\n• Total recebido: R$ 420.000\n• Total pago: R$ 97.800\n• Contas em aberto: R$ 87.900\n• Boletos vencidos: R$ 31.200 | pagos: R$ 198.700\n• Margem média por processo: 32%\n\n2 inconsistências detectadas: pagamento de II/IPI do IMP-003 não conciliado e demurrage da Nordix sem repasse ao cliente.",
  },
  {
    pergunta: "Quais documentos faltam no processo BL-987654?",
    resposta:
      "Processo IMP-001 (BL-987654 · Eleven):\n\nPendentes: Apólice de seguro e LI deferida.\n\nAtenção: o BL apresenta divergência de peso de 220 kg em relação ao packing list. Recomendo solicitar BL corrigido antes da chegada em Santos (ETA 14/06).",
  },
  {
    pergunta: "O que mudou nas cargas desde ontem?",
    resposta:
      "2 mudanças relevantes:\n\n• IGCD (BL-123456): passou de 'Em trânsito' para 'Atracado em Itajaí'. Iniciar agendamento de desembaraço.\n• Nordix (BL-334455): passou de 'Canal amarelo' para 'Exigência fiscal aberta'. Ação urgente.\n\nEleven (BL-987654) e Eleven (BL-778899) permanecem sem alterações.",
  },
];

export const respostaPadrao =
  "Analisei a operação com base nos dados disponíveis. No momento, os pontos de maior atenção são a exigência fiscal da Nordix (IMP-005), o boleto vencido da M&S (IMP-003) e 3 certificados digitais vencendo. Selecione uma das perguntas sugeridas para um detalhamento específico.";
