import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  passwordResetSchema,
  type PasswordResetValues,
} from '@/features/change-settings/model/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordResetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: PasswordResetValues) => {
    console.log('Password reset submitted', values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-otp">OTP code</Label>
          <Input
            id="settings-otp"
            inputMode="numeric"
            placeholder="000000"
            className="font-mono tracking-[0.35em] h-10 bg-muted/50"
            {...register('otp')}
          />
          {errors.otp && (
            <p className="text-xs text-destructive">{errors.otp.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-new-password">New password</Label>
          <Input
            id="settings-new-password"
            type="password"
            placeholder="Min. 8 characters"
            className="h-10 bg-muted/50"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-confirm-password">Confirm password</Label>
          <Input
            id="settings-confirm-password"
            type="password"
            placeholder="Repeat new password"
            className="h-10 bg-muted/50"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="px-5 py-5" disabled={isSubmitting}>
          Update Password
        </Button>
      </div>
    </form>
  );
}
