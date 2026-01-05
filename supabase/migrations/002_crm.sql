-- ============================================
-- AMAROT CRM
-- Migración: Tablas para gestión de leads
-- Fecha: 2025-01
-- ============================================

-- ==================== CRM PERMISSIONS ====================

-- Agregar permisos de CRM al sistema existente
INSERT INTO permissions (module, action, name, display_name) VALUES
  ('crm', 'view', 'crm:view', 'Ver CRM y leads'),
  ('crm', 'create', 'crm:create', 'Crear leads'),
  ('crm', 'edit', 'crm:edit', 'Editar leads'),
  ('crm', 'delete', 'crm:delete', 'Eliminar leads')
ON CONFLICT (name) DO NOTHING;

-- Asignar permisos CRM al rol admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin' AND p.module = 'crm'
ON CONFLICT DO NOTHING;

-- Asignar permisos CRM al rol manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager' AND p.module = 'crm'
ON CONFLICT DO NOTHING;

-- ==================== LEAD STAGES ====================

CREATE TABLE IF NOT EXISTS lead_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar etapas predefinidas del pipeline
INSERT INTO lead_stages (name, display_name, probability, color, position, is_won, is_lost) VALUES
  ('new', 'Nuevo Lead', 10, '#3B82F6', 1, false, false),
  ('contacted', 'Contactado', 20, '#8B5CF6', 2, false, false),
  ('qualified', 'Calificado', 40, '#EAB308', 3, false, false),
  ('quotation_sent', 'Cotización Enviada', 60, '#F97316', 4, false, false),
  ('negotiation', 'Negociación', 75, '#EC4899', 5, false, false),
  ('won', 'Proyecto Ganado', 100, '#22C55E', 6, true, false),
  ('lost', 'Perdido', 0, '#EF4444', 7, false, true)
ON CONFLICT (name) DO NOTHING;

-- ==================== LOST REASONS ====================

CREATE TABLE IF NOT EXISTS lost_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar razones de pérdida predefinidas
INSERT INTO lost_reasons (name, display_name) VALUES
  ('price_too_high', 'Precio muy alto'),
  ('chose_competitor', 'Eligió competencia'),
  ('no_budget', 'Sin presupuesto'),
  ('project_cancelled', 'Proyecto cancelado'),
  ('no_response', 'Sin respuesta'),
  ('bad_timing', 'Timing inadecuado'),
  ('other', 'Otro')
ON CONFLICT (name) DO NOTHING;

-- ==================== LEADS ====================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Código único auto-generado
  code TEXT NOT NULL UNIQUE,

  -- Información de contacto
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,

  -- Servicio y descripción
  service_type TEXT NOT NULL CHECK (service_type IN (
    'perforacion_diamantina',
    'anclajes_quimicos',
    'deteccion_metales',
    'pruebas_anclaje',
    'sellos_cortafuego',
    'alquiler_equipos_hilti',
    'otro'
  )),
  description TEXT,

  -- Pipeline
  stage_id UUID NOT NULL REFERENCES lead_stages(id),
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  expected_revenue DECIMAL(12, 2) DEFAULT 0,
  date_deadline DATE,

  -- Asignación
  user_id UUID REFERENCES user_profiles(id),
  source TEXT NOT NULL DEFAULT 'other' CHECK (source IN (
    'contact_form',
    'whatsapp',
    'phone',
    'email',
    'referral',
    'other'
  )),

  -- Vínculos con otros módulos
  source_message_id UUID,
  client_id UUID,
  quotation_id UUID,

  -- Cierre
  lost_reason_id UUID REFERENCES lost_reasons(id),
  lost_notes TEXT,
  date_closed TIMESTAMPTZ,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Trigger para updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para generar código de lead
CREATE OR REPLACE FUNCTION generate_lead_code()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_code TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');

  SELECT COUNT(*) + 1 INTO v_count
  FROM leads
  WHERE code LIKE 'LEAD-' || v_year || '-%';

  v_code := 'LEAD-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');

  NEW.code := v_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_lead_code
  BEFORE INSERT ON leads
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION generate_lead_code();

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_stage_id ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_code ON leads(code);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON leads(service_type);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- ==================== LEAD ACTIVITIES ====================

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Tipo de actividad
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call',
    'email',
    'meeting',
    'visit',
    'task',
    'note'
  )),

  -- Contenido
  title TEXT NOT NULL,
  description TEXT,

  -- Programación
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,

  -- Asignación
  user_id UUID REFERENCES user_profiles(id),

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_due_date ON lead_activities(due_date);
CREATE INDEX IF NOT EXISTS idx_lead_activities_is_completed ON lead_activities(is_completed);

-- ==================== LEAD NOTES ====================

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- ==================== RLS POLICIES ====================

-- Habilitar RLS
ALTER TABLE lead_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_stages (solo lectura para autenticados)
CREATE POLICY "Authenticated users can view lead_stages"
  ON lead_stages FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para lost_reasons (solo lectura para autenticados)
CREATE POLICY "Authenticated users can view lost_reasons"
  ON lost_reasons FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para leads
CREATE POLICY "Users with crm:view can view leads"
  ON leads FOR SELECT
  USING (user_has_permission(auth.uid(), 'crm:view'));

CREATE POLICY "Users with crm:create can create leads"
  ON leads FOR INSERT
  WITH CHECK (user_has_permission(auth.uid(), 'crm:create'));

CREATE POLICY "Users with crm:edit can update leads"
  ON leads FOR UPDATE
  USING (user_has_permission(auth.uid(), 'crm:edit'));

CREATE POLICY "Users with crm:delete can delete leads"
  ON leads FOR DELETE
  USING (user_has_permission(auth.uid(), 'crm:delete'));

-- Políticas para lead_activities
CREATE POLICY "Users with crm:view can view activities"
  ON lead_activities FOR SELECT
  USING (user_has_permission(auth.uid(), 'crm:view'));

CREATE POLICY "Users with crm:create can create activities"
  ON lead_activities FOR INSERT
  WITH CHECK (user_has_permission(auth.uid(), 'crm:create'));

CREATE POLICY "Users with crm:edit can update activities"
  ON lead_activities FOR UPDATE
  USING (user_has_permission(auth.uid(), 'crm:edit'));

CREATE POLICY "Users with crm:delete can delete activities"
  ON lead_activities FOR DELETE
  USING (user_has_permission(auth.uid(), 'crm:delete'));

-- Políticas para lead_notes
CREATE POLICY "Users with crm:view can view notes"
  ON lead_notes FOR SELECT
  USING (user_has_permission(auth.uid(), 'crm:view'));

CREATE POLICY "Users with crm:create can create notes"
  ON lead_notes FOR INSERT
  WITH CHECK (user_has_permission(auth.uid(), 'crm:create'));

CREATE POLICY "Users with crm:delete can delete notes"
  ON lead_notes FOR DELETE
  USING (user_has_permission(auth.uid(), 'crm:delete'));

-- ==================== VIEWS ====================

-- Vista de leads con información completa
CREATE OR REPLACE VIEW leads_with_details AS
SELECT
  l.*,
  s.display_name as stage_name,
  s.color as stage_color,
  s.is_won,
  s.is_lost,
  u.full_name as assigned_to_name,
  u.email as assigned_to_email,
  lr.display_name as lost_reason_name,
  (
    SELECT COUNT(*)
    FROM lead_activities la
    WHERE la.lead_id = l.id AND la.is_completed = false
  ) as pending_activities_count,
  (
    SELECT la.due_date
    FROM lead_activities la
    WHERE la.lead_id = l.id AND la.is_completed = false
    ORDER BY la.due_date ASC NULLS LAST
    LIMIT 1
  ) as next_activity_date
FROM leads l
LEFT JOIN lead_stages s ON l.stage_id = s.id
LEFT JOIN user_profiles u ON l.user_id = u.id
LEFT JOIN lost_reasons lr ON l.lost_reason_id = lr.id;

-- Vista de pipeline por etapa (para estadísticas)
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT
  s.id as stage_id,
  s.name as stage_name,
  s.display_name,
  s.color,
  s.position,
  s.is_won,
  s.is_lost,
  COUNT(l.id) as lead_count,
  COALESCE(SUM(l.expected_revenue), 0) as total_revenue,
  COALESCE(SUM(l.expected_revenue * l.probability / 100), 0) as weighted_revenue
FROM lead_stages s
LEFT JOIN leads l ON s.id = l.stage_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.display_name, s.color, s.position, s.is_won, s.is_lost
ORDER BY s.position;

-- ==================== FUNCTIONS ====================

-- Función para mover lead a otra etapa
CREATE OR REPLACE FUNCTION move_lead_to_stage(
  p_lead_id UUID,
  p_stage_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_lead leads;
  v_stage lead_stages;
BEGIN
  -- Obtener información de la etapa
  SELECT * INTO v_stage FROM lead_stages WHERE id = p_stage_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found';
  END IF;

  -- Actualizar el lead
  UPDATE leads
  SET
    stage_id = p_stage_id,
    probability = v_stage.probability,
    date_closed = CASE WHEN v_stage.is_won OR v_stage.is_lost THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_lead_id
  RETURNING * INTO v_lead;

  -- Crear actividad de registro
  INSERT INTO lead_activities (lead_id, activity_type, title, user_id, is_completed, completed_at, created_by)
  VALUES (
    p_lead_id,
    'note',
    'Movido a etapa: ' || v_stage.display_name,
    p_user_id,
    true,
    NOW(),
    p_user_id
  );

  RETURN v_lead;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar lead como ganado
CREATE OR REPLACE FUNCTION mark_lead_as_won(
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_won_stage_id UUID;
BEGIN
  SELECT id INTO v_won_stage_id FROM lead_stages WHERE is_won = true LIMIT 1;
  RETURN move_lead_to_stage(p_lead_id, v_won_stage_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar lead como perdido
CREATE OR REPLACE FUNCTION mark_lead_as_lost(
  p_lead_id UUID,
  p_lost_reason_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS leads AS $$
DECLARE
  v_lost_stage_id UUID;
  v_lead leads;
BEGIN
  SELECT id INTO v_lost_stage_id FROM lead_stages WHERE is_lost = true LIMIT 1;

  -- Actualizar razón de pérdida
  UPDATE leads
  SET
    lost_reason_id = p_lost_reason_id,
    lost_notes = p_notes
  WHERE id = p_lead_id;

  -- Mover a etapa perdido
  RETURN move_lead_to_stage(p_lead_id, v_lost_stage_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE lead_stages IS 'Etapas del pipeline de ventas';
COMMENT ON TABLE lost_reasons IS 'Razones configurables de pérdida de oportunidades';
COMMENT ON TABLE leads IS 'Leads y oportunidades de venta';
COMMENT ON TABLE lead_activities IS 'Actividades de seguimiento (llamadas, reuniones, visitas, etc.)';
COMMENT ON TABLE lead_notes IS 'Notas rápidas sobre leads';
COMMENT ON VIEW leads_with_details IS 'Vista de leads con información completa de etapa, responsable y razón de pérdida';
COMMENT ON VIEW pipeline_summary IS 'Resumen del pipeline por etapa para estadísticas';
COMMENT ON FUNCTION move_lead_to_stage IS 'Mueve un lead a otra etapa y registra la actividad';
COMMENT ON FUNCTION mark_lead_as_won IS 'Marca un lead como ganado';
COMMENT ON FUNCTION mark_lead_as_lost IS 'Marca un lead como perdido con razón';
