'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAlertSettings } from '@/lib/crm/actions';
import type { AlertSetting } from '@/lib/crm/types';

interface AlertSettingsClientProps {
  initialSettings: AlertSetting[];
}

// Iconos para cada tipo de alerta
const ALERT_ICONS: Record<string, React.ReactNode> = {
  no_contact_hours: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quotation_no_response_days: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  stalled_days: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Colores para cada tipo de alerta
const ALERT_COLORS: Record<string, string> = {
  no_contact_hours: 'bg-red-100 text-red-600 border-red-200',
  quotation_no_response_days: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  stalled_days: 'bg-purple-100 text-purple-600 border-purple-200',
};

export default function AlertSettingsClient({ initialSettings }: AlertSettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleValueChange = (id: string, value: number) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleToggleEnabled = (id: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, is_enabled: !s.is_enabled } : s)));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveMessage(null);

    const result = await updateAlertSettings(
      settings.map((s) => ({
        id: s.id,
        value: s.value,
        is_enabled: s.is_enabled,
      }))
    );

    if (result.success) {
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Configuracion guardada correctamente' });
      router.refresh();
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Error al guardar' });
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
    setSaveMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Como funcionan las alertas</h3>
            <p className="text-sm text-blue-700 mt-1">
              Las alertas se disparan automaticamente cuando un lead cumple las condiciones de tiempo configuradas.
              Puedes deshabilitar una alerta si no deseas que se muestre.
            </p>
          </div>
        </div>
      </div>

      {/* Settings cards */}
      <div className="grid gap-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className={`bg-white rounded-lg border-2 p-6 transition-all ${
              setting.is_enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Icon and info */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg border ${
                    ALERT_COLORS[setting.setting_key] || 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {ALERT_ICONS[setting.setting_key] || (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{setting.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                </div>
              </div>

              {/* Right: Toggle */}
              <button
                type="button"
                onClick={() => handleToggleEnabled(setting.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.is_enabled ? 'bg-[#DC2626]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    setting.is_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Value input */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-gray-600">Disparar alerta despues de:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={setting.value}
                  onChange={(e) => handleValueChange(setting.id, parseInt(e.target.value) || 1)}
                  disabled={!setting.is_enabled}
                  className={`w-20 px-3 py-2 border rounded-lg text-center font-medium ${
                    setting.is_enabled
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626]'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
                <span className="text-sm text-gray-600 font-medium">
                  {setting.unit === 'hours' ? 'horas' : 'dias'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note about overdue_activity */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900">Nota: Actividades vencidas</h3>
            <p className="text-sm text-gray-600 mt-1">
              La alerta de <strong>&quot;Actividad vencida&quot;</strong> se dispara automaticamente cuando una actividad
              tiene fecha de vencimiento pasada. Esta alerta no tiene tiempo configurable ya que depende
              directamente de la fecha establecida en cada actividad.
            </p>
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges || isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Descartar cambios
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSubmitting}
          className="px-6 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
