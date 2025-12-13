import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for merging class names
 * Provides type-safe class name concatenation
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

