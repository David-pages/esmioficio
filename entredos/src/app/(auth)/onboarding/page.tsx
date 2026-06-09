'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else router.push('/invite');
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] border border-border/50">
      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-success' : 'w-4 bg-border'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-heading font-semibold mb-2 text-center">¡Hola! Creemos tu cuenta</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">El primer paso hacia finanzas más tranquilas.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>¿Cómo te llamas?</Label>
                <Input placeholder="Tu nombre" className="h-12 bg-background/50 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input type="email" placeholder="tu@correo.com" className="h-12 bg-background/50 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" placeholder="••••••••" className="h-12 bg-background/50 rounded-xl" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-heading font-semibold mb-2 text-center">Conozcamos tu perfil</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">Esto ayudará a EntreDos a darles mejores sugerencias.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ingreso mensual promedio (MXN)</Label>
                <Input type="number" placeholder="$20,000" className="h-12 bg-background/50 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>¿Cuál es tu estado actual?</Label>
                <select className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option>Vivimos juntos</option>
                  <option>Casados</option>
                  <option>Novios con gastos compartidos</option>
                  <option>Familia con hijos</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="w-16 h-16 bg-supporting/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🎯</div>
            <h2 className="text-2xl font-heading font-semibold mb-2 text-center">¿Cuál es su meta principal?</h2>
            <p className="text-muted-foreground text-center mb-6 text-sm">Tener un objetivo claro reduce las fricciones por dinero.</p>
            <div className="grid grid-cols-2 gap-3">
              {['Comprar Casa', 'Viaje juntos', 'Fondo de Emergencia', 'Boda', 'Auto nuevo', 'Saldar deudas'].map(goal => (
                <button key={goal} className="p-3 text-sm font-medium border border-border rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-colors text-foreground bg-background/30">
                  {goal}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={nextStep} className="w-full h-12 mt-8 bg-primary hover:bg-primary/90 text-white rounded-xl text-md font-medium shadow-md shadow-primary/20">
        {step === 3 ? 'Finalizar y Continuar' : 'Siguiente'}
      </Button>
    </div>
  );
}
