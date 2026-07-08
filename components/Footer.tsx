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

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/esmioficiomx',
    path: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/esmioficiomx',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 4.86a4.98 4.98 0 1 0 0 9.96 4.98 4.98 0 0 0 0-9.96Zm0 8.22a3.24 3.24 0 1 1 0-6.48 3.24 3.24 0 0 1 0 6.48Zm6.34-8.42a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0Z',
  },
  {
    name: 'X',
    href: 'https://x.com/esmioficiomx',
    path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.1l4.71 6.23 5.43-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z',
  },
];

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <li>
    <button
      onClick={onClick}
      className="text-sm text-left transition-colors"
      style={{ color: '#4A6080' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#04D9A5'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4A6080'; }}
    >
      {children}
    </button>
  </li>
);

const Footer: React.FC<FooterProps> = ({ onSuggestClick, onPrivacyClick, onTermsClick, onAboutClick, onBlogClick, onContactClick }) => {
  const featuredStates = MEXICO_LOCATIONS.filter(s =>
    ['michoacan', 'cdmx', 'jalisco', 'nuevo_leon', 'mexico_edo', 'puebla'].includes(s.id)
  );

  return (
    <footer
      className="pt-16 pb-8"
      style={{ borderTop: '1px solid rgba(30,51,86,0.55)', background: 'rgba(7,12,26,0.98)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(4,217,165,0.15) 0%, rgba(123,79,212,0.15) 100%)',
                  border: '1px solid rgba(4,217,165,0.22)',
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-primary">construction</span>
              </div>
              <span className="text-base font-black text-white">EsMiOficio</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#4A6080' }}>
              Conectando comunidades en todo México con talento local de confianza a través de la transparencia.
            </p>
          </div>

          {/* States */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#CDD9EE' }}>
              Estados Destacados
            </h4>
            <ul className="space-y-2.5">
              {featuredStates.map(loc => (
                <li key={loc.id}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: '#4A6080' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#04D9A5'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4A6080'; }}
                  >
                    {loc.name}
                  </a>
                </li>
              ))}
              <li>
                <span className="text-sm italic" style={{ color: '#2A3A52' }}>
                  ...y {MEXICO_LOCATIONS.length - featuredStates.length} estados más
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#CDD9EE' }}>
              Compañía
            </h4>
            <ul className="space-y-2.5">
              <NavLink onClick={onAboutClick}>Sobre Nosotros</NavLink>
              <NavLink onClick={onBlogClick}>Blog</NavLink>
              <NavLink onClick={onSuggestClick}>Sugerir nuevo oficio</NavLink>
              <NavLink onClick={onContactClick}>Contacto</NavLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#CDD9EE' }}>
              Legal
            </h4>
            <ul className="space-y-2.5">
              <NavLink onClick={onPrivacyClick}>Aviso de Privacidad</NavLink>
              <NavLink onClick={onTermsClick}>Términos y Condiciones</NavLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(30,51,86,0.50)' }}
        >
          <p className="text-xs" style={{ color: '#2A3A52' }}>
            © 2025 EsMiOficio. Hecho con orgullo para México.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="mailto:esmioficiomx@gmail.com"
              className="text-sm transition-colors"
              style={{ color: '#4A6080' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#04D9A5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4A6080'; }}
            >
              esmioficiomx@gmail.com
            </a>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: 'rgba(21,34,64,0.6)',
                    border: '1px solid rgba(30,51,86,0.8)',
                    color: '#4A6080',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = '#04D9A5';
                    el.style.borderColor = 'rgba(4,217,165,0.30)';
                    el.style.background = 'rgba(4,217,165,0.07)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = '#4A6080';
                    el.style.borderColor = 'rgba(30,51,86,0.8)';
                    el.style.background = 'rgba(21,34,64,0.6)';
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
