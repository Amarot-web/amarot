// Tipos para el Sistema de Blog AMAROT

// ==================== ENUMS ====================

export type PostStatus = 'draft' | 'published' | 'archived';

// ==================== TIPTAP CONTENT ====================

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapContent {
  type: 'doc';
  content: TipTapNode[];
}

// ==================== BLOG TAG ====================

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  // Campos calculados
  postCount?: number;
}

// ==================== BLOG POST ====================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: TipTapContent | null;
  featuredImage: string | null;
  status: PostStatus;
  publishAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  // Joins
  author?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  tags?: BlogTag[];
}

// ==================== TIPOS DE DATABASE (SUPABASE) ====================

export interface DbBlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface DbBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: TipTapContent | null;
  featured_image: string | null;
  status: PostStatus;
  publish_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  noindex: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbBlogPostTag {
  id: string;
  post_id: string;
  tag_id: string;
}

// ==================== FORM TYPES ====================

export interface BlogPostFormData {
  title: string;
  slug?: string;        // Auto-generado si no se proporciona
  excerpt?: string;
  content?: TipTapContent;
  featuredImage?: string;
  status: PostStatus;
  publishAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  tagIds?: string[];
}

export interface BlogTagFormData {
  name: string;
  slug?: string;        // Auto-generado si no se proporciona
}

// ==================== QUERY OPTIONS ====================

export interface BlogPostQueryOptions {
  page?: number;
  limit?: number;
  status?: PostStatus | 'all';
  tagSlug?: string;
  search?: string;
  orderBy?: 'created_at' | 'updated_at' | 'publish_at' | 'title';
  orderDir?: 'asc' | 'desc';
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== UTILIDADES ====================

/**
 * Genera un slug a partir de un título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')     // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-')              // Espacios a guiones
    .replace(/-+/g, '-')               // Múltiples guiones a uno
    .replace(/^-|-$/g, '');            // Quitar guiones al inicio/final
}

/**
 * Extrae texto plano del contenido TipTap
 * @param content - Contenido TipTap
 * @param maxLength - Longitud máxima (default: 160)
 * @param addEllipsis - Agregar '...' si se trunca (default: true)
 */
export function extractTextFromTipTap(
  content: TipTapContent | null,
  maxLength = 160,
  addEllipsis = true
): string {
  if (!content || !content.content) return '';

  const extractFromNode = (node: TipTapNode): string => {
    if (node.text) return node.text;
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join(' ');
    }
    return '';
  };

  const text = content.content
    .map(extractFromNode)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).trim();
  return addEllipsis ? truncated + '...' : truncated;
}

/**
 * Verifica si un post está publicado y visible
 */
export function isPostPublished(post: BlogPost): boolean {
  if (post.status !== 'published') return false;
  if (!post.publishAt) return true;
  return new Date(post.publishAt) <= new Date();
}

// ==================== STATUS LABELS ====================

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};
