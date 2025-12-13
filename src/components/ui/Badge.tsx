import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'accent' | 'teal' | 'coral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-midnight-700 text-midnight-200',
  accent: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
  teal: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  coral: 'bg-coral-500/20 text-coral-400 border border-coral-500/30',
};

/**
 * Reusable badge component for tags and labels
 */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

