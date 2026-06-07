"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "warning";

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Trigger a transient toast notification from any client component. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }
  return ctx.toast;
}

const toneConfig: Record<
  ToastTone,
  { icon: typeof CheckCircle2; color: string; ring: string }
> = {
  success: { icon: CheckCircle2, color: "text-emerald-500", ring: "ring-emerald-100" },
  info: { icon: Info, color: "text-brand-500", ring: "ring-brand-100" },
  warning: { icon: AlertTriangle, color: "text-amber-500", ring: "ring-amber-100" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, tone: "success", ...input }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => {
          const cfg = toneConfig[item.tone ?? "success"];
          const Icon = cfg.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover ring-1",
                cfg.ring
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cfg.color)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(item.id)}
                className="text-slate-300 transition hover:text-slate-500"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
