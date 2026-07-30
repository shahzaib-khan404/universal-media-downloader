import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          variant === 'default' && 'bg-accent text-white hover:bg-indigo-400',
          variant === 'secondary' && 'bg-surface2 text-white hover:bg-surface',
          variant === 'ghost' && 'bg-transparent text-muted hover:text-white',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
