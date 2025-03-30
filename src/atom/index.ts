import { AUTO_SLIPPAGE_VALUE, DEFAULT_TRANSACTION_DEADLINE } from '@/constants/config';
import { Slippage } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type TransactionSettings = {
  slippage: '' | number | Slippage;
  transactionDeadline: number;
};

export const transactionSettings = atomWithStorage<TransactionSettings>(
  'user-txn-settings',
  {
    slippage: Slippage.AUTO,
    transactionDeadline: DEFAULT_TRANSACTION_DEADLINE,
  },
  undefined,
  { getOnInit: true }
);

export const slippageValueAtom = atom((get) => {
  const { slippage } = get(transactionSettings);
  if (slippage === Slippage.AUTO || slippage === '') return AUTO_SLIPPAGE_VALUE;
  return slippage;
});
export const updateSlippageAtom = atom(null, (get, set, newSlippage: '' | number | Slippage) => {
  const currentSettings = get(transactionSettings);
  set(transactionSettings, { ...currentSettings, slippage: newSlippage });
});

export const updateTransactionDeadlineAtom = atom(
  null,
  (get, set, newTransactionDeadline: number) => {
    const currentSettings = get(transactionSettings);
    set(transactionSettings, { ...currentSettings, transactionDeadline: newTransactionDeadline });
  }
);
