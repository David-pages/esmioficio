import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 flex flex-col md:flex-row">
      {/* Desktop sidebar placeholder - For now we focus Mobile First */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-6">
         <h1 className="text-2xl font-heading font-semibold text-primary mb-8">EntreDos</h1>
         <nav className="flex flex-col gap-2">
            <span className="text-secondary-foreground">Dashboard</span>
            <span className="text-muted-foreground">Metas</span>
            <span className="text-muted-foreground">Insights</span>
         </nav>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col min-h-screen relative">
        <TopBar />
        <div className="flex-1 p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
