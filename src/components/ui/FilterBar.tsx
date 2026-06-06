"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = "Buscar…",
  filters = [],
  values = {},
  onFilterChange,
  className,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className
      )}
    >
      {onSearch && (
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      )}
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] ?? ""}
          onChange={(e) => onFilterChange?.(f.key, e.target.value)}
          className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-600 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">{f.label}: todos</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
