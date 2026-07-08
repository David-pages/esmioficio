
import React, { useState, useEffect, useMemo } from 'react';
import { MEXICO_LOCATIONS, TRADES } from '../constants';
import { SearchFilters, Professional } from '../types';
import SEOHelmet from './SEOHelmet';
import StarRating from './StarRating';
import TrustSignal from './TrustSignal';
import LocalActivitySummary from './LocalActivitySummary';
import { getLastActiveText } from '../lib/trust';
import { getAbsoluteUrl } from '../lib/siteUrl';
import { getSearchIntentTrades, matchesSearchIntent, normalizeSearchText } from '../lib/searchIntents';

// Quita acentos y pasa a minúsculas para comparar de forma flexible.
const normalizeSearch = (value: string) => (value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '');

// Palabras vacías que no aportan al matching de oficios.
const SEARCH_STOPWORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'en', 'para',
  'por', 'con', 'y', 'o', 'a', 'al', 'del', 'mi', 'tu', 'su', 'me', 'que',
  'urgente', 'cerca', 'casa', 'hogar', 'servicio', 'servicios', 'necesito', 'busco'
]);

// Sinónimos / necesidades comunes mapeadas al nombre del oficio que las resuelve.
// Permite que "fuga de agua" encuentre plomeros, "apagón" encuentre electricistas, etc.
const NEED_SYNONYMS: Record<string, string[]> = {
  plomero: ['fuga', 'fugas', 'agua', 'tuberia', 'tuberias', 'drenaje', 'goteo', 'tinaco', 'bomba', 'sanitario', 'wc', 'cisterna', 'plomeria', 'destapar', 'coladera'],
  electricista: ['apagon', 'electrico', 'electrica', 'corto', 'cortocircuito', 'luz', 'foco', 'contacto', 'cableado', 'breaker', 'pastilla', 'electricidad', 'instalacion'],
  pintor: ['pintura', 'pintar', 'pared', 'paredes', 'muro', 'muros', 'fachada', 'barniz'],
  impermeabilizador: ['impermeabilizar', 'impermeabilizacion', 'gotera', 'goteras', 'filtracion', 'humedad', 'techo', 'azotea', 'impermeabilizante'],
  carpintero: ['mueble', 'muebles', 'madera', 'closet', 'closets', 'puerta', 'puertas', 'carpinteria'],
  albanil: ['construccion', 'obra', 'ladrillo', 'cemento', 'yeso', 'barda', 'firme', 'aplanado', 'albanileria'],
  mecanico: ['carro', 'auto', 'coche', 'motor', 'frenos', 'clutch', 'afinacion', 'mecanica'],
  jardinero: ['jardin', 'pasto', 'poda', 'podar', 'cesped', 'arbol', 'arboles', 'jardineria'],
  cerrajero: ['cerradura', 'chapa', 'candado', 'cerrajeria'],
  fumigador: ['plaga', 'plagas', 'insecto', 'insectos', 'cucaracha', 'cucarachas', 'fumigar', 'fumigacion'],
  herrero: ['herreria', 'porton', 'reja', 'rejas', 'soldar', 'metal', 'estructura'],
  vidriero: ['vidrio', 'ventana', 'ventanas', 'cristal', 'cancel'],
  cocinero: ['cocinar', 'banquete', 'comida', 'chef'],
};

// Construye la lista invertida: palabra-necesidad -> oficio sugerido.
const SYNONYM_TO_TRADE: Record<string, string[]> = Object.entries(NEED_SYNONYMS)
  .reduce((acc, [trade, words]) => {
    words.forEach(word => {
      if (!acc[word]) acc[word] = [];
      acc[word].push(trade);
    });
    return acc;
  }, {} as Record<string, string[]>);

interface SearchResultsProps {
  filters: SearchFilters;
  onViewProfile: (proId: string) => void;
  onContact?: (pro: Professional) => void;
  professionals: Professional[];
  onSuggestTrade: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isFavoritesView?: boolean;
  loadError?: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  filters, 
  onViewProfile, 
  onContact,
  professionals, 
  onSuggestTrade,
  favorites,
  onToggleFavorite,
  isFavoritesView,
  loadError
}) => {
  const [loading, setLoading] = useState(true);
  
  // Local Filter State (to allow toggling within the view without going back to Home)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [experienceFilter, setExperienceFilter] = useState<'Todos' | '2+ años' | '5+ años' | '10+ años'>('Todos');
  const [sortMode, setSortMode] = useState<'recommended' | 'rating' | 'experience' | 'reviews'>('recommended');

  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Simulate network loading for better UX
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [localFilters, experienceFilter, sortMode]);

  const renderBadge = (years: number, verified: boolean) => {
    const level = years >= 10 ? 'Maestro' : years >= 6 ? 'Experto' : years >= 3 ? 'Experimentado' : 'Nuevo pero prometedor';

    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className="badge-nivel">{level}</span>
        {verified && <span className="badge-verificado">Verificado</span>}
      </span>
    );
  };

  const availableMunicipalities = useMemo(() => {
    if (localFilters.state === 'all') return [];
    return MEXICO_LOCATIONS.find(s => s.id === localFilters.state)?.municipalities || [];
  }, [localFilters.state]);

  const updateStateFilter = (stateId: string) => {
    setLocalFilters(prev => ({ ...prev, state: stateId, municipality: 'all' }));
  };

  const hasActiveFilters = !!localFilters.query || localFilters.state !== 'all' || localFilters.municipality !== 'all' || !!localFilters.category || !!localFilters.verifiedOnly || !!localFilters.minRating || experienceFilter !== 'Todos';

  const clearFilters = () => {
    setLocalFilters({ query: '', state: 'all', municipality: 'all', category: null, verifiedOnly: false, minRating: 0 });
    setExperienceFilter('Todos');
    setSortMode('recommended');
  };

  const locationMatches = (actualValue: string, expectedName?: string, expectedId?: string) => {
    const actual = normalizeSearchText(actualValue || '');
    const expectedValues = [expectedName, expectedId].map(value => normalizeSearchText(value || '')).filter(Boolean);

    return expectedValues.some(expected => (
      actual === expected ||
      actual.includes(expected) ||
      expected.includes(actual)
    ));
  };

  const strictFilteredPros = professionals.filter(pro => {
    const query = normalizeSearchText(localFilters.query || '');
    const searchableText = [
      pro.name,
      pro.trade,
      pro.description,
      pro.municipality,
      pro.state,
      ...(pro.services || []),
      ...(pro.coverageZones || [])
    ].join(' ');

    const queryTerms = query
      .split(/\s+/)
      .map(term => term.trim())
      .filter(term => term.length >= 3 && !SEARCH_STOPWORDS.has(term));

    const expandedTerms = new Set<string>();
    queryTerms.forEach(term => {
      expandedTerms.add(term);
      (SYNONYM_TO_TRADE[term] || []).forEach(trade => expandedTerms.add(trade));
    });

    const matchesQuery = !query
      || expandedTerms.size === 0
      || Array.from(expandedTerms).some(term => searchableText.includes(term));
    
    const stateData = MEXICO_LOCATIONS.find(s => s.id === localFilters.state);
    const matchesState = localFilters.state === 'all' || 
      (stateData && locationMatches(pro.state, stateData.name, stateData.id));

    let matchesMuni = true;
    if (localFilters.municipality !== 'all') {
       if (stateData) {
         const muniData = stateData.municipalities.find(m => m.id === localFilters.municipality);
         matchesMuni = muniData ? locationMatches(pro.municipality, muniData.name, muniData.id) : false;
       }
    }

    const matchesCategory = !localFilters.category || pro.trade.toLowerCase().includes(localFilters.category.toLowerCase());
    
    const expMin = { 'Todos': 0, '2+ años': 2, '5+ años': 5, '10+ años': 10 }[experienceFilter];
    const ratingMin = localFilters.minRating || 0;

    if (pro.yearsExperience < expMin) return false;
    if (pro.rating < ratingMin) return false;

    const matchesVerified = localFilters.verifiedOnly ? pro.verified : true;

    return matchesQuery && matchesState && matchesMuni && matchesCategory && matchesVerified;
  }).sort((a, b) => {
    if (sortMode === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
    if (sortMode === 'experience') return b.yearsExperience - a.yearsExperience || b.rating - a.rating;
    if (sortMode === 'reviews') return b.reviews - a.reviews || b.rating - a.rating;
    if (Number(b.verified) !== Number(a.verified)) return Number(b.verified) - Number(a.verified);
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const queryIntentTrades = getSearchIntentTrades(localFilters.query || '');
  const shouldRelaxLocation = queryIntentTrades.length > 0 && strictFilteredPros.length === 0 && (localFilters.state !== 'all' || localFilters.municipality !== 'all');

  const getFallbackPros = (locationScope: 'state' | 'all') => professionals.filter(pro => {
    const query = normalizeSearchText(localFilters.query || '');
    const searchableText = [
      pro.name,
      pro.trade,
      pro.description,
      pro.municipality,
      pro.state,
      ...(pro.services || []),
      ...(pro.coverageZones || [])
    ].join(' ');
    const matchesQuery = !query || matchesSearchIntent(query, searchableText);

    const stateData = MEXICO_LOCATIONS.find(s => s.id === localFilters.state);
    const matchesState = locationScope === 'all' || localFilters.state === 'all' ||
      (stateData && locationMatches(pro.state, stateData.name, stateData.id));

    const matchesCategory = !localFilters.category || pro.trade.toLowerCase().includes(localFilters.category.toLowerCase());
    const expMin = { 'Todos': 0, '2+ aÃ±os': 2, '5+ aÃ±os': 5, '10+ aÃ±os': 10 }[experienceFilter];
    const ratingMin = localFilters.minRating || 0;

    if (pro.yearsExperience < expMin) return false;
    if (pro.rating < ratingMin) return false;

    const matchesVerified = localFilters.verifiedOnly ? pro.verified : true;
    return matchesQuery && matchesState && matchesCategory && matchesVerified;
  }).sort((a, b) => {
    if (sortMode === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
    if (sortMode === 'experience') return b.yearsExperience - a.yearsExperience || b.rating - a.rating;
    if (sortMode === 'reviews') return b.reviews - a.reviews || b.rating - a.rating;
    if (Number(b.verified) !== Number(a.verified)) return Number(b.verified) - Number(a.verified);
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const stateFallbackPros = shouldRelaxLocation && localFilters.municipality !== 'all' ? getFallbackPros('state') : [];
  const allFallbackPros = shouldRelaxLocation && stateFallbackPros.length === 0 && localFilters.state !== 'all' ? getFallbackPros('all') : [];
  const fallbackScope = stateFallbackPros.length > 0 ? 'state' : allFallbackPros.length > 0 ? 'all' : null;
  const filteredPros = fallbackScope === 'state'
    ? stateFallbackPros
    : fallbackScope === 'all'
      ? allFallbackPros
      : strictFilteredPros;

  const topStates = useMemo(() => {
    const counts: Record<string, number> = {};
    professionals.forEach((pro) => {
      counts[pro.state] = (counts[pro.state] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 4);
  }, [professionals]);

  const getResponseHint = (pro: Professional) => {
    if (pro.trustStatus === 'yellow') return 'Reporte en revision';
    if (pro.trustStatus === 'red') return 'Revision requerida';
    if (pro.responseTimeMinutes) return `Responde en ${pro.responseTimeMinutes} min`;
    if (pro.verified && pro.rating >= 4.7) return 'Alta confianza';
    if (pro.reviews >= 8) return 'Muy recomendado';
    if (pro.yearsExperience >= 5) return 'Experiencia fuerte';
    return 'Perfil disponible';
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const comparePros = professionals.filter(pro => compareIds.includes(pro.id));

  const getLocationText = () => {
    if (localFilters.state === 'all') return 'todo México';
    const stateName = MEXICO_LOCATIONS.find(s => s.id === localFilters.state)?.name || localFilters.state;
    if (localFilters.municipality === 'all') return stateName;
    const muniName = MEXICO_LOCATIONS.find(s => s.id === localFilters.state)
                      ?.municipalities.find(m => m.id === localFilters.municipality)?.name || localFilters.municipality;
    return `${muniName}, ${stateName}`;
  };

  const getActivityCity = () => {
    if (localFilters.state === 'all') return 'Morelia';
    const stateData = MEXICO_LOCATIONS.find(s => s.id === localFilters.state);
    if (localFilters.municipality === 'all') return stateData?.name || 'Morelia';
    return stateData?.municipalities.find(m => m.id === localFilters.municipality)?.name || stateData?.name || 'Morelia';
  };

  const activityTrade = localFilters.category || localFilters.query || '';
  const locationText = getLocationText();
  const resultsTitle = `Encuentra profesionales en ${locationText}`;
  const serviceLabel = localFilters.category || localFilters.query || 'oficios';
  const fallbackLocationText = fallbackScope === 'state'
    ? MEXICO_LOCATIONS.find(s => s.id === localFilters.state)?.name || 'tu estado'
    : fallbackScope === 'all'
      ? 'todo Mexico'
      : null;
  const fallbackNotice = fallbackLocationText
    ? `No encontramos coincidencias exactas en ${locationText}. Te mostramos profesionales relacionados con "${localFilters.query}" en ${fallbackLocationText}.`
    : null;
  const matchedTradeLabels = queryIntentTrades
    .map(trade => TRADES.find(item => item.id === trade)?.name || trade)
    .filter(Boolean);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-surface border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-16 w-16 rounded-full bg-surface-light"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-light rounded w-3/4"></div>
          <div className="h-3 bg-surface-light rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-surface-light rounded w-full"></div>
        <div className="h-3 bg-surface-light rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-surface-light rounded-lg w-full"></div>
    </div>
  );

  return (
    <>
    <SEOHelmet
      title={isFavoritesView ? 'Profesionales favoritos | EsMiOficio' : `${resultsTitle} | EsMiOficio`}
      description={isFavoritesView
        ? 'Consulta tus profesionales guardados en EsMiOficio.'
        : `Busca y compara profesionales de ${serviceLabel} en ${locationText} por trabajos recientes, confianza, experiencia y verificacion.`}
      canonicalUrl={getAbsoluteUrl('/buscar')}
      noindex={isFavoritesView || !!localFilters.query || localFilters.state !== 'all' || localFilters.municipality !== 'all' || !!localFilters.category}
    />
    <div className="min-h-[60vh] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {isFavoritesView ? 'Tus Profesionales Favoritos' : resultsTitle}
              </h2>
              {!isFavoritesView && (
                <p className="text-gray-400">
                  Encontramos <span className="text-primary font-bold">{filteredPros.length}</span> profesionales para ti
                  {` en ${locationText}`}
                </p>
              )}
              {isFavoritesView && (
                <p className="text-gray-400">
                  Tienes <span className="text-primary font-bold">{filteredPros.length}</span> profesionales guardados
                </p>
              )}
            </div>
          </div>

          {fallbackNotice && (
            <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              {fallbackNotice}
            </div>
          )}

          {!isFavoritesView && (
            <LocalActivitySummary trade={activityTrade} city={getActivityCity()} />
          )}

          {loadError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {loadError}
            </div>
          )}

          {!isFavoritesView && (
            <div className="rounded-2xl bg-surface border border-border p-4 md:p-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative md:col-span-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">search</span>
                    <input
                      value={localFilters.query}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, query: e.target.value }))}
                      className="w-full h-12 rounded-lg bg-surface-light border border-border pl-10 pr-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      placeholder="Oficio, nombre o necesidad"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={localFilters.state}
                      onChange={(e) => updateStateFilter(e.target.value)}
                      className="w-full h-12 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none"
                    >
                      <option value="all">Todo Mexico</option>
                      {MEXICO_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                  </div>

                  <div className="relative">
                    <select
                      disabled={localFilters.state === 'all'}
                      value={localFilters.municipality}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, municipality: e.target.value }))}
                      className="w-full h-12 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none disabled:opacity-50"
                    >
                      <option value="all">Todo el estado</option>
                      {availableMunicipalities.map((mun) => (
                        <option key={mun.id} value={mun.id}>{mun.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as 'recommended' | 'rating' | 'experience' | 'reviews')}
                    className="h-12 rounded-lg bg-surface-light border border-border px-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    <option value="recommended">Orden recomendado</option>
                    <option value="rating">Mejor calificacion</option>
                    <option value="experience">Mas experiencia</option>
                    <option value="reviews">Mas resenas</option>
                  </select>
                  <button
                    onClick={onSuggestTrade}
                    className="h-12 px-4 rounded-lg bg-surface-light border border-border text-white font-bold hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                    Falta un oficio
                  </button>
                </div>
              </div>

              {topStates.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold uppercase">Mas actividad:</span>
                  {topStates.map(([stateName, count]) => (
                    <button
                      key={stateName}
                      onClick={() => {
                        const stateId = MEXICO_LOCATIONS.find(s => s.name === stateName)?.id || 'all';
                        updateStateFilter(stateId);
                      }}
                      className="activity-badge hover:border-primary/50"
                    >
                      {stateName} ({count})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 py-3 overflow-x-auto">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all bg-surface border-border text-gray-400 hover:border-gray-500"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                Limpiar filtros
              </button>
            )}

            <button 
              onClick={() => setLocalFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${localFilters.verifiedOnly ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-surface border-border text-gray-400 hover:border-gray-500'}`}
            >
              <span className={`material-symbols-outlined text-[18px] ${localFilters.verifiedOnly ? 'fill-1' : ''}`}>verified</span>
              Solo Verificados
            </button>
            
            <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>

            {/* 🟢 INICIO MEJORA 2 */}
            <select
              id="filtro-experiencia"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value as 'Todos' | '2+ años' | '5+ años' | '10+ años')}
              className="bg-surface border border-border text-gray-300 text-sm font-medium rounded-full px-4 py-2 outline-none hover:border-gray-500 transition-all"
            >
              <option>Todos</option>
              <option>2+ años</option>
              <option>5+ años</option>
              <option>10+ años</option>
            </select>

            <select
              id="filtro-rating"
              value={localFilters.minRating || 0}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
              className="bg-surface border border-border text-gray-300 text-sm font-medium rounded-full px-4 py-2 outline-none hover:border-gray-500 transition-all"
            >
              <option value={0}>Todos</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
              <option value={4.8}>4.8+</option>
            </select>
            {/* 🔴 FIN MEJORA 2 */}
            
            <span className="text-xs text-gray-500 uppercase font-bold hidden sm:block">Calificación:</span>
            {[0, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${localFilters.minRating === rating ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-border text-gray-400 hover:border-gray-500'}`}
              >
                {rating === 0 ? 'Todas' : `${rating}+ ⭐`}
              </button>
            ))}
          </div>
        </div>

        {!isFavoritesView && comparePros.length > 0 && (
          <div className="mb-8 bg-surface border border-border rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">compare_arrows</span>
                  Comparando {comparePros.length} de 3 profesionales
                </h3>
                <p className="text-xs text-gray-500">Compara reputacion, experiencia y ubicacion antes de contactar.</p>
              </div>
              <button onClick={() => setCompareIds([])} className="text-xs text-gray-400 hover:text-white underline">
                Limpiar comparacion
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {comparePros.map(pro => (
                <div key={pro.id} className="bg-surface-light/50 border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-white font-bold text-sm">{pro.name}</h4>
                      <p className="text-primary text-xs">{pro.trade}</p>
                    </div>
                    <button onClick={() => toggleCompare(pro.id)} className="text-gray-500 hover:text-red-400">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-gray-500">Rating</span><StarRating rating={pro.rating} sizeClass="text-xs" showReviews={false} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Resenas</span><span className="text-white font-bold">{pro.reviews}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Experiencia</span><span className="text-white font-bold">{pro.yearsExperience}+ anos</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Verificado</span><span className="text-white font-bold">{pro.verified ? 'Si' : 'No'}</span></div>
                  </div>
                  <button onClick={() => onViewProfile(pro.id)} className="mt-4 w-full py-2 rounded-lg bg-primary text-background text-sm font-bold hover:bg-primary-hover transition-colors">
                    Ver perfil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro) => (
              <div key={pro.id} className="group relative bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                {/* Favorite Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(pro.id); }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <span className={`material-symbols-outlined transition-all ${favorites.includes(pro.id) ? 'fill-1 text-red-500 scale-110' : 'text-gray-500 hover:text-red-400'}`}>
                    favorite
                  </span>
                </button>

                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img loading="lazy" 
                        src={pro.imageUrl} 
                        alt={pro.name} 
                        onError={(event) => {
                          event.currentTarget.src = 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&h=200&auto=format&fit=crop';
                        }}
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors bg-surface-light"
                      />
                      {pro.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                           <span className="material-symbols-outlined text-blue-400 text-[18px] bg-blue-900/30 rounded-full" title="Verificado">verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{pro.name}</h4>
                      {/* 🟢 INICIO MEJORA 1 */}
                      {renderBadge(pro.yearsExperience, pro.verified)}
                      {/* 🔴 FIN MEJORA 1 */}
                      <span className="text-primary/80 font-medium text-sm">{pro.trade}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10 flex-grow">
                  {pro.description || `Servicios de ${pro.trade} en ${pro.municipality || 'Morelia'}.`}
                </p>

                <div className="mb-4 space-y-2 text-xs text-gray-300">
                  {getLastActiveText(pro.lastActiveAt) && (
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                      {getLastActiveText(pro.lastActiveAt)}
                      {pro.responseTimeMinutes ? ` · Responde en ${pro.responseTimeMinutes} min` : ''}
                    </p>
                  )}
                  {pro.coverageZones && pro.coverageZones.length > 0 && (
                    <p className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">map</span>
                      <span>Atiende {pro.coverageZones.slice(0, 3).join(', ')}</span>
                    </p>
                  )}
                  {pro.startingPrice && (
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
                      Desde ${pro.startingPrice.toLocaleString('es-MX')} MXN aprox.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="rounded-lg bg-surface-light/50 border border-border px-2 py-2">
                    <span className="block text-white font-bold text-sm">{pro.yearsExperience}+</span>
                    <span className="text-[10px] uppercase text-gray-500">anos</span>
                  </div>
                  <div className="rounded-lg bg-surface-light/50 border border-border px-2 py-2">
                    <span className="block text-white font-bold text-sm">{pro.jobsCount || 0}</span>
                    <span className="text-[10px] uppercase text-gray-500">trabajos</span>
                  </div>
                  <div className="rounded-lg bg-surface-light/50 border border-border px-2 py-2">
                    <span className="block text-primary font-bold text-sm">{pro.recommendationsCount || pro.reviews || 0}</span>
                    <span className="text-[10px] uppercase text-gray-500">recom.</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-6 p-3 bg-surface-light/50 rounded-lg border border-transparent group-hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-1">
                     <StarRating rating={pro.rating} reviews={pro.reviews} sizeClass="text-sm" />
                  </div>
                  <div className="flex flex-col items-end text-gray-400 text-xs text-right">
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-[14px]">map</span>
                       <span className="truncate max-w-[100px]">{pro.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="material-symbols-outlined text-[14px]">location_on</span>
                       <span className="truncate max-w-[100px]">{pro.municipality}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-light/30 px-3 py-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <span className="material-symbols-outlined text-primary text-[16px]">shield</span>
                    {getResponseHint(pro)}
                  </span>
                  <span className="text-[11px] text-gray-500">Compara antes de contratar</span>
                </div>

                <div className="mb-4">
                  <TrustSignal professional={pro} compact />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
                  {!isFavoritesView && (
                    <button
                      onClick={() => toggleCompare(pro.id)}
                      disabled={!compareIds.includes(pro.id) && compareIds.length >= 3}
                      className={`w-full py-3 rounded-lg border font-bold transition-all sm:col-span-2 ${
                        compareIds.includes(pro.id)
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-surface-light border-border text-white hover:bg-white/10 disabled:opacity-50'
                      }`}
                    >
                      {compareIds.includes(pro.id) ? 'Quitar de comparacion' : 'Comparar'}
                    </button>
                  )}
                  {onContact && (
                    <button
                      onClick={() => onContact(pro)}
                      className="w-full py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 active:scale-95 transition-all"
                    >
                      Contactar por WhatsApp
                    </button>
                  )}
                  <button
                    onClick={() => onViewProfile(pro.id)}
                    className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface/30 rounded-2xl border border-border border-dashed flex flex-col items-center animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
               {isFavoritesView ? 'heart_broken' : 'search_off'}
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
               {isFavoritesView
                 ? 'Aún no tienes favoritos'
                 : matchedTradeLabels.length > 0
                   ? `Esta busqueda corresponde a: ${matchedTradeLabels.join(', ')}`
                   : 'No encontramos resultados'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
               {isFavoritesView 
                 ? 'Explora profesionales en la búsqueda y guárdalos aquí para tenerlos siempre a la mano.' 
                 : matchedTradeLabels.length > 0
                   ? `La necesidad si tiene oficio asignado, pero no hay profesionales disponibles con los filtros actuales en ${locationText}. Amplia la zona o sugiere que se registre alguien de este oficio.`
                   : 'Intenta ajustar los filtros (como "Solo Verificados" o Calificación) o amplía tu búsqueda a "Todo México".'}
            </p>
            
            {!isFavoritesView && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {matchedTradeLabels.length > 0 && localFilters.state !== 'all' && (
                  <button
                    onClick={() => setLocalFilters(prev => ({ ...prev, state: 'all', municipality: 'all' }))}
                    className="px-8 py-3 bg-primary text-background font-bold rounded-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                  >
                    <span className="material-symbols-outlined">travel_explore</span>
                    Buscar en todo Mexico
                  </button>
                )}
                <button 
                  onClick={onSuggestTrade}
                  className="px-8 py-3 bg-surface border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-background transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/5"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Deseas agregar un nuevo oficio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SearchResults;
