import type { AssetSymbol } from '@/types';

import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';

import {
  toPaymentMethod,
  type DepositSubmitValues,
} from '@/features/deposit-funds/model/schemas';

import { DepositDialogView } from './DepositDialogView';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  initialAsset?: AssetSymbol | null;
}

export function DepositDialog({
  open,
  onClose,
  initialAsset,
}: DepositDialogProps) {
  const deposit = useTradeStore((state) => state.deposit);
  const pushToast = useUiStore((state) => state.pushToast);

  const onSubmitDeposit = (values: DepositSubmitValues) => {
    deposit(
      values.asset,
      values.amount,
      toPaymentMethod(values.method, values.rail),
    );

    pushToast(
      'success',
      'Deposit submitted',
      'Proof received. Transaction added as Pending.',
    );
  };

  return (
    <DepositDialogView
      open={open}
      onClose={onClose}
      initialAsset={initialAsset}
      onSubmitDeposit={onSubmitDeposit}
    />
  );
}