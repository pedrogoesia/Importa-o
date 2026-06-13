"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmpresaOption {
  value: string;
  label: string;
}

/**
 * Seletor de empresas reutilizável: permite escolher 1, várias ou todas.
 * `selected` vazio = todas as empresas.
 */
export function EmpresaMultiSelect({
  options,
  selected,
  onChange,
  className,
}: {
  options: EmpresaOption[];
  selected: string[];
  onChange: (vals: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const allSelected = selected.length === 0;

  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };

  const label = allSelected
    ? "Todas as empresas"
    : selected.length === 1
    ? options.find((o) => o.value === selected[0])?.label ?? "1 empresa"
    : `${selected.length} empresas`;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-slate-50",
          allSelected ? "border-slate-200 text-slate-600" : "border-brand-200 text-brand-700"
        )}
      >
        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-hover">
          <button
            type="button"
            onClick={() => onChange([])}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm font-medium transition hover:bg-slate-50",
              allSelected ? "text-brand-700" : "text-slate-600"
            )}
          >
            Todas as empresas
            {allSelected && <Check className="h-4 w-4" />}
          </button>
          <div className="border-t border-slate-100" />
          <ul className="max-h-60 overflow-y-auto scrollbar-thin py-1">
            {options.map((o) => {
              const checked = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                        checked ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"
                      )}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{o.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!allSelected && (
            <>
              <div className="border-t border-slate-100" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-3 py-2 text-center text-xs font-medium text-brand-600 transition hover:bg-slate-50"
              >
                Limpar seleção
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
