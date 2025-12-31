import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthUser } from '@/lib/auth/permissions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres un experto en SEO para empresas de construcción e ingeniería en Perú.
Tu tarea es generar contenido SEO optimizado para artículos de blog.

Contexto de la empresa:
- AMAROT Perú: Servicios de perforación diamantina, anclajes químicos, detección de metales, pruebas de anclaje, sellos cortafuego
- Público objetivo: Ingenieros civiles, arquitectos, contratistas, empresas constructoras, proyectos de infraestructura
- Ubicación: Lima, Perú
- Industria: Construcción, ingeniería civil, mantenimiento industrial

Genera contenido que:
1. Use palabras clave relevantes del sector construcción naturalmente
2. Sea atractivo para hacer clic (optimizado para CTR)
3. Respete ESTRICTAMENTE los límites de caracteres indicados
4. Mantenga un tono profesional pero accesible
5. Incluya términos técnicos del sector cuando sea apropiado

IMPORTANTE: Los límites de caracteres son ESTRICTOS. No los excedas.`;

interface GenerateSEORequest {
  title: string;
  content: string;
  slug: string;
  field?: 'all' | 'excerpt' | 'metaTitle' | 'metaDescription';
}

/**
 * POST /api/blog/generate-seo
 * Genera contenido SEO optimizado usando OpenAI GPT-4o-mini
 */
export async function POST(request: NextRequest) {
  // Verificar autenticación
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Verificar que la API key esté configurada
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key no configurada' },
      { status: 500 }
    );
  }

  try {
    const { title, content, slug, field = 'all' }: GenerateSEORequest = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    // Limitar el contenido a 3000 caracteres para optimizar tokens
    const truncatedContent = content?.slice(0, 3000) || '';

    // Construir el prompt según el campo solicitado
    let userPrompt = `Analiza el siguiente artículo de blog y genera contenido SEO optimizado.

TÍTULO: ${title}
URL SLUG: ${slug || 'sin-slug'}

CONTENIDO DEL ARTÍCULO:
${truncatedContent || '(Sin contenido aún - genera basándote solo en el título)'}

`;

    if (field === 'all') {
      userPrompt += `Genera los siguientes tres elementos:

1. EXTRACTO (máximo 160 caracteres): Un resumen breve y atractivo del artículo que capture la esencia del contenido.

2. META TÍTULO (máximo 60 caracteres): Un título optimizado para SEO que incluya palabras clave relevantes. Debe ser diferente al título original pero mantener la esencia.

3. META DESCRIPCIÓN (máximo 160 caracteres): Una descripción que invite a hacer clic, usando llamadas a la acción sutiles y palabras clave del sector.

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
{
  "excerpt": "tu extracto aquí",
  "metaTitle": "tu meta título aquí",
  "metaDescription": "tu meta descripción aquí"
}`;
    } else if (field === 'excerpt') {
      userPrompt += `Genera un EXTRACTO (máximo 160 caracteres): Un resumen breve y atractivo del artículo que capture la esencia del contenido.

Responde ÚNICAMENTE en formato JSON:
{
  "excerpt": "tu extracto aquí"
}`;
    } else if (field === 'metaTitle') {
      userPrompt += `Genera un META TÍTULO (máximo 60 caracteres): Un título optimizado para SEO que incluya palabras clave relevantes. Debe ser diferente al título original pero mantener la esencia.

Responde ÚNICAMENTE en formato JSON:
{
  "metaTitle": "tu meta título aquí"
}`;
    } else if (field === 'metaDescription') {
      userPrompt += `Genera una META DESCRIPCIÓN (máximo 160 caracteres): Una descripción que invite a hacer clic, usando llamadas a la acción sutiles y palabras clave del sector.

Responde ÚNICAMENTE en formato JSON:
{
  "metaDescription": "tu meta descripción aquí"
}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { error: 'No se recibió respuesta de OpenAI' },
        { status: 500 }
      );
    }

    // Parsear la respuesta JSON
    const seoData = JSON.parse(responseText);

    // Validar y truncar si es necesario (por seguridad)
    const result: Record<string, string> = {};

    if (seoData.excerpt) {
      result.excerpt = seoData.excerpt.slice(0, 160);
    }
    if (seoData.metaTitle) {
      result.metaTitle = seoData.metaTitle.slice(0, 60);
    }
    if (seoData.metaDescription) {
      result.metaDescription = seoData.metaDescription.slice(0, 160);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API generate-seo] Error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Error de OpenAI: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
