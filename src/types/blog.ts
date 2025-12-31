// Tipos para el Sistema de Blog AMAROT
// Basado en la implementación de tonior.xyz con TipTap

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

// ==================== BLOG MEDIA ====================

export interface BlogMedia {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  sizeBytes: number | null;
  mimeType: string | null;
  uploadedBy: string | null;
  createdAt: Date;
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

export interface DbBlogMedia {
  id: string;
  filename: string;
  url: string;
  alt_text: string | null;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ==================== CONVERSIONES ====================

export function dbBlogTagToBlogTag(db: DbBlogTag): BlogTag {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    createdAt: new Date(db.created_at),
  };
}

export function dbBlogPostToBlogPost(db: DbBlogPost): BlogPost {
  return {
    id: db.id,
    title: db.title,
    slug: db.slug,
    excerpt: db.excerpt,
    content: db.content,
    featuredImage: db.featured_image,
    status: db.status,
    publishAt: db.publish_at ? new Date(db.publish_at) : null,
    metaTitle: db.meta_title,
    metaDescription: db.meta_description,
    ogImageUrl: db.og_image_url,
    canonicalUrl: db.canonical_url,
    noindex: db.noindex,
    authorId: db.author_id,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function dbBlogMediaToBlogMedia(db: DbBlogMedia): BlogMedia {
  return {
    id: db.id,
    filename: db.filename,
    url: db.url,
    altText: db.alt_text,
    sizeBytes: db.size_bytes,
    mimeType: db.mime_type,
    uploadedBy: db.uploaded_by,
    createdAt: new Date(db.created_at),
  };
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
 * Extrae texto plano del contenido TipTap para excerpts
 */
export function extractTextFromTipTap(content: TipTapContent | null, maxLength = 160): string {
  if (!content || !content.content) return '';

  const extractText = (nodes: TipTapNode[]): string => {
    return nodes
      .map(node => {
        if (node.text) return node.text;
        if (node.content) return extractText(node.content);
        return '';
      })
      .join(' ');
  };

  const text = extractText(content.content).trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
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
