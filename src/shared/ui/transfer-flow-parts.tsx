import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Building2, Check, FileText, Upload, Wallet, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Step progress bar
export function StepBars({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex w-full items-center gap-2" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const isDone = index < current;
        const isActive = index === current - 1;

        return (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full bg-muted transition-colors',
              isDone && 'bg-primary/45',
              isActive && 'bg-primary',
            )}
          />
        );
      })}
    </div>
  );
}

// Asset badge used in dialog title
export function AssetPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      {label}
    </span>
  );
}

interface FileUploadProps {
  label: string;
  prompt: string;
  onChange: (file: File | null) => void;
}

// Drag-and-drop file picker
export function FileUpload({ label, prompt, onChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const setSelectedFile = (nextFile: File | null) => {
    setFile(nextFile);
    onChange(nextFile);

    if (nextFile && nextFile.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };

      reader.readAsDataURL(nextFile);
      return;
    }

    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">{label}</div>

      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          dragging && 'border-primary bg-primary/10',
          file && 'border-primary/40 bg-primary/5',
        )}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault();
          setDragging(false);

          if (event.dataTransfer.files[0]) {
            setSelectedFile(event.dataTransfer.files[0]);
          }
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files?.[0]) {
              setSelectedFile(event.target.files[0]);
            }
          }}
        />

        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground',
            file && 'border-primary/30 text-primary',
          )}
          aria-hidden="true"
        >
          {file ? <Check className="size-4" /> : <Upload className="size-4" />}
        </span>

        <span className="text-sm font-medium text-foreground">
          {file ? 'File ready' : prompt}
        </span>

        <span className="text-xs text-muted-foreground">
          Image or PDF accepted
        </span>
      </label>

      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2">
          {preview ? (
            <img
              className="size-10 rounded-lg border border-border object-cover"
              src={preview}
              alt="Selected file preview"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
          )}

          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {file.name}
          </span>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setSelectedFile(null);
            }}
            aria-label="Remove file"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export type TransferMethod = 'Bank' | 'Crypto';

export function MethodCards({
  value,
  onChange,
}: {
  value: TransferMethod | null;
  onChange: (method: TransferMethod) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        className={cn(
          'rounded-xl border border-border bg-card p-4 text-left transition-colors',
          'hover:border-primary/40 hover:bg-primary/5',
          value === 'Bank' && 'border-primary bg-primary/10 ring-1 ring-primary/20',
        )}
        onClick={() => onChange('Bank')}
      >
        <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-4" />
        </div>

        <div className="text-sm font-semibold text-foreground">Bank Transfer</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          SEPA / SWIFT · fiat currencies
        </div>
      </button>

      <button
        type="button"
        className={cn(
          'rounded-xl border border-border bg-card p-4 text-left transition-colors',
          'hover:border-primary/40 hover:bg-primary/5',
          value === 'Crypto' && 'border-primary bg-primary/10 ring-1 ring-primary/20',
        )}
        onClick={() => onChange('Crypto')}
      >
        <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="size-4" />
        </div>

        <div className="text-sm font-semibold text-foreground">Crypto</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          On-chain transfer · BTC, ETH, USDT…
        </div>
      </button>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </div>

      {children}
    </div>
  );
}