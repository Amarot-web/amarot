import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/permissions';
import { getAdminTags } from '@/lib/blog/queries';
import { PostEditor } from '@/components/blog/post-editor';

export default async function NuevoPostPage() {
  try {
    await requirePermission('blog:create');
  } catch {
    redirect('/panel/dashboard');
  }

  const allTags = await getAdminTags();

  return (
    <div>
      <PostEditor allTags={allTags} />
    </div>
  );
}
