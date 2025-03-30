import { client } from '@/adapters/thirdweb';
import AvatarImg from '@/assets/images/avatar.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import useWeb3React from '@/hooks/use-web3-react';
import { cn, shortenAddress } from '@/lib/utils';
import { base } from 'thirdweb/chains';
import { ConnectButton } from 'thirdweb/react';

export const ConnectWalletButton = ({ size = 'default' }: { size?: 'default' | 'lg' }) => {
  const { address, isBaseSelected, isConnected, isConnecting, switchNetworkToBase } =
    useWeb3React();

  return isConnected && !isBaseSelected ?
      <Button onClick={switchNetworkToBase} size={size} variant="outline">
        Switch to Base Network
      </Button>
    : <ConnectButton
        chain={base}
        client={client}
        connectButton={{
          className: cn('btn-wallet-connect', size === 'lg' ? '!h-12' : '!h-8'),
          label: isConnecting ? 'Connecting...' : 'Connect Wallet',
        }}
        detailsButton={{
          render: () => {
            return (
              <Button size={size} variant="outline">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={AvatarImg} />
                  <AvatarFallback>Token</AvatarFallback>
                </Avatar>
                {address ? shortenAddress(address) : '...'}
              </Button>
            );
          },
        }}
      />;
};
