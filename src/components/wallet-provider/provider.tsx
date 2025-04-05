import { client } from '@/adapters/thirdweb';
import { config } from '@/adapters/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { hashFn } from '@wagmi/core/query';
import { type ReactNode } from 'react';
import { useEffect } from 'react';
import { viemAdapter } from 'thirdweb/adapters/viem';
import { ThirdwebProvider } from 'thirdweb/react';
import { useActiveWallet, useSetActiveWallet } from 'thirdweb/react';
import { createWalletAdapter } from 'thirdweb/wallets';
import { defineChain } from 'viem';
import { WagmiProvider } from 'wagmi';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useWalletClient } from 'wagmi';

export const Updater = () => {
  const wagmiAccount = useAccount();

  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const setActiveWallet = useSetActiveWallet();
  const { disconnectAsync } = useDisconnect();

  useEffect(() => {
    const setActive = async () => {
      if (walletClient) {
        const adaptedAccount = viemAdapter.walletClient.fromViem({
          walletClient: walletClient as any,
        });
        const w = createWalletAdapter({
          adaptedAccount,
          // @ts-ignore
          chain: defineChain(await walletClient.getChainId()),
          client,
          onDisconnect: async () => {
            await disconnectAsync();
          },
          switchChain: async (chain) => {
            await switchChainAsync({ chainId: chain.id as any });
          },
        });
        setActiveWallet(w);
      }
    };
    setActive();
  }, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);

  const thirdwebWallet = useActiveWallet();

  useEffect(() => {
    const disconnectIfNeeded = async () => {
      if (thirdwebWallet && wagmiAccount.status === 'disconnected') {
        await thirdwebWallet.disconnect();
      }
    };
    disconnectIfNeeded();
  }, [wagmiAccount, thirdwebWallet]);
  return null;
};

export const Providers = (props: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: hashFn,
      },
    },
  });

  return (
    <ThirdwebProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools client={queryClient} />
          <Updater />
          {props.children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThirdwebProvider>
  );
};
