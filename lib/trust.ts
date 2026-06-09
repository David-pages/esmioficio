import { ActivityEvent, Professional, RecentWork, Review, TrustStatus, VerificationLevel } from '../types';
import { supabase } from './supabaseClient';

export const DEFAULT_PRO_IMAGE = 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&h=200&auto=format&fit=crop';

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const asTrustStatus = (value: unknown): TrustStatus => {
  if (value === 'yellow' || value === 'red') return value;
  return 'green';
};

const asVerificationLevel = (value: unknown, verified?: boolean): VerificationLevel => {
  if (value === 'identity' || value === 'documents' || value === 'recommended' || value === 'verified') return value;
  return verified ? 'verified' : 'none';
};

export const mapProfessionalRow = (p: any, email = '', reviewsList: Review[] = []): Professional => {
  const verified = !!p.verified || p.verification_level === 'verified';
  const reviewCount = reviewsList.length || Number(p.reviews_count) || Number(p.reviews) || 0;
  return {
    id: p.id,
    name: p.name || 'Profesional de EsMiOficio',
    trade: p.trade || 'Oficio',
    location: p.location || '',
    municipality: p.municipality || '',
    state: p.state || '',
    rating: Number(p.rating) || 0,
    reviews: reviewCount,
    imageUrl: p.image_url || p.imageUrl || DEFAULT_PRO_IMAGE,
    coverImageUrl: p.cover_image_url || p.coverImageUrl || '',
    portfolioImages: asStringArray(p.portfolio_images || p.portfolioImages),
    verified,
    phone: p.phone || '',
    description: p.description || '',
    email,
    yearsExperience: Number(p.years_experience ?? p.yearsExperience) || 0,
    responseTimeMinutes: p.response_time_minutes == null ? null : Number(p.response_time_minutes),
    coverageZones: asStringArray(p.coverage_zones),
    services: asStringArray(p.services),
    startingPrice: p.starting_price == null ? null : Number(p.starting_price),
    lastActiveAt: p.last_active_at || null,
    jobsCount: Number(p.jobs_count) || 0,
    recommendationsCount: Number(p.recommendations_count) || reviewCount,
    trustStatus: asTrustStatus(p.trust_status),
    verificationLevel: asVerificationLevel(p.verification_level, verified),
    lastSensitiveUpdate: p.last_sensitive_update,
    reviewsList
  };
};

export const mapRecentWorkRow = (row: any): RecentWork => ({
  id: row.id,
  professionalId: row.professional_id,
  title: row.title || 'Trabajo reciente',
  description: row.description || '',
  imageUrls: asStringArray(row.image_urls),
  beforeImageUrls: asStringArray(row.before_image_urls),
  afterImageUrls: asStringArray(row.after_image_urls),
  zone: row.zone || null,
  city: row.city || null,
  serviceType: row.service_type || null,
  approximateDate: row.approximate_date || null,
  createdAt: row.created_at
});

export const mapActivityEventRow = (row: any): ActivityEvent => ({
  id: row.id,
  type: row.type,
  userId: row.user_id || null,
  professionalId: row.professional_id || null,
  contactMethod: row.contact_method || null,
  city: row.city || null,
  zone: row.zone || null,
  trade: row.trade || null,
  createdAt: row.created_at
});

export const normalizePhoneForWhatsApp = (phone?: string | null) => {
  const clean = (phone || '').replace(/\D/g, '');
  if (!clean || clean.length < 10) return '';
  return clean.startsWith('52') ? clean : `52${clean}`;
};

export const getProfessionalCity = (professional: Professional) => (
  professional.municipality || professional.location || professional.state || 'Morelia'
);

export const getPrimaryService = (professional: Professional, requestedService?: string | null) => (
  requestedService?.trim() || professional.services?.[0] || professional.trade
);

export const buildWhatsAppMessage = (professional: Professional, requestedService?: string | null, zoneOrCity?: string | null) => {
  const service = getPrimaryService(professional, requestedService);
  const place = zoneOrCity?.trim();
  const locationText = place
    ? `Estoy en ${place}.`
    : 'Te comparto mi ubicacion por aqui para confirmar si atiendes mi zona.';
  return `Hola, te vi en EsMiOficio. Necesito ayuda con: ${service}. ${locationText} Tienes disponibilidad?`;
};

export const recordActivityEvent = async (event: {
  type: 'contact_attempt' | 'contact_unlocked' | 'profile_view' | 'search_performed';
  userId?: string | null;
  professional?: Professional | null;
  city?: string | null;
  zone?: string | null;
  trade?: string | null;
}) => {
  try {
    await supabase.from('activity_events').insert([{
      type: event.type,
      user_id: event.userId || null,
      professional_id: event.professional?.id || null,
      city: event.city || event.professional?.municipality || 'Morelia',
      zone: event.zone || null,
      trade: event.trade || event.professional?.trade || null
    }]);
  } catch (error) {
    console.warn('Activity event was not recorded. Check activity_events SQL/RLS.', error);
  }
};

export const recordClientContactEvent = async (event: {
  clientId: string;
  professional: Professional;
  contactMethod: 'whatsapp' | 'phone' | 'contact';
  city?: string | null;
}) => {
  try {
    const { error } = await supabase.from('client_contact_events').insert([{
      client_id: event.clientId,
      professional_id: event.professional.id,
      contact_method: event.contactMethod,
      trade: event.professional.trade,
      city: event.city || getProfessionalCity(event.professional)
    }]);
    if (error) throw error;
  } catch (error) {
    console.warn('Client contact event was not recorded. Run supabase-client-dashboard.sql to persist contact history.', error);
  }
};

export const getRelativeTimeText = (dateValue?: string | null) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 2) return 'Hace unos minutos';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `Hace ${days} dias`;
  return 'Activo este mes';
};

export const getLastActiveText = (dateValue?: string | null) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 7) return 'Activo esta semana';
  if (days <= 30) return 'Activo este mes';
  return `Ultima actividad: ${date.toLocaleDateString('es-MX')}`;
};

export const getTrustCopy = (status?: TrustStatus) => {
  if (status === 'red') return { label: 'Estado: Rojo', detail: 'Reporte serio validado o sin respuesta tras revision.', tone: 'red' as const };
  if (status === 'yellow') return { label: 'Estado: Amarillo', detail: 'Este perfil tiene un reporte en proceso de revision.', tone: 'yellow' as const };
  return { label: 'Estado: Verde', detail: 'Sin reportes serios activos.', tone: 'green' as const };
};

export const getVerificationCopy = (level?: VerificationLevel) => {
  switch (level) {
    case 'verified':
      return 'Verificacion completa';
    case 'documents':
      return 'Documentos revisados';
    case 'identity':
      return 'Identidad revisada';
    case 'recommended':
      return 'Recomendado por clientes';
    default:
      return 'Verificacion pendiente';
  }
};

export const validateImageFile = (file: File) => {
  if (file.size > 5 * 1024 * 1024) return 'La imagen supera 5 MB. Usa una foto mas ligera.';
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) return 'No se permiten archivos SVG.';
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen valida.';
  return null;
};

export const compressImageToWebP = async (file: File, maxWidth = 1200, quality = 0.82): Promise<File> => {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('La imagen no se pudo procesar.'));
    img.src = dataUrl;
  });

  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la compresion de imagen.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webpBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  const outputBlob = webpBlob || await (await fetch(dataUrl)).blob();
  const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return new File([outputBlob], `${safeName || 'trabajo'}.webp`, { type: outputBlob.type || 'image/webp' });
};
