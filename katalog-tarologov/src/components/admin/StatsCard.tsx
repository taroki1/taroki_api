import Card from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-3xl font-bold text-text mt-1 font-[family-name:var(--font-heading)]">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Card>
  );
}
