import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    // Check admin auth
    const serverSupabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { data: adminUser } = await serverSupabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { review_id, status } = await request.json();

    if (!review_id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('reviews')
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq('id', review_id);

    if (error) {
      return NextResponse.json(
        { error: 'Ошибка модерации: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
