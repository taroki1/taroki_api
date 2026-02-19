'use client';

import { SPECIALIZATIONS, WORK_FORMATS, PRICE_RANGES } from '@/lib/types';
import Button from '@/components/ui/Button';

export interface Filters {
  formats: string[];
  specializations: string[];
  priceRange: number | null;
  minRating: number | null;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function FilterPanel({
  filters,
  onChange,
  isMobile = false,
  onClose,
}: FilterPanelProps) {
  const toggleArrayFilter = (
    key: 'formats' | 'specializations',
    value: string
  ) => {
    const arr = filters[key];
    const updated = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    onChange({ ...filters, [key]: updated });
  };

  const resetFilters = () => {
    onChange({
      formats: [],
      specializations: [],
      priceRange: null,
      minRating: null,
    });
  };

  const hasFilters =
    filters.formats.length > 0 ||
    filters.specializations.length > 0 ||
    filters.priceRange !== null ||
    filters.minRating !== null;

  return (
    <div
      className={
        isMobile
          ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end'
          : ''
      }
      onClick={isMobile ? onClose : undefined}
    >
      <div
        className={
          isMobile
            ? 'w-full bg-bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto slide-up p-6'
            : 'bg-bg-white rounded-xl p-5 shadow-[0_2px_8px_var(--color-card-shadow)]'
        }
        onClick={isMobile ? (e) => e.stopPropagation() : undefined}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg font-[family-name:var(--font-heading)]">
            Фильтры
          </h3>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary hover:underline"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Format */}
        <div className="mb-5">
          <h4 className="text-sm font-medium text-text mb-2">Формат работы</h4>
          <div className="flex flex-wrap gap-2">
            {WORK_FORMATS.map((format) => (
              <button
                key={format}
                onClick={() => toggleArrayFilter('formats', format)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                  filters.formats.includes(format)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-light hover:border-primary hover:text-primary'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Specialization */}
        <div className="mb-5">
          <h4 className="text-sm font-medium text-text mb-2">Специализация</h4>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleArrayFilter('specializations', spec)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                  filters.specializations.includes(spec)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-light hover:border-primary hover:text-primary'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-5">
          <h4 className="text-sm font-medium text-text mb-2">Ценовой диапазон</h4>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range, idx) => (
              <button
                key={idx}
                onClick={() =>
                  onChange({
                    ...filters,
                    priceRange: filters.priceRange === idx ? null : idx,
                  })
                }
                className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                  filters.priceRange === idx
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-light hover:border-primary hover:text-primary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-5">
          <h4 className="text-sm font-medium text-text mb-2">Рейтинг</h4>
          <div className="flex flex-wrap gap-2">
            {[4.5, 4.0].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  onChange({
                    ...filters,
                    minRating: filters.minRating === rating ? null : rating,
                  })
                }
                className={`px-3 py-1.5 text-sm rounded-full border transition-all cursor-pointer ${
                  filters.minRating === rating
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-light hover:border-primary hover:text-primary'
                }`}
              >
                От {rating} ★
              </button>
            ))}
          </div>
        </div>

        {isMobile && (
          <Button onClick={onClose} className="w-full mt-2">
            Показать результаты
          </Button>
        )}
      </div>
    </div>
  );
}
