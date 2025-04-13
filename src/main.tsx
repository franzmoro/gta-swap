import './index.css';
import App from './App.tsx';
import { SmoothScrollbar } from './components/scrollbar/index.tsx';
import { Providers } from './components/wallet-provider/provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

// Create a mount function that uses Shadow DOM
export function mount(elementId: string) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Create shadow root
  const shadow = container.attachShadow({ mode: 'open' });

  // Create a container for React
  const shadowRoot = document.createElement('div');
  shadowRoot.id = 'shadow-root-container';
  shadow.appendChild(shadowRoot);

  // Add your CSS to the shadow DOM
  const style = document.createElement('style');
  // Add cache-breaking parameter
  // const timestamp = new Date().getTime();

  // Include bundled CSS
  fetch(`https://goatai-swap-widget.pages.dev/gta-swap1.css`)
    .then((response) => response.text())
    .then((css) => {
      style.textContent = css;
      shadow.appendChild(style);
    })
    .catch((error) => console.error('Failed to load CSS:', error));

  // // Mount React to the inner container
  createRoot(shadowRoot).render(
    <StrictMode>
      <Providers>
        <SmoothScrollbar />
        <App />
        <Toaster position="top-right" richColors theme="light" />
      </Providers>
    </StrictMode>
  );
}

// Make the mount function available globally
(window as any).GoataiSwapWidget = {
  mount: () => mount('goatai-swap-widget'),
};
