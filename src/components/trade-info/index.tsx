import InfoButton from '@/components/tooltip';
import { GOATAI_TOKEN } from '@/constants/tokens';
import useTradeInfo from '@/hooks/use-trade-info';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import { formatNumberOrString, formatPercent, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';
import { ReactNode } from 'react';

type TradeInfoSectionProps = {
  isReviewModal?: boolean;
  selectedTokens: SelectedTokens;
  swapAmounts: SwapAmounts;
};

const TransactionInfo = ({
  label,
  tooltipContent,
  value,
}: {
  label: string;
  tooltipContent?: ReactNode;
  value: string;
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-1">
        <p className="text-sm text-foreground/60">{label}</p>
        {tooltipContent && <InfoButton content={tooltipContent} />}
      </div>
      <p className="text-end text-sm text-foreground/80">{value}</p>
    </div>
  );
};

const TradeInfoSection = ({
  isReviewModal = false,
  selectedTokens,
  swapAmounts,
}: TradeInfoSectionProps) => {
  const { networkFee, priceImpact, rate, slippage, taxOnToken, tradeFee } = useTradeInfo({
    selectedTokens,
    swapAmounts,
  });

  const { tokenPriceInUSD } = useGetTokenUSDPrice(selectedTokens[SwapMode.BUY]);

  return (
    <div className="flex flex-col gap-3">
      <TransactionInfo
        label="$GOATAI fee (6%)"
        tooltipContent={
          <div>
            <p>We charge a 6% fee on buy/sell trades.</p>
            <p>
              60% goes to support charitable activities of the Global Running Foundation (GRF).{' '}
              <a
                className="text-primary hover:underline"
                href="https://goatathletics.ai/charity"
                rel="noopener noreferrer"
                target="_blank"
              >
                Learn more
              </a>
            </p>
            <p>
              40% goes to Team G.O.A.T.AI operations and marketing. This will allow us to have a
              sustainable model to continue operating and provide a steady stream of funding for
              projects.{' '}
            </p>
            <a
              className="text-primary hover:underline"
              href="https://www.goatathletics.ai/team-goatai"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn more
            </a>
          </div>
        }
        value={formatNumberOrString({
          input: taxOnToken,
          suffix: GOATAI_TOKEN.symbol,
          type: NumberType.TokenNonTx,
        })}
      />
      <TransactionInfo
        label="Trade fee (0.30%)"
        tooltipContent="Standard Liquidity fee charged by Uniswap"
        value={formatNumberOrString({
          input: tradeFee,
          suffix: selectedTokens[SwapMode.SELL].symbol,
          type: NumberType.TokenNonTx,
        })}
      />
      <TransactionInfo
        label="Network cost"
        tooltipContent="This is the cost of the transaction on the network."
        value={formatNumberOrString({
          input: networkFee,
          suffix: 'ETH',
          type: NumberType.TokenNonTx,
        })}
      />
      <TransactionInfo
        label="Max. slippage"
        tooltipContent="Your transaction will revert if the price slips more than the slippage percentage."
        value={formatPercent(slippage)}
      />
      <TransactionInfo
        label="Price impact"
        tooltipContent="The impact your trade has on the market price of this pool"
        value={formatPercent(priceImpact)}
      />
      {isReviewModal && (
        <TransactionInfo
          label="Rate"
          value={`1 ${selectedTokens[SwapMode.SELL].symbol} = ${formatNumberOrString({
            input: rate,
            suffix: selectedTokens[SwapMode.BUY].symbol,
            type: NumberType.SwapPrice,
          })} (${formatNumberOrString({
            conversionRate: tokenPriceInUSD,
            input: rate,
            type: NumberType.FiatTokenPrice,
          })})`}
        />
      )}
    </div>
  );
};

export default TradeInfoSection;
