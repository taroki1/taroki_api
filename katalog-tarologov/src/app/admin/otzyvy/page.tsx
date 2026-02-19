'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type Tab = 'pending' | 'approved' | 'rejected';

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('reviews')
      .select('*, tarologist:tarologists(name)')
      .eq('status', tab)
      .order('created_at', { ascending: false });

    setReviews(
      (data || []).map((r: Record<string, unknown>) => ({
        ...r,
        tarologist_name: (r.tarologist as { name: string } | null)?.name || 'Неизвестен',
      })) as (Review & { tarologist_name: string })[]
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient();
    await supabase
      .from('reviews')
      .update({
        status,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);
    fetchReviews();
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Удалить этот отзыв? Это действие необратимо.')) return;
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', reviewId);
    fetchReviews();
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'pending', label: 'На модерации' },
    { value: 'approved', label: 'Опубликованные' },
    { value: 'rejected', label: 'Отклонённые' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6">
        Модерация отзывов
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-white rounded-lg p-1 shadow-[0_2px_8px_var(--color-card-shadow)] w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === t.value
                ? 'bg-primary text-white'
                : 'text-text-light hover:text-text hover:bg-bg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-text">
                      {review.client_name}
                    </span>
                    <span className="text-text-muted text-sm">→</span>
                    <span className="text-primary font-medium text-sm">
                      {(review as Review & { tarologist_name: string }).tarologist_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-text-muted">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    review.status === 'pending'
                      ? 'accent'
                      : review.status === 'approved'
                      ? 'success'
                      : 'danger'
                  }
                >
                  {review.status === 'pending'
                    ? 'На модерации'
                    : review.status === 'approved'
                    ? 'Опубликован'
                    : 'Отклонён'}
                </Badge>
              </div>
              <p className="text-text-light text-sm leading-relaxed mb-4">
                {review.text}
              </p>
              <div className="flex items-center gap-2">
                {review.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleModerate(review.id, 'approved')}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(review.id, 'rejected')}
                    >
                      Отклонить
                    </Button>
                  </>
                )}
                {review.status === 'rejected' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleModerate(review.id, 'approved')}
                  >
                    Одобрить
                  </Button>
                )}
                {review.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleModerate(review.id, 'rejected')}
                  >
                    Отклонить
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(review.id)}
                >
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
            Нет отзывов
          </h3>
          <p className="text-text-muted">
            {tab === 'pending'
              ? 'Нет отзывов, ожидающих модерации'
              : tab === 'approved'
              ? 'Нет опубликованных отзывов'
              : 'Нет отклонённых отзывов'}
          </p>
        </Card>
      )}
    </div>
  );
}
