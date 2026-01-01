/**
 * Rate Limiter simple en memoria para API routes
 * Para producción con múltiples instancias, usar Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store en memoria - se limpia automáticamente cuando caduca
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Identificador único (ej: userId, IP) */
  identifier: string;
  /** Nombre del endpoint para diferenciar límites */
  endpoint: string;
  /** Máximo de requests permitidos */
  maxRequests: number;
  /** Ventana de tiempo en segundos */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // segundos hasta reset
}

/**
 * Verifica si un request está dentro del límite
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, endpoint, maxRequests, windowSeconds } = config;
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  // Si no existe entrada o ya expiró, crear nueva
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetIn: windowSeconds,
    };
  }

  // Incrementar contador
  entry.count++;
  rateLimitStore.set(key, entry);

  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  // Verificar si excede el límite
  if (entry.count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn,
    };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn,
  };
}

/**
 * Configuraciones predefinidas de rate limit
 */
export const RATE_LIMITS = {
  // Upload: 10 archivos por minuto por usuario
  upload: {
    maxRequests: 10,
    windowSeconds: 60,
    endpoint: 'upload',
  },
  // Generate SEO: 20 requests por minuto por usuario
  generateSeo: {
    maxRequests: 20,
    windowSeconds: 60,
    endpoint: 'generate-seo',
  },
  // Default: 100 requests por minuto
  default: {
    maxRequests: 100,
    windowSeconds: 60,
    endpoint: 'default',
  },
} as const;
