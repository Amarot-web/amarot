'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ClientActionsProps {
  clientId: string;
  clientName: string;
}

export default function ClientActions({ clientId, clientName }: ClientActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasQuotations, setHasQuotations] = useState<boolean | null>(null);

  const checkQuotations = async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);

    setHasQuotations((count || 0) > 0);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase.from('clients').delete().eq('id', clientId);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      setIsDeleting(false);
      return;
    }

    setShowConfirm(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {/* Ver */}
        <Link
          href={`/clientes/${clientId}`}
          className="p-2 text-gray-500 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
          title="Ver cliente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </Link>

        {/* Editar */}
        <Link
          href={`/clientes/${clientId}/editar`}
          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Editar cliente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>

        {/* Borrar */}
        <button
          onClick={checkQuotations}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar cliente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 mx-4" style={{ width: '400px', maxWidth: 'calc(100vw - 2rem)' }}>
            <div className="text-center mb-4">
              <div className={`w-12 h-12 ${hasQuotations ? 'bg-amber-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 ${hasQuotations ? 'text-amber-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Eliminar cliente</h3>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
            </div>
            <p className="text-gray-600 mb-6 text-sm text-center" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
              {hasQuotations ? (
                <>
                  <strong className="text-amber-600">Advertencia:</strong> El cliente &quot;{clientName}&quot; tiene cotizaciones asociadas. Al eliminarlo, las cotizaciones quedarán sin cliente asignado.
                </>
              ) : (
                <>¿Estás seguro de que deseas eliminar al cliente &quot;{clientName}&quot;?</>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
