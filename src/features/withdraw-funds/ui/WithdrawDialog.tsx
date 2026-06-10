import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';

import type { AssetSymbol, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Dropdown } from '@/shared/ui/Dropdown';
import {
  StepBars,
  AssetPill,
  FileUpload,
  Field,
  MethodCards,
} from '@/shared/ui/transfer-flow-parts';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import {
  ASSET_META,
  FIAT_SET,
  CRYPTO_SET,
  PRICES_USD,
  fiatFieldsFor,
  isFiat,
  networksFor,
} from '@/constants/assets';
import { fmtAsset } from '@/lib/format';
import {
  toPaymentMethod,
  withdrawSchema,
  type WithdrawFormValues,
  type WithdrawSubmitValues,
} from '@/features/withdraw-funds/model/schemas';

type Method = 'Bank' | 'Crypto';
type WithdrawStep = 1 | 2 | 3 | 'done';

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  initialAsset?: AssetSymbol | null;
}

const EMPTY_WITHDRAW_VALUES: WithdrawFormValues = {
  method: undefined,
  rail: 'SWIFT',
  asset: '',
  amount: '',
  network: '',
  destination: {},
  proof: null,
};

export function WithdrawDialog({
  open,
  onClose,
  initialAsset,
}: WithdrawDialogProps) {
  const withdraw = useTradeStore((state) => state.withdraw);
  const balances = useTradeStore((state) => state.balances);
  const pushToast = useUiStore((state) => state.pushToast);

  const [step, setStep] = useState<WithdrawStep>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WithdrawFormValues, unknown, WithdrawSubmitValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: EMPTY_WITHDRAW_VALUES,
  });

  const method = watch('method');
  const rail = watch('rail');
  const asset = watch('asset');
  const amount = watch('amount');
  const network = watch('network');
  const destination = watch('destination') ?? {};
  const proof = watch('proof');

  const fiat = method === 'Bank';
  const effMethod: PaymentMethod = toPaymentMethod(method, rail);
  const amt = Number(amount) || 0;
  const bal = asset ? balances[asset] ?? 0 : 0;
  const assetList = fiat ? FIAT_SET : CRYPTO_SET;
  const exceeds = !!asset && amt > bal;

  useEffect(() => {
    if (!open) return;

    if (initialAsset) {
      const initialIsFiat = isFiat(initialAsset);
      const nets = initialIsFiat ? [] : networksFor(initialAsset);

      reset({
        method: initialIsFiat ? 'Bank' : 'Crypto',
        rail: initialAsset === 'EUR' ? 'SEPA' : 'SWIFT',
        asset: initialAsset,
        amount: '',
        network: initialIsFiat ? '' : nets.length === 1 ? nets[0] : '',
        destination: {},
        proof: null,
      });

      setStep(2);
      return;
    }

    reset(EMPTY_WITHDRAW_VALUES);
    setStep(1);
  }, [open, initialAsset, reset, setStep]);

  const onPickMethod = (nextMethod: Method | null) => {
    setValue('method', nextMethod ?? undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('asset', '', { shouldDirty: true });
    setValue('amount', '', { shouldDirty: true });
    setValue('network', '', { shouldDirty: true });
    setValue('destination', {}, { shouldDirty: true });
    setValue('proof', null, { shouldDirty: true });
  };

  const onPickAsset = (nextAsset: AssetSymbol) => {
    setValue('asset', nextAsset, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('destination', {}, { shouldDirty: true });
    setValue('proof', null, { shouldDirty: true });

    if (fiat) {
      setValue('rail', nextAsset === 'EUR' ? 'SEPA' : 'SWIFT', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('network', '', { shouldDirty: true });
      return;
    }

    const nets = networksFor(nextAsset);
    setValue('network', nets.length === 1 ? nets[0] : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const setDestinationField = (field: string, value: string) => {
    setValue(
      'destination',
      {
        ...destination,
        [field]: value,
      },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit = (values: WithdrawSubmitValues) => {
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
      return;
    }

    setStep('done');

    pushToast(
      'success',
      'Withdrawal submitted',
      `${values.amount.toLocaleString('en-US')} ${values.asset} debited. Transaction recorded.`,
    );
  };

  const next = () => {
    if (step === 1 && method) {
      setStep(2);
      setValue('asset', '', { shouldDirty: true });
      return;
    }

    if (step === 2 && asset && amt > 0 && !exceeds) {
      setStep(3);
      return;
    }

    if (step === 3) {
      void handleSubmit(onSubmit)();
    }
  };

  const back = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const nextEnabled =
    (step === 1 && !!method) ||
    (step === 2 && !!asset && amt > 0 && !exceeds) ||
    (step === 3 && !!asset && !!proof);

  const nextLabel = step === 3 ? 'Submit Withdrawal' : 'Continue';

  const subtitle =
    step === 'done'
      ? 'Submitted'
      : [
          'Choose a withdrawal method',
          'Select asset and amount',
          'Enter your destination details',
        ][step - 1];

  const footer =
    step === 'done' ? (
      <Button type="button" className="w-full" onClick={onClose}>
        Close
      </Button>
    ) : (
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {(step === 2 || step === 3) && (
          <Button type="button" variant="ghost" onClick={back}>
            Back
          </Button>
        )}

        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button type="button" disabled={!nextEnabled} onClick={next}>
          {nextLabel}
        </Button>
      </div>
    );

  const stepNum = step === 'done' ? 3 : step;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              Withdraw
              {asset && step !== 1 && <AssetPill label={`${asset} · ${effMethod}`} />}
            </span>
          </DialogTitle>

          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step !== 'done' && <StepBars total={3} current={stepNum} />}

          {step === 1 && (
            <MethodCards value={method ?? null} onChange={onPickMethod} />
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Asset</div>
                <Dropdown
                  value={asset}
                  options={assetList.map((item) => ({
                    value: item,
                    label: `${item} — ${ASSET_META[item].name}`,
                    search: `${item} ${ASSET_META[item].name}`,
                  }))}
                  onChange={onPickAsset}
                  searchable
                  placeholder="Select asset"
                />
                {errors.asset && (
                  <p className="text-xs text-destructive">{errors.asset.message}</p>
                )}
              </div>

              {fiat && asset && (
                <div className="flex gap-2">
                  {asset === 'EUR' && (
                    <Button
                      type="button"
                      size="sm"
                      variant={rail === 'SEPA' ? 'default' : 'outline'}
                      onClick={() =>
                        setValue('rail', 'SEPA', {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      SEPA
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant={rail === 'SWIFT' ? 'default' : 'outline'}
                    onClick={() =>
                      setValue('rail', 'SWIFT', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    SWIFT
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">Amount</span>

                  {asset && (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      Available: {fmtAsset(asset, bal)} {asset}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          setValue('amount', String(bal), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        All
                      </Button>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    {...register('amount')}
                  />
                  <span className="min-w-12 rounded-md border border-border bg-muted px-3 py-2 text-center text-sm font-medium text-muted-foreground">
                    {asset || '—'}
                  </span>
                </div>

                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}

                {asset &&
                  amt > 0 &&
                  (exceeds ? (
                    <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      ⚠ Exceeds available balance
                    </div>
                  ) : !isFiat(asset) ? (
                    <div className="text-xs text-muted-foreground">
                      ≈ $
                      {(amt * (PRICES_USD[asset] ?? 1)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      USD
                    </div>
                  ) : null)}
              </div>
            </div>
          )}

          {step === 3 && asset && (
            <div className="space-y-4">
              {fiat ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {fiatFieldsFor(effMethod, asset).map((field) => (
                    <Field key={field.id} label={field.lbl} required={field.req}>
                      <input
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        type="text"
                        placeholder={field.ph}
                        value={destination[field.id] ?? ''}
                        onChange={(event) =>
                          setDestinationField(field.id, event.target.value)
                        }
                      />
                      {errors.destination?.[field.id] && (
                        <p className="text-xs text-destructive">
                          {errors.destination[field.id]?.message}
                        </p>
                      )}
                    </Field>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">Network</div>

                    <Dropdown
                      value={network ?? ''}
                      options={networksFor(asset)}
                      onChange={(nextNetwork) => {
                        setValue('network', nextNetwork, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue('destination', {}, { shouldDirty: true });
                        setValue('proof', null, { shouldDirty: true });
                      }}
                      placeholder="Select network"
                    />

                    {errors.network && (
                      <p className="text-xs text-destructive">
                        {errors.network.message}
                      </p>
                    )}
                  </div>

                  <Field label="Destination Address" required>
                    <input
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      type="text"
                      placeholder={`Your ${asset} wallet address`}
                      value={destination.address ?? ''}
                      onChange={(event) =>
                        setDestinationField('address', event.target.value)
                      }
                    />
                    {errors.destination?.address && (
                      <p className="text-xs text-destructive">
                        {errors.destination.address.message}
                      </p>
                    )}
                  </Field>
                </div>
              )}

              <div className="space-y-4">
                <FileUpload
                  label="Supporting Document (invoice / contract)"
                  prompt="Attach invoice or contract"
                  onChange={(file) =>
                    setValue('proof', file, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />

                {errors.proof && (
                  <p className="text-xs text-destructive">{errors.proof.message}</p>
                )}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <div className="text-sm font-medium text-foreground">
                {amt.toLocaleString('en-US')} {asset} via {effMethod} is being processed.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
