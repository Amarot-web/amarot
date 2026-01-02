"use client"

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { useEffect, useRef } from "react"
import { Toolbar } from "./toolbar"

interface TiptapEditorProps {
  initialContent?: JSONContent
  onChange: (content: JSONContent) => void
  onEditorReady?: (getContent: () => JSONContent) => void
}

export function TiptapEditor({
  initialContent,
  onChange,
  onEditorReady,
}: TiptapEditorProps) {
  // Ref para mantener siempre la referencia más reciente del editor
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-lg bg-gray-100 border border-gray-200 p-4 font-mono text-sm overflow-x-auto my-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-[#1E3A8A] pl-4 py-1 my-4 italic text-gray-600",
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-gray-200 max-w-full my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#1E3A8A] underline underline-offset-2 hover:text-[#DC2626] transition-colors cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "Escribe el contenido del post...",
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 w-full my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: "min-h-[400px] max-w-none outline-none focus:outline-none",
      },
    },
  })

  // Actualizar ref cuando el editor cambia
  useEffect(() => {
    if (editor) {
      editorRef.current = editor
    }
  }, [editor])

  // Exponer getContent cuando el editor está listo
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(() => {
        const currentEditor = editorRef.current
        if (!currentEditor) {
          return { type: "doc", content: [] }
        }
        return currentEditor.getJSON()
      })
    }
  }, [editor, onEditorReady])

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl bg-white min-h-[500px] flex items-center justify-center text-gray-400">
        Cargando editor...
      </div>
    )
  }

  return (
    <div className="tiptap-editor border border-gray-200 rounded-xl bg-white flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
      <div className="flex-shrink-0 rounded-t-xl overflow-hidden">
        <Toolbar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// Re-export types for convenience
export type { JSONContent }
