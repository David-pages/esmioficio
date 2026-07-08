
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  onNavigate: (view: 'HOME' | 'ABOUT' | 'BLOG') => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  user: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  onFavoritesClick: () => void;
  onJobBoardClick: () => void;
  onClientDashboardClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNavigate, onLoginClick, onRegisterClick,
  user, onLogout, onProfileClick, onFavoritesClick,
  onJobBoardClick, onClientDashboardClick
}) => {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(7, 12, 26, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(30, 51, 86, 0.60)',
        boxShadow: '0 1px 0 rgba(4, 217, 165, 0.04)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => onNavigate('HOME')}
          className="flex items-center gap-2.5 group"
          aria-label="EsMiOficio — inicio"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(4,217,165,0.15) 0%, rgba(123,79,212,0.15) 100%)',
              border: '1px solid rgba(4,217,165,0.25)',
              boxShadow: '0 0 12px rgba(4,217,165,0.10)',
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">construction</span>
          </div>
          <span className="hidden sm:block text-base font-black tracking-tight text-white">
            EsMiOficio
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onJobBoardClick}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#8BA0B8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CDD9EE'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8BA0B8'; }}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">dynamic_feed</span>
            <span className="hidden sm:inline">Proyectos</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="hidden lg:block text-sm font-medium" style={{ color: '#8BA0B8' }}>
                Hola, <span className="text-white">{user.name}</span>
              </span>

              {user.role === 'PRO' ? (
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all"
                  style={{
                    background: 'rgba(240,168,50,0.10)',
                    border: '1px solid rgba(240,168,50,0.25)',
                    color: '#F0A832',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,168,50,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,168,50,0.10)'; }}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Mi Panel
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClientDashboardClick}
                    className="aurora-btn-ghost flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    <span className="hidden sm:inline">Mi actividad</span>
                  </button>
                  <button
                    onClick={onFavoritesClick}
                    className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all"
                    style={{
                      background: 'rgba(21,34,64,0.8)',
                      border: '1px solid rgba(30,51,86,0.9)',
                      color: '#8BA0B8',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CDD9EE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8BA0B8'; }}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ color: '#E04B8A' }}>favorite</span>
                    Favoritos
                  </button>
                </div>
              )}

              <button
                onClick={onLogout}
                className="text-xs font-bold rounded px-3 py-1 transition-all"
                style={{
                  color: '#E04B8A',
                  border: '1px solid rgba(224,75,138,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#E04B8A';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '';
                  (e.currentTarget as HTMLButtonElement).style.color = '#E04B8A';
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-sm font-semibold ml-2 transition-colors"
                style={{ color: '#8BA0B8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CDD9EE'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8BA0B8'; }}
              >
                Ingresar
              </button>
              <button
                onClick={onRegisterClick}
                className="aurora-btn-primary rounded-lg px-4 py-2 text-sm"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
