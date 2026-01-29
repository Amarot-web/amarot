'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AgentState = 'idle' | 'thinking' | 'listening' | 'speaking' | 'error';

interface CRMAgentProps {
  userName?: string;
}

/**
 * Agente CRM - Asistente conversacional con IA para el CRM de AMAROT
 * Popover flotante con chat, voz y herramientas de consulta
 */
export function CRMAgent({ userName }: CRMAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook de chat con Vercel AI SDK v6
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/crm/chat',
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Actualizar estado del agente según status
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      setAgentState('thinking');
    } else if (error) {
      setAgentState('error');
      setTimeout(() => setAgentState('idle'), 3000);
    } else {
      setAgentState('idle');
    }
  }, [status, error]);

  // Web Speech API para reconocimiento de voz
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAgentState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setAgentState('idle');
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAgentState('error');
      setTimeout(() => setAgentState('idle'), 2000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (agentState === 'listening') {
        setAgentState('idle');
      }
    };

    recognition.start();
  }, [agentState]);

  // Manejar envío del formulario
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Manejar clic en sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  return (
    <div ref={popoverRef} className="fixed bottom-6 right-6 z-50">
      {/* Popover con chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 w-96 h-[500px] flex flex-col"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                    <AgentAvatar state={agentState} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Agente CRM</h4>
                    <p className="text-xs text-red-100">
                      {agentState === 'thinking' && 'Pensando...'}
                      {agentState === 'listening' && 'Escuchando...'}
                      {agentState === 'speaking' && 'Hablando...'}
                      {agentState === 'error' && 'Error'}
                      {agentState === 'idle' && '¿En qué te ayudo?'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <WelcomeMessage userName={userName} onSuggestionClick={handleSuggestionClick} />
                ) : (
                  messages.map((message: UIMessage) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <ThinkingIndicator />
                    <span className="text-sm">Consultando...</span>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    Error: {error.message}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={onSubmit} className="p-3 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={isLoading || isListening}
                    className={`p-2 rounded-full transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title="Hablar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">
                  Powered by GPT-4o • AMAROT CRM
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center overflow-hidden
          transition-all duration-300
          ${agentState === 'thinking' ? 'cursor-wait' : 'cursor-pointer'}
          bg-gradient-to-br from-red-500 to-red-700
          hover:shadow-xl hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-red-500/50
        `}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          rotate: agentState === 'thinking' ? [0, 5, -5, 0] : 0
        }}
        transition={{
          scale: { type: 'spring', stiffness: 260, damping: 20 },
          rotate: { repeat: agentState === 'thinking' ? Infinity : 0, duration: 0.5 }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AgentAvatar state={agentState} large />

        {/* Indicador de estado */}
        <AnimatePresence>
          {agentState === 'thinking' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping"
            />
          )}
          {agentState === 'listening' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"
            />
          )}
          {agentState === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// Avatar del agente (icono o imagen)
function AgentAvatar({ state, large = false }: { state: AgentState; large?: boolean }) {
  const size = large ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className={`${size} flex items-center justify-center`}>
      {state === 'thinking' ? (
        <svg className={`${size} text-white animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === 'listening' ? (
        <svg className={`${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ) : (
        <svg className={`${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      )}
    </div>
  );
}

// Mensaje de bienvenida
function WelcomeMessage({
  userName,
  onSuggestionClick
}: {
  userName?: string;
  onSuggestionClick: (suggestion: string) => void;
}) {
  const suggestions = [
    '¿Qué actividades tengo pendientes?',
    '¿Cuántos leads hay en negociación?',
    '¿Cuáles leads requieren atención?',
    'Dame el resumen del pipeline',
  ];

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        ¡Hola{userName ? `, ${userName.split(' ')[0]}` : ''}!
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Soy tu asistente de CRM. Pregúntame sobre leads, actividades o métricas.
      </p>
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Sugerencias</p>
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 bg-white
                     border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-200
                     transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

// Componente de mensaje del chat
function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  // Obtener contenido de texto de las partes del mensaje
  const textContent = message.parts
    ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('') || '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
          isUser
            ? 'bg-red-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{textContent}</div>
        ) : (
          <div className="prose prose-sm prose-gray max-w-none
            prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
            prose-headings:my-2 prose-table:my-2
            prose-strong:font-semibold prose-strong:text-gray-900
            [&_table]:w-full [&_table]:text-xs [&_th]:bg-gray-50
            [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1
            [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200
            [&_table]:border-collapse [&_table]:border [&_table]:border-gray-200
            [&_th]:text-left [&_th]:font-medium [&_th]:text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// Indicador de pensamiento
function ThinkingIndicator() {
  return (
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Tipos para Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export default CRMAgent;
