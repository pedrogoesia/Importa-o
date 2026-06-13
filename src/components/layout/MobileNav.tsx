"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Compact horizontal nav shown on small screens where the sidebar is hidden.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass lg:hidden overflow-x-auto scrollbar-thin border-b border-slate-200/70">
      <ul className="flex w-max gap-1 px-3 py-2">
        {navItems.map((item) => {
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
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-white text-brand-700 shadow-card ring-1 ring-slate-200/70"
                    : "text-slate-600 hover:bg-white/70"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
