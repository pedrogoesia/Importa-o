// ---------------------------------------------------------------------------
// Módulo DUIMP — modelo de dados + motor que monta a Pré-DUIMP a partir do
// processo já existente (empresa, processo, documentos, itens, carga).
// Tudo mockado/derivado; pronto para a camada de serviços (Portal Único).
// ---------------------------------------------------------------------------

import type { Processo } from "@/types";
import { getEmpresaById } from "@/data/empresas";

// ---- Enums / status -------------------------------------------------------

export type DuimpStatus =
  | "nao_iniciada"
  | "em_preparacao"
  | "pre_duimp_pronta"
  | "diagnostico_solicitado"
  | "diagnostico_erro"
  | "pronta_para_registro"
  | "registrada"
  | "em_conferencia"
  | "desembaracada"
  | "cancelada"
  | "retificada";

export type DuimpCanal = "aguardando" | "verde" | "amarelo" | "vermelho" | "cinza";

export type BlocoStatus =
  | "nao_iniciado"
  | "incompleto"
  | "com_divergencia"
  | "aguardando_aprovacao"
  | "aprovado"
  | "bloqueado"
  | "pronto_diagnostico"
  | "pronto_registro";

export type ItemStatus =
  | "incompleto"
  | "aguardando_ncm"
  | "aguardando_atributo"
  | "aguardando_operador"
  | "aguardando_validacao_fiscal"
  | "com_divergencia"
  | "aprovado_pre"
  | "enviado_catalogo"
  | "pronto_duimp";

export type CatalogoStatus =
  | "nao_cadastrado"
  | "incompleto"
  | "aguardando_atributos"
  | "aguardando_operador"
  | "pronto_enviar"
  | "enviado"
  | "erro"
  | "ativo";

export type DocStatus = "recebido" | "extraido" | "revisado" | "aprovado" | "recusado" | "pendente";

export type LpcoStatus =
  | "nao_consultado"
  | "dispensado"
  | "requer"
  | "rascunho"
  | "enviado"
  | "em_analise"
  | "exigencia"
  | "deferido"
  | "indeferido"
  | "impede_registro";

export type DiagnosticoStatus =
  | "nao_solicitado"
  | "solicitado"
  | "processando"
  | "sem_erro"
  | "com_alerta"
  | "com_erro"
  | "corrigido";

export type Gravidade = "baixa" | "media" | "alta" | "bloqueia";

// ---- Interfaces -----------------------------------------------------------

export interface DuimpBloco {
  key: string;
  letra: string;
  titulo: string;
  status: BlocoStatus;
  preenchimento: number;
  preenchidos: string[];
  faltantes: string[];
  divergencias: string[];
}

export interface DuimpAtributo {
  nome: string;
  valor?: string;
}

export interface DuimpItem {
  numero: number;
  produtoId?: string;
  codigoInterno: string;
  codigoCatalogo?: string;
  ncm: string;
  descricaoTecnica: string;
  descricaoComercial: string;
  atributos: DuimpAtributo[];
  marca?: string;
  modelo?: string;
  material?: string;
  finalidade?: string;
  qtdComercial: number;
  unidadeComercial: string;
  qtdEstatistica?: number;
  unidadeEstatistica?: string;
  valorUnitario: number;
  valorTotal: number;
  pesoLiquido: number;
  paisOrigem: string;
  paisAquisicao?: string;
  fabricante?: string;
  exportador?: string;
  operadorId?: string;
  vinculoCompradorVendedor?: boolean;
  status: ItemStatus;
}

export interface OperadorEstrangeiro {
  id: string;
  nome: string;
  tipo: "fabricante" | "exportador" | "vendedor" | "produtor" | "outro";
  pais: string;
  cidade?: string;
  endereco?: string;
  codigoFiscal?: string;
  contato?: string;
  relacao?: string;
  statusCatalogo: "nao_cadastrado" | "pendente" | "enviado" | "ativo";
  identificadorPortal?: string;
}

export interface CatalogoProduto {
  produtoId: string;
  nome: string;
  ncm: string;
  codigoCatalogo?: string;
  versaoCatalogo?: string;
  atributosOk: boolean;
  operadorOk: boolean;
  status: CatalogoStatus;
}

export interface DuimpDoc {
  tipo: string;
  numero?: string;
  data?: string;
  emissor?: string;
  status: DocStatus;
  usarNaDuimp: boolean;
  pendencias: string[];
  itensVinculados?: number[];
}

export interface DuimpCarga {
  modal: "maritimo" | "aereo" | "rodoviario" | "outro";
  tipoConhecimento: string;
  numeroBlAwb: string;
  ceMercante?: string;
  ruc?: string;
  unidadeDespacho?: string;
  recinto?: string;
  origem?: string;
  destino?: string;
  paisProcedencia?: string;
  dataEmbarque?: string;
  eta?: string;
  navioVoo?: string;
  container?: string;
  pesoBruto?: number;
  pesoLiquido?: number;
  volumes?: number;
  frete?: number;
  moedaFrete?: string;
  seguro?: number;
  moedaSeguro?: string;
  incoterm?: string;
  statusCarga?: string;
}

export interface DuimpTributos {
  valorMercadoria: number;
  moeda: string;
  taxaCambio: number;
  frete: number;
  seguro: number;
  acrescimos: number;
  deducoes: number;
  valorAduaneiro: number;
  ii: number;
  ipi: number;
  pis: number;
  cofins: number;
  icmsEstimado: number;
  taxaSiscomex: number;
  totalEstimado: number;
  totalOficial?: number;
  aprovadoUsuario: boolean;
}

export interface DuimpLpco {
  itemNumero: number;
  ncm: string;
  orgaoAnuente: string;
  exigeLpco: boolean;
  numeroLpco?: string;
  status: LpcoStatus;
  validade?: string;
  bloqueia: boolean;
  observacoes?: string;
}

export interface DuimpDiagnostico {
  status: DiagnosticoStatus;
  data?: string;
  usuario?: string;
  erros: string[];
  alertas: string[];
}

export interface DuimpEvento {
  data: string;
  titulo: string;
  tipo: "info" | "sucesso" | "alerta" | "ia";
  feito: boolean;
}

export interface DuimpRegistro {
  numero?: string;
  versao?: string;
  dataRegistro?: string;
  usuario?: string;
  status?: string;
  canal?: DuimpCanal;
  mensagem?: string;
}

export interface DuimpPendencia {
  processoId: string;
  processoNumero: string;
  empresaNome: string;
  bloco: string;
  descricao: string;
  gravidade: Gravidade;
}

export interface Duimp {
  processoId: string;
  processoNumero: string;
  numero?: string;
  versao?: string;
  status: DuimpStatus;
  canal: DuimpCanal;
  modo: "mock" | "manual" | "producao";
  prontidao: number;
  importadorNome: string;
  importadorCnpj: string;
  tipoImportador: string;
  responsavelInterno: string;
  despachante: string;
  unidadeDespacho: string;
  referenciaInterna: string;
  blocos: DuimpBloco[];
  carga: DuimpCarga;
  documentos: DuimpDoc[];
  itens: DuimpItem[];
  operadores: OperadorEstrangeiro[];
  catalogo: CatalogoProduto[];
  tributos: DuimpTributos;
  lpco: DuimpLpco[];
  diagnostico: DuimpDiagnostico;
  registro: DuimpRegistro;
  eventos: DuimpEvento[];
  proximasAcoes: string[];
  pendencias: DuimpPendencia[];
}

// ---- Seed (detalhe mockado por processo) ----------------------------------

interface DuimpSeed {
  itens?: DuimpItem[];
  operadores?: OperadorEstrangeiro[];
  documentos?: DuimpDoc[];
  lpco?: DuimpLpco[];
  cargaExtra?: Partial<DuimpCarga>;
  diagnostico?: DuimpDiagnostico;
}

const duimpSeed: Record<string, DuimpSeed> = {
  "imp-002": {
    operadores: [
      { id: "op-dm", nome: "Deutsche Maschinen GmbH", tipo: "fabricante", pais: "Alemanha", cidade: "Stuttgart", codigoFiscal: "DE811234567", relacao: "Sem vínculo", statusCatalogo: "ativo", identificadorPortal: "OE-DE-0099" },
      { id: "op-dmx", nome: "DM Export Trading", tipo: "exportador", pais: "Alemanha", cidade: "Hamburgo", relacao: "Sem vínculo", statusCatalogo: "pendente" },
    ],
    itens: [
      {
        numero: 1, produtoId: "prod-001", codigoInterno: "MAQ-CNC-01", codigoCatalogo: "CAT-778812", ncm: "8457.10.00",
        descricaoTecnica: "Centro de usinagem CNC horizontal, 4 eixos", descricaoComercial: "Máquina CNC",
        atributos: [{ nome: "Potência (kW)", valor: "22" }, { nome: "Tensão", valor: "380V" }, { nome: "Comando numérico", valor: "Sim" }],
        marca: "DM", modelo: "HX-440", material: "Aço/ferro fundido", finalidade: "Industrial",
        qtdComercial: 1, unidadeComercial: "UN", qtdEstatistica: 1, unidadeEstatistica: "UN",
        valorUnitario: 312000, valorTotal: 312000, pesoLiquido: 5400,
        paisOrigem: "Alemanha", paisAquisicao: "Alemanha", fabricante: "Deutsche Maschinen GmbH", exportador: "DM Export Trading", operadorId: "op-dm",
        vinculoCompradorVendedor: false, status: "pronto_duimp",
      },
      {
        numero: 2, produtoId: "prod-002", codigoInterno: "FERR-LOTE-02", ncm: "8207.30.00",
        descricaoTecnica: "Jogo de ferramentas de corte para CNC", descricaoComercial: "Ferramentas",
        atributos: [{ nome: "Material do gume", valor: "" }, { nome: "Aplicação" }],
        marca: "DM", qtdComercial: 12, unidadeComercial: "UN", valorUnitario: 8500, valorTotal: 102000, pesoLiquido: 180,
        paisOrigem: "Alemanha", fabricante: "Deutsche Maschinen GmbH", operadorId: "op-dm",
        status: "aguardando_atributo",
      },
    ],
    documentos: [
      { tipo: "Commercial Invoice", numero: "INV-DM-3392", data: "2026-05-01", emissor: "DM Export Trading", status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "Packing List", numero: "PL-DM-3392", data: "2026-05-01", emissor: "DM Export Trading", status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "BL / Conhecimento", numero: "BL-123456", data: "2026-05-02", emissor: "Hapag-Lloyd", status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "Apólice de seguro", numero: "SEG-2026-77", data: "2026-05-02", emissor: "Porto Seguro", status: "revisado", usarNaDuimp: true, pendencias: ["Aguardando aprovação humana"] },
      { tipo: "Comprovante de frete", numero: "FRT-7781", data: "2026-05-03", emissor: "Hapag-Lloyd", status: "aprovado", usarNaDuimp: true, pendencias: [] },
    ],
    lpco: [
      { itemNumero: 1, ncm: "8457.10.00", orgaoAnuente: "—", exigeLpco: false, status: "dispensado", bloqueia: false },
      { itemNumero: 2, ncm: "8207.30.00", orgaoAnuente: "—", exigeLpco: false, status: "dispensado", bloqueia: false },
    ],
    cargaExtra: { incoterm: "CIF", statusCarga: "Atracada / armazenada no recinto", recinto: "Portonave (Itajaí)", pesoBruto: 5800, pesoLiquido: 5580, volumes: 18, frete: 42500, moedaFrete: "EUR", seguro: 4200, moedaSeguro: "EUR" },
  },
  "imp-005": {
    operadores: [
      { id: "op-busan", nome: "Busan Chemicals Co.", tipo: "fabricante", pais: "Coreia do Sul", cidade: "Busan", relacao: "Sem vínculo", statusCatalogo: "nao_cadastrado" },
    ],
    itens: [
      {
        numero: 1, codigoInterno: "QUIM-INS-01", ncm: "3824.99.89",
        descricaoTecnica: "Insumo químico industrial — aditivo", descricaoComercial: "Insumo químico",
        atributos: [{ nome: "Composição", valor: "" }, { nome: "Concentração" }],
        qtdComercial: 320, unidadeComercial: "KG", valorUnitario: 180, valorTotal: 57600, pesoLiquido: 320,
        paisOrigem: "Coreia do Sul", fabricante: "Busan Chemicals Co.", operadorId: "op-busan",
        status: "aguardando_operador",
      },
    ],
    documentos: [
      { tipo: "Commercial Invoice", numero: "INV-BC-5567", data: "2026-04-12", emissor: "Busan Chemicals Co.", status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "Packing List", numero: "PL-BC-5567", emissor: "Busan Chemicals Co.", status: "extraido", usarNaDuimp: true, pendencias: ["Divergência de quantidade com a Invoice"] },
      { tipo: "BL / Conhecimento", numero: "BL-334455", status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "Certificado de origem", status: "pendente", usarNaDuimp: false, pendencias: ["Não recebido — exigido para benefício"] },
    ],
    lpco: [
      { itemNumero: 1, ncm: "3824.99.89", orgaoAnuente: "ANVISA", exigeLpco: true, status: "requer", bloqueia: true, observacoes: "Produto químico requer anuência da ANVISA." },
    ],
    cargaExtra: { incoterm: "FOB", statusCarga: "Carga bloqueada — exigência fiscal", recinto: "TCP (Paranaguá)", pesoBruto: 340, pesoLiquido: 320, volumes: 320 },
  },
};

// ---- Builder --------------------------------------------------------------

const moeda = "USD";

/** A partir de um BL cadastrado, o sistema já puxa o CE-Mercante (mock determinístico). */
function deriveCe(bl?: string) {
  if (!bl || bl === "—") return undefined;
  const dig = bl.replace(/\D/g, "");
  return `152${dig.padStart(12, "0").slice(-12)}`;
}

function bloco(
  letra: string,
  key: string,
  titulo: string,
  preenchidos: string[],
  faltantes: string[],
  divergencias: string[],
  forced?: BlocoStatus
): DuimpBloco {
  const total = preenchidos.length + faltantes.length || 1;
  const preenchimento = Math.round((preenchidos.length / total) * 100);
  let status: BlocoStatus =
    forced ??
    (divergencias.length
      ? "com_divergencia"
      : faltantes.length === 0
      ? "aprovado"
      : preenchimento === 0
      ? "nao_iniciado"
      : "incompleto");
  return { key, letra, titulo, status, preenchimento, preenchidos, faltantes, divergencias };
}

/** Monta a Pré-DUIMP a partir do processo + seed. Determinístico. */
export function buildDuimp(p: Processo): Duimp {
  const empresa = getEmpresaById(p.empresaId);
  const seed = duimpSeed[p.id] ?? {};

  const modal: DuimpCarga["modal"] = "maritimo";
  const carga: DuimpCarga = {
    modal,
    tipoConhecimento: "BL",
    numeroBlAwb: p.bl,
    ceMercante: p.ceMercante ?? deriveCe(p.bl),
    unidadeDespacho: p.portoDestino,
    origem: p.portoOrigem,
    destino: p.portoDestino,
    paisProcedencia: p.paisOrigem,
    dataEmbarque: p.dataEmbarque,
    eta: p.dataChegada,
    navioVoo: p.navio,
    container: p.container,
    statusCarga: p.situacaoCarga,
    ...seed.cargaExtra,
  };

  const itens: DuimpItem[] =
    seed.itens ??
    [
      {
        numero: 1,
        codigoInterno: "PROD-01",
        ncm: "0000.00.00",
        descricaoTecnica: p.mercadoria ?? "—",
        descricaoComercial: p.mercadoria ?? "—",
        atributos: [{ nome: "Atributo obrigatório" }],
        qtdComercial: p.qtdVolumes ?? 1,
        unidadeComercial: "UN",
        valorUnitario: p.valorFob,
        valorTotal: p.valorFob,
        pesoLiquido: 0,
        paisOrigem: p.paisOrigem,
        fabricante: p.fornecedor,
        status: "incompleto",
      },
    ];

  const operadores: OperadorEstrangeiro[] =
    seed.operadores ?? [
      { id: "op-gen", nome: p.fornecedor, tipo: "fabricante", pais: p.paisOrigem, relacao: "Sem vínculo", statusCatalogo: "nao_cadastrado" },
    ];

  const documentos: DuimpDoc[] =
    seed.documentos ?? [
      { tipo: "Commercial Invoice", numero: p.numeroInvoice, status: "aprovado", usarNaDuimp: true, pendencias: [] },
      { tipo: "Packing List", status: "recebido", usarNaDuimp: true, pendencias: [] },
      { tipo: "BL / Conhecimento", numero: p.bl, status: "aprovado", usarNaDuimp: true, pendencias: [] },
    ];

  const lpco: DuimpLpco[] = seed.lpco ?? itens.map((it) => ({
    itemNumero: it.numero,
    ncm: it.ncm,
    orgaoAnuente: "—",
    exigeLpco: false,
    status: "nao_consultado" as LpcoStatus,
    bloqueia: false,
  }));

  // Tributos estimados
  const valorMercadoria = itens.reduce((s, it) => s + it.valorTotal, 0) || p.valorFob;
  const frete = carga.frete ?? Math.round(valorMercadoria * 0.06);
  const seguro = carga.seguro ?? Math.round(valorMercadoria * 0.01);
  const valorAduaneiro = valorMercadoria + frete + seguro;
  const ii = p.impostoFederal != null ? Math.round(p.impostoFederal * 0.5) : Math.round(valorAduaneiro * 0.14);
  const ipi = p.impostoFederal != null ? Math.round(p.impostoFederal * 0.3) : Math.round(valorAduaneiro * 0.06);
  const pis = Math.round(valorAduaneiro * 0.021);
  const cofins = Math.round(valorAduaneiro * 0.0965);
  const icmsEstimado = p.icms ?? Math.round(valorAduaneiro * 0.18);
  const tributos: DuimpTributos = {
    valorMercadoria, moeda, taxaCambio: 5.42, frete, seguro, acrescimos: 0, deducoes: 0,
    valorAduaneiro, ii, ipi, pis, cofins, icmsEstimado, taxaSiscomex: 154.23,
    totalEstimado: ii + ipi + pis + cofins + icmsEstimado + 154.23,
    aprovadoUsuario: false,
  };

  const diagnostico: DuimpDiagnostico = seed.diagnostico ?? { status: "nao_solicitado", erros: [], alertas: [] };

  const base: Duimp = {
    processoId: p.id,
    processoNumero: p.numeroInterno,
    numero: p.numeroDuimp,
    versao: p.numeroDuimp ? "0000" : undefined,
    status: "em_preparacao",
    canal: (p.canal as DuimpCanal) ?? "aguardando",
    modo: "mock",
    prontidao: 0,
    importadorNome: p.empresaNome,
    importadorCnpj: p.cnpj,
    tipoImportador: empresa?.tipo === "Filial" ? "Pessoa Jurídica (Filial)" : "Pessoa Jurídica",
    responsavelInterno: p.responsavelInterno,
    despachante: p.despachante,
    unidadeDespacho: p.portoDestino,
    referenciaInterna: p.refCliente ?? p.numeroInterno,
    blocos: [],
    carga,
    documentos,
    itens,
    operadores,
    catalogo: [],
    tributos,
    lpco,
    diagnostico,
    registro: {},
    eventos: [],
    proximasAcoes: [],
    pendencias: [],
  };

  return recompute(base);
}

/** Recalcula tudo que é derivado (catálogo, blocos, pendências, prontidão,
 *  status, próximas ações e timeline) a partir dos dados crus do Duimp. */
export function recompute(d: Duimp): Duimp {
  const { itens, operadores, documentos, lpco, carga, diagnostico } = d;
  const registrada = !!d.registro.numero;

  // Catálogo
  const catalogo: CatalogoProduto[] = itens.map((it) => {
    const atributosOk = it.atributos.every((a) => a.valor && a.valor.trim() !== "");
    const operadorOk = !!it.operadorId && operadores.find((o) => o.id === it.operadorId)?.statusCatalogo === "ativo";
    let status: CatalogoStatus = "nao_cadastrado";
    if (it.codigoCatalogo) status = "ativo";
    else if (!atributosOk) status = "aguardando_atributos";
    else if (!operadorOk) status = "aguardando_operador";
    else status = "pronto_enviar";
    return { produtoId: it.produtoId ?? it.codigoInterno, nome: it.descricaoComercial, ncm: it.ncm, codigoCatalogo: it.codigoCatalogo, atributosOk, operadorOk, status };
  });

  const docsObrig = ["Commercial Invoice", "Packing List", "BL / Conhecimento"];
  const docsFaltando = docsObrig.filter((t) => !documentos.find((dc) => dc.tipo === t && dc.status === "aprovado"));
  const docsDiverg = documentos.filter((dc) => dc.pendencias.length > 0).map((dc) => `${dc.tipo}: ${dc.pendencias[0]}`);

  const itensProblema = itens.filter((it) => it.status !== "pronto_duimp" && it.status !== "aprovado_pre");
  const itensDiverg: string[] = [];
  itens.forEach((it) => {
    if (it.status === "com_divergencia") itensDiverg.push(`Item ${it.numero}: divergência documental`);
    if (it.status === "aguardando_atributo") itensDiverg.push(`Produto ${it.numero} ainda não tem todos os atributos exigidos para a DUIMP.`);
    if (it.status === "aguardando_operador") itensDiverg.push(`Produto ${it.numero} sem operador estrangeiro cadastrado no Catálogo.`);
  });

  const cargaFaltantes: string[] = [];
  if (carga.modal === "maritimo" && !carga.ceMercante) cargaFaltantes.push("CE Mercante");
  if (carga.modal === "aereo" && !carga.ruc) cargaFaltantes.push("RUC");

  const lpcoBloqueia = lpco.filter((l) => l.exigeLpco && l.status !== "deferido");

  const blocos: DuimpBloco[] = [
    bloco("A", "identificacao", "Identificação", ["Importador", "CNPJ", "Responsável", "Despachante", "Unidade de despacho"], [], []),
    bloco("B", "carga", "Carga", ["Modal", "BL/AWB", "Origem/Destino", "ETA", "Navio"], cargaFaltantes, []),
    bloco("C", "documentos", "Documentos",
      documentos.filter((dc) => dc.status === "aprovado").map((dc) => dc.tipo),
      docsFaltando.length ? docsFaltando : documentos.filter((dc) => dc.status !== "aprovado").map((dc) => dc.tipo),
      docsDiverg),
    bloco("D", "itens", "Itens / Mercadorias",
      itens.filter((it) => it.status === "pronto_duimp").map((it) => `Item ${it.numero}`),
      itensProblema.map((it) => `Item ${it.numero}`), itensDiverg),
    bloco("E", "tributos", "Tributos",
      ["Valor aduaneiro", "II", "IPI", "PIS", "COFINS", "ICMS estimado"], [], [],
      d.tributos.aprovadoUsuario ? "aprovado" : "aguardando_aprovacao"),
    bloco("F", "tratamento", "Tratamento Administrativo / LPCO",
      lpco.filter((l) => !l.exigeLpco || l.status === "deferido").map((l) => `Item ${l.itemNumero}`),
      lpcoBloqueia.map((l) => `Item ${l.itemNumero} (LPCO ${l.orgaoAnuente})`),
      lpcoBloqueia.map((l) => `Item ${l.itemNumero}: ${l.orgaoAnuente} exige LPCO e ainda não há deferimento.`),
      lpcoBloqueia.length ? "bloqueado" : undefined),
  ];

  const aToFok = blocos.every((b) => b.status === "aprovado" || b.status === "aguardando_aprovacao");
  blocos.push(bloco("G", "resumo", "Resumo", aToFok ? ["Pré-DUIMP consolidada"] : [], aToFok ? [] : ["Resolver blocos A–F"], [], aToFok ? "pronto_diagnostico" : "bloqueado"));
  blocos.push(bloco("H", "diagnostico", "Diagnóstico",
    diagnostico.status === "sem_erro" ? ["Sem erros impeditivos"] : [],
    diagnostico.status === "nao_solicitado" ? ["Solicitar diagnóstico"] : [],
    diagnostico.erros,
    diagnostico.status === "nao_solicitado" ? (aToFok ? "pronto_diagnostico" : "bloqueado") : diagnostico.erros.length ? "com_divergencia" : "aprovado"));
  const diagOk = diagnostico.status === "sem_erro" || diagnostico.status === "com_alerta";
  const podeRegistrar = aToFok && diagOk && lpcoBloqueia.length === 0;
  blocos.push(bloco("I", "registro", "Registro", podeRegistrar ? ["Pronto para registrar"] : [], podeRegistrar ? [] : ["Resolver pendências e diagnóstico"], [], registrada ? "aprovado" : podeRegistrar ? "pronto_registro" : "bloqueado"));

  const prontidao = Math.round(blocos.slice(0, 6).reduce((s, b) => s + b.preenchimento, 0) / 6);

  let status: DuimpStatus = d.status;
  if (!registrada) {
    if (podeRegistrar) status = "pronta_para_registro";
    else if (diagnostico.status === "com_erro") status = "diagnostico_erro";
    else if (diagnostico.status === "solicitado" || diagnostico.status === "processando") status = "diagnostico_solicitado";
    else if (aToFok) status = "pre_duimp_pronta";
    else status = "em_preparacao";
  }

  const pendencias: DuimpPendencia[] = [];
  const add = (bl: string, descricao: string, gravidade: Gravidade) =>
    pendencias.push({ processoId: d.processoId, processoNumero: d.processoNumero, empresaNome: d.importadorNome, bloco: bl, descricao, gravidade });
  cargaFaltantes.forEach((c) => add("Carga", `Falta informar o ${c} para vincular a carga à DUIMP.`, "bloqueia"));
  itens.forEach((it) => {
    if (it.status === "aguardando_atributo") add("Itens", `Produto ${it.numero} ainda não tem todos os atributos exigidos para a DUIMP.`, "alta");
    if (it.status === "aguardando_operador") add("Itens", `Produto ${it.numero} sem operador estrangeiro cadastrado no Catálogo.`, "alta");
    if (it.status === "com_divergencia") add("Itens", `Item ${it.numero} com divergência documental.`, "alta");
  });
  documentos.forEach((dc) => dc.pendencias.forEach((pd) => add("Documentos", `${dc.tipo}: ${pd}`, dc.tipo.toLowerCase().includes("seguro") ? "media" : "alta")));
  lpcoBloqueia.forEach((l) => add("Tratamento adm.", `Item ${l.itemNumero}: ${l.orgaoAnuente} exige LPCO e ainda não foi deferido.`, "bloqueia"));

  const proximasAcoes: string[] = [];
  if (cargaFaltantes.length) proximasAcoes.push(`Informar ${cargaFaltantes.join(" / ")} na carga.`);
  if (itensProblema.length) proximasAcoes.push("Revisar produtos sem atributo obrigatório / operador.");
  if (docsFaltando.length || docsDiverg.length) proximasAcoes.push("Aprovar documentos pendentes.");
  if (lpcoBloqueia.length) proximasAcoes.push("Providenciar LPCO dos itens com anuência.");
  if (!proximasAcoes.length && !registrada && diagnostico.status === "nao_solicitado") proximasAcoes.push("Solicitar diagnóstico.");
  if (!proximasAcoes.length && !registrada && podeRegistrar) proximasAcoes.push("Registrar a DUIMP.");
  if (registrada) proximasAcoes.push("Acompanhar canal e exigências da DUIMP.");

  const eventos: DuimpEvento[] = [
    { data: "—", titulo: "Processo criado", tipo: "info", feito: true },
    { data: "—", titulo: "Invoice recebida", tipo: "sucesso", feito: documentos.some((dc) => dc.tipo === "Commercial Invoice") },
    { data: "—", titulo: "Packing List recebido", tipo: "sucesso", feito: documentos.some((dc) => dc.tipo === "Packing List") },
    { data: "—", titulo: "BL recebido", tipo: "sucesso", feito: documentos.some((dc) => dc.tipo.startsWith("BL")) },
    { data: "—", titulo: "CE Mercante / RUC informado", tipo: carga.ceMercante ? "sucesso" : "alerta", feito: !!carga.ceMercante },
    { data: "—", titulo: "Produtos validados", tipo: "info", feito: itens.every((it) => it.status === "pronto_duimp") },
    { data: "—", titulo: "Catálogo atualizado", tipo: "info", feito: catalogo.every((c) => c.status === "ativo") },
    { data: "—", titulo: "Pré-DUIMP pronta", tipo: "ia", feito: aToFok },
    { data: "—", titulo: "Diagnóstico solicitado", tipo: "info", feito: diagnostico.status !== "nao_solicitado" },
    { data: d.registro.dataRegistro ?? "—", titulo: "DUIMP registrada", tipo: "sucesso", feito: registrada },
    { data: "—", titulo: "Canal definido", tipo: "info", feito: d.canal !== "aguardando" && registrada },
    { data: "—", titulo: "Desembaraçada", tipo: "sucesso", feito: d.status === "desembaracada" },
    { data: "—", titulo: "Carga entregue", tipo: "sucesso", feito: false },
  ];

  return { ...d, catalogo, blocos, prontidao, status, pendencias, proximasAcoes, eventos };
}
