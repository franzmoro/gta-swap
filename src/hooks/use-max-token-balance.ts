import { useMemo } from 'react';
import { parseEther } from 'viem/utils';

export const GAS_FEE_UPPER_LIMIT = parseEther('0.01'); // 0.01 ETH

const useMaxBalance = (
  balance: bigint | undefined,
  isNativeToken: boolean | undefined,
  gasFee: bigint = GAS_FEE_UPPER_LIMIT
): bigint | undefined => {
  const maxBalance = useMemo(
    () =>
      balance && balance > BigInt(0) ?
        isNativeToken ? balance - gasFee
        : balance
      : BigInt(0),
    [balance, gasFee, isNativeToken]
  );

  return maxBalance > BigInt(0) ? maxBalance : undefined;
};

export default useMaxBalance;
