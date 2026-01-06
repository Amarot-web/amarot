-- ============================================
-- AMAROT CRM
-- Migración: Campo de prioridad en leads
-- Fecha: 2025-01
--
-- Agrega campo priority para clasificar leads
-- por importancia: high, medium, low
-- ============================================

-- Agregar columna priority a la tabla leads
ALTER TABLE leads
ADD COLUMN priority TEXT
CHECK (priority IN ('high', 'medium', 'low'));

-- Comentario
COMMENT ON COLUMN leads.priority IS 'Prioridad del lead: high (alta), medium (media), low (baja)';

-- Índice para filtrar por prioridad (opcional pero útil para reportes)
CREATE INDEX idx_leads_priority ON leads (priority) WHERE priority IS NOT NULL;
