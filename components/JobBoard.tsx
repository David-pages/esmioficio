import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MEXICO_LOCATIONS } from '../constants';
import { JobPost, User } from '../types';

interface JobBoardProps {
  user: User | null;
  onLoginRequest: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const JobBoard: React.FC<JobBoardProps> = ({ user, onLoginRequest, showToast }) => {
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterState, setFilterState] = useState<string>('all');
  const [filterMuni, setFilterMuni] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'municipality'>('newest');

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [formStateId, setFormStateId] = useState('');
  const [formMuni, setFormMuni] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as JobPost[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginRequest();
      return;
    }
    if (!formStateId || !formMuni || !formTitle || !formDesc || !formPhone) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    const cleanPhone = formPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      showToast('Ingresa un WhatsApp valido con al menos 10 digitos', 'error');
      return;
    }
    if (formTitle.trim().length < 8) {
      showToast('El titulo debe explicar mejor el trabajo requerido', 'error');
      return;
    }
    if (formDesc.trim().length < 25) {
      showToast('Agrega mas detalles para recibir mejores propuestas', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('No estás autenticado');

      const stateName = MEXICO_LOCATIONS.find(s => s.id === formStateId)?.name || '';

      const { error } = await supabase.from('job_posts').insert([{
        client_id: authData.user.id,
        client_name: user.name,
        state: stateName,
        municipality: formMuni,
        title: formTitle,
        description: formDesc,
        phone_number: cleanPhone,
        status: 'OPEN'
      }]);

      if (error) throw error;

      showToast('¡Proyecto publicado exitosamente!', 'success');
      setIsCreating(false);
      setFormTitle('');
      setFormDesc('');
      setFormPhone('');
      fetchPosts();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClient = (post: JobPost) => {
    if (!user) {
      onLoginRequest();
      return;
    }
    
    const message = `Hola ${post.client_name}, vi tu publicación en EsMiOficio ("${post.title}") y me gustaría ofrecer mis servicios como profesional.`;
    const cleanPhone = post.phone_number.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    
    showToast('Abriendo WhatsApp para contactar al cliente...', 'success');
    window.open(url, '_blank');
  };

  const filteredStates = MEXICO_LOCATIONS.map(s => ({ id: s.id, name: s.name }));
  const filterMuniList = filterState !== 'all' ? MEXICO_LOCATIONS.find(s => s.id === filterState)?.municipalities || [] : [];
  
  const formMuniList = formStateId ? MEXICO_LOCATIONS.find(s => s.id === formStateId)?.municipalities || [] : [];

  const filteredPosts = posts.filter(p => {
    if (filterState !== 'all' && p.state !== MEXICO_LOCATIONS.find(s => s.id === filterState)?.name) return false;
    if (filterMuni !== 'all' && p.municipality !== filterMuni) return false;
    const text = `${p.title} ${p.description} ${p.client_name} ${p.municipality} ${p.state}`.toLowerCase();
    if (searchTerm.trim() && !text.includes(searchTerm.toLowerCase().trim())) return false;
    return true;
  }).sort((a, b) => {
    if (sortMode === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortMode === 'municipality') return a.municipality.localeCompare(b.municipality);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const openPostsByState = posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.state] = (acc[post.state] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="py-12 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">dynamic_feed</span>
              Muro de Proyectos
            </h1>
            <p className="text-gray-400 mt-2">Encuentra o publica necesidades de servicios en tu área local.</p>
            <p className="text-xs text-gray-500 mt-2">{posts.length} proyectos abiertos en el muro</p>
          </div>
          
          <button 
            onClick={() => {
              if (!user) onLoginRequest();
              else setIsCreating(!isCreating);
            }}
            className="bg-primary text-background px-6 py-3 rounded-xl font-bold hover:bg-primary-hover shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">{isCreating ? 'close' : 'add_circle'}</span>
            {isCreating ? 'Cancelar' : 'Publicar mi Proyecto'}
          </button>
        </div>

        {isCreating && (
          <div className="bg-surface border border-border p-6 rounded-2xl mb-8 animate-fade-in shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Detalla tu necesidad</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título del Proyecto</label>
                <input required minLength={8} maxLength={90} type="text" className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none" placeholder="Ej: Fuga de agua en el baño, Reparación de techo..." value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                <p className="text-[11px] text-gray-600 mt-1">{formTitle.length}/90 caracteres</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                  <select required className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none" value={formStateId} onChange={e => {setFormStateId(e.target.value); setFormMuni('');}}>
                    <option value="">Selecciona tu estado</option>
                    {filteredStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Municipio</label>
                  <select required className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none disabled:opacity-50" value={formMuni} onChange={e => setFormMuni(e.target.value)} disabled={!formStateId}>
                    <option value="">Selecciona tu municipio</option>
                    {formMuniList.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono (WhatsApp)</label>
                <input required inputMode="tel" type="tel" className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none" placeholder="Ej: 4431234567" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                <p className="text-[11px] text-gray-600 mt-1">Solo digitos; se usara para WhatsApp.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción Detallada</label>
                <textarea required minLength={25} maxLength={700} rows={4} className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-white focus:border-primary outline-none resize-none" placeholder="Describe el problema, medidas estimadas o detalles útiles..." value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                <p className="text-[11px] text-gray-600 mt-1">{formDesc.length}/700 caracteres</p>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50">
                {isSubmitting ? 'Publicando...' : 'Publicar Ahora'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-surface p-4 rounded-xl border border-border mb-8 flex flex-col md:flex-row gap-4 items-center">
          <span className="material-symbols-outlined text-gray-400">filter_list</span>
          <div className="relative w-full md:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-white w-full focus:border-primary outline-none"
              placeholder="Buscar por trabajo, cliente o municipio"
            />
          </div>
          <select className="bg-background border border-border rounded-lg px-3 py-2 text-white w-full md:w-auto" value={filterState} onChange={e => {setFilterState(e.target.value); setFilterMuni('all');}}>
            <option value="all">Todos los Estados</option>
            {filteredStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="bg-background border border-border rounded-lg px-3 py-2 text-white w-full md:w-auto disabled:opacity-50" value={filterMuni} onChange={e => setFilterMuni(e.target.value)} disabled={filterState === 'all'}>
            <option value="all">Todos los Municipios</option>
            {filterMuniList.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          <select className="bg-background border border-border rounded-lg px-3 py-2 text-white w-full md:w-auto" value={sortMode} onChange={e => setSortMode(e.target.value as 'newest' | 'oldest' | 'municipality')}>
            <option value="newest">Mas recientes</option>
            <option value="oldest">Mas antiguos</option>
            <option value="municipality">Por municipio</option>
          </select>
        </div>

        {Object.keys(openPostsByState).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(openPostsByState).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([stateName, count]) => (
              <button
                key={stateName}
                onClick={() => {
                  const stateId = MEXICO_LOCATIONS.find(s => s.name === stateName)?.id || 'all';
                  setFilterState(stateId);
                  setFilterMuni('all');
                }}
                className="px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-gray-300 hover:border-primary/50 transition-colors"
              >
                {stateName}: {count}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">autorenew</span>
            <p className="text-gray-400 mt-2 font-bold">Cargando proyectos...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-dashed border-border">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-white mb-2">No hay proyectos encontrados</h3>
            <p className="text-gray-400">Prueba cambiando los filtros o publica un nuevo proyecto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-surface rounded-2xl p-6 border border-border hover:border-primary/50 transition-all shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{post.title}</h3>
                    <div className="flex items-center gap-1 text-primary text-xs mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {post.municipality}, {post.state}
                    </div>
                  </div>
                  <span className="text-[10px] bg-surface-light border border-border px-2 py-1 rounded text-gray-400 font-bold">
                    {new Date(post.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1 whitespace-pre-line">
                  {post.description}
                </p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {post.client_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-300">{post.client_name}</span>
                  </div>
                  
                  {user?.role === 'PRO' && (
                    <button 
                      onClick={() => handleContactClient(post)}
                      className="flex items-center gap-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white border border-green-600/30 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">forum</span>
                      Ofrecer Servicios
                    </button>
                  )}
                  {user?.role !== 'PRO' && (
                    <span className="text-xs text-gray-500">Solo profesionales pueden ofrecer servicios</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default JobBoard;
