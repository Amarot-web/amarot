'use client';

import { useState, useRef, useCallback } from 'react';
import {
  uploadBlogImage,
  validateImage,
  getImageDimensions,
  IMAGE_SIZE_LIMITS,
  IMAGE_RECOMMENDATIONS,
} from '@/lib/blog/upload';

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function CoverImageUploader({ value, onChange, disabled }: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeKB = Math.round(IMAGE_SIZE_LIMITS.cover / 1024);
  const recommended = IMAGE_RECOMMENDATIONS.cover;

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validar antes de subir
    const validationError = validateImage(file, 'cover');
    if (validationError) {
      setError(validationError);
      return;
    }

    // Obtener dimensiones
    try {
      const dimensions = await getImageDimensions(file);
      setImageInfo({
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
      });

      // Advertencia si las dimensiones no son óptimas
      if (dimensions.width < recommended.width || dimensions.height < recommended.height) {
        console.warn(
          `Dimensiones (${dimensions.width}x${dimensions.height}) menores a las recomendadas (${recommended.width}x${recommended.height})`
        );
      }
    } catch {
      // Continuar aunque no se puedan leer las dimensiones
    }

    // Subir imagen
    setUploading(true);
    try {
      const url = await uploadBlogImage(file, 'cover');
      onChange(url);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }, [onChange, recommended]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setImageInfo(null);
    setError(null);
  };

  const getDimensionStatus = () => {
    if (!imageInfo) return null;
    const isOptimal = imageInfo.width >= recommended.width && imageInfo.height >= recommended.height;
    return isOptimal ? 'optimal' : 'warning';
  };

  return (
    <div className="space-y-3">
      {/* Recomendaciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-800">Recomendaciones para imagen de portada</p>
            <ul className="mt-1 text-blue-700 space-y-0.5">
              <li>• Dimensiones: <span className="font-mono">{recommended.width}x{recommended.height}px</span> ({recommended.aspectRatio})</li>
              <li>• Tamaño máximo: <span className="font-mono">{maxSizeKB}KB</span></li>
              <li>• Formatos: JPEG, PNG, WebP, AVIF</li>
              <li className="text-blue-600 text-xs">{recommended.description}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview o Dropzone */}
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Imagen de portada"
            className="w-full h-48 object-cover"
          />
          {/* Info overlay */}
          {imageInfo && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-2 flex justify-between items-center">
              <span className={`flex items-center gap-1 ${getDimensionStatus() === 'optimal' ? 'text-green-400' : 'text-yellow-400'}`}>
                {getDimensionStatus() === 'optimal' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {imageInfo.width}x{imageInfo.height}px
              </span>
              <span>{Math.round(imageInfo.size / 1024)}KB</span>
            </div>
          )}
          {/* Actions */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg shadow transition-colors"
              title="Cambiar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg shadow transition-colors"
              title="Eliminar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-[#1E3A8A] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-600">Subiendo imagen...</span>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-[#1E3A8A]">Haz clic para subir</span> o arrastra una imagen
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP o AVIF (máx. {maxSizeKB}KB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
}

export default CoverImageUploader;
