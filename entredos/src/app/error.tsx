'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-heading font-semibold text-foreground">Algo no salió como esperábamos</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        Esta sección tuvo un pequeño tropiezo. Nuestro equipo ya está enterado.
      </p>
      <Button 
        onClick={() => reset()} 
        className="mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 w-full max-w-xs"
      >
        Intentar de nuevo
      </Button>
    </div>
  );
}
