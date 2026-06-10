import { z } from 'zod';

export const emailSettingsSchema = z
  .object({
    newEmail: z
      .string()
      .min(1, 'New email is required')
      .email('Enter a valid email address'),
    confirmEmail: z
      .string()
      .min(1, 'Confirm email is required')
      .email('Enter a valid confirmation email'),
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  });

export type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, 'Enter the 6-digit verification code')
    .max(6, 'Enter the 6-digit verification code')
    .regex(/^\d+$/, 'Code must contain digits only'),
});

export type TwoFactorValues = z.infer<typeof twoFactorSchema>;

export const passwordResetSchema = z
  .object({
    otp: z
      .string()
      .min(6, 'Enter the 6-digit OTP code')
      .max(6, 'Enter the 6-digit OTP code')
      .regex(/^\d+$/, 'OTP must contain digits only'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordResetValues = z.infer<typeof passwordResetSchema>;