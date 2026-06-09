import React, { useEffect, useState } from 'react';
import { Professional, RecentWork } from '../types';
import { compressImageToWebP, mapRecentWorkRow } from '../lib/trust';
import { supabase } from '../lib/supabaseClient';

interface RecentWorksProps {
  professional: Professional;
  isOwner: boolean;
}

const RECENT_WORKS_BUCKET = 'recent-works';

const getUniqueUploadId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getRecentWorkUploadErrorMessage = (error: any) => {
  const message = String(error?.message || '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('bucket') || lowerMessage.includes('not found')) {
    return `No existe el bucket "${RECENT_WORKS_BUCKET}". Aplica el SQL de Storage antes de publicar trabajos.`;
  }

  if (lowerMessage.includes('row-level security') || error?.statusCode === '403' || error?.code === '42501') {
    return `Supabase bloqueo la subida. Revisa la politica RLS del bucket "${RECENT_WORKS_BUCKET}" y que la ruta inicie con tu user.id.`;
  }

  return message || 'No pudimos subir la imagen del trabajo.';
};

const getRecentWorkSaveErrorMessage = (error: any) => {
  const message = String(error?.message || '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('row-level security') || error?.code === '42501') {
    return 'Supabase bloqueo el guardado del trabajo reciente. Revisa la politica RLS de recent_works para professional_id = auth.uid().';
  }

  if (lowerMessage.includes('professional_id')) {
    return 'No pudimos asociar el trabajo con tu perfil profesional. Revisa que professional_id sea tu user.id.';
  }

  return message || 'No se pudo guardar el trabajo reciente.';
};

const RecentWorks: React.FC<RecentWorksProps> = ({ professional, isOwner }) => {
  const [works, setWorks] = useState<RecentWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    zone: professional.coverageZones?.[0] || '',
    city: professional.municipality || 'Morelia',
    serviceType: professional.services?.[0] || professional.trade,
    approximateDate: ''
  });
  const [files, setFiles] = useState<File[]>([]);

  const loadWorks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recent_works')
      .select('id,professional_id,title,description,image_urls,before_image_urls,after_image_urls,zone,city,service_type,approximate_date,created_at')
      .eq('professional_id', professional.id)
      .order('approximate_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWorks(data.map(mapRecentWorkRow));
      setMessage(null);
    } else if (error) {
      setMessage('No pudimos cargar los trabajos recientes. Revisa permisos de lectura en recent_works.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWorks();
  }, [professional.id]);

  useEffect(() => {
    setForm({
      title: '',
      description: '',
      zone: professional.coverageZones?.[0] || '',
      city: professional.municipality || 'Morelia',
      serviceType: professional.services?.[0] || professional.trade,
      approximateDate: ''
    });
    setFiles([]);
    setMessage(null);
  }, [professional.id]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    try {
      const processed: File[] = [];
      for (const file of selected.slice(0, 6)) {
        processed.push(await compressImageToWebP(file));
      }
      setFiles(prev => [...prev, ...processed].slice(0, 6));
      setMessage('Imagenes listas para subir en WebP.');
    } catch (error: any) {
      setMessage(error.message || 'No se pudo procesar la imagen.');
    } finally {
      event.target.value = '';
    }
  };

  const handleCreateWork = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!form.title.trim()) {
      setMessage('Agrega un titulo breve del trabajo.');
      return;
    }

    if (files.length === 0) {
      setMessage('Agrega al menos una foto del trabajo reciente.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user || authData.user.id !== professional.id) {
        throw new Error('No pudimos validar tu sesion profesional. Vuelve a iniciar sesion.');
      }

      const urls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-z0-9_.-]+/gi, '-').toLowerCase();
        const path = `${authData.user.id}/${Date.now()}-${getUniqueUploadId()}-${safeName}`;
        const { error } = await supabase.storage.from(RECENT_WORKS_BUCKET).upload(path, file, {
          contentType: file.type,
          upsert: false
        });
        if (error) throw new Error(getRecentWorkUploadErrorMessage(error));

        const { data } = supabase.storage.from(RECENT_WORKS_BUCKET).getPublicUrl(path);
        if (data.publicUrl) urls.push(data.publicUrl);
      }

      if (urls.length === 0) {
        throw new Error('Las imagenes se procesaron, pero no pudimos generar URLs publicas.');
      }

      const { data, error } = await supabase
        .from('recent_works')
        .insert([{
          professional_id: professional.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          image_urls: urls,
          zone: form.zone.trim() || null,
          city: form.city.trim() || professional.municipality || 'Morelia',
          service_type: form.serviceType.trim() || professional.trade,
          approximate_date: form.approximateDate || null
        }])
        .select()
        .single();

      if (error) throw new Error(getRecentWorkSaveErrorMessage(error));
      await loadWorks();
      setFiles([]);
      setForm(prev => ({ ...prev, title: '', description: '', approximateDate: '' }));
      setMessage('Trabajo reciente publicado.');
    } catch (error: any) {
      setMessage(error.message || 'No se pudo guardar el trabajo reciente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">work_history</span>
            Trabajos recientes
          </h3>
          <p className="text-sm text-gray-400">Evidencia visual por zona aproximada, fecha y tipo de servicio.</p>
        </div>
      </div>

      {isOwner && (
        <form onSubmit={handleCreateWork} className="mb-6 rounded-2xl bg-surface-light/30 border border-border p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              placeholder="Titulo del trabajo"
            />
            <input
              value={form.serviceType}
              onChange={e => setForm({ ...form, serviceType: e.target.value })}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              placeholder="Tipo de servicio"
            />
            <input
              value={form.zone}
              onChange={e => setForm({ ...form, zone: e.target.value })}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              placeholder="Zona aproximada, no direccion"
            />
            <input
              type="month"
              value={form.approximateDate}
              onChange={e => setForm({ ...form, approximateDate: e.target.value })}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
              title="Fecha aproximada"
            />
          </div>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm resize-none focus:border-primary outline-none"
            placeholder="Descripcion breve del problema y solucion"
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-bold text-primary cursor-pointer hover:bg-primary/10">
              <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
              Agregar fotos
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <p className="text-xs text-gray-500">Maximo 5 MB por archivo. Se comprime a WebP, 1200 px de ancho.</p>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span key={`${file.name}-${index}`} className="activity-badge">{file.name}</span>
              ))}
            </div>
          )}
          {message && <p className="text-xs text-gray-400">{message}</p>}
          <button
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary text-background font-black px-5 py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Publicando...' : 'Publicar trabajo reciente'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-64 rounded-2xl bg-surface-light/40 animate-pulse"></div>
          ))}
        </div>
      ) : works.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {works.map(work => (
            <article key={work.id} className="rounded-2xl bg-surface-light/30 border border-border overflow-hidden">
              <div className="grid grid-cols-2 gap-1 bg-surface">
                {work.imageUrls.slice(0, 4).map((url, index) => (
                  <img
                    key={`${work.id}-${index}`}
                    src={url}
                    alt={`${work.title} ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                    className="h-36 w-full object-cover bg-surface-light"
                  />
                ))}
              </div>
              <div className="p-5">
                {(work.beforeImageUrls?.length || work.afterImageUrls?.length) ? (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {work.beforeImageUrls?.[0] && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Antes</p>
                        <img src={work.beforeImageUrls[0]} alt={`Antes de ${work.title}`} className="h-24 w-full object-cover rounded-lg bg-surface" />
                      </div>
                    )}
                    {work.afterImageUrls?.[0] && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Despues</p>
                        <img src={work.afterImageUrls[0]} alt={`Despues de ${work.title}`} className="h-24 w-full object-cover rounded-lg bg-surface" />
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="mb-2 flex flex-wrap gap-2">
                  {work.serviceType && <span className="activity-badge">{work.serviceType}</span>}
                  {(work.zone || work.city) && <span className="activity-badge">{[work.zone, work.city].filter(Boolean).join(', ')}</span>}
                  {work.approximateDate && <span className="activity-badge">{work.approximateDate}</span>}
                </div>
                <h4 className="text-lg font-bold text-white">{work.title}</h4>
                {work.description && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{work.description}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-700 mb-2">photo_library</span>
          <p className="text-gray-500 font-medium">Aun no hay trabajos recientes publicados.</p>
        </div>
      )}
    </section>
  );
};

export default RecentWorks;
