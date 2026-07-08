import React from 'react';

interface ContactProps {
  onBack: () => void;
}

const EMAIL = 'esmioficiomx@gmail.com';

const SOCIALS = [
  {
    name: 'Facebook',
    handle: '/esmioficiomx',
    href: 'https://www.facebook.com/esmioficiomx',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    handle: '@esmioficiomx',
    href: 'https://www.instagram.com/esmioficiomx',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.06a4.98 4.98 0 1 0 0 9.96 4.98 4.98 0 0 0 0-9.96Zm0 8.22a3.24 3.24 0 1 1 0-6.48 3.24 3.24 0 0 1 0 6.48Zm6.34-8.42a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0Z" />
      </svg>
    ),
  },
  {
    name: 'X',
    handle: '@esmioficiomx',
    href: 'https://x.com/esmioficiomx',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.1l4.71 6.23 5.43-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z" />
      </svg>
    ),
  },
];

const Contact: React.FC<ContactProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-surface border border-border rounded-2xl p-8 sm:p-12 shadow-2xl animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Volver al inicio
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Contáctanos</h1>
        <p className="text-gray-400 mb-10 max-w-2xl">
          ¿Tienes dudas, sugerencias o quieres sumar tu oficio? Escríbenos o síguenos en nuestras redes. Estamos para ayudarte a conectar con profesionales de confianza.
        </p>

        {/* Correo electrónico */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4">Correo electrónico</h2>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-3 rounded-xl bg-surface-light border border-border px-5 py-4 text-white hover:border-primary/50 transition-colors group"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <span className="material-symbols-outlined">mail</span>
            </span>
            <span>
              <span className="block text-sm text-gray-400">Escríbenos a</span>
              <span className="block font-bold group-hover:text-primary transition-colors">{EMAIL}</span>
            </span>
          </a>
        </section>

        {/* Redes sociales */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4">Síguenos en redes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SOCIALS.map(social => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-surface-light border border-border px-5 py-4 text-white hover:border-primary/50 hover:bg-surface transition-all group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:scale-110 transition-transform">
                  {social.icon}
                </span>
                <span>
                  <span className="block font-bold group-hover:text-primary transition-colors">{social.name}</span>
                  <span className="block text-sm text-gray-400">{social.handle}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* WhatsApp / nota */}
        <section className="rounded-xl border border-border bg-background/40 p-6">
          <h2 className="text-lg font-bold text-white mb-2">¿Buscas a un profesional?</h2>
          <p className="text-gray-400 text-sm">
            Para contratar un oficio, usa el buscador de la página y contacta directo al profesional por WhatsApp desde su perfil. Este correo es para temas de la plataforma, alianzas y soporte.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
