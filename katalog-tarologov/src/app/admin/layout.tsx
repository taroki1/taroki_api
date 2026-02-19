import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, just render children (login page — middleware handles redirect)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
