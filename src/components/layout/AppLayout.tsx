import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { ToastProvider } from "@/components/ui/Toast";
import { ProcessosProvider } from "@/lib/processos-store";
import { DuimpProvider } from "@/lib/duimp-store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProcessosProvider>
        <DuimpProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <MobileNav />
            <main className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
        </DuimpProvider>
      </ProcessosProvider>
    </ToastProvider>
  );
}
