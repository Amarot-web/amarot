"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BlogPostError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Blog Post Editor Error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Error al cargar el artículo
        </h2>

        <p className="text-gray-600 mb-6">
          No se pudo cargar el editor. Esto puede deberse a datos corruptos
          o un problema de conexión.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>

          <Link
            href="/panel/blog"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a artículos
          </Link>
        </div>
      </div>
    </div>
  )
}
