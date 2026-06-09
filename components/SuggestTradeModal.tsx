import React, { useState } from 'react';

interface SuggestTradeModalProps {
  onClose: () => void;
  onSubmit: (tradeName: string, reason: string) => void;
}

const SuggestTradeModal: React.FC<SuggestTradeModalProps> = ({ onClose, onSubmit }) => {
  const [tradeName, setTradeName] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tradeName, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-8 animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
             <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Sugerir Oficio</h2>
          <p className="text-sm text-gray-400 mt-2">¿No encuentras el oficio que buscas? Solicítalo aquí.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nombre del Oficio</label>
            <input 
              required
              type="text" 
              placeholder="Ej. Cerrajería"
              className="w-full rounded-lg bg-surface-light border border-border px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={tradeName}
              onChange={e => setTradeName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">¿Por qué es necesario?</label>
            <textarea 
              rows={3}
              placeholder="Opcional: Describe qué hace este oficio..."
              className="w-full rounded-lg bg-surface-light border border-border px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={reason}
              onChange={e => setReason(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full rounded-lg bg-primary py-3 font-bold text-background hover:bg-primary-hover transition-colors mt-2"
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuggestTradeModal;
