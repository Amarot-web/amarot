-- ============================================
-- AMAROT CRM
-- Migración: Cambio en manejo de leads perdidos
-- Fecha: 2025-01
--
-- Cambio: Los leads perdidos mantienen su stage_id original
-- en lugar de moverse a la etapa "Perdido".
-- Esto permite analizar en qué etapa se pierden las oportunidades.
-- ============================================

-- Modificar función mark_lead_as_lost para NO cambiar el stage_id
CREATE OR REPLACE FUNCTION mark_lead_as_lost(
  p_lead_id UUID,
  p_lost_reason_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_lead leads;
  v_stage_name TEXT;
BEGIN
  -- Obtener nombre de etapa actual para la actividad
  SELECT ls.display_name INTO v_stage_name
  FROM leads l
  JOIN lead_stages ls ON l.stage_id = ls.id
  WHERE l.id = p_lead_id;

  -- Actualizar lead: marcar como perdido SIN cambiar stage_id
  UPDATE leads
  SET
    lost_reason_id = p_lost_reason_id,
    lost_notes = p_notes,
    date_closed = NOW(),
    updated_at = NOW()
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  -- Registrar actividad de pérdida
  INSERT INTO lead_activities (
    lead_id,
    activity_type,
    title,
    description,
    user_id,
    is_completed,
    completed_at
  ) VALUES (
    p_lead_id,
    'note',
    'Oportunidad marcada como perdida',
    'Perdido en etapa: ' || v_stage_name,
    COALESCE(p_user_id, v_lead.user_id),
    true,
    NOW()
  );

  RETURN v_lead;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nueva función para reactivar un lead perdido
CREATE OR REPLACE FUNCTION reactivate_lost_lead(
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_lead leads;
BEGIN
  -- Verificar que el lead está perdido
  IF NOT EXISTS (
    SELECT 1 FROM leads
    WHERE id = p_lead_id AND lost_reason_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'El lead no está marcado como perdido';
  END IF;

  -- Reactivar: limpiar campos de pérdida
  UPDATE leads
  SET
    lost_reason_id = NULL,
    lost_notes = NULL,
    date_closed = NULL,
    updated_at = NOW()
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  -- Registrar actividad de reactivación
  INSERT INTO lead_activities (
    lead_id,
    activity_type,
    title,
    description,
    user_id,
    is_completed,
    completed_at
  ) VALUES (
    p_lead_id,
    'note',
    'Oportunidad reactivada',
    'Lead reactivado desde estado perdido',
    COALESCE(p_user_id, v_lead.user_id),
    true,
    NOW()
  );

  RETURN v_lead;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON FUNCTION mark_lead_as_lost IS 'Marca un lead como perdido manteniendo su etapa actual';
COMMENT ON FUNCTION reactivate_lost_lead IS 'Reactiva un lead perdido limpiando los campos de pérdida';
