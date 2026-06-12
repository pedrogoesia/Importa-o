// ---------------------------------------------------------------------------
// Camada de serviços DUIMP — desacoplada do front. Hoje opera em modo "mock";
// trocar a implementação por chamadas reais ao Portal Único/Siscomex sem mexer
// na UI. Cada serviço expõe a mesma assinatura nos 3 modos.
// ---------------------------------------------------------------------------

export type DuimpModo = "mock" | "manual" | "producao";

export interface ServiceResult<T = unknown> {
  ok: boolean;
  modo: DuimpModo;
  data?: T;
  mensagem?: string;
  payloadEnviado?: unknown;
  payloadRecebido?: unknown;
}

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

/** Operadores estrangeiros (criar/atualizar no Catálogo). */
export const catalogoProdutoService = {
  async enviarProduto(modo: DuimpModo, produto: unknown): Promise<ServiceResult> {
    if (modo === "producao") return { ok: false, modo, mensagem: "Credenciais do Portal Único não configuradas." };
    await delay();
    return { ok: true, modo, mensagem: "Produto enviado ao Catálogo (mock).", data: { codigoCatalogo: `CAT-${Math.floor(Math.random() * 900000 + 100000)}`, versao: "1" }, payloadEnviado: produto };
  },
};

export const portalUnicoService = {
  async enviarOperador(modo: DuimpModo, operador: unknown): Promise<ServiceResult> {
    await delay();
    return { ok: modo !== "producao", modo, mensagem: modo === "producao" ? "Sem credenciais." : "Operador estrangeiro registrado (mock).", data: { identificadorPortal: `OE-${Math.floor(Math.random() * 9000 + 1000)}` }, payloadEnviado: operador };
  },
};

export const lpcoService = {
  async consultar(modo: DuimpModo, ncm: string): Promise<ServiceResult> {
    await delay();
    return { ok: true, modo, mensagem: `Tratamento administrativo consultado para NCM ${ncm} (mock).` };
  },
};

export const duimpService = {
  /** Solicita o diagnóstico (checagem pré-registro). */
  async diagnostico(modo: DuimpModo, payload: unknown): Promise<ServiceResult> {
    if (modo === "producao") return { ok: false, modo, mensagem: "Integração não habilitada." };
    await delay(1200);
    return { ok: true, modo, mensagem: "Diagnóstico processado (mock).", payloadEnviado: payload };
  },
  /** Registra a DUIMP e retorna número/versão/status. */
  async registrar(modo: DuimpModo, payload: unknown): Promise<ServiceResult> {
    if (modo === "producao") return { ok: false, modo, mensagem: "Integração não habilitada." };
    await delay(1200);
    const numero = `26BR${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`;
    return { ok: true, modo, mensagem: "DUIMP registrada (mock).", data: { numero, versao: "0001", status: "registrada" }, payloadEnviado: payload, payloadRecebido: { numero, versao: "0001" } };
  },
};

export const documentAttachmentService = {
  async anexar(modo: DuimpModo, doc: unknown): Promise<ServiceResult> {
    await delay();
    return { ok: true, modo, mensagem: "Documento anexado (mock).", payloadEnviado: doc };
  },
};

export const duimpEventsService = {
  /** Assinatura de eventos (push) — placeholder para webhook futuro. */
  subscribe() {
    return () => {};
  },
};
