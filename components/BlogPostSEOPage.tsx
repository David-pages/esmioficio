import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';
import { BlogPostView, loadPublishedBlogPost } from '../lib/blog';

// Reubicamos los posts aquí o los exportamos de un archivo central.
// Para mantener todo funcional, los definiremos aquí.
export const BLOG_POSTS = [
  {
    id: 'como-elegir-un-plomero-en-morelia',
    title: '5 Consejos antes de contratar un plomero en Morelia',
    excerpt: 'Evita sorpresas y gastos extra verificando estos puntos clave antes de iniciar cualquier reparación de plomería en tu hogar.',
    author: 'Roberto M.',
    date: '15 Mayo, 2026',
    category: 'Consejos',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1000&auto=format&fit=crop',
    content: `Contratar a un profesional para reparaciones en el hogar puede ser estresante. En Michoacán, la oferta es amplia, pero ¿cómo saber quién es el indicado? Aquí te dejamos 5 consejos esenciales:

**1. Pide referencias locales**
Aunque las plataformas digitales como EsMiOficio son excelentes, siempre es bueno cruzar información. Revisa las reseñas de otros usuarios de tu misma colonia (Centro, Santa María, Las Américas, etc.).

**2. Solicita un presupuesto por escrito**
Para trabajos grandes, nunca aceptes un "ahí vemos cuánto sale". Pide un desglose de materiales y mano de obra. Recuerda que en Morelia los precios pueden variar dependiendo de la distancia.

**3. Verifica la herramienta**
Un buen profesional cuenta con su propia herramienta especializada. Si te piden dinero adelantado para "comprar un taladro", es una señal de alerta.

**4. Acuerda los tiempos**
La puntualidad es clave. Establece una hora de llegada y una fecha estimada de finalización.

**5. No pagues el 100% por adelantado**
La práctica común es dar un anticipo para materiales (si tú no los compras) o un porcentaje inicial (30-50%), y liquidar al terminar el trabajo a satisfacción.`
  },
  {
    id: 'cuanto-cobra-un-albanil-en-morelia',
    title: '¿Cuánto cobra un albañil en Morelia en 2026?',
    excerpt: 'Conoce los precios promedio de mano de obra para construcción, remodelación y reparaciones menores en la capital michoacana.',
    author: 'Ing. Sofia R.',
    date: '10 Mayo, 2026',
    category: 'Guía de Precios',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop',
    content: `Planear una remodelación o construcción en casa requiere un presupuesto claro. En Morelia, los precios de mano de obra de albañilería pueden variar según la zona y la complejidad del trabajo.

**Precios promedio por jornada:**
Un oficial albañil suele cobrar entre $500 y $800 MXN por día (jornada de 8 horas), mientras que un ayudante o "chalán" cobra entre $300 y $450 MXN.

**Precios por destajo (por obra):**
- **Aplanado de muros:** $120 - $180 por metro cuadrado.
- **Pegado de tabique:** $150 - $200 por metro cuadrado.
- **Firme de concreto:** $180 - $250 por metro cuadrado.
- **Instalación de piso/azulejo:** $160 - $280 por metro cuadrado, dependiendo del tamaño y formato.

**Consejo extra:**
Siempre aclara si el precio incluye el acarreo de material y retiro de escombro, ya que suele ser un cobro adicional que ronda los $800 a $1,200 MXN por viaje de camión.`
  },
  {
    id: 'como-evitar-fraudes-al-contratar-oficios',
    title: 'Guía definitiva: Cómo evitar fraudes al contratar oficios',
    excerpt: 'Protege tu dinero y tu hogar. Señales de alerta y medidas de seguridad al dejar entrar a un desconocido a realizar reparaciones.',
    author: 'Redacción EsMiOficio',
    date: '02 Mayo, 2026',
    category: 'Seguridad',
    imageUrl: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=1000&auto=format&fit=crop',
    content: `Lamentablemente, los fraudes en reparaciones domésticas son una realidad. Desde adelantos robados hasta trabajos mal hechos que causan más daño. Aquí te explicamos cómo protegerte:

**1. Desconfía de las "gangas" extremas**
Si un presupuesto es 50% más barato que los demás, hay un problema. O la calidad del material será pésima, o el trabajo quedará a medias.

**2. Nunca pagues la totalidad por adelantado**
Bajo ninguna circunstancia. El estándar de la industria es 50% de anticipo y 50% al finalizar, o comprar tú mismo los materiales y pagar solo la mano de obra conforme avance el proyecto.

**3. Usa plataformas verificadas**
Contratar a alguien que simplemente tocó tu puerta o dejó un volante es un riesgo. En EsMiOficio validamos la identidad de nuestros profesionales para darte mayor tranquilidad.

**4. Pide evidencia y garantías**
Un profesional serio no tendrá problema en mostrarte fotos de sus trabajos anteriores (no bajadas de internet) y en firmarte una nota de remisión o recibo con sus datos reales.`
  },
  {
    id: 'que-revisar-antes-de-contratar-un-carpintero',
    title: 'Qué revisar antes de contratar un carpintero a medida',
    excerpt: 'La carpintería fina es una inversión. Asegúrate de obtener el mueble de tus sueños con estos pasos.',
    author: 'Luis G.',
    date: '28 Abril, 2026',
    category: 'Consejos',
    imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1000&auto=format&fit=crop',
    content: `Un mueble a medida, ya sea un clóset, una cocina integral o una biblioteca, es una inversión importante. Sigue esta guía antes de dar el "sí":

**1. Entiende el tipo de material**
MDF, Melamina, Pino, Caoba o Parota. Cada material tiene un costo y durabilidad distinto. Asegúrate de que el presupuesto especifique exactamente qué madera o material compuesto usarán y de qué grosor (preferiblemente 15mm o 18mm para melaminas).

**2. Los herrajes hacen la diferencia**
Bisagras, correderas y jaladeras baratas arruinarán un buen mueble en meses. Pide que coticen herrajes de cierre lento o de marcas reconocidas.

**3. Pide un diseño o boceto**
No aceptes un trato solo de palabra. Un buen carpintero te proporcionará un render o al menos un boceto con medidas exactas de cómo quedará el mueble en tu espacio.`
  },
  {
    id: 'mejores-practicas-para-contratar-servicios-en-casa',
    title: 'Mejores prácticas para contratar servicios en casa',
    excerpt: 'Desde la primera llamada hasta la revisión final. Cómo ser un buen cliente y obtener el mejor servicio.',
    author: 'Redacción EsMiOficio',
    date: '20 Abril, 2026',
    category: 'Comunidad',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop',
    content: `Una relación laboral exitosa requiere comunicación clara de ambas partes. Aquí las mejores prácticas para contratar cualquier oficio:

**1. Sé claro en tus necesidades**
Desde el primer contacto, envía fotos, medidas aproximadas y explica detalladamente el problema. Esto ayuda al profesional a llevar la herramienta adecuada desde la primera visita.

**2. Despeja el área de trabajo**
Antes de que llegue el plomero, pintor o electricista, retira muebles, objetos frágiles y mascotas. Facilítales el espacio para que trabajen más rápido y seguro.

**3. Establece reglas de la casa**
Indica dónde pueden usar el baño (si es que pueden), si pueden poner música, etc. Un acuerdo claro evita roces.

**4. Revisa a detalle antes de liquidar**
Una vez que te entreguen el trabajo, revisa minuciosamente. Abre y cierra puertas, prueba los contactos eléctricos, deja correr el agua. Es el momento de hacer observaciones, no tres días después.`
  }
];

const BlogPostSEOPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const staticPost = BLOG_POSTS.find(p => p.id === slug);
  const [dynamicPost, setDynamicPost] = useState<BlogPostView | null>(null);
  const [loading, setLoading] = useState(!staticPost);

  useEffect(() => {
    if (!slug || staticPost) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    loadPublishedBlogPost(slug)
      .then(post => { if (active) setDynamicPost(post); })
      .catch(error => console.error('No se pudo cargar el articulo:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, staticPost]);

  const post = dynamicPost || staticPost;

  if (loading) {
    return <div className="min-h-screen bg-background grid place-items-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  }

  if (!post) {
    return <Navigate to="/blog" />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.imageUrl,
    "datePublished": 'publishedAt' in post ? post.publishedAt : "2026-05-15T08:00:00+08:00",
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "description": post.excerpt
  };

  return (
    <>
      <SEOHelmet 
        title={`${post.title} | Blog EsMiOficio`} 
        description={post.excerpt}
        canonicalUrl={getAbsoluteUrl(`/blog/${slug}`)}
        type="article"
        imageUrl={post.imageUrl}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-fade-in bg-background">
        <div className="mx-auto max-w-4xl">
          <Link 
            to="/blog"
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Volver al blog
          </Link>

          <article className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-64 sm:h-96 relative">
              <img loading="lazy" 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                  {post.category}
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-border pb-6">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  {post.date}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">person</span>
                  {post.author}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-tight">
                {post.title}
              </h1>

              <div className="text-gray-300 leading-relaxed text-lg space-y-6 prose prose-invert">
                {post.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('**') && paragraph.includes('**', 2)) {
                    const parts = paragraph.split('**');
                    const heading = parts[1];
                    const content = parts.slice(2).join('**');
                    return (
                      <div key={idx}>
                        <h3 className="text-xl font-bold text-white mt-6 mb-2">{heading}</h3>
                        <p>{content.trim()}</p>
                      </div>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-border">
                <h4 className="text-white font-bold mb-4">¿Te fue útil este artículo?</h4>
                <div className="flex gap-4">
                   <button className="flex items-center gap-2 px-4 py-2 bg-surface-light rounded-lg hover:bg-white/10 transition-colors text-gray-300">
                     <span className="material-symbols-outlined">thumb_up</span> Útil
                   </button>
                   <button 
                     className="flex items-center gap-2 px-4 py-2 bg-surface-light rounded-lg hover:bg-white/10 transition-colors text-gray-300"
                     onClick={() => navigator.clipboard.writeText(window.location.href)}
                    >
                     <span className="material-symbols-outlined">share</span> Compartir
                   </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogPostSEOPage;
