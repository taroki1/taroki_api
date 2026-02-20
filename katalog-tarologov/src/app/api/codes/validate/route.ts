import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Неверный формат кода' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: reviewCode, error } = await supabase
      .from('review_codes')
      .select('*, tarologist:tarologists(id, name)')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !reviewCode) {
      return NextResponse.json({ error: 'Код не найден' }, { status: 404 });
    }

    if (reviewCode.status === 'used') {
      return NextResponse.json({ error: 'Код уже был использован' }, { status: 400 });
    }

    if (reviewCode.status === 'expired' || new Date(reviewCode.expires_at) < new Date()) {
      // Mark as expired if not already
      if (reviewCode.status !== 'expired') {
        await supabase
          .from('review_codes')
          .update({ status: 'expired' })
          .eq('id', reviewCode.id);
      }
      return NextResponse.json({ error: 'Срок действия кода истёк' }, { status: 400 });
    }

    const tarologist = reviewCode.tarologist as { id: string; name: string };

    return NextResponse.json({
      code_id: reviewCode.id,
      tarologist_id: tarologist.id,
      tarologist_name: tarologist.name,
    });
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
