'use client';

import { useState } from 'react';
import { updateNotificationEmails } from '@/lib/contact/actions';

interface Props {
  initialEmails: string[];
}

export default function NotificationEmailsForm({ initialEmails }: Props) {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Email inválido');
      return;
    }

    if (emails.includes(newEmail.trim())) {
      setError('Este email ya está en la lista');
      return;
    }

    setEmails([...emails, newEmail.trim()]);
    setNewEmail('');
    setError(null);
    setSuccess(false);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emails.length <= 1) {
      setError('Debe haber al menos un email de notificación');
      return;
    }
    setEmails(emails.filter(e => e !== emailToRemove));
    setSuccess(false);
  };

  const handleSave = async () => {
    if (emails.length === 0) {
      setError('Debe haber al menos un email de notificación');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await updateNotificationEmails(emails);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Error al guardar');
    }

    setLoading(false);
  };

  const hasChanges = JSON.stringify(emails.sort()) !== JSON.stringify(initialEmails.sort());

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Cambios guardados
        </div>
      )}

      {/* Lista de emails */}
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-700">{email}</span>
            <button
              onClick={() => handleRemoveEmail(email)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Agregar nuevo email */}
      <div className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
          placeholder="nuevo@email.com"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none"
        />
        <button
          onClick={handleAddEmail}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Agregar
        </button>
      </div>

      {/* Botón guardar */}
      {hasChanges && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
