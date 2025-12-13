import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

/**
 * Reusable section component with consistent styling and animations
 * Follows Single Responsibility - handles section layout only
 */
export function Section({
  id,
  title,
  subtitle,
  children,
  className,
  containerClassName,
  fullWidth = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-20 md:py-32',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto px-6',
          fullWidth ? 'max-w-full' : 'max-w-6xl',
          containerClassName
        )}
      >
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16"
          >
            {subtitle && (
              <span className="inline-block mb-3 text-accent-500 font-mono text-sm uppercase tracking-wider">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-100 dark:text-midnight-100">
                {title}
              </h2>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

