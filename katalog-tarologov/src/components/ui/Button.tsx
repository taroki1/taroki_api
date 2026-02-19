import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark',
          variant === 'secondary' && 'bg-accent text-primary-dark hover:bg-accent-light active:bg-accent-dark',
          variant === 'outline' && 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
          variant === 'ghost' && 'text-primary hover:bg-primary/10',
          variant === 'danger' && 'bg-danger text-white hover:bg-danger/90',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
