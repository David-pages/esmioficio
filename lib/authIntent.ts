export type AppRole = 'USER' | 'PRO';
export type OAuthMode = 'login' | 'register';

export interface ProfessionalDraft {
  name: string;
  trade: string;
  yearsExperience: string;
  description: string;
  state: string;
  municipality: string;
}

export interface OAuthIntent {
  mode: OAuthMode;
  requestedRole: AppRole | null;
  returnTo: string | null;
  professionalDraft: ProfessionalDraft | null;
  createdAt: number;
}

const STORAGE_KEY = 'esmiOficio_oauth_intent';
const MAX_AGE_MS = 15 * 60 * 1000;

export const sanitizeReturnPath = (value: string | null | undefined) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
};

export const saveOAuthIntent = (intent: Omit<OAuthIntent, 'createdAt'>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, createdAt: Date.now() }));
};

export const readOAuthIntent = (): OAuthIntent | null => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as OAuthIntent | null;
    if (!parsed || Date.now() - parsed.createdAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      mode: parsed.mode === 'register' ? 'register' : 'login',
      requestedRole: parsed.requestedRole === 'PRO' || parsed.requestedRole === 'USER' ? parsed.requestedRole : null,
      returnTo: sanitizeReturnPath(parsed.returnTo),
      professionalDraft: parsed.professionalDraft || null,
      createdAt: parsed.createdAt
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearOAuthIntent = () => localStorage.removeItem(STORAGE_KEY);
