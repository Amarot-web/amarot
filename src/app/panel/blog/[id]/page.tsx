import { redirect, notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getAdminPostById, getAdminTags } from '@/lib/blog/queries';
import { PostEditor } from '@/components/blog/post-editor';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  try {
    await requirePermission('blog:edit');
  } catch {
    redirect('/panel/dashboard');
  }

  const { id } = await params;
  const [post, allTags] = await Promise.all([
    getAdminPostById(id),
    getAdminTags(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <PostEditor post={post} allTags={allTags} />
    </div>
  );
}
