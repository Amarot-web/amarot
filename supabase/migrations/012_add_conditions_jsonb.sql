-- ==========================================
-- Migración: Agregar campo conditions JSONB a quotations
-- Almacena condiciones editables como array de bloques {title, content}
-- ==========================================

ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN quotations.conditions IS 'Condiciones de la cotización. Array de objetos {title: string, content: string}. Cada bloque es una sección editable.';
