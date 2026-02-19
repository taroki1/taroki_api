import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { Tarologist, WORK_FORMAT_ICONS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface TarologistCardProps {
  tarologist: Tarologist;
  minPrice?: number | null;
}

export default function TarologistCard({ tarologist, minPrice }: TarologistCardProps) {
  return (
    <Card hover className="p-5 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-bg flex-shrink-0">
          {tarologist.photo_url ? (
            <Image
              src={tarologist.photo_url}
              alt={tarologist.name}
              fill
              className="object-cover"
              sizes="100px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)]">
              {tarologist.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg font-[family-name:var(--font-heading)] text-text truncate">
            {tarologist.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={tarologist.avg_rating} size="sm" showValue />
            <span className="text-xs text-text-muted">
              ({tarologist.review_count} отз.)
            </span>
          </div>
          {minPrice !== null && minPrice !== undefined && (
            <div className="text-sm text-text-light mt-1">
              от {formatPrice(minPrice)}
            </div>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tarologist.specializations.slice(0, 3).map((spec) => (
          <Badge key={spec} variant="primary">
            {spec}
          </Badge>
        ))}
        {tarologist.specializations.length > 3 && (
          <Badge variant="outline">+{tarologist.specializations.length - 3}</Badge>
        )}
      </div>

      {/* Work formats */}
      <div className="flex items-center gap-2 mb-4 text-sm text-text-light">
        {tarologist.work_formats.map((format) => (
          <span key={format} title={format} className="flex items-center gap-1">
            <span>{WORK_FORMAT_ICONS[format] || ''}</span>
            <span className="hidden sm:inline text-xs">{format}</span>
          </span>
        ))}
      </div>

      {/* Certificate badge */}
      <div className="mb-4">
        <Badge variant="accent">Сертифицированный таролог Академии</Badge>
      </div>

      {/* Button */}
      <div className="mt-auto">
        <Link
          href={`/tarolog/${tarologist.slug}`}
          className="block w-full text-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
        >
          Подробнее
        </Link>
      </div>
    </Card>
  );
}
