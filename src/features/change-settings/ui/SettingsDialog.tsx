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
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] overflow-hidden p-0 sm:max-w-[820px]">
        <Tabs
          defaultValue={initialTab}
          orientation="vertical"
          className="grid min-h-[520px] grid-cols-[240px_minmax(0,1fr)] gap-0"
        >
          <aside className="border-r border-border bg-sidebar">
            <div className="border-b border-border p-5">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-base">Settings</DialogTitle>
                <DialogDescription>Account preferences</DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-3">
              <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-transparent p-0">
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
          </aside>

          <section className="min-w-0 overflow-y-auto p-8 bg-background">
            <TabsContent value="email" className="m-0 max-w-xl">
              <EmailSettingsForm />
            </TabsContent>

            <TabsContent value="2fa" className="m-0 max-w-xl">
              <TwoFactorForm />
            </TabsContent>

            <TabsContent value="password" className="m-0 max-w-xl">
              <PasswordResetForm />
            </TabsContent>
          </section>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
