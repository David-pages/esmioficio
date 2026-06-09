
import React, { useState } from 'react';
import { TradeCategory } from '../types';

interface CategoriesProps {
  onCategorySelect: (categoryName: string) => void;
  onViewAll: () => void;
  trades: TradeCategory[];
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect, onViewAll, trades }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mostramos solo 6 oficios por defecto, o todos si está expandido
  const displayedTrades = isExpanded ? trades : trades.slice(0, 6);

  return (
    <section className="py-16 bg-surface/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold text-white">Nuestros Oficios</h3>
            <p className="text-sm text-gray-500 mt-1">Explora {trades.length} especialidades disponibles en México</p>
          </div>
          <button 
            onClick={onViewAll}
            className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 hidden sm:flex"
          >
            Ver catálogo completo <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
          {displayedTrades.map((trade) => (
            <button 
              key={trade.id} 
              onClick={() => onCategorySelect(trade.name)}
              className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all duration-300 w-full min-h-[140px] shadow-sm hover:shadow-primary/5"
            >
              <div className={`h-14 w-14 rounded-2xl bg-surface-light flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20 ${trade.color}`}>
                <span className="material-symbols-outlined text-3xl">{trade.icon}</span>
              </div>
              <span className="text-[14px] font-bold text-gray-300 group-hover:text-primary transition-colors text-center leading-tight">{trade.name}</span>
            </button>
          ))}
        </div>

        {trades.length > 6 && (
          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-surface-light border border-border text-white font-bold hover:bg-border transition-all group"
            >
              {isExpanded ? (
                <>
                  <span className="material-symbols-outlined group-hover:-translate-y-1 transition-transform">keyboard_double_arrow_up</span>
                  Mostrar menos oficios
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">keyboard_double_arrow_down</span>
                  Ver más oficios ({trades.length - 6} más)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
