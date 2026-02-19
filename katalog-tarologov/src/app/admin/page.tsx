import StatsCard from '@/components/admin/StatsCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [tarologistsRes, reviewsRes, pendingReviewsRes] = await Promise.all([
    supabase.from('tarologists').select('id, is_active, avg_rating'),
    supabase.from('reviews').select('id, status'),
    supabase.from('reviews').select('id').eq('status', 'pending'),
  ]);

  const tarologists = tarologistsRes.data || [];
  const reviews = reviewsRes.data || [];
  const pendingReviews = pendingReviewsRes.data || [];

  const activeTarologists = tarologists.filter((t) => t.is_active).length;
  const inactiveTarologists = tarologists.filter((t) => !t.is_active).length;
  const approvedReviews = reviews.filter((r) => r.status === 'approved').length;
  const rejectedReviews = reviews.filter((r) => r.status === 'rejected').length;
  const avgRating =
    tarologists.length > 0
      ? (
          tarologists.reduce((sum, t) => sum + (t.avg_rating || 0), 0) /
          tarologists.filter((t) => t.avg_rating > 0).length || 0
        ).toFixed(1)
      : '0.0';

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6">
        Дашборд
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Всего тарологов"
          value={tarologists.length}
          subtitle={`${activeTarologists} акт. / ${inactiveTarologists} неакт.`}
          icon="🔮"
        />
        <StatsCard
          title="Всего отзывов"
          value={reviews.length}
          subtitle={`${approvedReviews} опубл. / ${rejectedReviews} откл.`}
          icon="💬"
        />
        <StatsCard
          title="На модерации"
          value={pendingReviews.length}
          subtitle="Ожидают проверки"
          icon="⏳"
        />
        <StatsCard
          title="Средний рейтинг"
          value={avgRating}
          subtitle="По всем тарологам"
          icon="⭐"
        />
      </div>

      {pendingReviews.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-text">
              {pendingReviews.length}{' '}
              {pendingReviews.length === 1 ? 'отзыв ожидает' : 'отзывов ожидают'}{' '}
              модерации
            </p>
            <a
              href="/admin/otzyvy"
              className="text-sm text-primary hover:underline"
            >
              Перейти к модерации →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
