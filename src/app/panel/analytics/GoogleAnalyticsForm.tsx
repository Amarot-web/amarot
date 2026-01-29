'use client';

import { useState } from 'react';
import { updateGoogleAnalyticsId } from '@/lib/analytics/actions';

interface Props {
  initialId: string | null;
}

export default function GoogleAnalyticsForm({ initialId }: Props) {
  const [measurementId, setMeasurementId] = useState(initialId || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateGoogleAnalyticsId(measurementId.trim());

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Error al guardar');
    }

    setLoading(false);
  };

  const handleClear = async () => {
    setMeasurementId('');
    setLoading(true);
    setError(null);

    const result = await updateGoogleAnalyticsId('');

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Error al desactivar');
    }

    setLoading(false);
  };

  const hasChanges = measurementId !== (initialId || '');

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

      {/* Input del Measurement ID */}
      <div>
        <label htmlFor="ga-id" className="block text-sm font-medium text-gray-700 mb-2">
          Measurement ID
        </label>
        <div className="flex gap-2">
          <input
            id="ga-id"
            type="text"
            value={measurementId}
            onChange={(e) => setMeasurementId(e.target.value.toUpperCase())}
            placeholder="G-XXXXXXXXXX"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
          />
          {initialId && (
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors disabled:opacity-50"
              title="Desactivar Analytics"
            >
              Desactivar
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          El ID debe tener el formato G-XXXXXXXXXX
        </p>
      </div>

      {/* Botón guardar */}
      {hasChanges && measurementId && (
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
              'Guardar'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
