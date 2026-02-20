'use client';

import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TarologistCard from '@/components/catalog/TarologistCard';
import SearchBar from '@/components/catalog/SearchBar';
import FilterPanel, { Filters } from '@/components/catalog/FilterPanel';
import SortDropdown, { SortOption } from '@/components/catalog/SortDropdown';
import { Tarologist, Service, PRICE_RANGES } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function CatalogPage() {
  const [tarologists, setTarologists] = useState<Tarologist[]>([]);
  const [services, setServices] = useState<Record<string, Service[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('rating');
  const [filters, setFilters] = useState<Filters>({
    formats: [],
    specializations: [],
    priceRange: null,
    minRating: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [tarologistsRes, servicesRes] = await Promise.all([
        supabase
          .from('tarologists')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase.from('services').select('*').order('sort_order', { ascending: true }),
      ]);

      if (tarologistsRes.data) {
        setTarologists(tarologistsRes.data);
      }

      if (servicesRes.data) {
        const grouped: Record<string, Service[]> = {};
        for (const s of servicesRes.data) {
          if (!grouped[s.tarologist_id]) grouped[s.tarologist_id] = [];
          grouped[s.tarologist_id].push(s);
        }
        setServices(grouped);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...tarologists];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter by format
    if (filters.formats.length > 0) {
      result = result.filter((t) =>
        filters.formats.some((f) => t.work_formats.includes(f))
      );
    }

    // Filter by specialization
    if (filters.specializations.length > 0) {
      result = result.filter((t) =>
        filters.specializations.some((s) => t.specializations.includes(s))
      );
    }

    // Filter by price range
    if (filters.priceRange !== null) {
      const range = PRICE_RANGES[filters.priceRange];
      result = result.filter((t) => {
        const srvs = services[t.id] || [];
        if (srvs.length === 0) return false;
        const minP = Math.min(...srvs.map((s) => s.price));
        return minP >= range.min && minP < (range.max === Infinity ? 999999999 : range.max);
      });
    }

    // Filter by rating
    if (filters.minRating !== null) {
      result = result.filter((t) => t.avg_rating >= filters.minRating!);
    }

    // Sort
    switch (sort) {
      case 'rating':
        result.sort((a, b) => b.avg_rating - a.avg_rating);
        break;
      case 'reviews':
        result.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'price_asc':
        result.sort((a, b) => {
          const aMin = services[a.id]?.[0]?.price ?? 999999;
          const bMin = services[b.id]?.[0]?.price ?? 999999;
          return aMin - bMin;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const aMax = Math.max(...(services[a.id]?.map((s) => s.price) || [0]));
          const bMax = Math.max(...(services[b.id]?.map((s) => s.price) || [0]));
          return bMax - aMax;
        });
        break;
    }

    return result;
  }, [tarologists, services, search, sort, filters]);

  const hasActiveFilters =
    filters.formats.length > 0 ||
    filters.specializations.length > 0 ||
    filters.priceRange !== null ||
    filters.minRating !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-white py-10 md:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-3">
              Сертифицированные тарологи
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4 text-accent">
              Академии Анастасии Лыковой
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Все тарологи — выпускники курса «Эксперт Таро VIP». Выберите специалиста и запишитесь на расклад
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        </section>

        {/* Catalog */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          {/* Sort and Filter controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-text-muted">
              {loading ? (
                <span>Загрузка...</span>
              ) : (
                <span>
                  Найдено: {filtered.length}{' '}
                  {filtered.length === 1
                    ? 'таролог'
                    : filtered.length < 5
                    ? 'таролога'
                    : 'тарологов'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  hasActiveFilters
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-light hover:border-primary'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Фильтры
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-accent text-primary-dark rounded-full text-xs flex items-center justify-center font-bold">
                    {filters.formats.length +
                      filters.specializations.length +
                      (filters.priceRange !== null ? 1 : 0) +
                      (filters.minRating !== null ? 1 : 0)}
                  </span>
                )}
              </button>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Desktop filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-4">
                <FilterPanel filters={filters} onChange={setFilters} />
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-64 rounded-xl" />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filtered.map((t) => {
                    const srvs = services[t.id] || [];
                    const minPrice =
                      srvs.length > 0
                        ? Math.min(...srvs.map((s) => s.price))
                        : null;
                    return (
                      <TarologistCard
                        key={t.id}
                        tarologist={t}
                        minPrice={minPrice}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
                    Тарологи не найдены
                  </h3>
                  <p className="text-text-muted">
                    Попробуйте изменить параметры поиска или сбросить фильтры
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile filters */}
        {showMobileFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            isMobile
            onClose={() => setShowMobileFilters(false)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
