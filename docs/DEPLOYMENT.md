# Guía de Deployment en Vercel

Esta guía explica cómo desplegar AMAROT en Vercel.

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio del proyecto en GitHub, GitLab o Bitbucket
3. Base de datos configurada en Supabase
4. API Keys de servicios externos (OpenAI, Resend, Turnstile)

## Paso 1: Conectar el Repositorio

1. Inicia sesión en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona el repositorio `amarot-nextjs`
4. Click en **"Import"**

## Paso 2: Configurar Variables de Entorno

En la pantalla de configuración del proyecto:

1. Expande la sección **"Environment Variables"**
2. Agrega cada variable (copiar nombre y valor):

| Variable | Ejemplo |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1...` |
| `OPENAI_API_KEY` | `sk-...` |
| `RESEND_API_KEY` | `re_...` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAA...` |
| `TURNSTILE_SECRET_KEY` | `0x4AAAA...` |
| `NEXT_PUBLIC_FEATURE_CRM_AGENT` | `true` |

> **Importante**: Asegúrate de que las variables estén configuradas para todos los entornos (Production, Preview, Development).

## Paso 3: Configurar Build Settings

Vercel detectará automáticamente que es un proyecto Next.js. Verifica:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. Una vez completado, tendrás una URL como `amarot-xxxxx.vercel.app`

## Paso 5: Configurar Dominio Personalizado

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `amarotperu.com`)
3. Configura los DNS según las instrucciones de Vercel:

```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

### Subdominio para el Panel (Opcional)

Si quieres usar `app.amarotperu.com` para el panel:

1. Agrega el dominio `app.amarotperu.com`
2. Configura el DNS:

```
Tipo: CNAME
Nombre: app
Valor: cname.vercel-dns.com
```

## Paso 6: Configurar Supabase para Producción

En el Dashboard de Supabase:

1. Ve a **Authentication** → **URL Configuration**
2. Configura las URLs:
   - **Site URL**: `https://amarotperu.com`
   - **Redirect URLs**:
     - `https://amarotperu.com/**`
     - `https://app.amarotperu.com/**`

## Paso 7: Configurar Google Analytics (Opcional)

1. Ve al panel: **Administración** → **Analytics**
2. Ingresa tu **Measurement ID** de Google Analytics 4 (formato: G-XXXXXXXXXX)
3. Click en **Guardar**

El tracking se activará automáticamente en todas las páginas públicas.

---

## Verificación Post-Deploy

Después del deployment, verifica:

- [ ] La página principal carga correctamente
- [ ] El formulario de contacto funciona (envía email)
- [ ] El login/logout funciona
- [ ] El panel de administración es accesible
- [ ] Las imágenes del blog cargan
- [ ] El agente CRM responde (si está habilitado)

## Deployments Automáticos

Vercel desplegará automáticamente cuando:

- **Production**: Push a la rama `main`
- **Preview**: Pull requests a `main`

## Rollback

Si algo sale mal:

1. Ve a **Deployments** en el dashboard de Vercel
2. Busca el deployment anterior que funcionaba
3. Click en **"..."** → **"Promote to Production"**

## Variables de Entorno Sensibles

**NUNCA** expongas estas claves:
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`

Estas solo deben estar en Vercel y nunca en el código.

## Troubleshooting

### Error: "Invalid API Key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de no tener espacios extra al copiar las keys

### Error: "Supabase connection failed"
- Verifica que la URL de Supabase sea correcta
- Confirma que el proyecto Supabase esté activo

### Las imágenes no cargan
- Verifica la configuración del bucket de Storage en Supabase
- Confirma que las políticas RLS permitan lectura pública

### El agente CRM no responde
- Verifica que `OPENAI_API_KEY` sea válida
- Confirma que `NEXT_PUBLIC_FEATURE_CRM_AGENT=true`

---

## Costos Estimados

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| Vercel | Pro | ~$20 USD |
| Supabase | Pro | ~$25 USD |
| OpenAI | Pay-as-you-go | ~$5-20 USD |
| Resend | Free tier | $0 (hasta 3k emails/mes) |
| Turnstile | Free | $0 |

**Total estimado**: $50-65 USD/mes

---

Para más información, consulta la [documentación oficial de Vercel](https://vercel.com/docs).
