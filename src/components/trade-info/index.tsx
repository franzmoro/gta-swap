import InfoButton from '@/components/tooltip';
import { GOATAI_TOKEN } from '@/constants/tokens';
import useTradeInfo from '@/hooks/use-trade-info';
import { useGetTokenUSDPrice } from '@/hooks/use-usd-price';
import { formatNumberOrString, formatPercent, NumberType } from '@/lib/utils/format-number';
import { SelectedTokens, SwapAmounts, SwapMode } from '@/types';

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
  tooltipContent?: string;
  value: string;
}) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-1">
        <p className="text-sm text-foreground/60">{label}</p>
        {tooltipContent && <InfoButton content={tooltipContent} />}
      </div>
      <p className="text-sm text-foreground/80">{value}</p>
    </div>
  );
};

const TradeInfoSection = ({
  isReviewModal = false,
  selectedTokens,
  swapAmounts,
}: TradeInfoSectionProps) => {
  const { rate, slippage, taxOnToken, tradeFee } = useTradeInfo({
    selectedTokens,
    swapAmounts,
  });

  const { tokenPriceInUSD } = useGetTokenUSDPrice(selectedTokens[SwapMode.BUY]);

  return (
    <div className="flex flex-col gap-3">
      <TransactionInfo
        label="G.O.A.T.AI fee (6%)"
        tooltipContent="Your transaction will revert if the price changes more than the slippage percentage."
        value={formatNumberOrString({
          input: taxOnToken,
          placeholder: '',
          suffix: GOATAI_TOKEN.symbol,
          type: NumberType.TokenNonTx,
        })}
      />
      <TransactionInfo
        label="Trade fee (0.30%)"
        tooltipContent="Your transaction will revert if the price changes more than the slippage percentage."
        value={formatNumberOrString({
          input: tradeFee,
          placeholder: '',
          suffix: selectedTokens[SwapMode.SELL].symbol,
          type: NumberType.TokenNonTx,
        })}
      />
      <TransactionInfo
        label="Network cost"
        tooltipContent="This is the cost of the transaction on the network."
        value="0.001 ETH"
      />
      <TransactionInfo
        label="Max. slippage"
        tooltipContent="Your transaction will revert if the price slips more than the slippage percentage."
        value={formatPercent(slippage)}
      />
      <TransactionInfo
        label="Price impact"
        tooltipContent="The impact your trade has on the market price of this pool"
        value="0.05%"
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
            placeholder: '',
            type: NumberType.FiatTokenPrice,
          })})`}
        />
      )}
    </div>
  );
};

export default TradeInfoSection;
