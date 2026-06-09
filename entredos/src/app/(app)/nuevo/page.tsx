'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, MapPin, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'comida_fuera', name: 'Comida fuera', icon: '🍕' },
  { id: 'supermercado', name: 'Super', icon: '🛒' },
  { id: 'transporte', name: 'Transporte', icon: '🚗' },
  { id: 'servicios', name: 'Servicios', icon: '⚡' },
  { id: 'ocio', name: 'Ocio', icon: '🎬' },
  { id: 'salud', name: 'Salud', icon: '🏥' },
  { id: 'regalos', name: 'Regalos', icon: '🎁' },
  { id: 'otros', name: 'Otros', icon: '📦' },
];

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<'gasto' | 'ingreso' | 'transferencia'>('gasto');
  const [split, setSplit] = useState<'yo' | 'pareja' | 'mitad'>('mitad');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock save
    router.push('/');
  };

  return (
    <div className="bg-card p-4 md:p-8 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] border border-border/50 max-w-xl mx-auto mt-4 md:mt-0 relative overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-background rounded-full transition-colors text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-heading font-semibold text-foreground">Nuevo Movimiento</h2>
      </div>

      {/* Tipo de movimiento */}
      <div className="flex bg-background/50 p-1 rounded-2xl mb-8 border border-border">
        {['gasto', 'ingreso', 'transferencia'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`flex-1 py-2 text-sm font-medium capitalize rounded-xl transition-all relative ${type === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {type === t && (
              <motion.div layoutId="type-blob" className="absolute inset-0 bg-white dark:bg-card rounded-xl shadow-sm border border-border/50" />
            )}
            <span className="relative z-10">{t}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monto Central */}
        <div className="text-center relative">
          <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Monto</p>
          <div className="flex items-center justify-center text-5xl font-heading font-bold text-foreground">
            <span className="text-muted-foreground text-3xl mr-1">$</span>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-48 bg-transparent border-none outline-none text-center focus:ring-0 p-0"
              autoFocus
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Quién pagó y cómo se divide */}
        {type === 'gasto' && (
          <div className="space-y-3 pt-4 border-t border-border/50">
             <label className="text-sm font-medium text-foreground">Dinámica del pago</label>
             <div className="flex gap-2">
                {[
                  { id: 'yo', label: 'Pagué yo' },
                  { id: 'pareja', label: 'Pagó mi pareja' },
                  { id: 'mitad', label: 'Mitad y Mitad' }
                ].map(opt => (
                  <button 
                     key={opt.id}
                     type="button"
                     onClick={() => setSplit(opt.id as any)}
                     className={`flex-1 py-3 px-2 rounded-xl text-xs font-medium border transition-colors ${split === opt.id ? 'bg-primary/10 border-primary text-primary' : 'bg-background/30 border-border text-muted-foreground hover:border-primary/50'}`}
                  >
                     {opt.label}
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* Categoría */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-foreground">Categoría</label>
             <button type="button" className="text-xs text-primary font-medium">Ver más</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
             {CATEGORIES.map(cat => (
                <button
                   key={cat.id}
                   type="button"
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${selectedCategory === cat.id ? 'border-primary bg-primary/5 shadow-sm scale-95' : 'border-border bg-background/30 hover:bg-background shadow-none'}`}
                >
                   <span className="text-2xl">{cat.icon}</span>
                   <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight truncate w-full">{cat.name}</span>
                </button>
             ))}
          </div>
        </div>

        {/* Extras: Nota, Ticket, Fecha */}
        <div className="space-y-4 pt-4 border-t border-border/50">
           <Input 
             placeholder="Agregar una nota (opcional)" 
             className="h-12 bg-background/50 border-border focus-visible:ring-primary rounded-xl"
           />
           <div className="flex gap-3">
              <button type="button" className="flex items-center justify-center gap-2 h-12 flex-1 rounded-xl border border-dashed border-border text-muted-foreground hover:bg-background/50 transition-colors text-sm font-medium">
                 <Upload size={16} /> Adjuntar ticket
              </button>
              <button type="button" className="flex items-center justify-center w-12 h-12 rounded-xl border border-border text-muted-foreground hover:bg-background/50 transition-colors">
                 <MapPin size={18} />
              </button>
              <button type="button" className="flex items-center justify-center w-12 h-12 rounded-xl border border-border text-muted-foreground hover:bg-background/50 transition-colors">
                 <Tag size={18} />
              </button>
           </div>
        </div>

        <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-medium shadow-xl shadow-primary/20 mt-4">
          Guardar movimiento
        </Button>
      </form>
    </div>
  );
}
