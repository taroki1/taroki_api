import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ServiceTable from '@/components/profile/ServiceTable';
import ContactButtons from '@/components/profile/ContactButtons';
import ReviewSection from '@/components/profile/ReviewSection';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { WORK_FORMAT_ICONS } from '@/lib/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: tarologist } = await supabase
    .from('tarologists')
    .select('name, specializations')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!tarologist) return { title: 'Таролог не найден' };

  return {
    title: `${tarologist.name} — сертифицированный таролог | Расклады на Таро онлайн`,
    description: `${tarologist.name} — сертифицированный таролог Академии Анастасии Лыковой. Специализация: ${tarologist.specializations.join(', ')}. Запишитесь на расклад.`,
    openGraph: {
      title: `${tarologist.name} — сертифицированный таролог`,
      description: `Расклады на Таро от сертифицированного таролога Академии Анастасии Лыковой`,
      type: 'profile',
    },
  };
}

export default async function TarologistProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: tarologist } = await supabase
    .from('tarologists')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!tarologist) notFound();

  const [servicesRes, reviewsRes] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('tarologist_id', tarologist.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('*')
      .eq('tarologist_id', tarologist.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ]);

  const services = servicesRes.data || [];
  const reviews = reviewsRes.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <ProfileHeader tarologist={tarologist} />
          </div>

          {/* About */}
          {tarologist.about && (
            <Card className="mb-6 p-5">
              <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-3">
                О себе
              </h2>
              <p className="text-text-light leading-relaxed whitespace-pre-line">
                {tarologist.about}
              </p>
            </Card>
          )}

          {/* Work Formats */}
          <Card className="mb-6 p-5">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-3">
              Форматы работы
            </h2>
            <div className="flex flex-wrap gap-3">
              {tarologist.work_formats.map((format: string) => (
                <Badge key={format} variant="primary" className="text-sm px-3 py-1.5">
                  {WORK_FORMAT_ICONS[format] || ''} {format}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Services */}
          <div className="mb-6">
            <ServiceTable services={services} />
          </div>

          {/* Contact */}
          <div className="mb-6">
            <ContactButtons tarologist={tarologist} />
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <ReviewSection
              reviews={reviews}
              avgRating={tarologist.avg_rating}
              totalCount={tarologist.review_count}
            />
          </div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-bg-white border-t border-border shadow-lg z-40">
        <ContactButtons tarologist={tarologist} />
      </div>

      <Footer />
    </div>
  );
}
