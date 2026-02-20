import TarologistForm from '@/components/admin/TarologistForm';

export default function NewTarologistPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6">
        Добавить таролога
      </h1>
      <TarologistForm />
    </div>
  );
}
