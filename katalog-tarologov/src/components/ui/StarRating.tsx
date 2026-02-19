'use client';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={cn('flex', sizeClasses[size])}>
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isHalf = !isFilled && starValue <= rating + 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starValue)}
              className={cn(
                'transition-colors',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default',
                isFilled || isHalf ? 'text-accent' : 'text-border'
              )}
            >
              {isFilled ? '★' : isHalf ? '★' : '☆'}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span
          className={cn(
            'font-medium text-text',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg'
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
