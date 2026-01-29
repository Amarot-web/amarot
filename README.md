# AMAROT - Sistema CRM y Web Corporativa

Sistema integral para AMAROT Perú que incluye:
- **Web corporativa** pública con blog y formulario de contacto
- **Panel de administración** para gestión de contenido
- **CRM completo** para gestión de leads, clientes y cotizaciones
- **Agente IA** conversacional para consultas del CRM

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 16** | Framework React con App Router |
| **TypeScript** | Tipado estático |
| **Supabase** | Base de datos PostgreSQL, autenticación y storage |
| **Tailwind CSS** | Estilos |
| **Vercel AI SDK** | Integración con OpenAI para el agente CRM |
| **Resend** | Envío de emails transaccionales |
| **Cloudflare Turnstile** | Protección anti-bots |

## Requisitos Previos

- Node.js 20.x o superior
- npm 10.x o superior
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para deployment)

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd amarot-nextjs
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales (ver sección [Variables de Entorno](#variables-de-entorno)).

### 4. Configurar la base de datos

Si es una instalación nueva, ejecuta los scripts de migración en el SQL Editor de Supabase:

1. Ejecuta los archivos en `supabase/migrations/` en orden numérico
2. O usa el paquete de migración en `supabase/export/` si estás migrando desde otro proyecto

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) | Sí |
| `OPENAI_API_KEY` | API Key de OpenAI para el agente CRM | Sí |
| `RESEND_API_KEY` | API Key de Resend para emails | Sí |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site Key de Cloudflare Turnstile | Sí |
| `TURNSTILE_SECRET_KEY` | Secret Key de Cloudflare Turnstile | Sí |
| `NEXT_PUBLIC_FEATURE_CRM_AGENT` | Habilitar agente CRM (`true`/`false`) | No |

## Estructura del Proyecto

```
amarot-nextjs/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── (public)/          # Rutas públicas (web corporativa)
│   │   ├── panel/             # Panel de administración
│   │   │   ├── admin/         # Gestión de usuarios y configuración
│   │   │   ├── blog/          # Gestión del blog
│   │   │   └── crm/           # Sistema CRM completo
│   │   ├── api/               # API Routes
│   │   └── login/             # Autenticación
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilidades y configuraciones
│   └── types/                 # Tipos TypeScript
├── public/                    # Archivos estáticos
├── supabase/
│   ├── migrations/            # Scripts SQL de migración
│   └── export/                # Paquete de migración
└── docs/                      # Documentación adicional
```

## Módulos Principales

### Web Pública (`/`)
- Página de inicio
- Servicios
- Blog con artículos
- Formulario de contacto

### Panel de Administración (`/panel`)
- **Dashboard**: Métricas y resumen
- **Blog**: Crear y editar artículos
- **Mensajes**: Gestión de contactos recibidos

### CRM (`/panel/crm`)
- **Pipeline**: Vista Kanban de leads por etapa
- **Leads**: Gestión completa de oportunidades
- **Clientes**: Base de datos de clientes
- **Actividades**: Seguimiento de tareas y llamadas
- **Cotizaciones**: Generación de propuestas
- **Configuración**: Etapas, motivos de pérdida, alertas

### Agente CRM IA
Asistente conversacional que permite:
- Consultar leads y actividades pendientes
- Ver métricas del pipeline
- Generar reportes por voz o texto
- Crear y modificar actividades

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total al sistema |
| **manager** | Gestión de CRM y contenido |
| **member** | Acceso limitado según configuración |

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run lint         # Verificar código
```

## Deployment en Vercel

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para instrucciones detalladas.

Resumen rápido:
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

## Crear Primer Usuario Admin

Después de configurar la base de datos, ejecuta el script para crear el primer administrador:

```bash
node scripts/create-admin.js
```

O sigue las instrucciones en [docs/FIRST_ADMIN.md](docs/FIRST_ADMIN.md).

## Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

Desarrollado para AMAROT Perú - 2026
