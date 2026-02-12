'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CONDITION_TEMPLATES,
  CONDITION_PRESETS,
  generateDefaultConditions,
  type ConditionBlock,
  type ConditionTemplate,
} from '@/lib/condition-templates';
import QuotationDocument, { type QuotationDocumentData } from './QuotationDocument';

// ============================================================================
// TYPES
// ============================================================================

interface CatalogItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  diameter?: string;
}

interface QuotationItem extends CatalogItem {
  quantity: number;
  subtotal: number;
}

interface Client {
  id: string;
  name: string;
  ruc?: string;
}

// ============================================================================
// CATALOG DATA
// ============================================================================

const CATEGORIES = [
  { id: 'perforation', name: 'Perforación', shortName: 'Perf.', color: '#DC2626', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', activeBg: 'bg-red-600' },
  { id: 'anchors', name: 'Anclajes', shortName: 'Ancl.', color: '#2563EB', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', activeBg: 'bg-blue-600' },
  { id: 'firestop', name: 'Cortafuego', shortName: 'Cortaf.', color: '#EA580C', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', activeBg: 'bg-orange-600' },
  { id: 'detection', name: 'Detección', shortName: 'Detect.', color: '#7C3AED', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', activeBg: 'bg-violet-600' },
  { id: 'rental', name: 'Alquiler', shortName: 'Alq.', color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', activeBg: 'bg-emerald-600' },
  { id: 'services', name: 'Servicios', shortName: 'Serv.', color: '#6B7280', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', activeBg: 'bg-gray-600' },
] as const;

const CATALOG: CatalogItem[] = [
  // Perforación Diamantina
  { id: 'perf-2', category: 'perforation', name: 'Perforación 2"', diameter: '2"', price: 70, unit: 'cm' },
  { id: 'perf-3', category: 'perforation', name: 'Perforación 3"', diameter: '3"', price: 90, unit: 'cm' },
  { id: 'perf-4', category: 'perforation', name: 'Perforación 4"', diameter: '4"', price: 100, unit: 'cm' },
  { id: 'perf-5', category: 'perforation', name: 'Perforación 5"', diameter: '5"', price: 110, unit: 'cm' },
  { id: 'perf-6', category: 'perforation', name: 'Perforación 6"', diameter: '6"', price: 140, unit: 'cm' },
  { id: 'perf-7', category: 'perforation', name: 'Perforación 7"', diameter: '7"', price: 230, unit: 'cm' },
  { id: 'perf-8', category: 'perforation', name: 'Perforación 8"', diameter: '8"', price: 280, unit: 'cm' },
  { id: 'perf-10', category: 'perforation', name: 'Perforación 10"', diameter: '10"', price: 350, unit: 'cm' },
  { id: 'perf-12', category: 'perforation', name: 'Perforación 12"', diameter: '12"', price: 450, unit: 'cm' },
  { id: 'perf-14', category: 'perforation', name: 'Perforación 14"', diameter: '14"', price: 550, unit: 'cm' },
  { id: 'perf-horiz', category: 'perforation', name: 'Perforación horizontal', description: '+50% s/vertical', price: 180, unit: 'cm' },
  { id: 'perf-altura', category: 'perforation', name: 'Factor altura >3m', description: 'Multiplicador', price: 1.3, unit: 'factor' },
  // Anclajes Químicos
  { id: 'anc-3-8', category: 'anchors', name: 'Anclaje 3/8"', diameter: '3/8"', price: 25, unit: 'und' },
  { id: 'anc-1-2', category: 'anchors', name: 'Anclaje 1/2"', diameter: '1/2"', price: 35, unit: 'und' },
  { id: 'anc-5-8', category: 'anchors', name: 'Anclaje 5/8"', diameter: '5/8"', price: 45, unit: 'und' },
  { id: 'anc-3-4', category: 'anchors', name: 'Anclaje 3/4"', diameter: '3/4"', price: 60, unit: 'und' },
  { id: 'anc-1', category: 'anchors', name: 'Anclaje 1"', diameter: '1"', price: 85, unit: 'und' },
  { id: 'anc-1-1-4', category: 'anchors', name: 'Anclaje 1-1/4"', diameter: '1-1/4"', price: 120, unit: 'und' },
  { id: 'anc-post', category: 'anchors', name: 'Post-instalado', description: 'HIT-RE 500 V3', price: 55, unit: 'und' },
  { id: 'anc-sismo', category: 'anchors', name: 'Anclaje sísmico', description: 'HIT-HY 270', price: 75, unit: 'und' },
  { id: 'var-3-8', category: 'anchors', name: 'Varilla 3/8"', diameter: '3/8"', price: 8, unit: 'und' },
  { id: 'var-1-2', category: 'anchors', name: 'Varilla 1/2"', diameter: '1/2"', price: 12, unit: 'und' },
  { id: 'var-5-8', category: 'anchors', name: 'Varilla 5/8"', diameter: '5/8"', price: 18, unit: 'und' },
  { id: 'var-3-4', category: 'anchors', name: 'Varilla 3/4"', diameter: '3/4"', price: 25, unit: 'und' },
  // Sellos Cortafuego
  { id: 'fire-tubo-2', category: 'firestop', name: 'Sello tubo ≤2"', price: 35, unit: 'und' },
  { id: 'fire-tubo-4', category: 'firestop', name: 'Sello tubo 2"-4"', price: 55, unit: 'und' },
  { id: 'fire-tubo-6', category: 'firestop', name: 'Sello tubo 4"-6"', price: 85, unit: 'und' },
  { id: 'fire-cable-50', category: 'firestop', name: 'Sello cables ≤50mm', price: 45, unit: 'pase' },
  { id: 'fire-cable-100', category: 'firestop', name: 'Sello cables 50-100mm', price: 75, unit: 'pase' },
  { id: 'fire-collar-2', category: 'firestop', name: 'Collar 2"', description: 'CP 643N', price: 65, unit: 'und' },
  { id: 'fire-collar-3', category: 'firestop', name: 'Collar 3"', description: 'CP 643N', price: 85, unit: 'und' },
  { id: 'fire-collar-4', category: 'firestop', name: 'Collar 4"', description: 'CP 643N', price: 110, unit: 'und' },
  { id: 'fire-mortero', category: 'firestop', name: 'Mortero cortafuego', description: 'CP 636', price: 40, unit: 'kg' },
  { id: 'fire-masilla', category: 'firestop', name: 'Masilla cortafuego', description: 'CP 606', price: 55, unit: 'cart' },
  { id: 'fire-manga', category: 'firestop', name: 'Manga cortafuego', description: 'CFS-SL', price: 120, unit: 'und' },
  // Detección
  { id: 'det-escaneo', category: 'detection', name: 'Escaneo estructuras', description: 'Ferroscan PS 200', price: 200, unit: 'día' },
  { id: 'det-armadura', category: 'detection', name: 'Detección armaduras', description: 'Ferroscan PS 200', price: 150, unit: 'm²' },
  { id: 'det-mapeo', category: 'detection', name: 'Mapeo instalaciones', description: 'PS 1000 X-Scan', price: 250, unit: 'día' },
  { id: 'det-tuberia', category: 'detection', name: 'Localización tuberías', description: 'PS 50/PS 85', price: 180, unit: 'día' },
  { id: 'det-reporte', category: 'detection', name: 'Reporte técnico', price: 100, unit: 'und' },
  { id: 'det-previo', category: 'detection', name: 'Escaneo previo perf.', price: 50, unit: 'pto' },
  // Alquiler Equipos
  { id: 'alq-te30', category: 'rental', name: 'TE 30-A36', description: 'Rotomartillo batería', price: 60, unit: 'día' },
  { id: 'alq-te50', category: 'rental', name: 'TE 50-AVR', description: 'Rotomartillo SDS-Max', price: 80, unit: 'día' },
  { id: 'alq-te60', category: 'rental', name: 'TE 60-AVR', description: 'Rotomartillo SDS-Max', price: 100, unit: 'día' },
  { id: 'alq-te70', category: 'rental', name: 'TE 70-AVR', description: 'Rotomartillo SDS-Max', price: 120, unit: 'día' },
  { id: 'alq-te1000', category: 'rental', name: 'TE 1000-AVR', description: 'Demoledor', price: 150, unit: 'día' },
  { id: 'alq-te1500', category: 'rental', name: 'TE 1500-AVR', description: 'Demoledor pesado', price: 200, unit: 'día' },
  { id: 'alq-dd150', category: 'rental', name: 'DD 150-U', description: 'Perforadora húmedo', price: 250, unit: 'día' },
  { id: 'alq-dd250', category: 'rental', name: 'DD 250-E', description: 'Perforadora húmedo', price: 350, unit: 'día' },
  { id: 'alq-dd350', category: 'rental', name: 'DD 350-CA', description: 'Perforadora industrial', price: 450, unit: 'día' },
  { id: 'alq-ps50', category: 'rental', name: 'PS 50', description: 'Detector básico', price: 120, unit: 'día' },
  { id: 'alq-ps85', category: 'rental', name: 'PS 85', description: 'Detector multi-sensor', price: 180, unit: 'día' },
  { id: 'alq-ps200', category: 'rental', name: 'Ferroscan PS 200', description: 'Escáner concreto', price: 250, unit: 'día' },
  { id: 'alq-ps1000', category: 'rental', name: 'X-Scan PS 1000', description: 'Radar GPR', price: 400, unit: 'día' },
  { id: 'alq-vc40', category: 'rental', name: 'VC 40-U', description: 'Aspiradora industrial', price: 80, unit: 'día' },
  { id: 'alq-dsh600', category: 'rental', name: 'DSH 600-X', description: 'Cortadora disco', price: 150, unit: 'día' },
  { id: 'alq-dx5', category: 'rental', name: 'DX 5', description: 'Pistola fijación', price: 60, unit: 'día' },
  // Servicios Adicionales
  { id: 'srv-mov-lima', category: 'services', name: 'Movilización Lima', description: 'Radio 30km', price: 150, unit: 'viaje' },
  { id: 'srv-mov-prov', category: 'services', name: 'Movilización provincial', description: '+ viáticos', price: 500, unit: 'viaje' },
  { id: 'srv-install', category: 'services', name: 'Instalación/desinstalación', price: 200, unit: 'evento' },
  { id: 'srv-capacit', category: 'services', name: 'Capacitación', description: '2-4 horas', price: 300, unit: 'sesión' },
  { id: 'srv-operador', category: 'services', name: 'Operador certificado', description: 'Personal HILTI', price: 180, unit: 'día' },
  { id: 'srv-asistente', category: 'services', name: 'Asistente técnico', price: 120, unit: 'día' },
  { id: 'srv-informe', category: 'services', name: 'Informe técnico', price: 150, unit: 'und' },
  { id: 'srv-altura', category: 'services', name: 'Trabajo en altura', description: '>3m, factor 1.5x', price: 1.5, unit: 'factor' },
  { id: 'srv-nocturno', category: 'services', name: 'Trabajo nocturno', description: '22:00-06:00, 1.5x', price: 1.5, unit: 'factor' },
  { id: 'srv-finde', category: 'services', name: 'Fin de semana', description: 'Factor 1.3x', price: 1.3, unit: 'factor' },
];

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Constructora ABC SAC', ruc: '20123456789' },
  { id: '2', name: 'Inmobiliaria XYZ', ruc: '20987654321' },
  { id: '3', name: 'Graña y Montero', ruc: '20100154057' },
  { id: '4', name: 'COSAPI SA', ruc: '20100082391' },
  { id: '5', name: 'JJC Contratistas', ruc: '20100165849' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface InitialItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface InitialData {
  clientName?: string;
  clientRuc?: string;
  items?: InitialItem[];
  currency?: 'PEN' | 'USD';
  includeIgv?: boolean;
  validityDays?: number;
  paymentTerms?: string;
  notes?: string;
  conditions?: ConditionBlock[];
}

interface QuotationBuilderProps {
  mode?: 'create' | 'edit';
  initialCode?: string;
  quotationId?: string;
  existingClients?: Client[];
  initialData?: InitialData;
}

export default function QuotationBuilder({
  mode = 'create',
  initialCode,
  quotationId,
  existingClients = MOCK_CLIENTS,
  initialData,
}: QuotationBuilderProps) {
  const router = useRouter();

  const convertInitialItems = (): QuotationItem[] => {
    if (!initialData?.items) return [];
    return initialData.items.map(item => ({
      id: item.id,
      category: 'services',
      name: item.description,
      price: item.unitPrice,
      unit: item.unit,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));
  };

  // State
  const [code] = useState(initialCode || `COT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`);
  const [activeCategory, setActiveCategory] = useState<string>('perforation');
  const [items, setItems] = useState<QuotationItem[]>(convertInitialItems);
  const [clientSearch, setClientSearch] = useState(initialData?.clientName || '');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialData?.clientName
      ? { id: '', name: initialData.clientName, ruc: initialData.clientRuc }
      : null
  );
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [currency, setCurrency] = useState<'PEN' | 'USD'>(initialData?.currency || 'PEN');
  const [includeIgv, setIncludeIgv] = useState(initialData?.includeIgv ?? true);
  const [saving, setSaving] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [validityDays, setValidityDays] = useState(initialData?.validityDays || 15);
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || 'Contado');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [mobileTab, setMobileTab] = useState<'catalog' | 'items' | 'conditions'>('catalog');
  // Condiciones
  const [conditions, setConditions] = useState<ConditionBlock[]>(initialData?.conditions || []);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [editingConditionIdx, setEditingConditionIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const clientInputRef = useRef<HTMLDivElement>(null);

  const filteredCatalog = useMemo(() =>
    CATALOG.filter(item => item.category === activeCategory),
    [activeCategory]
  );

  const activeCat = CATEGORIES.find(c => c.id === activeCategory)!;

  const filteredClients = useMemo(() => {
    if (!clientSearch) return existingClients.slice(0, 5);
    const search = clientSearch.toLowerCase();
    return existingClients.filter(c =>
      c.name.toLowerCase().includes(search) || c.ruc?.includes(search)
    ).slice(0, 5);
  }, [clientSearch, existingClients]);

  // Calculations
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const igv = includeIgv ? subtotal * 0.18 : 0;
  const total = subtotal + igv;

  const formatPrice = useCallback((amount: number) => {
    const symbol = currency === 'PEN' ? 'S/' : '$';
    return `${symbol} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency]);

  const addItem = useCallback((catalogItem: CatalogItem) => {
    const existingIndex = items.findIndex(i => i.id === catalogItem.id);
    if (existingIndex >= 0) {
      setItems(prev => prev.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
      toast.success(`${catalogItem.name} +1`, { duration: 1000 });
    } else {
      setItems(prev => [...prev, { ...catalogItem, quantity: 1, subtotal: catalogItem.price }]);
      toast.success(`${catalogItem.name} agregado`, { duration: 1000 });
    }
  }, [items]);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } : item
      ));
    }
  }, []);

  const updatePrice = useCallback((itemId: string, newPrice: number) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, price: newPrice, subtotal: item.quantity * newPrice } : item
    ));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  // Condition handlers
  const addConditionBlock = useCallback((block: ConditionBlock) => {
    setConditions(prev => {
      if (prev.some(c => c.id === block.id)) {
        toast('Esta condición ya está agregada', { duration: 1500 });
        return prev;
      }
      return [...prev, { ...block }];
    });
  }, []);

  const removeCondition = useCallback((idx: number) => {
    setConditions(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateConditionContent = useCallback((idx: number, content: string) => {
    setConditions(prev => prev.map((c, i) => i === idx ? { ...c, content } : c));
  }, []);

  const updateConditionTitle = useCallback((idx: number, title: string) => {
    setConditions(prev => prev.map((c, i) => i === idx ? { ...c, title } : c));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = CONDITION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const blocks = generateDefaultConditions(preset.templateIds);
    setConditions(blocks);
    setShowConditionPicker(false);
    toast.success(`Preset "${preset.name}" aplicado`, { duration: 1500 });
  }, []);

  const moveCondition = useCallback((idx: number, direction: 'up' | 'down') => {
    setConditions(prev => {
      const newArr = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newArr.length) return prev;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      return newArr;
    });
  }, []);

  const selectClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  }, []);

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (items.length === 0) {
      toast.error('Agrega al menos un item');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code,
        clientName: selectedClient?.name || clientSearch,
        clientRuc: selectedClient?.ruc || '',
        items: items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.price,
          subtotal: item.subtotal,
        })),
        subtotal, igv, total, currency, validityDays, paymentTerms, notes, status,
        conditions: conditions.map(c => ({ id: c.id, title: c.title, content: c.content })),
      };
      const url = mode === 'edit' && quotationId ? `/api/cotizaciones/${quotationId}` : '/api/cotizaciones';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      toast.success(status === 'sent' ? 'Cotización enviada' : 'Borrador guardado');
      if (mode === 'create') router.push(`/panel/cotizaciones/${data.id}`);
    } catch {
      toast.error('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientInputRef.current && !clientInputRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Build preview data from current state
  const previewData = useMemo((): QuotationDocumentData => ({
    code,
    date: new Date().toISOString(),
    clientName: selectedClient?.name || clientSearch || '',
    clientRuc: selectedClient?.ruc || '',
    items: items.map(item => ({
      description: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.price,
      subtotal: item.subtotal,
    })),
    subtotal,
    igv,
    total,
    includeIgv,
    currency,
    validityDays,
    paymentTerms,
    notes: notes || undefined,
    conditions: conditions.map(c => ({ title: c.title, content: c.content })),
  }), [code, selectedClient, clientSearch, items, subtotal, igv, total, includeIgv, currency, validityDays, paymentTerms, notes, conditions]);

  // Determinar qué panel mostrar en el lado derecho
  // Mobile: controlado por mobileTab. Desktop: controlado por showConditions
  const showItemsPanel = mobileTab === 'items' || (mobileTab === 'catalog' && !showConditions);
  const showConditionsPanel = mobileTab === 'conditions' || (mobileTab === 'catalog' && showConditions);

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-0px)]">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-900">{code}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">{mode === 'create' ? 'Nueva' : 'Editando'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowPreview(true)}
              disabled={items.length === 0}
              className="p-1.5 text-gray-500 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
              title="Vista previa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving || items.length === 0}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>

        {/* Cliente + moneda + IGV */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 relative" ref={clientInputRef}>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setShowClientDropdown(true);
                if (selectedClient && e.target.value !== selectedClient.name) setSelectedClient(null);
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Cliente..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]/40 transition-all"
            />
            {selectedClient?.ruc && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">{selectedClient.ruc}</span>
            )}
            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-40">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900">{client.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{client.ruc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrency(c => c === 'PEN' ? 'USD' : 'PEN')}
            className="px-3 py-2 text-xs font-mono font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 bg-white"
          >
            {currency === 'PEN' ? 'S/' : 'US$'}
          </button>
          <button
            onClick={() => setIncludeIgv(v => !v)}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${includeIgv
              ? 'bg-[#DC2626] text-white'
              : 'bg-white text-gray-400 border border-gray-200'
            }`}
          >
            IGV
          </button>
        </div>
      </div>

      {/* ── MOBILE TAB SWITCHER (solo visible en móvil) ── */}
      <div className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
              mobileTab === 'catalog' ? 'text-[#DC2626] border-b-2 border-[#DC2626]' : 'text-gray-500'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setMobileTab('items')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors relative ${
              mobileTab === 'items' ? 'text-[#DC2626] border-b-2 border-[#DC2626]' : 'text-gray-500'
            }`}
          >
            Items {items.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold">
                {items.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileTab('conditions')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors relative ${
              mobileTab === 'conditions' ? 'text-[#DC2626] border-b-2 border-[#DC2626]' : 'text-gray-500'
            }`}
          >
            Condiciones {conditions.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 text-white text-[10px] font-bold">
                {conditions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: CATÁLOGO ── */}
        <div className={`${mobileTab === 'catalog' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 min-w-0 overflow-hidden`}>
          {/* Category tabs */}
          <div className="px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto flex-shrink-0">
            <div className="flex gap-1.5 min-w-max">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'text-white shadow-sm'
                      : `${cat.bg} ${cat.text} hover:opacity-80`
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {filteredCatalog.map(item => {
                const inCart = items.find(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className={`relative text-left p-3 rounded-lg border-2 transition-all active:scale-[0.98] ${
                      inCart
                        ? `${activeCat.bg} ${activeCat.border} shadow-sm`
                        : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {inCart && (
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: activeCat.color }}
                      >
                        {inCart.quantity}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.diameter && (
                          <span
                            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border"
                            style={{ borderColor: `${activeCat.color}30`, color: activeCat.color, backgroundColor: `${activeCat.color}08` }}
                          >
                            {item.diameter}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-gray-400 truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <p className="font-mono text-sm font-bold" style={{ color: activeCat.color }}>
                          {formatPrice(item.price)}
                        </p>
                        <p className="text-[10px] text-gray-400">/{item.unit}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: ITEMS + CONDICIONES ── */}
        <div className={`${mobileTab === 'items' || mobileTab === 'conditions' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[420px] lg:min-w-[360px] border-l border-gray-200 bg-white overflow-hidden`}>

          {/* Desktop panel tabs */}
          <div className="hidden lg:flex border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setShowConditions(false)}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
                !showConditions ? 'text-[#DC2626] border-b-2 border-[#DC2626]' : 'text-gray-500'
              }`}
            >
              Items {items.length > 0 && <span className="text-gray-400">({items.length})</span>}
            </button>
            <button
              onClick={() => setShowConditions(true)}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
                showConditions ? 'text-[#DC2626] border-b-2 border-[#DC2626]' : 'text-gray-500'
              }`}
            >
              Condiciones {conditions.length > 0 && <span className="text-gray-400">({conditions.length})</span>}
            </button>
          </div>

          {/* ── ITEMS VIEW ── */}
          {showItemsPanel && (
            <>
              {/* Items subheader */}
              <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-700">
                    Items
                  </h3>
                  <div className="flex gap-1">
                    <select
                      value={validityDays}
                      onChange={(e) => setValidityDays(parseInt(e.target.value))}
                      className="border border-gray-200 rounded px-1.5 py-1 text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-[#DC2626]/30"
                    >
                      <option value={7}>7d</option>
                      <option value={15}>15d</option>
                      <option value={30}>30d</option>
                    </select>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="border border-gray-200 rounded px-1.5 py-1 text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-[#DC2626]/30"
                    >
                      <option>Contado</option>
                      <option>50% adelanto</option>
                      <option>Crédito 30 días</option>
                      <option>Valorizaciones</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Sin items</p>
                    <p className="text-xs text-gray-400 mt-1">Selecciona del catálogo</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {items.map(item => {
                      const cat = CATEGORIES.find(c => c.id === item.category);
                      return (
                        <div key={item.id} className="px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color }} />
                                <p className="text-sm text-gray-900 truncate">{item.name}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 pl-3.5">
                            <div className="flex items-center bg-gray-100 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                                className="w-10 bg-transparent text-center text-xs font-mono font-bold text-gray-900 focus:outline-none"
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <span className="text-[10px] text-gray-400">{item.unit}</span>
                            <span className="text-[10px] text-gray-300 mx-0.5">&times;</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-gray-100 rounded-md px-2 py-1 text-right text-xs font-mono text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#DC2626]/30"
                            />
                            <span className="text-[10px] text-gray-300">=</span>
                            <span className="font-mono text-xs font-bold text-gray-900 ml-auto">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex-shrink-0">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatPrice(subtotal)}</span>
                    </div>
                    {includeIgv && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>IGV (18%)</span>
                        <span className="font-mono">{formatPrice(igv)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                      <span>Total</span>
                      <span className="font-mono text-[#DC2626]">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CONDITIONS VIEW ── */}
          {showConditionsPanel && (
            <>
              {/* Conditions header */}
              <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-700">Condiciones del servicio</h3>
                  <button
                    onClick={() => setShowConditionPicker(v => !v)}
                    className="text-[10px] font-medium text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                  >
                    {showConditionPicker ? 'Cerrar' : '+ Agregar'}
                  </button>
                </div>
              </div>

              {/* Condition picker (templates browser) */}
              {showConditionPicker && (
                <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0 max-h-[50vh] overflow-y-auto">
                  {/* Presets */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-medium mb-1.5">Presets rápidos</p>
                    <div className="flex gap-2">
                      {CONDITION_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-[#DC2626]/30 hover:bg-red-50 transition-all"
                        >
                          {preset.name}
                          <span className="block text-[10px] text-gray-400 font-normal">{preset.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template categories */}
                  {CONDITION_TEMPLATES.map((template: ConditionTemplate) => (
                    <div key={template.id} className="px-4 py-2 border-b border-gray-100 last:border-b-0">
                      <p className="text-[10px] text-gray-500 uppercase font-medium mb-1.5">
                        {template.icon} {template.name}
                        <span className="normal-case font-normal ml-1">- {template.description}</span>
                      </p>
                      <div className="space-y-1">
                        {template.blocks.map(block => {
                          const isAdded = conditions.some(c => c.id === block.id);
                          return (
                            <button
                              key={block.id}
                              onClick={() => addConditionBlock(block)}
                              disabled={isAdded}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                                isAdded
                                  ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                  : 'bg-white border border-gray-200 hover:border-[#DC2626]/30 hover:bg-red-50 text-gray-700'
                              }`}
                            >
                              <span className="font-medium">{block.title}</span>
                              {isAdded && <span className="ml-2 text-[10px]">Agregado</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conditions editor (added blocks) */}
              <div className="flex-1 overflow-y-auto">
                {conditions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Sin condiciones</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Usa un preset o agrega condiciones individuales
                    </p>
                    <button
                      onClick={() => setShowConditionPicker(true)}
                      className="mt-3 px-4 py-2 text-xs font-medium text-[#DC2626] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Explorar condiciones
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {conditions.map((condition, idx) => (
                      <div key={`${condition.id}-${idx}`} className="px-4 py-3">
                        {/* Condition header */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">{idx + 1}.</span>
                            {editingConditionIdx === idx ? (
                              <input
                                type="text"
                                value={condition.title}
                                onChange={(e) => updateConditionTitle(idx, e.target.value)}
                                onBlur={() => setEditingConditionIdx(null)}
                                autoFocus
                                className="flex-1 text-xs font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#DC2626]/30"
                              />
                            ) : (
                              <button
                                onClick={() => setEditingConditionIdx(idx)}
                                className="text-xs font-semibold text-gray-900 text-left truncate hover:text-[#DC2626] transition-colors"
                                title="Clic para editar título"
                              >
                                {condition.title}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => moveCondition(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
                              title="Subir"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveCondition(idx, 'down')}
                              disabled={idx === conditions.length - 1}
                              className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors"
                              title="Bajar"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeCondition(idx)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* Condition content (editable textarea) */}
                        <textarea
                          value={condition.content}
                          onChange={(e) => updateConditionContent(idx, e.target.value)}
                          rows={Math.min(Math.max(condition.content.split('\n').length, 3), 12)}
                          className="w-full text-[11px] leading-relaxed text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#DC2626]/20 focus:border-[#DC2626]/30 resize-y transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notas libres */}
              {conditions.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex-shrink-0">
                  <label className="text-[10px] text-gray-500 uppercase font-medium">Notas adicionales</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas libres que se agregan al final del documento..."
                    rows={2}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#DC2626]/30 resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE FLOATING TOTAL BAR ── */}
      {items.length > 0 && mobileTab === 'catalog' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
          <button
            onClick={() => setMobileTab('items')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#DC2626] text-white text-xs font-bold">
                {items.length}
              </span>
              <span className="text-sm font-medium text-gray-700">Ver items</span>
            </div>
            <span className="font-mono text-lg font-bold text-[#DC2626]">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
          {/* Preview toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-sm font-bold text-gray-900">Vista previa — {code}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
          {/* Document preview */}
          <div className="flex-1 overflow-y-auto py-8 print:p-0 print:overflow-visible">
            <QuotationDocument data={previewData} className="shadow-lg mx-auto print:shadow-none" />
          </div>
        </div>
      )}
    </div>
  );
}
