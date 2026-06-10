import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { AssetSymbol, PaymentMethod } from '@/types';
import { Modal } from '@/components/ui/feedback';
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
      <button className="m-btn primary full" onClick={onClose}>
        Close
      </button>
    ) : (
      <div className="m-actions">
        {(step === 2 || step === 3) && (
          <button className="m-btn ghost" onClick={back}>
            Back
          </button>
        )}

        <button className="m-btn cancel" onClick={onClose}>
          Cancel
        </button>

        <button className="m-btn primary" disabled={!nextEnabled} onClick={next}>
          {nextLabel}
        </button>
      </div>
    );

  const stepNum = step === 'done' ? 3 : step;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="m-title-row">
          Withdraw
          {asset && step !== 1 && <AssetPill label={`${asset} · ${effMethod}`} />}
        </span>
      }
      subtitle={subtitle}
      footer={footer}
    >
      {step !== 'done' && <StepBars total={3} current={stepNum} />}

      {step === 1 && (
        <MethodCards value={method ?? null} onChange={onPickMethod} />
      )}

      {step === 2 && (
        <div className="m-stack">
          <div className="m-field">
            <div className="m-field-label">Asset</div>
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
            <div className="rail-toggle">
              {asset === 'EUR' && (
                <button
                  className={`rail-btn ${rail === 'SEPA' ? 'on' : ''}`}
                  onClick={() =>
                    setValue('rail', 'SEPA', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  SEPA
                </button>
              )}

              <button
                className={`rail-btn ${rail === 'SWIFT' ? 'on' : ''}`}
                onClick={() =>
                  setValue('rail', 'SWIFT', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                SWIFT
              </button>
            </div>
          )}

          <div className="m-field">
            <div className="m-field-label-row">
              <span className="m-field-label">Amount</span>

              {asset && (
                <span className="m-avail">
                  Available: {fmtAsset(asset, bal)} {asset}
                  <button
                    className="amt-all"
                    onClick={() =>
                      setValue('amount', String(bal), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    All
                  </button>
                </span>
              )}
            </div>

            <div className="amt-row">
              <input
                className="vinp"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                {...register('amount')}
              />
              <span className="amt-ccy">{asset || '—'}</span>
            </div>

            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}

            {asset &&
              amt > 0 &&
              (exceeds ? (
                <div className="amt-hint err">⚠ Exceeds available balance</div>
              ) : !isFiat(asset) ? (
                <div className="amt-hint">
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
        <div className="m-stack">
          {fiat ? (
            <div className="m-fields-grid">
              {fiatFieldsFor(effMethod, asset).map((field) => (
                <Field key={field.id} label={field.lbl} required={field.req}>
                  <input
                    className="vinp"
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
            <div className="m-field">
              <div className="m-field-label">Network</div>

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

              <Field label="Destination Address" required>
                <input
                  className="vinp"
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

          <div className="m-stack">
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
        <div className="m-done">
          <div className="m-done-ico">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle
                cx="13"
                cy="13"
                r="12"
                stroke="var(--green)"
                strokeWidth="1.5"
              />
              <path
                d="M7.5 13.5l3.5 3.5 7.5-8"
                stroke="var(--green)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="m-done-msg">
            {amt.toLocaleString('en-US')} {asset} via {effMethod} is being
            processed.
          </div>
        </div>
      )}
    </Modal>
  );
}
