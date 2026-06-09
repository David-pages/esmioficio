'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now we mock login and redirect to dashboard
    router.push('/');
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] border border-border/50">
      <h2 className="text-2xl font-heading font-semibold mb-6 text-center">Inicia sesión</h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Correo electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="tu@correo.com" 
            className="h-12 bg-background/50 border-border focus-visible:ring-primary rounded-xl"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">Contraseña</Label>
            <Link href="#" className="text-xs text-primary font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            className="h-12 bg-background/50 border-border focus-visible:ring-primary rounded-xl"
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-md font-medium shadow-md shadow-primary/20">
          Entrar
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-px bg-border flex-1"></div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">O continúa con</p>
        <div className="h-px bg-border flex-1"></div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="outline" className="w-full h-12 rounded-xl bg-card border-border hover:bg-background justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
          Google
        </Button>
      </div>

      <p className="text-center text-sm text-foreground mt-8">
        ¿Aún no tienen cuenta?{' '}
        <Link href="/onboarding" className="text-primary font-semibold hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
