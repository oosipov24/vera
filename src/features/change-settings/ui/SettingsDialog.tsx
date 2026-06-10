import { useEffect, useState } from 'react';

type SettingsTab = 'email' | '2fa' | 'password';

interface SettingsDialogProps {
  open: boolean;
  initialTab?: SettingsTab;
  onClose: () => void;
}

export function SettingsDialog({
  open,
  initialTab = 'email',
  onClose,
}: SettingsDialogProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="settings-modal-bg" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="settings-sidebar">
          <div className="settings-sidebar-head">
            <div id="settings-modal-title" className="settings-title">
              Settings
            </div>
            <div className="settings-subtitle">Account preferences</div>
          </div>

          <div className="settings-nav">
            <button
              type="button"
              className={`settings-nav-item ${tab === 'email' ? 'active' : ''}`}
              onClick={() => setTab('email')}
            >
              <span>Email</span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${tab === '2fa' ? 'active' : ''}`}
              onClick={() => setTab('2fa')}
            >
              <span>Two-Factor Auth</span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${tab === 'password' ? 'active' : ''}`}
              onClick={() => setTab('password')}
            >
              <span>Password</span>
            </button>
          </div>

          <button type="button" className="settings-close-link" onClick={onClose}>
            Close
          </button>
        </aside>

        <section className="settings-content">
          {tab === 'email' && <EmailTab />}
          {tab === '2fa' && <TwoFactorTab />}
          {tab === 'password' && <PasswordTab />}
        </section>
      </div>
    </div>
  );
}

function EmailTab() {
  return (
    <div className="settings-pane">
      <h2 className="settings-pane-title">Email Address</h2>
      <p className="settings-pane-copy">
        Update the email associated with your account.
      </p>

      <div className="settings-current-card">
        <div className="settings-current-meta">
          <div className="settings-current-label">Current email</div>
          <div className="settings-current-value">test@vera-finance.com</div>
        </div>
        <div className="settings-badge verified">Verified</div>
      </div>

      <div className="settings-form">
        <div className="settings-field">
          <label htmlFor="new-email">New email</label>
          <input id="new-email" type="email" placeholder="Enter new email" />
        </div>

        <div className="settings-field">
          <label htmlFor="confirm-email">Confirm email</label>
          <input id="confirm-email" type="email" placeholder="Confirm new email" />
        </div>

        <div className="settings-field">
          <label htmlFor="current-password-email">Current password</label>
          <input
            id="current-password-email"
            type="password"
            placeholder="Enter password"
          />
        </div>
      </div>

      <div className="settings-actions end">
        <button type="button" className="settings-primary-btn">
          Update Email
        </button>
      </div>
    </div>
  );
}

function TwoFactorTab() {
  return (
    <div className="settings-pane">
      <h2 className="settings-pane-title">Two-Factor Authentication</h2>
      <p className="settings-pane-copy">
        Add an extra layer of security to your account.
      </p>

      <div className="settings-alert danger">
        <div className="settings-alert-title">2FA is disabled</div>
        <div className="settings-alert-copy">Your account is at risk</div>
      </div>

      <div className="settings-card">
        <div className="settings-step-title">1. Scan QR code</div>

        <div className="settings-qr-row">
          <div className="settings-fake-qr">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>

          <div className="settings-qr-meta">
            <div className="settings-qr-copy">
              Use Google Authenticator or Authy
            </div>
            <div className="settings-qr-manual-label">Or enter manually:</div>
            <div className="settings-secret-chip">VERA-XXXX-XXXX-XXXX</div>
          </div>
        </div>

        <div className="settings-step-title step-top">2. Verification code</div>
        <input
          className="settings-code-input"
          type="text"
          inputMode="numeric"
          placeholder="000 000"
        />
      </div>

      <div className="settings-actions end">
        <button type="button" className="settings-success-btn">
          Enable 2FA
        </button>
      </div>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="settings-pane">
      <h2 className="settings-pane-title">Change Password</h2>
      <p className="settings-pane-copy">
        We’ll send a one-time code to your email to verify it’s you.
      </p>

      <div className="settings-current-card">
        <div className="settings-current-meta">
          <div className="settings-current-label">OTP will be sent to</div>
          <div className="settings-current-value">test@vera-finance.com</div>
        </div>
      </div>

      <div className="settings-actions end top-gap">
        <button type="button" className="settings-primary-btn">
          Send OTP Code
        </button>
      </div>
    </div>
  );
}