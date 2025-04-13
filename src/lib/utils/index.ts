import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapSizeToTailwindClass(size: number, breakpoint?: string): string {
  const sizeMap: Record<number, string> = {
    128: 'w-32 h-32',
    16: 'w-4 h-4',
    20: 'w-5 h-5',
    24: 'w-6 h-6',
    28: 'w-7 h-7',
    32: 'w-8 h-8',
    36: 'w-9 h-9',
    40: 'w-10 h-10',
    48: 'w-12 h-12',
    56: 'w-14 h-14',
    64: 'w-16 h-16',
    80: 'w-20 h-20',
    96: 'w-24 h-24',
  };

  const sizes = Object.keys(sizeMap).map(Number);
  const closestSize = sizes.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );

  const sizeClass = sizeMap[closestSize];

  return breakpoint ? sizeClass.replace(/w-|h-/g, `${breakpoint}:$&`) : sizeClass;
}

export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const sanitizeNumber = (value: string, maxDecimals?: number) => {
  let sanitizedValue = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point exists
  const parts = sanitizedValue.split('.');
  if (parts.length > 2) {
    sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
  }

  // Apply decimal limit **only if maxDecimals is defined**
  if (maxDecimals && parts.length === 2) {
    sanitizedValue = `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }

  return sanitizedValue;
};
