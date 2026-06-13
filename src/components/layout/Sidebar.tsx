"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const groupOrder = [
  "Operação",
  "Financeiro",
  "Compliance",
  "Inteligência",
  "Sistema",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200/70 glass">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-card">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tightest text-slate-900">Escopo</p>
          <p className="text-[11px] text-slate-400">Operação inteligente</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {groupOrder.map((group) => {
          const items = navItems.filter((i) => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-5">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                          active
                            ? "bg-white font-semibold text-brand-700 shadow-card ring-1 ring-slate-200/70"
                            : "font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            active
                              ? "text-brand-600"
                              : "text-slate-400 group-hover:text-slate-500"
                          )}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            MC
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">Marina Costa</p>
            <p className="text-[11px] text-slate-400">ADM Operacional</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
