import './index.css';
import App from './App.tsx';
import { SmoothScrollbar } from './components/scrollbar/index.tsx';
import { Providers } from './components/wallet-provider/provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <SmoothScrollbar />
      <App />
      <Toaster position="top-right" richColors theme="light" />
    </Providers>
  </StrictMode>
);
