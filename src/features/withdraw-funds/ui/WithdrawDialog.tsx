import type { AssetSymbol } from '@/types';

import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';

import {
  toPaymentMethod,
  type WithdrawSubmitValues,
} from '@/features/withdraw-funds/model/schemas';

import { WithdrawDialogView } from './WithdrawDialogView';

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  initialAsset?: AssetSymbol | null;
}

export function WithdrawDialog({
  open,
  onClose,
  initialAsset,
}: WithdrawDialogProps) {
  const withdraw = useTradeStore((state) => state.withdraw);
  const balances = useTradeStore((state) => state.balances);
  const pushToast = useUiStore((state) => state.pushToast);

  const onSubmitWithdraw = (values: WithdrawSubmitValues) => {
    const ok = withdraw(
      values.asset,
      values.amount,
      toPaymentMethod(values.method, values.rail),
    );

    if (!ok) {
      pushToast(
        'error',
        'Insufficient balance',
        'Withdrawal amount exceeds your available balance.',
      );

      return false;
    }

    pushToast(
      'success',
      'Withdrawal submitted',
      `${values.amount.toLocaleString('en-US')} ${values.asset} debited. Transaction recorded.`,
    );

    return true;
  };

  return (
    <WithdrawDialogView
      open={open}
      onClose={onClose}
      initialAsset={initialAsset}
      balances={balances}
      onSubmitWithdraw={onSubmitWithdraw}
    />
  );
}