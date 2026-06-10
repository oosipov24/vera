import { z } from 'zod';
import type { AssetSymbol, NetworkName, PaymentMethod, PaymentRail } from '@/types';

export const withdrawMethodSchema = z.enum(['Bank', 'Crypto']);
export const withdrawRailSchema = z.enum(['SEPA', 'SWIFT']);

export const withdrawSchema = z
  .object({
    method: withdrawMethodSchema.optional().refine(Boolean, {
      message: 'Choose a withdrawal method',
    }),

    rail: withdrawRailSchema,

    asset: z
      .custom<AssetSymbol | ''>((value) => typeof value === 'string', {
        message: 'Select an asset',
      })
      .refine((value): value is AssetSymbol => value !== '', {
        message: 'Select an asset',
      }),

    amount: z.coerce
      .number()
      .positive('Enter a withdrawal amount greater than zero')
      .finite('Enter a valid withdrawal amount'),

    network: z
      .custom<NetworkName | ''>((value) => typeof value === 'string', {
        message: 'Select a crypto network',
      })
      .optional(),

    destination: z.record(z.string(), z.string()).default({}),

    proof: z
      .custom<File | null | undefined>(
        (value) => {
          if (value === null || value === undefined) return true;
          return typeof File !== 'undefined' && value instanceof File;
        },
        {
          message: 'Attach a supporting document',
        },
      )
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'Crypto') {
      if (!data.network) {
        ctx.addIssue({
          code: 'custom',
          path: ['network'],
          message: 'Select a crypto network',
        });
      }

      if (!data.destination.address?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination', 'address'],
          message: 'Enter destination wallet address',
        });
      }
    }

    if (data.method === 'Bank') {
      const requiredFields = ['beneficiaryName', 'accountNumber', 'bankName'];

      for (const field of requiredFields) {
        if (!data.destination[field]?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['destination', field],
            message: 'This field is required',
          });
        }
      }

      if (data.rail === 'SWIFT' && !data.destination.swift?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination', 'swift'],
          message: 'SWIFT / BIC is required',
        });
      }
    }

    if (!data.proof) {
      ctx.addIssue({
        code: 'custom',
        path: ['proof'],
        message: 'Attach a supporting document',
      });
    }
  });

export type WithdrawFormValues = z.input<typeof withdrawSchema>;
export type WithdrawSubmitValues = z.output<typeof withdrawSchema>;

export function toPaymentMethod(
  method: WithdrawSubmitValues['method'],
  rail: PaymentRail,
): PaymentMethod {
  return method === 'Crypto' ? 'Crypto' : rail;
}