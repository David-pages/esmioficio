import React, { useEffect, useMemo, useState } from 'react';
import { ClientProfileUpdate, Professional, Review, User } from '../types';
import { supabase } from '../lib/supabaseClient';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';
import StarRating from './StarRating';

type ServiceRequestRow = {
  id: string;
  professional_id: string;
  professional_name?: string | null;
  trade?: string | null;
  status?: string | null;
  created_at: string;
};

type ClientContactRow = {
  id: string;
  professionalId?: string | null;
  contactMethod?: string | null;
  trade?: string | null;
  city?: string | null;
  createdAt: string;
};

type ClientDashboardProps = {
  user: User;
  professionals: Professional[];
  favorites: string[];
  onViewProfile: (professionalId: string) => void;
  onLeaveReview: (professionalId: string) => void;
  onRemoveSavedProfessional: (professionalId: string) => void;
  onUpdateClientProfile: (data: ClientProfileUpdate) => Promise<boolean>;
};

type ClientServiceStatus = 'pendiente' | 'contratado' | 'finalizado' | 'resena_pendiente';

const statusCopy: Record<ClientServiceStatus, { label: string; className: string }> = {
  pendiente: {
    label: 'pendiente',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
  },
  contratado: {
    label: 'contratado',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  },
  finalizado: {
    label: 'finalizado',
    className: 'border-green-500/30 bg-green-500/10 text-green-300'
  },
  resena_pendiente: {
    label: 'resena pendiente',
    className: 'border-primary/40 bg-primary/10 text-primary'
  }
};

const formatDate = (dateValue?: string | null) => {
  if (!dateValue) return 'Sin fecha';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getServiceStatus = (status: string | null | undefined, reviewedProfessionalIds: Set<string>, professionalId: string): ClientServiceStatus => {
  if (status === 'CONFIRMED') return 'contratado';
  if (status === 'COMPLETED') {
    return reviewedProfessionalIds.has(professionalId) ? 'finalizado' : 'resena_pendiente';
  }
  return 'pendiente';
};

const getContactMethodLabel = (method?: string | null) => {
  if (method === 'whatsapp') return 'WhatsApp';
  if (method === 'phone') return 'Llamada';
  return 'Contacto';
};

const EmptyState: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/40 px-4 py-8 text-center">
    <span className="material-symbols-outlined mb-3 text-4xl text-gray-600">{icon}</span>
    <p className="text-sm font-bold text-gray-400">{text}</p>
  </div>
);

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, icon, children, action }) => (
  <section className="rounded-lg border border-border bg-surface/80">
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
        <h2 className="text-base font-black text-white">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  professionals,
  favorites,
  onViewProfile,
  onLeaveReview,
  onRemoveSavedProfessional,
  onUpdateClientProfile
}) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRow[]>([]);
  const [contactEvents, setContactEvents] = useState<ClientContactRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dbSavedIds, setDbSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    city: user.city || '',
    phone: user.phone || ''
  });

  const professionalsById = useMemo(() => {
    const map = new Map<string, Professional>();
    professionals.forEach(pro => map.set(pro.id, pro));
    return map;
  }, [professionals]);

  useEffect(() => {
    setProfileForm({
      name: user.name || '',
      city: user.city || '',
      phone: user.phone || ''
    });
  }, [user.name, user.city, user.phone]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);

      const [services, contacts, userReviews, savedIds] = await Promise.all([
        loadServiceRequests(user.id),
        loadContactEvents(user.id),
        loadClientReviews(user.id),
        loadSavedProfessionals(user.id)
      ]);

      if (!isMounted) return;

      setServiceRequests(services);
      setContactEvents(contacts);
      setReviews(userReviews);
      setDbSavedIds(savedIds);
      setIsLoading(false);
    };

    loadDashboardData();

    const handleDashboardUpdated = () => loadDashboardData();
    window.addEventListener('dashboardUpdated', handleDashboardUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('dashboardUpdated', handleDashboardUpdated);
    };
  }, [user.id]);

  const clientReviewProfessionalIds = useMemo(() => {
    const ids = new Set<string>();
    reviews.forEach(review => {
      const source = review as Review & { professionalId?: string };
      if (source.professionalId) ids.add(source.professionalId);
    });
    return ids;
  }, [reviews]);

  const serviceItems = useMemo(() => serviceRequests.map(request => {
    const professional = professionalsById.get(request.professional_id);
    const displayStatus = getServiceStatus(request.status, clientReviewProfessionalIds, request.professional_id);

    return {
      id: request.id,
      professionalId: request.professional_id,
      professionalName: professional?.name || request.professional_name || 'Profesional de EsMiOficio',
      trade: request.trade || professional?.trade || 'Oficio',
      city: professional?.municipality || 'Ciudad por confirmar',
      state: professional?.state || 'Estado por confirmar',
      date: request.created_at,
      status: displayStatus
    };
  }), [clientReviewProfessionalIds, professionalsById, serviceRequests]);

  const pendingReviews = useMemo(() => (
    serviceItems.filter(item => item.status === 'resena_pendiente')
  ), [serviceItems]);

  const savedProfessionals = useMemo(() => {
    const ids = Array.from(new Set([...favorites, ...dbSavedIds]));
    return ids
      .map(id => professionalsById.get(id))
      .filter((item): item is Professional => Boolean(item));
  }, [dbSavedIds, favorites, professionalsById]);

  const reviewItems = useMemo(() => reviews.map(review => {
    const source = review as Review & { professionalId?: string };
    const professional = source.professionalId ? professionalsById.get(source.professionalId) : undefined;
    return {
      ...review,
      professionalId: source.professionalId,
      professionalName: professional?.name || 'Profesional de EsMiOficio'
    };
  }), [professionalsById, reviews]);

  const contactItems = useMemo(() => contactEvents.map(event => {
    const professional = event.professionalId ? professionalsById.get(event.professionalId) : undefined;
    return {
      ...event,
      professionalName: professional?.name || 'Profesional de EsMiOficio',
      trade: event.trade || professional?.trade || 'Oficio',
      city: event.city || professional?.municipality || 'Ciudad por confirmar'
    };
  }), [contactEvents, professionalsById]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError(null);

    if (!profileForm.name.trim()) {
      setProfileError('Agrega tu nombre para guardar los datos basicos.');
      return;
    }

    setIsSavingProfile(true);
    const saved = await onUpdateClientProfile({
      name: profileForm.name.trim(),
      city: profileForm.city.trim(),
      phone: profileForm.phone.trim()
    });
    setIsSavingProfile(false);
    if (saved) {
      setIsEditingProfile(false);
    } else {
      setProfileError('No pudimos actualizar tus datos. Revisa el aviso de la esquina e intenta de nuevo.');
    }
  };

  const handleRemoveSaved = (professionalId: string) => {
    setDbSavedIds(prev => prev.filter(id => id !== professionalId));
    onRemoveSavedProfessional(professionalId);
  };

  return (
    <>
      <SEOHelmet
        title="Mi actividad | EsMiOficio"
        description="Consulta tu actividad como cliente en EsMiOficio: servicios, contactos, resenas y profesionales guardados."
        canonicalUrl={getAbsoluteUrl('/mi-actividad')}
      />

      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-primary">Panel del cliente</p>
              <h1 className="text-3xl font-black text-white sm:text-4xl">Mi actividad</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Un resumen privado de los servicios, contactos, resenas y profesionales que guardaste en EsMiOficio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileError(null);
                setIsEditingProfile(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-black text-primary hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar datos basicos
            </button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
              <span className="text-2xl font-black text-white">{serviceItems.length}</span>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500">Servicios</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
              <span className="text-2xl font-black text-white">{contactItems.length}</span>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500">Contactos</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
              <span className="text-2xl font-black text-white">{pendingReviews.length}</span>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500">Resenas pendientes</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
              <span className="text-2xl font-black text-white">{savedProfessionals.length}</span>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500">Guardados</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <Section title="Servicios contratados" icon="assignment_turned_in">
                {isLoading ? (
                  <EmptyState icon="hourglass_top" text="Cargando tus servicios..." />
                ) : serviceItems.length === 0 ? (
                  <EmptyState icon="work_off" text="Aun no has contratado servicios." />
                ) : (
                  <div className="space-y-3">
                    {serviceItems.map(item => (
                      <div key={item.id} className="rounded-lg border border-border bg-surface-light/40 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-black text-white">{item.professionalName}</h3>
                            <p className="mt-1 text-sm text-gray-400">{item.trade}</p>
                            <p className="mt-2 text-xs font-bold text-gray-500">
                              {formatDate(item.date)} · {item.city}, {item.state}
                            </p>
                          </div>
                          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusCopy[item.status].className}`}>
                            {statusCopy[item.status].label}
                          </span>
                        </div>
                        {item.status === 'resena_pendiente' && (
                          <button
                            type="button"
                            onClick={() => onLeaveReview(item.professionalId)}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-black text-background hover:bg-primary-hover"
                          >
                            <span className="material-symbols-outlined text-[18px]">rate_review</span>
                            Dejar resena
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Profesionales contactados" icon="forum">
                {isLoading ? (
                  <EmptyState icon="hourglass_top" text="Cargando tus contactos..." />
                ) : contactItems.length === 0 ? (
                  <EmptyState icon="contact_phone" text="Aun no has contactado profesionales." />
                ) : (
                  <div className="divide-y divide-border">
                    {contactItems.map(item => (
                      <div key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-white">{item.professionalName}</p>
                          <p className="text-sm text-gray-400">{item.trade} · {item.city}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                          <span className="rounded-full border border-border bg-surface-light px-2 py-1 text-gray-300">
                            {getContactMethodLabel(item.contactMethod)}
                          </span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Resenas pendientes" icon="pending_actions">
                {isLoading ? (
                  <EmptyState icon="hourglass_top" text="Cargando resenas pendientes..." />
                ) : pendingReviews.length === 0 ? (
                  <EmptyState icon="task_alt" text="Aun no tienes resenas pendientes." />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {pendingReviews.map(item => (
                      <div key={item.id} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="font-black text-white">{item.professionalName}</p>
                        <p className="mt-1 text-sm text-gray-400">{item.trade}</p>
                        <button
                          type="button"
                          onClick={() => onLeaveReview(item.professionalId)}
                          className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-background hover:bg-primary-hover"
                        >
                          Dejar resena
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Resenas realizadas" icon="reviews">
                {isLoading ? (
                  <EmptyState icon="hourglass_top" text="Cargando tus resenas..." />
                ) : reviewItems.length === 0 ? (
                  <EmptyState icon="rate_review" text="Aun no has realizado resenas." />
                ) : (
                  <div className="space-y-3">
                    {reviewItems.map(item => (
                      <article key={item.id} className="rounded-lg border border-border bg-surface-light/40 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-black text-white">{item.professionalName}</h3>
                            <p className="mt-1 text-xs font-bold text-gray-500">{formatDate(item.date)}</p>
                          </div>
                          <StarRating rating={item.rating} sizeClass="text-sm" showReviews={false} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </Section>
            </div>

            <div className="space-y-5">
              <Section title="Datos basicos del cliente" icon="badge">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-black uppercase text-gray-500">Nombre</dt>
                    <dd className="mt-1 text-sm font-bold text-white">{user.name || 'Sin registrar'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-black uppercase text-gray-500">Ciudad</dt>
                    <dd className="mt-1 text-sm font-bold text-white">{user.city || 'Sin registrar'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-black uppercase text-gray-500">Telefono</dt>
                    <dd className="mt-1 text-sm font-bold text-white">{user.phone || 'Sin registrar'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-black uppercase text-gray-500">Correo</dt>
                    <dd className="mt-1 break-all text-sm font-bold text-white">{user.email || 'Sin registrar'}</dd>
                  </div>
                </dl>
              </Section>

              <Section title="Profesionales guardados" icon="bookmark">
                {savedProfessionals.length === 0 ? (
                  <EmptyState icon="bookmark_remove" text="Aun no has guardado profesionales." />
                ) : (
                  <div className="space-y-3">
                    {savedProfessionals.map(pro => (
                      <div key={pro.id} className="rounded-lg border border-border bg-surface-light/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-white">{pro.name}</p>
                            <p className="mt-1 text-sm text-gray-400">{pro.trade}</p>
                            <p className="mt-1 text-xs font-bold text-gray-500">{pro.municipality}, {pro.state}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSaved(pro.id)}
                            className="rounded-lg border border-red-400/30 px-2 py-1 text-xs font-black text-red-300 hover:bg-red-500/10"
                            aria-label={`Quitar ${pro.name} de guardados`}
                          >
                            Quitar
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onViewProfile(pro.id)}
                          className="mt-4 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-black text-white hover:border-primary/50 hover:text-primary"
                        >
                          Ver perfil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>

      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditingProfile(false)}></div>
          <form onSubmit={handleProfileSubmit} className="relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white"
              aria-label="Cerrar editor de datos"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-xl font-black text-white">Editar datos basicos</h2>
            <p className="mt-1 text-sm text-gray-400">Estos datos solo ayudan a identificar tu actividad como cliente.</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-gray-500">Nombre</span>
                <input
                  required
                  value={profileForm.name}
                  onChange={event => setProfileForm(prev => ({ ...prev, name: event.target.value }))}
                  className="h-12 w-full rounded-lg border border-border bg-surface-light px-3 text-white outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-gray-500">Ciudad</span>
                <input
                  value={profileForm.city}
                  onChange={event => setProfileForm(prev => ({ ...prev, city: event.target.value }))}
                  className="h-12 w-full rounded-lg border border-border bg-surface-light px-3 text-white outline-none focus:border-primary"
                  placeholder="Ej. Guadalajara"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-gray-500">Telefono</span>
                <input
                  value={profileForm.phone}
                  onChange={event => setProfileForm(prev => ({ ...prev, phone: event.target.value }))}
                  className="h-12 w-full rounded-lg border border-border bg-surface-light px-3 text-white outline-none focus:border-primary"
                  placeholder="Ej. 443 000 0000"
                />
              </label>
            </div>

            {profileError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                {profileError}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="h-12 flex-1 rounded-lg border border-border px-4 text-sm font-black text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="h-12 flex-1 rounded-lg bg-primary px-4 text-sm font-black text-background hover:bg-primary-hover disabled:opacity-60"
              >
                {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

const loadServiceRequests = async (clientId: string): Promise<ServiceRequestRow[]> => {
  const { data, error } = await supabase
    .from('service_requests')
    .select('id,professional_id,professional_name,trade,status,created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Client services could not be loaded.', error);
    return [];
  }

  return data || [];
};

const loadClientReviews = async (clientId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id,professional_id,author_id,author_name,rating,text,created_at')
    .eq('author_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Client reviews could not be loaded.', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    authorId: row.author_id,
    author: row.author_name || 'Cliente de EsMiOficio',
    rating: Number(row.rating) || 0,
    text: row.text || '',
    date: row.created_at,
    professionalId: row.professional_id
  } as Review & { professionalId: string }));
};

const loadSavedProfessionals = async (clientId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('client_saved_professionals')
    .select('professional_id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Saved professionals table is not available yet.', error);
    return [];
  }

  return (data || [])
    .map(row => row.professional_id)
    .filter((id): id is string => typeof id === 'string');
};

const loadContactEvents = async (clientId: string): Promise<ClientContactRow[]> => {
  const fromClientContacts = await supabase
    .from('client_contact_events')
    .select('id,professional_id,contact_method,trade,city,created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(40);

  if (!fromClientContacts.error && fromClientContacts.data) {
    return fromClientContacts.data.map(row => ({
      id: row.id,
      professionalId: row.professional_id,
      contactMethod: row.contact_method,
      trade: row.trade,
      city: row.city,
      createdAt: row.created_at
    }));
  }

  const fromActivity = await supabase
    .from('activity_events')
    .select('id,type,professional_id,trade,city,created_at')
    .eq('user_id', clientId)
    .in('type', ['contact_attempt', 'contact_unlocked'])
    .order('created_at', { ascending: false })
    .limit(40);

  if (fromActivity.error) {
    console.warn('Client contact history could not be loaded.', fromActivity.error);
    return [];
  }

  return (fromActivity.data || []).map(row => ({
    id: row.id,
    professionalId: row.professional_id,
    contactMethod: row.type === 'contact_unlocked' ? 'whatsapp' : 'contact',
    trade: row.trade,
    city: row.city,
    createdAt: row.created_at
  }));
};

export default ClientDashboard;
