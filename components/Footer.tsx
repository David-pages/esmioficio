import React from 'react';
import { MEXICO_LOCATIONS } from '../constants';

interface FooterProps {
  onSuggestClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onAboutClick: () => void;
  onBlogClick: () => void;
  onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onSuggestClick, onPrivacyClick, onTermsClick, onAboutClick, onBlogClick, onContactClick }) => {
  // Show only a few key states in the footer to keep it clean, or randomize/feature specific ones.
  // For now, let's show Michoacan + top 5 others
  const featuredStates = MEXICO_LOCATIONS.filter(s => 
    ['michoacan', 'cdmx', 'jalisco', 'nuevo_leon', 'mexico_edo', 'puebla'].includes(s.id)
  );

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-sm">construction</span>
              </div>
              <span className="text-base font-bold text-white">EsMiOficio</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Conectando comunidades en todo México con talento local de confianza a través de la transparencia.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Estados Destacados</h4>
            <ul className="space-y-2">
              {featuredStates.map(loc => (
                 <li key={loc.id}><a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{loc.name}</a></li>
              ))}
              <li><span className="text-sm text-gray-600 italic">...y {MEXICO_LOCATIONS.length - featuredStates.length} estados más</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Compañía</h4>
            <ul className="space-y-2">
              <li><button onClick={onAboutClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Sobre Nosotros</button></li>
              <li><button onClick={onBlogClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Blog</button></li>
              <li><button onClick={onSuggestClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Sugerir nuevo oficio</button></li>
              <li><button onClick={onContactClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Contacto</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><button onClick={onPrivacyClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Aviso de Privacidad</button></li>
              <li><button onClick={onTermsClick} className="text-sm text-gray-400 hover:text-primary transition-colors text-left">Términos y Condiciones</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2024 EsMiOficio. Hecho con orgullo para México.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
