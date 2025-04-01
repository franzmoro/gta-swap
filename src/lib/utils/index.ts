import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const sanitizeNumber = (value: string) => {
  let sanitizedValue = value.replace(/[^0-9.]/g, '');

  const decimalIndex = sanitizedValue.indexOf('.');
  if (decimalIndex !== -1 && sanitizedValue.length - decimalIndex > 3) {
    sanitizedValue = sanitizedValue.slice(0, decimalIndex + 3);
  }

  return sanitizedValue;
};
