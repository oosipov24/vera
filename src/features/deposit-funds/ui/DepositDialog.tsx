import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'qrcode';

import type { AssetSymbol, NetworkName, PaymentMethod, PaymentRail } from '@/types';
import { Modal } from '@/components/ui/feedback';
import { Dropdown } from '@/components/ui/Dropdown';
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
      <button className="m-btn primary full" onClick={onClose}>
        Close
      </button>
    ) : (
      <div className="m-actions">
        {step > 1 && (
          <button className="m-btn ghost" onClick={back}>
            Back
          </button>
        )}

        <button className="m-btn cancel" onClick={onClose}>
          Cancel
        </button>

        <button
          className={`m-btn ${step === 4 ? 'primary' : 'success'}`}
          disabled={!nextEnabled}
          onClick={next}
        >
          {nextLabel}
        </button>
      </div>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="m-title-row">
          Deposit
          {step >= 2 && asset && <AssetPill label={`${asset} · ${effMethod}`} />}
        </span>
      }
      subtitle={subtitle}
      footer={footer}
    >
      {step < 5 && <StepBars total={4} current={step} />}

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
            <div className="m-field-label">Amount</div>

            <div className="amt-row">
              <input
                className="vinp"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              <span className="amt-ccy">{asset || '—'}</span>
            </div>

            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}

            {asset && amt > 0 && !isFiat(asset) && (
              <div className="amt-hint">
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
        <div className="m-stack">
          <FileUpload
            label={effMethod === 'Crypto' ? 'Transaction Screenshot' : `${effMethod} Confirmation`}
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
        <div className="m-done">
          <div className="m-done-ico">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" stroke="var(--green)" strokeWidth="1.5" />
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
            {amt.toLocaleString('en-US')} {asset} via {effMethod} — proof received. Pending review.
          </div>
        </div>
      )}
    </Modal>
  );
}

function BankDetails({ rail }: { rail: PaymentRail }) {
  const isSepa = rail === 'SEPA';

  return (
    <div className="details-block">
      <DetailRow label="Beneficiary" value="Vera Finance Ltd" />
      <DetailRow label="Bank" value={isSepa ? 'Bank Polska SA' : 'JPMorgan Chase, N.A.'} />
      <DetailRow
        label={isSepa ? 'IBAN' : 'Account No.'}
        value={isSepa ? 'PL61109010140000071219812874' : '073061682552'}
        mono
      />
      {!isSepa && <DetailRow label="SWIFT / BIC" value="CHASUS33" mono />}

      <div className="m-warn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 4.5v3M7 10h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {isSepa
          ? 'SEPA transfers arrive within 1–2 business days.'
          : 'Settlements during U.S. banking hours only. No weekends.'}
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
    <div className="details-block">
      {nets.length > 1 && (
        <div className="net-chips">
          {nets.map((item) => (
            <button
              key={item}
              className={`a-chip ${item === net ? 'on' : ''}`}
              onClick={() => setNetwork(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="qr-block">
        <div className="qr-frame">
          {qrUrl ? (
            <img src={qrUrl} alt={`Deposit QR for ${asset} on ${net}`} />
          ) : (
            <span className="qr-error">{qrError || 'Generating QR…'}</span>
          )}
        </div>

        <div className="qr-meta">
          <div className="qr-net-label">{net}</div>
          <div className="qr-addr-label">Deposit address ({asset})</div>
          <div className="qr-addr">{address}</div>
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
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}