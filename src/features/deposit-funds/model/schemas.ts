import { z } from 'zod';
import type { AssetSymbol, NetworkName, PaymentMethod, PaymentRail } from '@/types';

export const depositMethodSchema = z.enum(['Bank', 'Crypto']);
export const depositRailSchema = z.enum(['SEPA', 'SWIFT']);

export const depositSchema = z
  .object({
    method: depositMethodSchema.optional().refine(Boolean, {
      message: 'Choose a transfer method',
    }),

    rail: depositRailSchema,

    asset: z
      .custom<AssetSymbol | ''>((value) => typeof value === 'string', {
        message: 'Select an asset',
      })
      .refine((value): value is AssetSymbol => value !== '', {
        message: 'Select an asset',
      }),

    amount: z.coerce
      .number()
      .positive('Enter a deposit amount greater than zero')
      .finite('Enter a valid deposit amount'),

    network: z
      .custom<NetworkName | ''>((value) => typeof value === 'string', {
        message: 'Select a crypto network',
      })
      .optional(),

    proof: z
      .custom<File | null | undefined>(
        (value) => {
          if (value === null || value === undefined) return true;
          return typeof File !== 'undefined' && value instanceof File;
        },
        {
          message: 'Upload proof of payment',
        },
      )
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'Crypto' && !data.network) {
      ctx.addIssue({
        code: 'custom',
        path: ['network'],
        message: 'Select a crypto network',
      });
    }

    if (!data.proof) {
      ctx.addIssue({
        code: 'custom',
        path: ['proof'],
        message: 'Upload proof of payment',
      });
    }
  });

export type DepositFormValues = z.input<typeof depositSchema>;
export type DepositSubmitValues = z.output<typeof depositSchema>;

export function toPaymentMethod(
  method: DepositSubmitValues['method'],
  rail: PaymentRail,
): PaymentMethod {
  return method === 'Crypto' ? 'Crypto' : rail;
}