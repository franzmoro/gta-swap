import {
  slippageValueAtom,
  transactionSettings,
  updateSlippageAtom,
  updateTransactionDeadlineAtom,
} from '@/atom';
import { AUTO_SLIPPAGE_VALUE } from '@/constants/config';
import { Slippage } from '@/types';
import { useAtom, useAtomValue } from 'jotai';

const useTransactionSettings = () => {
  const { slippage, transactionDeadline } = useAtomValue(transactionSettings);
  const slippageFormatted = useAtomValue(slippageValueAtom);

  const [, updateSlippage] = useAtom(updateSlippageAtom);
  const [, updateTransactionDeadline] = useAtom(updateTransactionDeadlineAtom);

  const onUpdateSlippage = (value: string) => {
    if (value === Slippage.AUTO || value === AUTO_SLIPPAGE_VALUE.toString())
      updateSlippage(Slippage.AUTO);
    else if (value === '') updateSlippage('');
    else updateSlippage(parseFloat(value));
  };

  const onUpdateTransactionDeadline = (value: number) => {
    updateTransactionDeadline(value);
  };

  return {
    onUpdateSlippage,
    onUpdateTransactionDeadline,
    slippage,
    slippageFormatted,
    transactionDeadline,
  };
};

export default useTransactionSettings;
