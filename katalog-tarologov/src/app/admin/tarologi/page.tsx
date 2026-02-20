import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';
import TarologistActions from './TarologistActions';

export default async function AdminTarologistsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: tarologists } = await supabase
    .from('tarologists')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          Тарологи
        </h1>
        <Link href="/admin/tarologi/new">
          <Button>+ Добавить таролога</Button>
        </Link>
      </div>

      {tarologists && tarologists.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg text-sm text-text-light border-b border-border">
                  <th className="text-left px-4 py-3 font-medium">Таролог</th>
                  <th className="text-left px-4 py-3 font-medium">Рейтинг</th>
                  <th className="text-left px-4 py-3 font-medium">Отзывов</th>
                  <th className="text-left px-4 py-3 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 font-medium">Дата</th>
                  <th className="text-right px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tarologists.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border hover:bg-bg/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-bg flex-shrink-0">
                          {t.photo_url ? (
                            <Image
                              src={t.photo_url}
                              alt={t.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-sm font-bold">
                              {t.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-text">{t.name}</div>
                          <div className="text-xs text-text-muted">/{t.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={t.avg_rating} size="sm" showValue />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-light">
                      {t.review_count}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.is_active ? 'success' : 'danger'}>
                        {t.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <TarologistActions tarologist={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-10 text-center">
          <div className="text-5xl mb-4">🔮</div>
          <h3 className="text-xl font-semibold font-[family-name:var(--font-heading)] mb-2">
            Тарологов пока нет
          </h3>
          <p className="text-text-muted mb-4">
            Добавьте первого таролога в каталог
          </p>
          <Link href="/admin/tarologi/new">
            <Button>+ Добавить таролога</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
