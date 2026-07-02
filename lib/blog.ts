import { supabase } from './supabaseClient';

export type BlogStatus = 'draft' | 'published';

export interface BlogPostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostView {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  content: string;
  publishedAt?: string | null;
  source?: 'database' | 'static';
}

export const formatBlogDate = (value: string | null | undefined) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
};

export const mapBlogPost = (post: BlogPostRecord): BlogPostView => ({
  id: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  author: post.author,
  date: formatBlogDate(post.published_at || post.created_at),
  category: post.category,
  imageUrl: post.image_url,
  content: post.content,
  publishedAt: post.published_at,
  source: 'database'
});

export const loadPublishedBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(post => mapBlogPost(post as BlogPostRecord));
};

export const loadPublishedBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data ? mapBlogPost(data as BlogPostRecord) : null;
};

export const slugifyBlogTitle = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);
