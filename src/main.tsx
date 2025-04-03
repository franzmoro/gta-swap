import './index.css';
import App from './App.tsx';
import { SmoothScrollbar } from './components/scrollbar/index.tsx';
import { Providers } from './components/wallet-provider/provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <SmoothScrollbar />
      <App />
    </Providers>
  </StrictMode>
);
