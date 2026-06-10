import { useEffect, useState, type ChangeEvent } from 'react';
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
import QRCode from 'qrcode';

type Method = 'Bank' | 'Crypto';

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
  /** Optional asset to preselect (from a balance card quick-action). */
  initialAsset?: AssetSymbol | null;
}

/**
 * Deposit flow:
 *  1. method (Bank transfer / Crypto)
 *  2. asset (fiat list for Bank, crypto list for Crypto) + amount; fiat shows
 *     a rail toggle filtered by currency (EUR → SEPA+SWIFT, else SWIFT only)
 *  3. bank details OR crypto address + QR (network-filtered)
 *  4. upload proof of payment
 *  5. done — records a Pending transaction
 */
export function DepositDialog({ open, onClose, initialAsset }: DepositDialogProps) {
  const deposit = useTradeStore((s) => s.deposit);
  const pushToast = useUiStore((s) => s.pushToast);

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method | null>(null);
  const [asset, setAsset] = useState<AssetSymbol | ''>('');
  const [rail, setRail] = useState<PaymentRail>('SWIFT');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<NetworkName | null>(null);
  const [proof, setProof] = useState<File | null>(null);

  // When opening, we reset the form and apply initialAsset.
  useEffect(() => {
    if (!open) return;
    if (initialAsset) {
      const fiat = isFiat(initialAsset);

      setMethod(fiat ? 'Bank' : 'Crypto');
      setAsset(initialAsset);
      setStep(2);

      if (!fiat) {
        setNetwork(networksFor(initialAsset)[0]);
      } else {
        setNetwork(null);
      }
      setRail(initialAsset === 'EUR' ? 'SEPA' : 'SWIFT');

    } else {
      setMethod(null);
      setAsset('');
      setStep(1);
    }
    setAmount('');
    setProof(null);
  }, [open, initialAsset]);

  const fiat = method === 'Bank';
  const effMethod: PaymentMethod = fiat ? rail : 'Crypto';
  const amt = parseFloat(amount) || 0;
  const assetList = fiat ? FIAT_SET : CRYPTO_SET;

  const onPickAsset = (a: AssetSymbol) => {
    setAsset(a);

    if (fiat) {
      setRail(a === 'EUR' ? 'SEPA' : 'SWIFT');
      setNetwork(null);
      return;
    }

    setNetwork(networksFor(a)[0]);
  };

  const next = () => {
    if (step === 1 && method) {
      setStep(2);
      setAsset('');
    } else if (step === 2 && asset && amt > 0) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4 && proof && asset) {
      deposit(asset, amt, effMethod);
      setStep(5);
      pushToast('success', 'Deposit submitted', 'Proof received. Transaction added as Pending.');
    }
  };
  const back = () => step > 1 && step < 5 && setStep(step - 1);

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

  const footer = step === 5 ? (
    <button className="m-btn primary full" onClick={onClose}>Close</button>
  ) : (
    <div className="m-actions">
      {step > 1 && <button className="m-btn ghost" onClick={back}>Back</button>}
      <button className="m-btn cancel" onClick={onClose}>Cancel</button>
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
            <div className="m-field-label">Amount</div>
            <div className="amt-row">
              <input className="vinp" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
              <span className="amt-ccy">{asset || '—'}</span>
            </div>
            {asset && amt > 0 && !isFiat(asset) && (
              <div className="amt-hint">≈ ${(amt * (PRICES_USD[asset] ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
            )}
          </div>
        </div>
      )}

      {/* details */}
      {step === 3 && asset && (fiat ? <BankDetails rail={rail} /> : <CryptoDetails asset={asset} network={network} setNetwork={setNetwork} />)}

      {/* proof */}
      {step === 4 && (
        <FileUpload
          label={effMethod === 'Crypto' ? 'Transaction Screenshot' : `${effMethod} Confirmation`}
          prompt="Drag & drop or click to browse"
          onChange={setProof}
        />
      )}

      {/* done */}
      {step === 5 && (
        <div className="m-done">
          <div className="m-done-ico">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" stroke="var(--green)" strokeWidth="1.5" />
              <path d="M7.5 13.5l3.5 3.5 7.5-8" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// Temporary details for demo mode.
function BankDetails({ rail }: { rail: PaymentRail }) {
  const isSepa = rail === 'SEPA';
  return (
    <div className="details-block">
      <DetailRow label="Beneficiary" value="Vera Finance Ltd" />
      <DetailRow label="Bank" value={isSepa ? 'Bank Polska SA' : 'JPMorgan Chase, N.A.'} />
      <DetailRow label={isSepa ? 'IBAN' : 'Account No.'} value={isSepa ? 'PL61109010140000071219812874' : '073061682552'} mono />
      {!isSepa && <DetailRow label="SWIFT / BIC" value="CHASUS33" mono />}
      <div className="m-warn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 4.5v3M7 10h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" /></svg>
        {isSepa ? 'SEPA transfers arrive within 1–2 business days.' : 'Settlements during U.S. banking hours only. No weekends.'}
      </div>
    </div>
  );
}

function CryptoDetails({asset, network, setNetwork,}: {asset: AssetSymbol; network: NetworkName | null; setNetwork: (n: NetworkName) => void;}) {
  const nets = networksFor(asset);
  const net = network ?? nets[0];
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
          {nets.map((n) => (
            <button key={n} className={`a-chip ${n === net ? 'on' : ''}`} onClick={() => setNetwork(n)}>
              {n}
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

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}
