import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearOAuthIntent, readOAuthIntent, sanitizeReturnPath } from '../lib/authIntent';
import { supabase } from '../lib/supabaseClient';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Validando tu cuenta con Google...');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;

    const finishOAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const providerError = params.get('error_description') || params.get('error');
        if (providerError) throw new Error(providerError);

        const code = params.get('code');
        let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!sessionData.session && code) {
          const exchange = await supabase.auth.exchangeCodeForSession(code);
          if (exchange.error) throw exchange.error;
          sessionData = exchange.data;
          sessionError = null;
        }
        if (sessionError) throw sessionError;
        if (!sessionData.session) throw new Error('Google no devolvio una sesion valida. Intenta nuevamente.');

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw userError || new Error('No pudimos validar al usuario.');

        const intent = readOAuthIntent();
        setMessage('Preparando tu perfil...');
        const { data: completedRole, error: profileError } = await supabase.rpc('complete_oauth_profile', {
          p_desired_role: intent?.requestedRole || null,
          p_apply_role: intent?.mode === 'register',
          p_professional_data: intent?.professionalDraft || {}
        });
        if (profileError) throw profileError;

        const role = completedRole === 'PRO' ? 'PRO' : 'USER';
        const pendingFlow = Boolean(
          localStorage.getItem('esmiOficio_pending_contact') ||
          localStorage.getItem('esmiOficio_pending_quote')
        );
        const contextualReturn = pendingFlow ? sanitizeReturnPath(intent?.returnTo) : null;
        const destination = contextualReturn || (role === 'PRO' ? '/perfil' : '/mi-actividad');

        clearOAuthIntent();
        localStorage.removeItem('esmiOficio_pending_pro_registration');
        window.history.replaceState({}, document.title, '/auth/callback');
        if (active) navigate(destination, { replace: true });
      } catch (callbackError: any) {
        console.error('OAuth callback failed:', callbackError);
        if (!active) return;
        setError(callbackError?.message || 'No pudimos completar el inicio de sesion.');
      }
    };

    finishOAuth();
    return () => { active = false; };
  }, [navigate]);

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl sm:p-8" aria-live="polite">
        {!error ? (
          <>
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
            <h1 className="text-xl font-black text-white">Un momento</h1>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-5xl text-red-400">error</span>
            <h1 className="mt-3 text-xl font-black text-white">No se completo el acceso</h1>
            <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
            <button type="button" onClick={() => navigate('/?auth=login', { replace: true })} className="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-black text-background">
              Intentar nuevamente
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default AuthCallback;
