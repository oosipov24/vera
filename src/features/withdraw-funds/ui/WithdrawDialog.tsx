import { useEffect, useState, type ChangeEvent } from 'react';
import type { AssetSymbol, NetworkName, PaymentMethod, PaymentRail } from '@/types';
import { Modal } from '@/components/ui/feedback';
import { Dropdown } from '@/components/ui/Dropdown';
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
type Method = 'Bank' | 'Crypto';

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  initialAsset?: AssetSymbol | null;
}

/**
 * Withdraw flow:
 *  1. method (Bank / Crypto)
 *  2. asset + amount — with an "All" max button and live balance check
 *  3. destination details (fiat bank fields via `fiatFieldsFor`, or a crypto
 *     network dropdown) + supporting-document upload
 *  done — debits the balance via the store and records the transaction
 */
export function WithdrawDialog({ open, onClose, initialAsset }: WithdrawDialogProps) {
  const withdraw = useTradeStore((s) => s.withdraw);
  const balances = useTradeStore((s) => s.balances);
  const pushToast = useUiStore((s) => s.pushToast);

  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1);
  const [method, setMethod] = useState<Method | null>(null);
  const [asset, setAsset] = useState<AssetSymbol | ''>('');
  const [rail, setRail] = useState<PaymentRail>('SWIFT');
  const [network, setNetwork] = useState<NetworkName | ''>('');
  const [amount, setAmount] = useState('');
  const [doc, setDoc] = useState<File | null>(null);
  const [destination, setDestination] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initialAsset) {
      const fiat = isFiat(initialAsset);

      setMethod(fiat ? 'Bank' : 'Crypto');
      setAsset(initialAsset);
      setStep(2);

      if (fiat) {
        setRail(initialAsset === 'EUR' ? 'SEPA' : 'SWIFT');
        setNetwork('');
      } else {
        const nets = networksFor(initialAsset);
        setNetwork(nets.length === 1 ? nets[0] : '');
      }
    } else {
      setMethod(null);
      setAsset('');
      setNetwork('');
      setStep(1);
    }
    setAmount('');
    setDoc(null);
    setDestination({});
  }, [open, initialAsset]);

  const fiat = method === 'Bank';
  const effMethod: PaymentMethod = fiat ? rail : 'Crypto';
  const amt = parseFloat(amount) || 0;
  const bal = asset ? balances[asset] ?? 0 : 0;
  const assetList = fiat ? FIAT_SET : CRYPTO_SET;
  const exceeds = !!asset && amt > bal;

  const fields = fiat && asset ? fiatFieldsFor(effMethod, asset) : [];

  const fiatDestinationValid =
    fiat &&
    fields.every((field) => !field.req || destination[field.id]?.trim());

  const cryptoDestinationValid =
    !fiat &&
    Boolean(network) &&
    Boolean(destination.address?.trim());

  const destinationValid = fiat ? fiatDestinationValid : cryptoDestinationValid;

  const onPickAsset = (a: AssetSymbol) => {
    setAsset(a);
    setDestination({});
    setDoc(null);

    if (fiat) {
      setRail(a === 'EUR' ? 'SEPA' : 'SWIFT');
      setNetwork('');
      return;
    }

    const nets = networksFor(a);
    setNetwork(nets.length === 1 ? nets[0] : '');
  };

  const next = () => {
    if (step === 3 && (!destinationValid || !doc)) {
      pushToast(
        'error',
        'Missing withdrawal details',
        'Please complete destination details and attach a supporting document.',
      );
      return;
    }

    if (step === 1 && method) {
      setStep(2);
      setAsset('');
      return;
    }

    if (step === 2 && asset && amt > 0 && !exceeds) {
      setStep(3);
      return;
    }

    if (step === 3 && asset) {
      const ok = withdraw(asset, amt, effMethod);

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
        `${amt.toLocaleString('en-US')} ${asset} debited. Transaction recorded.`,
      );
    }
  };
  
  const back = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const nextEnabled =
    (step === 1 && !!method) ||
    (step === 2 && !!asset && amt > 0 && !exceeds) ||
    (step === 3 && !!asset && destinationValid && !!doc);
  const nextLabel = step === 3 ? 'Submit Withdrawal' : 'Continue';

  const subtitle = step === 'done'
    ? 'Submitted'
    : ['Choose a withdrawal method', 'Select asset and amount', 'Enter your destination details'][step - 1];

  const footer = step === 'done' ? (
    <button className="m-btn primary full" onClick={onClose}>Close</button>
  ) : (
    <div className="m-actions">
      {(step === 2 || step === 3) && <button className="m-btn ghost" onClick={back}>Back</button>}
      <button className="m-btn cancel" onClick={onClose}>Cancel</button>
      <button className="m-btn primary" disabled={!nextEnabled} onClick={next}>{nextLabel}</button>
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

      {/* method */}
      {step === 1 && (
        <MethodCards value={method} onChange={setMethod} />
      )}

      {/* asset + amount */}
      {step === 2 && (
        <div className="m-stack">
          <div className="m-field">
            <div className="m-field-label">Asset</div>
            <Dropdown
              value={asset}
              options={assetList.map((a) => ({ value: a, label: `${a} — ${ASSET_META[a].name}`, search: `${a} ${ASSET_META[a].name}` }))}
              onChange={onPickAsset}
              searchable
              placeholder="Select asset"
            />
          </div>

          {fiat && asset && (
            <div className="rail-toggle">
              {asset === 'EUR' && (
                <button className={`rail-btn ${rail === 'SEPA' ? 'on' : ''}`} onClick={() => setRail('SEPA')}>SEPA</button>
              )}
              <button className={`rail-btn ${rail === 'SWIFT' ? 'on' : ''}`} onClick={() => setRail('SWIFT')}>SWIFT</button>
            </div>
          )}

          <div className="m-field">
            <div className="m-field-label-row">
              <span className="m-field-label">Amount</span>
              {asset && (
                <span className="m-avail">
                  Available: {fmtAsset(asset, bal)} {asset}
                  <button className="amt-all" onClick={() => setAmount(String(bal))}>All</button>
                </span>
              )}
            </div>
            <div className="amt-row">
              <input className="vinp" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
              <span className="amt-ccy">{asset || '—'}</span>
            </div>
            {asset && amt > 0 && (
              exceeds ? (
                <div className="amt-hint err">⚠ Exceeds available balance</div>
              ) : !isFiat(asset) ? (
                <div className="amt-hint">≈ ${(amt * (PRICES_USD[asset] ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* destination details + document */}
      {step === 3 && asset && (
        <div className="m-stack">
          {fiat ? (
            <div className="m-fields-grid">
              {fiatFieldsFor(effMethod, asset).map((f) => (
                <Field key={f.id} label={f.lbl} required={f.req}>
                  <input
                    className="vinp"
                    type="text"
                    placeholder={f.ph}
                    value={destination[f.id] ?? ''}
                    onChange={(e) =>
                      setDestination((prev) => ({
                        ...prev,
                        [f.id]: e.target.value,
                      }))
                    }
                  />
                </Field>
              ))}
            </div>
          ) : (
            <div className="m-field">
              <div className="m-field-label">Network</div>
              <Dropdown
                value={network}
                options={networksFor(asset)}
                onChange={(nextNetwork) => {
                  setNetwork(nextNetwork);
                  setDestination({});
                  setDoc(null);
                }}
                placeholder="Select network"
              />
              <Field label="Destination Address" required>
                <input
                  className="vinp"
                  type="text"
                  placeholder={`Your ${asset} wallet address`}
                  value={destination.address ?? ''}
                  onChange={(e) =>
                    setDestination((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          )}

          <FileUpload label="Supporting Document (invoice / contract)" prompt="Attach invoice or contract" onChange={setDoc} />
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="m-done">
          <div className="m-done-ico">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" stroke="var(--green)" strokeWidth="1.5" />
              <path d="M7.5 13.5l3.5 3.5 7.5-8" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="m-done-msg">
            {amt.toLocaleString('en-US')} {asset} via {effMethod} is being processed.
          </div>
        </div>
      )}
    </Modal>
  );
}
