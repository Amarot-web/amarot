import { generateSlug as generateSlugFromTitle } from '@/types/blog';

/**
 * Regex para validar slug seguro (solo letras, números y guiones)
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Valida y sanitiza un slug
 * @returns slug sanitizado o null si es inválido
 */
export function validateSlug(slug: string | undefined): string | null {
  if (!slug) return null;

  const sanitized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // espacios a guiones
    .replace(/[^a-z0-9-]/g, '') // solo alfanuméricos y guiones
    .replace(/-+/g, '-')        // múltiples guiones a uno
    .replace(/^-|-$/g, '');     // quitar guiones al inicio/final

  if (!sanitized || !SLUG_REGEX.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Datos de entrada para preparar actualización de post
 * Acepta tanto camelCase (del cliente) como snake_case
 */
export interface PostUpdateInput {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: unknown;
  featuredImage?: string | null;
  featured_image?: string | null;
  status?: string;
  publishAt?: string | Date | null;
  publish_at?: string | null;
  metaTitle?: string | null;
  meta_title?: string | null;
  metaDescription?: string | null;
  meta_description?: string | null;
  ogImageUrl?: string | null;
  og_image_url?: string | null;
  canonicalUrl?: string | null;
  canonical_url?: string | null;
  noindex?: boolean;
  tagIds?: string[];
}

/**
 * Prepara los datos para actualizar un post en la base de datos
 * Convierte camelCase a snake_case y aplica validaciones
 */
export function preparePostUpdateData(
  input: PostUpdateInput
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Título y slug
  if (input.title !== undefined) {
    updateData.title = input.title;
    // Auto-generar slug si no se proporciona
    if (!input.slug) {
      updateData.slug = generateSlugFromTitle(input.title);
    }
  }

  if (input.slug !== undefined) {
    const validSlug = validateSlug(input.slug);
    if (validSlug) {
      updateData.slug = validSlug;
    }
  }

  // Contenido
  if (input.excerpt !== undefined) {
    updateData.excerpt = input.excerpt || null;
  }

  if (input.content !== undefined) {
    updateData.content = input.content || null;
  }

  // Imagen destacada (acepta ambos formatos)
  const featuredImage = input.featuredImage ?? input.featured_image;
  if (featuredImage !== undefined) {
    updateData.featured_image = featuredImage || null;
  }

  // Estado
  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  // Fecha de publicación (acepta ambos formatos)
  const publishAt = input.publishAt ?? input.publish_at;
  if (publishAt !== undefined && publishAt) {
    updateData.publish_at = typeof publishAt === 'string'
      ? publishAt
      : publishAt.toISOString();
  }

  // SEO - Meta título
  const metaTitle = input.metaTitle ?? input.meta_title;
  if (metaTitle !== undefined) {
    updateData.meta_title = metaTitle || null;
  }

  // SEO - Meta descripción
  const metaDescription = input.metaDescription ?? input.meta_description;
  if (metaDescription !== undefined) {
    updateData.meta_description = metaDescription || null;
  }

  // SEO - OG Image
  const ogImageUrl = input.ogImageUrl ?? input.og_image_url;
  if (ogImageUrl !== undefined) {
    updateData.og_image_url = ogImageUrl || null;
  }

  // SEO - Canonical URL
  const canonicalUrl = input.canonicalUrl ?? input.canonical_url;
  if (canonicalUrl !== undefined) {
    updateData.canonical_url = canonicalUrl || null;
  }

  // SEO - Noindex
  if (input.noindex !== undefined) {
    updateData.noindex = input.noindex;
  }

  return updateData;
}

/**
 * Actualiza los tags de un post
 */
export async function updatePostTags(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createAdminClient>,
  postId: string,
  tagIds: string[]
): Promise<void> {
  // Eliminar tags actuales
  await supabase.from('blog_post_tags').delete().eq('post_id', postId);

  // Insertar nuevos tags
  if (tagIds.length > 0) {
    await supabase.from('blog_post_tags').insert(
      tagIds.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      }))
    );
  }
}
