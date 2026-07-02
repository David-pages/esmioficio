import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';
import { Professional, TradeCategory } from '../types';
import { MapPin, CheckCircle, Shield } from 'lucide-react';
import StarRating from './StarRating';

interface CategorySEOPageProps {
  professionals: Professional[];
  trades: TradeCategory[];
}

const faqs = {
  plomeros: [
    { q: "¿Cuánto cobra un plomero en Morelia por hora o trabajo?", a: "El costo promedio de un plomero en Morelia oscila entre $300 y $800 MXN por visita de revisión o trabajos menores. Reparaciones complejas se cotizan por proyecto." },
    { q: "¿Atienden emergencias de plomería 24/7?", a: "Sí, varios de los profesionales listados en EsMiOficio ofrecen atención de urgencias para fugas graves o tuberías rotas las 24 horas en diversas colonias de Morelia." },
    { q: "¿Tienen garantía los trabajos de plomería?", a: "Recomendamos siempre solicitar al profesional la garantía por escrito. En nuestra plataforma promovemos que los oficios den garantías de 15 a 30 días en mano de obra." },
  ],
  electricistas: [
    { q: "¿Qué hace un electricista certificado?", a: "Un electricista certificado realiza instalaciones, reparaciones y mantenimiento de sistemas eléctricos siguiendo las normas de seguridad (NOM) para evitar cortos circuitos o riesgos de incendio." },
    { q: "¿Cuánto cuesta una revisión eléctrica en Morelia?", a: "Una revisión de diagnóstico eléctrico suele costar entre $350 y $600 MXN, dependiendo de la distancia y complejidad." }
  ],
  // Fallback
  general: [
    { q: "¿Cómo sé que el profesional es de confianza?", a: "En EsMiOficio verificamos la identidad de los profesionales y recopilamos reseñas de clientes anteriores para que puedas tomar una decisión informada." },
    { q: "¿El presupuesto a domicilio tiene costo?", a: "Algunos profesionales cobran una cuota de recuperación por la visita que suele descontarse si apruebas el presupuesto. Es importante preguntarlo al contactarlos." }
  ]
};

const introTexts: Record<string, string> = {
  plomeros: `Si estás buscando los mejores plomeros en Morelia, has llegado al lugar indicado. Sabemos lo frustrante que puede ser enfrentar una fuga de agua, un desagüe tapado o problemas con el boiler o calentador solar. En EsMiOficio México, hemos reunido a expertos en plomería residencial y comercial listos para atender tus emergencias y proyectos de instalación con la máxima calidad y profesionalismo.
  
Nuestra selección de fontaneros y plomeros en Morelia cuenta con años de experiencia en la detección de fugas, destape de drenajes, instalación de tuberías de cobre, PVC, CPVC y tuboplus. Además, son especialistas en mantenimiento y reparación de bombas de agua, hidroneumáticos, tinacos y cisternas. Ya sea que vivas en el centro, Altozano, Las Américas, Villas del Pedregal o cualquier otra colonia, nuestros profesionales tienen cobertura en toda la ciudad y zonas conurbadas.
  
Entendemos que la confianza es fundamental cuando dejas entrar a alguien a tu hogar. Por eso, en cada perfil podrás revisar sus calificaciones, leer comentarios de otros clientes en Morelia y ver fotos de sus trabajos anteriores. Un buen servicio de plomería no solo soluciona el problema actual, sino que previene daños futuros a tu patrimonio, ahorrándote dinero a largo plazo. No dejes tus tuberías en manos de inexpertos, contrata hoy a un plomero calificado y soluciona esa gotera o desperfecto de una vez por todas.`,
  
  electricistas: `Encontrar electricistas confiables en Morelia nunca fue tan fácil. La seguridad de tu familia o tu negocio depende de una instalación eléctrica en óptimas condiciones. Los cortos circuitos, apagones frecuentes o recibos de luz con cobros excesivos son señales claras de que necesitas la ayuda de un experto en electricidad. En EsMiOficio, conectamos tus necesidades con los mejores especialistas eléctricos de la capital michoacana.
  
Los profesionales que encontrarás aquí están capacitados para realizar desde la instalación de contactos, lámparas y ventiladores de techo, hasta el cableado completo de una casa, balanceo de cargas, mufas, centros de carga y preparación para medidores de CFE. Todos trabajando bajo los estándares de seguridad requeridos. Ya sea un pequeño arreglo doméstico o un proyecto comercial grande, hay un electricista ideal para tu presupuesto y necesidades específicas.
  
Te recomendamos siempre revisar las credenciales de cada perfil, así como sus reseñas y experiencia. Un trabajo eléctrico mal realizado no solo puede dañar tus electrodomésticos, sino que representa un grave riesgo de incendio. Al usar nuestra plataforma, tienes la tranquilidad de ver opiniones reales de otros morelianos que ya han contratado estos servicios. Contacta directamente por WhatsApp, pide tu cotización sin compromiso y dale luz segura a tu proyecto con los electricistas mejor calificados de Morelia.`,
  
  // Textos genéricos para otras categorías si no están definidas explícitamente
  default: `¿Buscas a los mejores especialistas en servicios para el hogar y negocio en Morelia? Has llegado al directorio definitivo. En EsMiOficio México, nuestra misión es conectar a clientes con necesidades urgentes o proyectos de mejora con los profesionales más dedicados y calificados de la ciudad. Sabemos que encontrar mano de obra confiable y honesta puede ser todo un reto, por lo que hemos creado esta plataforma transparente y segura.
  
Nuestros expertos tienen amplia experiencia trabajando en diversas zonas de Morelia, conociendo a la perfección los requerimientos locales y el tipo de construcciones de la región. Cada uno de los perfiles que verás a continuación pertenece a trabajadores que se esfuerzan día a día por brindar el mejor servicio, ofreciendo atención puntual, diagnósticos certeros y soluciones duraderas. No importa si es una reparación menor o un proyecto de remodelación integral, aquí encontrarás a la persona adecuada.
  
Al contratar a través de nuestro listado, apoyas directamente a la economía local y fomentas el crecimiento de los oficios en nuestra comunidad. Tómate el tiempo de revisar las reseñas, observar la galería de trabajos previos y evaluar las calificaciones de cada prospecto. La comunicación es directa: puedes enviarles un WhatsApp o llamarles para pedir cotizaciones o resolver tus dudas. Confía en la comunidad, confía en EsMiOficio, y contrata seguro hoy mismo.`
};

const marketMap: Record<string, { city: string; state: string }> = {
  morelia: { city: 'Morelia', state: 'Michoacán' },
  cdmx: { city: 'Ciudad de México', state: 'Ciudad de México' },
  guadalajara: { city: 'Guadalajara', state: 'Jalisco' },
  monterrey: { city: 'Monterrey', state: 'Nuevo León' },
  puebla: { city: 'Puebla', state: 'Puebla' },
  queretaro: { city: 'Querétaro', state: 'Querétaro' }
};

const CategorySEOPage: React.FC<CategorySEOPageProps> = ({ professionals, trades }) => {
  const { categorySlug } = useParams<{ categorySlug: string }>(); // ej: plomeros-en-morelia
  
  const matchedMarket = Object.keys(marketMap).find(market => categorySlug?.endsWith(`-en-${market}`)) || 'morelia';
  const { city, state } = marketMap[matchedMarket];
  const extractedCategory = categorySlug?.replace(`-en-${matchedMarket}`, '') || '';
  
  // Buscar categoría real
  const tradeInfo = trades.find(t => 
    t.id === extractedCategory || 
    t.name.toLowerCase() === extractedCategory.replace(/-/g, ' ')
  ) || { name: extractedCategory.replace(/-/g, ' ').toUpperCase(), id: extractedCategory };

  const title = `Los 10 Mejores ${tradeInfo.name} en ${city} (2026) | EsMiOficio`;
  const description = `Encuentra a los mejores ${tradeInfo.name.toLowerCase()} en ${city}. Compara precios, lee reseñas de clientes, mira fotos de sus trabajos y contacta gratis por WhatsApp.`;

  const pros = useMemo(() => {
    return professionals.filter(p => 
      p.trade.toLowerCase() === tradeInfo.name.toLowerCase() ||
      p.trade.toLowerCase().includes(extractedCategory)
    ).sort((a, b) => b.rating - a.rating);
  }, [professionals, tradeInfo, extractedCategory]);

  const introText = introTexts[extractedCategory] || introTexts['default'];
  const categoryFaqs = faqs[extractedCategory as keyof typeof faqs] || faqs['general'];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": getAbsoluteUrl(`/oficios/${categorySlug}`),
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": pros.slice(0, 10).map((pro, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": pro.name,
          "image": pro.imageUrl,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": pro.municipality || city,
            "addressRegion": pro.state || state,
            "addressCountry": "MX"
          },
          "aggregateRating": pro.rating > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": pro.rating.toString(),
            "reviewCount": pro.reviews.toString()
          } : undefined
        }
      }))
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": categoryFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const combinedJsonLd = [jsonLd, faqJsonLd];

  return (
    <>
      <SEOHelmet 
        title={title} 
        description={description} 
        canonicalUrl={getAbsoluteUrl(`/oficios/${categorySlug}`)}
        jsonLd={combinedJsonLd as any}
      />
      
      <div className="bg-surface pb-12">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4 text-sm text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link> 
          <span className="mx-2">›</span> 
          <span className="text-gray-200 capitalize">{tradeInfo.name} en {city}</span>
        </div>

        {/* Header Hero */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Los mejores <span className="text-primary">{tradeInfo.name}</span> en {city}
          </h1>
          
          <div className="bg-surface-light rounded-xl p-6 md:p-8 mb-12 shadow-lg border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-4">Sobre los servicios de {tradeInfo.name.toLowerCase()}</h2>
            <div className="prose prose-invert max-w-none text-gray-300 space-y-4 text-justify leading-relaxed">
              {introText.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Listado de Pros */}
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2">
            Profesionales Aprobados ({pros.length})
          </h2>
          
          <div className="grid grid-cols-1 gap-6 mb-16">
            {pros.length > 0 ? pros.map(pro => (
              <div key={pro.id} className="bg-surface-light rounded-xl p-6 flex flex-col md:flex-row gap-6 border border-white/5 hover:border-primary/30 transition-all">
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img loading="lazy" src={pro.imageUrl} alt={`${pro.trade} ${pro.name} en ${city}`} className="w-full h-full object-cover" />
                  {pro.verified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg" title="Verificado">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        <Link to={`/oficio/${pro.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${pro.trade.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase()}`} className="hover:text-primary">
                          {pro.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1 bg-surface py-1 px-2 rounded-lg border border-white/10 text-sm">
                        <StarRating rating={pro.rating} reviews={pro.reviews} sizeClass="text-sm" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{pro.municipality || city}, {pro.state || 'Michoacán'}</span>
                      {pro.location && <span className="text-gray-500">• {pro.location}</span>}
                    </div>
                    
                    <p className="text-gray-400 line-clamp-3 mb-4">
                      {pro.description || `Servicios profesionales de ${pro.trade.toLowerCase()} en ${city}.`}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link 
                      to={`/oficio/${pro.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${pro.trade.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase()}`}
                      className="px-6 py-2 bg-surface border border-white/10 rounded-lg text-white font-medium hover:bg-surface-light transition-colors"
                    >
                      Ver Perfil Completo
                    </Link>
                    <Link
                      to={`/oficio/${pro.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${pro.trade.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase()}`}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                    >
                      Contactar por WhatsApp
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-surface-light rounded-xl border border-white/5">
                <p className="text-gray-400 text-lg">Aún no hay profesionales registrados en esta categoría para {city}.</p>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">Volver al inicio</Link>
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2">Preguntas Frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryFaqs.map((faq, idx) => (
                <div key={idx} className="bg-surface-light p-6 rounded-xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-3 flex gap-2">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces Internos */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-2">Otras categorías en {city}</h2>
            <div className="flex flex-wrap gap-3">
              {trades.filter(t => t.id !== extractedCategory).slice(0, 10).map(t => (
                <Link 
                  key={t.id} 
                  to={`/oficios/${t.id}-en-${matchedMarket}`}
                  className="px-4 py-2 bg-surface-light border border-white/5 hover:border-primary/50 hover:text-primary rounded-full text-gray-300 text-sm transition-all"
                >
                  {t.name} en {city}
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default CategorySEOPage;
