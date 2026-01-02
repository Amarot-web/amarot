// Renderizador de contenido TipTap para el Blog de AMAROT
// Convierte el JSON de TipTap a HTML con estilos

import React from 'react';
import type { TipTapContent, TipTapNode, TipTapMark } from '@/types/blog';

/**
 * Sanitiza una URL para prevenir XSS (javascript:, data:, etc.)
 * Retorna la URL si es segura, o undefined si no lo es
 */
function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim().toLowerCase();

  // Permitir protocolos seguros
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return url;
  }

  // Rechazar cualquier URL con protocolo (javascript:, data:, vbscript:, etc.)
  if (trimmed.includes(':')) {
    return undefined;
  }

  // Permitir rutas relativas
  return url;
}

interface TipTapRendererProps {
  content: TipTapContent | null;
  className?: string;
}

export function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
  if (!content || !content.content) {
    return null;
  }

  return (
    <div className={`tiptap-content ${className}`}>
      {content.content.map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: TipTapNode }) {
  switch (node.type) {
    case 'paragraph':
      return (
        <p>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </p>
      );

    case 'heading': {
      const level = (node.attrs?.level as number) || 2;
      const children = node.content?.map((child, i) => (
        <RenderNode key={i} node={child} />
      ));

      if (level === 1) return <h1>{children}</h1>;
      if (level === 2) return <h2>{children}</h2>;
      if (level === 3) return <h3>{children}</h3>;
      if (level === 4) return <h4>{children}</h4>;
      if (level === 5) return <h5>{children}</h5>;
      return <h6>{children}</h6>;
    }

    case 'bulletList':
      return (
        <ul>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol start={node.attrs?.start as number}>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </ol>
      );

    case 'listItem':
      return (
        <li>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} />
          ))}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre>
          <code className={node.attrs?.language ? `language-${node.attrs.language}` : ''}>
            {node.content?.map((child, i) => (
              <RenderNode key={i} node={child} />
            ))}
          </code>
        </pre>
      );

    case 'image': {
      const imgTitle = node.attrs?.title as string | undefined;
      const imgSrc = sanitizeUrl(node.attrs?.src as string);
      if (!imgSrc) return null; // No renderizar imágenes con URLs peligrosas
      return (
        <figure className="my-8">
          <img
            src={imgSrc}
            alt={(node.attrs?.alt as string) || ''}
            title={imgTitle}
            className="rounded-lg w-full"
          />
          {imgTitle && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {imgTitle}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'horizontalRule':
      return <hr className="my-8 border-gray-200" />;

    case 'hardBreak':
      return <br />;

    case 'text':
      return <RenderText text={node.text || ''} marks={node.marks} />;

    default:
      // Si no reconocemos el nodo, intentamos renderizar sus hijos
      if (node.content) {
        return (
          <>
            {node.content.map((child, i) => (
              <RenderNode key={i} node={child} />
            ))}
          </>
        );
      }
      return null;
  }
}

function RenderText({ text, marks }: { text: string; marks?: TipTapMark[] }) {
  if (!marks || marks.length === 0) {
    return <>{text}</>;
  }

  // Aplicar marcas anidadas
  let result: React.ReactNode = text;

  // Invertir para aplicar de adentro hacia afuera
  for (const mark of [...marks].reverse()) {
    result = applyMark(result, mark);
  }

  return <>{result}</>;
}

function applyMark(content: React.ReactNode, mark: TipTapMark): React.ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{content}</strong>;

    case 'italic':
      return <em>{content}</em>;

    case 'underline':
      return <u>{content}</u>;

    case 'strike':
      return <s>{content}</s>;

    case 'code':
      return (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#DC2626]">
          {content}
        </code>
      );

    case 'link': {
      const href = sanitizeUrl(mark.attrs?.href as string);
      if (!href) return <>{content}</>; // No crear enlace si URL es peligrosa
      return (
        <a
          href={href}
          target={mark.attrs?.target as string}
          rel={mark.attrs?.target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-[#1E3A8A] hover:text-[#DC2626] underline transition-colors"
        >
          {content}
        </a>
      );
    }

    case 'highlight':
      return (
        <mark className="bg-yellow-200 px-0.5">{content}</mark>
      );

    default:
      return content;
  }
}

export default TipTapRenderer;
