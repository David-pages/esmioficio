
import React from 'react';
import { Professional } from '../types';
import StarRating from './StarRating';
import Reveal from './Reveal';

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
        <Reveal>
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Profesionales destacados en Morelia</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Reseñas reales de tus vecinos. Priorizamos la transparencia y las recomendaciones auténticas en tu localidad.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((pro, index) => (
            <Reveal key={pro.id} delay={index * 110} className="h-full">
            <div className="h-full bg-surface border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:ring-1 hover:ring-primary/35">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img loading="lazy"
                    src={pro.imageUrl}
                    alt={pro.name}
                    className="h-12 w-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h4 className="text-white font-bold text-sm">{pro.name}</h4>
                    <p className="text-xs text-primary font-medium">{pro.trade}</p>
                  </div>
                </div>
                {pro.verified && (
                   <span className="material-symbols-outlined text-blue-400 text-[20px]" title="Verificado">verified</span>
                )}
              </div>

              <div className="flex items-center gap-1 mb-2">
                 <StarRating rating={pro.rating} reviews={pro.reviews} sizeClass="text-sm" />
              </div>

              <div className="flex items-center gap-1 text-gray-300 text-xs mb-4">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {pro.municipality}, {pro.state}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                <div className="rounded-lg bg-surface-light/50 border border-border px-2 py-2">
                  <span className="block text-white font-bold text-sm">{pro.yearsExperience}+</span>
                  <span className="text-[10px] uppercase text-gray-400">anos</span>
                </div>
                <div className="rounded-lg bg-surface-light/50 border border-border px-2 py-2">
                  <span className="block text-white font-bold text-sm">{pro.reviews}</span>
                  <span className="text-[10px] uppercase text-gray-400">resenas</span>
                </div>
              </div>

              <button
                onClick={() => onViewProfile(pro.id)}
                className="w-full py-2 rounded-lg bg-primary text-sm font-bold text-background hover:bg-primary-hover active:scale-[0.99] transition-all shadow-lg shadow-primary/10"
              >
                Ver Perfil
              </button>
              {onContact && (
                <button
                  onClick={() => onContact(pro)}
                  className="mt-2 w-full py-2 rounded-lg bg-green-600 text-sm font-bold text-white hover:bg-green-500 transition-colors"
                >
                  Contactar por WhatsApp
                </button>
              )}
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPros;
