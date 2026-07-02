import React from 'react';
import ParallaxImage from './ParallaxImage';
import Reveal from './Reveal';

const showcaseItems = [
  {
    title: 'Compara trabajos reales',
    detail: 'Revisa las fotos de antes y después en cada perfil. Un buen profesional muestra su trabajo con orgullo.',
    tag: 'Consejo 1',
    icon: 'photo_library',
    src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop',
    alt: 'Profesional revisando una instalacion dentro de una casa'
  },
  {
    title: 'Verifica la experiencia',
    detail: 'Prefiere perfiles verificados, con reseñas de clientes reales y años de experiencia comprobables.',
    tag: 'Consejo 2',
    icon: 'verified',
    src: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1400&auto=format&fit=crop',
    alt: 'Electricista trabajando con herramientas en una instalacion'
  },
  {
    title: 'Acuerda todo por escrito',
    detail: 'Define precio, fechas y materiales por WhatsApp antes de empezar. Guarda la conversación como respaldo.',
    tag: 'Consejo 3',
    icon: 'handshake',
    src: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1400&auto=format&fit=crop',
    alt: 'Herramientas de carpinteria sobre una mesa de trabajo'
  }
];

const ScrollWorkShowcase: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="activity-badge mb-4 border-primary/25 bg-primary/10 text-primary">
                Evidencia visual
              </span>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                Contrata con confianza
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-400 sm:text-base">
              Antes de contratar, tómate un minuto para revisar la evidencia de cada profesional. Estos tres consejos te ayudan a elegir mejor.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          {showcaseItems.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 130}
              className={[
                index === 0 ? 'md:col-span-5' : '',
                index === 1 ? 'md:col-span-4' : '',
                index === 2 ? 'md:col-span-3' : ''
              ].join(' ')}
            >
            <article
              className={[
                'group relative overflow-hidden rounded-[1.35rem] border border-border bg-surface shadow-2xl shadow-black/20',
                index === 1 ? 'md:translate-y-8' : '',
                index === 2 ? 'md:translate-y-2' : ''
              ].join(' ')}
            >
              <ParallaxImage
                src={item.src}
                alt={item.alt}
                sizes="(min-width: 1024px) 33vw, 100vw"
                intensity={index === 0 ? 'hero' : 'medium'}
                className={[
                  'w-full',
                  index === 0 ? 'h-[76vw] min-h-[320px] max-h-[520px] md:h-[560px]' : '',
                  index === 1 ? 'h-[70vw] min-h-[300px] max-h-[460px] md:h-[500px]' : '',
                  index === 2 ? 'h-[66vw] min-h-[280px] max-h-[420px] md:h-[420px]' : ''
                ].join(' ')}
                imageClassName="brightness-[0.82] saturate-[1.05] transition-[filter] duration-500 group-hover:brightness-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-primary backdrop-blur">
                  <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                  {item.tag}
                </div>
                <h3 className="text-xl font-black text-white sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{item.detail}</p>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollWorkShowcase;
