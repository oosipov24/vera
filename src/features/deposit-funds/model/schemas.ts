import { z } from 'zod';
import type { AssetSymbol, NetworkName, PaymentMethod } from '@/types';

export const depositMethodSchema = z.enum(['SEPA', 'SWIFT', 'Crypto']);

export const depositSchema = z
  .object({
    method: depositMethodSchema,
    asset: z.custom<AssetSymbol>((value) => typeof value === 'string', {
      message: 'Select an asset',
    }),
    amount: z.coerce
      .number()
      .positive('Enter a deposit amount greater than zero')
      .finite('Enter a valid deposit amount'),
    network: z.custom<NetworkName | ''>((value) => typeof value === 'string').optional(),
    proof: z.instanceof(File, { message: 'Upload proof of payment' }).optional(),
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

export type DepositValues = z.infer<typeof depositSchema>;

export function toPaymentMethod(method: DepositValues['method']): PaymentMethod {
  return method === 'Crypto' ? 'Crypto' : method;
}