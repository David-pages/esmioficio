
import React, { useState, useMemo, useEffect } from 'react';
import { MEXICO_LOCATIONS } from '../constants';
import { detectUserCity, resolveBrowserLocation } from '../lib/location';

interface HeroProps {
  onSearch: (query: string, state: string, municipality: string) => void;
  onPublishClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch, onPublishClick }) => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('michoacan');
  const [municipality, setMunicipality] = useState('morelia');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const popularNeeds = [
    { icon: 'water_drop', label: 'Fuga de agua', query: 'fuga de agua' },
    { icon: 'electrical_services', label: 'Falla electrica', query: 'falla electrica' },
    { icon: 'format_paint', label: 'Pintar casa', query: 'pintar casa' },
    { icon: 'roofing', label: 'Impermeabilizar', query: 'impermeabilizar' }
  ];

  // Cargar búsquedas recientes al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('esmiOficio_recent_searches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []);
      } catch {
        localStorage.removeItem('esmiOficio_recent_searches');
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    detectUserCity().then((city) => {
      if (isMounted && city) {
        setDetectedCity(city);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableMunicipalities = useMemo(() => {
    if (state === 'all') return [];
    const selectedState = MEXICO_LOCATIONS.find(s => s.id === state);
    return selectedState ? selectedState.municipalities : [];
  }, [state]);

  const selectedLocationName = useMemo(() => {
    if (state === 'all') return 'todo México';
    const selectedState = MEXICO_LOCATIONS.find(s => s.id === state);
    if (municipality !== 'all') {
      const selectedMunicipality = selectedState?.municipalities.find(m => m.id === municipality);
      return selectedMunicipality?.name || selectedState?.name || 'tu zona';
    }
    return selectedState?.name || 'tu estado';
  }, [state, municipality]);

  const suggestedSearches = useMemo(() => [
    'Plomero urgente',
    'Electricista certificado',
    `Albanil en ${selectedLocationName}`,
    'Carpintero a medida'
  ], [selectedLocationName]);

  const handleSubmit = (overrideQuery?: string) => {
    const finalQuery = (overrideQuery || query).trim();
    
    // Guardar en historial si hay texto
    if (finalQuery) {
      const newHistory = [finalQuery, ...recentSearches.filter(s => s.toLowerCase() !== finalQuery.toLowerCase())].slice(0, 5);
      setRecentSearches(newHistory);
      localStorage.setItem('esmiOficio_recent_searches', JSON.stringify(newHistory));
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-800 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 animate-fade-in-up" aria-live="polite">
          {detectedCity ? (
            <>
              Encuentra profesionales confiables en <br/><span className="text-primary">{detectedCity}</span>
            </>
          ) : (
            'Encuentra profesionales confiables cerca de ti'
          )}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-300 mb-12 animate-fade-in-up [animation-delay:120ms]">
          Busca, revisa trabajos reales y contacta por WhatsApp con mas seguridad.
        </p>

        <div className="mx-auto max-w-4xl rounded-2xl bg-surface border border-border shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-up [animation-delay:220ms]">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-grow group text-left lg:w-2/5">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="block w-full h-14 rounded-lg bg-surface-light border border-border pl-12 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all" 
                  placeholder="Que necesitas? Plomero, albanil, electricista..."
                  autoComplete="off"
                  aria-label="Buscar oficio o profesional"
                />
              </div>

              <div className="relative lg:w-1/4 group text-left">
                <select 
                  value={state}
                  onChange={handleStateChange}
                  aria-label="Seleccionar estado"
                  className="block w-full h-14 rounded-lg bg-surface-light border border-border px-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="all">Todo México</option>
                  {MEXICO_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                   <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>

              <div className="relative lg:w-1/4 group text-left">
                <select 
                  disabled={state === 'all'}
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  aria-label="Seleccionar municipio"
                  className="block w-full h-14 rounded-lg bg-surface-light border border-border px-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">Todo el Estado</option>
                  {availableMunicipalities.map((mun) => (
                    <option key={mun.id} value={mun.id}>{mun.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                   <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>

              <button 
                onClick={() => handleSubmit()}
                type="button"
                className="h-14 px-8 rounded-lg bg-primary text-background font-bold text-base hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                Buscar profesional
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
                {isLocating ? 'Ubicando...' : 'Usar mi ubicacion'}
              </button>
              {locationStatus && (
                <p className="text-xs text-gray-400 sm:text-right">{locationStatus}</p>
              )}
            </div>

            {/* Historial de búsquedas recientes */}
            {(recentSearches.length > 0 || suggestedSearches.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 justify-center lg:justify-start animate-fade-in">
                <span className="text-xs text-gray-400 mr-1">{recentSearches.length > 0 ? 'Recientes:' : 'Sugerencias:'}</span>
                {(recentSearches.length > 0 ? recentSearches : suggestedSearches).map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(term);
                      handleSubmit(term);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-light border border-border text-xs text-gray-300 hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[10px]">history</span>
                    {term}
                  </button>
                ))}
                {recentSearches.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="ml-2 text-[10px] text-gray-600 hover:text-red-400 underline decoration-dotted"
                  >
                    Borrar historial
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="text-gray-300 font-medium">Ofreces un servicio en {selectedLocationName}?</span>
              <button
                onClick={onPublishClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full border border-white/25 transition-colors font-bold text-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
                Registrar mi oficio
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          {popularNeeds.map((need, idx) => (
            <button
              key={need.label}
              onClick={() => {
                setQuery(need.query);
                handleSubmit(need.query);
              }}
              style={{ animationDelay: `${320 + idx * 80}ms` }}
              className="group rounded-2xl bg-surface/80 border border-border px-4 py-4 hover:border-primary/50 hover:bg-surface-light hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
            >
              <span className="material-symbols-outlined text-primary text-[24px] mb-2 block group-hover:scale-110 transition-transform">{need.icon}</span>
              <span className="block text-sm font-bold text-white">{need.label}</span>
              <span className="block text-xs text-gray-400 mt-1">Buscar en {selectedLocationName}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
