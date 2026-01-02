import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';
import { preparePostUpdateData, updatePostTags } from '@/lib/blog/helpers';

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

    // Preparar datos usando helper centralizado
    const updateData = preparePostUpdateData(data);

    // Manejo especial de publish_at: si se publica sin fecha, usar ahora
    if (data.status === 'published' && !data.publishAt) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('publish_at')
        .eq('id', id)
        .single();

      if (!existingPost?.publish_at) {
        updateData.publish_at = new Date().toISOString();
      }
    }

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
      await updatePostTags(supabase, id, data.tagIds);
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
