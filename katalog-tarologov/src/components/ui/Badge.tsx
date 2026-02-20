import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'danger' | 'outline';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-border/50 text-text-light',
        variant === 'primary' && 'bg-primary/10 text-primary',
        variant === 'accent' && 'bg-accent/20 text-accent-dark',
        variant === 'success' && 'bg-success/10 text-success',
        variant === 'danger' && 'bg-danger/10 text-danger',
        variant === 'outline' && 'border border-border text-text-light',
        className
      )}
    >
      {children}
    </span>
  );
}
