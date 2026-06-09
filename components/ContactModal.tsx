
import React from 'react';
import { Professional } from '../types';
import { buildWhatsAppMessage } from '../lib/trust';

interface ContactModalProps {
  professional: Professional;
  onClose: () => void;
  onContactAction?: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ professional, onClose, onContactAction }) => {
  const hasPhone = professional.phone && professional.phone.trim().length > 0;
  const cleanPhone = professional.phone.replace(/\D/g, '');
  const normalizedPhone = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
  const contactMessage = buildWhatsAppMessage(professional);
  const whatsappUrl = hasPhone ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(contactMessage)}` : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 p-1 bg-gradient-to-br from-primary to-transparent">
            <img
              src={professional.imageUrl}
              alt={professional.name}
              className="w-full h-full object-cover rounded-full border-4 border-surface"
            />
          </div>
          <h3 className="text-2xl font-bold text-white">Contactar a {professional.name.split(' ')[0]}</h3>
          <p className="text-primary font-medium">{professional.trade}</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {hasPhone
                  ? 'El contacto seguro fue desbloqueado. Se abrira WhatsApp con un mensaje prellenado.'
                  : 'Este profesional aun no tiene WhatsApp disponible en EsMiOficio.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {hasPhone ? (
            <>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  onContactAction?.();
                  onClose();
                }}
                className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
              >
                <span className="material-symbols-outlined">chat</span>
                Contactar por WhatsApp
              </a>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full bg-surface-light border border-border text-white font-bold py-4 rounded-xl"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
