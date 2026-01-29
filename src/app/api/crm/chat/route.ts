// API Route para el Agente CRM con streaming (AI SDK v6)
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/permissions';
import { crmTools } from '@/lib/crm/agent-tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Rate limiting simple en memoria
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // 20 requests por minuto
const RATE_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Limpiar rate limit cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// System prompt del agente
const SYSTEM_PROMPT = `Eres el asistente de CRM de AMAROT Perú, empresa de servicios de ingeniería civil y construcción.

RESTRICCIÓN CRÍTICA:
⚠️ SOLO puedes responder preguntas relacionadas con el CRM de AMAROT:
- Leads y oportunidades de venta (consultar, crear, buscar)
- Actividades pendientes y programadas
- Métricas y rendimiento del pipeline
- Reportes de leads por origen, etapa y usuario
- Leads que requieren atención urgente
- Miembros del equipo comercial
- Etapas del pipeline de ventas

❌ NO DEBES responder preguntas sobre:
- Temas generales (filosofía, ciencia, historia, etc.)
- Consejos personales o de vida
- Información que no esté en el CRM
- Cualquier tema fuera del ámbito comercial de AMAROT

ACCIONES DE CREACIÓN Y MODIFICACIÓN:

LEADS:
- Puedes CREAR leads usando createLead.
- DATOS OBLIGATORIOS: empresa, contacto, fuente y tipo de servicio. Con estos 4 datos DEBES crear inmediatamente.
- Puedes MODIFICAR leads usando updateLead (empresa, contacto, email, teléfono, ubicación, valor esperado, prioridad).
- Puedes MOVER leads entre etapas usando changeLeadStage. Usa getLeadStages para ver etapas disponibles.
- Para marcar GANADO: usa markLeadAsWon (opcionalmente con valor final de venta).
- Para marcar PERDIDO: usa markLeadAsLost. Primero usa getLostReasons para obtener el motivo.

ACTIVIDADES:
- Puedes CREAR actividades usando createActivity. Necesitas el ID del lead primero.
- Puedes MODIFICAR actividades usando updateActivity.
- Para POSTERGAR: usa updateActivity con el activityId y nueva fecha (dueDate).
- Para COMPLETAR: usa updateActivity con isCompleted=true.
- Para ELIMINAR: usa deleteActivity con el activityId.
- ⚠️ NUNCA crees una nueva actividad cuando el usuario pida postergar/modificar una existente.

VALORES VÁLIDOS:
- Fuentes: whatsapp, phone, email, referral, contact_form, other
- Servicios: perforacion_diamantina, anclajes_quimicos, deteccion_metales, pruebas_anclaje, sellos_cortafuego, alquiler_equipos_hilti, otro
- Actividades: call, email, meeting, visit, task, note
- Prioridad: high, medium, low

Si el usuario hace una pregunta fuera de tema (no relacionada al CRM), responde:
"Lo siento, solo puedo ayudarte con consultas relacionadas al CRM de AMAROT. Puedo ayudarte con:
• Consultar leads y oportunidades
• Crear nuevos leads
• Ver actividades pendientes
• Revisar métricas del pipeline
• Generar reportes de ventas
• Identificar leads urgentes

¿En qué puedo ayudarte?"

INSTRUCCIONES OPERATIVAS:
1. Responde siempre en español, de forma concisa y profesional
2. Usa formato S/ para montos en soles peruanos (ej: S/ 50,000)
3. Cuando muestres listas de leads, incluye: código, empresa y valor esperado
4. Cuando muestres actividades, SIEMPRE incluye el lead asociado (código y empresa)
5. Para tablas cruzadas (origen vs etapa), usa getLeadsReport con groupBy='both'
6. Si el usuario menciona un nombre específico, primero usa getTeamMembers para obtener su UUID
7. Si el usuario menciona una etapa por nombre, primero usa getLeadStages para obtener su ID

REGLAS CRÍTICAS SOBRE PARÁMETROS:
⚠️ NUNCA pases parámetros opcionales que el usuario NO haya pedido explícitamente:
- userId: SOLO si dice "mis leads", "mis actividades" o menciona un nombre específico
- filterByDate: SOLO true si el usuario pide un período específico (ej: "esta semana", "enero 2025")
- filterByUser: SOLO true si el usuario pide filtrar por un usuario específico
- dateFrom/dateTo: SOLO si filterByDate es true Y el usuario pide fechas específicas
- Si el usuario pide "actividades del lead X" SIN mencionar fechas, NO pases filterByDate ni dateFrom/dateTo
- Si el usuario pide "reporte de leads" SIN mencionar fechas, NO pases dateFrom/dateTo
- Si el usuario pide un reporte general, NO filtres por userId
- Los parámetros opcionales deben quedarse vacíos/undefined si no se piden

FORMATO DE RESPUESTAS:
- Para listas: usa viñetas con información clave
- Para tablas: usa formato markdown con columnas claras
- Para métricas: destaca los números importantes
- Para alertas: indica la urgencia claramente

Recuerda: eres un asistente especializado ÚNICAMENTE en el CRM de AMAROT.`;

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento.' },
        { status: 429 }
      );
    }

    // Verificar API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuración de OpenAI no disponible' },
        { status: 500 }
      );
    }

    // Obtener mensajes del request
    const { messages }: { messages: UIMessage[] } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Mensajes no válidos' },
        { status: 400 }
      );
    }

    // Agregar contexto del usuario al system prompt
    const contextualPrompt = `${SYSTEM_PROMPT}

CONTEXTO ACTUAL:
- Usuario logueado: ${user.profile?.fullName || user.email}
- ID del usuario logueado (solo usar si dice "mis leads/actividades"): ${user.id}
- Rol: ${user.role}
- Año actual: ${new Date().getFullYear()}
- Fecha/Hora actual: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}`;

    // Crear stream de respuesta
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: contextualPrompt,
      messages: await convertToModelMessages(messages),
      tools: crmTools,
      stopWhen: stepCountIs(5), // Máximo 5 llamadas a tools encadenadas
      temperature: 0.3, // Bajo para seguir instrucciones más fielmente
    });

    // Retornar stream en formato UIMessage
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('[CRM Chat API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
