
import React, { useState, useMemo, useEffect } from 'react';
import { MEXICO_LOCATIONS } from '../constants';
import { detectUserCity, resolveBrowserLocation } from '../lib/location';

interface HeroProps {
  onSearch: (query: string, state: string, municipality: string) => void;
  onPublishClick: () => void;
}

const QUICK_NEEDS = [
  {
    icon: 'water_drop',
    label: 'Fuga de agua',
    query: 'plomero fuga de agua',
    color: '#04D9A5',
    glow: 'rgba(4,217,165,0.45)',
    bg: 'rgba(4,217,165,0.06)',
    border: 'rgba(4,217,165,0.16)',
    borderHover: 'rgba(4,217,165,0.30)',
  },
  {
    icon: 'electrical_services',
    label: 'Falla eléctrica',
    query: 'electricista falla electrica',
    color: '#7B4FD4',
    glow: 'rgba(123,79,212,0.45)',
    bg: 'rgba(123,79,212,0.06)',
    border: 'rgba(123,79,212,0.16)',
    borderHover: 'rgba(123,79,212,0.30)',
  },
  {
    icon: 'format_paint',
    label: 'Pintar casa',
    query: 'pintor casa',
    color: '#E04B8A',
    glow: 'rgba(224,75,138,0.45)',
    bg: 'rgba(224,75,138,0.06)',
    border: 'rgba(224,75,138,0.16)',
    borderHover: 'rgba(224,75,138,0.30)',
  },
  {
    icon: 'roofing',
    label: 'Impermeabilizar',
    query: 'impermeabilizacion',
    color: '#F0A832',
    glow: 'rgba(240,168,50,0.45)',
    bg: 'rgba(240,168,50,0.06)',
    border: 'rgba(240,168,50,0.16)',
    borderHover: 'rgba(240,168,50,0.30)',
  },
];

const Hero: React.FC<HeroProps> = ({ onSearch, onPublishClick }) => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('michoacan');
  const [municipality, setMunicipality] = useState('morelia');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('esmiOficio_recent_searches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : []);
      } catch {
        localStorage.removeItem('esmiOficio_recent_searches');
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    detectUserCity().then(city => { if (isMounted && city) setDetectedCity(city); });
    return () => { isMounted = false; };
  }, []);

  const availableMunicipalities = useMemo(() => {
    if (state === 'all') return [];
    return MEXICO_LOCATIONS.find(s => s.id === state)?.municipalities ?? [];
  }, [state]);

  const selectedLocationName = useMemo(() => {
    if (state === 'all') return 'todo México';
    const st = MEXICO_LOCATIONS.find(s => s.id === state);
    if (municipality !== 'all') {
      return st?.municipalities.find(m => m.id === municipality)?.name ?? st?.name ?? 'tu zona';
    }
    return st?.name ?? 'tu estado';
  }, [state, municipality]);

  const suggestedSearches = useMemo(() => [
    'Plomero urgente',
    'Electricista certificado',
    `Albañil en ${selectedLocationName}`,
    'Carpintero a medida',
  ], [selectedLocationName]);

  const handleSubmit = (overrideQuery?: string) => {
    const finalQuery = (overrideQuery ?? query).trim();
    if (finalQuery) {
      const next = [finalQuery, ...recentSearches.filter(s => s.toLowerCase() !== finalQuery.toLowerCase())].slice(0, 5);
      setRecentSearches(next);
      localStorage.setItem('esmiOficio_recent_searches', JSON.stringify(next));
    }
    onSearch(finalQuery, state, municipality);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('esmiOficio_recent_searches');
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setMunicipality('all');
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    setLocationStatus(null);
    try {
      const resolved = await resolveBrowserLocation();
      setState(resolved.stateId);
      setMunicipality(resolved.municipalityId);
      setDetectedCity(resolved.municipalityName);
      setLocationStatus(`Te llevamos a ${resolved.municipalityName}, ${resolved.stateName}.`);
      onSearch(query.trim(), resolved.stateId, resolved.municipalityId);
    } catch (error: any) {
      setLocationStatus(error.message || 'No pudimos obtener tu ubicacion.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">

      {/* ── Aurora background canvas ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Teal blob — upper right */}
        <div
          className="absolute -top-40 -right-48 h-[750px] w-[750px] rounded-full animate-aurora-drift"
          style={{ background: 'radial-gradient(circle, rgba(4,217,165,0.11) 0%, transparent 65%)' }}
        />
        {/* Violet blob — lower left */}
        <div
          className="absolute -bottom-56 -left-56 h-[650px] w-[650px] rounded-full animate-aurora-drift-2"
          style={{ background: 'radial-gradient(circle, rgba(123,79,212,0.13) 0%, transparent 65%)' }}
        />
        {/* Rose accent — center fade */}
        <div
          className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-aurora-pulse"
          style={{ background: 'radial-gradient(circle, rgba(224,75,138,0.05) 0%, transparent 70%)' }}
        />
        {/* Grid floor */}
        <div className="absolute inset-0 aurora-grid opacity-50" />
        {/* Vignette so grid fades at edges */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, #070C1A 80%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">

        {/* Status badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-aurora-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Profesionales verificados en México
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl mb-6"
          style={{ letterSpacing: '-0.02em', textWrap: 'balance' } as React.CSSProperties}
          aria-live="polite"
        >
          {detectedCity ? (
            <>
              Encuentra expertos en{' '}
              <span className="aurora-text-gradient">{detectedCity}</span>
            </>
          ) : (
            <>
              Conecta con el{' '}
              <span className="aurora-text-gradient">talento local</span>{' '}
              de confianza
            </>
          )}
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed mb-12" style={{ color: '#8BA0B8' }}>
          Busca, revisa trabajos reales y contacta por WhatsApp con más seguridad.
        </p>

        {/* ── Search card — glassmorphism ── */}
        <div className="aurora-glass rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-3">

              {/* Query input */}
              <div className="relative flex-grow text-left lg:w-2/5">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#4A6080' }}>search</span>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="aurora-input block w-full h-14 rounded-xl pl-12 pr-4 text-sm"
                  placeholder="¿Qué necesitas? Plomero, albañil, electricista..."
                  autoComplete="off"
                  aria-label="Buscar oficio o profesional"
                />
              </div>

              {/* State select */}
              <div className="relative text-left lg:w-1/4">
                <select
                  value={state}
                  onChange={handleStateChange}
                  aria-label="Seleccionar estado"
                  className="aurora-select block w-full h-14 rounded-xl px-4 pr-10 text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todo México</option>
                  {MEXICO_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" style={{ color: '#4A6080' }}>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Municipality select */}
              <div className="relative text-left lg:w-1/4">
                <select
                  disabled={state === 'all'}
                  value={municipality}
                  onChange={e => setMunicipality(e.target.value)}
                  aria-label="Seleccionar municipio"
                  className="aurora-select block w-full h-14 rounded-xl px-4 pr-10 text-sm appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="all">Todo el Estado</option>
                  {availableMunicipalities.map(mun => (
                    <option key={mun.id} value={mun.id}>{mun.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" style={{ color: '#4A6080' }}>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={() => handleSubmit()}
                type="button"
                className="aurora-btn-primary h-14 px-7 rounded-xl text-sm font-bold whitespace-nowrap"
              >
                Buscar profesional
              </button>
            </div>

            {/* Location row */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="aurora-btn-ghost inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
                {isLocating ? 'Ubicando...' : 'Usar mi ubicación'}
              </button>
              {locationStatus && (
                <p className="text-xs sm:text-right" style={{ color: '#8BA0B8' }}>{locationStatus}</p>
              )}
            </div>

            {/* Recent / suggested searches */}
            {(recentSearches.length > 0 || suggestedSearches.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 justify-center lg:justify-start animate-fade-in">
                <span className="text-[11px] font-semibold uppercase tracking-wider mr-1" style={{ color: '#4A6080' }}>
                  {recentSearches.length > 0 ? 'Recientes' : 'Sugerencias'}
                </span>
                {(recentSearches.length > 0 ? recentSearches : suggestedSearches).map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(term); handleSubmit(term); }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background: 'rgba(30,51,86,0.5)',
                      border: '1px solid rgba(30,51,86,0.9)',
                      color: '#8BA0B8',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#04D9A5';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(4,217,165,0.30)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#8BA0B8';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(30,51,86,0.9)';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>history</span>
                    {term}
                  </button>
                ))}
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="ml-1 text-[10px] underline decoration-dotted transition-colors"
                    style={{ color: '#4A6080' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#E04B8A'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4A6080'; }}
                  >
                    Borrar historial
                  </button>
                )}
              </div>
            )}

            {/* Publish CTA */}
            <div
              className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{ borderTop: '1px solid rgba(30,51,86,0.6)' }}
            >
              <span style={{ color: '#8BA0B8' }} className="text-sm font-medium">
                ¿Ofreces un servicio en {selectedLocationName}?
              </span>
              <button
                onClick={onPublishClick}
                className="flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-bold text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                Registrar mi oficio
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick-need aurora cards ── */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          {QUICK_NEEDS.map(need => (
            <button
              key={need.label}
              onClick={() => { setQuery(need.query); handleSubmit(need.query); }}
              className="group relative rounded-2xl px-4 py-4 text-left transition-all duration-300"
              style={{
                background: need.bg,
                border: `1px solid ${need.border}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = need.borderHover;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${need.glow.replace('0.45', '0.08')}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = need.border;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }}
            >
              <span
                className="material-symbols-outlined text-[26px] mb-2.5 block transition-transform duration-300 group-hover:scale-110"
                style={{ color: need.color, filter: `drop-shadow(0 0 6px ${need.glow})` }}
              >
                {need.icon}
              </span>
              <span className="block text-sm font-bold text-white">{need.label}</span>
              <span className="block text-xs mt-1" style={{ color: '#4A6080' }}>
                en {selectedLocationName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
