'use client';

import { motion } from 'framer-motion';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
         <div>
           <h2 className="text-2xl font-heading font-semibold text-foreground">Metas Compartidas</h2>
           <p className="text-sm text-muted-foreground mt-1">Acérquense a sus sueños juntos</p>
         </div>
         <Button className="w-12 h-12 rounded-full p-0 shadow-lg bg-primary hover:bg-primary/90">
            <Plus size={24} />
         </Button>
      </div>

      <div className="grid gap-4">
        {/* Meta Activa 1 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#1E1E24] to-[#2A2A32] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-0"></div>
           
           <div className="flex justify-between items-start relative z-10 mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5">
                    <span className="text-2xl">🏡</span>
                 </div>
                 <div>
                    <h3 className="font-heading font-semibold text-lg">Casa Propia</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
                       <Calendar size={12} />
                       <span>Dic 2027</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-xs text-white/60 font-medium">Acumulado</p>
                 <p className="font-semibold text-xl">$120k</p>
                 <p className="text-xs text-white/40">de $500k</p>
              </div>
           </div>

           <div className="space-y-2 relative z-10">
              <div className="flex justify-between text-xs font-medium">
                 <span className="text-success">24% completado</span>
                 <span className="text-white/60">Faltan $380k</span>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '24%' }}></div>
              </div>
           </div>
           
           <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full border-2 border-[#2A2A32] bg-primary flex items-center justify-center text-[10px] font-bold">M</div>
                 <div className="w-8 h-8 rounded-full border-2 border-[#2A2A32] bg-supporting flex items-center justify-center text-[10px] font-bold">S</div>
              </div>
              <Button variant="ghost" className="h-8 text-xs font-medium text-white hover:bg-white/10 rounded-lg">Aportar</Button>
           </div>
        </motion.div>

        {/* Otra Meta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <span className="text-2xl">✈️</span>
                 </div>
                 <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">Viaje a Japón</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                       <Calendar size={12} />
                       <span>Oct 2026</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-xs text-muted-foreground font-medium">Acumulado</p>
                 <p className="font-semibold text-xl text-foreground">$45k</p>
                 <p className="text-xs text-muted-foreground">de $90k</p>
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                 <span className="text-primary">50% completado</span>
                 <span className="text-muted-foreground">Faltan $45k</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-border/50">
             <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background p-2 rounded-lg">
                <TrendingUp size={14} className="text-success" />
                <span>Ban buen ritmo. Llegarán a la meta 1 mes antes.</span>
             </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
