import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import { generateSlug } from '@/types/blog';
import { revalidatePath } from 'next/cache';

// Regex para validar UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * PATCH /api/blog/posts/[id] - Actualizar post existente
 * Usa JSON.parse manual para preservar attrs anidados de TipTap
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  // Validar que el ID sea un UUID válido
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Parsear body manualmente para preservar attrs anidados de TipTap
    const text = await request.text();
    const data = JSON.parse(text);
    const supabase = createAdminClient();

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
      if (!data.slug) {
        updateData.slug = generateSlug(data.title);
      }
    }
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.content !== undefined) updateData.content = data.content || null;
    if (data.featuredImage !== undefined) updateData.featured_image = data.featuredImage || null;
    if (data.status !== undefined) updateData.status = data.status;

    // Manejo de publish_at: si se publica sin fecha, usar ahora
    if (data.publishAt !== undefined && data.publishAt) {
      updateData.publish_at = data.publishAt;
    } else if (data.status === 'published') {
      // Verificar si necesitamos setear publish_at
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('publish_at')
        .eq('id', id)
        .single();

      if (!existingPost?.publish_at) {
        updateData.publish_at = new Date().toISOString();
      }
    }

    if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle || null;
    if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription || null;
    if (data.ogImageUrl !== undefined) updateData.og_image_url = data.ogImageUrl || null;
    if (data.canonicalUrl !== undefined) updateData.canonical_url = data.canonicalUrl || null;
    if (data.noindex !== undefined) updateData.noindex = data.noindex;

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('[API Posts Update] Error:', error.code, error.message);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un post con ese slug' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Error al actualizar el post' },
        { status: 500 }
      );
    }

    // Actualizar tags si se proporcionan
    if (data.tagIds !== undefined) {
      // Eliminar tags actuales
      await supabase.from('blog_post_tags').delete().eq('post_id', id);

      // Insertar nuevos tags
      if (data.tagIds.length > 0) {
        await supabase.from('blog_post_tags').insert(
          data.tagIds.map((tagId: string) => ({
            post_id: id,
            tag_id: tagId,
          }))
        );
      }
    }

    revalidatePath('/panel/blog');
    revalidatePath('/blog');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Posts Update] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
