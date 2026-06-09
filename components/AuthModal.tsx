import React, { useState, useMemo } from 'react';
import { MEXICO_LOCATIONS } from '../constants';
import { TradeCategory } from '../types';
import { supabase } from '../lib/supabaseClient';
import { getPasswordRecoveryRedirectUrl } from '../lib/siteUrl';

interface AuthModalProps {
  type: 'LOGIN' | 'REGISTER' | 'PRO_REGISTER';
  setType: (type: 'LOGIN' | 'REGISTER' | 'PRO_REGISTER') => void;
  onClose: () => void;
  onLogin: (name: string) => void;
  onRegisterPro?: (data: any) => void;
  trades?: TradeCategory[];
  contactIntent?: boolean;
}

type AuthStep = 'INFO' | 'FORGOT_PASSWORD' | 'SUCCESS';

const AuthModal: React.FC<AuthModalProps> = ({ type, setType, onClose, onLogin, onRegisterPro, trades = [], contactIntent = false }) => {
  const [step, setStep] = useState<AuthStep>('INFO');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    trade: '',
    stateId: '',
    municipality: '',
    customMunicipality: '',
    description: '',
    yearsExperience: '',
  });

  const availableMunicipalities = useMemo(() => {
    if (!formData.stateId) return [];
    const selectedState = MEXICO_LOCATIONS.find(s => s.id === formData.stateId);
    return selectedState ? selectedState.municipalities : [];
  }, [formData.stateId]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsVerifying(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href
      }
    });
    if (error) {
      setError(error.message);
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      if (type === 'LOGIN') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;

        onLogin(data.user?.user_metadata?.name || formData.email.split('@')[0]);
        onClose();
      } else {
        // Sign up with all data in metadata so the DB Trigger can handle it
        const selectedState = MEXICO_LOCATIONS.find(s => s.id === formData.stateId);
        const municipalityName = formData.municipality === 'other'
          ? formData.customMunicipality
          : availableMunicipalities.find(m => m.id === formData.municipality)?.name || '';

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: type === 'PRO_REGISTER' ? 'PRO' : 'USER',
              trade: formData.trade,
              description: formData.description,
              yearsExperience: formData.yearsExperience,
              state: selectedState?.name || '',
              municipality: municipalityName,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Este correo ya está registrado. Por favor, inicia sesión.');
            return;
          }
          throw signUpError;
        }

        // Check if user is created (even if confirmation is required)
        if (data.user) {
          // If a session exists, the user is automatically logged in (Auto-confirm ON)
          if (data.session) {
            if (type === 'PRO_REGISTER' && onRegisterPro) {
              onRegisterPro({
                ...formData,
                id: data.user.id,
                state: selectedState?.name || '',
                municipality: municipalityName,
                phone: ''
              });
            } else {
              onLogin(formData.name || formData.email.split('@')[0]);
            }
            onClose();
          } else {
            // Confirmation required (Auto-confirm OFF)
            setStep('SUCCESS');
            setSuccessMessage('¡Registro casi completo! Por favor revisa tu correo electrónico para confirmar tu cuenta y poder acceder a tu perfil.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.email.trim()) {
      setError('Escribe el correo de tu cuenta para enviarte el enlace.');
      setIsVerifying(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: getPasswordRecoveryRedirectUrl(),
      });
      if (error) throw error;
      setStep('SUCCESS');
      setSuccessMessage('Te enviamos un enlace para restablecer tu contrasena. Abre el correo y sigue las instrucciones.');
    } catch (err: any) {
      setError(err.message || 'No pudimos enviar el correo de recuperacion.');
    } finally {
      setIsVerifying(false);
    }
  };

  const title = type === 'LOGIN' ? 'Ingresar' : (type === 'PRO_REGISTER' ? 'Registro Profesional' : 'Crear Cuenta');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        {step === 'SUCCESS' ? (
          <div className="text-center space-y-4 py-6 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-green-500 text-4xl">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-bold text-white">¡Verifica tu correo!</h2>
            <p className="text-gray-400 leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover transition-all"
            >
              Entendido
            </button>
          </div>
        ) : step === 'INFO' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {type === 'LOGIN' ? 'lock' : (type === 'PRO_REGISTER' ? 'engineering' : 'person_add')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {contactIntent
                  ? 'Para proteger a clientes y profesionales, entra con Google y desbloquea el contacto seguro.'
                  : 'EsMiOficio: El Buro de Confianza de los oficios en Morelia.'}
              </p>
            </div>

            {type !== 'LOGIN' && (
              <div className="flex bg-surface-light rounded-xl p-1 mb-6 border border-border">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'REGISTER' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setType('REGISTER')}
                >
                  Soy Cliente
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${type === 'PRO_REGISTER' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setType('PRO_REGISTER')}
                >
                  Ofrezco Servicios
                </button>
              </div>
            )}


            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            {type === 'LOGIN' && (
              <>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-background font-black py-3.5 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  Continuar con Google
                </button>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-[10px] uppercase font-bold text-gray-600">o con correo</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
              </>
            )}

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {type !== 'LOGIN' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Nombre Completo</label>
                  <input required className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" placeholder="Ej. Carlos Pérez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Correo Electrónico</label>
                <input required type="email" className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" placeholder="correo@ejemplo.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Contraseña</label>
                <input required type="password" title="Contraseña" className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>

              {type === 'PRO_REGISTER' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Oficio</label>
                      <select required className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" value={formData.trade} onChange={e => setFormData({ ...formData, trade: e.target.value })}>
                        <option value="">Selecciona...</option>
                        {trades.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Años de Exp.</label>
                      <input required type="number" className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" placeholder="0" value={formData.yearsExperience} onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Estado</label>
                    <select required className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none" value={formData.stateId} onChange={e => setFormData({ ...formData, stateId: e.target.value, municipality: '' })}>
                      <option value="">Selecciona Estado...</option>
                      {MEXICO_LOCATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Municipio / Ciudad</label>
                    <select
                      required
                      disabled={!formData.stateId}
                      className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none disabled:opacity-50"
                      value={formData.municipality}
                      onChange={e => setFormData({ ...formData, municipality: e.target.value })}
                    >
                      <option value="">Selecciona Municipio...</option>
                      {availableMunicipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      <option value="other">-- OTRO (NO ESTÁ EN LA LISTA) --</option>
                    </select>
                  </div>

                  {formData.municipality === 'other' && (
                    <div className="animate-fade-in-down">
                      <label className="block text-[10px] uppercase font-bold text-primary mb-1">Especifique su Municipio</label>
                      <input
                        required
                        className="w-full bg-surface-light border-2 border-primary/50 p-3 rounded-xl text-white outline-none focus:border-primary"
                        placeholder="Nombre de su municipio"
                        value={formData.customMunicipality}
                        onChange={e => setFormData({ ...formData, customMunicipality: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Descripción corta de tus servicios</label>
                    <textarea required className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none resize-none" rows={3} placeholder="Describe qué haces..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                  </div>
                </>
              )}
            </div>

            {type === 'LOGIN' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('FORGOT_PASSWORD')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button disabled={isVerifying} type="submit" className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover transition-all mt-4">
              {isVerifying ? 'Procesando...' : (type === 'LOGIN' ? 'Entrar' : 'Registrarse')}
            </button>

            {type === 'LOGIN' ? (
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center animate-fade-in shadow-inner">
                <p className="text-sm text-gray-400 mb-2">¿No tienes cuenta?</p>
                <button
                  type="button"
                  onClick={() => {
                    setType('REGISTER');
                    setError(null);
                  }}
                  className="w-full bg-primary/20 text-primary font-bold py-3 rounded-xl hover:bg-primary/30 transition-all active:scale-95"
                >
                  Regístrate aquí
                </button>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center animate-fade-in shadow-inner">
                <p className="text-sm text-gray-400 mb-2">¿Ya tienes cuenta?</p>
                <button
                  type="button"
                  onClick={() => {
                    setType('LOGIN');
                    setError(null);
                  }}
                  className="w-full bg-primary/20 text-primary font-bold py-3 rounded-xl hover:bg-primary/30 transition-all active:scale-95"
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recuperar Contraseña</h2>
              <p className="text-sm text-gray-400 mt-1">Ingresa tu correo para recibir un enlace de recuperación.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Correo Electrónico</label>
              <input
                required
                type="email"
                className="w-full bg-surface-light border border-border p-3 rounded-xl text-white outline-none"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <button disabled={isVerifying} type="submit" className="w-full bg-primary text-background font-black py-4 rounded-xl hover:bg-primary-hover transition-all">
              {isVerifying ? 'Enviando...' : 'Enviar Enlace'}
            </button>

            <button type="button" onClick={() => setStep('INFO')} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors">
              Volver atrás
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
