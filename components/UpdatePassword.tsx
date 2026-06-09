import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type RecoverySessionState = 'checking' | 'ready' | 'missing';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState<RecoverySessionState>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const prepareRecoverySession = async () => {
      setError(null);
      setSessionState('checking');

      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (setSessionError) throw setSessionError;
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const { data: existingSession } = await supabase.auth.getSession();
            if (!existingSession.session) throw exchangeError;
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!isMounted) return;
        setSessionState(data.session ? 'ready' : 'missing');
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'No pudimos validar el enlace de recuperacion.');
        setSessionState('missing');
      }
    };

    prepareRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (!isMounted) return;
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setSessionState('ready');
          setError(null);
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sessionState !== 'ready') {
      setError('El enlace de recuperacion expiro o no es valido. Solicita uno nuevo.');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      await supabase.auth.signOut();
      window.setTimeout(() => {
        navigate('/?auth=login', { replace: true });
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'No pudimos actualizar tu contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 font-sans antialiased">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-primary text-3xl">key</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Actualizar contrasena</h2>
          <p className="text-sm text-gray-400 mt-1">Crea una nueva contrasena segura para tu cuenta.</p>
        </div>

        {sessionState === 'checking' ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-bold text-gray-400">Validando enlace de recuperacion...</p>
          </div>
        ) : success ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contrasena actualizada</h3>
            <p className="text-gray-400 text-sm">Te llevaremos al login para iniciar sesion de nuevo.</p>
          </div>
        ) : sessionState === 'missing' ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold text-red-300">
              {error || 'El enlace de recuperacion expiro o no es valido.'}
            </div>
            <button
              type="button"
              onClick={() => navigate('/?auth=login', { replace: true })}
              className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover transition-all"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Nueva contrasena</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none focus:border-primary"
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Confirmar contrasena</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none focus:border-primary"
                placeholder="********"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover transition-all mt-6 disabled:opacity-60">
              {loading ? 'Guardando...' : 'Cambiar contrasena'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
