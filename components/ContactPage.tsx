import React from 'react';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';

interface ContactPageProps {
  onBack: () => void;
}

const CONTACT_EMAIL = 'esmioficiomx@gmail.com';

const socialLinks = [
  {
    name: 'Facebook',
    handle: '@esmioficiomx',
    href: 'https://www.facebook.com/esmioficiomx',
    glyph: 'f'
  },
  {
    name: 'X',
    handle: '@esmioficiomx',
    href: 'https://x.com/esmioficiomx',
    glyph: 'X'
  },
  {
    name: 'Instagram',
    handle: '@esmioficiomx',
    href: 'https://www.instagram.com/esmioficiomx/',
    glyph: 'IG'
  }
];

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <>
      <SEOHelmet
        title="Contacto | EsMiOficio"
        description="Contacta a EsMiOficio por correo electronico o redes sociales para soporte, dudas y colaboraciones."
        canonicalUrl={getAbsoluteUrl('/contacto')}
      />
      <section className="bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al inicio
          </button>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/30">
            <div className="border-b border-border bg-gradient-to-br from-primary/15 via-surface to-background px-6 py-10 sm:px-10">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                Contacto
              </span>
              <h1 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
                Estamos para ayudarte con dudas, soporte y alianzas.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
                Si tienes una pregunta sobre la plataforma, un perfil profesional o quieres colaborar con EsMiOficio, puedes escribirnos directamente.
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-background">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <p className="text-sm font-black uppercase tracking-wide text-primary">Correo electronico</p>
                <h2 className="mt-2 break-all text-2xl font-black text-white">{CONTACT_EMAIL}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Para soporte, reportes, dudas de registro o seguimiento de perfiles profesionales.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-background transition-colors hover:bg-primary-hover sm:w-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                  Enviar correo
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-background/40 p-6">
                <p className="text-sm font-black uppercase tracking-wide text-gray-500">Redes sociales</p>
                <div className="mt-5 space-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-light/60 px-4 py-4 transition-all hover:border-primary/50 hover:bg-surface-light"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-sm font-black text-primary">
                          {social.glyph}
                        </span>
                        <span>
                          <span className="block text-sm font-black text-white">{social.name}</span>
                          <span className="block text-xs text-gray-500">{social.handle}</span>
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-gray-500 transition-colors group-hover:text-primary">
                        open_in_new
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
