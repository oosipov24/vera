import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Check,
  KeyRound,
  Mail,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

type SettingsTab = 'email' | '2fa' | 'password';

interface SettingsDialogProps {
  open: boolean;
  initialTab?: SettingsTab;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({
  open,
  initialTab = 'email',
  onOpenChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid min-h-[460px] grid-cols-[180px_1fr]">
          <aside className="border-r border-border bg-muted/20">
            <div className="border-b border-border p-5">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-base">Settings</DialogTitle>
                <DialogDescription>Account preferences</DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-2">
              <Tabs
                defaultValue={initialTab}
                className="contents"
                orientation="vertical"
              >
                <TabsList className="grid h-auto w-full grid-cols-1 bg-transparent p-0">
                  <TabsTrigger
                    value="email"
                    className="justify-start gap-2 px-3 py-2"
                  >
                    <Mail className="size-4" />
                    Email
                  </TabsTrigger>

                  <TabsTrigger
                    value="2fa"
                    className="justify-start gap-2 px-3 py-2"
                  >
                    <ShieldCheck className="size-4" />
                    Two-Factor Auth
                  </TabsTrigger>

                  <TabsTrigger
                    value="password"
                    className="justify-start gap-2 px-3 py-2"
                  >
                    <KeyRound className="size-4" />
                    Password
                  </TabsTrigger>
                </TabsList>

                <div className="absolute left-[180px] right-0 top-0 h-full overflow-y-auto p-6">
                  <TabsContent value="email" className="m-0">
                    <EmailTab />
                  </TabsContent>

                  <TabsContent value="2fa" className="m-0">
                    <TwoFactorTab />
                  </TabsContent>

                  <TabsContent value="password" className="m-0">
                    <PasswordTab />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmailTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Email Address</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the email associated with your account.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-4" />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Current email</div>
              <div className="font-mono text-sm font-medium">
                test@vera-finance.com
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1 text-primary">
            <Check className="size-3" />
            Verified
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-new-email">New email</Label>
          <Input
            id="settings-new-email"
            type="email"
            placeholder="Enter new email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-confirm-email">Confirm email</Label>
          <Input
            id="settings-confirm-email"
            type="email"
            placeholder="Confirm new email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-current-password">Current password</Label>
          <Input
            id="settings-current-password"
            type="password"
            placeholder="Enter password"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button">Update Email</Button>
      </div>
    </div>
  );
}

function TwoFactorTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Two-Factor Authentication
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/10">
        <CardContent className="flex gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </div>

          <div>
            <div className="text-sm font-semibold text-destructive">
              2FA is disabled
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Your account is at risk
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-4">
          <div>
            <div className="text-sm font-semibold">1. Scan QR code</div>

            <div className="mt-3 flex items-start gap-4">
              <div className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                <QrCode className="size-12 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator or Authy.
                </p>

                <p className="text-xs text-muted-foreground">
                  Or enter manually:
                </p>

                <Badge variant="secondary" className="font-mono">
                  VERA-XXXX-XXXX-XXXX
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-2fa-code">2. Verification code</Label>
            <Input
              id="settings-2fa-code"
              inputMode="numeric"
              placeholder="000 000"
              className="text-center font-mono tracking-[0.35em]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button">Enable 2FA</Button>
      </div>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We’ll send a one-time code to your email to verify it’s you.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-4" />
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              OTP will be sent to
            </div>
            <div className="font-mono text-sm font-medium">
              test@vera-finance.com
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button">Send OTP Code</Button>
      </div>
    </div>
  );
}