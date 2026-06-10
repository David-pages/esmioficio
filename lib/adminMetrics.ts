import { Professional } from '../types';
import { supabase } from './supabaseClient';

export type AdminUserTypeFilter = 'ALL' | 'CLIENT' | 'PRO';
export type AdminServiceStatusFilter = 'ALL' | 'PENDING' | 'QUOTED' | 'CONFIRMED' | 'COMPLETED';

export type AdminMetricsFilters = {
  state: string;
  city: string;
  trade: string;
  dateFrom: string;
  dateTo: string;
  userType: AdminUserTypeFilter;
  serviceStatus: AdminServiceStatusFilter;
  minRating: number;
};

export type MetricValue = number | string | null;

export type MetricCard = {
  label: string;
  value: MetricValue;
  detail?: string;
  tone?: 'default' | 'good' | 'warning' | 'danger';
};

export type MetricTableRow = {
  label: string;
  value: number;
  secondary?: number | string;
  detail?: string;
  score?: number;
};

export type OpportunityItem = {
  title: string;
  detail: string;
  severity: 'Alta' | 'Media' | 'Baja';
};

type QueryResult = {
  rows: any[];
  available: boolean;
  error?: string;
};

export type AdminMetricsData = {
  profiles: QueryResult;
  serviceRequests: QueryResult;
  activityEvents: QueryResult;
  analyticsEvents: QueryResult;
  reports: QueryResult;
  savedProfessionals: QueryResult;
  recentWorks: QueryResult;
  reviews: QueryResult;
};

export type AdminMetricsResult = {
  options: {
    states: string[];
    cities: string[];
    trades: string[];
  };
  unavailableTables: string[];
  generalCards: MetricCard[];
  clientCards: MetricCard[];
  professionalCards: MetricCard[];
  serviceCards: MetricCard[];
  conversionCards: MetricCard[];
  trustCards: MetricCard[];
  locationRows: MetricTableRow[];
  cityRows: MetricTableRow[];
  tradeRows: MetricTableRow[];
  serviceStateRows: MetricTableRow[];
  serviceCityRows: MetricTableRow[];
  serviceTradeRows: MetricTableRow[];
  ratingCityRows: MetricTableRow[];
  ratingTradeRows: MetricTableRow[];
  reviewsByTradeRows: MetricTableRow[];
  mostViewedPros: MetricTableRow[];
  mostContactedPros: MetricTableRow[];
  topRatedPros: MetricTableRow[];
  opportunities: OpportunityItem[];
};

export const DEFAULT_ADMIN_METRICS_FILTERS: AdminMetricsFilters = {
  state: 'ALL',
  city: 'ALL',
  trade: 'ALL',
  dateFrom: '',
  dateTo: '',
  userType: 'ALL',
  serviceStatus: 'ALL',
  minRating: 0
};

const CURRENT_MONTH_START = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const DEFAULT_PRO_IMAGE_MARKER = '1542909168-82c3e7fdca5c';
const DATA_SOURCE_LABELS: Record<string, string> = {
  profiles: 'profiles',
  serviceRequests: 'service_requests',
  activityEvents: 'activity_events',
  analyticsEvents: 'analytics_events',
  reports: 'reports',
  savedProfessionals: 'client_saved_professionals',
  recentWorks: 'recent_works',
  reviews: 'reviews'
};

const normalize = (value?: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const asDate = (value?: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDateRange = (value: unknown, filters: AdminMetricsFilters) => {
  const date = asDate(value);
  if (!date) return !filters.dateFrom && !filters.dateTo;

  if (filters.dateFrom) {
    const from = new Date(`${filters.dateFrom}T00:00:00`);
    if (date < from) return false;
  }

  if (filters.dateTo) {
    const to = new Date(`${filters.dateTo}T23:59:59`);
    if (date > to) return false;
  }

  return true;
};

const matchesFilter = (actual: unknown, expected: string) => (
  expected === 'ALL' || normalize(actual) === normalize(expected)
);

const increment = (map: Map<string, number>, key: string, amount = 1) => {
  const safeKey = key?.trim() || 'Sin definir';
  map.set(safeKey, (map.get(safeKey) || 0) + amount);
};

const toRows = (map: Map<string, number>, limit = 8): MetricTableRow[] => (
  Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value, score: value }))
);

const toAverageRows = (map: Map<string, { total: number; count: number }>, limit = 8): MetricTableRow[] => (
  Array.from(map.entries())
    .filter(([, stats]) => stats.count > 0)
    .map(([label, stats]) => ({
      label,
      value: Number((stats.total / stats.count).toFixed(1)),
      secondary: `${stats.count} resenas`,
      score: stats.total / stats.count
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0) || a.label.localeCompare(b.label))
    .slice(0, limit)
);

const uniqueCount = (values: Array<string | null | undefined>) => (
  new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)).size
);

const percent = (part: number, total: number) => {
  if (!total) return null;
  return `${Math.round((part / total) * 100)}%`;
};

const selectRows = async (table: string, columns: string, fallbackColumns?: string): Promise<QueryResult> => {
  const run = async (selectedColumns: string) => {
    const { data, error } = await supabase
      .from(table)
      .select(selectedColumns)
      .limit(5000);

    return { data, error };
  };

  const primary = await run(columns);
  if (!primary.error) {
    return { rows: primary.data || [], available: true };
  }

  if (fallbackColumns) {
    const fallback = await run(fallbackColumns);
    if (!fallback.error) {
      return { rows: fallback.data || [], available: true };
    }
  }

  return {
    rows: [],
    available: false,
    error: primary.error.message || `No se pudo consultar ${table}`
  };
};

export const loadAdminMetricsData = async (): Promise<AdminMetricsData> => {
  const [
    profiles,
    serviceRequests,
    activityEvents,
    analyticsEvents,
    reports,
    savedProfessionals,
    recentWorks,
    reviews
  ] = await Promise.all([
    selectRows('profiles', 'id,role,name,city,municipality,state,created_at', 'id,role,name,city,municipality,state'),
    selectRows('service_requests', 'id,client_id,professional_id,status,trade,created_at,quote_amount'),
    selectRows('activity_events', 'id,type,user_id,professional_id,city,zone,trade,created_at'),
    selectRows('analytics_events', 'id,event_type,user_id,professional_id,service_request_id,city,state,trade,metadata,created_at'),
    selectRows('reports', 'id,professional_id,user_id,status,created_at'),
    selectRows('client_saved_professionals', 'id,client_id,professional_id,created_at'),
    selectRows('recent_works', 'id,professional_id,city,service_type,created_at'),
    selectRows('reviews', 'id,professional_id,author_id,rating,created_at')
  ]);

  return {
    profiles,
    serviceRequests,
    activityEvents,
    analyticsEvents,
    reports,
    savedProfessionals,
    recentWorks,
    reviews
  };
};

export const buildAdminMetrics = (
  professionals: Professional[],
  data: AdminMetricsData | null,
  filters: AdminMetricsFilters,
  getProfileQuality: (pro: Professional) => number
): AdminMetricsResult => {
  const emptyResult: AdminMetricsResult = {
    options: {
      states: Array.from(new Set(professionals.map(pro => pro.state).filter(Boolean))).sort(),
      cities: Array.from(new Set(professionals.map(pro => pro.municipality).filter(Boolean))).sort(),
      trades: Array.from(new Set(professionals.map(pro => pro.trade).filter(Boolean))).sort()
    },
    unavailableTables: [],
    generalCards: [],
    clientCards: [],
    professionalCards: [],
    serviceCards: [],
    conversionCards: [],
    trustCards: [],
    locationRows: [],
    cityRows: [],
    tradeRows: [],
    serviceStateRows: [],
    serviceCityRows: [],
    serviceTradeRows: [],
    ratingCityRows: [],
    ratingTradeRows: [],
    reviewsByTradeRows: [],
    mostViewedPros: [],
    mostContactedPros: [],
    topRatedPros: [],
    opportunities: []
  };

  const proById = new Map(professionals.map(pro => [pro.id, pro]));
  const filteredPros = professionals.filter(pro => (
    matchesFilter(pro.state, filters.state) &&
    matchesFilter(pro.municipality, filters.city) &&
    matchesFilter(pro.trade, filters.trade) &&
    pro.rating >= filters.minRating
  ));
  const filteredProIds = new Set(filteredPros.map(pro => pro.id));
  const allReviewsFromPros = filteredPros.flatMap(pro => pro.reviewsList.map(review => ({
    ...review,
    professional_id: pro.id,
    author_id: review.authorId || null,
    created_at: review.date,
    state: pro.state,
    city: pro.municipality,
    trade: pro.trade
  }))).filter(review => review.rating >= filters.minRating);

  if (!data) {
    return {
      ...emptyResult,
      generalCards: [
        { label: 'Total profesionales registrados', value: filteredPros.length },
        { label: 'Clientes registrados', value: null, detail: 'Sin datos suficientes' },
        { label: 'Usuarios activos', value: null, detail: 'Sin datos suficientes' },
        { label: 'Profesionales verificados', value: filteredPros.filter(pro => pro.verified).length }
      ]
    };
  }

  const unavailableTables = Object.entries(data)
    .filter(([, result]) => !result.available)
    .map(([table]) => DATA_SOURCE_LABELS[table] || table);

  const profiles = data.profiles.rows;
  const roleByUserId = new Map(profiles.map(profile => [profile.id, normalize(profile.role)]));
  const profileStates = profiles.map(profile => profile.state).filter(Boolean);
  const profileCities = profiles.map(profile => profile.city || profile.municipality).filter(Boolean);
  const matchesUserType = (userId?: string | null) => {
    if (filters.userType === 'ALL') return true;
    if (!userId) return false;
    const role = roleByUserId.get(userId);
    const isPro = role === 'pro' || role === 'professional' || role === 'profesional' || proById.has(userId);
    return filters.userType === 'PRO' ? isPro : !isPro;
  };

  const clientProfiles = data.profiles.available
    ? profiles.filter(profile => {
        const role = normalize(profile.role);
        return role !== 'pro' && role !== 'professional' && role !== 'profesional';
      }).filter(profile => (
        matchesFilter(profile.state, filters.state) &&
        matchesFilter(profile.city || profile.municipality, filters.city)
      ))
    : [];

  const analyticsRows = data.analyticsEvents.rows
    .filter(event => isWithinDateRange(event.created_at, filters))
    .map(event => ({
      id: event.id,
      type: event.event_type,
      userId: event.user_id,
      professionalId: event.professional_id,
      serviceRequestId: event.service_request_id,
      city: event.city,
      state: event.state,
      trade: event.trade,
      createdAt: event.created_at
    }));

  const activityRows = data.activityEvents.rows
    .filter(event => isWithinDateRange(event.created_at, filters))
    .map(event => {
      const pro = event.professional_id ? proById.get(event.professional_id) : null;
      const mappedType = event.type === 'contact_unlocked'
        ? 'whatsapp_click'
        : event.type;
      return {
        id: event.id,
        type: mappedType,
        userId: event.user_id,
        professionalId: event.professional_id,
        serviceRequestId: null,
        city: event.city || pro?.municipality || null,
        state: pro?.state || null,
        trade: event.trade || pro?.trade || null,
        createdAt: event.created_at
      };
    });

  const allEvents = [...analyticsRows, ...activityRows].filter(event => {
    const pro = event.professionalId ? proById.get(event.professionalId) : null;
    return (
      matchesUserType(event.userId) &&
      matchesFilter(event.state || pro?.state, filters.state) &&
      matchesFilter(event.city || pro?.municipality, filters.city) &&
      matchesFilter(event.trade || pro?.trade, filters.trade)
    );
  });

  const serviceRows = data.serviceRequests.rows.filter(request => {
    const pro = request.professional_id ? proById.get(request.professional_id) : null;
    return (
      isWithinDateRange(request.created_at, filters) &&
      (filters.serviceStatus === 'ALL' || request.status === filters.serviceStatus) &&
      matchesFilter(pro?.state, filters.state) &&
      matchesFilter(pro?.municipality, filters.city) &&
      matchesFilter(request.trade || pro?.trade, filters.trade) &&
      (!pro || pro.rating >= filters.minRating)
    );
  });

  const reviewRows = data.reviews.available
    ? data.reviews.rows.filter(review => {
        const pro = review.professional_id ? proById.get(review.professional_id) : null;
        return (
          isWithinDateRange(review.created_at, filters) &&
          matchesFilter(pro?.state, filters.state) &&
          matchesFilter(pro?.municipality, filters.city) &&
          matchesFilter(pro?.trade, filters.trade) &&
          Number(review.rating) >= filters.minRating
        );
      })
    : allReviewsFromPros;

  const reportRows = data.reports.rows.filter(report => {
    const pro = report.professional_id ? proById.get(report.professional_id) : null;
    return (
      isWithinDateRange(report.created_at, filters) &&
      matchesFilter(pro?.state, filters.state) &&
      matchesFilter(pro?.municipality, filters.city) &&
      matchesFilter(pro?.trade, filters.trade)
    );
  });

  const savedRows = data.savedProfessionals.rows.filter(row => isWithinDateRange(row.created_at, filters));
  const recentWorkRows = data.recentWorks.rows.filter(row => {
    const pro = row.professional_id ? proById.get(row.professional_id) : null;
    return (
      isWithinDateRange(row.created_at, filters) &&
      matchesFilter(pro?.state, filters.state) &&
      matchesFilter(row.city || pro?.municipality, filters.city) &&
      matchesFilter(row.service_type || pro?.trade, filters.trade)
    );
  });

  const currentMonthEvents = allEvents.filter(event => {
    const date = asDate(event.createdAt);
    return date ? date >= CURRENT_MONTH_START : false;
  });
  const currentMonthServices = serviceRows.filter(request => {
    const date = asDate(request.created_at);
    return date ? date >= CURRENT_MONTH_START : false;
  });
  const currentMonthReviews = reviewRows.filter(review => {
    const date = asDate(review.created_at);
    return date ? date >= CURRENT_MONTH_START : false;
  });

  const profileViews = allEvents.filter(event => event.type === 'profile_view').length;
  const whatsappClicks = allEvents.filter(event => event.type === 'whatsapp_click' || event.type === 'contact_unlocked').length;
  const phoneClicks = allEvents.filter(event => event.type === 'phone_click').length;
  const contactClicks = whatsappClicks + phoneClicks + allEvents.filter(event => event.type === 'contact_attempt').length;
  const searches = allEvents.filter(event => event.type === 'search_performed').length;
  const completedServices = serviceRows.filter(request => request.status === 'COMPLETED');
  const hiredServices = serviceRows.filter(request => request.status === 'CONFIRMED' || request.status === 'COMPLETED');
  const reviewedServiceProIds = new Set(reviewRows.map(review => `${review.author_id || ''}:${review.professional_id || ''}`));
  const completedWithReview = completedServices.filter(request => reviewedServiceProIds.has(`${request.client_id || ''}:${request.professional_id || ''}`)).length;
  const completedPendingReview = Math.max(0, completedServices.length - completedWithReview);

  const activeUserIds = uniqueCount([
    ...allEvents.map(event => event.userId),
    ...serviceRows.map(request => request.client_id),
    ...reviewRows.map(review => review.author_id)
  ]);
  const activeClientIdsThisMonth = uniqueCount([
    ...currentMonthEvents.map(event => event.userId),
    ...currentMonthServices.map(request => request.client_id),
    ...currentMonthReviews.map(review => review.author_id)
  ]);
  const activeProIds = new Set([
    ...currentMonthEvents.map(event => event.professionalId).filter(Boolean),
    ...currentMonthServices.map(request => request.professional_id).filter(Boolean),
    ...recentWorkRows.map(row => row.professional_id).filter(Boolean),
    ...filteredPros.filter(pro => {
      const lastActive = asDate(pro.lastActiveAt);
      return lastActive ? lastActive >= CURRENT_MONTH_START : false;
    }).map(pro => pro.id)
  ]);

  const completePros = filteredPros.filter(pro => getProfileQuality(pro) >= 80);
  const incompletePros = filteredPros.filter(pro => getProfileQuality(pro) < 80);
  const defaultImagePros = filteredPros.filter(pro => !pro.imageUrl || pro.imageUrl.includes(DEFAULT_PRO_IMAGE_MARKER));
  const prosWithRecentWorks = new Set(recentWorkRows.map(row => row.professional_id));

  const eventProStats = new Map<string, { views: number; contacts: number }>();
  allEvents.forEach(event => {
    if (!event.professionalId || !filteredProIds.has(event.professionalId)) return;
    const stats = eventProStats.get(event.professionalId) || { views: 0, contacts: 0 };
    if (event.type === 'profile_view') stats.views += 1;
    if (['whatsapp_click', 'phone_click', 'contact_unlocked', 'contact_attempt'].includes(event.type)) stats.contacts += 1;
    eventProStats.set(event.professionalId, stats);
  });

  const viewsByPro = new Map<string, number>();
  const contactsByPro = new Map<string, number>();
  eventProStats.forEach((stats, proId) => {
    const pro = proById.get(proId);
    if (!pro) return;
    viewsByPro.set(pro.name, stats.views);
    contactsByPro.set(pro.name, stats.contacts);
  });

  const stateRows = new Map<string, number>();
  const cityRows = new Map<string, number>();
  const tradeRows = new Map<string, number>();
  const stateDemand = new Map<string, number>();
  const cityDemand = new Map<string, number>();
  const tradeDemand = new Map<string, number>();
  const serviceStateRows = new Map<string, number>();
  const serviceCityRows = new Map<string, number>();
  const serviceTradeRows = new Map<string, number>();
  const ratingCityRows = new Map<string, { total: number; count: number }>();
  const ratingTradeRows = new Map<string, { total: number; count: number }>();
  const reviewsByTradeRows = new Map<string, number>();

  filteredPros.forEach(pro => {
    increment(stateRows, pro.state);
    increment(cityRows, pro.municipality);
    increment(tradeRows, pro.trade);
    if (pro.reviews > 0) {
      const cityKey = pro.municipality || 'Sin definir';
      const tradeKey = pro.trade || 'Sin definir';
      const cityStats = ratingCityRows.get(cityKey) || { total: 0, count: 0 };
      const tradeStats = ratingTradeRows.get(tradeKey) || { total: 0, count: 0 };
      cityStats.total += pro.rating * pro.reviews;
      cityStats.count += pro.reviews;
      tradeStats.total += pro.rating * pro.reviews;
      tradeStats.count += pro.reviews;
      ratingCityRows.set(cityKey, cityStats);
      ratingTradeRows.set(tradeKey, tradeStats);
      increment(reviewsByTradeRows, tradeKey, pro.reviews);
    }
  });

  allEvents.forEach(event => {
    if (event.type !== 'search_performed' && event.type !== 'profile_view' && !String(event.type).includes('click')) return;
    increment(stateDemand, event.state || proById.get(event.professionalId || '')?.state || 'Sin definir');
    increment(cityDemand, event.city || proById.get(event.professionalId || '')?.municipality || 'Sin definir');
    increment(tradeDemand, event.trade || proById.get(event.professionalId || '')?.trade || 'Sin definir');
  });
  serviceRows.forEach(request => {
    const pro = proById.get(request.professional_id || '');
    const state = pro?.state || 'Sin definir';
    const city = pro?.municipality || 'Sin definir';
    const trade = request.trade || pro?.trade || 'Sin definir';
    increment(stateDemand, state, 2);
    increment(cityDemand, city, 2);
    increment(tradeDemand, trade, 2);
    increment(serviceStateRows, state);
    increment(serviceCityRows, city);
    increment(serviceTradeRows, trade);
  });
  if (reviewRows.length > 0) {
    reviewsByTradeRows.clear();
    reviewRows.forEach(review => {
      const pro = proById.get(review.professional_id || '');
      increment(reviewsByTradeRows, pro?.trade || 'Sin definir');
    });
  }

  const locationRows = toRows(stateRows, 10).map(row => ({
    ...row,
    secondary: stateDemand.get(row.label) || 0,
    detail: `${row.value} profesionales · ${stateDemand.get(row.label) || 0} demanda`
  }));
  const cityMetricRows = toRows(cityRows, 10).map(row => ({
    ...row,
    secondary: cityDemand.get(row.label) || 0,
    detail: `${row.value} profesionales · ${cityDemand.get(row.label) || 0} demanda`
  }));
  const tradeMetricRows = toRows(tradeRows, 12).map(row => ({
    ...row,
    secondary: tradeDemand.get(row.label) || 0,
    detail: `${row.value} profesionales · ${tradeDemand.get(row.label) || 0} demanda`
  }));

  const clientsWithSearch = uniqueCount(allEvents.filter(event => event.type === 'search_performed').map(event => event.userId));
  const clientsWithContact = uniqueCount(allEvents.filter(event => ['whatsapp_click', 'phone_click', 'contact_unlocked', 'contact_attempt'].includes(event.type)).map(event => event.userId));
  const clientsWithService = uniqueCount(serviceRows.map(request => request.client_id));
  const clientsWithHired = uniqueCount(hiredServices.map(request => request.client_id));
  const clientsWithReview = uniqueCount(reviewRows.map(review => review.author_id));
  const clientsWithSavedPros = data.savedProfessionals.available ? uniqueCount(savedRows.map(row => row.client_id)) : null;
  const clientServiceCounts: Map<string, number> = serviceRows.reduce((map: Map<string, number>, request) => {
    if (request.client_id) map.set(request.client_id, (map.get(request.client_id) || 0) + 1);
    return map;
  }, new Map<string, number>());
  const recurringClients = data.serviceRequests.available
    ? Array.from(clientServiceCounts.values()).filter(count => count > 1).length
    : null;

  const averageRating = reviewRows.length > 0
    ? reviewRows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewRows.length
    : (allReviewsFromPros.length > 0 ? allReviewsFromPros.reduce((sum, review) => sum + review.rating, 0) / allReviewsFromPros.length : 0);
  const positiveReviews = reviewRows.filter(review => Number(review.rating) >= 4).length;
  const negativeReviews = reviewRows.filter(review => Number(review.rating) <= 2).length;
  const reportedProIds = new Set(reportRows.map(report => report.professional_id).filter(Boolean));
  const reportedClientIds = new Set(reportRows.map(report => report.user_id).filter(Boolean));

  const newUsersThisMonth = data.profiles.available && profiles.some(profile => profile.created_at)
    ? profiles.filter(profile => {
        const date = asDate(profile.created_at);
        return date ? date >= CURRENT_MONTH_START : false;
      }).length
    : null;

  const generalCards: MetricCard[] = [
    { label: 'Total profesionales registrados', value: filteredPros.length },
    { label: 'Total clientes registrados', value: data.profiles.available ? clientProfiles.length : null, detail: data.profiles.available ? undefined : 'Requiere profiles' },
    { label: 'Total usuarios activos', value: activeUserIds, detail: 'Eventos, solicitudes o resenas' },
    { label: 'Usuarios nuevos este mes', value: newUsersThisMonth, detail: newUsersThisMonth == null ? 'Requiere profiles.created_at' : undefined },
    { label: 'Profesionales activos', value: activeProIds.size },
    { label: 'Profesionales inactivos', value: Math.max(0, filteredPros.length - activeProIds.size), tone: 'warning' },
    { label: 'Perfiles completos', value: completePros.length, tone: 'good' },
    { label: 'Perfiles incompletos', value: incompletePros.length, tone: incompletePros.length ? 'warning' : 'good' },
    { label: 'Profesionales verificados', value: filteredPros.filter(pro => pro.verified).length, tone: 'good' },
    { label: 'Pendientes de revision', value: filteredPros.filter(pro => !pro.verified).length, tone: 'warning' }
  ];

  const clientCards: MetricCard[] = [
    { label: 'Clientes registrados', value: data.profiles.available ? clientProfiles.length : null, detail: data.profiles.available ? undefined : 'Requiere profiles' },
    { label: 'Clientes activos este mes', value: activeClientIdsThisMonth },
    { label: 'Clientes que buscaron', value: clientsWithSearch },
    { label: 'Clientes que contactaron', value: clientsWithContact },
    { label: 'Clientes con solicitud', value: clientsWithService },
    { label: 'Clientes que contrataron', value: clientsWithHired },
    { label: 'Clientes que dejaron resena', value: clientsWithReview },
    { label: 'Resenas pendientes', value: completedPendingReview },
    { label: 'Clientes con guardados', value: clientsWithSavedPros, detail: clientsWithSavedPros == null ? 'Requiere client_saved_professionals' : undefined },
    { label: 'Clientes recurrentes', value: recurringClients, detail: recurringClients == null ? 'Requiere service_requests' : undefined }
  ];

  const professionalCards: MetricCard[] = [
    { label: 'Activos este mes', value: activeProIds.size },
    { label: 'Perfil completo', value: completePros.length },
    { label: 'Con foto de perfil', value: filteredPros.length - defaultImagePros.length },
    { label: 'Con foto de portada', value: filteredPros.filter(pro => !!pro.coverImageUrl).length },
    { label: 'Con trabajos recientes', value: prosWithRecentWorks.size },
    { label: 'Mas vistos', value: toRows(viewsByPro, 1)[0]?.label || null, detail: toRows(viewsByPro, 1)[0]?.value ? `${toRows(viewsByPro, 1)[0].value} vistas` : 'Sin datos suficientes' },
    { label: 'Mas contactados', value: toRows(contactsByPro, 1)[0]?.label || null, detail: toRows(contactsByPro, 1)[0]?.value ? `${toRows(contactsByPro, 1)[0].value} contactos` : 'Sin datos suficientes' },
    { label: 'Con mas resenas', value: [...filteredPros].sort((a, b) => b.reviews - a.reviews)[0]?.name || null },
    { label: 'Mejor calificados', value: [...filteredPros].filter(pro => pro.reviews > 0).sort((a, b) => b.rating - a.rating)[0]?.name || null },
    { label: 'Reportados', value: data.reports.available ? reportedProIds.size : null, detail: data.reports.available ? undefined : 'Requiere reports' },
    { label: 'Sin actividad', value: Math.max(0, filteredPros.length - activeProIds.size) }
  ];

  const serviceCards: MetricCard[] = [
    { label: 'Total solicitudes', value: data.serviceRequests.available ? serviceRows.length : null, detail: data.serviceRequests.available ? undefined : 'Requiere service_requests' },
    { label: 'Pendientes', value: serviceRows.filter(request => request.status === 'PENDING').length },
    { label: 'Aceptadas/cotizadas', value: serviceRows.filter(request => request.status === 'QUOTED' || request.status === 'CONFIRMED').length },
    { label: 'Finalizadas', value: completedServices.length },
    { label: 'Con resena pendiente', value: completedPendingReview },
    { label: 'Con resena completada', value: completedWithReview },
    { label: 'Tiempo solicitud-contacto', value: null, detail: 'Requiere evento con service_request_id y timestamp de contacto' },
    { label: 'Tiempo solicitud-finalizacion', value: null, detail: 'Requiere historial de cambios de estado o completed_at' }
  ];

  const conversionCards: MetricCard[] = [
    { label: 'Visitas a perfiles', value: profileViews },
    { label: 'Clicks WhatsApp', value: whatsappClicks },
    { label: 'Clicks llamada', value: phoneClicks, detail: data.analyticsEvents.available ? undefined : 'Requiere analytics_events phone_click' },
    { label: 'Solicitudes de servicio', value: serviceRows.length },
    { label: 'Servicios contratados', value: hiredServices.length },
    { label: 'Resenas realizadas', value: reviewRows.length },
    { label: 'Visita a contacto', value: percent(contactClicks, profileViews) },
    { label: 'Contacto a solicitud', value: percent(serviceRows.length, contactClicks) },
    { label: 'Solicitud a finalizado', value: percent(completedServices.length, serviceRows.length) },
    { label: 'Finalizado a resena', value: percent(completedWithReview, completedServices.length) }
  ];

  const trustCards: MetricCard[] = [
    { label: 'Calificacion promedio general', value: averageRating ? averageRating.toFixed(1) : '0.0' },
    { label: 'Total resenas', value: reviewRows.length },
    { label: 'Resenas positivas', value: positiveReviews, tone: 'good' },
    { label: 'Resenas negativas', value: negativeReviews, tone: negativeReviews ? 'warning' : 'good' },
    { label: 'Pendientes moderacion', value: null, detail: 'Requiere columna status en reviews' },
    { label: 'Reportes recibidos', value: data.reports.available ? reportRows.length : null, detail: data.reports.available ? undefined : 'Requiere reports' },
    { label: 'Profesionales con reportes', value: data.reports.available ? reportedProIds.size : null },
    { label: 'Clientes con reportes', value: data.reports.available ? reportedClientIds.size : null },
    { label: 'Semaforo verde', value: filteredPros.filter(pro => (pro.trustStatus || 'green') === 'green').length },
    { label: 'Semaforo amarillo', value: filteredPros.filter(pro => pro.trustStatus === 'yellow').length },
    { label: 'Semaforo rojo', value: filteredPros.filter(pro => pro.trustStatus === 'red').length }
  ];

  const searchNoContactClients = new Map<string, { searches: number; contacts: number }>();
  allEvents.forEach(event => {
    if (!event.userId) return;
    const stats = searchNoContactClients.get(event.userId) || { searches: 0, contacts: 0 };
    if (event.type === 'search_performed') stats.searches += 1;
    if (['whatsapp_click', 'phone_click', 'contact_unlocked', 'contact_attempt'].includes(event.type)) stats.contacts += 1;
    searchNoContactClients.set(event.userId, stats);
  });

  const opportunities: OpportunityItem[] = [
    ...Array.from(cityDemand.entries())
      .map(([city, demand]) => ({ city, demand, supply: cityRows.get(city) || 0 }))
      .filter(item => item.demand >= 3 && item.supply <= 1)
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 4)
      .map(item => ({
        title: `Alta demanda en ${item.city}`,
        detail: `${item.demand} senales de demanda y ${item.supply} profesionales.`,
        severity: item.supply === 0 ? 'Alta' as const : 'Media' as const
      })),
    ...Array.from(tradeDemand.entries())
      .map(([trade, demand]) => ({ trade, demand, supply: tradeRows.get(trade) || 0 }))
      .filter(item => item.demand >= 3 && item.supply <= 1)
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 4)
      .map(item => ({
        title: `Oficio con poca oferta: ${item.trade}`,
        detail: `${item.demand} busquedas/contactos/solicitudes y ${item.supply} profesionales.`,
        severity: item.supply === 0 ? 'Alta' as const : 'Media' as const
      })),
    ...Array.from(eventProStats.entries())
      .map(([proId, stats]) => ({ pro: proById.get(proId), ...stats }))
      .filter(item => item.pro && item.views >= 3 && item.contacts <= 1)
      .slice(0, 3)
      .map(item => ({
        title: `${item.pro!.name} tiene visitas pero pocos contactos`,
        detail: `${item.views} vistas y ${item.contacts} contactos. Revisar foto, descripcion, precio o WhatsApp.`,
        severity: 'Media' as const
      })),
    ...Array.from(eventProStats.entries())
      .map(([proId, stats]) => ({ pro: proById.get(proId), ...stats }))
      .filter(item => item.pro && item.contacts >= 3 && item.pro.reviews === 0)
      .slice(0, 3)
      .map(item => ({
        title: `${item.pro!.name} recibe contactos pero no resenas`,
        detail: `${item.contacts} contactos registrados y 0 resenas. Pedir seguimiento post-servicio.`,
        severity: 'Media' as const
      })),
    ...Array.from(searchNoContactClients.entries())
      .filter(([, stats]) => stats.searches >= 3 && stats.contacts === 0)
      .slice(0, 3)
      .map(([, stats]) => ({
        title: 'Cliente busca mucho pero no contacta',
        detail: `${stats.searches} busquedas y 0 contactos. Puede faltar oferta o confianza en resultados.`,
        severity: 'Baja' as const
      })),
    ...incompletePros.slice(0, 5).map(pro => ({
      title: `${pro.name} no ha completado perfil`,
      detail: `${getProfileQuality(pro)}% de calidad. Falta mejorar datos, imagenes o confianza.`,
      severity: getProfileQuality(pro) < 60 ? 'Alta' as const : 'Media' as const
    }))
  ].slice(0, 12);

  const options = {
    states: Array.from(new Set([...filteredPros.map(pro => pro.state), ...profileStates].filter(Boolean))).sort(),
    cities: Array.from(new Set([...filteredPros.map(pro => pro.municipality), ...profileCities].filter(Boolean))).sort(),
    trades: Array.from(new Set(filteredPros.map(pro => pro.trade).filter(Boolean))).sort()
  };

  return {
    options,
    unavailableTables,
    generalCards,
    clientCards,
    professionalCards,
    serviceCards,
    conversionCards,
    trustCards,
    locationRows,
    cityRows: cityMetricRows,
    tradeRows: tradeMetricRows,
    serviceStateRows: toRows(serviceStateRows, 10),
    serviceCityRows: toRows(serviceCityRows, 10),
    serviceTradeRows: toRows(serviceTradeRows, 12),
    ratingCityRows: toAverageRows(ratingCityRows, 10),
    ratingTradeRows: toAverageRows(ratingTradeRows, 12),
    reviewsByTradeRows: toRows(reviewsByTradeRows, 12),
    mostViewedPros: toRows(viewsByPro, 8),
    mostContactedPros: toRows(contactsByPro, 8),
    topRatedPros: filteredPros
      .filter(pro => pro.reviews > 0)
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 8)
      .map(pro => ({ label: pro.name, value: Number(pro.rating.toFixed(1)), secondary: `${pro.reviews} resenas`, detail: pro.trade, score: pro.rating })),
    opportunities
  };
};
