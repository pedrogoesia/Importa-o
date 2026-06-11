"use client";

import { useEffect, useState } from "react";
import { Ship, Save, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea, PrimaryButton, GhostButton } from "@/components/ui/Form";
import { empresas } from "@/data/empresas";
import type { Processo, ProcessoStatus, EtapaProcesso, CanalDespacho } from "@/types";

const TODAY = new Date().toISOString().slice(0, 10);

const statusOptions: { value: ProcessoStatus; label: string }[] = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_documento", label: "Aguardando documento" },
  { value: "em_transito", label: "Em trânsito" },
  { value: "atracado", label: "Atracado" },
  { value: "desembaracado", label: "Desembaraçado" },
  { value: "atrasado", label: "Atrasado" },
  { value: "concluido", label: "Concluído" },
];

const etapaOptions: EtapaProcesso[] = [
  "Pré-embarque", "Embarque", "Trânsito", "Chegada", "Desembaraço", "Liberação", "Entrega",
];

const parseNum = (v: string) => {
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};
const numOpt = (v: string) => (v.trim() ? parseNum(v) : undefined);
const intOpt = (v: string) => {
  if (!v.trim()) return undefined;
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return isNaN(n) ? undefined : n;
};

function toForm(p?: Processo) {
  return {
    numeroInterno: p?.numeroInterno ?? "",
    empresaId: p?.empresaId ?? empresas[0]?.id ?? "",
    cliente: p?.cliente ?? "",
    refCliente: p?.refCliente ?? "",
    status: (p?.status ?? "em_transito") as ProcessoStatus,
    etapa: (p?.etapa ?? "Pré-embarque") as EtapaProcesso,
    canal: (p?.canal ?? "") as CanalDespacho | "",
    fiscal: p?.fiscal ?? "",
    responsavelInterno: p?.responsavelInterno ?? "",
    despachante: p?.despachante ?? "",
    fornecedor: p?.fornecedor ?? "",
    mercadoria: p?.mercadoria ?? "",
    numeroInvoice: p?.numeroInvoice ?? "",
    bl: p?.bl ?? "",
    container: p?.container ?? "",
    qtdVolumes: p?.qtdVolumes != null ? String(p.qtdVolumes) : "",
    qtdContainers: p?.qtdContainers != null ? String(p.qtdContainers) : "",
    navio: p?.navio ?? "",
    paisOrigem: p?.paisOrigem ?? "",
    portoOrigem: p?.portoOrigem ?? "",
    portoDestino: p?.portoDestino ?? "",
    dataEmbarque: p?.dataEmbarque ?? "",
    dataChegada: p?.dataChegada ?? "",
    numeroDi: p?.numeroDi ?? "",
    protocoloDi: p?.protocoloDi ?? "",
    dataRegistro: p?.dataRegistro ?? "",
    dataDesembaraco: p?.dataDesembaraco ?? "",
    impostoFederal: p?.impostoFederal != null ? String(p.impostoFederal) : "",
    icms: p?.icms != null ? String(p.icms) : "",
    valorAfrmm: p?.valorAfrmm != null ? String(p.valorAfrmm) : "",
    valorFob: p?.valorFob != null ? String(p.valorFob) : "",
    posicaoAtual: p?.posicaoAtual ?? "",
    observacoes: p?.observacoes ?? "",
    documentosPendentes: (p?.documentosPendentes ?? []).join(", "),
    ceMercante: p?.ceMercante ?? "",
    numeroManifesto: p?.numeroManifesto ?? "",
    numeroEscala: p?.numeroEscala ?? "",
    situacaoCarga: p?.situacaoCarga ?? "",
    numeroDuimp: p?.numeroDuimp ?? "",
    tipoDeclaracao: p?.tipoDeclaracao ?? "",
    cargaBloqueada: p?.cargaBloqueada ?? false,
  };
}

export function ProcessoForm({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Processo;
  onSubmit: (p: Processo) => void;
}) {
  const editing = !!initial;
  const [f, setF] = useState(toForm(initial));

  useEffect(() => {
    if (open) setF(toForm(initial));
  }, [open, initial]);

  type FormState = ReturnType<typeof toForm>;
  const set = (k: Exclude<keyof FormState, "cargaBloqueada">, v: string) =>
    setF((s) => ({ ...s, [k]: v } as FormState));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const empresa = empresas.find((emp) => emp.id === f.empresaId);
    const docs = f.documentosPendentes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const p: Processo = {
      id: initial?.id ?? `proc-${Date.now()}`,
      numeroInterno: f.numeroInterno || `IMP-${Math.floor(Math.random() * 900 + 100)}`,
      empresaId: f.empresaId,
      empresaNome: empresa?.nomeFantasia ?? initial?.empresaNome ?? "—",
      cnpj: empresa?.cnpj ?? initial?.cnpj ?? "—",
      cliente: f.cliente || empresa?.clienteVinculado || "—",
      responsavelInterno: f.responsavelInterno || empresa?.adm || "—",
      despachante: f.despachante || "—",
      fornecedor: f.fornecedor || "—",
      paisOrigem: f.paisOrigem || "—",
      portoOrigem: f.portoOrigem || "—",
      portoDestino: f.portoDestino || "—",
      navio: f.navio || "—",
      bl: f.bl || "—",
      container: f.container || "—",
      dataEmbarque: f.dataEmbarque || TODAY,
      dataChegada: f.dataChegada || TODAY,
      status: f.status,
      etapa: f.etapa,
      valorFob: parseNum(f.valorFob),
      observacoes: f.observacoes,
      documentosPendentes: docs,
      temPendencia: docs.length > 0,
      refCliente: f.refCliente || undefined,
      numeroInvoice: f.numeroInvoice || undefined,
      mercadoria: f.mercadoria || undefined,
      qtdVolumes: intOpt(f.qtdVolumes),
      qtdContainers: intOpt(f.qtdContainers),
      numeroDi: f.numeroDi || undefined,
      protocoloDi: f.protocoloDi || undefined,
      dataRegistro: f.dataRegistro || undefined,
      canal: (f.canal || undefined) as CanalDespacho | undefined,
      fiscal: f.fiscal || undefined,
      dataDesembaraco: f.dataDesembaraco || undefined,
      impostoFederal: numOpt(f.impostoFederal),
      icms: numOpt(f.icms),
      valorAfrmm: numOpt(f.valorAfrmm),
      posicaoAtual: f.posicaoAtual || undefined,
      ceMercante: f.ceMercante || undefined,
      numeroManifesto: f.numeroManifesto || undefined,
      numeroEscala: f.numeroEscala || undefined,
      situacaoCarga: f.situacaoCarga || undefined,
      numeroDuimp: f.numeroDuimp || undefined,
      tipoDeclaracao: (f.tipoDeclaracao || undefined) as Processo["tipoDeclaracao"],
      cargaBloqueada: f.cargaBloqueada || undefined,
    };
    onSubmit(p);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Editar ${initial?.numeroInterno}` : "Novo processo de importação"}
      description="Todos os campos do despacho — operações, logística e impostos"
      icon={Ship}
      footer={
        <>
          <GhostButton type="button" onClick={onClose}>
            Cancelar
          </GhostButton>
          <PrimaryButton type="submit" form="form-processo">
            {editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? "Salvar alterações" : "Criar processo"}
          </PrimaryButton>
        </>
      }
    >
      <form id="form-processo" onSubmit={submit} className="space-y-5">
        {/* Identificação */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Identificação</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nº Processo" hint={editing ? undefined : "Em branco = automático"}>
              <Input value={f.numeroInterno} onChange={(e) => set("numeroInterno", e.target.value)} placeholder="IMP-001" />
            </Field>
            <Field label="Ref. Cliente">
              <Input value={f.refCliente} onChange={(e) => set("refCliente", e.target.value)} placeholder="ELV-2026-014" />
            </Field>
            <Field label="Empresa">
              <Select value={f.empresaId} onChange={(e) => set("empresaId", e.target.value)}>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nomeFantasia} · {emp.cnpj}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cliente" hint="Vazio = cliente da empresa">
              <Input value={f.cliente} onChange={(e) => set("cliente", e.target.value)} placeholder="Nome do cliente" />
            </Field>
            <Field label="Responsável interno">
              <Input value={f.responsavelInterno} onChange={(e) => set("responsavelInterno", e.target.value)} placeholder="Ex.: Marina Costa" />
            </Field>
            <Field label="Despachante">
              <Input value={f.despachante} onChange={(e) => set("despachante", e.target.value)} placeholder="Ex.: João Ferreira" />
            </Field>
          </div>
        </section>

        {/* Comercial & logística */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Comercial & logística</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Exportador / Fornecedor">
              <Input value={f.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} placeholder="Ex.: Shenzhen Tech Co." />
            </Field>
            <Field label="Mercadoria">
              <Input value={f.mercadoria} onChange={(e) => set("mercadoria", e.target.value)} placeholder="Ex.: Eletrônicos" />
            </Field>
            <Field label="Nº Invoice">
              <Input value={f.numeroInvoice} onChange={(e) => set("numeroInvoice", e.target.value)} placeholder="INV-0001" />
            </Field>
            <Field label="Nº Conhecimento (BL)">
              <Input value={f.bl} onChange={(e) => set("bl", e.target.value)} placeholder="BL-123456" />
            </Field>
            <Field label="Qtd. Volumes">
              <Input inputMode="numeric" value={f.qtdVolumes} onChange={(e) => set("qtdVolumes", e.target.value)} placeholder="1240" />
            </Field>
            <Field label="Qtd. Containers">
              <Input inputMode="numeric" value={f.qtdContainers} onChange={(e) => set("qtdContainers", e.target.value)} placeholder="2" />
            </Field>
            <Field label="Container">
              <Input value={f.container} onChange={(e) => set("container", e.target.value)} placeholder="MSKU1234567" />
            </Field>
            <Field label="Navio / transportadora">
              <Input value={f.navio} onChange={(e) => set("navio", e.target.value)} placeholder="MSC Isabella" />
            </Field>
            <Field label="País de origem">
              <Input value={f.paisOrigem} onChange={(e) => set("paisOrigem", e.target.value)} placeholder="China" />
            </Field>
            <Field label="Porto de origem">
              <Input value={f.portoOrigem} onChange={(e) => set("portoOrigem", e.target.value)} placeholder="Yantian" />
            </Field>
            <Field label="Porto de destino">
              <Input value={f.portoDestino} onChange={(e) => set("portoDestino", e.target.value)} placeholder="Santos (SP)" />
            </Field>
            <Field label="Valor FOB (R$)">
              <Input inputMode="decimal" value={f.valorFob} onChange={(e) => set("valorFob", e.target.value)} placeholder="248000" />
            </Field>
            <Field label="Dt. Embarque (ETD)">
              <Input type="date" value={f.dataEmbarque} onChange={(e) => set("dataEmbarque", e.target.value)} />
            </Field>
            <Field label="Dt. Chegada (ETA)">
              <Input type="date" value={f.dataChegada} onChange={(e) => set("dataChegada", e.target.value)} />
            </Field>
          </div>
        </section>

        {/* Despacho aduaneiro */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Despacho aduaneiro</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nº DI">
              <Input value={f.numeroDi} onChange={(e) => set("numeroDi", e.target.value)} placeholder="26/0884512-7" />
            </Field>
            <Field label="Protocolo DI">
              <Input value={f.protocoloDi} onChange={(e) => set("protocoloDi", e.target.value)} placeholder="SC2026.0884512" />
            </Field>
            <Field label="Dt. Registro">
              <Input type="date" value={f.dataRegistro} onChange={(e) => set("dataRegistro", e.target.value)} />
            </Field>
            <Field label="Canal">
              <Select value={f.canal} onChange={(e) => set("canal", e.target.value)}>
                <option value="">Não parametrizado</option>
                <option value="verde">🟢 Verde</option>
                <option value="amarelo">🟡 Amarelo</option>
                <option value="vermelho">🔴 Vermelho</option>
                <option value="cinza">⚪ Cinza</option>
              </Select>
            </Field>
            <Field label="Fiscal">
              <Input value={f.fiscal} onChange={(e) => set("fiscal", e.target.value)} placeholder="Auditor RFB" />
            </Field>
            <Field label="Dt. Desembaraço">
              <Input type="date" value={f.dataDesembaraco} onChange={(e) => set("dataDesembaraco", e.target.value)} />
            </Field>
            <Field label="Imposto Federal (R$)">
              <Input inputMode="decimal" value={f.impostoFederal} onChange={(e) => set("impostoFederal", e.target.value)} placeholder="89000" />
            </Field>
            <Field label="ICMS (R$)">
              <Input inputMode="decimal" value={f.icms} onChange={(e) => set("icms", e.target.value)} placeholder="31000" />
            </Field>
            <Field label="Vlr. AFRMM (R$)">
              <Input inputMode="decimal" value={f.valorAfrmm} onChange={(e) => set("valorAfrmm", e.target.value)} placeholder="14900" />
            </Field>
          </div>
        </section>

        {/* Carga / CE-Mercante / Siscomex */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Carga · CE-Mercante · Siscomex</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CE-Mercante">
              <Input value={f.ceMercante} onChange={(e) => set("ceMercante", e.target.value)} placeholder="152605000123456" />
            </Field>
            <Field label="Nº Manifesto">
              <Input value={f.numeroManifesto} onChange={(e) => set("numeroManifesto", e.target.value)} placeholder="1526500011627" />
            </Field>
            <Field label="Nº Escala">
              <Input value={f.numeroEscala} onChange={(e) => set("numeroEscala", e.target.value)} placeholder="26500000789" />
            </Field>
            <Field label="Situação da carga">
              <Input value={f.situacaoCarga} onChange={(e) => set("situacaoCarga", e.target.value)} placeholder="Manifestada / Atracada…" />
            </Field>
            <Field label="Tipo de declaração">
              <Select value={f.tipoDeclaracao} onChange={(e) => set("tipoDeclaracao", e.target.value)}>
                <option value="">Sem declaração</option>
                <option value="DI">DI</option>
                <option value="DUIMP">DUIMP</option>
                <option value="DTA">DTA</option>
                <option value="DSI">DSI</option>
              </Select>
            </Field>
            <Field label="Nº DUIMP">
              <Input value={f.numeroDuimp} onChange={(e) => set("numeroDuimp", e.target.value)} placeholder="26BR00000000001" />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2.5">
            <input
              type="checkbox"
              checked={f.cargaBloqueada}
              onChange={(e) => setF((s) => ({ ...s, cargaBloqueada: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-200"
            />
            <span className="text-sm font-medium text-rose-700">Carga bloqueada (cadeado vermelho)</span>
          </label>
        </section>

        {/* Status & situação */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status & situação</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={f.status} onChange={(e) => set("status", e.target.value)}>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Etapa">
              <Select value={f.etapa} onChange={(e) => set("etapa", e.target.value)}>
                {etapaOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Posição atual">
            <Textarea value={f.posicaoAtual} onChange={(e) => set("posicaoAtual", e.target.value)} placeholder="Ex.: Retido em canal amarelo — exigência fiscal." />
          </Field>
          <Field label="Documentos pendentes" hint="Separe por vírgula">
            <Input value={f.documentosPendentes} onChange={(e) => set("documentosPendentes", e.target.value)} placeholder="Invoice, Packing list" />
          </Field>
          <Field label="Observações">
            <Textarea value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Anotações internas do processo" />
          </Field>
        </section>
      </form>
    </Modal>
  );
}
