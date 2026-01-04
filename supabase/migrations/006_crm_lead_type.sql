-- ============================================
-- AMAROT CRM - Fase 2
-- Migración: Campo type (lead/opportunity) + trigger automático
-- Fecha: 2026-01
-- ============================================

-- ==================== CAMPO TYPE EN LEADS ====================

-- Agregar campo type a leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS type TEXT
  DEFAULT 'lead'
  CHECK (type IN ('lead', 'opportunity'));

-- ==================== CAMPO IS_OPPORTUNITY EN STAGES ====================

-- Agregar campo is_opportunity a lead_stages para determinar el tipo
ALTER TABLE lead_stages ADD COLUMN IF NOT EXISTS is_opportunity BOOLEAN DEFAULT false;

-- Marcar etapas que son oportunidad (calificado en adelante)
UPDATE lead_stages SET is_opportunity = false WHERE name IN ('new', 'contacted');
UPDATE lead_stages SET is_opportunity = true WHERE name IN ('qualified', 'quotation_sent', 'negotiation', 'won', 'lost');

-- ==================== ACTUALIZAR LEADS EXISTENTES ====================

-- Actualizar leads existentes según su etapa actual
UPDATE leads l SET type =
  CASE WHEN s.is_opportunity THEN 'opportunity' ELSE 'lead' END
FROM lead_stages s WHERE l.stage_id = s.id;

-- ==================== TRIGGER AUTOMÁTICO ====================

-- Función para actualizar type automáticamente al cambiar etapa
CREATE OR REPLACE FUNCTION update_lead_type_on_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  SELECT CASE WHEN is_opportunity THEN 'opportunity' ELSE 'lead' END
  INTO NEW.type
  FROM lead_stages WHERE id = NEW.stage_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe (para poder recrearlo)
DROP TRIGGER IF EXISTS trigger_update_lead_type ON leads;

-- Crear trigger que actualiza type al insertar o cambiar stage_id
CREATE TRIGGER trigger_update_lead_type
  BEFORE INSERT OR UPDATE OF stage_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_type_on_stage_change();

-- ==================== ÍNDICE ====================

-- Índice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);

-- ==================== COMENTARIOS ====================

COMMENT ON COLUMN leads.type IS 'Tipo: lead (nuevo/contactado) u opportunity (calificado en adelante)';
COMMENT ON COLUMN lead_stages.is_opportunity IS 'Si la etapa convierte el lead en oportunidad';
COMMENT ON FUNCTION update_lead_type_on_stage_change IS 'Actualiza automáticamente el tipo del lead según la etapa';
