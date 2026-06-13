"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { processos as seed } from "@/data/processos";
import type { Processo } from "@/types";

interface ProcessosContextValue {
  processos: Processo[];
  getById: (id: string) => Processo | undefined;
  addProcesso: (p: Processo) => void;
  updateProcesso: (p: Processo) => void;
}

const ProcessosContext = createContext<ProcessosContextValue | null>(null);

export function useProcessos() {
  const ctx = useContext(ProcessosContext);
  if (!ctx) throw new Error("useProcessos deve ser usado dentro de <ProcessosProvider>");
  return ctx;
}

export function ProcessosProvider({ children }: { children: ReactNode }) {
  const [processos, setProcessos] = useState<Processo[]>(seed);

  const getById = useCallback(
    (id: string) => processos.find((p) => p.id === id),
    [processos]
  );

  const addProcesso = useCallback((p: Processo) => {
    setProcessos((prev) => [p, ...prev]);
  }, []);

  const updateProcesso = useCallback((p: Processo) => {
    setProcessos((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }, []);

  return (
    <ProcessosContext.Provider value={{ processos, getById, addProcesso, updateProcesso }}>
      {children}
    </ProcessosContext.Provider>
  );
}
