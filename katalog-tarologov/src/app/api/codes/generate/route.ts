import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateReviewCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
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

    const { tarologist_id, count } = await request.json();

    if (!tarologist_id) {
      return NextResponse.json({ error: 'Укажите таролога' }, { status: 400 });
    }

    const codeCount = Math.min(50, Math.max(1, count || 10));
    const supabase = createAdminClient();

    const codes: string[] = [];
    const codeRecords = [];

    for (let i = 0; i < codeCount; i++) {
      let code: string;
      let isUnique = false;

      // Generate unique code
      while (!isUnique) {
        code = generateReviewCode();
        const { data: existing } = await supabase
          .from('review_codes')
          .select('id')
          .eq('code', code)
          .single();

        if (!existing) {
          isUnique = true;
          codes.push(code!);
          codeRecords.push({
            tarologist_id,
            code: code!,
            status: 'issued',
            expires_at: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      }
    }

    const { error } = await supabase.from('review_codes').insert(codeRecords);

    if (error) {
      return NextResponse.json(
        { error: 'Ошибка создания кодов: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
