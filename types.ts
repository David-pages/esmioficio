
export interface Review {
  id: string;
  authorId?: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  images?: string[];
}

export type TrustStatus = 'green' | 'yellow' | 'red';
export type VerificationLevel = 'none' | 'identity' | 'documents' | 'recommended' | 'verified';

export interface Professional {
  id: string;
  name: string;
  trade: string;
  location: string;
  municipality: string;
  state: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  coverImageUrl?: string; // New
  portfolioImages?: string[]; // New (max 5)
  verified: boolean;
  phone: string;
  description: string;
  email: string;
  yearsExperience: number;
  responseTimeMinutes?: number | null;
  coverageZones?: string[];
  services?: string[];
  startingPrice?: number | null;
  lastActiveAt?: string | null;
  jobsCount?: number;
  recommendationsCount?: number;
  trustStatus?: TrustStatus;
  verificationLevel?: VerificationLevel;
  lastSensitiveUpdate?: string; // Fecha ISO string de la última vez que cambió nombre/oficio/ubicación
  reviewsList: Review[];
}

export interface RecentWork {
  id: string;
  professionalId: string;
  title: string;
  description?: string | null;
  imageUrls: string[];
  beforeImageUrls?: string[];
  afterImageUrls?: string[];
  zone?: string | null;
  city?: string | null;
  serviceType?: string | null;
  approximateDate?: string | null;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'contact_attempt' | 'contact_unlocked' | 'profile_view' | 'search_performed' | string;
  userId?: string | null;
  professionalId?: string | null;
  contactMethod?: 'whatsapp' | 'phone' | 'contact' | string | null;
  city?: string | null;
  zone?: string | null;
  trade?: string | null;
  createdAt: string;
}

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'serious';

export interface Report {
  id: string;
  professionalId: string;
  userId?: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  professionalResponse?: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

export type MediationStatus = 'open' | 'waiting_professional' | 'waiting_client' | 'resolved' | 'unresolved' | 'closed';

export interface MediationCase {
  id: string;
  professionalId: string;
  clientId?: string;
  reportId?: string | null;
  status: MediationStatus;
  clientMessage: string;
  professionalResponse?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  closedAt?: string | null;
}

export interface LocationData {
  id: string;
  name: string;
  municipalities: { id: string; name: string }[];
}

export interface TradeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SearchFilters {
  query: string;
  state: string;
  municipality: string;
  category: string | null;
  verifiedOnly?: boolean; // Nuevo
  minRating?: number;     // Nuevo
}

export interface TradeRequest {
  id: string;
  tradeName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface User {
  id: string;
  name: string;
  role: 'USER' | 'PRO';
  proId?: string; // If role is PRO, link to their professional ID
  email?: string;
  city?: string;
  phone?: string;
}

export interface ClientProfileUpdate {
  name: string;
  city: string;
  phone: string;
}

export interface ServiceRequest {
  id: string;
  client_id: string;
  professional_id: string;
  status: 'PENDING' | 'QUOTED' | 'CONFIRMED' | 'COMPLETED';
  quote_amount?: string | number;
  client_name: string;
  professional_name: string;
  trade: string;
  created_at: string;
}

export interface JobPost {
  id: string;
  client_id: string;
  client_name: string;
  state: string;
  municipality: string;
  title: string;
  description: string;
  phone_number: string;
  status: 'OPEN' | 'CLOSED';
  created_at: string;
}
