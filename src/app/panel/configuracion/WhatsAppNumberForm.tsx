'use client';
import { useState } from 'react';
import { updateWhatsAppNumber } from '@/lib/contact/actions';

export default function WhatsAppNumberForm({ initial }: { initial: string }) {
  const [phone, setPhone] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setLoading(true); setError(null); setOk(false);
    const r = await updateWhatsAppNumber(phone);
    if (r.success) { setOk(true); setTimeout(() => setOk(false), 3000); }
    else setError(r.error || 'Error al guardar');
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
      {ok && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">Número guardado</div>}
      <input
        type="tel" value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="987667280"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none"
      />
      <button onClick={save} disabled={loading}
        className="px-6 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar número'}
      </button>
    </div>
  );
}
