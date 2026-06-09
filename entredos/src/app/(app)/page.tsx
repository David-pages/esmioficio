export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
        <p className="text-sm font-medium text-muted-foreground mb-1">Disponible conjunto</p>
        <h2 className="text-4xl font-heading font-semibold text-foreground">$12,450.00</h2>
        
        <div className="flex gap-4 mt-6">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Ingresos (Mes)</p>
            <p className="text-sm font-semibold text-success">+$34,000.00</p>
          </div>
          <div className="w-px bg-border"></div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Gastos (Mes)</p>
            <p className="text-sm font-semibold text-error">-$21,550.00</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-heading font-medium mb-4 text-foreground">Aportaciones (Este mes)</h3>
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4">
          
          <div className="flex justify-between items-end">
             <div>
                <p className="text-sm text-foreground font-medium">Tú (50%)</p>
                <p className="text-xl font-semibold">$10,775.00</p>
             </div>
             <div className="text-right">
                <p className="text-sm text-foreground font-medium">Sofía (50%)</p>
                <p className="text-xl font-semibold">$10,775.00</p>
             </div>
          </div>
          
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: '50%' }}></div>
            <div className="h-full bg-supporting" style={{ width: '50%' }}></div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Excelente, el gasto está equilibrado según su acuerdo de 50/50.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-heading font-medium text-foreground">Metas compartidas</h3>
           <span className="text-sm text-primary font-medium">Ver todas</span>
        </div>
        
        <div className="bg-gradient-to-br from-primary to-[#184847] rounded-3xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
           <div>
              <p className="text-white/80 text-sm font-medium">Fondo de Emergencia</p>
              <p className="text-2xl font-bold mt-1">$50,000</p>
              <p className="text-xs text-white/60">Objetivo: $100,000</p>
           </div>
           
           <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
             <div className="h-full bg-premium w-1/2"></div>
           </div>
           <p className="text-xs text-white/90">¡Van a la mitad! Sigan así.</p>
        </div>
      </section>

      <section className="pb-10">
         <h3 className="text-lg font-heading font-medium mb-4 text-foreground">Últimos movimientos</h3>
         <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">🍕</div>
                    <div>
                       <p className="text-sm font-medium text-foreground">Cena fin de semana</p>
                       <p className="text-xs text-muted-foreground">Pagado por Sofía • Mitad y Mitad</p>
                    </div>
                 </div>
                 <p className="text-sm font-semibold text-foreground">-$850.00</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
