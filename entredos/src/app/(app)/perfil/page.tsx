'use client';

import { Settings, CreditCard, Users, LogOut, ChevronRight, Sparkles, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
         <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl border-2 border-background shadow-md">
            👩
         </div>
         <div>
            <h2 className="text-2xl font-heading font-semibold text-foreground">Carolina</h2>
            <p className="text-sm text-muted-foreground">Vinculada con: <b>David</b> 🧑</p>
         </div>
      </div>

      {/* Banner Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-premium/20 to-premium/5 border border-premium/30 p-6 flex flex-col items-start gap-4 shadow-sm">
         <div className="absolute right-0 top-0 w-32 h-32 bg-premium/10 blur-2xl rounded-full"></div>
         <div className="flex items-center gap-2 text-premium font-semibold">
            <Gem size={20} />
            <span>Plan Gratuito</span>
         </div>
         <p className="text-sm text-foreground/80 leading-relaxed max-w-[85%]">
            Descubran insights predictivos, metas ilimitadas, reglas de división dinámicas y exportación de reportes al mejorar a <b className="text-premium">EntreDos Premium</b>.
         </p>
         <Button className="bg-premium hover:bg-premium/90 text-white font-medium rounded-xl h-11 shadow-lg shadow-premium/20 relative z-10">
            Mejorar Plan de Pareja
         </Button>
      </div>

      <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden mt-6">
         <div className="p-4 border-b border-border/50 flex items-center justify-between cursor-pointer hover:bg-background/50 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={18} />
               </div>
               <div>
                  <p className="text-sm font-medium text-foreground">Reglas de Pareja</p>
                  <p className="text-xs text-muted-foreground">Reparto de gastos y presupuestos</p>
               </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
         </div>
         
         <div className="p-4 border-b border-border/50 flex items-center justify-between cursor-pointer hover:bg-background/50 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-alert/10 flex items-center justify-center text-alert">
                  <CreditCard size={18} />
               </div>
               <div>
                  <p className="text-sm font-medium text-foreground">Cuentas y Tarjetas</p>
                  <p className="text-xs text-muted-foreground">Métodos de pago preferidos</p>
               </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
         </div>

         <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-background/50 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <Settings size={18} />
               </div>
               <div>
                  <p className="text-sm font-medium text-foreground">Configuración General</p>
                  <p className="text-xs text-muted-foreground">Notificaciones, moneda y temas</p>
               </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
         </div>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-xl border-error text-error hover:bg-error/10 hover:text-error/90 gap-2 mt-4 font-medium">
         <LogOut size={18} />
         Cerrar Sesión
      </Button>
    </div>
  );
}
