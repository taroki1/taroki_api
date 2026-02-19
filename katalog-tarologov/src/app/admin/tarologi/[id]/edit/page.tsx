import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TarologistForm from '@/components/admin/TarologistForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTarologistPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: tarologist } = await supabase
    .from('tarologists')
    .select('*')
    .eq('id', id)
    .single();

  if (!tarologist) notFound();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tarologist_id', id)
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6">
        Редактировать: {tarologist.name}
      </h1>
      <TarologistForm tarologist={{ ...tarologist, services: services || [] }} />
    </div>
  );
}
