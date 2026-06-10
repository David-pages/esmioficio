
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedPros from './components/FeaturedPros';
import MexicoFocus from './components/MexicoFocus';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import SEOHelmet from './components/SEOHelmet';
import ActivityFeed from './components/ActivityFeed';

const AuthModal = lazy(() => import('./components/AuthModal'));
const ContactModal = lazy(() => import('./components/ContactModal'));
const SuggestTradeModal = lazy(() => import('./components/SuggestTradeModal'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./components/TermsConditions'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Blog = lazy(() => import('./components/Blog'));
const JobBoard = lazy(() => import('./components/JobBoard'));
const UpdatePassword = lazy(() => import('./components/UpdatePassword'));
const CategorySEOPage = lazy(() => import('./components/CategorySEOPage'));
const ProfileSEOPage = lazy(() => import('./components/ProfileSEOPage'));
const BlogPostSEOPage = lazy(() => import('./components/BlogPostSEOPage'));
const ReportProfessionalPage = lazy(() => import('./components/ReportProfessionalPage'));
const ClientDashboard = lazy(() => import('./components/ClientDashboard'));
import { MEXICO_LOCATIONS, PROFESSIONALS_DATA, TRADES as INITIAL_TRADES } from './constants';
import { ClientProfileUpdate, SearchFilters, Professional, Review, TradeRequest, TradeCategory, ToastNotification, User } from './types';
import { supabase } from './lib/supabaseClient';
import { recordAnalyticsEvent } from './lib/analytics';
import { seedTestUsers } from './lib/seedData';
import {
  buildWhatsAppMessage,
  getProfessionalCity,
  mapProfessionalRow,
  normalizePhoneForWhatsApp,
  recordActivityEvent,
  recordClientContactEvent
} from './lib/trust';

type ViewState = 'HOME' | 'SEARCH' | 'PROFILE' | 'PRIVACY' | 'TERMS' | 'ABOUT' | 'BLOG' | 'FAVORITES' | 'JOBBOARD' | 'CLIENT_DASHBOARD';
type ModalState = 'LOGIN' | 'REGISTER' | 'PRO_REGISTER' | 'SUGGEST_TRADE' | 'CONTACT' | null;

const mergeProfessionals = (incoming: Professional[], existing: Professional[] = []) => {
  const byId = new Map<string, Professional>();

  incoming.forEach(pro => byId.set(pro.id, pro));

  existing.forEach(oldPro => {
    const newPro = byId.get(oldPro.id);
    if (!newPro) {
      byId.set(oldPro.id, oldPro);
      return;
    }

    byId.set(oldPro.id, {
      ...newPro,
      phone: oldPro.phone || newPro.phone,
      email: oldPro.email || newPro.email,
      reviewsList: newPro.reviewsList.length > 0 ? newPro.reviewsList : oldPro.reviewsList,
      rating: newPro.reviews > 0 ? newPro.rating : oldPro.rating || newPro.rating,
      reviews: Math.max(newPro.reviews || 0, oldPro.reviews || 0)
    });
  });

  return Array.from(byId.values());
};

const NotFoundPage: React.FC<{ onGoHome: () => void; onSearch: () => void }> = ({ onGoHome, onSearch }) => (
  <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
    <div className="max-w-md text-center">
      <p className="mb-2 text-7xl font-extrabold text-primary">404</p>
      <h1 className="mb-2 text-2xl font-extrabold text-white">Pagina no encontrada</h1>
      <p className="mb-6 text-sm text-gray-400">
        La pagina que buscas no existe o cambio de direccion. Puedes volver al inicio o buscar un profesional.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onGoHome}
          className="rounded-xl bg-primary px-6 py-3 font-bold text-background transition-opacity hover:opacity-90"
        >
          Ir al inicio
        </button>
        <button
          onClick={onSearch}
          className="rounded-xl border border-border bg-surface px-6 py-3 font-bold text-white transition-colors hover:border-primary/50"
        >
          Buscar profesionales
        </button>
      </div>
    </div>
  </div>
);

const FullPageLoader: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-sm font-bold text-gray-400">{message}</p>
    </div>
  </div>
);

const LoginRequired: React.FC<{ onLoginRequest: () => void }> = ({ onLoginRequest }) => {
  useEffect(() => {
    onLoginRequest();
  }, []);

  return <FullPageLoader message="Abriendo inicio de sesion..." />;
};

const REVIEW_COLUMNS = 'id, author_id, author_name, rating, text, images, created_at';
const LEGACY_REVIEW_COLUMNS = 'id, author_id, author_name, rating, text, created_at';
const PROFESSIONAL_PUBLIC_COLUMNS = 'id,name,trade,location,municipality,state,rating,reviews_count,image_url,cover_image_url,portfolio_images,verified,description,years_experience,last_sensitive_update,response_time_minutes,coverage_zones,services,starting_price,last_active_at,jobs_count,recommendations_count,trust_status,verification_level';
const PROFESSIONAL_LEGACY_COLUMNS = 'id,name,trade,location,municipality,state,rating,reviews_count,image_url,cover_image_url,portfolio_images,verified,description,years_experience,last_sensitive_update';

const isMissingReviewImagesColumnError = (error: any) => {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return message.includes('images') && (
    message.includes('could not find') ||
    message.includes('column') ||
    error?.code === 'PGRST204' ||
    error?.code === '42703'
  );
};

const runReviewSelect = async (buildQuery: (columns: string) => any) => {
  let response = await buildQuery(REVIEW_COLUMNS);
  if (response.error && isMissingReviewImagesColumnError(response.error)) {
    response = await buildQuery(LEGACY_REVIEW_COLUMNS);
  }
  return response;
};

const isMissingProfessionalSchemaError = (error: any) => {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    error?.code === '42P01' ||
    message.includes('could not find') ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
};

const loadPublicProfessionals = async () => {
  let response = await supabase
    .from('professionals_public')
    .select(PROFESSIONAL_PUBLIC_COLUMNS);

  if (!response.error) return response;

  if (isMissingProfessionalSchemaError(response.error)) {
    const legacyViewResponse = await supabase
      .from('professionals_public')
      .select(PROFESSIONAL_LEGACY_COLUMNS);

    if (!legacyViewResponse.error) return legacyViewResponse;
  }

  const tableFallbackResponse = await supabase
    .from('professionals')
    .select(PROFESSIONAL_LEGACY_COLUMNS);

  return tableFallbackResponse.error ? response : tableFallbackResponse;
};

const mapReviewRow = (row: any): Review => ({
  id: row.id,
  authorId: row.author_id,
  author: row.author_name || 'Cliente de EsMiOficio',
  rating: Number(row.rating) || 0,
  text: row.text || '',
  date: new Date(row.created_at).toLocaleDateString('es-ES'),
  images: Array.isArray(row.images) ? row.images.filter((item: unknown): item is string => typeof item === 'string' && item.length > 0) : []
});

const getReviewSaveErrorMessage = (error: any) => {
  const message = String(error?.message || '');
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('row-level security') || error?.code === '42501') {
    return 'No pudimos validar el contacto en Supabase. Contacta al profesional otra vez o solicita cotizacion antes de publicar la resena.';
  }
  if (isMissingReviewImagesColumnError(error)) {
    return 'La tabla de resenas necesita la columna images. Se guardo sin fotos si tu base todavia usa el esquema anterior.';
  }
  if (error?.code === '23505' || lowerMessage.includes('duplicate key')) {
    return 'Ya tenias una resena para este profesional. Intenta actualizarla de nuevo.';
  }
  return message || 'No se pudo guardar la resena. Intenta de nuevo.';
};

const normalizeAppRole = (value?: unknown): 'USER' | 'PRO' => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'pro' || normalized === 'profesional' || normalized === 'professional') return 'PRO';
  return 'USER';
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const view = location.pathname;
  const [searchParams] = useSearchParams();
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "EsMiOficio",
      "url": "https://esmioficio.mx/",
      "inLanguage": "es-MX",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://esmioficio.mx/buscar?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "EsMiOficio",
      "url": "https://esmioficio.mx/",
      "logo": "https://esmioficio.mx/og-image.svg",
      "areaServed": {
        "@type": "Country",
        "name": "Morelia, Michoacan"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Buro de Confianza de oficios en Morelia",
      "areaServed": "Morelia, Michoacan",
      "provider": {
        "@type": "Organization",
        "name": "EsMiOficio"
      },
      "serviceType": [
        "Plomeria",
        "Electricidad",
        "Pintura",
        "Carpinteria",
        "Albanileria",
        "Reparaciones para hogar y negocio"
      ]
    }
  ];
  
  const setView = (v: string) => {
    switch(v) {
      case 'HOME': navigate('/'); break;
      case 'SEARCH': navigate('/buscar'); break;
      case 'FAVORITES': navigate('/favoritos'); break;
      case 'JOBBOARD': navigate('/proyectos'); break;
      case 'PROFILE': navigate('/perfil'); break;
      case 'PRIVACY': navigate('/privacidad'); break;
      case 'TERMS': navigate('/terminos'); break;
      case 'ABOUT': navigate('/nosotros'); break;
      case 'BLOG': navigate('/blog'); break;
      case 'CLIENT_DASHBOARD': navigate('/mi-actividad'); break;
      default: navigate('/'); break;
    }
  };
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    if (searchParams.get('auth') === 'login') {
      setModal('LOGIN');
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '', state: 'all', municipality: 'all', category: null, verifiedOnly: false, minRating: 0 });
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [contactPro, setContactPro] = useState<Professional | null>(null); // Estado para el profesional a contactar
  const [pendingContactProId, setPendingContactProId] = useState<string | null>(() => localStorage.getItem('esmiOficio_pending_contact'));
  const [pendingQuoteProId, setPendingQuoteProId] = useState<string | null>(() => localStorage.getItem('esmiOficio_pending_quote'));
  const [pendingOperations] = useState<Set<string>>(new Set()); // Para evitar operaciones duplicadas en vuelo

  // -- PERSISTENCIA DE DATOS CON SUPABASE --
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalsLoaded, setProfessionalsLoaded] = useState(false);
  const [professionalsLoadError, setProfessionalsLoadError] = useState<string | null>(null);
  const [trades, setTrades] = useState<TradeCategory[]>(INITIAL_TRADES);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [activeServiceRequest, setActiveServiceRequest] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const getContactedStorageKey = (clientId: string, proId: string) => `contacted_${clientId}_${proId}`;

  const ensureReviewEligibility = async (clientId: string, clientName: string, proId: string) => {
    const localKey = getContactedStorageKey(clientId, proId);

    const pro = professionals.find(p => p.id === proId);
    if (!pro) {
      localStorage.removeItem(localKey);
      return false;
    }

    const { data: existing, error: checkError } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('client_id', clientId)
      .eq('professional_id', proId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Error checking review eligibility:', checkError);
      localStorage.removeItem(localKey);
      return false;
    }

    if (existing && existing.length > 0) {
      localStorage.setItem(localKey, 'true');
      return true;
    }

    const { error: insertError } = await supabase.from('service_requests').insert([{
      client_id: clientId,
      professional_id: proId,
      client_name: clientName,
      professional_name: pro.name,
      trade: pro.trade,
      details: `Contacto via ${pro.phone ? 'WhatsApp/Telefono' : 'Correo'}`,
      status: 'PENDING',
      quote_amount: 0
    }]);

    if (insertError) {
      console.error('Error creating review eligibility:', insertError);
      localStorage.removeItem(localKey);
      return false;
    }

    localStorage.setItem(localKey, 'true');
    return true;
  };

  // Escuchar cambios en la autenticación
  useEffect(() => {
    // Verificar recuperación por hash de URL para mayor seguridad
    let isMounted = true;

    const redirectAfterSignIn = (resolvedUser: User | null) => {
      if (!resolvedUser) return;

      const hasPendingIntent = Boolean(
        localStorage.getItem('esmiOficio_pending_contact') ||
        localStorage.getItem('esmiOficio_pending_quote')
      );
      if (hasPendingIntent) return;

      if (resolvedUser.role === 'PRO') {
        setSelectedProId(resolvedUser.proId || resolvedUser.id);
        navigate('/perfil', { replace: true });
        return;
      }

      navigate('/mi-actividad', { replace: true });
    };

    const syncAuthSession = async (event: string, session: any, redirectOnSignIn = false) => {
      try {
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/update-password', { replace: true });
          setAuthChecked(true);
          return;
        }

        if (session?.user) {
          const resolvedUser = await fetchUserProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata
          );

          if (!isMounted) return;
          if (redirectOnSignIn) {
            redirectAfterSignIn(resolvedUser);
          }
        } else {
          setUser(null);
          setSelectedProId(null);
          setActiveServiceRequest(null);
          setIncomingRequests([]);
        }
      } catch (error) {
        console.error('Error syncing auth session:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setAuthChecked(true);
      }
    };

    if (window.location.hash.includes('type=recovery') && window.location.pathname !== '/update-password') {
      navigate('/update-password' + window.location.hash);
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => syncAuthSession('INITIAL_SESSION', session))
      .catch(error => {
        console.error('Error loading auth session:', error);
        if (isMounted) setAuthChecked(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        syncAuthSession(event, session, event === 'SIGNED_IN');
      }, 0);

    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string, metadata?: any) => {
    // Intentamos obtener el perfil para saber el rol
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const metadataRole = metadata?.role;
    const finalRole = normalizeAppRole(profile?.role || metadataRole || 'USER');
    const finalName = profile?.name || metadata?.name || email.split('@')[0];

    const resolvedUser: User = {
      id: userId,
      name: finalName,
      role: finalRole,
      proId: finalRole === 'PRO' ? userId : undefined,
      email,
      city: profile?.city || profile?.municipality || metadata?.city || metadata?.municipality || '',
      phone: profile?.phone || metadata?.phone || ''
    };

    setUser(resolvedUser);

    if (finalRole === 'PRO') {
      const { data: p, error: proError } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (p && !proError) {
        // Obtener reseñas reales para calcular el promedio y total
        const { data: revs, error: revsError } = await runReviewSelect(columns => supabase
          .from('reviews')
          .select(columns)
          .eq('professional_id', userId));

        if (revsError) {
          console.warn('No se pudieron cargar las resenas del profesional:', revsError);
        }

        const reviewList: Review[] = (revs || []).map(mapReviewRow);

        const totalRating = reviewList.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = reviewList.length > 0 ? totalRating / reviewList.length : 0;

        const mappedPro: Professional = {
          ...mapProfessionalRow(p, email, reviewList),
          name: p.name || finalName,
          rating: avgRating,
          reviews: reviewList.length
        };

        setProfessionals(prev => mergeProfessionals([mappedPro], prev));
      }

      if (!p || proError) {
        const fallbackPro = mapProfessionalRow({
          id: userId,
          name: finalName,
          trade: metadata?.trade || profile?.trade || 'Oficio por definir',
          location: metadata?.location || profile?.location || '',
          municipality: metadata?.municipality || profile?.municipality || '',
          state: metadata?.state || profile?.state || '',
          image_url: metadata?.imageUrl || profile?.image_url,
          cover_image_url: metadata?.coverImageUrl || profile?.cover_image_url,
          portfolio_images: metadata?.portfolioImages || [],
          phone: profile?.phone || metadata?.phone || '',
          description: metadata?.description || profile?.description || 'Completa tu perfil para que los clientes sepan que servicios ofreces, donde atiendes y como pueden confiar en tu trabajo.',
          years_experience: Number(metadata?.yearsExperience || profile?.years_experience) || 0,
          coverage_zones: metadata?.municipality ? [metadata.municipality] : [],
          services: metadata?.trade ? [metadata.trade] : [],
          last_active_at: new Date().toISOString()
        }, email, []);

        setProfessionals(prev => mergeProfessionals([fallbackPro], prev));
      }
    }

    return resolvedUser;
  };

  // Cargar datos iniciales de Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      setProfessionalsLoaded(false);
      setProfessionalsLoadError(null);
      try {
        // Profesionales
        const { data: pros, error: prosErr } = await loadPublicProfessionals();

        if (pros && !prosErr && pros.length > 0) {
          const mappedPros: Professional[] = pros.map(p => mapProfessionalRow(p));

          setProfessionals(prev => mergeProfessionals(mappedPros, prev));

          const { data: allReviews, error: allReviewsError } = await runReviewSelect(columns => supabase
            .from('reviews')
            .select(`professional_id, ${columns}`)
            .in('professional_id', pros.map(p => p.id))
            .order('created_at', { ascending: false }));

          if (allReviewsError) {
            console.warn('No se pudieron cargar las resenas publicas:', allReviewsError);
          }

          const reviewsByPro = new Map<string, Review[]>();
          (allReviews || []).forEach(r => {
            const review = mapReviewRow(r);
            const proReviews = reviewsByPro.get(r.professional_id) || [];
            proReviews.push(review);
            reviewsByPro.set(r.professional_id, proReviews);
          });

          setProfessionals(prev => prev.map(pro => {
            const proReviews = reviewsByPro.get(pro.id) || [];
            if (proReviews.length === 0) return pro;

            const totalRating = proReviews.reduce((acc, review) => acc + review.rating, 0);
            return {
              ...pro,
              rating: totalRating / proReviews.length,
              reviews: proReviews.length,
              reviewsList: proReviews
            };
          }));
        } else {
          if (prosErr) {
            console.error('Error loading public professionals:', prosErr);
            setProfessionalsLoadError('No pudimos cargar todos los profesionales. Revisa la vista professionals_public y las politicas RLS.');
          }
          setProfessionals(prev => prev.length > 0 ? prev : PROFESSIONALS_DATA);
        }

        // Solicitudes
        const { data: reqs, error: reqsErr } = await supabase
          .from('trade_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (reqs && !reqsErr) {
          setTradeRequests(reqs.map(r => ({
            id: r.id,
            tradeName: r.trade_name,
            reason: r.reason,
            status: r.status,
            date: new Date(r.created_at).toLocaleDateString('es-ES')
          })));
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setProfessionalsLoadError('No pudimos cargar profesionales desde Supabase. Mostramos datos locales temporalmente.');
        setProfessionals(prev => prev.length > 0 ? prev : PROFESSIONALS_DATA);
      } finally {
        setProfessionalsLoaded(true);
      }
    };

    loadInitialData();
  }, []);


  // Service Requests Watcher
  useEffect(() => {
    const loadIncomingRequests = async () => {
      if (user?.role === 'PRO' && user.proId) {
        const { data } = await supabase
          .from('service_requests')
          .select('*')
          .eq('professional_id', user.proId)
          .order('created_at', { ascending: false })
          .limit(30);
        if (data) setIncomingRequests(data);
      }
    };
    
    const loadActiveServiceRequest = async () => {
      if (user && selectedProId && user.role !== 'PRO') {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data } = await supabase
            .from('service_requests')
            .select('*')
            .eq('client_id', authData.user.id)
            .eq('professional_id', selectedProId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setActiveServiceRequest(data || null);
        }
      } else {
        setActiveServiceRequest(null);
      }
    };

    if (user) {
      if (user.role === 'PRO' && user.proId) {
        loadIncomingRequests();
      } else {
        setIncomingRequests([]);
      }

      if (selectedProId) {
        loadActiveServiceRequest();
      } else {
        setActiveServiceRequest(null);
      }
    } else {
      setIncomingRequests([]);
      setActiveServiceRequest(null);
    }
  }, [user, selectedProId]);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavs = localStorage.getItem('esmiOficio_favs');
    try {
      const parsed = savedFavs ? JSON.parse(savedFavs) : [];
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
    } catch {
      localStorage.removeItem('esmiOficio_favs');
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    const storageKey = user ? `esmiOficio_favs_${user.id}` : 'esmiOficio_favs';
    const savedFavs = localStorage.getItem(storageKey);
    let localFavorites: string[] = [];
    try {
      const parsed = savedFavs ? JSON.parse(savedFavs) : [];
      localFavorites = Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
      setFavorites(localFavorites);
    } catch {
      localStorage.removeItem(storageKey);
      setFavorites([]);
    }

    if (user) {
      supabase
        .from('client_saved_professionals')
        .select('professional_id')
        .eq('client_id', user.id)
        .then(({ data, error }) => {
          if (!isMounted || error || !data) return;
          const dbFavorites = data
            .map(item => item.professional_id)
            .filter((item): item is string => typeof item === 'string');
          setFavorites(prev => Array.from(new Set([...prev, ...localFavorites, ...dbFavorites])));
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const storageKey = user ? `esmiOficio_favs_${user.id}` : 'esmiOficio_favs';
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, user?.id]);

  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('esmiOficio_admin') === 'true');

  // Helper for Toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const syncSavedProfessional = async (proId: string, shouldSave: boolean) => {
    if (!user || user.role === 'PRO') return;

    try {
      if (shouldSave) {
        const { error } = await supabase
          .from('client_saved_professionals')
          .upsert([{ client_id: user.id, professional_id: proId }], { onConflict: 'client_id,professional_id' });
        if (error) throw error;
        const pro = professionals.find(item => item.id === proId);
        await recordAnalyticsEvent({
          eventType: 'professional_saved',
          userId: user.id,
          professionalId: proId,
          city: pro?.municipality || null,
          state: pro?.state || null,
          trade: pro?.trade || null
        });
      } else {
        const { error } = await supabase
          .from('client_saved_professionals')
          .delete()
          .eq('client_id', user.id)
          .eq('professional_id', proId);
        if (error) throw error;
      }
    } catch (error) {
      console.warn('Saved professional was only updated locally. Run supabase-client-dashboard.sql for database sync.', error);
    }
  };

  const handleToggleFavorite = (proId: string) => {
    if (!user) {
      showToast('Debes iniciar sesión para guardar favoritos', 'info');
      setModal('LOGIN');
      return;
    }
    if (user.role === 'PRO') {
      showToast('Los perfiles profesionales no pueden tener favoritos', 'info');
      return;
    }

    const shouldSave = !favorites.includes(proId);
    setFavorites(prev => {
      if (prev.includes(proId)) {
        showToast('Eliminado de tus favoritos', 'info');
        return prev.filter(id => id !== proId);
      } else {
        showToast('Guardado en tus favoritos', 'success');
        return [...prev, proId];
      }
    });
    syncSavedProfessional(proId, shouldSave);
  };

  const handleRemoveSavedProfessional = (proId: string) => {
    setFavorites(prev => prev.filter(id => id !== proId));
    syncSavedProfessional(proId, false);
    showToast('Eliminado de tus profesionales guardados', 'info');
  };

  // Handlers
  const handleSearch = (query: string, state: string, municipality: string) => {
    const stateData = MEXICO_LOCATIONS.find(item => item.id === state);
    const municipalityName = municipality !== 'all'
      ? stateData?.municipalities.find(item => item.id === municipality)?.name
      : undefined;
    recordActivityEvent({
      type: 'search_performed',
      userId: user?.id || null,
      city: municipalityName || stateData?.name || 'Morelia',
      trade: query || null
    }).then(() => window.dispatchEvent(new Event('activityEventsUpdated')));
    recordAnalyticsEvent({
      eventType: 'search_performed',
      userId: user?.id || null,
      city: municipalityName || stateData?.name || 'Morelia',
      state: stateData?.name || null,
      trade: query || null
    });
    navigate(`/buscar?q=${encodeURIComponent(query)}&state=${state}&muni=${municipality}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string) => {
    recordActivityEvent({
      type: 'search_performed',
      userId: user?.id || null,
      city: 'Morelia',
      trade: category
    }).then(() => window.dispatchEvent(new Event('activityEventsUpdated')));
    recordAnalyticsEvent({
      eventType: 'search_performed',
      userId: user?.id || null,
      city: 'Morelia',
      trade: category
    });
    navigate(`/buscar?cat=${encodeURIComponent(category)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSearchLocationLabel = () => {
    const stateId = searchParams.get('state');
    const municipalityId = searchParams.get('muni');
    if (!stateId || stateId === 'all') return null;

    const stateData = MEXICO_LOCATIONS.find(item => item.id === stateId);
    if (municipalityId && municipalityId !== 'all') {
      const municipalityData = stateData?.municipalities.find(item => item.id === municipalityId);
      if (municipalityData && stateData) return `${municipalityData.name}, ${stateData.name}`;
      return municipalityData?.name || stateData?.name || null;
    }

    return stateData?.name || null;
  };

  const handleViewProfile = (proId: string) => {
    const pro = professionals.find(item => item.id === proId);
    recordActivityEvent({
      type: 'profile_view',
      userId: user?.id || null,
      professional: pro || null
    }).then(() => window.dispatchEvent(new Event('activityEventsUpdated')));
    recordAnalyticsEvent({
      eventType: 'profile_view',
      userId: user?.id || null,
      professionalId: pro?.id || proId,
      city: pro?.municipality || null,
      state: pro?.state || null,
      trade: pro?.trade || null
    });
    setSelectedProId(proId);
    setView('PROFILE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (email: string, password?: string) => {
    // Note: With Supabase we typically use email/password or Magic Link
    // For now, let's assume AuthModal will handle the sign-in and just notify App
    showToast(`Bienvenido de nuevo`, 'success');
  };

  const clearAuthScopedState = () => {
    setUser(null);
    setSelectedProId(null);
    setActiveServiceRequest(null);
    setIncomingRequests([]);
    setPendingContactProId(null);
    setPendingQuoteProId(null);
    setContactPro(null);
    setModal(null);
    setIsAdminAuthenticated(false);
    setFavorites(() => {
      const savedFavs = localStorage.getItem('esmiOficio_favs');
      try {
        const parsed = savedFavs ? JSON.parse(savedFavs) : [];
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
      } catch {
        return [];
      }
    });

    localStorage.removeItem('esmiOficio_pending_contact');
    localStorage.removeItem('esmiOficio_pending_quote');
    localStorage.removeItem('esmiOficio_detected_city');
    sessionStorage.removeItem('esmiOficio_admin');

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('contacted_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    clearAuthScopedState();
    navigate('/', { replace: true });
    showToast(
      error ? 'Sesion local cerrada. Revisa tu conexion para cerrar tambien en Supabase.' : 'Sesion cerrada',
      'info'
    );
  };

  const handleRegisterPro = async (data: any) => {
    try {
      const existingTrade = trades.find(t => t.name.toLowerCase() === data.trade.toLowerCase());

      if (!existingTrade) {
        const { data: reqData, error: reqError } = await supabase
          .from('trade_requests')
          .insert([{
            trade_name: data.trade,
            reason: 'Registro de nuevo profesional con oficio no listado',
            status: 'PENDING'
          }])
          .select()
          .single();

        if (reqData && !reqError) {
          setTradeRequests(prev => [{
            id: reqData.id,
            tradeName: reqData.trade_name,
            reason: reqData.reason,
            status: reqData.status,
            date: new Date(reqData.created_at).toLocaleDateString('es-ES')
          }, ...prev]);
        }
      }

      const newProData = {
        id: data.id, // ID from Supabase Auth
        name: data.name,
        trade: data.trade,
        location: data.location || '',
        municipality: data.municipality,
        state: data.state,
        rating: 0,
        reviews_count: 0,
        image_url: data.imageUrl || 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&h=200&auto=format&fit=crop',
        cover_image_url: data.coverImageUrl || '',
        portfolio_images: data.portfolioImages || [],
        verified: false,
        phone: '', // No longer collected at registration
        description: data.description,
        years_experience: parseInt(data.yearsExperience) || 0,
        response_time_minutes: null,
        coverage_zones: data.municipality ? [data.municipality] : [],
        services: data.trade ? [data.trade] : [],
        starting_price: null,
        last_active_at: new Date().toISOString(),
        jobs_count: 0,
        recommendations_count: 0,
        trust_status: 'green',
        verification_level: 'none',
        last_sensitive_update: new Date().toISOString()
      };

      // Usamos UPSERT en lugar de INSERT para evitar errores si el Trigger de BD ya creó el registro
      const { error: proError } = await supabase
        .from('professionals')
        .upsert([newProData]);

      if (proError) {
        console.error("Error al persistir profesional:", proError);
        // No lanzamos error si es un conflicto de duplicado, ya que el Trigger hizo su trabajo
        if (!proError.message.includes('duplicate key')) throw proError;
      }

      const newPro: Professional = {
        id: data.id,
        name: data.name,
        trade: data.trade,
        location: data.location,
        municipality: data.municipality,
        state: data.state,
        rating: 0,
        reviews: 0,
        imageUrl: newProData.image_url,
        coverImageUrl: newProData.cover_image_url,
        portfolioImages: newProData.portfolio_images,
        verified: false,
        phone: '',
        description: data.description,
        email: data.email,
        yearsExperience: newProData.years_experience,
        reviewsList: [],
        lastSensitiveUpdate: newProData.last_sensitive_update,
        responseTimeMinutes: newProData.response_time_minutes,
        coverageZones: newProData.coverage_zones,
        services: newProData.services,
        startingPrice: newProData.starting_price,
        lastActiveAt: newProData.last_active_at,
        jobsCount: newProData.jobs_count,
        recommendationsCount: newProData.recommendations_count,
        trustStatus: 'green',
        verificationLevel: 'none'
      };

      setProfessionals(prev => mergeProfessionals([newPro], prev));
      setUser({ id: data.id, name: data.name, role: 'PRO', proId: data.id, email: data.email, city: data.municipality, phone: data.phone || '' });

      const msg = !existingTrade
        ? "Registro exitoso. Tu oficio será revisado por el admin."
        : "¡Registro exitoso! Tu perfil ha sido creado.";

      showToast(msg, 'success');
      setView('PROFILE');
      setSelectedProId(data.id);
    } catch (err: any) {
      showToast(`Error de registro: ${err.message}`, 'error');
    }
  };

  // Flujo alternativo para contratación directa
  const handleHireManual = async (proId: string) => {
    if (!user) {
      setModal('LOGIN');
      return;
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');

      const pro = professionals.find(p => p.id === proId);
      if (!pro) throw new Error('No pudimos cargar los datos de este profesional. Intenta de nuevo.');

      const { error } = await supabase
        .from('service_requests')
        .insert([{
          client_id: userData.user.id,
          client_name: user.name,
          professional_id: proId,
          professional_name: pro.name,
          trade: pro.trade,
          status: 'COMPLETED',
          quote_amount: 0
        }]);

      if (error) {
        if (error.code === '23505') { // Si ya hay uno, ignorar error de duplicado y dejar pasar
          showToast('Ya tienes un servicio confirmado. Ahora puedes dejar tu reseña.', 'success');
        } else {
          throw error;
        }
      } else {
        showToast('¡Has confirmado la contratación! Ya puedes dejar tu reseña.', 'success');
      }

      await recordAnalyticsEvent({
        eventType: 'service_marked_hired',
        userId: userData.user.id,
        professionalId: proId,
        city: pro.municipality,
        state: pro.state,
        trade: pro.trade,
        metadata: { source: 'manual_hire' }
      });

      localStorage.setItem(getContactedStorageKey(userData.user.id, proId), 'true');

      // Despachar evento para que ProfileView actualice la vista
      window.dispatchEvent(new Event('dashboardUpdated'));
      
    } catch (err: any) {
      showToast('Error al confirmar: ' + err.message, 'error');
    }
  };

  const handleUpdateClientProfile = async (data: ClientProfileUpdate): Promise<boolean> => {
    if (!user || user.role === 'PRO') return false;

    try {
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (cleanPhone && cleanPhone.length < 10) {
        throw new Error('El telefono debe tener al menos 10 digitos o quedar vacio.');
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user || authData.user.id !== user.id) {
        throw new Error('No pudimos validar tu sesion. Vuelve a iniciar sesion.');
      }

      const payload = {
        id: user.id,
        role: 'USER',
        name: data.name || user.name,
        city: data.city || null,
        phone: cleanPhone || null
      };

      const { error } = await supabase
        .from('profiles')
        .upsert([payload], { onConflict: 'id' });

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        name: payload.name,
        city: data.city,
        phone: cleanPhone
      } : prev);
      showToast('Datos basicos actualizados', 'success');
      return true;
    } catch (err: any) {
      showToast(`No pudimos actualizar tus datos: ${err.message}`, 'error');
      return false;
    }
  };

  const handleUpdateProfile = async (updatedPro: Professional): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user || authData.user.id !== updatedPro.id) {
        throw new Error('No pudimos validar tu sesion profesional. Vuelve a iniciar sesion.');
      }

      // Check if sensitive data changed to update the timestamp
      const originalPro = professionals.find(p => p.id === updatedPro.id);
      let lastSensitiveUpdate = originalPro?.lastSensitiveUpdate;

      if (originalPro) {
        const sensitiveChanged =
          originalPro.name !== updatedPro.name ||
          originalPro.trade !== updatedPro.trade ||
          originalPro.state !== updatedPro.state ||
          originalPro.municipality !== updatedPro.municipality;

        if (sensitiveChanged) lastSensitiveUpdate = new Date().toISOString();
      }

      const { data: savedProfile, error } = await supabase
        .from('professionals')
        .update({
          name: updatedPro.name.trim(),
          trade: updatedPro.trade.trim(),
          location: updatedPro.location || '',
          municipality: updatedPro.municipality.trim(),
          state: updatedPro.state.trim(),
          description: updatedPro.description.trim(),
          phone: updatedPro.phone || '',
          years_experience: Number(updatedPro.yearsExperience) || 0,
          image_url: updatedPro.imageUrl || null,
          cover_image_url: updatedPro.coverImageUrl || null,
          portfolio_images: updatedPro.portfolioImages || [],
          response_time_minutes: updatedPro.responseTimeMinutes ?? null,
          coverage_zones: updatedPro.coverageZones || [],
          services: updatedPro.services || [],
          starting_price: updatedPro.startingPrice ?? null,
          last_active_at: new Date().toISOString(),
          last_sensitive_update: lastSensitiveUpdate || null
        })
        .eq('id', updatedPro.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      const refreshedPro = savedProfile
        ? {
            ...mapProfessionalRow(savedProfile, updatedPro.email, originalPro?.reviewsList || updatedPro.reviewsList),
            rating: originalPro?.rating ?? updatedPro.rating,
            reviews: originalPro?.reviews ?? updatedPro.reviews,
            reviewsList: originalPro?.reviewsList || updatedPro.reviewsList
          }
        : { ...updatedPro, lastSensitiveUpdate };

      setProfessionals(prev => prev.map(p => p.id === updatedPro.id ? refreshedPro : p));

      if (user && user.role === 'PRO' && user.proId === updatedPro.id) {
        setUser(prev => prev ? {
          ...prev,
          name: refreshedPro.name,
          city: refreshedPro.municipality,
          phone: refreshedPro.phone
        } : prev);

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: updatedPro.id,
            role: 'PRO',
            name: refreshedPro.name,
            city: refreshedPro.municipality || null,
            municipality: refreshedPro.municipality || null,
            phone: refreshedPro.phone || null
          }], { onConflict: 'id' });

        if (profileError) {
          console.warn('Professional profile saved, but profiles sync failed.', profileError);
        }
      }
      showToast('Perfil actualizado correctamente', 'success');
      return true;
    } catch (err: any) {
      showToast(`Error al actualizar: ${err.message}`, 'error');
      return false;
    }
  };

  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'date'>, professionalId?: string): Promise<boolean> => {
    const targetProId = professionalId || selectedProId;
    if (!targetProId || !user) return false;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');
      if (user.role === 'PRO') throw new Error('Las cuentas profesionales no pueden publicar resenas.');

      const cleanText = reviewData.text.trim();
      const safeRating = Math.max(1, Math.min(5, Math.round(Number(reviewData.rating) || 0)));
      const reviewImages = Array.isArray(reviewData.images)
        ? reviewData.images.filter((item): item is string => typeof item === 'string' && item.length > 0).slice(0, 3)
        : [];

      if (cleanText.length < 20) {
        throw new Error('Escribe al menos 20 caracteres para que la resena sea util.');
      }

      if (safeRating < 3 && reviewImages.length === 0) {
        throw new Error('Para calificaciones de 1 o 2 estrellas agrega al menos una foto de evidencia.');
      }

      // Verificar en Supabase que este cliente contacto a este profesional exacto.
      let { data: bookings, error: bookingErr } = await supabase
        .from('service_requests')
        .select('id, status')
        .eq('professional_id', targetProId)
        .eq('client_id', userData.user.id)
        .in('status', ['PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED'])
        .limit(1);

      if (bookingErr) {
        throw bookingErr;
      }

      if (!bookings || bookings.length === 0) {
        const localContacted = localStorage.getItem(getContactedStorageKey(userData.user.id, targetProId)) === 'true';
        const repairedEligibility = localContacted
          ? await ensureReviewEligibility(userData.user.id, user.name, targetProId)
          : false;

        if (!repairedEligibility) {
          throw new Error('Debes solicitar una cotizacion o contactar a este profesional antes de poder dejarle una resena.');
        }

        const retry = await supabase
          .from('service_requests')
          .select('id, status')
          .eq('professional_id', targetProId)
          .eq('client_id', userData.user.id)
          .in('status', ['PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED'])
          .limit(1);

        bookings = retry.data;
        bookingErr = retry.error;
        if (bookingErr || !bookings || bookings.length === 0) {
          throw bookingErr || new Error('No pudimos validar el contacto para publicar la resena.');
        }
      }

      const { data: existingReview, error: existingReviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('professional_id', targetProId)
        .eq('author_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReviewError) throw existingReviewError;

      const reviewPayload = {
        professional_id: targetProId,
        author_id: userData.user.id,
        author_name: user.name,
        rating: safeRating,
        text: cleanText
      };

      const saveReview = async (includeImages: boolean): Promise<{ data: any; error: any }> => {
        const payload = includeImages
          ? { ...reviewPayload, images: reviewImages }
          : reviewPayload;
        const columns = includeImages ? REVIEW_COLUMNS : LEGACY_REVIEW_COLUMNS;

        const query = existingReview
          ? supabase
            .from('reviews')
            .update(payload)
            .eq('id', existingReview.id)
          : supabase
            .from('reviews')
            .insert([payload]);

        return query.select(columns).single();
      };

      let { data: newRev, error: revError } = await saveReview(true);
      if (revError && isMissingReviewImagesColumnError(revError)) {
        const retry = await saveReview(false);
        newRev = retry.data;
        revError = retry.error;
      }

      if (revError) throw revError;
      if (!newRev) throw new Error('Supabase no regreso la resena guardada.');

      setProfessionals(prev => prev.map(pro => {
        if (pro.id === targetProId) {
          const savedReview: Review = {
            id: newRev.id,
            authorId: newRev.author_id,
            author: newRev.author_name,
            rating: newRev.rating,
            text: newRev.text,
            date: new Date(newRev.created_at).toLocaleDateString('es-ES'),
            images: Array.isArray(newRev.images) ? newRev.images : reviewImages
          };
          const withoutOldReview = pro.reviewsList.filter(r => r.id !== savedReview.id && r.authorId !== userData.user.id);
          const updatedReviews = [savedReview, ...withoutOldReview];
          const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const newRating = totalRating / updatedReviews.length;

          return {
            ...pro,
            reviewsList: updatedReviews,
            reviews: updatedReviews.length,
            rating: newRating
          };
        }
        return pro;
      }));

      const reviewedPro = professionals.find(pro => pro.id === targetProId);
      await recordAnalyticsEvent({
        eventType: 'review_created',
        userId: userData.user.id,
        professionalId: targetProId,
        city: reviewedPro?.municipality || null,
        state: reviewedPro?.state || null,
        trade: reviewedPro?.trade || null,
        metadata: { rating: safeRating, updated: Boolean(existingReview) }
      });

      showToast(existingReview ? 'Resena actualizada correctamente.' : 'Gracias por tu resena verificada!', 'success');
      return true;
    } catch (err: any) {
      showToast(getReviewSaveErrorMessage(err), 'error');
      return false;
    }
  };

  const handleRequestQuote = async (proId: string, requestDetails?: string) => {
    if (!user) {
      setPendingQuoteProId(proId);
      localStorage.setItem('esmiOficio_pending_quote', proId);
      setModal('LOGIN');
      showToast('Inicia sesion para enviar la solicitud de cotizacion.', 'info');
      return;
    }

    if (user.role === 'PRO') {
      showToast('Usa una cuenta de cliente para solicitar cotizaciones.', 'info');
      return;
    }

    const opKey = `quote-${user.id}-${proId}`;
    if (pendingOperations.has(opKey)) return;
    pendingOperations.add(opKey);

    try {
      // Verificar si ya existe una solicitud activa (PENDING, QUOTED o CONFIRMED)
      const { data: existing, error: checkError } = await supabase
        .from('service_requests')
        .select('id, status')
        .eq('client_id', user.id)
        .eq('professional_id', proId)
        .in('status', ['PENDING', 'QUOTED', 'CONFIRMED'])
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        showToast('Ya tienes una solicitud en proceso con este profesional.', 'info');
        pendingOperations.delete(opKey);
        return;
      }

      const pro = professionals.find(p => p.id === proId);
      if (!pro) throw new Error('No pudimos cargar los datos de este profesional. Intenta de nuevo.');
      const cleanDetails = requestDetails?.trim();

      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          client_id: user.id,
          professional_id: proId,
          client_name: user.name,
          professional_name: pro.name,
          trade: pro.trade,
          details: cleanDetails || `Solicitud de cotización para ${pro.trade || 'oficio'}`,
          status: 'PENDING',
          quote_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Guardar en localStorage para respaldo de habilitación de reseña
      const localKey = getContactedStorageKey(user.id, proId);
      localStorage.setItem(localKey, 'true');
      await recordAnalyticsEvent({
        eventType: 'service_request_created',
        userId: user.id,
        professionalId: proId,
        serviceRequestId: data.id,
        city: pro.municipality,
        state: pro.state,
        trade: pro.trade
      });
      
      setActiveServiceRequest(data);
      showToast('Solicitud enviada. Esperando cotización del profesional.', 'success');
      window.dispatchEvent(new Event('dashboardUpdated'));
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      pendingOperations.delete(opKey);
    }
  };

  const handleAcceptQuote = async (requestId: string, amount: string) => {
    const quoteAmount = Number(amount);
    if (!amount || !Number.isFinite(quoteAmount) || quoteAmount <= 0) {
      showToast('Por favor ingresa un monto valido mayor a 0', 'error');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status: 'QUOTED', quote_amount: quoteAmount })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      setIncomingRequests(prev => prev.map(req => req.id === requestId ? data : req));
      showToast('Cotizacion enviada. Esperando confirmacion del cliente.', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleConfirmService = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status: 'CONFIRMED' })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      setActiveServiceRequest(data);
      const pro = professionals.find(item => item.id === data.professional_id);
      await recordAnalyticsEvent({
        eventType: 'service_marked_hired',
        userId: user?.id || data.client_id || null,
        professionalId: data.professional_id,
        serviceRequestId: requestId,
        city: pro?.municipality || null,
        state: pro?.state || null,
        trade: data.trade || pro?.trade || null
      });

      // Abrir WhatsApp de Soporte
      const supportPhone = "523346179157";
      const message = `Hola EsMiOficio, acabo de confirmar el servicio con el profesional (Solicitud ID: ${requestId}). Puede comenzar el seguimiento.`;
      const url = `https://wa.me/${supportPhone}?text=${encodeURIComponent(message)}`;
      
      showToast('¡Servicio confirmado! Iniciando protocolo de seguimiento VIP...', 'success');
      window.open(url, '_blank');
      window.dispatchEvent(new Event('dashboardUpdated'));
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCompleteService = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status: 'COMPLETED' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setIncomingRequests(prev => prev.map(req => req.id === requestId ? data : req));
      }
      const pro = professionals.find(item => item.id === data.professional_id);
      await recordAnalyticsEvent({
        eventType: 'service_completed',
        userId: data.client_id || null,
        professionalId: data.professional_id,
        serviceRequestId: requestId,
        city: pro?.municipality || null,
        state: pro?.state || null,
        trade: data.trade || pro?.trade || null
      });
      showToast('Servicio terminado. El cliente ahora puede dejar una resena.', 'success');
      window.dispatchEvent(new Event('dashboardUpdated'));
    } catch (err: any) {
      showToast('Error al terminar el servicio: ' + err.message, 'error');
    }
  };

  const handleSuggestTrade = (tradeName: string, reason: string) => {
    const newRequest: TradeRequest = {
      id: Date.now().toString(),
      tradeName,
      reason,
      status: 'PENDING',
      date: new Date().toLocaleDateString('es-ES')
    };
    setTradeRequests(prev => [newRequest, ...prev]);
    showToast("Solicitud enviada al administrador.", 'success');
  };

  const handleAdminLogin = (password: string) => {
    // La contraseña vive en .env.local (VITE_ADMIN_PASSWORD), nunca en el código.
    // Nota: esto solo oculta la UI; la protección real de los datos debe estar en las
    // políticas RLS de Supabase, porque cualquier código del navegador es público.
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (adminPassword && password === adminPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('esmiOficio_admin', 'true');
      showToast('Sesión de administrador iniciada', 'info');
      return true;
    }
    if (!adminPassword) {
      showToast('Falta configurar VITE_ADMIN_PASSWORD en .env.local', 'error');
    }
    return false;
  };

  const handleAdminExit = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('esmiOficio_admin');
    handleBackToHome();
  };

  const handleApproveTradeRequest = (req: TradeRequest) => {
    const newTrade: TradeCategory = {
      id: req.tradeName.toLowerCase().replace(/\s+/g, '-'),
      name: req.tradeName,
      icon: 'engineering',
      color: 'text-gray-400'
    };

    setTrades(prev => [...prev, newTrade]);
    setTradeRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));
    showToast(`Oficio ${req.tradeName} aprobado`, 'success');
  };

  const handleRejectTradeRequest = (id: string) => {
    setTradeRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    showToast('Solicitud rechazada', 'info');
  };

  const handleDeletePro = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    showToast('Profesional eliminado', 'info');
  };

  const handleToggleVerification = async (id: string) => {
    try {
      const pro = professionals.find(p => p.id === id);
      if (!pro) return;
      const newStatus = !pro.verified;

      const { error } = await supabase
        .from('professionals')
        .update({ verified: newStatus })
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev => prev.map(p => {
        if (p.id === id) {
          showToast(`Profesional ${newStatus ? 'verificado' : 'desverificado'}`, 'success');
          return { ...p, verified: newStatus };
        }
        return p;
      }));
    } catch (err: any) {
      showToast(`Error al actualizar verificación: ${err.message}`, 'error');
    }
  };

  const handleNotifyPro = (id: string, message: string, type: string) => {
    console.log(`Sending ${type} notification to pro ${id}: ${message}`);
    showToast('Notificación enviada al profesional', 'success');
  };

  const handleDeleteReview = async (proId: string, reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setProfessionals(prev => prev.map(pro => {
        if (pro.id === proId) {
          const updatedReviews = pro.reviewsList.filter(r => r.id !== reviewId);
          const newRating = updatedReviews.length > 0
            ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
            : 0;

          return {
            ...pro,
            reviewsList: updatedReviews,
            reviews: updatedReviews.length,
            rating: newRating
          };
        }
        return pro;
      }));
      showToast('Reseña eliminada correctamente', 'success');
    } catch (err: any) {
      showToast(`Error al eliminar reseña: ${err.message}`, 'error');
    }
  };

  const fetchProfessionalContact = async (pro: Professional) => {
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_professional_contact', { p_professional_id: pro.id });

    if (!rpcError && rpcData) {
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      return {
        phone: row?.phone || '',
        email: row?.email || ''
      };
    }

    const { data } = await supabase
      .from('professionals')
      .select('phone')
      .eq('id', pro.id)
      .maybeSingle();

    return {
      phone: data?.phone || pro.phone || '',
      email: pro.email || ''
    };
  };

  const openWhatsAppContact = async (pro: Professional) => {
    if (!user || user.role === 'PRO') return;

    const opKey = `whatsapp-${user.id}-${pro.id}`;
    if (pendingOperations.has(opKey)) return;
    pendingOperations.add(opKey);

    try {
      const contact = await fetchProfessionalContact(pro);
      const whatsappPhone = normalizePhoneForWhatsApp(contact.phone);

      if (!whatsappPhone) {
        showToast('Este profesional aun no tiene WhatsApp disponible.', 'info');
        return;
      }

      const clientLocation = getSearchLocationLabel();
      const city = clientLocation || getProfessionalCity(pro);
      const message = buildWhatsAppMessage(pro, searchParams.get('q'), clientLocation);
      const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

      await recordActivityEvent({
        type: 'contact_unlocked',
        userId: user.id,
        professional: pro,
        city,
        zone: pro.coverageZones?.[0] || city,
        trade: pro.trade
      });
      await recordClientContactEvent({
        clientId: user.id,
        professional: pro,
        contactMethod: 'whatsapp',
        city
      });
      await recordAnalyticsEvent({
        eventType: 'whatsapp_click',
        userId: user.id,
        professionalId: pro.id,
        city,
        state: pro.state,
        trade: pro.trade
      });
      window.dispatchEvent(new Event('activityEventsUpdated'));

      const reviewEligibilityReady = await ensureReviewEligibility(user.id, user.name, pro.id);
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(
        reviewEligibilityReady
          ? 'Contacto seguro desbloqueado en WhatsApp. Ya podras dejar resena al terminar.'
          : 'Contacto abierto, pero no pudimos preparar la resena verificada. Solicita cotizacion si necesitas calificar despues.',
        reviewEligibilityReady ? 'success' : 'info'
      );
      window.dispatchEvent(new Event('dashboardUpdated'));
    } catch (error: any) {
      showToast(error.message || 'No se pudo abrir WhatsApp.', 'error');
    } finally {
      setTimeout(() => pendingOperations.delete(opKey), 1500);
    }
  };

  const handleContact = (pro: Professional) => {
    recordActivityEvent({
      type: 'contact_attempt',
      userId: user?.id || null,
      professional: pro
    }).then(() => window.dispatchEvent(new Event('activityEventsUpdated')));

    if (!user) {
      setPendingContactProId(pro.id);
      localStorage.setItem('esmiOficio_pending_contact', pro.id);
      setModal('LOGIN');
      showToast('Entra con Google para desbloquear el contacto seguro.', 'info');
      return;
    }

    if (user.role === 'PRO') {
      showToast('Usa una cuenta de cliente para contactar profesionales.', 'info');
      return;
    }

    openWhatsAppContact(pro);
  };

  const handleRecordContact = async (proId: string) => {
    if (!user) return;

    const opKey = `contact-${user.id}-${proId}`;
    if (pendingOperations.has(opKey)) return;
    pendingOperations.add(opKey);

    try {
      const isEligibleForReview = await ensureReviewEligibility(user.id, user.name, proId);
      const pro = professionals.find(item => item.id === proId);
      await recordAnalyticsEvent({
        eventType: 'whatsapp_click',
        userId: user.id,
        professionalId: proId,
        city: pro?.municipality || null,
        state: pro?.state || null,
        trade: pro?.trade || null,
        metadata: { source: 'contact_modal' }
      });

      if (isEligibleForReview) {
        showToast('Contacto registrado. Ya puedes dejar una resena cuando termines el servicio.', 'success');
      } else {
        showToast('Contacto abierto, pero Supabase no permitio validar la resena. Revisa la politica RLS de reviews.', 'error');
      }

      window.dispatchEvent(new Event('dashboardUpdated'));
    } catch (e) {
      console.error('Error recording contact:', e);
    } finally {
      setTimeout(() => pendingOperations.delete(opKey), 2000);
    }
  };

  useEffect(() => {
    if (!user || !pendingContactProId || professionals.length === 0) return;
    if (user.role === 'PRO') {
      setPendingContactProId(null);
      localStorage.removeItem('esmiOficio_pending_contact');
      return;
    }

    const pendingPro = professionals.find(pro => pro.id === pendingContactProId);
    if (!pendingPro) return;

    setModal(null);
    setPendingContactProId(null);
    localStorage.removeItem('esmiOficio_pending_contact');
    openWhatsAppContact(pendingPro);
  }, [user?.id, pendingContactProId, professionals.length]);

  useEffect(() => {
    if (!user || !pendingQuoteProId || professionals.length === 0) return;
    if (user.role === 'PRO') {
      setPendingQuoteProId(null);
      localStorage.removeItem('esmiOficio_pending_quote');
      return;
    }

    const pendingPro = professionals.find(pro => pro.id === pendingQuoteProId);
    if (!pendingPro) {
      if (professionalsLoaded) {
        setPendingQuoteProId(null);
        localStorage.removeItem('esmiOficio_pending_quote');
        showToast('No pudimos recuperar el profesional para enviar la cotizacion.', 'error');
      }
      return;
    }

    setModal(null);
    setPendingQuoteProId(null);
    localStorage.removeItem('esmiOficio_pending_quote');
    handleRequestQuote(pendingPro.id);
  }, [user?.id, pendingQuoteProId, professionals.length, professionalsLoaded]);

  const getActiveProfileId = () => (
    selectedProId || (view === '/perfil' && user?.role === 'PRO' ? user.proId || null : null)
  );

  const getSelectedPro = (): Professional | undefined => {
    const activeProfileId = getActiveProfileId();
    return activeProfileId ? professionals.find(p => p.id === activeProfileId) : undefined;
  };

  // View Navigation Helpers
  const handleBackToHome = () => {
    setView('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrivacy = () => {
    setView('PRIVACY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToTerms = () => {
    setView('TERMS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAbout = () => {
    setView('ABOUT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const goToBlog = () => {
    setView('BLOG');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (view === '/admin' || view === '/administracion') {
    return (
      <>
        <AdminDashboard
          isAuthenticated={isAdminAuthenticated}
          onLogin={handleAdminLogin}
          requests={tradeRequests}
          onApproveRequest={handleApproveTradeRequest}
          onRejectRequest={handleRejectTradeRequest}
          onExit={handleAdminExit}
          professionals={professionals}
          onDeletePro={handleDeletePro}
          onToggleVerification={handleToggleVerification}
          onNotifyPro={handleNotifyPro}
          onDeleteReview={handleDeleteReview}
          onSeedData={async () => {
            if (!import.meta.env.DEV) {
              showToast('La carga de datos de prueba solo esta disponible en desarrollo.', 'error');
              return;
            }
            await seedTestUsers(handleRegisterPro);
          }}
        />
        <ToastContainer notifications={notifications} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased selection:bg-primary/30 selection:text-primary">
      <Navbar
        onNavigate={(v) => {
          if (v === 'ABOUT') goToAbout();
          else if (v === 'BLOG') goToBlog();
          else setView(v as ViewState);
        }}
        onLoginClick={() => setModal('LOGIN')}
        onRegisterClick={() => setModal('REGISTER')}
        user={user}
        onLogout={handleLogout}
        onProfileClick={() => {
          if (user?.role === 'PRO' && user.proId) {
            setSelectedProId(user.proId);
            setView('PROFILE');
          }
        }}
        onFavoritesClick={() => setView('FAVORITES')}
        onJobBoardClick={() => setView('JOBBOARD')}
        onClientDashboardClick={() => setView('CLIENT_DASHBOARD')}
      />

      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={
            <>
            <SEOHelmet
              title="EsMiOficio - Profesionales confiables en Morelia"
              description="Encuentra albaniles, plomeros, electricistas, mecanicos y otros profesionales en Morelia. Revisa trabajos recientes, senales de confianza y contacta por WhatsApp con mas seguridad."
              canonicalUrl="https://esmioficio.mx/"
              jsonLd={homeJsonLd}
            />
            <Hero 
              onSearch={handleSearch} 
              onPublishClick={() => setModal('PRO_REGISTER')} 
            />
            <Categories
              trades={trades}
              onCategorySelect={handleCategorySelect}
              onViewAll={() => handleSearch('', 'all', 'all')}
            />
            <ActivityFeed />
            <FeaturedPros onViewProfile={handleViewProfile} onContact={handleContact} professionals={professionals} />
            <section className="px-4 py-10">
              <div className="mx-auto max-w-5xl rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2">Problemas con un servicio</h2>
                    <p className="text-gray-300">Te ayudamos a mediar: documentamos el caso y solicitamos respuesta, sin prometer devoluciones ni presentarlo como servicio legal.</p>
                  </div>
                  <button
                    onClick={() => handleSearch('', 'michoacan', 'morelia')}
                    className="shrink-0 rounded-lg bg-primary px-5 py-3 font-black text-background hover:bg-primary-hover transition-colors"
                  >
                    Buscar profesional
                  </button>
                </div>
                <p className="mt-5 text-sm font-bold text-primary">EsMiOficio: El Buro de Confianza de los oficios en Morelia.</p>
              </div>
            </section>
            <MexicoFocus
              trades={trades}
              onSearch={handleSearch}
              onPublishClick={() => setView('JOBBOARD')}
            />
            <section className="relative py-16 px-4">
              <div className="absolute inset-0 bg-surface-light/30"></div>
              <div className="relative mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-primary/90 to-yellow-600 p-8 md:p-12 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-background mb-2">¿Eres un profesional?</h2>
                    <p className="text-background/80 font-medium text-lg">Unete a EsMiOficio para construir tu reputacion y encontrar mas clientes en Morelia.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setModal('PRO_REGISTER')}
                      className="px-6 py-3 bg-background text-white font-bold rounded-lg shadow-lg hover:bg-black transition-colors"
                    >
                      Registrar mi Oficio
                    </button>
                    <button onClick={goToAbout} className="px-6 py-3 bg-white/20 text-background font-bold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
                      Saber Más
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <Testimonials />
            </>
          } />
          
          <Route path="/buscar" element={
          <SearchResults
            filters={{
              query: searchParams.get('q') || '',
              state: searchParams.get('state') || 'all',
              municipality: searchParams.get('muni') || 'all',
              category: searchParams.get('cat') || null,
              verifiedOnly: searchParams.get('verified') === 'true',
              minRating: Number(searchParams.get('rating')) || 0
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
            professionals={professionals}
            onSuggestTrade={() => setModal('SUGGEST_TRADE')}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isFavoritesView={false}
            loadError={professionalsLoadError}
          />
          } />
          <Route path="/favoritos" element={
            <SearchResults
              filters={{ query: '', state: 'all', municipality: 'all', category: null, verifiedOnly: false, minRating: 0 }}
              onViewProfile={handleViewProfile}
              onContact={handleContact}
              professionals={professionals.filter(p => favorites.includes(p.id))}
              onSuggestTrade={() => setModal('SUGGEST_TRADE')}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              isFavoritesView={true}
              loadError={professionalsLoadError}
            />
          } />

          <Route path="/mi-actividad" element={(() => {
            if (!authChecked) {
              return <FullPageLoader message="Cargando tu cuenta..." />;
            }

            if (!user) {
              return <LoginRequired onLoginRequest={() => setModal('LOGIN')} />;
            }

            if (user.role === 'PRO') {
              return <Navigate to="/perfil" replace />;
            }

            return (
              <ClientDashboard
                user={user}
                professionals={professionals}
                favorites={favorites}
                onViewProfile={handleViewProfile}
                onLeaveReview={(proId) => {
                  setSelectedProId(proId);
                  setView('PROFILE');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onRemoveSavedProfessional={handleRemoveSavedProfessional}
                onUpdateClientProfile={handleUpdateClientProfile}
              />
            );
          })()} />

          <Route path="/perfil" element={(() => {
            const activeProfileId = getActiveProfileId();
            const selectedProfessional = getSelectedPro();

            if (selectedProfessional && activeProfileId) {
              return (
                <ProfileView
                  professional={selectedProfessional}
                  onBack={() => setView('SEARCH')}
                  onContact={handleContact}
                  onAddReview={handleAddReview}
                  isLoggedIn={!!user}
                  onLoginRequest={() => {
                    setPendingContactProId(activeProfileId);
                    localStorage.setItem('esmiOficio_pending_contact', activeProfileId);
                    setModal('LOGIN');
                  }}
                  currentUser={user}
                  isFavorite={favorites.includes(activeProfileId)}
                  onToggleFavorite={() => handleToggleFavorite(activeProfileId)}
                  onShare={(msg) => showToast(msg, 'info')}
                  onUpdateProfile={handleUpdateProfile}
                  onHire={handleHireManual}
                  serviceRequest={activeServiceRequest}
                  onRequestQuote={handleRequestQuote}
                  onAcceptQuote={handleAcceptQuote}
                  onConfirmService={handleConfirmService}
                  onCompleteService={handleCompleteService}
                  incomingRequests={incomingRequests}
                />
              );
            }

            if (!authChecked) {
              return <FullPageLoader message="Validando tu sesion..." />;
            }

            if (!user && !activeProfileId) {
              return <LoginRequired onLoginRequest={() => setModal('LOGIN')} />;
            }

            if (!professionalsLoaded || (user?.role === 'PRO' && user.proId)) {
              return <FullPageLoader message="Cargando tu perfil profesional..." />;
            }

            return <Navigate to="/" />;
          })()} />

          <Route path="/oficios/:categorySlug" element={
            <CategorySEOPage professionals={professionals} trades={trades} />
          } />
          <Route path="/oficio/:slug" element={
            <ProfileSEOPage
              professionals={professionals}
              isLoading={!professionalsLoaded}
              onBack={() => setView('SEARCH')}
              onContact={handleContact}
              onAddReview={handleAddReview}
              isLoggedIn={!!user}
              onLoginRequest={() => setModal('LOGIN')}
              currentUser={user}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onShare={(msg) => showToast(msg, 'info')}
              onUpdateProfile={handleUpdateProfile}
              onHire={handleHireManual}
              serviceRequest={activeServiceRequest}
              onRequestQuote={handleRequestQuote}
              onAcceptQuote={handleAcceptQuote}
              onConfirmService={handleConfirmService}
              onCompleteService={handleCompleteService}
              incomingRequests={incomingRequests}
            />
          } />

          <Route path="/reportar/:professionalId" element={
            <ReportProfessionalPage
              professionals={professionals}
              isLoading={!professionalsLoaded}
              currentUser={user}
              onLoginRequest={() => setModal('LOGIN')}
            />
          } />

          <Route path="/privacidad" element={<PrivacyPolicy onBack={handleBackToHome} />} />
          <Route path="/terminos" element={<TermsConditions onBack={handleBackToHome} />} />
          <Route path="/nosotros" element={<AboutUs onBack={handleBackToHome} onRegisterClick={() => setModal('PRO_REGISTER')} />} />
          <Route path="/blog" element={<Blog onBack={handleBackToHome} />} />
          <Route path="/blog/:slug" element={<BlogPostSEOPage />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/proyectos" element={
            <JobBoard
              user={user}
              onLoginRequest={() => setModal('LOGIN')}
              showToast={showToast}
            />
          } />
          <Route path="*" element={
            <NotFoundPage
              onGoHome={handleBackToHome}
              onSearch={() => setView('SEARCH')}
            />
          } />
        </Routes>
        </Suspense>
      </main>

      <Footer
        onSuggestClick={() => setModal('SUGGEST_TRADE')}
        onPrivacyClick={goToPrivacy}
        onTermsClick={goToTerms}
        onAboutClick={goToAbout}
        onBlogClick={goToBlog}
      />

      <ToastContainer notifications={notifications} onRemove={removeToast} />

      <Suspense fallback={null}>
        {modal && modal !== 'SUGGEST_TRADE' && modal !== 'CONTACT' && (
          <AuthModal
            type={modal}
            setType={(newType) => setModal(newType as ModalState)}
            onClose={() => setModal(null)}
            onLogin={handleLogin}
            onRegisterPro={handleRegisterPro}
            trades={trades}
            contactIntent={!!pendingContactProId || !!pendingQuoteProId}
          />
        )}

        {modal === 'CONTACT' && contactPro && (
          <ContactModal 
            professional={contactPro} 
            onClose={() => setModal(null)} 
            onContactAction={() => handleRecordContact(contactPro.id)}
          />
        )}

        {modal === 'SUGGEST_TRADE' && (
          <SuggestTradeModal
            onClose={() => setModal(null)}
            onSubmit={handleSuggestTrade}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
