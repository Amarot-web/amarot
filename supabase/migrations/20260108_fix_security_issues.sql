-- ============================================================
-- SCRIPT DE CORRECCIÓN DE SEGURIDAD - AMAROT CRM
-- Fecha: 2026-01-08
-- Descripción: Corrige advertencias del linter de Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: CORREGIR SEARCH PATH EN FUNCIONES
-- Previene ataques de inyección de search_path
-- ============================================================

-- Funciones de utilidad general
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.uppercase_client_name() SET search_path = '';

-- Funciones de autenticación y permisos
ALTER FUNCTION public.user_has_permission(text) SET search_path = '';
ALTER FUNCTION public.get_user_role() SET search_path = '';
ALTER FUNCTION public.get_user_permissions() SET search_path = '';
ALTER FUNCTION public.assign_admin_role(uuid) SET search_path = '';

-- Funciones de leads y CRM
ALTER FUNCTION public.update_lead_type_on_stage_change() SET search_path = '';
ALTER FUNCTION public.generate_lead_code() SET search_path = '';
ALTER FUNCTION public.move_lead_to_stage(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.mark_lead_as_won(uuid, numeric) SET search_path = '';
ALTER FUNCTION public.mark_lead_as_lost(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.get_lead_alerts(uuid) SET search_path = '';
ALTER FUNCTION public.find_duplicate_leads(text, text, text) SET search_path = '';
ALTER FUNCTION public.convert_message_to_lead(uuid) SET search_path = '';
ALTER FUNCTION public.reactivate_lost_lead(uuid, uuid) SET search_path = '';

-- Funciones de alertas y configuración
ALTER FUNCTION public.get_alert_setting(text) SET search_path = '';
ALTER FUNCTION public.get_alert_interval(text) SET search_path = '';
ALTER FUNCTION public.get_assignment_user(text) SET search_path = '';

-- Funciones de cotizaciones
ALTER FUNCTION public.generate_quotation_code() SET search_path = '';

-- ============================================================
-- PARTE 2: CREAR FUNCIÓN HELPER PARA VERIFICAR ROL
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$;

-- ============================================================
-- PARTE 3: CORREGIR POLÍTICAS RLS - TABLA CLIENTS
-- ============================================================

-- Eliminar políticas permisivas existentes
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Crear políticas restrictivas
-- INSERT: Solo admins y comerciales pueden crear clientes
CREATE POLICY "Staff can insert clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  );

-- UPDATE: Solo admins y comerciales pueden actualizar clientes
CREATE POLICY "Staff can update clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  );

-- DELETE: Solo admins pueden eliminar clientes
CREATE POLICY "Admins can delete clients" ON public.clients
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================================
-- PARTE 4: CORREGIR POLÍTICAS RLS - TABLA CONTACT_MESSAGES
-- ============================================================

-- INSERT anónimo: Mantener para formulario de contacto público
-- (Este es intencional - el formulario de contacto debe ser público)
-- No modificamos "Anyone can insert contact_messages"

-- UPDATE: Solo admins pueden actualizar mensajes
DROP POLICY IF EXISTS "Authenticated users can update contact_messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact_messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  );

-- ============================================================
-- PARTE 5: CORREGIR POLÍTICAS RLS - TABLAS DE COSTOS
-- (equipment_costs, labor_costs, logistics_costs, material_costs)
-- ============================================================

-- EQUIPMENT_COSTS
DROP POLICY IF EXISTS "Authenticated users can manage equipment_costs" ON public.equipment_costs;

CREATE POLICY "Staff can read equipment_costs" ON public.equipment_costs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert equipment_costs" ON public.equipment_costs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update equipment_costs" ON public.equipment_costs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete equipment_costs" ON public.equipment_costs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- LABOR_COSTS
DROP POLICY IF EXISTS "Authenticated users can manage labor_costs" ON public.labor_costs;

CREATE POLICY "Staff can read labor_costs" ON public.labor_costs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert labor_costs" ON public.labor_costs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update labor_costs" ON public.labor_costs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete labor_costs" ON public.labor_costs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- LOGISTICS_COSTS
DROP POLICY IF EXISTS "Authenticated users can manage logistics_costs" ON public.logistics_costs;

CREATE POLICY "Staff can read logistics_costs" ON public.logistics_costs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert logistics_costs" ON public.logistics_costs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update logistics_costs" ON public.logistics_costs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete logistics_costs" ON public.logistics_costs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- MATERIAL_COSTS
DROP POLICY IF EXISTS "Authenticated users can manage material_costs" ON public.material_costs;

CREATE POLICY "Staff can read material_costs" ON public.material_costs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert material_costs" ON public.material_costs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update material_costs" ON public.material_costs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete material_costs" ON public.material_costs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================================
-- PARTE 6: CORREGIR POLÍTICAS RLS - TABLA PRICE_LIST
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can manage price_list" ON public.price_list;

CREATE POLICY "Staff can read price_list" ON public.price_list
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert price_list" ON public.price_list
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update price_list" ON public.price_list
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete price_list" ON public.price_list
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================================
-- PARTE 7: CORREGIR POLÍTICAS RLS - TABLAS DE COTIZACIONES
-- ============================================================

-- QUOTATIONS
DROP POLICY IF EXISTS "Authenticated users can delete quotations" ON public.quotations;
DROP POLICY IF EXISTS "Authenticated users can insert quotations" ON public.quotations;
DROP POLICY IF EXISTS "Authenticated users can update quotations" ON public.quotations;

-- INSERT: Staff comercial y admins pueden crear cotizaciones
CREATE POLICY "Staff can insert quotations" ON public.quotations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  );

-- UPDATE: El creador o admins pueden actualizar
CREATE POLICY "Owner or admin can update quotations" ON public.quotations
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- DELETE: Solo admins pueden eliminar cotizaciones
CREATE POLICY "Admins can delete quotations" ON public.quotations
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- QUOTATION_ITEMS
DROP POLICY IF EXISTS "Authenticated users can manage quotation_items" ON public.quotation_items;

CREATE POLICY "Staff can read quotation_items" ON public.quotation_items
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: Quien tenga acceso a la cotización padre
CREATE POLICY "Staff can insert quotation_items" ON public.quotation_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_id
      AND (
        q.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin', 'comercial')
        )
      )
    )
  );

-- UPDATE: Quien tenga acceso a la cotización padre
CREATE POLICY "Owner or staff can update quotation_items" ON public.quotation_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_id
      AND (
        q.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin')
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_id
      AND (
        q.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin')
        )
      )
    )
  );

-- DELETE: Quien tenga acceso a la cotización padre o admins
CREATE POLICY "Owner or admin can delete quotation_items" ON public.quotation_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations q
      WHERE q.id = quotation_id
      AND (
        q.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin')
        )
      )
    )
  );

-- QUOTATION_HISTORY
DROP POLICY IF EXISTS "Authenticated users can insert quotation_history" ON public.quotation_history;

CREATE POLICY "Staff can insert quotation_history" ON public.quotation_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'comercial')
    )
  );

-- ============================================================
-- PARTE 8: CORREGIR POLÍTICAS RLS - TABLA SYSTEM_SETTINGS
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can update system_settings" ON public.system_settings;

-- Solo superadmins pueden modificar configuración del sistema
CREATE POLICY "Superadmins can update system_settings" ON public.system_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- ============================================================
-- PARTE 9: VERIFICACIÓN FINAL
-- ============================================================

-- Verificar que las nuevas funciones helper tienen search_path correcto
ALTER FUNCTION public.current_user_role() SET search_path = '';
ALTER FUNCTION public.is_admin_or_superadmin() SET search_path = '';

-- ============================================================
-- NOTAS IMPORTANTES:
-- ============================================================
-- 1. La política "Anyone can insert contact_messages" se mantiene
--    intencionalmente permisiva para el formulario de contacto público.
--
-- 2. Para activar "Leaked Password Protection":
--    - Ir a Supabase Dashboard > Authentication > Providers > Email
--    - Activar "Enable Leaked Password Protection"
--
-- 3. Roles asumidos en el sistema:
--    - superadmin: Acceso total al sistema
--    - admin: Gestión de datos y usuarios
--    - comercial: Gestión de leads, clientes y cotizaciones
--    - viewer: Solo lectura (no implementado aquí)
--
-- 4. Ejecutar este script en el SQL Editor de Supabase
-- ============================================================
