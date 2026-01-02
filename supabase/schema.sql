-- ==========================================
-- SCHEMA DE BASE DE DATOS - COTIZADOR AMAROT
-- Ejecutar en Supabase SQL Editor
-- ==========================================

-- ==================== CLIENTES ====================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  ruc TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_ruc ON clients(ruc);

-- ==================== COTIZACIONES ====================

CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('small', 'large')) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),

  -- Duración
  duration_days INTEGER NOT NULL,
  duration_months INTEGER,

  -- Financieros
  subtotal DECIMAL(12,2) DEFAULT 0,
  margin_percentage DECIMAL(5,2) DEFAULT 55,
  margin_amount DECIMAL(12,2) DEFAULT 0,
  igv DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PEN' CHECK (currency IN ('PEN', 'USD')),

  -- Condiciones
  validity_days INTEGER DEFAULT 15,
  validity_date DATE,
  payment_terms TEXT,
  notes TEXT,

  -- Campos de Odoo
  origin UUID REFERENCES quotations(id) ON DELETE SET NULL,
  client_order_ref TEXT,
  locked BOOLEAN DEFAULT FALSE,

  -- Firma digital
  signature TEXT,
  signed_by TEXT,
  signed_on TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_code ON quotations(code);

-- ==================== ITEMS DE COTIZACIÓN ====================

CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  sequence INTEGER DEFAULT 0,
  display_type TEXT DEFAULT 'product' CHECK (display_type IN ('product', 'section', 'note')),

  -- Datos del servicio
  service_type TEXT CHECK (service_type IN ('perforation', 'anchors', 'firestop', 'detection', 'equipment_rental')),
  description TEXT NOT NULL,

  -- Parámetros de perforación
  diameter DECIMAL(4,2),
  depth DECIMAL(6,2),
  working_height DECIMAL(4,2),

  -- Cantidades y precios
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'unit' CHECK (unit IN ('unit', 'meter', 'sqm', 'hour', 'day')),
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);

-- ==================== COSTOS DE MANO DE OBRA ====================

CREATE TABLE IF NOT EXISTS labor_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('leader', 'operator', 'helper')) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  daily_rate DECIMAL(10,2) NOT NULL,
  days_worked INTEGER NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0,
  include_benefits BOOLEAN DEFAULT FALSE,
  benefits_percentage DECIMAL(5,2) DEFAULT 40
);

CREATE INDEX IF NOT EXISTS idx_labor_costs_quotation ON labor_costs(quotation_id);

-- ==================== COSTOS LOGÍSTICOS ====================

CREATE TABLE IF NOT EXISTS logistics_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('food', 'lodging', 'transport', 'fuel', 'other')) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_logistics_costs_quotation ON logistics_costs(quotation_id);

-- ==================== COSTOS DE MATERIALES ====================

CREATE TABLE IF NOT EXISTS material_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('drill_bits', 'anchors', 'chemicals', 'ppe', 'other')) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0,
  perforations_per_unit INTEGER
);

CREATE INDEX IF NOT EXISTS idx_material_costs_quotation ON material_costs(quotation_id);

-- ==================== COSTOS DE EQUIPOS ====================

CREATE TABLE IF NOT EXISTS equipment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('drill', 'generator', 'scanner', 'vehicle', 'other')) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  daily_rate DECIMAL(10,2) NOT NULL,
  days_used INTEGER NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0,
  is_owned BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_equipment_costs_quotation ON equipment_costs(quotation_id);

-- ==================== HISTORIAL (AUDITORÍA) ====================

CREATE TABLE IF NOT EXISTS quotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changes JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_history_quotation ON quotation_history(quotation_id);

-- ==================== CATÁLOGO DE PRECIOS ====================

CREATE TABLE IF NOT EXISTS price_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT CHECK (service_type IN ('perforation', 'anchors', 'firestop', 'detection', 'equipment_rental')) NOT NULL,
  description TEXT NOT NULL,
  diameter DECIMAL(4,2),
  min_depth DECIMAL(6,2),
  max_depth DECIMAL(6,2),
  base_price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'unit' CHECK (unit IN ('unit', 'meter', 'sqm', 'hour', 'day')),
  height_factors JSONB DEFAULT '{"0-2": 1.0, "2-4": 1.15, "4-6": 1.30, "6+": 1.50}',
  volume_discounts JSONB DEFAULT '{"100": 0.05, "500": 0.10, "1000": 0.15}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SECUENCIA PARA CÓDIGO DE COTIZACIÓN ====================

CREATE SEQUENCE IF NOT EXISTS quotation_code_seq START 1;

-- ==================== FUNCIONES ====================

-- Función para generar código de cotización automáticamente
CREATE OR REPLACE FUNCTION generate_quotation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := 'COT-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('quotation_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente
DROP TRIGGER IF EXISTS trigger_generate_quotation_code ON quotations;
CREATE TRIGGER trigger_generate_quotation_code
  BEFORE INSERT ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION generate_quotation_code();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_quotations_updated_at ON quotations;
CREATE TRIGGER trigger_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==================== ROW LEVEL SECURITY ====================

-- Habilitar RLS en todas las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden hacer todo
-- (En producción, ajustar según roles)

CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Repetir para quotations
CREATE POLICY "Authenticated users can view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (true);

-- Repetir para quotation_items
CREATE POLICY "Authenticated users can manage quotation_items"
  ON quotation_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Repetir para todas las tablas de costos
CREATE POLICY "Authenticated users can manage labor_costs"
  ON labor_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage logistics_costs"
  ON logistics_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage material_costs"
  ON material_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage equipment_costs"
  ON equipment_costs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view quotation_history"
  ON quotation_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quotation_history"
  ON quotation_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view price_list"
  ON price_list FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage price_list"
  ON price_list FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==================== DATOS INICIALES ====================

-- Insertar precios base de perforación
INSERT INTO price_list (service_type, description, diameter, base_price, unit) VALUES
  ('perforation', 'Perforación diamantina 3"', 3, 90, 'unit'),
  ('perforation', 'Perforación diamantina 4"', 4, 100, 'unit'),
  ('perforation', 'Perforación diamantina 5"', 5, 110, 'unit'),
  ('perforation', 'Perforación diamantina 7"', 7, 230, 'unit'),
  ('anchors', 'Anclaje químico estándar', NULL, 45, 'unit'),
  ('firestop', 'Sellado cortafuego', NULL, 35, 'unit'),
  ('detection', 'Detección de instalaciones', NULL, 200, 'day'),
  ('equipment_rental', 'Alquiler rotomartillo TE 30', NULL, 60, 'day'),
  ('equipment_rental', 'Alquiler rotomartillo TE 50', NULL, 80, 'day'),
  ('equipment_rental', 'Alquiler rotomartillo TE 70', NULL, 100, 'day'),
  ('equipment_rental', 'Alquiler rotomartillo TE 1000', NULL, 150, 'day'),
  ('equipment_rental', 'Alquiler detector PS 200', NULL, 200, 'day')
ON CONFLICT DO NOTHING;

-- ==================== FIN DEL SCHEMA ====================
