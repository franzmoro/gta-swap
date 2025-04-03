import { useEffect } from 'react';

export const SmoothScrollbar = () => {
  useEffect(() => {
    document.documentElement.classList.add('smooth-scrollbar');

    return () => {
      document.documentElement.classList.remove('smooth-scrollbar');
    };
  }, []);

  return null;
};
