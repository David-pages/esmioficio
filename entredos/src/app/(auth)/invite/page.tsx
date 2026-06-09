'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Copy, Link as LinkIcon, Share2 } from 'lucide-react';

export default function InvitePage() {
  const router = useRouter();

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] border border-border/50 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-3xl z-10 relative">
            🧑
          </div>
          <div className="w-20 h-20 rounded-full bg-supporting/20 border-4 border-white flex items-center justify-center text-3xl absolute top-0 -right-10">
            👩
          </div>
        </div>
      </motion.div>

      <h2 className="text-2xl font-heading font-semibold mb-2">Invita a tu pareja</h2>
      <p className="text-muted-foreground mb-8 text-sm px-4">
        Construyan juntos una visión más clara de su dinero. Ambos verán el progreso desde sus celulares.
      </p>

      <div className="bg-background/50 border border-border rounded-2xl p-4 mb-6 relative overflow-hidden group">
        <p className="text-xs text-muted-foreground font-medium mb-1 text-left">Tu código de invitación</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-mono font-bold text-primary tracking-widest">A7K-9P2</p>
          <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button className="w-full h-12 bg-success hover:bg-success/90 text-white rounded-xl text-md font-medium shadow-md shadow-success/20 gap-2">
          <Share2 size={18} />
          Compartir Enlace
        </Button>
        <Button variant="outline" className="w-full h-12 border-border text-foreground hover:bg-background rounded-xl gap-2">
          <LinkIcon size={18} />
          Copiar Enlace
        </Button>
      </div>

      <button onClick={handleSkip} className="mt-6 text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
        Lo haré más tarde
      </button>
    </div>
  );
}
