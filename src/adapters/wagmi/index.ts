import { baseChain } from '@/constants/config';
import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseChain],
  connectors: [injected(), coinbaseWallet({ appName: 'GTA Swap' })],
  transports: {
    [baseChain.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
