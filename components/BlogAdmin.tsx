import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BlogPostRecord, BlogStatus, formatBlogDate, slugifyBlogTitle } from '../lib/blog';
import { supabase } from '../lib/supabaseClient';

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', content: '', category: 'Consejos',
  author: 'Redaccion EsMiOficio', image_url: ''
};

const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blog_posts').select('*').order('updated_at', { ascending: false });
    if (error) setNotice({ type: 'error', text: error.message });
    else setPosts((data || []) as BlogPostRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const counts = useMemo(() => ({
    published: posts.filter(post => post.status === 'published').length,
    drafts: posts.filter(post => post.status === 'draft').length
  }), [posts]);

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm(current => ({
      ...current,
      [field]: value,
      ...(field === 'title' && !editingId ? { slug: slugifyBlogTitle(value) } : {})
    }));
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setNotice({ type: 'error', text: 'Usa una imagen JPG, PNG, WEBP o GIF.' }); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'La imagen debe pesar menos de 5 MB.' }); return;
    }
    setUploading(true); setNotice(null);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file, { contentType: file.type, upsert: false });
    if (error) setNotice({ type: 'error', text: error.message });
    else {
      const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
      updateField('image_url', data.publicUrl);
      setNotice({ type: 'success', text: 'Portada cargada correctamente.' });
    }
    setUploading(false);
  };

  const savePost = async (status: BlogStatus) => {
    setNotice(null);
    if (form.title.trim().length < 5 || form.excerpt.trim().length < 20 || form.content.trim().length < 50 || !form.image_url) {
      setNotice({ type: 'error', text: 'Completa título, resumen (20+), contenido (50+) y portada.' }); return;
    }
    const slug = slugifyBlogTitle(form.slug || form.title);
    if (!slug) { setNotice({ type: 'error', text: 'La URL del artículo no es válida.' }); return; }
    setSaving(true);
    const payload = { ...form, slug, status, published_at: status === 'published' ? new Date().toISOString() : null };
    const query = editingId
      ? supabase.from('blog_posts').update(payload).eq('id', editingId)
      : supabase.from('blog_posts').insert(payload);
    const { error } = await query;
    if (error) setNotice({ type: 'error', text: error.code === '23505' ? 'Ya existe un artículo con esa URL.' : error.message });
    else {
      setNotice({ type: 'success', text: status === 'published' ? 'Artículo publicado en el blog.' : 'Borrador guardado.' });
      setForm(EMPTY_FORM); setEditingId(null); await loadPosts();
    }
    setSaving(false);
  };

  const editPost = (post: BlogPostRecord) => {
    setEditingId(post.id);
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, author: post.author, image_url: post.image_url });
    setNotice(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeStatus = async (post: BlogPostRecord) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('blog_posts').update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).eq('id', post.id);
    if (error) setNotice({ type: 'error', text: error.message }); else await loadPosts();
  };

  const deletePost = async (post: BlogPostRecord) => {
    if (!window.confirm(`¿Eliminar definitivamente “${post.title}”?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) setNotice({ type: 'error', text: error.message }); else await loadPosts();
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-surface via-surface to-primary/10">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_280px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[.24em] text-primary">Mesa editorial</span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Publica historias que generen confianza</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">Crea guías, consejos y noticias. Los borradores permanecen privados; al publicar aparecen de inmediato en el blog.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4"><b className="block text-2xl text-white">{counts.published}</b><span className="text-xs text-gray-500">Publicados</span></div>
            <div className="rounded-2xl border border-border bg-background/60 p-4"><b className="block text-2xl text-white">{counts.drafts}</b><span className="text-xs text-gray-500">Borradores</span></div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><h3 className="text-xl font-black text-white">{editingId ? 'Editar publicación' : 'Nueva publicación'}</h3><p className="text-sm text-gray-500">El texto admite párrafos separados por líneas en blanco.</p></div>
          {editingId && <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="text-sm font-bold text-gray-400 hover:text-white">Cancelar</button>}
        </div>
        {notice && <div className={`mb-5 rounded-xl border p-3 text-sm font-bold ${notice.type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-green-500/30 bg-green-500/10 text-green-300'}`}>{notice.text}</div>}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Field label="Título"><input value={form.title} onChange={e => updateField('title', e.target.value)} maxLength={180} className="admin-blog-input" placeholder="Ej. Cómo preparar tu casa para temporada de lluvias" /></Field>
            <Field label="Resumen"><textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} maxLength={320} rows={3} className="admin-blog-input resize-none" placeholder="Una introducción breve para la tarjeta del blog..." /></Field>
            <Field label="Contenido"><textarea value={form.content} onChange={e => updateField('content', e.target.value)} maxLength={30000} rows={14} className="admin-blog-input resize-y font-mono text-sm" placeholder={'Escribe el artículo completo.\n\nSepara cada párrafo con una línea en blanco.'} /></Field>
          </div>
          <aside className="space-y-4">
            <Field label="Portada">
              <label className="group block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-background/50">
                {form.image_url ? <img src={form.image_url} alt="Vista previa de portada" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] flex-col items-center justify-center p-6 text-center"><span className="material-symbols-outlined text-4xl text-primary">add_photo_alternate</span><b className="mt-2 text-sm text-white">Subir imagen</b><span className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP o GIF · máximo 5 MB</span></div>}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={e => uploadImage(e.target.files?.[0])} />
              </label>
              {uploading && <p className="mt-2 text-xs font-bold text-primary">Cargando portada...</p>}
            </Field>
            <Field label="Categoría"><input value={form.category} onChange={e => updateField('category', e.target.value)} maxLength={60} className="admin-blog-input" /></Field>
            <Field label="Autor"><input value={form.author} onChange={e => updateField('author', e.target.value)} maxLength={100} className="admin-blog-input" /></Field>
            <Field label="URL"><input value={form.slug} onChange={e => updateField('slug', e.target.value)} maxLength={120} className="admin-blog-input font-mono text-xs" /></Field>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button disabled={saving || uploading} onClick={() => savePost('draft')} className="min-h-12 rounded-xl border border-border bg-surface-light px-4 text-sm font-black text-gray-300 hover:text-white disabled:opacity-50">Borrador</button>
              <button disabled={saving || uploading} onClick={() => savePost('published')} className="min-h-12 rounded-xl bg-primary px-4 text-sm font-black text-background hover:bg-primary-hover disabled:opacity-50">{saving ? 'Guardando...' : 'Publicar'}</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <h3 className="text-xl font-black text-white">Publicaciones</h3>
        <div className="mt-5 space-y-3">
          {loading ? <p className="py-8 text-center text-gray-500">Cargando publicaciones...</p> : posts.length === 0 ? <p className="py-8 text-center text-gray-500">Todavía no hay publicaciones administrables.</p> : posts.map(post => (
            <article key={post.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center">
              <img src={post.image_url} alt="" className="h-24 w-full rounded-xl object-cover sm:w-32" />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${post.status === 'published' ? 'bg-green-500/15 text-green-300' : 'bg-yellow-500/15 text-yellow-300'}`}>{post.status === 'published' ? 'Publicado' : 'Borrador'}</span><span className="px-2 py-1 text-[10px] font-bold text-gray-500">{formatBlogDate(post.published_at || post.updated_at)}</span></div><h4 className="mt-2 truncate font-bold text-white">{post.title}</h4><p className="truncate text-xs text-gray-500">/blog/{post.slug}</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => editPost(post)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-gray-300">Editar</button><button onClick={() => changeStatus(post)} className="rounded-lg border border-primary/30 px-3 py-2 text-xs font-bold text-primary">{post.status === 'published' ? 'Despublicar' : 'Publicar'}</button><button onClick={() => deletePost(post)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300">Eliminar</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>{children}</label>;

export default BlogAdmin;
