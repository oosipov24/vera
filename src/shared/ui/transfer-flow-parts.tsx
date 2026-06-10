import { useState, type ReactNode, type ChangeEvent, type DragEvent, type MouseEvent } from 'react';

//  Step progress bar 
export function StepBars({ total, current }: { total: number; current: number }) {
  return (
    <div className="step-bars">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`step-bar ${i < current ? 'done' : ''} ${i === current - 1 ? 'active' : ''}`} />
      ))}
    </div>
  );
}

//  Asset badge (used at the top of step 2+) 
export function AssetPill({ label }: { label: string }) {
  return <span className="asset-pill">{label}</span>;
}

//  File upload (drag & drop + preview) 
interface FileUploadProps {
  label: string;
  //  Prompt shown in the empty drop zone
  prompt: string;
  onChange: (file: File | null) => void;
}

//  Drag-and-drop file picker
export function FileUpload({ label, prompt, onChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const set = (f: File | null) => {
    setFile(f);
    onChange(f);
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="upl-block">
      <div className="upl-label">{label}</div>
      <label
        className={`upl-area ${file ? 'has-file' : ''} ${dragging ? 'dragging' : ''}`}
        onDragOver={(e: DragEvent<HTMLLabelElement>) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent<HTMLLabelElement>) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files[0]) set(e.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && set(e.target.files[0])}
        />
        <div className="upl-ico" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 12V3m0 0L5.5 6.5M9 3l3.5 3.5M3 12v2.5h12V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="upl-text">{file ? 'File ready' : prompt}</span>
      </label>

      {file && (
        <div className="upl-file-row show">
          {preview && <img className="upl-preview" src={preview} alt="preview" />}
          <span className="upl-fname">{file.name}</span>
          <button
            className="upl-clear"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              set(null);
            }}
            aria-label="Remove file"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

//  Method picker 
export type TransferMethod = 'Bank' | 'Crypto';

export function MethodCards({ value, onChange }: { value: TransferMethod | null; onChange: (m: TransferMethod) => void }) {
  return (
    <div className="method-grid">
      <button className={`method-card ${value === 'Bank' ? 'on' : ''}`} onClick={() => onChange('Bank')}>
        <div className="method-title">Bank Transfer</div>
        <div className="method-desc">SEPA / SWIFT · fiat currencies</div>
      </button>
      <button className={`method-card ${value === 'Crypto' ? 'on' : ''}`} onClick={() => onChange('Crypto')}>
        <div className="method-title">Crypto</div>
        <div className="method-desc">On-chain transfer · BTC, ETH, USDT…</div>
      </button>
    </div>
  );
}

//  Labeled field group 
export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="m-field">
      <div className="m-field-label">
        {label}
        {required && ' *'}
      </div>
      {children}
    </div>
  );
}
