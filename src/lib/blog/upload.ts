"use client"

export type ImageUploadType = 'cover' | 'content' | 'default';

// Límites de tamaño (deben coincidir con el API)
export const IMAGE_SIZE_LIMITS = {
  cover: 200 * 1024,    // 200KB
  content: 2 * 1024 * 1024, // 2MB
  default: 10 * 1024 * 1024, // 10MB
};

// Dimensiones recomendadas
export const IMAGE_RECOMMENDATIONS = {
  cover: {
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Óptimo para redes sociales (Open Graph)',
  },
  content: {
    width: 1200,
    height: 800,
    aspectRatio: '3:2',
    description: 'Buena calidad para contenido del blog',
  },
};

/**
 * Sube una imagen al bucket de Supabase Storage via API route
 * @param file - Archivo a subir
 * @param type - Tipo de imagen (cover, content, default)
 * @returns URL pública de la imagen
 */
export async function uploadBlogImage(file: File, type: ImageUploadType = 'default'): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", type)

  const response = await fetch("/api/blog/upload", {
    method: "POST",
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Error al subir imagen")
  }

  const url = data.url

  if (!url || typeof url !== 'string') {
    throw new Error("El servidor no retornó una URL válida")
  }

  return url
}

/**
 * Valida una imagen antes de subirla (client-side)
 * @returns null si es válida, o mensaje de error
 */
export function validateImage(
  file: File,
  type: ImageUploadType = 'default'
): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

  if (!validTypes.includes(file.type)) {
    return 'Formato no válido. Usa JPEG, PNG, WebP o AVIF';
  }

  const maxSize = IMAGE_SIZE_LIMITS[type];
  if (file.size > maxSize) {
    const maxKB = Math.round(maxSize / 1024);
    const currentKB = Math.round(file.size / 1024);
    return `Imagen muy grande (${currentKB}KB). Máximo: ${maxKB}KB`;
  }

  return null;
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('No se pudo leer la imagen'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
