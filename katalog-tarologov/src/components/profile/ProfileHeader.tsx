import Image from 'next/image';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { Tarologist } from '@/lib/types';

interface ProfileHeaderProps {
  tarologist: Tarologist;
}

export default function ProfileHeader({ tarologist }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden bg-bg flex-shrink-0 shadow-lg">
        {tarologist.photo_url ? (
          <Image
            src={tarologist.photo_url}
            alt={tarologist.name}
            fill
            className="object-cover"
            sizes="150px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-5xl font-bold font-[family-name:var(--font-heading)]">
            {tarologist.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-text">
          {tarologist.name}
        </h1>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
          <StarRating rating={tarologist.avg_rating} size="md" showValue />
          <span className="text-sm text-text-muted">
            ({tarologist.review_count}{' '}
            {tarologist.review_count === 1
              ? 'отзыв'
              : tarologist.review_count < 5
              ? 'отзыва'
              : 'отзывов'}
            )
          </span>
        </div>
        <div className="mt-3">
          <Badge variant="accent">Сертифицированный таролог Академии</Badge>
        </div>
        {tarologist.city && (
          <div className="mt-2 text-sm text-text-light flex items-center justify-center sm:justify-start gap-1">
            <span>📍</span>
            {tarologist.city}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
          {tarologist.specializations.map((spec) => (
            <Badge key={spec} variant="primary">
              {spec}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
