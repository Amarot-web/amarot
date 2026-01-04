-- ============================================
-- AMAROT CRM - CONFIGURACIÓN DE ALERTAS
-- Migración: Umbrales parametrizables para alertas
-- Fecha: 2025-01
-- ============================================

-- ==================== TABLA: CRM_ALERT_SETTINGS ====================

CREATE TABLE IF NOT EXISTS crm_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificador único del setting (clave)
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  -- Valor numérico (horas para no_contact, días para otros)
  value INTEGER NOT NULL,
  -- Unidad de tiempo: 'hours' o 'days'
  unit VARCHAR(10) NOT NULL DEFAULT 'days' CHECK (unit IN ('hours', 'days')),
  -- Descripción para la UI
  label VARCHAR(100) NOT NULL,
  description TEXT,
  -- Orden de visualización
  position INTEGER DEFAULT 0,
  -- Habilitado/deshabilitado
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_crm_alert_settings_updated_at
  BEFORE UPDATE ON crm_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar valores por defecto
INSERT INTO crm_alert_settings (setting_key, value, unit, label, description, position, is_enabled) VALUES
(
  'no_contact_hours',
  48,
  'hours',
  'Sin contactar',
  'Tiempo máximo sin actividad completada desde la creación del lead',
  1,
  true
),
(
  'quotation_no_response_days',
  5,
  'days',
  'Cotización sin respuesta',
  'Días en etapa "Cotización enviada" sin movimiento',
  2,
  true
),
(
  'stalled_days',
  14,
  'days',
  'Lead estancado',
  'Días sin actividad en cualquier etapa (excepto ganados/perdidos)',
  3,
  true
)
ON CONFLICT (setting_key) DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_alert_settings_key ON crm_alert_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_crm_alert_settings_enabled ON crm_alert_settings(is_enabled);

-- RLS
ALTER TABLE crm_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view crm_alert_settings"
  ON crm_alert_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with team:view can manage crm_alert_settings"
  ON crm_alert_settings FOR ALL
  USING (user_has_permission(auth.uid(), 'team:view'));

COMMENT ON TABLE crm_alert_settings IS 'Configuración de umbrales para alertas del CRM';

-- ==================== FUNCIÓN: OBTENER VALOR DE SETTING ====================

CREATE OR REPLACE FUNCTION get_alert_setting(p_key TEXT)
RETURNS RECORD AS $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT value, unit, is_enabled INTO v_result
  FROM crm_alert_settings
  WHERE setting_key = p_key;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== FUNCIÓN: OBTENER INTERVALO DE SETTING ====================

CREATE OR REPLACE FUNCTION get_alert_interval(p_key TEXT)
RETURNS INTERVAL AS $$
DECLARE
  v_value INTEGER;
  v_unit TEXT;
  v_enabled BOOLEAN;
BEGIN
  SELECT value, unit, is_enabled INTO v_value, v_unit, v_enabled
  FROM crm_alert_settings
  WHERE setting_key = p_key;

  -- Si no está habilitado, retornar un intervalo muy grande (nunca se dispara)
  IF NOT v_enabled THEN
    RETURN INTERVAL '100 years';
  END IF;

  -- Si no se encuentra, usar valores por defecto
  IF v_value IS NULL THEN
    CASE p_key
      WHEN 'no_contact_hours' THEN RETURN INTERVAL '48 hours';
      WHEN 'quotation_no_response_days' THEN RETURN INTERVAL '5 days';
      WHEN 'stalled_days' THEN RETURN INTERVAL '14 days';
      ELSE RETURN INTERVAL '100 years';
    END CASE;
  END IF;

  -- Construir intervalo según unidad
  IF v_unit = 'hours' THEN
    RETURN (v_value || ' hours')::INTERVAL;
  ELSE
    RETURN (v_value || ' days')::INTERVAL;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_alert_interval IS 'Obtiene el intervalo de tiempo para una alerta según configuración';

-- ==================== ACTUALIZAR VISTA: LEADS QUE REQUIEREN ATENCIÓN ====================

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
    -- Calcular alertas usando configuración dinámica
    CASE
      WHEN s.is_won OR s.is_lost THEN NULL
      WHEN NOT EXISTS (
        SELECT 1 FROM lead_activities la
        WHERE la.lead_id = l.id AND la.is_completed = true
      ) AND l.created_at < NOW() - get_alert_interval('no_contact_hours')
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
        AND l.updated_at < NOW() - get_alert_interval('quotation_no_response_days')
      THEN 'quotation_no_response'
    END as alert_quotation,
    CASE
      WHEN NOT s.is_won AND NOT s.is_lost
        AND l.updated_at < NOW() - get_alert_interval('stalled_days')
        AND NOT EXISTS (
          SELECT 1 FROM lead_activities la
          WHERE la.lead_id = l.id
            AND la.created_at > NOW() - get_alert_interval('stalled_days')
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

COMMENT ON VIEW leads_requiring_attention IS 'Vista de leads que requieren atención con tipos de alerta (configuración dinámica)';

-- ==================== ACTUALIZAR FUNCIÓN: OBTENER ALERTAS DE UN LEAD ====================

CREATE OR REPLACE FUNCTION get_lead_alerts(p_lead_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_alerts TEXT[] := '{}';
  v_lead RECORD;
  v_has_completed_activity BOOLEAN;
  v_has_overdue_activity BOOLEAN;
  v_no_contact_interval INTERVAL;
  v_quotation_interval INTERVAL;
  v_stalled_interval INTERVAL;
BEGIN
  -- Obtener intervalos de configuración
  v_no_contact_interval := get_alert_interval('no_contact_hours');
  v_quotation_interval := get_alert_interval('quotation_no_response_days');
  v_stalled_interval := get_alert_interval('stalled_days');

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

  -- Alerta: Sin contactar (configurable)
  IF NOT v_has_completed_activity
     AND v_lead.created_at < NOW() - v_no_contact_interval THEN
    v_alerts := array_append(v_alerts, 'no_contact');
  END IF;

  -- Alerta: Actividad vencida (siempre activa)
  IF v_has_overdue_activity THEN
    v_alerts := array_append(v_alerts, 'overdue_activity');
  END IF;

  -- Alerta: Cotización sin respuesta (configurable)
  IF v_lead.stage_name = 'quotation_sent'
     AND v_lead.updated_at < NOW() - v_quotation_interval THEN
    v_alerts := array_append(v_alerts, 'quotation_no_response');
  END IF;

  -- Alerta: Lead estancado (configurable)
  IF v_lead.updated_at < NOW() - v_stalled_interval
     AND NOT EXISTS (
       SELECT 1 FROM lead_activities
       WHERE lead_id = p_lead_id
         AND created_at > NOW() - v_stalled_interval
     ) THEN
    v_alerts := array_append(v_alerts, 'stalled');
  END IF;

  RETURN v_alerts;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_lead_alerts IS 'Obtiene array de alertas activas para un lead (configuración dinámica)';
