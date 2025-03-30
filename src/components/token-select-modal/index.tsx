import { TokenLogo } from '@/components/token-logo';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tokens } from '@/constants/tokens';
import { shortenAddress } from '@/lib/utils';
import { Token } from '@/types';

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
            <div className="mr-2 flex flex-col items-end gap-2">
              <p>1000</p>
              <p className="text-xs text-foreground/50">$ 1000</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default TokenSelectModalContent;
