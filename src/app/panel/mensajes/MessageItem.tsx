'use client';

import { useState } from 'react';
import { updateMessageStatus, deleteMessage } from '@/lib/contact/actions';
import ConvertMessageModal from '@/components/crm/ConvertMessageModal';
import Link from 'next/link';

interface Message {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service_type: string | null;
  location: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'spam' | 'converted';
  lead_id: string | null;
  lead_code?: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  fullName: string;
}

interface MessageItemProps {
  message: Message;
  teamMembers: TeamMember[];
  serviceTypeLabels: Record<string, string>;
  statusLabels: Record<string, { label: string; color: string }>;
}

export default function MessageItem({
  message,
  teamMembers,
  serviceTypeLabels,
  statusLabels,
}: MessageItemProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const handleStatusChange = async (status: 'new' | 'read' | 'replied' | 'spam') => {
    setLoading(true);
    await updateMessageStatus(message.id, status);
    setLoading(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;
    setLoading(true);
    await deleteMessage(message.id);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isConverted = message.status === 'converted' || message.lead_id;

  return (
    <>
      <div
        className={`p-6 hover:bg-gray-50 transition-colors ${
          message.status === 'new' ? 'bg-blue-50/50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">
                {message.name}
                {message.company && (
                  <span className="font-normal text-gray-500"> — {message.company}</span>
                )}
              </h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  statusLabels[message.status]?.color || 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusLabels[message.status]?.label || message.status}
              </span>
              {message.service_type && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#DC2626] text-white">
                  {serviceTypeLabels[message.service_type] || message.service_type}
                </span>
              )}
            </div>

            {/* Indicador prominente de conversión */}
            {isConverted && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-800 font-medium">
                  Convertido a Lead
                </span>
                {message.lead_id && (
                  <Link
                    href={`/panel/crm/leads/${message.lead_id}`}
                    className="ml-auto px-2 py-0.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    {message.lead_code ? `Ver ${message.lead_code}` : 'Ver Lead'} →
                  </Link>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <a href={`mailto:${message.email}`} className="hover:text-[#1E3A8A]">
                {message.email}
              </a>
              {message.phone && (
                <a href={`tel:${message.phone}`} className="hover:text-[#1E3A8A]">
                  {message.phone}
                </a>
              )}
              {message.location && (
                <span className="text-gray-400">📍 {message.location}</span>
              )}
            </div>

            <p className="text-gray-600 line-clamp-2">{message.message}</p>

            <p className="text-xs text-gray-400 mt-3">{formatDate(message.created_at)}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Convertir a Lead */}
            {!isConverted && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-3 py-1.5 text-sm bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Lead
              </button>
            )}

            {/* Menú de acciones */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                )}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {message.status !== 'read' && (
                      <button
                        onClick={() => handleStatusChange('read')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Marcar como leído
                      </button>
                    )}

                    {message.status !== 'replied' && (
                      <button
                        onClick={() => handleStatusChange('replied')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Marcar como respondido
                      </button>
                    )}

                    {message.status !== 'new' && (
                      <button
                        onClick={() => handleStatusChange('new')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Marcar como nuevo
                      </button>
                    )}

                    {message.status !== 'spam' && (
                      <button
                        onClick={() => handleStatusChange('spam')}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Marcar como spam
                      </button>
                    )}

                    <hr className="my-1" />

                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de conversión */}
      {showConvertModal && (
        <ConvertMessageModal
          message={message}
          teamMembers={teamMembers}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </>
  );
}
