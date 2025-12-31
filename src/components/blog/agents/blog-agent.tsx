'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AgentState = 'idle' | 'thinking' | 'success' | 'error';
type SEOField = 'all' | 'excerpt' | 'metaTitle' | 'metaDescription';

interface BlogAgentProps {
  onGenerate: (field: SEOField) => Promise<void>;
  disabled?: boolean;
  hasContent: boolean;
  contentLength?: number;
  minContentLength?: number;
}

/**
 * Agente SEO - El Asistente de Blog de AMAROT
 * Un agente profesional que ayuda a generar contenido SEO optimizado
 */
export function BlogAgent({
  onGenerate,
  disabled,
  hasContent,
  contentLength = 0,
  minContentLength = 200
}: BlogAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AgentState>('idle');
  const [message, setMessage] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calcular progreso hacia el mínimo de contenido
  const contentProgress = Math.min((contentLength / minContentLength) * 100, 100);
  const isReady = contentLength >= minContentLength;

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async (field: SEOField) => {
    setState('thinking');
    setMessage(getThinkingMessage(field));

    try {
      await onGenerate(field);
      setState('success');
      setMessage(getSuccessMessage(field));

      // Volver a idle después de 2 segundos
      setTimeout(() => {
        setState('idle');
        setMessage('');
        setIsOpen(false);
      }, 2000);
    } catch {
      setState('error');
      setMessage('¡Ups! Algo salió mal');

      setTimeout(() => {
        setState('idle');
        setMessage('');
      }, 3000);
    }
  };

  const getThinkingMessage = (field: SEOField): string => {
    switch (field) {
      case 'excerpt': return 'Creando un extracto atractivo...';
      case 'metaTitle': return 'Optimizando el título SEO...';
      case 'metaDescription': return 'Escribiendo la meta descripción...';
      case 'all': return 'Generando todo el SEO...';
    }
  };

  const getSuccessMessage = (field: SEOField): string => {
    switch (field) {
      case 'excerpt': return '¡Extracto listo!';
      case 'metaTitle': return '¡Título SEO optimizado!';
      case 'metaDescription': return '¡Meta descripción lista!';
      case 'all': return '¡Todo el SEO está listo!';
    }
  };

  const menuItems = [
    { field: 'all' as SEOField, icon: '🚀', label: 'Generar Todo', desc: 'Extracto + Meta título + Meta descripción' },
    { field: 'excerpt' as SEOField, icon: '✨', label: 'Generar Extracto', desc: 'Resumen breve del artículo' },
    { field: 'metaTitle' as SEOField, icon: '📝', label: 'Generar Meta Título', desc: 'Título optimizado para SEO' },
    { field: 'metaDescription' as SEOField, icon: '📋', label: 'Generar Meta Descripción', desc: 'Descripción para buscadores' },
  ];

  return (
    <div ref={popoverRef} className="relative">
      {/* Botón flotante con avatar */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || state === 'thinking'}
        className={`
          relative w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center overflow-hidden
          transition-all duration-300
          ${state === 'thinking' ? 'cursor-wait' : 'cursor-pointer'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          bg-transparent
          hover:shadow-xl hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30
        `}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          rotate: state === 'thinking' ? [0, 5, -5, 0] : 0
        }}
        transition={{
          scale: { type: 'spring', stiffness: 260, damping: 20 },
          rotate: { repeat: state === 'thinking' ? Infinity : 0, duration: 0.5 }
        }}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <AgentAvatar state={state} />

        {/* Indicador de estado */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
          {state === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip con mensaje */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className={`
              px-3 py-2 rounded-lg text-sm font-medium shadow-lg
              ${state === 'success' ? 'bg-green-500 text-white' : ''}
              ${state === 'error' ? 'bg-red-500 text-white' : ''}
              ${state === 'thinking' ? 'bg-[#1E3A8A] text-white' : ''}
            `}>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popover con opciones */}
      <AnimatePresence>
        {isOpen && state === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-3 w-72"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <AgentAvatar state="idle" small />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Agente SEO</h4>
                    <p className="text-xs text-blue-100">¿Qué te ayudo a crear?</p>
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="p-2">
                {!isReady && (
                  <div className="px-3 py-3 mb-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-600">⏳</span>
                      <p className="text-sm font-medium text-amber-800">
                        Esperando contenido...
                      </p>
                    </div>
                    <p className="text-xs text-amber-700 mb-2">
                      Escribe al menos {minContentLength} caracteres para activar el agente SEO.
                    </p>
                    {/* Barra de progreso */}
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${contentProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-600 mt-1 text-right">
                      {contentLength}/{minContentLength} caracteres
                    </p>
                  </div>
                )}

                {menuItems.map((item) => (
                  <button
                    key={item.field}
                    onClick={() => handleGenerate(item.field)}
                    disabled={!isReady}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg
                             text-left transition-colors group
                             ${isReady
                               ? 'hover:bg-gray-50 cursor-pointer'
                               : 'opacity-50 cursor-not-allowed'
                             }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm transition-colors
                        ${isReady
                          ? 'text-gray-900 group-hover:text-[#1E3A8A]'
                          : 'text-gray-400'
                        }`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">
                  Powered by GPT-4o • Optimizado para construcción
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Avatar del Agente SEO - Imagen profesional generada con IA
 */
function AgentAvatar({ state, small = false }: { state: AgentState; small?: boolean }) {
  const size = small ? 28 : 48;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src="/images/agente-seo.png"
        alt="Agente SEO"
        className={`w-full h-full object-cover ${
          state === 'thinking' ? 'animate-pulse' : ''
        }`}
      />
      {/* Indicador de estado */}
      {state === 'thinking' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
      )}
      {state === 'success' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {state === 'error' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      )}
    </div>
  );
}

export default BlogAgent;
