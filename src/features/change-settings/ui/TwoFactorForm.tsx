import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  twoFactorSchema,
  type TwoFactorValues,
} from '@/features/change-settings/model/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TwoFactorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (values: TwoFactorValues) => {
    console.log('2FA submitted', values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
              <div className="flex size-24 shrink-0 items-center justify-center rounded-r8 border border-border bg-muted">
                <QrCode className="size-12 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator or Authy.
                </p>

                <p className="text-xs text-muted-foreground">
                  Or enter manually:
                </p>

                <Badge variant="secondary" className="font-mono bg-primary/10 text-primary px-2 py-4 rounded-r8">
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
              placeholder="000000"
              className="text-center font-mono tracking-[0.35em] h-10 bg-muted/50"
              {...register('code')}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="px-5 py-5" disabled={isSubmitting}>
          Enable 2FA
        </Button>
      </div>
    </form>
  );
}
