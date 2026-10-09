import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn-style `cn()` — concatenates conditional class names and
 *  resolves Tailwind conflicts with `twMerge`. Imported by every
 *  component in `@/components/ui/*`. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
