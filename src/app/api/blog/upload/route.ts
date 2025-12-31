import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';

// Límites de tamaño por tipo de imagen
const SIZE_LIMITS = {
  cover: 200 * 1024,    // 200KB para imágenes de portada
  content: 2 * 1024 * 1024, // 2MB para imágenes del contenido
  default: 10 * 1024 * 1024, // 10MB general
};

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const imageType = (formData.get('type') as string) || 'default';

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
  }

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF, WebP o AVIF' },
      { status: 400 }
    );
  }

  // Validar tamaño según tipo de imagen
  const maxSize = SIZE_LIMITS[imageType as keyof typeof SIZE_LIMITS] || SIZE_LIMITS.default;
  const maxSizeKB = Math.round(maxSize / 1024);

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `El archivo es muy grande. Máximo ${maxSizeKB}KB para este tipo de imagen` },
      { status: 400 }
    );
  }

  // Generar nombre único
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `blog/${timestamp}-${randomSuffix}.${extension}`;

  const supabase = createAdminClient();

  // Subir a Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('[upload] Error:', uploadError);
    return NextResponse.json(
      { error: 'Error al subir la imagen: ' + uploadError.message },
      { status: 500 }
    );
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
