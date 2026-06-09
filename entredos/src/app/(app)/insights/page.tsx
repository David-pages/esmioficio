'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
         <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-heading font-semibold text-foreground">Recomendaciones</h2>
            <Sparkles className="text-premium" size={24} />
         </div>
         <p className="text-sm text-muted-foreground">Insights imparciales generados por IA basados en sus hábitos reales, para ayudarles a avanzar sin juzgar. (Plan Premium)</p>
      </div>

      <div className="grid gap-5">
         
         {/* Insight Positivo */}
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-success/10 border border-success/20 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-success" />
               </div>
               <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Excelente equilibrio este mes</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                     El balance de sus aportaciones está alineado al 50/50 que definieron. Ambos están contribuyendo equitativamente según su acuerdo, lo que reduce la carga individual.
                  </p>
               </div>
            </div>
         </motion.div>

         {/* Insight Alerta Suave */}
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-alert/10 border border-alert/20 rounded-3xl p-5">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-alert/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-alert" />
               </div>
               <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Aumento en "Comida Fuera"</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                     Este mes el gasto en restaurantes aumentó un <span className="font-medium text-foreground">22%</span> ($1,400 MXN extra).
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-card rounded-2xl border border-alert/10">
                     <p className="text-xs font-medium text-foreground mb-1">💡 Sugerencia de la IA</p>
                     <p className="text-xs text-muted-foreground">Si reducen 2 salidas de ocio al mes, podrían enviar esos $1,400 al Fondo de Emergencia y alcanzarían su meta 18 días antes.</p>
                  </div>
               </div>
            </div>
         </motion.div>

         {/* Insight Proactivo */}
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-primary/5 border border-primary/20 rounded-3xl p-5">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-primary" />
               </div>
               <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">Suscripciones no utilizadas</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                     Hemos detectado cargos recurrentes de <span className="font-medium text-foreground">Netflix y HBO</span> bajo la cuenta de Sofía y cargados a un fondo individual, mientras que hay pagos duplicados en la tarjeta conjunta.
                  </p>
                  <Button variant="outline" className="mt-3 h-8 text-xs font-medium rounded-xl border-primary text-primary hover:bg-primary/5">
                     Revisar suscripciones compartidas
                  </Button>
               </div>
            </div>
         </motion.div>

      </div>
    </div>
  );
}
