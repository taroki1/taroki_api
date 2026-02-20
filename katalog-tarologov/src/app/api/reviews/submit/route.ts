import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { tarologist_id, code_id, client_name, rating, text } =
      await request.json();

    // Validation
    if (!tarologist_id || !code_id || !client_name || !rating || !text) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      );
    }

    if (typeof text !== 'string' || text.trim().length < 50 || text.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Отзыв должен содержать от 50 до 1000 символов' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify code exists and is valid
    const { data: reviewCode } = await supabase
      .from('review_codes')
      .select('*')
      .eq('id', code_id)
      .eq('tarologist_id', tarologist_id)
      .eq('status', 'issued')
      .single();

    if (!reviewCode) {
      return NextResponse.json({ error: 'Неверный код подтверждения' }, { status: 400 });
    }

    // Check if code expired
    if (new Date(reviewCode.expires_at) < new Date()) {
      await supabase
        .from('review_codes')
        .update({ status: 'expired' })
        .eq('id', code_id);
      return NextResponse.json({ error: 'Срок действия кода истёк' }, { status: 400 });
    }

    // Create review
    const { error: reviewError } = await supabase.from('reviews').insert({
      tarologist_id,
      code_id,
      client_name: client_name.trim(),
      rating,
      text: text.trim(),
      status: 'pending',
    });

    if (reviewError) {
      return NextResponse.json(
        { error: 'Ошибка создания отзыва: ' + reviewError.message },
        { status: 500 }
      );
    }

    // Mark code as used
    await supabase
      .from('review_codes')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', code_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
