
import React from 'react';
import { Professional } from '../types';
import StarRating from './StarRating';

interface FeaturedProsProps {
  onViewProfile: (proId: string) => void;
  onContact?: (pro: Professional) => void;
  professionals: Professional[];
}

const FeaturedPros: React.FC<FeaturedProsProps> = ({ onViewProfile, onContact, professionals }) => {
  const featured = [...professionals]
    .sort((a, b) => {
      if (Number(b.verified) !== Number(a.verified)) return Number(b.verified) - Number(a.verified);
      return b.rating - a.rating || b.reviews - a.reviews || b.yearsExperience - a.yearsExperience;
    })
    .slice(0, 4);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
            Talento verificado
          </p>
          <h3
            className="text-3xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.01em', textWrap: 'balance' } as React.CSSProperties}
          >
            Profesionales destacados en Morelia
          </h3>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: '#8BA0B8' }}>
            Reseñas reales de tus vecinos. Priorizamos la transparencia y las recomendaciones auténticas en tu localidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map(pro => (
            <div
              key={pro.id}
              className="aurora-glass aurora-glass-hover rounded-2xl p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      loading="lazy"
                      src={pro.imageUrl}
                      alt={pro.name}
                      className="h-12 w-12 rounded-full object-cover"
                      style={pro.verified ? {
                        boxShadow: '0 0 0 2px #04D9A5, 0 0 12px rgba(4,217,165,0.28)',
                      } : {
                        border: '1px solid rgba(30,51,86,0.8)',
                      }}
                    />
                    {pro.verified && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background: '#04D9A5' }}
                        title="Verificado"
                      >
                        <span className="material-symbols-outlined text-[10px]" style={{ color: '#070C1A', fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight">{pro.name}</h4>
                    <p className="text-xs font-semibold mt-0.5 text-primary">{pro.trade}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                <StarRating rating={pro.rating} reviews={pro.reviews} sizeClass="text-sm" />
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 mb-5 text-xs" style={{ color: '#4A6080' }}>
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {pro.municipality}, {pro.state}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div
                  className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: 'rgba(21,34,64,0.6)', border: '1px solid rgba(30,51,86,0.7)' }}
                >
                  <span className="block font-black text-sm text-white">{pro.yearsExperience}+</span>
                  <span className="block text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#4A6080' }}>años</span>
                </div>
                <div
                  className="rounded-xl px-3 py-2.5 text-center"
                  style={{ background: 'rgba(21,34,64,0.6)', border: '1px solid rgba(30,51,86,0.7)' }}
                >
                  <span className="block font-black text-sm text-white">{pro.reviews}</span>
                  <span className="block text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#4A6080' }}>reseñas</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => onViewProfile(pro.id)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: 'rgba(4,217,165,0.07)',
                    border: '1px solid rgba(4,217,165,0.18)',
                    color: '#04D9A5',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(4,217,165,0.14)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(4,217,165,0.32)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(4,217,165,0.07)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(4,217,165,0.18)';
                  }}
                >
                  Ver Perfil
                </button>
                {onContact && (
                  <button
                    onClick={() => onContact(pro)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{ background: '#16A34A' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#15803D'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#16A34A'; }}
                  >
                    Contactar por WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPros;
