import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-white rounded-xl shadow-[0_2px_8px_var(--color-card-shadow)]',
        hover && 'transition-all duration-200 hover:shadow-[0_4px_16px_var(--color-card-shadow)] hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}
