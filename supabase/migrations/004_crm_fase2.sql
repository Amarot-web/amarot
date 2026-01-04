-- ============================================
-- AMAROT CRM - FASE 2
-- Migración: Integraciones y Automatización
-- Fecha: 2025-01
-- ============================================

-- ==================== CONTACT MESSAGES - VINCULACIÓN CON LEADS ====================

-- Agregar columnas para vincular mensajes con leads
ALTER TABLE contact_messages
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_contact_messages_lead_id ON contact_messages(lead_id);

-- Agregar status 'converted' si no existe en el CHECK constraint
-- Nota: Si contact_messages tiene un CHECK constraint en status, puede requerir recrearlo
-- Por ahora agregamos la columna y el valor se valida en la aplicación

COMMENT ON COLUMN contact_messages.lead_id IS 'Lead creado a partir de este mensaje';
COMMENT ON COLUMN contact_messages.converted_at IS 'Fecha en que se convirtió a lead';

-- ==================== EMAIL TEMPLATES ====================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  -- Variables disponibles en la plantilla (para documentación/UI)
  variables JSONB DEFAULT '[]'::JSONB,
  -- Categoría para organizar plantillas
  category VARCHAR(50) DEFAULT 'general',
  -- Orden de visualización
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar plantillas predefinidas
INSERT INTO email_templates (name, subject, body, variables, category, position) VALUES
(
  'Confirmación de contacto',
  'Gracias por contactar a AMAROT - Hemos recibido su consulta',
  'Estimado/a {{nombre}},

Gracias por contactarse con AMAROT PERÚ SAC. Hemos recibido su consulta y un miembro de nuestro equipo se pondrá en contacto con usted en las próximas 24 horas hábiles.

Datos de su consulta:
- Empresa: {{empresa}}
- Servicio de interés: {{servicio}}

Si tiene alguna pregunta urgente, no dude en comunicarse con nosotros al (01) 705-0585 o vía WhatsApp.

Saludos cordiales,
Equipo AMAROT
www.amarot.pe',
  '["nombre", "empresa", "servicio"]',
  'seguimiento',
  1
),
(
  'Envío de cotización',
  'Cotización AMAROT - {{servicio}} para {{empresa}}',
  'Estimado/a {{nombre}},

Es un gusto saludarlo/a. Adjunto encontrará la cotización solicitada para el servicio de {{servicio}}.

Resumen:
- Empresa: {{empresa}}
- Servicio: {{servicio}}
- Responsable: {{responsable}}

La cotización tiene una validez de 30 días calendario. Quedamos a su disposición para cualquier consulta o aclaración.

Saludos cordiales,
{{responsable}}
AMAROT PERÚ SAC
(01) 705-0585 | ventas@amarot.pe',
  '["nombre", "empresa", "servicio", "responsable"]',
  'cotizacion',
  2
),
(
  'Seguimiento post-cotización',
  'Seguimiento - Cotización AMAROT',
  'Estimado/a {{nombre}},

Espero que se encuentre bien. Me permito comunicarme para dar seguimiento a la cotización que le enviamos para el servicio de {{servicio}}.

¿Tuvo oportunidad de revisarla? Quedamos atentos a sus comentarios o cualquier consulta que pueda tener.

Estaremos encantados de coordinar una llamada o reunión si lo considera conveniente.

Saludos cordiales,
{{responsable}}
AMAROT PERÚ SAC',
  '["nombre", "empresa", "servicio", "responsable"]',
  'seguimiento',
  3
),
(
  'Agradecimiento proyecto ganado',
  '¡Gracias por confiar en AMAROT!',
  'Estimado/a {{nombre}},

En nombre de todo el equipo de AMAROT PERÚ SAC, queremos agradecerle por confiar en nosotros para su proyecto de {{servicio}}.

Nos comprometemos a brindarle un servicio de la más alta calidad. Nuestro equipo técnico se pondrá en contacto para coordinar los detalles de ejecución.

Si tiene alguna consulta, no dude en comunicarse con {{responsable}}.

¡Será un gusto trabajar con {{empresa}}!

Saludos cordiales,
{{responsable}}
AMAROT PERÚ SAC',
  '["nombre", "empresa", "servicio", "responsable"]',
  'cierre',
  4
),
(
  'Recordatorio de actividad pendiente',
  'Recordatorio: Actividad pendiente - {{empresa}}',
  'Hola {{responsable}},

Este es un recordatorio de que tienes una actividad pendiente:

- Lead: {{empresa}}
- Contacto: {{nombre}}
- Servicio: {{servicio}}

No olvides dar seguimiento oportuno.

Sistema CRM AMAROT',
  '["nombre", "empresa", "servicio", "responsable"]',
  'interno',
  5
)
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email_templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users with crm:edit can manage email_templates"
  ON email_templates FOR ALL
  USING (user_has_permission(auth.uid(), 'crm:edit'));

COMMENT ON TABLE email_templates IS 'Plantillas de email predefinidas para comunicación con leads';

-- ==================== ASSIGNMENT RULES ====================

CREATE TABLE IF NOT EXISTS assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Tipo de servicio que activa la regla
  service_type VARCHAR(50) NOT NULL,
  -- Usuario asignado automáticamente
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- Prioridad (mayor = más importante)
  priority INTEGER DEFAULT 0,
  -- Descripción opcional
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Una sola regla activa por tipo de servicio (índice único parcial)
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignment_rules_unique_active
  ON assignment_rules(service_type)
  WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_assignment_rules_updated_at
  BEFORE UPDATE ON assignment_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_assignment_rules_service_type ON assignment_rules(service_type);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_user_id ON assignment_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_is_active ON assignment_rules(is_active);

-- RLS
ALTER TABLE assignment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with crm:view can view assignment_rules"
  ON assignment_rules FOR SELECT
  USING (user_has_permission(auth.uid(), 'crm:view'));

CREATE POLICY "Users with crm:edit can manage assignment_rules"
  ON assignment_rules FOR ALL
  USING (user_has_permission(auth.uid(), 'crm:edit'));

COMMENT ON TABLE assignment_rules IS 'Reglas de asignación automática de leads por tipo de servicio';

-- ==================== FUNCIÓN: OBTENER RESPONSABLE POR REGLA ====================

CREATE OR REPLACE FUNCTION get_assignment_user(p_service_type TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM assignment_rules
  WHERE service_type = p_service_type
    AND is_active = true
  ORDER BY priority DESC
  LIMIT 1;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_assignment_user IS 'Obtiene el usuario asignado automáticamente según el tipo de servicio';

-- ==================== FUNCIÓN: BUSCAR LEADS DUPLICADOS ====================

CREATE OR REPLACE FUNCTION find_duplicate_leads(
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS SETOF leads AS $$
DECLARE
  v_normalized_phone TEXT;
BEGIN
  -- Normalizar teléfono: eliminar espacios, guiones, +51, 0 inicial
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    v_normalized_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
    -- Eliminar prefijo 51 si existe
    IF length(v_normalized_phone) > 9 AND left(v_normalized_phone, 2) = '51' THEN
      v_normalized_phone := substring(v_normalized_phone from 3);
    END IF;
    -- Eliminar 0 inicial si existe
    IF left(v_normalized_phone, 1) = '0' THEN
      v_normalized_phone := substring(v_normalized_phone from 2);
    END IF;
  END IF;

  RETURN QUERY
  SELECT l.*
  FROM leads l
  WHERE
    -- Buscar por email exacto (case insensitive)
    (p_email IS NOT NULL AND p_email != '' AND lower(l.email) = lower(p_email))
    OR
    -- Buscar por teléfono normalizado
    (v_normalized_phone IS NOT NULL AND v_normalized_phone != '' AND
     regexp_replace(l.phone, '[^0-9]', '', 'g') LIKE '%' || v_normalized_phone || '%')
  ORDER BY l.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_duplicate_leads IS 'Busca leads existentes por email o teléfono para evitar duplicados';

-- ==================== FUNCIÓN: CONVERTIR MENSAJE A LEAD ====================

CREATE OR REPLACE FUNCTION convert_message_to_lead(
  p_message_id UUID,
  p_stage_id UUID,
  p_service_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_expected_revenue DECIMAL DEFAULT 0,
  p_description TEXT DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_message RECORD;
  v_lead leads;
  v_assigned_user UUID;
BEGIN
  -- Obtener datos del mensaje
  SELECT * INTO v_message
  FROM contact_messages
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found';
  END IF;

  -- Verificar que no esté ya convertido
  IF v_message.lead_id IS NOT NULL THEN
    RAISE EXCEPTION 'Message already converted to lead';
  END IF;

  -- Determinar usuario asignado
  v_assigned_user := COALESCE(p_user_id, get_assignment_user(p_service_type));

  -- Crear el lead
  INSERT INTO leads (
    company,
    contact_name,
    email,
    phone,
    service_type,
    description,
    stage_id,
    user_id,
    source,
    source_message_id,
    expected_revenue,
    created_by
  ) VALUES (
    COALESCE(v_message.company, v_message.name),
    v_message.name,
    v_message.email,
    v_message.phone,
    p_service_type,
    COALESCE(p_description, v_message.message),
    p_stage_id,
    v_assigned_user,
    'contact_form',
    p_message_id,
    p_expected_revenue,
    auth.uid()
  )
  RETURNING * INTO v_lead;

  -- Actualizar el mensaje
  UPDATE contact_messages
  SET
    lead_id = v_lead.id,
    converted_at = NOW(),
    status = 'converted'
  WHERE id = p_message_id;

  -- Crear actividad inicial
  INSERT INTO lead_activities (
    lead_id,
    activity_type,
    title,
    description,
    user_id,
    is_completed,
    completed_at,
    created_by
  ) VALUES (
    v_lead.id,
    'note',
    'Lead creado desde formulario de contacto',
    'Mensaje original: ' || v_message.message,
    v_assigned_user,
    true,
    NOW(),
    auth.uid()
  );

  RETURN v_lead;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION convert_message_to_lead IS 'Convierte un mensaje de contacto en un lead del CRM';

-- ==================== VISTA: LEADS QUE REQUIEREN ATENCIÓN ====================

CREATE OR REPLACE VIEW leads_requiring_attention AS
WITH lead_alerts AS (
  SELECT
    l.id,
    l.code,
    l.company,
    l.contact_name,
    l.service_type,
    l.stage_id,
    l.user_id,
    l.created_at,
    l.updated_at,
    s.display_name as stage_name,
    s.is_won,
    s.is_lost,
    u.full_name as assigned_to_name,
    -- Calcular alertas
    CASE
      WHEN s.is_won OR s.is_lost THEN NULL
      WHEN NOT EXISTS (
        SELECT 1 FROM lead_activities la
        WHERE la.lead_id = l.id AND la.is_completed = true
      ) AND l.created_at < NOW() - INTERVAL '48 hours'
      THEN 'no_contact'
    END as alert_no_contact,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM lead_activities la
        WHERE la.lead_id = l.id
          AND la.is_completed = false
          AND la.due_date < NOW()
      )
      THEN 'overdue_activity'
    END as alert_overdue,
    CASE
      WHEN s.name = 'quotation_sent'
        AND l.updated_at < NOW() - INTERVAL '5 days'
      THEN 'quotation_no_response'
    END as alert_quotation,
    CASE
      WHEN NOT s.is_won AND NOT s.is_lost
        AND l.updated_at < NOW() - INTERVAL '14 days'
        AND NOT EXISTS (
          SELECT 1 FROM lead_activities la
          WHERE la.lead_id = l.id
            AND la.created_at > NOW() - INTERVAL '14 days'
        )
      THEN 'stalled'
    END as alert_stalled
  FROM leads l
  LEFT JOIN lead_stages s ON l.stage_id = s.id
  LEFT JOIN user_profiles u ON l.user_id = u.id
  WHERE NOT s.is_won AND NOT s.is_lost
)
SELECT
  *,
  ARRAY_REMOVE(ARRAY[
    alert_no_contact,
    alert_overdue,
    alert_quotation,
    alert_stalled
  ], NULL) as alerts,
  CASE
    WHEN alert_no_contact IS NOT NULL THEN 1
    WHEN alert_overdue IS NOT NULL THEN 2
    WHEN alert_quotation IS NOT NULL THEN 3
    WHEN alert_stalled IS NOT NULL THEN 4
    ELSE 99
  END as alert_priority
FROM lead_alerts
WHERE alert_no_contact IS NOT NULL
   OR alert_overdue IS NOT NULL
   OR alert_quotation IS NOT NULL
   OR alert_stalled IS NOT NULL
ORDER BY alert_priority, created_at DESC;

COMMENT ON VIEW leads_requiring_attention IS 'Vista de leads que requieren atención con tipos de alerta';

-- ==================== FUNCIÓN: OBTENER ALERTAS DE UN LEAD ====================

CREATE OR REPLACE FUNCTION get_lead_alerts(p_lead_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_alerts TEXT[] := '{}';
  v_lead RECORD;
  v_stage RECORD;
  v_has_completed_activity BOOLEAN;
  v_has_overdue_activity BOOLEAN;
BEGIN
  -- Obtener lead y stage
  SELECT l.*, s.name as stage_name, s.is_won, s.is_lost
  INTO v_lead
  FROM leads l
  JOIN lead_stages s ON l.stage_id = s.id
  WHERE l.id = p_lead_id;

  IF NOT FOUND OR v_lead.is_won OR v_lead.is_lost THEN
    RETURN v_alerts;
  END IF;

  -- Verificar si tiene actividades completadas
  SELECT EXISTS (
    SELECT 1 FROM lead_activities
    WHERE lead_id = p_lead_id AND is_completed = true
  ) INTO v_has_completed_activity;

  -- Verificar si tiene actividades vencidas
  SELECT EXISTS (
    SELECT 1 FROM lead_activities
    WHERE lead_id = p_lead_id
      AND is_completed = false
      AND due_date < NOW()
  ) INTO v_has_overdue_activity;

  -- Alerta: Sin contactar (48h)
  IF NOT v_has_completed_activity
     AND v_lead.created_at < NOW() - INTERVAL '48 hours' THEN
    v_alerts := array_append(v_alerts, 'no_contact');
  END IF;

  -- Alerta: Actividad vencida
  IF v_has_overdue_activity THEN
    v_alerts := array_append(v_alerts, 'overdue_activity');
  END IF;

  -- Alerta: Cotización sin respuesta (5 días)
  IF v_lead.stage_name = 'quotation_sent'
     AND v_lead.updated_at < NOW() - INTERVAL '5 days' THEN
    v_alerts := array_append(v_alerts, 'quotation_no_response');
  END IF;

  -- Alerta: Lead estancado (14 días)
  IF v_lead.updated_at < NOW() - INTERVAL '14 days'
     AND NOT EXISTS (
       SELECT 1 FROM lead_activities
       WHERE lead_id = p_lead_id
         AND created_at > NOW() - INTERVAL '14 days'
     ) THEN
    v_alerts := array_append(v_alerts, 'stalled');
  END IF;

  RETURN v_alerts;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_lead_alerts IS 'Obtiene array de alertas activas para un lead';

-- ==================== PERMISOS ADICIONALES ====================

-- Agregar permiso para gestionar plantillas de email
INSERT INTO permissions (module, action, name, display_name) VALUES
  ('crm', 'manage_templates', 'crm:manage_templates', 'Gestionar plantillas de email'),
  ('crm', 'manage_rules', 'crm:manage_rules', 'Gestionar reglas de asignación')
ON CONFLICT (name) DO NOTHING;

-- Asignar a admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.name IN ('crm:manage_templates', 'crm:manage_rules')
ON CONFLICT DO NOTHING;

-- ==================== COMENTARIOS FINALES ====================

COMMENT ON COLUMN leads.source_message_id IS 'ID del mensaje de contacto que originó este lead';
