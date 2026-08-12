import { z } from 'zod';

export const recordStockSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid product ID' }),
  quantity: z.number().int({ message: 'Quantity must be an integer' }).positive({ message: 'Quantity must be greater than zero' }),
  reason: z.string().optional().nullable().or(z.literal('')),
});

export type RecordStockInput = z.infer<typeof recordStockSchema>;
