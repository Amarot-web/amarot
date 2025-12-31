"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { BlogPost, BlogTag, TipTapContent, TipTapNode } from "@/types/blog"
import { generateSlug } from "@/types/blog"
import { BlogEditor, type JSONContent } from "./editor"
import { createPost, updatePostStatus, createTag } from "@/lib/blog/actions"
import { Save, Send, Eye, Clock, FileText, Settings, Search, X, Plus } from "lucide-react"
import { BlogAgent } from "./agents/blog-agent"
import { CoverImageUploader } from "./cover-image-uploader"

type SEOField = 'all' | 'excerpt' | 'metaTitle' | 'metaDescription'

/**
 * Extrae texto plano del contenido TipTap para enviar a la API de SEO
 */
function extractTextFromTipTap(content: TipTapContent | null, maxLength: number = 3000): string {
  if (!content || !content.content) return ''

  const extractFromNode = (node: TipTapNode): string => {
    // Si tiene texto directo
    if (node.text) {
      return node.text
    }

    // Si tiene contenido hijo
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(child => extractFromNode(child)).join(' ')
    }

    return ''
  }

  const fullText = content.content
    .map(node => extractFromNode(node))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return fullText.slice(0, maxLength)
}

interface PostEditorProps {
  post?: BlogPost
  allTags: BlogTag[]
}

type TabType = 'contenido' | 'detalles' | 'seo'

export function PostEditor({ post, allTags: initialTags }: PostEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [allTags, setAllTags] = useState<BlogTag[]>(initialTags)
  const [activeTab, setActiveTab] = useState<TabType>('contenido')

  // Form state - Contenido
  const [title, setTitle] = useState(post?.title || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [content, setContent] = useState<TipTapContent>(
    post?.content || { type: "doc", content: [] }
  )

  // Form state - Detalles
  const [coverImageUrl, setCoverImageUrl] = useState(post?.featuredImage || post?.ogImageUrl || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t) => t.id) || []
  )
  const [publishAt, setPublishAt] = useState(
    post?.publishAt ? new Date(post.publishAt).toISOString().slice(0, 16) : ""
  )

  // Form state - SEO
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "")
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "")
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "")
  const [ogImageUrl, setOgImageUrl] = useState(post?.ogImageUrl || "")
  const [noindex, setNoindex] = useState(post?.noindex || false)

  // Crear tag - state
  const [newTagName, setNewTagName] = useState("")
  const [creatingTag, setCreatingTag] = useState(false)

  // Ref para obtener contenido actualizado del editor directamente
  const getEditorContent = useRef<(() => JSONContent) | null>(null)

  // Callback para cuando el editor está listo
  const handleEditorReady = useCallback((getContent: () => JSONContent) => {
    getEditorContent.current = getContent
  }, [])

  // Auto-generar slug cuando cambia el título
  function handleTitleChange(newTitle: string) {
    setTitle(newTitle)
    if (!post || !slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  async function handleSave(asDraft = true) {
    if (!title.trim()) {
      alert("El título es obligatorio")
      return
    }

    setSaving(true)

    // Obtener contenido directamente del editor
    const currentContent = getEditorContent.current?.() ?? content

    try {
      if (post) {
        // Update existing post usando API route para preservar attrs de TipTap
        const response = await fetch(`/api/blog/posts/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            excerpt: excerpt || null,
            content: currentContent,
            featuredImage: coverImageUrl || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            ogImageUrl: ogImageUrl || coverImageUrl || null,
            canonicalUrl: canonicalUrl || null,
            noindex,
            publishAt: publishAt ? new Date(publishAt).toISOString() : null,
            tagIds: selectedTags,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          alert(result.error || "Error al guardar")
          return
        }

        router.refresh()
      } else {
        // Create new post
        const result = await createPost({
          title,
          slug,
          excerpt: excerpt || undefined,
          content: currentContent as TipTapContent,
          featuredImage: coverImageUrl || undefined,
          status: asDraft ? "draft" : "published",
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          ogImageUrl: ogImageUrl || coverImageUrl || undefined,
          canonicalUrl: canonicalUrl || undefined,
          noindex,
          publishAt: asDraft ? undefined : new Date(),
          tagIds: selectedTags,
        })

        if (!result.success) {
          alert(result.error || "Error al crear")
          return
        }

        if (result.id) {
          router.push(`/panel/blog/${result.id}`)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!post) {
      await handleSave(false)
      return
    }

    setPublishing(true)

    // Obtener contenido directamente del editor
    const currentContent = getEditorContent.current?.() ?? content

    try {
      // First save any changes usando API route para preservar attrs de TipTap
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || null,
          content: currentContent,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          ogImageUrl: ogImageUrl || coverImageUrl || null,
          canonicalUrl: canonicalUrl || null,
          noindex,
          tagIds: selectedTags,
        }),
      })

      const saveResult = await response.json()

      if (!response.ok || !saveResult.success) {
        alert(saveResult.error || "Error al guardar")
        return
      }

      // Then publish
      const statusResult = await updatePostStatus(
        post.id,
        "published",
        publishAt || undefined
      )

      if (!statusResult.success) {
        alert(statusResult.error || "Error al publicar")
        return
      }

      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish() {
    if (!post) return

    const result = await updatePostStatus(post.id, "draft")

    if (!result.success) {
      alert(result.error || "Error al despublicar")
      return
    }

    router.refresh()
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return

    setCreatingTag(true)
    try {
      const result = await createTag({ name: newTagName.trim() })
      if (result.success && result.id) {
        const newTag: BlogTag = {
          id: result.id,
          name: newTagName.trim(),
          slug: result.slug || generateSlug(newTagName),
          createdAt: new Date(),
        }
        setAllTags((prev) => [...prev, newTag])
        setSelectedTags((prev) => [...prev, result.id!])
        setNewTagName("")
      } else {
        alert(result.error || "Error al crear tag")
      }
    } finally {
      setCreatingTag(false)
    }
  }

  /**
   * Genera contenido SEO usando el agente de IA
   */
  async function handleGenerateSEO(field: SEOField): Promise<void> {
    const currentContent = getEditorContent.current?.() ?? content
    const textContent = extractTextFromTipTap(currentContent as TipTapContent, 3000)

    const response = await fetch('/api/blog/generate-seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: textContent,
        slug,
        field,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al generar SEO')
    }

    const data = await response.json()

    // Actualizar los campos según lo que se generó
    if (data.excerpt !== undefined) setExcerpt(data.excerpt)
    if (data.metaTitle !== undefined) setMetaTitle(data.metaTitle)
    if (data.metaDescription !== undefined) setMetaDescription(data.metaDescription)
  }

  const isPublished = post?.status === "published"

  const tabs = [
    { id: 'contenido' as const, label: 'Contenido', icon: FileText },
    { id: 'detalles' as const, label: 'Detalles', icon: Settings },
    { id: 'seo' as const, label: 'SEO', icon: Search },
  ]

  // Verificar si hay contenido suficiente para generar SEO
  // Requerimos al menos 200 caracteres de contenido para que el agente sea útil
  const contentText = extractTextFromTipTap(content as TipTapContent, 3000)
  const hasEnoughContent = contentText.length >= 200
  const hasTitle = title.trim().length > 0

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Header con estado y acciones */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? "Editar Post" : "Crear Nuevo Post"}
          </h1>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isPublished ? "Publicado" : "Borrador"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {post && slug && (
            <Link
              href={`/blog/${slug}?preview=true`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </Link>
          )}
        </div>
      </div>

      {/* Formulario con Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex gap-4 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[#1E3A8A] text-[#1E3A8A]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab: Contenido */}
        {activeTab === 'contenido' && (
          <div className="p-6 space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Título del Post *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej: Perforaciones Diamantinas: Guía Completa"
                className="w-full px-4 py-3 text-lg bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="mi-post-increible"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Extracto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Extracto (Resumen breve)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un breve resumen de tu post..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
              />
            </div>

            {/* Contenido - Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contenido *</label>
              <BlogEditor
                initialContent={content as JSONContent}
                onChange={(newContent) => setContent(newContent as TipTapContent)}
                onEditorReady={handleEditorReady}
              />
            </div>
          </div>
        )}

        {/* Tab: Detalles */}
        {activeTab === 'detalles' && (
          <div className="p-6 space-y-6">
            {/* Imagen de Portada */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Imagen de Portada</label>
              <CoverImageUploader
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                disabled={saving}
              />
            </div>

            {/* Fecha de publicación */}
            {!isPublished && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Programar Publicación</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
                <p className="text-xs text-gray-500">
                  Deja vacío para publicar inmediatamente al hacer clic en Publicar
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Etiquetas</label>

              {/* Tags seleccionados */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId)
                  if (!tag) return null
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-[#1E3A8A] text-white rounded-full"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => setSelectedTags((prev) => prev.filter((id) => id !== tagId))}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>

              {/* Tags disponibles */}
              <div className="flex flex-wrap gap-2 mb-3">
                {allTags
                  .filter((tag) => !selectedTags.includes(tag.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTags((prev) => [...prev, tag.id])}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>

              {/* Crear nuevo tag */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nueva etiqueta..."
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={creatingTag || !newTagName.trim()}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#1E3A8A] border border-[#1E3A8A] rounded-lg hover:bg-[#1E3A8A]/5 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {creatingTag ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: SEO */}
        {activeTab === 'seo' && (
          <div className="p-6 space-y-6">
            {/* Preview de Google */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Vista previa en Google</p>
              <div className="text-[#1a0dab] text-lg font-normal hover:underline cursor-pointer">
                {metaTitle || title || "Título del post"}
              </div>
              <div className="text-sm text-green-800">
                amarotperu.com/blog/{slug || "slug-del-post"}
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">
                {metaDescription || excerpt || "Descripción del post..."}
              </div>
            </div>

            {/* Meta Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Meta Título
                <span className="text-gray-400 font-normal ml-2">
                  ({(metaTitle || title || "").length}/60)
                </span>
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Título para motores de búsqueda"}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Meta Descripción
                <span className="text-gray-400 font-normal ml-2">
                  ({(metaDescription || excerpt || "").length}/160)
                </span>
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={excerpt || "Descripción para motores de búsqueda"}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">URL Canónica</label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://amarotperu.com/blog/..."
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
              <p className="text-xs text-gray-500">
                Deja vacío para usar la URL por defecto
              </p>
            </div>

            {/* OG Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Imagen para Redes Sociales (OG)</label>
              <input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder={coverImageUrl || "https://ejemplo.com/imagen-og.jpg"}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              />
              <p className="text-xs text-gray-500">
                Si no se especifica, se usará la imagen de portada
              </p>
            </div>

            {/* Noindex */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="noindex"
                checked={noindex}
                onChange={(e) => setNoindex(e.target.checked)}
                className="w-4 h-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
              />
              <label htmlFor="noindex" className="text-sm text-gray-700">
                No indexar este post (noindex)
              </label>
            </div>
          </div>
        )}

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-500">
            {post?.updatedAt && (
              <span>
                Última edición:{" "}
                {new Date(post.updatedAt).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar Borrador"}
            </button>

            {isPublished ? (
              <button
                type="button"
                onClick={handleUnpublish}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Despublicar
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#DC2626] text-white rounded-lg hover:bg-[#DC2626]/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {publishing
                  ? "Publicando..."
                  : publishAt
                  ? "Programar"
                  : "Publicar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agente SEO flotante - Siempre visible, activo cuando hay suficiente contenido */}
      <div className="fixed bottom-6 right-6 z-50">
        <BlogAgent
          onGenerate={handleGenerateSEO}
          disabled={false}
          hasContent={hasEnoughContent}
          contentLength={contentText.length}
          minContentLength={200}
        />
      </div>
    </div>
  )
}
