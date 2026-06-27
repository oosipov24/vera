import { KeyRound, Mail, ShieldCheck } from 'lucide-react';

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
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-hidden rounded-r8 border-border bg-background p-0 sm:max-h-[min(720px,calc(100dvh-2rem))] sm:max-w-[820px]">
        <Tabs
          defaultValue={initialTab}
          orientation="vertical"
          className="flex max-h-[calc(100dvh-1rem)] min-h-0 flex-col overflow-hidden sm:max-h-[min(720px,calc(100dvh-2rem))] md:grid md:min-h-[520px] md:grid-cols-[240px_minmax(0,1fr)] md:gap-0"
        >
          <aside className="shrink-0 border-b border-border bg-sidebar md:border-b-0 md:border-r">
            <div className="border-b border-border p-4 sm:p-5">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-base">Settings</DialogTitle>
                <DialogDescription>Account preferences</DialogDescription>
              </DialogHeader>
            </div>

            <div className="overflow-x-auto p-2 sm:p-3">
              <TabsList className="flex h-auto w-max min-w-full gap-1 bg-transparent p-0 md:grid md:w-full md:grid-cols-1">
                <TabsTrigger
                  value="email"
                  className="h-9 shrink-0 justify-start gap-2 rounded-r8 px-3 py-2 text-xs font-semibold md:w-full"
                >
                  <Mail className="size-4" />
                  <span>Email</span>
                </TabsTrigger>

                <TabsTrigger
                  value="2fa"
                  className="h-9 shrink-0 justify-start gap-2 rounded-r8 px-3 py-2 text-xs font-semibold md:w-full"
                >
                  <ShieldCheck className="size-4" />
                  <span className="whitespace-nowrap">Two-Factor Auth</span>
                </TabsTrigger>

                <TabsTrigger
                  value="password"
                  className="h-9 shrink-0 justify-start gap-2 rounded-r8 px-3 py-2 text-xs font-semibold md:w-full"
                >
                  <KeyRound className="size-4" />
                  <span>Password</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </aside>

          <section className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8">
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