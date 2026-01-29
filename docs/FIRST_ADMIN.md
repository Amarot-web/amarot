# Crear el Primer Usuario Administrador

Después de migrar la base de datos a un nuevo proyecto Supabase, necesitas crear el primer usuario administrador para acceder al panel.

## Opción 1: Usando el Dashboard de Supabase (Recomendado)

### Paso 1: Crear el usuario en Authentication

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Users**
3. Click en **"Add user"** → **"Create new user"**
4. Completa los datos:
   - **Email**: email del administrador
   - **Password**: contraseña segura (mínimo 8 caracteres)
   - **Auto Confirm User**: ✅ Activar
5. Click en **"Create user"**
6. Copia el **User UID** que se genera (lo necesitarás)

### Paso 2: Crear el perfil de usuario

1. Ve a **Table Editor** → tabla `user_profiles`
2. Click en **"Insert"** → **"Insert row"**
3. Completa los campos:

```
id: [pegar el User UID del paso anterior]
email: [mismo email]
full_name: Administrador
avatar_url: (dejar vacío)
created_at: (se autocompleta)
updated_at: (se autocompleta)
```

4. Click en **"Save"**

### Paso 3: Asignar rol de administrador

1. Ve a **Table Editor** → tabla `roles`
2. Busca el rol `admin` y copia su `id`
3. Ve a **Table Editor** → tabla `user_roles`
4. Click en **"Insert"** → **"Insert row"**
5. Completa:

```
user_id: [User UID del paso 1]
role_id: [ID del rol admin]
```

6. Click en **"Save"**

### Paso 4: Verificar acceso

1. Ve a la aplicación (`https://tu-dominio.com/login`)
2. Inicia sesión con el email y contraseña
3. Deberías poder acceder al panel de administración

---

## Opción 2: Usando SQL en el SQL Editor

Si prefieres hacerlo todo con SQL, ejecuta este script en el **SQL Editor** de Supabase:

```sql
-- ============================================================
-- CREAR PRIMER ADMINISTRADOR
-- ============================================================
-- IMPORTANTE: Primero crea el usuario manualmente en
-- Authentication → Users, luego ejecuta este script
-- ============================================================

-- Reemplaza estos valores:
DO $$
DECLARE
    admin_user_id UUID := 'PEGAR_USER_UID_AQUI'; -- El UID del usuario creado
    admin_email TEXT := 'admin@ejemplo.com';     -- El email del admin
    admin_name TEXT := 'Administrador';          -- Nombre a mostrar
    admin_role_id UUID;
BEGIN
    -- Obtener el ID del rol admin
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

    -- Crear perfil de usuario
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (admin_user_id, admin_email, admin_name)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    -- Asignar rol de administrador
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE 'Usuario administrador configurado correctamente';
END $$;
```

---

## Opción 3: Usando el Script de Node.js

### Prerrequisitos

- Node.js instalado
- Variables de entorno configuradas en `.env.local`

### Ejecutar el script

```bash
# Desde la raíz del proyecto
node scripts/create-admin.js
```

El script te pedirá:
1. Email del administrador
2. Contraseña
3. Nombre completo

---

## Verificación

Después de crear el administrador, verifica:

1. **Login funciona**: Puedes iniciar sesión en `/login`
2. **Acceso al panel**: Puedes ver `/panel/dashboard`
3. **Rol correcto**: En el menú aparece como "Administrador"

## Troubleshooting

### "Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Confirma que el usuario esté confirmado en Authentication

### "Access denied" al entrar al panel
- Verifica que exista el registro en `user_profiles`
- Confirma que tenga el rol asignado en `user_roles`

### El usuario no aparece en la lista de equipo
- Verifica que `user_profiles.id` coincida con el UID de Auth

---

## Crear Usuarios Adicionales

Una vez tengas acceso como admin:

1. Ve a **Panel** → **Administración** → **Equipo**
2. Click en **"Nuevo miembro"**
3. Completa el formulario
4. El usuario recibirá un email para establecer su contraseña
