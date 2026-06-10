import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'qrcode';
import { CheckCircle2 } from 'lucide-react';

import type { AssetSymbol, NetworkName, PaymentMethod, PaymentRail } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  MethodCards,
} from '@/shared/ui/transfer-flow-parts';
import { useTradeStore } from '@/store/useTradeStore';
import { useUiStore } from '@/store/useUiStore';
import {
  ASSET_META,
  FIAT_SET,
  CRYPTO_SET,
  NET_ADDR,
  PRICES_USD,
  isFiat,
  networksFor,
} from '@/constants/assets';
import {
  depositSchema,
  toPaymentMethod,
  type DepositFormValues,
  type DepositSubmitValues,
} from '@/features/deposit-funds/model/schemas';
type Method = 'Bank' | 'Crypto';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  initialAsset?: AssetSymbol | null;
}

const EMPTY_DEPOSIT_VALUES: DepositFormValues = {
  method: undefined,
  rail: 'SWIFT',
  asset: '',
  amount: '',
  network: '',
  proof: null,
};

export function DepositDialog({ open, onClose, initialAsset }: DepositDialogProps) {
  const deposit = useTradeStore((state) => state.deposit);
  const pushToast = useUiStore((state) => state.pushToast);

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepositFormValues, unknown, DepositSubmitValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: EMPTY_DEPOSIT_VALUES,
  });

  const method = watch('method');
  const rail = watch('rail');
  const asset = watch('asset');
  const amount = watch('amount');
  const network = watch('network');
  const proof = watch('proof');

  const fiat = method === 'Bank';
  const effMethod: PaymentMethod = toPaymentMethod(method, rail);
  const amt = Number(amount) || 0;
  const assetList = fiat ? FIAT_SET : CRYPTO_SET;

  useEffect(() => {
    if (!open) return;

    if (initialAsset) {
      const initialIsFiat = isFiat(initialAsset);

      reset({
        method: initialIsFiat ? 'Bank' : 'Crypto',
        rail: initialAsset === 'EUR' ? 'SEPA' : 'SWIFT',
        asset: initialAsset,
        amount: '',
        network: initialIsFiat ? '' : networksFor(initialAsset)[0],
        proof: null,
      });

      setStep(2);
      return;
    }

    reset(EMPTY_DEPOSIT_VALUES);
    setStep(1);
  }, [open, initialAsset, reset]);

  const onPickMethod = (nextMethod: Method | null) => {
    setValue('method', nextMethod ?? undefined, { shouldDirty: true, shouldValidate: true });
    setValue('asset', '', { shouldDirty: true });
    setValue('amount', '', { shouldDirty: true });
    setValue('network', '', { shouldDirty: true });
    setValue('proof', null, { shouldDirty: true });
  };

  const onPickAsset = (nextAsset: AssetSymbol) => {
    setValue('asset', nextAsset, { shouldDirty: true, shouldValidate: true });

    if (fiat) {
      setValue('rail', nextAsset === 'EUR' ? 'SEPA' : 'SWIFT', {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('network', '', { shouldDirty: true });
      return;
    }

    setValue('network', networksFor(nextAsset)[0], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (values: DepositSubmitValues) => {
    if (!values.method || !values.asset) return;

    deposit(values.asset as AssetSymbol, values.amount, toPaymentMethod(values.method, values.rail));

    setStep(5);

    pushToast(
      'success',
      'Deposit submitted',
      'Proof received. Transaction added as Pending.',
    );
  };

  const next = () => {
    if (step === 1 && method) {
      setStep(2);
      setValue('asset', '', { shouldDirty: true });
      return;
    }

    if (step === 2 && asset && amt > 0) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    if (step === 4) {
      void handleSubmit(onSubmit)();
    }
  };

  const back = () => {
    if (step > 1 && step < 5) {
      setStep(step - 1);
    }
  };

  const nextLabel = step === 3 ? 'Deposit Made' : step === 4 ? 'Confirm' : 'Continue';

  const nextEnabled =
    (step === 1 && !!method) ||
    (step === 2 && !!asset && amt > 0) ||
    step === 3 ||
    (step === 4 && !!proof);

  const subtitle = [
    'Choose a transfer method',
    'Select asset and enter amount',
    'Send funds using the details below, then click “Deposit Made”',
    'Upload your proof of payment',
    'Submitted',
  ][step - 1];

  const footer =
    step === 5 ? (
      <Button type="button" className="w-full" onClick={onClose}>
        Close
      </Button>
    ) : (
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {step > 1 && (
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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              Deposit
              {step >= 2 && asset && <AssetPill label={`${asset} · ${effMethod}`} />}
            </span>
          </DialogTitle>

          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step < 5 && <StepBars total={4} current={step} />}

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
                <div className="text-sm font-medium text-foreground">Amount</div>

                <div className="flex items-center gap-2">
                  <Input
                    className="min-w-0 flex-1"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  <span className="min-w-12 rounded-md border border-border bg-muted px-3 py-2 text-center text-sm font-medium text-muted-foreground">
                    {asset || '—'}
                  </span>
                </div>

                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}

                {asset && amt > 0 && !isFiat(asset) && (
                  <div className="text-xs text-muted-foreground">
                    ≈ $
                    {(amt * (PRICES_USD[asset] ?? 1)).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    USD
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 &&
            asset &&
            (fiat ? (
              <BankDetails rail={rail} />
            ) : (
              <CryptoDetails
                asset={asset}
                network={network ?? ''}
                setNetwork={(nextNetwork) =>
                  setValue('network', nextNetwork, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            ))}

          {step === 4 && (
            <div className="space-y-4">
              <FileUpload
                label={
                  effMethod === 'Crypto'
                    ? 'Transaction Screenshot'
                    : `${effMethod} Confirmation`
                }
                prompt="Drag & drop or click to browse"
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
          )}

          {step === 5 && (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <div className="text-sm font-medium text-foreground">
                {amt.toLocaleString('en-US')} {asset} via {effMethod} — proof received.
                Pending review.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BankDetails({ rail }: { rail: PaymentRail }) {
  const isSepa = rail === 'SEPA';

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <DetailRow label="Beneficiary" value="Vera Finance Ltd" />
      <DetailRow label="Bank" value={isSepa ? 'Bank Polska SA' : 'JPMorgan Chase, N.A.'} />
      <DetailRow
        label={isSepa ? 'IBAN' : 'Account No.'}
        value={isSepa ? 'PL61109010140000071219812874' : '073061682552'}
        mono
      />
      {!isSepa && <DetailRow label="SWIFT / BIC" value="CHASUS33" mono />}

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 4.5v3M7 10h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span>
          {isSepa
            ? 'SEPA transfers arrive within 1–2 business days.'
            : 'Settlements during U.S. banking hours only. No weekends.'}
        </span>
      </div>
    </div>
  );
}

function CryptoDetails({
  asset,
  network,
  setNetwork,
}: {
  asset: AssetSymbol;
  network: NetworkName | '';
  setNetwork: (network: NetworkName) => void;
}) {
  const nets = networksFor(asset);
  const net = network || nets[0];
  const address = NET_ADDR[net];

  const [qrUrl, setQrUrl] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(address, { margin: 1 })
      .then((url) => {
        if (!cancelled) {
          setQrUrl(url);
          setQrError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrUrl('');
          setQrError('QR code could not be generated.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {nets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {nets.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === net ? 'default' : 'outline'}
              onClick={() => setNetwork(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex size-32 shrink-0 items-center justify-center rounded-xl border border-border bg-background p-2">
          {qrUrl ? (
            <img
              className="size-full object-contain"
              src={qrUrl}
              alt={`Deposit QR for ${asset} on ${net}`}
            />
          ) : (
            <span className="text-center text-xs text-muted-foreground">
              {qrError || 'Generating QR…'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {net}
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            Deposit address ({asset})
          </div>

          <div className="break-all rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground">
            {address}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={`break-all text-sm font-medium text-foreground ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
