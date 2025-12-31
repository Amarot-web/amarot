import { requirePermission } from '@/lib/auth/permissions';
import { getAdminPosts } from '@/lib/blog/queries';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { POST_STATUS_LABELS, POST_STATUS_COLORS } from '@/types/blog';
import BlogPostActions from './BlogPostActions';

// Iconos
const icons = {
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  article: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
};

interface SearchParams {
  page?: string;
  status?: string;
  search?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BlogAdminPage({ searchParams }: PageProps) {
  // Verificar permiso
  try {
    await requirePermission('blog:view');
  } catch {
    redirect('/panel/dashboard');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const status = params.status as 'draft' | 'published' | 'archived' | undefined;
  const search = params.search;

  const { posts, total, totalPages } = await getAdminPosts({
    page,
    limit: 20,
    status: status || 'all',
    search,
  });

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los artículos del blog de AMAROT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            {icons.external}
            Ver Blog
          </Link>
          <Link
            href="/panel/blog/nuevo"
            className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {icons.plus}
            Nuevo Artículo
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Estado:</span>
            <div className="flex gap-1">
              {[
                { value: '', label: 'Todos' },
                { value: 'draft', label: 'Borradores' },
                { value: 'published', label: 'Publicados' },
                { value: 'archived', label: 'Archivados' },
              ].map((option) => (
                <Link
                  key={option.value}
                  href={`/panel/blog?status=${option.value}${search ? `&search=${search}` : ''}`}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    (status || '') === option.value
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-1" />
          <div className="text-sm text-gray-500">
            {total} artículo{total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {icons.article}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-base">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${POST_STATUS_COLORS[post.status]}`}>
                        {POST_STATUS_LABELS[post.status]}
                      </span>
                      {post.author && (
                        <span className="text-sm text-gray-500">
                          por {post.author.fullName}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        {formatDate(post.updatedAt)}
                      </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 ml-4">
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver en blog"
                    >
                      {icons.external}
                    </Link>
                  )}
                  <Link
                    href={`/panel/blog/${post.id}`}
                    className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    {icons.edit}
                  </Link>
                  <BlogPostActions postId={post.id} status={post.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              {icons.article}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              No hay artículos
            </h3>
            <p className="text-gray-500 mb-4">
              {status
                ? `No hay artículos con estado "${POST_STATUS_LABELS[status]}"`
                : 'Crea tu primer artículo para el blog'}
            </p>
            <Link
              href="/panel/blog/nuevo"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {icons.plus}
              Nuevo Artículo
            </Link>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/panel/blog?page=${page - 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-gray-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/panel/blog?page=${page + 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
