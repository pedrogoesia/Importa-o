"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Bell, Sparkles, Building2, Ship, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { empresas } from "@/data/empresas";
import { processos } from "@/data/processos";
import { alertas } from "@/data/alertas";
import { cn } from "@/lib/utils";

type Result = {
  href: string;
  title: string;
  subtitle: string;
  icon: typeof Building2;
  badge: string;
};

const severityDot: Record<string, string> = {
  critico: "bg-rose-500",
  atencao: "bg-amber-500",
  informativo: "bg-sky-500",
  resolvido: "bg-emerald-500",
};

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const notificacoes = useMemo(
    () => alertas.filter((a) => a.status !== "resolvido").slice(0, 5),
    []
  );

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const empresaHits = empresas
      .filter(
        (e) =>
          e.nomeFantasia.toLowerCase().includes(q) ||
          e.razaoSocial.toLowerCase().includes(q) ||
          e.cnpj.includes(q) ||
          e.adm.toLowerCase().includes(q)
      )
      .map<Result>((e) => ({
        href: `/empresas/${e.id}`,
        title: e.nomeFantasia,
        subtitle: `${e.cnpj} · ${e.uf}`,
        icon: Building2,
        badge: "Empresa",
      }));
    const processoHits = processos
      .filter(
        (p) =>
          p.numeroInterno.toLowerCase().includes(q) ||
          p.bl.toLowerCase().includes(q) ||
          p.container.toLowerCase().includes(q) ||
          p.empresaNome.toLowerCase().includes(q) ||
          p.cliente.toLowerCase().includes(q)
      )
      .map<Result>((p) => ({
        href: `/processos/${p.id}`,
        title: `${p.numeroInterno} · ${p.bl}`,
        subtitle: `${p.empresaNome} · ${p.cliente}`,
        icon: Ship,
        badge: "Processo",
      }));
    return [...empresaHits, ...processoHits].slice(0, 8);
  }, [query]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setQuery("");
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/70 px-4 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-slate-900">Escopo</span>
      </div>

      <div ref={searchRef} className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].href);
            if (e.key === "Escape") setSearchOpen(false);
          }}
          placeholder="Buscar empresa, processo, BL ou container…"
          className="w-full rounded-full border border-slate-200/80 bg-white/70 py-2 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100/70"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-hover">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Nada encontrado para “{query}”.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto scrollbar-thin py-1">
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <li key={r.href}>
                      <button
                        onClick={() => go(r.href)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {r.title}
                          </p>
                          <p className="truncate text-xs text-slate-400">{r.subtitle}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {r.badge}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/ia"
          className="hidden items-center gap-2 rounded-full bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-700 active:scale-[0.98] sm:flex"
        >
          <Sparkles className="h-4 w-4" />
          Copiloto
        </Link>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-500 transition hover:bg-slate-50",
              notifOpen && "bg-slate-50 text-slate-700"
            )}
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px]" />
            {notificacoes.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-hover">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-900">Notificações</span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600">
                  {notificacoes.length} ativas
                </span>
              </div>
              <ul className="max-h-80 overflow-y-auto scrollbar-thin py-1">
                {notificacoes.map((a) => (
                  <li key={a.id}>
                    <Link
                      href="/relatorios"
                      onClick={() => setNotifOpen(false)}
                      className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          severityDot[a.prioridade] ?? "bg-slate-400"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{a.tipo}</p>
                        <p className="line-clamp-2 text-xs text-slate-500">{a.descricao}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {a.empresaNome}
                          {a.processoNumero ? ` · ${a.processoNumero}` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/relatorios"
                onClick={() => setNotifOpen(false)}
                className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 transition hover:bg-slate-50"
              >
                Ver todos os alertas
              </Link>
            </div>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white sm:hidden">
          MC
        </div>
      </div>
    </header>
  );
}
