import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-')
);

if (!isSupabaseConfigured) {
  console.info('Supabase is not configured. Local fallback data will be used.');
}

// createClient lanza un error si la URL esta vacia y eso deja la pantalla en
// negro. Con placeholders validos la app arranca y usa los datos locales.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'sb_publishable_placeholder';

export const supabase = createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
