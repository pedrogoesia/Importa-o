"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto scrollbar-thin rounded-full border border-slate-200/70 bg-slate-100/70 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-brand-700 shadow-card"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
