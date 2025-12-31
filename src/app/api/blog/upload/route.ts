import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth/permissions';
import { IMAGE_SIZE_LIMITS } from '@/lib/blog/upload';

/**
 * Valida el tipo real del archivo usando magic bytes
 */
async function validateImageMagicBytes(file: File): Promise<string | null> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Verificar JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // Verificar PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }

  // Verificar GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }

  // Verificar WebP (RIFF....WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // Verificar AVIF (....ftypavif o ....ftypmif1)
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    // Es un formato ISO base media file, podría ser AVIF
    return 'image/avif';
  }

  return null; // Tipo no reconocido
}

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

  // Validar tipo real del archivo usando magic bytes (no confiar en file.type del cliente)
  const realMimeType = await validateImageMagicBytes(file);
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

  if (!realMimeType || !validTypes.includes(realMimeType)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF, WebP o AVIF' },
      { status: 400 }
    );
  }

  // Validar tamaño según tipo de imagen
  const maxSize = IMAGE_SIZE_LIMITS[imageType as keyof typeof IMAGE_SIZE_LIMITS] || IMAGE_SIZE_LIMITS.default;
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

  // Subir a Supabase Storage usando el tipo MIME real validado
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      contentType: realMimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('[upload] Error:', uploadError.message);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
