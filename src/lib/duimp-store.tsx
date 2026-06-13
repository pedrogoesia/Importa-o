"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useProcessos } from "@/lib/processos-store";
import { buildDuimp, recompute, type Duimp, type DuimpPendencia } from "@/data/duimp";
import { duimpService } from "@/lib/duimp-services";

const TODAY = new Date().toISOString().slice(0, 10);

interface DuimpContextValue {
  getDuimp: (processoId: string) => Duimp | undefined;
  todasPendencias: () => DuimpPendencia[];
  aprovarItem: (processoId: string, numero: number) => void;
  aprovarDoc: (processoId: string, tipo: string) => void;
  aprovarTributos: (processoId: string) => void;
  informarCarga: (processoId: string, patch: Partial<Duimp["carga"]>) => void;
  cadastrarOperador: (processoId: string, operadorId: string) => void;
  enviarCatalogo: (processoId: string, produtoId: string) => void;
  deferirLpco: (processoId: string, itemNumero: number) => void;
  solicitarDiagnostico: (processoId: string) => Promise<void>;
  registrar: (processoId: string) => Promise<{ numero: string } | null>;
  setModo: (processoId: string, modo: Duimp["modo"]) => void;
  setManual: (processoId: string, patch: { numero?: string; canal?: Duimp["canal"]; status?: Duimp["status"] }) => void;
}

const DuimpContext = createContext<DuimpContextValue | null>(null);

export function useDuimp() {
  const ctx = useContext(DuimpContext);
  if (!ctx) throw new Error("useDuimp deve ser usado dentro de <DuimpProvider>");
  return ctx;
}

export function DuimpProvider({ children }: { children: ReactNode }) {
  const { processos, getById } = useProcessos();
  const [overrides, setOverrides] = useState<Record<string, Duimp>>({});

  const getDuimp = useCallback(
    (processoId: string): Duimp | undefined => {
      if (overrides[processoId]) return overrides[processoId];
      const p = getById(processoId);
      return p ? buildDuimp(p) : undefined;
    },
    [overrides, getById]
  );

  const update = useCallback(
    (processoId: string, mutator: (d: Duimp) => Duimp) => {
      setOverrides((prev) => {
        const current = prev[processoId] ?? (() => {
          const p = getById(processoId);
          return p ? buildDuimp(p) : undefined;
        })();
        if (!current) return prev;
        return { ...prev, [processoId]: recompute(mutator(structuredCloneSafe(current))) };
      });
    },
    [getById]
  );

  const aprovarItem = useCallback((id: string, numero: number) => {
    update(id, (d) => {
      d.itens = d.itens.map((it) =>
        it.numero === numero
          ? {
              ...it,
              status: "pronto_duimp",
              atributos: it.atributos.map((a) => ({ ...a, valor: a.valor || "Validado" })),
            }
          : it
      );
      return d;
    });
  }, [update]);

  const aprovarDoc = useCallback((id: string, tipo: string) => {
    update(id, (d) => {
      d.documentos = d.documentos.map((dc) => (dc.tipo === tipo ? { ...dc, status: "aprovado", pendencias: [] } : dc));
      return d;
    });
  }, [update]);

  const aprovarTributos = useCallback((id: string) => {
    update(id, (d) => {
      d.tributos = { ...d.tributos, aprovadoUsuario: true };
      return d;
    });
  }, [update]);

  const informarCarga = useCallback((id: string, patch: Partial<Duimp["carga"]>) => {
    update(id, (d) => {
      d.carga = { ...d.carga, ...patch };
      return d;
    });
  }, [update]);

  const cadastrarOperador = useCallback((id: string, operadorId: string) => {
    update(id, (d) => {
      d.operadores = d.operadores.map((o) =>
        o.id === operadorId ? { ...o, statusCatalogo: "ativo", identificadorPortal: `OE-${Math.floor(Math.random() * 9000 + 1000)}` } : o
      );
      // itens que aguardavam esse operador deixam de bloquear
      d.itens = d.itens.map((it) => (it.operadorId === operadorId && it.status === "aguardando_operador" ? { ...it, status: "aguardando_atributo" } : it));
      return d;
    });
  }, [update]);

  const enviarCatalogo = useCallback((id: string, produtoId: string) => {
    update(id, (d) => {
      d.itens = d.itens.map((it) =>
        (it.produtoId ?? it.codigoInterno) === produtoId
          ? { ...it, codigoCatalogo: `CAT-${Math.floor(Math.random() * 900000 + 100000)}`, status: "pronto_duimp" }
          : it
      );
      return d;
    });
  }, [update]);

  const deferirLpco = useCallback((id: string, itemNumero: number) => {
    update(id, (d) => {
      d.lpco = d.lpco.map((l) => (l.itemNumero === itemNumero ? { ...l, status: "deferido", bloqueia: false, numeroLpco: `LPCO-${Math.floor(Math.random() * 90000 + 10000)}` } : l));
      return d;
    });
  }, [update]);

  const solicitarDiagnostico = useCallback(async (id: string) => {
    const d = getDuimp(id);
    if (!d) return;
    await duimpService.diagnostico(d.modo, { processoId: id });
    update(id, (cur) => {
      const erros: string[] = [];
      const alertas: string[] = [];
      if (cur.carga.modal === "maritimo" && !cur.carga.ceMercante) erros.push("CE Mercante não informado.");
      cur.itens.forEach((it) => {
        if (it.status === "aguardando_atributo") erros.push(`Item ${it.numero} sem atributo obrigatório do Catálogo.`);
        if (it.status === "aguardando_operador") erros.push(`Item ${it.numero} sem operador estrangeiro no Catálogo.`);
      });
      cur.lpco.filter((l) => l.exigeLpco && l.status !== "deferido").forEach((l) => erros.push(`Item ${l.itemNumero}: ${l.orgaoAnuente} exige LPCO ainda não deferido.`));
      if (cur.carga.incoterm === "CIF" && !cur.documentos.find((dc) => dc.tipo.toLowerCase().includes("seguro") && dc.status === "aprovado"))
        alertas.push("Incoterm CIF informado, mas documento de seguro não foi aprovado.");
      if (cur.lpco.some((l) => l.exigeLpco)) alertas.push("NCM pode exigir LPCO — verificar anuência.");
      cur.diagnostico = {
        status: erros.length ? "com_erro" : alertas.length ? "com_alerta" : "sem_erro",
        data: TODAY,
        usuario: "Marina Costa",
        erros,
        alertas,
      };
      return cur;
    });
  }, [getDuimp, update]);

  const registrar = useCallback(async (id: string) => {
    const d = getDuimp(id);
    if (!d) return null;
    const res = await duimpService.registrar(d.modo, { processoId: id });
    if (!res.ok || !res.data) return null;
    const data = res.data as { numero: string; versao: string };
    update(id, (cur) => {
      cur.registro = { numero: data.numero, versao: data.versao, dataRegistro: TODAY, usuario: "Marina Costa", status: "registrada", canal: "aguardando", mensagem: res.mensagem };
      cur.numero = data.numero;
      cur.versao = data.versao;
      cur.status = "registrada";
      return cur;
    });
    return { numero: data.numero };
  }, [getDuimp, update]);

  const setModo = useCallback((id: string, modo: Duimp["modo"]) => {
    update(id, (d) => { d.modo = modo; return d; });
  }, [update]);

  const setManual = useCallback((id: string, patch: { numero?: string; canal?: Duimp["canal"]; status?: Duimp["status"] }) => {
    update(id, (d) => {
      if (patch.numero !== undefined) { d.numero = patch.numero; d.registro.numero = patch.numero; }
      if (patch.canal !== undefined) { d.canal = patch.canal; d.registro.canal = patch.canal; }
      if (patch.status !== undefined) d.status = patch.status;
      return d;
    });
  }, [update]);

  const todasPendencias = useCallback((): DuimpPendencia[] => {
    return processos.flatMap((p) => getDuimp(p.id)?.pendencias ?? []);
  }, [processos, getDuimp]);

  return (
    <DuimpContext.Provider
      value={{
        getDuimp,
        todasPendencias,
        aprovarItem,
        aprovarDoc,
        aprovarTributos,
        informarCarga,
        cadastrarOperador,
        enviarCatalogo,
        deferirLpco,
        solicitarDiagnostico,
        registrar,
        setModo,
        setManual,
      }}
    >
      {children}
    </DuimpContext.Provider>
  );
}

// Clona sem depender de structuredClone (compat) mantendo objetos simples.
function structuredCloneSafe<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
