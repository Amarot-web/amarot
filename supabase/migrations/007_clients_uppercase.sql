-- ============================================
-- AMAROT - Nombres de clientes en mayúsculas
-- Migración: Trigger para convertir company_name a mayúsculas
-- Fecha: 2026-01
-- ============================================

-- ==================== FUNCIÓN ====================

-- Función para convertir nombre a mayúsculas
CREATE OR REPLACE FUNCTION uppercase_client_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.company_name = UPPER(TRIM(NEW.company_name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGER ====================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_uppercase_client_name ON clients;

-- Crear trigger que convierte a mayúsculas al insertar o actualizar
CREATE TRIGGER trigger_uppercase_client_name
  BEFORE INSERT OR UPDATE OF company_name ON clients
  FOR EACH ROW
  EXECUTE FUNCTION uppercase_client_name();

-- ==================== ACTUALIZAR EXISTENTES ====================

-- Convertir nombres existentes a mayúsculas
UPDATE clients SET company_name = UPPER(TRIM(company_name));

-- ==================== COMENTARIOS ====================

COMMENT ON FUNCTION uppercase_client_name IS 'Convierte automáticamente el nombre del cliente a mayúsculas';
