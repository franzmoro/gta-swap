import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

type ToastType = 'error' | 'loading' | 'success';

export const getToastStyle = (type: ToastType) => {
  switch (type) {
    case 'error':
      return {
        backgroundColor: 'oklch(40% 0.05 0 / 0.9)',
        border: '1px solid oklch(40% 0.05 0)',
        borderRadius: '0.5rem',
        color: 'oklch(80% 0.05 0)',
      };
    case 'loading':
      return {
        backgroundColor: 'oklch(29.4% 0.0692 248.84)',
        border: '1px solid oklch(35% 0.071 255.8)',
        borderRadius: '0.5rem',
        color: 'oklch(85.81% 0.0343 239.9)',
      };
    case 'success':
      return {
        backgroundColor: 'oklch(91.56% 0.1946 122.73)',
        border: '1px solid oklch(87.99% 0.1927 145.41)', // --secondary
        borderRadius: '0.5rem',
        color: 'oklch(21.77% 0.0714 256.04)', // --secondary
      };
    default:
      return {};
  }
};

export const useTransactionToast = () => {
  const toastIdRef = useRef<null | number | string>(null);

  const showToast = useCallback(
    (type: ToastType, title: string, subtitle?: React.ReactNode | string, duration?: number) => {
      if (toastIdRef.current === null) {
        toastIdRef.current = toast[type](title, {
          closeButton: type !== 'loading',
          description: subtitle,
          duration: duration ?? (type === 'loading' ? Infinity : 5000),
          style: getToastStyle(type),
        });
      } else {
        toast[type](title, {
          id: toastIdRef.current,
          closeButton: type !== 'loading',
          description: subtitle,
          duration: duration ?? (type === 'loading' ? Infinity : 5000),
          style: getToastStyle(type),
        });
      }
    },
    []
  );

  const showLoading = useCallback(
    (title: string, subtitle?: React.ReactNode | string) => {
      showToast('loading', title, subtitle);
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (title: string, subtitle?: React.ReactNode | string, duration?: number) => {
      showToast('success', title, subtitle, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, subtitle?: React.ReactNode | string, duration?: number) => {
      showToast('error', title, subtitle, duration);
    },
    [showToast]
  );

  return { showError, showLoading, showSuccess };
};
