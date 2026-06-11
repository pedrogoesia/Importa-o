// ---------------------------------------------------------------------------
// Domain types for the Escopo operating system for import companies.
// All data is mocked but typed as if it came from a real backend/API.
// ---------------------------------------------------------------------------

export type ID = string;

export type Severity = "critico" | "atencao" | "informativo" | "resolvido";

export type EmpresaStatus = "ativa" | "inativa" | "pendente";

export type RegimeTributario =
  | "Simples Nacional"
  | "Lucro Presumido"
  | "Lucro Real";

export interface Socio {
  nome: string;
  cpf?: string;
  participacao?: string;
}

export type IntegracaoStatus = "conectado" | "pendente" | "nao_configurado";

/** Integrações disponíveis por empresa/CNPJ. */
export interface EmpresaIntegracoes {
  openFinance: IntegracaoStatus;
  banco?: string;
  boleto: IntegracaoStatus;
  convenioBoleto?: string;
  nfe: IntegracaoStatus;
}

export interface Empresa {
  id: ID;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  tipo: "Matriz" | "Filial";
  uf: string;
  endereco: string;
  cep: string;
  municipio: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  socios: Socio[];
  adm: string;
  emailFinanceiro: string;
  emailOperacional: string;
  telefone: string;
  contabilidade: string;
  regimeTributario: RegimeTributario;
  beneficioFiscal: string;
  clienteVinculado: string;
  status: EmpresaStatus;
  certificadoVinculado: string;
  dataAbertura: string;
  observacoes: string;
  integracoes?: EmpresaIntegracoes;
}

export type ProcessoStatus =
  | "em_andamento"
  | "aguardando_documento"
  | "em_transito"
  | "atracado"
  | "desembaracado"
  | "concluido"
  | "atrasado";

export type EtapaProcesso =
  | "Pré-embarque"
  | "Embarque"
  | "Trânsito"
  | "Chegada"
  | "Desembaraço"
  | "Liberação"
  | "Entrega";

export type CanalDespacho = "verde" | "amarelo" | "vermelho" | "cinza";

export interface Processo {
  id: ID;
  numeroInterno: string;
  empresaId: ID;
  empresaNome: string;
  cnpj: string;
  cliente: string;
  responsavelInterno: string;
  despachante: string;
  fornecedor: string;
  paisOrigem: string;
  portoOrigem: string;
  portoDestino: string;
  navio: string;
  bl: string;
  container: string;
  dataEmbarque: string;
  dataChegada: string;
  status: ProcessoStatus;
  etapa: EtapaProcesso;
  valorFob: number;
  observacoes: string;
  documentosPendentes: string[];
  temPendencia: boolean;
  // Dados operacionais do despacho aduaneiro
  refCliente?: string;
  numeroInvoice?: string;
  mercadoria?: string;
  qtdVolumes?: number;
  qtdContainers?: number;
  numeroDi?: string;
  protocoloDi?: string;
  dataRegistro?: string;
  canal?: CanalDespacho;
  fiscal?: string;
  dataDesembaraco?: string;
  impostoFederal?: number;
  icms?: number;
  valorAfrmm?: number;
  posicaoAtual?: string;
  // Consolidação Siscomex (Carga / CE-Mercante / DUIMP)
  ceMercante?: string;
  numeroManifesto?: string;
  numeroEscala?: string;
  situacaoCarga?: string;
  cargaBloqueada?: boolean;
  tipoDeclaracao?: "DI" | "DUIMP" | "DTA" | "DSI";
  numeroDuimp?: string;
}

export type DocumentoStatus =
  | "validado"
  | "pendente"
  | "em_analise"
  | "inconsistencia";

export interface Documento {
  id: ID;
  nome: string;
  tipo: string;
  empresaId?: ID;
  empresaNome?: string;
  processoId?: ID;
  processoNumero?: string;
  status: DocumentoStatus;
  tamanho: string;
  enviadoEm: string;
  // Simulated AI extraction
  aiResumo: string;
  aiCampos: { label: string; valor: string }[];
  aiInconsistencias: string[];
}

/** Diferença detectada entre o snapshot de ontem e o de hoje. */
export interface CargaMudanca {
  campo: string;
  de: string;
  para: string;
  critico?: boolean;
}

export interface CargaSnapshot {
  id: ID;
  data: string;
  processoId: ID;
  processoNumero: string;
  empresaNome: string;
  bl: string;
  statusAnterior: string;
  statusAtual: string;
  mudou: boolean;
  detalhe: string;
  mudancas?: CargaMudanca[];
}

export type BoletoStatus =
  | "criado"
  | "enviado"
  | "aguardando_pagamento"
  | "vencendo"
  | "vencido"
  | "pago"
  | "cancelado"
  | "renegociado";

export interface Boleto {
  id: ID;
  numero: string;
  empresaId: ID;
  empresaNome: string;
  processoId?: ID;
  processoNumero?: string;
  cliente: string;
  valor: number;
  emissao: string;
  vencimento: string;
  status: BoletoStatus;
  descricao: string;
  // Parcelamento (cobrança dividida em N boletos)
  parcela?: number;
  totalParcelas?: number;
  grupoId?: ID;
  pagoEm?: string;
}

export type TransacaoTipo = "entrada" | "saida";

export interface Transacao {
  id: ID;
  data: string;
  descricao: string;
  categoria: string;
  empresaNome: string;
  processoNumero?: string;
  tipo: TransacaoTipo;
  valor: number;
  conciliada: boolean;
}

export type ContaStatus = "em_aberto" | "paga" | "vencida" | "agendada";

export interface ContaPagar {
  id: ID;
  descricao: string;
  fornecedor: string;
  empresaNome: string;
  processoNumero?: string;
  categoria?: string;
  valor: number;
  vencimento: string;
  status: ContaStatus;
  recorrente?: boolean;
}

export type CustoCategoria =
  | "Frete internacional"
  | "II/IPI"
  | "ICMS"
  | "AFRMM"
  | "Despachante"
  | "Armazenagem"
  | "Demurrage"
  | "Seguro"
  | "Taxas Siscomex"
  | "Frete rodoviário"
  | "Outras";

/** Lançamento de custo de um processo de importação (base do DRE e do repasse). */
export interface CustoProcesso {
  id: ID;
  processoNumero: string;
  empresaNome: string;
  categoria: CustoCategoria;
  descricao: string;
  valor: number;
  repassavel: boolean;
  status: "previsto" | "realizado";
  data: string;
}

/** Cabeçalho de rentabilidade por processo (receita faturada ao cliente). */
export interface RentabilidadeProcesso {
  processo: string;
  empresaNome: string;
  cliente: string;
  receita: number;
}

export type NotaFiscalStatus =
  | "aguardando_emissao"
  | "emitida"
  | "com_erro"
  | "cancelada";

export interface NotaFiscal {
  id: ID;
  numero: string;
  tipo: "Entrada" | "Saída";
  empresaNome: string;
  processoNumero?: string;
  valor: number;
  emissao: string;
  status: NotaFiscalStatus;
  observacao: string;
}

export interface RadarRegistro {
  id: ID;
  empresaNome: string;
  adm: string;
  ultimoRegistro: string;
  dataLimite: string;
  observacoes: string;
  modalidade?: RadarModalidade;
  limite?: string;
  situacao?: RadarSituacao;
  etapas?: RadarEtapa[];
  documentos?: RadarDocumentoItem[];
}

export type RadarModalidade = "Expressa" | "Limitada" | "Ilimitada";
export type RadarSituacao = "habilitado" | "em_habilitacao" | "revisao" | "suspenso";
export interface RadarEtapa {
  id: string;
  titulo: string;
  feito: boolean;
}
export interface RadarDocumentoItem {
  id: string;
  nome: string;
  status: "pendente" | "recebido" | "enviado";
}

export type CertificadoStatus = "valido" | "vencendo" | "vencido";

export interface Certificado {
  id: ID;
  empresaNome: string;
  responsavel: string;
  tipo: "e-CNPJ" | "e-CPF";
  validade: string;
  status: CertificadoStatus;
  socioDespachante: string;
  emissor?: string;
  senha?: string;
  documentoNome?: string;
  emitidoEm?: string;
}

export interface IrpfRegistro {
  id: ID;
  empresaNome: string;
  cnpj: string;
  uf: string;
  socios: string;
  dataAbertura: string;
  contador: string;
  status: "em_dia" | "pendente" | "em_elaboracao";
}

export interface Alerta {
  id: ID;
  tipo: string;
  empresaNome: string;
  processoNumero?: string;
  prioridade: Severity;
  descricao: string;
  recomendacaoIa: string;
  status: "aberto" | "em_andamento" | "resolvido";
  data: string;
}

export interface TimelineEvent {
  id: ID;
  data: string;
  titulo: string;
  descricao: string;
  tipo: "info" | "sucesso" | "alerta" | "ia";
}

export interface Relatorio {
  id: ID;
  titulo: string;
  descricao: string;
  categoria: string;
  geradoEm: string;
  periodo: string;
}

export interface DashboardStats {
  totalEmpresas: number;
  processosAtivos: number;
  aguardandoDocumento: number;
  atualizacaoCarga: number;
  boletosVencidos: number;
  boletosAVencer: number;
  certificadosVencendo: number;
  contasAPagarMes: number;
  recebidoMes: number;
  pagoMes: number;
  alertasCriticos: number;
}
