import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid product ID' }),
  type: z.nativeEnum(StockMovementType, { message: 'Type must be IN or OUT' }),
  quantity: z.number().int({ message: 'Quantity must be an integer' }).positive({ message: 'Quantity must be greater than zero' }),
  reason: z.string().optional().nullable().or(z.literal('')),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
