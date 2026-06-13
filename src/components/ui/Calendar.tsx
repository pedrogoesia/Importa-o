"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  label: string;
  value?: string;
  tone?: "pagar" | "receber" | "neutro";
  done?: boolean;
}

const toneCls: Record<string, string> = {
  pagar: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  receber: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  neutro: "bg-slate-100 text-slate-600 hover:bg-slate-200",
};

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function Calendar({
  events,
  initialMonth,
  today,
  onEventClick,
}: {
  events: CalendarEvent[];
  initialMonth?: string;
  today?: string;
  onEventClick?: (id: string) => void;
}) {
  const seed = (initialMonth ?? today ?? new Date().toISOString().slice(0, 10)) + "T00:00:00";
  const base = new Date(seed);
  const [ym, setYm] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const startWeekday = new Date(ym.y, ym.m, 1).getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = (d: number) => {
    const iso = `${ym.y}-${String(ym.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === iso);
  };

  const prev = () => setYm((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }));
  const next = () => setYm((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }));

  const todayD = today ? new Date(today + "T00:00:00") : null;

  // resumo do mês
  const monthTotals = events.reduce(
    (acc, e) => {
      const [y, m] = e.date.split("-").map(Number);
      if (y === ym.y && m === ym.m + 1) acc[e.tone ?? "neutro"] = (acc[e.tone ?? "neutro"] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {MESES[ym.m]} {ym.y}
          </h3>
          <div className="flex gap-2 text-[11px] text-slate-400">
            {monthTotals.receber ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {monthTotals.receber} a receber
              </span>
            ) : null}
            {monthTotals.pagar ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> {monthTotals.pagar} a pagar
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        {WD.map((w) => (
          <div key={w} className="bg-slate-50 py-2 text-center text-[11px] font-medium text-slate-400">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="min-h-[96px] bg-white" />;
          const dayEvents = eventsByDay(d);
          const isToday =
            todayD && todayD.getFullYear() === ym.y && todayD.getMonth() === ym.m && todayD.getDate() === d;
          return (
            <div key={i} className="min-h-[96px] bg-white p-1.5">
              <div
                className={cn(
                  "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                  isToday ? "bg-brand-600 font-semibold text-white" : "text-slate-400"
                )}
              >
                {d}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick?.(e.id)}
                    title={`${e.label}${e.value ? ` · ${e.value}` : ""}`}
                    className={cn(
                      "flex w-full items-center justify-between gap-1 rounded px-1.5 py-0.5 text-left text-[10px] font-medium transition",
                      toneCls[e.tone ?? "neutro"],
                      e.done && "opacity-50 line-through"
                    )}
                  >
                    <span className="truncate">{e.label}</span>
                    {e.value && <span className="shrink-0 tabular-nums">{e.value}</span>}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1 text-[10px] text-slate-400">+{dayEvents.length - 3} mais</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
