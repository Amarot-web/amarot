'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import type { BlogPostFormData, BlogTagFormData, PostStatus, TipTapContent } from '@/types/blog';
import { generateSlug } from '@/types/blog';
import { preparePostUpdateData, updatePostTags } from './helpers';

// ========================================
// POSTS - Admin Actions
// ========================================

/**
 * Crea un nuevo post
 */
export async function createPost(
  formData: BlogPostFormData
): Promise<{ success: boolean; id?: string; slug?: string; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();
  const slug = formData.slug || generateSlug(formData.title);
  const status = formData.status || 'draft';

  // Si se publica sin fecha, usar fecha actual
  let publishAt: string | null = null;
  if (formData.publishAt) {
    publishAt = formData.publishAt.toISOString();
  } else if (status === 'published') {
    publishAt = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: formData.title,
      slug,
      excerpt: formData.excerpt || null,
      content: formData.content || null,
      featured_image: formData.featuredImage || null,
      status,
      publish_at: publishAt,
      meta_title: formData.metaTitle || null,
      meta_description: formData.metaDescription || null,
      og_image_url: formData.ogImageUrl || null,
      canonical_url: formData.canonicalUrl || null,
      noindex: formData.noindex || false,
      author_id: user.id,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createPost] Error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un post con ese slug' };
    }
    return { success: false, error: error.message };
  }

  // Asignar tags si hay
  if (formData.tagIds && formData.tagIds.length > 0) {
    await supabase.from('blog_post_tags').insert(
      formData.tagIds.map((tagId) => ({
        post_id: data.id,
        tag_id: tagId,
      }))
    );
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true, id: data.id, slug };
}

/**
 * Actualiza un post existente
 */
export async function updatePost(
  id: string,
  formData: Partial<BlogPostFormData>
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();

  // Preparar datos usando helper centralizado
  const updateData = preparePostUpdateData({
    ...formData,
    publishAt: formData.publishAt ?? undefined,
  });

  const { error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[updatePost] Error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un post con ese slug' };
    }
    return { success: false, error: 'Error al actualizar el post' };
  }

  // Actualizar tags si se proporcionan
  if (formData.tagIds !== undefined) {
    await updatePostTags(supabase, id, formData.tagIds);
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true };
}

/**
 * Elimina un post
 */
export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    console.error('[deletePost] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true };
}

/**
 * Cambia el estado de un post
 */
export async function updatePostStatus(
  id: string,
  status: PostStatus,
  publishAt?: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'published' && !publishAt) {
    updateData.publish_at = new Date().toISOString();
  } else if (publishAt) {
    updateData.publish_at = publishAt;
  }

  const { error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[updatePostStatus] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true };
}

// ========================================
// TAGS - Admin Actions
// ========================================

/**
 * Crea un nuevo tag
 */
export async function createTag(
  formData: BlogTagFormData
): Promise<{ success: boolean; id?: string; slug?: string; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();
  const slug = formData.slug || generateSlug(formData.name);

  const { data, error } = await supabase
    .from('blog_tags')
    .insert({
      name: formData.name,
      slug,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createTag] Error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un tag con ese nombre' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/blog');

  return { success: true, id: data.id, slug };
}

/**
 * Actualiza un tag
 */
export async function updateTag(
  id: string,
  formData: Partial<BlogTagFormData>
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (formData.name) {
    updateData.name = formData.name;
    updateData.slug = formData.slug || generateSlug(formData.name);
  }

  const { error } = await supabase
    .from('blog_tags')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[updateTag] Error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un tag con ese nombre' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true };
}

/**
 * Elimina un tag
 */
export async function deleteTag(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('blog_tags').delete().eq('id', id);

  if (error) {
    console.error('[deleteTag] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/panel/blog');
  revalidatePath('/blog');

  return { success: true };
}
