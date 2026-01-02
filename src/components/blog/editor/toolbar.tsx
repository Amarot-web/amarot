"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code2,
  Table2,
  Trash2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { uploadBlogImage } from "@/lib/blog/upload"

interface ToolbarProps {
  editor: Editor
}

/**
 * Valida que una URL sea segura (no javascript:, data:, etc.)
 */
function isValidUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  // Permitir: http://, https://, rutas relativas (/), anclas (#), mailto:, tel:
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return true;
  }
  // Rechazar protocolos peligrosos
  if (trimmed.includes(':')) {
    return false;
  }
  // Permitir rutas relativas sin protocolo
  return true;
}

export function Toolbar({ editor }: ToolbarProps) {
  const handleImageUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validar tamaño (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen no puede ser mayor a 10MB")
        return
      }

      try {
        const url = await uploadBlogImage(file)
        editor.chain().focus().setImage({ src: url, alt: "uploaded image", title: "" }).run()
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Error al subir la imagen: " + (error as Error).message)
      }
    }
    input.click()
  }

  const handleAddLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL del enlace:", previousUrl)

    if (url === null) return

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // Validar URL antes de insertar
    if (!isValidUrl(url)) {
      toast.error("URL no válida. Usa http://, https://, o rutas relativas")
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="tiptap-toolbar flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-gray-200 bg-gray-50">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer (Ctrl+Z)"
      >
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer (Ctrl+Y)"
      >
        <Redo size={16} />
      </ToolbarButton>

      <Separator />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Título 1"
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Título 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Título 3"
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <Separator />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Negrita (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Cursiva (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Subrayado (Ctrl+U)"
      >
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Código inline"
      >
        <Code size={16} />
      </ToolbarButton>

      <Separator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Lista con viñetas"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <Separator />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Cita"
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Bloque de código"
      >
        <Code2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Línea horizontal"
      >
        <Minus size={16} />
      </ToolbarButton>

      <Separator />

      {/* Link & Image */}
      <ToolbarButton
        onClick={handleAddLink}
        isActive={editor.isActive("link")}
        title="Insertar enlace"
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={handleImageUpload} title="Subir imagen">
        <ImageIcon size={16} />
      </ToolbarButton>

      <Separator />

      {/* Table */}
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insertar tabla"
      >
        <Table2 size={16} />
      </ToolbarButton>
      {editor.isActive("table") && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Agregar fila"
          >
            <Plus size={14} />
            <span className="text-[10px] ml-0.5">F</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Agregar columna"
          >
            <Plus size={14} />
            <span className="text-[10px] ml-0.5">C</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Eliminar tabla"
          >
            <Trash2 size={16} />
          </ToolbarButton>
        </>
      )}
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? "bg-[#1E3A8A] text-white"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
      title={title}
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}
