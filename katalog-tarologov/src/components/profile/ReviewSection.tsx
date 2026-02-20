import Link from 'next/link';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ReviewSectionProps {
  reviews: Review[];
  avgRating: number;
  totalCount: number;
}

export default function ReviewSection({
  reviews,
  avgRating,
  totalCount,
}: ReviewSectionProps) {
  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      totalCount > 0
        ? (reviews.filter((r) => r.rating === star).length / totalCount) * 100
        : 0,
  }));

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)]">
          Отзывы
        </h2>
        <Link
          href="/otzyv"
          className="text-sm text-primary hover:underline font-medium"
        >
          Оставить отзыв
        </Link>
      </div>

      {totalCount > 0 ? (
        <>
          {/* Rating summary */}
          <div className="px-5 py-4 flex flex-col sm:flex-row items-center gap-6 border-b border-border">
            <div className="text-center">
              <div className="text-4xl font-bold text-text font-[family-name:var(--font-heading)]">
                {avgRating.toFixed(1)}
              </div>
              <StarRating rating={avgRating} size="md" />
              <div className="text-sm text-text-muted mt-1">
                {totalCount}{' '}
                {totalCount === 1
                  ? 'отзыв'
                  : totalCount < 5
                  ? 'отзыва'
                  : 'отзывов'}
              </div>
            </div>
            <div className="flex-1 w-full">
              {distribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-3 text-text-light">{star}</span>
                  <span className="text-accent">★</span>
                  <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-text-muted">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-text">{review.client_name}</div>
                  <div className="text-xs text-text-muted">
                    {formatDate(review.created_at)}
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
                <p className="mt-2 text-text-light text-sm leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="px-5 py-10 text-center text-text-muted">
          <p className="text-lg mb-2">Пока нет отзывов</p>
          <p className="text-sm">
            Будьте первым, кто оставит отзыв!
          </p>
        </div>
      )}
    </Card>
  );
}
