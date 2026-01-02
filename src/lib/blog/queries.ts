// Queries para el Blog de AMAROT

import { createClient, createAdminClient } from '@/lib/supabase/server';
import type {
  BlogPost,
  BlogTag,
  DbBlogPost,
  DbBlogTag,
  BlogPostQueryOptions,
  BlogPostsResponse,
  TipTapContent,
} from '@/types/blog';

/**
 * Sanitiza input de búsqueda para prevenir inyección en queries
 * Escapa caracteres especiales de PostgREST
 */
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_\\]/g, '\\$&') // Escapar wildcards de LIKE
    .replace(/[(),.'":]/g, '') // Remover caracteres peligrosos para PostgREST
    .trim()
    .slice(0, 100); // Limitar longitud
}

// ========================================
// POSTS - Público
// ========================================

/**
 * Obtiene posts publicados para el frontend
 */
export async function getPublishedPosts(
  options: BlogPostQueryOptions = {}
): Promise<BlogPostsResponse> {
  const supabase = await createClient();
  const { page = 1, limit = 10, search } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blog_posts')
    .select(
      `
      *,
      tags:blog_post_tags(
        tag:blog_tags(*)
      ),
      author:user_profiles(id, full_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .lte('publish_at', new Date().toISOString())
    .order('publish_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const sanitized = sanitizeSearchInput(search);
    if (sanitized) {
      query = query.or(
        `title.ilike.%${sanitized}%,excerpt.ilike.%${sanitized}%`
      );
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[getPublishedPosts] Error:', error.code);
    return { posts: [], total: 0, page, limit, totalPages: 0 };
  }

  const posts = transformPosts(data || []);
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { posts, total, page, limit, totalPages };
}

/**
 * Obtiene un post por slug (público)
 * @param preview - Si es true, no verifica status ni fecha de publicación
 */
export async function getPostBySlug(slug: string, preview = false): Promise<BlogPost | null> {
  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select(
      `
      *,
      tags:blog_post_tags(
        tag:blog_tags(*)
      ),
      author:user_profiles(id, full_name, avatar_url)
    `
    )
    .eq('slug', slug);

  // En modo preview no verificamos status ni fecha
  if (!preview) {
    query = query
      .eq('status', 'published')
      .lte('publish_at', new Date().toISOString());
  }

  const { data, error } = await query.single();

  if (error || !data) return null;

  return transformPost(data);
}

/**
 * Obtiene posts por tag
 */
export async function getPostsByTag(
  tagSlug: string,
  options: BlogPostQueryOptions = {}
): Promise<BlogPostsResponse> {
  const supabase = await createClient();
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  // Obtener IDs de posts con este tag
  const { data: postTags, error: tagError } = await supabase
    .from('blog_post_tags')
    .select('post_id, blog_tags!inner(slug)')
    .eq('blog_tags.slug', tagSlug);

  if (tagError || !postTags || postTags.length === 0) {
    return { posts: [], total: 0, page, limit, totalPages: 0 };
  }

  const ids = postTags.map((p) => p.post_id);

  const { data, count, error } = await supabase
    .from('blog_posts')
    .select(
      `
      *,
      tags:blog_post_tags(
        tag:blog_tags(*)
      ),
      author:user_profiles(id, full_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .in('id', ids)
    .eq('status', 'published')
    .lte('publish_at', new Date().toISOString())
    .order('publish_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getPostsByTag] Error:', error);
    return { posts: [], total: 0, page, limit, totalPages: 0 };
  }

  const posts = transformPosts(data || []);
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { posts, total, page, limit, totalPages };
}

/**
 * Obtiene posts anterior y siguiente
 * @param publishAt - Fecha de publicación del post actual (evita consulta extra)
 */
export async function getAdjacentPosts(
  publishAt: Date | null
): Promise<{
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
}> {
  if (!publishAt) return { prev: null, next: null };

  const supabase = await createClient();
  const publishAtISO = publishAt.toISOString();
  const now = new Date().toISOString();

  // Ejecutar ambas consultas en paralelo
  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('status', 'published')
      .lte('publish_at', now)
      .lt('publish_at', publishAtISO)
      .order('publish_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('status', 'published')
      .lte('publish_at', now)
      .gt('publish_at', publishAtISO)
      .order('publish_at', { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    prev: prevResult.data || null,
    next: nextResult.data || null,
  };
}

// ========================================
// TAGS - Público
// ========================================

/**
 * Obtiene todos los tags
 */
export async function getTags(): Promise<BlogTag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return (data || []).map(transformTag);
}

/**
 * Obtiene un tag por slug
 */
export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return transformTag(data);
}

// ========================================
// ADMIN - Requiere permisos
// ========================================

/**
 * Obtiene todos los posts para admin (incluye drafts)
 */
export async function getAdminPosts(
  options: BlogPostQueryOptions = {}
): Promise<BlogPostsResponse> {
  const supabase = createAdminClient();
  const { page = 1, limit = 20, status, search, orderBy = 'updated_at', orderDir = 'desc' } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blog_posts')
    .select(
      `
      *,
      tags:blog_post_tags(
        tag:blog_tags(*)
      ),
      author:user_profiles(id, full_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    const sanitized = sanitizeSearchInput(search);
    if (sanitized) {
      query = query.or(`title.ilike.%${sanitized}%`);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[getAdminPosts] Error:', error.code);
    return { posts: [], total: 0, page, limit, totalPages: 0 };
  }

  const posts = transformPosts(data || []);
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { posts, total, page, limit, totalPages };
}

/**
 * Obtiene un post por ID para admin
 */
export async function getAdminPostById(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      `
      *,
      tags:blog_post_tags(
        tag:blog_tags(*)
      ),
      author:user_profiles(id, full_name, avatar_url)
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return transformPost(data);
}

/**
 * Obtiene todos los tags para admin
 */
export async function getAdminTags(): Promise<BlogTag[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching admin tags:', error);
    return [];
  }

  return (data || []).map(transformTag);
}

// ========================================
// TRANSFORMERS
// ========================================

interface DbPostWithRelations extends DbBlogPost {
  tags?: Array<{ tag: DbBlogTag }>;
  author?: { id: string; full_name: string; avatar_url: string | null } | null;
}

function transformPost(data: DbPostWithRelations): BlogPost {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content as TipTapContent | null,
    featuredImage: data.featured_image,
    status: data.status,
    publishAt: data.publish_at ? new Date(data.publish_at) : null,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    ogImageUrl: data.og_image_url,
    canonicalUrl: data.canonical_url,
    noindex: data.noindex,
    authorId: data.author_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    tags: data.tags?.map((t) => transformTag(t.tag)).filter(Boolean) || [],
    author: data.author
      ? {
          id: data.author.id,
          fullName: data.author.full_name,
          avatarUrl: data.author.avatar_url,
        }
      : undefined,
  };
}

function transformPosts(data: DbPostWithRelations[]): BlogPost[] {
  return data.map(transformPost);
}

function transformTag(data: DbBlogTag): BlogTag {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    createdAt: new Date(data.created_at),
  };
}
