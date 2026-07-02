import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from './BlogPostSEOPage';
import SEOHelmet from './SEOHelmet';
import { getAbsoluteUrl } from '../lib/siteUrl';
import { BlogPostView, loadPublishedBlogPosts } from '../lib/blog';

interface BlogProps {
  onBack: () => void;
}

const Blog: React.FC<BlogProps> = ({ onBack }) => {
  const [dynamicPosts, setDynamicPosts] = useState<BlogPostView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadPublishedBlogPosts()
      .then(posts => { if (active) setDynamicPosts(posts); })
      .catch(error => console.error('No se pudieron cargar las publicaciones:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const posts = [...dynamicPosts, ...BLOG_POSTS.filter(post => !dynamicPosts.some(dynamic => dynamic.id === post.id))];

  return (
    <>
      <SEOHelmet 
        title="Blog EsMiOficio | Consejos y Guías"
        description="Encuentra los mejores consejos, guías de precios y recomendaciones para el mantenimiento y reparación de tu hogar o negocio en Michoacán."
        canonicalUrl={getAbsoluteUrl('/blog')}
      />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Blog EsMiOficio</h1>
              <p className="text-gray-400">Consejos, noticias y guías para tu hogar en Michoacán.</p>
            </div>
            <button 
              onClick={onBack}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined mr-1">home</span>
              Inicio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && <div className="col-span-full rounded-2xl border border-border bg-surface p-8 text-center text-sm text-gray-500">Actualizando publicaciones...</div>}
            {!loading && posts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group shadow-lg flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img loading="lazy" 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-primary mb-3 font-medium">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                    Leer artículo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter Signup (Optional decorative element) */}
          <div className="mt-20 bg-gradient-to-r from-surface-light to-surface border border-border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">mail</span>
              <h2 className="text-2xl font-bold text-white mb-4">Suscríbete a nuestro boletín</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">Recibe consejos de mantenimiento y ofertas especiales de profesionales en tu área.</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary text-background font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
