import { TokenLogo } from '@/components/token-logo';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { tokens } from '@/constants/tokens';
import { useAllTokenBalance } from '@/hooks/use-token-balance';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import useWeb3React from '@/hooks/use-web3-react';
import { cn, shortenAddress } from '@/lib/utils';
import { formatFiatPrice, formatNumberOrString, NumberType } from '@/lib/utils/format-number';
import { Token } from '@/types';
import type { GetBalanceResult } from 'thirdweb/extensions/erc20';
type TokenSelectModalContentProps = {
  disabledTokens?: Token[];
  onSelectToken: (token: Token) => void;
};

const TokenRow = ({
  isLoading,
  token,
  userBalance,
}: {
  isLoading: boolean;
  token: Token;
  userBalance?: GetBalanceResult;
}) => {
  const { isLoading: isTokenPriceLoading, tokenPriceInUSD } = useGetTokenUSDPrice(token);
  const { isBaseSelected, isConnected } = useWeb3React();

  return (
    <>
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
      {isConnected && isBaseSelected && (
        <div className="mr-2 flex flex-col items-end gap-2">
          {isLoading || isTokenPriceLoading ?
            <Skeleton className="skeleton h-4 w-[50px] rounded-sm" />
          : userBalance?.value ?
            <>
              <p>
                {formatNumberOrString({
                  input: userBalance.displayValue,
                  type: NumberType.TokenNonTx,
                })}
              </p>
              <p className="text-xs text-foreground/70">
                {formatFiatPrice({
                  conversionRate: tokenPriceInUSD,
                  price: parseFloat(userBalance.displayValue),
                })}
              </p>
            </>
          : ''}
        </div>
      )}
    </>
  );
};

const TokenSelectModalContent = ({
  disabledTokens,
  onSelectToken,
}: TokenSelectModalContentProps) => {
  const { data, isLoading } = useAllTokenBalance();

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">Select a token</DialogTitle>
      </DialogHeader>
      <div className="mt-6 flex max-h-[80vh] flex-col space-y-4 overflow-y-auto">
        {tokens.map((token) => {
          const isDisabled = !!disabledTokens?.find((t) => t.address === token.address);
          return (
            <button
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-primary/10',
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
              disabled={isDisabled}
              key={token.address}
              onClick={() => onSelectToken(token)}
            >
              <TokenRow isLoading={isLoading} token={token} userBalance={data?.[token.address]} />
            </button>
          );
        })}
      </div>
    </>
  );
};

export default TokenSelectModalContent;
