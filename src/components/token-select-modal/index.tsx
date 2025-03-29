import { TokenLogo } from '../token-logo';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tokens } from '@/constants/tokens';
import { Token } from '@/types';

const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const TokenSelectModalContent = ({ onSelectToken }: { onSelectToken: (token: Token) => void }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">Select a token</DialogTitle>
      </DialogHeader>
      <div className="mt-6 flex max-h-[80vh] flex-col space-y-4 overflow-y-auto">
        {tokens.map((token) => (
          <button
            className="flex items-center justify-between rounded-md transition-colors hover:bg-primary/10"
            key={token.address}
            onClick={() => onSelectToken(token)}
          >
            <div className="flex items-center justify-between gap-2 rounded-md p-2">
              <TokenLogo tokenSrc={token.logo} />
              <div className="text-left">
                <p className="text-lg font-medium text-foreground">{token.name}</p>
                <div className="flex items-end gap-2">
                  <p className="text-sm text-foreground/70">{token.symbol}</p>
                  {!token.isNative && (
                    <p className="text-xs text-foreground/50">{shortenAddress(token.address)}</p>
                  )}
                </div>
              </div>
            </div>
            <p className="mr-2">1000</p>
          </button>
        ))}
      </div>
    </>
  );
};

export default TokenSelectModalContent;
