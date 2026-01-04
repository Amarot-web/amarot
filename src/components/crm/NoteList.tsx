'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNote, deleteNote } from '@/lib/crm/actions';
import type { LeadNote } from '@/lib/crm/types';

interface NoteListProps {
  leadId: string;
  notes: LeadNote[];
}

export default function NoteList({ leadId, notes }: NoteListProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('content', content);

    const result = await createNote(leadId, formData);
    if (result.success) {
      setContent('');
      router.refresh();
    } else {
      alert(result.error || 'Error al crear nota');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    const result = await deleteNote(noteId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notas</h3>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Agregar una nota..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] focus:border-transparent resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Agregar Nota'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No hay notas registradas
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {note.author?.avatarUrl ? (
                    <img
                      src={note.author.avatarUrl}
                      alt={note.author.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {note.author?.fullName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2) || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {note.author?.fullName || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
