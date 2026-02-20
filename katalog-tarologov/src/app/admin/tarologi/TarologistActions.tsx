'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tarologist } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface TarologistActionsProps {
  tarologist: Tarologist;
}

export default function TarologistActions({ tarologist }: TarologistActionsProps) {
  const router = useRouter();

  const toggleActive = async () => {
    const supabase = createClient();
    await supabase
      .from('tarologists')
      .update({ is_active: !tarologist.is_active, updated_at: new Date().toISOString() })
      .eq('id', tarologist.id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить таролога "${tarologist.name}"? Это действие необратимо.`)) return;

    const supabase = createClient();
    await supabase.from('tarologists').delete().eq('id', tarologist.id);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/tarologi/${tarologist.id}/edit`}
        className="text-sm text-primary hover:underline"
      >
        Изменить
      </Link>
      <button
        onClick={toggleActive}
        className="text-sm text-warning hover:underline cursor-pointer"
      >
        {tarologist.is_active ? 'Скрыть' : 'Показать'}
      </button>
      <button
        onClick={handleDelete}
        className="text-sm text-danger hover:underline cursor-pointer"
      >
        Удалить
      </button>
    </div>
  );
}
