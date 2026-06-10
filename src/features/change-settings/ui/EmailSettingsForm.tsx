import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  emailSettingsSchema,
  type EmailSettingsValues,
} from '@/features/change-settings/model/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmailSettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      newEmail: '',
      confirmEmail: '',
      currentPassword: '',
    },
  });

  const onSubmit = (values: EmailSettingsValues) => {
    console.log('Email settings submitted', values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
            {...register('newEmail')}
          />
          {errors.newEmail && (
            <p className="text-xs text-destructive">{errors.newEmail.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-confirm-email">Confirm email</Label>
          <Input
            id="settings-confirm-email"
            type="email"
            placeholder="Confirm new email"
            {...register('confirmEmail')}
          />
          {errors.confirmEmail && (
            <p className="text-xs text-destructive">
              {errors.confirmEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-current-password">Current password</Label>
          <Input
            id="settings-current-password"
            type="password"
            placeholder="Enter password"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          Update Email
        </Button>
      </div>
    </form>
  );
}
