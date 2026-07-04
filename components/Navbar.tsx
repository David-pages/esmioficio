
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

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onLoginClick, onRegisterClick, user, onLogout, onProfileClick, onFavoritesClick, onJobBoardClick, onClientDashboardClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')}>
          <span className="material-symbols-outlined text-primary">construction</span>
          <span className="text-lg font-bold text-white hidden sm:block">EsMiOficio</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onJobBoardClick}
            className="flex items-center gap-1 text-sm font-bold text-gray-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">dynamic_feed</span>
            <span className="hidden sm:inline">Proyectos</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <span className="text-sm text-white font-medium hidden lg:block">Hola, {user.name}</span>
              {user.role === 'PRO' ? (
                <button 
                  onClick={onProfileClick} 
                  className="flex items-center gap-1 bg-primary/15 text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/25 transition-colors text-sm font-bold shadow-sm shadow-blue-950/30"
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Mi Panel
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClientDashboardClick}
                    className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors text-sm font-bold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">dashboard</span>
                    <span className="hidden sm:inline">Mi actividad</span>
                  </button>
                  <button 
                    onClick={onFavoritesClick} 
                    className="hidden items-center gap-1 bg-surface-light text-gray-300 border border-border px-3 py-1.5 rounded-lg hover:text-white hover:border-gray-500 transition-colors text-sm font-bold shadow-sm sm:flex"
                  >
                    <span className="material-symbols-outlined text-sm text-red-400">favorite</span>
                    Favoritos
                  </button>
                </div>
              )}
              <button 
                onClick={onLogout} 
                className="text-xs text-red-400 font-bold border border-red-400/30 px-3 py-1 rounded hover:bg-red-400 hover:text-white transition-all"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className="text-sm font-bold text-white hover:text-primary transition-colors ml-2">Ingresar</button>
              <button onClick={onRegisterClick} className="bg-primary text-background px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary-hover transition-colors">Registrarse</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
