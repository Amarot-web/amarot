'use client';

import { useState, useEffect } from 'react';
import { useQuotationStore } from '@/stores/quotationStore';
import { createClient } from '@/lib/supabase/client';
import type { Client } from '@/types/database';
import { dbToClient } from '@/types/database';

export default function StepClient() {
  const {
    client,
    setClient,
    isNewClient,
    setIsNewClient,
    quotationType,
    setQuotationType,
    currency,
    setCurrency,
    durationDays,
    setDurationDays,
    nextStep,
  } = useQuotationStore();

  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  // Form para nuevo cliente
  const [newClient, setNewClient] = useState({
    companyName: '',
    ruc: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  // Cargar clientes
  useEffect(() => {
    const loadClients = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name');

      if (!error && data) {
        setClients(data.map(dbToClient));
      }
      setLoading(false);
    };
    loadClients();
  }, []);

  // Filtrar clientes
  const filteredClients = clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ruc && c.ruc.includes(searchTerm))
  );

  const handleSelectClient = (selectedClient: Client) => {
    setClient(selectedClient);
    setIsNewClient(false);
    setShowNewClientForm(false);
  };

  const handleCreateClient = async () => {
    if (!newClient.companyName || !newClient.contactName || !newClient.contactPhone) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_name: newClient.companyName.toUpperCase(),
        ruc: newClient.ruc || null,
        contact_name: newClient.contactName.toUpperCase(),
        contact_email: newClient.contactEmail?.toLowerCase() || null,
        contact_phone: newClient.contactPhone,
        address: newClient.address?.toUpperCase() || null,
      })
      .select()
      .single();

    if (error) {
      alert('Error al crear cliente: ' + error.message);
      return;
    }

    const createdClient = dbToClient(data);
    setClients([...clients, createdClient]);
    setClient(createdClient);
    setIsNewClient(true);
    setShowNewClientForm(false);
  };

  const canContinue = client !== null;

  return (
    <div className="space-y-6">
      {/* Configuración del proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Proyecto
          </label>
          <select
            value={quotationType}
            onChange={(e) => setQuotationType(e.target.value as 'small' | 'large')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          >
            <option value="small">Pequeño (simplificado)</option>
            <option value="large">Grande (detallado)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moneda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'PEN' | 'USD')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          >
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración (días)
          </label>
          <input
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Selector de cliente */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
          <button
            onClick={() => setShowNewClientForm(!showNewClientForm)}
            className="text-sm text-[#1E3A8A] hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showNewClientForm ? 'Buscar existente' : 'Nuevo cliente'}
          </button>
        </div>

        {showNewClientForm ? (
          /* Formulario nuevo cliente */
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                <input
                  type="text"
                  value={newClient.ruc}
                  onChange={(e) => setNewClient({ ...newClient, ruc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="20XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClient.contactName}
                  onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newClient.contactPhone}
                  onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="987 654 321"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.contactEmail}
                  onChange={(e) => setNewClient({ ...newClient, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Dirección de la empresa"
                />
              </div>
            </div>
            <button
              onClick={handleCreateClient}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Crear Cliente
            </button>
          </div>
        ) : (
          /* Búsqueda de cliente existente */
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, empresa o RUC..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando clientes...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron clientes
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      client?.id === c.id ? 'bg-[#1E3A8A]/10 border-l-4 border-[#1E3A8A]' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{c.companyName}</div>
                    <div className="text-sm text-gray-500">
                      {c.contactName} • {c.contactPhone}
                      {c.ruc && ` • RUC: ${c.ruc}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cliente seleccionado */}
        {client && !showNewClientForm && (
          <div className="mt-4 p-4 bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#1E3A8A] font-medium">Cliente seleccionado:</p>
                <p className="font-semibold text-gray-900">{client.companyName}</p>
                <p className="text-sm text-gray-600">
                  {client.contactName} • {client.contactPhone}
                </p>
              </div>
              <button
                onClick={() => setClient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón continuar */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
            ${
              canContinue
                ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continuar
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
