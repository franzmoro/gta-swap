import { base } from 'thirdweb/chains';
import {
  useActiveAccount,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
const useWeb3React = () => {
  const activeAccount = useActiveAccount();
  const status = useActiveWalletConnectionStatus();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const switchNetworkToBase = () => {
    switchChain(base);
  };

  const { address } = activeAccount || {};

  return {
    address,
    isBaseSelected: activeChain === base,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    switchNetworkToBase,
  };
};

export default useWeb3React;
