import type { Documento } from "@/types";

export const tiposDocumento = [
  "Contrato social",
  "Procuração",
  "Certificado digital",
  "Documentos dos sócios",
  "Comprovante de endereço",
  "Documentos contábeis",
  "Habilitação de importação",
  "Commercial Invoice",
  "Packing list",
  "Conhecimento de embarque",
  "Documentos da carga",
  "Comprovante de pagamento",
  "Boleto",
  "Nota fiscal",
  "Arquivo fiscal",
  "Comprovante bancário",
  "Documento de fechamento",
];

export const documentos: Documento[] = [
  {
    id: "doc-001",
    nome: "Commercial Invoice - Shenzhen Tech.pdf",
    tipo: "Commercial Invoice",
    empresaId: "emp-eleven",
    empresaNome: "Eleven",
    processoId: "imp-001",
    processoNumero: "IMP-001",
    status: "validado",
    tamanho: "412 KB",
    enviadoEm: "2026-05-08",
    aiResumo:
      "Invoice referente a 1.200 unidades de módulos eletrônicos, valor total USD 248.000, Incoterm FOB Yantian.",
    aiCampos: [
      { label: "Fornecedor", valor: "Shenzhen Tech Co." },
      { label: "Valor FOB", valor: "USD 248.000,00" },
      { label: "Incoterm", valor: "FOB Yantian" },
      { label: "Data", valor: "06/05/2026" },
    ],
    aiInconsistencias: [],
  },
  {
    id: "doc-002",
    nome: "Packing List - Shenzhen Tech.pdf",
    tipo: "Packing list",
    empresaId: "emp-eleven",
    empresaNome: "Eleven",
    processoId: "imp-001",
    processoNumero: "IMP-001",
    status: "validado",
    tamanho: "288 KB",
    enviadoEm: "2026-05-08",
    aiResumo: "Packing list com 24 volumes, peso bruto 8.400 kg, container MSKU1234567.",
    aiCampos: [
      { label: "Volumes", valor: "24" },
      { label: "Peso bruto", valor: "8.400 kg" },
      { label: "Container", valor: "MSKU1234567" },
    ],
    aiInconsistencias: [],
  },
  {
    id: "doc-003",
    nome: "Bill of Lading - MSC Isabella.pdf",
    tipo: "Conhecimento de embarque",
    empresaId: "emp-eleven",
    empresaNome: "Eleven",
    processoId: "imp-001",
    processoNumero: "IMP-001",
    status: "em_analise",
    tamanho: "356 KB",
    enviadoEm: "2026-05-11",
    aiResumo:
      "BL-987654, embarque em Yantian com destino Santos. IA detectou divergência de peso vs. packing list.",
    aiCampos: [
      { label: "BL", valor: "BL-987654" },
      { label: "Navio", valor: "MSC Isabella" },
      { label: "Peso declarado", valor: "8.620 kg" },
    ],
    aiInconsistencias: [
      "Peso do BL (8.620 kg) difere do packing list (8.400 kg) em 220 kg.",
    ],
  },
  {
    id: "doc-004",
    nome: "Contrato Social - Eleven.pdf",
    tipo: "Contrato social",
    empresaId: "emp-eleven",
    empresaNome: "Eleven",
    status: "validado",
    tamanho: "1.2 MB",
    enviadoEm: "2026-01-15",
    aiResumo:
      "Contrato social consolidado da Eleven Importação. Capital social R$ 2.000.000, 2 sócios.",
    aiCampos: [
      { label: "CNPJ", valor: "34.567.890/0001-21" },
      { label: "Capital social", valor: "R$ 2.000.000,00" },
      { label: "Sócios", valor: "Ricardo Almeida, Carolina Mendes" },
    ],
    aiInconsistencias: [],
  },
  {
    id: "doc-005",
    nome: "Invoice IGCD - Deutsche Maschinen.pdf",
    tipo: "Commercial Invoice",
    empresaId: "emp-igcd",
    empresaNome: "IGCD",
    processoId: "imp-002",
    processoNumero: "IMP-002",
    status: "validado",
    tamanho: "498 KB",
    enviadoEm: "2026-04-29",
    aiResumo:
      "Invoice de maquinário industrial, valor EUR 512.300, Incoterm CFR Itajaí.",
    aiCampos: [
      { label: "Fornecedor", valor: "Deutsche Maschinen GmbH" },
      { label: "Valor", valor: "EUR 512.300,00" },
      { label: "Incoterm", valor: "CFR Itajaí" },
    ],
    aiInconsistencias: [],
  },
  {
    id: "doc-006",
    nome: "Procuração - M&S Despachante.pdf",
    tipo: "Procuração",
    empresaId: "emp-ms",
    empresaNome: "M&S",
    status: "inconsistencia",
    tamanho: "204 KB",
    enviadoEm: "2026-03-20",
    aiResumo:
      "Procuração para despachante aduaneiro. IA detectou que a validade expirou.",
    aiCampos: [
      { label: "Outorgante", valor: "M&S Logística" },
      { label: "Outorgado", valor: "João Ferreira" },
      { label: "Validade", valor: "31/05/2026" },
    ],
    aiInconsistencias: ["Procuração vencida em 31/05/2026 — necessita renovação."],
  },
  {
    id: "doc-007",
    nome: "Packing List Nordix - Busan.pdf",
    tipo: "Packing list",
    empresaId: "emp-nordix",
    empresaNome: "Nordix",
    processoId: "imp-005",
    processoNumero: "IMP-005",
    status: "pendente",
    tamanho: "—",
    enviadoEm: "2026-05-20",
    aiResumo: "Documento aguardando upload do fornecedor.",
    aiCampos: [],
    aiInconsistencias: ["Documento ainda não recebido."],
  },
];

export const getDocumentosByProcesso = (processoId: string) =>
  documentos.filter((d) => d.processoId === processoId);

export const getDocumentosByEmpresa = (empresaId: string) =>
  documentos.filter((d) => d.empresaId === empresaId);
