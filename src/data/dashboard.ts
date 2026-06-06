import type { DashboardStats } from "@/types";

export const dashboardStats: DashboardStats = {
  totalEmpresas: 4,
  processosAtivos: 5,
  aguardandoDocumento: 2,
  atualizacaoCarga: 2,
  boletosVencidos: 1,
  boletosAVencer: 2,
  certificadosVencendo: 3,
  contasAPagarMes: 87_900,
  recebidoMes: 420_000,
  pagoMes: 97_800,
  alertasCriticos: 2,
};

export const inteligenciaOperacional = `Hoje existem 2 processos com risco de atraso (Nordix · IMP-005 e M&S · IMP-003), 3 empresas com certificado digital vencendo nos próximos 15 dias e 4 cobranças aguardando pagamento — 1 já vencida.

A prioridade recomendada é resolver a exigência fiscal da Nordix antes que o demurrage aumente, renovar o certificado da Nordix (vence em 3 dias) e atualizar o RADAR antes do fechamento mensal. No financeiro, o mês está positivo: R$ 420.000 recebidos contra R$ 97.800 pagos.`;
