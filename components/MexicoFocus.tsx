import React, { useMemo } from 'react';
import { MEXICO_LOCATIONS } from '../constants';
import { TradeCategory } from '../types';

interface MexicoFocusProps {
  trades: TradeCategory[];
  onSearch: (query: string, state: string, municipality: string) => void;
  onPublishClick: () => void;
}

const featuredMarkets = [
  { state: 'cdmx', municipality: 'benito_juarez', label: 'Benito Juarez, CDMX' },
  { state: 'mexico_edo', municipality: 'toluca', label: 'Toluca, Edo. Mex.' },
  { state: 'jalisco', municipality: 'guadalajara', label: 'Guadalajara, Jal.' },
  { state: 'nuevo_leon', municipality: 'monterrey', label: 'Monterrey, N.L.' },
  { state: 'puebla', municipality: 'puebla_cap', label: 'Puebla, Pue.' },
  { state: 'veracruz', municipality: 'veracruz_port', label: 'Veracruz, Ver.' }
];

const serviceMoments = [
  { icon: 'bolt', title: 'Urgencia hoy', text: 'Busca oficios que suelen resolver fugas, apagones y reparaciones el mismo dia.', query: 'plomero electricista' },
  { icon: 'request_quote', title: 'Cotiza antes de aceptar', text: 'Compara perfiles, resenas y experiencia antes de compartir detalles del trabajo.', query: 'cotizacion' },
  { icon: 'home_repair_service', title: 'Mejoras del hogar', text: 'Encuentra pintores, carpinteros, herreros y tecnicos cerca de tu colonia.', query: 'pintor carpintero herrero' }
];

const trustChecklist = [
  'Perfil con municipio y estado claros',
  'Resenas verificadas despues del contacto',
  'Favoritos para comparar opciones',
  'Muro de proyectos para recibir interesados'
];

const MexicoFocus: React.FC<MexicoFocusProps> = ({ trades, onSearch, onPublishClick }) => {
  const municipalityCount = useMemo(
    () => MEXICO_LOCATIONS.reduce((total, state) => total + state.municipalities.length, 0),
    []
  );

  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Hecho para contratar en Mexico</span>
              <h3 className="mt-3 text-2xl md:text-3xl font-black text-white">Encuentra oficio por zona, confianza y tipo de trabajo</h3>
              <p className="mt-3 text-gray-400 max-w-2xl">
                La busqueda esta pensada para la realidad local: municipios, colonias cercanas, trabajos urgentes, comparacion de perfiles y contacto directo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceMoments.map((moment) => (
                <button
                  key={moment.title}
                  onClick={() => onSearch(moment.query, 'all', 'all')}
                  className="group text-left rounded-2xl bg-surface border border-border p-5 hover:border-primary/50 hover:bg-surface-light transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-3xl mb-4 block group-hover:scale-110 transition-transform">{moment.icon}</span>
                  <span className="block text-white font-bold mb-2">{moment.title}</span>
                  <span className="block text-sm text-gray-400 leading-relaxed">{moment.text}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-surface border border-border p-4">
                <span className="block text-2xl font-black text-white">32</span>
                <span className="text-xs text-gray-500">estados</span>
              </div>
              <div className="rounded-2xl bg-surface border border-border p-4">
                <span className="block text-2xl font-black text-white">{municipalityCount}+</span>
                <span className="text-xs text-gray-500">municipios</span>
              </div>
              <div className="rounded-2xl bg-surface border border-border p-4">
                <span className="block text-2xl font-black text-white">{trades.length}</span>
                <span className="text-xs text-gray-500">oficios</span>
              </div>
              <button
                onClick={onPublishClick}
                className="rounded-2xl bg-surface border border-border p-4 text-left hover:border-primary/50 hover:bg-surface-light transition-all"
              >
                <span className="block text-2xl font-black text-primary">+</span>
                <span className="text-xs text-gray-300 font-bold">publicar proyecto</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h4 className="text-white font-bold">Zonas con busqueda rapida</h4>
                <p className="text-sm text-gray-500">Arranca por mercados principales y ajusta desde resultados.</p>
              </div>
              <span className="material-symbols-outlined text-primary">map</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {featuredMarkets.map((market) => (
                <button
                  key={`${market.state}-${market.municipality}`}
                  onClick={() => onSearch('', market.state, market.municipality)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-light border border-border px-4 py-3 text-left hover:border-primary/50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-300">{market.label}</span>
                  <span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
                </button>
              ))}
            </div>

            <div className="border-t border-border pt-5">
              <h4 className="text-white font-bold mb-3">Antes de contratar</h4>
              <div className="space-y-3">
                {trustChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MexicoFocus;
