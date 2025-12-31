-- ============================================
-- AMAROT Panel de Administración
-- Migración: Tablas de Auth, Roles y Blog
-- Fecha: 2025-01-XX
-- ============================================

-- ==================== USER PROFILES ====================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== ROLES ====================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,          -- 'admin', 'manager', 'member'
  display_name TEXT NOT NULL,         -- 'Administrador', 'Gerente', 'Miembro'
  description TEXT,
  is_system BOOLEAN DEFAULT false,    -- true = no se puede eliminar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar roles base
INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('admin', 'Administrador', 'Acceso total al sistema, incluyendo gestión del equipo', true),
  ('manager', 'Gerente', 'Acceso a todos los módulos excepto gestión del equipo', true),
  ('member', 'Miembro', 'Acceso limitado según permisos asignados', true)
ON CONFLICT (name) DO NOTHING;

-- ==================== PERMISSIONS ====================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,               -- 'quotations', 'clients', 'blog', 'team', 'analytics'
  action TEXT NOT NULL,               -- 'view', 'create', 'edit', 'delete'
  name TEXT NOT NULL UNIQUE,          -- 'quotations:view', 'blog:create'
  display_name TEXT NOT NULL,
  UNIQUE(module, action)
);

-- Insertar permisos base
INSERT INTO permissions (module, action, name, display_name) VALUES
  -- Cotizaciones
  ('quotations', 'view', 'quotations:view', 'Ver cotizaciones'),
  ('quotations', 'create', 'quotations:create', 'Crear cotizaciones'),
  ('quotations', 'edit', 'quotations:edit', 'Editar cotizaciones'),
  ('quotations', 'delete', 'quotations:delete', 'Eliminar cotizaciones'),
  -- Clientes
  ('clients', 'view', 'clients:view', 'Ver clientes'),
  ('clients', 'create', 'clients:create', 'Crear clientes'),
  ('clients', 'edit', 'clients:edit', 'Editar clientes'),
  ('clients', 'delete', 'clients:delete', 'Eliminar clientes'),
  -- Blog
  ('blog', 'view', 'blog:view', 'Ver posts del blog'),
  ('blog', 'create', 'blog:create', 'Crear posts'),
  ('blog', 'edit', 'blog:edit', 'Editar posts'),
  ('blog', 'delete', 'blog:delete', 'Eliminar posts'),
  -- Equipo
  ('team', 'view', 'team:view', 'Ver miembros del equipo'),
  ('team', 'create', 'team:create', 'Invitar miembros'),
  ('team', 'edit', 'team:edit', 'Editar miembros'),
  ('team', 'delete', 'team:delete', 'Eliminar miembros'),
  -- Analytics
  ('analytics', 'view', 'analytics:view', 'Ver analytics')
ON CONFLICT (name) DO NOTHING;

-- ==================== ROLE_PERMISSIONS ====================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- Asignar todos los permisos al rol admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Asignar permisos al rol manager (todo excepto team)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager' AND p.module != 'team'
ON CONFLICT DO NOTHING;

-- ==================== USER_ROLES ====================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES user_profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- ==================== USER_PERMISSIONS ====================
-- Permisos adicionales asignados directamente a usuarios

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- ==================== BLOG: TAGS ====================

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== BLOG: POSTS ====================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB,                      -- TipTap JSON format
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  publish_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT false,
  author_id UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_at ON blog_posts(publish_at);

-- ==================== BLOG: POST_TAGS ====================

CREATE TABLE IF NOT EXISTS blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- ==================== BLOG: MEDIA ====================

CREATE TABLE IF NOT EXISTS blog_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  size_bytes INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== VIEWS Y FUNCIONES ====================

-- Vista de permisos efectivos (rol + permisos directos)
CREATE OR REPLACE VIEW user_effective_permissions AS
SELECT DISTINCT
  u.id as user_id,
  p.name as permission_name,
  p.module,
  p.action
FROM user_profiles u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE p.id IS NOT NULL
UNION
SELECT DISTINCT
  u.id,
  p.name,
  p.module,
  p.action
FROM user_profiles u
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions p ON up.permission_id = p.id;

-- Función para verificar si un usuario tiene un permiso
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_effective_permissions
    WHERE user_id = p_user_id AND permission_name = p_permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol principal del usuario
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT r.name INTO v_role
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
  ORDER BY CASE r.name
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    ELSE 3
  END
  LIMIT 1;

  RETURN COALESCE(v_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener todos los permisos de un usuario
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission_name TEXT, module TEXT, action TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uep.permission_name,
    uep.module,
    uep.action
  FROM user_effective_permissions uep
  WHERE uep.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RLS POLICIES ====================

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users with team:view can view all profiles"
  ON user_profiles FOR SELECT
  USING (user_has_permission(auth.uid(), 'team:view'));

CREATE POLICY "Users with team:edit can update profiles"
  ON user_profiles FOR UPDATE
  USING (user_has_permission(auth.uid(), 'team:edit'));

-- Políticas para roles (solo lectura para todos los autenticados)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para permissions (solo lectura)
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para role_permissions (solo lectura)
CREATE POLICY "Authenticated users can view role_permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users with team:view can view all user_roles"
  ON user_roles FOR SELECT
  USING (user_has_permission(auth.uid(), 'team:view'));

CREATE POLICY "Users with team:edit can manage user_roles"
  ON user_roles FOR ALL
  USING (user_has_permission(auth.uid(), 'team:edit'));

-- Políticas para user_permissions
CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users with team:view can view all user_permissions"
  ON user_permissions FOR SELECT
  USING (user_has_permission(auth.uid(), 'team:view'));

CREATE POLICY "Users with team:edit can manage user_permissions"
  ON user_permissions FOR ALL
  USING (user_has_permission(auth.uid(), 'team:edit'));

-- Políticas para blog_tags
CREATE POLICY "Anyone can view blog_tags"
  ON blog_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with blog:create can manage tags"
  ON blog_tags FOR ALL
  USING (user_has_permission(auth.uid(), 'blog:create'));

-- Políticas para blog_posts
CREATE POLICY "Published posts are visible to all"
  ON blog_posts FOR SELECT
  USING (status = 'published' AND (publish_at IS NULL OR publish_at <= NOW()));

CREATE POLICY "Users with blog:view can see all posts"
  ON blog_posts FOR SELECT
  USING (user_has_permission(auth.uid(), 'blog:view'));

CREATE POLICY "Users with blog:create can create posts"
  ON blog_posts FOR INSERT
  WITH CHECK (user_has_permission(auth.uid(), 'blog:create'));

CREATE POLICY "Users with blog:edit can update posts"
  ON blog_posts FOR UPDATE
  USING (user_has_permission(auth.uid(), 'blog:edit'));

CREATE POLICY "Users with blog:delete can delete posts"
  ON blog_posts FOR DELETE
  USING (user_has_permission(auth.uid(), 'blog:delete'));

-- Políticas para blog_post_tags
CREATE POLICY "Anyone can view blog_post_tags"
  ON blog_post_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with blog:edit can manage post_tags"
  ON blog_post_tags FOR ALL
  USING (user_has_permission(auth.uid(), 'blog:edit'));

-- Políticas para blog_media
CREATE POLICY "Authenticated users can view media"
  ON blog_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with blog:create can upload media"
  ON blog_media FOR INSERT
  WITH CHECK (user_has_permission(auth.uid(), 'blog:create'));

CREATE POLICY "Users with blog:delete can delete media"
  ON blog_media FOR DELETE
  USING (user_has_permission(auth.uid(), 'blog:delete'));

-- ==================== HELPER PARA PRIMER ADMIN ====================

-- Función para asignar rol de admin al primer usuario registrado
-- Ejecutar manualmente después de crear el primer usuario:
-- SELECT assign_admin_role('USER_UUID_HERE');

CREATE OR REPLACE FUNCTION assign_admin_role(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_admin_role_id UUID;
BEGIN
  -- Obtener ID del rol admin
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin';

  -- Insertar user_profile si no existe
  INSERT INTO user_profiles (id, email, full_name)
  SELECT p_user_id, email, COALESCE(raw_user_meta_data->>'full_name', email)
  FROM auth.users
  WHERE id = p_user_id
  ON CONFLICT (id) DO NOTHING;

  -- Asignar rol de admin
  INSERT INTO user_roles (user_id, role_id)
  VALUES (p_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE user_profiles IS 'Perfiles extendidos de usuarios, enlazados a auth.users';
COMMENT ON TABLE roles IS 'Roles del sistema: admin, manager, member';
COMMENT ON TABLE permissions IS 'Permisos granulares por módulo y acción';
COMMENT ON TABLE role_permissions IS 'Relación muchos a muchos entre roles y permisos';
COMMENT ON TABLE user_roles IS 'Roles asignados a cada usuario';
COMMENT ON TABLE user_permissions IS 'Permisos adicionales asignados directamente a usuarios';
COMMENT ON TABLE blog_tags IS 'Tags para categorizar posts del blog';
COMMENT ON TABLE blog_posts IS 'Posts del blog con contenido TipTap';
COMMENT ON TABLE blog_post_tags IS 'Relación muchos a muchos entre posts y tags';
COMMENT ON TABLE blog_media IS 'Imágenes y archivos del blog';
COMMENT ON FUNCTION user_has_permission IS 'Verifica si un usuario tiene un permiso específico';
COMMENT ON FUNCTION get_user_role IS 'Obtiene el rol principal de un usuario';
COMMENT ON FUNCTION get_user_permissions IS 'Lista todos los permisos efectivos de un usuario';
