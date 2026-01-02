'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deletePost, updatePostStatus } from '@/lib/blog/actions';
import type { PostStatus } from '@/types/blog';

interface Props {
  postId: string;
  status: PostStatus;
}

export default function BlogPostActions({ postId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusChange = async (newStatus: PostStatus) => {
    setLoading(true);
    const result = await updatePostStatus(postId, newStatus);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error || 'Error al cambiar estado');
    }
    setLoading(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }
    setLoading(true);
    const result = await deletePost(postId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error || 'Error al eliminar');
    }
    setLoading(false);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="Más acciones"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showMenu && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {status !== 'published' && (
              <button
                onClick={() => handleStatusChange('published')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Publicar
              </button>
            )}
            {status !== 'draft' && (
              <button
                onClick={() => handleStatusChange('draft')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Mover a borrador
              </button>
            )}
            {status !== 'archived' && (
              <button
                onClick={() => handleStatusChange('archived')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Archivar
              </button>
            )}
            <hr className="my-1" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
