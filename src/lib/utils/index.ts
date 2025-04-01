import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
