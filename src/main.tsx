import App from './App';
import { SmoothScrollbar } from './components/scrollbar';
import { Providers } from './components/wallet-provider/provider';
import css from './index.css?inline'; // treat CSS as a string (needed for vite-plugin-css-injected-by-js)
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

export function mount(id: string) {
  const host = document.getElementById(id);
  if (!host) {
    console.warn(`[SwapWidget] No element with id '${id}' found.`);
    return;
  }

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject CSS into shadow root
  const style = document.createElement('style');
  style.textContent = css;
  shadowRoot.appendChild(style);

  // Mount React app
  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  ReactDOM.createRoot(mountPoint).render(
    <StrictMode>
      <Providers>
        <SmoothScrollbar />
        <App />
        <Toaster position="top-right" richColors theme="light" />
      </Providers>
    </StrictMode>
  );
}

(window as any).GoataiSwapWidget = {
  mount: () => mount('goatai-swap-widget'),
};
