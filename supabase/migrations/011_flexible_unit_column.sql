-- ==========================================
-- Migración: Hacer flexible quotation_items para el cotizador mobile
-- 1. Permite cualquier texto como unidad: cm, und, m², día, kg, etc.
-- 2. Permite cantidades decimales (ej: 2.5 metros)
-- ==========================================

-- Eliminar el CHECK constraint existente en unit
ALTER TABLE quotation_items
DROP CONSTRAINT IF EXISTS quotation_items_unit_check;

-- Cambiar el valor por defecto de unit
ALTER TABLE quotation_items
ALTER COLUMN unit SET DEFAULT 'und';

-- Cambiar quantity de INTEGER a DECIMAL para permitir decimales
ALTER TABLE quotation_items
ALTER COLUMN quantity TYPE DECIMAL(10,2) USING quantity::DECIMAL(10,2);

-- Comentarios para documentar
COMMENT ON COLUMN quotation_items.unit IS 'Unidad de medida: cm, und, m², día, kg, cart, pase, pto, viaje, evento, sesión, factor, etc.';
COMMENT ON COLUMN quotation_items.quantity IS 'Cantidad del servicio/producto (permite decimales)';
