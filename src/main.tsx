import './index.css';
import App from './App.tsx';
import { SmoothScrollbar } from './components/scrollbar/index.tsx';
import { Providers } from './components/wallet-provider/provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

// Create a mount function that can be called from the global scope
export function mountSwapWidget(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    createRoot(element).render(
      <StrictMode>
        <Providers>
          <SmoothScrollbar />
          <App />
          <Toaster position="top-right" richColors theme="light" />
        </Providers>
      </StrictMode>
    );
  }
}

// Auto-initialize if we're running directly
if (document.getElementById('goatai-swap-widget')) {
  mountSwapWidget('goatai-swap-widget');
}

// Make the mount function available globally
(window as any).mountSwapWidget = mountSwapWidget;
