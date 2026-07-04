import React from 'react';
import ParallaxImage from './ParallaxImage';

interface AboutUsProps {
  onBack: () => void;
  onRegisterClick: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack, onRegisterClick }) => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        
        {/* Header Image/Banner */}
        <div className="relative h-64 overflow-hidden md:h-80">
          <ParallaxImage
            src="https://images.unsplash.com/photo-1581578731117-104f2a41272c?q=80&w=1920&auto=format&fit=crop" 
            alt="Trabajador mexicano" 
            loading="eager"
            intensity="hero"
            radius="none"
            className="absolute inset-0 h-full w-full"
            imageClassName="opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent flex flex-col justify-end p-8 md:p-12">
            <button 
              onClick={onBack}
              className="absolute top-8 left-8 flex items-center text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/50 transition-colors group"
            >
              <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Volver al inicio
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Sobre <span className="text-primary">Nosotros</span></h1>
            <p className="text-xl text-gray-300 max-w-2xl">Revalorizando el trabajo honesto y conectando a la comunidad de Michoacán.</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-16">
          
          {/* Misión */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">flag</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Nuestra Misión</h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                En <strong>EsMiOficio Michoacán</strong>, nuestra misión es dignificar y digitalizar los oficios tradicionales, creando un puente confiable entre los profesionales locales y las personas que necesitan sus servicios.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                Buscamos impulsar la economía local permitiendo que plomeros, electricistas, carpinteros y otros expertos tengan una presencia digital profesional sin complicaciones técnicas.
              </p>
            </div>
            <div className="bg-surface-light rounded-2xl p-2 border border-border rotate-2 hover:rotate-0 transition-transform duration-500">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop" 
                alt="Comunidad trabajando" 
                intensity="medium"
                className="h-64 w-full rounded-xl md:h-full"
                imageClassName="grayscale transition-[filter] duration-500 hover:grayscale-0"
              />
            </div>
          </section>

          {/* Visión y Valores */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-10 text-center">Nuestros Pilares</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-surface-light/30 p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-4">handshake</span>
                <h3 className="text-xl font-bold text-white mb-3">Confianza</h3>
                <p className="text-gray-400">Verificamos perfiles y fomentamos reseñas reales para asegurar que cada contratación sea segura y satisfactoria.</p>
              </div>
              <div className="bg-surface-light/30 p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors text-center">
                <span className="material-symbols-outlined text-4xl text-blue-400 mb-4">visibility</span>
                <h3 className="text-xl font-bold text-white mb-3">Transparencia</h3>
                <p className="text-gray-400">Sin intermediarios ocultos ni comisiones sorpresa. El trato y el pago son directos entre el cliente y el profesional.</p>
              </div>
              <div className="bg-surface-light/30 p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors text-center">
                <span className="material-symbols-outlined text-4xl text-green-400 mb-4">groups</span>
                <h3 className="text-xl font-bold text-white mb-3">Comunidad</h3>
                <p className="text-gray-400">Creemos en el talento local. Priorizamos las conexiones dentro de tu mismo municipio y colonia.</p>
              </div>
            </div>
          </section>

          {/* Historia / Contexto Local */}
          <section className="bg-gradient-to-r from-surface-light to-transparent p-8 md:p-12 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold text-white mb-4">Hecho con orgullo en México</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Nacimos al observar la dificultad de encontrar un buen albañil o mecánico de confianza en situaciones de urgencia. Las recomendaciones de "boca en boca" son valiosas, pero limitadas. 
              <strong> EsMiOficio</strong> digitaliza esa recomendación vecinal, llevándola a toda la ciudad de Morelia, Uruapan, Lázaro Cárdenas y más allá.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-3xl font-bold text-white mb-6">¿Listo para ser parte?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={onRegisterClick}
                className="px-8 py-4 bg-primary text-background font-bold rounded-xl text-lg hover:bg-primary-hover shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all hover:scale-105"
              >
                Registrar mi Oficio
              </button>
              <button 
                onClick={onBack}
                className="px-8 py-4 bg-surface-light text-white font-bold rounded-xl text-lg hover:bg-white/10 border border-border transition-all"
              >
                Explorar Profesionales
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
