import {
  LayoutDashboard,
  Building2,
  Ship,
  FileText,
  Container,
  Wallet,
  Receipt,
  Landmark,
  Radar,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Settings,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, group: "Operação" },
  { label: "Empresas", href: "/empresas", icon: Building2, group: "Operação" },
  { label: "Processos", href: "/processos", icon: Ship, group: "Operação" },
  { label: "Documentos", href: "/documentos", icon: FileText, group: "Operação" },
  { label: "Cargas", href: "/cargas", icon: Container, group: "Operação" },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, group: "Financeiro" },
  { label: "Boletos", href: "/boletos", icon: Receipt, group: "Financeiro" },
  { label: "Fiscal", href: "/fiscal", icon: Landmark, group: "Financeiro" },
  { label: "Radar", href: "/radar", icon: Radar, group: "Compliance" },
  { label: "Certificados", href: "/certificados", icon: ShieldCheck, group: "Compliance" },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3, group: "Inteligência" },
  { label: "Central de IA", href: "/ia", icon: Sparkles, group: "Inteligência" },
  { label: "Integrações", href: "/integracoes", icon: Database, group: "Sistema" },
  { label: "Configurações", href: "/configuracoes", icon: Settings, group: "Sistema" },
];
