import { BASE_CHAIN_ID } from '@/constants/config';
import { useAccount, useSwitchChain } from 'wagmi';

const useWeb3React = () => {
  const { switchChain } = useSwitchChain();

  const { address, chainId, isConnected, isConnecting } = useAccount();

  const switchNetworkToBase = () => {
    switchChain({ chainId: BASE_CHAIN_ID });
  };

  return {
    address,
    isBaseSelected: chainId === BASE_CHAIN_ID,
    isConnected,
    isConnecting,
    switchNetworkToBase,
  };
};

export default useWeb3React;
