import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TradeRequest, Professional, Review } from '../types';
import SEOHelmet from './SEOHelmet';
import StarRating from './StarRating';
import BlogAdmin from './BlogAdmin';
import {
  DEFAULT_ADMIN_METRICS_FILTERS,
  buildAdminMetrics,
  loadAdminMetricsData
} from '../lib/adminMetrics';
import type {
  AdminMetricsData,
  AdminMetricsFilters,
  AdminMetricsResult,
  MetricCard,
  MetricTableRow,
  OpportunityItem
} from '../lib/adminMetrics';

interface AdminDashboardProps {
  isAuthenticated: boolean;
  onLogin: () => Promise<boolean>;
  requests: TradeRequest[];
  onApproveRequest: (request: TradeRequest) => void;
  onRejectRequest: (id: string) => void;
  onExit: () => void;
  professionals: Professional[];
  onDeletePro: (id: string) => void;
  onToggleVerification: (id: string) => void;
  onNotifyPro: (id: string, message: string, type: 'VERIFICATION' | 'UPDATE' | 'CUSTOM') => void;
  onDeleteReview: (proId: string, reviewId: string) => void;
  onSeedData: () => Promise<void>;
}

type AdminTab = 'OVERVIEW' | 'METRICS' | 'BLOG' | 'REQUESTS' | 'PROS' | 'REVIEWS' | 'VERIFY' | 'AUDIT' | 'TOOLS';
type AuditLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type ReviewRecord = Review & {
  professionalId: string;
  professionalName: string;
  trade: string;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAuthenticated,
  onLogin,
  requests,
  onApproveRequest,
  onRejectRequest,
  onExit,
  professionals,
  onDeletePro,
  onToggleVerification,
  onNotifyPro,
  onDeleteReview,
  onSeedData
}) => {
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [messagingPro, setMessagingPro] = useState<Professional | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [proSearch, setProSearch] = useState('');
  const [proFilter, setProFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [proSort, setProSort] = useState<'recent' | 'rating' | 'reviews' | 'quality'>('quality');
  const [selectedProIds, setSelectedProIds] = useState<string[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'ALL' | AuditLevel>('ALL');
  const [metricsFilters, setMetricsFilters] = useState<AdminMetricsFilters>(DEFAULT_ADMIN_METRICS_FILTERS);
  const [metricsData, setMetricsData] = useState<AdminMetricsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsUpdatedAt, setMetricsUpdatedAt] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('esmiOficio_admin_notes');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      localStorage.removeItem('esmiOficio_admin_notes');
      return {};
    }
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');
  const verifiedPros = professionals.filter(p => p.verified);
  const pendingVerificationPros = professionals.filter(p => !p.verified);

  useEffect(() => {
    localStorage.setItem('esmiOficio_admin_notes', JSON.stringify(adminNotes));
  }, [adminNotes]);

  const refreshAdminMetrics = useCallback(async () => {
    setMetricsLoading(true);
    const data = await loadAdminMetricsData();
    setMetricsData(data);
    setMetricsUpdatedAt(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    setMetricsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshAdminMetrics();
  }, [isAuthenticated, refreshAdminMetrics]);

  const allReviews = useMemo<ReviewRecord[]>(() => (
    professionals.flatMap(pro => (pro.reviewsList || []).map(review => ({
      ...review,
      professionalId: pro.id,
      professionalName: pro.name,
      trade: pro.trade
    })))
  ), [professionals]);

  const averageRating = allReviews.length > 0
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    : 0;

  const getProfileQuality = (pro: Professional) => {
    const checks = [
      !!pro.name,
      !!pro.trade,
      !!pro.state && !!pro.municipality,
      !!pro.description && pro.description.length >= 40,
      !!pro.phone,
      !!pro.imageUrl,
      !!pro.portfolioImages?.length,
      pro.verified,
      pro.yearsExperience > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const getAuditFindings = (pro: Professional) => {
    const issues: string[] = [];
    const actions: string[] = [];
    const quality = getProfileQuality(pro);
    const hasDefaultImage = !pro.imageUrl || pro.imageUrl.includes('1542909168-82c3e7fdca5c');

    if (quality < 60) {
      issues.push('Perfil incompleto');
      actions.push('Pedir actualizacion de datos basicos');
    }
    if (!pro.verified) {
      issues.push('Sin verificacion');
      actions.push('Solicitar documentos de identidad');
    }
    if (!pro.phone || pro.phone.replace(/\D/g, '').length < 10) {
      issues.push('Telefono faltante o invalido');
      actions.push('Confirmar WhatsApp antes de mostrar el contacto');
    }
    if (!pro.description || pro.description.trim().length < 80) {
      issues.push('Descripcion corta');
      actions.push('Solicitar descripcion de servicios y zonas');
    }
    if (hasDefaultImage) {
      issues.push('Foto generica');
      actions.push('Pedir foto real del profesional o negocio');
    }
    if ((pro.portfolioImages?.length || 0) === 0) {
      issues.push('Sin trabajos recientes');
      actions.push('Pedir evidencia visual de trabajos terminados');
    }
    if ((pro.services?.length || 0) === 0) {
      issues.push('Servicios no definidos');
      actions.push('Agregar servicios concretos al perfil');
    }
    if ((pro.coverageZones?.length || 0) === 0) {
      issues.push('Zonas de cobertura vacias');
      actions.push('Agregar colonias o municipios atendidos');
    }
    if (pro.reviews === 0) {
      issues.push('Sin resenas');
      actions.push('Invitar a clientes reales a dejar resena verificada');
    }
    if (pro.reviews > 0 && pro.rating < 3.8) {
      issues.push('Rating bajo');
      actions.push('Revisar resenas y contactar al profesional');
    }
    if (pro.trustStatus === 'red' || pro.trustStatus === 'yellow') {
      issues.push(`Estado de confianza ${pro.trustStatus}`);
      actions.push('Revisar reportes y mediaciones pendientes');
    }

    const score = Math.min(
      100,
      (quality < 60 ? 25 : quality < 80 ? 10 : 0) +
      (!pro.verified ? 15 : 0) +
      (!pro.phone || pro.phone.replace(/\D/g, '').length < 10 ? 15 : 0) +
      (hasDefaultImage ? 10 : 0) +
      ((pro.portfolioImages?.length || 0) === 0 ? 10 : 0) +
      (pro.reviews === 0 ? 10 : 0) +
      (pro.reviews > 0 && pro.rating < 3.8 ? 25 : 0) +
      (pro.trustStatus === 'red' ? 35 : pro.trustStatus === 'yellow' ? 20 : 0)
    );
    const level: AuditLevel = score >= 45 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

    return {
      level,
      score,
      quality,
      issues: issues.length > 0 ? issues : ['Sin hallazgos importantes'],
      actions: Array.from(new Set(actions)).slice(0, 4)
    };
  };

  const filteredPros = professionals.filter(pro => {
    const text = `${pro.name} ${pro.trade} ${pro.email} ${pro.phone} ${pro.municipality} ${pro.state}`.toLowerCase();
    const matchesSearch = text.includes(proSearch.toLowerCase().trim());
    const matchesFilter = proFilter === 'ALL' || (proFilter === 'VERIFIED' ? pro.verified : !pro.verified);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (proSort === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
    if (proSort === 'reviews') return b.reviews - a.reviews || b.rating - a.rating;
    if (proSort === 'quality') return getProfileQuality(a) - getProfileQuality(b);
    return a.name.localeCompare(b.name);
  });

  const auditItems = useMemo(() => (
    professionals
      .map(pro => ({ pro, audit: getAuditFindings(pro) }))
      .filter(item => auditFilter === 'ALL' || item.audit.level === auditFilter)
      .sort((a, b) => b.audit.score - a.audit.score || a.pro.name.localeCompare(b.pro.name))
  ), [professionals, auditFilter]);

  const auditStats = useMemo(() => {
    const all = professionals.map(pro => getAuditFindings(pro));
    return {
      high: all.filter(item => item.level === 'HIGH').length,
      medium: all.filter(item => item.level === 'MEDIUM').length,
      low: all.filter(item => item.level === 'LOW').length,
      averageQuality: professionals.length > 0
        ? Math.round(professionals.reduce((sum, pro) => sum + getProfileQuality(pro), 0) / professionals.length)
        : 0
    };
  }, [professionals]);

  const filteredReviews = allReviews.filter(review => {
    const text = `${review.author} ${review.text} ${review.professionalName} ${review.trade}`.toLowerCase();
    return text.includes(reviewSearch.toLowerCase().trim());
  });

  const adminMetrics = useMemo(() => (
    buildAdminMetrics(professionals, metricsData, metricsFilters, getProfileQuality)
  ), [professionals, metricsData, metricsFilters]);

  const tabs: { id: AdminTab; label: string; icon: string; count?: number }[] = [
    { id: 'OVERVIEW', label: 'Resumen', icon: 'space_dashboard' },
    { id: 'METRICS', label: 'Metricas', icon: 'analytics' },
    { id: 'BLOG', label: 'Blog', icon: 'newsmode' },
    { id: 'REQUESTS', label: 'Oficios', icon: 'playlist_add_check', count: pendingRequests.length },
    { id: 'PROS', label: 'Profesionales', icon: 'engineering', count: professionals.length },
    { id: 'REVIEWS', label: 'Resenas', icon: 'rate_review', count: allReviews.length },
    { id: 'VERIFY', label: 'Verificacion', icon: 'verified_user', count: pendingVerificationPros.length },
    { id: 'AUDIT', label: 'Auditoria', icon: 'rule_settings', count: auditStats.high + auditStats.medium },
    { id: 'TOOLS', label: 'Herramientas', icon: 'tune' }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockedUntil) {
      const secsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Demasiados intentos. Espera ${secsLeft} segundos.`);
      return;
    }

    setIsCheckingLogin(true);
    const loggedIn = await onLogin();
    setIsCheckingLogin(false);

    if (loggedIn) {
      setError('');
      setLoginAttempts(0);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setLoginAttempts(0);
        setError('Demasiados intentos. Espera 30 segundos.');
        return;
      }
      setError(`Tu sesion no tiene rol administrador (intento ${newAttempts}/5).`);
    }
  };

  const handleDeleteClick = (pro: Professional) => {
    if (window.confirm(`Seguro que deseas eliminar a ${pro.name}? Esta accion no se puede deshacer.`)) {
      onDeletePro(pro.id);
    }
  };

  const openMessageModal = (pro: Professional) => {
    setMessagingPro(pro);
    setMessageText('');
  };

  const handleSendMessage = (type: 'VERIFICATION' | 'UPDATE' | 'CUSTOM') => {
    if (!messagingPro) return;

    let finalMessage = messageText;
    if (type === 'VERIFICATION') {
      finalMessage = `Hola ${messagingPro.name}, necesitamos validar tu identidad y datos de oficio para completar tu verificacion en EsMiOficio.`;
    } else if (type === 'UPDATE') {
      finalMessage = `Hola ${messagingPro.name}, tu perfil necesita actualizar datos de contacto, ubicacion o descripcion para seguir visible con buena calidad.`;
    }

    onNotifyPro(messagingPro.id, finalMessage, type);
    setMessagingPro(null);
    setMessageText('');
  };

  const handleDeleteReviewClick = (review: ReviewRecord) => {
    if (window.confirm('Confirmas que deseas eliminar esta resena permanentemente?')) {
      onDeleteReview(review.professionalId, review.id);
    }
  };

  const exportProfessionals = () => {
    const headers = ['Nombre', 'Oficio', 'Estado', 'Municipio', 'Telefono', 'Email', 'Verificado', 'Rating', 'Resenas', 'CalidadPerfil'];
    const rows = professionals.map(pro => [
      pro.name,
      pro.trade,
      pro.state,
      pro.municipality,
      pro.phone,
      pro.email,
      pro.verified ? 'Si' : 'No',
      pro.rating.toFixed(1),
      String(pro.reviews),
      `${getProfileQuality(pro)}%`
    ]);
    downloadCsv('esmioficio-profesionales.csv', headers, rows);
  };

  const exportReviews = () => {
    const headers = ['Profesional', 'Oficio', 'Autor', 'Rating', 'Fecha', 'Texto'];
    const rows = allReviews.map(review => [
      review.professionalName,
      review.trade,
      review.author,
      String(review.rating),
      review.date,
      review.text
    ]);
    downloadCsv('esmioficio-resenas.csv', headers, rows);
  };

  const exportRequests = () => {
    const headers = ['Oficio', 'Motivo', 'Estatus', 'Fecha'];
    const rows = requests.map(req => [req.tradeName, req.reason, req.status, req.date]);
    downloadCsv('esmioficio-solicitudes-oficios.csv', headers, rows);
  };

  const exportAuditReport = () => {
    const headers = ['Nivel', 'Riesgo', 'Calidad', 'Nombre', 'Oficio', 'Estado', 'Municipio', 'Hallazgos', 'Acciones', 'NotaAdmin'];
    const rows = auditItems.map(({ pro, audit }) => [
      audit.level,
      audit.score,
      `${audit.quality}%`,
      pro.name,
      pro.trade,
      pro.state,
      pro.municipality,
      audit.issues.join(' | '),
      audit.actions.join(' | '),
      adminNotes[pro.id] || ''
    ]);
    downloadCsv('esmioficio-auditoria-perfiles.csv', headers, rows);
  };

  const copyAuditSummary = async () => {
    const summary = [
      `Auditoria EsMiOficio`,
      `Riesgo alto: ${auditStats.high}`,
      `Riesgo medio: ${auditStats.medium}`,
      `Sin hallazgos criticos: ${auditStats.low}`,
      `Calidad promedio: ${auditStats.averageQuality}%`,
      '',
      ...auditItems.slice(0, 8).map(({ pro, audit }) => (
        `${audit.level} ${audit.score}/100 - ${pro.name} (${pro.trade}): ${audit.issues.join(', ')}`
      ))
    ].join('\n');

    await navigator.clipboard.writeText(summary);
  };

  const downloadCsv = (fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectedPro = (id: string) => {
    setSelectedProIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const clearSelectedPros = () => setSelectedProIds([]);

  const selectFilteredPros = () => {
    setSelectedProIds(filteredPros.map(pro => pro.id));
  };

  const selectAuditRiskPros = (level: AuditLevel) => {
    setSelectedProIds(professionals.filter(pro => getAuditFindings(pro).level === level).map(pro => pro.id));
    setActiveTab('PROS');
  };

  const bulkVerifySelected = () => {
    selectedProIds.forEach(id => {
      const pro = professionals.find(item => item.id === id);
      if (pro && !pro.verified) onToggleVerification(id);
    });
    clearSelectedPros();
  };

  const bulkRequestUpdates = () => {
    selectedProIds.forEach(id => {
      const pro = professionals.find(item => item.id === id);
      if (!pro) return;
      const audit = getAuditFindings(pro);
      onNotifyPro(
        pro.id,
        `Hola ${pro.name}, detectamos oportunidades para mejorar tu perfil en EsMiOficio: ${audit.issues.join(', ')}. Por favor actualiza tus datos para aumentar confianza y conversion.`,
        'UPDATE'
      );
    });
    clearSelectedPros();
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEOHelmet title="Administracion | EsMiOficio" noindex={true} />
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="w-full max-w-sm bg-surface p-8 rounded-2xl border border-border shadow-2xl">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-2">security</span>
              <h2 className="text-2xl font-bold text-white">Administracion</h2>
              <p className="text-gray-400 text-sm">Panel independiente de EsMiOficio</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <p className="rounded-lg border border-border bg-surface-light px-4 py-3 text-sm text-gray-300">
                Inicia sesion en el sitio con una cuenta que tenga rol administrador en Supabase.
              </p>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button
                type="submit"
                disabled={isCheckingLogin || Date.now() < lockedUntil}
                className="w-full rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-700 transition-colors"
              >
                {isCheckingLogin ? 'Verificando...' : 'Validar acceso admin'}
              </button>
            </form>
            <button onClick={onExit} className="w-full text-center text-gray-500 text-sm mt-4 hover:text-white">
              Volver al sitio publico
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHelmet title="Panel de Administracion | EsMiOficio" noindex={true} />
      <div className="min-h-screen bg-background">
        <header className="bg-surface border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">admin_panel_settings</span>
              <div>
                <h1 className="font-bold text-white">Panel de Administracion</h1>
                <p className="text-xs text-gray-500">Control operativo independiente del sitio publico</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setActiveTab('TOOLS')} className="px-3 py-2 rounded-lg bg-surface-light border border-border text-sm font-bold text-gray-300 hover:text-white transition-colors">
                Configuracion
              </button>
              <button onClick={onExit} className="px-3 py-2 rounded-lg border border-border text-sm text-gray-400 hover:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">logout</span> Salir
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${activeTab === tab.id ? 'bg-primary text-background border-primary' : 'bg-surface text-gray-400 border-border hover:text-white hover:border-primary/50'}`}
              >
                <span className="material-symbols-outlined text-[22px] block mb-2">{tab.icon}</span>
                <span className="block text-sm font-bold">{tab.label}</span>
                {typeof tab.count === 'number' && <span className="block text-xs opacity-70 mt-1">{tab.count} registros</span>}
              </button>
            ))}
          </div>

          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard icon="engineering" label="Profesionales" value={professionals.length} />
                <StatCard icon="verified" label="Verificados" value={verifiedPros.length} />
                <StatCard icon="pending_actions" label="Pendientes" value={pendingRequests.length} />
                <StatCard icon="rate_review" label="Resenas" value={allReviews.length} />
                <StatCard icon="star" label="Rating prom." value={averageRating ? averageRating.toFixed(1) : '0.0'} />
                <StatCard icon="warning" label="Riesgo alto" value={auditStats.high} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminPanel title="Trabajo pendiente" icon="priority_high">
                  <ActionRow label="Oficios por aprobar" value={pendingRequests.length} action="Revisar" onClick={() => setActiveTab('REQUESTS')} />
                  <ActionRow label="Profesionales sin verificar" value={pendingVerificationPros.length} action="Verificar" onClick={() => setActiveTab('VERIFY')} />
                  <ActionRow label="Resenas publicadas" value={allReviews.length} action="Moderar" onClick={() => setActiveTab('REVIEWS')} />
                  <ActionRow label="Perfiles en riesgo alto" value={auditStats.high} action="Auditar" onClick={() => setActiveTab('AUDIT')} />
                </AdminPanel>

                <AdminPanel title="Estado de la plataforma" icon="monitoring">
                  <MetricLine label="Solicitudes aprobadas" value={approvedRequests.length} />
                  <MetricLine label="Solicitudes rechazadas" value={rejectedRequests.length} />
                  <MetricLine label="Cobertura por estados" value={new Set(professionals.map(p => p.state)).size} />
                  <MetricLine label="Oficios activos" value={new Set(professionals.map(p => p.trade)).size} />
                  <MetricLine label="Perfiles con baja calidad" value={professionals.filter(p => getProfileQuality(p) < 60).length} />
                </AdminPanel>
              </div>
            </div>
          )}

          {activeTab === 'METRICS' && (
            <MetricsDashboard
              metrics={adminMetrics}
              filters={metricsFilters}
              onFiltersChange={setMetricsFilters}
              loading={metricsLoading}
              updatedAt={metricsUpdatedAt}
              onRefresh={refreshAdminMetrics}
            />
          )}

          {activeTab === 'BLOG' && <BlogAdmin />}

          {activeTab === 'REQUESTS' && (
            <AdminPanel title="Solicitudes de nuevos oficios" icon="playlist_add_check">
              <div className="divide-y divide-border">
                {pendingRequests.length === 0 ? (
                  <EmptyState icon="task_alt" title="No hay solicitudes pendientes" text="Cuando alguien sugiera un oficio nuevo aparecera aqui para aprobarlo o rechazarlo." />
                ) : (
                  pendingRequests.map(req => (
                    <div key={req.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {req.tradeName}
                          <span className="text-xs font-normal bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Pendiente</span>
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{req.reason || 'Sin descripcion'}</p>
                        <p className="text-gray-600 text-xs mt-2">Solicitado el: {req.date}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => onRejectRequest(req.id)} className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                          Rechazar
                        </button>
                        <button onClick={() => onApproveRequest(req)} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors text-sm font-medium shadow-lg shadow-green-900/20">
                          Aprobar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminPanel>
          )}

          {activeTab === 'PROS' && (
            <AdminPanel title="Gestion de profesionales" icon="engineering">
              <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">search</span>
                  <input value={proSearch} onChange={e => setProSearch(e.target.value)} className="w-full h-11 rounded-lg bg-surface-light border border-border pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm" placeholder="Buscar por nombre, oficio, estado, telefono o email" />
                </div>
                <select value={proFilter} onChange={e => setProFilter(e.target.value as 'ALL' | 'VERIFIED' | 'PENDING')} className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm">
                  <option value="ALL">Todos</option>
                  <option value="VERIFIED">Solo verificados</option>
                  <option value="PENDING">Sin verificar</option>
                </select>
                <select value={proSort} onChange={e => setProSort(e.target.value as 'recent' | 'rating' | 'reviews' | 'quality')} className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm">
                  <option value="quality">Menor calidad primero</option>
                  <option value="rating">Mejor rating</option>
                  <option value="reviews">Mas resenas</option>
                  <option value="recent">Nombre A-Z</option>
                </select>
              </div>
              {selectedProIds.length > 0 && (
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4">
                  <span className="text-sm text-gray-300">{selectedProIds.length} profesionales seleccionados</span>
                  <div className="flex gap-2">
                    <button onClick={bulkVerifySelected} className="px-3 py-2 rounded-lg bg-primary text-background text-sm font-bold hover:bg-primary-hover transition-colors">
                      Verificar seleccionados
                    </button>
                    <button onClick={bulkRequestUpdates} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors">
                      Pedir actualizacion
                    </button>
                    <button onClick={clearSelectedPros} className="px-3 py-2 rounded-lg border border-border text-gray-300 text-sm hover:text-white transition-colors">
                      Limpiar seleccion
                    </button>
                  </div>
                </div>
              )}
              {selectedProIds.length === 0 && filteredPros.length > 0 && (
                <div className="mb-5 flex justify-end">
                  <button onClick={selectFilteredPros} className="px-3 py-2 rounded-lg border border-border text-gray-300 text-sm font-bold hover:text-white hover:border-primary/50 transition-colors">
                    Seleccionar resultados filtrados
                  </button>
                </div>
              )}
              <ProfessionalsTable
                professionals={filteredPros}
                selectedIds={selectedProIds}
                onToggleSelected={toggleSelectedPro}
                onToggleVerification={onToggleVerification}
                onMessage={openMessageModal}
                onDelete={handleDeleteClick}
                getProfileQuality={getProfileQuality}
              />
            </AdminPanel>
          )}

          {activeTab === 'REVIEWS' && (
            <AdminPanel title="Moderacion de resenas" icon="rate_review">
              <div className="relative mb-5">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">search</span>
                <input value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} className="w-full h-11 rounded-lg bg-surface-light border border-border pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm" placeholder="Buscar resenas por profesional, oficio, autor o texto" />
              </div>
              {filteredReviews.length === 0 ? (
                <EmptyState icon="reviews" title="Sin resenas para mostrar" text="Las resenas de profesionales apareceran aqui para moderacion." />
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map(review => (
                    <div key={`${review.professionalId}-${review.id}`} className="bg-surface-light border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-white">{review.professionalName}</span>
                          <span className="text-xs text-primary">{review.trade}</span>
                          <span className="text-xs text-gray-500">por {review.author}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} sizeClass="text-xs" showValue={false} showReviews={false} />
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{review.text}</p>
                      </div>
                      <button onClick={() => handleDeleteReviewClick(review)} className="self-start p-2 text-red-400 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors" title="Eliminar resena">
                        <span className="material-symbols-outlined">delete_forever</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminPanel>
          )}

          {activeTab === 'VERIFY' && (
            <AdminPanel title="Centro de verificacion" icon="verified_user">
              {pendingVerificationPros.length === 0 ? (
                <EmptyState icon="verified" title="Todo esta verificado" text="No hay profesionales pendientes de revision." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pendingVerificationPros.map(pro => (
                    <div key={pro.id} className="rounded-2xl bg-surface-light border border-border p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <img loading="lazy" src={pro.imageUrl} alt={pro.name} className="h-12 w-12 rounded-full object-cover border border-border" />
                        <div>
                          <h3 className="text-white font-bold">{pro.name}</h3>
                          <p className="text-primary text-sm">{pro.trade}</p>
                          <p className="text-xs text-gray-500">{pro.municipality}, {pro.state}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <MetricPill label="Rating" value={pro.rating.toFixed(1)} />
                        <MetricPill label="Resenas" value={pro.reviews} />
                        <MetricPill label="Anos" value={`${pro.yearsExperience}+`} />
                        <MetricPill label="Telefono" value={pro.phone ? 'Si' : 'No'} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onToggleVerification(pro.id)} className="flex-1 py-2 rounded-lg bg-primary text-background font-bold hover:bg-primary-hover transition-colors text-sm">
                          Verificar
                        </button>
                        <button onClick={() => openMessageModal(pro)} className="px-3 py-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminPanel>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="dangerous" label="Riesgo alto" value={auditStats.high} />
                <StatCard icon="report" label="Riesgo medio" value={auditStats.medium} />
                <StatCard icon="task_alt" label="Sin urgencia" value={auditStats.low} />
                <StatCard icon="health_and_safety" label="Calidad prom." value={`${auditStats.averageQuality}%`} />
              </div>

              <AdminPanel title="Auditoria operativa de perfiles" icon="rule_settings">
                <div className="mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'ALL', label: 'Todos' },
                      { id: 'HIGH', label: 'Riesgo alto' },
                      { id: 'MEDIUM', label: 'Riesgo medio' },
                      { id: 'LOW', label: 'Sin urgencia' }
                    ] as const).map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setAuditFilter(filter.id)}
                        className={`px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${
                          auditFilter === filter.id
                            ? 'bg-primary text-background border-primary'
                            : 'bg-surface-light border-border text-gray-300 hover:text-white hover:border-primary/50'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => selectAuditRiskPros('HIGH')} className="px-3 py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                      Seleccionar alto riesgo
                    </button>
                    <button onClick={copyAuditSummary} className="px-3 py-2 rounded-lg bg-surface-light border border-border text-gray-300 text-sm font-bold hover:text-white transition-colors">
                      Copiar resumen
                    </button>
                    <button onClick={exportAuditReport} className="px-3 py-2 rounded-lg bg-surface-light border border-border text-gray-300 text-sm font-bold hover:text-white transition-colors">
                      Exportar auditoria
                    </button>
                  </div>
                </div>

                {auditItems.length === 0 ? (
                  <EmptyState icon="rule" title="Sin hallazgos" text="No hay perfiles dentro del filtro actual." />
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {auditItems.map(({ pro, audit }) => (
                      <div key={pro.id} className="rounded-2xl bg-surface-light border border-border p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            <img loading="lazy" src={pro.imageUrl} alt={pro.name} className="h-12 w-12 rounded-full object-cover border border-border" />
                            <div>
                              <h3 className="text-white font-bold">{pro.name}</h3>
                              <p className="text-primary text-sm">{pro.trade}</p>
                              <p className="text-xs text-gray-500">{pro.municipality}, {pro.state}</p>
                            </div>
                          </div>
                          <AuditBadge level={audit.level} score={audit.score} />
                        </div>

                        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <MetricPill label="Calidad" value={`${audit.quality}%`} />
                          <MetricPill label="Rating" value={pro.rating.toFixed(1)} />
                          <MetricPill label="Resenas" value={pro.reviews} />
                          <MetricPill label="Verificado" value={pro.verified ? 'Si' : 'No'} />
                        </div>

                        <div className="mb-4">
                          <p className="mb-2 text-[10px] uppercase font-black tracking-widest text-gray-500">Hallazgos</p>
                          <div className="flex flex-wrap gap-2">
                            {audit.issues.map(issue => (
                              <span key={issue} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-gray-300">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>

                        {audit.actions.length > 0 && (
                          <div className="mb-4 rounded-xl bg-background/60 border border-border p-3">
                            <p className="mb-2 text-[10px] uppercase font-black tracking-widest text-gray-500">Acciones sugeridas</p>
                            <ul className="space-y-1">
                              {audit.actions.map(action => (
                                <li key={action} className="flex items-start gap-2 text-xs text-gray-300">
                                  <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <textarea
                          value={adminNotes[pro.id] || ''}
                          onChange={event => setAdminNotes(prev => ({ ...prev, [pro.id]: event.target.value }))}
                          rows={3}
                          maxLength={300}
                          className="mb-4 w-full rounded-xl border border-border bg-surface p-3 text-sm text-white resize-none focus:border-primary focus:outline-none"
                          placeholder="Nota interna para seguimiento..."
                        />

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => openMessageModal(pro)} className="px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors">
                            Mensaje
                          </button>
                          {!pro.verified && (
                            <button onClick={() => onToggleVerification(pro.id)} className="px-3 py-2 rounded-lg bg-primary text-background text-sm font-bold hover:bg-primary-hover transition-colors">
                              Verificar
                            </button>
                          )}
                          <button onClick={() => setSelectedProIds(prev => prev.includes(pro.id) ? prev : [...prev, pro.id])} className="px-3 py-2 rounded-lg border border-border text-gray-300 text-sm font-bold hover:text-white transition-colors">
                            Seleccionar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AdminPanel>
            </div>
          )}

          {activeTab === 'TOOLS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminPanel title="Datos y mantenimiento" icon="database">
                <div className="space-y-3">
                  <button onClick={exportProfessionals} className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4 text-left hover:border-primary/50 transition-colors">
                    <span>
                      <span className="block text-white font-bold">Exportar profesionales</span>
                      <span className="block text-sm text-gray-500">Descarga CSV con contactos, ubicacion y estado de verificacion.</span>
                    </span>
                    <span className="material-symbols-outlined text-primary">download</span>
                  </button>
                  <button onClick={exportReviews} className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4 text-left hover:border-primary/50 transition-colors">
                    <span>
                      <span className="block text-white font-bold">Exportar resenas</span>
                      <span className="block text-sm text-gray-500">Descarga CSV para auditoria y moderacion.</span>
                    </span>
                    <span className="material-symbols-outlined text-primary">download</span>
                  </button>
                  <button onClick={exportRequests} className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4 text-left hover:border-primary/50 transition-colors">
                    <span>
                      <span className="block text-white font-bold">Exportar solicitudes</span>
                      <span className="block text-sm text-gray-500">Respalda las solicitudes de nuevos oficios.</span>
                    </span>
                    <span className="material-symbols-outlined text-primary">download</span>
                  </button>
                  <button onClick={exportAuditReport} className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4 text-left hover:border-primary/50 transition-colors">
                    <span>
                      <span className="block text-white font-bold">Exportar auditoria</span>
                      <span className="block text-sm text-gray-500">Incluye riesgo, hallazgos, acciones sugeridas y notas internas.</span>
                    </span>
                    <span className="material-symbols-outlined text-primary">download</span>
                  </button>
                  <button
                    onClick={async () => {
                      setIsSeeding(true);
                      await onSeedData();
                      setIsSeeding(false);
                    }}
                    disabled={isSeeding}
                    className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border p-4 text-left hover:border-primary/50 transition-colors disabled:opacity-50"
                  >
                    <span>
                      <span className="block text-white font-bold">{isSeeding ? 'Creando usuarios...' : 'Crear usuarios de prueba'}</span>
                      <span className="block text-sm text-gray-500">Genera cuentas de prueba para validar flujos de cliente y profesional.</span>
                    </span>
                    <span className="material-symbols-outlined text-primary">{isSeeding ? 'hourglass_empty' : 'person_add'}</span>
                  </button>
                </div>
              </AdminPanel>

              <AdminPanel title="Accesos del backoffice" icon="lock">
                <div className="space-y-3 text-sm text-gray-400">
                  <p>Ruta independiente: <span className="text-primary font-bold">/admin</span></p>
                  <p>La entrada de administracion ya no se muestra en el footer ni en la pagina principal.</p>
                  <p>Este panel esta marcado como <span className="text-white">noindex</span> para buscadores.</p>
                  <button onClick={onExit} className="mt-3 px-4 py-2 rounded-lg border border-border text-white hover:bg-white/10 transition-colors">
                    Ver sitio publico
                  </button>
                </div>
              </AdminPanel>
            </div>
          )}
        </div>

        {messagingPro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMessagingPro(null)}></div>
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 animate-fade-in">
              <button onClick={() => setMessagingPro(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="text-xl font-bold text-white mb-1">Contactar profesional</h3>
              <p className="text-sm text-gray-400 mb-6">Mensaje administrativo para <span className="text-primary">{messagingPro.name}</span></p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleSendMessage('VERIFICATION')} className="p-3 rounded-lg border border-border bg-surface-light hover:border-primary hover:text-primary transition-colors text-xs font-medium text-left flex flex-col gap-1">
                    <span className="material-symbols-outlined text-lg">badge</span>
                    Solicitar verificacion
                  </button>
                  <button onClick={() => handleSendMessage('UPDATE')} className="p-3 rounded-lg border border-border bg-surface-light hover:border-primary hover:text-primary transition-colors text-xs font-medium text-left flex flex-col gap-1">
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                    Solicitar actualizacion
                  </button>
                </div>

                <textarea rows={4} className="w-full rounded-lg bg-surface-light border border-border px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Escribe un mensaje personalizado..." value={messageText} onChange={e => setMessageText(e.target.value)}></textarea>
                <button onClick={() => handleSendMessage('CUSTOM')} disabled={!messageText.trim()} className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Enviar mensaje personalizado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const AdminPanel: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="bg-surface rounded-2xl border border-border p-5 md:p-6">
    <div className="flex items-center gap-2 mb-5">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </section>
);

const StatCard: React.FC<{ icon: string; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-surface border border-border p-5">
    <span className="material-symbols-outlined text-primary mb-3 block">{icon}</span>
    <span className="block text-2xl font-black text-white">{value}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

const ActionRow: React.FC<{ label: string; value: number; action: string; onClick: () => void }> = ({ label, value, action, onClick }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
    <div>
      <span className="block text-white font-bold">{label}</span>
      <span className="text-sm text-gray-500">{value} registros</span>
    </div>
    <button onClick={onClick} className="px-3 py-2 rounded-lg bg-surface-light border border-border text-sm font-bold text-gray-300 hover:text-white hover:border-primary/50 transition-colors">
      {action}
    </button>
  </div>
);

const MetricLine: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-bold">{value}</span>
  </div>
);

const MetricPill: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-lg bg-surface border border-border px-3 py-2">
    <span className="block text-white font-bold">{value}</span>
    <span className="text-[10px] uppercase text-gray-500">{label}</span>
  </div>
);

const AuditBadge: React.FC<{ level: AuditLevel; score: number }> = ({ level, score }) => {
  const styles = {
    HIGH: 'border-red-500/40 bg-red-500/10 text-red-300',
    MEDIUM: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    LOW: 'border-green-500/40 bg-green-500/10 text-green-300'
  };
  const labels = {
    HIGH: 'Riesgo alto',
    MEDIUM: 'Riesgo medio',
    LOW: 'Sin urgencia'
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${styles[level]}`}>
      <span className="material-symbols-outlined text-[14px]">{level === 'LOW' ? 'task_alt' : 'warning'}</span>
      {labels[level]} ({score})
    </span>
  );
};

const EmptyState: React.FC<{ icon: string; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="py-12 text-center text-gray-500">
    <span className="material-symbols-outlined text-5xl mb-3 opacity-60">{icon}</span>
    <h3 className="text-white font-bold mb-1">{title}</h3>
    <p className="text-sm max-w-md mx-auto">{text}</p>
  </div>
);

const MetricsDashboard: React.FC<{
  metrics: AdminMetricsResult;
  filters: AdminMetricsFilters;
  onFiltersChange: (filters: AdminMetricsFilters) => void;
  loading: boolean;
  updatedAt: string | null;
  onRefresh: () => void;
}> = ({ metrics, filters, onFiltersChange, loading, updatedAt, onRefresh }) => (
  <div className="space-y-6">
    <AdminPanel title="Metricas administrativas" icon="analytics">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-400">Lectura agregada de profesionales, clientes, servicios, conversion y confianza.</p>
          {updatedAt && <p className="mt-1 text-xs text-gray-600">Actualizado: {updatedAt}</p>}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-border bg-surface-light px-4 py-2 text-sm font-bold text-gray-300 hover:text-white disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar metricas'}
        </button>
      </div>
      <MetricsFilterBar metrics={metrics} filters={filters} onFiltersChange={onFiltersChange} />
      <MetricUnavailableNotice tables={metrics.unavailableTables} />
    </AdminPanel>

    <MetricCardGrid title="Metricas generales" icon="space_dashboard" cards={metrics.generalCards} />
    <MetricCardGrid title="Clientes" icon="groups" cards={metrics.clientCards} />
    <MetricCardGrid title="Profesionales" icon="engineering" cards={metrics.professionalCards} />
    <MetricCardGrid title="Servicios" icon="assignment" cards={metrics.serviceCards} />
    <MetricCardGrid title="Conversion" icon="conversion_path" cards={metrics.conversionCards} />
    <MetricCardGrid title="Confianza" icon="verified_user" cards={metrics.trustCards} />

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <MetricTable title="Profesionales y demanda por estado" icon="map" rows={metrics.locationRows} />
      <MetricTable title="Profesionales y demanda por ciudad" icon="location_city" rows={metrics.cityRows} />
      <MetricTable title="Oferta y demanda por oficio" icon="handyman" rows={metrics.tradeRows} />
      <MetricTable title="Solicitudes por estado" icon="assignment" rows={metrics.serviceStateRows} />
      <MetricTable title="Solicitudes por ciudad" icon="request_quote" rows={metrics.serviceCityRows} />
      <MetricTable title="Solicitudes por oficio" icon="construction" rows={metrics.serviceTradeRows} />
      <MetricTable title="Calificacion promedio por ciudad" icon="star_half" rows={metrics.ratingCityRows} />
      <MetricTable title="Calificacion promedio por oficio" icon="workspace_premium" rows={metrics.ratingTradeRows} />
      <MetricTable title="Oficios con mas resenas" icon="reviews" rows={metrics.reviewsByTradeRows} />
      <OpportunityList items={metrics.opportunities} />
      <MetricTable title="Profesionales mas vistos" icon="visibility" rows={metrics.mostViewedPros} />
      <MetricTable title="Profesionales mas contactados" icon="forum" rows={metrics.mostContactedPros} />
      <MetricTable title="Profesionales mejor calificados" icon="star" rows={metrics.topRatedPros} />
    </div>
  </div>
);

const MetricsFilterBar: React.FC<{
  metrics: AdminMetricsResult;
  filters: AdminMetricsFilters;
  onFiltersChange: (filters: AdminMetricsFilters) => void;
}> = ({ metrics, filters, onFiltersChange }) => {
  const update = (patch: Partial<AdminMetricsFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <select
        value={filters.state}
        onChange={event => update({ state: event.target.value, city: 'ALL' })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value="ALL">Todos los estados</option>
        {metrics.options.states.map(state => <option key={state} value={state}>{state}</option>)}
      </select>
      <select
        value={filters.city}
        onChange={event => update({ city: event.target.value })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value="ALL">Todas las ciudades</option>
        {metrics.options.cities.map(city => <option key={city} value={city}>{city}</option>)}
      </select>
      <select
        value={filters.trade}
        onChange={event => update({ trade: event.target.value })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value="ALL">Todos los oficios</option>
        {metrics.options.trades.map(trade => <option key={trade} value={trade}>{trade}</option>)}
      </select>
      <select
        value={filters.userType}
        onChange={event => update({ userType: event.target.value as AdminMetricsFilters['userType'] })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value="ALL">Todos los usuarios</option>
        <option value="CLIENT">Clientes</option>
        <option value="PRO">Profesionales</option>
      </select>
      <input
        type="date"
        value={filters.dateFrom}
        onChange={event => update({ dateFrom: event.target.value })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
        aria-label="Fecha inicial"
      />
      <input
        type="date"
        value={filters.dateTo}
        onChange={event => update({ dateTo: event.target.value })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
        aria-label="Fecha final"
      />
      <select
        value={filters.serviceStatus}
        onChange={event => update({ serviceStatus: event.target.value as AdminMetricsFilters['serviceStatus'] })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value="ALL">Todos los servicios</option>
        <option value="PENDING">Pendientes</option>
        <option value="QUOTED">Cotizados</option>
        <option value="CONFIRMED">Contratados</option>
        <option value="COMPLETED">Finalizados</option>
      </select>
      <select
        value={filters.minRating}
        onChange={event => update({ minRating: Number(event.target.value) })}
        className="h-11 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none text-sm"
      >
        <option value={0}>Todas las calificaciones</option>
        <option value={3}>3.0+</option>
        <option value={4}>4.0+</option>
        <option value={4.5}>4.5+</option>
      </select>
      <button
        type="button"
        onClick={() => onFiltersChange(DEFAULT_ADMIN_METRICS_FILTERS)}
        className="h-11 rounded-lg border border-border bg-surface-light px-3 text-sm font-bold text-gray-300 hover:text-white hover:border-primary/50 transition-colors xl:col-span-4"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

const MetricCardGrid: React.FC<{ title: string; icon: string; cards: MetricCard[] }> = ({ title, icon, cards }) => (
  <AdminPanel title={title} icon={icon}>
    {cards.length === 0 ? (
      <EmptyState icon="bar_chart" title="Sin metricas" text="Aun no hay datos agregados para esta seccion." />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map(card => <MetricCardView key={card.label} card={card} />)}
      </div>
    )}
  </AdminPanel>
);

const MetricCardView: React.FC<{ card: MetricCard }> = ({ card }) => {
  const toneClass = card.tone === 'good'
    ? 'text-green-300'
    : card.tone === 'warning'
      ? 'text-yellow-300'
      : card.tone === 'danger'
        ? 'text-red-300'
        : 'text-white';
  const value = card.value == null || card.value === '' ? 'Sin datos' : card.value;

  return (
    <div className="rounded-xl border border-border bg-surface-light/50 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{card.label}</p>
      <p className={`mt-2 break-words text-2xl font-black ${toneClass}`}>{value}</p>
      {card.detail && <p className="mt-2 text-xs leading-relaxed text-gray-500">{card.detail}</p>}
    </div>
  );
};

const MetricTable: React.FC<{ title: string; icon: string; rows: MetricTableRow[] }> = ({ title, icon, rows }) => {
  const maxValue = Math.max(1, ...rows.map(row => Number(row.value) || 0));

  return (
    <AdminPanel title={title} icon={icon}>
      {rows.length === 0 ? (
        <EmptyState icon="bar_chart" title="Sin datos suficientes" text="Esta metrica requiere eventos o registros dentro del filtro actual." />
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.label} className="rounded-xl border border-border bg-surface-light/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-white">{row.label}</span>
                <span className="text-sm font-black text-primary">{row.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (Number(row.value) / maxValue) * 100)}%` }}
                />
              </div>
              {row.detail && <p className="mt-2 text-xs text-gray-500">{row.detail}</p>}
              {row.secondary != null && !row.detail && <p className="mt-2 text-xs text-gray-500">{row.secondary}</p>}
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
};

const OpportunityList: React.FC<{ items: OpportunityItem[] }> = ({ items }) => (
  <AdminPanel title="Oportunidades" icon="tips_and_updates">
    {items.length === 0 ? (
      <EmptyState icon="insights" title="Sin oportunidades detectadas" text="Cuando haya demanda, oferta o actividad suficiente, apareceran hallazgos accionables." />
    ) : (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-xl border border-border bg-surface-light/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-white">{item.title}</h3>
              <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${
                item.severity === 'Alta'
                  ? 'border-red-500/40 text-red-300'
                  : item.severity === 'Media'
                    ? 'border-yellow-500/40 text-yellow-300'
                    : 'border-green-500/40 text-green-300'
              }`}>
                {item.severity}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>
    )}
  </AdminPanel>
);

const MetricUnavailableNotice: React.FC<{ tables: string[] }> = ({ tables }) => {
  if (tables.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs font-bold text-yellow-200">
      Algunas metricas aparecen incompletas porque Supabase bloqueo o no encontro: {tables.join(', ')}. Revisa RLS o aplica el SQL de analytics.
    </div>
  );
};

const ProfessionalsTable: React.FC<{
  professionals: Professional[];
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  onToggleVerification: (id: string) => void;
  onMessage: (pro: Professional) => void;
  onDelete: (pro: Professional) => void;
  getProfileQuality: (pro: Professional) => number;
}> = ({ professionals, selectedIds, onToggleSelected, onToggleVerification, onMessage, onDelete, getProfileQuality }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-gray-400">
      <thead className="bg-surface-light text-white font-medium">
        <tr>
          <th className="px-5 py-4">Sel.</th>
          <th className="px-5 py-4">Nombre</th>
          <th className="px-5 py-4">Oficio / Contacto</th>
          <th className="px-5 py-4">Ubicacion</th>
          <th className="px-5 py-4">Reputacion</th>
          <th className="px-5 py-4">Calidad</th>
          <th className="px-5 py-4 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {professionals.length === 0 ? (
          <tr>
            <td colSpan={7}>
              <EmptyState icon="search_off" title="Sin profesionales" text="No hay resultados con los filtros actuales." />
            </td>
          </tr>
        ) : (
          professionals.map(pro => (
            <tr key={pro.id} className="hover:bg-white/5 transition-colors">
              <td className="px-5 py-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(pro.id)}
                  onChange={() => onToggleSelected(pro.id)}
                  className="h-4 w-4 rounded border-border bg-surface-light"
                  aria-label={`Seleccionar ${pro.name}`}
                />
              </td>
              <td className="px-5 py-4 text-white font-medium">
                <div className="flex items-center gap-3">
                  <img loading="lazy" src={pro.imageUrl} alt={pro.name} className="h-10 w-10 rounded-full object-cover border border-border" />
                  <div>
                    {pro.name}
                    <div className="text-xs text-gray-500 font-normal">{pro.email}</div>
                    {pro.verified && <span className="inline-flex items-center gap-1 text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full mt-1">Verificado</span>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-white">{pro.trade}</span>
                <div className="text-xs text-gray-500">{pro.phone || 'Sin telefono'}</div>
              </td>
              <td className="px-5 py-4">{pro.municipality}, {pro.state}</td>
              <td className="px-5 py-4">
                <StarRating rating={pro.rating} reviews={pro.reviews} sizeClass="text-xs" />
                <div className="text-xs text-gray-500">{pro.yearsExperience}+ anos</div>
              </td>
              <td className="px-5 py-4">
                <span className={`font-bold ${getProfileQuality(pro) < 60 ? 'text-red-400' : getProfileQuality(pro) < 85 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {getProfileQuality(pro)}%
                </span>
                <div className="text-xs text-gray-500">perfil</div>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onToggleVerification(pro.id)} className={`p-2 rounded-lg transition-colors ${pro.verified ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-surface-light text-gray-500 hover:bg-blue-500/10 hover:text-blue-400'}`} title={pro.verified ? 'Quitar verificacion' : 'Verificar profesional'}>
                    <span className={`material-symbols-outlined text-[20px] ${pro.verified ? 'fill-1' : ''}`}>verified</span>
                  </button>
                  <button onClick={() => onMessage(pro)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors" title="Enviar mensaje">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </button>
                  <button onClick={() => onDelete(pro)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Eliminar profesional">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;
