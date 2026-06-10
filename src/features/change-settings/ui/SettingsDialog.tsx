import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettingsForm } from './EmailSettingsForm';
import { PasswordResetForm } from './PasswordResetForm';
import { TwoFactorForm } from './TwoFactorForm';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';

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

            <Tabs
              defaultValue={initialTab}
              className="contents"
              orientation="vertical"
            >
              <div className="p-2">
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
              </div>

              <section className="absolute left-[180px] right-0 top-0 h-full overflow-y-auto p-6">
                <TabsContent value="email" className="m-0">
                  <EmailSettingsForm />
                </TabsContent>

                <TabsContent value="2fa" className="m-0">
                  <TwoFactorForm />
                </TabsContent>

                <TabsContent value="password" className="m-0">
                  <PasswordResetForm />
                </TabsContent>
              </section>
            </Tabs>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}