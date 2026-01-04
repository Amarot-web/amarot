'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { winLeadWithClient, searchMatchingClients } from '@/lib/crm/actions';
import type { Lead, ClientBasic } from '@/lib/crm/types';
import { toast } from 'sonner';

interface WinLeadModalProps {
  lead: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

type ActionType = 'create' | 'link' | 'none';

export default function WinLeadModal({
  lead,
  onSuccess,
  onCancel,
}: WinLeadModalProps) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>('create');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingClients, setMatchingClients] = useState<ClientBasic[]>([]);
  const [allClients, setAllClients] = useState<ClientBasic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar clientes coincidentes al abrir el modal
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const result = await searchMatchingClients(
          lead.email || undefined,
          lead.company
        );
        setMatchingClients(result.matches);
        setAllClients(result.all);

        // Si hay coincidencias, pre-seleccionar "vincular"
        if (result.matches.length > 0) {
          setAction('link');
          setSelectedClientId(result.matches[0].id);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [lead.email, lead.company]);

  const handleSubmit = async () => {
    if (action === 'link' && !selectedClientId) {
      toast.error('Selecciona un cliente para vincular');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await winLeadWithClient(lead.id, action, selectedClientId || undefined);

      if (result.success) {
        const messages: Record<ActionType, string> = {
          create: 'Lead ganado y cliente creado',
          link: 'Lead ganado y vinculado a cliente',
          none: 'Lead marcado como ganado',
        };
        toast.success(messages[action]);
        onSuccess();
        router.refresh();
      } else {
        toast.error(result.error || 'Error al procesar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar clientes por búsqueda
  const filteredClients = searchQuery
    ? allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ruc?.includes(searchQuery)
      )
    : allClients;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Marcar como Ganado
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {lead.company} - {lead.code}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-[#DC2626]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lead info summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Empresa:</span>{' '}
                    <span className="font-medium">{lead.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contacto:</span>{' '}
                    <span className="font-medium">{lead.contactName}</span>
                  </div>
                  {lead.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div>
                      <span className="text-gray-500">Tel:</span>{' '}
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Matching clients alert */}
              {matchingClients.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <p className="text-yellow-800">
                    <span className="font-medium">
                      Se encontró {matchingClients.length === 1 ? 'un cliente' : `${matchingClients.length} clientes`} con información similar.
                    </span>
                  </p>
                </div>
              )}

              {/* Action options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Vincular a cliente:
                </h4>

                {/* Option: Create new client */}
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    action === 'create'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="winAction"
                    value="create"
                    checked={action === 'create'}
                    onChange={() => setAction('create')}
                    className="mt-0.5 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Crear cliente nuevo</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Se creará un cliente con los datos del lead
                    </p>
                  </div>
                </label>

                {/* Option: Link to existing */}
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    action === 'link'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="winAction"
                    value="link"
                    checked={action === 'link'}
                    onChange={() => setAction('link')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Vincular a cliente existente</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Selecciona un cliente de la lista
                    </p>
                  </div>
                </label>

                {/* Client selector (visible when 'link' is selected) */}
                {action === 'link' && (
                  <div className="ml-6 space-y-2">
                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Client list */}
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredClients.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No se encontraron clientes
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <label
                            key={client.id}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                              selectedClientId === client.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="clientId"
                              value={client.id}
                              checked={selectedClientId === client.id}
                              onChange={(e) => setSelectedClientId(e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {client.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {client.ruc || client.email || 'Sin RUC/Email'}
                              </div>
                            </div>
                            {matchingClients.some((m) => m.id === client.id) && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                Coincide
                              </span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Option: Don't link */}
                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    action === 'none'
                      ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="winAction"
                    value="none"
                    checked={action === 'none'}
                    onChange={() => setAction('none')}
                    className="mt-0.5 text-gray-600 focus:ring-gray-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">No vincular</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Solo marcar como ganado, sin crear ni vincular cliente
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || (action === 'link' && !selectedClientId)}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marcar Ganado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
