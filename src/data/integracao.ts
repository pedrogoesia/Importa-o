// ---------------------------------------------------------------------------
// Mapa de integração — onde buscar cada dado do processo (guia para o dev).
// Baseado nas APIs oficiais: Serpro Integra Comex (Carga e DI) e Portal Único
// Siscomex (DUIMP/eventos), complementadas por tracking privado.
// ---------------------------------------------------------------------------

export const DOCS = {
  carga: "https://doc-siscomex-sapi.estaleiro.serpro.gov.br/integracomex/documentacao/carga/",
  di: "https://doc-siscomex-sapi.estaleiro.serpro.gov.br/integracomex/documentacao/declaracao-importacao/",
  duimp: "https://docs.portalunico.siscomex.gov.br/api/dimp/intervenientes-privados/",
  duimpEventos: "https://docs.portalunico.siscomex.gov.br/pages/duimp_eventos_intervenientes_privados/",
};

export interface FonteDado {
  key: string;
  label: string;
  fonte: string;
  endpoints?: string[];
  camposJson?: string[];
  eventos?: string[];
  regra: string;
  docsUrl?: string;
  observacao?: string;
}

export const fontesDados: Record<string, FonteDado> = {
  cnpjImportador: {
    key: "cnpjImportador",
    label: "CNPJ do importador",
    fonte: "Cadastro interno (Escopo)",
    regra:
      "Entrada do sistema. A importadora tem vários CNPJs (um por cliente). Cadastrar:\n{ empresaId, razaoSocial, cnpjs: [\"00000000000191\", ...] }\nTodas as consultas oficiais usam representação Siscomex válida para esses CNPJs.",
  },
  ceMercante: {
    key: "ceMercante",
    label: "Nº CE-Mercante",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["numero"],
    regra: "numeroCE = conhecimento.numero\nO CE-Mercante é a CHAVE PRINCIPAL de consulta da API de Carga — não o BL comercial.",
    docsUrl: DOCS.carga,
    observacao:
      "Estratégias para obter a lista inicial de CEs: (A) cadastro manual do CE; (B) cadastro do BL e cruzamento; (C) importar planilha; (D) e-mails do agente de carga; (E) operação assistida; (F) validar com Serpro se há endpoint de listagem por CNPJ. NÃO cravar busca automática por CNPJ sem validar contrato.",
  },
  bl: {
    key: "bl",
    label: "Nº Conhecimento (BL)",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["numeroBlConhecimento", "ceBlPrimTransporte"],
    regra: "bl = numeroBlConhecimento || ceBlPrimTransporte",
    docsUrl: DOCS.carga,
    observacao: "Não assumir que o BL comercial sozinho será sempre a chave oficial. A chave segura é o CE-Mercante.",
  },
  situacaoCarga: {
    key: "situacaoCarga",
    label: "Situação da carga",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["situacaoCarga", "dataSituacaoCarga"],
    regra: "situacaoCarga = conhecimento.situacaoCarga\ndataSituacaoCarga = conhecimento.dataSituacaoCarga",
    docsUrl: DOCS.carga,
  },
  bloqueio: {
    key: "bloqueio",
    label: "Bloqueio / cadeado vermelho",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: [
      "bloqueio[]",
      "cargaBloqueada",
      "bloqueioImpedeEntregaCarga",
      "bloqueioImpedeVinculacaodespacho",
    ],
    regra:
      "cadeadoVermelho = true se:\n- cargaBloqueada === true OU\n- bloqueio.length > 0 OU\n- bloqueioImpedeEntregaCarga === true OU\n- bloqueioImpedeVinculacaodespacho === true\n\nGuardar lista de bloqueios: { codigoTipo, descricaoTipo, justificativa, motivo, data }.",
    docsUrl: DOCS.carga,
    observacao: "No front: alerta crítico 'Carga bloqueada / cadeado vermelho'.",
  },
  documentoDespacho: {
    key: "documentoDespacho",
    label: "Documento de despacho vinculado",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["documentoDespacho[].documentoDespacho", "documentoDespacho[].numero"],
    regra:
      'Tipos: DI, DSI, DTA, DE, DUIMP, DUE.\nSe "DI" → numeroDI = numero (consultar API de DI).\nSe "DUIMP" → numeroDuimp = numero (cruzar com eventos do Portal Único).\nSe "DTA"/"DSI" → guardar número específico.\nDE/DUE = exportação (ignorar no fluxo de importação).',
    docsUrl: DOCS.carga,
    observacao: 'Na rotina manual aparece "DA"; na documentação validada o tipo é DTA. Validar com a operação.',
  },
  mercadoria: {
    key: "mercadoria",
    label: "Mercadoria",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["descricaoMercadoria"],
    regra: "descricaoMercadoria = conhecimento.descricaoMercadoria",
    docsUrl: DOCS.carga,
  },
  exportador: {
    key: "exportador",
    label: "Exportador / Embarcador",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["identificacaoEmbarcador", "dadosComplementaresConsignatario"],
    regra: "embarcadorIdentificacao = conhecimento.identificacaoEmbarcador",
    docsUrl: DOCS.carga,
    observacao:
      "Campo 'dadosComplementaresEmbarcador' NÃO confirmado na documentação. Salvar identificacaoEmbarcador + dadosComplementaresConsignatario e manter campo manual; validar em homologação.",
  },
  containers: {
    key: "containers",
    label: "Contêineres / Qtd. Cntr's",
    fonte: "Serpro Integra Comex — Carga (itens)",
    endpoints: ["GET /conhecimentos-embarque/{nr-ce}/itens/", "GET /conhecimentos-embarque/{nr-ce}/itens/{nr-item}"],
    camposJson: [
      "conteineres[].identificacao",
      "conteineres[].tipo / tipoConteiner",
      "conteineres[].pesoBruto / tara / cubagem",
      "conteineres[].lacre[]",
      "conteineres[].ncm[].codigo",
      "conteineres[].cargaBloqueada / bloqueio[]",
    ],
    regra:
      "O endpoint de itens retorna conteineres[], cargasSoltas[] e graneis[].\nqtdContainers = conteineres.length.\nPara carga solta: cargasSoltas[].numero/pesoBruto/quantidade/tipoEmbalagem/marca.\nPara granel: graneis[].numero/pesoBruto/cubagem.",
    docsUrl: DOCS.carga,
  },
  qtdVolumes: {
    key: "qtdVolumes",
    label: "Qtd. Volumes",
    fonte: "Serpro Integra Comex — Carga (itens)",
    endpoints: ["GET /conhecimentos-embarque/{nr-ce}/itens/"],
    camposJson: ["cargasSoltas[].quantidade", "conteineres[]", "graneis[]"],
    regra: "Somar quantidades dos itens de carga (carga solta) e/ou volumes informados por contêiner.",
    docsUrl: DOCS.carga,
  },
  manifesto: {
    key: "manifesto",
    label: "Manifesto",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr} (manifestoDoCe[])", "GET /manifestos/{nr}"],
    camposJson: [
      "manifestoDoCe[].numero",
      "manifestoDoCe[].portoCarregamento / portoDescarregamento",
      "manifesto.dataOperacao / dataEmissao / dataEncerramento",
      "manifesto.numeroViagem / codigoEmbarcacao",
      "manifesto.escalasDoManifesto[]",
    ],
    regra:
      "1. Ler manifestoDoCe[] no conhecimento → numero do manifesto.\n2. GET /manifestos/{nr} para detalhes.\nportoDescarregamento = manifesto.portoDescarregamento || manifestoDoCe[0].portoDescarregamento.",
    docsUrl: DOCS.carga,
  },
  escala: {
    key: "escala",
    label: "Escala",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /escalas/{nr}"],
    camposJson: [
      "numero / embarcacao / numeroViagem / porto",
      "dataPrevisaoAtracacao / dataAtracacao",
      "dataPrevisaoPasseSaida / dataPasseSaida",
      "situacao / escalaBloqueada / indEscalaEncerrada",
    ],
    regra:
      "Como achar o nº da escala:\n1. Consultar manifesto → 2. Ler escalasDoManifesto[] → 3. Usar escalasDoManifesto[].escala → 4. GET /escalas/{nr}.",
    docsUrl: DOCS.carga,
  },
  navio: {
    key: "navio",
    label: "Navio",
    fonte: "Serpro Carga (escala/manifesto) + tracking privado",
    endpoints: ["GET /escalas/{nr}", "GET /manifestos/{nr}"],
    camposJson: ["escala.embarcacao", "manifesto.codigoEmbarcacao", "trackingPrivado.navio"],
    regra: "navio = escala.embarcacao || manifesto.codigoEmbarcacao || trackingPrivado.navio",
    docsUrl: DOCS.carga,
  },
  dataChegada: {
    key: "dataChegada",
    label: "Dt. Chegada",
    fonte: "Escala (Serpro) → Manifesto → Tracking privado → Manual",
    endpoints: ["GET /escalas/{nr}", "GET /manifestos/{nr}"],
    camposJson: ["escala.dataAtracacao", "escala.dataPrevisaoAtracacao", "manifesto.dataOperacao", "trackingPrivado.eta"],
    regra:
      'Prioridade:\n1. escala.dataAtracacao → tipo "confirmada"\n2. escala.dataPrevisaoAtracacao → tipo "prevista oficial"\n3. trackingPrivado.eta → tipo "ETA tracking privado"\n4. "—"\nGuardar também tipoDataChegada.',
    docsUrl: DOCS.carga,
    observacao: "Tracking privado (SeaRates, FindTEU, armador, forwarder) complementa, não substitui o Siscomex.",
  },
  numeroDi: {
    key: "numeroDi",
    label: "Nº DI",
    fonte: "Serpro Carga → Serpro Integra Comex — Declaração de Importação",
    endpoints: ["GET /conhecimentos-embarque/{nr}", "GET /declaracao-importacao/{numero}"],
    camposJson: ["documentoDespacho[].numero (se tipo = DI)", "dadosGerais.numeroDI"],
    regra: "numeroDI = conhecimento.documentoDespacho[].numero || di.dadosGerais.numeroDI",
    docsUrl: DOCS.di,
  },
  numeroDuimp: {
    key: "numeroDuimp",
    label: "Nº DUIMP",
    fonte: "Serpro Carga → Portal Único Siscomex (eventos)",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    eventos: ["dimp-situacao-import", "dimp-registro-import", "dimp-retifica-import"],
    camposJson: ["documentoDespacho[].numero (se tipo = DUIMP)", "evento.identificacao.numero", "evento.identificacao.versao", "evento.niImportador"],
    regra: "numeroDuimp = evento.identificacao.numero\nversaoDuimp = evento.identificacao.versao\nAtualizar situação/canal/ICMS por eventos push do Portal Único (webhook).",
    docsUrl: DOCS.duimpEventos,
  },
  protocoloDi: {
    key: "protocoloDi",
    label: "Protocolo DI",
    fonte: "Não garantido no MVP (manual)",
    regra: 'protocoloDI = null no MVP → front mostra "—".\nPreencher se: (1) API de operação/registro retornar protocolo; (2) usuário preencher manualmente; (3) homologação revelar campo específico.\nGuardar fonteProtocolo: "manual" | "api" | null.',
    observacao: "Não tratar como campo garantido.",
  },
  dataRegistro: {
    key: "dataRegistro",
    label: "Dt. Registro",
    fonte: "DI (Serpro) ou DUIMP (Portal Único)",
    endpoints: ["GET /declaracao-importacao/{numero}"],
    eventos: ["dimp-registro-import", "dimp-situacao-import"],
    camposJson: ["dadosDespacho.dataHoraRegistro", "evento.dataEvento + situacaoDuimp"],
    regra: "DI: dataRegistro = di.dadosDespacho.dataHoraRegistro\nDUIMP: se o evento indicar registro/efetivação → dataRegistro = evento.dataEvento",
    docsUrl: DOCS.di,
  },
  canal: {
    key: "canal",
    label: "Canal",
    fonte: "DI (Serpro) ou DUIMP (Portal Único — evento)",
    endpoints: ["GET /declaracao-importacao/{numero}"],
    eventos: ["dimp-situacao-import"],
    camposJson: ["dadosDespacho.canalSelecaoParametrizada", "evento.canal", "evento.situacaoDuimp"],
    regra:
      'DI: canal = di.dadosDespacho.canalSelecaoParametrizada\nDUIMP: canal = evento.canal (VERDE | AMARELO | VERMELHO | CINZA)\nSe situacaoDuimp = REGISTRADA_AGUARDANDO_CANAL → "Aguardando canal"\nSem DI/DUIMP → canal = null → "—"',
    docsUrl: DOCS.duimpEventos,
    observacao: "ATENÇÃO: para DUIMP, o canal NÃO vem do Serpro/DI — vem do evento dimp-situacao-import do Portal Único.",
  },
  fiscal: {
    key: "fiscal",
    label: "Fiscal (status fiscal/aduaneiro)",
    fonte: "Derivado de DI + DUIMP + Carga",
    camposJson: [
      "DI: canalSelecaoParametrizada / dataHoraRegistro / dataHoraDesembaraco / dataHoraAutorizacaoEntrega",
      "DUIMP: situacaoDuimp / canal / message / dataEvento",
      "Carga: situacaoCarga / cargaBloqueada / bloqueio[]",
    ],
    regra:
      "NÃO é o nome do fiscal — é o statusFiscalAduaneiro.\nValores: Sem DI/DUIMP registrada · Aguardando registro · Registrada aguardando canal · Canal verde/amarelo/vermelho/cinza · Em conferência · Desembaraçada aguardando ICMS · Desembaraçada aguardando entrega · Carga entregue · Carga bloqueada · Pendência de frete · Pendência AFRMM.",
    observacao: "Ajuste de produto: substituir 'nome do fiscal' por status fiscal/aduaneiro.",
  },
  dataDesembaraco: {
    key: "dataDesembaraco",
    label: "Dt. Desembaraço",
    fonte: "DI (Serpro) ou DUIMP (Portal Único — evento)",
    endpoints: ["GET /declaracao-importacao/{numero}"],
    eventos: ["dimp-situacao-import"],
    camposJson: ["dadosDespacho.dataHoraDesembaraco", "evento.situacaoDuimp + dataEvento"],
    regra:
      'DI: dataDesembaraco = di.dadosDespacho.dataHoraDesembaraco\nDUIMP: se situacaoDuimp começar com "DESEMBARACADA" → dataDesembaraco = evento.dataEvento\nEstados: DESEMBARACADA_AGUARDANDO_PENDENCIA_TRIBUTOS_ESTADUAIS · DESEMBARACADA_AGUARDANDO_ENTREGA_CARGA · DESEMBARACADA_CARGA_ENTREGUE',
    docsUrl: DOCS.di,
  },
  impostoFederal: {
    key: "impostoFederal",
    label: "Imposto Federal",
    fonte: "Serpro — DI (adições)",
    endpoints: ["GET /declaracao-importacao/{numero}", "GET /declaracao-importacao/{numeroDI}/adicoes/{numeroAdicao}"],
    camposJson: [
      "iiImposto.aliquotaValorRecolher",
      "ipiImposto.aliquotaEspecificaValorRecolher",
      "pisPasepImposto.valorRecolher",
      "cofinsImposto.aliquotaEspecificaValorRecolher",
      "cideImposto.valorRecolher",
      "antiDumping.aliquotaValorRecolher / aliquotaEspecificaValorRecolher",
    ],
    regra:
      "impostoFederalTotal = soma(II) + soma(IPI) + soma(PIS) + soma(COFINS) + soma(CIDE) + soma(Antidumping) — por adição.\nSalvar separado: { ii, ipi, pis, cofins, cide, antidumping, total }.",
    docsUrl: DOCS.di,
    observacao: 'Validar em homologação o nome exato do campo de valor final em cada imposto ("valorRecolher" vs variações).',
  },
  icms: {
    key: "icms",
    label: "ICMS",
    fonte: "DI (Serpro) ou DUIMP (Portal Único — evento)",
    endpoints: ["GET /declaracao-importacao/{numero}"],
    eventos: ["dimp-icms-import"],
    camposJson: ["icms[].valor", "icms[].dataPagamento", "icms[].uf", "icms[].tipoRecolhimento"],
    regra:
      'icmsTotal = soma(icms[].valor)\nStatus: dataPagamento existe → "Pago"; icms[] sem dataPagamento → "Declarado/Pendente"; vazio → "Não informado".\nDUIMP: ao receber dimp-icms-import → atualizar statusICMS, mensagem e dataEvento.',
    docsUrl: DOCS.di,
  },
  valorAfrmm: {
    key: "valorAfrmm",
    label: "Vlr. AFRMM",
    fonte: "Serpro Integra Comex — Carga",
    endpoints: ["GET /conhecimentos-embarque/{nr}"],
    camposJson: ["pendenciaAFRMM", "afrmmTUMPago", "indicadorPendenciaFrete"],
    regra: "Acompanhar pendência/pagamento de AFRMM no conhecimento. Pendência → statusFiscalAduaneiro = 'Pendência AFRMM'.",
    docsUrl: DOCS.carga,
  },
  posicaoAtual: {
    key: "posicaoAtual",
    label: "Posição Atual (resumo automático)",
    fonte: "Função interna gerarResumoAutomatico(processo)",
    regra:
      'Gerado pela lógica de status (ver página Integrações → Lógica de status).\nExemplos:\n"Em trânsito marítimo — ETA Santos 14/06. DI ainda não registrada."\n"DI registrada em 12/06, canal vermelho, aguardando conferência."\n"DUIMP desembaraçada. ICMS pendente e carga ainda não entregue."\n"Carga bloqueada no CE-Mercante. Verificar motivo do bloqueio antes da entrega."',
  },
  refCliente: {
    key: "refCliente",
    label: "Ref. Cliente",
    fonte: "Cadastro interno (Escopo)",
    regra: "Referência interna do cliente, informada no cadastro do processo (manual).",
  },
  numeroInvoice: {
    key: "numeroInvoice",
    label: "Nº Invoice",
    fonte: "Documentos do processo / DI (adições)",
    endpoints: ["GET /declaracao-importacao/{numeroDI}/adicoes/{numeroAdicao}"],
    camposJson: ["documentosVinculados", "documentosInstrucaoDespacho[]"],
    regra: "Capturar da invoice anexada ao processo (IA extrai) ou dos documentos vinculados à DI.",
    docsUrl: DOCS.di,
  },
  numeroProcesso: {
    key: "numeroProcesso",
    label: "Nº Processo",
    fonte: "Cadastro interno (Escopo)",
    regra: "Numeração interna do sistema (IMP-001…). Gerada no cadastro do processo.",
  },
};

// ---------------------------------------------------------------------------

export const fontesOficiais = [
  {
    nome: "Serpro Integra Comex — Carga Marítima",
    uso: "Carga, BL, CE-Mercante, manifesto, escala, contêineres, bloqueios, documento de despacho",
    docs: DOCS.carga,
    procurarPor: [
      "GET /conhecimentos-embarque/{nr}",
      "GET /conhecimentos-embarque/{nr-ce}/itens/",
      "GET /conhecimentos-embarque/{nr-ce}/itens/{nr-item}",
      "GET /manifestos/{nr}",
      "GET /escalas/{nr}",
    ],
  },
  {
    nome: "Serpro Integra Comex — Declaração de Importação",
    uso: "DI, canal DI, data registro, data desembaraço, impostos federais, ICMS, adições, NCM",
    docs: DOCS.di,
    procurarPor: [
      "GET /declaracao-importacao/{numero}",
      "GET /declaracao-importacao/{numeroDI}/adicoes/{numeroAdicao}",
    ],
  },
  {
    nome: "Portal Único Siscomex — DUIMP",
    uso: "DUIMP, situação, canal DUIMP, ICMS, eventos push, desembaraço, entrega",
    docs: DOCS.duimp,
    docsExtra: DOCS.duimpEventos,
    procurarPor: ["dimp-situacao-import", "dimp-icms-import", "dimp-registro-import", "dimp-retifica-import"],
  },
  {
    nome: "Tracking privado internacional",
    uso: "ETA/ETD, navio, viagem, portos, transbordo, eventos internacionais (antes dos dados oficiais)",
    docs: "",
    procurarPor: ["SeaRates", "FindTEU", "Armador", "Agente de carga", "Freight forwarder"],
    obs: "Complementa a timeline logística. NÃO substitui o Siscomex.",
  },
];

export const autenticacao = {
  serpro: {
    titulo: "Serpro Integra Comex",
    headers: "Authorization: Bearer {access_token}\njwt_token: {jwt_token}",
    passos: [
      "Contratar API Serpro / Integra Comex",
      "Obter Consumer Key e Consumer Secret",
      "Autenticar usando certificado digital e-CPF / e-CNPJ",
      "Receber access_token e jwt_token",
      "Enviar os dois tokens em todas as consultas",
    ],
    requisito: "Certificado digital + credenciais Serpro + representação Siscomex válida",
  },
  portalUnico: {
    titulo: "Portal Único Siscomex / DUIMP",
    passos: [
      "Ter acesso ao Portal Único",
      "Configurar credenciais/perfis",
      "Configurar API de notificação push",
      "Subscrever eventos da DUIMP",
      "Receber eventos no webhook do Escopo",
    ],
    eventos: ["dimp-situacao-import", "dimp-icms-import", "dimp-registro-import", "dimp-retifica-import"],
  },
};

export const fasesImplementacao = [
  {
    fase: "Fase 1 — Base do processo e tracking simples",
    itens: ["Cadastro de empresa e CNPJs", "Cadastro manual de processo, BL, CE-Mercante e contêiner", "Status manual", "Resumo automático"],
    objetivo: "Painel funcionando mesmo sem API (estado atual do Escopo).",
  },
  {
    fase: "Fase 2 — Serpro Carga",
    itens: ["GET /conhecimentos-embarque/{nr}", "GET /conhecimentos-embarque/{nr-ce}/itens/", "GET /manifestos/{nr}", "GET /escalas/{nr}"],
    objetivo: "Automatizar a rotina manual: BL, situação, cadeado vermelho, CE, mercadoria, embarcador, contêineres, documento de despacho, manifesto, porto e data de operação.",
  },
  {
    fase: "Fase 3 — DI",
    itens: ["GET /declaracao-importacao/{numero}", "GET /declaracao-importacao/{numeroDI}/adicoes/{numeroAdicao}"],
    objetivo: "Puxar DI, data de registro, canal, desembaraço, impostos federais e ICMS.",
  },
  {
    fase: "Fase 4 — DUIMP",
    itens: ["API DUIMP + eventos push", "dimp-situacao-import", "dimp-icms-import"],
    objetivo: "Número/versão DUIMP, situação, canal, ICMS, desembaraço e entrega por eventos.",
  },
  {
    fase: "Fase 5 — Tracking privado",
    itens: ["SeaRates ou FindTEU"],
    objetivo: "ETA, navio, viagem, transbordo e eventos internacionais antes da chegada ao Brasil.",
  },
];

export const naoPrometer = [
  {
    titulo: "Buscar todas as cargas só pelo CNPJ",
    motivo: "A documentação validada da API de Carga é centrada em consulta por CE-Mercante, manifesto e escala.",
    fallback: "Importar lista de CE/BL por planilha, e-mail, agente de carga ou operação assistida. Validar endpoint/contrato com o Serpro.",
  },
  {
    titulo: "Dados complementares do embarcador",
    motivo: "Campo exato não confirmado; existe dadosComplementaresConsignatario.",
    fallback: "Campo manual + validação em homologação.",
  },
  {
    titulo: "Protocolo DI",
    motivo: "Não confirmado como campo confiável no MVP.",
    fallback: "Campo manual ou preenchimento se alguma operação/API retornar protocolo.",
  },
  {
    titulo: "Nome do fiscal",
    motivo: "Não disponível como campo. ",
    fallback: "Substituir por status fiscal/aduaneiro derivado de DI + DUIMP + Carga.",
  },
];

export const logicaStatus = [
  { cond: "numeroDI == null && numeroDuimp == null", status: "AGUARDANDO_DI_DUIMP", resumo: "Em trânsito marítimo — ETA Santos 14/06. DI ainda não registrada." },
  { cond: 'numeroDI != null && canal == null', status: "DI_REGISTRADA_AGUARDANDO_CANAL", resumo: "DI registrada em {dataRegistro}, aguardando canal." },
  { cond: 'tipoDeclaracao == "DI" && canal == "VERDE"', status: "CANAL_VERDE", resumo: "DI registrada em {dataRegistro}, canal verde." },
  { cond: 'tipoDeclaracao == "DI" && canal in [AMARELO, VERMELHO, CINZA]', status: "EM_CONFERENCIA", resumo: "DI registrada em {dataRegistro}, canal {canal}, aguardando conferência." },
  { cond: 'situacaoDuimp == "REGISTRADA_AGUARDANDO_CANAL"', status: "DUIMP_REGISTRADA_AGUARDANDO_CANAL", resumo: "DUIMP registrada e aguardando canal." },
  { cond: 'situacaoDuimp == "EM_CONFERENCIA_SELECIONADA"', status: "EM_CONFERENCIA", resumo: "DUIMP em conferência, canal {canal}." },
  { cond: 'dataHoraDesembaraco != null OU situacaoDuimp começa com "DESEMBARACADA"', status: "DESEMBARACADO", resumo: "Carga desembaraçada em {dataDesembaraco}." },
  { cond: "cadeadoVermelho == true", status: "BLOQUEADO", resumo: "Carga com bloqueio ativo. Verificar impedimento de entrega ou vinculação de despacho." },
];

export const situacoesDuimp = [
  "REGISTRADA_AGUARDANDO_CANAL",
  "EM_CONFERENCIA_SELECIONADA",
  "DESEMBARACADA_AGUARDANDO_PENDENCIA_TRIBUTOS_ESTADUAIS",
  "DESEMBARACADA_AGUARDANDO_ENTREGA_CARGA",
  "DESEMBARACADA_CARGA_ENTREGUE",
  "ENTREGA_ANTECIPADA_AGUARDANDO_PENDENCIA_TRIBUTOS_ESTADUAIS",
  "ENTREGA_ANTECIPADA_AGUARDANDO_ENTREGA_CARGA",
  "ENTREGA_ANTECIPADA_CARGA_ENTREGUE",
  "CANCELADA_PELA_ADUANA",
  "CANCELADA_POR_APURACAO",
];
