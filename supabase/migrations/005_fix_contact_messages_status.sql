-- ============================================
-- Migración: Fix status constraint en contact_messages
-- Agrega 'converted' como valor válido para el status
-- ============================================

-- Primero eliminar el constraint existente si existe
ALTER TABLE contact_messages
DROP CONSTRAINT IF EXISTS contact_messages_status_check;

-- Crear el nuevo constraint con 'converted' incluido
ALTER TABLE contact_messages
ADD CONSTRAINT contact_messages_status_check
CHECK (status IN ('new', 'read', 'replied', 'spam', 'converted'));

-- Verificar que el UPDATE funcione (opcional - para pruebas)
-- UPDATE contact_messages SET status = 'converted' WHERE lead_id IS NOT NULL;

COMMENT ON COLUMN contact_messages.status IS 'Estado del mensaje: new, read, replied, spam, converted';
