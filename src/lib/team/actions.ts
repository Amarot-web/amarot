'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

// ========================================
// CREATE TEAM MEMBER
// ========================================

interface CreateMemberData {
  email: string;
  fullName: string;
  phone: string | null;
  role: 'admin' | 'manager' | 'member';
  tempPassword: string;
}

export async function createTeamMember(
  data: CreateMemberData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.tempPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: data.fullName,
      },
    });

    if (authError) {
      console.error('[createTeamMember] Auth error:', authError);
      return { success: false, error: `Error creando usuario: ${authError.message}` };
    }

    if (!authData.user) {
      return { success: false, error: 'No se pudo crear el usuario' };
    }

    // 2. Crear perfil en user_profiles (usando admin client, bypasa RLS)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone || null,
        is_active: true,
      });

    if (profileError) {
      console.error('[createTeamMember] Profile error:', profileError);
      // Intentar eliminar el usuario de auth si falla el perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: `Error creando perfil: ${profileError.message}` };
    }

    // 3. Obtener el ID del rol seleccionado
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', data.role)
      .single();

    if (roleError || !roleData) {
      console.error('[createTeamMember] Role error:', roleError);
      return { success: false, error: 'No se encontró el rol seleccionado' };
    }

    // 4. Asignar el rol al usuario
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id: roleData.id,
      });

    if (userRoleError) {
      console.error('[createTeamMember] User role error:', userRoleError);
      return { success: false, error: `Error asignando rol: ${userRoleError.message}` };
    }

    revalidatePath('/panel/equipo');
    return { success: true };
  } catch (err) {
    console.error('[createTeamMember] Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

// ========================================
// UPDATE TEAM MEMBER
// ========================================

interface UpdateMemberData {
  userId: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  roleId: string;
  currentRoleAssignmentId: string | null;
  selectedPermissions: string[];
  showGranularPermissions: boolean;
}

export async function updateTeamMember(
  data: UpdateMemberData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    // 1. Actualizar perfil
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone || null,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.userId);

    if (profileError) {
      console.error('[updateTeamMember] Profile error:', profileError);
      return { success: false, error: `Error actualizando perfil: ${profileError.message}` };
    }

    // 2. Actualizar rol si hay cambio
    if (data.currentRoleAssignmentId) {
      // Eliminar rol anterior
      await supabase
        .from('user_roles')
        .delete()
        .eq('id', data.currentRoleAssignmentId);
    }

    // Asignar nuevo rol
    if (data.roleId) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: data.userId,
          role_id: data.roleId,
        }, {
          onConflict: 'user_id,role_id',
        });

      if (roleError) {
        console.error('[updateTeamMember] Role error:', roleError);
        return { success: false, error: `Error asignando rol: ${roleError.message}` };
      }
    }

    // 3. Actualizar permisos granulares (solo para member)
    if (data.showGranularPermissions) {
      // Eliminar permisos anteriores
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', data.userId);

      // Insertar nuevos permisos
      if (data.selectedPermissions.length > 0) {
        const { error: permError } = await supabase
          .from('user_permissions')
          .insert(
            data.selectedPermissions.map(permId => ({
              user_id: data.userId,
              permission_id: permId,
            }))
          );

        if (permError) {
          console.error('[updateTeamMember] Permission error:', permError);
          return { success: false, error: `Error asignando permisos: ${permError.message}` };
        }
      }
    }

    revalidatePath('/panel/equipo');
    return { success: true };
  } catch (err) {
    console.error('[updateTeamMember] Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function deleteTeamMember(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  try {
    // Eliminar permisos del usuario
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId);

    // Eliminar roles del usuario
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Eliminar perfil (esto NO elimina el usuario de auth.users)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/panel/equipo');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
