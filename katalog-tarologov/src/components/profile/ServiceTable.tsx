import { Service, WORK_FORMAT_ICONS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface ServiceTableProps {
  services: Service[];
}

export default function ServiceTable({ services }: ServiceTableProps) {
  if (services.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-heading)]">
          Услуги и цены
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg text-sm text-text-light">
              <th className="text-left px-5 py-3 font-medium">Услуга</th>
              <th className="text-left px-5 py-3 font-medium">Формат</th>
              <th className="text-left px-5 py-3 font-medium">Длительность</th>
              <th className="text-right px-5 py-3 font-medium">Цена</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className="border-t border-border hover:bg-bg/50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-text">
                  {service.name}
                </td>
                <td className="px-5 py-3 text-text-light text-sm">
                  {service.format && (
                    <span className="flex items-center gap-1.5">
                      <span>{WORK_FORMAT_ICONS[service.format] || ''}</span>
                      {service.format}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-text-light text-sm">
                  {service.duration_minutes
                    ? `${service.duration_minutes} мин`
                    : '—'}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-primary">
                  {formatPrice(service.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
