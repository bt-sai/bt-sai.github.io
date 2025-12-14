import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-500 text-midnight-900 hover:bg-accent-400 active:bg-accent-600 shadow-lg shadow-accent-500/25',
  secondary:
    'bg-midnight-700 text-midnight-100 hover:bg-midnight-600 active:bg-midnight-800',
  ghost:
    'bg-transparent text-midnight-200 hover:bg-white/5 active:bg-white/10',
  outline:
    'bg-transparent border-2 border-midnight-500 text-midnight-200 hover:border-accent-500 hover:text-accent-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * Reusable button component with multiple variants
 * Follows Interface Segregation - clear, focused props interface
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  external = false,
}: LinkButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  );
}

