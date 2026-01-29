#!/usr/bin/env node
/**
 * Script para crear el primer usuario administrador
 *
 * Uso:
 *   node scripts/create-admin.js
 *
 * Prerequisitos:
 *   - Archivo .env.local configurado con las credenciales de Supabase
 *   - Base de datos migrada con las tablas necesarias
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno manualmente desde .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró el archivo .env.local');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

loadEnv();

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   Asegúrate de tener configurado .env.local con:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase con service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   AMAROT - Crear Usuario Administrador');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  try {
    // Solicitar datos
    const email = await question('📧 Email del administrador: ');
    const password = await question('🔐 Contraseña (mín. 8 caracteres): ');
    const fullName = await question('👤 Nombre completo: ');

    // Validaciones básicas
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    if (!fullName || fullName.length < 2) {
      throw new Error('El nombre es requerido');
    }

    console.log('');
    console.log('⏳ Creando usuario...');

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      throw new Error(`Error al crear usuario: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log(`✅ Usuario creado en Auth (ID: ${userId})`);

    // 2. Crear perfil de usuario
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName
      });

    if (profileError) {
      throw new Error(`Error al crear perfil: ${profileError.message}`);
    }
    console.log('✅ Perfil de usuario creado');

    // 3. Obtener rol admin
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error('No se encontró el rol "admin". ¿La base de datos está migrada correctamente?');
    }

    // 4. Asignar rol admin
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id
      });

    if (userRoleError) {
      throw new Error(`Error al asignar rol: ${userRoleError.message}`);
    }
    console.log('✅ Rol de administrador asignado');

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   ✅ ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`   Email:    ${email}`);
    console.log(`   Nombre:   ${fullName}`);
    console.log(`   Rol:      Administrador`);
    console.log('');
    console.log('   Ahora puedes iniciar sesión en /login');
    console.log('');

  } catch (error) {
    console.error('');
    console.error(`❌ Error: ${error.message}`);
    console.error('');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
